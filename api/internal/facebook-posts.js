import {
  deleteFacebookPosts,
  FacebookPublishError,
  getFacebookPublishingConfiguration,
  inspectFacebookPublishingAccess,
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
    response.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')
    response.end()
    return
  }

  if (!requireInternalApiKey(request, response)) {
    return
  }

  if (request.method === 'GET') {
    const config = getFacebookPublishingConfiguration()
    const tokenDiagnostics = await inspectFacebookPublishingAccess()
    delete config.accessToken

    sendJson(response, 200, {
      ...config,
      pageUrl,
      tokenDiagnostics,
    })
    return
  }

  if (!['DELETE', 'POST'].includes(request.method)) {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    if (request.method === 'DELETE') {
      const result = await deleteFacebookPosts({ postIds: body.postIds })
      sendJson(response, result.ok ? 200 : 207, result)
      return
    }

    const result = await publishFacebookPost({
      imagePath: body.imagePath,
      message: body.message,
      request,
    })

    sendJson(response, 200, result)
  } catch (error) {
    const statusCode = error instanceof FacebookPublishError ? error.statusCode : 500
    const details = error instanceof FacebookPublishError ? error.details : undefined

    console.error('Facebook publish failed', {
      details,
      message: error instanceof Error ? error.message : 'Unable to publish Facebook post.',
      statusCode,
    })

    sendJson(response, statusCode, {
      details,
      message: error instanceof Error ? error.message : 'Unable to publish Facebook post.',
    })
  }
}
