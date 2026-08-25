export const proposalPaymentConfig = Object.freeze({
  currency: 'eur',
  depositRate: 0.5,
  vatIncluded: true,
})

export function calculateProposalDepositCents(proposal) {
  const lineItems = Array.isArray(proposal?.line_items) ? proposal.line_items : []
  const subtotalCents = lineItems.reduce((sum, item) => {
    const quantity = finiteNumber(item?.quantity)
    const unitPrice = finiteNumber(item?.unit_price ?? item?.unitPrice)
    return sum + Math.round(quantity * unitPrice * 100)
  }, 0)

  if (subtotalCents <= 0) {
    throw new Error('The proposal does not contain a payable amount.')
  }

  const isAssessment = proposal?.selected_plan === 'Assessment visit' || proposal?.plan === 'Assessment visit'
  return isAssessment ? subtotalCents : Math.round(subtotalCents * getProposalDepositRate(proposal))
}

export function getProposalDepositRate(proposal) {
  const value = Number(proposal?.deposit_rate ?? proposal?.depositRate)
  return Number.isFinite(value) && value >= 0.01 && value <= 1
    ? value
    : proposalPaymentConfig.depositRate
}

export function buildProposalDepositCheckoutSession({ locale = 'en', origin, proposal, taxRateId }) {
  const proposalId = text(proposal?.id)
  const publicToken = text(proposal?.public_token)
  const customerEmail = text(proposal?.customer_email ?? proposal?.email)

  if (!proposalId || !publicToken || !customerEmail || !origin || !taxRateId) {
    throw new Error('The proposal checkout is missing required information.')
  }

  const amount = calculateProposalDepositCents(proposal)
  const localeCode = String(locale).toLowerCase().split(/[-_]/)[0]
  const checkoutLocale = ['de', 'es', 'fr', 'nl'].includes(localeCode) ? localeCode : 'en'
  const isAssessment = proposal?.selected_plan === 'Assessment visit' || proposal?.plan === 'Assessment visit'
  const depositPercent = Math.round(getProposalDepositRate(proposal) * 100)
  const productCopy = checkoutLocale === 'es'
    ? {
        description: isAssessment
          ? 'Pago completo de la propuesta. IVA incluido.'
          : `Pago a cuenta del ${depositPercent} % de la propuesta. IVA incluido.`,
        name: isAssessment ? 'Pago de propuesta CasaMia' : 'Depósito de propuesta CasaMia',
      }
    : {
        description: isAssessment
          ? 'Full proposal payment. VAT included.'
          : `${depositPercent}% proposal payment on account. VAT included.`,
        name: isAssessment ? 'CasaMia proposal payment' : 'CasaMia proposal deposit',
      }
  const metadata = {
    casa_mia_payment_type: 'proposal_deposit',
    proposal_id: proposalId,
    public_token: publicToken,
    vat_included: 'true',
  }

  return {
    cancel_url: `${origin}/proposal/${encodeURIComponent(publicToken)}?payment=cancelled`,
    client_reference_id: proposalId,
    customer_email: customerEmail,
    line_items: [{
      price_data: {
        currency: proposalPaymentConfig.currency,
        product_data: productCopy,
        tax_behavior: 'inclusive',
        unit_amount: amount,
      },
      quantity: 1,
      tax_rates: [taxRateId],
    }],
    locale: checkoutLocale,
    metadata,
    mode: 'payment',
    payment_intent_data: {
      description: `${productCopy.name} ${proposalId}`,
      metadata,
      receipt_email: customerEmail,
    },
    success_url: `${origin}/proposal/${encodeURIComponent(publicToken)}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
  }
}

export function mapProposalDepositPaymentEvent(event) {
  const session = event?.data?.object
  const proposalId = text(session?.metadata?.proposal_id || session?.client_reference_id)

  if (!proposalId || session?.metadata?.casa_mia_payment_type !== 'proposal_deposit') return null

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    return {
      proposalId,
      status: session.payment_status === 'paid' ? 'Deposit Paid' : 'Deposit payment pending',
    }
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    return { proposalId, status: 'Deposit payment failed' }
  }

  if (event.type === 'checkout.session.expired') {
    return { proposalId, status: 'Deposit payment expired' }
  }

  return null
}

function finiteNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}
