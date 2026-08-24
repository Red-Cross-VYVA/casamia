import { applyPublicCors, isAllowedPublicOrigin } from '../_lib/public-origin.js'
import { readJsonBody, sendJson, updateSupabaseRows } from '../_lib/supabase.js'
import { StripeConfigurationError } from '../_lib/stripe.js'
import { cancelVisitAppointment, loadAssessmentAppointment, rescheduleVisitAppointment } from '../_lib/visit-appointments.js'
import { verifyPaidAssessmentSession } from '../_lib/visit-scheduling-auth.js'
import { sendVisitAppointmentEmail } from '../_lib/visit-scheduling-email.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'OPTIONS') {
    if (!applyPublicCors(request, response)) return sendJson(response, 403, { message: 'Origin not allowed.' })
    response.status(204).end(); return
  }
  if (request.method !== 'POST') return sendJson(response, 405, { message: 'Method not allowed.' })
  if (!isAllowedPublicOrigin(request)) return sendJson(response, 403, { message: 'Origin not allowed.' })
  applyPublicCors(request, response)

  try {
    const body = await readJsonBody(request)
    const verified = await verifyPaidAssessmentSession(body.sessionId)
    if (verified.error) return sendJson(response, verified.status, { message: verified.error })
    const loaded = await loadAssessmentAppointment(verified.assessmentId)
    if (loaded.error) return sendJson(response, loaded.status, { message: loaded.error })
    const appointment = loaded.assessment.payload_json?.visitAppointment
    if (!appointment?.startAt || appointment.cancelledAt) return sendJson(response, 409, { message: 'There is no confirmed visit to change.' })
    if (Date.parse(appointment.startAt) - Date.now() < 24 * 60 * 60 * 1000) {
      return sendJson(response, 409, { message: 'Online changes close 24 hours before the visit. Contact hola@casamia.com.es for help.' })
    }

    const result = body.action === 'reschedule'
      ? await rescheduleVisitAppointment({ actor: 'customer', assessmentId: verified.assessmentId, startAt: body.startAt })
      : body.action === 'cancel'
        ? await cancelVisitAppointment({ actor: 'customer', assessmentId: verified.assessmentId, customerCanRebook: true })
        : { error: 'Choose reschedule or cancel.', status: 400 }
    if (result.error) return sendJson(response, result.status, { message: result.error })

    const kind = body.action === 'cancel' ? 'cancelled' : 'rescheduled'
    const email = await sendVisitAppointmentEmail({ appointment: result.appointment, assessment: result.assessment, kind, request, sessionId: body.sessionId })
    const payload = result.assessment.payload_json || {}
    await updateSupabaseRows('assessment_requests', {
      payload_json: { ...payload, visitAppointment: { ...result.appointment, lastNotification: email } },
    }, `id=eq.${encodeURIComponent(verified.assessmentId)}&select=id`)
    sendJson(response, 200, { appointment: result.appointment, cancelled: body.action === 'cancel' })
  } catch (error) {
    const unavailable = error instanceof StripeConfigurationError
    if (!unavailable) console.error('Public visit management failed.', error)
    sendJson(response, unavailable ? 503 : 500, { message: unavailable ? 'Payment verification is temporarily unavailable.' : 'The appointment could not be changed.' })
  }
}
