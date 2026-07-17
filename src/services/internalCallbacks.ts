import {
  getInternalAuthHeaders,
  hasInternalBackendSession,
} from './internalAuth.ts'
import {
  getPublicSiteApiBaseUrl,
  hasPublicSiteApi,
} from './publicSiteApi.ts'

export const internalCallbackStatuses = ['New', 'Contacting', 'Completed', 'Cancelled'] as const

export type InternalCallbackStatus = (typeof internalCallbackStatuses)[number]

export type InternalCallbackRequest = {
  city: string
  email: string
  id: string
  locale: 'en' | 'es'
  name: string
  note: string
  phone: string
  preferredCallbackDate: string
  preferredTimeWindow: string
  reference: string
  status: InternalCallbackStatus
  submittedAt: string
}

export type InternalCallbackLoadResult = {
  available: boolean
  message?: string
  requests: InternalCallbackRequest[]
}

const internalCallbackPath = '/api/internal/callback-requests'
const callbackPageSize = 250

type InternalCallbackPage = {
  hasMore?: boolean
  nextOffset?: number
  requests?: InternalCallbackRequest[]
}

export async function loadInternalCallbackRequests(): Promise<InternalCallbackLoadResult> {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    return {
      available: false,
      message: 'The live callback inbox is unavailable in local demo mode. Sign in to the deployed internal panel to view real requests.',
      requests: [],
    }
  }

  try {
    const [openRequests, closedPage] = await Promise.all([
      loadAllOpenCallbackRequests(),
      requestInternalCallbacks<InternalCallbackPage>(
        `${internalCallbackPath}?scope=closed&limit=${callbackPageSize}&offset=0`,
      ),
    ])
    const combined = [...openRequests, ...(closedPage.requests ?? [])]
    const requests = Array.from(new Map(combined.map((request) => [request.id, request])).values())

    return {
      available: true,
      requests,
    }
  } catch (error) {
    return {
      available: false,
      message: error instanceof Error ? error.message : 'The callback inbox could not be loaded.',
      requests: [],
    }
  }
}

export async function updateInternalCallbackStatus(
  id: string,
  status: InternalCallbackStatus,
) {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    throw new Error('Status changes are unavailable in local demo mode.')
  }

  const payload = await requestInternalCallbacks<{ request: InternalCallbackRequest }>(internalCallbackPath, {
    body: JSON.stringify({ id, status }),
    headers: { 'content-type': 'application/json' },
    method: 'PATCH',
  })

  return payload.request
}

async function loadAllOpenCallbackRequests() {
  const requests: InternalCallbackRequest[] = []
  let offset = 0

  while (true) {
    const page = await requestInternalCallbacks<InternalCallbackPage>(
      `${internalCallbackPath}?scope=open&limit=${callbackPageSize}&offset=${offset}`,
    )
    const pageRequests = Array.isArray(page.requests) ? page.requests : []
    requests.push(...pageRequests)

    if (!page.hasMore || pageRequests.length === 0) break
    const nextOffset = Number.isInteger(page.nextOffset) ? Number(page.nextOffset) : offset + pageRequests.length
    if (nextOffset <= offset) break
    offset = nextOffset
  }

  return requests
}

async function requestInternalCallbacks<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...getInternalAuthHeaders(),
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return response.json() as Promise<T>
}

async function readError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message ?? `The callback inbox returned ${response.status}.`
  } catch {
    return `The callback inbox returned ${response.status}.`
  }
}
