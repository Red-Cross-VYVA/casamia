import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import handler from '../api/cron/visit-reminders.js'
import { isVisitReminderDue } from '../api/_lib/visit-reminders.js'

process.env.CRON_SECRET = 'test-cron-secret'
process.env.SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
delete process.env.RESEND_API_KEY

const now = new Date()
const startAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
const appointment = { bookedAt: now.toISOString(), slotId: 'slot-1', startAt, timeZone: 'Europe/Madrid' }
const record = {
  customer_email: 'ana@example.com',
  customer_name: 'Ana Lopez',
  id: '8f5ffeb2-1077-44dc-9d99-1396f52cab38',
  payload_json: { locale: 'es', visitAppointment: appointment, visitPayment: { sessionId: 'cs_test_reminder' } },
  status: 'Visit Scheduled',
}

assert.equal(isVisitReminderDue(record, now), true)
assert.equal(isVisitReminderDue({ ...record, payload_json: { ...record.payload_json, visitAppointment: { ...appointment, reminder: { startAt, status: 'sent' } } } }, now), false)
assert.equal(isVisitReminderDue({ ...record, payload_json: { ...record.payload_json, visitAppointment: { ...appointment, startAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString() } } }, now), false)
const vercelConfig = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
assert.deepEqual(vercelConfig.crons.find((cron) => cron.path === '/api/cron/visit-reminders'), {
  path: '/api/cron/visit-reminders', schedule: '15 8 * * *',
})

let trackedPayload
const originalFetch = globalThis.fetch
globalThis.fetch = async (url, init) => {
  const address = String(url)
  if (init.method === 'GET' && address.includes('status=eq.Visit%20Scheduled')) return json([record])
  if (init.method === 'POST' && address.includes('assessment_requests?on_conflict=id')) {
    return json([{ ...JSON.parse(init.body), status: 'Claimed' }])
  }
  if (init.method === 'PATCH' && address.includes(`id=eq.${record.id}`)) {
    trackedPayload = JSON.parse(init.body)
    return json([{ ...record, payload_json: trackedPayload.payload_json }])
  }
  throw new Error(`Unexpected visit reminder request: ${init.method} ${address}`)
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
  assert.equal(body.sent, 0)
  assert.equal(body.failed, 1)
  assert.equal(trackedPayload.payload_json.visitAppointment.reminder.status, 'failed')
  assert.equal(trackedPayload.payload_json.visitAppointment.reminder.startAt, startAt)

  console.log('Visit reminder cron checks passed.')
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
