import { hasCookieConsent } from './cookieConsent'

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    dataLayer?: AnalyticsPayload[]
  }
}

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
  const detail = {
    event,
    ...payload,
  }

  window.dispatchEvent(new CustomEvent('casamia:analytics', { detail }))
  if (hasCookieConsent('analytics')) {
    window.dataLayer?.push(detail)
  }
}
