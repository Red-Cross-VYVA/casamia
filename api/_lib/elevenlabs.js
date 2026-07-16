const elevenLabsApiBaseUrl = 'https://api.elevenlabs.io/v1'

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
    voiceId,
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

  const response = await fetchImpl(
    `${elevenLabsApiBaseUrl}/text-to-speech/${encodeURIComponent(config.voiceId)}?output_format=mp3_44100_128`,
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

async function readElevenLabsError(response) {
  try {
    const body = await response.json()
    return (
      body?.detail?.message ||
      body?.detail ||
      body?.message ||
      'ElevenLabs could not generate this preview.'
    )
  } catch {
    return 'ElevenLabs could not generate this preview.'
  }
}
