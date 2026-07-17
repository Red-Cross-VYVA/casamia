import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth.ts'
import { getPublicSiteApiBaseUrl, hasPublicSiteApi } from './publicSiteApi.ts'

export type InternalDashboardData = {
  issues: string[]
  stats: {
    activeServices: number
    newAssessments: number
    newCustomerPlans: number
    openCallbacks: number
    pendingProposals: number
    providerLeads: number
  }
}

export async function loadInternalDashboard(): Promise<InternalDashboardData> {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    throw new Error('Live dashboard data is available in the deployed internal panel.')
  }

  const response = await fetch(`${getPublicSiteApiBaseUrl()}/api/internal/dashboard`, {
    headers: getInternalAuthHeaders(),
  })
  if (!response.ok) {
    try {
      const body = (await response.json()) as { message?: string }
      throw new Error(body.message ?? `Dashboard returned ${response.status}.`)
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error(`Dashboard returned ${response.status}.`)
    }
  }
  return response.json() as Promise<InternalDashboardData>
}
