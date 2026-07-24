import {
  ArrowRight,
  Camera,
  ClipboardCheck,
  FileCheck2,
  HelpCircle,
  Home,
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
    chooserEyebrow: 'Not sure which one?',
    chooserTitle: 'Use the tool that matches the decision you need to make.',
    chooserBody:
      'Each route is deliberately short. Start with the question closest to your situation, then CasaMia can turn the answer into a practical home plan if you want help.',
    nextEyebrow: 'After the tool',
    nextTitle: 'Leave with something the family can use.',
    finalTitle: 'Need help turning answers into a plan?',
    finalBody:
      'CasaMia can review the home, prioritise what matters and explain what can be done now, later or with professional support.',
    finalCta: 'Start guided review',
    faqEyebrow: 'Quick answers',
    faqTitle: 'How to use the tools well.',
    faqItems: [
      {
        question: 'Which tool should I start with?',
        answer:
          'If you are unsure, start with the parent safety quiz. If one room is already worrying, use photos or the room-by-room review.',
      },
      {
        question: 'Do the tools replace a professional visit?',
        answer:
          'No. They help organise the first decision. A visit is still useful when measurements, installation scope, several rooms or grant paperwork need review.',
      },
      {
        question: 'Can CasaMia use my answers later?',
        answer:
          'Yes, when you choose to share them. The aim is to avoid repeating the same story and turn your answers into clearer priorities.',
      },
    ],
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
    chooserEyebrow: '¿No sabes cuál elegir?',
    chooserTitle: 'Usa la herramienta que encaja con la decisión que necesitas tomar.',
    chooserBody:
      'Cada ruta es breve a propósito. Empieza por la pregunta más cercana a tu situación y CasaMia puede convertir la respuesta en un plan práctico si quieres ayuda.',
    nextEyebrow: 'Después de la herramienta',
    nextTitle: 'Sal con algo útil para la conversación familiar.',
    finalTitle: '¿Necesitas convertir respuestas en un plan?',
    finalBody:
      'CasaMia puede revisar la vivienda, priorizar lo importante y explicar qué hacer ahora, más adelante o con apoyo profesional.',
    finalCta: 'Empezar revisión guiada',
    faqEyebrow: 'Respuestas rápidas',
    faqTitle: 'Cómo usar bien las herramientas.',
    faqItems: [
      {
        question: '¿Con qué herramienta debería empezar?',
        answer:
          'Si no lo tienes claro, empieza con el quiz de seguridad. Si ya preocupa una estancia concreta, usa fotos o la revisión por estancias.',
      },
      {
        question: '¿Sustituyen estas herramientas a una visita profesional?',
        answer:
          'No. Ayudan a ordenar la primera decisión. La visita sigue siendo útil cuando hacen falta medidas, alcance de instalación, varias estancias o documentación para ayudas.',
      },
      {
        question: '¿Puede CasaMia usar mis respuestas después?',
        answer:
          'Sí, cuando decidas compartirlas. La idea es no repetir la misma historia y convertir tus respuestas en prioridades más claras.',
      },
    ],
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

const chooserRoutes = [
  {
    icon: HelpCircle,
    title: { en: 'Something feels different', es: 'Algo ha cambiado' },
    body: {
      en: 'Use the quick quiz to decide whether to observe, review one room or act faster.',
      es: 'Usa el quiz rápido para decidir si observar, revisar una estancia o actuar antes.',
    },
  },
  {
    icon: Camera,
    title: { en: 'You can show the room', es: 'Puedes mostrar la estancia' },
    body: {
      en: 'Use photos when the family needs visible priorities before asking for a proposal.',
      es: 'Usa fotos cuando la familia necesita prioridades visibles antes de pedir propuesta.',
    },
  },
  {
    icon: FileCheck2,
    title: { en: 'Funding may matter', es: 'Las ayudas pueden importar' },
    body: {
      en: 'Use the grant route early if paperwork, timing or regional criteria could affect the project.',
      es: 'Usa la ruta de ayudas pronto si documentos, plazos o criterios autonómicos pueden afectar.',
    },
  },
  {
    icon: Home,
    title: { en: 'You want a full plan', es: 'Quieres un plan completo' },
    body: {
      en: 'Use the guided review when several rooms, routines or family decisions need to be organised.',
      es: 'Usa la revisión guiada cuando hay varias estancias, rutinas o decisiones familiares que ordenar.',
    },
  },
] as const

const nextToolSteps = [
  {
    icon: ClipboardCheck,
    title: { en: 'A clearer starting point', es: 'Un punto de partida claro' },
    body: {
      en: 'Know whether the next step is a checklist, room review, grant check or visit.',
      es: 'Saber si toca lista, revisión por estancia, ayudas o visita.',
    },
  },
  {
    icon: Camera,
    title: { en: 'Evidence you can share', es: 'Evidencia que puedes compartir' },
    body: {
      en: 'Bring photos, answers or notes into one calm family conversation.',
      es: 'Llevar fotos, respuestas o notas a una conversación familiar tranquila.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'A route into action', es: 'Una ruta hacia la acción' },
    body: {
      en: 'CasaMia can turn the result into priorities, scope and managed next steps.',
      es: 'CasaMia puede convertirlo en prioridades, alcance y próximos pasos gestionados.',
    },
  },
] as const

export function ToolsPage() {
  const { i18n } = useTranslation()
  const language: Language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const pageCopy = copy[language]

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/tools#collection`,
        name: pageCopy.seoTitle,
        description: pageCopy.seoDescription,
        url: `${siteUrl}/tools`,
        mainEntity: { '@id': `${siteUrl}/tools#tool-list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/tools#tool-list`,
        itemListElement: tools.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: tool.title[language],
          url: `${siteUrl}${tool.to}`,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/tools#faq`,
        mainEntity: pageCopy.faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@type': 'HowTo',
        '@id': `${siteUrl}/tools#choose-a-tool`,
        name: pageCopy.chooserTitle,
        description: pageCopy.chooserBody,
        inLanguage: pageCopy.lang,
        step: chooserRoutes.map((route, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: route.title[language],
          text: route.body[language],
        })),
      },
    ],
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

      <section className="tools-chooser-section" aria-labelledby="tools-chooser-title">
        <div className="site-shell tools-chooser-panel">
          <div className="tools-heading">
            <p className="eyebrow">{pageCopy.chooserEyebrow}</p>
            <h2 id="tools-chooser-title">{pageCopy.chooserTitle}</h2>
            <p>{pageCopy.chooserBody}</p>
          </div>
          <div className="tools-chooser-grid">
            {chooserRoutes.map((route, index) => {
              const Icon = route.icon

              return (
                <article className="tools-chooser-card" key={route.title.en}>
                  <span className="tools-chooser-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="tools-chooser-number">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{route.title[language]}</h3>
                  <p>{route.body[language]}</p>
                </article>
              )
            })}
          </div>
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

      <section className="tools-next-section" aria-labelledby="tools-next-title">
        <div className="site-shell tools-next-panel">
          <div className="tools-heading">
            <p className="eyebrow">{pageCopy.nextEyebrow}</p>
            <h2 id="tools-next-title">{pageCopy.nextTitle}</h2>
          </div>
          <div className="tools-next-grid">
            {nextToolSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <article className="tools-next-card" key={step.title.en}>
                  <span className="tools-next-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="tools-next-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3>{step.title[language]}</h3>
                  <p>{step.body[language]}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="tools-faq-section" aria-labelledby="tools-faq-title">
        <div className="site-shell tools-faq-layout">
          <div className="tools-heading">
            <p className="eyebrow">{pageCopy.faqEyebrow}</p>
            <h2 id="tools-faq-title">{pageCopy.faqTitle}</h2>
          </div>
          <div className="tools-faq-list">
            {pageCopy.faqItems.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <ArrowRight size={18} aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
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
