import crypto from 'node:crypto'

import {
  selectSupabaseRows,
  updateSupabaseRows,
  upsertSupabaseRow,
} from './supabase.js'
import { getRequestHeader, normalizeOrigin } from './public-origin.js'

export const agreementSelection = [
  'assignment_id',
  'created_at',
  'updated_at',
  'document_id',
  'document_version',
  'locale',
  'status',
  'partner_id',
  'partner_business_name',
  'partner_contact_name',
  'partner_email',
  'assigned_at',
  'assigned_by',
  'expires_at',
  'share_enabled',
  'share_last_created_at',
  'signature_status',
  'signed_at',
  'payload_json',
].join(',')

const assignmentStatuses = new Set([
  'draft',
  'sent',
  'viewed',
  'under-review',
  'ready-for-signature',
  'signed',
  'revoked',
  'expired',
])

const signatureStatuses = new Set([
  'not-started',
  'provider-review',
  'signature-ready',
  'sent-to-signature',
  'signed',
])

export function isAgreementAssignmentId(value) {
  return typeof value === 'string' && /^AGR-[A-Za-z0-9-]{6,80}$/.test(value)
}

export function isPublicAgreementToken(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{32,160}$/.test(value)
}

export function listAgreementRecords() {
  return selectSupabaseRows(
    'agreement_assignments',
    `select=${agreementSelection}&order=updated_at.desc&limit=500`,
  )
}

export function listAgreementRecordsForPartner(partnerEmail) {
  return selectSupabaseRows(
    'agreement_assignments',
    `partner_email=eq.${encodeURIComponent(normalizeEmail(partnerEmail))}&select=${agreementSelection}&order=updated_at.desc&limit=200`,
  )
}

export async function getAgreementRecordById(assignmentId) {
  const result = await selectSupabaseRows(
    'agreement_assignments',
    `assignment_id=eq.${encodeURIComponent(assignmentId)}&select=${agreementSelection}&limit=1`,
  )

  return firstRecord(result)
}

export async function getAgreementRecordByToken(token) {
  if (!isPublicAgreementToken(token)) {
    return invalidResult(404, 'Agreement not found.')
  }

  const result = await selectSupabaseRows(
    'agreement_assignments',
    `share_enabled=eq.true&share_token_hash=eq.${encodeURIComponent(hashPublicToken(token))}&select=${agreementSelection}&limit=1`,
  )

  return firstRecord(result)
}

export async function saveAgreementRecord(body, request) {
  const now = new Date().toISOString()
  const assignmentId = isAgreementAssignmentId(body?.assignmentId)
    ? body.assignmentId
    : createAgreementAssignmentId()
  const shareEnabled = Boolean(body?.shareEnabled)
  const publicToken = shareEnabled ? createPublicAgreementToken() : ''
  const publicUrl = publicToken ? buildPublicAgreementUrl(request, publicToken) : ''
  const assignedBy = text(body?.assignedBy, 'CasaMia Operations')
  const partnerBusinessName = text(body?.partnerBusinessName)
  const partnerContactName = text(body?.partnerContactName)
  const partnerEmail = text(body?.partnerEmail)
  const documentId = text(body?.documentId)
  const documentVersion = text(body?.version)
  const locale = normaliseLocale(body?.locale)

  if (!documentId || !documentVersion) {
    return invalidResult(400, 'Document id and version are required.')
  }
  if (!partnerBusinessName || !partnerContactName || !isEmail(partnerEmail)) {
    return invalidResult(400, 'Partner business, contact name and valid email are required.')
  }

  const auditEvents = [
    createAuditEvent('created', 'system', 'Agreement system', 'Assignment record created.'),
    createAuditEvent('assigned', 'internal', assignedBy, `Assigned to ${partnerBusinessName}.`),
    ...(shareEnabled
      ? [createAuditEvent('shared', 'internal', assignedBy, 'Secure public review link generated.')]
      : []),
  ]
  const status = shareEnabled ? 'sent' : 'draft'
  const signatureStatus = 'not-started'
  const payload = {
    acknowledgedAt: '',
    assignedAt: now,
    assignedBy,
    assignmentId,
    auditEvents,
    documentId,
    expiresAt: text(body?.expiresAt, addDaysIso(30)),
    locale,
    partnerBusinessName,
    partnerContactName,
    partnerEmail,
    partnerId: text(body?.partnerId),
    shareEnabled,
    signatureStatus,
    signedAt: '',
    status,
    updatedAt: now,
    version: documentVersion,
  }
  const row = {
    assignment_id: assignmentId,
    assigned_at: now,
    assigned_by: assignedBy,
    created_at: now,
    document_id: documentId,
    document_version: documentVersion,
    expires_at: payload.expiresAt,
    locale,
    partner_business_name: partnerBusinessName,
    partner_contact_name: partnerContactName,
    partner_email: partnerEmail,
    partner_id: payload.partnerId,
    payload_json: payload,
    share_enabled: shareEnabled,
    share_last_created_at: shareEnabled ? now : null,
    share_token_hash: publicToken ? hashPublicToken(publicToken) : null,
    signature_status: signatureStatus,
    signed_at: null,
    status,
    updated_at: now,
  }

  const result = await upsertSupabaseRow('agreement_assignments', row, 'assignment_id')
  if (!result.ok) return result

  const record = Array.isArray(result.body) ? result.body[0] : result.body
  return {
    ok: true,
    record,
    publicToken,
    publicUrl,
    status: 200,
  }
}

export async function updateAgreementRecord(body) {
  const assignmentId = text(body?.assignmentId)
  if (!isAgreementAssignmentId(assignmentId)) {
    return invalidResult(400, 'A valid agreement assignment id is required.')
  }

  const current = await getAgreementRecordById(assignmentId)
  if (!current.ok) return current

  const assignment = mapAgreementRecord(current.record)
  const now = new Date().toISOString()
  let status = assignment.status
  let signatureStatus = assignment.signatureStatus
  let shareEnabled = assignment.shareEnabled
  let shareTokenHash
  const auditEvents = Array.isArray(assignment.auditEvents) ? [...assignment.auditEvents] : []

  if (body?.revokeShare) {
    shareEnabled = false
    status = status === 'signed' ? status : 'revoked'
    auditEvents.unshift(createAuditEvent('share-revoked', 'internal', 'CasaMia Operations', 'Public review link revoked.'))
  } else if (assignmentStatuses.has(body?.status)) {
    status = body.status
    signatureStatus = status === 'signed'
      ? 'signed'
      : status === 'ready-for-signature'
        ? 'signature-ready'
        : signatureStatus
    auditEvents.unshift(createAuditEvent('status-changed', 'internal', 'CasaMia Operations', `Status changed to ${status}.`))
  }

  const payload = {
    ...assignment,
    auditEvents,
    shareEnabled,
    signatureStatus,
    status,
    updatedAt: now,
  }
  const updatePayload = {
    payload_json: payload,
    share_enabled: shareEnabled,
    signature_status: signatureStatus,
    signed_at: status === 'signed' ? now : current.record.signed_at,
    status,
    updated_at: now,
  }

  if (body?.revokeShare) {
    shareTokenHash = null
    updatePayload.share_token_hash = shareTokenHash
  }

  const result = await updateSupabaseRows(
    'agreement_assignments',
    updatePayload,
    `assignment_id=eq.${encodeURIComponent(assignmentId)}&select=${agreementSelection}`,
  )
  if (!result.ok) return result

  const record = Array.isArray(result.body) ? result.body[0] : result.body
  return { ok: true, record, status: 200 }
}

export async function recordAgreementPublicView(record) {
  const assignment = mapAgreementRecord(record)
  const now = new Date().toISOString()

  if (Date.parse(assignment.expiresAt) <= Date.now()) {
    return updateAgreementPublicRecord(record, {
      ...assignment,
      auditEvents: [
        createAuditEvent('status-changed', 'system', 'Agreement system', 'Public link expired.'),
        ...assignment.auditEvents,
      ],
      status: 'expired',
      updatedAt: now,
    })
  }

  if (assignment.status !== 'sent') {
    return { ok: true, record, status: 200 }
  }

  return updateAgreementPublicRecord(record, {
    ...assignment,
    auditEvents: [
      createAuditEvent('viewed-public', 'partner', assignment.partnerBusinessName, 'Public agreement link viewed.'),
      ...assignment.auditEvents,
    ],
    status: 'viewed',
    updatedAt: now,
  })
}

export async function acknowledgeAgreementPublicRecord(record, acceptedBy) {
  const name = text(acceptedBy).slice(0, 160)
  if (!name) {
    return invalidResult(400, 'A review contact name is required.')
  }

  const assignment = mapAgreementRecord(record)
  const now = new Date().toISOString()
  return updateAgreementPublicRecord(record, {
    ...assignment,
    acknowledgedAt: now,
    auditEvents: [
      createAuditEvent('acknowledged-public', 'partner', name, 'Partner confirmed document review. This is not a digital signature.'),
      ...assignment.auditEvents,
    ],
    signatureStatus: 'provider-review',
    status: 'under-review',
    updatedAt: now,
  })
}

export function mapAgreementRecord(record, options = {}) {
  const payload = record?.payload_json && typeof record.payload_json === 'object'
    ? record.payload_json
    : {}
  const status = assignmentStatuses.has(record?.status) ? record.status : text(payload.status, 'draft')
  const signatureStatus = signatureStatuses.has(record?.signature_status)
    ? record.signature_status
    : text(payload.signatureStatus, 'not-started')

  return {
    acknowledgedAt: text(payload.acknowledgedAt),
    assignedAt: text(record?.assigned_at ?? payload.assignedAt),
    assignedBy: text(record?.assigned_by ?? payload.assignedBy, 'CasaMia Operations'),
    assignmentId: text(record?.assignment_id ?? payload.assignmentId),
    auditEvents: Array.isArray(payload.auditEvents) ? payload.auditEvents : [],
    documentId: text(record?.document_id ?? payload.documentId),
    expiresAt: text(record?.expires_at ?? payload.expiresAt),
    locale: normaliseLocale(record?.locale ?? payload.locale),
    partnerBusinessName: text(record?.partner_business_name ?? payload.partnerBusinessName),
    partnerContactName: text(record?.partner_contact_name ?? payload.partnerContactName),
    partnerEmail: text(record?.partner_email ?? payload.partnerEmail),
    partnerId: text(record?.partner_id ?? payload.partnerId),
    publicToken: options.publicToken,
    publicUrl: options.publicUrl,
    shareEnabled: Boolean(record?.share_enabled ?? payload.shareEnabled),
    signatureStatus,
    signedAt: text(record?.signed_at ?? payload.signedAt),
    status,
    updatedAt: text(record?.updated_at ?? payload.updatedAt),
    version: text(record?.document_version ?? payload.version),
  }
}

export function mapPublicAgreementRecord(record) {
  const assignment = mapAgreementRecord(record)

  return {
    acknowledgedAt: assignment.acknowledgedAt,
    assignedAt: assignment.assignedAt,
    assignmentId: assignment.assignmentId,
    auditEvents: [],
    documentId: assignment.documentId,
    expiresAt: assignment.expiresAt,
    locale: assignment.locale,
    partnerBusinessName: assignment.partnerBusinessName,
    partnerContactName: assignment.partnerContactName,
    partnerEmail: assignment.partnerEmail,
    signatureStatus: assignment.signatureStatus,
    signedAt: assignment.signedAt,
    status: assignment.status,
    updatedAt: assignment.updatedAt,
    version: assignment.version,
  }
}

function updateAgreementPublicRecord(record, assignment) {
  return updateSupabaseRows(
    'agreement_assignments',
    {
      payload_json: assignment,
      signature_status: assignment.signatureStatus,
      status: assignment.status,
      updated_at: assignment.updatedAt,
    },
    `assignment_id=eq.${encodeURIComponent(record.assignment_id)}&select=${agreementSelection}`,
  ).then((result) => {
    if (!result.ok) return result
    const updated = Array.isArray(result.body) ? result.body[0] : result.body
    return { ok: true, record: updated, status: 200 }
  })
}

function firstRecord(result) {
  if (!result.ok) return result
  const record = Array.isArray(result.body) ? result.body[0] : undefined
  return record
    ? { ok: true, record, status: 200 }
    : invalidResult(404, 'Agreement not found.')
}

function invalidResult(status, message) {
  return { ok: false, status, body: { message } }
}

function createAgreementAssignmentId() {
  const compactDate = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  return `AGR-${compactDate}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

function createPublicAgreementToken() {
  return crypto.randomBytes(32).toString('base64url')
}

function hashPublicToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function createAuditEvent(eventType, actorType, actor, details = '') {
  return {
    actor,
    actorType,
    at: new Date().toISOString(),
    details,
    eventType,
    id: `evt-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`,
  }
}

function buildPublicAgreementUrl(request, token) {
  const configured = normalizeOrigin(process.env.VITE_SITE_URL || process.env.PUBLIC_SITE_URL || '')
  const forwardedProtocol = getRequestHeader(request, 'x-forwarded-proto').split(',')[0].trim()
  const protocol = forwardedProtocol || (process.env.VERCEL ? 'https' : 'http')
  const host = getRequestHeader(request, 'host')
  const origin = configured || normalizeOrigin(host ? `${protocol}://${host}` : '')
  return `${origin}/agreement/${token}`
}

function addDaysIso(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function normaliseLocale(value) {
  return value === 'en' ? 'en' : 'es'
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function text(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}
