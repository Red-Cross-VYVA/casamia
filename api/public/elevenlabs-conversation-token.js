import crypto from 'node:crypto'

import {
  createElevenLabsConversationToken,
  ElevenLabsError,
} from '../_lib/elevenlabs.js'
import {
  callSupabaseRpc,
  readJsonBody,
  requirePost,
  sendJson,
} from '../_lib/supabase.js'

const voiceSessionWindowSeconds = 30 * 60
const maxVoiceSessionsPerWindow = 5

function getClientIp(request) {
  const forwarded = request.headers?.['x-forwarded-for']
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded

  return String(value || request.headers?.['x-real-ip'] || request.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim()
}

function hashClientIp(request) {
  const secret = process.env.ELEVENLABS_RATE_LIMIT_SALT
    || process.env.CASAMIA_INTERNAL_API_KEY
    || process.env.ELEVENLABS_API_KEY
    || 'casamia-elevenlabs-agent'

  return crypto.createHmac('sha256', secret).update(getClientIp(request)).digest('hex')
}

async function reserveVoiceSession(request) {
  const result = await callSupabaseRpc('reserve_wizard_voice_session', {
    p_ip_hash: hashClientIp(request),
    p_limit: maxVoiceSessionsPerWindow,
    p_window_seconds: voiceSessionWindowSeconds,
  })

  if (!result.ok) {
    return {
      ok: false,
      status: 503,
      body: { message: 'The voice assistant is temporarily unavailable. Please try again shortly.' },
    }
  }

  if (result.body !== true) {
    return {
      ok: false,
      status: 429,
      body: { message: 'Too many voice sessions have been started. Please wait 30 minutes and try again.' },
    }
  }

  return { ok: true }
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  response.setHeader('Cache-Control', 'no-store')

  try {
    const body = await readJsonBody(request)
    const wizardReference = typeof body.wizardReference === 'string' ? body.wizardReference.trim() : ''
    const locale = body.locale === 'es' ? 'es' : body.locale === 'en' ? 'en' : ''

    if (!/^CM-[A-Z0-9]{6}$/i.test(wizardReference) || !locale || body.consentConfirmed !== true) {
      sendJson(response, 400, { message: 'A valid wizard session and voice consent are required.' })
      return
    }

    const reservation = await reserveVoiceSession(request)
    if (!reservation.ok) {
      sendJson(response, reservation.status, reservation.body)
      return
    }

    const access = await createElevenLabsConversationToken()
    sendJson(response, 200, access)
  } catch (error) {
    const statusCode = error instanceof ElevenLabsError ? error.statusCode : 500
    sendJson(response, statusCode, {
      message: error instanceof Error ? error.message : 'The voice assistant could not be started.',
    })
  }
}
