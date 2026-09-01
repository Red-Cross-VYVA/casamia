import { track } from '@vercel/analytics'

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
    track(event, payload)
    persistAnalyticsEvent(event, payload)
  }
}

function persistAnalyticsEvent(event: string, payload: AnalyticsPayload) {
  const sessionKey = 'casamia-analytics-session-v1'
  let sessionId = window.sessionStorage.getItem(sessionKey)
  if (!sessionId) {
    sessionId = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem(sessionKey, sessionId)
  }

  const language = typeof payload.language === 'string'
    ? payload.language
    : document.documentElement.lang || window.location.pathname.split('/')[1]
  const flow = typeof payload.flow === 'string'
    ? payload.flow
    : typeof payload.form === 'string'
      ? payload.form
      : typeof payload.source === 'string'
        ? payload.source
        : ''

  void fetch('/api/public/analytics-events', {
    body: JSON.stringify({
      event,
      flow,
      language,
      pathname: window.location.pathname,
      properties: payload,
      sessionId,
    }),
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    method: 'POST',
  }).catch(() => undefined)
}
