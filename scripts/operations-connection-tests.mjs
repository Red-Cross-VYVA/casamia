import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import assessmentHandler from '../api/internal/assessment-requests.js'
import dashboardHandler from '../api/internal/dashboard.js'
import orderQueueHandler from '../api/internal/orders.js'
import providerQueueHandler from '../api/internal/provider-applications.js'
import internalCatalogueHandler from '../api/internal/service-catalogue.js'
import proposalHandler from '../api/proposals.js'
import publicOrderHandler from '../api/public/orders.js'
import publicProviderHandler from '../api/public/provider-applications.js'
import publicProposalHandler from '../api/public/proposals/[token].js'
import publicProposalAcceptHandler from '../api/public/proposals/[token]/accept.js'
import publicProposalDraftHandler from '../api/public/proposal-drafts.js'
import publicCatalogueHandler from '../api/public/service-catalogue.js'
import { createSignedStorageUploadUrl } from '../api/_lib/supabase.js'

const apiKey = 'operations-test-key'
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
  request.query = {}
  return request
}

function parsedBody(response) {
  return response.body ? JSON.parse(response.body) : undefined
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  })
}

{
  const response = makeResponse()
  await proposalHandler(makeRequest('GET', undefined, false), response)
  assert.equal(response.statusCode, 401)
}

{
  const proposalId = 'CM-PROP-TEST'
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ init, url: String(url) })
    if (init.method === 'GET') return jsonResponse([])
    const submitted = JSON.parse(String(init.body))
    return jsonResponse([{ ...submitted }])
  }

  const response = makeResponse()
  await proposalHandler(makeRequest('POST', {
    customer_email: 'ana@example.com',
    customer_name: 'Ana Lopez',
    id: proposalId,
    selected_plan: 'Home adaptations',
    total_estimate: 1499,
  }), response)

  const proposal = parsedBody(response)
  assert.equal(response.statusCode, 200)
  assert.equal(proposal.id, proposalId)
  assert.equal(proposal.customer_email, 'ana@example.com')
  assert.match(proposal.public_token, /^[A-Za-z0-9_-]{20,128}$/)
  assert.match(calls[0].url, /proposals\?id=eq\.CM-PROP-TEST/)
  assert.match(calls[1].url, /proposals\?on_conflict=id/)
}

{
  const token = 'abcdefghijklmnopqrstuvwx'
  globalThis.fetch = async (url, init) => {
    assert.equal(init.method, 'GET')
    assert.match(String(url), new RegExp(`public_token=eq\\.${token}`))
    return jsonResponse([{
      id: 'CM-PROP-PUBLIC',
      public_token: token,
      status: 'Sent',
      customer_name: 'Ana Lopez',
      payload_json: { selected_plan: 'Home adaptations' },
    }])
  }
  const request = makeRequest('GET', undefined, false)
  request.query = { token }
  const response = makeResponse()
  await publicProposalHandler(request, response)
  assert.equal(response.statusCode, 200)
  assert.equal(parsedBody(response).customer_name, 'Ana Lopez')
}

{
  globalThis.fetch = async () => {
    throw new Error('Invalid proposal draft requests should be rejected before catalogue lookup.')
  }

  const response = makeResponse()
  await publicProposalDraftHandler(makeRequest('POST', {}, false), response)

  assert.equal(response.statusCode, 400)
  assert.match(parsedBody(response).message, /Name and email are required/)
}

{
  globalThis.fetch = async (url, init) => {
    throw new Error(`Consent validation should not require catalogue lookup: ${url} ${init?.method}`)
  }

  const response = makeResponse()
  await publicProposalDraftHandler(makeRequest('POST', {
    consent: false,
    customer: { email: 'ana@example.com', name: 'Ana Lopez' },
    selection: {
      'bath-core-package': { addOnOutcomeIds: [], quantity: 1, selected: true },
    },
  }, false), response)

  assert.equal(response.statusCode, 400)
  assert.match(parsedBody(response).message, /Consent is required/)
}

{
  let submitted
  globalThis.fetch = async (url, init) => {
    const requestUrl = String(url)

    if (requestUrl.includes('service_catalogue')) {
      assert.equal(init.method, 'GET')
      return jsonResponse([{ payload_json: { services: [{ active: true, id: 'legacy-bathroom', room: 'bathroom' }] } }])
    }

    if (requestUrl.includes('proposals?id=eq')) {
      if (init.method === 'GET') return jsonResponse([])
      if (init.method === 'PATCH') {
        const deliveryPatch = JSON.parse(String(init.body))
        return jsonResponse([{ ...submitted, payload_json: { ...submitted.payload_json, ...deliveryPatch.payload_json } }])
      }
    }

    assert.match(requestUrl, /proposals\?on_conflict=id/)
    submitted = JSON.parse(String(init.body))
    return jsonResponse([{ ...submitted }])
  }

  const response = makeResponse()
  await publicProposalDraftHandler(makeRequest('POST', {
    catalogueSnapshot: makePlansCataloguePayload(),
    consent: true,
    customer: { email: 'ana@example.com', name: 'Ana Lopez' },
    language: 'en',
    selection: {
      'bath-core-package': { addOnOutcomeIds: [], quantity: 1, selected: true },
    },
  }, false), response)

  const body = parsedBody(response)
  assert.equal(response.statusCode, 200)
  assert.equal(submitted.payload_json.plans_builder.catalogue_source, 'client-snapshot-fallback')
  assert.equal(submitted.payload_json.total_estimate, 121)
  assert.match(body.publicToken, /^[A-Za-z0-9_-]{20,128}$/)
}

{
  globalThis.fetch = async (url, init) => {
    assert.equal(init.method, 'GET')
    assert.match(String(url), /service_catalogue\?id=eq\.default/)
    return jsonResponse([{ payload_json: makePlansCataloguePayload() }])
  }

  const response = makeResponse()
  await publicProposalDraftHandler(makeRequest('POST', {
    consent: true,
    customer: { email: 'ana@example.com', name: 'Ana Lopez' },
    selection: 'not-valid',
  }, false), response)

  assert.equal(response.statusCode, 400)
  assert.match(parsedBody(response).message, /Select at least one/)
}

{
  let submitted
  globalThis.fetch = async (url, init) => {
    const requestUrl = String(url)

    if (requestUrl.includes('service_catalogue')) {
      assert.equal(init.method, 'GET')
      return jsonResponse([{ payload_json: makePlansCataloguePayload() }])
    }

    if (requestUrl.includes('proposals?id=eq')) {
      if (init.method === 'GET') return jsonResponse([])
      if (init.method === 'PATCH') {
        const deliveryPatch = JSON.parse(String(init.body))
        return jsonResponse([{ ...submitted, payload_json: { ...submitted.payload_json, ...deliveryPatch.payload_json } }])
      }
    }

    assert.match(requestUrl, /proposals\?on_conflict=id/)
    submitted = JSON.parse(String(init.body))
    return jsonResponse([{ ...submitted }])
  }

  const response = makeResponse()
  await publicProposalDraftHandler(makeRequest('POST', {
    consent: true,
    customer: {
      email: 'ana@example.com',
      name: 'Ana Lopez',
      phone: '+34 600 000 000',
    },
    language: 'en',
    selection: {
      'bath-core-package': {
        addOnOutcomeIds: ['bath-connected-sensor', 'bath-quote-entry'],
        quantity: 2,
        selected: true,
      },
    },
    total_estimate: 1,
  }, false), response)

  const body = parsedBody(response)
  assert.equal(response.statusCode, 200)
  assert.equal(submitted.status, 'Sent')
  assert.equal(submitted.total_estimate, 334, 'Public draft totals must include the server-side installation saving.')
  assert.equal(submitted.payload_json.total_estimate, 334)
  assert.equal(submitted.payload_json.acceptance_status, 'Sent')
  assert.equal(submitted.payload_json.plans_builder.recurring_monthly_estimate, 24)
  assert.deepEqual(submitted.payload_json.plans_builder.review_items, ['Shower entry review'])
  assert.match(body.publicToken, /^[A-Za-z0-9_-]{20,128}$/)
  assert.equal(body.proposal.status, 'Sent')
  assert.equal(body.publicUrl, `/proposal/${body.publicToken}`)
}

{
  const token = 'draftproposalaccepttoken'
  globalThis.fetch = async (url, init) => {
    assert.equal(init.method, 'GET')
    assert.match(String(url), new RegExp(`public_token=eq\\.${token}`))
    return jsonResponse([{
      customer_email: 'ana@example.com',
      customer_name: 'Ana Lopez',
      id: 'CM-DRAFT-PLAN',
      public_token: token,
      status: 'Draft',
      total_estimate: 334,
      payload_json: {
        acceptance_status: 'Not Sent',
        customer_email: 'ana@example.com',
        customer_name: 'Ana Lopez',
        id: 'CM-DRAFT-PLAN',
        public_token: token,
        status: 'Draft',
      },
    }])
  }
  const request = makeRequest('POST', { accepted_by: 'Ana Lopez' }, false)
  request.query = { token }
  const response = makeResponse()
  await publicProposalAcceptHandler(request, response)
  assert.equal(response.statusCode, 409)
  assert.match(parsedBody(response).message, /not ready for online acceptance/)
}

{
  let submitted
  let requestUrl = ''
  globalThis.fetch = async (url, init) => {
    requestUrl = String(url)
    submitted = JSON.parse(String(init.body))
    return jsonResponse([{ id: 'order-db-id', ...submitted }])
  }
  const response = makeResponse()
  await publicOrderHandler(makeRequest('POST', {
    email: 'ana@example.com',
    name: 'Ana Lopez',
    orderId: 'CM-2026-ORDER1',
    planId: 'grab-bar',
    planLabel: '3 selected improvements',
    consentRecords: [{ accepted: true, label: 'Permission to contact customer' }],
    selectedServices: [{ serviceId: 'grab-bar' }],
    status: 'Quote requested',
  }, false), response)

  assert.equal(response.statusCode, 200)
  assert.match(requestUrl, /orders\?on_conflict=order_id/)
  assert.equal(submitted.order_id, 'CM-2026-ORDER1')
  assert.equal(submitted.customer_email, 'ana@example.com')
  assert.equal(parsedBody(response).status, 'Quote requested')
}

{
  let submitted
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /provider_applications$/)
    submitted = JSON.parse(String(init.body))
    return jsonResponse([{ id: 'provider-db-id', ...submitted }])
  }
  const response = makeResponse()
  await publicProviderHandler(makeRequest('POST', {
    businessName: 'Madrid Access SL',
    cities: ['Madrid'],
    contactName: 'Luis Martin',
    email: 'luis@example.com',
    experience: 'Ten years installing accessibility adaptations.',
    id: 'PPA-TEST-1',
    insuranceConfirmed: true,
    phone: '+34 600 000 000',
    trades: ['Bathroom adaptations'],
  }, false), response)
  assert.equal(response.statusCode, 200)
  assert.equal(submitted.application_id, 'PPA-TEST-1')
  assert.equal(submitted.business_name, 'Madrid Access SL')
}

{
  const service = { active: true, id: 'grab-bar', name: 'Grab bar', room: 'bathroom' }
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /service_catalogue\?on_conflict=id/)
    const submitted = JSON.parse(String(init.body))
    assert.deepEqual(submitted.payload_json.services, [service])
    return jsonResponse([submitted])
  }
  const saveResponse = makeResponse()
  await internalCatalogueHandler(makeRequest('PUT', { services: [service] }), saveResponse)
  assert.equal(saveResponse.statusCode, 200)
  assert.deepEqual(parsedBody(saveResponse).services, [service])

  globalThis.fetch = async (url, init) => {
    assert.equal(init.method, 'GET')
    assert.match(String(url), /service_catalogue\?id=eq\.default/)
    return jsonResponse([{ payload_json: { services: [service] }, updated_at: '2026-07-17T12:00:00.000Z' }])
  }
  const publicResponse = makeResponse()
  await publicCatalogueHandler(makeRequest('GET', undefined, false), publicResponse)
  assert.equal(publicResponse.statusCode, 200)
  assert.deepEqual(parsedBody(publicResponse).services, [service])
}

{
  const configuredUrls = [
    'https://example.supabase.co/',
    'https://example.supabase.co/rest/v1',
    'https://example.supabase.co/rest/v1/',
  ]

  for (const configuredUrl of configuredUrls) {
    process.env.SUPABASE_URL = configuredUrl
    let requestUrl = ''
    globalThis.fetch = async (url, init) => {
      requestUrl = String(url)
      assert.equal(init.method, 'GET')
      return jsonResponse([])
    }

    const response = makeResponse()
    await publicCatalogueHandler(makeRequest('GET', undefined, false), response)

    assert.equal(response.statusCode, 200)
    assert.equal(
      requestUrl,
      'https://example.supabase.co/rest/v1/service_catalogue?id=eq.default&select=id,updated_at,payload_json',
      `SUPABASE_URL=${configuredUrl} should resolve to the canonical REST endpoint.`,
    )
  }

  process.env.SUPABASE_URL = 'https://example.supabase.co/rest/v1/'
  let storageRequestUrl = ''
  globalThis.fetch = async (url, init) => {
    storageRequestUrl = String(url)
    assert.equal(init.method, 'POST')
    return jsonResponse({
      url: '/object/upload/sign/wizard-media/assessment/photo.jpg?token=signed-token',
    })
  }

  const signedUpload = await createSignedStorageUploadUrl('wizard-media', 'assessment/photo.jpg')

  assert.equal(
    storageRequestUrl,
    'https://example.supabase.co/storage/v1/object/upload/sign/wizard-media/assessment/photo.jpg',
  )
  assert.equal(
    signedUpload.body.signedUrl,
    'https://example.supabase.co/storage/v1/object/upload/sign/wizard-media/assessment/photo.jpg?token=signed-token',
  )
  process.env.SUPABASE_URL = 'https://example.supabase.co'
}

{
  const records = {
    assessment_requests: [{ id: 'assessment-1', status: 'New' }],
    contact_requests: [{ id: 'callback-1', status: 'Contacting' }],
    orders: [{ id: 'order-1', status: 'Quote requested' }],
    proposals: [{ id: 'proposal-1', status: 'Draft' }],
    provider_applications: [{ id: 'provider-1', status: 'reviewing' }],
    service_catalogue: [{ payload_json: { services: [{ active: true }, { active: false }] } }],
  }
  globalThis.fetch = async (url) => {
    const table = new URL(String(url)).pathname.split('/').at(-1)
    return jsonResponse(records[table] ?? [])
  }
  const response = makeResponse()
  await dashboardHandler(makeRequest('GET'), response)
  const data = parsedBody(response)
  assert.equal(response.statusCode, 200)
  assert.deepEqual(data.issues, [])
  assert.deepEqual(data.stats, {
    activeServices: 1,
    newAssessments: 1,
    newCustomerPlans: 1,
    openCallbacks: 1,
    pendingProposals: 1,
    providerLeads: 1,
  })
}

{
  const queueChecks = [
    [assessmentHandler, 'assessment_requests', 'requests'],
    [orderQueueHandler, 'orders', 'orders'],
    [providerQueueHandler, 'provider_applications', 'applications'],
  ]
  for (const [handler, table, collection] of queueChecks) {
    globalThis.fetch = async (url, init) => {
      assert.equal(init.method, 'GET')
      assert.match(String(url), new RegExp(`${table}\\?`))
      return jsonResponse([])
    }
    const response = makeResponse()
    await handler(makeRequest('GET'), response)
    assert.equal(response.statusCode, 200)
    assert.deepEqual(parsedBody(response)[collection], [])
  }
}

function makePlansCataloguePayload() {
  return {
    masterCatalogue: {
      capabilities: [],
      outcomes: [
        makePlansOutcome({ id: 'bath-core-grip', sortOrder: 10 }),
        makePlansOutcome({ id: 'bath-connected-sensor', sortOrder: 20 }),
        makePlansOutcome({
          customerName: { en: 'Shower entry review', es: 'Revision de entrada de ducha' },
          id: 'bath-quote-entry',
          pricingType: 'quote',
          requiresQuote: true,
          sortOrder: 30,
        }),
      ],
      packages: [
        makePlansPackage({
          fixedPrice: 100,
          id: 'bath-core-package',
          pricingType: 'fixed',
          section: 'home-safety-package',
          sortOrder: 10,
        }),
        makePlansPackage({
          fromPrice: 50,
          id: 'bath-connected-package',
          pricingType: 'range',
          recurringMonthlyPrice: 10,
          section: 'connected-room',
          sortOrder: 20,
        }),
        makePlansPackage({
          id: 'bath-specialist-package',
          pricingType: 'quote',
          requiresQuote: true,
          section: 'optional-adaptations',
          sortOrder: 30,
        }),
      ],
      products: [],
      relations: [
        makePlansRelation('bath-core-package', 'bath-core-grip', 10),
        makePlansRelation('bath-connected-package', 'bath-connected-sensor', 20),
        makePlansRelation('bath-specialist-package', 'bath-quote-entry', 30),
      ],
      rooms: [
        { active: true, id: 'bathroom', name: { en: 'Bathroom', es: 'Bano' }, slug: 'bathroom', sortOrder: 10 },
      ],
      sections: [],
      tasks: [],
      updatedAt: '2026-08-02T00:00:00.000Z',
      version: 'test',
    },
    packageConfigs: [],
  }
}

function makePlansPackage(patch) {
  return {
    active: true,
    customerBenefit: { en: 'Benefit', es: 'Beneficio' },
    customerName: { en: 'Bathroom package', es: 'Paquete de bano' },
    fixedPrice: undefined,
    fromPrice: undefined,
    id: 'package',
    internalName: 'Package',
    pricingType: 'from',
    proposalVisible: true,
    recurringMonthlyPrice: undefined,
    requiresQuote: false,
    roomId: 'bathroom',
    section: 'home-safety-package',
    shortDescription: { en: 'Package description.', es: 'Descripcion del paquete.' },
    slug: 'package',
    sortOrder: 10,
    vatRate: 0.21,
    websiteVisible: true,
    ...patch,
  }
}

function makePlansOutcome(patch) {
  return {
    active: true,
    customerBenefit: { en: 'Benefit', es: 'Beneficio' },
    customerName: { en: 'Outcome', es: 'Resultado' },
    fixedPrice: undefined,
    fromPrice: undefined,
    grantEligible: false,
    id: 'outcome',
    internalName: 'Outcome',
    pricingType: 'included-in-package',
    proposalVisible: true,
    requiresCompatibilityCheck: false,
    requiresMeasurement: false,
    requiresQuote: false,
    requiresSiteVisit: false,
    roomId: 'bathroom',
    shortDescription: { en: 'Outcome description.', es: 'Descripcion del resultado.' },
    slug: 'outcome',
    sortOrder: 10,
    vatRate: 0.21,
    websiteVisible: true,
    ...patch,
  }
}

function makePlansRelation(fromId, toId, sortOrder) {
  return {
    active: true,
    fromId,
    id: `${fromId}-${toId}`,
    sortOrder,
    toId,
    type: 'packageOutcome',
  }
}

console.log('Core operations connection checks passed.')
