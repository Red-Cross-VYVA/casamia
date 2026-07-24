import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { CASAMIA_CONTACT_EMAIL, CASAMIA_CONTACT_PHONE } from '../constants/contact'

const defaultSiteUrl = 'https://casamia.com.es'
const defaultSocialImage = '/images/solutions/portrait-lovely-couple-together.jpg'
const defaultSocialImageWidth = '1200'
const defaultSocialImageHeight = '630'

type SEOProps = {
  title: string
  description: string
  path?: string
  image?: string
  noindex?: boolean
  schema?: Record<string, unknown> | Record<string, unknown>[]
}

export function SEO({
  title,
  description,
  path = '/',
  image = defaultSocialImage,
  noindex = false,
  schema,
}: SEOProps) {
  const { i18n } = useTranslation()

  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || defaultSiteUrl
    const canonicalUrl = new URL(path, siteUrl).toString()
    const socialImageUrl = new URL(image, siteUrl).toString()
    const fullTitle = title.includes('CasaMia') ? title : `${title} | CasaMia`
    const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'

    document.title = fullTitle
    document.documentElement.lang = language
    setMeta('description', description)
    setMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow')
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:url', canonicalUrl, 'property')
    setMeta('og:site_name', 'CasaMia', 'property')
    setMeta('og:type', 'website', 'property')
    setMeta('og:locale', language === 'es' ? 'es_ES' : 'en_IE', 'property')
    setMeta('og:locale:alternate', language === 'es' ? 'en_IE' : 'es_ES', 'property')
    setMeta('og:image', socialImageUrl, 'property')
    setMeta('og:image:secure_url', socialImageUrl, 'property')
    setMeta('og:image:type', getImageMimeType(socialImageUrl), 'property')
    setMeta('og:image:width', defaultSocialImageWidth, 'property')
    setMeta('og:image:height', defaultSocialImageHeight, 'property')
    setMeta('og:image:alt', fullTitle, 'property')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description)
    setMeta('twitter:image', socialImageUrl)
    setMeta('twitter:image:alt', fullTitle)
    setCanonical(canonicalUrl)
    setSchema(buildSchemas(siteUrl, language, schema))
  }, [description, i18n.language, image, noindex, path, schema, title])

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

function getImageMimeType(url: string) {
  const pathname = new URL(url).pathname.toLowerCase()

  if (pathname.endsWith('.png')) {
    return 'image/png'
  }

  if (pathname.endsWith('.webp')) {
    return 'image/webp'
  }

  return 'image/jpeg'
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

function buildSchemas(
  siteUrl: string,
  language: 'en' | 'es',
  pageSchema?: Record<string, unknown> | Record<string, unknown>[],
) {
  const baseSchemas: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'CasaMia',
      url: siteUrl,
      email: CASAMIA_CONTACT_EMAIL,
      telephone: CASAMIA_CONTACT_PHONE || undefined,
      areaServed: [
        {
          '@type': 'Country',
          name: 'Spain',
        },
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: language === 'es' ? 'Atención al cliente' : 'Customer support',
          email: CASAMIA_CONTACT_EMAIL,
          telephone: CASAMIA_CONTACT_PHONE || undefined,
          availableLanguage: ['English', 'Spanish'],
        },
      ],
      knowsAbout: [
        'senior home adaptation',
        'home safety assessment',
        'bathroom safety for seniors',
        'fall prevention at home',
        'Plan Adapta grants',
        'aging in place',
      ],
      sameAs: [],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'CasaMia',
      url: siteUrl,
      inLanguage: language === 'es' ? 'es-ES' : 'en',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      mainEntity: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/blog?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ]

  const extraSchemas = Array.isArray(pageSchema) ? pageSchema : pageSchema ? [pageSchema] : []

  return [...baseSchemas, ...extraSchemas]
}
