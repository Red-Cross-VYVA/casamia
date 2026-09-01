import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import i18n from './i18n'
import './index.css'
import App from './App.tsx'
import { getRouteLanguage } from './services/localizedRoutes'

const root = document.getElementById('root')!
const application = (
  <StrictMode>
    <App />
  </StrictMode>
)

void mountApplication()

async function mountApplication() {
  const routeLanguage = getRouteLanguage(window.location.pathname)
  const hasPrerenderedMarkup = root.hasChildNodes()

  if (routeLanguage !== i18n.language) {
    await i18n.changeLanguage(routeLanguage)
  }

  if (hasPrerenderedMarkup) {
    hydrateRoot(root, application)
    return
  }

  createRoot(root).render(application)
}
