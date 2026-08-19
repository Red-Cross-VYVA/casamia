import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { LocalizedLink as Link, LocalizedNavigate as Navigate } from '../components/LocalizedLink'
import { useTranslation } from 'react-i18next'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { ZoneServiceGallery } from '../components/ZoneServiceGallery'
import { blogArticles, type BlogArticle } from '../constants/blogContent'
import { localizeBlogArticles } from '../constants/blogContentLocalization'
import { allNeedLandingPages, getNeedLandingPage } from '../constants/needLandingPages'
import { localizeNeedLandingPage } from '../constants/needLandingPagesLocalization'
import { getServicesForPackageArea } from '../services/serviceCatalogue'
import { useLocalizedServiceCatalogue } from '../services/serviceCatalogueLocalization'
import type { CasaMiaService, ServiceCatalogueSection, ServicePackageArea } from '../types/serviceCatalogue'

import '../styles/need-landing.css'

export function NeedLandingPage() {
  const { needSlug } = useParams()
  const location = useLocation()
  const { i18n } = useTranslation()
  const [activeRiskId, setActiveRiskId] = useState<string | null>(null)
  const basePage = getNeedLandingPage(needSlug)
  const catalogue = useLocalizedServiceCatalogue(i18n.language)

  const isSpanish = i18n.language.startsWith('es')
  const page = localizeNeedLandingPage(basePage ?? allNeedLandingPages[0], i18n.language)

  if (basePage && page.path !== location.pathname) {
    return <Navigate to={`${page.path}${location.search}${location.hash}`} replace />
  }

  const isCompactNeedPage = page.slug === 'bathroom-safety-for-seniors'
  const isGrantSupportNeedPage = page.slug === 'grants-for-home-adaptations-spain'
  const copy = {
    home: isSpanish ? 'Inicio' : 'Home',
    resources: isSpanish ? 'Recursos' : 'Resources',
    primaryCta: isSpanish ? 'Crear mi plan CasaMia' : 'Build my CasaMia plan',
    secondaryCta: isSpanish ? 'Ver servicios relacionados' : 'See related services',
    whoHelps: isSpanish ? 'A quién ayuda' : 'Who this helps',
    checkFirst: isSpanish ? 'Qué revisar primero' : 'What to check first',
    handlesIt: isSpanish ? 'Cómo lo gestiona CasaMia' : 'How CasaMia handles it',
    evidenceEyebrow: isSpanish ? 'Lo que ayuda a decidir' : 'What helps us decide',
    evidenceTitle: isSpanish ? 'Tres detalles hacen el plan más claro.' : 'Three details make the plan clearer.',
    evidenceBody: isSpanish
      ? 'No necesitas preparar un informe perfecto. CasaMia solo necesita entender la rutina, el espacio y lo que ha cambiado para orientar mejor el siguiente paso.'
      : 'You do not need to prepare a perfect brief. CasaMia just needs to understand the routine, the space and what has changed so the next step is easier to recommend.',
    evidenceItems: isSpanish
      ? [
          {
            title: 'La rutina',
            body: 'Qué momento preocupa: ducha, cama, escaleras, cocina, entrada o baño de noche.',
          },
          {
            title: 'El espacio',
            body: 'Fotos o vídeo corto de la ruta, apoyo, puerta, suelo o zona donde la persona duda.',
          },
          {
            title: 'El cambio',
            body: 'Caída reciente, alta hospitalaria, menos fuerza, mareos, miedo o nuevas necesidades de ayuda.',
          },
        ]
      : [
          {
            title: 'The routine',
            body: 'Which moment feels difficult: showering, getting out of bed, stairs, cooking, entrance or night bathroom trips.',
          },
          {
            title: 'The space',
            body: 'Photos or a short video of the route, support point, doorway, floor or place where the person hesitates.',
          },
          {
            title: 'The change',
            body: 'A recent fall, hospital discharge, less strength, dizziness, fear or a new need for help.',
          },
        ],
    recommendedEyebrow: isSpanish ? 'Guías útiles' : 'Helpful guides',
    recommendedTitle: isSpanish ? 'Más contexto, sin complicarlo.' : 'More context, without the noise.',
    recommendedBody: isSpanish
      ? 'Lecturas breves para entender mejor el riesgo y elegir el siguiente paso con calma.'
      : 'Short reads to understand the risk and choose the next step calmly.',
    readResource: isSpanish ? 'Leer recurso' : 'Read resource',
    useTool: isSpanish ? 'Usar herramienta' : 'Use tool',
    catalogueEyebrow: isSpanish ? 'Catálogo CasaMia actual' : 'Current CasaMia catalogue',
    catalogueTitle: isSpanish
      ? 'Apoyos prácticos para esta necesidad.'
      : 'Practical supports matched to this need.',
    catalogueBody: isSpanish
      ? 'Una vista clara de los elementos base y extras opcionales que pueden encajar. La combinación final se confirma con tus respuestas, fotos o visita.'
      : 'A clear look at the core items and optional add-ons that may fit. The final mix is confirmed from your answers, photos or visit.',
    catalogueCta: isSpanish ? 'Ver el catálogo completo' : 'Review the full catalogue',
    questions: isSpanish ? 'Preguntas que suelen hacer las familias' : 'Questions families ask',
    questionsIntro: isSpanish
      ? 'Respuestas rápidas para decidir si conviene empezar online, enviar fotos o pedir una evaluación.'
      : 'Quick answers to help you decide whether to start online, send photos or request an assessment.',
    universalFaqs: isSpanish
      ? [
          {
            question: '¿Puedo empezar sin saber qué comprar?',
            answer:
              'Sí. CasaMia empieza por la rutina y el riesgo visible, no por una lista de productos. Después traducimos la necesidad en una ruta práctica con prioridades, visita o presupuesto si hace falta.',
          },
          {
            question: '¿Puedo enviar fotos o vídeos antes de una visita?',
            answer:
              'Sí. Unas fotos o un vídeo corto suelen ayudar a entender el espacio, la ruta y los puntos de apoyo. Si hacen falta medidas, compatibilidad o instalación, CasaMia lo confirma antes de avanzar.',
          },
        ]
      : [
          {
            question: 'Can I start without knowing what to buy?',
            answer:
              'Yes. CasaMia starts with the daily routine and visible risk, not a product list. We then turn the need into a practical route with priorities, a visit or a quote where needed.',
          },
          {
            question: 'Can I send photos or videos before a visit?',
            answer:
              'Yes. A few photos or a short video often helps us understand the space, route and support points. If measurements, compatibility or installation checks are needed, CasaMia confirms that before moving forward.',
          },
        ],
    questionsCta: isSpanish ? 'Empezar con mi caso' : 'Start with my situation',
    ready: isSpanish ? 'Cuando quieras' : 'Ready when you are',
    finalTitle: isSpanish ? 'Recibe una recomendación CasaMia práctica.' : 'Get a practical CasaMia recommendation.',
    finalBody: isSpanish
      ? 'Empieza online, envía fotos o pide una llamada. Convertimos la información en un plan más claro antes de comprometerte con trabajos.'
      : 'Start online, send photos or ask for a call. We turn the information into a clearer plan before you commit to works.',
    startPlan: isSpanish ? 'Empezar mi plan' : 'Start my plan',
    bookAssessment: isSpanish ? 'Reservar evaluación' : 'Book an assessment',
  }
  const visibleFaqs = isCompactNeedPage ? page.faqs : [...page.faqs, ...copy.universalFaqs]

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
      image: `https://casamia.com.es${page.image}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: copy.home,
          item: 'https://casamia.com.es/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: copy.resources,
          item: 'https://casamia.com.es/blog',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: page.title,
          item: `https://casamia.com.es${page.path}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: visibleFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    ...(!isCompactNeedPage
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            '@id': `https://casamia.com.es${page.path}#what-to-share`,
            name: copy.evidenceTitle,
            description: copy.evidenceBody,
            step: copy.evidenceItems.map((item, index) => ({
              '@type': 'HowToStep',
              position: index + 1,
              name: item.title,
              text: item.body,
            })),
          },
        ]
      : []),
  ]

  const catalogueServices = useMemo(
    () => getNeedCatalogueServices(page.slug, catalogue.services),
    [catalogue.services, page.slug],
  )
  const zoneGalleryRoom = needZoneGalleryRooms[page.slug]
  const zoneGalleryServices = useMemo(
    () => zoneGalleryRoom ? getNeedCatalogueServices(page.slug, catalogue.services, 'all') : [],
    [catalogue.services, page.slug, zoneGalleryRoom],
  )
  const localizedArticles = useMemo(() => localizeBlogArticles(blogArticles, i18n.language), [i18n.language])
  const recommendedResources = useMemo(
    () => isCompactNeedPage ? [] : getNeedRecommendedResources(page.slug, localizedArticles, i18n.language),
    [isCompactNeedPage, localizedArticles, i18n.language, page.slug],
  )
  const visibleCatalogueServices = isCompactNeedPage ? catalogueServices.slice(0, 4) : catalogueServices
  const secondaryCtaLabel = isCompactNeedPage
    ? isSpanish ? 'Ver solución de baño' : 'See bathroom service'
    : copy.secondaryCta
  const primaryCtaTarget = isGrantSupportNeedPage ? '/grant-check' : '/home-safety-wizard'
  const primaryCtaLabel = isGrantSupportNeedPage
    ? isSpanish ? 'Comprobar mi ayuda' : 'Check my grant'
    : copy.primaryCta
  const catalogueEyebrow = isCompactNeedPage
    ? isSpanish ? 'Prioridades del baño' : 'Bathroom priorities'
    : copy.catalogueEyebrow
  const catalogueTitle = isCompactNeedPage
    ? isSpanish ? 'Qué resolvemos primero.' : 'What we solve first.'
    : copy.catalogueTitle
  const catalogueBody = isCompactNeedPage
    ? isSpanish
      ? 'Cuatro mejoras habituales. La propuesta final se confirma tras revisar el baño.'
      : 'Four common improvements. The final recommendation follows the bathroom review.'
    : copy.catalogueBody
  const catalogueCta = isCompactNeedPage
    ? isSpanish ? 'Ver opciones' : 'See options'
    : copy.catalogueCta
  const riskMapLabelPositions = needRiskMapLabelPositions[page.slug] ?? bathroomRiskMapLabelPositions
  const riskMapItems = page.riskSection
    ? page.riskSection.risks.map((risk, index) => ({
        id: `${page.slug}-risk-${index + 1}`,
        label: risk,
        detail: page.riskSection?.riskDetails?.[index],
        position: riskMapLabelPositions[index],
      }))
    : []
  const riskMapLegendItems = page.riskSection
    ? (page.riskSection.legend ?? []).map((label, index) => ({
        label,
        position: riskMapLabelPositions[page.riskSection!.risks.length + index],
      }))
    : []
  if (!basePage) {
    return <Navigate to="/services" replace />
  }

  return (
    <>
      <SEO
        title={page.seoTitle}
        description={page.description}
        path={page.path}
        image={page.image}
        schema={schema}
      />

      <main className={`need-landing${isCompactNeedPage ? ' need-landing--compact' : ''}`}>
        <section className="need-landing-hero">
          <div className="site-shell need-landing-hero-grid">
            <div className="need-landing-copy">
              <p className="eyebrow">{page.eyebrow}</p>
              <h1>{page.title}</h1>
              <p>{page.intro}</p>
              <div className="need-landing-actions">
                <Link className="btn btn-green" to={primaryCtaTarget}>
                  {primaryCtaLabel}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="btn btn-white" to={page.servicePath}>
                  {secondaryCtaLabel}
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
            </aside>
          </div>
        </section>

        {page.riskSection ? (
          <section className="need-landing-risk-map" aria-labelledby="need-landing-risk-map-title">
            <div className="site-shell need-landing-risk-map-grid">
              <div className="need-landing-risk-map-stage">
                <SafeImage
                  src={page.riskSection.image}
                  alt={page.riskSection.imageAlt}
                  className="need-landing-risk-map-photo"
                  imgClassName="need-landing-risk-map-img"
                />
                <div className="need-landing-risk-map-labels">
                  {riskMapItems.map((item) => {
                    if (!item.position) return null

                    const isActive = activeRiskId === item.id
                    const mapDetailId = item.detail
                      ? `need-landing-risk-map-detail-${item.id}`
                      : undefined

                    return item.detail ? (
                      <span
                        className={`need-landing-risk-map-hotspot${isActive ? ' is-active' : ''}`}
                        key={item.id}
                        onMouseEnter={() => setActiveRiskId(item.id)}
                        onMouseLeave={() => setActiveRiskId((current) => current === item.id ? null : current)}
                        style={{
                          left: `${item.position.x}%`,
                          top: `${item.position.y}%`,
                          width: `${item.position.w}%`,
                          height: `${item.position.h}%`,
                        }}
                      >
                        <button
                          aria-describedby={mapDetailId}
                          aria-label={item.label}
                          className={`need-landing-risk-map-label has-detail ${item.position.detailSide}${isActive ? ' is-active' : ''}`}
                          onBlur={() => setActiveRiskId((current) => current === item.id ? null : current)}
                          onClick={() => setActiveRiskId((current) => current === item.id ? null : item.id)}
                          onFocus={() => setActiveRiskId(item.id)}
                          type="button"
                        >
                          <span className="need-landing-risk-map-text">{item.label}</span>
                        </button>
                        <aside
                          className={`need-landing-risk-map-detail ${item.position.detailSide}`}
                          id={mapDetailId}
                        >
                          <strong>{item.detail.solution}</strong>
                          <p>{item.detail.helps}</p>
                          {item.detail.product ? <small>{item.detail.product}</small> : null}
                          {item.detail.stat ? <em>{item.detail.stat}</em> : null}
                        </aside>
                      </span>
                    ) : (
                    <span
                      aria-label={item.label}
                      className={`need-landing-risk-map-label${isActive ? ' is-active' : ''}`}
                      key={item.id}
                      style={{
                        left: `${item.position.x}%`,
                        top: `${item.position.y}%`,
                          width: `${item.position.w}%`,
                        height: `${item.position.h}%`,
                      }}
                    >
                      <span className="need-landing-risk-map-text">{item.label}</span>
                    </span>
                    )
                  })}
                  {riskMapLegendItems.map((item, index) => {
                    if (!item.position) return null

                    return (
                      <span
                        aria-hidden="true"
                        className="need-landing-risk-map-label is-legend"
                        key={`${item.label}-${index}`}
                        style={{
                          left: `${item.position.x}%`,
                          top: `${item.position.y}%`,
                          width: `${item.position.w}%`,
                          height: `${item.position.h}%`,
                        }}
                      >
                        {item.label}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="need-landing-risk-map-copy">
                <p className="eyebrow">{page.riskSection.eyebrow}</p>
                <h2 id="need-landing-risk-map-title">{page.riskSection.title}</h2>
                <p>{page.riskSection.body}</p>
                <ul className="need-landing-risk-list">
                  {riskMapItems.map((item) => {
                    const isActive = activeRiskId === item.id
                    const detailId = item.detail
                      ? `need-landing-risk-detail-${item.id}`
                      : undefined

                    return (
                      <li
                        className={`${item.detail ? 'has-detail' : ''}${isActive ? ' is-active' : ''}`}
                        key={item.id}
                        onMouseEnter={() => setActiveRiskId(item.id)}
                        onMouseLeave={() => setActiveRiskId((current) => current === item.id ? null : current)}
                      >
                        <button
                          aria-describedby={detailId}
                          aria-label={item.label}
                          className="need-landing-risk-trigger"
                          onBlur={() => setActiveRiskId((current) => current === item.id ? null : current)}
                          onClick={() => setActiveRiskId((current) => current === item.id ? null : item.id)}
                          onFocus={() => setActiveRiskId(item.id)}
                          type="button"
                        >
                          <strong>{item.label}</strong>
                        </button>
                        {item.detail ? (
                          <aside className="need-landing-risk-detail" id={detailId}>
                            <strong>{item.detail.solution}</strong>
                            <p>{item.detail.helps}</p>
                            {item.detail.product ? <small>{item.detail.product}</small> : null}
                            {item.detail.stat ? <em>{item.detail.stat}</em> : null}
                          </aside>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        <section className="need-landing-section">
          <div className="site-shell need-landing-three">
            <NeedPanel
              icon={<HeartHandshake size={24} aria-hidden="true" />}
              title={copy.whoHelps}
              items={page.whoFor}
            />
            <NeedPanel
              icon={<ShieldCheck size={24} aria-hidden="true" />}
              title={copy.checkFirst}
              items={page.priorities}
            />
            <NeedPanel
              icon={<ClipboardCheck size={24} aria-hidden="true" />}
              title={copy.handlesIt}
              items={page.casamiaPlan}
            />
          </div>
        </section>

        {zoneGalleryRoom && zoneGalleryServices.length > 0 ? (
          <section className="need-landing-zone-gallery-section">
            <div className="site-shell">
              <ZoneServiceGallery
                className="need-zone-gallery"
                language={i18n.language}
                room={zoneGalleryRoom}
                services={zoneGalleryServices}
              />
            </div>
          </section>
        ) : null}

        {!isCompactNeedPage ? (
          <>
            <section className="need-landing-evidence" aria-labelledby="need-landing-evidence-title">
              <div className="site-shell need-landing-evidence-card">
                <div>
                  <p className="eyebrow">{copy.evidenceEyebrow}</p>
                  <h2 id="need-landing-evidence-title">{copy.evidenceTitle}</h2>
                  <p>{copy.evidenceBody}</p>
                </div>
                <div className="need-evidence-list">
                  {copy.evidenceItems.map((item, index) => (
                    <article key={item.title}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

          </>
        ) : null}

        {recommendedResources.length > 0 ? (
          <section className="need-landing-resources" aria-labelledby="need-landing-resources-title">
            <div className="site-shell need-landing-resources-grid">
              <div className="need-landing-resources-copy">
                <p className="eyebrow">{copy.recommendedEyebrow}</p>
                <h2 id="need-landing-resources-title">{copy.recommendedTitle}</h2>
                <p>{copy.recommendedBody}</p>
              </div>
              <div className="need-resource-card-grid">
                {recommendedResources.map((resource) => (
                  <Link className="need-resource-card" key={resource.to} to={resource.to}>
                    <span>{resource.kindLabel}</span>
                    <h3>{resource.title}</h3>
                    <strong>
                      {resource.kind === 'tool' ? copy.useTool : copy.readResource}
                      <ArrowRight size={17} aria-hidden="true" />
                    </strong>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {visibleCatalogueServices.length > 0 ? (
          <section className="need-landing-catalogue">
            <div className="site-shell need-landing-catalogue-grid">
              <div className="need-landing-catalogue-copy">
                <p className="eyebrow">{catalogueEyebrow}</p>
                <h2>{catalogueTitle}</h2>
                <p>{catalogueBody}</p>
                <Link className="need-landing-text-link" to="/services">
                  {catalogueCta}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
              <div className="need-landing-catalogue-list">
                {visibleCatalogueServices.map((service) => (
                  <CatalogueServiceCard
                    key={service.id}
                    compact={isCompactNeedPage}
                    service={service}
                    language={i18n.language}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="need-landing-section need-landing-section--faq-only">
          <div className="site-shell need-landing-faq-only">
            <div className="need-landing-faq">
              <p className="eyebrow">{copy.questions}</p>
              <h2>{copy.questions}</h2>
              <p>{copy.questionsIntro}</p>
              <div className="need-landing-faq-list">
                {visibleFaqs.map((faq) => (
                  <details key={faq.question}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
              <Link className="need-landing-faq-action" to="/home-safety-wizard">
                {copy.questionsCta}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="need-landing-final">
          <div className="site-shell need-landing-final-card">
            <div>
              <p className="eyebrow">{copy.ready}</p>
              <h2>{copy.finalTitle}</h2>
              <p>{copy.finalBody}</p>
            </div>
            <div className="need-landing-final-actions">
              <Link className="btn btn-green" to="/home-safety-wizard">
                {copy.startPlan}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/home-safety-assessment">
                {copy.bookAssessment}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

type RiskMapLabelPosition = {
  x: number
  y: number
  w: number
  h: number
  detailSide:
    | 'opens-right'
    | 'opens-left'
    | 'opens-up'
    | 'opens-down-right'
    | 'opens-down-left'
    | 'opens-up-right'
    | 'opens-up-left'
}

const bathroomRiskMapLabelPositions: readonly RiskMapLabelPosition[] = [
  { x: 35.6, y: 78.8, w: 9.8, h: 5.6, detailSide: 'opens-up-right' },
  { x: 87.2, y: 24.7, w: 8.8, h: 6.2, detailSide: 'opens-left' },
  { x: 87.2, y: 44.8, w: 8.8, h: 6.2, detailSide: 'opens-left' },
  { x: 41.0, y: 58.9, w: 8.4, h: 6.4, detailSide: 'opens-right' },
  { x: 7.7, y: 16.3, w: 11.0, h: 6.6, detailSide: 'opens-right' },
  { x: 89.1, y: 62.8, w: 8.5, h: 5.9, detailSide: 'opens-left' },
  { x: 76.9, y: 88.6, w: 7.4, h: 5.9, detailSide: 'opens-up-left' },
  { x: 7.7, y: 86.0, w: 12.8, h: 3.3, detailSide: 'opens-right' },
  { x: 7.7, y: 90.4, w: 12.8, h: 3.3, detailSide: 'opens-right' },
]

const bedroomRiskMapLabelPositions: readonly RiskMapLabelPosition[] = [
  { x: 11.2, y: 18.2, w: 14.4, h: 9.2, detailSide: 'opens-right' },
  { x: 13.0, y: 36.0, w: 13.0, h: 8.7, detailSide: 'opens-right' },
  { x: 8.8, y: 62.6, w: 17.3, h: 9.1, detailSide: 'opens-right' },
  { x: 23.3, y: 76.1, w: 15.6, h: 8.9, detailSide: 'opens-up-right' },
  { x: 74.4, y: 17.2, w: 15.2, h: 9.4, detailSide: 'opens-left' },
  { x: 77.6, y: 43.6, w: 17.5, h: 9.5, detailSide: 'opens-left' },
  { x: 67.0, y: 84.6, w: 16.2, h: 9.1, detailSide: 'opens-up-left' },
  { x: 2.8, y: 89.8, w: 15.8, h: 3.9, detailSide: 'opens-right' },
  { x: 2.8, y: 93.8, w: 15.8, h: 3.9, detailSide: 'opens-right' },
]

const needRiskMapLabelPositions: Record<string, readonly RiskMapLabelPosition[]> = {
  'bathroom-safety-for-seniors': bathroomRiskMapLabelPositions,
  'senior-bedroom-safety': bedroomRiskMapLabelPositions,
}

const needCatalogueAreas: Record<string, ServicePackageArea[]> = {
  'aging-in-place-home-assessment': ['bathroom', 'bedroom', 'entrance', 'lighting', 'smart-safety'],
  'bathroom-safety-for-seniors': ['bathroom'],
  'connected-home-for-seniors': ['smart-safety', 'lighting', 'bedroom'],
  'fall-prevention-at-home': ['bathroom', 'bedroom', 'stairs', 'entrance', 'lighting', 'smart-safety'],
  'grants-for-home-adaptations-spain': ['bathroom', 'bedroom', 'entrance', 'stairs'],
  'home-adaptations-for-elderly': ['bathroom', 'bedroom', 'entrance', 'kitchen', 'lighting'],
  'home-safety-after-hospital-discharge': ['bathroom', 'bedroom', 'entrance', 'living-room'],
  'senior-bedroom-safety': ['bedroom'],
  'smart-home-safety-vs-monitoring': ['smart-safety', 'lighting', 'bedroom'],
}

const needZoneGalleryRooms: Partial<Record<string, 'bathroom' | 'bedroom'>> = {
  'bathroom-safety-for-seniors': 'bathroom',
  'senior-bedroom-safety': 'bedroom',
}

type NeedResourceReference =
  | { kind: 'article'; id: string }
  | { kind: 'tool'; to: string; title: { en: string; es: string }; description: { en: string; es: string } }

type NeedRecommendedResource = {
  kind: 'article' | 'tool'
  kindLabel: string
  to: string
  title: string
  description: string
}

const needResourceReferences: Record<string, NeedResourceReference[]> = {
  'aging-in-place-home-assessment': [
    { kind: 'article', id: 'fall-prevention-home-checklist-spain' },
    { kind: 'article', id: 'family-conversation-before-home-safety-visit' },
    {
      kind: 'tool',
      to: '/home-safety-assessment?open=self-inspection#self-inspection-tool',
      title: { en: 'Online safety review', es: 'Revisión online de seguridad' },
      description: {
        en: 'Capture the rooms, routines and concerns that matter before booking a visit.',
        es: 'Recoge estancias, rutinas y preocupaciones antes de reservar una visita.',
      },
    },
  ],
  'bathroom-safety-for-seniors': [
    { kind: 'article', id: 'bathroom-safety-seniors-costly-mistakes' },
    { kind: 'article', id: 'fall-prevention-home-checklist-spain' },
  ],
  'connected-home-for-seniors': [
    { kind: 'article', id: 'smart-home-safety-without-overcomplicating' },
    { kind: 'article', id: 'emergency-plan-aging-parents-home' },
  ],
  'fall-prevention-at-home': [
    { kind: 'article', id: 'fall-prevention-home-checklist-spain' },
    { kind: 'article', id: 'bedroom-night-safety-older-adults' },
    {
      kind: 'tool',
      to: '/tools/is-my-parent-safe-at-home',
      title: { en: 'Is my parent safe at home?', es: '¿Está mi familiar seguro en casa?' },
      description: {
        en: 'A short quiz to spot common warning signs before a fall or crisis.',
        es: 'Un test breve para detectar señales habituales antes de una caída o crisis.',
      },
    },
  ],
  'grants-for-home-adaptations-spain': [
    { kind: 'article', id: 'home-adaptation-grants-spain-family-guide' },
    {
      kind: 'tool',
      to: '/plan-adapta',
      title: { en: 'Grant-readiness check', es: 'Revisión de ayudas' },
      description: {
        en: 'Understand what information usually helps prepare a grant route.',
        es: 'Entiende qué información suele ayudar a preparar una ruta de ayudas.',
      },
    },
  ],
  'home-adaptations-for-elderly': [
    { kind: 'article', id: 'fall-prevention-home-checklist-spain' },
    { kind: 'article', id: 'choose-home-safety-provider-spain' },
  ],
  'home-safety-after-hospital-discharge': [
    { kind: 'article', id: 'hospital-discharge-home-safety-checklist' },
    { kind: 'article', id: 'family-conversation-before-home-safety-visit' },
  ],
  'senior-bedroom-safety': [
    { kind: 'article', id: 'bedroom-night-safety-older-adults' },
    { kind: 'article', id: 'emergency-plan-aging-parents-home' },
  ],
}

const sectionPriority: Record<ServiceCatalogueSection, number> = {
  home_safety_package: 1,
  connected_room: 2,
  optional_adaptations: 3,
}

const sectionLabels: Record<ServiceCatalogueSection, { en: string; es: string }> = {
  connected_room: { en: 'Connected support', es: 'Apoyo conectado' },
  home_safety_package: { en: 'Home safety package', es: 'Paquete de seguridad' },
  optional_adaptations: { en: 'Optional adaptation', es: 'Adaptación opcional' },
}

function getNeedCatalogueServices(
  slug: string,
  services: CasaMiaService[],
  limit: number | 'all' = 6,
) {
  const areas = needCatalogueAreas[slug] ?? []
  const seen = new Set<string>()

  const sortedServices = areas
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

  return limit === 'all' ? sortedServices : sortedServices.slice(0, limit)
}

function getNeedRecommendedResources(
  slug: string,
  articles: BlogArticle[],
  language: string,
): NeedRecommendedResource[] {
  const languageKey = language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const articleLabel = languageKey === 'es' ? 'Guía práctica' : 'Practical guide'
  const toolLabel = languageKey === 'es' ? 'Herramienta' : 'Tool'
  const references = needResourceReferences[slug] ?? []

  return references
    .map((reference): NeedRecommendedResource | null => {
      if (reference.kind === 'tool') {
        return {
          kind: 'tool',
          kindLabel: toolLabel,
          to: reference.to,
          title: reference.title[languageKey],
          description: reference.description[languageKey],
        }
      }

      const article = articles.find((item) => item.id === reference.id)

      if (!article) return null

      return {
        kind: 'article',
        kindLabel: articleLabel,
        to: article.path,
        title: article.title,
        description: article.description,
      }
    })
    .filter((item): item is NeedRecommendedResource => Boolean(item))
    .slice(0, 3)
}

function CatalogueServiceCard({
  service,
  language,
  compact = false,
}: {
  service: CasaMiaService
  language: string
  compact?: boolean
}) {
  const section = service.section ?? 'home_safety_package'
  const summary = service.customerBenefit || service.shortDescription
  const languageKey = language.toLowerCase().startsWith('es') ? 'es' : 'en'

  return (
    <article className={`need-catalogue-card${compact ? ' need-catalogue-card--compact' : ''}`}>
      <div>
        <span>{sectionLabels[section][languageKey]}</span>
        <h3>{service.customerName ?? service.name}</h3>
        {!compact ? <p>{summary}</p> : null}
      </div>
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
