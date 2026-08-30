import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { StatCard } from '../../components/internal/StatCard'
import {
  applyCustomerCrm,
  customerLifecycleStatuses,
  loadCustomerCrmRecords,
  updateCustomerCrmRecord,
  type CustomerCrmChanges,
  type CustomerCrmRecord,
  type ManagedCustomerRecord,
} from '../../services/customerCrm'
import { buildCustomerRecords, type CustomerAction, type CustomerRecord, type CustomerStage } from '../../services/customerTimeline'
import { loadInternalAssessmentRequests } from '../../services/internalAssessments'
import { loadInternalCallbackRequests } from '../../services/internalCallbacks'
import { loadInternalLeads } from '../../services/internalLeads'
import { loadInternalOrders } from '../../services/internalOrders'
import { loadProposalsWithFallback } from '../../services/proposalsApi'

type ViewFilter = 'All' | 'Needs action' | 'Visit' | 'Proposal' | 'Completed'

const stageClasses: Record<CustomerStage, string> = {
  Cancelled: 'border-red-200 bg-red-50 text-red-700',
  Completed: 'border-green/30 bg-green/10 text-[#477a16]',
  Contacting: 'border-blue/25 bg-blue/10 text-blue',
  'New enquiry': 'border-gold/40 bg-gold/15 text-[#80540b]',
  Proposal: 'border-navy/20 bg-light-blue text-navy',
  Report: 'border-sky/25 bg-sky/10 text-[#08709a]',
  Scheduled: 'border-green/30 bg-green/10 text-[#477a16]',
  Visit: 'border-sky/25 bg-sky/10 text-[#08709a]',
}

export function InternalCustomersPage() {
  const [baseCustomers, setBaseCustomers] = useState<CustomerRecord[]>([])
  const [crmRecords, setCrmRecords] = useState<CustomerCrmRecord[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [filter, setFilter] = useState<ViewFilter>('Needs action')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setMessages([])
    const [leads, assessments, callbacks, orders, proposals, crm] = await Promise.allSettled([
      loadInternalLeads(),
      loadInternalAssessmentRequests(),
      loadInternalCallbackRequests(),
      loadInternalOrders(),
      loadProposalsWithFallback(),
      loadCustomerCrmRecords(),
    ])

    const notices: string[] = []
    const leadItems = leads.status === 'fulfilled' ? leads.value.leads : []
    if (leads.status === 'rejected') notices.push(leads.reason instanceof Error ? leads.reason.message : 'Lead data is unavailable.')
    const assessmentResult = assessments.status === 'fulfilled' ? assessments.value : { available: false, requests: [] }
    const callbackResult = callbacks.status === 'fulfilled' ? callbacks.value : { available: false, requests: [] }
    const orderResult = orders.status === 'fulfilled' ? orders.value : { available: false, orders: [] }
    if ('message' in assessmentResult && assessmentResult.message) notices.push(assessmentResult.message)
    if ('message' in callbackResult && callbackResult.message) notices.push(callbackResult.message)
    if ('message' in orderResult && orderResult.message) notices.push(orderResult.message)

    const proposalResult = proposals.status === 'fulfilled' ? proposals.value : { proposals: [], source: 'local' as const }
    if ('error' in proposalResult && proposalResult.error) notices.push(proposalResult.error)
    const records = buildCustomerRecords({
      assessments: assessmentResult.requests,
      callbacks: callbackResult.requests,
      leads: leadItems,
      orders: orderResult.orders,
      proposals: proposalResult.source === 'backend' ? proposalResult.proposals : [],
    })
    if (crm.status === 'rejected') notices.push(crm.reason instanceof Error ? crm.reason.message : 'Customer operations data is unavailable.')
    setBaseCustomers(records)
    setCrmRecords(crm.status === 'fulfilled' ? crm.value.customers : [])
    setMessages(Array.from(new Set(notices)))
    const hashId = typeof window === 'undefined' ? '' : decodeURIComponent(window.location.hash.slice(1))
    setSelectedId((current) => records.some((record) => record.id === current)
      ? current
      : records.some((record) => record.id === hashId) ? hashId : records[0]?.id ?? '')
    setIsLoading(false)
  }, [])

  const customers = useMemo(() => {
    const records = new Map(crmRecords.map((record) => [record.customerKey, record]))
    return baseCustomers.map((customer) => applyCustomerCrm(customer, records.get(customer.id)))
  }, [baseCustomers, crmRecords])

  const saveCustomer = useCallback(async (customerKey: string, changes: CustomerCrmChanges) => {
    const saved = await updateCustomerCrmRecord(customerKey, changes)
    setCrmRecords((current) => [...current.filter((record) => record.customerKey !== customerKey), saved])
    return saved
  }, [])

  useEffect(() => {
    document.title = 'Customer Records | CasaMia Operations'
    void refresh()
  }, [refresh])

  const visibleCustomers = useMemo(() => {
    const search = query.trim().toLowerCase()
    return customers.filter((customer) => {
      const matchesSearch = !search || [customer.name, customer.email, customer.phone, customer.city, customer.plan]
        .some((value) => value.toLowerCase().includes(search))
      const matchesFilter = filter === 'All'
        || (filter === 'Needs action' && customer.actions.length > 0)
        || (filter === 'Completed' && customer.stage === 'Completed')
        || (filter === 'Visit' && ['Visit', 'Report', 'Scheduled'].includes(customer.stage))
        || (filter === 'Proposal' && customer.stage === 'Proposal')
      return matchesSearch && matchesFilter
    })
  }, [customers, filter, query])

  const selectedCustomer = customers.find((customer) => customer.id === selectedId) ?? visibleCustomers[0]
  const urgentActions = customers.flatMap((customer) => customer.actions).filter((action) => action.priority === 'urgent').length
  const openActions = customers.flatMap((customer) => customer.actions).length

  return (
    <InternalLayout
      title="Customer records"
      subtitle="A single operational history for every customer, with the next required action surfaced automatically."
      actions={<button className="btn btn-white" disabled={isLoading} type="button" onClick={() => void refresh()}><RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} aria-hidden="true" />Refresh</button>}
    >
      {messages.length ? <div className="mb-6 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-bold text-[#80540b]" role="status">Some sources could not be loaded: {messages.join(' ')}</div> : null}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard accent="blue" icon={UsersRound} label="Customers" value={String(customers.length)} />
        <StatCard accent="gold" icon={AlertTriangle} label="Urgent actions" value={String(urgentActions)} />
        <StatCard accent="blue" icon={ClipboardList} label="Open actions" value={String(openActions)} />
        <StatCard accent="green" icon={CheckCircle2} label="Completed" value={String(customers.filter((customer) => customer.stage === 'Completed').length)} />
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
        <div className="grid gap-4 border-b border-border p-4 xl:grid-cols-[minmax(260px,1fr)_auto] xl:items-center xl:p-5">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} aria-hidden="true" />
            <span className="sr-only">Search customers</span>
            <input className="min-h-12 w-full rounded-lg border border-border bg-light-blue/30 pl-11 pr-4 font-bold outline-none focus:border-blue" placeholder="Search name, phone, email, area or plan" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter customer records">
            {(['Needs action', 'All', 'Visit', 'Proposal', 'Completed'] as ViewFilter[]).map((value) => <button className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-black ${filter === value ? 'border-navy bg-navy text-white' : 'border-border bg-white text-text-mid hover:border-blue'}`} key={value} aria-pressed={filter === value} type="button" onClick={() => setFilter(value)}>{value}</button>)}
          </div>
        </div>

        <div className="grid min-h-[680px] xl:grid-cols-[minmax(340px,0.82fr)_minmax(520px,1.18fr)]">
          <div className="border-b border-border xl:border-b-0 xl:border-r">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 text-sm font-black text-text-muted"><span>{visibleCustomers.length} matching customers</span><span>{openActions} actions</span></div>
            <div className="max-h-[760px] overflow-y-auto">
              {visibleCustomers.map((customer) => <CustomerListItem customer={customer} key={customer.id} selected={customer.id === selectedCustomer?.id} onSelect={() => setSelectedId(customer.id)} />)}
              {!isLoading && !visibleCustomers.length ? <p className="p-10 text-center font-bold text-text-muted">No customers match this view.</p> : null}
              {isLoading ? <p className="p-10 text-center font-bold text-text-muted">Loading customer records...</p> : null}
            </div>
          </div>
          {selectedCustomer ? <CustomerDetail customer={selectedCustomer} onSave={saveCustomer} /> : <div className="grid place-items-center p-10 text-center font-bold text-text-muted"><div><UserRound className="mx-auto mb-3" size={28} /><p>Select a customer to review their history.</p></div></div>}
        </div>
      </section>
    </InternalLayout>
  )
}

function CustomerListItem({ customer, onSelect, selected }: { customer: ManagedCustomerRecord; onSelect: () => void; selected: boolean }) {
  const nextAction = customer.actions[0]
  return <button className={`block w-full border-b border-border p-5 text-left transition ${selected ? 'bg-light-blue' : 'hover:bg-pale-blue/45'}`} type="button" onClick={onSelect}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0"><p className="truncate text-lg font-black text-text-dark">{customer.name || 'Name not provided'}</p><p className="mt-1 truncate text-xs font-bold text-text-muted">{customer.email || customer.phone || 'No contact details'}</p></div>
      <StageBadge stage={customer.stage} />
    </div>
    {nextAction ? <div className={`mt-4 border-l-4 pl-3 ${nextAction.priority === 'urgent' ? 'border-red-500' : nextAction.priority === 'due' ? 'border-gold' : 'border-blue'}`}><p className="text-xs font-black uppercase text-text-muted">Next action</p><p className="mt-1 text-sm font-black text-text-dark">{nextAction.label}</p></div> : <p className="mt-4 text-sm font-bold text-green">No open action</p>}
    <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-text-muted"><span className="truncate">{customer.city || customer.plan || 'Customer record'}</span><span className="shrink-0">{formatDate(customer.latestAt)}</span></div>
  </button>
}

function CustomerDetail({ customer, onSave }: { customer: ManagedCustomerRecord; onSave: (customerKey: string, changes: CustomerCrmChanges) => Promise<CustomerCrmRecord> }) {
  const [form, setForm] = useState<CustomerCrmChanges>(() => crmChanges(customer.crm))
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm(crmChanges(customer.crm))
    setSaveMessage('')
  }, [customer.id, customer.crm])

  async function save() {
    setIsSaving(true)
    setSaveMessage('')
    try {
      await onSave(customer.id, { ...form, nextActionDueAt: toIsoDate(form.nextActionDueAt) })
      setSaveMessage('Customer operations updated.')
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Customer operations could not be updated.')
    } finally {
      setIsSaving(false)
    }
  }

  const whatsapp = customer.phone ? `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${customer.name || ''}, this is CasaMia following up on your home safety enquiry.`)}` : ''
  return <div className="p-5 lg:p-7">
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-xs font-black uppercase tracking-wide text-blue">Customer record</p><h2 className="mt-2 font-display text-3xl font-bold text-text-dark">{customer.name || 'Unnamed customer'}</h2><p className="mt-2 font-bold text-text-muted">Last activity {formatDateTime(customer.latestAt)}</p></div>
      <StageBadge stage={customer.stage} />
    </div>

    <div className="mt-5 flex flex-wrap gap-3">
      {customer.phone ? <a className="btn btn-white" href={`tel:${customer.phone}`}><Phone size={17} />Call</a> : null}
      {customer.email ? <a className="btn btn-white" href={`mailto:${customer.email}`}><Mail size={17} />Email</a> : null}
      {whatsapp ? <a className="btn btn-green" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} />WhatsApp</a> : null}
    </div>

    <dl className="mt-5 grid gap-4 bg-pale-blue/60 p-5 sm:grid-cols-2">
      <Detail label="Phone" value={customer.phone} /><Detail label="Email" value={customer.email} /><Detail label="Area" value={customer.city} /><Detail label="Plan" value={customer.plan} />
    </dl>

    <section className="mt-7 border-y border-border py-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-black uppercase text-blue">Internal operations</p><h3 className="mt-1 font-display text-2xl font-bold text-text-dark">Ownership and next step</h3></div>
        <button className="btn btn-navy" disabled={isSaving} type="button" onClick={() => void save()}>{isSaving ? 'Saving...' : 'Save changes'}</button>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Owner"><input className="form-input" maxLength={160} placeholder="Team member or role" value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} /></Field>
        <Field label="Owner email"><input className="form-input" maxLength={254} placeholder="name@company.com" type="email" value={form.ownerEmail} onChange={(event) => setForm({ ...form, ownerEmail: event.target.value })} /></Field>
        <Field label="Lifecycle status"><select className="form-input" value={form.lifecycleStatus} onChange={(event) => setForm({ ...form, lifecycleStatus: event.target.value as CustomerCrmChanges['lifecycleStatus'] })}>{customerLifecycleStatuses.map((status) => <option key={status}>{status}</option>)}</select></Field>
        <Field label="Next action"><input className="form-input" maxLength={500} placeholder="What needs to happen next?" value={form.nextAction} onChange={(event) => setForm({ ...form, nextAction: event.target.value })} /></Field>
        <Field label="Due date and time"><input className="form-input" type="datetime-local" value={form.nextActionDueAt} onChange={(event) => setForm({ ...form, nextActionDueAt: event.target.value })} /></Field>
        <div className="sm:col-span-2"><Field label="Internal notes"><textarea className="form-input min-h-28 resize-y" maxLength={8000} placeholder="Private operational context, calls and decisions" value={form.internalNotes} onChange={(event) => setForm({ ...form, internalNotes: event.target.value })} /></Field></div>
      </div>
      {saveMessage ? <p className={`mt-4 text-sm font-black ${saveMessage.includes('updated') ? 'text-green' : 'text-red-700'}`} role="status">{saveMessage}</p> : null}
    </section>

    <section className="mt-7 border-b border-border pb-7">
      <div className="flex items-center justify-between gap-3"><h3 className="font-display text-2xl font-bold text-text-dark">Action queue</h3><span className="text-xs font-black uppercase text-text-muted">{customer.actions.length} open</span></div>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {customer.actions.map((action) => <ActionRow action={action} key={action.id} />)}
        {!customer.actions.length ? <div className="flex items-center gap-3 py-5 font-bold text-green"><CheckCircle2 size={20} />No action is currently required.</div> : null}
      </div>
    </section>

    <section className="mt-7">
      <h3 className="font-display text-2xl font-bold text-text-dark">Customer timeline</h3>
      <ol className="mt-5 border-l-2 border-border pl-6">
        {customer.events.map((event) => <li className="relative pb-7 last:pb-0" key={event.id}><span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue shadow-[0_0_0_2px_#cfe0ec]" /><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-black text-text-dark">{event.title}</p><p className="mt-1 text-xs font-black uppercase text-blue">{event.status}</p></div><time className="text-xs font-bold text-text-muted">{formatDateTime(event.occurredAt)}</time></div><p className="mt-2 text-sm font-semibold leading-relaxed text-text-mid">{event.detail}</p><Link className="mt-2 inline-flex items-center gap-1 text-xs font-black text-blue hover:text-navy" to={event.href}>Open source <ArrowRight size={14} /></Link></li>)}
      </ol>
    </section>
  </div>
}

function ActionRow({ action }: { action: CustomerAction }) {
  const Icon = action.href.includes('proposal') ? FileText : CalendarClock
  return <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 gap-3"><span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md ${action.priority === 'urgent' ? 'bg-red-50 text-red-700' : action.priority === 'due' ? 'bg-gold/15 text-[#80540b]' : 'bg-light-blue text-blue'}`}><Icon size={18} /></span><div><p className="font-black text-text-dark">{action.label}</p><p className="mt-1 text-sm font-semibold text-text-muted">{action.detail}</p><p className="mt-1 text-xs font-black uppercase text-text-muted">{action.priority === 'urgent' ? 'Overdue or urgent' : action.priority === 'due' ? 'Due next' : `Due ${formatDate(action.dueAt)}`}</p></div></div><Link className="btn btn-white shrink-0" to={action.href}>Open <ArrowRight size={16} /></Link></div>
}

function StageBadge({ stage }: { stage: CustomerStage }) { return <span className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-[11px] font-black uppercase ${stageClasses[stage]}`}>{stage}</span> }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-[11px] font-black uppercase text-text-muted">{label}</dt><dd className="mt-1 break-words text-sm font-black text-text-dark">{value || 'Not provided'}</dd></div> }
function Field({ children, label }: { children: React.ReactNode; label: string }) { return <label className="grid gap-2 text-xs font-black uppercase text-text-muted"><span>{label}</span>{children}</label> }
function crmChanges(record: CustomerCrmRecord): CustomerCrmChanges { return { internalNotes: record.internalNotes, lifecycleStatus: record.lifecycleStatus, nextAction: record.nextAction, nextActionDueAt: fromIsoDate(record.nextActionDueAt), owner: record.owner, ownerEmail: record.ownerEmail } }
function fromIsoDate(value: string) { const date = new Date(value); if (!value || Number.isNaN(date.getTime())) return ''; const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return local.toISOString().slice(0, 16) }
function toIsoDate(value: string) { if (!value) return ''; const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toISOString() }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'No date' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date) }
function formatDateTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(date) }
