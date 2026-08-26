import { getInternalAuthHeaders } from './internalAuth'
import { getPublicSiteApiBaseUrl } from './publicSiteApi'

export type BlankLegacyRecordKind = 'contact' | 'order' | 'provider' | 'withdrawal'

export type BlankLegacyRecord = {
  createdAt: string
  kind: BlankLegacyRecordKind
  recordKey: string
  reference: string
}

const path = '/api/internal/data-quality'

export async function loadBlankLegacyRecords() {
  const payload = await request<{ records?: BlankLegacyRecord[] }>()
  return Array.isArray(payload.records) ? payload.records : []
}

export async function deleteBlankLegacyRecord(record: BlankLegacyRecord) {
  return request<{ deleted: boolean; kind: BlankLegacyRecordKind; recordKey: string }>({
    body: JSON.stringify({
      confirmation: 'DELETE BLANK RECORD',
      kind: record.kind,
      recordKey: record.recordKey,
    }),
    headers: { 'content-type': 'application/json' },
    method: 'DELETE',
  })
}

async function request<T>(init: RequestInit = {}) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${path}`, {
    ...init,
    headers: { ...getInternalAuthHeaders(), ...(init.headers ?? {}) },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(body.message ?? `Data quality returned ${response.status}.`)
  }

  return response.json() as Promise<T>
}
