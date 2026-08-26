import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import assessmentHandler from '../api/internal/assessment-requests.js'
import dashboardHandler from '../api/internal/dashboard.js'
import dataQualityHandler, { isCompletelyBlankLegacyRecord } from '../api/internal/data-quality.js'
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
import { mapPublicAgreementRecord } from '../api/_lib/agreements.js'
import { mapPublicProposalRecord } from '../api/_lib/proposals.js'
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
    host: 'localhost:5173',
    origin: 'http://localhost:5173',
    'x-forwarded-proto': 'http',
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
  }, false), response, { callRpc: async () => ({ body: true, ok: true }) })

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
  }, false), response, { callRpc: async () => ({ body: true, ok: true }) })

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
  }, false), response, { callRpc: async () => ({ body: true, ok: true }) })

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
  }, false), response, { callRpc: async () => ({ body: true, ok: true }) })

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
  assert.equal('delivery' in body.proposal, false)
  assert.equal('events' in body.proposal, false)
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
  }, false), response, { callRpc: async () => ({ body: true, ok: true }) })

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
  }, false), response, { callRpc: async () => ({ body: true, ok: true }) })
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

{
  const publicAgreement = mapPublicAgreementRecord({
    assigned_at: '2026-08-26T12:00:00.000Z',
    assigned_by: 'Internal operator',
    assignment_id: 'AGR-PUBLIC',
    document_id: 'installation-partner-agreement',
    expires_at: '2026-09-26T12:00:00.000Z',
    locale: 'es',
    partner_business_name: 'Instalaciones Demo SL',
    partner_contact_name: 'Ana Lopez',
    partner_email: 'ana@example.com',
    partner_id: 'PPA-INTERNAL',
    payload_json: {
      auditEvents: [{ actor: 'Internal operator', details: 'Internal note', eventType: 'assigned' }],
    },
    signature_status: 'not-started',
    status: 'sent',
  })
  assert.equal(publicAgreement.partnerEmail, 'ana@example.com')
  assert.deepEqual(publicAgreement.auditEvents, [])
  assert.equal('assignedBy' in publicAgreement, false)
  assert.equal('partnerId' in publicAgreement, false)
  assert.equal('publicToken' in publicAgreement, false)
}

{
  const publicProposal = mapPublicProposalRecord({
    customer_email: 'ana@example.com',
    customer_name: 'Ana',
    id: 'CM-PROP-PUBLIC',
    payload_json: {
      delivery: { proposalEmail: { provider: 'resend', status: 'sent' } },
      events: [{ at: '2026-08-26T12:00:00.000Z', detail: 'Internal delivery detail', type: 'sent' }],
      internal_notes: 'Do not disclose',
      line_items: [],
      status: 'Sent',
    },
    public_token: 'public-token-for-test-123456',
    status: 'Sent',
  })
  assert.equal(publicProposal.customer_email, 'ana@example.com')
  assert.equal('delivery' in publicProposal, false)
  assert.equal('events' in publicProposal, false)
  assert.equal('internal_notes' in publicProposal, false)
}

{
  assert.equal(isCompletelyBlankLegacyRecord('provider', {
    business_name: '', cities: [], contact_name: '', email: '', experience: '', phone: '', trades: [],
  }), true)
  assert.equal(isCompletelyBlankLegacyRecord('provider', {
    business_name: 'Madrid Access SL', cities: [], contact_name: '', email: '', experience: '', phone: '', trades: [],
  }), false)
  assert.equal(isCompletelyBlankLegacyRecord('order', {
    customer_email: '', customer_name: '', customer_phone: '', payload_json: {}, plan_id: '', plan_label: '',
  }), true)
  assert.equal(isCompletelyBlankLegacyRecord('order', {
    customer_email: '', customer_name: '', customer_phone: '', payload_json: { notes: 'Call customer' }, plan_id: '', plan_label: '',
  }), false)
  assert.equal(isCompletelyBlankLegacyRecord('consent', {
    channel: '', consent_type: '', contract_language: '', customer_reference: '', locale: '', metadata_json: {},
    order_id: '', project_order_version: '', terms_version: '', wording: '', wording_version: '', withdrawal_version: '',
  }), true)
  assert.equal(isCompletelyBlankLegacyRecord('consent', {
    channel: '', consent_type: 'contract-acceptance', contract_language: '', customer_reference: '', locale: '', metadata_json: {},
    order_id: '', project_order_version: '', terms_version: '', wording: '', wording_version: '', withdrawal_version: '',
  }), false)
}

{
  const records = {
    consent_evidence: [{ channel: '', consent_type: '', contract_language: '', customer_reference: '', id: 'consent-blank', locale: '', metadata_json: {}, order_id: '', project_order_version: '', terms_version: '', timestamp: '2026-08-26T00:00:00Z', wording: '', wording_version: '', withdrawal_version: '' }],
    contact_requests: [
      { customer_email: '', customer_name: '', customer_phone: '', id: 'contact-blank', message: '', submitted_at: '2026-08-26T00:00:00Z' },
      { customer_email: 'ana@example.com', customer_name: 'Ana', customer_phone: '', id: 'contact-valid', message: 'Help' },
    ],
    orders: [{ customer_email: '', customer_name: '', customer_phone: '', id: 'order-db', order_id: 'CM-BLANK', payload_json: {}, plan_id: '', plan_label: '' }],
    provider_applications: [{ application_id: 'PPA-BLANK', business_name: '', cities: [], contact_name: '', email: '', experience: '', phone: '', trades: [] }],
    withdrawal_requests: [{ contact: '', customer_name: '', id: 'withdrawal-blank', installation_address: '', order_date: '', order_reference: '', submission_date: '' }],
  }
  globalThis.fetch = async (url, init) => {
    assert.equal(init.method, 'GET')
    const table = new URL(String(url)).pathname.split('/').at(-1)
    return jsonResponse(records[table] ?? [])
  }
  const response = makeResponse()
  await dataQualityHandler(makeRequest('GET'), response)
  assert.equal(response.statusCode, 200)
  assert.deepEqual(parsedBody(response).records.map((record) => record.reference), [
    'consent-blank', 'contact-blank', 'CM-BLANK', 'PPA-BLANK', 'withdrawal-blank',
  ])
}

{
  let deleted = false
  globalThis.fetch = async (url, init) => {
    if (init.method === 'GET') {
      return jsonResponse([{ application_id: 'PPA-BLANK', business_name: '', cities: [], contact_name: '', email: '', experience: '', phone: '', trades: [] }])
    }
    assert.equal(init.method, 'DELETE')
    assert.match(String(url), /provider_applications\?application_id=eq\.PPA-BLANK/)
    deleted = true
    return jsonResponse([{ application_id: 'PPA-BLANK' }])
  }
  const response = makeResponse()
  await dataQualityHandler(makeRequest('DELETE', {
    confirmation: 'DELETE BLANK RECORD', kind: 'provider', recordKey: 'PPA-BLANK',
  }), response)
  assert.equal(response.statusCode, 200)
  assert.equal(parsedBody(response).deleted, true)
  assert.equal(deleted, true)
}

{
  let deleted = false
  globalThis.fetch = async (url, init) => {
    if (init.method === 'GET') {
      return jsonResponse([{
        channel: '', consent_type: '', contract_language: '', customer_reference: '', id: 'consent-blank',
        locale: '', metadata_json: {}, order_id: '', project_order_version: '', terms_version: '',
        timestamp: '2026-08-26T00:00:00Z', wording: '', wording_version: '', withdrawal_version: '',
      }])
    }
    assert.equal(init.method, 'DELETE')
    assert.match(String(url), /consent_evidence\?id=eq\.consent-blank/)
    deleted = true
    return jsonResponse([{ id: 'consent-blank' }])
  }
  const response = makeResponse()
  await dataQualityHandler(makeRequest('DELETE', {
    confirmation: 'DELETE BLANK RECORD', kind: 'consent', recordKey: 'consent-blank',
  }), response)
  assert.equal(response.statusCode, 200)
  assert.equal(parsedBody(response).deleted, true)
  assert.equal(deleted, true)
}

{
  globalThis.fetch = async () => jsonResponse([{
    application_id: 'PPA-VALID', business_name: 'Madrid Access SL', cities: [], contact_name: '', email: '', experience: '', phone: '', trades: [],
  }])
  const response = makeResponse()
  await dataQualityHandler(makeRequest('DELETE', {
    confirmation: 'DELETE BLANK RECORD', kind: 'provider', recordKey: 'PPA-VALID',
  }), response)
  assert.equal(response.statusCode, 409)
  assert.match(parsedBody(response).message, /contains customer or operational data/)
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
