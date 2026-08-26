import {
  acknowledgeAgreementPublicRecord,
  getAgreementRecordByToken,
  isPublicAgreementToken,
  mapAgreementRecord,
  mapPublicAgreementRecord,
} from '../../../_lib/agreements.js'
import { readJsonBody, sendJson } from '../../../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const token = getParam(request, 'token')
  if (!isPublicAgreementToken(token)) {
    sendJson(response, 404, { message: 'Agreement not found.' })
    return
  }

  const current = await getAgreementRecordByToken(token)
  if (!current.ok) {
    sendJson(response, current.status, current.body)
    return
  }

  const assignment = mapAgreementRecord(current.record)
  if (assignment.status === 'expired' || assignment.status === 'revoked') {
    sendJson(response, 404, { message: 'Agreement link is no longer available.' })
    return
  }

  const body = await readJsonBody(request)
  const result = await acknowledgeAgreementPublicRecord(current.record, body.acceptedBy ?? body.accepted_by)
  if (!result.ok) {
    sendJson(response, result.status, result.body)
    return
  }

  sendJson(response, 200, mapPublicAgreementRecord(result.record))
}

function getParam(request, name) {
  const value = request.query?.[name]
  return Array.isArray(value) ? value[0] : String(value ?? '')
}
