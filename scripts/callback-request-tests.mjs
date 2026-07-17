import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import callbackRequestHandler, {
  CALLBACK_TIME_WINDOWS,
  isAllowedCallbackOrigin,
  normalizeSpanishPhone,
  validateCallbackRequest,
} from '../api/public/callback-requests.js'
import {
  callbackTimeWindows,
  createCallbackRequestPayload,
  submitCallbackRequest,
} from '../src/services/callbackRequests.ts'

const fixedNow = new Date('2026-07-17T10:00:00Z')
const validInput = {
  city: 'Málaga',
  consentConfirmed: true,
  email: 'ana@example.com',
  locale: 'es',
  name: 'Ana García',
  note: 'Mejor después de las 16:00.',
  phone: '600 111 222',
  preferredCallbackDate: '2026-07-20',
  preferredTimeWindow: '15:00-18:00',
  timeZone: 'Europe/Madrid',
  website: '',
  wizardReference: 'cm-a1b2c3',
}

assert.deepEqual([...CALLBACK_TIME_WINDOWS], [...callbackTimeWindows])
assert.equal(normalizeSpanishPhone('600 111 222'), '+34600111222')
assert.equal(normalizeSpanishPhone('+34 600 111 222'), '+34600111222')
assert.equal(normalizeSpanishPhone('0034 600 111 222'), '+34600111222')
assert.throws(() => normalizeSpanishPhone('123'))

const validated = validateCallbackRequest(validInput, fixedNow)
assert.equal(validated.phone, '+34600111222')
assert.equal(validated.wizardReference, 'CM-A1B2C3')
assert.equal(validated.city, 'Málaga')
assert.doesNotThrow(() => validateCallbackRequest({
  ...validInput,
  preferredCallbackDate: '2026-07-17',
}, fixedNow))
assert.doesNotThrow(() => validateCallbackRequest({
  ...validInput,
  preferredCallbackDate: '2026-10-15',
}, fixedNow))
assert.throws(() => validateCallbackRequest({
  ...validInput,
  preferredCallbackDate: '2026-07-16',
}, fixedNow))
assert.throws(() => validateCallbackRequest({
  ...validInput,
  preferredCallbackDate: '2026-10-16',
}, fixedNow))
assert.throws(() => validateCallbackRequest({ ...validInput, city: '' }, fixedNow))
assert.throws(() => validateCallbackRequest({ ...validInput, consentConfirmed: false }, fixedNow))
assert.throws(() => validateCallbackRequest({
  ...validInput,
  preferredTimeWindow: 'whenever',
}, fixedNow))

assert.deepEqual(createCallbackRequestPayload({
  city: ' Málaga ',
  consentConfirmed: true,
  email: ' ana@example.com ',
  locale: 'es',
  name: ' Ana García ',
  note: ' Llámame por la tarde. ',
  phone: ' 600 111 222 ',
  preferredCallbackDate: '2026-07-20',
  preferredTimeWindow: '15:00-18:00',
  website: '',
  wizardReference: 'cm-a1b2c3',
}), {
  city: 'Málaga',
  consentConfirmed: true,
  email: 'ana@example.com',
  locale: 'es',
  name: 'Ana García',
  note: 'Llámame por la tarde.',
  phone: '600 111 222',
  preferredCallbackDate: '2026-07-20',
  preferredTimeWindow: '15:00-18:00',
  timeZone: 'Europe/Madrid',
  website: '',
  wizardReference: 'CM-A1B2C3',
})

await assert.rejects(
  () => submitCallbackRequest({
    city: 'Málaga',
    consentConfirmed: true,
    locale: 'es',
    name: 'Ana García',
    phone: '600 111 222',
    preferredCallbackDate: '2026-07-20',
    preferredTimeWindow: '15:00-18:00',
    wizardReference: 'CM-A1B2C3',
  }),
  /Public website API URL is not configured/,
)

const sameOriginRequest = {
  headers: {
    host: 'www.casamia.com.es',
    origin: 'https://www.casamia.com.es',
    'x-forwarded-proto': 'https',
  },
}
assert.equal(isAllowedCallbackOrigin(sameOriginRequest, { NODE_ENV: 'production' }), true)
assert.equal(isAllowedCallbackOrigin({
  headers: {
    host: 'www.casamia.com.es',
    origin: 'https://attacker.example',
    'x-forwarded-proto': 'https',
  },
}, { NODE_ENV: 'production' }), false)

function madridDateIn(days) {
  const date = new Date(Date.now() + days * 86_400_000)
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Madrid',
    year: 'numeric',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function makeRequest({
  body = {},
  contentType = 'application/json; charset=utf-8',
  method = 'POST',
  origin = 'https://www.casamia.com.es',
  rawBody,
} = {}) {
  const serialized = rawBody ?? JSON.stringify(body)
  const request = Readable.from([serialized])
  request.method = method
  request.headers = {
    'content-type': contentType,
    host: 'www.casamia.com.es',
    origin,
    'x-forwarded-for': '203.0.113.10',
    'x-forwarded-proto': 'https',
  }
  request.socket = { remoteAddress: '203.0.113.10' }
  return request
}

function makeResponse() {
  return {
    body: '',
    headers: {},
    statusCode: 200,
    end(body = '') {
      this.body = body
      return this
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value
      return this
    },
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
  }
}

const handlerBody = {
  ...validInput,
  preferredCallbackDate: madridDateIn(2),
  status: 'Closed',
  submittedAt: '1999-01-01T00:00:00.000Z',
  type: 'untrusted-type',
}
const originalFetch = globalThis.fetch
const originalConsoleError = console.error
const environmentKeys = [
  'CALLBACK_RATE_LIMIT_SALT',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_URL',
]
const originalEnvironment = Object.fromEntries(
  environmentKeys.map((key) => [key, process.env[key]]),
)

try {
  Object.assign(process.env, {
    CALLBACK_RATE_LIMIT_SALT: 'callback-test-rate-limit-secret',
    SUPABASE_SERVICE_ROLE_KEY: 'supabase-service-role-test-key',
    SUPABASE_URL: 'https://supabase.test',
  })

  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ init, url: String(url) })
    if (String(url).includes('/rpc/reserve_callback_request')) {
      return new Response('true', { status: 200 })
    }
    if (String(url).endsWith('/rest/v1/contact_requests')) {
      return new Response(JSON.stringify([{ id: 'callback-id', status: 'New' }]), { status: 201 })
    }
    throw new Error(`Unexpected test URL: ${url}`)
  }

  const response = makeResponse()
  await callbackRequestHandler(makeRequest({ body: handlerBody }), response)
  assert.equal(response.statusCode, 201)
  assert.equal(response.headers['cache-control'], 'no-store')
  assert.equal(response.headers['access-control-allow-origin'], 'https://www.casamia.com.es')
  assert.equal(response.headers.vary, 'Origin')
  assert.deepEqual(JSON.parse(response.body), { id: 'callback-id', status: 'New' })

  const rateLimitCall = calls.find((call) => call.url.includes('/rpc/reserve_callback_request'))
  const rateLimitPayload = JSON.parse(rateLimitCall.init.body)
  assert.equal(rateLimitPayload.p_limit, 5)
  assert.equal(rateLimitPayload.p_window_seconds, 1800)
  assert.match(rateLimitPayload.p_ip_hash, /^[0-9a-f]{64}$/)

  const insertCall = calls.find((call) => call.url.endsWith('/rest/v1/contact_requests'))
  const inserted = JSON.parse(insertCall.init.body)
  assert.equal(inserted.type, 'callback_request')
  assert.equal(inserted.status, 'New')
  assert.equal(inserted.source, 'home-safety-wizard-callback')
  assert.equal(inserted.customer_phone, '+34600111222')
  assert.equal(inserted.payload_json.city, 'Málaga')
  assert.equal(inserted.payload_json.wizardReference, 'CM-A1B2C3')
  assert.equal(inserted.payload_json.locale, 'es')
  assert.equal(inserted.payload_json.preferredTimeWindow, '15:00-18:00')
  assert.equal(inserted.payload_json.consentConfirmed, true)
  assert.equal(inserted.payload_json.consentWordingVersion, 'callback-v1')
  assert.equal('status' in inserted.payload_json, false)
  assert.notEqual(inserted.submitted_at, handlerBody.submittedAt)

  let fetchCalled = false
  globalThis.fetch = async () => {
    fetchCalled = true
    throw new Error('Fetch should not run')
  }

  const rejectedOriginResponse = makeResponse()
  await callbackRequestHandler(
    makeRequest({ body: handlerBody, origin: 'https://attacker.example' }),
    rejectedOriginResponse,
  )
  assert.equal(rejectedOriginResponse.statusCode, 403)
  assert.equal(fetchCalled, false)

  const preflightResponse = makeResponse()
  await callbackRequestHandler(makeRequest({ method: 'OPTIONS', rawBody: '' }), preflightResponse)
  assert.equal(preflightResponse.statusCode, 204)

  const honeypotResponse = makeResponse()
  await callbackRequestHandler(
    makeRequest({ body: { ...handlerBody, website: 'https://spam.example' } }),
    honeypotResponse,
  )
  assert.equal(honeypotResponse.statusCode, 200)
  assert.equal(fetchCalled, false)

  const invalidResponse = makeResponse()
  await callbackRequestHandler(
    makeRequest({ body: { ...handlerBody, consentConfirmed: false } }),
    invalidResponse,
  )
  assert.equal(invalidResponse.statusCode, 400)
  assert.equal(fetchCalled, false)

  const oversizedResponse = makeResponse()
  await callbackRequestHandler(
    makeRequest({ rawBody: JSON.stringify({ note: 'x'.repeat(17 * 1024) }) }),
    oversizedResponse,
  )
  assert.equal(oversizedResponse.statusCode, 413)
  assert.equal(fetchCalled, false)

  const unsupportedMediaResponse = makeResponse()
  await callbackRequestHandler(
    makeRequest({ body: handlerBody, contentType: 'text/plain' }),
    unsupportedMediaResponse,
  )
  assert.equal(unsupportedMediaResponse.statusCode, 415)
  assert.equal(fetchCalled, false)

  let releasedFailedInsert = false
  globalThis.fetch = async (url) => {
    if (String(url).includes('/rpc/reserve_callback_request')) {
      return new Response('true', { status: 200 })
    }
    if (String(url).endsWith('/rest/v1/contact_requests')) {
      return new Response(JSON.stringify({ message: 'private insert detail' }), { status: 500 })
    }
    if (String(url).includes('/rpc/release_callback_request')) {
      releasedFailedInsert = true
      return new Response('null', { status: 200 })
    }
    throw new Error(`Unexpected test URL: ${url}`)
  }
  console.error = () => undefined
  const failedInsertResponse = makeResponse()
  await callbackRequestHandler(makeRequest({ body: handlerBody }), failedInsertResponse)
  assert.equal(failedInsertResponse.statusCode, 503)
  assert.equal(releasedFailedInsert, true)
  assert.equal(JSON.parse(failedInsertResponse.body).message.includes('private insert detail'), false)

  globalThis.fetch = async (url) => {
    if (String(url).includes('/rpc/reserve_callback_request')) {
      return new Response('false', { status: 200 })
    }
    throw new Error(`Unexpected test URL: ${url}`)
  }
  const limitedResponse = makeResponse()
  await callbackRequestHandler(makeRequest({ body: handlerBody }), limitedResponse)
  assert.equal(limitedResponse.statusCode, 429)

  globalThis.fetch = async (url) => {
    if (String(url).includes('/rpc/reserve_callback_request')) {
      return new Response(JSON.stringify({ message: 'private database detail' }), { status: 500 })
    }
    throw new Error(`Unexpected test URL: ${url}`)
  }
  console.error = () => undefined
  const unavailableResponse = makeResponse()
  await callbackRequestHandler(makeRequest({ body: handlerBody }), unavailableResponse)
  assert.equal(unavailableResponse.statusCode, 503)
  assert.equal(JSON.parse(unavailableResponse.body).message.includes('private database detail'), false)
} finally {
  globalThis.fetch = originalFetch
  console.error = originalConsoleError
  for (const key of environmentKeys) {
    const value = originalEnvironment[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
}

console.log('Callback request tests passed.')
