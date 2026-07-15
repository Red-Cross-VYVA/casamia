import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Hammer,
  Inbox,
  Network,
  Tags,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { StatCard } from '../../components/internal/StatCard'

const stats = [
  { label: "Today's Visits", value: '6', icon: CalendarDays, accent: 'blue' as const },
  { label: 'New Assessment Requests', value: '14', icon: Inbox, accent: 'green' as const },
  { label: 'Reports in Progress', value: '8', icon: ClipboardList, accent: 'navy' as const },
  { label: 'Proposals Pending', value: '5', icon: FileText, accent: 'gold' as const },
  { label: 'Installations Scheduled', value: '9', icon: Hammer, accent: 'blue' as const },
  { label: 'Grant Applications', value: '11', icon: ClipboardCheck, accent: 'green' as const },
  { label: 'Provider Leads', value: '0', icon: Network, accent: 'navy' as const },
  { label: 'Managed Package Cards', value: '6', icon: Tags, accent: 'gold' as const },
]

export function InternalDashboardPage() {
  useEffect(() => {
    document.title = 'CasaMia Operations | Internal'
  }, [])

  return (
    <InternalLayout
      title="CasaMia Operations"
      subtitle="A private workspace for managing inspection visits, safety reports, proposals, installations, and grant-support tasks."
      actions={
        <>
          <Link className="btn btn-navy" to="/internal/visits">
            View Visits
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link className="btn btn-green" to="/internal/inspection-report">
            Create Inspection Report
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link className="btn btn-white" to="/internal/provider-partners">
            Provider Leads
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link className="btn btn-white" to="/internal/package-config">
            Edit Packages
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </>
      }
    >
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            accent={stat.accent}
            icon={stat.icon}
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-lg border border-border bg-white p-6 shadow-soft">
          <h2 className="font-display text-3xl font-bold text-text-dark">Operational focus today</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              'Complete two high-priority bathroom reports before 14:00.',
              'Review three pending grant application document packs.',
              'Confirm installer availability for Smart Safety follow-ups.',
              'Check package card pricing before publishing new campaign traffic.',
            ].map((item, index) => (
              <div className="rounded-lg bg-light-blue p-5" key={item}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-green text-sm font-black text-white">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-bold leading-relaxed text-text-dark">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="rounded-lg border border-border bg-navy p-6 text-white shadow-soft">
          <p className="text-sm font-black uppercase text-green">Prototype status</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight">
            Frontend-only operations portal
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            Authentication, backend storage, CRM sync, and PDF generation can be connected after the report
            builder workflow is approved.
          </p>
        </aside>
      </section>
    </InternalLayout>
  )
}
