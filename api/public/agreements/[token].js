import {
  getAgreementRecordByToken,
  isPublicAgreementToken,
  mapAgreementRecord,
  recordAgreementPublicView,
} from '../../_lib/agreements.js'
import { sendJson } from '../../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'GET') {
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

  const viewed = await recordAgreementPublicView(current.record)
  if (!viewed.ok) {
    sendJson(response, viewed.status, viewed.body)
    return
  }

  const assignment = mapAgreementRecord(viewed.record)
  if (assignment.status === 'expired' || assignment.status === 'revoked') {
    sendJson(response, 404, { message: 'Agreement link is no longer available.' })
    return
  }

  sendJson(response, 200, assignment)
}

function getParam(request, name) {
  const value = request.query?.[name]
  return Array.isArray(value) ? value[0] : String(value ?? '')
}
