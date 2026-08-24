import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  buildVisitCheckoutSession,
  mapVisitPaymentEvent,
  validateInclusiveVisitTaxRate,
  visitPaymentConfig,
} from '../api/_lib/visit-payment.js'
import {
  buildProposalDepositCheckoutSession,
  calculateProposalDepositCents,
  mapProposalDepositPaymentEvent,
} from '../api/_lib/proposal-payment.js'

assert.deepEqual(visitPaymentConfig, {
  currency: 'eur',
  feeCents: 9_900,
  vatIncluded: true,
  vatRate: 21,
})

const checkout = buildVisitCheckoutSession({
  locale: 'es',
  order: {
    customer_email: 'customer@example.com',
    customer_name: 'Test Customer',
    order_id: 'CM-2026-TEST1234',
  },
  origin: 'https://www.casamia.com.es',
  recordType: 'assessment',
  taxRateId: 'txr_visit_vat',
})

assert.equal(checkout.line_items[0].price_data.unit_amount, 9_900)
assert.equal(checkout.line_items[0].price_data.tax_behavior, 'inclusive')
assert.deepEqual(checkout.line_items[0].tax_rates, ['txr_visit_vat'])
assert.equal(checkout.locale, 'es')
assert.equal(checkout.payment_intent_data.receipt_email, 'customer@example.com')
assert.equal(checkout.metadata.vat_included, 'true')
assert.equal(checkout.metadata.record_type, 'assessment')
assert.match(checkout.cancel_url, /\/home-safety-wizard\?payment=cancelled$/)
assert.match(checkout.success_url, /session_id=\{CHECKOUT_SESSION_ID\}$/)

assert.doesNotThrow(() => validateInclusiveVisitTaxRate({ active: true, inclusive: true, percentage: 21 }))
for (const invalidTaxRate of [
  { active: false, inclusive: true, percentage: 21 },
  { active: true, inclusive: false, percentage: 21 },
  { active: true, inclusive: true, percentage: 10 },
]) {
  assert.throws(() => validateInclusiveVisitTaxRate(invalidTaxRate), /active, inclusive 21% VAT rate/)
}

const paidEvent = {
  type: 'checkout.session.completed',
  data: {
    object: {
      client_reference_id: 'CM-2026-TEST1234',
      metadata: { casa_mia_payment_type: 'home_visit' },
      payment_status: 'paid',
    },
  },
}
assert.deepEqual(mapVisitPaymentEvent(paidEvent), {
  orderId: 'CM-2026-TEST1234',
  recordType: 'order',
  status: 'Visit paid',
})
assert.equal(mapVisitPaymentEvent({ ...paidEvent, type: 'customer.created' }), null)
assert.deepEqual(
  mapVisitPaymentEvent({
    ...paidEvent,
    type: 'checkout.session.expired',
  }),
  { orderId: 'CM-2026-TEST1234', recordType: 'order', status: 'Visit payment expired' },
)

const proposal = {
  acceptance_status: 'Accepted',
  customer_email: 'proposal@example.com',
  id: 'CM-2026-PROPOSAL',
  line_items: [
    { quantity: 1, unit_price: 325 },
    { quantity: 2, unit_price: 87 },
  ],
  public_token: 'abcdefghijklmnopqrstuvwxyz123456',
  selected_plan: 'Home adaptations',
  status: 'Accepted',
}
assert.equal(calculateProposalDepositCents(proposal), 24_950)

const proposalCheckout = buildProposalDepositCheckoutSession({
  locale: 'es',
  origin: 'https://www.casamia.com.es',
  proposal,
  taxRateId: 'txr_proposal_vat',
})
assert.equal(proposalCheckout.line_items[0].price_data.unit_amount, 24_950)
assert.equal(proposalCheckout.line_items[0].price_data.tax_behavior, 'inclusive')
assert.deepEqual(proposalCheckout.line_items[0].tax_rates, ['txr_proposal_vat'])
assert.equal(proposalCheckout.metadata.casa_mia_payment_type, 'proposal_deposit')
assert.equal(proposalCheckout.payment_intent_data.receipt_email, 'proposal@example.com')
assert.match(proposalCheckout.cancel_url, /payment=cancelled$/)
assert.match(proposalCheckout.success_url, /session_id=\{CHECKOUT_SESSION_ID\}$/)

const proposalPaidEvent = {
  type: 'checkout.session.completed',
  data: {
    object: {
      client_reference_id: proposal.id,
      metadata: { casa_mia_payment_type: 'proposal_deposit', proposal_id: proposal.id },
      payment_status: 'paid',
    },
  },
}
assert.deepEqual(mapProposalDepositPaymentEvent(proposalPaidEvent), {
  proposalId: proposal.id,
  status: 'Deposit Paid',
})
assert.equal(mapProposalDepositPaymentEvent(paidEvent), null)

const checkoutPage = readFileSync(new URL('../src/pages/ConfigureCheckoutPage.tsx', import.meta.url), 'utf8')
const confirmationPage = readFileSync(new URL('../src/pages/ConfigureConfirmationPage.tsx', import.meta.url), 'utf8')
const webhook = readFileSync(new URL('../api/webhooks/stripe.js', import.meta.url), 'utf8')
const wizard = readFileSync(new URL('../src/pages/HomeSafetyWizardPage.tsx', import.meta.url), 'utf8')
const assessmentForm = readFileSync(new URL('../src/components/AssessmentForm.tsx', import.meta.url), 'utf8')
const publicProposalPage = readFileSync(new URL('../src/pages/PublicProposalPage.tsx', import.meta.url), 'utf8')

assert.match(checkoutPage, /createPaidVisitCheckout/)
assert.doesNotMatch(checkoutPage, /createMockDepositCheckout|mockStripeConfiguratorAdapter/)
assert.match(checkoutPage, /checkout\.stripe\.com/)
assert.match(confirmationPage, /getVisitCheckoutStatus/)
assert.match(confirmationPage, /status\.paymentStatus === 'paid'/)
assert.match(webhook, /stripe\.webhooks\.constructEvent/)
assert.match(webhook, /sendJson\(response, 500/)
assert.match(wizard, /createVisitCheckout[\s\S]*'assessment'/)
assert.match(wizard, /getVisitCheckoutStatus/)
assert.match(assessmentForm, /Continue to secure payment/)
assert.match(assessmentForm, /submission\.id[\s\S]*createVisitCheckout/)
assert.match(publicProposalPage, /acceptPublicProposal[\s\S]*beginPayment/)
assert.match(publicProposalPage, /Pay deposit/)
assert.match(webhook, /mapProposalDepositPaymentEvent/)

console.log('Stripe visit payment tests passed.')
