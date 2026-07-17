import {
  mockAirtableConfiguratorAdapter,
  mockEmailConfiguratorAdapter,
  mockStripeConfiguratorAdapter,
} from './configuratorAdapters'
import { calculateConfiguratorQuote } from './configuratorPricing'
import { hasPublicSiteApi, postPublicSiteJson } from './publicSiteApi'
import { getSubmittedConfigurationStorageKey } from '../context/ConfiguratorContext'
import type { ConfiguratorState, WizardSubmission } from '../types/configurator'

export async function submitConfiguratorRequest(state: ConfiguratorState) {
  const submission = createWizardSubmission(state, 'web-configurator')
  const saved = await mockAirtableConfiguratorAdapter.saveSubmission(submission)
  await mockEmailConfiguratorAdapter.sendConfirmation(submission)
  await saveConfiguratorOrder(submission, 'Quote requested', 'quote-request')

  return { submission, saved }
}

export async function createMockDepositCheckout(state: ConfiguratorState) {
  const submission = createWizardSubmission(state, 'web-configurator-deposit')
  await mockAirtableConfiguratorAdapter.saveSubmission(submission)
  await mockEmailConfiguratorAdapter.sendConfirmation(submission)
  await saveConfiguratorOrder(submission, 'Visit requested', 'visit-deposit-pending')

  return mockStripeConfiguratorAdapter.createDepositCheckout(submission)
}

async function saveConfiguratorOrder(
  submission: WizardSubmission,
  status: 'Quote requested' | 'Visit requested',
  paymentMethod: string,
) {
  if (!hasPublicSiteApi()) return

  await postPublicSiteJson('/api/public/orders', {
    ...submission,
    address: submission.customer.address,
    createdAt: submission.timestamp,
    email: submission.customer.email,
    name: submission.customer.fullName,
    notes: submission.customer.notes,
    orderId: submission.configurationId,
    paymentMethod,
    phone: submission.customer.telephone,
    planId: submission.selectedServices.map((service) => service.serviceId).join(','),
    planLabel: `${submission.selectedServices.length} selected improvements`,
    planPrice: `${submission.totalEstimate} EUR`,
    postcode: submission.property.postcode,
    preferredTiming: submission.customer.preferredContact,
    status,
  })
}

export function createWizardSubmission(state: ConfiguratorState, source: string): WizardSubmission {
  const quote = calculateConfiguratorQuote(state)
  const timestamp = new Date().toISOString()

  return {
    configurationId: createConfigurationId(),
    timestamp,
    source,
    customer: state.customer,
    property: state.property,
    selectedServices: quote.selectedServices,
    quantities: state.quantities,
    customerAnswers: state.answers,
    includedItems: quote.includedItems,
    quotationOnlyItems: quote.quotationOnlyItems,
    oneTimeSubtotal: quote.oneTimeSubtotal,
    recurringMonthlySubtotal: quote.recurringMonthlySubtotal,
    vat: quote.vat,
    totalEstimate: quote.totalEstimate,
    deposit: quote.deposit,
    siteConfirmationItems: quote.siteConfirmationItems,
    quoteLines: quote.lines,
    consentRecords: [
      {
        label: 'Permission to contact customer about this configuration',
        accepted: state.customer.consentToContact,
        timestamp,
      },
    ],
  }
}

export function loadSavedConfiguratorSubmission() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const saved = window.localStorage.getItem(getSubmittedConfigurationStorageKey())
    return saved ? (JSON.parse(saved) as WizardSubmission) : null
  } catch {
    return null
  }
}

function createConfigurationId() {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase()

  return `CM-${new Date().getFullYear()}-${suffix}`
}
