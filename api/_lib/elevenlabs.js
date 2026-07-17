const elevenLabsApiOrigins = {
  'eu-residency': 'https://api.eu.residency.elevenlabs.io',
  'in-residency': 'https://api.in.residency.elevenlabs.io',
  global: 'https://api.elevenlabs.io',
  us: 'https://api.elevenlabs.io',
}

const elevenLabsRequestTimeoutMs = 10_000

export const elevenLabsPreviewCharacterLimit = 500

export class ElevenLabsError extends Error {
  constructor(message, statusCode = 502) {
    super(message)
    this.name = 'ElevenLabsError'
    this.statusCode = statusCode
  }
}

export function getElevenLabsConfiguration(env = process.env) {
  const apiKey = env.ELEVENLABS_API_KEY?.trim() ?? ''
  const voiceId = env.ELEVENLABS_VOICE_ID?.trim() ?? ''
  const modelId = env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_multilingual_v2'

  return {
    apiKey,
    configured: Boolean(apiKey && voiceId),
    missing: [
      ...(apiKey ? [] : ['ELEVENLABS_API_KEY']),
      ...(voiceId ? [] : ['ELEVENLABS_VOICE_ID']),
    ],
    modelId,
    serverLocation: getElevenLabsServerLocation(env),
    voiceId,
  }
}

export function getElevenLabsServerLocation(env = process.env) {
  const requestedLocation = env.ELEVENLABS_SERVER_LOCATION?.trim() || 'us'
  return Object.hasOwn(elevenLabsApiOrigins, requestedLocation) ? requestedLocation : 'us'
}

export function getElevenLabsApiBaseUrl(serverLocation) {
  return `${elevenLabsApiOrigins[serverLocation] || elevenLabsApiOrigins.us}/v1`
}

export function getElevenLabsAgentConfiguration(env = process.env) {
  const apiKey = env.ELEVENLABS_API_KEY?.trim() ?? ''
  const agentId = env.ELEVENLABS_AGENT_ID?.trim() ?? ''
  const environment = env.ELEVENLABS_AGENT_ENVIRONMENT?.trim() || 'production'
  const serverLocation = getElevenLabsServerLocation(env)

  return {
    agentId,
    apiKey,
    configured: Boolean(apiKey && agentId),
    environment,
    missing: [
      ...(apiKey ? [] : ['ELEVENLABS_API_KEY']),
      ...(agentId ? [] : ['ELEVENLABS_AGENT_ID']),
    ],
    serverLocation,
  }
}

export async function createElevenLabsConversationToken({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const config = getElevenLabsAgentConfiguration(env)

  if (!config.configured) {
    throw new ElevenLabsError(
      `ElevenLabs Agent is not configured. Add ${config.missing.join(' and ')} in Vercel.`,
      503,
    )
  }

  const query = new URLSearchParams({
    agent_id: config.agentId,
    environment: config.environment,
  })
  const response = await fetchElevenLabs(
    fetchImpl,
    `${getElevenLabsApiBaseUrl(config.serverLocation)}/convai/conversation/token?${query}`,
    {
      headers: {
        'xi-api-key': config.apiKey,
      },
      method: 'GET',
    },
    'The ElevenLabs conversation service is temporarily unavailable.',
  )

  if (!response.ok) {
    const upstreamMessage = await readElevenLabsError(
      response,
      'The ElevenLabs conversation service is temporarily unavailable.',
    )
    throw new ElevenLabsError(upstreamMessage, response.status === 429 ? 429 : 502)
  }

  const body = await response.json()
  const token = typeof body?.token === 'string' ? body.token : ''

  if (!token) {
    throw new ElevenLabsError('ElevenLabs did not return a conversation token.')
  }

  return {
    serverLocation: config.serverLocation,
    token,
  }
}

export async function createElevenLabsSpeech({
  env = process.env,
  fetchImpl = fetch,
  text,
}) {
  const cleanText = typeof text === 'string' ? text.trim() : ''

  if (!cleanText) {
    throw new ElevenLabsError('Enter some text to generate a voice preview.', 400)
  }

  if (cleanText.length > elevenLabsPreviewCharacterLimit) {
    throw new ElevenLabsError(
      `Voice previews are limited to ${elevenLabsPreviewCharacterLimit} characters.`,
      400,
    )
  }

  const config = getElevenLabsConfiguration(env)

  if (!config.configured) {
    throw new ElevenLabsError(
      `ElevenLabs is not configured. Add ${config.missing.join(' and ')} in Vercel.`,
      503,
    )
  }

  const response = await fetchElevenLabs(
    fetchImpl,
    `${getElevenLabsApiBaseUrl(config.serverLocation)}/text-to-speech/${encodeURIComponent(config.voiceId)}?output_format=mp3_44100_128`,
    {
      body: JSON.stringify({
        model_id: config.modelId,
        text: cleanText,
      }),
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': config.apiKey,
      },
      method: 'POST',
    },
    'ElevenLabs could not generate this preview.',
  )

  if (!response.ok) {
    const upstreamMessage = await readElevenLabsError(response)
    const statusCode = response.status === 429 ? 429 : 502

    throw new ElevenLabsError(upstreamMessage, statusCode)
  }

  const audio = Buffer.from(await response.arrayBuffer())

  if (!audio.length) {
    throw new ElevenLabsError('ElevenLabs returned an empty audio preview.')
  }

  return {
    audio,
    contentType: response.headers.get('content-type') || 'audio/mpeg',
    modelId: config.modelId,
  }
}

async function fetchElevenLabs(fetchImpl, url, init, fallbackMessage) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), elevenLabsRequestTimeoutMs)

  try {
    return await fetchImpl(url, { ...init, signal: controller.signal })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ElevenLabsError('The ElevenLabs request timed out. Please try again.', 504)
    }

    throw new ElevenLabsError(fallbackMessage, 502)
  } finally {
    clearTimeout(timeout)
  }
}

async function readElevenLabsError(response, fallbackMessage = 'ElevenLabs could not complete the request.') {
  try {
    const body = await response.json()
    if (typeof body?.detail?.message === 'string') return body.detail.message
    if (typeof body?.detail === 'string') return body.detail
    if (typeof body?.message === 'string') return body.message
    return fallbackMessage
  } catch {
    return fallbackMessage
  }
}
