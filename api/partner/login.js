import {
  createPartnerSessionToken,
  getPartnerCredentialConfiguration,
  readJsonBody,
  requirePost,
  sendJson,
  verifyPartnerCredentials,
} from '../_lib/supabase.js'

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  const credentialConfiguration = getPartnerCredentialConfiguration()
  if (!credentialConfiguration.configured) {
    sendJson(response, 500, {
      message: `Partner access is not configured safely. ${credentialConfiguration.message}`,
    })
    return
  }

  if (!process.env.CASAMIA_INTERNAL_SESSION_SECRET && !process.env.CASAMIA_INTERNAL_API_KEY) {
    sendJson(response, 500, {
      message: 'Partner sessions are not configured. Add CASAMIA_INTERNAL_SESSION_SECRET in Vercel.',
    })
    return
  }

  try {
    const body = await readJsonBody(request)
    const partnerEmail = normalizeEmail(body.email)

    if (!isEmail(partnerEmail)) {
      sendJson(response, 400, { message: 'Enter the partner email used by CasaMia.' })
      return
    }

    if (!verifyPartnerCredentials(partnerEmail, body.password)) {
      sendJson(response, 401, { message: 'Partner email or password is incorrect.' })
      return
    }

    sendJson(response, 200, createPartnerSessionToken(partnerEmail))
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid request.',
    })
  }
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
