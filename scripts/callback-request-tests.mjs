import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Readable } from 'node:stream'

import callbackRequestHandler, {
  CALLBACK_CONSENT_WORDING,
  CALLBACK_TIME_WINDOWS,
  isAllowedCallbackOrigin,
  normalizeSpanishPhone,
  readCallbackJsonBody,
  validateCallbackRequest,
} from '../api/public/callback-requests.js'
import { callSupabaseRpc, supabaseRequestTimeoutMs } from '../api/_lib/supabase.js'
import { getWizardCopy } from '../src/config/wizardCopy.ts'
import {
  callbackRequestTimeoutMs,
  callbackTimeWindows,
  clearCallbackContact,
  createCallbackRequestIdempotencyKey,
  createCallbackRequestPayload,
  createEmptyCallbackRequest,
  submitCallbackRequest,
} from '../src/services/callbackRequests.ts'
import {
  getMadridScheduleContext,
  isElapsedMadridWindow,
  updateCallbackRequestDate,
} from '../src/services/callbackSchedule.ts'

const fixedNow = new Date('2026-07-17T10:00:00Z')
const idempotencyKey = '3f7b68e4-191f-4f04-80ee-a18dce1fd29d'
const validInput = {
  city: 'Málaga',
  consentConfirmed: true,
  email: 'ana@example.com',
  idempotencyKey,
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
assert.deepEqual(CALLBACK_CONSENT_WORDING, {
  en: 'I agree that CasaMia may contact me about this callback request.',
  es: 'Acepto que CasaMia contacte conmigo sobre esta solicitud de llamada.',
})
assert.equal(callbackRequestTimeoutMs, 15_000)
assert.equal(supabaseRequestTimeoutMs, 15_000)
assert.equal(getWizardCopy('en').callback.confirmation.requestAnother, 'Request another callback')
assert.equal(getWizardCopy('es').callback.confirmation.requestAnother, 'Solicitar otra llamada')
assert.match(getWizardCopy('en').callback.noTimesToday, /No callback times remain today/)
assert.match(getWizardCopy('es').callback.noTimesToday, /no quedan horarios de llamada para hoy/)
assert.match(createCallbackRequestIdempotencyKey(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
const supabaseSchema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8')
assert.match(supabaseSchema, /add column if not exists idempotency_key text/i)
assert.match(supabaseSchema, /create unique index if not exists contact_requests_idempotency_key_idx[\s\S]*?\(idempotency_key\)/i)
const callbackStepSource = readFileSync(
  new URL('../src/components/wizard/CallbackRequestStep.tsx', import.meta.url),
  'utf8',
)
const callbackStylesSource = readFileSync(
  new URL('../src/styles/home-safety-wizard.css', import.meta.url),
  'utf8',
)
const wizardPageSource = readFileSync(
  new URL('../src/pages/HomeSafetyWizardPage.tsx', import.meta.url),
  'utf8',
)
assert.match(callbackStepSource, /<form aria-busy=\{submitting\}/)
assert.match(callbackStepSource, /<fieldset className="safety-wizard-callback-fields" disabled=\{submitting\}>/)
assert.match(callbackStepSource, /aria-invalid=\{Boolean\(errors\.preferredTimeWindow\)\}/)
assert.match(callbackStepSource, /querySelector<HTMLElement>\('\[aria-invalid="true"\]:not\(:disabled\)'\)/)
assert.equal(
  callbackStylesSource.indexOf('.safety-wizard-callback-time-options input:disabled + span'),
  callbackStylesSource.lastIndexOf('.safety-wizard-callback-time-options input:disabled + span'),
  'The disabled callback-slot rule should have one authoritative definition.',
)
assert.ok(
  callbackStylesSource.indexOf('.safety-wizard-callback-time-options input:disabled + span')
    > callbackStylesSource.indexOf('.safety-wizard-callback-time-options input:checked + span'),
  'Disabled callback-slot styling must override checked styling.',
)
assert.match(wizardPageSource, /callbackRequest: createEmptyCallbackRequest\(\)/)
assert.match(wizardPageSource, /contact: clearCallbackContact\(state\.contact\)/)
assert.match(wizardPageSource, /onRequestAnother=/)
assert.deepEqual(createEmptyCallbackRequest(), {
  consent: false,
  note: '',
  preferredDate: '',
  preferredTimeWindow: '',
})
assert.deepEqual(clearCallbackContact({
  city: 'Madrid',
  consent: true,
  email: 'ana@example.com',
  fullName: 'Ana García',
  phone: '600111222',
  preferredMethod: 'phone',
}), {
  city: '',
  consent: false,
  email: '',
  fullName: '',
  phone: '',
  preferredMethod: 'phone',
})
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
assert.throws(() => validateCallbackRequest({
  ...validInput,
  preferredCallbackDate: '2026-07-17',
  preferredTimeWindow: '09:00-12:00',
}, fixedNow), /already ended today/)
assert.doesNotThrow(() => validateCallbackRequest({
  ...validInput,
  preferredCallbackDate: '2026-07-17',
  preferredTimeWindow: 'flexible',
}, fixedNow))
const afterCallbackHours = new Date('2026-07-17T18:01:00Z')
assert.throws(() => validateCallbackRequest({
  ...validInput,
  preferredCallbackDate: '2026-07-17',
  preferredTimeWindow: 'flexible',
}, afterCallbackHours), /already ended today/)
const afterHoursContext = getMadridScheduleContext(afterCallbackHours)
assert.equal(afterHoursContext.currentMinutes, 20 * 60 + 1)
assert.equal(afterHoursContext.minimumDate, '2026-07-18')
assert.equal(getMadridScheduleContext(fixedNow).minimumDate, '2026-07-17')
assert.equal(isElapsedMadridWindow('flexible', '2026-07-17', afterHoursContext), true)
assert.equal(isElapsedMadridWindow('flexible', '2026-07-18', afterHoursContext), false)
const callbackDraft = {
  consent: true,
  note: 'Call after lunch.',
  preferredDate: '2026-07-18',
  preferredTimeWindow: '09:00-12:00',
}
assert.equal(
  updateCallbackRequestDate(callbackDraft, '2026-07-17', afterHoursContext).preferredTimeWindow,
  '',
  'Changing to today must clear a selected callback window that has elapsed.',
)
assert.equal(
  updateCallbackRequestDate(callbackDraft, '2026-07-18', afterHoursContext).preferredTimeWindow,
  '09:00-12:00',
  'Changing to a future day should preserve a valid callback window.',
)
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
assert.throws(() => validateCallbackRequest({ ...validInput, idempotencyKey: 'CM-A1B2C3' }, fixedNow))
assert.throws(() => validateCallbackRequest({
  ...validInput,
  preferredTimeWindow: 'whenever',
}, fixedNow))

const utf8CallbackBody = Buffer.from(JSON.stringify({ name: 'Málaga' }), 'utf8')
const utf8Boundary = utf8CallbackBody.indexOf(Buffer.from('á', 'utf8'))
const streamedCallbackRequest = Readable.from([
  utf8CallbackBody.subarray(0, utf8Boundary + 1),
  utf8CallbackBody.subarray(utf8Boundary + 1),
])
assert.deepEqual(await readCallbackJsonBody(streamedCallbackRequest), { name: 'Málaga' })

assert.deepEqual(createCallbackRequestPayload({
  city: ' Málaga ',
  consentConfirmed: true,
  email: ' ana@example.com ',
  idempotencyKey: ` ${idempotencyKey.toUpperCase()} `,
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
  idempotencyKey,
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

const callbackServiceInput = {
  city: 'Málaga',
  consentConfirmed: true,
  idempotencyKey,
  locale: 'es',
  name: 'Ana García',
  phone: '600 111 222',
  preferredCallbackDate: '2026-07-20',
  preferredTimeWindow: '15:00-18:00',
  wizardReference: 'CM-A1B2C3',
}

await assert.rejects(
  () => submitCallbackRequest(callbackServiceInput),
  /Public website API URL is not configured/,
)

await assert.rejects(
  () => submitCallbackRequest(callbackServiceInput, {
    requestJson: (_path, _payload, init) => new Promise((_resolve, reject) => {
      assert.ok(init?.signal)
      const abort = () => {
        const error = new Error('aborted')
        error.name = 'AbortError'
        reject(error)
      }
      if (init.signal.aborted) abort()
      else init.signal.addEventListener('abort', abort, { once: true })
    }),
    timeoutMs: 5,
  }),
  /callback request timed out/i,
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
  idempotency_key: 'attacker-controlled-key',
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
  let insertCallCount = 0
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ init, url: String(url) })
    assert.ok(init.signal)
    if (String(url).includes('/rpc/reserve_callback_request')) {
      return new Response('true', { status: 200 })
    }
    if (String(url).includes('/rest/v1/contact_requests?on_conflict=idempotency_key')) {
      insertCallCount += 1
      return new Response(JSON.stringify(
        insertCallCount === 1 ? [{ id: 'callback-id', status: 'New' }] : [],
      ), { status: 201 })
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

  const retryResponse = makeResponse()
  await callbackRequestHandler(makeRequest({ body: handlerBody }), retryResponse)
  assert.equal(retryResponse.statusCode, 201)
  assert.deepEqual(JSON.parse(retryResponse.body), { status: 'New' })

  const rateLimitCall = calls.find((call) => call.url.includes('/rpc/reserve_callback_request'))
  const rateLimitPayload = JSON.parse(rateLimitCall.init.body)
  assert.equal(rateLimitPayload.p_limit, 5)
  assert.equal(rateLimitPayload.p_window_seconds, 1800)
  assert.match(rateLimitPayload.p_ip_hash, /^[0-9a-f]{64}$/)

  const insertCalls = calls.filter((call) => call.url.includes('/rest/v1/contact_requests?on_conflict=idempotency_key'))
  assert.equal(insertCalls.length, 2)
  assert.equal(insertCalls[0].init.headers.Prefer, 'resolution=ignore-duplicates,return=representation')
  const inserted = JSON.parse(insertCalls[0].init.body)
  const retried = JSON.parse(insertCalls[1].init.body)
  assert.equal(inserted.idempotency_key, `callback_request:${idempotencyKey}`)
  assert.equal(retried.idempotency_key, inserted.idempotency_key)
  assert.equal(inserted.idempotency_key.includes(inserted.payload_json.wizardReference), false)
  assert.equal(inserted.type, 'callback_request')
  assert.equal(inserted.status, 'New')
  assert.equal(inserted.source, 'home-safety-wizard-callback')
  assert.equal(inserted.customer_phone, '+34600111222')
  assert.equal(inserted.payload_json.city, 'Málaga')
  assert.equal(inserted.payload_json.wizardReference, 'CM-A1B2C3')
  assert.equal(inserted.payload_json.locale, 'es')
  assert.equal(inserted.payload_json.preferredTimeWindow, '15:00-18:00')
  assert.equal(inserted.payload_json.consentConfirmed, true)
  assert.equal(inserted.payload_json.consentWording, CALLBACK_CONSENT_WORDING.es)
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
    if (String(url).includes('/rest/v1/contact_requests?on_conflict=idempotency_key')) {
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

  globalThis.fetch = async (_url, init = {}) => new Promise((_resolve, reject) => {
    assert.ok(init.signal)
    const abort = () => {
      const error = new Error('aborted')
      error.name = 'AbortError'
      reject(error)
    }
    if (init.signal.aborted) abort()
    else init.signal.addEventListener('abort', abort, { once: true })
  })
  await assert.rejects(
    () => callSupabaseRpc('slow_callback_test', {}, { timeoutMs: 5 }),
    /Supabase request timed out/,
  )
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
