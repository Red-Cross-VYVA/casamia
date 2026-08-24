import { applyPublicCors, isAllowedPublicOrigin } from '../_lib/public-origin.js'
import {
  deleteSupabaseRows, insertSupabaseRow, readJsonBody, selectSupabaseRows, sendJson, updateSupabaseRows,
} from '../_lib/supabase.js'
import { StripeConfigurationError } from '../_lib/stripe.js'
import { verifyPaidAssessmentSession } from '../_lib/visit-scheduling-auth.js'
import { sendVisitScheduledEmail } from '../_lib/visit-scheduling-email.js'
import { findVisitSlot } from '../_lib/visit-scheduling.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'OPTIONS') {
    if (!applyPublicCors(request, response)) return sendJson(response, 403, { message: 'Origin not allowed.' })
    response.status(204).end()
    return
  }
  if (request.method !== 'POST') return sendJson(response, 405, { message: 'Method not allowed.' })
  if (!isAllowedPublicOrigin(request)) return sendJson(response, 403, { message: 'Origin not allowed.' })
  applyPublicCors(request, response)

  try {
    const body = await readJsonBody(request)
    const verified = await verifyPaidAssessmentSession(body.sessionId)
    if (verified.error) return sendJson(response, verified.status, { message: verified.error })
    const slot = findVisitSlot(body.startAt)
    if (!slot) return sendJson(response, 400, { message: 'Choose an available CasaMia visit time.' })

    const existingResult = await selectSupabaseRows(
      'assessment_requests',
      `id=eq.${encodeURIComponent(verified.assessmentId)}&select=*&limit=1`,
    )
    if (!existingResult.ok) return sendJson(response, 503, { message: 'The visit could not be scheduled.' })
    const assessment = Array.isArray(existingResult.body) ? existingResult.body[0] : undefined
    if (!assessment) return sendJson(response, 404, { message: 'The assessment request was not found.' })
    if (assessment.payload_json?.visitAppointment?.startAt) {
      return sendJson(response, 200, { appointment: assessment.payload_json.visitAppointment, alreadyScheduled: true })
    }

    const claimResult = await updateSupabaseRows('assessment_requests', {
      status: 'Visit scheduling',
      payload_json: {
        ...(object(assessment.payload_json)),
        visitSchedulingClaim: { claimedAt: new Date().toISOString(), sessionId: body.sessionId },
      },
    }, `id=eq.${encodeURIComponent(verified.assessmentId)}&status=in.(Visit%20paid,Visit%20payment%20pending)&select=*`)
    const claimed = claimResult.ok && Array.isArray(claimResult.body) ? claimResult.body[0] : undefined
    if (!claimed) return sendJson(response, 409, { message: 'This visit is already being scheduled. Refresh to see its status.' })

    const lock = await insertSupabaseRow('assessment_requests', {
      id: slot.id,
      type: 'visit_slot_reservation',
      status: 'Reserved',
      preferred_assessment_date: slot.startAt,
      source: 'visit-scheduler',
      payload_json: { assessmentId: verified.assessmentId, sessionId: body.sessionId, slot },
    })
    if (!lock.ok) {
      await restorePaidState(verified.assessmentId, claimed.payload_json)
      return sendJson(response, 409, { message: 'That time has just been taken. Please choose another available time.' })
    }

    const appointment = { bookedAt: new Date().toISOString(), date: slot.date, slotId: slot.id, startAt: slot.startAt, time: slot.time, timeZone: 'Europe/Madrid' }
    const finalPayload = { ...object(claimed.payload_json), visitAppointment: appointment }
    delete finalPayload.visitSchedulingClaim
    const saved = await updateSupabaseRows('assessment_requests', {
      preferred_assessment_date: slot.startAt,
      status: 'Visit Scheduled',
      payload_json: finalPayload,
    }, `id=eq.${encodeURIComponent(verified.assessmentId)}&status=eq.Visit%20scheduling&select=*`)
    const updated = saved.ok && Array.isArray(saved.body) ? saved.body[0] : undefined
    if (!updated) {
      await deleteSupabaseRows('assessment_requests', `id=eq.${encodeURIComponent(slot.id)}&type=eq.visit_slot_reservation`)
      await restorePaidState(verified.assessmentId, claimed.payload_json)
      return sendJson(response, 503, { message: 'The visit could not be scheduled. Please try again.' })
    }

    const email = await sendVisitScheduledEmail({ appointment, assessment: updated, request })
    await updateSupabaseRows('assessment_requests', {
      payload_json: { ...finalPayload, visitAppointment: { ...appointment, confirmationEmail: email } },
    }, `id=eq.${encodeURIComponent(verified.assessmentId)}&status=eq.Visit%20Scheduled&select=id`)

    sendJson(response, 200, { appointment })
  } catch (error) {
    const unavailable = error instanceof StripeConfigurationError
    if (!unavailable) console.error('Visit scheduling failed.', error)
    sendJson(response, unavailable ? 503 : 500, { message: unavailable ? 'Payment verification is temporarily unavailable.' : 'The visit could not be scheduled.' })
  }
}

async function restorePaidState(id, payload) {
  const nextPayload = object(payload)
  delete nextPayload.visitSchedulingClaim
  await updateSupabaseRows('assessment_requests', { status: 'Visit paid', payload_json: nextPayload }, `id=eq.${encodeURIComponent(id)}&status=eq.Visit%20scheduling&select=id`)
}

function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {} }
