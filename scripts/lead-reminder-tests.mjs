import assert from 'node:assert/strict'

import handler from '../api/cron/lead-reminders.js'

process.env.CRON_SECRET = 'test-cron-secret'
process.env.CASAMIA_LEADS_EMAIL = 'operations@casamia.com.es'
process.env.SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
delete process.env.RESEND_API_KEY

const record = {
  city_area: 'Madrid',
  customer_email: 'ana@example.com',
  customer_name: 'Ana Lopez',
  customer_phone: '+34600111222',
  id: '8f5ffeb2-1077-44dc-9d99-1396f52cab38',
  message: 'Bathroom support',
  payload_json: {
    leadPipeline: {
      followUpAt: '2020-01-01T10:00:00.000Z',
      notificationDelivery: {},
      status: 'Contacted',
    },
  },
  status: 'Contacting',
  submitted_at: '2020-01-01T08:00:00.000Z',
}

const originalFetch = globalThis.fetch
globalThis.fetch = async (url, init) => {
  const address = String(url)
  if (init.method === 'GET' && address.includes('assessment_requests?select=')) {
    return json([record])
  }
  if (init.method === 'GET' && address.includes('contact_requests?type=eq.callback_request')) {
    return json([])
  }
  if (init.method === 'GET' && address.includes('customer_crm_records?select=')) {
    return json([])
  }
  if (init.method === 'GET' && address.includes(`assessment_requests?id=eq.${record.id}`)) {
    return json([{ id: record.id, payload_json: record.payload_json }])
  }
  if (init.method === 'PATCH' && address.includes(`assessment_requests?id=eq.${record.id}`)) {
    return json([{ id: record.id }])
  }
  throw new Error(`Unexpected reminder test request: ${init.method} ${address}`)
}

try {
  const unauthorized = makeResponse()
  await handler({ headers: {}, method: 'GET' }, unauthorized)
  assert.equal(unauthorized.statusCode, 401)

  const response = makeResponse()
  await handler({ headers: { authorization: 'Bearer test-cron-secret' }, method: 'GET' }, response)
  assert.equal(response.statusCode, 200)
  const body = JSON.parse(response.body)
  assert.equal(body.due, 1)
  assert.equal(body.trackingFailures, 0)
  assert.equal(body.delivery.reminder.status, 'not_configured')

  console.log('Lead reminder cron checks passed.')
} finally {
  globalThis.fetch = originalFetch
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

function json(body) {
  return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' }, status: 200 })
}
