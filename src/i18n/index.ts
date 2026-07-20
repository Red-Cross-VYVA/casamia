import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import es from './locales/es.json'

const resources = {
  en: { translation: en },
  es: { translation: es },
}

const supportedLanguages = Object.keys(resources)
const savedLanguage = window.localStorage.getItem('casamia-language')
const browserLanguage = window.navigator.language.split('-')[0]
const initialLanguage = supportedLanguages.includes(savedLanguage ?? '')
  ? savedLanguage
  : supportedLanguages.includes(browserLanguage)
    ? browserLanguage
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
  document.documentElement.lang = language
  window.localStorage.setItem('casamia-language', language)
})

document.documentElement.lang = i18n.language

export default i18n
