import { enrichGrantReport } from '../../../_lib/grant-research.js'
import { applyPublicCors } from '../../../_lib/public-origin.js'
import { reservePublicRequest } from '../../../_lib/public-rate-limit.js'
import { sendJson } from '../../../_lib/supabase.js'

export default async function handler(request, response, dependencies = {}) {
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
    const reservation = await reservePublicRequest(request, {
      callRpc: dependencies.callRpc,
      env: dependencies.env ?? process.env,
      limit: 3,
      scope: 'grant-research',
      windowSeconds: 60 * 60,
    })
    if (!reservation.ok) {
      sendJson(response, reservation.status, {
        message: reservation.status === 429
          ? 'Too many grant research requests. Please wait and try again.'
          : 'Grant research is temporarily unavailable.',
      })
      return
    }

    const enrich = dependencies.enrich ?? enrichGrantReport
    const result = await enrich(token, {
      env: dependencies.env ?? process.env,
      fetchImpl: dependencies.fetchImpl ?? fetch,
    })
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
