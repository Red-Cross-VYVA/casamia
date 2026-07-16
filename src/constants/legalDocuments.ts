import { casamiaCompanyConfig, legalVersionConfig } from '../config/company'

export type LegalDocumentId =
  | 'legal-notice'
  | 'general-customer-terms'
  | 'privacy-policy'
  | 'cookie-policy'
  | 'withdrawal-cancellation'
  | 'guarantees-aftercare'
  | 'complaints-contact'
  | 'accessibility-statement'

export type LegalReviewStatus = 'draft' | 'pending-legal-review' | 'approved' | 'superseded'

export type LegalDocument = {
  id: LegalDocumentId
  title: string
  intro: string
  reviewStatus: LegalReviewStatus
  sections: Array<{
    title: string
    body?: string
    points?: string[]
  }>
}

export const legalRouteLabels: Array<{ id: LegalDocumentId; label: string; path: string }> = [
  { id: 'legal-notice', label: 'Legal Notice', path: '/legal-notice' },
  { id: 'general-customer-terms', label: 'General Customer Terms', path: '/general-customer-terms' },
  { id: 'privacy-policy', label: 'Privacy Policy', path: '/privacy-policy' },
  { id: 'cookie-policy', label: 'Cookie Policy', path: '/cookie-policy' },
  { id: 'withdrawal-cancellation', label: 'Withdrawal and Cancellation Policy', path: '/withdrawal-cancellation' },
  { id: 'guarantees-aftercare', label: 'Guarantees and Aftercare', path: '/guarantees-aftercare' },
  { id: 'complaints-contact', label: 'Complaints and Contact', path: '/complaints-contact' },
  { id: 'accessibility-statement', label: 'Accessibility Statement', path: '/accessibility-statement' },
]

const configPoints = [
  `Legal name: ${casamiaCompanyConfig.legalName}`,
  `Commercial name: ${casamiaCompanyConfig.commercialName}`,
  `NIF: ${casamiaCompanyConfig.nif}`,
  `Registered address: ${casamiaCompanyConfig.registeredAddress}`,
  `Registry details: ${casamiaCompanyConfig.registryDetails}`,
]

export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  'legal-notice': {
    id: 'legal-notice',
    intro:
      'This notice identifies the operator of the website and records company details that must be completed before production publication.',
    reviewStatus: 'pending-legal-review',
    title: 'Legal Notice',
    sections: [
      {
        title: 'Company identification',
        points: configPoints,
      },
      {
        title: 'Contracting model',
        body:
          'CasaMia is intended to contract directly with customers, collect customer payments, coordinate the project, and appoint vetted local providers as subcontractors where needed.',
      },
      {
        title: 'Legal review required',
        body:
          'This page contains placeholders and must be completed with verified company, registry, tax and contact details before production use.',
      },
    ],
  },
  'general-customer-terms': {
    id: 'general-customer-terms',
    intro:
      'These customer terms summarise the operating model. They are not a substitute for final Spanish legal review of the complete contract set.',
    reviewStatus: 'pending-legal-review',
    title: 'General Customer Terms',
    sections: [
      {
        title: 'Who you contract with',
        body:
          'You contract directly with CasaMia. CasaMia assesses requirements, prepares the proposal, collects payments, coordinates the work and remains responsible for the contracted service.',
      },
      {
        title: 'Local professionals',
        body:
          'CasaMia may appoint a vetted local professional to carry out installation work. The professional acts as CasaMia subcontractor and is not authorised to contract with you or request payment from you.',
      },
      {
        title: 'Payments',
        points: [
          '50% of the total price is payable when confirming the order.',
          'The remaining 50% is payable following successful installation.',
          'The first 50% is a payment on account, not an automatically non-refundable deposit.',
          'Additional work requires a written change order accepted by the customer before the work is performed.',
        ],
      },
      {
        title: 'Successful installation',
        body:
          'Installation is considered successfully completed when the essential agreed work has been completed, the applicable functional and safety checks have been passed, the work area has been left safe and reasonably clean, the customer has received the relevant instructions, and no material defect prevents the safe intended use of the installation.',
      },
      {
        title: 'Statutory rights',
        body:
          'Signing the installation record does not remove your statutory guarantee rights or prevent you from reporting hidden defects.',
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    intro:
      'This privacy policy explains the intended data roles and processing activities. Final controller details, retention periods and processors must be confirmed.',
    reviewStatus: 'pending-legal-review',
    title: 'Privacy Policy',
    sections: [
      {
        title: 'Controller',
        body:
          'CasaMia is normally the data controller for assessment, contracting, installation coordination and aftercare information.',
      },
      {
        title: 'Data used',
        points: [
          'Contact details, installation address and communication preferences.',
          'Assessment notes, room risks, access requirements and selected service details.',
          'Property photographs where the customer provides them.',
          'Accessibility or mobility information needed to assess and deliver the service.',
          'Payment status information from the selected payment provider. CasaMia must not store complete card numbers or CVV.',
        ],
      },
      {
        title: 'Sharing with providers',
        body:
          'Assigned providers should receive only the information necessary for the assigned project and must not use it for their own commercial purposes.',
      },
      {
        title: 'Privacy contact',
        body: `Privacy contact: ${casamiaCompanyConfig.privacyEmail}.`,
      },
    ],
  },
  'cookie-policy': {
    id: 'cookie-policy',
    intro:
      'This cookie policy records the expected consent approach. Non-essential cookies must stay disabled until consent.',
    reviewStatus: 'pending-legal-review',
    title: 'Cookie Policy',
    sections: [
      {
        title: 'Choice',
        points: [
          'Cookie controls should provide equally prominent Accept all, Reject all and Configure options.',
          'Rejecting non-essential cookies must not be harder than accepting them.',
          'Language preference storage must not require marketing-cookie consent.',
        ],
      },
      {
        title: 'Current implementation note',
        body:
          'A complete cookie banner and preference centre must be validated before production if analytics or advertising cookies are enabled.',
      },
    ],
  },
  'withdrawal-cancellation': {
    id: 'withdrawal-cancellation',
    intro:
      'This page explains withdrawal and cancellation principles for eligible distance and off-premises contracts.',
    reviewStatus: 'pending-legal-review',
    title: 'Withdrawal and Cancellation Policy',
    sections: [
      {
        title: 'Withdrawal period',
        points: [
          'Eligible distance and off-premises contracts generally have a 14-day withdrawal right.',
          'A 30-day period may apply to contracts resulting from unsolicited home visits or promotional excursions.',
          'CasaMia policy should prohibit unsolicited pressure selling at the home.',
        ],
      },
      {
        title: 'Early start',
        body:
          'If the customer expressly asks CasaMia to start services during the withdrawal period, the customer may have to pay a proportionate amount for validly requested work already performed if they later withdraw.',
      },
      {
        title: 'Personalised goods',
        body:
          'Exceptions for clearly personalised goods may apply only to genuinely customised items explained before contracting.',
      },
      {
        title: 'How to withdraw',
        body: `Use the public withdrawal form at /withdrawal-form, contact customer service at ${casamiaCompanyConfig.customerServiceEmail}, or write by post to ${casamiaCompanyConfig.registeredAddress}. Backend receipt must be configured before online submission is treated as durable legal receipt.`,
      },
    ],
  },
  'guarantees-aftercare': {
    id: 'guarantees-aftercare',
    intro:
      'This page explains how product, installation and workmanship issues should be handled after installation.',
    reviewStatus: 'pending-legal-review',
    title: 'Guarantees and Aftercare',
    sections: [
      {
        title: 'CasaMia remains your point of contact',
        body:
          'CasaMia remains your point of contact for product, installation and workmanship issues. We will not require you to pursue the subcontractor or manufacturer before CasaMia reviews your claim.',
      },
      {
        title: 'Rights and guarantees',
        points: [
          'Statutory product-conformity rights are mandatory rights and are not optional benefits.',
          'CasaMia remains responsible for installation included in its contract with the customer.',
          `Additional workmanship guarantee period: ${casamiaCompanyConfig.workmanshipGuaranteePeriod}.`,
        ],
      },
      {
        title: 'Dangerous defects',
        body:
          'If an installation appears loose, unstable, electrically unsafe or otherwise dangerous, stop using it and contact CasaMia immediately. In an emergency, call 112.',
      },
    ],
  },
  'complaints-contact': {
    id: 'complaints-contact',
    intro:
      'Use this page for service issues, safety concerns, complaints and aftercare questions.',
    reviewStatus: 'pending-legal-review',
    title: 'Complaints and Contact',
    sections: [
      {
        title: 'Customer service',
        points: [
          `Telephone: ${casamiaCompanyConfig.customerServicePhone}`,
          `Email: ${casamiaCompanyConfig.customerServiceEmail}`,
          `Hours: ${casamiaCompanyConfig.customerServiceHours}`,
          `Postal complaints address: ${casamiaCompanyConfig.complaintsAddress}`,
        ],
      },
      {
        title: 'What to include',
        points: [
          'Project reference or order number.',
          'Customer name and installation address.',
          'Description of the issue and when it appeared.',
          'Photos or documents where useful.',
          'Whether there is any immediate safety risk.',
        ],
      },
      {
        title: 'Safety escalation',
        body:
          'If an installation appears loose, unstable, electrically unsafe or otherwise dangerous, stop using it and contact CasaMia immediately. In an emergency, call 112.',
      },
      {
        title: 'Dispute resolution',
        body: `Alternative dispute-resolution status: ${casamiaCompanyConfig.adrEntityOrStatus}. Administrative and court rights remain available.`,
      },
    ],
  },
  'accessibility-statement': {
    id: 'accessibility-statement',
    intro:
      'CasaMia serves senior customers and families, so accessibility is treated as a core service requirement.',
    reviewStatus: 'pending-legal-review',
    title: 'Accessibility Statement',
    sections: [
      {
        title: 'Current commitment',
        points: [
          'Use plain language for important legal, payment and safety information.',
          'Support keyboard navigation and visible focus states.',
          'Use readable text sizes and sufficient contrast.',
          'Avoid countdown timers, pressure tactics and information conveyed only by colour.',
          'Provide telephone-assisted contracting where needed.',
        ],
      },
      {
        title: 'Feedback',
        body: `Accessibility feedback can be sent to ${casamiaCompanyConfig.customerServiceEmail}.`,
      },
    ],
  },
}

export function getLegalDocumentMeta(document: LegalDocument) {
  return {
    document: document.id,
    effectiveDate: legalVersionConfig.effectiveDate,
    locale: 'en',
    reviewStatus: document.reviewStatus,
    sourceLocale: legalVersionConfig.sourceLocale,
    sourceVersion: legalVersionConfig.sourceVersion,
    version: legalVersionConfig.version,
  }
}
