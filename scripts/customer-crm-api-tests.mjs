import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import handler from '../api/internal/customers.js'

process.env.CASAMIA_INTERNAL_API_KEY = 'customer-crm-test-key'
process.env.CASAMIA_INTERNAL_SESSION_SECRET = 'customer-crm-session-secret'
process.env.SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'customer-crm-service-key'

let lastRequest
globalThis.fetch = async (url, init) => {
  lastRequest = { init, url: String(url) }
  if (init.method === 'GET') return jsonResponse([])
  if (init.method === 'POST') return jsonResponse([{ customer_key: 'email:maria@example.com', lifecycle_status: 'Contacted', owner: 'Karim', owner_email: 'karim@example.com', internal_notes: 'Called customer', next_action: 'Book visit', next_action_due_at: '2026-09-01T08:00:00.000Z', updated_at: '2026-08-30T12:00:00.000Z' }])
  throw new Error(`Unexpected request ${init.method}`)
}

{
  const response = makeResponse()
  await handler(makeRequest('GET'), response)
  assert.equal(response.statusCode, 401)
}

{
  const response = makeResponse()
  await handler(makeRequest('PATCH', { customerKey: 'email:maria@example.com', lifecycleStatus: 'Invalid' }, true), response)
  assert.equal(response.statusCode, 400)
}

{
  const response = makeResponse()
  await handler(makeRequest('PATCH', { customerKey: 'email:maria@example.com', lifecycleStatus: 'Contacted', owner: 'Karim', ownerEmail: 'karim@example.com', internalNotes: 'Called customer', nextAction: 'Book visit', nextActionDueAt: '2026-09-01T08:00:00.000Z' }, true), response)
  assert.equal(response.statusCode, 200)
  assert.match(lastRequest.url, /customer_crm_records\?on_conflict=customer_key/)
  const saved = JSON.parse(response.body).customer
  assert.equal(saved.owner, 'Karim')
  assert.equal(saved.ownerEmail, 'karim@example.com')
  assert.equal(saved.nextAction, 'Book visit')
}

console.log('Customer CRM API checks passed.')

function makeRequest(method, body, admin = false) {
  const request = Readable.from(body ? [JSON.stringify(body)] : [])
  request.method = method
  request.headers = admin ? { 'content-type': 'application/json', 'x-api-key': process.env.CASAMIA_INTERNAL_API_KEY } : {}
  return request
}
function makeResponse() { return { body: '', statusCode: 200, end(body = '') { this.body = body }, setHeader() { return this }, status(code) { this.statusCode = code; return this } } }
function jsonResponse(body, status = 200) { return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' }, status }) }
