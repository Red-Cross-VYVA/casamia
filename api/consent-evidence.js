import { applyPublicCors, isAllowedPublicOrigin } from './_lib/public-origin.js'
import { cleanString } from './_lib/public-form-validation.js'
import { insertSupabaseRow, readJsonBody, sendJson } from './_lib/supabase.js'

const allowedChannels = new Set(['checkout', 'withdrawal', 'proposal', 'support'])
const allowedConsentTypes = new Set([
  'contract-acceptance',
  'early-start',
  'full-execution',
  'personalised-goods',
  'marketing',
  'photo-testimonial',
])
const maxPayloadBytes = 16_384

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    if (!applyPublicCors(request, response)) {
      sendJson(response, 403, { message: 'Origin not allowed.' })
      return
    }
    response.status(204).end()
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  if (!isAllowedPublicOrigin(request)) {
    sendJson(response, 403, { message: 'Origin not allowed.' })
    return
  }
  applyPublicCors(request, response)

  try {
    const body = await readJsonBody(request)
    const validation = validateConsentEvidence(body)

    if (!validation.ok) {
      sendJson(response, 400, { message: validation.message })
      return
    }

    const receivedAt = new Date().toISOString()
    const result = await insertSupabaseRow('consent_evidence', {
      order_id: validation.value.orderId,
      customer_reference: validation.value.customerReference,
      consent_type: validation.value.consentType,
      wording: validation.value.wording,
      wording_version: validation.value.wordingVersion,
      terms_version: validation.value.generalTermsVersion,
      project_order_version: validation.value.projectOrderVersion,
      withdrawal_version: validation.value.withdrawalVersion,
      locale: validation.value.locale,
      contract_language: validation.value.contractLanguage,
      channel: validation.value.channel,
      timestamp: validation.value.timestamp,
      metadata_json: body,
    })

    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    sendJson(response, 200, {
      evidenceId: result.body?.id || result.body?.record?.id || '',
      receivedAt,
      stored: true,
    })
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid consent evidence.',
    })
  }
}

export function validateConsentEvidence(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return invalid('Consent evidence must be a JSON object.')
  }

  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > maxPayloadBytes) {
    return invalid('Consent evidence is too large.')
  }

  const channel = cleanString(body.channel)
  const consentType = cleanString(body.consentType)
  const contractLanguage = cleanString(body.contractLanguage).toLowerCase()
  const customerReference = cleanString(body.customerReference)
  const locale = cleanString(body.locale).toLowerCase()
  const orderId = cleanString(body.orderId)
  const timestamp = cleanString(body.timestamp)
  const wording = cleanString(body.wording)
  const wordingVersion = cleanString(body.wordingVersion)
  const documents = body.documentVersions && typeof body.documentVersions === 'object'
    ? body.documentVersions
    : {}
  const generalTermsVersion = cleanString(documents.generalTermsVersion)
  const projectOrderVersion = cleanString(documents.projectOrderVersion)
  const withdrawalVersion = cleanString(documents.withdrawalVersion)

  if (!allowedChannels.has(channel) || !allowedConsentTypes.has(consentType)) {
    return invalid('Choose a valid consent type and submission channel.')
  }

  if (
    !bounded(orderId, 100)
    || !bounded(customerReference, 254)
    || !bounded(wording, 5_000)
    || !bounded(wordingVersion, 100)
    || !bounded(generalTermsVersion, 100)
    || !bounded(projectOrderVersion, 100)
    || withdrawalVersion.length > 100
  ) {
    return invalid('Complete the required consent evidence fields within their allowed lengths.')
  }

  if (!/^[a-z]{2}(?:-[a-z]{2})?$/.test(locale) || !/^[a-z]{2}(?:-[a-z]{2})?$/.test(contractLanguage)) {
    return invalid('Use a valid locale and contract language.')
  }

  const timestampMs = Date.parse(timestamp)
  if (!timestamp || !Number.isFinite(timestampMs)) {
    return invalid('Use a valid consent timestamp.')
  }

  return {
    ok: true,
    value: {
      channel,
      consentType,
      contractLanguage,
      customerReference,
      generalTermsVersion,
      locale,
      orderId,
      projectOrderVersion,
      timestamp: new Date(timestampMs).toISOString(),
      withdrawalVersion,
      wording,
      wordingVersion,
    },
  }
}

function bounded(value, maxLength) {
  return value.length > 0 && value.length <= maxLength
}

function invalid(message) {
  return { message, ok: false }
}
