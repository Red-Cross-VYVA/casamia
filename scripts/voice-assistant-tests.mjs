import assert from 'node:assert/strict'

import {
  createElevenLabsConversationToken,
  createElevenLabsSpeech,
  ElevenLabsError,
  getElevenLabsAgentConfiguration,
  getElevenLabsConfiguration,
} from '../api/_lib/elevenlabs.js'

const missingConfig = getElevenLabsConfiguration({})
assert.equal(missingConfig.configured, false)
assert.deepEqual(missingConfig.missing, ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID'])

const missingAgentConfig = getElevenLabsAgentConfiguration({})
assert.equal(missingAgentConfig.configured, false)
assert.deepEqual(missingAgentConfig.missing, ['ELEVENLABS_API_KEY', 'ELEVENLABS_AGENT_ID'])

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

assert.match(capturedAgentUrl, /\/convai\/conversation\/token\?agent_id=agent_test&environment=production$/)
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

console.log('Voice assistant tests passed.')
