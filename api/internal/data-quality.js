import {
  deleteSupabaseRows,
  readJsonBody,
  requireInternalApiKey,
  selectSupabaseRows,
  sendJson,
} from '../_lib/supabase.js'

const deleteConfirmation = 'DELETE BLANK RECORD'

const sources = {
  contact: {
    key: 'id',
    selection: 'id,submitted_at,type,customer_name,customer_email,customer_phone,message',
    table: 'contact_requests',
  },
  order: {
    key: 'id',
    selection: 'id,order_id,created_at,customer_name,customer_email,customer_phone,plan_id,plan_label,payload_json',
    table: 'orders',
  },
  provider: {
    key: 'application_id',
    selection: 'application_id,created_at,business_name,contact_name,email,phone,cities,trades,experience',
    table: 'provider_applications',
  },
  withdrawal: {
    key: 'id',
    selection: 'id,submitted_at,customer_name,order_reference,installation_address,contact,order_date,submission_date',
    table: 'withdrawal_requests',
  },
}

export function isCompletelyBlankLegacyRecord(kind, record) {
  if (kind === 'provider') {
    return blank(record?.business_name)
      && blank(record?.contact_name)
      && blank(record?.email)
      && blank(record?.phone)
      && blank(record?.experience)
      && emptyList(record?.cities)
      && emptyList(record?.trades)
  }

  if (kind === 'order') {
    const payload = record?.payload_json && typeof record.payload_json === 'object' ? record.payload_json : {}
    return blank(record?.customer_name)
      && blank(record?.customer_email)
      && blank(record?.customer_phone)
      && blank(record?.plan_id)
      && blank(record?.plan_label)
      && emptyObject(payload)
  }

  if (kind === 'contact') {
    return blank(record?.customer_name)
      && blank(record?.customer_email)
      && blank(record?.customer_phone)
      && blank(record?.message)
  }

  if (kind === 'withdrawal') {
    return blank(record?.customer_name)
      && blank(record?.order_reference)
      && blank(record?.installation_address)
      && blank(record?.contact)
      && blank(record?.order_date)
      && blank(record?.submission_date)
  }

  return false
}

export function mapBlankLegacyRecord(kind, record) {
  const source = sources[kind]
  const recordKey = text(record?.[source.key])
  const reference = kind === 'provider'
    ? recordKey
    : kind === 'order'
      ? text(record?.order_id) || recordKey
      : recordKey

  return {
    createdAt: text(record?.created_at ?? record?.submitted_at),
    kind,
    recordKey,
    reference,
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
    const records = []

    for (const [kind, source] of Object.entries(sources)) {
      const result = await selectSupabaseRows(
        source.table,
        `select=${source.selection}&order=${source.key}.asc&limit=500`,
      )
      if (!result.ok) {
        sendJson(response, result.status, result.body)
        return
      }

      records.push(...(Array.isArray(result.body) ? result.body : [])
        .filter((record) => isCompletelyBlankLegacyRecord(kind, record))
        .map((record) => mapBlankLegacyRecord(kind, record)))
    }

    sendJson(response, 200, { records })
    return
  }

  if (request.method !== 'DELETE') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const kind = text(body.kind)
    const recordKey = text(body.recordKey)
    const source = sources[kind]

    if (!source || !/^[A-Za-z0-9_-]{1,128}$/.test(recordKey)) {
      sendJson(response, 400, { message: 'Choose a valid blank record.' })
      return
    }
    if (body.confirmation !== deleteConfirmation) {
      sendJson(response, 400, { message: 'Deletion confirmation is required.' })
      return
    }

    const lookup = await selectSupabaseRows(
      source.table,
      `${source.key}=eq.${encodeURIComponent(recordKey)}&select=${source.selection}&limit=1`,
    )
    if (!lookup.ok) {
      sendJson(response, lookup.status, lookup.body)
      return
    }

    const record = Array.isArray(lookup.body) ? lookup.body[0] : undefined
    if (!record) {
      sendJson(response, 404, { message: 'Blank record not found.' })
      return
    }
    if (!isCompletelyBlankLegacyRecord(kind, record)) {
      sendJson(response, 409, { message: 'This record now contains customer or operational data and cannot be deleted here.' })
      return
    }

    const result = await deleteSupabaseRows(
      source.table,
      `${source.key}=eq.${encodeURIComponent(recordKey)}`,
    )
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    sendJson(response, 200, { deleted: true, kind, recordKey })
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid cleanup request.' })
  }
}

function blank(value) {
  return typeof value !== 'string' || value.trim() === ''
}

function emptyList(value) {
  return !Array.isArray(value) || value.length === 0
}

function emptyObject(value) {
  return value !== null && !Array.isArray(value) && typeof value === 'object' && Object.keys(value).length === 0
}

function text(value) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
}
