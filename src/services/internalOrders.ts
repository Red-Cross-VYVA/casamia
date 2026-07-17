import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth.ts'
import { getPublicSiteApiBaseUrl, hasPublicSiteApi } from './publicSiteApi.ts'

export const internalOrderStatuses = [
  'New',
  'Quote requested',
  'Visit requested',
  'Contacting',
  'Proposal created',
  'Scheduled',
  'Completed',
  'Cancelled',
] as const

export type InternalOrderStatus = (typeof internalOrderStatuses)[number]

export type InternalOrder = {
  address: string
  city: string
  createdAt: string
  customerEmail: string
  customerName: string
  customerPhone: string
  databaseId: string
  id: string
  notes: string
  paymentMethod: string
  planLabel: string
  planPrice: string
  postcode: string
  preferredTiming: string
  selectedServiceCount: number
  status: string
}

const path = '/api/internal/orders'

export async function loadInternalOrders() {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    return { available: false, message: 'Customer plans are available in the deployed internal panel.', orders: [] as InternalOrder[] }
  }
  try {
    const payload = await request<{ orders?: InternalOrder[] }>(path)
    return { available: true, orders: Array.isArray(payload.orders) ? payload.orders : [] }
  } catch (error) {
    return {
      available: false,
      message: error instanceof Error ? error.message : 'Customer plans could not be loaded.',
      orders: [] as InternalOrder[],
    }
  }
}

export async function updateInternalOrderStatus(id: string, status: InternalOrderStatus) {
  const payload = await request<{ order: InternalOrder }>(path, {
    body: JSON.stringify({ id, status }),
    headers: { 'content-type': 'application/json' },
    method: 'PATCH',
  })
  return payload.order
}

async function request<T>(endpoint: string, init: RequestInit = {}) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${endpoint}`, {
    ...init,
    headers: { ...getInternalAuthHeaders(), ...(init.headers ?? {}) },
  })
  if (!response.ok) {
    try {
      const body = (await response.json()) as { message?: string }
      throw new Error(body.message ?? `Customer plans returned ${response.status}.`)
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error(`Customer plans returned ${response.status}.`)
    }
  }
  return response.json() as Promise<T>
}
