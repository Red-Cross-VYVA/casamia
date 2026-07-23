import {
  readJsonBody,
  requireInternalApiKey,
  selectSupabaseRows,
  sendJson,
  upsertSupabaseRow,
} from '../_lib/supabase.js'

const catalogueRowId = 'default'

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')
    response.end()
    return
  }

  if (!requireInternalApiKey(request, response)) {
    return
  }

  if (request.method === 'GET') {
    const result = await selectSupabaseRows(
      'service_catalogue',
      `id=eq.${encodeURIComponent(catalogueRowId)}&select=id,updated_at,updated_by,payload_json`,
    )

    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    const record = Array.isArray(result.body) ? result.body[0] : undefined

    sendJson(response, 200, {
      ...(record?.payload_json ?? {}),
      updatedAt: record?.updated_at,
      updatedBy: record?.updated_by,
    })
    return
  }

  if (request.method !== 'PUT' && request.method !== 'PATCH') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)

    if (!Array.isArray(body.services)) {
      sendJson(response, 400, { message: 'Service catalogue payload must include a services array.' })
      return
    }

    const payload = {
      id: catalogueRowId,
      updated_at: new Date().toISOString(),
      updated_by: body.updatedBy ?? 'internal-admin',
      payload_json: {
        masterCatalogue: body.masterCatalogue,
        masterCatalogueBackups: Array.isArray(body.masterCatalogueBackups)
          ? body.masterCatalogueBackups.slice(0, 5)
          : undefined,
        packageConfigs: body.packageConfigs,
        services: body.services,
        updatedAt: body.updatedAt ?? new Date().toISOString(),
      },
    }

    const result = await upsertSupabaseRow('service_catalogue', payload)

    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    const record = Array.isArray(result.body) ? result.body[0] : result.body

    sendJson(response, 200, {
      ...(record?.payload_json ?? payload.payload_json),
      updatedAt: record?.updated_at ?? payload.updated_at,
      updatedBy: record?.updated_by ?? payload.updated_by,
    })
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid request.',
    })
  }
}
