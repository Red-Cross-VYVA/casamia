import crypto from 'node:crypto'

import {
  createElevenLabsConversationToken,
  ElevenLabsError,
  getElevenLabsAgentConfiguration,
} from '../_lib/elevenlabs.js'
import {
  callSupabaseRpc,
  readJsonBody,
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

function getRequestHeader(request, name) {
  const value = request.headers?.[name] ?? request.headers?.[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value || request.headers?.get?.(name) || ''
}

function normalizeOrigin(value) {
  try {
    return new URL(value).origin
  } catch {
    return ''
  }
}

export function isAllowedVoiceOrigin(request, env = process.env) {
  const origin = normalizeOrigin(getRequestHeader(request, 'origin'))
  if (!origin) return false

  const forwardedProtocol = getRequestHeader(request, 'x-forwarded-proto').split(',')[0].trim()
  const protocol = forwardedProtocol || (env.VERCEL ? 'https' : 'http')
  const host = getRequestHeader(request, 'host')
  if (host && origin === normalizeOrigin(`${protocol}://${host}`)) return true

  const configuredOrigins = [
    env.VITE_SITE_URL,
    env.VITE_PUBLIC_SITE_API_URL,
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '',
    env.VERCEL_BRANCH_URL ? `https://${env.VERCEL_BRANCH_URL}` : '',
    ...(env.CASAMIA_ALLOWED_ORIGINS || '').split(','),
  ].map((value) => normalizeOrigin(value?.trim() || '')).filter(Boolean)

  if (configuredOrigins.includes(origin)) return true

  const isProduction = env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production'
  return !isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
}

function applyVoiceCors(request, response) {
  if (!isAllowedVoiceOrigin(request)) return false

  const origin = normalizeOrigin(getRequestHeader(request, 'origin'))
  response.setHeader('Access-Control-Allow-Origin', origin)
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Vary', 'Origin')
  return true
}

function hashClientIp(request) {
  const secret = process.env.ELEVENLABS_RATE_LIMIT_SALT
    || process.env.CASAMIA_INTERNAL_API_KEY
    || process.env.ELEVENLABS_API_KEY
    || 'casamia-elevenlabs-agent'

  return crypto.createHmac('sha256', secret).update(getClientIp(request)).digest('hex')
}

async function reserveVoiceSession(request) {
  const ipHash = hashClientIp(request)
  let result
  try {
    result = await callSupabaseRpc('reserve_wizard_voice_session', {
      p_ip_hash: ipHash,
      p_limit: maxVoiceSessionsPerWindow,
      p_window_seconds: voiceSessionWindowSeconds,
    })
  } catch (error) {
    console.error('Voice session rate limit could not be checked.', error)
    return {
      ok: false,
      status: 503,
      body: { message: 'The voice assistant is temporarily unavailable. Please try again shortly.' },
    }
  }

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

  return { ok: true, ipHash }
}

async function releaseVoiceSession(ipHash) {
  if (!ipHash) return

  try {
    const result = await callSupabaseRpc('release_wizard_voice_session', {
      p_ip_hash: ipHash,
    })
    if (!result.ok) console.error('Voice session rate-limit reservation could not be released.')
  } catch (error) {
    console.error('Voice session rate-limit reservation could not be released.', error)
  }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  const corsAllowed = applyVoiceCors(request, response)
  if (request.method === 'OPTIONS') {
    response.status(corsAllowed ? 204 : 403).end()
    return
  }

  if (!corsAllowed) {
    sendJson(response, 403, { message: 'This voice request is not allowed.' })
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const wizardReference = typeof body.wizardReference === 'string' ? body.wizardReference.trim() : ''
    const locale = body.locale === 'es' ? 'es' : body.locale === 'en' ? 'en' : ''

    if (!/^CM-[A-Z0-9]{6}$/i.test(wizardReference) || !locale || body.consentConfirmed !== true) {
      sendJson(response, 400, { message: 'A valid wizard session and voice consent are required.' })
      return
    }

    if (!getElevenLabsAgentConfiguration().configured) {
      sendJson(response, 503, { message: 'The voice assistant is temporarily unavailable.' })
      return
    }

    const reservation = await reserveVoiceSession(request)
    if (!reservation.ok) {
      sendJson(response, reservation.status, reservation.body)
      return
    }

    let access
    try {
      access = await createElevenLabsConversationToken()
    } catch (error) {
      await releaseVoiceSession(reservation.ipHash)
      throw error
    }

    sendJson(response, 200, access)
  } catch (error) {
    const isInvalidJson = error instanceof SyntaxError
    const statusCode = isInvalidJson
      ? 400
      : error instanceof ElevenLabsError
        ? error.statusCode
        : 500

    if (!isInvalidJson) {
      console.error('ElevenLabs conversation token request failed.', error)
    }

    const message = statusCode === 400
      ? 'The voice request was not valid.'
      : statusCode === 429
        ? 'The voice assistant is busy. Please wait and try again.'
        : 'The voice assistant is temporarily unavailable. Please try again shortly.'

    sendJson(response, statusCode, {
      message,
    })
  }
}
