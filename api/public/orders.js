import {
  createSupabaseRowIfAbsent,
  readJsonBody,
  requirePost,
  sendJson,
} from '../_lib/supabase.js'

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  try {
    const body = await readJsonBody(request)
    const payload = {
      order_id: body.orderId ?? `CM-${Date.now().toString(36).toUpperCase()}`,
      created_at: body.createdAt ?? new Date().toISOString(),
      status: body.status ?? 'New',
      plan_id: body.planId ?? '',
      plan_label: body.planLabel ?? '',
      plan_price: body.planPrice ?? '',
      installation_address: body.address ?? '',
      city: body.city ?? '',
      postcode: body.postcode ?? '',
      province: body.province ?? '',
      customer_name: body.name ?? '',
      customer_phone: body.phone ?? '',
      customer_email: body.email ?? '',
      preferred_timing: body.preferredTiming ?? '',
      notes: body.notes ?? '',
      payment_method: body.paymentMethod ?? '',
      payload_json: body,
    }
    const result = await createSupabaseRowIfAbsent('orders', payload, 'order_id')

    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    const record = Array.isArray(result.body) ? result.body[0] : result.body
    sendJson(response, 200, {
      id: record?.id,
      orderId: payload.order_id,
      status: record?.status ?? payload.status,
    })
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid order request.',
    })
  }
}
