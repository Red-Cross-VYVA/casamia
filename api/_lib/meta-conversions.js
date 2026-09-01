import { getRequestHeader } from './public-origin.js'

export const allowedMetaEvents = new Set([
  'InitiateCheckout',
  'Lead',
  'PageView',
  'Purchase',
  'Schedule',
  'ViewContent',
])

export async function sendMetaConversionEvent({ event, env = process.env, fetchImpl = fetch, request }) {
  const accessToken = String(env.META_CONVERSIONS_API_ACCESS_TOKEN || '').trim()
  const pixelId = String(env.META_PIXEL_ID || '').trim()
  if (!accessToken || !pixelId) return { configured: false, ok: true }

  const graphVersion = String(env.META_GRAPH_API_VERSION || 'v26.0').replace(/^v?/, 'v')
  const userData = cleanObject({
    client_ip_address: getClientIp(request),
    client_user_agent: getRequestHeader(request, 'user-agent'),
    fbc: cleanText(event.fbc, 240),
    fbp: cleanText(event.fbp, 240),
  })
  const payload = {
    data: [{
      action_source: 'website',
      custom_data: cleanObject(event.customData),
      event_id: cleanText(event.eventId, 120),
      event_name: event.eventName,
      event_source_url: event.eventSourceUrl,
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
    }],
    ...(env.META_CONVERSIONS_API_TEST_EVENT_CODE
      ? { test_event_code: String(env.META_CONVERSIONS_API_TEST_EVENT_CODE).trim() }
      : {}),
  }

  const result = await fetchImpl(`https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pixelId)}/events`, {
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const body = await result.json().catch(() => ({}))
  if (!result.ok) {
    console.error('Meta Conversions API rejected an event.', {
      eventName: event.eventName,
      status: result.status,
      type: body?.error?.type,
    })
    return { configured: true, ok: false, status: result.status }
  }
  return { configured: true, eventsReceived: body?.events_received, ok: true }
}

function getClientIp(request) {
  return cleanText(
    getRequestHeader(request, 'x-forwarded-for').split(',')[0]
      || getRequestHeader(request, 'x-real-ip')
      || request?.socket?.remoteAddress,
    80,
  )
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function cleanObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).slice(0, 30).flatMap(([key, entry]) => {
    if (!/^[a-z][a-z0-9_]{0,59}$/i.test(key) || !['string', 'number', 'boolean'].includes(typeof entry)) return []
    const cleaned = typeof entry === 'string' ? entry.trim().slice(0, 240) : entry
    return cleaned === '' ? [] : [[key, cleaned]]
  }))
}
