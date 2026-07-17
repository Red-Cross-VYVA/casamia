import assert from 'node:assert/strict'
import { Readable } from 'node:stream'

import {
  createElevenLabsConversationToken,
  createElevenLabsSpeech,
  ElevenLabsError,
  getElevenLabsApiBaseUrl,
  getElevenLabsAgentConfiguration,
  getElevenLabsConfiguration,
} from '../api/_lib/elevenlabs.js'
import { isAllowedVoiceOrigin } from '../api/public/elevenlabs-conversation-token.js'
import conversationTokenHandler from '../api/public/elevenlabs-conversation-token.js'

const missingConfig = getElevenLabsConfiguration({})
assert.equal(missingConfig.configured, false)
assert.deepEqual(missingConfig.missing, ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID'])

const missingAgentConfig = getElevenLabsAgentConfiguration({})
assert.equal(missingAgentConfig.configured, false)
assert.deepEqual(missingAgentConfig.missing, ['ELEVENLABS_API_KEY', 'ELEVENLABS_AGENT_ID'])
assert.equal(missingAgentConfig.serverLocation, 'us')
assert.equal(getElevenLabsApiBaseUrl('us'), 'https://api.elevenlabs.io/v1')
assert.equal(getElevenLabsApiBaseUrl('eu-residency'), 'https://api.eu.residency.elevenlabs.io/v1')
assert.equal(getElevenLabsApiBaseUrl('in-residency'), 'https://api.in.residency.elevenlabs.io/v1')
assert.equal(
  getElevenLabsAgentConfiguration({ ELEVENLABS_SERVER_LOCATION: 'invalid' }).serverLocation,
  'us',
)

await assert.rejects(
  () => createElevenLabsSpeech({ env: {}, text: '' }),
  (error) => error instanceof ElevenLabsError && error.statusCode === 400,
)

let capturedUrl = ''
let capturedInit
const audioBytes = new Uint8Array([73, 68, 51, 4])

const result = await createElevenLabsSpeech({
  env: {
    ELEVENLABS_API_KEY: 'test-key',
    ELEVENLABS_MODEL_ID: 'eleven_multilingual_v2',
    ELEVENLABS_VOICE_ID: 'voice/test',
  },
  fetchImpl: async (url, init) => {
    capturedUrl = url
    capturedInit = init

    return new Response(audioBytes, {
      headers: { 'content-type': 'audio/mpeg' },
      status: 200,
    })
  },
  text: 'Hola desde CasaMia.',
})

assert.match(capturedUrl, /voice%2Ftest\?output_format=mp3_44100_128$/)
assert.equal(capturedInit.method, 'POST')
assert.equal(capturedInit.headers['xi-api-key'], 'test-key')
assert.deepEqual(JSON.parse(capturedInit.body), {
  model_id: 'eleven_multilingual_v2',
  text: 'Hola desde CasaMia.',
})
assert.equal(result.contentType, 'audio/mpeg')
assert.deepEqual([...result.audio], [...audioBytes])

let capturedAgentUrl = ''
let capturedAgentInit
const agentAccess = await createElevenLabsConversationToken({
  env: {
    ELEVENLABS_AGENT_ENVIRONMENT: 'production',
    ELEVENLABS_AGENT_ID: 'agent_test',
    ELEVENLABS_API_KEY: 'agent-test-key',
    ELEVENLABS_SERVER_LOCATION: 'eu-residency',
  },
  fetchImpl: async (url, init) => {
    capturedAgentUrl = url
    capturedAgentInit = init
    return new Response(JSON.stringify({ token: 'short-lived-conversation-token' }), { status: 200 })
  },
})

assert.match(
  capturedAgentUrl,
  /^https:\/\/api\.eu\.residency\.elevenlabs\.io\/v1\/convai\/conversation\/token\?agent_id=agent_test&environment=production$/,
)
assert.equal(capturedAgentInit.method, 'GET')
assert.equal(capturedAgentInit.headers['xi-api-key'], 'agent-test-key')
assert.deepEqual(agentAccess, {
  serverLocation: 'eu-residency',
  token: 'short-lived-conversation-token',
})

await assert.rejects(
  () => createElevenLabsConversationToken({ env: {} }),
  (error) => error instanceof ElevenLabsError && error.statusCode === 503,
)

await assert.rejects(
  () => createElevenLabsConversationToken({
    env: {
      ELEVENLABS_AGENT_ID: 'agent_test',
      ELEVENLABS_API_KEY: 'agent-test-key',
    },
    fetchImpl: async () => new Response(JSON.stringify({ detail: 'Rate limited' }), { status: 429 }),
  }),
  (error) => error instanceof ElevenLabsError && error.statusCode === 429,
)

await assert.rejects(
  () => createElevenLabsConversationToken({
    env: {
      ELEVENLABS_AGENT_ID: 'agent_test',
      ELEVENLABS_API_KEY: 'agent-test-key',
    },
    fetchImpl: async () => new Response('{}', { status: 200 }),
  }),
  (error) => error instanceof ElevenLabsError && error.statusCode === 502,
)

await assert.rejects(
  () => createElevenLabsConversationToken({
    env: {
      ELEVENLABS_AGENT_ID: 'agent_test',
      ELEVENLABS_API_KEY: 'agent-test-key',
    },
    fetchImpl: async () => {
      throw new TypeError('network detail that must not escape')
    },
  }),
  (error) => error instanceof ElevenLabsError
    && error.statusCode === 502
    && !error.message.includes('network detail'),
)

const sameOriginRequest = {
  headers: {
    host: 'www.casamia.com.es',
    origin: 'https://www.casamia.com.es',
    'x-forwarded-proto': 'https',
  },
}
assert.equal(isAllowedVoiceOrigin(sameOriginRequest, { NODE_ENV: 'production' }), true)
assert.equal(
  isAllowedVoiceOrigin(
    { headers: { host: 'api.casamia.com.es', origin: 'https://www.casamia.com.es', 'x-forwarded-proto': 'https' } },
    { CASAMIA_ALLOWED_ORIGINS: 'https://www.casamia.com.es', NODE_ENV: 'production' },
  ),
  true,
)
assert.equal(
  isAllowedVoiceOrigin(
    { headers: { host: 'www.casamia.com.es', origin: 'https://attacker.example', 'x-forwarded-proto': 'https' } },
    { NODE_ENV: 'production' },
  ),
  false,
)
assert.equal(
  isAllowedVoiceOrigin(
    { headers: { host: 'api.example', origin: 'http://127.0.0.1:4187' } },
    { NODE_ENV: 'development' },
  ),
  true,
)

function makeRequest({ body = {}, method = 'POST', origin = 'https://www.casamia.com.es', rawBody } = {}) {
  const request = Readable.from([rawBody ?? JSON.stringify(body)])
  request.method = method
  request.headers = {
    host: 'www.casamia.com.es',
    origin,
    'x-forwarded-for': '203.0.113.10',
    'x-forwarded-proto': 'https',
  }
  request.socket = { remoteAddress: '203.0.113.10' }
  return request
}

function makeResponse() {
  return {
    body: '',
    headers: {},
    statusCode: 200,
    end(body = '') {
      this.body = body
      return this
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value
      return this
    },
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
  }
}

const originalFetch = globalThis.fetch
const originalConsoleError = console.error
const voiceEnvironmentKeys = [
  'ELEVENLABS_AGENT_ID',
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_SERVER_LOCATION',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_URL',
]
const originalVoiceEnvironment = Object.fromEntries(
  voiceEnvironmentKeys.map((key) => [key, process.env[key]]),
)

try {
  Object.assign(process.env, {
    ELEVENLABS_AGENT_ID: 'agent_test',
    ELEVENLABS_API_KEY: 'agent-test-key',
    ELEVENLABS_SERVER_LOCATION: 'us',
    SUPABASE_SERVICE_ROLE_KEY: 'supabase-service-role-test-key',
    SUPABASE_URL: 'https://supabase.test',
  })

  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ init, url: String(url) })
    if (String(url).includes('/rpc/reserve_wizard_voice_session')) {
      return new Response('true', { status: 200 })
    }
    if (String(url).includes('/convai/conversation/token')) {
      return new Response(JSON.stringify({ token: 'handler-token' }), { status: 200 })
    }
    throw new Error(`Unexpected test URL: ${url}`)
  }

  const response = makeResponse()
  await conversationTokenHandler(
    makeRequest({
      body: {
        consentConfirmed: true,
        locale: 'es',
        wizardReference: 'CM-ABC123',
      },
    }),
    response,
  )

  assert.equal(response.statusCode, 200)
  assert.equal(response.headers['cache-control'], 'no-store')
  assert.equal(response.headers['access-control-allow-origin'], 'https://www.casamia.com.es')
  assert.equal(response.headers.vary, 'Origin')
  assert.deepEqual(JSON.parse(response.body), { serverLocation: 'us', token: 'handler-token' })
  assert.equal(calls.some((call) => call.url.includes('/rpc/reserve_wizard_voice_session')), true)

  const rejectedOriginResponse = makeResponse()
  await conversationTokenHandler(
    makeRequest({ origin: 'https://attacker.example' }),
    rejectedOriginResponse,
  )
  assert.equal(rejectedOriginResponse.statusCode, 403)

  const preflightResponse = makeResponse()
  await conversationTokenHandler(makeRequest({ method: 'OPTIONS', rawBody: '' }), preflightResponse)
  assert.equal(preflightResponse.statusCode, 204)
  assert.equal(preflightResponse.headers['access-control-allow-origin'], 'https://www.casamia.com.es')

  let releasedReservation = false
  globalThis.fetch = async (url) => {
    if (String(url).includes('/rpc/reserve_wizard_voice_session')) {
      return new Response('true', { status: 200 })
    }
    if (String(url).includes('/rpc/release_wizard_voice_session')) {
      releasedReservation = true
      return new Response('null', { status: 200 })
    }
    if (String(url).includes('/convai/conversation/token')) {
      return new Response(JSON.stringify({ detail: 'private upstream detail' }), { status: 500 })
    }
    throw new Error(`Unexpected test URL: ${url}`)
  }

  console.error = () => undefined
  const failedUpstreamResponse = makeResponse()
  await conversationTokenHandler(
    makeRequest({
      body: {
        consentConfirmed: true,
        locale: 'en',
        wizardReference: 'CM-XYZ789',
      },
    }),
    failedUpstreamResponse,
  )
  assert.equal(failedUpstreamResponse.statusCode, 502)
  assert.equal(releasedReservation, true)
  assert.equal(JSON.parse(failedUpstreamResponse.body).message.includes('private upstream detail'), false)

  const invalidJsonResponse = makeResponse()
  await conversationTokenHandler(makeRequest({ rawBody: '{' }), invalidJsonResponse)
  assert.equal(invalidJsonResponse.statusCode, 400)
} finally {
  globalThis.fetch = originalFetch
  console.error = originalConsoleError
  for (const key of voiceEnvironmentKeys) {
    const value = originalVoiceEnvironment[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
}

console.log('Voice assistant tests passed.')
