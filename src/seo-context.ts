import { createContext } from 'react'

export type ResolvedSEO = {
  title: string
  description: string
  canonicalUrl: string
  socialImageUrl: string
  noindex: boolean
  language: 'en' | 'es'
  alternateUrls: {
    en: string
    es: string
    xDefault: string
  }
  schema: Record<string, unknown>[]
}

export const SEOCollectorContext = createContext<((seo: ResolvedSEO) => void) | null>(null)
