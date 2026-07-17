import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Inbox,
  Network,
  PackageCheck,
  PhoneCall,
  RefreshCw,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { StatCard } from '../../components/internal/StatCard'
import { loadInternalDashboard, type InternalDashboardData } from '../../services/internalDashboard'

const emptyStats: InternalDashboardData['stats'] = {
  activeServices: 0,
  newAssessments: 0,
  newCustomerPlans: 0,
  openCallbacks: 0,
  pendingProposals: 0,
  providerLeads: 0,
}

export function InternalDashboardPage() {
  const [data, setData] = useState<InternalDashboardData>({ issues: [], stats: emptyStats })
  const [message, setMessage] = useState('Loading live operations data...')
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const next = await loadInternalDashboard()
      setData(next)
      setMessage(next.issues.length
        ? `Connected with ${next.issues.length} data source warning${next.issues.length === 1 ? '' : 's'}.`
        : 'All core operational data sources are connected.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Dashboard data could not be loaded.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'CasaMia Operations | Internal'
    void refresh()
  }, [refresh])

  const stats = useMemo(() => [
    { label: 'New assessments', value: data.stats.newAssessments, icon: Inbox, accent: 'green' as const },
    { label: 'Open callbacks', value: data.stats.openCallbacks, icon: PhoneCall, accent: 'gold' as const },
    { label: 'Customer plans', value: data.stats.newCustomerPlans, icon: ClipboardCheck, accent: 'blue' as const },
    { label: 'Pending proposals', value: data.stats.pendingProposals, icon: FileText, accent: 'gold' as const },
    { label: 'Provider leads', value: data.stats.providerLeads, icon: Network, accent: 'navy' as const },
    { label: 'Active services', value: data.stats.activeServices, icon: PackageCheck, accent: 'blue' as const },
  ], [data.stats])

  return (
    <InternalLayout
      title="CasaMia Operations"
      subtitle="Live customer requests, proposals, providers and service catalogue activity in one protected workspace."
      actions={
        <>
          <button className="btn btn-white" disabled={isLoading} type="button" onClick={() => void refresh()}>
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
            Refresh
          </button>
          <Link className="btn btn-navy" to="/internal/visits">
            Assessment requests
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link className="btn btn-green" to="/internal/inspection-report">
            Create report
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
            value={isLoading ? '...' : String(stat.value)}
          />
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-lg border border-border bg-white p-6 shadow-soft">
          <h2 className="font-display text-3xl font-bold text-text-dark">Connected workflows</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Review assessment intake', to: '/internal/visits' },
              { label: 'Process customer plans', to: '/internal/orders' },
              { label: 'Create and track proposals', to: '/internal/proposals' },
              { label: 'Review provider applications', to: '/internal/provider-partners' },
              { label: 'Manage services and prices', to: '/internal/service-catalog' },
              { label: 'Return customer calls', to: '/internal/callbacks' },
            ].map((item, index) => (
              <Link className="rounded-lg bg-light-blue p-5 transition hover:bg-pale-blue" key={item.to} to={item.to}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-blue text-sm font-black text-white">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-bold leading-relaxed text-text-dark">{item.label}</p>
              </Link>
            ))}
          </div>
        </article>

        <aside className="rounded-lg border border-border bg-navy p-6 text-white shadow-soft">
          <p className="text-sm font-black uppercase text-sky">System status</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight">{message}</h2>
          {data.issues.length ? (
            <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-white/75">
              {data.issues.map((issue) => <li key={issue}>{issue}</li>)}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Counts come from the same Supabase records used by the public forms and internal queues.
            </p>
          )}
        </aside>
      </section>
    </InternalLayout>
  )
}
