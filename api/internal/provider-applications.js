import {
  readJsonBody,
  requireInternalApiKey,
  selectSupabaseRows,
  sendJson,
  updateSupabaseRows,
} from '../_lib/supabase.js'

const statuses = ['new', 'reviewing', 'approved', 'not-a-fit']
const selection = [
  'application_id',
  'created_at',
  'status',
  'business_name',
  'contact_name',
  'email',
  'phone',
  'website',
  'cities',
  'trades',
  'experience',
  'availability',
  'insurance_confirmed',
].join(',')

export function mapProviderApplicationRecord(record) {
  return {
    availability: text(record?.availability),
    businessName: text(record?.business_name),
    cities: strings(record?.cities),
    contactName: text(record?.contact_name),
    createdAt: text(record?.created_at),
    email: text(record?.email),
    experience: text(record?.experience),
    id: text(record?.application_id),
    insuranceConfirmed: Boolean(record?.insurance_confirmed),
    phone: text(record?.phone),
    status: statuses.includes(record?.status) ? record.status : 'new',
    trades: strings(record?.trades),
    website: text(record?.website),
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
      'provider_applications',
      `select=${selection}&order=created_at.desc&limit=500`,
    )
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }
    sendJson(response, 200, {
      applications: (Array.isArray(result.body) ? result.body : []).map(mapProviderApplicationRecord),
    })
    return
  }

  if (request.method !== 'PATCH') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const id = text(body.id)
    if (!/^[A-Za-z0-9-]{3,80}$/.test(id)) {
      sendJson(response, 400, { message: 'A valid provider application id is required.' })
      return
    }
    if (!statuses.includes(body.status)) {
      sendJson(response, 400, { message: 'Choose a valid provider application status.' })
      return
    }

    const result = await updateSupabaseRows(
      'provider_applications',
      { status: body.status },
      `application_id=eq.${encodeURIComponent(id)}&select=${selection}`,
    )
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }
    const record = Array.isArray(result.body) ? result.body[0] : undefined
    if (!record) {
      sendJson(response, 404, { message: 'Provider application not found.' })
      return
    }
    sendJson(response, 200, { application: mapProviderApplicationRecord(record) })
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid request.' })
  }
}

function text(value) {
  return typeof value === 'string' ? value : ''
}

function strings(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []
}
