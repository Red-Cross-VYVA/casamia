const defaultGraphApiVersion = 'v26.0'
const defaultPageId = '605133552680332'
const requiredPagePermissions = ['pages_read_engagement', 'pages_manage_posts']
const allowedStarterImagePattern = /^\/brand-assets\/social\/facebook-starter-posts\/0[1-5]-[a-z0-9-]+\.jpg$/
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

async function callGraphApi({
  body,
  config,
  edge,
  method,
}) {
  const graphResponse = await fetch(
    `https://graph.facebook.com/${encodeURIComponent(config.apiVersion)}/${encodeURIComponent(config.pageId)}/${edge}`,
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

  if (!allowedStarterImagePattern.test(path)) {
    throw new FacebookPublishError(400, 'That image is not in the approved Facebook starter post folder.')
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
