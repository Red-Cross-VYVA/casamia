import { startTransition, useEffect } from 'react'
import i18n from '../i18n'
import { getRouteLanguage } from '../services/localizedRoutes'

export function PreferredLanguageSync() {
  useEffect(() => {
    const routeLanguage = getRouteLanguage(window.location.pathname)
    if (routeLanguage !== i18n.language) {
      startTransition(() => {
        void i18n.changeLanguage(routeLanguage)
      })
    }

    return undefined
  }, [])

  return null
}
