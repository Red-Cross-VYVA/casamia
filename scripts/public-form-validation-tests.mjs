import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import contactHandler from '../api/public/contact-requests.js'
import orderHandler from '../api/public/orders.js'
import providerHandler from '../api/public/provider-applications.js'
import withdrawalHandler from '../api/withdrawal-requests.js'

function makeRequest(body) {
  const request = Readable.from([JSON.stringify(body)])
  request.headers = { 'content-type': 'application/json' }
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
  ['contact', contactHandler],
  ['order', orderHandler],
  ['provider', providerHandler],
  ['withdrawal', withdrawalHandler],
]) {
  const response = makeResponse()
  await handler(makeRequest({}), response)
  assert.equal(response.statusCode, 400, `${name} must reject an empty public submission.`)
  assert.match(JSON.parse(response.body).message, /required|Complete/)
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
