import {
  listProposalRecords,
  mapProposalRecord,
  saveProposalRecord,
} from './_lib/proposals.js'
import {
  readJsonBody,
  requireInternalApiKey,
  sendJson,
} from './_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  if (!requireInternalApiKey(request, response)) return

  if (request.method === 'GET') {
    const result = await listProposalRecords()
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    sendJson(response, 200, (Array.isArray(result.body) ? result.body : []).map(mapProposalRecord))
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const result = await saveProposalRecord(await readJsonBody(request))
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }
    sendJson(response, 200, mapProposalRecord(result.record))
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid proposal.' })
  }
}
