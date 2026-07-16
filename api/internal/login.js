import {
  createInternalSessionToken,
  readJsonBody,
  requirePost,
  sendJson,
  verifyInternalPassword,
} from '../_lib/supabase.js'

export default async function handler(request, response) {
  if (!requirePost(request, response)) {
    return
  }

  if (!process.env.CASAMIA_INTERNAL_API_KEY) {
    sendJson(response, 500, {
      message: 'Internal access is not configured. Add CASAMIA_INTERNAL_API_KEY in Vercel.',
    })
    return
  }

  try {
    const body = await readJsonBody(request)

    if (!verifyInternalPassword(body.password)) {
      sendJson(response, 401, { message: 'Incorrect admin password.' })
      return
    }

    sendJson(response, 200, createInternalSessionToken())
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid request.',
    })
  }
}
