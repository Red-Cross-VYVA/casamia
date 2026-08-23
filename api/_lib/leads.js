import {
  selectSupabaseRows,
  updateSupabaseRows,
} from './supabase.js'

export const leadStatuses = ['New', 'Contacted', 'Visit booked', 'Proposal sent', 'Won', 'Lost']
export const leadSources = ['assessment', 'callback']

const commonSelection = [
  'id',
  'submitted_at',
  'status',
  'customer_name',
  'customer_email',
  'customer_phone',
  'message',
  'payload_json',
]

const assessmentSelection = [
  ...commonSelection,
  'type',
  'city_area',
  'preferred_contact_method',
  'preferred_assessment_date',
  'selected_plan',
  'source',
].join(',')

const callbackSelection = commonSelection.join(',')

export async function listLeadRecords() {
  const [assessments, callbacks] = await Promise.all([
    selectSupabaseRows(
      'assessment_requests',
      `select=${assessmentSelection}&order=submitted_at.desc&limit=500`,
    ),
    selectSupabaseRows(
      'contact_requests',
      `type=eq.callback_request&select=${callbackSelection}&order=submitted_at.desc&limit=500`,
    ),
  ])

  if (!assessments.ok) return assessments
  if (!callbacks.ok) return callbacks

  const leads = [
    ...(Array.isArray(assessments.body) ? assessments.body : []).map((record) => mapLeadRecord(record, 'assessment')),
    ...(Array.isArray(callbacks.body) ? callbacks.body : []).map((record) => mapLeadRecord(record, 'callback')),
  ].sort((left, right) => Date.parse(right.submittedAt) - Date.parse(left.submittedAt))

  return { ok: true, status: 200, body: leads }
}

export async function updateLeadRecord(source, id, changes) {
  const table = source === 'assessment' ? 'assessment_requests' : 'contact_requests'
  const selection = source === 'assessment' ? assessmentSelection : callbackSelection
  const typeFilter = source === 'callback' ? '&type=eq.callback_request' : ''
  const existing = await selectSupabaseRows(
    table,
    `id=eq.${encodeURIComponent(id)}${typeFilter}&select=${selection}&limit=1`,
  )
  if (!existing.ok) return existing

  const record = Array.isArray(existing.body) ? existing.body[0] : undefined
  if (!record) return { ok: false, status: 404, body: { message: 'Lead not found.' } }

  const payload = object(record.payload_json)
  const pipeline = object(payload.leadPipeline)
  const nextPipeline = {
    ...pipeline,
    assignedPartnerEmail: normalizeEmail(changes.assignedPartnerEmail),
    followUpAt: text(changes.followUpAt),
    notes: text(changes.notes),
    partnerNotes: text(changes.partnerNotes),
    status: leadStatuses.includes(changes.status) ? changes.status : getLeadStatus(record, source),
    updatedAt: new Date().toISOString(),
  }
  const result = await updateSupabaseRows(
    table,
    { payload_json: { ...payload, leadPipeline: nextPipeline } },
    `id=eq.${encodeURIComponent(id)}${typeFilter}&select=${selection}`,
  )
  if (!result.ok) return result

  const updated = Array.isArray(result.body) ? result.body[0] : undefined
  if (!updated) return { ok: false, status: 404, body: { message: 'Lead not found.' } }
  return { ok: true, status: 200, body: mapLeadRecord(updated, source) }
}

export function mapLeadRecord(record, source) {
  const payload = object(record?.payload_json)
  const pipeline = object(payload.leadPipeline)

  return {
    assignedPartnerEmail: normalizeEmail(pipeline.assignedPartnerEmail),
    city: source === 'assessment' ? text(record?.city_area) : text(payload.city),
    email: text(record?.customer_email),
    followUpAt: text(pipeline.followUpAt),
    id: text(record?.id),
    message: source === 'callback' ? text(payload.note) || text(record?.message) : text(record?.message),
    name: text(record?.customer_name),
    notes: text(pipeline.notes),
    partnerNotes: text(pipeline.partnerNotes),
    phone: text(record?.customer_phone),
    preferredAt: source === 'assessment'
      ? text(record?.preferred_assessment_date) || text(record?.preferred_contact_method)
      : [text(payload.preferredCallbackDate), text(payload.preferredTimeWindow)].filter(Boolean).join(' '),
    selectedPlan: source === 'assessment' ? text(record?.selected_plan) : '',
    source,
    sourceLabel: source === 'assessment' ? 'Assessment' : 'Callback',
    status: leadStatuses.includes(pipeline.status) ? pipeline.status : getLeadStatus(record, source),
    submittedAt: text(record?.submitted_at),
  }
}

function getLeadStatus(record, source) {
  const status = text(record?.status)
  if (status === 'Proposal Sent') return 'Proposal sent'
  if (['Completed'].includes(status)) return source === 'callback' ? 'Contacted' : 'Won'
  if (['Visit Scheduled', 'In Progress', 'Report Pending'].includes(status)) return 'Visit booked'
  if (status === 'Contacting') return 'Contacted'
  if (status === 'Cancelled') return 'Lost'
  return 'New'
}

function normalizeEmail(value) {
  return text(value).trim().toLowerCase()
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function text(value) {
  return typeof value === 'string' ? value : ''
}
