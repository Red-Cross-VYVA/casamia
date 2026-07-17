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
import publicCatalogueHandler from '../api/public/service-catalogue.js'

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
    planLabel: '3 selected improvements',
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
    contactName: 'Luis Martin',
    email: 'luis@example.com',
    id: 'PPA-TEST-1',
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

console.log('Core operations connection checks passed.')
