import { sendFormSubmissionEmails } from '../_lib/form-email.js'
import {
  insertSupabaseRow,
  readJsonBody,
  requirePost,
  sendJson,
  updateSupabaseRows,
} from '../_lib/supabase.js'
import { cleanString, isJsonWithinBytes, isValidEmail, isWithinLength } from '../_lib/public-form-validation.js'

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  try {
    const body = await readJsonBody(request)
    const requestType = body.type === 'complaint_request' ? 'complaint_request' : 'contact_request'

    const customerName = cleanString(body.customer_name ?? body.name)
    const customerEmail = cleanString(body.customer_email ?? body.email)
    const message = cleanString(body.message)

    if (
      !isJsonWithinBytes(body, 32_768)
      || !isWithinLength(customerName, 120, { required: true })
      || !isValidEmail(customerEmail)
      || !isWithinLength(message, 5_000, { required: true })
      || !isWithinLength(body.customer_phone ?? body.phone, 40)
      || !isWithinLength(body.selected_plan ?? body.plan, 200)
    ) {
      sendJson(response, 400, { message: 'Name, a valid email address and a message are required.' })
      return
    }

    if (requestType === 'complaint_request' && body.consentConfirmed !== true) {
      sendJson(response, 400, { message: 'Consent is required to submit a complaint.' })
      return
    }
    const payload = {
      submitted_at: new Date().toISOString(),
      status: 'New',
      type: requestType,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: cleanString(body.customer_phone ?? body.phone),
      selected_plan: cleanString(body.selected_plan ?? body.plan),
      source: requestType === 'complaint_request' ? 'complaints-page' : 'contact',
      message,
      payload_json: body,
    }
    const result = await insertSupabaseRow('contact_requests', payload)

    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    const record = result.body?.record
    const locale = normalizeLocale(body.locale ?? body.language)
    const labels = locale === 'es' ? labelsEs : labelsEn
    const delivery = await sendFormSubmissionEmails({
      details: [
        { label: labels.email, value: payload.customer_email },
        { label: labels.phone, value: payload.customer_phone },
        { label: labels.service, value: payload.selected_plan },
        { label: labels.orderReference, value: body.orderReference },
        ...(requestType === 'complaint_request'
          ? [{ label: labels.safety, value: body.immediateSafetyRisk ? labels.yes : labels.no }]
          : []),
        { label: labels.message, value: payload.message },
      ],
      kind: requestType === 'complaint_request' ? 'complaint' : 'contact',
      locale,
      name: payload.customer_name,
      recipient: payload.customer_email,
      reference: record?.id ? `CM-${requestType === 'complaint_request' ? 'COMP' : 'CONTACT'}-${record.id}` : '',
      request,
    })

    if (record?.id) {
      await updateSupabaseRows('contact_requests', {
        payload_json: { ...body, notificationDelivery: delivery },
      }, `id=eq.${encodeURIComponent(record.id)}&select=id`)
    }

    sendJson(response, 200, { ...result.body, emailDelivery: delivery })
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid contact request.',
    })
  }
}

function normalizeLocale(value) {
  return String(value || '').toLowerCase().startsWith('es') ? 'es' : 'en'
}

const labelsEn = {
  email: 'Email', message: 'Message', no: 'No', orderReference: 'Order or project reference', phone: 'Phone', safety: 'Immediate safety risk', service: 'Service or plan', yes: 'Yes',
}

const labelsEs = {
  email: 'Correo electrónico', message: 'Mensaje', no: 'No', orderReference: 'Referencia del pedido o proyecto', phone: 'Teléfono', safety: 'Riesgo inmediato de seguridad', service: 'Servicio o plan', yes: 'Sí',
}
