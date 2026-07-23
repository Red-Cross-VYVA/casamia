import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'

import { BrandLogo } from './components/BrandLogo'
import { CookieConsent } from './components/CookieConsent'
import { Footer } from './components/Footer'
import { InternalAccessGate } from './components/internal/InternalAccessGate'
import { Nav } from './components/Nav'
import { SEO } from './components/SEO'
import { StickyMobileCTA } from './components/StickyMobileCTA'

const AboutPage = lazy(() => import('./pages/AboutPage').then(({ AboutPage }) => ({ default: AboutPage })))
const AssistedLivingSolutionsPage = lazy(() =>
  import('./pages/AssistedLivingSolutionsPage').then(({ AssistedLivingSolutionsPage }) => ({
    default: AssistedLivingSolutionsPage,
  })),
)
const BeforeAfterPage = lazy(() =>
  import('./pages/BeforeAfterPage').then(({ BeforeAfterPage }) => ({ default: BeforeAfterPage })),
)
const BlogArticlePage = lazy(() =>
  import('./pages/BlogArticlePage').then(({ BlogArticlePage }) => ({ default: BlogArticlePage })),
)
const BlogPage = lazy(() => import('./pages/BlogPage').then(({ BlogPage }) => ({ default: BlogPage })))
const EstimateReportPage = lazy(() =>
  import('./pages/EstimateReportPage').then(({ EstimateReportPage }) => ({ default: EstimateReportPage })),
)
const FreeHomeSafetyAssessmentPage = lazy(() =>
  import('./pages/FreeHomeSafetyAssessmentPage').then(({ FreeHomeSafetyAssessmentPage }) => ({
    default: FreeHomeSafetyAssessmentPage,
  })),
)
const HomeSafetyWizardPage = lazy(() =>
  import('./pages/HomeSafetyWizardPage').then(({ HomeSafetyWizardPage }) => ({
    default: HomeSafetyWizardPage,
  })),
)
const HomeVsResidenceCostPage = lazy(() =>
  import('./pages/HomeVsResidenceCostPage').then(({ HomeVsResidenceCostPage }) => ({
    default: HomeVsResidenceCostPage,
  })),
)
const GrantEligibilityPage = lazy(() =>
  import('./pages/GrantEligibilityPage').then(({ GrantEligibilityPage }) => ({ default: GrantEligibilityPage })),
)
const GrantsPage = lazy(() => import('./pages/GrantsPage').then(({ GrantsPage }) => ({ default: GrantsPage })))
const Home2Page = lazy(() => import('./pages/Home2Page').then(({ Home2Page }) => ({ default: Home2Page })))
const HowItWorksPage = lazy(() =>
  import('./pages/HowItWorksPage').then(({ HowItWorksPage }) => ({ default: HowItWorksPage })),
)
const LegalDocumentPage = lazy(() =>
  import('./pages/LegalDocumentPage').then(({ LegalDocumentPage }) => ({ default: LegalDocumentPage })),
)
const NeedLandingPage = lazy(() =>
  import('./pages/NeedLandingPage').then(({ NeedLandingPage }) => ({ default: NeedLandingPage })),
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
const InternalCallbacksPage = lazy(() =>
  import('./pages/internal/InternalCallbacksPage').then(({ InternalCallbacksPage }) => ({
    default: InternalCallbacksPage,
  })),
)
const InternalProposalsPage = lazy(() =>
  import('./pages/internal/InternalProposalsPage').then(({ InternalProposalsPage }) => ({
    default: InternalProposalsPage,
  })),
)
const InternalOrdersPage = lazy(() =>
  import('./pages/internal/InternalOrdersPage').then(({ InternalOrdersPage }) => ({
    default: InternalOrdersPage,
  })),
)
const InternalProviderPartnersPage = lazy(() =>
  import('./pages/internal/InternalProviderPartnersPage').then(({ InternalProviderPartnersPage }) => ({
    default: InternalProviderPartnersPage,
  })),
)
const InternalServiceCataloguePage = lazy(() =>
  import('./pages/internal/InternalServiceCataloguePage').then(({ InternalServiceCataloguePage }) => ({
    default: InternalServiceCataloguePage,
  })),
)
const InternalVoiceStudioPage = lazy(() =>
  import('./pages/internal/InternalVoiceStudioPage').then(({ InternalVoiceStudioPage }) => ({
    default: InternalVoiceStudioPage,
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
const PlansPage = lazy(() => import('./pages/PlansPage').then(({ PlansPage }) => ({ default: PlansPage })))
const ProviderPartnersPage = lazy(() =>
  import('./pages/ProviderPartnersPage').then(({ ProviderPartnersPage }) => ({ default: ProviderPartnersPage })),
)
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
const ServiceDetailPage = lazy(() =>
  import('./pages/ServiceDetailPage').then(({ ServiceDetailPage }) => ({ default: ServiceDetailPage })),
)
const ServiceAreasPage = lazy(() =>
  import('./pages/ServiceAreasPage').then(({ ServiceAreasPage }) => ({ default: ServiceAreasPage })),
)
const ServicesPage = lazy(() =>
  import('./pages/ServicesPage').then(({ ServicesPage }) => ({ default: ServicesPage })),
)
const TechPage = lazy(() => import('./pages/TechPage').then(({ TechPage }) => ({ default: TechPage })))
const TermsAndConditionsPage = lazy(() =>
  import('./pages/TermsAndConditionsPage').then(({ TermsAndConditionsPage }) => ({ default: TermsAndConditionsPage })),
)
const WhyCasamiaPage = lazy(() =>
  import('./pages/WhyCasamiaPage').then(({ WhyCasamiaPage }) => ({ default: WhyCasamiaPage })),
)
const WithdrawalFormPage = lazy(() =>
  import('./pages/WithdrawalFormPage').then(({ WithdrawalFormPage }) => ({ default: WithdrawalFormPage })),
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
  const { t } = useTranslation()

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
          {t('common.loading')}
        </span>
      </div>
    </div>
  )
}

function LegacyAssessmentRedirect() {
  const location = useLocation()

  return <Navigate to={`/home-safety-assessment${location.search}${location.hash}`} replace />
}

const legacyResourceArticlePaths: Record<string, string> = {
  'aging-in-place-spain': '/blog/fall-prevention-home-checklist-spain',
  'bathroom-safety-for-seniors': '/blog/bathroom-safety-seniors-costly-mistakes',
  'home-adaptation-grants-spain': '/blog/home-adaptation-grants-spain-family-guide',
  'preventing-falls-at-home': '/blog/fall-prevention-home-checklist-spain',
}

function LegacyResourceRedirect() {
  const location = useLocation()
  const { articleId } = useParams()
  const target = articleId ? legacyResourceArticlePaths[articleId] : undefined

  return <Navigate to={`${target ?? '/blog'}${location.search}`} replace />
}

function InternalRoute({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <>
      <SEO
        title="CasaMia internal access"
        description="Protected CasaMia operations area."
        path={location.pathname}
        noindex
      />
      <InternalAccessGate>{children}</InternalAccessGate>
    </>
  )
}

function AppRoutes() {
  const location = useLocation()
  const isInternalRoute = location.pathname.startsWith('/internal')
  const isFocusedWizardRoute = location.pathname === '/home-safety-wizard'

  return (
    <>
      <ScrollManager />
      {isInternalRoute || isFocusedWizardRoute ? null : <Nav />}
      <main>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home2Page />} />
            <Route path="/home2" element={<Home2Page />} />
            <Route path="/home-new" element={<Navigate to="/" replace />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/plans/:planId" element={<Navigate to="/plans" replace />} />
            <Route path="/provider-partners" element={<ProviderPartnersPage />} />
            <Route path="/before-after" element={<BeforeAfterPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/service-areas" element={<ServiceAreasPage />} />
            <Route path="/:needSlug" element={<NeedLandingPage />} />
            <Route path="/family-dashboard" element={<Navigate to="/tech" replace />} />
            <Route path="/assisted-living-solutions" element={<AssistedLivingSolutionsPage />} />
            <Route path="/resources" element={<Navigate to="/blog" replace />} />
            <Route path="/resources/:articleId" element={<LegacyResourceRedirect />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:articleId" element={<BlogArticlePage />} />
            <Route path="/tech" element={<TechPage />} />
            <Route path="/configure/*" element={<Navigate to="/home-safety-wizard" replace />} />
            <Route path="/admin/config-preview" element={<Navigate to="/internal/service-catalog" replace />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/plan-adapta" element={<PlanAdaptaPage />} />
            <Route path="/why-us" element={<WhyCasamiaPage />} />
            <Route path="/why-casamia" element={<Navigate to="/why-us" replace />} />
            <Route path="/home-safety-assessment" element={<FreeHomeSafetyAssessmentPage />} />
            <Route path="/home-safety-wizard" element={<HomeSafetyWizardPage />} />
            <Route path="/free-home-safety-assessment" element={<LegacyAssessmentRedirect />} />
            <Route path="/tools/safety-report" element={<Navigate to="/#estimate-upload" replace />} />
            <Route path="/tools/grant-eligibility" element={<Navigate to="/grant-check" replace />} />
            <Route path="/tools/home-vs-residence-cost-calculator" element={<HomeVsResidenceCostPage />} />
            <Route path="/grants" element={<GrantsPage />} />
            <Route path="/grant-check" element={<GrantEligibilityPage />} />
            <Route path="/estimate/:token" element={<EstimateReportPage />} />
            <Route path="/proposal/:token" element={<PublicProposalPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            <Route path="/legal-notice" element={<LegalDocumentPage documentId="legal-notice" />} />
            <Route path="/general-customer-terms" element={<LegalDocumentPage documentId="general-customer-terms" />} />
            <Route path="/privacy-policy" element={<LegalDocumentPage documentId="privacy-policy" />} />
            <Route path="/cookie-policy" element={<LegalDocumentPage documentId="cookie-policy" />} />
            <Route path="/withdrawal-cancellation" element={<LegalDocumentPage documentId="withdrawal-cancellation" />} />
            <Route path="/withdrawal-form" element={<WithdrawalFormPage />} />
            <Route path="/guarantees-aftercare" element={<LegalDocumentPage documentId="guarantees-aftercare" />} />
            <Route path="/complaints-contact" element={<LegalDocumentPage documentId="complaints-contact" />} />
            <Route path="/accessibility-statement" element={<LegalDocumentPage documentId="accessibility-statement" />} />
            <Route path="/internal" element={<InternalRoute><InternalDashboardPage /></InternalRoute>} />
            <Route path="/internal/callbacks" element={<InternalRoute><InternalCallbacksPage /></InternalRoute>} />
            <Route path="/internal/visits" element={<InternalRoute><InternalVisitsPage /></InternalRoute>} />
            <Route path="/internal/orders" element={<InternalRoute><InternalOrdersPage /></InternalRoute>} />
            <Route path="/internal/inspection-report" element={<InternalRoute><InspectionReportPage /></InternalRoute>} />
            <Route path="/internal/package-config" element={<Navigate to="/internal/service-catalog" replace />} />
            <Route path="/internal/service-catalog" element={<InternalRoute><InternalServiceCataloguePage /></InternalRoute>} />
            <Route path="/internal/voice-studio" element={<InternalRoute><InternalVoiceStudioPage /></InternalRoute>} />
            <Route path="/internal/proposals" element={<InternalRoute><InternalProposalsPage /></InternalRoute>} />
            <Route path="/internal/provider-partners" element={<InternalRoute><InternalProviderPartnersPage /></InternalRoute>} />
            <Route path="/internal/proposal-generator" element={<InternalRoute><ProposalGeneratorPage /></InternalRoute>} />
            <Route path="/internal/proposals/:proposalId" element={<InternalRoute><ProposalDetailPage /></InternalRoute>} />
            <Route path="/contact" element={<Navigate to="/why-us#contact-form" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {isInternalRoute || isFocusedWizardRoute ? null : <Footer />}
      {isInternalRoute ? null : <CookieConsent />}
      {isInternalRoute || isFocusedWizardRoute ? null : <StickyMobileCTA />}
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
