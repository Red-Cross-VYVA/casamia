export type RouteLanguage = 'en' | 'es'

export function getRouteLanguage(pathname: string): RouteLanguage {
  return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en'
}

export function getLanguageBasename(pathname: string) {
  return getRouteLanguage(pathname) === 'es' ? '/es' : undefined
}

export function getLogicalPublicPath(pathname: string) {
  if (pathname === '/es') {
    return '/'
  }

  if (pathname.startsWith('/es/')) {
    return pathname.slice(3) || '/'
  }

  return pathname || '/'
}

export function getLocalizedPublicPath(pathname: string, language: RouteLanguage) {
  const logicalPath = getLogicalPublicPath(pathname)

  if (language === 'es') {
    return logicalPath === '/' ? '/es' : `/es${logicalPath}`
  }

  return logicalPath
}
