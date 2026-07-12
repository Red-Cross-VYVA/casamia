import { handleSupabaseInsert } from '../_lib/supabase.js'

export default async function handler(request, response) {
  await handleSupabaseInsert(request, response, 'contact_requests', (body) => ({
    submitted_at: body.submittedAt ?? new Date().toISOString(),
    status: body.status ?? 'New',
    type: body.type ?? 'contact_request',
    customer_name: body.customer_name ?? body.name ?? '',
    customer_email: body.customer_email ?? body.email ?? '',
    customer_phone: body.customer_phone ?? body.phone ?? '',
    selected_plan: body.selected_plan ?? body.plan ?? '',
    source: body.source ?? 'contact',
    message: body.message ?? '',
    payload_json: body,
  }))
}
