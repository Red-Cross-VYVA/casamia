import crypto from 'node:crypto'

const defaultGraphApiVersion = 'v26.0'
const graphApiVersionPattern = /^v\d+\.\d+$/
const defaultWhatsappAppId = '1061863269720823'
const defaultWhatsappBusinessId = '1411528653558134'
const defaultWhatsappPublicNumber = '34664338991'
const defaultWhatsappOauthRedirectUri = 'https://www.facebook.com/connect/login_success.html'

export function getWhatsappConfiguration(env = process.env) {
  const apiVersion = clean(env.WHATSAPP_GRAPH_API_VERSION) || defaultGraphApiVersion
  const accessToken = clean(env.WHATSAPP_ACCESS_TOKEN)
  const phoneNumberId = clean(env.WHATSAPP_PHONE_NUMBER_ID)

  return {
    accessToken,
    apiVersion: graphApiVersionPattern.test(apiVersion) ? apiVersion : defaultGraphApiVersion,
    appId: clean(env.WHATSAPP_APP_ID) || defaultWhatsappAppId,
    appSecret: clean(env.WHATSAPP_APP_SECRET),
    businessId: clean(env.WHATSAPP_BUSINESS_ID) || defaultWhatsappBusinessId,
    configured: Boolean(accessToken && phoneNumberId),
    phoneNumberId,
    verifyToken: clean(env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
  }
}

export async function completeWhatsappEmbeddedSignup({
  code,
  env = process.env,
  fetchImpl = fetch,
}) {
  const config = getWhatsappConfiguration(env)
  const authorizationCode = clean(code)

  if (!authorizationCode) throw new WhatsappSignupError('Meta did not return an authorization code.', 400)
  if (!config.appSecret) {
    throw new WhatsappSignupError('WHATSAPP_APP_SECRET is not configured in Vercel.', 500)
  }

  const tokenUrl = new URL(`https://graph.facebook.com/${config.apiVersion}/oauth/access_token`)
  tokenUrl.searchParams.set('client_id', config.appId)
  tokenUrl.searchParams.set('client_secret', config.appSecret)
  tokenUrl.searchParams.set('code', authorizationCode)
  tokenUrl.searchParams.set('redirect_uri', defaultWhatsappOauthRedirectUri)

  const tokenPayload = await requestMetaJson(tokenUrl, {}, fetchImpl)
  const accessToken = clean(tokenPayload?.access_token)
  if (!accessToken) throw new WhatsappSignupError('Meta authorized CasaMia but did not issue an access token.', 502)

  const businessIds = new Set([config.businessId])
  try {
    const businesses = await graphCollection({
      accessToken,
      apiVersion: config.apiVersion,
      fetchImpl,
      path: 'me/businesses',
    })
    for (const business of businesses) {
      const id = clean(business?.id)
      if (id) businessIds.add(id)
    }
  } catch {
    // A business-scoped token can still query the configured CasaMia business directly.
  }

  const whatsappAccounts = new Map()
  for (const businessId of businessIds) {
    for (const edge of ['owned_whatsapp_business_accounts', 'client_whatsapp_business_accounts']) {
      try {
        const accounts = await graphCollection({
          accessToken,
          apiVersion: config.apiVersion,
          fetchImpl,
          path: `${businessId}/${edge}`,
        })
        for (const account of accounts) {
          const id = clean(account?.id)
          if (id) whatsappAccounts.set(id, { businessId, id, name: clean(account?.name) })
        }
      } catch {
        // The token may grant only one of the owned/client edges.
      }
    }
  }

  const targetPhone = getConfiguredWhatsappNumber(env)
  const candidates = []
  for (const account of whatsappAccounts.values()) {
    try {
      const phoneNumbers = await graphCollection({
        accessToken,
        apiVersion: config.apiVersion,
        fetchImpl,
        path: `${account.id}/phone_numbers`,
      })
      for (const phone of phoneNumbers) {
        const phoneNumberId = clean(phone?.id)
        if (!phoneNumberId) continue
        candidates.push({
          businessId: account.businessId,
          displayPhoneNumber: normaliseWhatsappRecipient(phone?.display_phone_number),
          phoneNumberId,
          wabaId: account.id,
        })
      }
    } catch {
      // Ignore accounts that were visible but not granted to this authorization.
    }
  }

  const match = targetPhone
    ? candidates.find((candidate) => candidate.displayPhoneNumber === targetPhone)
    : candidates.length === 1 ? candidates[0] : null

  if (!match) {
    const reason = candidates.length
      ? `Meta returned ${candidates.length} WhatsApp phone number(s), but none matched the configured CasaMia number.`
      : 'Meta authorized CasaMia but did not grant access to a WhatsApp phone number.'
    throw new WhatsappSignupError(reason, 422)
  }

  return {
    businessId: match.businessId,
    phoneNumberId: match.phoneNumberId,
    wabaId: match.wabaId,
  }
}

export class WhatsappSignupError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.name = 'WhatsappSignupError'
    this.statusCode = statusCode
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

async function graphCollection({ accessToken, apiVersion, fetchImpl, path }) {
  const url = new URL(`https://graph.facebook.com/${apiVersion}/${path}`)
  url.searchParams.set('fields', path.endsWith('/phone_numbers')
    ? 'id,display_phone_number,verified_name'
    : 'id,name')
  url.searchParams.set('limit', '100')

  const payload = await requestMetaJson(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }, fetchImpl)

  return Array.isArray(payload?.data) ? payload.data : []
}

async function requestMetaJson(url, init, fetchImpl) {
  let response
  try {
    response = await fetchImpl(url, init)
  } catch {
    throw new WhatsappSignupError('Meta could not be reached. Please retry the transfer.', 502)
  }

  const payload = await readJson(response)
  if (!response.ok || payload?.error) {
    throw new WhatsappSignupError(
      clean(payload?.error?.message) || `Meta rejected the WhatsApp setup request (${response.status}).`,
      response.status >= 400 && response.status < 500 ? 422 : 502,
    )
  }

  return payload
}

function getConfiguredWhatsappNumber(env) {
  const explicit = normaliseWhatsappRecipient(env.WHATSAPP_PUBLIC_PHONE_NUMBER)
  if (explicit) return explicit

  const url = clean(env.VITE_CASAMIA_WHATSAPP_URL)
  return normaliseWhatsappRecipient(url.replace(/^.*wa\.me\//, '').split(/[?/#]/)[0])
    || defaultWhatsappPublicNumber
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
