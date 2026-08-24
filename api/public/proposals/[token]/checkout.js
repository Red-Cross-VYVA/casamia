import { getProposalRecordByToken, isPublicProposalToken, mapProposalRecord, updateProposalRecord } from '../../../_lib/proposals.js'
import { buildProposalDepositCheckoutSession, calculateProposalDepositCents, proposalPaymentConfig } from '../../../_lib/proposal-payment.js'
import { applyPublicCors, isAllowedPublicOrigin, normalizeOrigin } from '../../../_lib/public-origin.js'
import { getStripeClient, StripeConfigurationError } from '../../../_lib/stripe.js'
import { readJsonBody, sendJson } from '../../../_lib/supabase.js'
import { getVisitTaxRateId, validateInclusiveVisitTaxRate } from '../../../_lib/visit-payment.js'

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

  const token = getParam(request, 'token')
  if (!isPublicProposalToken(token)) {
    sendJson(response, 404, { message: 'Proposal not found.' })
    return
  }

  try {
    const current = await getProposalRecordByToken(token)
    if (!current.ok) {
      sendJson(response, current.status, current.body)
      return
    }

    const proposal = mapProposalRecord(current.record)
    if (proposal.status === 'Deposit Paid') {
      sendJson(response, 409, { message: 'This proposal deposit has already been paid.' })
      return
    }
    if (proposal.status !== 'Accepted' || proposal.acceptance_status !== 'Accepted') {
      sendJson(response, 409, { message: 'Accept the proposal before continuing to payment.' })
      return
    }
    if (!text(proposal.customer_email)) {
      sendJson(response, 400, { message: 'An email address is required for secure payment.' })
      return
    }

    const body = await readJsonBody(request)
    const stripe = getStripeClient()
    const taxRateId = getVisitTaxRateId()
    if (!taxRateId) throw new StripeConfigurationError('Add STRIPE_VISIT_TAX_RATE_ID in Vercel.')
    validateInclusiveVisitTaxRate(await stripe.taxRates.retrieve(taxRateId))
    const existingPayment = object(proposal.proposalPayment)
    if (text(existingPayment.sessionId)) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(existingPayment.sessionId)
        if (existingSession.status === 'open' && existingSession.url) {
          sendCheckout(response, existingSession.url, proposal, existingSession.id)
          return
        }
      } catch {
        // A missing or expired session is replaced below.
      }
    }

    const checkout = buildProposalDepositCheckoutSession({
      locale: body.locale,
      origin: getPublicOrigin(request),
      proposal,
      taxRateId,
    })
    const attempt = Math.max(0, Number(existingPayment.attempt) || 0) + 1
    const session = await stripe.checkout.sessions.create(checkout, {
      idempotencyKey: `casamia-proposal-${proposal.id}-${attempt}`,
    })
    if (!session.url) throw new Error('Stripe did not return a Checkout URL.')

    const now = new Date().toISOString()
    const events = Array.isArray(proposal.events) ? proposal.events : []
    const updated = await updateProposalRecord(current.record, {
      events: [...events, { at: now, sessionId: session.id, type: 'deposit-checkout-created' }],
      proposalPayment: {
        ...existingPayment,
        amount: calculateProposalDepositCents(proposal),
        attempt,
        currency: proposalPaymentConfig.currency,
        sessionId: session.id,
        status: 'pending',
        vatIncluded: true,
      },
    })
    if (!updated.ok) throw new Error('The proposal payment state could not be saved.')

    sendCheckout(response, session.url, proposal, session.id)
  } catch (error) {
    const configurationError = error instanceof StripeConfigurationError
    if (!configurationError) console.error('Stripe proposal checkout failed.', error)
    sendJson(response, configurationError ? 503 : 500, {
      message: configurationError
        ? 'Online proposal payment is temporarily unavailable.'
        : 'The proposal checkout could not be created.',
    })
  }
}

function sendCheckout(response, checkoutUrl, proposal, sessionId) {
  sendJson(response, 200, {
    amount: calculateProposalDepositCents(proposal),
    checkoutUrl,
    currency: proposalPaymentConfig.currency,
    proposalId: proposal.id,
    sessionId,
    vatIncluded: true,
  })
}

function getPublicOrigin(request) {
  const configured = normalizeOrigin(process.env.CASAMIA_PUBLIC_SITE_URL)
  if (configured) return configured
  const protocol = String(request.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim()
  const host = String(request.headers?.host || '').trim()
  return normalizeOrigin(host ? `${protocol}://${host}` : '') || 'https://www.casamia.com.es'
}

function getParam(request, name) {
  const value = request.query?.[name]
  return Array.isArray(value) ? value[0] : String(value ?? '')
}

function object(value) {
  return value && typeof value === 'object' ? value : {}
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}
