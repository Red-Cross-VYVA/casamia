import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import es from './locales/es.json'

const resources = {
  en: { translation: en },
  es: { translation: es },
}

const supportedLanguages = Object.keys(resources)
const routeLanguage = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : ''
const initialLanguage = routeLanguage === 'es' ? 'es' : 'en'

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage ?? 'en',
  fallbackLng: 'en',
  supportedLngs: supportedLanguages,
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (language) => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return
  }

  document.documentElement.lang = language
  window.localStorage.setItem('casamia-language', language)
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language
}

export default i18n
