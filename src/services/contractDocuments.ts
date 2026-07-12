import type { ConsentEvidencePayload } from './consentEvidence'
import { casamiaCompanyConfig, legalVersionConfig } from '../config/company'

export type CheckoutDocumentOrder = {
  address: string
  city: string
  contractLanguage: string
  createdAt: string
  customerReference: string
  email: string
  initialPayment: string
  name: string
  orderId: string
  paymentMethod: string
  phone: string
  planLabel: string
  planPrice: string
  postcode: string
  remainingPayment: string
}

export type CheckoutDownloadDocument = {
  content: string
  filename: string
  title: string
}

export function buildCheckoutDocumentSet(
  order: CheckoutDocumentOrder,
  consents: ConsentEvidencePayload[],
): CheckoutDownloadDocument[] {
  const commonHeader = [
    `${casamiaCompanyConfig.commercialName} order document`,
    `Legal entity: ${casamiaCompanyConfig.legalName}`,
    `Order reference: ${order.orderId}`,
    `Contract language: ${order.contractLanguage}`,
    `Document version: ${legalVersionConfig.version}`,
    `Created: ${order.createdAt}`,
    '',
  ].join('\n')

  return [
    {
      filename: `${order.orderId}-project-order.txt`,
      title: 'Project Order',
      content: `${commonHeader}Customer: ${order.name}
Contact: ${order.email || order.phone}
Installation address: ${order.address}, ${order.postcode} ${order.city}
Package: ${order.planLabel}
Total price: ${order.planPrice}
Initial payment requested: ${order.initialPayment}
Remaining payment after successful installation: ${order.remainingPayment}
Payment method selected: ${order.paymentMethod}
`,
    },
    {
      filename: `${order.orderId}-accepted-quotation.txt`,
      title: 'Accepted quotation',
      content: `${commonHeader}Accepted package: ${order.planLabel}
Accepted total: ${order.planPrice}
Payment schedule: 50% after order confirmation, 50% after successful installation.
`,
    },
    {
      filename: `${order.orderId}-withdrawal-information.txt`,
      title: 'Withdrawal information and form',
      content: `${commonHeader}Withdrawal contact email: ${casamiaCompanyConfig.customerServiceEmail}
Postal withdrawal address: ${casamiaCompanyConfig.registeredAddress}
Online withdrawal form: /withdrawal-form

I/we hereby give notice that I/we withdraw from my/our contract for the following order:
Order reference:
Customer name:
Installation address:
Date:
Signature if printed:
`,
    },
    {
      filename: `${order.orderId}-consent-confirmations.txt`,
      title: 'Consent confirmations',
      content: `${commonHeader}${consents
        .map(
          (consent) => `Consent type: ${consent.consentType}
Wording version: ${consent.wordingVersion}
Terms version: ${consent.documentVersions.generalTermsVersion}
Project order version: ${consent.documentVersions.projectOrderVersion}
Locale: ${consent.locale}
Contract language: ${consent.contractLanguage}
Timestamp: ${consent.timestamp}
Wording: ${consent.wording}`,
        )
        .join('\n\n')}`,
    },
    {
      filename: `${order.orderId}-payment-confirmation.txt`,
      title: 'Payment confirmation',
      content: `${commonHeader}Payment method selected: ${order.paymentMethod}
Initial amount payable now: ${order.initialPayment}
No card or bank payment has been processed by this local checkout unless the configured payment provider confirms it.
`,
    },
  ]
}

export function downloadTextDocument(document: CheckoutDownloadDocument) {
  const blob = new Blob([document.content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = document.filename
  link.click()
  URL.revokeObjectURL(url)
}
