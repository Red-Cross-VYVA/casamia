import {
  readJsonBody,
  requireInternalApiKey,
  selectSupabaseRows,
  sendJson,
  updateSupabaseRows,
} from '../_lib/supabase.js'

export const callbackRequestStatuses = ['New', 'Contacting', 'Completed', 'Cancelled']
const callbackRequestPageSize = 250
const callbackRequestScopes = ['all', 'open', 'closed']

const callbackRequestSelection = [
  'id',
  'submitted_at',
  'status',
  'customer_name',
  'customer_email',
  'customer_phone',
  'message',
  'payload_json',
].join(',')

function applyCors(response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')
}

function isUuid(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function safeText(value) {
  return typeof value === 'string' ? value : ''
}

function getQueryValue(request, name) {
  const direct = request.query?.[name]
  if (Array.isArray(direct)) return direct[0]
  if (direct !== undefined && direct !== null) return String(direct)

  try {
    return new URL(request.url ?? '', 'http://localhost').searchParams.get(name) ?? ''
  } catch {
    return ''
  }
}

function getCallbackRequestPage(request) {
  const requestedScope = getQueryValue(request, 'scope')
  const scope = callbackRequestScopes.includes(requestedScope) ? requestedScope : 'all'
  const requestedLimit = Number.parseInt(getQueryValue(request, 'limit'), 10)
  const requestedOffset = Number.parseInt(getQueryValue(request, 'offset'), 10)
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), callbackRequestPageSize)
    : callbackRequestPageSize
  const offset = Number.isInteger(requestedOffset) && requestedOffset >= 0 ? requestedOffset : 0

  return { limit, offset, scope }
}

export function mapCallbackRequestRecord(record) {
  const details = record?.payload_json && typeof record.payload_json === 'object'
    ? record.payload_json
    : {}
  const status = callbackRequestStatuses.includes(record?.status) ? record.status : 'New'

  return {
    city: safeText(details.city),
    email: safeText(record?.customer_email),
    id: safeText(record?.id),
    locale: details.locale === 'es' ? 'es' : 'en',
    name: safeText(record?.customer_name),
    note: safeText(details.note),
    phone: safeText(record?.customer_phone),
    preferredCallbackDate: safeText(details.preferredCallbackDate),
    preferredTimeWindow: safeText(details.preferredTimeWindow),
    reference: safeText(details.wizardReference),
    status,
    submittedAt: safeText(record?.submitted_at),
  }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  applyCors(response)

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  if (!requireInternalApiKey(request, response)) {
    return
  }

  if (request.method === 'GET') {
    const { limit, offset, scope } = getCallbackRequestPage(request)
    const statusFilter = scope === 'open'
      ? '&status=in.(New,Contacting)'
      : scope === 'closed'
        ? '&status=in.(Completed,Cancelled)'
        : ''
    const order = scope === 'open' ? 'submitted_at.asc' : 'submitted_at.desc'
    let result

    try {
      result = await selectSupabaseRows(
        'contact_requests',
        `type=eq.callback_request${statusFilter}&select=${callbackRequestSelection}&order=${order}&limit=${limit}&offset=${offset}`,
      )
    } catch (error) {
      console.error('Callback requests could not be loaded.', error)
      sendJson(response, 503, { message: 'The callback inbox is temporarily unavailable. Please try again.' })
      return
    }

    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    const records = Array.isArray(result.body) ? result.body : []
    sendJson(response, 200, {
      hasMore: records.length === limit,
      nextOffset: offset + records.length,
      requests: records.map(mapCallbackRequestRecord),
    })
    return
  }

  if (request.method !== 'PATCH') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)

    if (!isUuid(body.id)) {
      sendJson(response, 400, { message: 'A valid callback request id is required.' })
      return
    }

    if (!callbackRequestStatuses.includes(body.status)) {
      sendJson(response, 400, { message: 'Choose a valid callback request status.' })
      return
    }

    const result = await updateSupabaseRows(
      'contact_requests',
      { status: body.status },
      `id=eq.${encodeURIComponent(body.id)}&type=eq.callback_request&select=${callbackRequestSelection}`,
    )

    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    const record = Array.isArray(result.body) ? result.body[0] : undefined
    if (!record) {
      sendJson(response, 404, { message: 'Callback request not found.' })
      return
    }

    sendJson(response, 200, { request: mapCallbackRequestRecord(record) })
  } catch (error) {
    if (error instanceof SyntaxError) {
      sendJson(response, 400, { message: 'The status update is not valid JSON.' })
      return
    }

    console.error('Callback request status could not be updated.', error)
    sendJson(response, 503, { message: 'The callback status could not be updated. Please try again.' })
  }
}
