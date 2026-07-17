import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import handler, {
  mapCallbackRequestRecord,
} from '../api/internal/callback-requests.js'

const apiKey = 'test-internal-key'
const recordId = '8f5ffeb2-1077-44dc-9d99-1396f52cab38'

process.env.CASAMIA_INTERNAL_API_KEY = apiKey
process.env.SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role'

function makeResponse() {
  return {
    body: '',
    headers: new Map(),
    statusCode: 200,
    end(body = '') {
      this.body = body
    },
    setHeader(name, value) {
      this.headers.set(name.toLowerCase(), value)
      return this
    },
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
  }
}

function makeRequest(method, body, authorized = true) {
  const request = body === undefined ? { headers: {}, method } : Readable.from([JSON.stringify(body)])
  request.method = method
  request.headers = {
    ...(authorized ? { 'x-api-key': apiKey } : {}),
    ...(body === undefined ? {} : { 'content-type': 'application/json' }),
  }
  return request
}

function parsedBody(response) {
  return response.body ? JSON.parse(response.body) : undefined
}

const storedRecord = {
  customer_email: 'ana@example.com',
  customer_name: 'Ana Lopez',
  customer_phone: '+34600111222',
  id: recordId,
  message: 'Preferred callback: 2026-08-04 (09:00-12:00)',
  payload_json: {
    city: 'Madrid',
    locale: 'es',
    note: 'Bathroom handrails',
    preferredCallbackDate: '2026-08-04',
    preferredTimeWindow: '09:00-12:00',
    wizardReference: 'CM-ABC123',
  },
  status: 'New',
  submitted_at: '2026-07-17T10:00:00.000Z',
}

const mapped = mapCallbackRequestRecord(storedRecord)
assert.equal(mapped.city, 'Madrid')
assert.equal(mapped.reference, 'CM-ABC123')
assert.equal(mapped.note, 'Bathroom handrails')
assert.equal(mapCallbackRequestRecord({ ...storedRecord, status: 'Unexpected' }).status, 'New')

{
  const response = makeResponse()
  await handler(makeRequest('GET', undefined, false), response)
  assert.equal(response.statusCode, 401)
  assert.equal(parsedBody(response).message, 'Unauthorized.')
}

{
  let requestedUrl = ''
  globalThis.fetch = async (url, init) => {
    requestedUrl = String(url)
    assert.equal(init.method, 'GET')
    return new Response(JSON.stringify([storedRecord]), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    })
  }

  const response = makeResponse()
  const request = makeRequest('GET')
  request.query = { limit: '1', offset: '250', scope: 'open' }
  await handler(request, response)

  assert.equal(response.statusCode, 200)
  assert.match(requestedUrl, /contact_requests\?type=eq\.callback_request/)
  assert.match(requestedUrl, /status=in\.\(New,Contacting\)/)
  assert.match(requestedUrl, /order=submitted_at\.asc/)
  assert.match(requestedUrl, /limit=1&offset=250/)
  assert.equal(parsedBody(response).requests[0].phone, '+34600111222')
  assert.equal(parsedBody(response).hasMore, true)
  assert.equal(parsedBody(response).nextOffset, 251)
}

{
  const originalConsoleError = console.error
  console.error = () => undefined
  globalThis.fetch = async () => {
    throw new Error('network unavailable')
  }

  try {
    const response = makeResponse()
    await handler(makeRequest('GET'), response)
    assert.equal(response.statusCode, 503)
    assert.match(parsedBody(response).message, /temporarily unavailable/i)

    const patchResponse = makeResponse()
    await handler(makeRequest('PATCH', { id: recordId, status: 'Contacting' }), patchResponse)
    assert.equal(patchResponse.statusCode, 503)
    assert.match(parsedBody(patchResponse).message, /try again/i)
  } finally {
    console.error = originalConsoleError
  }
}

{
  const response = makeResponse()
  await handler(makeRequest('PATCH', { id: recordId, status: 'Deleted' }), response)
  assert.equal(response.statusCode, 400)
  assert.match(parsedBody(response).message, /valid callback request status/i)
}

{
  let patchPayload
  let requestedUrl = ''
  globalThis.fetch = async (url, init) => {
    requestedUrl = String(url)
    patchPayload = JSON.parse(String(init.body))
    assert.equal(init.method, 'PATCH')
    return new Response(JSON.stringify([{ ...storedRecord, status: 'Contacting' }]), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    })
  }

  const response = makeResponse()
  await handler(makeRequest('PATCH', { id: recordId, status: 'Contacting' }), response)

  assert.equal(response.statusCode, 200)
  assert.deepEqual(patchPayload, { status: 'Contacting' })
  assert.match(requestedUrl, new RegExp(`id=eq\\.${recordId}`))
  assert.match(requestedUrl, /type=eq\.callback_request/)
  assert.equal(parsedBody(response).request.status, 'Contacting')
}

console.log('Internal callback queue checks passed.')
