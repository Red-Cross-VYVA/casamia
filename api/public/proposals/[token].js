import {
  getProposalRecordByToken,
  isPublicProposalToken,
  mapProposalRecord,
} from '../../_lib/proposals.js'
import { sendJson } from '../../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const token = getParam(request, 'token')
  if (!isPublicProposalToken(token)) {
    sendJson(response, 404, { message: 'Proposal not found.' })
    return
  }

  const result = await getProposalRecordByToken(token)
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
