import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { Readable } from 'node:stream'

import handler from '../api/public/meta-events.js'
import { sendMetaConversionEvent } from '../api/_lib/meta-conversions.js'

const request = {
  headers: {
    host: 'www.casamia.com.es',
    origin: 'https://www.casamia.com.es',
    'user-agent': 'CasaMia test browser',
    'x-forwarded-for': '203.0.113.10',
    'x-forwarded-proto': 'https',
  },
}

let graphRequest
const delivered = await sendMetaConversionEvent({
  env: {
    META_CONVERSIONS_API_ACCESS_TOKEN: 'server-secret-token',
    META_CONVERSIONS_API_TEST_EVENT_CODE: 'TEST123',
    META_GRAPH_API_VERSION: 'v26.0',
    META_PIXEL_ID: '123456789',
  },
  event: {
    customData: { content_name: 'assessment_visit', currency: 'EUR' },
    eventId: 'shared-event-id',
    eventName: 'Lead',
    eventSourceUrl: 'https://www.casamia.com.es/home-safety-assessment',
    fbc: 'fb.1.123.click',
    fbp: 'fb.1.123.browser',
  },
  fetchImpl: async (url, init) => {
    graphRequest = { init, url }
    return new Response(JSON.stringify({ events_received: 1 }), { status: 200 })
  },
  request,
})

assert.equal(delivered.ok, true)
assert.equal(delivered.configured, true)
assert.equal(graphRequest.url, 'https://graph.facebook.com/v26.0/123456789/events')
assert.equal(graphRequest.init.headers.Authorization, 'Bearer server-secret-token')
const graphBody = JSON.parse(graphRequest.init.body)
assert.equal(graphBody.data[0].event_id, 'shared-event-id')
assert.equal(graphBody.data[0].event_name, 'Lead')
assert.equal(graphBody.data[0].action_source, 'website')
assert.equal(graphBody.data[0].user_data.client_ip_address, '203.0.113.10')
assert.equal(graphBody.data[0].user_data.client_user_agent, 'CasaMia test browser')
assert.equal(graphBody.test_event_code, 'TEST123')
assert.doesNotMatch(graphRequest.init.body, /server-secret-token/)

const disabled = await sendMetaConversionEvent({ event: {}, env: {}, request })
assert.deepEqual(disabled, { configured: false, ok: true })

const response = createResponse()
let endpointGraphCalls = 0
await handler(createRequest({
  body: {
    customData: { content_name: 'wizard' },
    eventId: 'endpoint-event-id',
    eventName: 'Lead',
    eventSourceUrl: 'https://www.casamia.com.es/home-safety-wizard',
    marketingConsent: true,
  },
  method: 'POST',
}), response, {
  callRpc: async () => ({ body: true, ok: true }),
  env: {
    CASAMIA_PUBLIC_WRITE_RATE_LIMIT_SALT: 'rate-limit-test-secret',
    META_CONVERSIONS_API_ACCESS_TOKEN: 'token',
    META_PIXEL_ID: 'pixel',
    NODE_ENV: 'production',
  },
  fetchImpl: async () => {
    endpointGraphCalls += 1
    return new Response(JSON.stringify({ events_received: 1 }), { status: 200 })
  },
})
assert.equal(response.statusCode, 202)
assert.equal(response.body.received, true)
assert.equal(endpointGraphCalls, 1)

const rejectedResponse = createResponse()
await handler(createRequest({
  body: {
    eventId: 'bad-event',
    eventName: 'Lead',
    eventSourceUrl: 'https://evil.example/',
    marketingConsent: true,
  },
  method: 'POST',
}), rejectedResponse, { env: { NODE_ENV: 'production' } })
assert.equal(rejectedResponse.statusCode, 400)

const source = await readFile(new URL('../src/utils/metaTracking.ts', import.meta.url), 'utf8')
assert.match(source, /hasCookieConsent\('marketing'\)/)
assert.match(source, /\{ eventID: eventId \}/)
assert.match(source, /eventId,\s*eventName/)
assert.match(source, /payment_completed[\s\S]*Purchase/)
assert.match(source, /appointment_scheduled[\s\S]*Schedule/)

console.log('Meta Pixel and Conversions API checks passed.')

function createRequest({ body, method }) {
  const stream = Readable.from([JSON.stringify(body)])
  stream.headers = request.headers
  stream.method = method
  return stream
}

function createResponse() {
  return {
    body: undefined,
    headers: {},
    statusCode: 200,
    end(body) {
      if (body) this.body = JSON.parse(body)
    },
    json(body) {
      this.body = body
      return this
    },
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
  }
}
