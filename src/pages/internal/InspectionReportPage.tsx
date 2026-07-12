import { ArrowRight, ClipboardCheck, FileText, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { InspectionRoomCard, type RoomInspection } from '../../components/internal/InspectionRoomCard'
import { InternalLayout } from '../../components/internal/InternalLayout'
import { ReportPreview, type ReportPreviewData } from '../../components/internal/ReportPreview'

type CustomerDetails = {
  address: string
  area: string
  customerName: string
  email: string
  phone: string
  selectedPlan: string
}

type InspectionSummary = {
  date: string
  generalNotes: string
  inspectorName: string
  riskLevel: string
  safetyScore: string
}

type ReportDraft = {
  customer: CustomerDetails
  manualPlan: string
  rooms: RoomInspection[]
  summary: InspectionSummary
}

const draftStorageKey = 'CasaMia-internal-inspection-report-v1'

const planOptions = [
  'Home Assessment Plan',
  'Home Safety Plan',
  'Smart Safety Plan',
  'Not sure yet',
]

const riskLevels = ['Low', 'Moderate', 'High', 'Critical']

const improvementOptions = [
  'Grab bars',
  'Handrails',
  'Anti-slip flooring',
  'Lighting upgrade',
  'Doorway/threshold improvement',
  'Ramp/access improvement',
  'Furniture anchoring',
  'Smart sensor',
  'Emergency alert device',
  'Health monitoring setup',
  'Other',
]

const smartImprovements = new Set([
  'Smart sensor',
  'Emergency alert device',
  'Health monitoring setup',
])

const roomDefinitions = [
  {
    id: 'bathroom',
    title: 'Bathroom',
    hazards: ['Slippery floor', 'No grab bars', 'High bathtub threshold', 'Poor lighting', 'Toilet too low'],
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    hazards: ['Poor night lighting', 'Trip hazards', 'Bed height unsafe', 'Cluttered pathways'],
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    hazards: ['Hard-to-reach storage', 'Poor task lighting', 'Slip risk', 'Unsafe appliance access'],
  },
  {
    id: 'living-room',
    title: 'Living Room',
    hazards: ['Cluttered pathways', 'Loose rugs', 'Poor lighting', 'Unanchored furniture'],
  },
  {
    id: 'hallways',
    title: 'Hallways',
    hazards: ['Narrow passage', 'Poor lighting', 'Loose flooring', 'No hand support'],
  },
  {
    id: 'stairways',
    title: 'Stairways',
    hazards: ['No handrails', 'Poor lighting', 'Slippery steps', 'Uneven steps'],
  },
  {
    id: 'entryway',
    title: 'Entryway',
    hazards: ['High threshold', 'Poor lighting', 'Steps without railings', 'Difficult access'],
  },
  {
    id: 'outdoor',
    title: 'Outdoor Areas',
    hazards: ['Uneven paths', 'Poor lighting', 'Slippery surfaces', 'No handrails'],
  },
  {
    id: 'smart-safety',
    title: 'Smart Safety',
    hazards: [
      'No emergency alert device',
      'No motion lighting',
      'No water sensors',
      'No fall detection support',
    ],
  },
]

const inputClass =
  'min-h-12 w-full rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15'

const textareaClass =
  'min-h-32 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15'

function createEmptyDraft(): ReportDraft {
  return {
    customer: {
      address: '',
      area: '',
      customerName: '',
      email: '',
      phone: '',
      selectedPlan: 'Not sure yet',
    },
    manualPlan: '',
    rooms: roomDefinitions.map((room) => ({
      hazards: [],
      id: room.id,
      improvements: [],
      notes: '',
      photos: [],
      priority: 'Medium',
      riskLevel: 'Low',
      title: room.title,
    })),
    summary: {
      date: new Date().toISOString().slice(0, 10),
      generalNotes: '',
      inspectorName: '',
      riskLevel: 'Moderate',
      safetyScore: '7',
    },
  }
}

function loadInitialDraft(): ReportDraft {
  const fallback = createEmptyDraft()
  const saved = window.localStorage.getItem(draftStorageKey)

  if (!saved) {
    return fallback
  }

  try {
    const parsed = JSON.parse(saved) as ReportDraft

    return {
      ...fallback,
      ...parsed,
      customer: { ...fallback.customer, ...parsed.customer },
      summary: { ...fallback.summary, ...parsed.summary },
      rooms: fallback.rooms.map((fallbackRoom) => ({
        ...fallbackRoom,
        ...parsed.rooms?.find((room) => room.id === fallbackRoom.id),
      })),
    }
  } catch {
    return fallback
  }
}

export function InspectionReportPage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<ReportDraft>(() => loadInitialDraft())
  const [draftMessage, setDraftMessage] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Inspection Report Builder | CasaMia Operations'
  }, [])

  const allSelectedImprovements = useMemo(
    () => [...new Set(draft.rooms.flatMap((room) => room.improvements))],
    [draft.rooms],
  )

  const suggestedPlan = useMemo(() => {
    const smartSelected = allSelectedImprovements.some((item) => smartImprovements.has(item))
    const physicalCount = draft.rooms.flatMap((room) =>
      room.improvements.filter((item) => !smartImprovements.has(item) && item !== 'Other'),
    ).length
    const roomsWithPhysical = draft.rooms.filter((room) =>
      room.improvements.some((item) => !smartImprovements.has(item) && item !== 'Other'),
    ).length
    const highRiskFindings = draft.rooms.filter((room) =>
      ['High', 'Critical'].includes(room.riskLevel),
    ).length
    const hazardCount = draft.rooms.flatMap((room) => room.hazards).length

    if (smartSelected) {
      return 'Smart Safety Plan'
    }

    if (physicalCount >= 3 || roomsWithPhysical >= 2 || (highRiskFindings > 0 && hazardCount >= 3)) {
      return 'Home Safety Plan'
    }

    return 'Home Assessment Plan'
  }, [allSelectedImprovements, draft.rooms])

  const recommendedPlan = draft.manualPlan || suggestedPlan

  const previewData = useMemo<ReportPreviewData>(() => {
    const risks = draft.rooms
      .filter((room) => room.hazards.length > 0 || ['High', 'Critical'].includes(room.riskLevel))
      .map((room) => {
        const hazards = room.hazards.slice(0, 3).join(', ')
        return `${room.title}: ${hazards || `${room.riskLevel} risk level selected`}`
      })

    return {
      customerName: draft.customer.customerName,
      improvements: allSelectedImprovements,
      inspectionDate: draft.summary.date,
      nextSteps: [
        'Review the findings with the customer and family.',
        'Confirm which recommendations should be included in the proposal.',
        'Prepare a clear scope, deposit terms, and customer acceptance checklist.',
      ],
      recommendedPlan,
      riskLevel: draft.summary.riskLevel,
      safetyScore: draft.summary.safetyScore,
      topRisks: risks,
    }
  }, [allSelectedImprovements, draft, recommendedPlan])

  function updateCustomer(patch: Partial<CustomerDetails>) {
    setDraft((current) => ({ ...current, customer: { ...current.customer, ...patch } }))
  }

  function updateSummary(patch: Partial<InspectionSummary>) {
    setDraft((current) => ({ ...current, summary: { ...current.summary, ...patch } }))
  }

  function updateRoom(updatedRoom: RoomInspection) {
    setDraft((current) => ({
      ...current,
      rooms: current.rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)),
    }))
  }

  function saveDraft() {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft))
    setDraftMessage(`Draft saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`)
  }

  function scrollToPreview() {
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function printReport() {
    window.print()
  }

  function generateProposal() {
    window.localStorage.setItem('CasaMia_current_inspection_report', JSON.stringify(draft))
    navigate('/internal/proposal-generator?fromInspection=true')
  }

  return (
    <InternalLayout
      title="Inspection Report Builder v1"
      subtitle="Build a room-by-room safety report from an inspection visit, then turn it into a proposal-ready summary."
      actions={
        <button className="btn btn-green" type="button" onClick={generateProposal}>
          <FileText size={18} aria-hidden="true" />
          Generate Proposal
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      }
    >
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid min-w-0 gap-6">
          <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-navy text-white">
                <UserRound size={24} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-3xl font-bold text-text-dark">Customer Details</h2>
                <p className="text-sm text-text-mid">Core lead and visit information for the report.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Customer name">
                <input
                  className={inputClass}
                  value={draft.customer.customerName}
                  onChange={(event) => updateCustomer({ customerName: event.target.value })}
                />
              </Field>
              <Field label="Phone">
                <input
                  className={inputClass}
                  value={draft.customer.phone}
                  onChange={(event) => updateCustomer({ phone: event.target.value })}
                />
              </Field>
              <Field label="Email">
                <input
                  className={inputClass}
                  type="email"
                  value={draft.customer.email}
                  onChange={(event) => updateCustomer({ email: event.target.value })}
                />
              </Field>
              <Field label="Address">
                <input
                  className={inputClass}
                  value={draft.customer.address}
                  onChange={(event) => updateCustomer({ address: event.target.value })}
                />
              </Field>
              <Field label="City / Area">
                <input
                  className={inputClass}
                  value={draft.customer.area}
                  onChange={(event) => updateCustomer({ area: event.target.value })}
                />
              </Field>
              <Field label="Selected plan">
                <select
                  className={inputClass}
                  value={draft.customer.selectedPlan}
                  onChange={(event) => updateCustomer({ selectedPlan: event.target.value })}
                >
                  {planOptions.map((plan) => (
                    <option key={plan}>{plan}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-green text-white">
                <ClipboardCheck size={24} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-3xl font-bold text-text-dark">Inspection Summary</h2>
                <p className="text-sm text-text-mid">Overall safety condition and inspector notes.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Inspection date">
                <input
                  className={inputClass}
                  type="date"
                  value={draft.summary.date}
                  onChange={(event) => updateSummary({ date: event.target.value })}
                />
              </Field>
              <Field label="Inspector name">
                <input
                  className={inputClass}
                  value={draft.summary.inspectorName}
                  onChange={(event) => updateSummary({ inspectorName: event.target.value })}
                />
              </Field>
              <Field label="Safety score, 1-10">
                <input
                  className={inputClass}
                  max="10"
                  min="1"
                  type="number"
                  value={draft.summary.safetyScore}
                  onChange={(event) => updateSummary({ safetyScore: event.target.value })}
                />
              </Field>
              <Field label="Overall risk level">
                <select
                  className={inputClass}
                  value={draft.summary.riskLevel}
                  onChange={(event) => updateSummary({ riskLevel: event.target.value })}
                >
                  {riskLevels.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
              </Field>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-extrabold text-text-dark">General notes</span>
              <textarea
                className={textareaClass}
                value={draft.summary.generalNotes}
                onChange={(event) => updateSummary({ generalNotes: event.target.value })}
                placeholder="Summarise household priorities, mobility context, family concerns, or access constraints..."
              />
            </label>
          </section>

          <section className="grid gap-4">
            <div className="rounded-lg border border-border bg-white p-6 shadow-soft">
              <h2 className="font-display text-3xl font-bold text-text-dark">Room-by-room checklist</h2>
              <p className="mt-2 max-w-3xl text-sm text-text-mid">
                Review each area, record hazards, select recommended improvements, and add photo placeholders
                for the final report.
              </p>
            </div>
            {draft.rooms.map((room, index) => {
              const definition = roomDefinitions.find((item) => item.id === room.id)

              return (
                <InspectionRoomCard
                  defaultOpen={index < 2}
                  hazardOptions={definition?.hazards ?? []}
                  improvementOptions={improvementOptions}
                  key={room.id}
                  room={room}
                  onChange={updateRoom}
                />
              )
            })}
          </section>

          <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-text-dark">Recommended CasaMia Plan</h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)]">
              <div className="rounded-lg bg-light-blue p-5">
                <p className="text-sm font-black uppercase text-text-muted">Recommended Plan</p>
                <p className="mt-2 font-display text-4xl font-black text-navy">{recommendedPlan}</p>
                <p className="mt-3 text-sm leading-relaxed text-text-mid">
                  Automatic suggestion: <strong>{suggestedPlan}</strong>. Smart safety recommendations take
                  priority, followed by multiple physical modification needs.
                </p>
              </div>
              <Field label="Manual override">
                <select
                  className={inputClass}
                  value={draft.manualPlan}
                  onChange={(event) => setDraft((current) => ({ ...current, manualPlan: event.target.value }))}
                >
                  <option value="">Use automatic suggestion</option>
                  {planOptions.map((plan) => (
                    <option key={plan}>{plan}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>
        </div>

        <div className="min-w-0 2xl:sticky 2xl:top-8 2xl:self-start">
          <ReportPreview
            data={previewData}
            draftMessage={draftMessage}
            ref={previewRef}
            onGeneratePreview={scrollToPreview}
            onPrint={printReport}
            onSaveDraft={saveDraft}
          />
        </div>
      </div>
    </InternalLayout>
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
