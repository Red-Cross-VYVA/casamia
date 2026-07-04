import {
  assessmentPlan,
  defaultGrantNote,
  getDefaultPaymentTerms,
  homeSafetyPlan,
  smartSafetyPlan,
  type ProposalData,
  type ProposalLineItem,
  type ProposalPlan,
} from './proposalCalculations'

const proposalStorageKey = 'casamia_internal_proposals_v1'

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function addDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)

  return date.toISOString().slice(0, 10)
}

export function createProposalId() {
  const compactDate = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 5).toUpperCase()
      : Math.random().toString(36).slice(2, 7).toUpperCase()

  return `CM-${compactDate}-${suffix}`
}

export function createLineItem(patch: Partial<ProposalLineItem> = {}): ProposalLineItem {
  return {
    category: 'General',
    description: '',
    grantEligible: false,
    id: `line-${createProposalId()}`,
    name: '',
    priority: 'Medium',
    quantity: 1,
    unitPrice: 0,
    ...patch,
  }
}

export function createEmptyProposal(patch: Partial<ProposalData> = {}): ProposalData {
  const today = new Date().toISOString().slice(0, 10)
  const selectedPlan = (patch.selectedPlan ?? homeSafetyPlan) as ProposalPlan

  return {
    acceptanceDate: '',
    acceptanceStatus: 'Not Sent',
    acceptedBy: '',
    address: '',
    area: '',
    createdAt: new Date().toISOString(),
    customerName: '',
    email: '',
    executiveSummary:
      'Casamia reviewed the home safety priorities and prepared this proposal to reduce risk, improve comfort, and support safer independent living.',
    grantEligibilityNote: defaultGrantNote,
    grantSupportRequired: false,
    id: createProposalId(),
    inspectionReference: '',
    lineItems: [],
    overallRiskLevel: 'Moderate',
    paymentTerms: getDefaultPaymentTerms(selectedPlan),
    phone: '',
    preparedBy: 'Casamia Operations',
    proposalDate: today,
    safetyScore: '7',
    selectedPlan,
    status: 'Draft',
    timelineDuration: '1-2 days',
    timelineNotes: '',
    timelineStartDate: addDays(7),
    updatedAt: new Date().toISOString(),
    validUntil: addDays(14),
    ...patch,
  }
}

export const mockProposals: ProposalData[] = [
  createEmptyProposal({
    area: 'Madrid - Chamberi',
    customerName: 'Elena Martin',
    id: 'CM-MOCK-1001',
    lineItems: [
      createLineItem({
        category: 'Bathroom',
        grantEligible: true,
        name: 'Grab bar installation',
        priority: 'High',
        quantity: 4,
        unitPrice: 95,
      }),
      createLineItem({
        category: 'Stairways',
        grantEligible: true,
        name: 'Handrail installation',
        priority: 'Immediate',
        quantity: 1,
        unitPrice: 420,
      }),
    ],
    selectedPlan: homeSafetyPlan,
    status: 'Sent',
  }),
  createEmptyProposal({
    area: 'Valencia - Ruzafa',
    customerName: 'Javier Ruiz',
    id: 'CM-MOCK-1002',
    lineItems: [
      createLineItem({
        category: 'Smart Safety',
        description: 'Motion lighting and emergency alert setup.',
        grantEligible: false,
        name: 'Smart safety starter setup',
        priority: 'High',
        quantity: 1,
        unitPrice: 680,
      }),
    ],
    selectedPlan: smartSafetyPlan,
    status: 'Deposit Paid',
  }),
  createEmptyProposal({
    area: 'Malaga - Este',
    customerName: 'Carmen Lopez',
    id: 'CM-MOCK-1003',
    lineItems: [
      createLineItem({
        category: 'General',
        name: 'Home safety inspection and written report',
        priority: 'Medium',
        quantity: 1,
        unitPrice: 89,
      }),
    ],
    selectedPlan: assessmentPlan,
    status: 'Accepted',
  }),
]

export function loadSavedProposals() {
  const storage = getStorage()
  const saved = storage?.getItem(proposalStorageKey)

  if (!saved) {
    return []
  }

  try {
    return JSON.parse(saved) as ProposalData[]
  } catch {
    return []
  }
}

export function loadAllProposals() {
  const saved = loadSavedProposals()
  const savedIds = new Set(saved.map((proposal) => proposal.id))

  return [...saved, ...mockProposals.filter((proposal) => !savedIds.has(proposal.id))]
}

export function saveProposal(proposal: ProposalData) {
  const storage = getStorage()

  if (!storage) {
    return proposal
  }

  const saved = loadSavedProposals()
  const nextProposal = {
    ...proposal,
    updatedAt: new Date().toISOString(),
  }
  const exists = saved.some((item) => item.id === proposal.id)
  const next = exists
    ? saved.map((item) => (item.id === proposal.id ? nextProposal : item))
    : [nextProposal, ...saved]

  storage.setItem(proposalStorageKey, JSON.stringify(next))

  return nextProposal
}

export function loadProposalById(proposalId: string) {
  return loadAllProposals().find((proposal) => proposal.id === proposalId)
}

export function duplicateProposal(proposal: ProposalData) {
  return createEmptyProposal({
    ...proposal,
    acceptanceDate: '',
    acceptanceStatus: 'Not Sent',
    acceptedBy: '',
    createdAt: new Date().toISOString(),
    id: createProposalId(),
    lineItems: proposal.lineItems.map((item) => createLineItem({ ...item })),
    status: 'Draft',
    updatedAt: new Date().toISOString(),
  })
}
