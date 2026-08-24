import { getPublicSiteApiBaseUrl, getPublicSiteJson, postPublicSiteJson } from './publicSiteApi.ts'
import { getInternalAuthHeaders } from './internalAuth.ts'

export type VisitSlot = { startAt: string; time: string }
export type VisitDate = { date: string; slots: VisitSlot[] }
export type VisitAppointment = {
  bookedAt: string
  cancelledAt?: string
  date: string
  endAt: string
  rescheduledAt?: string
  slotId: string
  startAt: string
  time: string
  timeZone: string
}
export type VisitAvailability = { appointment: VisitAppointment | null; dates: VisitDate[]; timeZone: string }
export type InternalVisitAvailability = { blocked: Array<VisitSlot & { date: string }>; booked: Array<VisitSlot & { date: string }>; dates: VisitDate[] }

export function loadVisitAvailability(sessionId: string) {
  return getPublicSiteJson<VisitAvailability>(`/api/public/visit-availability?session_id=${encodeURIComponent(sessionId)}`, {
    headers: { Accept: 'application/json' },
  })
}

export function scheduleVisit(sessionId: string, startAt: string) {
  return postPublicSiteJson<{ appointment: VisitAppointment }>('/api/public/visit-schedule', { sessionId, startAt })
}

export function manageVisit(sessionId: string, action: 'cancel' | 'reschedule', startAt = '') {
  return postPublicSiteJson<{ appointment: VisitAppointment; cancelled?: boolean }>('/api/public/visit-manage', {
    action, sessionId, startAt,
  })
}

export function getCustomerCalendarLinks(appointment: VisitAppointment, sessionId: string) {
  return buildCalendarLinks(appointment, `${getPublicSiteApiBaseUrl()}/api/public/visit-calendar?session_id=${encodeURIComponent(sessionId)}`)
}

export async function loadInternalVisitAvailability() {
  return internalRequest<InternalVisitAvailability>('/api/internal/visit-availability')
}

export async function setInternalVisitSlotBlocked(startAt: string, blocked: boolean) {
  return internalRequest<InternalVisitAvailability>('/api/internal/visit-availability', {
    body: JSON.stringify({ action: blocked ? 'block' : 'unblock', startAt }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
}

export function manageInternalVisit(assessmentId: string, action: 'cancel' | 'reschedule', startAt = '') {
  return internalRequest<{ appointment: VisitAppointment; cancelled?: boolean }>('/api/internal/visit-appointments', {
    body: JSON.stringify({ action, assessmentId, startAt }), headers: { 'content-type': 'application/json' }, method: 'POST',
  })
}

export async function downloadInternalVisitCalendar(assessmentId: string) {
  const result = await internalRequest<{ content: string; filename: string }>('/api/internal/visit-appointments', {
    body: JSON.stringify({ action: 'calendar', assessmentId }), headers: { 'content-type': 'application/json' }, method: 'POST',
  })
  const url = URL.createObjectURL(new Blob([result.content], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = result.filename
  link.click()
  URL.revokeObjectURL(url)
}

export function getCalendarLinks(appointment: VisitAppointment) {
  return buildCalendarLinks(appointment, '')
}

function buildCalendarLinks(appointment: VisitAppointment, ics: string) {
  const endAt = appointment.endAt || new Date(new Date(appointment.startAt).getTime() + 90 * 60 * 1000).toISOString()
  const dates = `${compactUtc(appointment.startAt)}/${compactUtc(endAt)}`
  const details = 'CasaMia home safety assessment. Contact: hola@casamia.com.es.'
  const google = new URLSearchParams({ action: 'TEMPLATE', dates, details, text: 'CasaMia home safety visit' })
  const outlook = new URLSearchParams({
    body: details, enddt: endAt, path: ['', 'calendar', 'action', 'compose'].join('/'), rru: 'addevent',
    startdt: appointment.startAt, subject: 'CasaMia home safety visit',
  })
  return {
    google: `https://calendar.google.com/calendar/render?${google.toString()}`,
    ics,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${outlook.toString()}`,
  }
}

function compactUtc(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

async function internalRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${path}`, {
    ...init,
    headers: { ...getInternalAuthHeaders(), ...(init.headers ?? {}) },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(body.message || `Scheduling returned ${response.status}.`)
  }
  return response.json() as Promise<T>
}
