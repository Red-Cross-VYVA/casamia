import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth.ts'
import { getPublicSiteApiBaseUrl, hasPublicSiteApi } from './publicSiteApi.ts'

export type ProviderApplicationStatus = 'new' | 'reviewing' | 'approved' | 'not-a-fit'

export type ProviderApplication = {
  availability: string
  businessName: string
  cities: string[]
  contactName: string
  createdAt: string
  email: string
  experience: string
  id: string
  insuranceConfirmed: boolean
  phone: string
  status: ProviderApplicationStatus
  trades: string[]
  website: string
}

export type ProviderApplicationInput = Omit<ProviderApplication, 'createdAt' | 'id' | 'status'>

const storageKey = 'casamia_provider_applications'
const providerApplicationApiUrl =
  import.meta.env.VITE_PROVIDER_APPLICATION_API_URL || (import.meta.env.PROD ? '/api/public/provider-applications' : '')
const internalProviderApplicationsPath = '/api/internal/provider-applications'

export function providerApplicationBackendConfigured() {
  return Boolean(providerApplicationApiUrl)
}

export function loadProviderApplications() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as ProviderApplication[]
  } catch {
    return []
  }
}

function saveProviderApplications(applications: ProviderApplication[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(applications))
}

export async function submitProviderApplication(input: ProviderApplicationInput) {
  const application: ProviderApplication = {
    ...input,
    createdAt: new Date().toISOString(),
    id: `PPA-${Date.now().toString(36).toUpperCase()}`,
    status: 'new',
  }

  if (providerApplicationBackendConfigured()) {
    const response = await fetch(providerApplicationApiUrl, {
      body: JSON.stringify(application),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    if (!response.ok) {
      return {
        ok: false as const,
        reason: `Provider application API failed with ${response.status}.`,
      }
    }
  }

  const existing = loadProviderApplications()
  saveProviderApplications([application, ...existing].slice(0, 100))

  return {
    application,
    ok: true as const,
    storedInBackend: providerApplicationBackendConfigured(),
  }
}

export function updateProviderApplicationStatus(id: string, status: ProviderApplicationStatus) {
  const updated = loadProviderApplications().map((application) =>
    application.id === id ? { ...application, status } : application,
  )
  saveProviderApplications(updated)
  return updated
}

export async function loadProviderApplicationsWithFallback() {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    return { applications: loadProviderApplications(), source: 'local' as const }
  }

  try {
    const response = await requestInternal<{ applications?: ProviderApplication[] }>(internalProviderApplicationsPath)
    const applications = Array.isArray(response.applications) ? response.applications : []
    saveProviderApplications(applications)
    return { applications, source: 'backend' as const }
  } catch (error) {
    return {
      applications: loadProviderApplications(),
      error: error instanceof Error ? error.message : 'Provider applications could not be loaded.',
      source: 'local' as const,
    }
  }
}

export async function updateProviderApplicationStatusWithFallback(
  id: string,
  status: ProviderApplicationStatus,
) {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    return { applications: updateProviderApplicationStatus(id, status), source: 'local' as const }
  }

  const response = await requestInternal<{ application: ProviderApplication }>(internalProviderApplicationsPath, {
    body: JSON.stringify({ id, status }),
    headers: { 'content-type': 'application/json' },
    method: 'PATCH',
  })
  const applications = loadProviderApplications().map((application) =>
    application.id === response.application.id ? response.application : application,
  )
  const next = applications.some((application) => application.id === response.application.id)
    ? applications
    : [response.application, ...applications]
  saveProviderApplications(next)
  return { applications: next, source: 'backend' as const }
}

async function requestInternal<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...getInternalAuthHeaders(),
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    try {
      const body = (await response.json()) as { message?: string }
      throw new Error(body.message ?? `Provider applications returned ${response.status}.`)
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error(`Provider applications returned ${response.status}.`)
    }
  }

  return response.json() as Promise<T>
}
