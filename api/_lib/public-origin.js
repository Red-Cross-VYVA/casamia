export function getRequestHeader(request, name) {
  const value = request.headers?.[name] ?? request.headers?.[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value || request.headers?.get?.(name) || ''
}

export function normalizeOrigin(value) {
  try {
    return new URL(value).origin
  } catch {
    return ''
  }
}

export function isAllowedPublicOrigin(request, env = process.env) {
  const origin = normalizeOrigin(getRequestHeader(request, 'origin'))
  if (!origin) return false

  const forwardedProtocol = getRequestHeader(request, 'x-forwarded-proto').split(',')[0].trim()
  const protocol = forwardedProtocol || (env.VERCEL ? 'https' : 'http')
  const host = getRequestHeader(request, 'host')

  if (host && origin === normalizeOrigin(`${protocol}://${host}`)) return true

  const configuredOrigins = [
    env.VITE_SITE_URL,
    env.VITE_PUBLIC_SITE_API_URL,
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '',
    env.VERCEL_BRANCH_URL ? `https://${env.VERCEL_BRANCH_URL}` : '',
    ...(env.CASAMIA_ALLOWED_ORIGINS || '').split(','),
  ].map((value) => normalizeOrigin(value?.trim() || '')).filter(Boolean)

  if (configuredOrigins.includes(origin)) return true

  const isProduction = env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production'
  return !isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
}

export function applyPublicCors(request, response, env = process.env) {
  if (!isAllowedPublicOrigin(request, env)) return false

  const origin = normalizeOrigin(getRequestHeader(request, 'origin'))
  response.setHeader('Access-Control-Allow-Origin', origin)
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Vary', 'Origin')
  return true
}
