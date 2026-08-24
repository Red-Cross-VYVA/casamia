import { applyPublicCors, getRequestHeader, isAllowedPublicOrigin } from '../_lib/public-origin.js'
import { selectSupabaseRows, sendJson } from '../_lib/supabase.js'
import { StripeConfigurationError } from '../_lib/stripe.js'
import { verifyPaidAssessmentSession } from '../_lib/visit-scheduling-auth.js'
import { createVisitSlots, groupAvailableVisitSlots, visitScheduleConfig } from '../_lib/visit-scheduling.js'
import { activeAppointment } from '../_lib/visit-appointments.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    if (!applyPublicCors(request, response)) return sendJson(response, 403, { message: 'Origin not allowed.' })
    response.status(204).end()
    return
  }
  if (request.method !== 'GET') return sendJson(response, 405, { message: 'Method not allowed.' })
  const hasOrigin = Boolean(getRequestHeader(request, 'origin'))
  if (hasOrigin && !isAllowedPublicOrigin(request)) return sendJson(response, 403, { message: 'Origin not allowed.' })
  if (hasOrigin) applyPublicCors(request, response)

  try {
    const verified = await verifyPaidAssessmentSession(queryValue(request, 'session_id'))
    if (verified.error) return sendJson(response, verified.status, { message: verified.error })

    const assessmentResult = await selectSupabaseRows(
      'assessment_requests',
      `id=eq.${encodeURIComponent(verified.assessmentId)}&select=id,status,payload_json&limit=1`,
    )
    if (!assessmentResult.ok) return sendJson(response, 503, { message: 'Visit availability is temporarily unavailable.' })
    const assessment = Array.isArray(assessmentResult.body) ? assessmentResult.body[0] : undefined
    if (!assessment) return sendJson(response, 404, { message: 'The assessment request was not found.' })

    const appointment = activeAppointment(assessment)

    const locks = await selectSupabaseRows(
      'assessment_requests',
      'type=in.(visit_slot_reservation,visit_slot_block)&select=id&limit=1000',
    )
    if (!locks.ok) return sendJson(response, 503, { message: 'Visit availability is temporarily unavailable.' })
    const occupied = new Set((Array.isArray(locks.body) ? locks.body : []).map((record) => record.id))

    sendJson(response, 200, {
      appointment,
      dates: groupAvailableVisitSlots(createVisitSlots(), occupied),
      timeZone: visitScheduleConfig.timeZone,
    })
  } catch (error) {
    const unavailable = error instanceof StripeConfigurationError
    sendJson(response, unavailable ? 503 : 400, {
      message: unavailable ? 'Payment verification is temporarily unavailable.' : 'Visit availability could not be loaded.',
    })
  }
}

function queryValue(request, key) {
  const value = request.query?.[key]
  return Array.isArray(value) ? String(value[0] || '') : String(value || '')
}
