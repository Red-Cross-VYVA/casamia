import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import i18n, { preferredBrowserLanguage } from './i18n'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')!
const application = (
  <StrictMode>
    <App />
  </StrictMode>
)

void mountApplication()

async function mountApplication() {
  const preferredLanguage = normalizeSupportedLanguage(preferredBrowserLanguage)
  const hasPrerenderedMarkup = root.hasChildNodes()

  if (hasPrerenderedMarkup) {
    hydrateRoot(root, application)
    return
  }

  if (preferredLanguage && preferredLanguage !== i18n.language) {
    await i18n.changeLanguage(preferredLanguage)
  }

  createRoot(root).render(application)
}

function normalizeSupportedLanguage(language: string | null) {
  const normalized = language?.toLowerCase().split('-')[0]
  return normalized === 'es' || normalized === 'en' ? normalized : null
}
