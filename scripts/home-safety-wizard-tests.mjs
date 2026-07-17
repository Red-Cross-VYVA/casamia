import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import finalizeAssessmentMedia from '../api/public/assessment-media-finalize.js'
import { getWizardPriceRange } from '../src/config/wizardPricing.ts'
import { buildWizardSteps } from '../src/services/wizardSteps.ts'
import { generateWizardResult } from '../src/services/wizardRecommendationEngine.ts'
import { loadWizardState, SAFETY_WIZARD_STORAGE_KEY } from '../src/services/wizardStorage.ts'
import { createWizardMediaManifest, createWizardSubmissionPayload } from '../src/services/wizardSubmission.ts'
import {
  createWizardMediaUploadPlan,
  hashWizardMediaToken,
  validateWizardMediaManifest,
  WIZARD_MEDIA_BUCKETS,
} from '../api/_lib/wizard-media.js'
import { createSignedStorageUploadUrl, ensurePrivateStorageBucket } from '../api/_lib/supabase.js'

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
    inspectionBooked: false,
    inspectionFee: 89,
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
  const legacyState = makeState({
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
  assert.equal(routeSteps.visit.includes('visit'), true, 'Visit should open the booking route.')
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
