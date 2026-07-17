import {
  readJsonBody,
  requireInternalApiKey,
  selectSupabaseRows,
  sendJson,
  updateSupabaseRows,
} from '../_lib/supabase.js'

export const orderStatuses = [
  'New',
  'Quote requested',
  'Visit requested',
  'Contacting',
  'Proposal created',
  'Scheduled',
  'Completed',
  'Cancelled',
]

const selection = [
  'id',
  'order_id',
  'created_at',
  'status',
  'plan_id',
  'plan_label',
  'plan_price',
  'installation_address',
  'city',
  'postcode',
  'province',
  'customer_name',
  'customer_phone',
  'customer_email',
  'preferred_timing',
  'notes',
  'payment_method',
  'payload_json',
].join(',')

export function mapOrderRecord(record) {
  const payload = record?.payload_json && typeof record.payload_json === 'object'
    ? record.payload_json
    : {}
  return {
    address: text(record?.installation_address),
    city: text(record?.city),
    createdAt: text(record?.created_at),
    customerEmail: text(record?.customer_email),
    customerName: text(record?.customer_name),
    customerPhone: text(record?.customer_phone),
    databaseId: text(record?.id),
    id: text(record?.order_id),
    notes: text(record?.notes),
    paymentMethod: text(record?.payment_method),
    planLabel: text(record?.plan_label),
    planPrice: text(record?.plan_price),
    postcode: text(record?.postcode),
    preferredTiming: text(record?.preferred_timing),
    selectedServiceCount: Array.isArray(payload.selectedServices) ? payload.selectedServices.length : 0,
    status: text(record?.status) || 'New',
  }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }
  if (!requireInternalApiKey(request, response)) return

  if (request.method === 'GET') {
    const result = await selectSupabaseRows('orders', `select=${selection}&order=created_at.desc&limit=500`)
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }
    sendJson(response, 200, {
      orders: (Array.isArray(result.body) ? result.body : []).map(mapOrderRecord),
    })
    return
  }

  if (request.method !== 'PATCH') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const id = text(body.id)
    if (!/^[A-Za-z0-9-]{3,80}$/.test(id)) {
      sendJson(response, 400, { message: 'A valid customer plan id is required.' })
      return
    }
    if (!orderStatuses.includes(body.status)) {
      sendJson(response, 400, { message: 'Choose a valid customer plan status.' })
      return
    }
    const result = await updateSupabaseRows(
      'orders',
      { status: body.status },
      `order_id=eq.${encodeURIComponent(id)}&select=${selection}`,
    )
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }
    const record = Array.isArray(result.body) ? result.body[0] : undefined
    if (!record) {
      sendJson(response, 404, { message: 'Customer plan not found.' })
      return
    }
    sendJson(response, 200, { order: mapOrderRecord(record) })
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid request.' })
  }
}

function text(value) {
  return typeof value === 'string' ? value : ''
}
