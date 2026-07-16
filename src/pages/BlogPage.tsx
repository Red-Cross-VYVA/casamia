import {
  ArrowRight,
  Bath,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  Home,
  Lightbulb,
  MoonStar,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { blogArticles } from '../constants/blogContent'
import {
  completeHomeChecklistDownloads,
  type ResourceDownloadLanguage,
} from '../constants/resourceDownloads'
import { trackEvent } from '../utils/analytics'
import '../styles/resources-hub.css'

const siteUrl = 'https://casamia.es'

const pageCopy = {
  en: {
    lang: 'en',
    seoTitle: 'Senior Home Safety Checklist & Practical Resources | CasaMia',
    seoDescription:
      'Download CasaMia\'s free room-by-room senior home conversion checklist for Spain and use practical tools for home safety, grant readiness and family planning.',
    heroEyebrow: 'Practical resources for real homes',
    heroTitle: 'Make the home safer, one room at a time.',
    heroBody:
      'Start with a complete printable checklist, then use the right online tool or focused guide for the decision in front of you.',
    heroPrimary: 'Get the free checklist',
    heroSecondary: 'Use the online self-check',
    downloadEyebrow: 'Free printable workbook',
    downloadTitle: 'The Complete Senior Home Conversion Checklist',
    downloadBody:
      'Walk through the home with the person who lives there, identify quick wins, flag work that needs professional review and finish with a clear family action plan.',
    downloadMeta: '10 home areas  ·  100+ practical checks  ·  action-plan worksheet',
    downloadBenefits: [
      'Entrances, stairs, living areas, bedroom, bathroom and kitchen',
      'Lighting, emergency planning, connected safety and outdoor areas',
      'Priority guide, quotation prompts and a handover recheck',
    ],
    downloadPrimary: 'Download the English PDF',
    downloadSecondary: 'Descargar en español',
    downloadNote: 'Print-friendly PDF. No email or sign-up required.',
    coverLabel: 'CASAMIA PRACTICAL GUIDE',
    coverTitle: 'Complete home conversion checklist',
    coverFooter: 'Room by room. Priority by priority.',
    toolsEyebrow: 'Choose one useful next step',
    toolsTitle: 'Start with the task you need today.',
    toolsBody:
      'Each tool has one clear job. Use it online, save your observations and bring the result into a family discussion or professional assessment.',
    openTool: 'Open tool',
    todayEyebrow: 'A useful first 20 minutes',
    todayTitle: 'Three checks worth doing today.',
    todayBody:
      'These are simple observations, not building work. If anything feels unstable or unsafe, stop using it and arrange an appropriate review.',
    guideEyebrow: 'Practical guidance by situation',
    guideTitle: 'Find the answer without scrolling through a wall of articles.',
    guideBody:
      'Guides are grouped around the decision a family is trying to make. Choose the closest situation and go straight to the relevant advice.',
    guideLanguage: 'Guides are currently available in English.',
    readGuide: 'Read guide',
    finalEyebrow: 'Need a plan for a real home?',
    finalTitle: 'Turn the checklist into a prioritised conversion plan.',
    finalBody:
      'CasaMia can review the home, separate urgent changes from future improvements and explain the practical next steps.',
    finalCta: 'Request a home assessment',
  },
  es: {
    lang: 'es',
    seoTitle: 'Lista de seguridad y recursos para adaptar viviendas | CasaMia',
    seoDescription:
      'Descarga gratis la lista de CasaMia para adaptar una vivienda estancia por estancia y utiliza herramientas prácticas de seguridad, ayudas y planificación familiar.',
    heroEyebrow: 'Recursos prácticos para hogares reales',
    heroTitle: 'Haz el hogar más seguro, estancia por estancia.',
    heroBody:
      'Empieza con una lista completa para imprimir y utiliza después la herramienta o guía adecuada para la decisión que tienes delante.',
    heroPrimary: 'Descargar la lista gratuita',
    heroSecondary: 'Usar la revisión online',
    downloadEyebrow: 'Cuaderno gratuito para imprimir',
    downloadTitle: 'Lista completa para adaptar la vivienda de una persona mayor',
    downloadBody:
      'Recorre la vivienda con la persona que vive en ella, identifica mejoras rápidas, señala los trabajos que necesitan revisión profesional y termina con un plan de acción familiar.',
    downloadMeta: '10 zonas del hogar  ·  más de 100 comprobaciones  ·  hoja de planificación',
    downloadBenefits: [
      'Entrada, escaleras, salón, dormitorio, baño y cocina',
      'Iluminación, emergencias, seguridad conectada y exteriores',
      'Prioridades, preguntas para presupuestos y revisión final',
    ],
    downloadPrimary: 'Descargar el PDF en español',
    downloadSecondary: 'Download in English',
    downloadNote: 'PDF preparado para imprimir. Sin email ni registro.',
    coverLabel: 'GUÍA PRÁCTICA CASAMIA',
    coverTitle: 'Lista completa para adaptar el hogar',
    coverFooter: 'Estancia por estancia. Prioridad por prioridad.',
    toolsEyebrow: 'Elige un siguiente paso útil',
    toolsTitle: 'Empieza por lo que necesitas hoy.',
    toolsBody:
      'Cada herramienta tiene una función clara. Úsala online, guarda tus observaciones y llévalas a la conversación familiar o a una evaluación profesional.',
    openTool: 'Abrir herramienta',
    todayEyebrow: 'Unos primeros 20 minutos útiles',
    todayTitle: 'Tres comprobaciones que merece la pena hacer hoy.',
    todayBody:
      'Son observaciones sencillas, no trabajos de obra. Si algo está inestable o parece peligroso, deja de usarlo y solicita una revisión adecuada.',
    guideEyebrow: 'Guías prácticas por situación',
    guideTitle: 'Encuentra la respuesta sin recorrer una pared de artículos.',
    guideBody:
      'Las guías están agrupadas según la decisión que una familia intenta tomar. Elige la situación más cercana y ve directamente al consejo relevante.',
    guideLanguage: 'Las guías de lectura están disponibles actualmente en inglés.',
    readGuide: 'Leer guía',
    finalEyebrow: '¿Necesitas un plan para una vivienda real?',
    finalTitle: 'Convierte la lista en un plan de adaptación con prioridades.',
    finalBody:
      'CasaMia puede revisar la vivienda, separar los cambios urgentes de las mejoras futuras y explicar los siguientes pasos prácticos.',
    finalCta: 'Solicitar una evaluación',
  },
} as const

const toolContent = [
  {
    icon: ClipboardCheck,
    title: { en: '15-minute room-by-room check', es: 'Revisión online por estancias' },
    body: {
      en: 'Answer guided questions across seven areas and leave with a practical list of items to review.',
      es: 'Responde preguntas guiadas en siete zonas y obtén una lista práctica de puntos que revisar.',
    },
    to: '/home-safety-assessment#self-inspection-tool',
  },
  {
    icon: Camera,
    title: { en: 'Photo safety review', es: 'Revisión de seguridad con fotos' },
    body: {
      en: 'Organise room photos and context so the biggest concerns are easier to discuss and prioritise.',
      es: 'Organiza fotos y contexto para comentar y priorizar con más facilidad las principales preocupaciones.',
    },
    to: '/#estimate-upload',
  },
  {
    icon: FileCheck2,
    title: { en: 'Grant-readiness check', es: 'Revisión para preparar ayudas' },
    body: {
      en: 'Prepare the documents and funding questions to check before a local grant call or quotation.',
      es: 'Prepara los documentos y preguntas que conviene revisar antes de una convocatoria o presupuesto.',
    },
    to: '/grant-check',
  },
] as const

const quickChecks = [
  {
    icon: MoonStar,
    title: { en: 'Walk the night route', es: 'Recorre la ruta nocturna' },
    body: {
      en: 'Check the route from bed to bathroom in low light. Note shadows, thresholds, cables and what the person reaches for.',
      es: 'Revisa con poca luz el recorrido de la cama al baño. Anota sombras, umbrales, cables y dónde busca apoyo la persona.',
    },
  },
  {
    icon: Lightbulb,
    title: { en: 'Clear one daily route', es: 'Despeja una ruta diaria' },
    body: {
      en: 'Remove loose rugs, pet items and low furniture from the route used most between the main rooms.',
      es: 'Retira alfombras sueltas, objetos de mascotas y muebles bajos de la ruta más utilizada entre las estancias principales.',
    },
  },
  {
    icon: PhoneCall,
    title: { en: 'Put help within reach', es: 'Deja la ayuda al alcance' },
    body: {
      en: 'Confirm a charged phone or call device can be reached from the bed and bathroom, and agree who responds.',
      es: 'Comprueba que hay un teléfono cargado o dispositivo de aviso accesible desde la cama y el baño, y acuerda quién responde.',
    },
  },
] as const

const guideGroups = [
  {
    icon: ShieldCheck,
    title: { en: 'Reduce everyday fall risk', es: 'Reducir el riesgo de caídas' },
    articleIds: [
      'fall-prevention-home-checklist-spain',
      'bathroom-safety-seniors-costly-mistakes',
      'stair-safety-handrails-older-adults',
      'bedroom-night-safety-older-adults',
    ],
  },
  {
    icon: Home,
    title: { en: 'Support routines and independence', es: 'Apoyar rutinas y autonomía' },
    articleIds: [
      'kitchen-safety-aging-in-place',
      'dementia-friendly-home-safety',
      'smart-home-safety-without-overcomplicating',
      'emergency-plan-aging-parents-home',
    ],
  },
  {
    icon: Bath,
    title: { en: 'Plan work and funding', es: 'Planificar obras y financiación' },
    articleIds: [
      'home-adaptation-grants-spain-family-guide',
      'choose-home-safety-provider-spain',
    ],
  },
] as const

export function BlogPage() {
  const { i18n } = useTranslation()
  const language: ResourceDownloadLanguage = i18n.language.startsWith('es') ? 'es' : 'en'
  const copy = pageCopy[language]
  const alternateLanguage: ResourceDownloadLanguage = language === 'es' ? 'en' : 'es'
  const primaryDownload = completeHomeChecklistDownloads[language]
  const alternateDownload = completeHomeChecklistDownloads[alternateLanguage]

  const resourceHubSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${siteUrl}/blog#resources`,
          url: `${siteUrl}/blog`,
          name: copy.seoTitle,
          description: copy.seoDescription,
          inLanguage: copy.lang,
          publisher: {
            '@type': 'Organization',
            name: 'CasaMia',
            url: siteUrl,
          },
          mainEntity: { '@id': `${siteUrl}/blog#resource-list` },
        },
        {
          '@type': 'DigitalDocument',
          '@id': `${siteUrl}${primaryDownload.href}#document`,
          name: primaryDownload.title,
          description: copy.downloadBody,
          inLanguage: primaryDownload.language,
          encodingFormat: 'application/pdf',
          contentUrl: `${siteUrl}${primaryDownload.href}`,
          isAccessibleForFree: true,
          publisher: {
            '@type': 'Organization',
            name: 'CasaMia',
            url: siteUrl,
          },
        },
        {
          '@type': 'ItemList',
          '@id': `${siteUrl}/blog#resource-list`,
          name: language === 'es' ? 'Herramientas y guías de seguridad en el hogar' : 'Senior home safety tools and guides',
          numberOfItems: toolContent.length + blogArticles.length + 1,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: primaryDownload.title,
              url: `${siteUrl}${primaryDownload.href}`,
            },
            ...toolContent.map((tool, index) => ({
              '@type': 'ListItem',
              position: index + 2,
              name: tool.title[language],
              url: `${siteUrl}${tool.to}`,
            })),
            ...blogArticles.map((article, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + index + 2,
              name: article.title,
              url: `${siteUrl}${article.path}`,
            })),
          ],
        },
      ],
    }),
    [copy, language, primaryDownload],
  )

  function trackDownload(downloadLanguage: ResourceDownloadLanguage) {
    trackEvent('resource_download', {
      resource: 'complete_senior_home_conversion_checklist',
      language: downloadLanguage,
      location: 'resources_hub',
    })
  }

  return (
    <>
      <SEO
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/blog"
        schema={resourceHubSchema}
      />

      <main className="resource-hub" lang={copy.lang}>
        <section className="resource-hub-hero" aria-labelledby="resources-page-title">
          <div className="site-shell resource-hub-hero-grid">
            <div className="resource-hub-hero-copy">
              <span className="eyebrow">
                <span className="dot" aria-hidden="true" />
                {copy.heroEyebrow}
              </span>
              <h1 id="resources-page-title">{copy.heroTitle}</h1>
              <p>{copy.heroBody}</p>
              <div className="resource-hub-hero-actions">
                <a className="btn btn-green" href="#complete-home-checklist">
                  {copy.heroPrimary}
                  <ArrowRight size={19} aria-hidden="true" />
                </a>
                <Link className="btn btn-white" to="/home-safety-assessment#self-inspection-tool">
                  {copy.heroSecondary}
                </Link>
              </div>
            </div>

            <article className="resource-download-card" id="complete-home-checklist">
              <div className="resource-download-cover" aria-hidden="true">
                <span>{copy.coverLabel}</span>
                <div className="resource-download-cover-icon">
                  <Home size={34} />
                  <ClipboardCheck size={25} />
                </div>
                <h2>{copy.coverTitle}</h2>
                <div className="resource-download-cover-rooms">
                  <span>01</span>
                  <span>02</span>
                  <span>03</span>
                  <span>04</span>
                </div>
                <strong>{copy.coverFooter}</strong>
              </div>

              <div className="resource-download-content">
                <p className="resource-download-eyebrow">
                  <Download size={17} aria-hidden="true" />
                  {copy.downloadEyebrow}
                </p>
                <h2>{copy.downloadTitle}</h2>
                <p className="resource-download-description">{copy.downloadBody}</p>
                <p className="resource-download-meta">{copy.downloadMeta}</p>
                <ul>
                  {copy.downloadBenefits.map((benefit) => (
                    <li key={benefit}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="resource-download-actions">
                  <a
                    className="btn btn-green"
                    href={primaryDownload.href}
                    download={primaryDownload.fileName}
                    onClick={() => trackDownload(primaryDownload.language)}
                  >
                    <Download size={19} aria-hidden="true" />
                    {copy.downloadPrimary}
                  </a>
                  <a
                    className="resource-download-alternate"
                    href={alternateDownload.href}
                    download={alternateDownload.fileName}
                    hrefLang={alternateDownload.language}
                    onClick={() => trackDownload(alternateDownload.language)}
                  >
                    {copy.downloadSecondary}
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
                <small>{copy.downloadNote}</small>
              </div>
            </article>
          </div>
        </section>

        <section className="resource-tools-section" aria-labelledby="resource-tools-title">
          <div className="site-shell">
            <div className="resource-hub-heading">
              <p className="eyebrow">{copy.toolsEyebrow}</p>
              <h2 id="resource-tools-title">{copy.toolsTitle}</h2>
              <p>{copy.toolsBody}</p>
            </div>

            <div className="resource-tool-grid">
              {toolContent.map((tool, index) => {
                const Icon = tool.icon

                return (
                  <Link key={tool.to} className="resource-tool-card" to={tool.to}>
                    <div className="resource-tool-card-topline">
                      <span className="resource-tool-icon">
                        <Icon size={24} aria-hidden="true" />
                      </span>
                      <span className="resource-tool-number">0{index + 1}</span>
                    </div>
                    <h3>{tool.title[language]}</h3>
                    <p>{tool.body[language]}</p>
                    <strong>
                      {copy.openTool}
                      <ArrowRight size={17} aria-hidden="true" />
                    </strong>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resource-quick-section" aria-labelledby="resource-quick-title">
          <div className="site-shell resource-quick-panel">
            <div className="resource-quick-copy">
              <p className="eyebrow">{copy.todayEyebrow}</p>
              <h2 id="resource-quick-title">{copy.todayTitle}</h2>
              <p>{copy.todayBody}</p>
            </div>

            <ol className="resource-quick-list">
              {quickChecks.map((item, index) => {
                const Icon = item.icon

                return (
                  <li key={item.title.en}>
                    <span className="resource-quick-index">{index + 1}</span>
                    <span className="resource-quick-icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{item.title[language]}</h3>
                      <p>{item.body[language]}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        <section className="resource-guides-section" aria-labelledby="resource-guides-title">
          <div className="site-shell">
            <div className="resource-hub-heading resource-hub-heading-wide">
              <p className="eyebrow">{copy.guideEyebrow}</p>
              <h2 id="resource-guides-title">{copy.guideTitle}</h2>
              <p>{copy.guideBody}</p>
              {language === 'es' ? <small>{copy.guideLanguage}</small> : null}
            </div>

            <div className="resource-guide-groups">
              {guideGroups.map((group) => {
                const Icon = group.icon
                const articles = group.articleIds
                  .map((articleId) => blogArticles.find((article) => article.id === articleId))
                  .filter((article): article is (typeof blogArticles)[number] => Boolean(article))

                return (
                  <article className="resource-guide-group" key={group.title.en}>
                    <div className="resource-guide-group-heading">
                      <span>
                        <Icon size={23} aria-hidden="true" />
                      </span>
                      <h3>{group.title[language]}</h3>
                    </div>
                    <ul>
                      {articles.map((article) => (
                        <li key={article.id}>
                          <Link to={article.path}>
                            <span>
                              <strong>{article.title}</strong>
                              <small>{article.readTime}</small>
                            </span>
                            <ArrowRight size={17} aria-label={copy.readGuide} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resource-final-section">
          <div className="site-shell resource-final-panel">
            <div>
              <p className="eyebrow">{copy.finalEyebrow}</p>
              <h2>{copy.finalTitle}</h2>
              <p>{copy.finalBody}</p>
            </div>
            <Link className="btn btn-green" to="/home-safety-assessment">
              {copy.finalCta}
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
