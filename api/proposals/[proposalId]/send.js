import {
  getProposalRecordById,
  isProposalId,
  mapProposalRecord,
  updateProposalRecord,
} from '../../_lib/proposals.js'
import { requireInternalApiKey, sendJson } from '../../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (!requireInternalApiKey(request, response)) return
  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const proposalId = getParam(request, 'proposalId')
  if (!isProposalId(proposalId)) {
    sendJson(response, 400, { message: 'A valid proposal id is required.' })
    return
  }

  const current = await getProposalRecordById(proposalId)
  if (!current.ok) {
    sendJson(response, current.status, current.body)
    return
  }

  const proposal = mapProposalRecord(current.record)
  const events = Array.isArray(proposal.events) ? proposal.events : []
  const result = await updateProposalRecord(current.record, {
    acceptance_status: 'Sent',
    events: [...events, { at: new Date().toISOString(), type: 'sent' }],
    status: 'Sent',
  })
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
