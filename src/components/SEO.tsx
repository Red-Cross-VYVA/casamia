import { useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CASAMIA_CONTACT_EMAIL,
  CASAMIA_CONTACT_PHONE,
  CASAMIA_FACEBOOK_URL,
} from '../constants/contact'
import { casamiaCompanyConfig } from '../config/company'
import { getLocalizedPublicPath } from '../services/localizedRoutes'
import { SEOCollectorContext, type ResolvedSEO } from '../seo-context'

const defaultSiteUrl = 'https://www.casamia.com.es'
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
  const collectSEO = useContext(SEOCollectorContext)
  const resolvedSEO = useMemo<ResolvedSEO>(() => {
    const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL || defaultSiteUrl)
    const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
    const englishPath = getLocalizedPublicPath(path, 'en')
    const spanishPath = getLocalizedPublicPath(path, 'es')
    const alternateUrls = {
      en: new URL(englishPath, siteUrl).toString(),
      es: new URL(spanishPath, siteUrl).toString(),
      xDefault: new URL(englishPath, siteUrl).toString(),
    }

    return {
      title: title.includes('CasaMia') ? title : `${title} | CasaMia`,
      description,
      canonicalUrl: language === 'es' ? alternateUrls.es : alternateUrls.en,
      socialImageUrl: new URL(image, siteUrl).toString(),
      noindex,
      language,
      alternateUrls,
      schema: buildSchemas(siteUrl, language, schema),
    }
  }, [description, i18n.language, image, noindex, path, schema, title])

  if (collectSEO) {
    collectSEO(resolvedSEO)
  }

  useEffect(() => {
    const fullTitle = resolvedSEO.title
    const language = resolvedSEO.language

    document.title = fullTitle
    document.documentElement.lang = language
    setMeta('description', resolvedSEO.description)
    setMeta(
      'robots',
      resolvedSEO.noindex
        ? 'noindex,nofollow'
        : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    )
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', resolvedSEO.description, 'property')
    setMeta('og:url', resolvedSEO.canonicalUrl, 'property')
    setMeta('og:site_name', 'CasaMia', 'property')
    setMeta('og:type', 'website', 'property')
    setMeta('og:locale', language === 'es' ? 'es_ES' : 'en_IE', 'property')
    setMeta('og:locale:alternate', language === 'es' ? 'en_IE' : 'es_ES', 'property')
    setMeta('og:image', resolvedSEO.socialImageUrl, 'property')
    setMeta('og:image:secure_url', resolvedSEO.socialImageUrl, 'property')
    setMeta('og:image:type', getImageMimeType(resolvedSEO.socialImageUrl), 'property')
    setMeta('og:image:width', defaultSocialImageWidth, 'property')
    setMeta('og:image:height', defaultSocialImageHeight, 'property')
    setMeta('og:image:alt', fullTitle, 'property')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', resolvedSEO.description)
    setMeta('twitter:image', resolvedSEO.socialImageUrl)
    setMeta('twitter:image:alt', fullTitle)
    setCanonical(resolvedSEO.canonicalUrl)
    setLanguageAlternates(resolvedSEO.alternateUrls)
    setSchema(resolvedSEO.schema)
  }, [resolvedSEO])

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
  const siteHomeUrl = `${siteUrl}/`
  const baseSchemas: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteHomeUrl}#organization`,
      name: 'CasaMia',
      legalName: casamiaCompanyConfig.legalName,
      url: siteHomeUrl,
      logo: `${siteUrl}/brand-assets/casamia-logo-color-on-white.png`,
      email: CASAMIA_CONTACT_EMAIL,
      telephone: CASAMIA_CONTACT_PHONE || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Urbanización Sierra Blanca, Cascada de, n.º 311',
        addressLocality: 'Marbella',
        addressRegion: 'Málaga',
        postalCode: '29602',
        addressCountry: 'ES',
      },
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
      sameAs: [CASAMIA_FACEBOOK_URL],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteHomeUrl}#website`,
      name: 'CasaMia',
      url: siteHomeUrl,
      inLanguage: language === 'es' ? 'es-ES' : 'en',
      publisher: {
        '@id': `${siteHomeUrl}#organization`,
      },
      mainEntity: {
        '@id': `${siteHomeUrl}#organization`,
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

  return normalizeSchemaUrls([...baseSchemas, ...extraSchemas], siteUrl) as Record<string, unknown>[]
}

function setLanguageAlternates(alternateUrls: ResolvedSEO['alternateUrls']) {
  const alternates = [
    ['en', alternateUrls.en],
    ['es', alternateUrls.es],
    ['x-default', alternateUrls.xDefault],
  ] as const

  for (const [hreflang, href] of alternates) {
    let element = document.head.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${hreflang}"]`,
    )

    if (!element) {
      element = document.createElement('link')
      element.rel = 'alternate'
      element.hreflang = hreflang
      document.head.appendChild(element)
    }

    element.href = href
  }
}

function normalizeSiteUrl(value: string) {
  const url = new URL(value)
  url.hash = ''
  url.search = ''
  url.pathname = ''
  return url.toString().replace(/\/$/, '')
}

function normalizeSchemaUrls(value: unknown, siteUrl: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeSchemaUrls(item, siteUrl))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeSchemaUrls(item, siteUrl)]),
    )
  }

  if (typeof value === 'string' && /^https:\/\/(?:www\.)?casamia\.com\.es(?:\/|$)/i.test(value)) {
    const normalized = value.replace(/^https:\/\/(?:www\.)?casamia\.com\.es/i, siteUrl)
    return normalized.replace(`${siteUrl}//`, `${siteUrl}/`)
  }

  return value
}
