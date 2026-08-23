import {
  CalendarClock,
  Check,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { StatCard } from '../../components/internal/StatCard'
import {
  leadStatuses,
  loadInternalLeads,
  updateInternalLead,
  type Lead,
  type LeadChanges,
  type LeadStatus,
} from '../../services/internalLeads'

type StatusFilter = 'All' | LeadStatus

const statusClasses: Record<LeadStatus, string> = {
  Contacted: 'border-blue/25 bg-blue/10 text-blue',
  Lost: 'border-red-200 bg-red-50 text-red-700',
  New: 'border-gold/40 bg-gold/15 text-[#80540b]',
  'Proposal sent': 'border-navy/20 bg-light-blue text-navy',
  'Visit booked': 'border-sky/25 bg-sky/10 text-[#08709a]',
  Won: 'border-green/30 bg-green/10 text-[#477a16]',
}

export function InternalLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedKey, setSelectedKey] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('All')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await loadInternalLeads()
      setLeads(result.leads)
      setSelectedKey((current) => current || leadKey(result.leads[0]))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The lead pipeline could not be loaded.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Lead Pipeline | CasaMia Operations'
    void refresh()
  }, [refresh])

  const visibleLeads = useMemo(() => {
    const search = query.trim().toLowerCase()
    return leads.filter((lead) => {
      const matchesStatus = filter === 'All' || lead.status === filter
      const matchesSearch = !search || [lead.name, lead.email, lead.phone, lead.city, lead.assignedPartnerEmail]
        .some((value) => value.toLowerCase().includes(search))
      return matchesStatus && matchesSearch
    })
  }, [filter, leads, query])

  const selectedLead = leads.find((lead) => leadKey(lead) === selectedKey) ?? visibleLeads[0]
  const dueCount = leads.filter((lead) => isFollowUpDue(lead.followUpAt) && !['Won', 'Lost'].includes(lead.status)).length

  function handleSaved(updated: Lead) {
    setLeads((current) => current.map((lead) => lead.id === updated.id ? updated : lead))
  }

  return (
    <InternalLayout
      title="Lead pipeline"
      subtitle="Manage every callback and assessment enquiry from first contact through booking, proposal, and outcome."
      actions={
        <button className="btn btn-white" disabled={isLoading} type="button" onClick={() => void refresh()}>
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
          Refresh
        </button>
      }
    >
      {error ? <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700" role="alert">{error}</p> : null}

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard accent="gold" icon={UsersRound} label="Open leads" value={String(leads.filter((lead) => !['Won', 'Lost'].includes(lead.status)).length)} />
        <StatCard accent="blue" icon={CalendarClock} label="Follow-ups due" value={String(dueCount)} />
        <StatCard accent="green" icon={UserRoundCheck} label="Won" value={String(leads.filter((lead) => lead.status === 'Won').length)} />
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
        <div className="grid gap-4 border-b border-border p-4 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-center lg:p-5">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} aria-hidden="true" />
            <span className="sr-only">Search leads</span>
            <input className="min-h-12 w-full rounded-lg border border-border bg-light-blue/30 pl-11 pr-4 font-bold outline-none focus:border-blue" placeholder="Search name, phone, area or partner" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter leads by status">
            {(['All', ...leadStatuses] as StatusFilter[]).map((status) => (
              <button className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-black ${filter === status ? 'border-navy bg-navy text-white' : 'border-border bg-white text-text-mid hover:border-blue'}`} key={status} aria-pressed={filter === status} type="button" onClick={() => setFilter(status)}>{status}</button>
            ))}
          </div>
        </div>

        <div className="grid min-h-[620px] lg:grid-cols-[minmax(360px,0.9fr)_minmax(440px,1.1fr)]">
          <div className="border-b border-border lg:border-b-0 lg:border-r">
            <div className="border-b border-border px-5 py-4 text-sm font-black text-text-muted">{visibleLeads.length} matching leads</div>
            <div className="max-h-[680px] overflow-y-auto">
              {visibleLeads.map((lead) => (
                <button className={`block w-full border-b border-border p-5 text-left transition ${leadKey(lead) === leadKey(selectedLead) ? 'bg-light-blue' : 'hover:bg-pale-blue/45'}`} key={leadKey(lead)} type="button" onClick={() => setSelectedKey(leadKey(lead))}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="truncate text-lg font-black text-text-dark">{lead.name || 'Name not provided'}</p><p className="mt-1 text-xs font-black uppercase text-text-muted">{lead.sourceLabel} · {formatDate(lead.submittedAt)}</p></div>
                    <StatusBadge status={lead.status} />
                  </div>
                  <p className="mt-3 truncate text-sm font-bold text-text-mid">{lead.city || lead.selectedPlan || 'No area provided'}</p>
                  {lead.assignedPartnerEmail ? <p className="mt-2 truncate text-xs font-black text-blue">Assigned to {lead.assignedPartnerEmail}</p> : null}
                  {lead.followUpAt ? <p className={`mt-2 text-xs font-black ${isFollowUpDue(lead.followUpAt) ? 'text-red-700' : 'text-text-muted'}`}>Follow up {formatDateTime(lead.followUpAt)}</p> : null}
                </button>
              ))}
              {!isLoading && !visibleLeads.length ? <p className="p-10 text-center font-bold text-text-muted">No leads match this view.</p> : null}
            </div>
          </div>
          {selectedLead ? <LeadEditor key={`${selectedLead.source}-${selectedLead.id}`} lead={selectedLead} onSaved={handleSaved} /> : <div className="grid place-items-center p-10 text-center font-bold text-text-muted">Select a lead to review it.</div>}
        </div>
      </section>
    </InternalLayout>
  )
}

function LeadEditor({ lead, onSaved }: { lead: Lead; onSaved: (lead: Lead) => void }) {
  const [form, setForm] = useState<LeadChanges>({ assignedPartnerEmail: lead.assignedPartnerEmail, followUpAt: toLocalDateTime(lead.followUpAt), notes: lead.notes, partnerNotes: lead.partnerNotes, status: lead.status })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function update(changes: Partial<LeadChanges>) { setForm((current) => ({ ...current, ...changes })) }

  async function save() {
    setSaving(true)
    setMessage('')
    try {
      const updated = await updateInternalLead(lead, { ...form, followUpAt: form.followUpAt ? new Date(form.followUpAt).toISOString() : '' })
      onSaved(updated)
      setMessage('Lead saved.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The lead could not be saved.')
    } finally { setSaving(false) }
  }

  const whatsappUrl = lead.phone ? `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${lead.name || ''}, this is CasaMia following up on your home safety enquiry.`)}` : ''

  return (
    <div className="p-5 lg:p-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-black uppercase tracking-wide text-blue">{lead.sourceLabel} lead</p><h2 className="mt-2 font-display text-3xl font-bold text-text-dark">{lead.name || 'Unnamed enquiry'}</h2><p className="mt-2 font-bold text-text-muted">Received {formatDateTime(lead.submittedAt)}</p></div>
        <StatusBadge status={form.status} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {lead.phone ? <a className="btn btn-white" href={`tel:${lead.phone}`}><Phone size={17} />Call</a> : null}
        {lead.email ? <a className="btn btn-white" href={`mailto:${lead.email}`}><Mail size={17} />Email</a> : null}
        {whatsappUrl ? <a className="btn btn-green" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} />WhatsApp</a> : null}
      </div>

      <dl className="mt-5 grid gap-4 rounded-lg bg-pale-blue/60 p-5 sm:grid-cols-2">
        <Detail label="Phone" value={lead.phone} /><Detail label="Email" value={lead.email} /><Detail label="Area" value={lead.city} /><Detail label="Preferred time" value={lead.preferredAt} /><Detail label="Selected plan" value={lead.selectedPlan} />
      </dl>
      {lead.message ? <div className="mt-5 rounded-lg border border-border p-5"><p className="text-xs font-black uppercase text-text-muted">Customer message</p><p className="mt-2 whitespace-pre-wrap font-semibold leading-relaxed">{lead.message}</p></div> : null}

      <div className="mt-6 grid gap-5">
        <label className="grid gap-2"><span className="text-xs font-black uppercase text-text-muted">Pipeline status</span><select className="min-h-12 rounded-lg border border-border bg-white px-4 font-black outline-none focus:border-blue" value={form.status} onChange={(event) => update({ status: event.target.value as LeadStatus })}>{leadStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="grid gap-2"><span className="text-xs font-black uppercase text-text-muted">Assigned partner email</span><input className="min-h-12 rounded-lg border border-border bg-white px-4 font-bold outline-none focus:border-blue" placeholder="partner@example.com" type="email" value={form.assignedPartnerEmail} onChange={(event) => update({ assignedPartnerEmail: event.target.value })} /></label>
        <label className="grid gap-2"><span className="text-xs font-black uppercase text-text-muted">Follow-up date and time</span><input className="min-h-12 rounded-lg border border-border bg-white px-4 font-bold outline-none focus:border-blue" type="datetime-local" value={form.followUpAt} onChange={(event) => update({ followUpAt: event.target.value })} /></label>
        <label className="grid gap-2"><span className="text-xs font-black uppercase text-text-muted">Internal notes</span><textarea className="min-h-32 resize-y rounded-lg border border-border bg-white p-4 font-semibold outline-none focus:border-blue" placeholder="Record calls, decisions and next steps" value={form.notes} onChange={(event) => update({ notes: event.target.value })} /></label>
        <label className="grid gap-2"><span className="text-xs font-black uppercase text-text-muted">Partner instructions</span><textarea className="min-h-24 resize-y rounded-lg border border-border bg-white p-4 font-semibold outline-none focus:border-blue" placeholder="Only this note is visible to the assigned partner" value={form.partnerNotes} onChange={(event) => update({ partnerNotes: event.target.value })} /></label>
      </div>
      <div className="mt-5 flex items-center gap-4"><button className="btn btn-navy" disabled={saving} type="button" onClick={() => void save()}><Check size={18} />{saving ? 'Saving...' : 'Save lead'}</button>{message ? <p className="text-sm font-bold text-text-muted" role="status">{message}</p> : null}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: LeadStatus }) { return <span className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-[11px] font-black uppercase ${statusClasses[status]}`}>{status}</span> }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-[11px] font-black uppercase text-text-muted">{label}</dt><dd className="mt-1 break-words text-sm font-black text-text-dark">{value || 'Not provided'}</dd></div> }
function isFollowUpDue(value: string) { return Boolean(value && Date.parse(value) <= Date.now()) }
function leadKey(lead?: Lead) { return lead ? `${lead.source}:${lead.id}` : '' }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date) }
function formatDateTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Not set' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(date) }
function toLocalDateTime(value: string) { if (!value) return ''; const date = new Date(value); if (Number.isNaN(date.getTime())) return ''; const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return local.toISOString().slice(0, 16) }
