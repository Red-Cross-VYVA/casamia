import { ArrowRight, Ban, CalendarDays, Clock3, RefreshCw, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { VisitTable, type Visit } from '../../components/internal/VisitTable'
import {
  internalAssessmentStatuses,
  loadInternalAssessmentRequests,
  updateInternalAssessmentStatus,
  type InternalAssessmentRequest,
  type InternalAssessmentStatus,
} from '../../services/internalAssessments'
import {
  loadInternalVisitAvailability,
  setInternalVisitSlotBlocked,
  type InternalVisitAvailability,
} from '../../services/visitScheduling'

export function InternalVisitsPage() {
  const [requests, setRequests] = useState<InternalAssessmentRequest[]>([])
  const [message, setMessage] = useState('Loading assessment requests...')
  const [isLoading, setIsLoading] = useState(true)
  const [availability, setAvailability] = useState<InternalVisitAvailability | null>(null)
  const [changingSlot, setChangingSlot] = useState('')

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const [result, schedule] = await Promise.all([
      loadInternalAssessmentRequests(),
      loadInternalVisitAvailability().catch(() => null),
    ])
    setRequests(result.requests)
    setMessage(result.available ? 'Connected to Supabase assessment requests.' : result.message ?? 'Inbox unavailable.')
    setAvailability(schedule)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    document.title = 'Assessment Requests | CasaMia Operations'
    void refresh()
  }, [refresh])

  const visits = useMemo<Visit[]>(() => requests.map((request) => ({
    area: request.city,
    customerName: request.name,
    email: request.email,
    id: request.id,
    phone: request.phone,
    preferredTime: request.preferredDate || request.preferredContactMethod || formatDate(request.submittedAt),
    selectedPlan: request.selectedPlan || request.type || 'Safety review',
    status: request.status,
  })), [requests])

  async function changeStatus(visit: Visit, status: string) {
    try {
      const updated = await updateInternalAssessmentStatus(visit.id, status as InternalAssessmentStatus)
      setRequests((current) => current.map((request) => request.id === updated.id ? updated : request))
      setMessage('Assessment status saved to Supabase.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The assessment status could not be updated.')
    }
  }

  async function changeSlot(startAt: string, blocked: boolean) {
    setChangingSlot(startAt)
    try {
      setAvailability(await setInternalVisitSlotBlocked(startAt, blocked))
      setMessage(blocked ? 'Visit time blocked.' : 'Visit time reopened.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Availability could not be updated.')
    } finally {
      setChangingSlot('')
    }
  }

  return (
    <InternalLayout
      title="Assessment requests"
      subtitle="Live requests submitted through the CasaMia assessment forms and home-safety wizard."
      actions={
        <>
          <button className="btn btn-white" disabled={isLoading} type="button" onClick={() => void refresh()}>
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
            Refresh
          </button>
          <Link className="btn btn-green" to="/internal/inspection-report">
            Create Inspection Report
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </>
      }
    >
      <section className="mb-6 border-b border-border bg-white px-1 pb-6">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-1 shrink-0 text-blue" size={22} aria-hidden="true" />
          <div>
            <h2 className="font-display text-2xl font-bold text-text-dark">Visit availability</h2>
            <p className="mt-1 text-sm font-bold text-text-muted">Weekdays at 09:30, 12:30 and 16:00. Select an open time to block it.</p>
          </div>
        </div>
        {availability ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availability.dates.slice(0, 9).map((day) => (
                <div key={day.date} className="border-l-4 border-light-blue pl-3">
                  <p className="text-sm font-black text-navy">{formatVisitDate(day.date)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {day.slots.map((slot) => (
                      <button key={slot.startAt} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-pale-blue px-3 text-sm font-black text-navy hover:border-blue" disabled={changingSlot === slot.startAt} onClick={() => void changeSlot(slot.startAt, true)} title="Block this visit time" type="button">
                        {changingSlot === slot.startAt ? <RefreshCw className="animate-spin" size={14} /> : <Ban size={14} />}{slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-l border-border pl-5">
              <p className="text-sm font-black uppercase text-text-muted">Blocked times</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {availability.blocked.length ? availability.blocked.map((slot) => (
                  <button key={slot.startAt} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-black text-red-800" disabled={changingSlot === slot.startAt} onClick={() => void changeSlot(slot.startAt, false)} title="Reopen this visit time" type="button">
                    <RotateCcw size={14} />{formatShortSlot(slot.startAt)}
                  </button>
                )) : <p className="text-sm font-bold text-text-muted">No times are blocked.</p>}
              </div>
              <p className="mt-4 text-xs font-bold text-text-muted">{availability.booked.length} customer appointments reserved.</p>
            </div>
          </div>
        ) : <p className="mt-4 text-sm font-bold text-text-muted">Availability controls are loading or temporarily unavailable.</p>}
      </section>
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-blue">
              <CalendarDays size={18} aria-hidden="true" />
              Live intake
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-text-dark">Customer requests</h2>
            <p className="mt-2 text-sm font-bold text-text-muted">{message}</p>
          </div>
          <p className="rounded-full bg-light-blue px-4 py-2 text-sm font-extrabold text-navy">
            {visits.length} requests
          </p>
        </div>
        {visits.length ? (
          <VisitTable visits={visits} statusOptions={internalAssessmentStatuses} onStatusChange={changeStatus} />
        ) : (
          <div className="rounded-lg bg-pale-blue p-8 text-center text-base font-bold text-text-mid">
            {isLoading ? 'Loading requests...' : 'No assessment requests are available yet.'}
          </div>
        )}
      </section>
    </InternalLayout>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB')
}

function formatVisitDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', weekday: 'short' }).format(new Date(`${value}T12:00:00Z`))
}

function formatShortSlot(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', hour: '2-digit', minute: '2-digit', month: 'short', timeZone: 'Europe/Madrid' }).format(new Date(value))
}
