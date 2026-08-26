import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import contactHandler from '../api/public/contact-requests.js'
import consentHandler from '../api/consent-evidence.js'
import assessmentHandler, { validateAssessmentRequest } from '../api/public/assessment-requests.js'
import orderHandler from '../api/public/orders.js'
import { normalizePublicOrderStatus } from '../api/public/orders.js'
import proposalDraftHandler from '../api/public/proposal-drafts.js'
import providerHandler from '../api/public/provider-applications.js'
import withdrawalHandler from '../api/withdrawal-requests.js'

function makeRequest(body) {
  const request = Readable.from([JSON.stringify(body)])
  request.headers = {
    'content-type': 'application/json',
    host: 'localhost:5173',
    origin: 'http://localhost:5173',
    'x-forwarded-proto': 'http',
  }
  request.method = 'POST'
  return request
}

function makeResponse() {
  return {
    body: '',
    headers: new Map(),
    statusCode: 200,
    end(body = '') { this.body = body },
    setHeader(name, value) { this.headers.set(name.toLowerCase(), value); return this },
    status(statusCode) { this.statusCode = statusCode; return this },
  }
}

for (const [name, handler] of [
  ['assessment', assessmentHandler],
  ['consent evidence', consentHandler],
  ['contact', contactHandler],
  ['order', orderHandler],
  ['proposal draft', proposalDraftHandler],
  ['provider', providerHandler],
  ['withdrawal', withdrawalHandler],
]) {
  const response = makeResponse()
  await handler(makeRequest({}), response)
  assert.equal(response.statusCode, 400, `${name} must reject an empty public submission.`)
  assert.match(JSON.parse(response.body).message, /required|Complete|valid/)
}

assert.equal(normalizePublicOrderStatus('Deposit Paid'), 'New')
assert.equal(normalizePublicOrderStatus('Completed'), 'New')
assert.equal(normalizePublicOrderStatus('Quote requested'), 'Quote requested')

{
  const response = makeResponse()
  await proposalDraftHandler(makeRequest({
    consent: true,
    customer: { email: 'invalid', name: 'Ana' },
  }), response)
  assert.equal(response.statusCode, 400, 'Proposal drafts must reject an invalid customer email.')
}

{
  const request = makeRequest({
    consent: true,
    customer: { email: 'ana@example.com', name: 'Ana' },
  })
  request.headers.origin = 'https://attacker.example'
  const response = makeResponse()
  await proposalDraftHandler(request, response)
  assert.equal(response.statusCode, 403, 'Proposal drafts must reject an untrusted origin.')
}

assert.throws(
  () => validateAssessmentRequest({
    consentAt: '2026-08-26T12:00:00.000Z',
    consentConfirmed: true,
    email: 'not-an-email',
    name: 'Ana',
  }),
  /Valid contact details/,
)

{
  const validated = validateAssessmentRequest({
    city: 'Madrid',
    consentAt: '2026-08-26T12:00:00.000Z',
    consentConfirmed: true,
    email: 'ANA@EXAMPLE.COM',
    name: ' Ana ',
    source: 'home-safety-assessment',
    status: 'Visit paid',
    type: 'visit_slot_reservation',
  })
  assert.equal(validated.customer_email, 'ana@example.com')
  assert.equal(validated.customer_name, 'Ana')
  assert.equal(validated.status, 'New', 'Public assessment callers must not choose an operational status.')
  assert.equal(validated.type, 'home_safety_assessment_visit', 'Public assessment callers must not choose a record type.')
}

{
  const request = makeRequest({})
  request.headers.origin = 'https://attacker.example'
  const response = makeResponse()
  await consentHandler(request, response)
  assert.equal(response.statusCode, 403, 'Consent evidence must reject an untrusted origin.')
}

for (const [name, handler] of [
  ['assessment', assessmentHandler],
  ['contact', contactHandler],
  ['order', orderHandler],
  ['provider', providerHandler],
  ['withdrawal', withdrawalHandler],
]) {
  const request = makeRequest({})
  request.headers.origin = 'https://attacker.example'
  const response = makeResponse()
  await handler(request, response)
  assert.equal(response.statusCode, 403, `${name} must reject an untrusted origin.`)
}

{
  const response = makeResponse()
  await consentHandler(makeRequest({
    channel: 'checkout',
    consentType: 'unknown',
    contractLanguage: 'es',
    customerReference: 'ana@example.com',
    documentVersions: { generalTermsVersion: '1.0', projectOrderVersion: '1.0' },
    locale: 'es',
    orderId: 'CM-ORDER-123',
    timestamp: '2026-08-26T12:00:00.000Z',
    wording: 'Acepto las condiciones.',
    wordingVersion: 'checkout-consents-1.0',
  }), response)
  assert.equal(response.statusCode, 400, 'Consent evidence must reject an unknown consent type.')
}

{
  const previousUrl = process.env.SUPABASE_URL
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const previousFetch = globalThis.fetch
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  globalThis.fetch = async (_url, options) => {
    const payload = JSON.parse(options.body)
    assert.equal(payload.order_id, 'CM-ORDER-123')
    assert.equal(payload.consent_type, 'contract-acceptance')
    assert.equal(payload.locale, 'es')
    return new Response(JSON.stringify([{ id: 'consent-123', ...payload }]), {
      headers: { 'content-type': 'application/json' },
      status: 201,
    })
  }

  try {
    const response = makeResponse()
    await consentHandler(makeRequest({
      channel: 'checkout',
      consentType: 'contract-acceptance',
      contractLanguage: 'es',
      customerReference: 'ana@example.com',
      documentVersions: { generalTermsVersion: '1.0', projectOrderVersion: '1.0' },
      earlyStartRequested: false,
      locale: 'es',
      orderId: 'CM-ORDER-123',
      timestamp: '2026-08-26T12:00:00.000Z',
      wording: 'Acepto las condiciones.',
      wordingVersion: 'checkout-consents-1.0',
    }), response, { callRpc: async () => ({ body: true, ok: true }) })
    assert.equal(response.statusCode, 200)
    const receipt = JSON.parse(response.body)
    assert.equal(receipt.evidenceId, 'consent-123')
    assert.equal(receipt.stored, true)
    assert.ok(Number.isFinite(Date.parse(receipt.receivedAt)))
  } finally {
    globalThis.fetch = previousFetch
    if (previousUrl === undefined) delete process.env.SUPABASE_URL
    else process.env.SUPABASE_URL = previousUrl
    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey
  }
}

{
  const response = makeResponse()
  await contactHandler(makeRequest({ email: 'invalid', message: 'Help', name: 'Ana' }), response)
  assert.equal(response.statusCode, 400)
}

{
  const response = makeResponse()
  await withdrawalHandler(makeRequest({
    address: 'Calle Mayor 1',
    contact: 'ana@example.com',
    declaration: false,
    name: 'Ana',
    orderDate: '2026-08-01',
    orderReference: 'CM-1',
    submissionDate: '2026-08-10',
  }), response)
  assert.equal(response.statusCode, 400)
}

console.log('Public form validation checks passed.')
