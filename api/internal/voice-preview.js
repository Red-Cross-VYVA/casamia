import {
  createElevenLabsSpeech,
  ElevenLabsError,
  elevenLabsPreviewCharacterLimit,
  getElevenLabsConfiguration,
} from '../_lib/elevenlabs.js'
import {
  readJsonBody,
  requireInternalApiKey,
  sendJson,
} from '../_lib/supabase.js'

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')
    response.end()
    return
  }

  if (!requireInternalApiKey(request, response)) {
    return
  }

  if (request.method === 'GET') {
    const config = getElevenLabsConfiguration()

    sendJson(response, 200, {
      configured: config.configured,
      maxCharacters: elevenLabsPreviewCharacterLimit,
      missing: config.missing,
      modelId: config.modelId,
    })
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const preview = await createElevenLabsSpeech({ text: body.text })

    response.status(200)
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Length', String(preview.audio.length))
    response.setHeader('Content-Type', preview.contentType)
    response.setHeader('X-CasaMia-Voice-Model', preview.modelId)
    response.end(preview.audio)
  } catch (error) {
    const statusCode = error instanceof ElevenLabsError ? error.statusCode : 500

    sendJson(response, statusCode, {
      message: error instanceof Error ? error.message : 'Unable to generate voice preview.',
    })
  }
}
