const jsonHeaders = {
  'Content-Type': 'application/json',
}

export function sendJson(response, statusCode, body) {
  response.status(statusCode).setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

export function requirePost(request, response) {
  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    response.end()
    return false
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return false
  }

  return true
}

export function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })

    request.on('error', reject)
  })
}

export async function insertSupabaseRow(tableName, payload) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      ok: false,
      status: 500,
      body: {
        message: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.',
      },
    }
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${tableName}`, {
    body: JSON.stringify(payload),
    headers: {
      ...jsonHeaders,
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: 'return=representation',
    },
    method: 'POST',
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : {}

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      body: {
        message: body.message ?? body.error ?? 'Supabase insert failed.',
        details: body.details,
      },
    }
  }

  const record = Array.isArray(body) ? body[0] : body

  return {
    ok: true,
    status: 200,
    body: {
      id: record?.id,
      record,
      status: record?.status ?? payload.status ?? 'New',
    },
  }
}

export async function handleSupabaseInsert(request, response, tableName, mapPayload) {
  if (!requirePost(request, response)) {
    return
  }

  try {
    const body = await readJsonBody(request)
    const payload = mapPayload(body)
    const result = await insertSupabaseRow(tableName, payload)
    sendJson(response, result.status, result.body)
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid request.',
    })
  }
}
