import { readJsonBody, requireInternalApiKey, sendJson } from '../_lib/supabase.js'
import { completeWhatsappEmbeddedSignup, WhatsappSignupError } from '../_lib/whatsapp.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')
    response.end()
    return
  }

  if (!requireInternalApiKey(request, response)) return
  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const result = await completeWhatsappEmbeddedSignup({
      code: body.code,
    })
    sendJson(response, 200, result)
  } catch (error) {
    const statusCode = error instanceof WhatsappSignupError ? error.statusCode : 500
    console.error('WhatsApp Embedded Signup completion failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
      statusCode,
    })
    sendJson(response, statusCode, {
      message: error instanceof Error ? error.message : 'Unable to complete WhatsApp setup.',
    })
  }
}
