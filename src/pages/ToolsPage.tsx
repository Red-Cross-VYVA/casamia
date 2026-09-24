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

const siteUrl = 'https://www.casamia.com.es'

type Language = 'en' | 'es'

const copy = {
  en: {
    lang: 'en',
    seoTitle: 'Free Home Safety Tools | CasaMia',
    seoDescription:
      'Use CasaMia free checks to decide whether to keep watching, review one room, prepare grant documents or book a home assessment.',
    eyebrow: 'Free home-safety tools',
    title: 'Choose the check that matches today’s safety concern.',
    body:
      'Pick the closest situation. Each check should leave you with a practical next step: keep watching, review one room, gather documents or ask CasaMia what to do next.',
    featuredLabel: 'Start here if you are unsure',
    featuredTitle: 'Is this home still safe day to day?',
    featuredBody:
      'Five everyday questions to decide whether the home feels stable, uncertain or worth reviewing sooner.',
    featuredCta: 'Start the safety check',
    sectionEyebrow: 'Choose your check',
    sectionTitle: 'Pick the tool for the decision you need to make.',
    openTool: 'Open tool',
    chooserEyebrow: 'Match the tool to the concern',
    chooserTitle: 'Pick the question you need answered.',
    chooserBody:
      'Start with the concern in front of you. Keep the result as notes, or share it when you want a visit, report or clearer recommendation.',
    nextEyebrow: 'After the tool',
    nextTitle: 'Leave with a next step, not more confusion.',
    finalTitle: 'Ready to turn answers into a plan?',
    finalBody:
      'Use your answers to set priorities: what to change now, what can wait, what needs measurement and what may help with a grant check.',
    finalCta: 'Start guided review',
    faqEyebrow: 'Tool guidance',
    faqTitle: 'How to use the tools well.',
    faqItems: [
      {
        question: 'Which tool should I start with?',
        answer:
          'If you are unsure, start with the five-question safety check. If one room already worries you, use photos or the room-by-room review.',
      },
      {
        question: 'Do the tools replace a professional visit?',
        answer:
          'No. They organise the first decision. A visit still matters when measurements, installation details, several rooms or grant documents are involved.',
      },
      {
        question: 'Can CasaMia use my answers later?',
        answer:
          'Yes, when you choose to share them. CasaMia uses them to avoid repeating the same details and prepare room priorities, adaptation notes and visit questions.',
      },
    ],
  },
  es: {
    lang: 'es',
    seoTitle: 'Herramientas gratis de seguridad en casa | CasaMia',
    seoDescription:
      'Usa revisiones gratis de CasaMia para decidir si observar, revisar una estancia, preparar evidencia para ayudas o pedir una evaluación.',
    eyebrow: 'Herramientas gratis de seguridad en casa',
    title: 'Elige la revisión que encaja con la preocupación de hoy.',
    body:
      'Elige la situación más cercana. Cada revisión debe dejarte un siguiente paso práctico: seguir observando, revisar una estancia, reunir documentos o preguntar a CasaMia qué hacer después.',
    featuredLabel: 'Empieza aquí si dudas',
    featuredTitle: '¿Esta casa sigue siendo segura en el día a día?',
    featuredBody:
      'Cinco preguntas cotidianas para decidir si la vivienda parece estable, genera dudas o merece revisión antes.',
    featuredCta: 'Empezar revisión de seguridad',
    sectionEyebrow: 'Elige tu revisión',
    sectionTitle: 'Elige la herramienta para la decisión que necesitas tomar.',
    openTool: 'Abrir herramienta',
    chooserEyebrow: '¿No sabes cuál elegir?',
    chooserTitle: 'Elige la pregunta que necesitas responder.',
    chooserBody:
      'Empieza por la preocupación que tienes delante. Guarda el resultado como notas o compártelo cuando quieras una visita, informe o recomendación más clara.',
    nextEyebrow: 'Después de la herramienta',
    nextTitle: 'Sal con un siguiente paso, no con más dudas.',
    finalTitle: '¿Listo para convertir respuestas en un plan?',
    finalBody:
      'Usa tus respuestas para fijar prioridades: qué cambiar ahora, qué puede esperar, qué necesita medidas y qué puede ayudar en una revisión de ayudas.',
    finalCta: 'Empezar revisión guiada',
    faqEyebrow: 'Guía de herramientas',
    faqTitle: 'Cómo usar bien las herramientas.',
    faqItems: [
      {
        question: '¿Con qué herramienta debería empezar?',
        answer:
          'Si no lo tienes claro, empieza con la revisión de cinco preguntas. Si ya preocupa una estancia concreta, usa fotos o la revisión por estancias.',
      },
      {
        question: '¿Sustituyen estas herramientas a una visita profesional?',
        answer:
          'No. Ordenan la primera decisión. La visita sigue siendo importante cuando hay medidas, detalles de instalación, varias estancias o documentos para ayudas.',
      },
      {
        question: '¿Puede CasaMia usar mis respuestas después?',
        answer:
          'Sí, cuando decidas compartirlas. CasaMia las usa para no repetir los mismos datos y preparar prioridades por estancia, notas de adaptación y preguntas para la visita.',
      },
    ],
  },
} as const

const tools = [
  {
    icon: HelpCircle,
    title: { en: 'Quick home safety check', es: 'Revisión rápida de seguridad' },
    body: {
      en: 'Answer five questions to see whether the home feels stable, uncertain or worth reviewing sooner.',
      es: 'Responde cinco preguntas para ver si la vivienda parece estable, genera dudas o merece revisión antes.',
    },
    to: '/tools/is-my-parent-safe-at-home',
  },
  {
    icon: FileCheck2,
    title: { en: 'Grant document check', es: 'Revisión de documentos para ayudas' },
    body: {
      en: 'See which documents and timing questions to check before counting on public assistance.',
      es: 'Ve qué documentos y plazos revisar antes de contar con una ayuda pública.',
    },
    to: '/grant-check',
  },
  {
    icon: ClipboardCheck,
    title: { en: 'Room-by-room online review', es: 'Revisión online por estancias' },
    body: {
      en: 'Work through each room and mark what feels safe, unsafe or uncertain.',
      es: 'Revisa cada estancia y marca qué parece seguro, inseguro o dudoso.',
    },
    to: '/home-safety-assessment?open=self-inspection#self-inspection-tool',
  },
  {
    icon: Camera,
    title: { en: 'Photo safety report', es: 'Informe con fotos' },
    body: {
      en: 'Upload photos to flag visible issues, limits of the review and the first action to consider.',
      es: 'Sube fotos para señalar problemas visibles, límites de la revisión y primera acción a valorar.',
    },
    to: '/#estimate-upload',
  },
] as const

const chooserQuestions = [
  {
    icon: HelpCircle,
    title: { en: 'Movement or routine feels different', es: 'Movimiento o rutina se sienten distintos' },
    body: {
      en: 'Use the quick check to decide whether to keep watching, review one room or ask for help sooner.',
      es: 'Usa la revisión rápida para decidir si seguir observando, revisar una estancia o pedir ayuda antes.',
    },
  },
  {
    icon: Camera,
    title: { en: 'You can show the room', es: 'Puedes mostrar la estancia' },
    body: {
      en: 'Use photos when a visible issue needs an initial read before a visit or quote.',
      es: 'Usa fotos cuando un problema visible necesita una primera lectura antes de visita o presupuesto.',
    },
  },
  {
    icon: FileCheck2,
    title: { en: 'Funding may matter', es: 'Las ayudas pueden importar' },
    body: {
      en: 'Use the grant check early if documents, timing or local criteria could change the next step.',
      es: 'Usa la revisión de ayudas pronto si documentos, plazos o criterios locales pueden cambiar el siguiente paso.',
    },
  },
  {
    icon: Home,
    title: { en: 'You want a full plan', es: 'Quieres un plan completo' },
    body: {
      en: 'Use the guided review when several rooms, routines or decisions need organising.',
      es: 'Usa la revisión guiada cuando hay varias estancias, rutinas o decisiones que ordenar.',
    },
  },
] as const

const nextToolSteps = [
  {
    icon: ClipboardCheck,
    title: { en: 'The next review to use', es: 'La siguiente revisión a usar' },
    body: {
      en: 'Know whether to use a checklist, room review, grant check or home visit.',
      es: 'Saber si toca lista, revisión por estancia, revisión de ayudas o visita en casa.',
    },
  },
  {
    icon: Camera,
    title: { en: 'Evidence you can share', es: 'Evidencia que puedes compartir' },
    body: {
      en: 'Bring photos, answers or notes into one practical conversation.',
      es: 'Reunir fotos, respuestas o notas en una conversación práctica.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Priorities ready to use', es: 'Prioridades listas para usar' },
    body: {
      en: 'Turn the result into room priorities, adaptation notes and prepared visit questions.',
      es: 'Convierte el resultado en prioridades por estancia, notas de adaptación y preguntas para la visita.',
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
        step: chooserQuestions.map((route, index) => ({
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
            {chooserQuestions.map((route, index) => {
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
          <Link className="btn btn-green" to="/tools/is-my-parent-safe-at-home">
            {pageCopy.finalCta}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
