import {
  mockAirtableConfiguratorAdapter,
  mockEmailConfiguratorAdapter,
  mockStripeConfiguratorAdapter,
} from './configuratorAdapters'
import { calculateConfiguratorQuote } from './configuratorPricing'
import { getSubmittedConfigurationStorageKey } from '../context/ConfiguratorContext'
import type { ConfiguratorState, WizardSubmission } from '../types/configurator'

export async function submitConfiguratorRequest(state: ConfiguratorState) {
  const submission = createWizardSubmission(state, 'web-configurator')
  const saved = await mockAirtableConfiguratorAdapter.saveSubmission(submission)
  await mockEmailConfiguratorAdapter.sendConfirmation(submission)

  return { submission, saved }
}

export async function createMockDepositCheckout(state: ConfiguratorState) {
  const submission = createWizardSubmission(state, 'web-configurator-deposit')
  await mockAirtableConfiguratorAdapter.saveSubmission(submission)
  await mockEmailConfiguratorAdapter.sendConfirmation(submission)

  return mockStripeConfiguratorAdapter.createDepositCheckout(submission)
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
