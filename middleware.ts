declare const process: {
  env: Record<string, string | undefined>
}

const protectedPaths = ['/admin/config-preview']
const appShellFallbackPath = '/_app-shell/private'
const appShellFallbackPrefixes = [
  '/agreement/',
  '/estimate/',
  '/internal/proposals/',
  '/proposal/',
]
const legacyConfigureRoomTargets: Record<string, string> = {
  bathroom: '/services/bathroom-safety',
  bedroom: '/services/bedroom-safety',
  connected: '/services/smart-home-safety',
  entrance: '/services/entrance-accessibility',
  movement: '/services/stair-safety',
}

function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="CasaMia Internal", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  })
}

function readCredentials(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Basic ')) {
    return null
  }

  try {
    const decoded = atob(authHeader.slice('Basic '.length))
    const separatorIndex = decoded.indexOf(':')

    if (separatorIndex === -1) {
      return null
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    }
  } catch {
    return null
  }
}

export const config = {
  matcher: [
    '/admin/config-preview',
    '/configure',
    '/agreement/:path*',
    '/estimate/:path*',
    '/internal/proposals/:path*',
    '/proposal/:path*',
  ],
}

function shouldServeAppShell(pathname: string) {
  return appShellFallbackPrefixes.some((path) => pathname.startsWith(path))
}

export default async function middleware(request: Request) {
  const url = new URL(request.url)
  const { pathname, searchParams } = url

  if (pathname === '/configure') {
    const roomTarget = legacyConfigureRoomTargets[searchParams.get('room') ?? '']
    return Response.redirect(new URL(roomTarget ?? '/home-safety-wizard', request.url), 308)
  }

  if (shouldServeAppShell(pathname)) {
    return fetch(new URL(appShellFallbackPath, request.url))
  }

  if (!isProtectedPath(pathname)) {
    return
  }

  const expectedUsername = process.env.CASAMIA_INTERNAL_USERNAME
  const expectedPassword = process.env.CASAMIA_INTERNAL_PASSWORD

  if (!expectedUsername || !expectedPassword) {
    return unauthorized()
  }

  const credentials = readCredentials(request)

  if (credentials?.username === expectedUsername && credentials.password === expectedPassword) {
    return
  }

  return unauthorized()
}
