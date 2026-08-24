import { getStripeClient } from './stripe.js'

export async function verifyPaidAssessmentSession(sessionId) {
  if (!/^cs_(?:test_|live_)?[A-Za-z0-9_]+$/.test(String(sessionId || ''))) {
    return { error: 'A valid Stripe Checkout session is required.', status: 400 }
  }

  const session = await getStripeClient().checkout.sessions.retrieve(sessionId)
  const isVisit = session.metadata?.casa_mia_payment_type === 'home_visit'
  const assessmentId = session.metadata?.record_type === 'assessment'
    ? session.metadata?.order_id || session.client_reference_id
    : ''

  if (!isVisit || !assessmentId) return { error: 'The paid assessment visit was not found.', status: 404 }
  if (session.payment_status !== 'paid') return { error: 'The visit payment has not been confirmed.', status: 409 }

  return { assessmentId, session }
}
