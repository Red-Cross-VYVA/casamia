import crypto from 'node:crypto'

import {
  selectSupabaseRows,
  updateSupabaseRows,
  upsertSupabaseRow,
} from './supabase.js'

export const proposalSelection = [
  'id',
  'created_at',
  'updated_at',
  'status',
  'public_token',
  'customer_name',
  'customer_email',
  'customer_phone',
  'selected_plan',
  'total_estimate',
  'payload_json',
].join(',')

const proposalStatuses = new Set([
  'Draft',
  'Sent',
  'Accepted',
  'Deposit Paid',
  'Scheduled',
  'Completed',
])

export function isProposalId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{2,79}$/.test(value)
}

export function isPublicProposalToken(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{20,128}$/.test(value)
}

export function mapProposalRecord(record) {
  const payload = record?.payload_json && typeof record.payload_json === 'object'
    ? record.payload_json
    : {}

  return {
    ...payload,
    id: record?.id ?? payload.id,
    created_at: record?.created_at ?? payload.created_at,
    updated_at: record?.updated_at ?? payload.updated_at,
    status: record?.status ?? payload.status ?? 'Draft',
    public_token: record?.public_token ?? payload.public_token,
    customer_name: record?.customer_name ?? payload.customer_name ?? '',
    customer_email: record?.customer_email ?? payload.customer_email ?? '',
    customer_phone: record?.customer_phone ?? payload.customer_phone ?? '',
    selected_plan: record?.selected_plan ?? payload.selected_plan ?? '',
    total_estimate: Number(record?.total_estimate ?? payload.total_estimate ?? 0),
  }
}

export async function listProposalRecords() {
  return selectSupabaseRows(
    'proposals',
    `select=${proposalSelection}&order=updated_at.desc&limit=500`,
  )
}

export async function getProposalRecordById(id) {
  const result = await selectSupabaseRows(
    'proposals',
    `id=eq.${encodeURIComponent(id)}&select=${proposalSelection}&limit=1`,
  )

  return firstRecord(result)
}

export async function getProposalRecordByToken(token) {
  const result = await selectSupabaseRows(
    'proposals',
    `public_token=eq.${encodeURIComponent(token)}&select=${proposalSelection}&limit=1`,
  )

  return firstRecord(result)
}

export async function saveProposalRecord(body) {
  if (!isProposalId(body?.id)) {
    return invalidResult(400, 'A valid proposal id is required.')
  }

  const existing = await getProposalRecordById(body.id)
  if (!existing.ok && existing.status !== 404) return existing

  const now = new Date().toISOString()
  const current = existing.ok ? mapProposalRecord(existing.record) : {}
  const status = proposalStatuses.has(body.status) ? body.status : (current.status ?? 'Draft')
  const publicToken = current.public_token || normaliseToken(body.public_token)
  const payload = {
    ...current,
    ...body,
    created_at: current.created_at ?? body.created_at ?? now,
    public_token: publicToken,
    status,
    updated_at: now,
  }
  const row = {
    id: body.id,
    created_at: payload.created_at,
    updated_at: now,
    status,
    public_token: publicToken,
    customer_name: text(body.customer_name ?? current.customer_name),
    customer_email: text(body.customer_email ?? current.customer_email),
    customer_phone: text(body.customer_phone ?? current.customer_phone),
    selected_plan: text(body.selected_plan ?? body.plan ?? current.selected_plan),
    total_estimate: number(body.total_estimate ?? body.total ?? current.total_estimate),
    payload_json: payload,
  }
  const result = await upsertSupabaseRow('proposals', row)

  if (!result.ok) return result
  const record = Array.isArray(result.body) ? result.body[0] : result.body
  return { ok: true, record, status: 200 }
}

export async function updateProposalRecord(record, patch) {
  const current = mapProposalRecord(record)
  const now = new Date().toISOString()
  const status = proposalStatuses.has(patch.status) ? patch.status : current.status
  const payload = {
    ...current,
    ...patch,
    status,
    updated_at: now,
  }
  const result = await updateSupabaseRows(
    'proposals',
    {
      status,
      updated_at: now,
      payload_json: payload,
    },
    `id=eq.${encodeURIComponent(record.id)}`,
  )

  if (!result.ok) return result
  const updated = Array.isArray(result.body) ? result.body[0] : result.body
  return { ok: true, record: updated, status: 200 }
}

function firstRecord(result) {
  if (!result.ok) return result
  const record = Array.isArray(result.body) ? result.body[0] : undefined
  return record
    ? { ok: true, record, status: 200 }
    : invalidResult(404, 'Proposal not found.')
}

function normaliseToken(value) {
  return isPublicProposalToken(value) ? value : crypto.randomBytes(24).toString('base64url')
}

function invalidResult(status, message) {
  return { ok: false, status, body: { message } }
}

function text(value) {
  return typeof value === 'string' ? value : ''
}

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
