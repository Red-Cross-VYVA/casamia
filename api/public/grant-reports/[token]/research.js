import { enrichGrantReport } from '../../../_lib/grant-research.js'
import { applyPublicCors } from '../../../_lib/public-origin.js'
import { sendJson } from '../../../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  const corsAllowed = applyPublicCors(request, response)

  if (request.method === 'OPTIONS') {
    response.status(corsAllowed ? 204 : 403).end()
    return
  }

  if (!corsAllowed) {
    sendJson(response, 403, { message: 'This grant research request is not allowed.' })
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const token = Array.isArray(request.query?.token)
    ? request.query.token[0]
    : String(request.query?.token ?? '')

  try {
    const result = await enrichGrantReport(token)
    if (!result.ok) {
      sendJson(response, result.status === 404 ? 404 : 503, result.body)
      return
    }

    sendJson(response, 200, result.body)
  } catch (error) {
    console.error('Grant research endpoint failed.', {
      errorName: error instanceof Error ? error.name : 'Error',
    })
    sendJson(response, 503, { message: 'Grant research is temporarily unavailable.' })
  }
}
