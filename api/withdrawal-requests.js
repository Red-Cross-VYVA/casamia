import { applyPublicCors, isAllowedPublicOrigin } from './_lib/public-origin.js'
import { cleanString, isIsoDate, isJsonWithinBytes, isWithinLength } from './_lib/public-form-validation.js'
import { reservePublicRequest } from './_lib/public-rate-limit.js'
import { insertSupabaseRow, readJsonBody, requirePost, sendJson } from './_lib/supabase.js'

export default async function handler(request, response, dependencies = {}) {
  if (request.method === 'OPTIONS') {
    if (!applyPublicCors(request, response)) {
      sendJson(response, 403, { message: 'Origin not allowed.' })
      return
    }
    response.status(204).end()
    return
  }
  if (!requirePost(request, response)) return
  if (!isAllowedPublicOrigin(request)) {
    sendJson(response, 403, { message: 'Origin not allowed.' })
    return
  }
  applyPublicCors(request, response)

  try {
    const body = await readJsonBody(request)
    const customerName = cleanString(body.name)
    const orderReference = cleanString(body.orderReference)
    const installationAddress = cleanString(body.address)
    const contact = cleanString(body.contact)
    const orderDate = cleanString(body.orderDate)
    const submissionDate = cleanString(body.submissionDate)

    if (
      !isJsonWithinBytes(body, 32_768)
      || !isWithinLength(customerName, 120, { required: true })
      || !isWithinLength(orderReference, 100, { required: true })
      || !isWithinLength(installationAddress, 300, { required: true })
      || !isWithinLength(contact, 254, { required: true })
      || !isIsoDate(orderDate)
      || !isIsoDate(submissionDate)
      || !isWithinLength(body.comments, 5_000)
      || body.declaration !== true
    ) {
      sendJson(response, 400, { message: 'Complete all required withdrawal fields and confirm the declaration.' })
      return
    }

    const reservation = await reservePublicRequest(request, {
      callRpc: dependencies.callRpc,
      env: dependencies.env ?? process.env,
      limit: 5,
      scope: 'withdrawal-request',
      windowSeconds: 60 * 60,
    })
    if (!reservation.ok) {
      sendJson(response, reservation.status, {
        message: reservation.status === 429
          ? 'Too many withdrawal requests. Please try again later.'
          : 'Withdrawal requests are temporarily unavailable.',
      })
      return
    }

    const result = await insertSupabaseRow('withdrawal_requests', {
      submitted_at: new Date().toISOString(),
      customer_name: customerName,
      order_reference: orderReference,
      installation_address: installationAddress,
      contact,
      order_date: orderDate,
      submission_date: submissionDate,
      comments: cleanString(body.comments),
      payload_json: body,
    })

    sendJson(response, result.status, result.body)
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid withdrawal request.',
    })
  }
}
