import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth'
import { getPublicSiteApiBaseUrl, hasPublicSiteApi } from './publicSiteApi'

export type ConversionAnalyticsData = {
  breakdowns: {
    flows: Array<{ key: string; count: number }>
    languages: Array<{ key: string; count: number }>
  }
  coverage: { days: number; eventCount: number; since: string }
  daily: Array<{ date: string; started: number; completed: number; payments: number }>
  filters: { flow: string; language: string }
  funnel: Array<{
    count: number
    dropOff: number
    key: string
    label: string
    rateFromPrevious: number
  }>
  issues: string[]
  outcomes: {
    acceptedProposals: number
    appointments: number
    assessmentRequests: number
    paidOrders: number
    whatsappClicks: number
  }
}

export async function loadConversionAnalytics(filters: { days: number; language: string; flow: string }) {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    throw new Error('Live conversion data is available in the deployed internal panel.')
  }
  const params = new URLSearchParams({ days: String(filters.days) })
  if (filters.language) params.set('language', filters.language)
  if (filters.flow) params.set('flow', filters.flow)

  const response = await fetch(`${getPublicSiteApiBaseUrl()}/api/internal/conversion-analytics?${params}`, {
    headers: getInternalAuthHeaders(),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(body.message ?? `Conversion analytics returned ${response.status}.`)
  }
  return response.json() as Promise<ConversionAnalyticsData>
}
