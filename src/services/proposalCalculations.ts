export const assessmentPlan = 'Home Assessment Plan'
export const homeSafetyPlan = 'Home Safety Plan'
export const smartSafetyPlan = 'Smart Safety Plan'
export const unsurePlan = 'Not sure yet'

export const planOptions = [
  assessmentPlan,
  homeSafetyPlan,
  smartSafetyPlan,
  unsurePlan,
] as const

export const proposalCategories = [
  'Bathroom',
  'Bedroom',
  'Kitchen',
  'Living Room',
  'Hallways',
  'Stairways',
  'Entryway',
  'Outdoor Areas',
  'Smart Safety',
  'General',
] as const

export const proposalPriorities = ['Immediate', 'High', 'Medium', 'Low'] as const
export const proposalStatuses = ['Draft', 'Sent', 'Accepted', 'Deposit Paid', 'Scheduled', 'Completed'] as const
export const acceptanceStatuses = ['Not Sent', 'Sent', 'Accepted', 'Declined'] as const
export const riskLevels = ['Low', 'Moderate', 'High', 'Critical'] as const

export type ProposalAcceptanceStatus = (typeof acceptanceStatuses)[number]
export type ProposalCategory = (typeof proposalCategories)[number]
export type ProposalLineItemPriority = (typeof proposalPriorities)[number]
export type ProposalPlan = (typeof planOptions)[number]
export type ProposalRiskLevel = (typeof riskLevels)[number]
export type ProposalStatus = (typeof proposalStatuses)[number]

export type ProposalLineItem = {
  category: ProposalCategory
  description: string
  grantEligible: boolean
  id: string
  name: string
  priority: ProposalLineItemPriority
  quantity: number
  unitPrice: number
}

export type ProposalData = {
  acceptanceDate: string
  acceptanceStatus: ProposalAcceptanceStatus
  acceptedBy: string
  address: string
  area: string
  createdAt: string
  customerName: string
  email: string
  executiveSummary: string
  grantEligibilityNote: string
  grantSupportRequired: boolean
  id: string
  inspectionReference: string
  lineItems: ProposalLineItem[]
  overallRiskLevel: ProposalRiskLevel
  paymentTerms: string
  phone: string
  preparedBy: string
  proposalDate: string
  publicToken?: string
  safetyScore: string
  selectedPlan: ProposalPlan
  status: ProposalStatus
  timelineDuration: string
  timelineNotes: string
  timelineStartDate: string
  updatedAt: string
  validUntil: string
}

export type ProposalTotals = {
  balanceDue: number
  depositDue: number
  grantEligibleAmount: number
  subtotal: number
  totalEstimate: number
}

export const serviceSuggestions = [
  'Grab bar installation',
  'Handrail installation',
  'Anti-slip flooring solution',
  'Lighting upgrade',
  'Threshold modification',
  'Ramp/access improvement',
  'Doorway widening',
  'Furniture anchoring',
  'Water sensor installation',
  'Motion lighting setup',
  'Emergency alert device setup',
  'Health monitoring setup',
]

export const defaultGrantNote =
  'Casamia may support the grant application process where applicable. Grant approval is determined solely by the relevant authority and cannot be guaranteed.'

export const hiddenFeeReassurance = 'No hidden fees. No work begins without customer approval.'

export function getDefaultPaymentTerms(plan: ProposalPlan) {
  if (plan === assessmentPlan) {
    return '100% payable upon booking.'
  }

  if (plan === smartSafetyPlan) {
    return '50% deposit upon quotation acceptance. 50% upon completion, system commissioning, and customer acceptance.'
  }

  return '50% deposit upon quotation acceptance. 50% upon completion and customer acceptance.'
}

export function calculateLineTotal(item: ProposalLineItem) {
  return safeNumber(item.quantity) * safeNumber(item.unitPrice)
}

export function calculateProposalTotals(proposal: ProposalData): ProposalTotals {
  const subtotal = proposal.lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0)
  const grantEligibleAmount = proposal.lineItems.reduce(
    (sum, item) => sum + (item.grantEligible ? calculateLineTotal(item) : 0),
    0,
  )
  const depositDue = proposal.selectedPlan === assessmentPlan ? subtotal : subtotal * 0.5

  return {
    balanceDue: Math.max(subtotal - depositDue, 0),
    depositDue,
    grantEligibleAmount,
    subtotal,
    totalEstimate: subtotal,
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-GB', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number.isFinite(value) ? value : 0)
}

export function safeNumber(value: number | string) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value)

  return Number.isFinite(parsed) ? parsed : 0
}
