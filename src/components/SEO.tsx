import { useEffect } from 'react'

const defaultSiteUrl = 'https://casamia.com.es'

type SEOProps = {
  title: string
  description: string
  path?: string
  noindex?: boolean
  schema?: Record<string, unknown> | Record<string, unknown>[]
}

export function SEO({
  title,
  description,
  path = '/',
  noindex = false,
  schema,
}: SEOProps) {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || defaultSiteUrl
    const canonicalUrl = new URL(path, siteUrl).toString()
    const fullTitle = title.includes('CasaMia') ? title : `${title} | CasaMia`

    document.title = fullTitle
    setMeta('description', description)
    setMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow')
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:url', canonicalUrl, 'property')
    setMeta('og:type', 'website', 'property')
    setMeta('twitter:card', 'summary_large_image')
    setCanonical(canonicalUrl)
    setSchema(schema)
  }, [description, noindex, path, schema, title])

  return null
}

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.content = content
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }

  element.href = href
}

function setSchema(schema?: Record<string, unknown> | Record<string, unknown>[]) {
  document.querySelectorAll('script[data-casamia-schema]').forEach((element) => {
    element.remove()
  })

  if (!schema) {
    return
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.dataset.casamiaSchema = 'true'
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}
