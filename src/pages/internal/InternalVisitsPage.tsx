import { ArrowRight, Ban, CalendarDays, CalendarPlus, Clock3, Download, ExternalLink, Mail, RefreshCw, RotateCcw, X } from 'lucide-react'
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
  downloadInternalVisitCalendar,
  getCalendarLinks,
  manageInternalVisit,
  sendInternalVisitReminder,
  setInternalVisitSlotBlocked,
  type InternalVisitAvailability,
} from '../../services/visitScheduling'

export function InternalVisitsPage() {
  const [requests, setRequests] = useState<InternalAssessmentRequest[]>([])
  const [message, setMessage] = useState('Loading assessment requests...')
  const [isLoading, setIsLoading] = useState(true)
  const [availability, setAvailability] = useState<InternalVisitAvailability | null>(null)
  const [changingSlot, setChangingSlot] = useState('')
  const [managingVisit, setManagingVisit] = useState<Visit | null>(null)
  const [managementDate, setManagementDate] = useState('')
  const [managementStartAt, setManagementStartAt] = useState('')
  const [managementBusy, setManagementBusy] = useState(false)
  const [managementMessage, setManagementMessage] = useState('')

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
    appointment: request.appointment,
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
      if (visit.status === 'Visit Scheduled' && status === 'Cancelled') {
        await manageInternalVisit(visit.id, 'cancel')
        await refresh()
        setMessage('Visit cancelled, customer notified and time reopened.')
        return
      }
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

  function openManagement(visit: Visit) {
    setManagingVisit(visit)
    setManagementDate(availability?.dates[0]?.date || '')
    setManagementStartAt('')
    setManagementMessage('')
  }

  async function rescheduleManagedVisit() {
    if (!managingVisit || !managementStartAt) return
    setManagementBusy(true)
    setManagementMessage('')
    try {
      await manageInternalVisit(managingVisit.id, 'reschedule', managementStartAt)
      setManagingVisit(null)
      await refresh()
      setMessage('Visit rescheduled and the customer was notified.')
    } catch (error) {
      setManagementMessage(error instanceof Error ? error.message : 'The visit could not be rescheduled.')
    } finally { setManagementBusy(false) }
  }

  async function cancelManagedVisit() {
    if (!managingVisit || !window.confirm('Cancel this visit? The customer will be notified and the time will reopen.')) return
    setManagementBusy(true)
    setManagementMessage('')
    try {
      await manageInternalVisit(managingVisit.id, 'cancel')
      setManagingVisit(null)
      await refresh()
      setMessage('Visit cancelled, customer notified and time reopened.')
    } catch (error) {
      setManagementMessage(error instanceof Error ? error.message : 'The visit could not be cancelled.')
    } finally { setManagementBusy(false) }
  }

  async function remindManagedVisit() {
    if (!managingVisit) return
    setManagementBusy(true)
    setManagementMessage('')
    try {
      await sendInternalVisitReminder(managingVisit.id)
      setManagingVisit(null)
      await refresh()
      setMessage('Visit reminder sent and recorded.')
    } catch (error) {
      setManagementMessage(error instanceof Error ? error.message : 'The reminder could not be sent.')
    } finally { setManagementBusy(false) }
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
          <VisitTable visits={visits} statusOptions={internalAssessmentStatuses} onManage={openManagement} onStatusChange={changeStatus} />
        ) : (
          <div className="rounded-lg bg-pale-blue p-8 text-center text-base font-bold text-text-mid">
            {isLoading ? 'Loading requests...' : 'No assessment requests are available yet.'}
          </div>
        )}
      </section>
      {managingVisit?.appointment ? <VisitManagementDialog availability={availability} busy={managementBusy} date={managementDate} message={managementMessage} onCancel={() => void cancelManagedVisit()} onClose={() => setManagingVisit(null)} onDateChange={(date) => { setManagementDate(date); setManagementStartAt('') }} onDownload={() => void downloadInternalVisitCalendar(managingVisit.id).catch((error) => setManagementMessage(error instanceof Error ? error.message : 'Calendar download failed.'))} onRemind={() => void remindManagedVisit()} onReschedule={() => void rescheduleManagedVisit()} onSlotChange={setManagementStartAt} selectedStartAt={managementStartAt} visit={managingVisit} /> : null}
    </InternalLayout>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB')
}

function VisitManagementDialog({ availability, busy, date, message, onCancel, onClose, onDateChange, onDownload, onRemind, onReschedule, onSlotChange, selectedStartAt, visit }: { availability: InternalVisitAvailability | null; busy: boolean; date: string; message: string; onCancel: () => void; onClose: () => void; onDateChange: (date: string) => void; onDownload: () => void; onRemind: () => void; onReschedule: () => void; onSlotChange: (startAt: string) => void; selectedStartAt: string; visit: Visit }) {
  const day = availability?.dates.find((item) => item.date === date)
  const calendar = visit.appointment ? getCalendarLinks(visit.appointment) : null
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/60 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}><section aria-labelledby="visit-management-title" aria-modal="true" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl" role="dialog"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase text-blue">Appointment management</p><h2 id="visit-management-title" className="mt-1 font-display text-3xl font-bold text-text-dark">{visit.customerName}</h2><p className="mt-2 font-black text-navy">{formatAppointment(visit.appointment?.startAt || '')}</p><p className="mt-1 text-sm font-bold text-text-muted">{visit.area} · {visit.phone || visit.email}</p></div><button aria-label="Close" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-navy" onClick={onClose} type="button"><X size={20} /></button></div>{calendar ? <div className="mt-5 flex flex-wrap gap-2"><a className="btn btn-white" href={calendar.google} rel="noreferrer" target="_blank"><CalendarPlus size={17} />Google<ExternalLink size={14} /></a><a className="btn btn-white" href={calendar.outlook} rel="noreferrer" target="_blank"><CalendarPlus size={17} />Outlook<ExternalLink size={14} /></a><button className="btn btn-white" onClick={onDownload} type="button"><Download size={17} />Download .ics</button><button className="btn btn-white" disabled={busy} onClick={onRemind} type="button"><Mail size={17} />Send reminder now</button></div> : null}{visit.appointment?.reminder ? <p className={`mt-3 text-sm font-bold ${visit.appointment.reminder.status === 'sent' ? 'text-green' : 'text-red-700'}`}>{visit.appointment.reminder.status === 'sent' ? `Reminder sent ${formatAppointment(visit.appointment.reminder.attemptedAt)}` : 'The last reminder attempt failed. You can retry it now.'}</p> : <p className="mt-3 text-sm font-bold text-text-muted">The automatic reminder is pending.</p>}<div className="mt-6 border-t border-border pt-5"><h3 className="font-display text-xl font-bold text-text-dark">Reschedule</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-sm font-black text-navy">New date<select className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3" value={date} onChange={(event) => onDateChange(event.target.value)}>{availability?.dates.map((item) => <option key={item.date} value={item.date}>{formatVisitDate(item.date)}</option>)}</select></label><fieldset><legend className="text-sm font-black text-navy">New time</legend><div className="mt-2 grid grid-cols-3 gap-2">{day?.slots.map((slot) => <button className={`min-h-12 rounded-lg border px-3 font-black ${selectedStartAt === slot.startAt ? 'border-navy bg-navy text-white' : 'border-border bg-pale-blue text-navy'}`} key={slot.startAt} onClick={() => onSlotChange(slot.startAt)} type="button">{slot.time}</button>)}</div></fieldset></div><div className="mt-5 flex flex-wrap justify-between gap-3"><button className="btn btn-white text-red-700" disabled={busy} onClick={onCancel} type="button"><X size={17} />Cancel visit</button><button className="btn btn-green" disabled={busy || !selectedStartAt} onClick={onReschedule} type="button">{busy ? <RefreshCw className="animate-spin" size={17} /> : <CalendarDays size={17} />}Confirm new time</button></div>{message ? <p className="mt-4 text-sm font-bold text-red-700" role="alert">{message}</p> : null}</div></section></div>
}

function formatVisitDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', weekday: 'short' }).format(new Date(`${value}T12:00:00Z`))
}

function formatShortSlot(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', hour: '2-digit', minute: '2-digit', month: 'short', timeZone: 'Europe/Madrid' }).format(new Date(value))
}

function formatAppointment(value: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', hour: '2-digit', minute: '2-digit', month: 'long',
    timeZone: 'Europe/Madrid', weekday: 'long', year: 'numeric',
  }).format(new Date(value))
}
