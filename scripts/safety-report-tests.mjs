import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  analyseSafetyImage,
  parseSafetyPhotoAnalysis,
} from '../api/public/analyse-safety-photo.js'
import {
  readOpenAiApiKey,
  safeOpenAiErrorDetails,
} from '../api/_lib/openai-responses.js'
import {
  buildPublicReportRecord,
  loadPublicReport,
  queuePublicReport,
} from '../api/_lib/public-reports.js'
import {
  buildOverallSafetyScore,
  scorePhotoFindings,
} from '../src/services/safetyReportScoring.ts'
import { createPublicReportToken } from '../src/utils/publicReportToken.ts'

function openAiResult(value) {
  return {
    output: [{
      type: 'message',
      role: 'assistant',
      content: [{ type: 'output_text', text: JSON.stringify(value) }],
    }],
  }
}

assert.equal(readOpenAiApiKey('  sk-proj-test  '), 'sk-proj-test')
assert.equal(
  readOpenAiApiKey('sk-proj-test sk-proj-test'),
  '',
  'Whitespace-separated or duplicated keys must be rejected before an Authorization header is built.',
)
const safeErrorDetails = safeOpenAiErrorDetails(
  new TypeError('Bearer sk-proj-secret is an invalid header value.'),
  500,
)
assert.deepEqual(safeErrorDetails, {
  statusCode: 500,
  code: 'VISION_UNAVAILABLE',
  name: 'TypeError',
})
assert.doesNotMatch(JSON.stringify(safeErrorDetails), /sk-proj-secret/)
const poisonedErrorDetails = safeOpenAiErrorDetails({
  code: 'sk-proj-secret-code',
  name: 'sk-proj-secret-name',
}, 500)
assert.deepEqual(poisonedErrorDetails, {
  statusCode: 500,
  code: 'VISION_UNAVAILABLE',
  name: 'Error',
})
assert.doesNotMatch(JSON.stringify(poisonedErrorDetails), /sk-proj-secret/)

function makeFinding(overrides = {}) {
  return {
    category: 'trip',
    title: 'Loose rug edge',
    evidence: 'The front edge of the rug is visibly curled upward.',
    severity: 'medium',
    confidence: 0.9,
    whyItMatters: 'A raised edge can catch a foot on the main walking route.',
    action: 'Secure or remove the rug and confirm the route remains clear.',
    requiresConfirmation: false,
    ...overrides,
  }
}

function makeAnalysis(overrides = {}) {
  const findings = overrides.findings ?? []
  return {
    photoId: 'photo-1',
    fileName: 'living-room.jpg',
    assignedRoom: 'living-room',
    detectedRoom: 'living-room',
    roomConfidence: 0.94,
    headline: 'Main living-room route',
    overview: 'The main walking route is visible.',
    strengths: [],
    limitations: [],
    findings,
    ...scorePhotoFindings(findings, 'en'),
    analysisStatus: 'analysed',
    ...overrides,
  }
}

const parsed = parseSafetyPhotoAnalysis(openAiResult({
      room: 'bathroom',
      roomConfidence: 1.4,
      headline: 'Shower entry',
      overview: 'A raised shower threshold is visible.',
      strengths: ['Clear floor area'],
      limitations: ['Floor grip cannot be confirmed from a photo'],
      findings: [
        makeFinding({ severity: 'high' }),
        makeFinding({ severity: 'critical' }),
      ],
}))

assert.equal(parsed.room, 'bathroom')
assert.equal(parsed.roomConfidence, 1, 'Room confidence should be clamped.')
assert.equal(parsed.findings.length, 1, 'Unsupported severities should not enter the report.')
assert.equal(parsed.findings[0].severity, 'high')

await assert.rejects(
  () => analyseSafetyImage({}, { env: {} }),
  (error) => {
    assert.equal(error.statusCode, 503)
    assert.equal(error.code, 'VISION_NOT_CONFIGURED')
    return true
  },
  'A missing server vision key must return a configuration-specific failure.',
)

await assert.rejects(
  () => analyseSafetyImage({}, {
    env: { OPENAI_API_KEY: 'sk-proj-test sk-proj-test' },
  }),
  (error) => {
    assert.equal(error.statusCode, 503)
    assert.equal(error.code, 'VISION_NOT_CONFIGURED')
    return true
  },
  'Malformed server keys must fail as configuration errors without reaching fetch.',
)

assert.equal(
  readOpenAiApiKey('  sk-test-key\r\n'),
  'sk-test-key',
  'OpenAI keys pasted with trailing whitespace should be safe to use in headers.',
)
assert.equal(
  readOpenAiApiKey('"sk-test-key"'),
  'sk-test-key',
  'OpenAI keys copied with wrapping quotes should be normalized.',
)
assert.equal(
  readOpenAiApiKey('sk-test\nkey'),
  '',
  'Malformed multi-line OpenAI keys must be rejected before creating a header.',
)

let openAiRequest
const analysed = await analyseSafetyImage({
  mediaType: 'image/jpeg',
  data: 'AA==',
  assignedRoom: 'bathroom',
  locale: 'en',
  context: { mainConcern: 'Falls' },
}, {
  env: { OPENAI_API_KEY: '  test-key\r\n', OPENAI_VISION_MODEL: 'test-model' },
  fetchImpl: async (url, init) => {
    openAiRequest = { url, init, body: JSON.parse(init.body) }
    return {
      ok: true,
      json: async () => openAiResult({
            room: 'bathroom',
            roomConfidence: 0.91,
            headline: 'Bath access',
            overview: 'The bath edge is visible.',
            strengths: [],
            limitations: ['Measurements require confirmation'],
            findings: [makeFinding({ severity: 'high' })],
      }),
    }
  },
})

assert.equal(openAiRequest.url, 'https://api.openai.com/v1/responses')
assert.equal(openAiRequest.init.method, 'POST')
assert.equal(openAiRequest.init.headers.Authorization, 'Bearer test-key')
assert.equal(openAiRequest.init.headers['content-type'], 'application/json')
assert.equal(openAiRequest.body.model, 'test-model')
assert.equal(openAiRequest.body.store, false)
assert.equal(openAiRequest.body.max_output_tokens, 1_600)
assert.match(openAiRequest.body.instructions, /only evidence visibly supported/i)
assert.deepEqual(
  openAiRequest.body.input[0].content.find(({ type }) => type === 'input_image'),
  {
    type: 'input_image',
    image_url: 'data:image/jpeg;base64,AA==',
    detail: 'high',
  },
)
assert.match(
  openAiRequest.body.input[0].content.find(({ type }) => type === 'input_text').text,
  /user labelled it "bathroom"/i,
)
assert.equal(openAiRequest.body.text.format.type, 'json_schema')
assert.equal(openAiRequest.body.text.format.strict, true)
assert.equal(openAiRequest.body.text.format.schema.additionalProperties, false)
assert.equal(
  openAiRequest.body.text.format.schema.properties.findings.items.additionalProperties,
  false,
)
assert.equal(analysed.findings.length, 1)

assert.throws(
  () => parseSafetyPhotoAnalysis({ status: 'incomplete', output: [] }),
  /incomplete response/i,
  'Incomplete OpenAI responses must not be accepted as completed analyses.',
)

assert.throws(
  () => parseSafetyPhotoAnalysis({
    output: [{
      type: 'message',
      content: [{ type: 'refusal', refusal: 'Cannot inspect this image.' }],
    }],
  }),
  /refused/i,
  'OpenAI refusals must not be parsed as safety reports.',
)

await assert.rejects(
  () => analyseSafetyImage({
    mediaType: 'image/jpeg',
    data: 'AA==',
    assignedRoom: 'bathroom',
    locale: 'en',
  }, {
    env: { OPENAI_API_KEY: 'test-key' },
    fetchImpl: async () => ({ ok: false, status: 429 }),
  }),
  (error) => {
    assert.equal(error.statusCode, 429)
    assert.equal(error.code, 'VISION_RATE_LIMITED')
    return true
  },
  'Provider throttling must stay distinguishable so the upload can be retried.',
)

const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8')
const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')

assert.match(envExample, /^OPENAI_API_KEY=/m)
assert.match(envExample, /^# OPENAI_VISION_MODEL=/m)
assert.doesNotMatch(envExample, /ANTHROPIC_/i)
assert.doesNotMatch(envExample, /^VITE_OPENAI_API_KEY=/m)
assert.match(viteConfig, /env\.OPENAI_API_KEY/)
assert.match(viteConfig, /env\.OPENAI_VISION_MODEL/)
assert.doesNotMatch(viteConfig, /ANTHROPIC_/i)
assert.doesNotMatch(viteConfig, /import\.meta\.env\.VITE_OPENAI_API_KEY/)

for (const locale of ['de', 'en', 'es', 'fr', 'nl']) {
  const copy = JSON.parse(
    readFileSync(new URL(`../src/i18n/locales/${locale}.json`, import.meta.url), 'utf8'),
  )
  assert.doesNotMatch(copy.estimator.noKey, /VITE_|ANTHROPIC_API_KEY|OPENAI_API_KEY/i)
}

const reportToken = '11111111-1111-4111-8111-111111111111'
const reportPayload = {
  type: 'safety_report',
  public_token: reportToken,
  report_title: 'Safety Report',
  report_url: `https://www.casamia.com.es/estimate/${reportToken}`,
  customer_name: 'Test Resident',
  customer_email: 'resident@example.com',
  customer_phone: '+34 600 000 000',
  delivery_email: true,
  delivery_whatsapp: false,
  preferred_channels: ['email'],
  consent_at: '2026-07-18T10:00:00.000Z',
  submitted_at: '2026-07-18T10:01:00.000Z',
  created_at: '2026-07-18T09:59:00.000Z',
  expires_at: '2026-08-17T09:59:00.000Z',
  context: { region: 'Madrid', photoCount: 1, rooms: ['bathroom'] },
  risk_score: 42,
  risk_level: 'moderate',
  summary: 'Prioritise a safer bath entry.',
  recommendations: {
    summary: 'Prioritise a safer bath entry.',
    hazards: [makeFinding({ room: 'bathroom' })],
  },
}

let createCall
const queuedReport = await queuePublicReport(reportPayload, 'safety_report', {
  create: async (tableName, row, onConflict) => {
    createCall = { tableName, row, onConflict }
    return { ok: true, status: 201, body: [row] }
  },
})

assert.deepEqual(queuedReport.body, {
  token: reportToken,
  status: 'queued',
  email: 'queued',
  whatsapp: 'not_requested',
})
assert.equal(createCall.tableName, 'assessment_requests')
assert.equal(createCall.onConflict, 'id')
assert.equal(createCall.row.id, reportToken)
assert.equal(createCall.row.type, 'safety_report')
assert.equal(createCall.row.status, 'Report Pending')
assert.equal(createCall.row.payload_json.recommendations.summary, reportPayload.summary)
assert.equal(createCall.row.payload_json.customer_email, undefined)
assert.equal(createCall.row.payload_json.consent_at, undefined)
assert.equal(createCall.row.payload_json.report_url, `/estimate/${reportToken}`)
assert.equal(
  Date.parse(createCall.row.payload_json.expires_at) - Date.parse(createCall.row.payload_json.created_at),
  30 * 24 * 60 * 60 * 1_000,
)

const loadedReport = await loadPublicReport(reportToken, 'safety_report', {
  select: async (tableName, query) => {
    assert.equal(tableName, 'assessment_requests')
    assert.match(query, new RegExp(`id=eq\\.${reportToken}`))
    assert.match(query, /type=eq\.safety_report/)
    return {
      ok: true,
      status: 200,
      body: [{
        id: createCall.row.id,
        submitted_at: createCall.row.submitted_at,
        type: createCall.row.type,
        status: createCall.row.status,
        payload_json: createCall.row.payload_json,
      }],
    }
  },
})

assert.equal(loadedReport.ok, true)
assert.equal(loadedReport.body.public_token, reportToken)
assert.equal(loadedReport.body.risk_score, 42)
assert.equal(loadedReport.body.recommendations.summary, reportPayload.summary)
assert.equal(loadedReport.body.customer_email, undefined)
assert.equal(loadedReport.body.consent_at, undefined)
assert.equal(loadedReport.body.customer_name, undefined)
assert.equal(loadedReport.body.customer_phone, undefined)

const duplicateReport = await queuePublicReport({
  ...reportPayload,
  delivery_email: false,
  delivery_whatsapp: true,
}, 'safety_report', {
  create: async () => ({ ok: true, status: 200, body: [] }),
  select: async () => ({ ok: true, status: 200, body: [createCall.row] }),
})
assert.deepEqual(duplicateReport.body, queuedReport.body)

const tokenCollision = await queuePublicReport(reportPayload, 'safety_report', {
  create: async () => ({ ok: true, status: 200, body: [] }),
  select: async () => ({ ok: true, status: 200, body: [] }),
})
assert.equal(tokenCollision.ok, false)
assert.equal(tokenCollision.status, 409)

const grantToken = '22222222-2222-4222-8222-222222222222'
const grantRecord = buildPublicReportRecord({
  ...reportPayload,
  type: 'grant_report',
  public_token: grantToken,
  token: grantToken,
  summary: 'Contact: Test Resident | +34 600 000 000 | resident@example.com',
  recommendations: {
    form: {
      name: 'Test Resident',
      phone: '+34 600 000 000',
      email: 'resident@example.com',
      consent: true,
      consentAt: '2026-07-18T10:00:00.000Z',
      deliveryEmail: true,
      deliveryWhatsapp: false,
      region: 'Madrid',
    },
    result: {
      title: 'Strong grant match',
      summary: 'The answers show several common eligibility signals.',
    },
    summary: 'Contact: Test Resident | +34 600 000 000 | resident@example.com',
  },
}, 'grant_report', new Date('2026-07-18T10:05:00.000Z'))

const loadedGrantReport = await loadPublicReport(grantToken, 'grant_report', {
  now: new Date('2026-07-19T10:05:00.000Z'),
  select: async () => ({ ok: true, status: 200, body: [grantRecord.row] }),
})
assert.equal(loadedGrantReport.ok, true)
assert.equal(loadedGrantReport.body.summary, 'The answers show several common eligibility signals.')
assert.equal(loadedGrantReport.body.recommendations.form.region, 'Madrid')
assert.doesNotMatch(
  JSON.stringify(loadedGrantReport.body),
  /Test Resident|resident@example\.com|600 000 000/,
)

const expiredReport = await loadPublicReport(grantToken, 'grant_report', {
  now: new Date('2026-08-18T10:05:01.000Z'),
  select: async () => ({ ok: true, status: 200, body: [grantRecord.row] }),
})
assert.equal(expiredReport.ok, false)
assert.equal(expiredReport.status, 404)

const fallbackToken = createPublicReportToken({
  getRandomValues(bytes) {
    bytes.fill(0)
    return bytes
  },
})
assert.equal(fallbackToken, '00000000-0000-4000-8000-000000000000')
assert.match(fallbackToken, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)

assert.throws(
  () => buildPublicReportRecord({ ...reportPayload, public_token: 'not-a-token' }, 'safety_report'),
  /valid report token/i,
)
assert.throws(
  () => buildPublicReportRecord({ ...reportPayload, delivery_email: false }, 'safety_report'),
  /delivery method/i,
)

const estimateWorkflowSource = readFileSync(
  new URL('../src/services/estimateWorkflow.ts', import.meta.url),
  'utf8',
)
assert.match(
  estimateWorkflowSource,
  /if \(hasPublicSiteApi\(\)\) \{[\s\S]*?loadPublicSafetyReport\(token\)/,
  'Production report links must load from the same-origin public API even without an explicit API base URL.',
)
assert.match(
  estimateWorkflowSource,
  /if \(hasPublicSiteApi\(\)\) \{\s*return saveReportToPublicApi\(input\)/,
  'Delivery must return the statuses persisted by the public API.',
)

const grantPageSource = readFileSync(
  new URL('../src/pages/GrantEligibilityPage.tsx', import.meta.url),
  'utf8',
)
assert.match(
  grantPageSource,
  /\/api\/public\/grant-reports\/\$\{encodeURIComponent\(sharedToken\)\}/,
  'Shared grant-report links must load their saved report from the public API.',
)
assert.match(grantPageSource, /setStep\(3\)/)

const uploadEstimatorSource = readFileSync(
  new URL('../src/components/UploadEstimator.tsx', import.meta.url),
  'utf8',
)
assert.match(
  uploadEstimatorSource,
  /hasNoCompletedPhotoAnalysis\(result, photos\.length\)[\s\S]*?generateSafetyReport\(workflowInput\)/,
  'The free report must retry visual analysis before finalising an unavailable result.',
)
assert.match(
  uploadEstimatorSource,
  /analysisRetryButton/,
  'An existing report with unavailable photos must offer a retry action.',
)

const emptyPhoto = makeAnalysis()
assert.equal(emptyPhoto.riskScore, 0, 'A photo without visible findings must score zero.')
assert.match(emptyPhoto.scoreExplanation, /0\/100/)
const onePhotoScore = buildOverallSafetyScore(
  [emptyPhoto],
  { mainConcern: '', mobilityProfile: '', urgency: '' },
  'en',
)
const eightPhotoScore = buildOverallSafetyScore(
  Array.from({ length: 8 }, (_, index) => makeAnalysis({
    photoId: `photo-${index + 1}`,
    fileName: `room-${index + 1}.jpg`,
  })),
  { mainConcern: '', mobilityProfile: '', urgency: '' },
  'en',
)

assert.equal(
  eightPhotoScore.riskScore,
  onePhotoScore.riskScore,
  'Uploading more photos without visible findings must not increase the score.',
)

const highFinding = makeFinding({ severity: 'high', confidence: 1 })
const personalisedScore = buildOverallSafetyScore(
  [makeAnalysis({ findings: [highFinding] })],
  { mainConcern: 'Falls', mobilityProfile: 'Recent fall', urgency: 'Urgent' },
  'en',
)

assert.equal(
  personalisedScore.scoreBreakdown.reduce((sum, item) => sum + item.points, 0),
  personalisedScore.riskScore,
  'The displayed score breakdown must add up to the overall score.',
)
assert.ok(personalisedScore.riskScore > onePhotoScore.riskScore)
assert.match(personalisedScore.scoreBreakdown[0].explanation, /1\/1 photos analysed/)

const unavailableScore = buildOverallSafetyScore(
  [makeAnalysis({
    analysisStatus: 'unavailable',
    findings: [],
    riskScore: 0,
    riskLevel: 'low',
    scoreExplanation: 'No visual score',
  })],
  { mainConcern: '', mobilityProfile: '', urgency: '' },
  'en',
)

assert.equal(unavailableScore.scoreBreakdown[0].points, 0)
assert.equal(unavailableScore.analysisCoverage, 0)

console.log('Safety report analysis and scoring checks passed.')
