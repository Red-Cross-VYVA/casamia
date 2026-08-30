import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth.ts'
import { getPublicSiteApiBaseUrl, hasPublicSiteApi } from './publicSiteApi.ts'
import type { CustomerActionPriority, CustomerRecord, CustomerStage } from './customerTimeline.ts'

export const customerLifecycleStatuses = ['New', 'Contacted', 'Visit booked', 'Proposal sent', 'Won', 'Lost'] as const
export type CustomerLifecycleStatus = (typeof customerLifecycleStatuses)[number]

export type CustomerCrmRecord = {
  customerKey: string
  internalNotes: string
  lifecycleStatus: CustomerLifecycleStatus
  nextAction: string
  nextActionDueAt: string
  owner: string
  updatedAt: string
}

export type ManagedCustomerRecord = CustomerRecord & { crm: CustomerCrmRecord }
export type CustomerCrmChanges = Pick<CustomerCrmRecord, 'internalNotes' | 'lifecycleStatus' | 'nextAction' | 'nextActionDueAt' | 'owner'>

export async function loadCustomerCrmRecords() {
  ensureAvailable()
  return request<{ customers: CustomerCrmRecord[] }>('/api/internal/customers')
}

export async function updateCustomerCrmRecord(customerKey: string, changes: CustomerCrmChanges) {
  ensureAvailable()
  const payload = await request<{ customer: CustomerCrmRecord }>('/api/internal/customers', {
    body: JSON.stringify({ customerKey, ...changes }),
    headers: { 'content-type': 'application/json' },
    method: 'PATCH',
  })
  return payload.customer
}

export function applyCustomerCrm(customer: CustomerRecord, saved?: CustomerCrmRecord, now = new Date()): ManagedCustomerRecord {
  const crm = saved ?? emptyCustomerCrm(customer)
  const crmAction = crm.nextAction ? [{
    detail: crm.owner ? `Owned by ${crm.owner}.` : 'Internal follow-up.',
    dueAt: crm.nextActionDueAt,
    href: `/internal/customers#${encodeURIComponent(customer.id)}`,
    id: `crm:${customer.id}`,
    label: crm.nextAction,
    priority: crmPriority(crm.nextActionDueAt, now),
  }] : []
  return {
    ...customer,
    actions: [...crmAction, ...customer.actions].sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority)),
    crm,
    stage: lifecycleStage(crm.lifecycleStatus),
  }
}

export function isOverdueCustomerFollowUp(record: CustomerCrmRecord, now = new Date()) {
  return Boolean(record.nextAction && record.nextActionDueAt && Date.parse(record.nextActionDueAt) < now.getTime())
}

function emptyCustomerCrm(customer: CustomerRecord): CustomerCrmRecord {
  return {
    customerKey: customer.id,
    internalNotes: '',
    lifecycleStatus: stageLifecycle(customer.stage),
    nextAction: '',
    nextActionDueAt: '',
    owner: '',
    updatedAt: '',
  }
}

function crmPriority(value: string, now: Date): CustomerActionPriority {
  if (!value) return 'normal'
  const due = Date.parse(value)
  if (Number.isNaN(due)) return 'normal'
  return due <= now.getTime() ? 'urgent' : due - now.getTime() <= 86_400_000 ? 'due' : 'normal'
}
function priorityScore(value: CustomerActionPriority) { return value === 'urgent' ? 3 : value === 'due' ? 2 : 1 }
function lifecycleStage(status: CustomerLifecycleStatus): CustomerStage {
  return status === 'Won' ? 'Completed' : status === 'Lost' ? 'Cancelled' : status === 'Proposal sent' ? 'Proposal' : status === 'Visit booked' ? 'Visit' : status === 'Contacted' ? 'Contacting' : 'New enquiry'
}
function stageLifecycle(stage: CustomerStage): CustomerLifecycleStatus {
  return stage === 'Completed' ? 'Won' : stage === 'Cancelled' ? 'Lost' : stage === 'Proposal' ? 'Proposal sent' : ['Visit', 'Report', 'Scheduled'].includes(stage) ? 'Visit booked' : stage === 'Contacting' ? 'Contacted' : 'New'
}
function ensureAvailable() {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) throw new Error('Customer operations are available in the deployed admin panel after signing in.')
}
async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${path}`, { ...init, headers: { ...getInternalAuthHeaders(), ...(init.headers ?? {}) } })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(body.message ?? `Customer operations returned ${response.status}.`)
  }
  return response.json() as Promise<T>
}
