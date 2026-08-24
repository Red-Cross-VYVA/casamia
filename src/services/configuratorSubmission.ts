import {
  mockAirtableConfiguratorAdapter,
  mockEmailConfiguratorAdapter,
} from './configuratorAdapters'
import { calculateConfiguratorQuote } from './configuratorPricing'
import { hasPublicSiteApi, postPublicSiteJson } from './publicSiteApi'
import { getSubmittedConfigurationStorageKey } from '../context/ConfiguratorContext'
import type { ConfiguratorState, WizardSubmission } from '../types/configurator'
import { createVisitCheckout } from './visitCheckout.ts'

export async function submitConfiguratorRequest(state: ConfiguratorState, locale?: string) {
  const submission = createWizardSubmission(state, 'web-configurator', locale)
  const saved = await mockAirtableConfiguratorAdapter.saveSubmission(submission)
  await mockEmailConfiguratorAdapter.sendConfirmation(submission)
  await saveConfiguratorOrder(submission, 'Quote requested', 'quote-request')

  return { submission, saved }
}

export async function createPaidVisitCheckout(state: ConfiguratorState, locale?: string) {
  const submission = createWizardSubmission(state, 'web-configurator-visit-payment', locale)
  await mockAirtableConfiguratorAdapter.saveSubmission(submission)
  await mockEmailConfiguratorAdapter.sendConfirmation(submission)
  await saveConfiguratorOrder(submission, 'Visit payment pending', 'stripe-checkout')

  return createVisitCheckout(submission.configurationId, submission.locale)
}

async function saveConfiguratorOrder(
  submission: WizardSubmission,
  status: 'Quote requested' | 'Visit payment pending',
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

export function createWizardSubmission(state: ConfiguratorState, source: string, locale?: string): WizardSubmission {
  const quote = calculateConfiguratorQuote(state)
  const timestamp = new Date().toISOString()

  return {
    configurationId: createConfigurationId(),
    locale: normalizeLocale(locale || state.customer.preferredLanguage),
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
    visitFee: quote.visitFee,
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

function normalizeLocale(value: string) {
  const normalized = value.trim().toLowerCase()
  return normalized.startsWith('es') || normalized.startsWith('spa') ? 'es' : 'en'
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
