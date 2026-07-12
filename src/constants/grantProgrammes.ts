export type GrantProgrammeStatus = 'open' | 'closed' | 'announced' | 'awaiting-publication'
export type GrantTranslationStatus = 'source' | 'review-required' | 'approved'
export type GrantPublicationStatus = 'draft' | 'published' | 'archived'

export type GrantProgramme = {
  applicationPaymentTiming: string
  authority: string
  casamiaCommentary: string
  closingDate: string
  compatibility: string
  contentOwner: string
  eligibleApplicants: string
  eligibleProperties: string
  eligibleWork: string
  exclusions: string
  fundingCalculation: string
  fundingExhaustionWarning: string
  id: string
  lastVerifiedDate: string
  locale: 'en' | 'es'
  maximumAmountOrPercentage: string
  nextReviewDate: string
  officialName: string
  officialSource: string
  openingDate: string
  publicationStatus: GrantPublicationStatus
  status: GrantProgrammeStatus
  territory: string
  translationStatus: GrantTranslationStatus
}

export const grantServiceRoles = [
  'General information about possible public assistance routes.',
  'Initial eligibility screening based on information provided by the customer.',
  'Help preparing a document checklist for a specific programme.',
  'Application-preparation support where the programme and customer circumstances are suitable.',
  'Submission as an authorised representative only with a separate written mandate.',
  'Referral to an independent adviser or gestor where specialist advice is needed.',
]

export const grantDocumentChecklist = [
  'Identity documentation.',
  'Proof of residence.',
  'Ownership or tenancy documentation.',
  'Property-community approval where required.',
  'Income information where the programme requests it.',
  'Disability or dependency documentation where relevant.',
  'Project quotation.',
  'Invoices and payment evidence.',
  'Technical reports.',
  'Bank-account certificate.',
]

export const grantProgrammes: GrantProgramme[] = []

export function isGrantProgrammeExpired(programme: GrantProgramme, today = new Date()) {
  if (!programme.closingDate) return false
  return new Date(`${programme.closingDate}T23:59:59`) < today
}

export function isGrantProgrammeReviewOverdue(programme: GrantProgramme, today = new Date()) {
  return new Date(`${programme.nextReviewDate}T23:59:59`) < today
}

export function canPublishGrantProgramme(programme: GrantProgramme, today = new Date()) {
  return Boolean(
    programme.officialSource &&
      programme.lastVerifiedDate &&
      programme.publicationStatus === 'published' &&
      programme.translationStatus === 'approved' &&
      !isGrantProgrammeReviewOverdue(programme, today),
  )
}

export function getPublishedGrantProgrammes(locale: string) {
  return grantProgrammes.filter((programme) => programme.locale === locale && canPublishGrantProgramme(programme))
}
