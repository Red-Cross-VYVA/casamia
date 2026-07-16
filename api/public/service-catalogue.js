import { selectSupabaseRows, sendJson } from '../_lib/supabase.js'

const catalogueRowId = 'default'

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    response.end()
    return
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const result = await selectSupabaseRows(
    'service_catalogue',
    `id=eq.${encodeURIComponent(catalogueRowId)}&select=id,updated_at,payload_json`,
  )

  if (!result.ok) {
    sendJson(response, result.status, result.body)
    return
  }

  const record = Array.isArray(result.body) ? result.body[0] : undefined

  sendJson(response, 200, {
    ...(record?.payload_json ?? {}),
    updatedAt: record?.updated_at,
  })
}
