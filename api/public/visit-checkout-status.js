import { getStripeClient, StripeConfigurationError } from '../_lib/stripe.js'
import { sendJson } from '../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const sessionId = getQueryValue(request, 'session_id')
    if (!/^cs_(?:test_|live_)?[A-Za-z0-9_]+$/.test(sessionId)) {
      sendJson(response, 400, { message: 'A valid Stripe Checkout session is required.' })
      return
    }

    const session = await getStripeClient().checkout.sessions.retrieve(sessionId)
    const isVisit = session.metadata?.casa_mia_payment_type === 'home_visit'

    if (!isVisit) {
      sendJson(response, 404, { message: 'The visit payment was not found.' })
      return
    }

    sendJson(response, 200, {
      orderId: session.metadata?.order_id || session.client_reference_id,
      paymentStatus: session.payment_status,
      recordType: session.metadata?.record_type === 'assessment' ? 'assessment' : 'order',
      status: session.status,
    })
  } catch (error) {
    const configurationError = error instanceof StripeConfigurationError
    sendJson(response, configurationError ? 503 : 400, {
      message: configurationError ? 'Payment verification is temporarily unavailable.' : 'The visit payment could not be verified.',
    })
  }
}

function getQueryValue(request, key) {
  const value = request.query?.[key]
  return Array.isArray(value) ? String(value[0] || '') : String(value || '')
}
