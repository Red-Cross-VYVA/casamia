import crypto from 'node:crypto'

import { callSupabaseRpc } from './supabase.js'
import { getRequestHeader } from './public-origin.js'

const defaultTimeoutMs = 3_000

export function hashPublicRequestClient(request, scope, env = process.env) {
  if (typeof scope !== 'string' || !/^[a-z0-9-]{2,80}$/.test(scope)) return ''

  const forwarded = getRequestHeader(request, 'x-forwarded-for')
  const clientIp = String(
    forwarded || getRequestHeader(request, 'x-real-ip') || request.socket?.remoteAddress || 'unknown',
  ).split(',')[0].trim()
  const secret = env.CASAMIA_PUBLIC_WRITE_RATE_LIMIT_SALT
    || env.CASAMIA_INTERNAL_SESSION_SECRET
    || env.CASAMIA_INTERNAL_API_KEY
    || env.SUPABASE_SERVICE_ROLE_KEY

  if (!secret) return ''
  return crypto.createHmac('sha256', secret).update(`${scope}:${clientIp}`).digest('hex')
}

export async function reservePublicRequest(request, options) {
  const {
    callRpc = callSupabaseRpc,
    env = process.env,
    limit,
    scope,
    timeoutMs = defaultTimeoutMs,
    windowSeconds,
  } = options ?? {}
  const keyHash = hashPublicRequestClient(request, scope, env)

  if (!keyHash || !Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowSeconds)) {
    return { ok: false, status: 503 }
  }

  let result
  try {
    result = await callRpc('reserve_public_request', {
      p_key_hash: keyHash,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    }, { timeoutMs })
  } catch (error) {
    console.error('Public request rate limit could not be checked.', {
      errorName: error instanceof Error ? error.name : 'Error',
      scope,
    })
    return { ok: false, status: 503 }
  }

  if (!result.ok) return { ok: false, status: 503 }
  return result.body === true
    ? { keyHash, ok: true, status: 200 }
    : { ok: false, status: 429 }
}
