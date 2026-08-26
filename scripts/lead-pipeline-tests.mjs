import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import { createPartnerSessionToken } from '../api/_lib/supabase.js'
import { mapLeadRecord } from '../api/_lib/leads.js'
import internalHandler from '../api/internal/leads.js'
import partnerHandler from '../api/partner/leads.js'

process.env.CASAMIA_INTERNAL_API_KEY = 'lead-test-admin-key'
process.env.CASAMIA_INTERNAL_SESSION_SECRET = 'lead-test-session-secret'
process.env.CASAMIA_PARTNER_CREDENTIALS = JSON.stringify({
  'other@example.com': 'other-partner-password',
  'partner@example.com': 'partner-password',
})
process.env.SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'lead-test-service-key'

const assessmentId = '8f5ffeb2-1077-44dc-9d99-1396f52cab38'
const callbackId = '9f5ffeb2-1077-44dc-9d99-1396f52cab39'
const assessmentRecord = {
  city_area: 'Madrid',
  customer_email: 'ana@example.com',
  customer_name: 'Ana Lopez',
  customer_phone: '+34600111222',
  id: assessmentId,
  message: 'Bathroom support',
  payload_json: {
    leadPipeline: {
      assignedPartnerEmail: 'PARTNER@EXAMPLE.COM',
      followUpAt: '2026-08-25T10:00:00.000Z',
      notes: 'Internal margin note',
      partnerNotes: 'Measure the bathroom wall.',
      status: 'Visit booked',
    },
  },
  preferred_assessment_date: '2026-08-26',
  selected_plan: 'Bathroom',
  status: 'New',
  submitted_at: '2026-08-24T08:00:00.000Z',
}
const callbackRecord = {
  customer_email: 'other@example.com',
  customer_name: 'Other Customer',
  customer_phone: '+34600999888',
  id: callbackId,
  message: '',
  payload_json: {
    city: 'Valencia',
    leadPipeline: { assignedPartnerEmail: 'other@example.com', status: 'New' },
    note: 'Call in the afternoon',
  },
  status: 'New',
  submitted_at: '2026-08-23T08:00:00.000Z',
}

const mapped = mapLeadRecord(assessmentRecord, 'assessment')
assert.equal(mapped.status, 'Visit booked')
assert.equal(mapped.assignedPartnerEmail, 'partner@example.com')
assert.equal(mapped.partnerNotes, 'Measure the bathroom wall.')

globalThis.fetch = async (url, init) => {
  const address = String(url)
  if (init.method === 'GET' && address.includes('assessment_requests')) {
    return jsonResponse([assessmentRecord])
  }
  if (init.method === 'GET' && address.includes('contact_requests')) {
    return jsonResponse([callbackRecord])
  }
  throw new Error(`Unexpected request: ${init.method} ${address}`)
}

{
  const response = makeResponse()
  await internalHandler(makeRequest('GET', '', false), response)
  assert.equal(response.statusCode, 401)
}

{
  const { token } = createPartnerSessionToken('partner@example.com')
  const response = makeResponse()
  await partnerHandler(makeRequest('GET', token), response)
  assert.equal(response.statusCode, 200)
  const body = JSON.parse(response.body)
  assert.equal(body.partnerEmail, 'partner@example.com')
  assert.equal(body.leads.length, 1)
  assert.equal(body.leads[0].id, assessmentId)
  assert.equal(body.leads[0].partnerNotes, 'Measure the bathroom wall.')
  assert.equal('notes' in body.leads[0], false, 'Partner responses must not expose internal notes.')
  assert.equal('notificationDelivery' in body.leads[0], false, 'Partner responses must not expose email delivery metadata.')
}

{
  const { token } = createPartnerSessionToken('other@example.com')
  const response = makeResponse()
  await partnerHandler(makeRequest('GET', token), response)
  assert.equal(response.statusCode, 200)
  const body = JSON.parse(response.body)
  assert.equal(body.partnerEmail, 'other@example.com')
  assert.equal(body.leads.length, 1)
  assert.equal(body.leads[0].id, callbackId)
  assert.equal(
    body.leads.some((lead) => lead.id === assessmentId),
    false,
    'A second partner must not receive records assigned to the first partner.',
  )
}

console.log('Lead pipeline authorization checks passed.')

function makeRequest(method, token = '', admin = false) {
  const request = Readable.from([])
  request.method = method
  request.headers = token
    ? { authorization: `Bearer ${token}` }
    : admin
      ? { 'x-api-key': process.env.CASAMIA_INTERNAL_API_KEY }
      : {}
  return request
}

function makeResponse() {
  return {
    body: '',
    statusCode: 200,
    end(body = '') { this.body = body },
    setHeader() { return this },
    status(code) { this.statusCode = code; return this },
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' }, status })
}
