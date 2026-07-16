import { ArrowRight, CalendarDays } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { VisitTable, type Visit } from '../../components/internal/VisitTable'
import { assessmentPlan, homeSafetyPlan, smartSafetyPlan, unsurePlan } from '../../services/proposalCalculations'

const visits: Visit[] = [
  {
    area: 'Madrid - Chamberi',
    customerName: 'Elena Martin',
    preferredTime: '09:30',
    selectedPlan: homeSafetyPlan,
    status: 'Scheduled',
  },
  {
    area: 'Valencia - Ruzafa',
    customerName: 'Javier Ruiz',
    preferredTime: '10:45',
    selectedPlan: smartSafetyPlan,
    status: 'In Progress',
  },
  {
    area: 'Malaga - Este',
    customerName: 'Carmen Lopez',
    preferredTime: '12:00',
    selectedPlan: assessmentPlan,
    status: 'Report Pending',
  },
  {
    area: 'Barcelona - Gracia',
    customerName: 'Maria Fernandez',
    preferredTime: '14:15',
    selectedPlan: homeSafetyPlan,
    status: 'Proposal Sent',
  },
  {
    area: 'Alicante - Centro',
    customerName: 'Antonio Garcia',
    preferredTime: '16:00',
    selectedPlan: unsurePlan,
    status: 'Scheduled',
  },
]

export function InternalVisitsPage() {
  useEffect(() => {
    document.title = "Today's Visits | CasaMia Operations"
  }, [])

  return (
    <InternalLayout
      title="Today's Visits"
      subtitle="Mock inspection schedule for field visits and pending safety reports."
      actions={
        <Link className="btn btn-green" to="/internal/inspection-report">
          Create Inspection Report
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      }
    >
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-green">
              <CalendarDays size={18} aria-hidden="true" />
              Live mock schedule
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-text-dark">Inspection list</h2>
          </div>
          <p className="rounded-full bg-light-blue px-4 py-2 text-sm font-extrabold text-navy">
            {visits.length} visits today
          </p>
        </div>
        <VisitTable visits={visits} />
      </section>
    </InternalLayout>
  )
}
