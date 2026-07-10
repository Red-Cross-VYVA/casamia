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
const providerApplicationApiUrl = import.meta.env.VITE_PROVIDER_APPLICATION_API_URL || ''

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
