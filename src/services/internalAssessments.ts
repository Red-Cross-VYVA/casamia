import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth.ts'
import { getPublicSiteApiBaseUrl, hasPublicSiteApi } from './publicSiteApi.ts'

export const internalAssessmentStatuses = [
  'New',
  'Contacting',
  'Visit Scheduled',
  'In Progress',
  'Report Pending',
  'Proposal Sent',
  'Completed',
  'Cancelled',
] as const

export type InternalAssessmentStatus = (typeof internalAssessmentStatuses)[number]

export type InternalAssessmentRequest = {
  city: string
  email: string
  id: string
  message: string
  name: string
  phone: string
  preferredContactMethod: string
  preferredDate: string
  selectedPlan: string
  source: string
  status: string
  submittedAt: string
  type: string
  wizardReference: string
}

const path = '/api/internal/assessment-requests'

export async function loadInternalAssessmentRequests() {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    return {
      available: false,
      message: 'Real assessment requests are available in the deployed internal panel after signing in.',
      requests: [] as InternalAssessmentRequest[],
    }
  }

  try {
    const payload = await request<{ requests?: InternalAssessmentRequest[] }>(path)
    return {
      available: true,
      requests: Array.isArray(payload.requests) ? payload.requests : [],
    }
  } catch (error) {
    return {
      available: false,
      message: error instanceof Error ? error.message : 'Assessment requests could not be loaded.',
      requests: [] as InternalAssessmentRequest[],
    }
  }
}

export async function updateInternalAssessmentStatus(id: string, status: InternalAssessmentStatus) {
  const payload = await request<{ request: InternalAssessmentRequest }>(path, {
    body: JSON.stringify({ id, status }),
    headers: { 'content-type': 'application/json' },
    method: 'PATCH',
  })
  return payload.request
}

async function request<T>(endpoint: string, init: RequestInit = {}) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${endpoint}`, {
    ...init,
    headers: {
      ...getInternalAuthHeaders(),
      ...(init.headers ?? {}),
    },
  })
  if (!response.ok) {
    try {
      const body = (await response.json()) as { message?: string }
      throw new Error(body.message ?? `Assessment requests returned ${response.status}.`)
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error(`Assessment requests returned ${response.status}.`)
    }
  }
  return response.json() as Promise<T>
}
