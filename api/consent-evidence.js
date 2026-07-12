import { handleSupabaseInsert } from './_lib/supabase.js'

export default async function handler(request, response) {
  await handleSupabaseInsert(request, response, 'consent_evidence', (body) => ({
    order_id: body.orderId ?? '',
    customer_reference: body.customerReference ?? '',
    consent_type: body.consentType ?? '',
    wording: body.wording ?? '',
    wording_version: body.wordingVersion ?? '',
    terms_version: body.documentVersions?.generalTermsVersion ?? '',
    project_order_version: body.documentVersions?.projectOrderVersion ?? '',
    withdrawal_version: body.documentVersions?.withdrawalVersion ?? '',
    locale: body.locale ?? '',
    contract_language: body.contractLanguage ?? '',
    channel: body.channel ?? '',
    timestamp: body.timestamp ?? new Date().toISOString(),
    metadata_json: body,
  }))
}
