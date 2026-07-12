export type CookieConsentCategory = 'analytics' | 'marketing'

export type CookieConsentPreferences = {
  analytics: boolean
  marketing: boolean
}

export type CookieConsentRecord = CookieConsentPreferences & {
  timestamp: string
  version: string
}

const cookieConsentKey = 'casamia_cookie_consent'
export const cookieConsentVersion = '1.0'

const defaultPreferences: CookieConsentPreferences = {
  analytics: false,
  marketing: false,
}

export function getCookieConsent(): CookieConsentRecord | null {
  try {
    const stored = window.localStorage.getItem(cookieConsentKey)
    return stored ? (JSON.parse(stored) as CookieConsentRecord) : null
  } catch {
    return null
  }
}

export function hasCookieConsent(category: CookieConsentCategory) {
  return getCookieConsent()?.[category] === true
}

export function saveCookieConsent(preferences: CookieConsentPreferences) {
  const record: CookieConsentRecord = {
    ...defaultPreferences,
    ...preferences,
    timestamp: new Date().toISOString(),
    version: cookieConsentVersion,
  }

  window.localStorage.setItem(cookieConsentKey, JSON.stringify(record))
  window.dispatchEvent(new CustomEvent('casamia:cookie-consent-changed', { detail: record }))

  return record
}

export function acceptAllCookies() {
  return saveCookieConsent({ analytics: true, marketing: true })
}

export function rejectOptionalCookies() {
  return saveCookieConsent(defaultPreferences)
}
