import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  ListChecks,
  MessageCircle,
  Route,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { blogArticles, type BlogArticle } from '../constants/blogContent'
import { localizeBlogArticles } from '../constants/blogContentLocalization'
import { allNeedLandingPages, getNeedLandingPage } from '../constants/needLandingPages'
import { localizeNeedLandingPage, localizeNeedLandingPages } from '../constants/needLandingPagesLocalization'
import { formatServicePrice, getServicesForPackageArea } from '../services/serviceCatalogue'
import { useLocalizedServiceCatalogue } from '../services/serviceCatalogueLocalization'
import type { CasaMiaService, ServiceCatalogueSection, ServicePackageArea } from '../types/serviceCatalogue'

import '../styles/need-landing.css'

export function NeedLandingPage() {
  const { needSlug } = useParams()
  const { i18n } = useTranslation()
  const basePage = getNeedLandingPage(needSlug)
  const catalogue = useLocalizedServiceCatalogue(i18n.language)

  if (!basePage) {
    return <Navigate to="/services" replace />
  }

  const isSpanish = i18n.language.startsWith('es')
  const page = localizeNeedLandingPage(basePage, i18n.language)
  const siblingPages = localizeNeedLandingPages(allNeedLandingPages, i18n.language)
    .filter((item) => item.slug !== page.slug)
    .slice(0, 4)
  const copy = {
    home: isSpanish ? 'Inicio' : 'Home',
    resources: isSpanish ? 'Recursos' : 'Resources',
    primaryCta: isSpanish ? 'Crear mi plan CasaMia' : 'Build my CasaMia plan',
    secondaryCta: isSpanish ? 'Ver servicios relacionados' : 'See related services',
    quickCardTitle: isSpanish ? 'Plan CasaMia' : 'CasaMia plan',
    quickCardBody: isSpanish
      ? 'Evaluación, selección de mejoras, coordinación de instalación y seguimiento en una ruta gestionada.'
      : 'Assessment, package selection, installation coordination and follow-up in one managed route.',
    whoHelps: isSpanish ? 'A quién ayuda' : 'Who this helps',
    checkFirst: isSpanish ? 'Qué revisar primero' : 'What to check first',
    handlesIt: isSpanish ? 'Cómo lo gestiona CasaMia' : 'How CasaMia handles it',
    practicalEyebrow: isSpanish ? 'Práctico, no abrumador' : 'Practical, not overwhelming',
    practicalTitle: isSpanish ? 'Empieza por la rutina diaria.' : 'Start with the daily routine.',
    practicalBody: isSpanish
      ? 'La pregunta útil no es “qué producto compro”, sino dónde se siente insegura la persona, qué movimiento ocurre ahí y qué apoyo haría ese momento más fácil.'
      : 'The useful question is not “which product should I buy?” It is: where does the person feel unsafe, what movement happens there, and what support would make that moment easier?',
    showSpace: isSpanish ? 'Muestra el espacio' : 'Show the space',
    showSpaceBody: isSpanish
      ? 'Unas fotos o un vídeo corto de la ruta, transferencia o puerta suelen bastar para empezar.'
      : 'A few photos or a short video of the route, transfer point or doorway is often enough to start.',
    tellRoutine: isSpanish ? 'Cuéntanos la rutina' : 'Tell us the routine',
    tellRoutineBody: isSpanish
      ? 'Explica qué resulta difícil: ducha, cama, escaleras, baño de noche o vuelta a casa.'
      : 'Explain what feels difficult: showering, getting out of bed, stairs, night bathroom trips or returning home.',
    planTitle: isSpanish ? 'Recibe un plan orientado a resultados' : 'Receive a package-led plan',
    planBody: isSpanish
      ? 'CasaMia recomienda resultados primero y confirma después productos, medidas e instalación.'
      : 'CasaMia recommends outcomes first, then confirms products, measurements and installer requirements.',
    decisionEyebrow: isSpanish ? 'Mapa rápido de decisión' : 'Quick decision map',
    decisionTitle: isSpanish ? 'Convierte la duda en una prioridad clara.' : 'Turn the concern into a clear priority.',
    decisionBody: isSpanish
      ? 'Estas páginas no deberían quedarse en teoría. CasaMia ayuda a ordenar la situación en señales, datos útiles y próximos pasos concretos.'
      : 'These pages should not stay theoretical. CasaMia helps turn the situation into signals, useful evidence and clear next steps.',
    decisionCards: isSpanish
      ? [
          {
            title: 'Señales para no esperar',
            body: 'Sustos recientes, evitación de una rutina, dolor, miedo, oscuridad, suelo mojado o necesidad de ayuda cada vez más frecuente.',
          },
          {
            title: 'Qué conviene preparar',
            body: 'Fotos, un vídeo corto, la rutina exacta, medidas básicas si las tienes y quién toma la decisión en la familia.',
          },
          {
            title: 'Qué define CasaMia',
            body: 'Prioridad, paquete recomendado, si hace falta visita, qué puede instalarse ya y qué requiere presupuesto o compatibilidad.',
          },
        ]
      : [
          {
            title: 'Signals not to ignore',
            body: 'Recent near misses, avoiding a routine, pain, fear, low light, wet floors or needing more help than before.',
          },
          {
            title: 'What to prepare',
            body: 'Photos, a short video, the exact routine, basic measurements if available and who needs to be involved in the decision.',
          },
          {
            title: 'What CasaMia defines',
            body: 'Priority, recommended package route, whether a visit is needed, what can be installed now and what needs quote or compatibility checks.',
          },
        ],
    usefulPages: isSpanish ? 'Páginas útiles' : 'Useful next pages',
    recommendedEyebrow: isSpanish ? 'Recursos recomendados' : 'Recommended resources',
    recommendedTitle: isSpanish ? 'Lee solo lo que ayuda a decidir.' : 'Read only what helps you decide.',
    recommendedBody: isSpanish
      ? 'Cada tema combina una explicación práctica con una herramienta útil para pasar de la preocupación al siguiente paso.'
      : 'Each topic combines practical guidance with a useful tool so families can move from worry to the next step.',
    readResource: isSpanish ? 'Leer recurso' : 'Read resource',
    useTool: isSpanish ? 'Usar herramienta' : 'Use tool',
    catalogueEyebrow: isSpanish ? 'Catálogo CasaMia actual' : 'Current CasaMia catalogue',
    catalogueTitle: isSpanish ? 'Qué puede incluir CasaMia.' : 'What CasaMia can include.',
    catalogueBody: isSpanish
      ? 'Estos son resultados visibles para la familia desde el catálogo activo. La combinación exacta se confirma después de tus respuestas, fotos o visita.'
      : 'These are customer-facing outcomes from the active service catalogue. The exact mix is confirmed after your answers, photos or site visit.',
    catalogueCta: isSpanish ? 'Ver el catálogo completo' : 'Review the full catalogue',
    turnkeyEyebrow: isSpanish ? 'Soporte llave en mano' : 'Turnkey support',
    turnkeyTitle: isSpanish ? 'De la preocupación al siguiente paso claro.' : 'From concern to clear next step.',
    turnkeyBody: isSpanish
      ? 'CasaMia convierte una preocupación general en una ruta práctica: qué importa ahora, qué puede esperar, qué necesita medidas y qué puede coordinarse como un paquete.'
      : 'CasaMia turns a broad worry into a practical home-safety route: what matters now, what can wait, what needs measurement, and what can be coordinated as one package.',
    turnkeySteps: isSpanish
      ? ['Cuéntanos qué ha cambiado', 'Revisamos vivienda y rutinas', 'Recibe una propuesta práctica', 'Instalamos, configuramos y acompañamos']
      : ['Tell us what changed', 'Review the home and routines', 'Receive a practical proposal', 'Install, configure and support'],
    clarifyEyebrow: isSpanish ? 'Qué puede aclarar tu plan CasaMia' : 'What your CasaMia plan can clarify',
    clarifyTitle: isSpanish ? 'Suficientemente claro para actuar.' : 'Clear enough to act on.',
    clarifyItems: isSpanish
      ? [
          'Qué cambios son urgentes, recomendados u opcionales',
          'Qué entra en un paquete y qué necesita presupuesto',
          'Si hace falta visita, medición o comprobación de compatibilidad',
          'Qué puede coordinar CasaMia de principio a fin',
        ]
      : [
          'Which changes are urgent, recommended or optional',
          'Which items fit within a package and which need a quote',
          'Whether a visit, measurement or compatibility check is needed',
          'What CasaMia can coordinate end to end',
        ],
    beforeSpendingEyebrow: isSpanish ? 'Antes de gastar dinero' : 'Before spending money',
    beforeSpendingTitle: isSpanish ? 'Tres revisiones que evitan malas decisiones.' : 'Three checks that avoid poor choices.',
    beforeSpendingChecks: isSpanish
      ? [
          ['Revisa el movimiento exacto.', 'Dónde alcanza, gira, se sienta, se levanta o duda la persona.'],
          ['Revisa el punto de fijación.', 'Un apoyo solo funciona si está colocado e instalado para el usuario real.'],
          ['Revisa la entrega.', 'La mejor solución es la que la persona y la familia entienden después de instalarla.'],
        ]
      : [
          ['Check the exact movement.', 'Where does the person reach, turn, sit, stand or hesitate?'],
          ['Check the fixing point.', 'Support only works when it is positioned and installed for the real user.'],
          ['Check the handover.', 'The best solution is one the person and family understand after installation.'],
        ],
    goDeeper: isSpanish ? 'Profundiza sin perderte.' : 'Go deeper without getting lost.',
    questions: isSpanish ? 'Preguntas que suelen hacer las familias' : 'Questions families ask',
    popularNeeds: isSpanish ? 'Necesidades CasaMia frecuentes' : 'Popular CasaMia needs',
    moreWays: isSpanish ? 'Más formas de buscar ayuda.' : 'More ways families search for help.',
    ready: isSpanish ? 'Cuando quieras' : 'Ready when you are',
    finalTitle: isSpanish ? 'Recibe una recomendación CasaMia práctica.' : 'Get a practical CasaMia recommendation.',
    finalBody: isSpanish
      ? 'Empieza online, envía fotos o pide una llamada. Convertimos la información en un plan más claro antes de comprometerte con trabajos.'
      : 'Start online, send photos or ask for a call. We turn the information into a clearer plan before you commit to works.',
    startPlan: isSpanish ? 'Empezar mi plan' : 'Start my plan',
    bookAssessment: isSpanish ? 'Reservar evaluación' : 'Book an assessment',
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
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: copy.turnkeyTitle,
      description: copy.turnkeyBody,
      step: copy.turnkeySteps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step,
      })),
    },
  ]

  const catalogueServices = useMemo(
    () => getNeedCatalogueServices(page.slug, catalogue.services),
    [catalogue.services, page.slug],
  )
  const localizedArticles = useMemo(() => localizeBlogArticles(blogArticles, i18n.language), [i18n.language])
  const recommendedResources = useMemo(
    () => getNeedRecommendedResources(page.slug, localizedArticles, i18n.language),
    [localizedArticles, i18n.language, page.slug],
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
                  {copy.primaryCta}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="btn btn-white" to={page.servicePath}>
                  {copy.secondaryCta}
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
                <strong>{copy.quickCardTitle}</strong>
                <p>{copy.quickCardBody}</p>
              </div>
            </aside>
          </div>
        </section>

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

        <section className="need-landing-practical">
          <div className="site-shell need-landing-practical-grid">
            <div className="need-landing-practical-copy">
              <p className="eyebrow">{copy.practicalEyebrow}</p>
              <h2>{copy.practicalTitle}</h2>
              <p>{copy.practicalBody}</p>
            </div>
            <div className="need-landing-mini-grid">
              <MiniCard
                icon={<Camera size={21} aria-hidden="true" />}
                title={copy.showSpace}
                body={copy.showSpaceBody}
              />
              <MiniCard
                icon={<MessageCircle size={21} aria-hidden="true" />}
                title={copy.tellRoutine}
                body={copy.tellRoutineBody}
              />
              <MiniCard
                icon={<Wrench size={21} aria-hidden="true" />}
                title={copy.planTitle}
                body={copy.planBody}
              />
            </div>
          </div>
        </section>

        <section className="need-landing-decision" aria-labelledby="need-landing-decision-title">
          <div className="site-shell need-landing-decision-grid">
            <div className="need-landing-decision-copy">
              <p className="eyebrow">{copy.decisionEyebrow}</p>
              <h2 id="need-landing-decision-title">{copy.decisionTitle}</h2>
              <p>{copy.decisionBody}</p>
            </div>
            <div className="need-decision-card-grid">
              {copy.decisionCards.map((item, index) => (
                <DecisionCard
                  key={item.title}
                  icon={
                    index === 0 ? (
                      <AlertTriangle size={21} aria-hidden="true" />
                    ) : index === 1 ? (
                      <ListChecks size={21} aria-hidden="true" />
                    ) : (
                      <Route size={21} aria-hidden="true" />
                    )
                  }
                  title={item.title}
                  body={item.body}
                />
              ))}
            </div>
          </div>
        </section>

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
                    <p>{resource.description}</p>
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

        {catalogueServices.length > 0 ? (
          <section className="need-landing-catalogue">
            <div className="site-shell need-landing-catalogue-grid">
              <div className="need-landing-catalogue-copy">
                <p className="eyebrow">{copy.catalogueEyebrow}</p>
                <h2>{copy.catalogueTitle}</h2>
                <p>{copy.catalogueBody}</p>
                <Link className="need-landing-text-link" to="/services">
                  {copy.catalogueCta}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
              <div className="need-landing-catalogue-list">
                {catalogueServices.map((service) => (
                  <CatalogueServiceCard key={service.id} service={service} language={i18n.language} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="need-landing-process">
          <div className="site-shell need-landing-process-grid">
            <div>
              <p className="eyebrow">{copy.turnkeyEyebrow}</p>
              <h2>{copy.turnkeyTitle}</h2>
              <p>{copy.turnkeyBody}</p>
            </div>
            <ol className="need-landing-steps">
              {copy.turnkeySteps.map((step, index) => (
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
              <p className="eyebrow">{copy.clarifyEyebrow}</p>
              <h2>{copy.clarifyTitle}</h2>
              <div className="need-landing-route-list">
                {copy.clarifyItems.map((item) => (
                  <span key={item}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="need-landing-dos-card">
              <p className="eyebrow">{copy.beforeSpendingEyebrow}</p>
              <h2>{copy.beforeSpendingTitle}</h2>
              <ol>
                {copy.beforeSpendingChecks.map(([title, body]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="need-landing-section">
          <div className="site-shell need-landing-links-grid">
            <div className="need-landing-related">
              <p className="eyebrow">{copy.usefulPages}</p>
              <h2>{copy.goDeeper}</h2>
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
              <p className="eyebrow">{copy.questions}</p>
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
                <p className="eyebrow">{copy.popularNeeds}</p>
                <h2>{copy.moreWays}</h2>
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
      to: '/home-safety-assessment#self-inspection-tool',
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
  'safe-bathroom-access': [
    { kind: 'article', id: 'bathroom-safety-seniors-costly-mistakes' },
    { kind: 'article', id: 'home-adaptation-grants-spain-family-guide' },
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

function CatalogueServiceCard({ service, language }: { service: CasaMiaService; language: string }) {
  const section = service.section ?? 'home_safety_package'
  const summary = service.customerBenefit || service.shortDescription
  const languageKey = language.toLowerCase().startsWith('es') ? 'es' : 'en'

  return (
    <article className="need-catalogue-card">
      <div>
        <span>{sectionLabels[section][languageKey]}</span>
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

function DecisionCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <article className="need-decision-card">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
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
