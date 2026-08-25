import assert from 'node:assert/strict'

const baseUrl = String(process.env.CASAMIA_PRODUCTION_URL || 'https://www.casamia.com.es').replace(/\/$/, '')
const timeoutMs = 20_000

function request(path, init = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
  })
}

async function expectStatus(label, path, expected, init = {}) {
  const response = await request(path, init)
  assert.equal(response.status, expected, `${label} returned ${response.status}; expected ${expected}.`)
  return response
}

const home = await expectStatus('Homepage', '/', 200)
for (const [name, expected] of [
  ['strict-transport-security', /max-age=31536000/i],
  ['x-content-type-options', /^nosniff$/i],
  ['x-frame-options', /^SAMEORIGIN$/i],
  ['referrer-policy', /^strict-origin-when-cross-origin$/i],
]) {
  assert.match(home.headers.get(name) || '', expected, `Missing or invalid ${name} header.`)
}

const sitemapResponse = await expectStatus('Sitemap', '/sitemap.xml', 200)
const sitemap = await sitemapResponse.text()
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
assert.equal(sitemapUrls.length, 62, 'The production sitemap route count changed unexpectedly.')

const routeResults = await Promise.all(sitemapUrls.map(async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  return { status: response.status, url }
}))
const failedRoutes = routeResults.filter((result) => result.status !== 200)
assert.deepEqual(failedRoutes, [], `Sitemap routes failed: ${JSON.stringify(failedRoutes)}`)

const contactRedirect = await request('/contact', { redirect: 'manual' })
assert.ok([301, 302, 307, 308].includes(contactRedirect.status), `Contact redirect returned ${contactRedirect.status}.`)
assert.match(contactRedirect.headers.get('location') || '', /\/why-us#contact-form$/)

const catalogueResponse = await expectStatus('Public catalogue', '/api/public/service-catalogue', 200)
const catalogue = await catalogueResponse.json()
const master = catalogue.masterCatalogue
assert.equal(master.packages.length, 20)
assert.equal(master.outcomes.length, 67)
assert.equal(master.capabilities.length, 123)
assert.equal(master.products.length, 101)
assert.equal(master.installationTasks.length, 61)
assert.equal(master.commercialSettings.assessmentVisitFeeGross, 99)
assert.equal(master.commercialSettings.assessmentVisitVatRate, 0.21)
assert.equal(master.commercialSettings.proposalDepositRate, 0.5)
assert.deepEqual(master.commercialSettings.corePackageInstallationSchedule, [
  { packageCount: 1, totalInstallationPrice: 100 },
  { packageCount: 2, totalInstallationPrice: 170 },
  { packageCount: 3, totalInstallationPrice: 150 },
])

const expectedGrossPrices = {
  'bathroom-home-safety-package': 749,
  'bedroom-home-safety-package': 649,
  'entrance-home-safety-package': 749,
  'kitchen-home-safety-package': 699,
  'living-room-home-safety-package': 556.6,
}
for (const [packageId, expectedGross] of Object.entries(expectedGrossPrices)) {
  const item = master.packages.find((entry) => entry.id === packageId)
  assert.ok(item, `Missing production package ${packageId}.`)
  const gross = Math.round(item.fromPrice * (1 + item.vatRate) * 100) / 100
  assert.equal(gross, expectedGross, `${packageId} has an unexpected VAT-inclusive price.`)
}

for (const [label, path, expected] of [
  ['Internal dashboard', '/api/internal/dashboard', 401],
  ['Partner leads', '/api/partner/leads', 401],
  ['Lead reminder cron', '/api/cron/lead-reminders', 401],
  ['Visit reminder cron', '/api/cron/visit-reminders', 401],
  ['Stripe webhook GET', '/api/webhooks/stripe', 405],
  ['Invalid public proposal', '/api/public/proposals/invalid', 404],
  ['Invalid public agreement', '/api/public/agreements/invalid', 404],
]) {
  await expectStatus(label, path, expected)
}

for (const [label, path] of [
  ['Empty contact request', '/api/public/contact-requests'],
  ['Empty provider application', '/api/public/provider-applications'],
  ['Empty order', '/api/public/orders'],
  ['Empty withdrawal', '/api/withdrawal-requests'],
  ['Empty assessment request', '/api/public/assessment-requests'],
  ['Empty callback request', '/api/public/callback-requests'],
  ['Empty proposal draft', '/api/public/proposal-drafts'],
  ['Empty visit checkout', '/api/public/visit-checkout'],
  ['Empty visit schedule', '/api/public/visit-schedule'],
]) {
  await expectStatus(label, path, 400, {
    body: '{}',
    headers: { 'content-type': 'application/json', origin: baseUrl },
    method: 'POST',
  })
}

console.log(JSON.stringify({
  baseUrl,
  catalogue: {
    capabilities: master.capabilities.length,
    outcomes: master.outcomes.length,
    packages: master.packages.length,
    products: master.products.length,
  },
  sitemapRoutes: sitemapUrls.length,
  status: 'passed',
}, null, 2))
