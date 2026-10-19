import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { getRequestQueryValue } from '../api/_lib/request-query.js'
import proposalHandler from '../api/public/proposals/[token].js'
import agreementHandler from '../api/public/agreements/[token].js'

function lazyRequest(url) {
  return Object.defineProperty({ method: 'GET', url }, 'query', {
    get() { throw new Error('The deprecated Vercel query getter was invoked.') },
  })
}

assert.equal(getRequestQueryValue(lazyRequest('/api/test?token=first&token=second'), 'token'), 'first')
assert.equal(getRequestQueryValue(lazyRequest('/api/test?name=Ana+L%C3%B3pez&empty='), 'name'), 'Ana López')
assert.equal(getRequestQueryValue(lazyRequest('/api/test?empty='), 'empty'), '')
assert.equal(getRequestQueryValue(lazyRequest('https://example.com/api/test?code=a%2Bb'), 'code'), 'a+b')
assert.equal(getRequestQueryValue(lazyRequest('/api/test'), 'missing'), '')
assert.equal(getRequestQueryValue({ url: 'http://[' }, 'token'), '')
assert.equal(getRequestQueryValue({}, 'token'), '')
assert.equal(getRequestQueryValue({ query: { token: ['first', 'second'] } }, 'token'), 'first')
assert.equal(getRequestQueryValue({ query: { token: 'route-token' }, url: '/?token=query-token' }, 'token'), 'route-token')
assert.equal(getRequestQueryValue({ query: {}, url: '/?token=url-token' }, 'token'), 'url-token')

function makeResponse() {
  return {
    statusCode: 200,
    status(value) { this.statusCode = value; return this },
    setHeader() { return this },
    end(body) { this.body = body },
  }
}

const originalFetch = globalThis.fetch
const envKeys = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const originalEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]))
try {
  process.env.SUPABASE_URL = 'https://query-tests.example.invalid'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'query-tests-only'
  for (const [handler, route, table] of [
    [proposalHandler, 'proposals', 'proposals'],
    [agreementHandler, 'agreements', 'agreement_assignments'],
  ]) {
    const invalidResponse = makeResponse()
    await handler(lazyRequest(`/api/public/${route}/invalid?token=invalid`), invalidResponse)
    assert.equal(invalidResponse.statusCode, 404)

    const token = 'query_regression_token_0123456789abcdef'
    const lookups = []
    globalThis.fetch = async (input) => {
      lookups.push(new URL(input))
      return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const response = makeResponse()
    await handler(lazyRequest(`/api/public/${route}/${token}?token=${token}`), response)
    assert.equal(response.statusCode, 404, 'A missing record must remain a 404.')
    assert.equal(lookups.length, 1, 'A valid URL token must reach the database lookup.')
    assert.equal(lookups[0].pathname, `/rest/v1/${table}`)
    if (route === 'proposals') {
      assert.equal(lookups[0].searchParams.get('public_token'), `eq.${token}`)
    } else {
      const tokenHash = createHash('sha256').update(token).digest('hex')
      assert.equal(lookups[0].searchParams.get('share_token_hash'), `eq.${tokenHash}`)
      assert.equal(lookups[0].searchParams.get('share_enabled'), 'eq.true')
    }
  }
} finally {
  globalThis.fetch = originalFetch
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key]
    else process.env[key] = originalEnv[key]
  }
}

console.log('Request query parsing checks passed without invoking legacy URL helpers.')
