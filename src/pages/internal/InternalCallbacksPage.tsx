import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Inbox,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  RefreshCw,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { StatCard } from '../../components/internal/StatCard'
import {
  internalCallbackStatuses,
  loadInternalCallbackRequests,
  updateInternalCallbackStatus,
  type InternalCallbackRequest,
  type InternalCallbackStatus,
} from '../../services/internalCallbacks'

type StatusFilter = 'All' | InternalCallbackStatus

const timeWindowLabels: Record<string, string> = {
  '09:00-12:00': '09:00–12:00',
  '12:00-15:00': '12:00–15:00',
  '15:00-18:00': '15:00–18:00',
  '18:00-20:00': '18:00–20:00',
  flexible: 'Any time',
}

const statusClasses: Record<InternalCallbackStatus, string> = {
  Cancelled: 'border-slate-200 bg-slate-50 text-slate-600',
  Completed: 'border-green/25 bg-green/10 text-[#4f7f21]',
  Contacting: 'border-blue/25 bg-blue/10 text-navy',
  New: 'border-[#e4c678] bg-[#fff8df] text-[#8b6413]',
}

export function InternalCallbacksPage() {
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('All')
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<InternalCallbackRequest[]>([])
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(() => new Set())

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError('')

    const result = await loadInternalCallbackRequests()
    setAvailable(result.available)
    setRequests(result.requests)
    setError(result.message ?? '')
    setIsLoading(false)
  }, [])

  useEffect(() => {
    document.title = 'Callback Requests | CasaMia Operations'
    void refresh()
  }, [refresh])

  const counts = useMemo(() => ({
    completed: requests.filter((request) => request.status === 'Completed').length,
    contacting: requests.filter((request) => request.status === 'Contacting').length,
    new: requests.filter((request) => request.status === 'New').length,
  }), [requests])

  const visibleRequests = useMemo(
    () => filter === 'All' ? requests : requests.filter((request) => request.status === filter),
    [filter, requests],
  )

  async function changeStatus(request: InternalCallbackRequest, status: InternalCallbackStatus) {
    if (status === request.status) return

    setUpdatingIds((current) => new Set(current).add(request.id))
    setError('')

    try {
      const updated = await updateInternalCallbackStatus(request.id, status)
      setRequests((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'The callback status could not be updated.')
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current)
        next.delete(request.id)
        return next
      })
    }
  }

  return (
    <InternalLayout
      title="Callback requests"
      subtitle="Call people at the time they selected in the Home Safety Wizard, then keep the outcome up to date."
      actions={
        <button className="btn btn-white" disabled={isLoading} type="button" onClick={() => void refresh()}>
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
          Refresh inbox
        </button>
      }
    >
      {error && available ? (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {available ? (
        <>
          <section className="mb-6 grid gap-5 sm:grid-cols-3">
            <StatCard accent="gold" icon={Inbox} label="New requests" value={String(counts.new)} />
            <StatCard accent="blue" icon={PhoneCall} label="Being contacted" value={String(counts.contacting)} />
            <StatCard accent="green" icon={CheckCircle2} label="Completed" value={String(counts.completed)} />
          </section>

          <section className="rounded-lg border border-border bg-white p-4 shadow-soft sm:p-5">
            <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue">Live customer inbox</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-text-dark">Calls to make</h2>
                <p className="mt-2 text-sm font-bold text-text-muted">
                  {requests.length} {requests.length === 1 ? 'request' : 'requests'} received
                </p>
              </div>

              <div className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Filter callback requests">
                {(['All', ...internalCallbackStatuses] as StatusFilter[]).map((status) => (
                  <button
                    className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-black transition ${
                      filter === status
                        ? 'border-navy bg-navy text-white'
                        : 'border-border bg-white text-text-mid hover:border-blue hover:text-navy'
                    }`}
                    key={status}
                    aria-pressed={filter === status}
                    type="button"
                    onClick={() => setFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <LoadingState />
            ) : visibleRequests.length === 0 ? (
              <EmptyState filtered={filter !== 'All'} />
            ) : (
              <>
                <div className="mt-5 grid gap-4 lg:hidden">
                  {visibleRequests.map((request) => (
                    <CallbackCard
                      key={request.id}
                      request={request}
                      updating={updatingIds.has(request.id)}
                      onStatusChange={changeStatus}
                    />
                  ))}
                </div>

                <div className="mt-5 hidden overflow-hidden rounded-lg border border-border lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                      <thead className="bg-light-blue text-xs font-black uppercase tracking-wide text-navy">
                        <tr>
                          <th className="px-5 py-4">Customer</th>
                          <th className="px-5 py-4">Preferred callback</th>
                          <th className="px-5 py-4">Request details</th>
                          <th className="px-5 py-4">Received</th>
                          <th className="px-5 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {visibleRequests.map((request) => (
                          <CallbackRow
                            key={request.id}
                            request={request}
                            updating={updatingIds.has(request.id)}
                            onStatusChange={changeStatus}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </section>
        </>
      ) : !isLoading ? (
        <UnavailableState message={error} onRetry={() => void refresh()} />
      ) : (
        <LoadingState />
      )}
    </InternalLayout>
  )
}

function CallbackCard({
  onStatusChange,
  request,
  updating,
}: {
  onStatusChange: (request: InternalCallbackRequest, status: InternalCallbackStatus) => void
  request: InternalCallbackRequest
  updating: boolean
}) {
  return (
    <article className="rounded-lg border border-border bg-pale-blue/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-text-dark">{request.name || 'Name not provided'}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-wide text-text-muted">
            {request.reference || 'No reference'}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <ContactLinks request={request} />

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-border bg-white p-4">
        <Detail label="Preferred day" value={formatCallbackDate(request.preferredCallbackDate)} />
        <Detail label="Time" value={formatTimeWindow(request.preferredTimeWindow)} />
        <Detail className="col-span-2" label="City / area" value={request.city || 'Not provided'} />
      </div>

      {request.note ? (
        <div className="mt-3 rounded-lg bg-white p-4">
          <p className="text-xs font-black uppercase tracking-wide text-text-muted">Customer note</p>
          <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-text-mid">{request.note}</p>
        </div>
      ) : null}

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-xs font-bold text-text-muted">Received {formatSubmittedAt(request.submittedAt)}</p>
        <StatusSelect request={request} updating={updating} onStatusChange={onStatusChange} />
      </div>
    </article>
  )
}

function CallbackRow({
  onStatusChange,
  request,
  updating,
}: {
  onStatusChange: (request: InternalCallbackRequest, status: InternalCallbackStatus) => void
  request: InternalCallbackRequest
  updating: boolean
}) {
  return (
    <tr className="align-top transition hover:bg-pale-blue/35">
      <td className="px-5 py-5">
        <p className="font-black text-text-dark">{request.name || 'Name not provided'}</p>
        <ContactLinks request={request} compact />
      </td>
      <td className="px-5 py-5">
        <p className="inline-flex items-center gap-2 font-black text-navy">
          <CalendarDays size={17} aria-hidden="true" />
          {formatCallbackDate(request.preferredCallbackDate)}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-text-mid">
          <Clock3 size={16} aria-hidden="true" />
          {formatTimeWindow(request.preferredTimeWindow)}
        </p>
      </td>
      <td className="max-w-[300px] px-5 py-5">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-text-mid">
          <MapPin size={16} aria-hidden="true" />
          {request.city || 'City not provided'}
        </p>
        {request.note ? (
          <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-text-mid">
            {request.note}
          </p>
        ) : (
          <p className="mt-3 text-sm text-text-muted">No note added.</p>
        )}
        <p className="mt-3 text-xs font-black uppercase tracking-wide text-text-muted">
          {request.reference || 'No reference'}
        </p>
      </td>
      <td className="px-5 py-5 text-sm font-bold leading-relaxed text-text-mid">
        {formatSubmittedAt(request.submittedAt)}
      </td>
      <td className="px-5 py-5">
        <StatusBadge status={request.status} />
        <div className="mt-3">
          <StatusSelect request={request} updating={updating} onStatusChange={onStatusChange} />
        </div>
      </td>
    </tr>
  )
}

function ContactLinks({ compact = false, request }: { compact?: boolean; request: InternalCallbackRequest }) {
  return (
    <div className={`${compact ? 'mt-3' : 'mt-4'} grid gap-2`}>
      {request.phone ? (
        <a
          className="inline-flex min-h-9 items-center gap-2 font-black text-navy underline-offset-4 hover:text-blue hover:underline"
          href={`tel:${request.phone}`}
        >
          <Phone size={17} aria-hidden="true" />
          {request.phone}
        </a>
      ) : (
        <p className="inline-flex items-center gap-2 text-sm font-bold text-text-muted">
          <Phone size={17} aria-hidden="true" />
          No phone provided
        </p>
      )}
      {request.email ? (
        <a
          className="inline-flex min-h-8 items-center gap-2 break-all text-sm font-bold text-text-mid underline-offset-4 hover:text-navy hover:underline"
          href={`mailto:${request.email}`}
        >
          <Mail size={16} aria-hidden="true" />
          {request.email}
        </a>
      ) : null}
    </div>
  )
}

function StatusBadge({ status }: { status: InternalCallbackStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide ${statusClasses[status]}`}>
      {status}
    </span>
  )
}

function StatusSelect({
  onStatusChange,
  request,
  updating,
}: {
  onStatusChange: (request: InternalCallbackRequest, status: InternalCallbackStatus) => void
  request: InternalCallbackRequest
  updating: boolean
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-black uppercase tracking-wide text-text-muted">
        {updating ? 'Saving…' : 'Update status'}
      </span>
      <select
        className="min-h-10 min-w-[145px] rounded-lg border border-border bg-white px-3 text-sm font-black text-text-dark outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20"
        aria-label={`Status for ${request.name || request.reference || 'callback request'}`}
        disabled={updating}
        value={request.status}
        onChange={(event) => onStatusChange(request, event.target.value as InternalCallbackStatus)}
      >
        {internalCallbackStatuses.map((status) => <option key={status}>{status}</option>)}
      </select>
    </label>
  )
}

function Detail({ className = '', label, value }: { className?: string; label: string; value: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-black uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-black text-text-dark">{value}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-border bg-white p-8 text-center" role="status">
      <div>
        <RefreshCw className="mx-auto animate-spin text-blue" size={34} aria-hidden="true" />
        <p className="mt-4 font-black text-text-dark">Loading callback requests…</p>
      </div>
    </div>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-border bg-pale-blue/45 p-10 text-center">
      <PhoneCall className="mx-auto text-blue" size={42} aria-hidden="true" />
      <h3 className="mt-4 font-display text-3xl font-bold text-text-dark">
        {filtered ? 'No requests with this status' : 'No callback requests yet'}
      </h3>
      <p className="mx-auto mt-3 max-w-xl font-semibold leading-relaxed text-text-mid">
        {filtered
          ? 'Choose another filter to review the rest of the inbox.'
          : 'New “We call you” submissions from the Home Safety Wizard will appear here.'}
      </p>
    </div>
  )
}

function UnavailableState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="rounded-lg border border-border bg-white p-8 text-center shadow-soft">
      <PhoneCall className="mx-auto text-blue" size={44} aria-hidden="true" />
      <h2 className="mt-4 font-display text-3xl font-bold text-text-dark">Live callback inbox unavailable</h2>
      <p className="mx-auto mt-3 max-w-2xl font-semibold leading-relaxed text-text-mid">
        {message || 'Open the deployed internal panel with a backend admin session to view requests saved in Supabase.'}
      </p>
      <p className="mx-auto mt-2 max-w-2xl text-sm font-bold text-text-muted">
        This page never substitutes sample customer records.
      </p>
      <button className="btn btn-navy mt-6" type="button" onClick={onRetry}>
        <RefreshCw size={18} aria-hidden="true" />
        Try again
      </button>
    </section>
  )
}

function formatCallbackDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || 'Not provided'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function formatTimeWindow(value: string) {
  return timeWindowLabels[value] ?? (value || 'Not provided')
}

function formatSubmittedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'time unavailable'

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(date)
}
