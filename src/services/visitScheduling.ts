import { getPublicSiteApiBaseUrl, getPublicSiteJson, postPublicSiteJson } from './publicSiteApi.ts'
import { getInternalAuthHeaders } from './internalAuth.ts'

export type VisitSlot = { startAt: string; time: string }
export type VisitDate = { date: string; slots: VisitSlot[] }
export type VisitAppointment = { bookedAt: string; date: string; startAt: string; time: string; timeZone: string }
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
