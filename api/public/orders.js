import {
  createSupabaseRowIfAbsent,
  readJsonBody,
  requirePost,
  sendJson,
} from '../_lib/supabase.js'
import { sendFormSubmissionEmails } from '../_lib/form-email.js'
import { applyPublicCors, isAllowedPublicOrigin } from '../_lib/public-origin.js'
import { reservePublicRequest } from '../_lib/public-rate-limit.js'
import {
  cleanString,
  hasAcceptedConsent,
  isJsonWithinBytes,
  isValidEmail,
  isWithinLength,
} from '../_lib/public-form-validation.js'

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
    const customerEmail = cleanString(body.email)
    const planId = cleanString(body.planId)
    const planLabel = cleanString(body.planLabel)
    const orderId = cleanString(body.orderId)
    const status = normalizePublicOrderStatus(body.status)

    if (
      !isJsonWithinBytes(body, 262_144)
      || !isWithinLength(customerName, 120, { required: true })
      || !isValidEmail(customerEmail)
      || !isWithinLength(planId, 500, { required: true })
      || !isWithinLength(planLabel, 240, { required: true })
      || (orderId && !/^CM-[A-Z0-9-]{6,40}$/i.test(orderId))
      || !isWithinLength(body.address, 300)
      || !isWithinLength(body.city, 120)
      || !isWithinLength(body.postcode, 20)
      || !isWithinLength(body.province, 120)
      || !isWithinLength(body.phone, 40)
      || !isWithinLength(body.notes, 5_000)
      || !hasAcceptedConsent(body.consentRecords)
    ) {
      sendJson(response, 400, { message: 'Customer details, selected work and contact consent are required.' })
      return
    }

    const reservation = await reservePublicRequest(request, {
      callRpc: dependencies.callRpc,
      env: dependencies.env ?? process.env,
      limit: 5,
      scope: 'order-request',
      windowSeconds: 30 * 60,
    })
    if (!reservation.ok) {
      sendJson(response, reservation.status, {
        message: reservation.status === 429
          ? 'Too many order requests. Please try again later.'
          : 'Order requests are temporarily unavailable.',
      })
      return
    }

    const payload = {
      order_id: orderId || `CM-${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString(),
      status,
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

export function normalizePublicOrderStatus(value) {
  return value === 'Quote requested' || value === 'Visit payment pending' ? value : 'New'
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
