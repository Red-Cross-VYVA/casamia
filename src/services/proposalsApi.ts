import {
  calculateLineTotal,
  calculateProposalTotals,
  getDefaultPaymentTerms,
  homeSafetyPlan,
  planOptions,
  type ProposalData,
  type ProposalLineItem,
  type ProposalPlan,
  type ProposalStatus,
} from './proposalCalculations'
import {
  createEmptyProposal,
  createLineItem,
  loadAllProposals,
  loadProposalById,
  saveProposal,
} from './proposalsStorage'
import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth.ts'
import {
  buildPlansBuilderGroups,
  calculatePlansBuilderEstimate,
  type PlansBuilderSelectionState,
} from './plansBuilderPricing.ts'
import { getServiceCatalogue } from './serviceCatalogue.ts'
import type { EditableServiceCatalogue } from '../types/serviceCatalogue.ts'

type BackendLineItem = {
  category?: string
  description?: string
  grant_eligible?: boolean
  grantEligible?: boolean
  id?: number | string
  name?: string
  priority?: string
  quantity?: number | string
  source?: 'catalogue' | 'manual'
  source_outcome_id?: string
  source_package_id?: string
  sourceOutcomeId?: string
  sourcePackageId?: string
  total?: number | string
  unit_price?: number | string
  unitPrice?: number | string
}

type BackendProposal = {
  acceptance_date?: string
  acceptance_status?: string
  accepted_by?: string
  address?: string
  area?: string
  balance_due?: number | string
  created_at?: string
  customer_email?: string
  customer_name?: string
  customer_phone?: string
  deposit_due?: number | string
  email?: string
  events?: unknown[]
  executive_summary?: string
  grant_eligibility_note?: string
  grant_eligible_amount?: number | string
  grant_support_required?: boolean
  id?: number | string
  inspection_reference?: string
  line_items?: BackendLineItem[]
  notes?: string
  overall_risk_level?: string
  payment_terms?: string
  phone?: string
  plan?: string
  prepared_by?: string
  proposal_date?: string
  public_token?: string
  safety_score?: number | string
  selected_plan?: string
  status?: string
  subtotal?: number | string
  timeline_duration?: string
  timeline_notes?: string
  timeline_start_date?: string
  total?: number | string
  total_estimate?: number | string
  updated_at?: string
  valid_until?: string
}

type BackendActionResponse = BackendProposal & {
  ok?: boolean
}

export type PublicProposalDraftPayload = {
  companyWebsite?: string
  consent: boolean
  customer: {
    address?: string
    area?: string
    email: string
    name: string
    phone?: string
  }
  language: 'en' | 'es'
  selection: PlansBuilderSelectionState
  website?: string
}

export type PublicProposalDraftResponse = {
  proposal: ProposalData
  publicToken: string
  publicUrl: string
}

const apiBaseUrl = (
  import.meta.env.VITE_PROPOSALS_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''
).replace(/\/$/, '')

function backendAvailable() {
  return Boolean(apiBaseUrl) || Boolean(import.meta.env.PROD)
}

function internalHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...getInternalAuthHeaders(),
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}) {
  if (!backendAvailable()) {
    throw new Error('Proposal backend is not configured.')
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Proposal API request failed with ${response.status}.`)
  }

  return response.json() as Promise<T>
}

function normalisePlan(plan?: string): ProposalPlan {
  if (!plan) {
    return 'To be confirmed'
  }

  if (planOptions.includes(plan as ProposalPlan)) {
    return plan as ProposalPlan
  }

  if (plan === 'Advanced' || plan === 'Home Safety' || plan === 'Home Safety Plan') {
    return 'Home adaptations'
  }

  if (plan === 'Premium' || plan === 'Smart Safety' || plan === 'Smart Safety Plan') {
    return 'Connected safety'
  }

  if (plan === 'Essential' || plan === 'Home Assessment' || plan === 'Home Assessment Plan') {
    return 'Assessment visit'
  }

  return 'To be confirmed'
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function safeNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '0'))

  return Number.isFinite(parsed) ? parsed : 0
}

function normaliseStatus(status?: string): ProposalStatus {
  if (
    status === 'Draft' ||
    status === 'Sent' ||
    status === 'Accepted' ||
    status === 'Deposit Paid' ||
    status === 'Scheduled' ||
    status === 'Completed'
  ) {
    return status
  }

  return 'Draft'
}

export function toBackendProposal(proposal: ProposalData) {
  const totals = calculateProposalTotals(proposal)

  return {
    id: proposal.id,
    accepted_by: proposal.acceptedBy,
    acceptance_date: proposal.acceptanceDate,
    acceptance_status: proposal.acceptanceStatus,
    address: [proposal.address, proposal.area].filter(Boolean).join(', '),
    area: proposal.area,
    balance_due: totals.balanceDue,
    customer_email: proposal.email,
    customer_name: proposal.customerName,
    customer_phone: proposal.phone,
    deposit_due: totals.depositDue,
    executive_summary: proposal.executiveSummary,
    grant_eligibility_note: proposal.grantEligibilityNote,
    grant_eligible_amount: totals.grantEligibleAmount,
    grant_support_required: proposal.grantSupportRequired,
    inspection_reference: proposal.inspectionReference,
    notes: proposal.executiveSummary,
    overall_risk_level: proposal.overallRiskLevel,
    payment_terms: proposal.paymentTerms,
    plan: proposal.selectedPlan,
    prepared_by: proposal.preparedBy,
    proposal_date: proposal.proposalDate,
    public_token: proposal.publicToken,
    safety_score: proposal.safetyScore,
    selected_plan: proposal.selectedPlan,
    status: proposal.status,
    subtotal: totals.subtotal,
    timeline_duration: proposal.timelineDuration,
    timeline_notes: proposal.timelineNotes,
    timeline_start_date: proposal.timelineStartDate,
    total: totals.totalEstimate,
    total_estimate: totals.totalEstimate,
    valid_until: proposal.validUntil,
    line_items: proposal.lineItems.map((item) => ({
      id: item.id,
      category: item.category,
      description: item.description || item.name,
      grant_eligible: item.grantEligible,
      name: item.name,
      priority: item.priority,
      quantity: item.quantity,
      source: item.source,
      source_outcome_id: item.sourceOutcomeId,
      source_package_id: item.sourcePackageId,
      total: calculateLineTotal(item),
      unit_price: item.unitPrice,
    })),
  }
}

export function fromBackendProposal(raw: BackendProposal): ProposalData {
  const selectedPlan = normalisePlan(raw.selected_plan ?? raw.plan)
  const address = safeText(raw.address)
  const area = safeText(raw.area)

  return createEmptyProposal({
    acceptanceDate: safeText(raw.acceptance_date),
    acceptanceStatus:
      raw.acceptance_status === 'Sent' ||
      raw.acceptance_status === 'Accepted' ||
      raw.acceptance_status === 'Declined'
        ? raw.acceptance_status
        : 'Not Sent',
    acceptedBy: safeText(raw.accepted_by),
    address: area && address.endsWith(`, ${area}`) ? address.slice(0, -area.length - 2) : address,
    area,
    createdAt: safeText(raw.created_at, new Date().toISOString()),
    customerName: safeText(raw.customer_name),
    email: safeText(raw.customer_email ?? raw.email),
    executiveSummary: safeText(raw.executive_summary ?? raw.notes),
    grantEligibilityNote: safeText(raw.grant_eligibility_note),
    grantSupportRequired: Boolean(raw.grant_support_required),
    id: String(raw.id ?? ''),
    inspectionReference: safeText(raw.inspection_reference),
    lineItems: (raw.line_items ?? []).map((item) =>
      createLineItem({
        category: (safeText(item.category, 'General') || 'General') as ProposalLineItem['category'],
        description: safeText(item.description),
        grantEligible: Boolean(item.grant_eligible ?? item.grantEligible),
        id: String(item.id ?? crypto.randomUUID()),
        name: safeText(item.name ?? item.description),
        priority: (safeText(item.priority, 'Medium') || 'Medium') as ProposalLineItem['priority'],
        quantity: safeNumber(item.quantity),
        source: item.source,
        sourceOutcomeId: safeText(item.source_outcome_id ?? item.sourceOutcomeId) || undefined,
        sourcePackageId: safeText(item.source_package_id ?? item.sourcePackageId) || undefined,
        unitPrice: safeNumber(item.unit_price ?? item.unitPrice),
      }),
    ),
    overallRiskLevel: (safeText(raw.overall_risk_level, 'Moderate') || 'Moderate') as ProposalData['overallRiskLevel'],
    paymentTerms: safeText(raw.payment_terms, getDefaultPaymentTerms(selectedPlan)),
    phone: safeText(raw.customer_phone ?? raw.phone),
    preparedBy: safeText(raw.prepared_by, 'CasaMia Operations'),
    proposalDate: safeText(raw.proposal_date, new Date().toISOString().slice(0, 10)),
    publicToken: safeText(raw.public_token),
    safetyScore: String(raw.safety_score ?? '7'),
    selectedPlan,
    status: normaliseStatus(raw.status),
    timelineDuration: safeText(raw.timeline_duration, '1-2 days'),
    timelineNotes: safeText(raw.timeline_notes),
    timelineStartDate: safeText(raw.timeline_start_date),
    updatedAt: safeText(raw.updated_at, new Date().toISOString()),
    validUntil: safeText(raw.valid_until),
  })
}

function hasProposalShape(raw: BackendActionResponse) {
  return Boolean(raw.id || raw.customer_name || raw.selected_plan || raw.plan || raw.line_items)
}

export async function loadProposalsWithFallback() {
  if (!backendAvailable() || !hasInternalBackendSession()) {
    return { proposals: loadAllProposals(), source: 'local' as const }
  }

  try {
    const raw = await requestJson<BackendProposal[]>('/api/proposals', {
      headers: internalHeaders(),
    })

    return { proposals: raw.map(fromBackendProposal), source: 'backend' as const }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Proposal backend could not be loaded.',
      proposals: loadAllProposals(),
      source: 'local' as const,
    }
  }
}

export async function loadProposalWithFallback(proposalId: string) {
  if (!backendAvailable() || !hasInternalBackendSession()) {
    return { proposal: loadProposalById(proposalId), source: 'local' as const }
  }

  try {
    const raw = await requestJson<BackendProposal>(`/api/proposals/${proposalId}`, {
      headers: internalHeaders(),
    })

    return { proposal: fromBackendProposal(raw), source: 'backend' as const }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Proposal backend could not be loaded.',
      proposal: loadProposalById(proposalId),
      source: 'local' as const,
    }
  }
}

export async function saveProposalWithFallback(proposal: ProposalData) {
  if (!backendAvailable() || !hasInternalBackendSession()) {
    return { proposal: saveProposal(proposal), source: 'local' as const }
  }

  try {
    const raw = await requestJson<BackendProposal>('/api/proposals', {
      body: JSON.stringify(toBackendProposal(proposal)),
      headers: internalHeaders(),
      method: 'POST',
    })

    return { proposal: fromBackendProposal(raw), source: 'backend' as const }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Proposal could not be saved to the backend.',
      proposal: saveProposal(proposal),
      source: 'local' as const,
    }
  }
}

export async function sendProposalWithFallback(proposal: ProposalData) {
  const saved = await saveProposalWithFallback(proposal)

  if (saved.source === 'backend') {
    try {
      const raw = await requestJson<BackendActionResponse>(`/api/proposals/${saved.proposal.id}/send`, {
        headers: internalHeaders(),
        method: 'POST',
      })

      const sentProposal: ProposalData = { ...saved.proposal, acceptanceStatus: 'Sent', status: 'Sent' }

      return {
        proposal: hasProposalShape(raw)
          ? fromBackendProposal(raw)
          : sentProposal,
        source: 'backend' as const,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Proposal status could not be saved to the backend.',
        proposal: saveProposal({ ...proposal, acceptanceStatus: 'Sent', status: 'Sent' }),
        source: 'local' as const,
      }
    }
  }

  return {
    proposal: saveProposal({ ...saved.proposal, acceptanceStatus: 'Sent', status: 'Sent' }),
    source: 'local' as const,
  }
}

export async function acceptProposalWithFallback(proposal: ProposalData) {
  let backendError = backendAvailable()
    ? 'Internal admin session is not active.'
    : 'Proposal backend is not configured.'

  if (backendAvailable() && hasInternalBackendSession()) {
    try {
      const raw = await requestJson<BackendActionResponse>(`/api/proposals/${proposal.id}/accept`, {
        body: JSON.stringify({
          accepted_by: proposal.customerName,
        }),
        headers: internalHeaders(),
        method: 'POST',
      })

      const acceptedProposal: ProposalData = {
        ...proposal,
        acceptanceDate: new Date().toISOString().slice(0, 10),
        acceptanceStatus: 'Accepted',
        acceptedBy: proposal.customerName,
        status: 'Accepted',
      }

      return {
        proposal: hasProposalShape(raw)
          ? fromBackendProposal(raw)
          : acceptedProposal,
        source: 'backend' as const,
      }
    } catch (error) {
      backendError = error instanceof Error ? error.message : 'Proposal acceptance could not be saved to the backend.'
    }
  }

  return {
    error: backendError,
    proposal: saveProposal({
      ...proposal,
      acceptanceDate: new Date().toISOString().slice(0, 10),
      acceptanceStatus: 'Accepted',
      acceptedBy: proposal.customerName,
      status: 'Accepted',
    }),
    source: 'local' as const,
  }
}

export async function loadPublicProposal(token: string) {
  if (!backendAvailable()) {
    const proposal = loadAllProposals().find((item) => item.publicToken === token)
    if (!proposal) throw new Error('Proposal not found.')
    return proposal
  }

  const raw = await requestJson<BackendProposal>(`/api/public/proposals/${token}`)

  return fromBackendProposal(raw)
}

export async function acceptPublicProposal(token: string, acceptedBy: string) {
  if (!backendAvailable()) {
    const proposal = loadAllProposals().find((item) => item.publicToken === token)
    if (!proposal || proposal.status !== 'Sent' || proposal.acceptanceStatus !== 'Sent') {
      throw new Error('This proposal is still pending CasaMia review.')
    }

    return saveProposal({
      ...proposal,
      acceptanceDate: new Date().toISOString().slice(0, 10),
      acceptanceStatus: 'Accepted',
      acceptedBy,
      status: 'Accepted',
    })
  }

  const raw = await requestJson<BackendActionResponse>(`/api/public/proposals/${token}/accept`, {
    body: JSON.stringify({ accepted_by: acceptedBy }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  return hasProposalShape(raw) ? fromBackendProposal(raw) : null
}

export async function createPublicProposalDraft(
  payload: PublicProposalDraftPayload,
  fallbackCatalogue?: EditableServiceCatalogue,
): Promise<PublicProposalDraftResponse> {
  if (!backendAvailable()) {
    return createLocalPublicProposalDraft(payload, fallbackCatalogue ?? getServiceCatalogue())
  }

  const raw = await requestJson<{
    proposal?: BackendProposal
    publicToken?: string
    publicUrl?: string
  }>('/api/public/proposal-drafts', {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!raw.proposal) {
    throw new Error('Draft proposal response did not include a proposal.')
  }

  const proposal = fromBackendProposal(raw.proposal)

  return {
    proposal,
    publicToken: raw.publicToken ?? proposal.publicToken ?? '',
    publicUrl: raw.publicUrl ?? (proposal.publicToken ? `/proposal/${proposal.publicToken}` : ''),
  }
}

export function getProposalApiStatus() {
  if (!backendAvailable()) {
    return 'Local demo mode: proposal API URL is not configured.'
  }

  if (!hasInternalBackendSession()) {
    return 'Local demo mode: internal admin session is not active.'
  }

  return apiBaseUrl
    ? `Connected to ${apiBaseUrl}`
    : 'Connected to the same-origin Vercel proposal API.'
}

function createLocalPublicProposalDraft(
  payload: PublicProposalDraftPayload,
  catalogue: EditableServiceCatalogue,
): PublicProposalDraftResponse {
  if (!payload.consent) {
    throw new Error('Consent is required to create a draft proposal.')
  }

  if (!payload.customer.name.trim() || !payload.customer.email.trim()) {
    throw new Error('Name and email are required to create a draft proposal.')
  }

  const groups = buildPlansBuilderGroups(catalogue, payload.language)
  const estimate = calculatePlansBuilderEstimate(groups, payload.selection, payload.language)

  if (!estimate.proposalLineItems.length) {
    throw new Error('Select at least one CasaMia package.')
  }

  const publicToken = createLocalPublicToken()
  const proposal = createEmptyProposal({
    acceptanceStatus: 'Not Sent',
    address: payload.customer.address ?? '',
    area: payload.customer.area ?? '',
    customerName: payload.customer.name,
    email: payload.customer.email,
    executiveSummary: payload.language === 'es'
      ? `Borrador creado desde el constructor de Planes CasaMia con ${estimate.selectedRoomQuantity} paquete(s) de estancia. Los importes son estimaciones con IVA incluido y quedan pendientes de revisión.`
      : `Draft created from the CasaMia Plans builder with ${estimate.selectedRoomQuantity} room package(s). Amounts are VAT-included estimates pending review.`,
    grantEligibilityNote: payload.language === 'es'
      ? 'CasaMia puede orientar sobre documentación para ayudas cuando corresponda. La aprobación depende siempre de la autoridad correspondiente y no está garantizada.'
      : 'CasaMia may support documentation for applicable grants. Approval is determined solely by the relevant authority and is not guaranteed.',
    inspectionReference: 'Public Plans builder',
    lineItems: estimate.proposalLineItems,
    paymentTerms: payload.language === 'es'
      ? 'Borrador estimativo pendiente de revisión de CasaMia. No se solicita pago y no empieza ningún trabajo hasta aprobar una propuesta final.'
      : 'Estimate draft pending CasaMia review. No payment is requested and no work starts until a final proposal is approved.',
    phone: payload.customer.phone ?? '',
    preparedBy: 'CasaMia',
    publicToken,
    safetyScore: 'Pending review',
    selectedPlan: homeSafetyPlan,
    status: 'Draft',
    timelineDuration: 'To be confirmed after CasaMia review',
    timelineNotes: payload.language === 'es'
      ? 'CasaMia confirmará alcance, disponibilidad, calendario y precio final después de revisar la vivienda.'
      : 'CasaMia will confirm scope, availability, timing and final pricing after reviewing the home.',
    timelineStartDate: '',
  })
  const saved = saveProposal(proposal)

  return {
    proposal: saved,
    publicToken,
    publicUrl: `/proposal/${publicToken}`,
  }
}

function createLocalPublicToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '')
  }

  return `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}
