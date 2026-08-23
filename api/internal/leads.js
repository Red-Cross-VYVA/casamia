import {
  leadSources,
  leadStatuses,
  listLeadRecords,
  updateLeadRecord,
} from '../_lib/leads.js'
import {
  readJsonBody,
  requireInternalApiKey,
  sendJson,
} from '../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }
  if (!requireInternalApiKey(request, response)) return

  if (request.method === 'GET') {
    const result = await listLeadRecords()
    sendJson(response, result.status, result.ok ? { leads: result.body } : result.body)
    return
  }

  if (request.method !== 'PATCH') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    if (!isUuid(body.id) || !leadSources.includes(body.source)) {
      sendJson(response, 400, { message: 'A valid lead id and source are required.' })
      return
    }
    if (!leadStatuses.includes(body.status)) {
      sendJson(response, 400, { message: 'Choose a valid lead status.' })
      return
    }
    if (!isOptionalEmail(body.assignedPartnerEmail)) {
      sendJson(response, 400, { message: 'Enter a valid partner email or leave it blank.' })
      return
    }

    const result = await updateLeadRecord(body.source, body.id, body)
    sendJson(response, result.status, result.ok ? { lead: result.body } : result.body)
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid lead update.' })
  }
}

function isOptionalEmail(value) {
  return !value || (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
}

function isUuid(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
