import { lazy, Suspense, useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import { BrandLogo } from './components/BrandLogo'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'

const AboutPage = lazy(() => import('./pages/AboutPage').then(({ AboutPage }) => ({ default: AboutPage })))
const BeforeAfterPage = lazy(() =>
  import('./pages/BeforeAfterPage').then(({ BeforeAfterPage }) => ({ default: BeforeAfterPage })),
)
const ContactPage = lazy(() => import('./pages/ContactPage').then(({ ContactPage }) => ({ default: ContactPage })))
const EstimateReportPage = lazy(() =>
  import('./pages/EstimateReportPage').then(({ EstimateReportPage }) => ({ default: EstimateReportPage })),
)
const FreeHomeSafetyAssessmentPage = lazy(() =>
  import('./pages/FreeHomeSafetyAssessmentPage').then(({ FreeHomeSafetyAssessmentPage }) => ({
    default: FreeHomeSafetyAssessmentPage,
  })),
)
const GrantEligibilityPage = lazy(() =>
  import('./pages/GrantEligibilityPage').then(({ GrantEligibilityPage }) => ({ default: GrantEligibilityPage })),
)
const GrantsPage = lazy(() => import('./pages/GrantsPage').then(({ GrantsPage }) => ({ default: GrantsPage })))
const HomePage = lazy(() => import('./pages/HomePage').then(({ HomePage }) => ({ default: HomePage })))
const HowItWorksPage = lazy(() =>
  import('./pages/HowItWorksPage').then(({ HowItWorksPage }) => ({ default: HowItWorksPage })),
)
const InspectionReportPage = lazy(() =>
  import('./pages/internal/InspectionReportPage').then(({ InspectionReportPage }) => ({
    default: InspectionReportPage,
  })),
)
const InternalDashboardPage = lazy(() =>
  import('./pages/internal/InternalDashboardPage').then(({ InternalDashboardPage }) => ({
    default: InternalDashboardPage,
  })),
)
const InternalProposalsPage = lazy(() =>
  import('./pages/internal/InternalProposalsPage').then(({ InternalProposalsPage }) => ({
    default: InternalProposalsPage,
  })),
)
const InternalVisitsPage = lazy(() =>
  import('./pages/internal/InternalVisitsPage').then(({ InternalVisitsPage }) => ({
    default: InternalVisitsPage,
  })),
)
const OrderPage = lazy(() => import('./pages/OrderPage').then(({ OrderPage }) => ({ default: OrderPage })))
const PlanAdaptaPage = lazy(() =>
  import('./pages/PlanAdaptaPage').then(({ PlanAdaptaPage }) => ({ default: PlanAdaptaPage })),
)
const PlanDetailPage = lazy(() =>
  import('./pages/PlanDetailPage').then(({ PlanDetailPage }) => ({ default: PlanDetailPage })),
)
const PlansPage = lazy(() => import('./pages/PlansPage').then(({ PlansPage }) => ({ default: PlansPage })))
const ProposalDetailPage = lazy(() =>
  import('./pages/internal/ProposalDetailPage').then(({ ProposalDetailPage }) => ({
    default: ProposalDetailPage,
  })),
)
const ProposalGeneratorPage = lazy(() =>
  import('./pages/internal/ProposalGeneratorPage').then(({ ProposalGeneratorPage }) => ({
    default: ProposalGeneratorPage,
  })),
)
const PublicProposalPage = lazy(() =>
  import('./pages/PublicProposalPage').then(({ PublicProposalPage }) => ({ default: PublicProposalPage })),
)
const TechPage = lazy(() => import('./pages/TechPage').then(({ TechPage }) => ({ default: TechPage })))
const TermsAndConditionsPage = lazy(() =>
  import('./pages/TermsAndConditionsPage').then(({ TermsAndConditionsPage }) => ({ default: TermsAndConditionsPage })),
)
const WhyCasamiaPage = lazy(() =>
  import('./pages/WhyCasamiaPage').then(({ WhyCasamiaPage }) => ({ default: WhyCasamiaPage })),
)

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

function RouteLoadingFallback() {
  return (
    <div className="site-shell flex min-h-[55vh] items-center justify-center py-20">
      <div
        className="flex flex-col items-center gap-4 rounded-lg border border-border bg-white px-8 py-7 text-center shadow-soft"
        role="status"
        aria-live="polite"
      >
        <BrandLogo />
        <span className="inline-flex items-center gap-2 text-sm font-extrabold uppercase text-navy">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green" aria-hidden="true" />
          Loading
        </span>
      </div>
    </div>
  )
}

function LegacyAssessmentRedirect() {
  const location = useLocation()

  return <Navigate to={`/home-safety-assessment${location.search}${location.hash}`} replace />
}

function AppRoutes() {
  const location = useLocation()
  const isInternalRoute = location.pathname.startsWith('/internal')

  return (
    <>
      <ScrollManager />
      {isInternalRoute ? null : <Nav />}
      <main>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/plans/:planId" element={<PlanDetailPage />} />
            <Route path="/before-after" element={<BeforeAfterPage />} />
            <Route path="/tech" element={<TechPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/plan-adapta" element={<PlanAdaptaPage />} />
            <Route path="/why-casamia" element={<WhyCasamiaPage />} />
            <Route path="/home-safety-assessment" element={<FreeHomeSafetyAssessmentPage />} />
            <Route path="/free-home-safety-assessment" element={<LegacyAssessmentRedirect />} />
            <Route path="/grants" element={<GrantsPage />} />
            <Route path="/grant-check" element={<GrantEligibilityPage />} />
            <Route path="/estimate/:token" element={<EstimateReportPage />} />
            <Route path="/proposal/:token" element={<PublicProposalPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            <Route path="/internal" element={<InternalDashboardPage />} />
            <Route path="/internal/visits" element={<InternalVisitsPage />} />
            <Route path="/internal/inspection-report" element={<InspectionReportPage />} />
            <Route path="/internal/proposals" element={<InternalProposalsPage />} />
            <Route path="/internal/proposal-generator" element={<ProposalGeneratorPage />} />
            <Route path="/internal/proposals/:proposalId" element={<ProposalDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {isInternalRoute ? null : <Footer />}
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
