import {
  getProposalRecordById,
  isProposalId,
  mapProposalRecord,
} from '../_lib/proposals.js'
import { requireInternalApiKey, sendJson } from '../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (!requireInternalApiKey(request, response)) return
  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const proposalId = getParam(request, 'proposalId')
  if (!isProposalId(proposalId)) {
    sendJson(response, 400, { message: 'A valid proposal id is required.' })
    return
  }

  const result = await getProposalRecordById(proposalId)
  if (!result.ok) {
    sendJson(response, result.status, result.body)
    return
  }
  sendJson(response, 200, mapProposalRecord(result.record))
}

function getParam(request, name) {
  const value = request.query?.[name]
  return Array.isArray(value) ? value[0] : String(value ?? '')
}
