import crypto from 'node:crypto'

import { applyPublicCors, getRequestHeader, isAllowedPublicOrigin } from '../_lib/public-origin.js'
import { callSupabaseRpc, createSupabaseRowIfAbsent, sendJson } from '../_lib/supabase.js'

export const CALLBACK_TIME_WINDOWS = Object.freeze([
  '09:00-12:00',
  '12:00-15:00',
  '15:00-18:00',
  '18:00-20:00',
  'flexible',
])

export const CALLBACK_CONSENT_WORDING = Object.freeze({
  en: 'I agree that CasaMia may contact me about this callback request.',
  es: 'Acepto que CasaMia contacte conmigo sobre esta solicitud de llamada.',
})

const callbackBodyLimitBytes = 16 * 1024
const callbackRateLimitWindowSeconds = 30 * 60
const maxCallbackRequestsPerWindow = 5
const madridTimeZone = 'Europe/Madrid'
const callbackSupabaseTimeoutMs = 6_000
const callbackReleaseTimeoutMs = 2_000
const callbackDayEndMinutes = 20 * 60

export class CallbackRequestValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.name = 'CallbackRequestValidationError'
    this.statusCode = statusCode
  }
}

export function isAllowedCallbackOrigin(request, env = process.env) {
  return isAllowedPublicOrigin(request, env)
}

function cleanSingleLine(value, maximumLength, fieldName, { optional = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (optional) return ''
    throw new CallbackRequestValidationError(`${fieldName} is required.`)
  }

  if (typeof value !== 'string') {
    throw new CallbackRequestValidationError(`${fieldName} is not valid.`)
  }

  const cleaned = value
    .replace(/\p{Cc}+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if ((!cleaned && !optional) || cleaned.length > maximumLength) {
    throw new CallbackRequestValidationError(`${fieldName} is not valid.`)
  }

  return cleaned
}

function cleanNote(value) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value !== 'string') {
    throw new CallbackRequestValidationError('The note is not valid.')
  }

  const note = value
    .replace(/\r\n?/g, '\n')
    .replace(/\p{Cc}/gu, (character) => character === '\n' || character === '\t' ? character : '')
    .trim()

  if (note.length > 1000) {
    throw new CallbackRequestValidationError('The note is too long.')
  }

  return note
}

export function normalizeSpanishPhone(value) {
  if (typeof value !== 'string') {
    throw new CallbackRequestValidationError('A valid Spanish phone number is required.')
  }

  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('0034')) digits = digits.slice(4)
  else if (digits.startsWith('34') && digits.length === 11) digits = digits.slice(2)

  if (!/^[6789]\d{8}$/.test(digits)) {
    throw new CallbackRequestValidationError('A valid Spanish phone number is required.')
  }

  return `+34${digits}`
}

function getMadridCalendarDate(now) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    timeZone: madridTimeZone,
    year: 'numeric',
  }).formatToParts(now)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function getMadridClockMinutes(now) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    timeZone: madridTimeZone,
  }).formatToParts(now)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return Number(values.hour) * 60 + Number(values.minute)
}

function validateCallbackDate(value, now) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new CallbackRequestValidationError('A valid preferred callback date is required.')
  }

  const [year, month, day] = value.split('-').map(Number)
  const targetDay = Date.UTC(year, month - 1, day)
  const targetDate = new Date(targetDay)

  if (
    targetDate.getUTCFullYear() !== year
    || targetDate.getUTCMonth() !== month - 1
    || targetDate.getUTCDate() !== day
  ) {
    throw new CallbackRequestValidationError('A valid preferred callback date is required.')
  }

  const today = Date.parse(`${getMadridCalendarDate(now)}T00:00:00Z`)
  const differenceInDays = Math.round((targetDay - today) / 86_400_000)

  if (differenceInDays < 0 || differenceInDays > 90) {
    throw new CallbackRequestValidationError('The preferred callback date must be within the next 90 days.')
  }

  return value
}

function validateCallbackTimeWindow(value, preferredCallbackDate, now) {
  const preferredTimeWindow = typeof value === 'string'
    && CALLBACK_TIME_WINDOWS.includes(value)
    ? value
    : ''

  if (!preferredTimeWindow) {
    throw new CallbackRequestValidationError('A valid preferred callback time is required.')
  }

  if (preferredCallbackDate === getMadridCalendarDate(now)) {
    const endMinutes = preferredTimeWindow === 'flexible'
      ? callbackDayEndMinutes
      : (() => {
          const [, endTime] = preferredTimeWindow.split('-')
          const [endHour, endMinute] = endTime.split(':').map(Number)
          return endHour * 60 + endMinute
        })()

    if (getMadridClockMinutes(now) >= endMinutes) {
      throw new CallbackRequestValidationError('The preferred callback time has already ended today.')
    }
  }

  return preferredTimeWindow
}

export function validateCallbackRequest(body, now = new Date()) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new CallbackRequestValidationError('The callback request is not valid.')
  }

  const name = cleanSingleLine(body.name, 100, 'Name')
  const city = cleanSingleLine(body.city, 120, 'City or area')
  const phone = normalizeSpanishPhone(body.phone)
  const email = cleanSingleLine(body.email, 254, 'Email', { optional: true }).toLowerCase()

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new CallbackRequestValidationError('A valid email address is required.')
  }

  const idempotencyKey = typeof body.idempotencyKey === 'string'
    ? body.idempotencyKey.trim().toLowerCase()
    : ''
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(idempotencyKey)) {
    throw new CallbackRequestValidationError('A valid callback request token is required.')
  }

  const preferredCallbackDate = validateCallbackDate(body.preferredCallbackDate, now)
  const preferredTimeWindow = validateCallbackTimeWindow(
    body.preferredTimeWindow,
    preferredCallbackDate,
    now,
  )

  const wizardReference = typeof body.wizardReference === 'string'
    ? body.wizardReference.trim().toUpperCase()
    : ''
  if (!/^CM-[A-Z0-9]{6}$/.test(wizardReference)) {
    throw new CallbackRequestValidationError('A valid wizard reference is required.')
  }

  const locale = body.locale === 'es' ? 'es' : body.locale === 'en' ? 'en' : ''
  if (!locale) {
    throw new CallbackRequestValidationError('A valid language is required.')
  }

  if (body.timeZone !== madridTimeZone) {
    throw new CallbackRequestValidationError('A valid time zone is required.')
  }

  if (body.consentConfirmed !== true) {
    throw new CallbackRequestValidationError('Consent to be contacted is required.')
  }

  return {
    city,
    email,
    idempotencyKey,
    locale,
    name,
    note: cleanNote(body.note),
    phone,
    preferredCallbackDate,
    preferredTimeWindow,
    timeZone: madridTimeZone,
    wizardReference,
  }
}

export async function readCallbackJsonBody(request, maximumBytes = callbackBodyLimitBytes) {
  const contentLength = Number(getRequestHeader(request, 'content-length'))
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    throw new CallbackRequestValidationError('The callback request is too large.', 413)
  }

  if (request.body !== undefined && request.body !== null) {
    const rawBody = typeof request.body === 'string'
      ? request.body
      : Buffer.isBuffer(request.body)
        ? request.body.toString('utf8')
        : JSON.stringify(request.body)

    if (Buffer.byteLength(rawBody, 'utf8') > maximumBytes) {
      throw new CallbackRequestValidationError('The callback request is too large.', 413)
    }

    return rawBody ? JSON.parse(rawBody) : {}
  }

  const chunks = []
  let byteLength = 0

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    byteLength += buffer.byteLength
    if (byteLength > maximumBytes) {
      throw new CallbackRequestValidationError('The callback request is too large.', 413)
    }
    chunks.push(buffer)
  }

  const rawBody = Buffer.concat(chunks, byteLength).toString('utf8')
  return rawBody ? JSON.parse(rawBody) : {}
}

function getClientIp(request) {
  const forwarded = getRequestHeader(request, 'x-forwarded-for')
  return String(forwarded || getRequestHeader(request, 'x-real-ip') || request.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim()
}

function hashClientIp(request) {
  const secret = process.env.CALLBACK_RATE_LIMIT_SALT
    || process.env.CASAMIA_INTERNAL_SESSION_SECRET
    || process.env.CASAMIA_INTERNAL_API_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secret) return ''
  return crypto.createHmac('sha256', secret).update(getClientIp(request)).digest('hex')
}

async function reserveCallbackRequest(request) {
  const ipHash = hashClientIp(request)
  if (!ipHash) return { ok: false, status: 503 }

  let result
  try {
    result = await callSupabaseRpc('reserve_callback_request', {
      p_ip_hash: ipHash,
      p_limit: maxCallbackRequestsPerWindow,
      p_window_seconds: callbackRateLimitWindowSeconds,
    }, { timeoutMs: callbackSupabaseTimeoutMs })
  } catch (error) {
    console.error('Callback request rate limit could not be checked.', error)
    return { ok: false, status: 503 }
  }

  if (!result.ok) return { ok: false, status: 503 }
  if (result.body !== true) return { ok: false, status: 429 }
  return { ipHash, ok: true }
}

async function releaseCallbackRequest(ipHash) {
  if (!ipHash) return

  try {
    const result = await callSupabaseRpc('release_callback_request', {
      p_ip_hash: ipHash,
    }, { timeoutMs: callbackReleaseTimeoutMs })
    if (!result.ok) console.error('Callback request rate-limit reservation could not be released.')
  } catch (error) {
    console.error('Callback request rate-limit reservation could not be released.', error)
  }
}

function isHoneypotFilled(body) {
  return body?.website !== undefined
    && (typeof body.website !== 'string' || body.website.trim().length > 0)
}

function mapCallbackRequest(callback) {
  const requestedAt = new Date().toISOString()
  const schedule = `${callback.preferredCallbackDate} ${callback.preferredTimeWindow} (${callback.timeZone})`
  const message = [
    `Preferred callback: ${schedule}`,
    `City / area: ${callback.city}`,
    callback.note ? `Note: ${callback.note}` : '',
  ].filter(Boolean).join('\n')

  return {
    customer_email: callback.email,
    customer_name: callback.name,
    customer_phone: callback.phone,
    idempotency_key: `callback_request:${callback.idempotencyKey}`,
    message,
    payload_json: {
      city: callback.city,
      consentAt: requestedAt,
      consentConfirmed: true,
      consentWording: CALLBACK_CONSENT_WORDING[callback.locale],
      consentWordingVersion: 'callback-v1',
      locale: callback.locale,
      note: callback.note,
      preferredCallbackDate: callback.preferredCallbackDate,
      preferredTimeWindow: callback.preferredTimeWindow,
      requestedAt,
      timeZone: callback.timeZone,
      wizardReference: callback.wizardReference,
    },
    selected_plan: 'home-safety-wizard',
    source: 'home-safety-wizard-callback',
    status: 'New',
    submitted_at: requestedAt,
    type: 'callback_request',
  }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  const corsAllowed = applyPublicCors(request, response)
  if (request.method === 'OPTIONS') {
    response.status(corsAllowed ? 204 : 403).end()
    return
  }

  if (!corsAllowed) {
    sendJson(response, 403, { message: 'This callback request is not allowed.' })
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const contentType = getRequestHeader(request, 'content-type').toLowerCase()
  if (!contentType.startsWith('application/json')) {
    sendJson(response, 415, { message: 'The callback request must be JSON.' })
    return
  }

  try {
    const body = await readCallbackJsonBody(request)

    if (isHoneypotFilled(body)) {
      sendJson(response, 200, { status: 'New' })
      return
    }

    const callback = validateCallbackRequest(body)
    const reservation = await reserveCallbackRequest(request)

    if (!reservation.ok) {
      sendJson(response, reservation.status, {
        message: reservation.status === 429
          ? 'Too many callback requests have been submitted. Please wait 30 minutes and try again.'
          : 'Callback requests are temporarily unavailable. Please try again shortly.',
      })
      return
    }

    let result
    try {
      result = await createSupabaseRowIfAbsent(
        'contact_requests',
        mapCallbackRequest(callback),
        'idempotency_key',
        { timeoutMs: callbackSupabaseTimeoutMs },
      )
    } catch (error) {
      await releaseCallbackRequest(reservation.ipHash)
      console.error('Callback request could not be saved.', error)
      sendJson(response, 503, { message: 'Callback requests are temporarily unavailable. Please try again shortly.' })
      return
    }

    if (!result.ok) {
      await releaseCallbackRequest(reservation.ipHash)
      console.error('Callback request could not be saved.', result.body)
      sendJson(response, 503, { message: 'Callback requests are temporarily unavailable. Please try again shortly.' })
      return
    }

    const record = Array.isArray(result.body) ? result.body[0] : result.body
    sendJson(response, 201, { id: record?.id, status: record?.status ?? 'New' })
  } catch (error) {
    const isInvalidJson = error instanceof SyntaxError
    const statusCode = error instanceof CallbackRequestValidationError
      ? error.statusCode
      : isInvalidJson
        ? 400
        : 500

    if (statusCode === 500) console.error('Callback request failed.', error)

    sendJson(response, statusCode, {
      message: error instanceof CallbackRequestValidationError
        ? error.message
        : isInvalidJson
          ? 'The callback request is not valid JSON.'
          : 'Callback requests are temporarily unavailable. Please try again shortly.',
    })
  }
}
