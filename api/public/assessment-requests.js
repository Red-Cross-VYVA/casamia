import { handleSupabaseInsert } from '../_lib/supabase.js'

export default async function handler(request, response) {
  await handleSupabaseInsert(request, response, 'assessment_requests', (body) => ({
    submitted_at: body.submittedAt ?? new Date().toISOString(),
    type: body.type ?? 'home_safety_assessment_visit',
    status: body.status ?? 'New',
    customer_name: body.customer_name ?? body.name ?? '',
    customer_email: body.customer_email ?? body.email ?? '',
    customer_phone: body.customer_phone ?? body.phone ?? '',
    city_area: body.city_area ?? body.city ?? '',
    preferred_contact_method: body.preferred_contact_method ?? body.preferredContactMethod ?? '',
    preferred_assessment_date: body.preferred_assessment_date ?? body.preferredDate ?? '',
    selected_plan: body.selected_plan ?? body.selectedPlan ?? '',
    consent_at: body.consent_at ?? body.consentAt ?? '',
    source: body.source ?? 'home-safety-assessment',
    message: body.message ?? '',
    payload_json: body,
  }))
}
