import { Building2, CheckCircle2, Clock3, ExternalLink, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { StatCard } from '../../components/internal/StatCard'
import {
  loadProviderApplications,
  providerApplicationBackendConfigured,
  updateProviderApplicationStatus,
  type ProviderApplication,
  type ProviderApplicationStatus,
} from '../../services/providerApplications'

const statusLabels: Record<ProviderApplicationStatus, string> = {
  approved: 'Approved',
  new: 'New',
  'not-a-fit': 'Not a fit',
  reviewing: 'Reviewing',
}

export function InternalProviderPartnersPage() {
  const [applications, setApplications] = useState<ProviderApplication[]>([])

  useEffect(() => {
    document.title = 'Provider Partners | CasaMia Operations'
    setApplications(loadProviderApplications())
  }, [])

  const stats = useMemo(
    () => ({
      approved: applications.filter((application) => application.status === 'approved').length,
      new: applications.filter((application) => application.status === 'new').length,
      reviewing: applications.filter((application) => application.status === 'reviewing').length,
    }),
    [applications],
  )

  function updateStatus(id: string, status: ProviderApplicationStatus) {
    setApplications(updateProviderApplicationStatus(id, status))
  }

  return (
    <InternalLayout
      title="Provider partners"
      subtitle="Review self-registered installers, accessibility specialists and smart-safety providers by city coverage and trade fit."
      actions={
        <Link className="btn btn-green" to="/provider-partners">
          Public application page
          <ExternalLink size={18} aria-hidden="true" />
        </Link>
      }
    >
      <p className="mb-5 rounded-lg bg-light-blue px-4 py-3 text-sm font-bold text-text-mid">
        {providerApplicationBackendConfigured()
          ? 'Provider application API is configured.'
          : 'Frontend-only inbox in local development. Production uses Vercel API routes with Supabase when configured.'}
      </p>

      <section className="mb-6 grid gap-5 md:grid-cols-3">
        <StatCard accent="green" icon={Building2} label="New applications" value={String(stats.new)} />
        <StatCard accent="navy" icon={Clock3} label="In review" value={String(stats.reviewing)} />
        <StatCard accent="blue" icon={CheckCircle2} label="Approved providers" value={String(stats.approved)} />
      </section>

      {applications.length > 0 ? (
        <section className="grid gap-5">
          {applications.map((application) => (
            <article className="rounded-lg border border-border bg-white p-5 shadow-soft" key={application.id}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">{application.id}</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-text-dark">{application.businessName}</h2>
                  <p className="mt-1 font-bold text-text-mid">
                    {application.contactName} · {application.email} · {application.phone}
                  </p>
                  {application.website ? (
                    <a className="mt-2 inline-block font-bold text-navy underline-offset-4 hover:underline" href={application.website}>
                      {application.website}
                    </a>
                  ) : null}
                </div>
                <span className="rounded-full bg-light-blue px-4 py-2 text-sm font-black text-navy">
                  {statusLabels[application.status]}
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <ProviderApplicationDetail title="Cities" items={application.cities} />
                <ProviderApplicationDetail title="Services" items={application.trades} />
                <div className="rounded-lg bg-pale-blue p-4">
                  <h3 className="text-sm font-black uppercase text-navy">Availability</h3>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-text-mid">
                    {application.availability || 'Not specified yet.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-light-blue p-4">
                <h3 className="text-sm font-black uppercase text-navy">Relevant experience</h3>
                <p className="mt-2 text-sm font-bold leading-relaxed text-text-mid">{application.experience}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button className="btn btn-white" type="button" onClick={() => updateStatus(application.id, 'reviewing')}>
                  Mark reviewing
                </button>
                <button className="btn btn-green" type="button" onClick={() => updateStatus(application.id, 'approved')}>
                  Approve
                </button>
                <button className="btn btn-white" type="button" onClick={() => updateStatus(application.id, 'not-a-fit')}>
                  <XCircle size={18} aria-hidden="true" />
                  Not a fit
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-white p-8 text-center shadow-soft">
          <Building2 className="mx-auto text-green" size={40} aria-hidden="true" />
          <h2 className="mt-4 font-display text-3xl font-bold text-text-dark">No provider applications yet</h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-mid">
            Share the public provider partnership page with installers and service businesses. Submitted applications
            will appear here for review.
          </p>
          <Link className="btn btn-green mt-6" to="/provider-partners">
            Open provider registration
          </Link>
        </section>
      )}
    </InternalLayout>
  )
}

function ProviderApplicationDetail({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-lg bg-pale-blue p-4">
      <h3 className="text-sm font-black uppercase text-navy">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-text-mid" key={item}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
