const defaultGraphApiVersion = 'v23.0'
const defaultProvider = 'whatsapp_cloud_api'

export function isProposalWhatsappConfigured(env = process.env) {
  return Boolean(text(env.WHATSAPP_ACCESS_TOKEN) && text(env.WHATSAPP_PHONE_NUMBER_ID))
}

export async function sendProposalWhatsapp({
  env = process.env,
  language = 'en',
  proposal,
  publicUrl,
} = {}) {
  const accessToken = text(env.WHATSAPP_ACCESS_TOKEN)
  const phoneNumberId = text(env.WHATSAPP_PHONE_NUMBER_ID)
  const to = normaliseWhatsappRecipient(proposal?.customer_phone ?? proposal?.phone)

  if (!to) {
    return skippedDelivery('recipient_missing', 'Customer WhatsApp phone number is missing.')
  }

  if (!accessToken || !phoneNumberId) {
    return skippedDelivery('not_configured', 'WhatsApp Cloud API credentials are not configured.')
  }

  if (!publicUrl) {
    return skippedDelivery('proposal_url_missing', 'Proposal URL is missing.')
  }

  const isSpanish = String(language).toLowerCase().startsWith('es')
  const templateName = getTemplateName(env, isSpanish)
  const languageCode = isSpanish
    ? text(env.WHATSAPP_TEMPLATE_LANGUAGE_ES) || 'es'
    : text(env.WHATSAPP_TEMPLATE_LANGUAGE_EN) || 'en'
  const apiVersion = text(env.WHATSAPP_GRAPH_API_VERSION) || defaultGraphApiVersion
  const customerName = text(proposal?.customer_name ?? proposal?.customerName) || (isSpanish ? 'cliente CasaMia' : 'CasaMia customer')
  const proposalId = text(proposal?.id) || (isSpanish ? 'propuesta CasaMia' : 'CasaMia proposal')
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: proposalId },
            { type: 'text', text: publicUrl },
          ],
        },
      ],
    },
  }

  try {
    const whatsappResponse = await fetch(`https://graph.facebook.com/${apiVersion}/${encodeURIComponent(phoneNumberId)}/messages`, {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const responseText = await whatsappResponse.text()
    const responseBody = parseJson(responseText)

    if (!whatsappResponse.ok) {
      return {
        ok: false,
        provider: defaultProvider,
        reason: responseBody?.error?.message || responseBody?.message || responseText.slice(0, 500) || 'WhatsApp message request failed.',
        status: 'failed',
        statusCode: whatsappResponse.status,
      }
    }

    return {
      id: responseBody?.messages?.[0]?.id ?? '',
      ok: true,
      provider: defaultProvider,
      status: 'sent',
      statusCode: whatsappResponse.status,
    }
  } catch (error) {
    return {
      ok: false,
      provider: defaultProvider,
      reason: error instanceof Error ? error.message : 'WhatsApp message request failed.',
      status: 'failed',
    }
  }
}

export function normaliseWhatsappRecipient(value) {
  const raw = text(value)
  if (!raw) return ''

  let digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  if (digits.startsWith('00')) digits = digits.slice(2)
  digits = digits.replace(/\D/g, '')

  if (/^[679]\d{8}$/.test(digits)) return `34${digits}`
  if (/^34[679]\d{8}$/.test(digits)) return digits

  return digits.length >= 10 && digits.length <= 15 ? digits : ''
}

function getTemplateName(env, isSpanish) {
  if (isSpanish) {
    return text(env.CASAMIA_WHATSAPP_PROPOSAL_TEMPLATE_ES)
      || text(env.WHATSAPP_PROPOSAL_TEMPLATE_ES)
      || 'casamia_proposal_ready_es'
  }

  return text(env.CASAMIA_WHATSAPP_PROPOSAL_TEMPLATE_EN)
    || text(env.WHATSAPP_PROPOSAL_TEMPLATE_EN)
    || 'casamia_proposal_ready_en'
}

function skippedDelivery(status, reason) {
  return {
    ok: false,
    provider: defaultProvider,
    reason,
    skipped: true,
    status,
  }
}

function parseJson(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}
