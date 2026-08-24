import { readJsonBody, requireInternalApiKey, sendJson, updateSupabaseRows } from '../_lib/supabase.js'
import { cancelVisitAppointment, loadAssessmentAppointment, rescheduleVisitAppointment, activeAppointment } from '../_lib/visit-appointments.js'
import { renderVisitIcs } from '../_lib/visit-calendar.js'
import { sendVisitAppointmentEmail } from '../_lib/visit-scheduling-email.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'OPTIONS') { response.status(204).end(); return }
  if (!requireInternalApiKey(request, response)) return
  if (request.method !== 'POST') return sendJson(response, 405, { message: 'Method not allowed.' })

  try {
    const body = await readJsonBody(request)
    if (!isUuid(body.assessmentId)) return sendJson(response, 400, { message: 'A valid assessment id is required.' })
    if (body.action === 'calendar') {
      const loaded = await loadAssessmentAppointment(body.assessmentId)
      if (loaded.error) return sendJson(response, loaded.status, { message: loaded.error })
      const appointment = activeAppointment(loaded.assessment)
      if (!appointment) return sendJson(response, 404, { message: 'No confirmed appointment was found.' })
      return sendJson(response, 200, {
        content: renderVisitIcs({ appointment, assessment: loaded.assessment }),
        filename: `casamia-visit-${body.assessmentId.slice(0, 8)}.ics`,
      })
    }

    const result = body.action === 'reschedule'
      ? await rescheduleVisitAppointment({ actor: 'admin', assessmentId: body.assessmentId, startAt: body.startAt })
      : body.action === 'cancel'
        ? await cancelVisitAppointment({ actor: 'admin', assessmentId: body.assessmentId })
        : { error: 'Choose reschedule, cancel or calendar.', status: 400 }
    if (result.error) return sendJson(response, result.status, { message: result.error })

    const kind = body.action === 'cancel' ? 'cancelled' : 'rescheduled'
    const sessionId = result.assessment.payload_json?.visitPayment?.sessionId || ''
    const email = await sendVisitAppointmentEmail({
      appointment: result.appointment,
      assessment: result.assessment,
      kind,
      request,
      sessionId,
    })
    const payload = result.assessment.payload_json || {}
    await updateSupabaseRows('assessment_requests', {
      payload_json: { ...payload, visitAppointment: { ...result.appointment, lastNotification: email } },
    }, `id=eq.${encodeURIComponent(body.assessmentId)}&select=id`)
    sendJson(response, 200, { appointment: result.appointment, cancelled: body.action === 'cancel' })
  } catch (error) {
    console.error('Internal visit management failed.', error)
    sendJson(response, 500, { message: 'The appointment could not be changed.' })
  }
}

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
