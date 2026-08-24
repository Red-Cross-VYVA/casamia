import { createSupabaseRowIfAbsent, selectSupabaseRows, updateSupabaseRows } from './supabase.js'
import { createVisitSlotId } from './visit-scheduling.js'
import { sendVisitAppointmentEmail } from './visit-scheduling-email.js'

const reminderWindowStartMs = 18 * 60 * 60 * 1000
const reminderWindowEndMs = 42 * 60 * 60 * 1000

export async function listDueVisitReminders(now = new Date()) {
  const result = await selectSupabaseRows(
    'assessment_requests',
    'status=eq.Visit%20Scheduled&select=*&order=preferred_assessment_date.asc&limit=200',
  )
  if (!result.ok) return result
  return {
    ...result,
    body: (Array.isArray(result.body) ? result.body : []).filter((assessment) => isVisitReminderDue(assessment, now)),
  }
}

export function isVisitReminderDue(assessment, now = new Date()) {
  const appointment = assessment?.payload_json?.visitAppointment
  if (!appointment?.startAt || appointment.cancelledAt) return false
  if (appointment.reminder?.status === 'sent' && appointment.reminder?.startAt === appointment.startAt) return false
  const timeUntilVisit = Date.parse(appointment.startAt) - now.getTime()
  return Number.isFinite(timeUntilVisit)
    && timeUntilVisit >= reminderWindowStartMs
    && timeUntilVisit <= reminderWindowEndMs
}

export async function claimVisitReminder(assessment) {
  const appointment = assessment?.payload_json?.visitAppointment
  const reminderId = createVisitSlotId(`reminder:${assessment?.id}:${appointment?.startAt}`)
  const claim = await createSupabaseRowIfAbsent('assessment_requests', {
    id: reminderId,
    type: 'visit_reminder_delivery',
    status: 'Claimed',
    preferred_assessment_date: appointment?.startAt,
    source: 'visit-reminder-cron',
    payload_json: { assessmentId: assessment?.id, claimedAt: new Date().toISOString(), startAt: appointment?.startAt },
  })
  return { claimed: claim.ok && Array.isArray(claim.body) && claim.body.length > 0, result: claim }
}

export async function sendAndTrackVisitReminder({ assessment, request }) {
  const appointment = assessment?.payload_json?.visitAppointment
  const sessionId = assessment?.payload_json?.visitPayment?.sessionId || ''
  const delivery = await sendVisitAppointmentEmail({
    appointment,
    assessment,
    kind: 'reminder',
    request,
    sessionId,
  })
  const reminder = {
    attemptedAt: new Date().toISOString(),
    delivery,
    startAt: appointment.startAt,
    status: delivery.ok ? 'sent' : 'failed',
  }
  const payload = assessment.payload_json || {}
  const updated = await updateSupabaseRows('assessment_requests', {
    payload_json: { ...payload, visitAppointment: { ...appointment, reminder } },
  }, `id=eq.${encodeURIComponent(assessment.id)}&status=eq.Visit%20Scheduled&select=*`)
  const updatedAssessment = updated.ok && Array.isArray(updated.body) ? updated.body[0] : undefined
  return {
    appointment: updatedAssessment?.payload_json?.visitAppointment || { ...appointment, reminder },
    delivery,
    reminder,
    trackingOk: Boolean(updatedAssessment),
    updatedAssessment,
  }
}
