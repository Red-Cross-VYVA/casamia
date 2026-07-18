import { applyPublicCors, getRequestHeader } from './public-origin.js'
import {
  createSupabaseRowIfAbsent,
  selectSupabaseRows,
  sendJson,
} from './supabase.js'

const reportTypes = new Set(['safety_report', 'grant_report'])
const publicReportMaximumBytes = 1_000_000
const publicReportLifetimeMs = 30 * 24 * 60 * 60 * 1_000
const publicReportTokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const publicReportRateWindowMs = 30 * 60 * 1_000
const maxPublicReportsPerWindow = 10
const publicReportRateLimits = new Map()

export class PublicReportValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.name = 'PublicReportValidationError'
    this.statusCode = statusCode
  }
}

export function isPublicReportToken(value) {
  return typeof value === 'string' && publicReportTokenPattern.test(value)
}

export function buildPublicReportRecord(body, reportType, now = new Date()) {
  if (!reportTypes.has(reportType) || !isRecord(body)) {
    throw new PublicReportValidationError('A valid report request is required.')
  }

  const serializedBody = JSON.stringify(body)
  if (Buffer.byteLength(serializedBody, 'utf8') > publicReportMaximumBytes) {
    throw new PublicReportValidationError('The report is too large to save.', 413)
  }

  const token = cleanText(body.public_token ?? body.token, 80)
  if (!isPublicReportToken(token)) {
    throw new PublicReportValidationError('A valid report token is required.')
  }

  const suppliedType = cleanText(body.type, 40)
  if (suppliedType && suppliedType !== reportType) {
    throw new PublicReportValidationError('The report type does not match the endpoint.')
  }

  const customerName = cleanText(body.customer_name ?? body.name, 160)
  const customerEmail = cleanText(body.customer_email ?? body.email, 320)
  const customerPhone = cleanText(body.customer_phone ?? body.phone, 80)
  const consentAt = parseTimestamp(body.consent_at ?? body.consentAt)
  const deliveryEmail = body.delivery_email === true
  const deliveryWhatsapp = body.delivery_whatsapp === true

  if (!customerName || (!customerEmail && !customerPhone) || !consentAt) {
    throw new PublicReportValidationError('Contact details and consent are required.')
  }
  if (!deliveryEmail && !deliveryWhatsapp) {
    throw new PublicReportValidationError('Choose at least one report delivery method.')
  }
  if (deliveryEmail && !isEmail(customerEmail)) {
    throw new PublicReportValidationError('A valid email address is required for email delivery.')
  }
  if (deliveryWhatsapp && customerPhone.length < 7) {
    throw new PublicReportValidationError('A valid phone number is required for WhatsApp delivery.')
  }

  const recommendations = isRecord(body.recommendations) ? body.recommendations : null
  if (!recommendations) {
    throw new PublicReportValidationError('The completed report is required.')
  }

  const submittedAt = now.toISOString()
  const expiresAt = new Date(now.getTime() + publicReportLifetimeMs).toISOString()
  const preferredChannels = [
    deliveryEmail ? 'email' : '',
    deliveryWhatsapp ? 'whatsapp' : '',
  ].filter(Boolean)
  const delivery = {
    email: deliveryEmail ? 'queued' : 'not_requested',
    whatsapp: deliveryWhatsapp ? 'queued' : 'not_requested',
  }
  const context = isRecord(body.context) ? body.context : {}
  const summary = getPublicReportSummary(reportType, body, recommendations)
  const reportPayload = {
    version: 1,
    type: reportType,
    public_token: token,
    token,
    created_at: submittedAt,
    expires_at: expiresAt,
    report_title: cleanText(body.report_title ?? body.reportTitle, 180),
    report_url: reportType === 'safety_report'
      ? `/estimate/${encodeURIComponent(token)}`
      : `/grant-check?report=${encodeURIComponent(token)}`,
    context,
    risk_score: safeNumber(body.risk_score ?? body.riskScore),
    risk_level: cleanText(body.risk_level ?? body.riskLevel, 40),
    summary,
    recommendations,
    delivery,
    preferred_channels: preferredChannels,
  }

  return {
    delivery,
    token,
    row: {
      id: token,
      submitted_at: submittedAt,
      type: reportType,
      status: 'Report Pending',
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      city_area: cleanText(context.region ?? context.postcode, 160),
      preferred_contact_method: preferredChannels.join(', '),
      consent_at: consentAt,
      source: 'public-report-delivery',
      message: summary,
      payload_json: reportPayload,
    },
  }
}

export async function queuePublicReport(body, reportType, dependencies = {}) {
  const { delivery, row, token } = buildPublicReportRecord(body, reportType)
  const create = dependencies.create ?? createSupabaseRowIfAbsent
  const result = await create('assessment_requests', row, 'id')
  let queuedDelivery = delivery

  if (!result.ok) return result

  if (Array.isArray(result.body) && result.body.length === 0) {
    const existing = await selectReportRecord(token, reportType, dependencies)
    if (!existing.ok) return existing
    if (!existing.record) {
      return {
        ok: false,
        status: 409,
        body: { message: 'The report token is already in use.' },
      }
    }
    queuedDelivery = getStoredDelivery(existing.record.payload_json)
  }

  return {
    ok: true,
    status: 200,
    body: {
      token,
      status: 'queued',
      ...queuedDelivery,
    },
  }
}

export async function loadPublicReport(token, reportType, dependencies = {}) {
  if (!reportTypes.has(reportType) || !isPublicReportToken(token)) {
    return { ok: false, status: 404, body: { message: 'Report not found.' } }
  }

  const result = await selectReportRecord(token, reportType, dependencies)
  if (!result.ok) return result
  if (!result.record) {
    return { ok: false, status: 404, body: { message: 'Report not found.' } }
  }

  const payload = isRecord(result.record.payload_json) ? result.record.payload_json : {}
  const expiresAt = parseTimestamp(payload.expires_at)
  const now = dependencies.now instanceof Date ? dependencies.now : new Date()
  if (!expiresAt || Date.parse(expiresAt) <= now.getTime()) {
    return { ok: false, status: 404, body: { message: 'Report not found.' } }
  }

  return { ok: true, status: 200, body: mapPublicReportRecord(result.record) }
}

export function mapPublicReportRecord(record) {
  const payload = isRecord(record?.payload_json) ? record.payload_json : {}
  const token = cleanText(payload.public_token ?? payload.token ?? record?.id, 80)

  return {
    type: cleanText(payload.type ?? record?.type, 40),
    public_token: token,
    token,
    created_at: parseTimestamp(payload.created_at ?? record?.submitted_at),
    expires_at: parseTimestamp(payload.expires_at),
    report_title: cleanText(payload.report_title, 180),
    report_url: cleanText(payload.report_url, 2_000),
    context: isRecord(payload.context) ? payload.context : {},
    risk_score: safeNumber(payload.risk_score),
    risk_level: cleanText(payload.risk_level, 40),
    summary: cleanText(payload.summary, 2_000),
    recommendations: sanitisePublicRecommendations(
      cleanText(payload.type ?? record?.type, 40),
      payload.recommendations,
    ),
    delivery: isRecord(payload.delivery) ? payload.delivery : {},
    status: cleanText(record?.status, 80),
  }
}

async function selectReportRecord(token, reportType, dependencies) {
  const select = dependencies.select ?? selectSupabaseRows
  const query = [
    `id=eq.${encodeURIComponent(token)}`,
    `type=eq.${encodeURIComponent(reportType)}`,
    'select=id,submitted_at,type,status,payload_json',
    'limit=1',
  ].join('&')
  const result = await select('assessment_requests', query)
  if (!result.ok) return result

  return {
    ok: true,
    status: 200,
    record: Array.isArray(result.body) ? result.body[0] : null,
  }
}

export async function handlePublicReportPost(request, response, reportType) {
  const corsAllowed = applyReportCors(request, response, 'POST, OPTIONS')

  if (request.method === 'OPTIONS') {
    response.status(corsAllowed ? 204 : 403).end()
    return
  }
  if (!corsAllowed) {
    sendJson(response, 403, { message: 'This report request is not allowed.' })
    return
  }
  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }
  if (!reservePublicReportRequest(request)) {
    sendJson(response, 429, { message: 'Too many report requests. Please try again later.' })
    return
  }

  try {
    const result = await queuePublicReport(await readPublicReportBody(request), reportType)
    if (!result.ok) {
      console.error('Public report queue failed.', { reportType, statusCode: result.status })
      const statusCode = result.status === 409 ? 409 : 503
      sendJson(response, statusCode, {
        message: statusCode === 409
          ? 'The report token is already in use.'
          : 'Report delivery is temporarily unavailable.',
      })
      return
    }
    sendJson(response, 200, result.body)
  } catch (error) {
    if (!(error instanceof PublicReportValidationError)) {
      console.error('Public report queue failed unexpectedly.', {
        reportType,
        errorName: error instanceof Error ? error.name : 'Error',
      })
    }
    const statusCode = error instanceof PublicReportValidationError ? error.statusCode : 503
    sendJson(response, statusCode, {
      message: error instanceof PublicReportValidationError
        ? error.message
        : 'Report delivery is temporarily unavailable.',
    })
  }
}

export async function handlePublicReportGet(request, response, reportType) {
  response.setHeader('Cache-Control', 'private, no-store')
  response.setHeader('X-Robots-Tag', 'noindex, noarchive')
  const origin = getRequestHeader(request, 'origin')
  const corsAllowed = !origin || applyReportCors(request, response, 'GET, OPTIONS')

  if (request.method === 'OPTIONS') {
    response.status(corsAllowed ? 204 : 403).end()
    return
  }
  if (!corsAllowed) {
    sendJson(response, 403, { message: 'This report request is not allowed.' })
    return
  }
  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const result = await loadPublicReport(getParam(request, 'token'), reportType)
    if (!result.ok) {
      if (result.status !== 404) {
        console.error('Public report lookup failed.', { reportType, statusCode: result.status })
      }
      sendJson(
        response,
        result.status === 404 ? 404 : 503,
        { message: result.status === 404 ? 'Report not found.' : 'Report lookup is temporarily unavailable.' },
      )
      return
    }

    sendJson(response, 200, result.body)
  } catch (error) {
    console.error('Public report lookup failed unexpectedly.', {
      reportType,
      errorName: error instanceof Error ? error.name : 'Error',
    })
    sendJson(response, 503, { message: 'Report lookup is temporarily unavailable.' })
  }
}

function applyReportCors(request, response, methods) {
  const allowed = applyPublicCors(request, response)
  if (allowed) response.setHeader('Access-Control-Allow-Methods', methods)
  return allowed
}

function getParam(request, name) {
  const value = request.query?.[name]
  return Array.isArray(value) ? value[0] : String(value ?? '')
}

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function cleanText(value, maximumLength) {
  return typeof value === 'string' ? value.trim().slice(0, maximumLength) : ''
}

function parseTimestamp(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : ''
}

function safeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : undefined
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getPublicReportSummary(reportType, body, recommendations) {
  if (reportType === 'grant_report') {
    const result = isRecord(recommendations.result) ? recommendations.result : {}
    return cleanText(result.summary ?? result.title, 2_000)
  }

  return cleanText(body.summary ?? recommendations.summary, 2_000)
}

function getStoredDelivery(payload) {
  const delivery = isRecord(payload?.delivery) ? payload.delivery : {}
  return {
    email: normaliseDeliveryStatus(delivery.email),
    whatsapp: normaliseDeliveryStatus(delivery.whatsapp),
  }
}

function normaliseDeliveryStatus(value) {
  return ['queued', 'sent', 'not_requested', 'failed'].includes(value)
    ? value
    : 'not_requested'
}

function sanitisePublicRecommendations(reportType, value) {
  if (!isRecord(value)) return {}
  if (reportType !== 'grant_report') return value

  const form = isRecord(value.form) ? value.form : {}

  const {
    name: _name,
    email: _email,
    phone: _phone,
    consent: _consent,
    consentAt: _consentAt,
    deliveryEmail: _deliveryEmail,
    deliveryWhatsapp: _deliveryWhatsapp,
    ...publicForm
  } = form

  return {
    ...value,
    form: publicForm,
    summary: getPublicReportSummary(reportType, {}, value),
  }
}

async function readPublicReportBody(request) {
  const contentLength = Number(getRequestHeader(request, 'content-length'))
  if (Number.isFinite(contentLength) && contentLength > publicReportMaximumBytes) {
    throw new PublicReportValidationError('The report is too large to save.', 413)
  }

  if (isRecord(request.body)) return request.body

  if (typeof request.body === 'string') {
    if (Buffer.byteLength(request.body, 'utf8') > publicReportMaximumBytes) {
      throw new PublicReportValidationError('The report is too large to save.', 413)
    }
    return parsePublicReportJson(request.body)
  }

  if (typeof request.on !== 'function') {
    throw new PublicReportValidationError('A valid report request is required.')
  }

  return new Promise((resolve, reject) => {
    const chunks = []
    let totalBytes = 0
    let settled = false

    request.on('data', (chunk) => {
      if (settled) return
      totalBytes += Buffer.byteLength(chunk)
      if (totalBytes > publicReportMaximumBytes) {
        settled = true
        reject(new PublicReportValidationError('The report is too large to save.', 413))
        return
      }
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    request.on('end', () => {
      if (settled) return
      settled = true
      try {
        resolve(parsePublicReportJson(Buffer.concat(chunks).toString('utf8')))
      } catch (error) {
        reject(error)
      }
    })

    request.on('error', (error) => {
      if (settled) return
      settled = true
      reject(error)
    })
  })
}

function parsePublicReportJson(value) {
  if (!value.trim()) return {}
  try {
    return JSON.parse(value)
  } catch {
    throw new PublicReportValidationError('The report request is invalid.')
  }
}

function reservePublicReportRequest(request, now = Date.now()) {
  for (const [key, value] of publicReportRateLimits) {
    if (value.windowStartedAt <= now - publicReportRateWindowMs) {
      publicReportRateLimits.delete(key)
    }
  }

  const forwarded = getRequestHeader(request, 'x-forwarded-for')
  const clientIp = String(
    forwarded || getRequestHeader(request, 'x-real-ip') || request.socket?.remoteAddress || 'unknown',
  ).split(',')[0].trim()
  const current = publicReportRateLimits.get(clientIp)

  if (!current || current.windowStartedAt <= now - publicReportRateWindowMs) {
    publicReportRateLimits.set(clientIp, { count: 1, windowStartedAt: now })
    return true
  }
  if (current.count >= maxPublicReportsPerWindow) return false

  current.count += 1
  return true
}
