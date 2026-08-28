import crypto from 'node:crypto'

const defaultGraphApiVersion = 'v26.0'
const graphApiVersionPattern = /^v\d+\.\d+$/

export function getWhatsappConfiguration(env = process.env) {
  const apiVersion = clean(env.WHATSAPP_GRAPH_API_VERSION) || defaultGraphApiVersion
  const accessToken = clean(env.WHATSAPP_ACCESS_TOKEN)
  const phoneNumberId = clean(env.WHATSAPP_PHONE_NUMBER_ID)

  return {
    accessToken,
    apiVersion: graphApiVersionPattern.test(apiVersion) ? apiVersion : defaultGraphApiVersion,
    appSecret: clean(env.WHATSAPP_APP_SECRET),
    configured: Boolean(accessToken && phoneNumberId),
    phoneNumberId,
    verifyToken: clean(env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
  }
}

export function normaliseWhatsappRecipient(value, defaultCountryCode = '34') {
  let digits = clean(value).replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length === 9) digits = `${defaultCountryCode}${digits}`
  return /^\d{10,15}$/.test(digits) ? digits : ''
}

export async function sendWhatsappTemplate({
  bodyParameters = [],
  env = process.env,
  fetchImpl = fetch,
  languageCode,
  templateName,
  to,
}) {
  const config = getWhatsappConfiguration(env)
  const recipient = normaliseWhatsappRecipient(to)

  if (!config.configured) {
    return whatsappResult('not_configured', 'WhatsApp Cloud API credentials are not configured.')
  }
  if (!recipient) return whatsappResult('recipient_invalid', 'A valid WhatsApp recipient is required.')
  if (!clean(templateName) || !clean(languageCode)) {
    return whatsappResult('template_not_configured', 'The WhatsApp template is not configured.')
  }

  let response
  try {
    response = await fetchImpl(
      `https://graph.facebook.com/${encodeURIComponent(config.apiVersion)}/${encodeURIComponent(config.phoneNumberId)}/messages`,
      {
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          template: {
            components: [{
              parameters: bodyParameters.map((value) => ({ text: clean(value), type: 'text' })),
              type: 'body',
            }],
            language: { code: clean(languageCode) },
            name: clean(templateName),
          },
          to: recipient,
          type: 'template',
        }),
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    )
  } catch {
    return whatsappResult('failed', 'WhatsApp Cloud API could not be reached.')
  }

  const payload = await readJson(response)
  const messageId = clean(payload?.messages?.[0]?.id)
  if (!response.ok || !messageId) {
    return {
      ...whatsappResult('failed', clean(payload?.error?.message) || `Meta rejected the WhatsApp message (${response.status}).`),
      providerCode: clean(payload?.error?.code),
    }
  }

  return {
    messageId,
    ok: true,
    provider: 'meta-whatsapp',
    recipient,
    status: 'sent',
  }
}

export function getWhatsappTemplate(env, type, language) {
  const suffix = String(language).toLowerCase().startsWith('es') ? 'ES' : 'EN'
  const templateKey = type === 'proposal'
    ? `CASAMIA_WHATSAPP_PROPOSAL_TEMPLATE_${suffix}`
    : `CASAMIA_WHATSAPP_REPORT_TEMPLATE_${suffix}`
  const languageKey = `WHATSAPP_TEMPLATE_LANGUAGE_${suffix}`

  return {
    languageCode: clean(env?.[languageKey]) || (suffix === 'ES' ? 'es' : 'en'),
    templateName: clean(env?.[templateKey]),
  }
}

export function verifyWhatsappWebhookSignature(rawBody, signature, env = process.env) {
  const secret = getWhatsappConfiguration(env).appSecret
  const supplied = clean(signature)
  if (!secret || !supplied.startsWith('sha256=')) return false

  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`
  const left = Buffer.from(expected)
  const right = Buffer.from(supplied)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function extractWhatsappStatuses(payload) {
  if (!payload || typeof payload !== 'object') return []

  return (Array.isArray(payload.entry) ? payload.entry : [])
    .flatMap((entry) => Array.isArray(entry?.changes) ? entry.changes : [])
    .flatMap((change) => Array.isArray(change?.value?.statuses) ? change.value.statuses : [])
    .map((status) => ({
      at: normaliseTimestamp(status?.timestamp),
      errors: Array.isArray(status?.errors) ? status.errors.map((error) => clean(error?.title || error?.message)).filter(Boolean) : [],
      messageId: clean(status?.id),
      recipient: clean(status?.recipient_id),
      status: clean(status?.status),
    }))
    .filter((status) => status.messageId && ['sent', 'delivered', 'read', 'failed'].includes(status.status))
}

function whatsappResult(status, reason) {
  return { ok: false, provider: 'meta-whatsapp', reason, status }
}

async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function normaliseTimestamp(value) {
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds > 0
    ? new Date(seconds * 1_000).toISOString()
    : new Date().toISOString()
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : value === undefined || value === null ? '' : String(value).trim()
}
