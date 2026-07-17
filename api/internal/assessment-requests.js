import {
  readJsonBody,
  requireInternalApiKey,
  selectSupabaseRows,
  sendJson,
  updateSupabaseRows,
} from '../_lib/supabase.js'

export const assessmentRequestStatuses = [
  'New',
  'Contacting',
  'Visit Scheduled',
  'In Progress',
  'Report Pending',
  'Proposal Sent',
  'Completed',
  'Cancelled',
]

const selection = [
  'id',
  'submitted_at',
  'type',
  'status',
  'customer_name',
  'customer_email',
  'customer_phone',
  'city_area',
  'preferred_contact_method',
  'preferred_assessment_date',
  'selected_plan',
  'source',
  'message',
  'payload_json',
].join(',')

export function mapAssessmentRequestRecord(record) {
  const payload = record?.payload_json && typeof record.payload_json === 'object'
    ? record.payload_json
    : {}

  return {
    city: text(record?.city_area),
    email: text(record?.customer_email),
    id: text(record?.id),
    message: text(record?.message),
    name: text(record?.customer_name),
    phone: text(record?.customer_phone),
    preferredContactMethod: text(record?.preferred_contact_method),
    preferredDate: text(record?.preferred_assessment_date),
    selectedPlan: text(record?.selected_plan),
    source: text(record?.source),
    status: text(record?.status) || 'New',
    submittedAt: text(record?.submitted_at),
    type: text(record?.type),
    wizardReference: text(payload.wizardReference),
  }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }
  if (!requireInternalApiKey(request, response)) return

  if (request.method === 'GET') {
    const result = await selectSupabaseRows(
      'assessment_requests',
      `select=${selection}&order=submitted_at.desc&limit=500`,
    )
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }
    sendJson(response, 200, {
      requests: (Array.isArray(result.body) ? result.body : []).map(mapAssessmentRequestRecord),
    })
    return
  }

  if (request.method !== 'PATCH') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    if (!isUuid(body.id)) {
      sendJson(response, 400, { message: 'A valid assessment request id is required.' })
      return
    }
    if (!assessmentRequestStatuses.includes(body.status)) {
      sendJson(response, 400, { message: 'Choose a valid assessment status.' })
      return
    }

    const result = await updateSupabaseRows(
      'assessment_requests',
      { status: body.status },
      `id=eq.${encodeURIComponent(body.id)}&select=${selection}`,
    )
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }
    const record = Array.isArray(result.body) ? result.body[0] : undefined
    if (!record) {
      sendJson(response, 404, { message: 'Assessment request not found.' })
      return
    }
    sendJson(response, 200, { request: mapAssessmentRequestRecord(record) })
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid request.' })
  }
}

function isUuid(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function text(value) {
  return typeof value === 'string' ? value : ''
}
