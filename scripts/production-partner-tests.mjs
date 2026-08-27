import assert from 'node:assert/strict'

const baseUrl = String(process.env.CASAMIA_PRODUCTION_URL || 'https://www.casamia.com.es').replace(/\/$/, '')
const partnerEmail = String(process.env.CASAMIA_PARTNER_EMAIL || '').trim().toLowerCase()
const partnerPassword = String(process.env.CASAMIA_PARTNER_PASSWORD || '')

assert.match(partnerEmail, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'CASAMIA_PARTNER_EMAIL is required.')
assert.ok(partnerPassword, 'CASAMIA_PARTNER_PASSWORD is required.')

async function login(email, password) {
  return fetch(`${baseUrl}/api/partner/login`, {
    body: JSON.stringify({ email, password }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })
}

const validResponse = await login(partnerEmail, partnerPassword)
assert.equal(validResponse.status, 200, 'The configured partner identity must be able to sign in.')

const session = await validResponse.json()
assert.equal(session.partnerEmail, partnerEmail)
assert.equal(session.role, 'partner')
assert.ok(session.token, 'Partner login must return a session token.')

const authorization = { authorization: `Bearer ${session.token}` }
const [leadsResponse, agreementsResponse] = await Promise.all([
  fetch(`${baseUrl}/api/partner/leads`, { headers: authorization }),
  fetch(`${baseUrl}/api/partner/agreements`, { headers: authorization }),
])

assert.equal(leadsResponse.status, 200, 'Partner leads must accept the valid partner session.')
assert.equal(agreementsResponse.status, 200, 'Partner agreements must accept the valid partner session.')

const leadsPayload = await leadsResponse.json()
const agreementsPayload = await agreementsResponse.json()
assert.equal(leadsPayload.partnerEmail, partnerEmail)
assert.equal(agreementsPayload.partnerEmail, partnerEmail)
assert.ok(Array.isArray(leadsPayload.leads))
assert.ok(Array.isArray(agreementsPayload.assignments))
assert.ok(
  leadsPayload.leads.every((lead) => String(lead.assignedPartnerEmail || '').toLowerCase() === partnerEmail),
  'Every returned lead must be assigned to the authenticated partner.',
)
assert.ok(
  agreementsPayload.assignments.every((assignment) => String(assignment.partnerEmail || '').toLowerCase() === partnerEmail),
  'Every returned agreement must belong to the authenticated partner.',
)

const [wrongEmailResponse, wrongPasswordResponse, unauthenticatedLeads, unauthenticatedAgreements] = await Promise.all([
  login('cross-partner-check@example.invalid', partnerPassword),
  login(partnerEmail, 'not-the-configured-partner-password'),
  fetch(`${baseUrl}/api/partner/leads`),
  fetch(`${baseUrl}/api/partner/agreements`),
])

assert.equal(wrongEmailResponse.status, 401, 'The configured password must not work with another email.')
assert.equal(wrongPasswordResponse.status, 401, 'The configured email must reject another password.')
assert.equal(unauthenticatedLeads.status, 401, 'Partner leads must reject unauthenticated requests.')
assert.equal(unauthenticatedAgreements.status, 401, 'Partner agreements must reject unauthenticated requests.')

console.log(JSON.stringify({
  agreementCount: agreementsPayload.assignments.length,
  baseUrl,
  leadCount: leadsPayload.leads.length,
  partnerEmail,
  status: 'passed',
}, null, 2))
