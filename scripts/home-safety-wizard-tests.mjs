import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import finalizeAssessmentMedia from '../api/public/assessment-media-finalize.js'
import { classifyRoomImage, parseRoomClassification } from '../api/public/classify-room-photo.js'
import { getWizardPriceRange } from '../src/config/wizardPricing.ts'
import { buildWizardSteps } from '../src/services/wizardSteps.ts'
import { generateWizardResult } from '../src/services/wizardRecommendationEngine.ts'
import {
  buildRecommendedServicesPriceRange,
  buildWizardSafetyReport,
} from '../src/services/wizardSafetyReport.ts'
import { loadWizardState, SAFETY_WIZARD_STORAGE_KEY, saveWizardState } from '../src/services/wizardStorage.ts'
import { createWizardMediaManifest, createWizardSubmissionPayload } from '../src/services/wizardSubmission.ts'
import {
  createWizardMediaUploadPlan,
  hashWizardMediaToken,
  validateWizardMediaManifest,
  WIZARD_MEDIA_BUCKETS,
} from '../api/_lib/wizard-media.js'
import { createSignedStorageUploadUrl, ensurePrivateStorageBucket } from '../api/_lib/supabase.js'
import { inferRoomFromFileName } from '../src/services/roomPhotoClassification.ts'
import { WIZARD_CALLBACK_TIME_WINDOWS } from '../src/types/wizard.ts'

function openAiResult(value) {
  return {
    output: [{
      type: 'message',
      role: 'assistant',
      content: [{ type: 'output_text', text: JSON.stringify(value) }],
    }],
  }
}

function makeState(overrides = {}) {
  return {
    wizardReference: 'CM-TEST01',
    currentStep: 'home-type',
    started: true,
    userType: 'me',
    inputMethods: ['questions'],
    clientLocation: '',
    areasOfConcern: [],
    challenges: [],
    currentRisks: [],
    notes: '',
    photos: [],
    callbackRequest: {
      preferredDate: '',
      preferredTimeWindow: '',
      note: '',
      consent: false,
    },
    inspectionBooked: false,
    inspectionFee: 99,
    inspectionCreditThreshold: 300,
    contact: {
      fullName: '',
      phone: '',
      email: '',
      city: '',
      preferredMethod: 'phone',
      consent: false,
    },
    submitted: false,
    updatedAt: new Date(0).toISOString(),
    ...overrides,
  }
}

function makeVoiceSession(overrides = {}) {
  return {
    provider: 'elevenlabs',
    conversationId: 'conversation-test-1',
    language: 'es',
    startedAt: '2026-07-17T10:00:00.000Z',
    endedAt: '2026-07-17T10:01:10.000Z',
    durationSeconds: 70,
    transcript: [
      { role: 'agent', message: '¿Qué parte de la vivienda te preocupa?' },
      { role: 'user', message: 'El suelo del baño resbala.' },
    ],
    ...overrides,
  }
}

function makeApiRequest(body) {
  const request = Readable.from([JSON.stringify(body)])
  request.method = 'POST'
  request.headers = {}
  return request
}

function makeApiResponse() {
  let finish
  const completed = new Promise((resolve) => {
    finish = resolve
  })
  const response = {
    body: undefined,
    headers: {},
    statusCode: 200,
    completed,
    end(body) {
      this.body = body ? JSON.parse(body) : undefined
      finish()
    },
    setHeader(name, value) {
      this.headers[name] = value
      return this
    },
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
  }
  return response
}

function makeService(overrides = {}) {
  return {
    id: 'service',
    slug: 'service',
    name: 'Service',
    shortDescription: 'Service description',
    customerBenefit: 'Customer benefit',
    room: 'movement',
    category: 'Safety',
    pricingType: 'fixed',
    productPrice: 100,
    installationPrice: 0,
    vatRate: 0.21,
    quantityType: 'per_home',
    requiresInstallation: false,
    requiresMeasurement: false,
    requiresSiteVisit: false,
    requiresCompatibilityCheck: false,
    includedItems: [],
    wizardAreas: ['living-room'],
    active: true,
    ...overrides,
  }
}

{
  const steps = buildWizardSteps(makeState({ homeType: 'apartment', floorCount: 'one' }))
  assert.equal(steps.includes('stairs'), false, 'A one-floor apartment should skip the stairs question.')
}

{
  const steps = buildWizardSteps(makeState({ userType: 'family' }))
  assert.equal(steps.includes('relationship'), false, 'Family users should not be asked who they are helping.')
  assert.equal(
    steps.indexOf('methods'),
    steps.indexOf('user-type') + 1,
    'Family users should go directly from user type to their preferred route.',
  )
}

{
  const originalWindow = globalThis.window
  const stateBeforeCallbackRoute = makeState({
    currentStep: 'relationship',
    relationship: 'parent',
    userType: 'family',
    voiceRecording: {
      id: 'obsolete-recording',
      durationSeconds: 8,
      mimeType: 'audio/webm',
      size: 1024,
      recordedAt: '2026-01-01T00:00:00.000Z',
    },
    voiceSession: makeVoiceSession(),
  })
  const { callbackRequest: _missingCallbackRequest, ...legacyState } = stateBeforeCallbackRoute
  globalThis.window = {
    localStorage: {
      getItem(key) {
        return key === SAFETY_WIZARD_STORAGE_KEY ? JSON.stringify(legacyState) : null
      },
    },
  }

  try {
    const migrated = loadWizardState()
    assert.equal(migrated?.currentStep, 'methods', 'Saved relationship steps should resume at route selection.')
    assert.equal('relationship' in migrated, false, 'Saved relationship data should be removed during migration.')
    assert.equal('voiceRecording' in migrated, false, 'Obsolete local recording metadata should be removed.')
    assert.deepEqual(migrated?.voiceSession, makeVoiceSession(), 'ElevenLabs session metadata should be restored.')
    assert.deepEqual(
      migrated?.callbackRequest,
      { preferredDate: '', preferredTimeWindow: '', note: '', consent: false },
      'Saved sessions from before the callback route should receive safe empty callback defaults.',
    )
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
  }
}

function makePhotoAnalysis(overrides = {}) {
  return {
    room: 'bathroom',
    roomConfidence: 0.92,
    headline: 'Bathroom safety review',
    overview: 'Visible bathroom details were reviewed.',
    strengths: ['The route is well lit.'],
    limitations: ['Wall construction cannot be confirmed from a photo.'],
    findings: [],
    ...overrides,
  }
}

function makeAnalysedPhoto(overrides = {}) {
  return {
    id: 'bathroom-photo-1',
    kind: 'image',
    name: 'bathroom.jpg',
    room: 'bathroom',
    size: 1024,
    type: 'image/jpeg',
    analysisStatus: 'analysed',
    analysis: makePhotoAnalysis(),
    ...overrides,
  }
}

function makeFinding(overrides = {}) {
  return {
    category: 'slip',
    title: 'Wet shower floor',
    evidence: 'The shower floor appears smooth and has no visible non-slip treatment.',
    severity: 'high',
    confidence: 0.9,
    whyItMatters: 'Wet smooth surfaces can increase the chance of slipping.',
    action: 'Confirm the surface and add a suitable non-slip treatment.',
    requiresConfirmation: true,
    ...overrides,
  }
}

{
  assert.equal(inferRoomFromFileName('IMG_baño_01.jpg'), 'bathroom')
  assert.equal(inferRoomFromFileName('main-bedroom.webp'), 'bedroom')
  assert.equal(inferRoomFromFileName('entrada principal.png'), 'entrance')
  assert.equal(inferRoomFromFileName('holiday-photo.jpg'), 'other')
}

{
  assert.deepEqual(
    parseRoomClassification(openAiResult({ room: 'kitchen', confidence: 1.2 })),
    { room: 'kitchen', confidence: 1 },
    'Vision output should be restricted to known rooms with normalized confidence.',
  )

  let apiRequest
  const classification = await classifyRoomImage(
    { mediaType: 'image/jpeg', data: 'aGVsbG8=' },
    {
      env: { OPENAI_API_KEY: 'test-key', OPENAI_VISION_MODEL: 'test-vision-model' },
      fetchImpl: async (url, init) => {
        apiRequest = { url, init }
        return {
          ok: true,
          json: async () => openAiResult({ room: 'bathroom', confidence: 0.92 }),
        }
      },
    },
  )

  assert.deepEqual(classification, { room: 'bathroom', confidence: 0.92 })
  const body = JSON.parse(apiRequest.init.body)
  assert.equal(apiRequest.url, 'https://api.openai.com/v1/responses')
  assert.equal(apiRequest.init.method, 'POST')
  assert.equal(apiRequest.init.headers.Authorization, 'Bearer test-key')
  assert.equal(body.model, 'test-vision-model')
  assert.equal(body.store, false)
  assert.equal(body.max_output_tokens, 80)
  assert.deepEqual(
    body.input[0].content.find(({ type }) => type === 'input_image'),
    {
      type: 'input_image',
      image_url: 'data:image/jpeg;base64,aGVsbG8=',
      detail: 'low',
    },
  )
  assert.equal(body.input[0].content.some(({ type }) => type === 'input_text'), true)
  assert.equal(body.text.format.type, 'json_schema')
  assert.equal(body.text.format.strict, true)
  assert.equal(body.text.format.schema.additionalProperties, false)
  assert.deepEqual(body.text.format.schema.properties.room.enum, [
    'bathroom',
    'bedroom',
    'kitchen',
    'living-room',
    'stairs',
    'entrance',
    'outdoor',
    'other',
  ])

  await assert.rejects(
    () => classifyRoomImage({ mediaType: 'image/jpeg', data: 'aGVsbG8=' }, { env: {} }),
    (error) => error.statusCode === 503,
    'Room recognition should fail safely when the server-only API key is missing.',
  )
}

{
  const originalWindow = globalThis.window
  const callbackState = makeState({
    currentStep: 'callback-confirmation',
    inputMethods: ['callback'],
    callbackRequest: {
      preferredDate: '2026-07-22',
      preferredTimeWindow: '15:00-18:00',
      note: 'Please call my daughter first.',
      consent: true,
    },
    callbackSubmission: {
      id: 'callback-request-1',
      submittedAt: '2026-07-17T12:00:00.000Z',
    },
  })
  globalThis.window = {
    localStorage: {
      getItem(key) {
        return key === SAFETY_WIZARD_STORAGE_KEY ? JSON.stringify(callbackState) : null
      },
    },
  }

  try {
    const restored = loadWizardState()
    assert.deepEqual(restored?.callbackRequest, callbackState.callbackRequest)
    assert.deepEqual(
      restored?.callbackSubmission,
      callbackState.callbackSubmission,
      'Successful callback metadata should survive a saved-session reload.',
    )
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
  }
}

{
  const originalWindow = globalThis.window
  let savedValue = ''
  globalThis.window = {
    localStorage: {
      setItem(key, value) {
        if (key === SAFETY_WIZARD_STORAGE_KEY) savedValue = value
      },
    },
  }

  try {
    saveWizardState(makeState({
      currentStep: 'callback-confirmation',
      inputMethods: ['callback'],
      callbackRequest: {
        preferredDate: '2026-07-22',
        preferredTimeWindow: '15:00-18:00',
        note: 'Sensitive note',
        consent: true,
      },
      callbackSubmission: { id: 'callback-request-1', submittedAt: '2026-07-17T12:00:00.000Z' },
      contact: {
        fullName: 'Ana García',
        phone: '600111222',
        email: 'ana@example.com',
        city: 'Málaga',
        preferredMethod: 'phone',
        consent: false,
      },
      submitted: true,
    }))

    const persisted = JSON.parse(savedValue)
    assert.equal(persisted.currentStep, 'methods', 'A submitted callback must not be restored with its PII summary.')
    assert.deepEqual(
      persisted.callbackRequest,
      { preferredDate: '', preferredTimeWindow: '', note: '', consent: false },
      'Callback scheduling details and consent must not be persisted on the device.',
    )
    assert.equal(persisted.contact.fullName, '')
    assert.equal(persisted.contact.phone, '')
    assert.equal(persisted.contact.email, '')
    assert.equal(persisted.contact.city, '')
    assert.equal(persisted.callbackSubmission, undefined)
  } finally {
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
  }
}

{
  const steps = buildWizardSteps(makeState({ homeType: 'house', floorCount: 'two' }))
  assert.equal(steps.includes('stairs'), true, 'A multi-floor house should include the stairs question.')
}

{
  const routeSteps = {
    questions: buildWizardSteps(makeState({ inputMethods: ['questions'] })),
    photos: buildWizardSteps(makeState({ inputMethods: ['photos'] })),
    voice: buildWizardSteps(makeState({ inputMethods: ['voice'] })),
    call: buildWizardSteps(makeState({ inputMethods: ['call'] })),
    callback: buildWizardSteps(makeState({ inputMethods: ['callback'] })),
    visit: buildWizardSteps(makeState({ inputMethods: ['visit'] })),
  }

  assert.equal(routeSteps.questions.includes('home-type'), true, 'Questions should open the guided home flow.')
  assert.equal(routeSteps.questions.includes('photos'), true, 'Questions should offer the optional photo step.')
  assert.equal(
    routeSteps.questions.indexOf('photos'),
    routeSteps.questions.indexOf('notes') + 1,
    'The optional photo step should immediately follow notes.',
  )
  assert.equal(routeSteps.photos.includes('photos'), true, 'Photos should open only the photo route.')
  assert.equal(routeSteps.photos.includes('voice'), false, 'Photos must not also open the voice route.')
  assert.equal(routeSteps.voice.includes('voice'), true, 'Voice should open the voice route.')
  assert.equal(routeSteps.call.includes('phone'), true, 'Call should open the contact route.')
  assert.deepEqual(
    routeSteps.callback,
    ['entry', 'user-type', 'methods', 'callback', 'callback-confirmation'],
    'Callback should end after its form and confirmation without entering the assessment.',
  )
  assert.equal(routeSteps.visit.includes('visit'), true, 'Visit should open the booking route.')
}

{
  const clientCallbackSteps = buildWizardSteps(makeState({
    userType: 'client',
    inputMethods: ['callback'],
  }))

  assert.deepEqual(
    clientCallbackSteps,
    ['entry', 'user-type', 'methods', 'callback', 'callback-confirmation'],
    'Business callback requests should also bypass the full client assessment.',
  )
  assert.deepEqual(
    WIZARD_CALLBACK_TIME_WINDOWS,
    ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-20:00', 'flexible'],
    'Callback windows must remain language-independent values safe for the API.',
  )
}

{
  const legacyMultiMethodSteps = buildWizardSteps(makeState({ inputMethods: ['questions', 'photos'] }))
  assert.equal(
    legacyMultiMethodSteps.filter((step) => step === 'photos').length,
    1,
    'The photo step must not be duplicated for legacy multi-method state.',
  )
}

{
  const result = generateWizardResult(makeState({
    areasOfConcern: ['smart-safety'],
    challenges: ['emergency-support'],
    currentRisks: ['no-emergency-alert'],
  }))

  assert.equal(result.recommendedPlan, 'smart-safety', 'Smart-safety signals should recommend the smart plan.')
  assert.equal(result.nextAction, 'book-visit', 'A consumer result should retain the optional visit as its next action.')
}

{
  const result = generateWizardResult(makeState({ inspectionBooked: true }))
  assert.equal(result.confidence, 'inspection', 'A booked inspection should change the confidence note.')
  assert.equal(result.nextAction, 'request-proposal', 'A booked inspection should move the user toward a proposal.')
}

{
  const result = generateWizardResult(makeState({ voiceSession: makeVoiceSession() }))
  assert.equal(result.confidence, 'supported', 'An ElevenLabs conversation should support the recommendation.')
}

{
  const result = generateWizardResult(makeState({
    userType: 'client',
    clientType: 'care-provider',
    clientSiteCount: '6-20',
    clientNeed: 'safety-audits',
    clientLocation: 'Madrid',
  }))

  assert.equal(result.recommendedPlan, 'business-consultation')
  assert.equal(result.nextAction, 'business-consultation')
  assert.equal(result.priceRange, undefined, 'Client results must not expose consumer package pricing.')
}

{
  const state = makeState({
    areasOfConcern: ['bathroom', 'living-room'],
    currentRisks: ['unsafe-bathroom', 'loose-rugs'],
  })
  const services = [
    makeService({ id: 'living-starter', productPrice: 75 }),
    makeService({ id: 'living-premium', productPrice: 250 }),
    makeService({ id: 'bathroom-starter', room: 'bathroom', productPrice: 100, wizardAreas: ['bathroom'] }),
  ]
  const range = getWizardPriceRange(state, services, 'es')

  assert.equal(range?.minimum, 212, 'The estimate should use the lowest active option per area and include VAT.')
  assert.deepEqual(range?.serviceIds, ['bathroom-starter', 'living-starter'])
  assert.match(range?.label ?? '', /^Desde /)

  const adminEditedServices = services.map((service) =>
    service.id === 'bathroom-starter' ? { ...service, productPrice: 200 } : service,
  )
  const editedRange = getWizardPriceRange(state, adminEditedServices, 'es')

  assert.equal(editedRange?.minimum, 333, 'An Admin catalogue price edit must change the wizard estimate.')
}

{
  const bathroomService = makeService({
    id: 'bathroom-floor-safety',
    name: 'Bathroom floor safety',
    customerBenefit: 'Make wet movement safer.',
    room: 'bathroom',
    wizardAreas: ['bathroom'],
    evidenceCategories: ['slip'],
    minimumEvidenceSeverity: 'medium',
    productPrice: 200,
    installationPrice: 50,
  })
  const report = buildWizardSafetyReport(makeState({
    mobilityLevel: 'walker',
    challenges: ['falls'],
    urgency: 'soon',
    photos: [makeAnalysedPhoto({
      analysis: makePhotoAnalysis({
        findings: [
          makeFinding(),
          makeFinding({
            category: 'support',
            title: 'No visible support point',
            severity: 'medium',
            confidence: 0.8,
            evidence: 'No fixed support point is visible beside the shower entrance.',
            whyItMatters: 'A stable handhold can help with balance during entry and exit.',
            action: 'Confirm the wall and consider a professionally fixed support point.',
          }),
        ],
      }),
    })],
  }), [bathroomService], 'en')

  assert.equal(report.status, 'complete', 'A successfully analysed photo should produce a complete visual report.')
  assert.equal(report.rooms.length, 1)
  assert.ok(report.safetyScore < 72, 'High and medium bathroom evidence should lower the safety score into attention range.')
  assert.match(report.rooms[0].scoreExplanation, /2 consolidated visible findings/)
  assert.deepEqual(
    report.contextSignals,
    ['Walking frame used', 'Falls reported', 'Action wanted soon'],
    'Personal context should be visible without being folded into the photographic score.',
  )
  assert.equal(report.serviceRecommendations[0]?.serviceId, 'bathroom-floor-safety')

  const range = buildRecommendedServicesPriceRange(report, [bathroomService], 'en')
  assert.equal(range?.minimum, 303, 'The visual estimate should use only matched catalogue services and include VAT.')
  assert.deepEqual(range?.serviceIds, ['bathroom-floor-safety'])
}

{
  const repeatedFinding = makeFinding()
  const report = buildWizardSafetyReport(makeState({
    photos: [
      makeAnalysedPhoto({ id: 'bathroom-photo-1', analysis: makePhotoAnalysis({ findings: [repeatedFinding] }) }),
      makeAnalysedPhoto({ id: 'bathroom-photo-2', name: 'bathroom-2.jpg', analysis: makePhotoAnalysis({ findings: [repeatedFinding] }) }),
    ],
  }), [], 'en')

  assert.equal(report.rooms[0].findings.length, 1, 'The same visible concern across photos must be consolidated once.')
  assert.equal(report.rooms[0].photoAnalyses.length, 2, 'Every uploaded image should retain its own analysis in the room report.')
  assert.equal(report.rooms[0].photoAnalyses[0].safetyScore, 65)
  assert.deepEqual(
    report.rooms[0].findings[0].photoIds,
    ['bathroom-photo-1', 'bathroom-photo-2'],
    'A consolidated finding should retain every supporting photo reference.',
  )
  assert.equal(report.rooms[0].safetyScore, 65, 'Repeated photos must not inflate the room risk score.')
}

{
  const noConcernPhoto = makeAnalysedPhoto({
    id: 'living-photo-1',
    room: 'living-room',
    analysis: makePhotoAnalysis({
      room: 'living-room',
      headline: 'Living room review',
      findings: [],
    }),
  })
  const report = buildWizardSafetyReport(makeState({
    photos: [
      makeAnalysedPhoto({ analysis: makePhotoAnalysis({ findings: [makeFinding()] }) }),
      noConcernPhoto,
    ],
  }), [], 'en')

  assert.ok(
    report.safetyScore < 75,
    'One higher-risk room should remain influential instead of being hidden by a safer-room average.',
  )
}

{
  const unavailablePhoto = {
    ...makeAnalysedPhoto(),
    analysisStatus: 'unavailable',
    analysis: undefined,
    analysisError: 'Visual analysis unavailable.',
  }
  const state = makeState({ photos: [unavailablePhoto] })
  const report = buildWizardSafetyReport(state, [], 'en')
  const result = generateWizardResult(state, { services: [], language: 'en' })

  assert.equal(report.status, 'questionnaire-only')
  assert.equal(report.safetyScore, undefined, 'An unavailable photo must never be treated as evidence of a safe room.')
  assert.equal(result.confidence, 'early', 'Uploading a photo alone must not imply a supported recommendation.')
}

{
  const bathroomService = makeService({
    id: 'bathroom-floor-safety',
    room: 'bathroom',
    wizardAreas: ['bathroom'],
    evidenceCategories: ['slip'],
  })
  const result = generateWizardResult(makeState({
    photos: [makeAnalysedPhoto({ analysis: makePhotoAnalysis({ findings: [makeFinding()] }) })],
  }), { services: [bathroomService], language: 'en' })

  assert.equal(result.recommendedPlan, 'home-safety', 'Matched photo evidence should recommend relevant improvements, not a generic assessment.')
  assert.equal(result.safetyReport?.serviceRecommendations[0]?.serviceId, 'bathroom-floor-safety')
  assert.equal(result.confidence, 'supported')
}

{
  const state = makeState({
    userType: 'me',
    voiceSession: makeVoiceSession(),
    photos: [
      {
        id: 'image-1',
        kind: 'image',
        name: 'bathroom.jpg',
        room: 'bathroom',
        size: 1024,
        type: 'image/jpeg',
        file: { binary: true },
        previewUrl: 'blob:image',
      },
      {
        id: 'video-1',
        kind: 'video',
        name: 'stairs.mp4',
        room: 'stairs',
        size: 2048,
        type: 'video/mp4',
        file: { binary: true },
        previewUrl: 'blob:video',
      },
    ],
  })
  const manifest = createWizardMediaManifest(state)
  const payload = createWizardSubmissionPayload(state)

  assert.equal(manifest.length, 2, 'Both selected photos and videos should be prepared for upload.')
  assert.deepEqual(Object.keys(manifest[1]).sort(), ['id', 'kind', 'name', 'room', 'size', 'type'])
  assert.equal(payload.photoMetadata.length, 1)
  assert.equal(payload.videoMetadata.length, 1)
  assert.deepEqual(payload.voiceMetadata, makeVoiceSession(), 'The complete agent conversation metadata should be submitted.')
  assert.equal('relationship' in payload, false, 'Relationship information must not be collected or submitted.')
  assert.equal('file' in payload.videoMetadata[0], false, 'Binary files must never be copied into JSON payloads.')
  assert.equal('previewUrl' in payload.videoMetadata[0], false, 'Local preview URLs must never be submitted.')
}

{
  const validated = validateWizardMediaManifest([
    { id: 'video-1', kind: 'image', name: 'home.mp4', room: 'living-room', size: 1024, type: 'video/mp4' },
  ])
  assert.equal(validated[0].kind, 'video', 'The server must derive media kind from the validated MIME type.')
  const uploadPlan = createWizardMediaUploadPlan(validated, '00000000-0000-4000-8000-000000000000')
  assert.equal(uploadPlan[0].bucket, WIZARD_MEDIA_BUCKETS.video, 'Videos must use the video-only bucket.')
  assert.match(uploadPlan[0].objectPath, /^00000000-0000-4000-8000-000000000000\/.+\.mp4$/)
  assert.throws(
    () => validateWizardMediaManifest([
      { id: 'bad-1', kind: 'video', name: 'unsafe.exe', room: 'other', size: 1024, type: 'application/octet-stream' },
    ]),
    /Unsupported media type/,
  )
  assert.throws(
    () => validateWizardMediaManifest([
      { id: 'large-1', kind: 'video', name: 'long.mp4', room: 'other', size: 50 * 1024 * 1024 + 1, type: 'video/mp4' },
    ]),
    /50 MB or smaller/,
  )
}

{
  const originalFetch = globalThis.fetch
  const originalUrl = process.env.SUPABASE_URL
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const requests = []

  process.env.SUPABASE_URL = 'https://project.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key'
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init })
    if (String(url).endsWith('/storage/v1/bucket/wizard-media')) {
      return new Response(JSON.stringify({ message: 'Bucket not found' }), {
        headers: { 'content-type': 'application/json' },
        status: 404,
      })
    }
    if (String(url).endsWith('/storage/v1/bucket')) {
      return new Response(JSON.stringify({ name: 'wizard-media' }), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      })
    }
    return new Response(JSON.stringify({
      url: '/object/upload/sign/wizard-media/assessment/media.mp4?token=signed-token',
    }), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    })
  }

  try {
    const bucket = await ensurePrivateStorageBucket({
      allowedMimeTypes: ['video/mp4'],
      bucket: 'wizard-media',
      fileSizeLimit: 50 * 1024 * 1024,
    })
    const signed = await createSignedStorageUploadUrl('wizard-media', 'assessment/media.mp4')

    assert.equal(bucket.ok, true)
    assert.equal(signed.ok, true)
    assert.equal(
      signed.body.signedUrl,
      'https://project.supabase.co/storage/v1/object/upload/sign/wizard-media/assessment/media.mp4?token=signed-token',
    )
    assert.equal(requests[1].init.method, 'POST', 'A missing private bucket should be created server-side.')
    assert.equal(
      requests[2].init.headers.Authorization,
      'Bearer service-role-test-key',
      'The service role key should be used only by the server-side Storage request.',
    )
  } finally {
    globalThis.fetch = originalFetch
    if (originalUrl === undefined) delete process.env.SUPABASE_URL
    else process.env.SUPABASE_URL = originalUrl
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey
  }
}

{
  const originalFetch = globalThis.fetch
  const originalUrl = process.env.SUPABASE_URL
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const assessmentId = '00000000-0000-4000-8000-000000000001'
  const uploadToken = 'concurrent-finalize-token'
  const initialRecord = {
    id: assessmentId,
    status: 'Media pending',
    payload_json: {
      mediaManifest: [{
        bucket: 'wizard-videos',
        id: 'video-1',
        kind: 'video',
        objectPath: `${assessmentId}/video.mp4`,
        size: 1024,
        type: 'video/mp4',
      }],
      mediaUpload: {
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        status: 'pending',
        tokenHash: hashWizardMediaToken(uploadToken),
      },
    },
  }
  let record = structuredClone(initialRecord)
  let initialReads = 0
  let deleteRequests = 0

  process.env.SUPABASE_URL = 'https://project.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key'
  globalThis.fetch = async (url, init = {}) => {
    const parsed = new URL(String(url))

    if (parsed.pathname === '/rest/v1/assessment_requests' && init.method === 'GET') {
      initialReads += 1
      const selected = initialReads <= 2 ? initialRecord : record
      return new Response(JSON.stringify([structuredClone(selected)]), { status: 200 })
    }

    if (parsed.pathname === '/rest/v1/assessment_requests' && init.method === 'PATCH') {
      const statusFilter = parsed.searchParams.get('status')?.replace(/^eq\./, '')
      const mediaStatusFilter = parsed.searchParams
        .get('payload_json->mediaUpload->>status')
        ?.replace(/^eq\./, '')
      const claimedAtFilter = parsed.searchParams
        .get('payload_json->mediaUpload->>claimedAt')
        ?.replace(/^eq\./, '')
      const claimExpiresAtFilter = parsed.searchParams
        .get('payload_json->mediaUpload->>claimExpiresAt')
        ?.replace(/^eq\./, '')
      const tokenFilter = parsed.searchParams
        .get('payload_json->mediaUpload->>tokenHash')
        ?.replace(/^eq\./, '')
      const matches = (!statusFilter || record.status === statusFilter)
        && (!mediaStatusFilter || record.payload_json.mediaUpload.status === mediaStatusFilter)
        && (!claimedAtFilter || record.payload_json.mediaUpload.claimedAt === claimedAtFilter)
        && (!claimExpiresAtFilter || record.payload_json.mediaUpload.claimExpiresAt === claimExpiresAtFilter)
        && (!tokenFilter || record.payload_json.mediaUpload.tokenHash === tokenFilter)

      if (!matches) return new Response('[]', { status: 200 })

      record = { ...record, ...JSON.parse(init.body) }
      return new Response(JSON.stringify([structuredClone(record)]), { status: 200 })
    }

    if (parsed.pathname.includes('/storage/v1/object/info/')) {
      return new Response(JSON.stringify({ metadata: { mimetype: 'video/mp4', size: 1024 } }), { status: 200 })
    }

    if (init.method === 'DELETE') {
      deleteRequests += 1
      return new Response('[]', { status: 200 })
    }

    return new Response(JSON.stringify({ message: 'Unexpected test request.' }), { status: 500 })
  }

  try {
    const responses = [makeApiResponse(), makeApiResponse()]
    const requests = responses.map(() => makeApiRequest({ assessmentId, uploadToken, action: 'complete' }))
    await Promise.all(requests.map((request, index) => finalizeAssessmentMedia(request, responses[index])))
    await Promise.all(responses.map((response) => response.completed))

    assert.deepEqual(
      responses.map((response) => response.statusCode).sort((left, right) => left - right),
      [200, 409],
      'Only one concurrent finalizer may claim and complete a media upload.',
    )
    assert.equal(record.status, 'New')
    assert.equal(record.payload_json.mediaUpload.status, 'complete')
    assert.equal(deleteRequests, 0, 'A losing concurrent finalizer must never delete verified media.')

    const retryResponse = makeApiResponse()
    await finalizeAssessmentMedia(
      makeApiRequest({ assessmentId, uploadToken, action: 'complete' }),
      retryResponse,
    )
    await retryResponse.completed
    assert.equal(retryResponse.statusCode, 200, 'Repeating a completed finalization must be idempotent.')

    record = {
      ...structuredClone(initialRecord),
      status: 'Media verifying',
      payload_json: {
        ...structuredClone(initialRecord.payload_json),
        mediaUpload: {
          ...structuredClone(initialRecord.payload_json.mediaUpload),
          claimedAt: new Date().toISOString(),
          claimExpiresAt: new Date(Date.now() + 60_000).toISOString(),
          status: 'verifying',
        },
      },
    }
    const inProgressResponse = makeApiResponse()
    await finalizeAssessmentMedia(
      makeApiRequest({ assessmentId, uploadToken, action: 'complete' }),
      inProgressResponse,
    )
    await inProgressResponse.completed
    assert.equal(inProgressResponse.statusCode, 202, 'An active finalizer should return a retryable response.')
    assert.equal(inProgressResponse.body.retryAfterMs, 750)

    record.payload_json.mediaUpload.claimExpiresAt = new Date(Date.now() - 1_000).toISOString()
    const recoveredResponse = makeApiResponse()
    await finalizeAssessmentMedia(
      makeApiRequest({ assessmentId, uploadToken, action: 'complete' }),
      recoveredResponse,
    )
    await recoveredResponse.completed
    assert.equal(recoveredResponse.statusCode, 200, 'A stale finalization claim should be recoverable.')
    assert.equal(record.status, 'New')
    assert.equal(record.payload_json.mediaUpload.status, 'complete')
  } finally {
    globalThis.fetch = originalFetch
    if (originalUrl === undefined) delete process.env.SUPABASE_URL
    else process.env.SUPABASE_URL = originalUrl
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey
  }
}

console.log('Home safety wizard tests passed.')
