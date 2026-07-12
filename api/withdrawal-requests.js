import { handleSupabaseInsert } from './_lib/supabase.js'

export default async function handler(request, response) {
  await handleSupabaseInsert(request, response, 'withdrawal_requests', (body) => ({
    submitted_at: new Date().toISOString(),
    customer_name: body.name ?? '',
    order_reference: body.orderReference ?? '',
    installation_address: body.address ?? '',
    contact: body.contact ?? '',
    order_date: body.orderDate || null,
    submission_date: body.submissionDate || null,
    comments: body.comments ?? '',
    payload_json: body,
  }))
}
