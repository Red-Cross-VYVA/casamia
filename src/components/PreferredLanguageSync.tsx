import { startTransition, useEffect } from 'react'
import i18n, { preferredBrowserLanguage } from '../i18n'

export function PreferredLanguageSync() {
  useEffect(() => {
    const preferredLanguage = normalizeSupportedLanguage(preferredBrowserLanguage)
    if (preferredLanguage && preferredLanguage !== i18n.language) {
      startTransition(() => {
        void i18n.changeLanguage(preferredLanguage)
      })
    }

    return undefined
  }, [])

  return null
}

function normalizeSupportedLanguage(language: string | null) {
  const normalized = language?.toLowerCase().split('-')[0]
  return normalized === 'es' || normalized === 'en' ? normalized : null
}
