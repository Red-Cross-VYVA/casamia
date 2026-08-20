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

if (root.hasChildNodes()) {
  hydrateRoot(root, application)

  const preferredLanguage = preferredBrowserLanguage
  if (preferredLanguage && preferredLanguage !== i18n.language) {
    window.setTimeout(() => void i18n.changeLanguage(preferredLanguage), 0)
  }
} else {
  createRoot(root).render(application)
}
