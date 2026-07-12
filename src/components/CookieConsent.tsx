import { useEffect, useState } from 'react'

import {
  acceptAllCookies,
  getCookieConsent,
  rejectOptionalCookies,
  saveCookieConsent,
  type CookieConsentPreferences,
} from '../utils/cookieConsent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [configuring, setConfiguring] = useState(false)
  const [preferences, setPreferences] = useState<CookieConsentPreferences>({
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const existing = getCookieConsent()
    if (existing) {
      setPreferences({ analytics: existing.analytics, marketing: existing.marketing })
    } else {
      setVisible(true)
    }

    function openPreferences() {
      const latest = getCookieConsent()
      setPreferences({
        analytics: latest?.analytics ?? false,
        marketing: latest?.marketing ?? false,
      })
      setConfiguring(true)
      setVisible(true)
    }

    window.addEventListener('casamia:open-cookie-preferences', openPreferences)
    return () => window.removeEventListener('casamia:open-cookie-preferences', openPreferences)
  }, [])

  if (!visible) return null

  return (
    <section className="cookie-consent" aria-label="Cookie preferences" aria-live="polite">
      <div>
        <p className="eyebrow">Cookie choices</p>
        <h2>Choose how CasaMia uses optional cookies</h2>
        <p>
          Essential cookies keep language and core site functions working. Analytics and marketing stay off unless you
          choose them.
        </p>
      </div>

      {configuring ? (
        <div className="cookie-consent-options">
          <label>
            <input type="checkbox" checked disabled />
            <span>
              <strong>Essential</strong>
              Required for security, forms and language preference.
            </span>
          </label>
          <label>
            <input
              checked={preferences.analytics}
              type="checkbox"
              onChange={(event) => setPreferences((current) => ({ ...current, analytics: event.target.checked }))}
            />
            <span>
              <strong>Analytics</strong>
              Helps us understand page performance after consent.
            </span>
          </label>
          <label>
            <input
              checked={preferences.marketing}
              type="checkbox"
              onChange={(event) => setPreferences((current) => ({ ...current, marketing: event.target.checked }))}
            />
            <span>
              <strong>Marketing</strong>
              Allows campaign measurement after consent.
            </span>
          </label>
        </div>
      ) : null}

      <div className="cookie-consent-actions">
        <button
          type="button"
          onClick={() => {
            acceptAllCookies()
            setVisible(false)
          }}
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => {
            rejectOptionalCookies()
            setVisible(false)
          }}
        >
          Reject all
        </button>
        {configuring ? (
          <button
            type="button"
            onClick={() => {
              saveCookieConsent(preferences)
              setVisible(false)
            }}
          >
            Save choices
          </button>
        ) : (
          <button type="button" onClick={() => setConfiguring(true)}>
            Configure
          </button>
        )}
      </div>
    </section>
  )
}
