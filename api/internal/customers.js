import {
  readJsonBody,
  requireInternalApiKey,
  selectSupabaseRows,
  sendJson,
  upsertSupabaseRow,
} from '../_lib/supabase.js'

const lifecycleStatuses = ['New', 'Contacted', 'Visit booked', 'Proposal sent', 'Won', 'Lost']

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }
  if (!requireInternalApiKey(request, response)) return

  if (request.method === 'GET') {
    const result = await selectSupabaseRows('customer_crm_records', 'select=*&order=updated_at.desc&limit=2000')
    sendJson(response, result.status, result.ok ? { customers: result.body.map(mapRecord) } : result.body)
    return
  }

  if (request.method !== 'PATCH') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const validationError = validate(body)
    if (validationError) {
      sendJson(response, 400, { message: validationError })
      return
    }

    const payload = {
      customer_key: body.customerKey.trim(),
      internal_notes: clean(body.internalNotes),
      lifecycle_status: body.lifecycleStatus,
      next_action: clean(body.nextAction),
      next_action_due_at: body.nextActionDueAt || null,
      owner: clean(body.owner),
      owner_email: clean(body.ownerEmail).toLowerCase(),
      updated_at: new Date().toISOString(),
    }
    const result = await upsertSupabaseRow('customer_crm_records', payload, 'customer_key')
    const record = Array.isArray(result.body) ? result.body[0] : result.body
    sendJson(response, result.status, result.ok ? { customer: mapRecord(record) } : result.body)
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid customer update.' })
  }
}

function validate(body) {
  if (typeof body.customerKey !== 'string' || !body.customerKey.trim() || body.customerKey.length > 220) return 'A valid customer key is required.'
  if (!lifecycleStatuses.includes(body.lifecycleStatus)) return 'Choose a valid lifecycle status.'
  if (!validText(body.owner, 160)) return 'Owner is too long.'
  if (!validText(body.ownerEmail, 254) || (body.ownerEmail && !isEmail(body.ownerEmail))) return 'Enter a valid owner email.'
  if (!validText(body.internalNotes, 8000)) return 'Internal notes are too long.'
  if (!validText(body.nextAction, 500)) return 'Next action is too long.'
  if (body.nextActionDueAt && Number.isNaN(Date.parse(body.nextActionDueAt))) return 'Choose a valid next action due date.'
  return ''
}

function validText(value, max) { return value == null || (typeof value === 'string' && value.length <= max) }
function clean(value) { return typeof value === 'string' ? value.trim() : '' }
function isEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value)) }
function mapRecord(row) {
  return {
    customerKey: row.customer_key,
    internalNotes: row.internal_notes || '',
    lifecycleStatus: row.lifecycle_status || 'New',
    nextAction: row.next_action || '',
    nextActionDueAt: row.next_action_due_at || '',
    owner: row.owner || '',
    ownerEmail: row.owner_email || '',
    updatedAt: row.updated_at || '',
  }
}
