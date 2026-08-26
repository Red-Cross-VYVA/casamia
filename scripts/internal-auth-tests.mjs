import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  createInternalSessionToken,
  createPartnerSessionToken,
  getPartnerCredentialConfiguration,
  requireInternalApiKey,
  requirePartnerApiKey,
  verifyPartnerCredentials,
} from '../api/_lib/supabase.js'
import middleware, { config } from '../middleware.ts'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const originalEnvironment = {
  CASAMIA_INTERNAL_API_KEY: process.env.CASAMIA_INTERNAL_API_KEY,
  CASAMIA_INTERNAL_PASSWORD: process.env.CASAMIA_INTERNAL_PASSWORD,
  CASAMIA_INTERNAL_SESSION_SECRET: process.env.CASAMIA_INTERNAL_SESSION_SECRET,
  CASAMIA_INTERNAL_USERNAME: process.env.CASAMIA_INTERNAL_USERNAME,
  CASAMIA_PARTNER_PASSWORD: process.env.CASAMIA_PARTNER_PASSWORD,
  CASAMIA_PARTNER_EMAIL: process.env.CASAMIA_PARTNER_EMAIL,
  CASAMIA_PARTNER_CREDENTIALS: process.env.CASAMIA_PARTNER_CREDENTIALS,
  CASAMIA_PROVIDER_PASSWORD: process.env.CASAMIA_PROVIDER_PASSWORD,
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
  process.env.CASAMIA_PARTNER_PASSWORD = 'partner-portal-password'
  process.env.CASAMIA_PARTNER_EMAIL = 'partner@example.com'

  assert.deepEqual(
    config.matcher,
    [
      '/admin/config-preview',
      '/agreement/:path*',
      '/estimate/:path*',
      '/internal/proposals/:path*',
      '/proposal/:path*',
    ],
    'Middleware should cover legacy Basic Auth and dynamic app-shell fallbacks.',
  )

  for (const pathname of ['/internal', '/internal/service-catalog']) {
    assert.equal(
      await middleware(new Request(`https://www.casamia.com.es${pathname}`)),
      undefined,
      `${pathname} should use the CasaMia password screen instead of browser Basic Auth.`,
    )
  }

  const missingCredentials = await middleware(new Request('https://www.casamia.com.es/admin/config-preview'))
  assert.equal(missingCredentials?.status, 401)
  assert.match(missingCredentials?.headers.get('www-authenticate') ?? '', /^Basic\b/)

  const wrongCredentials = await middleware(
    new Request('https://www.casamia.com.es/admin/config-preview', {
      headers: { authorization: basicCredentials('internal-admin', 'wrong-password') },
    }),
  )
  assert.equal(wrongCredentials?.status, 401)

  const validCredentials = await middleware(
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
  const proposalPreview = await readFile(
    resolve(projectRoot, 'src/components/internal/ProposalPreview.tsx'),
    'utf8',
  )
  assert.match(
    publicProposalPage,
    /<SEO[\s\S]*path=\{`\/proposal\/\$\{token\}`\}[\s\S]*noindex/,
    'Private proposal links must publish noindex metadata.',
  )
  assert.match(
    proposalPreview,
    /proposal-print-surface min-w-0 w-full/,
    'Public proposals must contain desktop table width inside the mobile document.',
  )
  assert.match(
    proposalPreview,
    /md:hidden[\s\S]*mobile-\$\{item\.id\}[\s\S]*hidden min-w-0 max-w-full overflow-x-auto[\s\S]*md:block/,
    'Public proposals must render stacked line items on mobile and the full table on larger screens.',
  )

  const orderPage = await readFile(resolve(projectRoot, 'src/pages/OrderPage.tsx'), 'utf8')
  assert.match(
    orderPage,
    /<SEO[\s\S]*path="\/order"[\s\S]*noindex/,
    'The order follow-up page must not compete with public marketing pages in search.',
  )

  const prerenderSource = await readFile(resolve(projectRoot, 'scripts/prerender.mjs'), 'utf8')
  assert.match(
    prerenderSource,
    /'\/internal\/leads'/,
    'The lead pipeline must have a generated protected app shell for direct production navigation.',
  )
  assert.match(
    prerenderSource,
    /'\/internal\/data-quality'/,
    'The data-quality page must have a generated protected app shell for direct production navigation.',
  )
  assert.match(
    appSource,
    /function PartnerRoute[\s\S]*<SEO[\s\S]*noindex[\s\S]*<PartnerAccessGate>/,
    'Every partner route wrapper must publish noindex metadata.',
  )

  const middlewareSource = await readFile(resolve(projectRoot, 'middleware.ts'), 'utf8')
  assert.match(
    middlewareSource,
    /appShellFallbackPath = '\/_app-shell\/private'/,
    'Dynamic private routes must use the generated private app shell.',
  )
  assert.match(
    middlewareSource,
    /'\/internal\/proposals\/'/,
    'Internal proposal detail pages must have an app-shell fallback.',
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

  const { token: partnerToken, partnerEmail, role } = createPartnerSessionToken('PARTNER@EXAMPLE.COM')
  assert.equal(partnerEmail, 'partner@example.com')
  assert.equal(role, 'partner')

  const partnerResponse = createApiResponse()
  assert.equal(
    requirePartnerApiKey({ headers: { authorization: `Bearer ${partnerToken}` } }, partnerResponse)?.partnerEmail,
    'partner@example.com',
    'A partner session should authorize only its normalized partner identity.',
  )

  const partnerOnAdminResponse = createApiResponse()
  assert.equal(
    requireInternalApiKey({ headers: { authorization: `Bearer ${partnerToken}` } }, partnerOnAdminResponse),
    false,
    'A partner session must not authorize admin APIs.',
  )
  assert.equal(partnerOnAdminResponse.statusCode, 401)

  const adminOnPartnerResponse = createApiResponse()
  assert.equal(
    requirePartnerApiKey({ headers: { authorization: `Bearer ${token}` } }, adminOnPartnerResponse),
    null,
    'An admin session must not impersonate a partner.',
  )
  assert.equal(adminOnPartnerResponse.statusCode, 401)

  process.env.CASAMIA_PARTNER_PASSWORD = 'rotated-partner-password'
  const rotatedCredentialResponse = createApiResponse()
  assert.equal(
    requirePartnerApiKey({ headers: { authorization: `Bearer ${partnerToken}` } }, rotatedCredentialResponse),
    null,
    'Rotating a partner credential must revoke sessions issued with the previous password.',
  )
  assert.equal(rotatedCredentialResponse.statusCode, 401)
  process.env.CASAMIA_PARTNER_PASSWORD = 'partner-portal-password'

  assert.deepEqual(getPartnerCredentialConfiguration(), {
    configured: true,
    message: '',
    mode: 'single-partner',
  })
  assert.equal(verifyPartnerCredentials('PARTNER@EXAMPLE.COM', 'partner-portal-password'), true)
  assert.equal(verifyPartnerCredentials('other@example.com', 'partner-portal-password'), false)

  process.env.CASAMIA_PARTNER_CREDENTIALS = JSON.stringify({
    'first@example.com': 'first-partner-password',
    'second@example.com': 'second-partner-password',
  })
  assert.equal(getPartnerCredentialConfiguration().mode, 'per-partner')
  assert.equal(verifyPartnerCredentials('first@example.com', 'first-partner-password'), true)
  assert.equal(verifyPartnerCredentials('second@example.com', 'second-partner-password'), true)
  assert.equal(
    verifyPartnerCredentials('second@example.com', 'first-partner-password'),
    false,
    'A valid password for one partner must never authorize another partner identity.',
  )

  process.env.CASAMIA_PARTNER_CREDENTIALS = '{invalid-json'
  assert.equal(getPartnerCredentialConfiguration().configured, false)
  assert.equal(verifyPartnerCredentials('first@example.com', 'first-partner-password'), false)
  delete process.env.CASAMIA_PARTNER_CREDENTIALS

  const partnerAgreementsSource = await readFile(resolve(projectRoot, 'api/partner/agreements.js'), 'utf8')
  assert.match(partnerAgreementsSource, /listAgreementRecordsForPartner\(session\.partnerEmail\)/)
  assert.doesNotMatch(partnerAgreementsSource, /listAgreementRecords\(\)/)

  const partnerLoginSource = await readFile(resolve(projectRoot, 'api/partner/login.js'), 'utf8')
  assert.match(partnerLoginSource, /verifyPartnerCredentials\(partnerEmail, body\.password\)/)

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
