import { applyPublicCors, getRequestHeader, isAllowedPublicOrigin } from '../_lib/public-origin.js'
import { sendJson } from '../_lib/supabase.js'
import { loadAssessmentAppointment, activeAppointment } from '../_lib/visit-appointments.js'
import { renderVisitIcs } from '../_lib/visit-calendar.js'
import { verifyPaidAssessmentSession } from '../_lib/visit-scheduling-auth.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'private, max-age=300')
  if (request.method !== 'GET') return sendJson(response, 405, { message: 'Method not allowed.' })
  const hasOrigin = Boolean(getRequestHeader(request, 'origin'))
  if (hasOrigin && !isAllowedPublicOrigin(request)) return sendJson(response, 403, { message: 'Origin not allowed.' })
  if (hasOrigin) applyPublicCors(request, response)
  try {
    const sessionId = Array.isArray(request.query?.session_id) ? request.query.session_id[0] : request.query?.session_id
    const verified = await verifyPaidAssessmentSession(String(sessionId || ''))
    if (verified.error) return sendJson(response, verified.status, { message: verified.error })
    const loaded = await loadAssessmentAppointment(verified.assessmentId)
    if (loaded.error) return sendJson(response, loaded.status, { message: loaded.error })
    const appointment = activeAppointment(loaded.assessment)
    if (!appointment) return sendJson(response, 404, { message: 'No confirmed appointment was found.' })
    response.status(200)
    response.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    response.setHeader('Content-Disposition', 'attachment; filename="casamia-home-visit.ics"')
    response.end(renderVisitIcs({ appointment, assessment: loaded.assessment }))
  } catch {
    sendJson(response, 500, { message: 'The calendar file could not be created.' })
  }
}
