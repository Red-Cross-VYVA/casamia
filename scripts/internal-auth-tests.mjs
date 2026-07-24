import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createInternalSessionToken, requireInternalApiKey } from '../api/_lib/supabase.js'
import middleware, { config } from '../middleware.ts'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const originalEnvironment = {
  CASAMIA_INTERNAL_API_KEY: process.env.CASAMIA_INTERNAL_API_KEY,
  CASAMIA_INTERNAL_PASSWORD: process.env.CASAMIA_INTERNAL_PASSWORD,
  CASAMIA_INTERNAL_SESSION_SECRET: process.env.CASAMIA_INTERNAL_SESSION_SECRET,
  CASAMIA_INTERNAL_USERNAME: process.env.CASAMIA_INTERNAL_USERNAME,
}

function restoreEnvironment() {
  for (const [name, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) {
      delete process.env[name]
    } else {
      process.env[name] = value
    }
  }
}

function basicCredentials(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
}

function createApiResponse() {
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

try {
  process.env.CASAMIA_INTERNAL_USERNAME = 'internal-admin'
  process.env.CASAMIA_INTERNAL_PASSWORD = 'strong-internal-password'
  process.env.CASAMIA_INTERNAL_API_KEY = 'internal-api-key'
  process.env.CASAMIA_INTERNAL_SESSION_SECRET = 'independent-session-secret'

  assert.deepEqual(
    config.matcher,
    ['/admin/config-preview'],
    'Only the legacy config-preview URL should use browser Basic Auth.',
  )

  for (const pathname of ['/internal', '/internal/service-catalog']) {
    assert.equal(
      middleware(new Request(`https://www.casamia.com.es${pathname}`)),
      undefined,
      `${pathname} should use the CasaMia password screen instead of browser Basic Auth.`,
    )
  }

  const missingCredentials = middleware(new Request('https://www.casamia.com.es/admin/config-preview'))
  assert.equal(missingCredentials?.status, 401)
  assert.match(missingCredentials?.headers.get('www-authenticate') ?? '', /^Basic\b/)

  const wrongCredentials = middleware(
    new Request('https://www.casamia.com.es/admin/config-preview', {
      headers: { authorization: basicCredentials('internal-admin', 'wrong-password') },
    }),
  )
  assert.equal(wrongCredentials?.status, 401)

  const validCredentials = middleware(
    new Request('https://www.casamia.com.es/admin/config-preview', {
      headers: { authorization: basicCredentials('internal-admin', 'strong-internal-password') },
    }),
  )
  assert.equal(validCredentials, undefined)

  const appSource = await readFile(resolve(projectRoot, 'src/App.tsx'), 'utf8')
  assert.match(appSource, /function InternalRoute[\s\S]*?<InternalAccessGate>/)
  assert.match(
    appSource,
    /function InternalRoute[\s\S]*<SEO[\s\S]*noindex[\s\S]*<InternalAccessGate>/,
    'Every internal route wrapper must publish noindex metadata.',
  )
  const internalRouteLines = appSource
    .split(/\r?\n/)
    .filter((line) => line.includes('<Route path="/internal'))
  assert.ok(internalRouteLines.length > 0, 'Expected internal routes to be registered.')
  assert.ok(
    internalRouteLines.every((line) => line.includes('<InternalRoute>') || line.includes('<Navigate')),
    'Every internal route must be gated or redirect immediately to a gated route.',
  )

  const estimateReportPage = await readFile(
    resolve(projectRoot, 'src/pages/EstimateReportPage.tsx'),
    'utf8',
  )
  assert.match(
    estimateReportPage,
    /<SEO[\s\S]*path=\{`\/estimate\/\$\{token\}`\}[\s\S]*noindex/,
    'Private estimate report links must publish noindex metadata.',
  )

  const publicProposalPage = await readFile(
    resolve(projectRoot, 'src/pages/PublicProposalPage.tsx'),
    'utf8',
  )
  assert.match(
    publicProposalPage,
    /<SEO[\s\S]*path=\{`\/proposal\/\$\{token\}`\}[\s\S]*noindex/,
    'Private proposal links must publish noindex metadata.',
  )

  const { token } = createInternalSessionToken()
  const authorizedResponse = createApiResponse()
  assert.equal(
    requireInternalApiKey({ headers: { authorization: `Bearer ${token}` } }, authorizedResponse),
    true,
    'A signed internal session should authorize protected API requests.',
  )

  const unauthorizedResponse = createApiResponse()
  assert.equal(requireInternalApiKey({ headers: {} }, unauthorizedResponse), false)
  assert.equal(unauthorizedResponse.statusCode, 401)

  const serviceCatalogueSource = await readFile(
    resolve(projectRoot, 'api/internal/service-catalogue.js'),
    'utf8',
  )
  assert.match(
    serviceCatalogueSource,
    /requireInternalApiKey\(request, response\)/,
    'The internal service catalogue API must keep enforcing signed sessions.',
  )

  console.log('Internal authentication checks passed.')
} finally {
  restoreEnvironment()
}
