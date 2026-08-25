import { cleanString } from './_lib/public-form-validation.js'
import { insertSupabaseRow, readJsonBody, requirePost, sendJson } from './_lib/supabase.js'

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  try {
    const body = await readJsonBody(request)
    const customerName = cleanString(body.name)
    const orderReference = cleanString(body.orderReference)
    const installationAddress = cleanString(body.address)
    const contact = cleanString(body.contact)
    const orderDate = cleanString(body.orderDate)
    const submissionDate = cleanString(body.submissionDate)

    if (
      !customerName
      || !orderReference
      || !installationAddress
      || !contact
      || !orderDate
      || !submissionDate
      || body.declaration !== true
    ) {
      sendJson(response, 400, { message: 'Complete all required withdrawal fields and confirm the declaration.' })
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
