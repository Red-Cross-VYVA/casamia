import {
  ArrowRight,
  Calculator,
  Camera,
  ClipboardCheck,
  FileCheck2,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import '../styles/tools-page.css'

const siteUrl = 'https://casamia.com.es'

type Language = 'en' | 'es'

const copy = {
  en: {
    lang: 'en',
    seoTitle: 'Free Senior Home Safety Tools | CasaMia',
    seoDescription:
      'Use CasaMia free tools to check parent safety at home, compare home adaptation with residence costs, prepare grants and start a room-by-room review.',
    eyebrow: 'Free practical tools',
    title: 'Start with the tool that matches today’s question.',
    body:
      'Families rarely need a wall of advice. Choose one practical tool, get a clear next step, then decide whether a checklist, online review or CasaMia assessment is useful.',
    featuredLabel: 'Most useful first step',
    featuredTitle: 'Is my parent safe at home?',
    featuredBody:
      'Five everyday questions to understand whether the next step is observation, a focused review or faster action.',
    featuredCta: 'Take the quick quiz',
    sectionEyebrow: 'Choose your route',
    sectionTitle: 'Tools for decisions, not guesswork.',
    openTool: 'Open tool',
    finalTitle: 'Need help turning answers into a plan?',
    finalBody:
      'CasaMia can review the home, prioritise what matters and explain what can be done now, later or with professional support.',
    finalCta: 'Start guided review',
  },
  es: {
    lang: 'es',
    seoTitle: 'Herramientas gratis de seguridad en casa | CasaMia',
    seoDescription:
      'Utiliza herramientas gratuitas de CasaMia para revisar seguridad, comparar casa y residencia, preparar ayudas y empezar una revisión por estancias.',
    eyebrow: 'Herramientas prácticas gratuitas',
    title: 'Empieza con la herramienta que responde a la pregunta de hoy.',
    body:
      'Las familias no necesitan una pared de consejos. Elige una herramienta práctica, obtén un siguiente paso claro y decide si conviene una lista, revisión online o evaluación CasaMia.',
    featuredLabel: 'Primer paso más útil',
    featuredTitle: '¿Está seguro en casa?',
    featuredBody:
      'Cinco preguntas cotidianas para saber si toca observar, hacer una revisión focalizada o actuar con más rapidez.',
    featuredCta: 'Hacer el quiz rápido',
    sectionEyebrow: 'Elige tu ruta',
    sectionTitle: 'Herramientas para decidir, no para adivinar.',
    openTool: 'Abrir herramienta',
    finalTitle: '¿Necesitas convertir respuestas en un plan?',
    finalBody:
      'CasaMia puede revisar la vivienda, priorizar lo importante y explicar qué hacer ahora, más adelante o con apoyo profesional.',
    finalCta: 'Empezar revisión guiada',
  },
} as const

const tools = [
  {
    icon: HelpCircle,
    title: { en: 'Is my parent safe at home?', es: '¿Está seguro en casa?' },
    body: {
      en: 'A quick family triage when something feels different but you are not sure where to start.',
      es: 'Una orientación rápida cuando algo parece distinto y no sabes por dónde empezar.',
    },
    to: '/tools/is-my-parent-safe-at-home',
  },
  {
    icon: Calculator,
    title: { en: 'Home vs residence cost planner', es: 'Casa o residencia: comparador' },
    body: {
      en: 'Compare adapting the home with a residence route across cost, timing and family support.',
      es: 'Compara adaptar la vivienda con una residencia en coste, plazos y apoyo familiar.',
    },
    to: '/tools/home-vs-residence-cost-calculator',
  },
  {
    icon: FileCheck2,
    title: { en: 'Grant-readiness check', es: 'Revisión para ayudas' },
    body: {
      en: 'Prepare the questions, documents and local programme checks before relying on funding.',
      es: 'Prepara preguntas, documentos y comprobaciones antes de contar con una ayuda.',
    },
    to: '/grant-check',
  },
  {
    icon: ClipboardCheck,
    title: { en: 'Room-by-room online review', es: 'Revisión online por estancias' },
    body: {
      en: 'Answer guided questions about the home and leave with clearer priorities.',
      es: 'Responde preguntas guiadas sobre la vivienda y sal con prioridades más claras.',
    },
    to: '/home-safety-assessment#self-inspection-tool',
  },
  {
    icon: Camera,
    title: { en: 'Photo safety report', es: 'Informe con fotos' },
    body: {
      en: 'Upload a few photos so visible risks and first actions are easier to discuss.',
      es: 'Sube algunas fotos para comentar riesgos visibles y primeras acciones.',
    },
    to: '/#estimate-upload',
  },
] as const

export function ToolsPage() {
  const { i18n } = useTranslation()
  const language: Language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const pageCopy = copy[language]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/tools#collection`,
    name: pageCopy.seoTitle,
    description: pageCopy.seoDescription,
    url: `${siteUrl}/tools`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.title[language],
        url: `${siteUrl}${tool.to}`,
      })),
    },
  }

  return (
    <main className="tools-page" lang={pageCopy.lang}>
      <SEO title={pageCopy.seoTitle} description={pageCopy.seoDescription} path="/tools" schema={schema} />

      <section className="tools-hero">
        <div className="site-shell tools-hero-grid">
          <div className="tools-hero-copy">
            <p className="eyebrow">{pageCopy.eyebrow}</p>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.body}</p>
          </div>
          <Link className="tools-featured-card" to="/tools/is-my-parent-safe-at-home">
            <span>
              <ShieldCheck size={30} aria-hidden="true" />
            </span>
            <small>{pageCopy.featuredLabel}</small>
            <h2>{pageCopy.featuredTitle}</h2>
            <p>{pageCopy.featuredBody}</p>
            <strong>
              {pageCopy.featuredCta}
              <ArrowRight size={18} aria-hidden="true" />
            </strong>
          </Link>
        </div>
      </section>

      <section className="tools-list-section" aria-labelledby="tools-list-title">
        <div className="site-shell">
          <div className="tools-heading">
            <p className="eyebrow">{pageCopy.sectionEyebrow}</p>
            <h2 id="tools-list-title">{pageCopy.sectionTitle}</h2>
          </div>
          <div className="tools-grid">
            {tools.map((tool, index) => {
              const Icon = tool.icon

              return (
                <Link className="tools-card" key={tool.to} to={tool.to}>
                  <div className="tools-card-topline">
                    <span className="tools-card-icon">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <span className="tools-card-number">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3>{tool.title[language]}</h3>
                  <p>{tool.body[language]}</p>
                  <strong>
                    {pageCopy.openTool}
                    <ArrowRight size={17} aria-hidden="true" />
                  </strong>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="tools-final-section">
        <div className="site-shell tools-final-panel">
          <div>
            <h2>{pageCopy.finalTitle}</h2>
            <p>{pageCopy.finalBody}</p>
          </div>
          <Link className="btn btn-green" to="/home-safety-assessment#self-inspection-tool">
            {pageCopy.finalCta}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
