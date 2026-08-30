import assert from 'node:assert/strict'

import handler from '../api/cron/lead-reminders.js'

process.env.CRON_SECRET = 'test-cron-secret'
process.env.CASAMIA_LEADS_EMAIL = 'operations@casamia.com.es'
process.env.CASAMIA_PUBLIC_SITE_URL = 'https://www.casamia.com.es'
process.env.RESEND_API_KEY = 'test-resend-key'
process.env.SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

const sentEmails = []
const staleLead = {
  city_area: 'Madrid', customer_email: 'ana@example.com', customer_name: 'Ana Lopez', customer_phone: '+34600111222',
  id: '8f5ffeb2-1077-44dc-9d99-1396f52cab38', message: 'Bathroom support', payload_json: {}, status: 'New',
  submitted_at: '2020-01-01T08:00:00.000Z',
}
const dueAction = {
  customer_key: 'email:maria@example.com', lifecycle_status: 'Contacted', next_action: 'Call about visit',
  next_action_due_at: '2020-01-01T09:00:00.000Z', owner: 'Karim', owner_email: 'karim@example.com',
}

const originalFetch = globalThis.fetch
globalThis.fetch = async (url, init) => {
  const address = String(url)
  if (address === 'https://api.resend.com/emails') {
    sentEmails.push(JSON.parse(init.body))
    return json({ id: `email-${sentEmails.length}` })
  }
  if (init.method === 'GET' && address.includes('assessment_requests?select=')) return json([staleLead])
  if (init.method === 'GET' && address.includes('contact_requests?type=eq.callback_request')) return json([])
  if (init.method === 'GET' && address.includes('customer_crm_records?select=')) return json([dueAction])
  throw new Error(`Unexpected customer follow-up request: ${init.method} ${address}`)
}

try {
  const response = makeResponse()
  await handler({ headers: { authorization: 'Bearer test-cron-secret' }, method: 'GET' }, response)
  assert.equal(response.statusCode, 200)
  const body = JSON.parse(response.body)
  assert.equal(body.customerActionsDue, 1)
  assert.equal(body.staleLeads, 1)
  assert.equal(sentEmails.length, 2)
  assert.deepEqual(sentEmails.map((email) => email.to[0]).sort(), ['karim@example.com', 'operations@casamia.com.es'])
  assert.match(sentEmails.find((email) => email.to[0] === 'operations@casamia.com.es').text, /uncontacted for 48\+ hours/i)
  assert.match(sentEmails.find((email) => email.to[0] === 'karim@example.com').text, /Call about visit/)
  console.log('Customer follow-up reminder checks passed.')
} finally {
  globalThis.fetch = originalFetch
}

function makeResponse() { return { body: '', statusCode: 200, end(body = '') { this.body = body }, setHeader() { return this }, status(code) { this.statusCode = code; return this } } }
function json(body) { return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' }, status: 200 }) }
