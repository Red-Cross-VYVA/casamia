import { handleSupabaseInsert } from '../_lib/supabase.js'

export default async function handler(request, response) {
  await handleSupabaseInsert(request, response, 'provider_applications', (body) => ({
    application_id: body.id ?? `PPA-${Date.now().toString(36).toUpperCase()}`,
    created_at: body.createdAt ?? new Date().toISOString(),
    status: body.status ?? 'new',
    business_name: body.businessName ?? '',
    contact_name: body.contactName ?? '',
    email: body.email ?? '',
    phone: body.phone ?? '',
    website: body.website ?? '',
    cities: body.cities ?? [],
    trades: body.trades ?? [],
    experience: body.experience ?? '',
    availability: body.availability ?? '',
    insurance_confirmed: Boolean(body.insuranceConfirmed),
    payload_json: body,
  }))
}
