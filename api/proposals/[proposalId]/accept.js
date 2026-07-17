import {
  getProposalRecordById,
  isProposalId,
  mapProposalRecord,
  updateProposalRecord,
} from '../../_lib/proposals.js'
import { readJsonBody, requireInternalApiKey, sendJson } from '../../_lib/supabase.js'

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

  const body = await readJsonBody(request)
  const proposal = mapProposalRecord(current.record)
  const events = Array.isArray(proposal.events) ? proposal.events : []
  const acceptedAt = new Date().toISOString()
  const result = await updateProposalRecord(current.record, {
    acceptance_date: acceptedAt.slice(0, 10),
    acceptance_status: 'Accepted',
    accepted_by: text(body.accepted_by) || proposal.customer_name,
    events: [...events, { at: acceptedAt, type: 'accepted-internal' }],
    status: 'Accepted',
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

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}
