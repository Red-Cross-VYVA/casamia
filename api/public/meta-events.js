import { allowedMetaEvents, sendMetaConversionEvent } from '../_lib/meta-conversions.js'
import { applyPublicCors, isAllowedPublicOrigin, normalizeOrigin } from '../_lib/public-origin.js'
import { reservePublicRequest } from '../_lib/public-rate-limit.js'
import { readJsonBody, sendJson } from '../_lib/supabase.js'

export default async function handler(request, response, dependencies = {}) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'OPTIONS') {
    if (!applyPublicCors(request, response, dependencies.env ?? process.env)) return sendJson(response, 403, { message: 'Origin not allowed.' })
    response.status(204).end()
    return
  }
  if (request.method !== 'POST') return sendJson(response, 405, { message: 'Method not allowed.' })
  const env = dependencies.env ?? process.env
  if (!isAllowedPublicOrigin(request, env)) return sendJson(response, 403, { message: 'Origin not allowed.' })
  applyPublicCors(request, response, env)

  let body
  try {
    body = await readJsonBody(request)
  } catch {
    return sendJson(response, 400, { message: 'Invalid JSON.' })
  }

  const eventName = cleanText(body.eventName, 40)
  const eventId = cleanText(body.eventId, 120)
  const eventSourceUrl = cleanSourceUrl(body.eventSourceUrl, request)
  if (body.marketingConsent !== true || !allowedMetaEvents.has(eventName) || !eventId || !eventSourceUrl) {
    return sendJson(response, 400, { message: 'Invalid Meta event.' })
  }

  const reservation = await reservePublicRequest(request, {
    callRpc: dependencies.callRpc,
    env,
    limit: 120,
    scope: 'meta-conversion-event',
    windowSeconds: 10 * 60,
  })
  if (!reservation.ok) return sendJson(response, reservation.status, { message: 'Event tracking is temporarily unavailable.' })

  const result = await sendMetaConversionEvent({
    env,
    event: {
      customData: body.customData,
      eventId,
      eventName,
      eventSourceUrl,
      fbc: body.fbc,
      fbp: body.fbp,
    },
    fetchImpl: dependencies.fetchImpl,
    request,
  })
  if (!result.ok) return sendJson(response, 502, { message: 'Meta did not accept the event.' })
  sendJson(response, 202, { configured: result.configured, received: true })
}

function cleanSourceUrl(value, request) {
  try {
    const url = new URL(value)
    const requestOrigin = normalizeOrigin(request.headers?.origin ?? request.headers?.get?.('origin'))
    return url.origin === requestOrigin && ['http:', 'https:'].includes(url.protocol) ? url.toString().slice(0, 500) : ''
  } catch {
    return ''
  }
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}
