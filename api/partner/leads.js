import { listLeadRecords } from '../_lib/leads.js'
import { requirePartnerApiKey, sendJson } from '../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }
  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const session = requirePartnerApiKey(request, response)
  if (!session) return

  const result = await listLeadRecords()
  if (!result.ok) {
    sendJson(response, result.status, result.body)
    return
  }

  sendJson(response, 200, {
    leads: result.body
      .filter((lead) => lead.assignedPartnerEmail === session.partnerEmail)
      .map(({ notes: _internalNotes, ...lead }) => lead),
    partnerEmail: session.partnerEmail,
  })
}
