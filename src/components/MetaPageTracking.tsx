import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { trackMetaPageView } from '../utils/metaTracking'

export function MetaPageTracking() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.startsWith('/internal') || location.pathname.startsWith('/partner')) return
    trackMetaPageView()

    const handleConsentChange = () => trackMetaPageView()
    window.addEventListener('casamia:cookie-consent-changed', handleConsentChange)
    return () => window.removeEventListener('casamia:cookie-consent-changed', handleConsentChange)
  }, [location.pathname, location.search])

  return null
}
