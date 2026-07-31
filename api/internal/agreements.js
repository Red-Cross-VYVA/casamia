import {
  listAgreementRecords,
  mapAgreementRecord,
  saveAgreementRecord,
  updateAgreementRecord,
} from '../_lib/agreements.js'
import {
  readJsonBody,
  requireInternalApiKey,
  sendJson,
} from '../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  if (!requireInternalApiKey(request, response)) return

  if (request.method === 'GET') {
    const result = await listAgreementRecords()
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    sendJson(response, 200, {
      assignments: (Array.isArray(result.body) ? result.body : []).map((record) => mapAgreementRecord(record)),
    })
    return
  }

  if (request.method === 'POST') {
    try {
      const result = await saveAgreementRecord(await readJsonBody(request), request)
      if (!result.ok) {
        sendJson(response, result.status, result.body)
        return
      }
      sendJson(response, 200, {
        assignment: mapAgreementRecord(result.record, {
          publicToken: result.publicToken || undefined,
          publicUrl: result.publicUrl || undefined,
        }),
      })
    } catch (error) {
      sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid agreement assignment.' })
    }
    return
  }

  if (request.method === 'PATCH') {
    try {
      const result = await updateAgreementRecord(await readJsonBody(request))
      if (!result.ok) {
        sendJson(response, result.status, result.body)
        return
      }
      sendJson(response, 200, { assignment: mapAgreementRecord(result.record) })
    } catch (error) {
      sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid agreement update.' })
    }
    return
  }

  sendJson(response, 405, { message: 'Method not allowed.' })
}
