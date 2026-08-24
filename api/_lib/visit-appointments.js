import {
  deleteSupabaseRows, insertSupabaseRow, selectSupabaseRows, updateSupabaseRows,
} from './supabase.js'
import { getVisitEndAt } from './visit-calendar.js'
import { findVisitSlot } from './visit-scheduling.js'

export async function loadAssessmentAppointment(assessmentId) {
  const result = await selectSupabaseRows(
    'assessment_requests',
    `id=eq.${encodeURIComponent(assessmentId)}&select=*&limit=1`,
  )
  if (!result.ok) return { error: result.body?.message || 'The appointment could not be loaded.', status: result.status }
  const assessment = Array.isArray(result.body) ? result.body[0] : undefined
  if (!assessment) return { error: 'The assessment request was not found.', status: 404 }
  return { assessment }
}

export async function rescheduleVisitAppointment({ assessmentId, actor, startAt }) {
  const slot = findVisitSlot(startAt)
  if (!slot) return failure(400, 'Choose an available CasaMia visit time.')
  const loaded = await loadAssessmentAppointment(assessmentId)
  if (loaded.error) return loaded
  const assessment = loaded.assessment
  const current = activeAppointment(assessment)
  if (!current) return failure(409, 'There is no confirmed visit to reschedule.')
  if (current.slotId === slot.id) return { appointment: current, assessment, unchanged: true }

  const payload = object(assessment.payload_json)
  const claimed = await updateSupabaseRows('assessment_requests', {
    status: 'Visit rescheduling',
    payload_json: { ...payload, visitSchedulingClaim: { actor, claimedAt: new Date().toISOString(), previousSlotId: current.slotId } },
  }, `id=eq.${encodeURIComponent(assessmentId)}&status=eq.Visit%20Scheduled&select=*`)
  const claimedAssessment = claimed.ok && Array.isArray(claimed.body) ? claimed.body[0] : undefined
  if (!claimedAssessment) return failure(409, 'This appointment is already being changed. Refresh and try again.')

  const lock = await insertSupabaseRow('assessment_requests', {
    id: slot.id, type: 'visit_slot_reservation', status: 'Reserved', preferred_assessment_date: slot.startAt,
    source: 'visit-scheduler', payload_json: { assessmentId, reservedBy: actor, slot },
  })
  if (!lock.ok) {
    await restoreScheduledAssessment(assessmentId, payload)
    return failure(409, 'That time has just been taken. Please choose another available time.')
  }

  const changedAt = new Date().toISOString()
  const appointment = {
    bookedAt: text(current.bookedAt) || changedAt, date: slot.date, endAt: getVisitEndAt(slot),
    rescheduledAt: changedAt, rescheduledBy: actor, slotId: slot.id, startAt: slot.startAt,
    time: slot.time, timeZone: 'Europe/Madrid',
  }
  const history = [...array(payload.visitAppointmentHistory), { ...current, replacedAt: changedAt, replacedBy: actor }]
  const nextPayload = { ...payload, visitAppointment: appointment, visitAppointmentHistory: history }
  delete nextPayload.visitSchedulingClaim
  const saved = await updateSupabaseRows('assessment_requests', {
    preferred_assessment_date: slot.startAt, status: 'Visit Scheduled', payload_json: nextPayload,
  }, `id=eq.${encodeURIComponent(assessmentId)}&status=eq.Visit%20rescheduling&select=*`)
  const updated = saved.ok && Array.isArray(saved.body) ? saved.body[0] : undefined
  if (!updated) {
    await deleteSupabaseRows('assessment_requests', `id=eq.${encodeURIComponent(slot.id)}&type=eq.visit_slot_reservation`)
    await restoreScheduledAssessment(assessmentId, payload)
    return failure(503, 'The appointment could not be rescheduled. Please try again.')
  }

  await deleteSupabaseRows('assessment_requests', `id=eq.${encodeURIComponent(current.slotId)}&type=eq.visit_slot_reservation`)
  return { appointment, assessment: updated }
}

export async function cancelVisitAppointment({ assessmentId, actor, customerCanRebook = false }) {
  const loaded = await loadAssessmentAppointment(assessmentId)
  if (loaded.error) return loaded
  const assessment = loaded.assessment
  const current = activeAppointment(assessment)
  if (!current) return failure(409, 'There is no confirmed visit to cancel.')
  const cancelledAt = new Date().toISOString()
  const payload = object(assessment.payload_json)
  const cancelled = { ...current, cancelledAt, cancelledBy: actor }
  const nextPayload = {
    ...payload,
    visitAppointment: cancelled,
    visitAppointmentHistory: [...array(payload.visitAppointmentHistory), cancelled],
  }
  const saved = await updateSupabaseRows('assessment_requests', {
    preferred_assessment_date: '', status: customerCanRebook ? 'Visit paid' : 'Cancelled', payload_json: nextPayload,
  }, `id=eq.${encodeURIComponent(assessmentId)}&status=eq.Visit%20Scheduled&select=*`)
  const updated = saved.ok && Array.isArray(saved.body) ? saved.body[0] : undefined
  if (!updated) return failure(409, 'This appointment is already being changed. Refresh and try again.')
  await deleteSupabaseRows('assessment_requests', `id=eq.${encodeURIComponent(current.slotId)}&type=eq.visit_slot_reservation`)
  return { appointment: cancelled, assessment: updated }
}

export function activeAppointment(assessment) {
  const appointment = assessment?.payload_json?.visitAppointment
  return appointment?.startAt && !appointment?.cancelledAt ? appointment : null
}

function restoreScheduledAssessment(id, payload) {
  return updateSupabaseRows('assessment_requests', { status: 'Visit Scheduled', payload_json: payload }, `id=eq.${encodeURIComponent(id)}&status=eq.Visit%20rescheduling&select=id`)
}
function failure(status, error) { return { error, status } }
function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {} }
function array(value) { return Array.isArray(value) ? value : [] }
function text(value) { return typeof value === 'string' ? value.trim() : '' }
