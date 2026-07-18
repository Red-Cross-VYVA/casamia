import assert from 'node:assert/strict'

import {
  analyseSafetyImage,
  parseSafetyPhotoAnalysis,
} from '../api/public/analyse-safety-photo.js'
import {
  buildOverallSafetyScore,
  scorePhotoFindings,
} from '../src/services/safetyReportScoring.ts'

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

const parsed = parseSafetyPhotoAnalysis({
  content: [{
    type: 'text',
    text: JSON.stringify({
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
    }),
  }],
})

assert.equal(parsed.room, 'bathroom')
assert.equal(parsed.roomConfidence, 1, 'Room confidence should be clamped.')
assert.equal(parsed.findings.length, 1, 'Unsupported severities should not enter the report.')
assert.equal(parsed.findings[0].severity, 'high')

let anthropicRequest
const analysed = await analyseSafetyImage({
  mediaType: 'image/jpeg',
  data: 'AA==',
  assignedRoom: 'bathroom',
  locale: 'en',
  context: { mainConcern: 'Falls' },
}, {
  env: { ANTHROPIC_API_KEY: 'test-key', ANTHROPIC_VISION_MODEL: 'test-model' },
  fetchImpl: async (_url, options) => {
    anthropicRequest = JSON.parse(options.body)
    return {
      ok: true,
      json: async () => ({
        content: [{
          type: 'text',
          text: JSON.stringify({
            room: 'bathroom',
            roomConfidence: 0.91,
            headline: 'Bath access',
            overview: 'The bath edge is visible.',
            strengths: [],
            limitations: ['Measurements require confirmation'],
            findings: [makeFinding({ severity: 'high' })],
          }),
        }],
      }),
    }
  },
})

assert.equal(anthropicRequest.model, 'test-model')
assert.equal(anthropicRequest.temperature, 0)
assert.match(anthropicRequest.system, /only evidence visibly supported/i)
assert.equal(analysed.findings.length, 1)

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
