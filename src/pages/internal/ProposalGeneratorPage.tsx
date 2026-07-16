import {
  Copy,
  FileText,
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
  getDefaultPaymentTerms,
  hiddenFeeReassurance,
  planOptions,
  riskLevels,
  unsurePlan,
  type ProposalCategory,
  type ProposalData,
  type ProposalPlan,
} from '../../services/proposalCalculations'
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

const inputClass =
  'min-h-12 w-full rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15'

const textareaClass =
  'min-h-32 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15'

const improvementToService: Record<string, { name: string; unitPrice: number }> = {
  'Anti-slip flooring': { name: 'Anti-slip flooring solution', unitPrice: 650 },
  'Doorway/threshold improvement': { name: 'Threshold modification', unitPrice: 280 },
  'Emergency alert device': { name: 'Emergency alert device setup', unitPrice: 290 },
  'Furniture anchoring': { name: 'Furniture anchoring', unitPrice: 110 },
  'Grab bars': { name: 'Grab bar installation', unitPrice: 95 },
  'Handrails': { name: 'Handrail installation', unitPrice: 420 },
  'Health monitoring setup': { name: 'Health monitoring setup', unitPrice: 390 },
  'Lighting upgrade': { name: 'Lighting upgrade', unitPrice: 240 },
  'Ramp/access improvement': { name: 'Ramp/access improvement', unitPrice: 850 },
  'Smart sensor': { name: 'Motion lighting setup', unitPrice: 170 },
}

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
  const lineItems =
    inspection.rooms?.flatMap((room) =>
      (room.improvements ?? []).map((improvement) => {
        const service = improvementToService[improvement] ?? { name: improvement, unitPrice: 150 }

        return createLineItem({
          category: categoryByRoom[room.title ?? ''] ?? 'General',
          description: room.notes ?? '',
          grantEligible: !['Smart sensor', 'Emergency alert device', 'Health monitoring setup'].includes(improvement),
          name: service.name,
          priority: room.priority === 'Immediate' || room.priority === 'High' ? room.priority : 'Medium',
          quantity: improvement === 'Grab bars' ? 2 : 1,
          unitPrice: service.unitPrice,
        })
      }),
    ) ?? []

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
  const [proposal, setProposal] = useState<ProposalData>(() => loadInitialProposal(searchParams))
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Proposal Generator | CasaMia Operations'
  }, [])

  useEffect(() => {
    const proposalId = searchParams.get('proposalId')

    if (!proposalId) {
      return
    }

    loadProposalWithFallback(proposalId).then((result) => {
      if (result.proposal) {
        setProposal(result.proposal)
        setMessage(result.source === 'backend' ? 'Loaded from proposal backend.' : getProposalApiStatus())
      }
    })
  }, [searchParams])

  const title = useMemo(
    () => (searchParams.get('proposalId') ? `Edit Proposal ${proposal.id}` : 'Proposal Generator v1'),
    [proposal.id, searchParams],
  )

  function updateProposal(patch: Partial<ProposalData>) {
    setProposal((current) => ({ ...current, ...patch }))
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
        : `Draft saved locally for ${result.proposal.customerName || result.proposal.id}. ${getProposalApiStatus()}`,
    )
    setIsSubmitting(false)
  }

  async function handleMarkSent() {
    setIsSubmitting(true)
    const result = await sendProposalWithFallback(proposal)
    setProposal(result.proposal)
    setMessage(
      result.source === 'backend'
        ? 'Proposal sent through backend email workflow.'
        : `Proposal marked as sent locally. ${getProposalApiStatus()}`,
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
