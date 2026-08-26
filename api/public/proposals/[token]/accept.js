import {
  getProposalRecordByToken,
  isPublicProposalToken,
  mapProposalRecord,
  mapPublicProposalRecord,
  updateProposalRecord,
} from '../../../_lib/proposals.js'
import { applyPublicCors } from '../../../_lib/public-origin.js'
import { readJsonBody, sendJson } from '../../../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  const corsAllowed = applyPublicCors(request, response)
  if (request.method === 'OPTIONS') {
    response.status(corsAllowed ? 204 : 403).end()
    return
  }
  if (!corsAllowed) {
    sendJson(response, 403, { message: 'This proposal request is not allowed.' })
    return
  }
  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const token = getParam(request, 'token')
  if (!isPublicProposalToken(token)) {
    sendJson(response, 404, { message: 'Proposal not found.' })
    return
  }

  const current = await getProposalRecordByToken(token)
  if (!current.ok) {
    sendJson(response, current.status, current.body)
    return
  }

  const body = await readJsonBody(request)
  const acceptedBy = typeof body.accepted_by === 'string' ? body.accepted_by.trim() : ''
  if (!acceptedBy) {
    sendJson(response, 400, { message: 'Please enter the name of the person accepting.' })
    return
  }

  const proposal = mapProposalRecord(current.record)
  if (proposal.status !== 'Sent' || proposal.acceptance_status !== 'Sent') {
    sendJson(response, 409, { message: 'This proposal is not ready for online acceptance yet.' })
    return
  }

  const events = Array.isArray(proposal.events) ? proposal.events : []
  const acceptedAt = new Date().toISOString()
  const result = await updateProposalRecord(current.record, {
    acceptance_date: acceptedAt.slice(0, 10),
    acceptance_status: 'Accepted',
    accepted_by: acceptedBy,
    events: [...events, { at: acceptedAt, type: 'accepted-public' }],
    status: 'Accepted',
  })
  if (!result.ok) {
    sendJson(response, result.status, result.body)
    return
  }
  sendJson(response, 200, mapPublicProposalRecord(result.record))
}

function getParam(request, name) {
  const value = request.query?.[name]
  return Array.isArray(value) ? value[0] : String(value ?? '')
}
