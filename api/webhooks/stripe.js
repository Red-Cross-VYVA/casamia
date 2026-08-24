import { getStripeClient, getStripeWebhookSecret, StripeConfigurationError } from '../_lib/stripe.js'
import { selectSupabaseRows, sendJson, updateSupabaseRows } from '../_lib/supabase.js'
import { mapVisitPaymentEvent } from '../_lib/visit-payment.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  let event

  try {
    const stripe = getStripeClient()
    event = stripe.webhooks.constructEvent(
      await readRawBody(request),
      getHeader(request, 'stripe-signature'),
      getStripeWebhookSecret(),
    )
  } catch (error) {
    const configurationError = error instanceof StripeConfigurationError
    if (configurationError) console.error('Stripe webhook configuration is incomplete.')
    sendJson(response, configurationError ? 503 : 400, {
      message: configurationError ? 'Stripe webhook is not configured.' : 'Invalid Stripe webhook signature.',
    })
    return
  }

  try {
    const paymentUpdate = mapVisitPaymentEvent(event)

    if (paymentUpdate) {
      await applyVisitPaymentUpdate(paymentUpdate, event)
    }

    sendJson(response, 200, { received: true })
  } catch (error) {
    console.error('Stripe webhook processing failed.', error)
    sendJson(response, 500, { message: 'The Stripe event could not be processed.' })
  }
}

async function applyVisitPaymentUpdate(paymentUpdate, event) {
  const tableName = paymentUpdate.recordType === 'assessment' ? 'assessment_requests' : 'orders'
  const referenceColumn = paymentUpdate.recordType === 'assessment' ? 'id' : 'order_id'
  const existing = await selectSupabaseRows(
    tableName,
    `${referenceColumn}=eq.${encodeURIComponent(paymentUpdate.orderId)}&select=id,status,payload_json&limit=1`,
  )

  if (!existing.ok) throw new Error('The paid booking could not be loaded.')
  const order = Array.isArray(existing.body) ? existing.body[0] : undefined
  if (!order) throw new Error('The paid booking was not found.')

  const payload = order.payload_json && typeof order.payload_json === 'object' ? order.payload_json : {}
  const currentPayment = payload.visitPayment && typeof payload.visitPayment === 'object'
    ? payload.visitPayment
    : {}

  if (currentPayment.lastEventId === event.id) return

  const session = event.data.object
  const preservesAppointment = paymentUpdate.recordType === 'assessment'
    && order.payload_json?.visitAppointment?.startAt
    && paymentUpdate.status === 'Visit paid'
  const updated = await updateSupabaseRows(tableName, {
    status: preservesAppointment ? order.status : paymentUpdate.status,
    payload_json: {
      ...payload,
      visitPayment: {
        ...currentPayment,
        amount: session.amount_total,
        currency: session.currency,
        lastEventAt: new Date().toISOString(),
        lastEventId: event.id,
        paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
        paymentStatus: session.payment_status,
        sessionId: session.id,
        status: paymentUpdate.status,
      },
    },
  }, `${referenceColumn}=eq.${encodeURIComponent(paymentUpdate.orderId)}&select=id,status`)

  if (!updated.ok) throw new Error('The paid booking could not be updated.')
}

function getHeader(request, name) {
  const value = request.headers?.[name] ?? request.headers?.[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : String(value || '')
}

function readRawBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let tooLarge = false

    request.on('data', (chunk) => {
      if (tooLarge) return
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buffer.length
      if (size > 1024 * 1024) {
        tooLarge = true
        reject(new Error('Stripe webhook body is too large.'))
        return
      }
      chunks.push(buffer)
    })
    request.on('end', () => {
      if (!tooLarge) resolve(Buffer.concat(chunks))
    })
    request.on('error', reject)
  })
}
