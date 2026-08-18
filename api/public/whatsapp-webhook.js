import { readJsonBody, sendJson } from '../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    response.end()
    return
  }

  if (request.method === 'GET') {
    verifyWebhook(request, response)
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    await readJsonBody(request)
    sendJson(response, 200, { ok: true })
  } catch {
    sendJson(response, 200, { ok: true })
  }
}

function verifyWebhook(request, response) {
  const params = getParams(request)
  const mode = params.get('hub.mode')
  const token = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')
  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && challenge && expectedToken && token === expectedToken) {
    response.status(200).setHeader('Content-Type', 'text/plain')
    response.end(challenge)
    return
  }

  sendJson(response, 403, { message: 'Webhook verification failed.' })
}

function getParams(request) {
  if (request.query && typeof request.query === 'object' && Object.keys(request.query).length) {
    return new URLSearchParams(
      Object.entries(request.query).flatMap(([key, value]) => {
        if (Array.isArray(value)) return value.map((item) => [key, String(item)])
        return [[key, String(value)]]
      }),
    )
  }

  try {
    return new URL(request.url, 'https://www.casamia.com.es').searchParams
  } catch {
    return new URLSearchParams()
  }
}
