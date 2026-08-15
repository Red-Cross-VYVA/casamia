const localePrefixes = ['es'] as const

export type LocalePrefix = (typeof localePrefixes)[number]

export function getPathLocale(pathname: string): LocalePrefix | null {
  const locale = pathname.split('/')[1]

  return localePrefixes.includes(locale as LocalePrefix) ? (locale as LocalePrefix) : null
}

export function stripLocalePrefix(pathname: string) {
  const locale = getPathLocale(pathname)

  if (!locale) {
    return pathname
  }

  const strippedPathname = pathname.slice(locale.length + 1)
  return strippedPathname === '' ? '/' : strippedPathname
}

export function localizeInternalPath(to: string, language: string) {
  if (!to.startsWith('/') || to.startsWith('//')) {
    return to
  }

  const [pathAndSearch, hash = ''] = to.split('#')
  const [pathname, search = ''] = pathAndSearch.split('?')
  const normalizedPathname = stripLocalePrefix(pathname)
  const localizedPathname = language.toLowerCase().startsWith('es')
    ? normalizedPathname === '/'
      ? '/es'
      : `/es${normalizedPathname}`
    : normalizedPathname
  const query = search ? `?${search}` : ''
  const fragment = hash ? `#${hash}` : ''

  return `${localizedPathname}${query}${fragment}`
}
