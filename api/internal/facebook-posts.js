import {
  FacebookPublishError,
  getFacebookPublishingConfiguration,
  publishFacebookPost,
} from '../_lib/facebook.js'
import {
  readJsonBody,
  requireInternalApiKey,
  sendJson,
} from '../_lib/supabase.js'

const pageUrl = 'https://www.facebook.com/profile.php?id=61574255177723'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')
    response.end()
    return
  }

  if (!requireInternalApiKey(request, response)) {
    return
  }

  if (request.method === 'GET') {
    const config = getFacebookPublishingConfiguration()
    delete config.accessToken

    sendJson(response, 200, {
      ...config,
      pageUrl,
    })
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const result = await publishFacebookPost({
      imagePath: body.imagePath,
      message: body.message,
      request,
    })

    sendJson(response, 200, result)
  } catch (error) {
    const statusCode = error instanceof FacebookPublishError ? error.statusCode : 500

    sendJson(response, statusCode, {
      details: error instanceof FacebookPublishError ? error.details : undefined,
      message: error instanceof Error ? error.message : 'Unable to publish Facebook post.',
    })
  }
}
