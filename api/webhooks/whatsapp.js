import { extractWhatsappStatuses, getWhatsappConfiguration, verifyWhatsappWebhookSignature } from '../_lib/whatsapp.js'
import { selectSupabaseRows, sendJson, updateSupabaseRows } from '../_lib/supabase.js'

export default async function handler(request, response, dependencies = {}) {
  response.setHeader('Cache-Control', 'no-store')
  const env = dependencies.env ?? process.env

  if (request.method === 'GET') {
    const config = getWhatsappConfiguration(env)
    const mode = queryValue(request, 'hub.mode')
    const token = queryValue(request, 'hub.verify_token')
    const challenge = queryValue(request, 'hub.challenge')

    if (config.verifyToken && mode === 'subscribe' && token === config.verifyToken && challenge) {
      response.status(200).end(challenge)
      return
    }

    sendJson(response, 403, { message: 'Webhook verification failed.' })
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const rawBody = await readRawBody(request)
  if (!verifyWhatsappWebhookSignature(rawBody, headerValue(request, 'x-hub-signature-256'), env)) {
    sendJson(response, 401, { message: 'Invalid webhook signature.' })
    return
  }

  let payload
  try {
    payload = JSON.parse(rawBody.toString('utf8'))
  } catch {
    sendJson(response, 400, { message: 'Invalid webhook payload.' })
    return
  }

  const statuses = extractWhatsappStatuses(payload)
  const applyStatus = dependencies.applyStatus ?? applyWhatsappStatus
  await Promise.all(statuses.map((status) => applyStatus(status)))
  sendJson(response, 200, { received: true })
}

async function applyWhatsappStatus(status) {
  const encodedMessageId = encodeURIComponent(status.messageId)
  const reportResult = await selectSupabaseRows(
    'assessment_requests',
    `payload_json->whatsapp_delivery->>message_id=eq.${encodedMessageId}&select=id,type,payload_json&limit=1`,
  )
  const report = reportResult.ok && Array.isArray(reportResult.body) ? reportResult.body[0] : null
  if (report) {
    const payload = objectValue(report.payload_json)
    await updateSupabaseRows('assessment_requests', {
      payload_json: withWhatsappStatus(payload, 'whatsapp_delivery', status),
    }, `id=eq.${encodeURIComponent(report.id)}&type=eq.${encodeURIComponent(report.type)}`)
    return
  }

  const proposalResult = await selectSupabaseRows(
    'proposals',
    `payload_json->delivery->proposalWhatsapp->>messageId=eq.${encodedMessageId}&select=id,payload_json&limit=1`,
  )
  const proposal = proposalResult.ok && Array.isArray(proposalResult.body) ? proposalResult.body[0] : null
  if (!proposal) return

  const payload = objectValue(proposal.payload_json)
  const delivery = objectValue(payload.delivery)
  await updateSupabaseRows('proposals', {
    payload_json: {
      ...payload,
      delivery: {
        ...delivery,
        proposalWhatsapp: mergeStatus(delivery.proposalWhatsapp, status),
      },
    },
  }, `id=eq.${encodeURIComponent(proposal.id)}`)
}

function withWhatsappStatus(payload, field, status) {
  return { ...payload, [field]: mergeStatus(payload[field], status) }
}

function mergeStatus(current, status) {
  return {
    ...objectValue(current),
    errors: status.errors,
    lastStatusAt: status.at,
    status: status.status,
  }
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function queryValue(request, name) {
  const value = request.query?.[name]
  return Array.isArray(value) ? value[0] : String(value ?? '')
}

function headerValue(request, name) {
  const value = request.headers?.[name] ?? request.headers?.[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : String(value ?? '')
}

function readRawBody(request) {
  if (Buffer.isBuffer(request.body)) return Promise.resolve(request.body)
  if (typeof request.body === 'string') return Promise.resolve(Buffer.from(request.body))

  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    request.on('data', (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buffer.length
      if (size > 1_000_000) {
        reject(new Error('WhatsApp webhook body is too large.'))
        return
      }
      chunks.push(buffer)
    })
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}
