import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { EstimateReportPage } from './pages/EstimateReportPage'
import { FreeHomeSafetyAssessmentPage } from './pages/FreeHomeSafetyAssessmentPage'
import { GrantEligibilityPage } from './pages/GrantEligibilityPage'
import { GrantsPage } from './pages/GrantsPage'
import { HomePage } from './pages/HomePage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { OrderPage } from './pages/OrderPage'
import { PlanDetailPage } from './pages/PlanDetailPage'
import { PlansPage } from './pages/PlansPage'
import { TechPage } from './pages/TechPage'
import { WhyCasamiaPage } from './pages/WhyCasamiaPage'

function ScrollManager() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      window.setTimeout(() => {
        document
          .getElementById(location.hash.slice(1))
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname, location.hash])

  return null
}

function AppRoutes() {
  return (
    <>
      <ScrollManager />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/:planId" element={<PlanDetailPage />} />
          <Route path="/tech" element={<TechPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/why-casamia" element={<WhyCasamiaPage />} />
          <Route path="/free-home-safety-assessment" element={<FreeHomeSafetyAssessmentPage />} />
          <Route path="/grants" element={<GrantsPage />} />
          <Route path="/grant-check" element={<GrantEligibilityPage />} />
          <Route path="/estimate/:token" element={<EstimateReportPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AppRoutes />
    </BrowserRouter>
  )
}
