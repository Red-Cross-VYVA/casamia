import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  analyseSafetyImage,
  parseSafetyPhotoAnalysis,
} from '../api/public/analyse-safety-photo.js'
import {
  buildOverallSafetyScore,
  scorePhotoFindings,
} from '../src/services/safetyReportScoring.ts'

function openAiResult(value) {
  return {
    output: [{
      type: 'message',
      role: 'assistant',
      content: [{ type: 'output_text', text: JSON.stringify(value) }],
    }],
  }
}

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

let openAiRequest
const analysed = await analyseSafetyImage({
  mediaType: 'image/jpeg',
  data: 'AA==',
  assignedRoom: 'bathroom',
  locale: 'en',
  context: { mainConcern: 'Falls' },
}, {
  env: { OPENAI_API_KEY: 'test-key', OPENAI_VISION_MODEL: 'test-model' },
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
