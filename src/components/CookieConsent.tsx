import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  acceptAllCookies,
  getCookieConsent,
  rejectOptionalCookies,
  saveCookieConsent,
  type CookieConsentPreferences,
} from '../utils/cookieConsent'

export function CookieConsent() {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.startsWith('es')
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

  const copy = isSpanish
    ? {
        aria: 'Preferencias de cookies',
        eyebrow: 'Opciones de cookies',
        title: 'Elige cómo CasaMia usa cookies opcionales',
        body:
          'Las cookies esenciales mantienen el idioma y las funciones principales del sitio. Analítica y marketing permanecen desactivados salvo que los elijas.',
        essentialTitle: 'Esenciales',
        essentialBody: 'Necesarias para seguridad, formularios y preferencia de idioma.',
        analyticsTitle: 'Analítica',
        analyticsBody: 'Nos ayuda a entender el rendimiento de las páginas después del consentimiento.',
        marketingTitle: 'Marketing',
        marketingBody: 'Permite medir campañas después del consentimiento.',
        acceptAll: 'Aceptar todo',
        rejectAll: 'Rechazar todo',
        save: 'Guardar opciones',
        configure: 'Configurar',
      }
    : {
        aria: 'Cookie preferences',
        eyebrow: 'Cookie choices',
        title: 'Choose how CasaMia uses optional cookies',
        body:
          'Essential cookies keep language and core site functions working. Analytics and marketing stay off unless you choose them.',
        essentialTitle: 'Essential',
        essentialBody: 'Required for security, forms and language preference.',
        analyticsTitle: 'Analytics',
        analyticsBody: 'Helps us understand page performance after consent.',
        marketingTitle: 'Marketing',
        marketingBody: 'Allows campaign measurement after consent.',
        acceptAll: 'Accept all',
        rejectAll: 'Reject all',
        save: 'Save choices',
        configure: 'Configure',
      }

  return (
    <section className="cookie-consent" aria-label={copy.aria} aria-live="polite">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </div>

      {configuring ? (
        <div className="cookie-consent-options">
          <label>
            <input type="checkbox" checked disabled />
            <span>
              <strong>{copy.essentialTitle}</strong>
              {copy.essentialBody}
            </span>
          </label>
          <label>
            <input
              checked={preferences.analytics}
              type="checkbox"
              onChange={(event) => setPreferences((current) => ({ ...current, analytics: event.target.checked }))}
            />
            <span>
              <strong>{copy.analyticsTitle}</strong>
              {copy.analyticsBody}
            </span>
          </label>
          <label>
            <input
              checked={preferences.marketing}
              type="checkbox"
              onChange={(event) => setPreferences((current) => ({ ...current, marketing: event.target.checked }))}
            />
            <span>
              <strong>{copy.marketingTitle}</strong>
              {copy.marketingBody}
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
          {copy.acceptAll}
        </button>
        <button
          type="button"
          onClick={() => {
            rejectOptionalCookies()
            setVisible(false)
          }}
        >
          {copy.rejectAll}
        </button>
        {configuring ? (
          <button
            type="button"
            onClick={() => {
              saveCookieConsent(preferences)
              setVisible(false)
            }}
          >
            {copy.save}
          </button>
        ) : (
          <button type="button" onClick={() => setConfiguring(true)}>
            {copy.configure}
          </button>
        )}
      </div>
    </section>
  )
}
