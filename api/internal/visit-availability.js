import {
  deleteSupabaseRows, insertSupabaseRow, readJsonBody, requireInternalApiKey, selectSupabaseRows, sendJson,
} from '../_lib/supabase.js'
import { createVisitSlots, findVisitSlot, groupAvailableVisitSlots } from '../_lib/visit-scheduling.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'OPTIONS') { response.status(204).end(); return }
  if (!requireInternalApiKey(request, response)) return

  if (request.method === 'GET') return listAvailability(response)
  if (request.method !== 'POST') return sendJson(response, 405, { message: 'Method not allowed.' })

  try {
    const body = await readJsonBody(request)
    const slot = findVisitSlot(body.startAt)
    if (!slot) return sendJson(response, 400, { message: 'Choose a valid visit slot.' })

    if (body.action === 'unblock') {
      const result = await deleteSupabaseRows('assessment_requests', `id=eq.${encodeURIComponent(slot.id)}&type=eq.visit_slot_block`)
      if (!result.ok) return sendJson(response, result.status, result.body)
      return listAvailability(response)
    }
    if (body.action !== 'block') return sendJson(response, 400, { message: 'Choose block or unblock.' })

    const result = await insertSupabaseRow('assessment_requests', {
      id: slot.id, type: 'visit_slot_block', status: 'Blocked', preferred_assessment_date: slot.startAt,
      source: 'visit-scheduler', payload_json: { blockedAt: new Date().toISOString(), slot },
    })
    if (!result.ok) return sendJson(response, 409, { message: 'This slot is already booked or blocked.' })
    return listAvailability(response)
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid request.' })
  }
}

async function listAvailability(response) {
  const result = await selectSupabaseRows('assessment_requests', 'type=in.(visit_slot_reservation,visit_slot_block)&select=id,type,preferred_assessment_date,payload_json&limit=1000')
  if (!result.ok) return sendJson(response, result.status, result.body)
  const records = Array.isArray(result.body) ? result.body : []
  const occupied = new Set(records.map((record) => record.id))
  sendJson(response, 200, {
    blocked: records.filter((record) => record.type === 'visit_slot_block').map((record) => record.payload_json?.slot).filter(Boolean),
    booked: records.filter((record) => record.type === 'visit_slot_reservation').map((record) => record.payload_json?.slot).filter(Boolean),
    dates: groupAvailableVisitSlots(createVisitSlots(), occupied),
  })
}
