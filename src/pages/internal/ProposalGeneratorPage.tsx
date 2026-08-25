import {
  CheckCircle2,
  Copy,
  FileText,
  Link2,
  PackageCheck,
  Printer,
  RefreshCcw,
  Save,
  Send,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { ProposalLineItems } from '../../components/internal/ProposalLineItems'
import { ProposalPreview } from '../../components/internal/ProposalPreview'
import { ProposalTotals } from '../../components/internal/ProposalTotals'
import {
  acceptanceStatuses,
  formatCurrency,
  getDefaultPaymentTerms,
  hiddenFeeReassurance,
  planOptions,
  riskLevels,
  unsurePlan,
  type ProposalCategory,
  type ProposalData,
  type ProposalLineItem,
  type ProposalPlan,
} from '../../services/proposalCalculations'
import {
  buildPlansBuilderGroups,
  buildPlansPackageDescription,
  buildPlansProposalLineItems,
  getPlansPackageLineName,
  localizePlansString,
  normalisePlansQuantity,
  type PlansBuilderGroup,
  type PlansBuilderPackageSelection,
  type PlansBuilderSelectionState,
} from '../../services/plansBuilderPricing'
import {
  getProposalApiStatus,
  loadProposalWithFallback,
  saveProposalWithFallback,
  sendProposalWithFallback,
} from '../../services/proposalsApi'
import {
  createEmptyProposal,
  createLineItem,
  duplicateProposal,
  loadProposalById,
  saveProposal,
} from '../../services/proposalsStorage'
import { getServiceCatalogue, useServiceCatalogue } from '../../services/serviceCatalogue'
import { getCommercialSettings } from '../../services/commercialSettings'
import type {
  EditableServiceCatalogue,
} from '../../types/serviceCatalogue'

type InspectionDraft = {
  customer?: {
    address?: string
    area?: string
    customerName?: string
    email?: string
    phone?: string
    selectedPlan?: string
  }
  rooms?: Array<{
    improvements?: string[]
    notes?: string
    priority?: string
    riskLevel?: string
    title?: string
  }>
  summary?: {
    date?: string
    generalNotes?: string
    inspectorName?: string
    riskLevel?: string
    safetyScore?: string
  }
}

type CataloguePackageSelection = PlansBuilderPackageSelection
type CatalogueSelectionState = PlansBuilderSelectionState
type CatalogueProposalPackageGroup = PlansBuilderGroup

const inputClass =
  'min-h-12 w-full rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15'

const textareaClass =
  'min-h-32 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15'

const categoryByRoom: Record<string, ProposalCategory> = {
  Bathroom: 'Bathroom',
  Bedroom: 'Bedroom',
  Entryway: 'Entryway',
  Hallways: 'Hallways',
  Kitchen: 'Kitchen',
  'Living Room': 'Living Room',
  'Outdoor Areas': 'Outdoor Areas',
  Stairways: 'Stairways',
  'Smart Safety': 'Smart Safety',
}

const masterRoomToProposalCategory: Record<string, ProposalCategory> = {
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  entrance: 'Entryway',
  kitchen: 'Kitchen',
  'living-room': 'Living Room',
}

function readInspectionDraft() {
  const raw = window.localStorage.getItem('CasaMia_current_inspection_report')

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as InspectionDraft
  } catch {
    return null
  }
}

function normalisePlan(plan?: string): ProposalPlan {
  return planOptions.includes(plan as ProposalPlan) ? (plan as ProposalPlan) : unsurePlan
}

function createProposalFromInspection() {
  const inspection = readInspectionDraft()

  if (!inspection) {
    return createEmptyProposal({ lineItems: [createLineItem()] })
  }

  const selectedPlan = normalisePlan(inspection.customer?.selectedPlan)
  const lineItems = buildInspectionCatalogueLineItems(inspection.rooms ?? [])

  return createEmptyProposal({
    address: inspection.customer?.address ?? '',
    area: inspection.customer?.area ?? '',
    customerName: inspection.customer?.customerName ?? '',
    email: inspection.customer?.email ?? '',
    executiveSummary:
      inspection.summary?.generalNotes ||
      'This proposal is based on the room-by-room inspection findings and focuses on the improvements that can most directly reduce safety risk at home.',
    inspectionReference: inspection.summary?.date ? `Inspection ${inspection.summary.date}` : 'Internal inspection report',
    lineItems: lineItems.length > 0 ? lineItems : [createLineItem()],
    overallRiskLevel: riskLevels.includes(inspection.summary?.riskLevel as ProposalData['overallRiskLevel'])
      ? (inspection.summary?.riskLevel as ProposalData['overallRiskLevel'])
      : 'Moderate',
    phone: inspection.customer?.phone ?? '',
    preparedBy: inspection.summary?.inspectorName || 'CasaMia Operations',
    safetyScore: inspection.summary?.safetyScore ?? '7',
    selectedPlan,
  })
}

function buildInspectionCatalogueLineItems(rooms: NonNullable<InspectionDraft['rooms']>): ProposalLineItem[] {
  const groups = buildCatalogueProposalGroups(getServiceCatalogue())

  return rooms.flatMap((room) => {
    const inspectionCategory = categoryByRoom[room.title ?? ''] ?? 'General'
    const group = groups.find((item) => masterRoomToProposalCategory[item.room.id] === inspectionCategory)

    if (!group) {
      return []
    }

    const improvements = (room.improvements ?? []).filter(Boolean)
    const description = [
      buildPackageDescription(group),
      room.notes ? `Inspection notes: ${room.notes}` : '',
      improvements.length ? `Inspection priorities: ${formatReadableList(improvements)}.` : '',
    ].filter(Boolean).join(' ')

    return createLineItem({
      category: masterRoomToProposalCategory[group.room.id] ?? inspectionCategory,
      description,
      grantEligible: group.homeOutcomes.some((outcome) => outcome.grantEligible),
      name: getPlansPackageLineName(group.packageLabel),
      priority: room.priority === 'Immediate' || room.priority === 'High' ? room.priority : 'Medium',
      quantity: 1,
      source: 'catalogue',
      sourcePackageId: group.homePackage.id,
      unitPrice: group.packageUnitPrice,
    })
  })
}

function buildCatalogueProposalGroups(catalogue: EditableServiceCatalogue): CatalogueProposalPackageGroup[] {
  return buildPlansBuilderGroups(catalogue, 'en', { publicOnly: false })
}

function buildCatalogueLineItems(
  groups: CatalogueProposalPackageGroup[],
  selection: CatalogueSelectionState,
  catalogue: EditableServiceCatalogue,
): ProposalLineItem[] {
  return buildPlansProposalLineItems(groups, selection, {
    commercialSettings: catalogue.masterCatalogue?.commercialSettings,
    language: 'en',
  })
}

function buildPackageDescription(group: CatalogueProposalPackageGroup) {
  return buildPlansPackageDescription(group, 'en')
}

function getLocalizedName(value: Partial<Record<'en' | 'es', string>>) {
  return localizePlansString(value, 'en')
}

function normaliseQuantity(value: number) {
  return normalisePlansQuantity(value)
}

function formatReadableList(items: string[]) {
  if (items.length <= 2) {
    return items.join(items.length === 2 ? ' and ' : '')
  }

  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function isCatalogueLineItem(item: ProposalLineItem) {
  return item.source === 'catalogue' || item.id.startsWith('catalogue-package-') || item.id.startsWith('catalogue-addon-')
}

function isBlankLineItem(item: ProposalLineItem) {
  return !item.name.trim() && !item.description.trim() && item.unitPrice === 0
}

function loadInitialProposal(searchParams: URLSearchParams) {
  const proposalId = searchParams.get('proposalId')

  if (proposalId) {
    return loadProposalById(proposalId) ?? createEmptyProposal({ id: proposalId })
  }

  if (searchParams.get('fromInspection') === 'true') {
    return createProposalFromInspection()
  }

  return createEmptyProposal({ lineItems: [createLineItem()] })
}

export function ProposalGeneratorPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const previewRef = useRef<HTMLDivElement>(null)
  const serviceCatalogue = useServiceCatalogue()
  const [proposal, setProposal] = useState<ProposalData>(() => loadInitialProposal(searchParams))
  const [catalogueSelection, setCatalogueSelection] = useState<CatalogueSelectionState>({})
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Proposal Generator | CasaMia Operations'
  }, [])

  useEffect(() => {
    if (searchParams.get('proposalId')) return
    const depositRate = getCommercialSettings(serviceCatalogue).proposalDepositRate
    setProposal((current) => current.depositRate === depositRate
      ? current
      : {
          ...current,
          depositRate,
          paymentTerms: getDefaultPaymentTerms(current.selectedPlan, depositRate),
        })
  }, [searchParams, serviceCatalogue])

  useEffect(() => {
    const proposalId = searchParams.get('proposalId')

    if (!proposalId) {
      return
    }

    loadProposalWithFallback(proposalId).then((result) => {
      if (result.proposal) {
        setProposal(result.proposal)
        setMessage(result.source === 'backend' ? 'Loaded from Supabase proposals.' : result.error ?? getProposalApiStatus())
      }
    })
  }, [searchParams])

  const title = useMemo(
    () => (searchParams.get('proposalId') ? `Edit Proposal ${proposal.id}` : 'Proposal Generator v1'),
    [proposal.id, searchParams],
  )
  const cataloguePackageGroups = useMemo(
    () => buildCatalogueProposalGroups(serviceCatalogue),
    [serviceCatalogue],
  )

  function updateProposal(patch: Partial<ProposalData>) {
    setProposal((current) => ({ ...current, ...patch }))
  }

  function updateCatalogueSelection(packageId: string, patch: Partial<CataloguePackageSelection>) {
    setCatalogueSelection((current) => {
      const previous = current[packageId] ?? { addOnOutcomeIds: [], quantity: 1, selected: false }

      return {
        ...current,
        [packageId]: {
          ...previous,
          ...patch,
          quantity: normaliseQuantity(patch.quantity ?? previous.quantity),
        },
      }
    })
  }

  function toggleCatalogueAddOn(packageId: string, outcomeId: string, checked: boolean) {
    setCatalogueSelection((current) => {
      const previous = current[packageId] ?? { addOnOutcomeIds: [], quantity: 1, selected: false }
      const addOnOutcomeIds = checked
        ? [...new Set([...previous.addOnOutcomeIds, outcomeId])]
        : previous.addOnOutcomeIds.filter((id) => id !== outcomeId)

      return {
        ...current,
        [packageId]: {
          ...previous,
          addOnOutcomeIds,
          quantity: normaliseQuantity(previous.quantity),
          selected: checked ? true : previous.selected,
        },
      }
    })
  }

  function applyCatalogueSelectionToProposal() {
    const catalogueLineItems = buildCatalogueLineItems(cataloguePackageGroups, catalogueSelection, serviceCatalogue)

    setProposal((current) => {
      const manualLineItems = current.lineItems.filter((item) => !isCatalogueLineItem(item) && !isBlankLineItem(item))

      return {
        ...current,
        lineItems: catalogueLineItems.length > 0 ? [...catalogueLineItems, ...manualLineItems] : manualLineItems,
      }
    })

    setMessage(
      catalogueLineItems.length > 0
        ? `${catalogueLineItems.length} catalogue line item${catalogueLineItems.length === 1 ? '' : 's'} applied to this proposal.`
        : 'No catalogue packages selected yet.',
    )
  }

  function updatePlan(selectedPlan: ProposalPlan) {
    setProposal((current) => ({
      ...current,
      paymentTerms: getDefaultPaymentTerms(selectedPlan),
      selectedPlan,
    }))
  }

  async function handleSave() {
    setIsSubmitting(true)
    const result = await saveProposalWithFallback(proposal)
    setProposal(result.proposal)
    setMessage(
      result.source === 'backend'
        ? `Draft saved to backend for ${result.proposal.customerName || result.proposal.id}.`
        : `Draft saved locally only. ${result.error ?? getProposalApiStatus()}`,
    )
    setIsSubmitting(false)
  }

  async function handleMarkSent() {
    setIsSubmitting(true)
    const result = await sendProposalWithFallback(proposal)
    setProposal(result.proposal)
    setMessage(
      result.source === 'backend'
        ? 'Proposal marked as sent in Supabase. The customer link is ready to share.'
        : `Proposal marked as sent locally only. ${result.error ?? getProposalApiStatus()}`,
    )
    setIsSubmitting(false)
  }

  function handleDuplicate() {
    const duplicate = duplicateProposal(proposal)
    const saved = saveProposal(duplicate)
    setProposal(saved)
    setMessage(`Duplicated as ${saved.id}.`)
    navigate(`/internal/proposal-generator?proposalId=${saved.id}`, { replace: true })
  }

  async function handleCopyCustomerLink() {
    if (!proposal.publicToken) {
      setMessage('Save this proposal to Supabase before copying its customer link.')
      return
    }

    await navigator.clipboard.writeText(`${window.location.origin}/proposal/${proposal.publicToken}`)
    setMessage('Customer proposal link copied.')
  }

  function handleReset() {
    if (!window.confirm('Reset this proposal form? Unsaved changes will be lost.')) {
      return
    }

    setProposal(createEmptyProposal({ lineItems: [createLineItem()] }))
    setMessage('Proposal form reset.')
  }

  return (
    <InternalLayout
      title={title}
      subtitle="Create a polished customer proposal from inspection findings, recommended works, payment terms, and acceptance details."
      actions={
        <>
          <Link className="btn border border-border bg-white text-navy hover:border-green hover:text-green" to="/internal/proposals">
            All Proposals
          </Link>
          <button className="btn btn-green" type="button" disabled={isSubmitting} onClick={handleSave}>
            <Save size={18} aria-hidden="true" />
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </button>
        </>
      }
    >
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.42fr)]">
        <div className="grid min-w-0 gap-6">
          <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
            <SectionHeading icon={<FileText size={24} aria-hidden="true" />} title="Customer Details" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Proposal ID">
                <input className={inputClass} readOnly value={proposal.id} />
              </Field>
              <Field label="Customer name">
                <input
                  className={inputClass}
                  value={proposal.customerName}
                  onChange={(event) => updateProposal({ customerName: event.target.value })}
                />
              </Field>
              <Field label="Phone">
                <input
                  className={inputClass}
                  value={proposal.phone}
                  onChange={(event) => updateProposal({ phone: event.target.value })}
                />
              </Field>
              <Field label="Email">
                <input
                  className={inputClass}
                  type="email"
                  value={proposal.email}
                  onChange={(event) => updateProposal({ email: event.target.value })}
                />
              </Field>
              <Field label="Address">
                <input
                  className={inputClass}
                  value={proposal.address}
                  onChange={(event) => updateProposal({ address: event.target.value })}
                />
              </Field>
              <Field label="City / Area">
                <input
                  className={inputClass}
                  value={proposal.area}
                  onChange={(event) => updateProposal({ area: event.target.value })}
                />
              </Field>
              <Field label="CasaMia route">
                <select
                  className={inputClass}
                  value={proposal.selectedPlan}
                  onChange={(event) => updatePlan(event.target.value as ProposalPlan)}
                >
                  {planOptions.map((plan) => (
                    <option key={plan}>{plan}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
            <SectionHeading icon={<FileText size={24} aria-hidden="true" />} title="Proposal Summary" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Proposal date">
                <input
                  className={inputClass}
                  type="date"
                  value={proposal.proposalDate}
                  onChange={(event) => updateProposal({ proposalDate: event.target.value })}
                />
              </Field>
              <Field label="Valid until date">
                <input
                  className={inputClass}
                  type="date"
                  value={proposal.validUntil}
                  onChange={(event) => updateProposal({ validUntil: event.target.value })}
                />
              </Field>
              <Field label="Prepared by">
                <input
                  className={inputClass}
                  value={proposal.preparedBy}
                  onChange={(event) => updateProposal({ preparedBy: event.target.value })}
                />
              </Field>
              <Field label="Inspection reference">
                <input
                  className={inputClass}
                  value={proposal.inspectionReference}
                  onChange={(event) => updateProposal({ inspectionReference: event.target.value })}
                />
              </Field>
              <Field label="Overall risk level">
                <select
                  className={inputClass}
                  value={proposal.overallRiskLevel}
                  onChange={(event) =>
                    updateProposal({ overallRiskLevel: event.target.value as ProposalData['overallRiskLevel'] })
                  }
                >
                  {riskLevels.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
              </Field>
              <Field label="Safety score, 1-10">
                <input
                  className={inputClass}
                  max="10"
                  min="1"
                  type="number"
                  value={proposal.safetyScore}
                  onChange={(event) => updateProposal({ safetyScore: event.target.value })}
                />
              </Field>
            </div>
            <label className="mt-5 grid gap-2">
              <span className="text-sm font-extrabold text-text-dark">Customer summary</span>
              <textarea
                className={textareaClass}
                value={proposal.executiveSummary}
                onChange={(event) => updateProposal({ executiveSummary: event.target.value })}
              />
            </label>
          </section>

          <CataloguePackageBuilder
            groups={cataloguePackageGroups}
            selection={catalogueSelection}
            onApply={applyCatalogueSelectionToProposal}
            onToggleAddOn={toggleCatalogueAddOn}
            onUpdatePackage={updateCatalogueSelection}
          />

          <ProposalLineItems
            items={proposal.lineItems}
            onChange={(lineItems) => updateProposal({ lineItems })}
          />

          <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
            <SectionHeading icon={<FileText size={24} aria-hidden="true" />} title="Timeline" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Estimated start date">
                <input
                  className={inputClass}
                  type="date"
                  value={proposal.timelineStartDate}
                  onChange={(event) => updateProposal({ timelineStartDate: event.target.value })}
                />
              </Field>
              <Field label="Estimated duration">
                <input
                  className={inputClass}
                  value={proposal.timelineDuration}
                  onChange={(event) => updateProposal({ timelineDuration: event.target.value })}
                />
              </Field>
            </div>
            <label className="mt-5 grid gap-2">
              <span className="text-sm font-extrabold text-text-dark">Scheduling notes</span>
              <textarea
                className={textareaClass}
                value={proposal.timelineNotes}
                onChange={(event) => updateProposal({ timelineNotes: event.target.value })}
              />
            </label>
          </section>

          <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
            <SectionHeading icon={<FileText size={24} aria-hidden="true" />} title="Grant Support" />
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-light-blue px-4 py-3 text-sm font-extrabold text-text-dark">
              <input
                className="h-4 w-4 accent-green"
                checked={proposal.grantSupportRequired}
                type="checkbox"
                onChange={(event) => updateProposal({ grantSupportRequired: event.target.checked })}
              />
              Grant support required
            </label>
            <label className="mt-5 grid gap-2">
              <span className="text-sm font-extrabold text-text-dark">Estimated grant eligibility note</span>
              <textarea
                className={textareaClass}
                value={proposal.grantEligibilityNote}
                onChange={(event) => updateProposal({ grantEligibilityNote: event.target.value })}
              />
            </label>
          </section>

          <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
            <SectionHeading icon={<FileText size={24} aria-hidden="true" />} title="Payment Terms" />
            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-text-dark">Payment terms</span>
              <textarea
                className={textareaClass}
                value={proposal.paymentTerms}
                onChange={(event) => updateProposal({ paymentTerms: event.target.value })}
              />
            </label>
            <p className="mt-4 rounded-lg bg-green/10 p-4 text-sm font-bold text-green">
              {hiddenFeeReassurance}
            </p>
          </section>

          <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
            <SectionHeading icon={<FileText size={24} aria-hidden="true" />} title="Terms & Customer Acceptance" />
            <p className="text-sm leading-relaxed text-text-mid">
              By accepting this proposal, the customer confirms approval of the listed works, payment terms,
              and applicable service terms.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
              <Link className="text-navy underline-offset-4 hover:underline" to="/terms-and-conditions">
                Terms & Conditions
              </Link>
              <Link className="text-navy underline-offset-4 hover:underline" to="/terms-and-conditions#grant-management">
                Grant Management Terms
              </Link>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Field label="Customer acceptance status">
                <select
                  className={inputClass}
                  value={proposal.acceptanceStatus}
                  onChange={(event) =>
                    updateProposal({ acceptanceStatus: event.target.value as ProposalData['acceptanceStatus'] })
                  }
                >
                  {acceptanceStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </Field>
              <Field label="Accepted by">
                <input
                  className={inputClass}
                  value={proposal.acceptedBy}
                  onChange={(event) => updateProposal({ acceptedBy: event.target.value })}
                />
              </Field>
              <Field label="Acceptance date">
                <input
                  className={inputClass}
                  type="date"
                  value={proposal.acceptanceDate}
                  onChange={(event) => updateProposal({ acceptanceDate: event.target.value })}
                />
              </Field>
            </div>
          </section>
        </div>

        <div className="min-w-0 2xl:sticky 2xl:top-8 2xl:self-start">
          <div className="grid gap-4">
            <ProposalTotals proposal={proposal} />
            <section className="proposal-screen-controls rounded-lg border border-border bg-white p-5 shadow-soft">
              <h2 className="font-display text-2xl font-bold text-text-dark">Actions</h2>
              <div className="mt-4 grid gap-3">
                <button className="btn btn-green w-full" type="button" disabled={isSubmitting} onClick={handleSave}>
                  <Save size={18} aria-hidden="true" />
                  {isSubmitting ? 'Saving...' : 'Save Draft'}
                </button>
                <button className="btn btn-navy w-full" type="button" disabled={isSubmitting} onClick={handleMarkSent}>
                  <Send size={18} aria-hidden="true" />
                  {isSubmitting ? 'Sending...' : 'Mark as Sent'}
                </button>
                <button
                  className="btn w-full border border-border bg-white text-navy hover:border-green hover:text-green"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleCopyCustomerLink()}
                >
                  <Link2 size={18} aria-hidden="true" />
                  Copy Customer Link
                </button>
                <button
                  className="btn w-full border border-border bg-white text-navy hover:border-green hover:text-green"
                  type="button"
                  onClick={() => window.print()}
                >
                  <Printer size={18} aria-hidden="true" />
                  Print Proposal
                </button>
                <button
                  className="btn w-full border border-border bg-white text-navy hover:border-green hover:text-green"
                  type="button"
                  onClick={handleDuplicate}
                >
                  <Copy size={18} aria-hidden="true" />
                  Duplicate Proposal
                </button>
                <button
                  className="btn w-full border border-border bg-white text-navy hover:border-red-500 hover:text-red-600"
                  type="button"
                  onClick={handleReset}
                >
                  <RefreshCcw size={18} aria-hidden="true" />
                  Reset
                </button>
              </div>
              {message ? (
                <p className="mt-4 rounded-lg bg-green/10 p-3 text-sm font-bold text-green">{message}</p>
              ) : null}
            </section>
          </div>
        </div>
      </div>

      <section className="mt-8" ref={previewRef}>
        <ProposalPreview proposal={proposal} />
      </section>
    </InternalLayout>
  )
}

function CataloguePackageBuilder({
  groups,
  onApply,
  onToggleAddOn,
  onUpdatePackage,
  selection,
}: {
  groups: CatalogueProposalPackageGroup[]
  onApply: () => void
  onToggleAddOn: (packageId: string, outcomeId: string, checked: boolean) => void
  onUpdatePackage: (packageId: string, patch: Partial<CataloguePackageSelection>) => void
  selection: CatalogueSelectionState
}) {
  const selectedPackageCount = groups.filter((group) => selection[group.homePackage.id]?.selected).length
  const selectedAddOnCount = groups.reduce(
    (sum, group) => {
      const packageSelection = selection[group.homePackage.id]

      return sum + (packageSelection?.selected ? packageSelection.addOnOutcomeIds.length : 0)
    },
    0,
  )

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <SectionHeading icon={<PackageCheck size={24} aria-hidden="true" />} title="Build From Master Catalogue" />
        <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide text-navy">
          <span className="rounded-full bg-light-blue px-3 py-2">{selectedPackageCount} package selected</span>
          <span className="rounded-full bg-light-blue px-3 py-2">{selectedAddOnCount} add-on selected</span>
        </div>
      </div>

      <p className="-mt-2 max-w-4xl text-sm leading-relaxed text-text-mid">
        Select one or more room packages, set the quantity for each room/package, then add any connected or optional
        add-ons required. Applying this will create proposal lines from the current catalogue while keeping manual edits
        separate.
      </p>

      <div className="mt-6 grid gap-4">
        {groups.map((group) => {
          const packageSelection = selection[group.homePackage.id] ?? { addOnOutcomeIds: [], quantity: 1, selected: false }
          const isSelected = packageSelection.selected
          const selectedAddOnIds = new Set(packageSelection.addOnOutcomeIds)

          return (
            <article
              className={`rounded-xl border p-4 transition ${
                isSelected ? 'border-blue bg-light-blue shadow-soft' : 'border-border bg-white'
              }`}
              key={group.homePackage.id}
            >
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_150px_180px] xl:items-center">
                <label className="flex cursor-pointer items-start gap-4">
                  <input
                    checked={isSelected}
                    className="mt-2 h-5 w-5 accent-green"
                    type="checkbox"
                    onChange={(event) =>
                      onUpdatePackage(group.homePackage.id, {
                        addOnOutcomeIds: event.target.checked ? packageSelection.addOnOutcomeIds : [],
                        selected: event.target.checked,
                      })
                    }
                  />
                  <span>
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-blue">{group.roomLabel}</span>
                    <strong className="mt-1 block text-xl font-black text-text-dark">{group.packageLabel}</strong>
                    <span className="mt-1 block text-sm leading-relaxed text-text-mid">
                      {getLocalizedName(group.homePackage.customerBenefit)}
                    </span>
                  </span>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-wide text-text-muted">Quantity</span>
                  <input
                    className={inputClass}
                    disabled={!isSelected}
                    min="1"
                    type="number"
                    value={packageSelection.quantity}
                    onChange={(event) =>
                      onUpdatePackage(group.homePackage.id, { quantity: Number(event.target.value), selected: true })
                    }
                  />
                </label>

                <div className="rounded-lg border border-border bg-white px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-wide text-text-muted">Package price</p>
                  <p className="mt-1 text-sm font-black text-navy">
                    {group.packageUnitPrice > 0 ? `${formatCurrency(group.packageUnitPrice)} / package` : 'Confirm in quote'}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue">Core included items</p>
                    <p className="mt-1 text-sm font-bold text-text-mid">These stay inside the package price.</p>
                  </div>
                  <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-black uppercase text-green">
                    {group.homeOutcomes.length} included
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.homeOutcomes.map((outcome) => (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-light-blue px-3 py-2 text-sm font-bold text-text-dark"
                      key={outcome.id}
                    >
                      <CheckCircle2 className="text-green" size={15} aria-hidden="true" />
                      {getLocalizedName(outcome.customerName)}
                    </span>
                  ))}
                </div>
              </div>

              {group.addOnPackages.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-blue">Optional add-ons for this package</p>
                  {group.addOnPackages.map((addOnPackage) => (
                    <div className="rounded-lg border border-border bg-white p-4" key={addOnPackage.packageRecord.id}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-black text-text-dark">
                            {getLocalizedName(addOnPackage.packageRecord.customerName)}
                          </p>
                          <p className="text-xs font-bold text-text-muted">
                            Select only what should be added to this proposal.
                          </p>
                        </div>
                        <span className="rounded-full bg-pale-blue px-3 py-1 text-xs font-black uppercase text-blue">
                          Add-on
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {addOnPackage.outcomes.map((outcome) => (
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                              selectedAddOnIds.has(outcome.id)
                                ? 'border-green bg-green/10'
                                : 'border-border bg-light-blue/40 hover:border-blue'
                            }`}
                            key={outcome.id}
                          >
                            <input
                              checked={selectedAddOnIds.has(outcome.id)}
                              className="mt-1 h-4 w-4 accent-green"
                              disabled={!isSelected}
                              type="checkbox"
                              onChange={(event) => onToggleAddOn(group.homePackage.id, outcome.id, event.target.checked)}
                            />
                            <span>
                              <span className="block text-sm font-black text-text-dark">
                                {getLocalizedName(outcome.customerName)}
                              </span>
                              <span className="mt-1 block text-xs font-bold leading-relaxed text-text-muted">
                                {getLocalizedName(outcome.shortDescription)}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          )
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-text-mid">
          Applying replaces previous catalogue-generated lines, not manual edits.
        </p>
        <button className="btn btn-navy w-full sm:w-auto" type="button" onClick={onApply}>
          Apply selected packages
          <CheckCircle2 size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

function SectionHeading({
  icon,
  title,
}: {
  icon: ReactNode
  title: string
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-navy text-white">{icon}</span>
      <div>
        <h2 className="font-display text-3xl font-bold text-text-dark">{title}</h2>
      </div>
    </div>
  )
}

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-text-dark">{label}</span>
      {children}
    </label>
  )
}
