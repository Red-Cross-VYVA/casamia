import { applyPublicCors, isAllowedPublicOrigin, normalizeOrigin } from '../_lib/public-origin.js'
import { getStripeClient, StripeConfigurationError } from '../_lib/stripe.js'
import { readJsonBody, selectSupabaseRows, sendJson, updateSupabaseRows } from '../_lib/supabase.js'
import {
  buildVisitCheckoutSession,
  getVisitPaymentConfig,
  getVisitTaxRateId,
  validateInclusiveVisitTaxRate,
} from '../_lib/visit-payment.js'
import { normaliseCommercialSettings } from '../../shared/commercialSettings.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    if (!applyPublicCors(request, response)) {
      sendJson(response, 403, { message: 'Origin not allowed.' })
      return
    }
    response.status(204).end()
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  if (!isAllowedPublicOrigin(request)) {
    sendJson(response, 403, { message: 'Origin not allowed.' })
    return
  }

  applyPublicCors(request, response)

  try {
    const body = await readJsonBody(request)
    const orderId = text(body.orderId)
    const recordType = body.recordType === 'assessment' ? 'assessment' : 'order'

    if (!isValidReference(orderId, recordType)) {
      sendJson(response, 400, { message: 'A booking reference is required.' })
      return
    }

    const tableName = recordType === 'assessment' ? 'assessment_requests' : 'orders'
    const referenceColumn = recordType === 'assessment' ? 'id' : 'order_id'
    const orderResult = await selectSupabaseRows(
      tableName,
      `${referenceColumn}=eq.${encodeURIComponent(orderId)}&select=*&limit=1`,
    )

    if (!orderResult.ok) {
      sendJson(response, 503, { message: 'The booking could not be prepared for payment.' })
      return
    }

    const storedRecord = Array.isArray(orderResult.body) ? orderResult.body[0] : undefined
    if (!storedRecord) {
      sendJson(response, 404, { message: 'The booking request was not found.' })
      return
    }

    const order = recordType === 'assessment'
      ? {
          customer_email: storedRecord.customer_email,
          customer_name: storedRecord.customer_name,
          order_id: storedRecord.id,
          payload_json: storedRecord.payload_json,
        }
      : storedRecord

    if (!text(order.customer_email)) {
      sendJson(response, 400, { message: 'An email address is required for secure visit payment.' })
      return
    }

    const catalogueResult = await selectSupabaseRows(
      'service_catalogue',
      'id=eq.default&select=payload_json&limit=1',
    )
    if (!catalogueResult.ok) {
      sendJson(response, 503, { message: 'Current visit pricing could not be loaded.' })
      return
    }
    const catalogueRecord = Array.isArray(catalogueResult.body) ? catalogueResult.body[0] : undefined
    const commercialSettings = normaliseCommercialSettings(catalogueRecord?.payload_json?.masterCatalogue?.commercialSettings)
    const paymentConfig = getVisitPaymentConfig(commercialSettings)

    const stripe = getStripeClient()
    const taxRateId = getVisitTaxRateId()
    if (!taxRateId) throw new StripeConfigurationError('Add STRIPE_VISIT_TAX_RATE_ID in Vercel.')

    validateInclusiveVisitTaxRate(await stripe.taxRates.retrieve(taxRateId), paymentConfig)
    const origin = getPublicOrigin(request)
    const session = await stripe.checkout.sessions.create(buildVisitCheckoutSession({
      commercialSettings,
      locale: body.locale || order.payload_json?.locale,
      order,
      origin,
      recordType,
      taxRateId,
    }), {
      idempotencyKey: `casamia-visit-${recordType}-${orderId}`,
    })

    if (!session.url) throw new Error('Stripe did not return a Checkout URL.')

    const updateResult = await updateSupabaseRows(tableName, {
      ...(recordType === 'order' ? { payment_method: 'stripe-checkout' } : {}),
      status: 'Visit payment pending',
      payload_json: {
        ...(order.payload_json && typeof order.payload_json === 'object' ? order.payload_json : {}),
        visitPayment: {
          amount: paymentConfig.feeCents,
          currency: paymentConfig.currency,
          sessionId: session.id,
          status: 'pending',
          vatIncluded: paymentConfig.vatIncluded,
          vatRate: paymentConfig.vatRate,
        },
      },
    }, `${referenceColumn}=eq.${encodeURIComponent(orderId)}&select=id,status`)

    if (!updateResult.ok) throw new Error('The booking payment state could not be saved.')

    sendJson(response, 200, {
      amount: paymentConfig.feeCents,
      checkoutUrl: session.url,
      currency: paymentConfig.currency,
      orderId,
      recordType,
      vatIncluded: true,
    })
  } catch (error) {
    const configurationError = error instanceof StripeConfigurationError
    if (!configurationError) console.error('Stripe visit checkout failed.', error)
    sendJson(response, configurationError ? 503 : 500, {
      message: configurationError
        ? 'Online visit payment is temporarily unavailable.'
        : 'The visit checkout could not be created.',
    })
  }
}

function getPublicOrigin(request) {
  const configured = normalizeOrigin(process.env.CASAMIA_PUBLIC_SITE_URL)
  if (configured) return configured

  const protocol = String(request.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim()
  const host = String(request.headers?.host || '').trim()
  return normalizeOrigin(host ? `${protocol}://${host}` : '') || 'https://www.casamia.com.es'
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidReference(value, recordType) {
  if (recordType === 'assessment') {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  }

  return /^CM-[A-Z0-9-]{6,40}$/i.test(value)
}
