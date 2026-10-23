export const proposalPaymentConfig = Object.freeze({
  currency: 'eur',
  depositRate: 0.5,
  vatIncluded: true,
})

export function getProposalTaxRateIds(env = process.env) {
  return {
    4: text(env.STRIPE_PROPOSAL_TAX_RATE_4_ID),
    10: text(env.STRIPE_PROPOSAL_TAX_RATE_10_ID),
    21: text(env.STRIPE_PROPOSAL_TAX_RATE_21_ID),
  }
}

export function validateInclusiveProposalTaxRate(taxRate, expectedPercentage) {
  const supportedRates = new Set([4, 10, 21])
  const percentage = Number(expectedPercentage)
  if (!taxRate || taxRate.deleted || taxRate.active !== true || taxRate.inclusive !== true
    || !supportedRates.has(percentage) || Number(taxRate.percentage) !== percentage) {
    throw new Error(`The proposal VAT setting must reference an active, inclusive ${percentage}% Stripe tax rate.`)
  }
  return taxRate
}

export function getProposalVatGroups(proposal) {
  const lineItems = Array.isArray(proposal?.line_items) ? proposal.line_items : []
  const groups = new Map()
  for (const item of lineItems) {
    const percentage = normaliseVatPercentage(item?.vat_rate ?? item?.vatRate)
    if (!percentage) throw new Error('Every proposal line must have an approved 4%, 10%, or 21% VAT rate.')
    const quantity = finiteNumber(item?.quantity)
    const unitPrice = finiteNumber(item?.unit_price ?? item?.unitPrice)
    groups.set(percentage, (groups.get(percentage) || 0) + Math.round(quantity * unitPrice * 100))
  }
  if (!groups.size || [...groups.values()].some((amount) => amount <= 0)) {
    throw new Error('Each proposal VAT group must have a positive payable amount.')
  }
  const multiplier = proposal?.selected_plan === 'Assessment visit' || proposal?.plan === 'Assessment visit'
    ? 1
    : getProposalDepositRate(proposal)
  const result = [...groups.entries()].map(([percentage, grossCents]) => ({
    amount: Math.round(grossCents * multiplier),
    percentage,
  }))
  const difference = calculateProposalDepositCents(proposal) - result.reduce((sum, group) => sum + group.amount, 0)
  if (difference) result.sort((a, b) => b.amount - a.amount)[0].amount += difference
  return result.sort((a, b) => a.percentage - b.percentage)
}

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

export function buildProposalDepositCheckoutSession({ locale = 'en', origin, proposal, taxRateIds }) {
  const proposalId = text(proposal?.id)
  const publicToken = text(proposal?.public_token)
  const customerEmail = text(proposal?.customer_email ?? proposal?.email)

  const vatGroups = getProposalVatGroups(proposal)
  if (!proposalId || !publicToken || !customerEmail || !origin
    || vatGroups.some((group) => !text(taxRateIds?.[group.percentage]))) {
    throw new Error('The proposal checkout is missing required information.')
  }

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
    vat_rates: vatGroups.map((group) => group.percentage).join(','),
  }

  return {
    cancel_url: `${origin}/proposal/${encodeURIComponent(publicToken)}?payment=cancelled`,
    client_reference_id: proposalId,
    customer_email: customerEmail,
    line_items: vatGroups.map((group) => ({
      price_data: {
        currency: proposalPaymentConfig.currency,
        product_data: productCopy,
        tax_behavior: 'inclusive',
        unit_amount: group.amount,
      },
      quantity: 1,
      tax_rates: [taxRateIds[group.percentage]],
    })),
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

function normaliseVatPercentage(value) {
  const numeric = Number(value)
  const percentage = numeric > 0 && numeric < 1 ? numeric * 100 : numeric
  const rounded = Math.round(percentage * 100) / 100
  return [4, 10, 21].includes(rounded) ? rounded : 0
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}
