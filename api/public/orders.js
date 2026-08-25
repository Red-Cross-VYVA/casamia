import {
  createSupabaseRowIfAbsent,
  readJsonBody,
  requirePost,
  sendJson,
} from '../_lib/supabase.js'
import { sendFormSubmissionEmails } from '../_lib/form-email.js'
import { cleanString, hasAcceptedConsent, isValidEmail } from '../_lib/public-form-validation.js'

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  try {
    const body = await readJsonBody(request)
    const customerName = cleanString(body.name)
    const customerEmail = cleanString(body.email)
    const planId = cleanString(body.planId)
    const planLabel = cleanString(body.planLabel)

    if (
      !customerName
      || !isValidEmail(customerEmail)
      || !planId
      || !planLabel
      || !hasAcceptedConsent(body.consentRecords)
    ) {
      sendJson(response, 400, { message: 'Customer details, selected work and contact consent are required.' })
      return
    }

    const payload = {
      order_id: body.orderId ?? `CM-${Date.now().toString(36).toUpperCase()}`,
      created_at: body.createdAt ?? new Date().toISOString(),
      status: body.status ?? 'New',
      plan_id: planId,
      plan_label: planLabel,
      plan_price: body.planPrice ?? '',
      installation_address: cleanString(body.address),
      city: cleanString(body.city),
      postcode: cleanString(body.postcode),
      province: cleanString(body.province),
      customer_name: customerName,
      customer_phone: cleanString(body.phone),
      customer_email: customerEmail,
      preferred_timing: cleanString(body.preferredTiming),
      notes: cleanString(body.notes),
      payment_method: cleanString(body.paymentMethod),
      payload_json: body,
    }
    const result = await createSupabaseRowIfAbsent('orders', payload, 'order_id')

    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    const record = Array.isArray(result.body) ? result.body[0] : result.body
    const locale = normalizeLocale(body.locale ?? body.customer?.preferredLanguage)
    const labels = locale === 'es' ? labelsEs : labelsEn
    const emailDelivery = record
      ? await sendFormSubmissionEmails({
          details: [
            { label: labels.email, value: payload.customer_email },
            { label: labels.phone, value: payload.customer_phone },
            { label: labels.address, value: [payload.installation_address, payload.postcode, payload.city, payload.province].filter(Boolean).join(', ') },
            { label: labels.selection, value: payload.plan_label },
            { label: labels.estimate, value: payload.plan_price },
            { label: labels.timing, value: payload.preferred_timing },
            { label: labels.notes, value: payload.notes },
          ],
          kind: payload.status === 'Visit payment pending' ? 'booking' : 'quote',
          locale,
          name: payload.customer_name,
          recipient: payload.customer_email,
          reference: payload.order_id,
          request,
        })
      : { skipped: true, status: 'duplicate' }
    sendJson(response, 200, {
      emailDelivery,
      id: record?.id,
      orderId: payload.order_id,
      status: record?.status ?? payload.status,
    })
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid order request.',
    })
  }
}

function normalizeLocale(value) {
  return String(value || '').toLowerCase().startsWith('es') ? 'es' : 'en'
}

const labelsEn = {
  address: 'Installation address', email: 'Email', estimate: 'Current estimate', notes: 'Notes', phone: 'Phone', selection: 'Selected work', timing: 'Preferred contact',
}

const labelsEs = {
  address: 'Dirección de instalación', email: 'Correo electrónico', estimate: 'Estimación actual', notes: 'Notas', phone: 'Teléfono', selection: 'Trabajos seleccionados', timing: 'Contacto preferido',
}
