import {
  deleteFacebookPosts,
  FacebookPublishError,
  getFacebookPublishingConfiguration,
  inspectFacebookPublishingAccess,
  inspectInstagramPublishingAccess,
} from '../_lib/facebook.js'
import { getSocialPostArchive, publishAndArchiveSocialPost, syncSocialPostArchive } from '../_lib/social-post-archive.js'
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
    if (new URL(request.url, 'http://localhost').searchParams.get('view') === 'archive') {
      try { sendJson(response, 200, { posts: await getSocialPostArchive() }) }
      catch (error) { sendJson(response, 503, { message: error.message }) }
      return
    }
    const config = getFacebookPublishingConfiguration()
    const [tokenDiagnostics, instagramDiagnostics] = await Promise.all([
      inspectFacebookPublishingAccess(),
      inspectInstagramPublishingAccess(),
    ])
    delete config.accessToken

    sendJson(response, 200, {
      ...config,
      instagramDiagnostics,
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

    if (body.action === 'sync-archive') {
      sendJson(response, 200, await syncSocialPostArchive())
      return
    }

    const platform = typeof body.platform === 'string' ? body.platform : 'facebook'
    const result = await publishAndArchiveSocialPost({
      imagePath: body.imagePath, message: body.message, platform, request,
    })

    sendJson(response, 200, result)
  } catch (error) {
    const statusCode = error instanceof FacebookPublishError ? error.statusCode : 500
    const details = error instanceof FacebookPublishError ? error.details : undefined

    console.error('Social publish failed', {
      details,
      message: error instanceof Error ? error.message : 'Unable to publish social post.',
      statusCode,
    })

    sendJson(response, statusCode, {
      details,
      message: error instanceof Error ? error.message : 'Unable to publish social post.',
    })
  }
}
