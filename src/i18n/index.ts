import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import es from './locales/es.json'

const resources = {
  en: { translation: en },
  es: { translation: es },
}

const supportedLanguages = Object.keys(resources)
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
const hasPrerenderedMarkup = isBrowser && Boolean(document.getElementById('root')?.hasChildNodes())
export const preferredBrowserLanguage = isBrowser
  ? window.localStorage.getItem('casamia-language') ?? window.navigator.language.split('-')[0]
  : null
const initialLanguage = hasPrerenderedMarkup
  ? document.documentElement.lang
  : supportedLanguages.includes(preferredBrowserLanguage ?? '')
    ? preferredBrowserLanguage
    : 'en'

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
  if (isBrowser) {
    document.documentElement.lang = language
    window.localStorage.setItem('casamia-language', language)
  }
})

if (isBrowser) {
  document.documentElement.lang = i18n.language
}

export default i18n
