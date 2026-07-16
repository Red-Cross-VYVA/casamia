const protectedPaths = ['/admin/config-preview']

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
  matcher: ['/admin/config-preview'],
}

export default function middleware(request: Request) {
  const { pathname } = new URL(request.url)

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
