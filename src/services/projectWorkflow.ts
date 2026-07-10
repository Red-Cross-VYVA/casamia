export type ProjectStatus =
  | 'awaiting-installation'
  | 'installation-in-progress'
  | 'inspection-required'
  | 'material-defect-identified'
  | 'minor-items-outstanding'
  | 'successfully-installed'
  | 'final-payment-due'
  | 'completed'

export type InstallationAcceptanceRecord = {
  casamiaValidation?: {
    authorisedStaffId: string
    reason?: string
    timestamp: string
  }
  correctionDeadlines: Array<{ item: string; deadline: string }>
  customerAcceptance?: {
    accepted: boolean
    authorisedPersonName: string
    timestamp: string
  }
  customerComments?: string
  documentVersion: string
  documentsDelivered: string[]
  essentialScopeComplete: boolean
  instructionsDelivered: boolean
  installationDate: string
  locale: string
  materialDefects: string[]
  minorOutstandingItems: string[]
  productsInstalled: string[]
  projectReference: string
  providerCompany: string
  providerConfirmation?: {
    name: string
    timestamp: string
  }
  requiredTestsPassed: boolean
  safetyAndFunctionalTests: Array<{ name: string; passed: boolean; notes?: string }>
  scopeCompleted: string[]
  scopeNotCompleted: string[]
  siteSafe: boolean
  technicianIdentity: string
}

export type FinalPaymentOverride = {
  authorisedStaffId: string
  reason: string
  timestamp: string
}

export type ChangeOrderRecord = {
  acceptanceWording: string
  conditionDiscovered: string
  customerDecision?: 'accepted' | 'rejected'
  documentVersion: string
  emergencyActionOnly?: boolean
  locale: string
  originalScope: string
  priceAdjustment: number
  proposedWork: string
  providerCannotApproveCommercialChange: true
  reasonForChange: string
  safetyImpact: string
  scheduleImpact: string
  timestamp: string
  vatAdjustment: number
}

export function canMarkSuccessfullyInstalled(record: InstallationAcceptanceRecord) {
  return (
    record.essentialScopeComplete &&
    record.requiredTestsPassed &&
    record.siteSafe &&
    record.instructionsDelivered &&
    record.materialDefects.length === 0
  )
}

export function nextStatusAfterInstallationAcceptance(record: InstallationAcceptanceRecord): ProjectStatus {
  if (record.materialDefects.length > 0) return 'material-defect-identified'
  if (!record.essentialScopeComplete || !record.requiredTestsPassed || !record.siteSafe) return 'inspection-required'
  if (record.minorOutstandingItems.length > 0) return 'minor-items-outstanding'
  return canMarkSuccessfullyInstalled(record) ? 'successfully-installed' : 'inspection-required'
}

export function canTriggerFinalPayment(status: ProjectStatus, override?: FinalPaymentOverride) {
  if (status === 'successfully-installed') return true
  if (!override) return false

  return Boolean(
    override.authorisedStaffId &&
      override.reason &&
      !['inspection-required', 'material-defect-identified'].includes(status),
  )
}

export function canProceedWithChangeOrder(record: ChangeOrderRecord) {
  return record.emergencyActionOnly === true || record.customerDecision === 'accepted'
}

export const installationAcceptanceApiContract = {
  endpoint: 'POST /api/projects/{projectReference}/installation-acceptance',
  rule:
    'A customer signature alone cannot create successful-installation status when material defects or failed safety tests are recorded.',
  schemaProposal:
    'installation_acceptance(project_reference, installation_date, provider_company, technician_identity, scope_completed_json, scope_not_completed_json, products_installed_json, tests_json, documents_delivered_json, material_defects_json, customer_acceptance_json, provider_confirmation_json, casamia_validation_json, locale, document_version)',
} as const

export const finalPaymentApiContract = {
  endpoint: 'POST /api/projects/{projectReference}/final-payment-activation',
  rule:
    'Only CasaMia staff may activate final payment, and only from successfully-installed unless an authorised audited override is allowed by policy.',
} as const

export const changeOrderApiContract = {
  endpoint: 'POST /api/projects/{projectReference}/change-orders',
  rule:
    'No additional paid work proceeds without recorded customer acceptance, except emergency action required to prevent immediate damage.',
  schemaProposal:
    'change_orders(id, project_reference, original_scope, condition_discovered, reason_for_change, proposed_work, price_adjustment, vat_adjustment, schedule_impact, safety_impact, customer_decision, acceptance_wording, locale, timestamp, document_version)',
} as const
