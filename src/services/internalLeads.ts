import {
  getInternalAuthHeaders,
  getPartnerAuthHeaders,
  hasInternalBackendSession,
  hasPartnerBackendSession,
} from './internalAuth.ts'
import { getPublicSiteApiBaseUrl, hasPublicSiteApi } from './publicSiteApi.ts'

export const leadStatuses = ['New', 'Contacted', 'Visit booked', 'Proposal sent', 'Won', 'Lost'] as const
export type LeadStatus = (typeof leadStatuses)[number]
export type LeadSource = 'assessment' | 'callback'

export type Lead = {
  assignedPartnerEmail: string
  city: string
  email: string
  followUpAt: string
  id: string
  message: string
  name: string
  notes: string
  partnerNotes: string
  phone: string
  preferredAt: string
  selectedPlan: string
  source: LeadSource
  sourceLabel: string
  status: LeadStatus
  submittedAt: string
}

export type LeadChanges = Pick<Lead, 'assignedPartnerEmail' | 'followUpAt' | 'notes' | 'partnerNotes' | 'status'>

export async function loadInternalLeads() {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    throw new Error('Live leads are available in the deployed admin panel after signing in.')
  }
  return request<{ leads: Lead[] }>('/api/internal/leads', getInternalAuthHeaders())
}

export async function updateInternalLead(lead: Lead, changes: LeadChanges) {
  const payload = await request<{ lead: Lead }>('/api/internal/leads', getInternalAuthHeaders(), {
    body: JSON.stringify({ ...changes, id: lead.id, source: lead.source }),
    headers: { 'content-type': 'application/json' },
    method: 'PATCH',
  })
  return payload.lead
}

export async function loadPartnerLeads() {
  if (!hasPublicSiteApi() || !hasPartnerBackendSession()) {
    return { leads: [] as Lead[], partnerEmail: '' }
  }
  return request<{ leads: Lead[]; partnerEmail: string }>('/api/partner/leads', getPartnerAuthHeaders())
}

async function request<T>(path: string, authHeaders: Record<string, string>, init: RequestInit = {}) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${path}`, {
    ...init,
    headers: { ...authHeaders, ...(init.headers ?? {}) },
  })
  if (!response.ok) {
    try {
      const body = (await response.json()) as { message?: string }
      throw new Error(body.message ?? `Lead pipeline returned ${response.status}.`)
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error(`Lead pipeline returned ${response.status}.`)
    }
  }
  return response.json() as Promise<T>
}
