import { ArrowRight, Camera, CheckCircle2, ClipboardCheck, HeartHandshake, MessageCircle, ShieldCheck, Wrench } from 'lucide-react'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { getNeedLandingPage, needLandingPages } from '../constants/needLandingPages'
import { formatServicePrice, getServicesForPackageArea } from '../services/serviceCatalogue'
import { useLocalizedServiceCatalogue } from '../services/serviceCatalogueLocalization'
import type { CasaMiaService, ServiceCatalogueSection, ServicePackageArea } from '../types/serviceCatalogue'

import '../styles/need-landing.css'

export function NeedLandingPage() {
  const { needSlug } = useParams()
  const { i18n } = useTranslation()
  const page = getNeedLandingPage(needSlug)
  const catalogue = useLocalizedServiceCatalogue(i18n.language)

  if (!page) {
    return <Navigate to="/services" replace />
  }

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.title,
      description: page.description,
      provider: {
        '@type': 'Organization',
        name: 'CasaMia',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Spain',
      },
      serviceType: page.eyebrow,
      url: `https://casamia.com.es${page.path}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ]

  const siblingPages = needLandingPages.filter((item) => item.slug !== page.slug).slice(0, 4)
  const catalogueServices = useMemo(
    () => getNeedCatalogueServices(page.slug, catalogue.services),
    [catalogue.services, page.slug],
  )

  return (
    <>
      <SEO title={page.seoTitle} description={page.description} path={page.path} schema={schema} />

      <main className="need-landing">
        <section className="need-landing-hero">
          <div className="site-shell need-landing-hero-grid">
            <div className="need-landing-copy">
              <p className="eyebrow">{page.eyebrow}</p>
              <h1>{page.title}</h1>
              <p>{page.intro}</p>
              <div className="need-landing-actions">
                <Link className="btn btn-green" to="/home-safety-wizard">
                  Build my CasaMia plan
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="btn btn-white" to={page.servicePath}>
                  See related services
                </Link>
              </div>
            </div>

            <aside className="need-landing-visual" aria-label={`${page.title} overview`}>
              <SafeImage
                src={page.image}
                alt=""
                className="need-landing-photo"
                imgClassName="need-landing-photo-img"
                loading="eager"
              />
              <div className="need-landing-quick-card">
                <span><ShieldCheck size={20} aria-hidden="true" /></span>
                <strong>CasaMia plan</strong>
                <p>Assessment, package selection, installation coordination and follow-up in one managed route.</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="need-landing-section">
          <div className="site-shell need-landing-three">
            <NeedPanel
              icon={<HeartHandshake size={24} aria-hidden="true" />}
              title="Who this helps"
              items={page.whoFor}
            />
            <NeedPanel
              icon={<ShieldCheck size={24} aria-hidden="true" />}
              title="What to check first"
              items={page.priorities}
            />
            <NeedPanel
              icon={<ClipboardCheck size={24} aria-hidden="true" />}
              title="How CasaMia handles it"
              items={page.casamiaPlan}
            />
          </div>
        </section>

        <section className="need-landing-practical">
          <div className="site-shell need-landing-practical-grid">
            <div className="need-landing-practical-copy">
              <p className="eyebrow">Practical, not overwhelming</p>
              <h2>Start with the daily routine.</h2>
              <p>
                The useful question is not “which product should I buy?” It is: where does the person feel unsafe,
                what movement happens there, and what support would make that moment easier?
              </p>
            </div>
            <div className="need-landing-mini-grid">
              <MiniCard
                icon={<Camera size={21} aria-hidden="true" />}
                title="Show the space"
                body="A few photos or a short video of the route, transfer point or doorway is often enough to start."
              />
              <MiniCard
                icon={<MessageCircle size={21} aria-hidden="true" />}
                title="Tell us the routine"
                body="Explain what feels difficult: showering, getting out of bed, stairs, night bathroom trips or returning home."
              />
              <MiniCard
                icon={<Wrench size={21} aria-hidden="true" />}
                title="Receive a package-led plan"
                body="CasaMia recommends outcomes first, then confirms products, measurements and installer requirements."
              />
            </div>
          </div>
        </section>

        {catalogueServices.length > 0 ? (
          <section className="need-landing-catalogue">
            <div className="site-shell need-landing-catalogue-grid">
              <div className="need-landing-catalogue-copy">
                <p className="eyebrow">Current CasaMia catalogue</p>
                <h2>What CasaMia can include.</h2>
                <p>
                  These are customer-facing outcomes from the active service catalogue. The exact mix is confirmed
                  after your answers, photos or site visit.
                </p>
                <Link className="need-landing-text-link" to="/services">
                  Review the full catalogue
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
              <div className="need-landing-catalogue-list">
                {catalogueServices.map((service) => (
                  <CatalogueServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="need-landing-process">
          <div className="site-shell need-landing-process-grid">
            <div>
              <p className="eyebrow">Turnkey support</p>
              <h2>From concern to clear next step.</h2>
              <p>
                CasaMia turns a broad worry into a practical home-safety route: what matters now, what can wait,
                what needs measurement, and what can be coordinated as one package.
              </p>
            </div>
            <ol className="need-landing-steps">
              {['Tell us what changed', 'Review the home and routines', 'Receive a practical proposal', 'Install, configure and support'].map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="need-landing-detail">
          <div className="site-shell need-landing-detail-grid">
            <div className="need-landing-route-card">
              <p className="eyebrow">What your CasaMia plan can clarify</p>
              <h2>Clear enough to act on.</h2>
              <div className="need-landing-route-list">
                {[
                  'Which changes are urgent, recommended or optional',
                  'Which items fit within a package and which need a quote',
                  'Whether a visit, measurement or compatibility check is needed',
                  'What CasaMia can coordinate end to end',
                ].map((item) => (
                  <span key={item}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="need-landing-dos-card">
              <p className="eyebrow">Before spending money</p>
              <h2>Three checks that avoid poor choices.</h2>
              <ol>
                <li>
                  <strong>Check the exact movement.</strong>
                  <span>Where does the person reach, turn, sit, stand or hesitate?</span>
                </li>
                <li>
                  <strong>Check the fixing point.</strong>
                  <span>Support only works when it is positioned and installed for the real user.</span>
                </li>
                <li>
                  <strong>Check the handover.</strong>
                  <span>The best solution is one the person and family understand after installation.</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="need-landing-section">
          <div className="site-shell need-landing-links-grid">
            <div className="need-landing-related">
              <p className="eyebrow">Useful next pages</p>
              <h2>Go deeper without getting lost.</h2>
              <div>
                {page.relatedServices.map((link) => (
                  <Link key={link.to} to={link.to}>
                    {link.label}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="need-landing-faq">
              <p className="eyebrow">Questions families ask</p>
              {page.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="need-landing-more">
          <div className="site-shell">
            <div className="need-landing-more-card">
              <div>
                <p className="eyebrow">Popular CasaMia needs</p>
                <h2>More ways families search for help.</h2>
              </div>
              <div className="need-landing-chip-list">
                {siblingPages.map((item) => (
                  <Link key={item.slug} to={item.path}>{item.title}</Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="need-landing-final">
          <div className="site-shell need-landing-final-card">
            <div>
              <p className="eyebrow">Ready when you are</p>
              <h2>Get a practical CasaMia recommendation.</h2>
              <p>
                Start online, send photos or ask for a call. We turn the information into a clearer plan before you
                commit to works.
              </p>
            </div>
            <div className="need-landing-final-actions">
              <Link className="btn btn-green" to="/home-safety-wizard">
                Start my plan
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/home-safety-assessment">
                Book an assessment
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

const needCatalogueAreas: Record<string, ServicePackageArea[]> = {
  'aging-in-place-home-assessment': ['bathroom', 'bedroom', 'entrance', 'lighting', 'smart-safety'],
  'bathroom-safety-for-seniors': ['bathroom'],
  'connected-home-for-seniors': ['smart-safety', 'lighting', 'bedroom'],
  'fall-prevention-at-home': ['bathroom', 'bedroom', 'stairs', 'entrance', 'lighting', 'smart-safety'],
  'grants-for-home-adaptations-spain': ['bathroom', 'bedroom', 'entrance', 'stairs'],
  'home-adaptations-vs-assisted-living': ['bathroom', 'bedroom', 'entrance', 'lighting'],
  'home-adaptations-for-elderly': ['bathroom', 'bedroom', 'entrance', 'kitchen', 'lighting'],
  'home-safety-after-hospital-discharge': ['bathroom', 'bedroom', 'entrance', 'living-room'],
  'home-safety-assessment-vs-general-contractor': ['bathroom', 'bedroom', 'entrance', 'lighting'],
  'safe-bathroom-access': ['bathroom'],
  'senior-bedroom-safety': ['bedroom'],
  'smart-home-safety-vs-monitoring': ['smart-safety', 'lighting', 'bedroom'],
}

const sectionPriority: Record<ServiceCatalogueSection, number> = {
  home_safety_package: 1,
  connected_room: 2,
  optional_adaptations: 3,
}

const sectionLabels: Record<ServiceCatalogueSection, string> = {
  connected_room: 'Connected support',
  home_safety_package: 'Home safety package',
  optional_adaptations: 'Optional adaptation',
}

function getNeedCatalogueServices(slug: string, services: CasaMiaService[]) {
  const areas = needCatalogueAreas[slug] ?? []
  const seen = new Set<string>()

  return areas
    .flatMap((area) => getServicesForPackageArea(services, area))
    .filter((service) => service.websiteVisible !== false && service.active)
    .filter((service) => {
      if (seen.has(service.id)) return false
      seen.add(service.id)
      return true
    })
    .sort((a, b) => {
      const sectionA = a.section ?? 'home_safety_package'
      const sectionB = b.section ?? 'home_safety_package'
      const sectionDelta = sectionPriority[sectionA] - sectionPriority[sectionB]

      if (sectionDelta !== 0) return sectionDelta

      const priorityScore = { essential: 1, recommended: 2, optional: 3 }

      return (priorityScore[a.priority ?? 'recommended'] ?? 2) - (priorityScore[b.priority ?? 'recommended'] ?? 2)
    })
    .slice(0, 6)
}

function CatalogueServiceCard({ service }: { service: CasaMiaService }) {
  const section = service.section ?? 'home_safety_package'
  const summary = service.customerBenefit || service.shortDescription

  return (
    <article className="need-catalogue-card">
      <div>
        <span>{sectionLabels[section]}</span>
        <h3>{service.customerName ?? service.name}</h3>
        <p>{summary}</p>
      </div>
      <small>{formatServicePrice(service)}</small>
    </article>
  )
}

function MiniCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <article className="need-mini-card">
      <span>{icon}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </article>
  )
}

function NeedPanel({
  icon,
  title,
  items,
}: {
  icon: ReactNode
  title: string
  items: string[]
}) {
  return (
    <article className="need-panel">
      <span>{icon}</span>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <CheckCircle2 size={17} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
