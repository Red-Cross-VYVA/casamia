import { handleSupabaseInsert } from '../_lib/supabase.js'

export default async function handler(request, response) {
  await handleSupabaseInsert(request, response, 'orders', (body) => ({
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
  }))
}
