import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const protectedRoutes = [
  'api/cron/lead-reminders.js',
  'api/cron/visit-reminders.js',
  'api/internal/agreements.js',
  'api/internal/assessment-requests.js',
  'api/internal/callback-requests.js',
  'api/internal/dashboard.js',
  'api/internal/data-quality.js',
  'api/internal/facebook-posts.js',
  'api/internal/leads.js',
  'api/internal/orders.js',
  'api/internal/provider-applications.js',
  'api/internal/service-catalogue.js',
  'api/internal/visit-appointments.js',
  'api/internal/visit-availability.js',
  'api/internal/voice-preview.js',
  'api/partner/agreements.js',
  'api/partner/leads.js',
  'api/proposals.js',
  'api/proposals/[proposalId].js',
  'api/proposals/[proposalId]/accept.js',
  'api/proposals/[proposalId]/send.js',
]

const unauthenticatedRoutes = new Set([
  'api/internal/login.js',
  'api/partner/login.js',
])

const publicPostRoutes = [
  'api/consent-evidence.js',
  'api/public/agreements/[token]/acknowledge.js',
  'api/public/analyse-safety-photo.js',
  'api/public/assessment-media-finalize.js',
  'api/public/assessment-requests.js',
  'api/public/callback-requests.js',
  'api/public/classify-room-photo.js',
  'api/public/contact-requests.js',
  'api/public/elevenlabs-conversation-token.js',
  'api/public/grant-reports.js',
  'api/public/grant-reports/[token]/research.js',
  'api/public/orders.js',
  'api/public/proposal-drafts.js',
  'api/public/proposals/[token]/accept.js',
  'api/public/proposals/[token]/checkout.js',
  'api/public/provider-applications.js',
  'api/public/safety-reports.js',
  'api/public/visit-checkout.js',
  'api/public/visit-manage.js',
  'api/public/visit-schedule.js',
  'api/withdrawal-requests.js',
]

const publicGetRoutes = [
  'api/public/agreements/[token].js',
  'api/public/grant-reports/[token].js',
  'api/public/proposals/[token].js',
  'api/public/proposals/[token]/checkout-status.js',
  'api/public/safety-reports/[token].js',
  'api/public/service-catalogue.js',
  'api/public/visit-availability.js',
  'api/public/visit-calendar.js',
  'api/public/visit-checkout-status.js',
]

const originDelegatingPostRoutes = new Set([
  'api/public/grant-reports.js',
  'api/public/safety-reports.js',
])

const rateLimitedPostRoutes = new Set([
  'api/consent-evidence.js',
  'api/public/analyse-safety-photo.js',
  'api/public/assessment-requests.js',
  'api/public/callback-requests.js',
  'api/public/classify-room-photo.js',
  'api/public/contact-requests.js',
  'api/public/elevenlabs-conversation-token.js',
  'api/public/grant-reports.js',
  'api/public/grant-reports/[token]/research.js',
  'api/public/orders.js',
  'api/public/proposal-drafts.js',
  'api/public/provider-applications.js',
  'api/public/safety-reports.js',
  'api/withdrawal-requests.js',
])

const capabilityProtectedPostRoutes = new Set([
  'api/public/agreements/[token]/acknowledge.js',
  'api/public/assessment-media-finalize.js',
  'api/public/proposals/[token]/accept.js',
  'api/public/proposals/[token]/checkout.js',
  'api/public/visit-checkout.js',
  'api/public/visit-manage.js',
  'api/public/visit-schedule.js',
])

assert.deepEqual(
  [...rateLimitedPostRoutes, ...capabilityProtectedPostRoutes].sort(),
  [...publicPostRoutes].sort(),
  'Every public write endpoint must be classified as rate-limited or protected by an unguessable capability/session.',
)

for (const route of publicPostRoutes) {
  const source = readFileSync(path.join(root, route), 'utf8')
  assert.match(
    source,
    originDelegatingPostRoutes.has(route)
      ? /handlePublicReportPost/
      : /applyPublicCors|isAllowedPublicOrigin/,
    `${route} must enforce the trusted public origin boundary.`,
  )
}

const webhookRoutes = ['api/webhooks/stripe.js', 'api/webhooks/whatsapp.js']

const discoveredProtectedAreaRoutes = [
  ...(await walk('api/cron')),
  ...(await walk('api/internal')),
  ...(await walk('api/partner')),
  ...(await walk('api/proposals')),
  'api/proposals.js',
].sort()

assert.deepEqual(
  discoveredProtectedAreaRoutes,
  [...protectedRoutes, ...unauthenticatedRoutes].sort(),
  'Every protected-area endpoint must be explicitly classified by the API security test.',
)

assert.deepEqual(
  [
    ...(await walk('api/public')),
    'api/consent-evidence.js',
    'api/withdrawal-requests.js',
  ].sort(),
  [...publicPostRoutes, ...publicGetRoutes].sort(),
  'Every public endpoint must be explicitly classified by the API security test.',
)

assert.deepEqual(
  (await walk('api/webhooks')).sort(),
  webhookRoutes,
  'Every webhook endpoint must be explicitly classified by the API security test.',
)

const previousEnvironment = new Map([
  ['CASAMIA_INTERNAL_API_KEY', process.env.CASAMIA_INTERNAL_API_KEY],
  ['CASAMIA_INTERNAL_SESSION_SECRET', process.env.CASAMIA_INTERNAL_SESSION_SECRET],
  ['CASAMIA_PARTNER_CREDENTIALS', process.env.CASAMIA_PARTNER_CREDENTIALS],
  ['CASAMIA_PARTNER_EMAIL', process.env.CASAMIA_PARTNER_EMAIL],
  ['CASAMIA_PARTNER_PASSWORD', process.env.CASAMIA_PARTNER_PASSWORD],
  ['CRON_SECRET', process.env.CRON_SECRET],
])

process.env.CASAMIA_INTERNAL_API_KEY = 'internal-test-key'
process.env.CASAMIA_INTERNAL_SESSION_SECRET = 'session-test-secret'
process.env.CASAMIA_PARTNER_CREDENTIALS = JSON.stringify({ 'partner@example.com': 'partner-test-password' })
delete process.env.CASAMIA_PARTNER_EMAIL
delete process.env.CASAMIA_PARTNER_PASSWORD
process.env.CRON_SECRET = 'cron-test-secret'

try {
  for (const route of protectedRoutes) {
    const module = await import(pathToFileURL(path.join(root, route)))
    const response = makeResponse()
    await module.default({ headers: {}, method: 'GET', query: {} }, response)
    assert.equal(response.statusCode, 401, `${route} must reject an unauthenticated request.`)
    assert.match(response.body, /Unauthorized/)
  }

  for (const route of publicPostRoutes) {
    await assertUnsupportedMethod(route, 'GET')
  }

  for (const route of publicGetRoutes) {
    await assertUnsupportedMethod(route, 'POST')
  }

  for (const route of webhookRoutes) {
    await assertUnsupportedMethod(route, route.endsWith('/whatsapp.js') ? 'PUT' : 'GET')
  }
} finally {
  for (const [key, value] of previousEnvironment) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
}

console.log(`API security checks passed (${protectedRoutes.length} protected and ${publicPostRoutes.length + publicGetRoutes.length + webhookRoutes.length} public/webhook endpoints).`)

async function assertUnsupportedMethod(route, method) {
  const module = await import(pathToFileURL(path.join(root, route)))
  const response = makeResponse()
  await module.default({
    headers: {
      host: 'localhost:5173',
      origin: 'http://localhost:5173',
      'x-forwarded-proto': 'http',
    },
    method,
    query: {},
  }, response)
  assert.equal(response.statusCode, 405, `${route} must reject unsupported ${method} requests.`)
}

async function walk(relativeDirectory) {
  const directory = path.join(root, relativeDirectory)
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory.replaceAll('\\', '/'), entry.name)
    if (entry.isDirectory()) files.push(...await walk(relativePath))
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(relativePath)
  }

  return files
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
