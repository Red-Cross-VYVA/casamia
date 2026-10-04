const defaultGraphApiVersion = 'v26.0'
const defaultPageId = '605133552680332'
const requiredPagePermissions = ['pages_read_engagement', 'pages_manage_posts']
const requiredInstagramPermissions = ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement']
const allowedPostImagePatterns = [
  /^\/brand-assets\/social\/facebook-starter-posts\/0[1-5]-[a-z0-9-]+\.jpg$/,
  /^\/brand-assets\/social\/facebook-risk-stat-posts\/0[1-4]-[a-z0-9-]+-es\.jpg$/,
]
const supportedGraphApiVersions = new Set([
  'v26.0',
  'v25.0',
  'v24.0',
  'v23.0',
  'v22.0',
  'v21.0',
  'v20.0',
])

export class FacebookPublishError extends Error {
  constructor(statusCode, message, details = {}) {
    super(message)
    this.name = 'FacebookPublishError'
    this.statusCode = statusCode
    this.details = details
  }
}

export function getFacebookPublishingConfiguration(env = process.env) {
  const pageId = text(env.META_PAGE_ID) || defaultPageId
  const accessToken = text(env.META_PAGE_ACCESS_TOKEN)
  const instagramAccountId = text(env.META_INSTAGRAM_ACCOUNT_ID)
  const requestedApiVersion = text(env.META_GRAPH_API_VERSION)
    || text(env.FACEBOOK_GRAPH_API_VERSION)
    || defaultGraphApiVersion
  const apiVersion = normalizeGraphApiVersion(requestedApiVersion) || defaultGraphApiVersion
  const unsupportedApiVersion = supportedGraphApiVersions.has(requestedApiVersion)
    ? ''
    : requestedApiVersion

  return {
    accessToken,
    apiVersion,
    configured: Boolean(pageId && accessToken && !unsupportedApiVersion),
    missing: [
      pageId ? '' : 'META_PAGE_ID',
      accessToken ? '' : 'META_PAGE_ACCESS_TOKEN',
      unsupportedApiVersion ? `supported META_GRAPH_API_VERSION (use ${defaultGraphApiVersion})` : '',
    ].filter(Boolean),
    instagramAccountId,
    pageId,
    unsupportedApiVersion,
  }
}

export async function inspectFacebookPublishingAccess({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const config = getFacebookPublishingConfiguration(env)

  if (!config.configured) {
    return {
      checked: false,
      missingPermissions: [...requiredPagePermissions],
      pageAccessible: false,
      ready: false,
    }
  }

  const [identityResult, permissionsResult, pageResult] = await Promise.all([
    readGraphApi({ config, fetchImpl, path: 'me', searchParams: { fields: 'id,name' } }),
    readGraphApi({ config, fetchImpl, path: 'me/permissions' }),
    readGraphApi({ config, fetchImpl, path: config.pageId, searchParams: { fields: 'id,name' } }),
  ])
  const permissionRows = Array.isArray(permissionsResult.body?.data)
    ? permissionsResult.body.data
    : []
  const permissionsChecked = permissionsResult.ok
  const grantedPermissions = permissionRows
    .filter((row) => text(row?.status).toLowerCase() === 'granted')
    .map((row) => text(row?.permission))
    .filter(Boolean)
  const missingPermissions = permissionsChecked
    ? requiredPagePermissions.filter((permission) => !grantedPermissions.includes(permission))
    : []
  const identityId = text(identityResult.body?.id)
  const pageMatchesIdentity = Boolean(identityId) && identityId === config.pageId
  const pageAccessible = pageMatchesIdentity
    || pageResult.ok && text(pageResult.body?.id) === config.pageId
  const errors = [identityResult, pageResult]
    .filter((result) => !result.ok)
    .map((result) => result.message)
    .filter(Boolean)

  return {
    checked: true,
    errors,
    grantedPermissions,
    identityId,
    identityName: text(identityResult.body?.name),
    missingPermissions,
    pageAccessible,
    pageMatchesIdentity,
    pageName: text(pageResult.body?.name),
    permissionsChecked,
    permissionsMessage: permissionsChecked ? '' : permissionsResult.message,
    ready: pageAccessible && permissionsChecked && missingPermissions.length === 0,
  }
}

export async function inspectInstagramPublishingAccess({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const config = getFacebookPublishingConfiguration(env)

  if (!config.configured) {
    return {
      accountAccessible: false,
      checked: false,
      configured: false,
      missing: config.missing,
      missingPermissions: [...requiredInstagramPermissions],
      pageLinked: false,
      ready: false,
    }
  }

  const [permissionsResult, linkedAccountResult] = await Promise.all([
    readGraphApi({ config, fetchImpl, path: 'me/permissions' }),
    resolveInstagramAccount({ config, fetchImpl }),
  ])
  const permissionRows = Array.isArray(permissionsResult.body?.data)
    ? permissionsResult.body.data
    : []
  const permissionsChecked = permissionsResult.ok
  const grantedPermissions = permissionRows
    .filter((row) => text(row?.status).toLowerCase() === 'granted')
    .map((row) => text(row?.permission))
    .filter(Boolean)
  const missingPermissions = permissionsChecked
    ? requiredInstagramPermissions.filter((permission) => !grantedPermissions.includes(permission))
    : []
  const accountId = linkedAccountResult.accountId
  const accountResult = accountId
    ? await readGraphApi({
      config,
      fetchImpl,
      path: accountId,
      searchParams: { fields: 'id,username,account_type' },
    })
    : { body: {}, message: linkedAccountResult.message, ok: false }
  const accountAccessible = accountResult.ok && text(accountResult.body?.id) === accountId
  const errors = [linkedAccountResult, accountResult]
    .filter((result) => !result.ok && result.message)
    .map((result) => result.message)

  return {
    accountAccessible,
    accountId,
    accountType: text(accountResult.body?.account_type),
    checked: true,
    configured: config.configured,
    errors,
    grantedPermissions,
    missing: config.missing,
    missingPermissions,
    pageLinked: linkedAccountResult.pageLinked,
    permissionsChecked,
    permissionsMessage: permissionsChecked ? '' : permissionsResult.message,
    ready: Boolean(accountAccessible && (!permissionsChecked || missingPermissions.length === 0)),
    username: text(accountResult.body?.username) || linkedAccountResult.username,
  }
}

export async function publishFacebookPost({
  env = process.env,
  imagePath,
  message,
  request,
} = {}) {
  const config = getFacebookPublishingConfiguration(env)
  const cleanMessage = text(message)
  const cleanImagePath = normalizeStarterImagePath(imagePath)

  if (!config.configured) {
    throw new FacebookPublishError(500, `Facebook publishing is not configured. Add ${config.missing.join(' and ')} in Vercel.`)
  }

  if (!cleanMessage) {
    throw new FacebookPublishError(400, 'Post caption is required.')
  }

  if (cleanImagePath) {
    return publishFacebookPhoto({
      config,
      env,
      imagePath: cleanImagePath,
      message: cleanMessage,
      request,
    })
  }

  return publishFacebookFeedMessage({
    config,
    message: cleanMessage,
  })
}

export async function publishInstagramPost({
  env = process.env,
  fetchImpl = fetch,
  imagePath,
  message,
  request,
} = {}) {
  const config = getFacebookPublishingConfiguration(env)
  const cleanMessage = text(message)
  const cleanImagePath = normalizeStarterImagePath(imagePath)

  if (!config.configured) {
    throw new FacebookPublishError(500, `Instagram publishing is not configured. Add ${config.missing.join(' and ')} in Vercel.`)
  }

  if (!cleanMessage) {
    throw new FacebookPublishError(400, 'Post caption is required.')
  }

  if (!cleanImagePath) {
    throw new FacebookPublishError(400, 'Instagram publishing requires an approved image asset.')
  }

  const instagramAccount = await resolveInstagramAccount({ config, fetchImpl })

  if (!instagramAccount.accountId) {
    throw new FacebookPublishError(400, 'No linked Instagram professional account was found for the CasaMia Facebook Page. Link the Instagram account to the Page or set META_INSTAGRAM_ACCOUNT_ID.')
  }

  return publishInstagramPhoto({
    config,
    env,
    fetchImpl,
    imagePath: cleanImagePath,
    instagramAccountId: instagramAccount.accountId,
    message: cleanMessage,
    request,
  })
}

export async function deleteFacebookPosts({
  env = process.env,
  fetchImpl = fetch,
  postIds,
} = {}) {
  const config = getFacebookPublishingConfiguration(env)

  if (!config.configured) {
    throw new FacebookPublishError(500, `Facebook publishing is not configured. Add ${config.missing.join(' and ')} in Vercel.`)
  }

  if (!Array.isArray(postIds) || postIds.length === 0 || postIds.length > 20) {
    throw new FacebookPublishError(400, 'Provide between 1 and 20 Facebook post IDs.')
  }

  const cleanPostIds = [...new Set(postIds.map(text).filter(Boolean))]
  const expectedPrefix = `${config.pageId}_`

  if (cleanPostIds.length === 0 || cleanPostIds.some((postId) => !postId.startsWith(expectedPrefix))) {
    throw new FacebookPublishError(400, 'Every post ID must belong to the configured CasaMia Facebook Page.')
  }

  const results = []
  for (const postId of cleanPostIds) {
    try {
      const responseBody = await callGraphApi({
        config,
        fetchImpl,
        method: 'DELETE',
        path: postId,
      })
      results.push({ deleted: responseBody.success === true, postId })
    } catch (error) {
      results.push({
        deleted: false,
        message: error instanceof Error ? error.message : 'Facebook post deletion failed.',
        postId,
      })
    }
  }

  return {
    deleted: results.filter((result) => result.deleted).length,
    failed: results.filter((result) => !result.deleted).length,
    ok: results.every((result) => result.deleted),
    results,
  }
}

async function publishFacebookPhoto({
  config,
  env,
  imagePath,
  message,
  request,
}) {
  const publicOrigin = getPublicOrigin(request, env)

  if (!publicOrigin) {
    throw new FacebookPublishError(500, 'Public site URL is not configured, so Meta cannot fetch the post image.')
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(publicOrigin)) {
    throw new FacebookPublishError(400, 'Image posts can only be published from the deployed site because Meta cannot fetch localhost images.')
  }

  const body = new URLSearchParams({
    caption: message,
    published: 'true',
    url: new URL(imagePath, publicOrigin).href,
  })

  const responseBody = await callGraphApi({
    body,
    config,
    edge: 'photos',
    method: 'POST',
  })

  return {
    facebookId: text(responseBody.id),
    facebookPostId: text(responseBody.post_id),
    facebookUrl: responseBody.post_id ? `https://www.facebook.com/${responseBody.post_id}` : '',
    kind: 'photo',
    ok: true,
    provider: 'facebook_pages_api',
  }
}

async function publishFacebookFeedMessage({
  config,
  message,
}) {
  const body = new URLSearchParams({ message })

  const responseBody = await callGraphApi({
    body,
    config,
    edge: 'feed',
    method: 'POST',
  })

  return {
    facebookId: text(responseBody.id),
    facebookPostId: text(responseBody.id),
    facebookUrl: responseBody.id ? `https://www.facebook.com/${responseBody.id}` : '',
    kind: 'feed',
    ok: true,
    provider: 'facebook_pages_api',
  }
}

async function publishInstagramPhoto({
  config,
  env,
  fetchImpl,
  imagePath,
  instagramAccountId,
  message,
  request,
}) {
  const publicOrigin = getPublicOrigin(request, env)

  if (!publicOrigin) {
    throw new FacebookPublishError(500, 'Public site URL is not configured, so Meta cannot fetch the Instagram image.')
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(publicOrigin)) {
    throw new FacebookPublishError(400, 'Instagram image posts can only be published from the deployed site because Meta cannot fetch localhost images.')
  }

  const container = await callGraphApi({
    body: new URLSearchParams({
      caption: message,
      image_url: new URL(imagePath, publicOrigin).href,
    }),
    config,
    fetchImpl,
    method: 'POST',
    path: `${instagramAccountId}/media`,
  })
  const creationId = text(container.id)

  if (!creationId) {
    throw new FacebookPublishError(502, 'Instagram did not return a media container ID.')
  }

  const published = await callGraphApi({
    body: new URLSearchParams({ creation_id: creationId }),
    config,
    fetchImpl,
    method: 'POST',
    path: `${instagramAccountId}/media_publish`,
  })
  const instagramId = text(published.id)
  const permalinkResult = instagramId
    ? await readGraphApi({
      config,
      fetchImpl,
      path: instagramId,
      searchParams: { fields: 'permalink' },
    })
    : { body: {}, ok: false }

  return {
    facebookId: '',
    facebookPostId: '',
    facebookUrl: '',
    instagramId,
    instagramUrl: text(permalinkResult.body?.permalink),
    kind: 'instagram_photo',
    ok: true,
    provider: 'instagram_graph_api',
  }
}

async function resolveInstagramAccount({
  config,
  fetchImpl = fetch,
}) {
  if (config.instagramAccountId) {
    return {
      accountId: config.instagramAccountId,
      message: '',
      ok: true,
      pageLinked: false,
      username: '',
    }
  }

  const result = await readGraphApi({
    config,
    fetchImpl,
    path: config.pageId,
    searchParams: {
      fields: 'instagram_business_account{id,username},connected_instagram_account{id,username}',
    },
  })
  const account = result.body?.instagram_business_account || result.body?.connected_instagram_account
  const accountId = text(account?.id)

  return {
    accountId,
    message: result.ok && !accountId
      ? 'No Instagram professional account is linked to the configured Facebook Page.'
      : result.message,
    ok: result.ok && Boolean(accountId),
    pageLinked: Boolean(accountId),
    username: text(account?.username),
  }
}

async function callGraphApi({
  body,
  config,
  edge,
  fetchImpl = fetch,
  method,
  path,
}) {
  const graphPath = path
    ? path.split('/').map((part) => encodeURIComponent(part)).join('/')
    : `${encodeURIComponent(config.pageId)}/${edge}`
  const graphResponse = await fetchImpl(
    `https://graph.facebook.com/${encodeURIComponent(config.apiVersion)}/${graphPath}`,
    {
      body,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method,
    },
  )
  const responseText = await graphResponse.text()
  const responseBody = parseJson(responseText)

  if (!graphResponse.ok) {
    const graphMessage = text(responseBody?.error?.message)
      || text(responseBody?.message)
      || responseText.slice(0, 500)
      || 'Facebook publishing request failed.'

    throw new FacebookPublishError(
      graphResponse.status >= 400 && graphResponse.status < 500 ? 400 : 502,
      graphMessage,
      {
        graphCode: responseBody?.error?.code,
        graphErrorUserMessage: text(responseBody?.error?.error_user_msg),
        graphErrorUserTitle: text(responseBody?.error?.error_user_title),
        graphFbtraceId: text(responseBody?.error?.fbtrace_id),
        graphStatus: graphResponse.status,
        graphSubcode: responseBody?.error?.error_subcode,
        graphType: text(responseBody?.error?.type),
      },
    )
  }

  return responseBody || {}
}

function getPublicOrigin(request, env) {
  const configuredOrigin = [
    env.CASAMIA_PUBLIC_SITE_URL,
    env.VITE_SITE_URL,
    env.VITE_PUBLIC_SITE_API_URL,
    env.PUBLIC_SITE_URL,
  ].map(text).find(Boolean)

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin)
  }

  const host = getRequestHeader(request, 'host')
  if (!host) return ''

  const forwardedProtocol = getRequestHeader(request, 'x-forwarded-proto').split(',')[0].trim()
  const protocol = forwardedProtocol || (env.VERCEL ? 'https' : 'http')

  return normalizeOrigin(`${protocol}://${host}`)
}

function getRequestHeader(request, name) {
  const direct = request?.headers?.[name] ?? request?.headers?.[name.toLowerCase()]

  if (direct) {
    return Array.isArray(direct) ? direct[0] : direct
  }

  return request?.headers?.get?.(name) || ''
}

function normalizeOrigin(value) {
  try {
    return new URL(value).origin
  } catch {
    return ''
  }
}

async function readGraphApi({
  config,
  fetchImpl,
  path,
  searchParams = {},
}) {
  const url = new URL(
    `https://graph.facebook.com/${encodeURIComponent(config.apiVersion)}/${path
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/')}`,
  )

  Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value))

  try {
    const graphResponse = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${config.accessToken}` },
    })
    const responseText = await graphResponse.text()
    const responseBody = parseJson(responseText)

    return {
      body: responseBody || {},
      message: graphResponse.ok
        ? ''
        : text(responseBody?.error?.message) || `Meta returned HTTP ${graphResponse.status}.`,
      ok: graphResponse.ok,
    }
  } catch (error) {
    return {
      body: {},
      message: error instanceof Error ? error.message : 'Meta access check failed.',
      ok: false,
    }
  }
}

function normalizeGraphApiVersion(value) {
  const cleanValue = text(value)

  return supportedGraphApiVersions.has(cleanValue) ? cleanValue : ''
}

function normalizeStarterImagePath(value) {
  const cleanValue = text(value)

  if (!cleanValue) return ''

  const path = cleanValue.startsWith('/') ? cleanValue : `/${cleanValue}`

  if (!allowedPostImagePatterns.some((pattern) => pattern.test(path))) {
    throw new FacebookPublishError(400, 'That image is not in an approved Facebook post asset folder.')
  }

  return path
}

function parseJson(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}
