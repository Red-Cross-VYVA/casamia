import { CalendarDays, CalendarPlus, CheckCircle2, Clock3, Download, ExternalLink, LoaderCircle, Pencil, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  getCustomerCalendarLinks, loadVisitAvailability, manageVisit, scheduleVisit, type VisitAppointment, type VisitAvailability,
} from '../../services/visitScheduling'
import { trackEvent } from '../../utils/analytics'

export function VisitScheduler({ language, sessionId }: { language: string; sessionId: string }) {
  const isSpanish = language.toLowerCase().startsWith('es')
  const [availability, setAvailability] = useState<VisitAvailability | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStartAt, setSelectedStartAt] = useState('')
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'error' | 'success'>('error')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState<'book' | 'reschedule'>('book')

  useEffect(() => {
    let active = true
    setLoading(true)
    loadVisitAvailability(sessionId)
      .then((result) => {
        if (!active) return
        setAvailability(result)
        setSelectedDate(result.dates[0]?.date || '')
      })
      .catch((error) => active && setMessage(error instanceof Error ? error.message : 'Availability could not be loaded.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [sessionId])

  const selectedDay = useMemo(
    () => availability?.dates.find((date) => date.date === selectedDate),
    [availability, selectedDate],
  )

  async function confirm() {
    if (!selectedStartAt) return
    setSubmitting(true)
    setMessage('')
    setMessageTone('error')
    try {
      const result = mode === 'reschedule'
        ? await manageVisit(sessionId, 'reschedule', selectedStartAt)
        : await scheduleVisit(sessionId, selectedStartAt)
      trackEvent(mode === 'reschedule' ? 'appointment_rescheduled' : 'appointment_scheduled', { language })
      const refreshed = await loadVisitAvailability(sessionId).catch(() => null)
      setAvailability(refreshed || ((current) => current ? { ...current, appointment: result.appointment } : current))
      setMode('book')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The visit could not be scheduled.')
      const refreshed = await loadVisitAvailability(sessionId).catch(() => null)
      if (refreshed) {
        setAvailability(refreshed)
        setSelectedStartAt('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function cancel() {
    if (!window.confirm(copy.cancelConfirm)) return
    setSubmitting(true)
    setMessage('')
    setMessageTone('error')
    try {
      await manageVisit(sessionId, 'cancel')
      const refreshed = await loadVisitAvailability(sessionId)
      setAvailability(refreshed)
      setSelectedDate(refreshed.dates[0]?.date || '')
      setSelectedStartAt('')
      setMessageTone('success')
      setMessage(copy.cancelled)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.changeFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const copy = isSpanish ? {
    title: 'Elige la fecha y hora de tu visita', body: 'Selecciona un horario disponible. Todas las horas se muestran en horario de Madrid.',
    date: 'Fecha', time: 'Hora', confirm: 'Confirmar visita', loading: 'Buscando horarios disponibles...',
    empty: 'No hay horarios disponibles en este momento. Escríbenos a hola@casamia.com.es para que podamos ayudarte.',
    confirmed: 'Tu visita está confirmada', confirmation: 'Te hemos enviado los detalles por correo electrónico.',
    reschedule: 'Cambiar fecha', rescheduleTitle: 'Elige una nueva fecha y hora', cancel: 'Cancelar visita', cancelConfirm: '¿Cancelar esta visita? El horario quedará libre y el reembolso no es automático.',
    cancelled: 'La visita se ha cancelado. Puedes elegir otra fecha con el pago ya realizado.', changeFailed: 'No hemos podido cambiar la visita.', back: 'Mantener fecha actual',
    google: 'Google Calendar', outlook: 'Outlook', download: 'Descargar .ics',
  } : {
    title: 'Choose your visit date and time', body: 'Select an available appointment. All times are shown in Madrid time.',
    date: 'Date', time: 'Time', confirm: 'Confirm visit', loading: 'Finding available appointments...',
    empty: 'No appointments are currently available. Email hola@casamia.com.es so we can help.',
    confirmed: 'Your visit is confirmed', confirmation: 'We have emailed the appointment details to you.',
    reschedule: 'Change date', rescheduleTitle: 'Choose a new date and time', cancel: 'Cancel visit', cancelConfirm: 'Cancel this visit? The time will be released and refunds are not automatic.',
    cancelled: 'The visit has been cancelled. You can choose another date using the payment already made.', changeFailed: 'We could not change the visit.', back: 'Keep current date',
    google: 'Google Calendar', outlook: 'Outlook', download: 'Download .ics',
  }

  if (loading) return <SchedulerShell><LoaderCircle className="animate-spin text-blue" size={26} /><p className="font-bold text-text-mid">{copy.loading}</p></SchedulerShell>
  if (availability?.appointment && mode !== 'reschedule') return <AppointmentConfirmation appointment={availability.appointment} copy={copy} language={language} sessionId={sessionId} submitting={submitting} onCancel={() => void cancel()} onReschedule={() => { setMode('reschedule'); setMessage(''); setSelectedStartAt('') }} />

  return (
    <section className="mx-auto mt-5 max-w-5xl rounded-lg border border-blue/25 bg-white p-5 shadow-soft md:p-7" aria-labelledby="visit-scheduler-title">
      <div className="flex items-start gap-3">
        <CalendarDays className="mt-1 shrink-0 text-blue" size={26} aria-hidden="true" />
        <div><h2 id="visit-scheduler-title" className="font-display text-2xl font-bold text-text-dark">{mode === 'reschedule' ? copy.rescheduleTitle : copy.title}</h2><p className="mt-1 text-sm font-bold text-text-muted">{copy.body}</p></div>
      </div>
      {availability?.dates.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-black text-navy">{copy.date}
            <select className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 text-base font-bold" value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setSelectedStartAt('') }}>
              {availability.dates.map((date) => <option key={date.date} value={date.date}>{formatDate(date.date, language)}</option>)}
            </select>
          </label>
          <fieldset><legend className="text-sm font-black text-navy">{copy.time}</legend><div className="mt-2 grid grid-cols-3 gap-2">
            {selectedDay?.slots.map((slot) => <button key={slot.startAt} className={`min-h-12 rounded-lg border px-3 py-2 font-black ${selectedStartAt === slot.startAt ? 'border-navy bg-navy text-white' : 'border-border bg-pale-blue text-navy hover:border-blue'}`} type="button" onClick={() => setSelectedStartAt(slot.startAt)}>{slot.time}</button>)}
          </div></fieldset>
        </div>
      ) : <p className="mt-5 rounded-lg bg-pale-blue p-4 font-bold text-text-mid">{copy.empty}</p>}
      {message ? <p className={`mt-4 rounded-lg p-3 text-sm font-bold ${messageTone === 'success' ? 'bg-pale-green text-navy' : 'bg-red-50 text-red-700'}`} role={messageTone === 'success' ? 'status' : 'alert'}>{message}</p> : null}
      {availability?.dates.length ? <div className="mt-6 flex flex-wrap justify-end gap-3">{mode === 'reschedule' ? <button className="btn btn-white" disabled={submitting} type="button" onClick={() => setMode('book')}><X size={18} />{copy.back}</button> : null}<button className="btn btn-green" disabled={!selectedStartAt || submitting} type="button" onClick={() => void confirm()}>{submitting ? <LoaderCircle className="animate-spin" size={18} /> : <Clock3 size={18} />}{mode === 'reschedule' ? copy.reschedule : copy.confirm}</button></div> : null}
    </section>
  )
}

function SchedulerShell({ children }: { children: ReactNode }) { return <div className="mx-auto mt-5 flex max-w-5xl items-center gap-3 rounded-lg border border-border bg-white p-5 shadow-soft" role="status">{children}</div> }
function AppointmentConfirmation({ appointment, copy, language, onCancel, onReschedule, sessionId, submitting }: { appointment: VisitAppointment; copy: Record<string, string>; language: string; onCancel: () => void; onReschedule: () => void; sessionId: string; submitting: boolean }) {
  const calendar = getCustomerCalendarLinks(appointment, sessionId)
  return <div className="mx-auto mt-5 max-w-5xl rounded-lg border border-green/30 bg-white p-5 shadow-soft md:p-7" role="status"><div className="flex items-start gap-3"><CheckCircle2 className="shrink-0 text-green" size={30} /><div><h2 className="font-display text-2xl font-bold text-text-dark">{copy.confirmed}</h2><p className="mt-1 font-black text-navy">{formatAppointment(appointment.startAt, language)}</p><p className="mt-1 text-sm font-bold text-text-muted">{copy.confirmation}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><a className="btn btn-white" href={calendar.google} rel="noreferrer" target="_blank"><CalendarPlus size={17} />{copy.google}<ExternalLink size={14} /></a><a className="btn btn-white" href={calendar.outlook} rel="noreferrer" target="_blank"><CalendarPlus size={17} />{copy.outlook}<ExternalLink size={14} /></a><a className="btn btn-white" href={calendar.ics}><Download size={17} />{copy.download}</a></div><div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-5"><button className="btn btn-green" disabled={submitting} type="button" onClick={onReschedule}><Pencil size={17} />{copy.reschedule}</button><button className="btn btn-white text-red-700" disabled={submitting} type="button" onClick={onCancel}><X size={17} />{copy.cancel}</button></div></div>
}
function formatDate(date: string, language: string) { return new Intl.DateTimeFormat(language, { dateStyle: 'full', timeZone: 'Europe/Madrid' }).format(new Date(`${date}T12:00:00Z`)) }
function formatAppointment(startAt: string, language: string) {
  return new Intl.DateTimeFormat(language, {
    day: 'numeric', hour: '2-digit', minute: '2-digit', month: 'long',
    timeZone: 'Europe/Madrid', weekday: 'long', year: 'numeric',
  }).format(new Date(startAt))
}
