import { ArrowRight, CheckCircle2, HelpCircle, Home, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { trackEvent } from '../utils/analytics'
import '../styles/parent-safety-quiz.css'

const siteUrl = 'https://casamia.com.es'

type Language = 'en' | 'es'

type QuizOption = {
  label: Record<Language, string>
  score: number
}

const questions: Array<{
  id: string
  title: Record<Language, string>
  hint: Record<Language, string>
  options: QuizOption[]
}> = [
  {
    id: 'recent-change',
    title: {
      en: 'Has anything changed recently?',
      es: '¿Ha cambiado algo recientemente?',
    },
    hint: {
      en: 'Think about falls, surgery, hospital stay, new medication, pain or reduced confidence.',
      es: 'Piensa en caídas, cirugía, ingreso, medicación nueva, dolor o pérdida de confianza.',
    },
    options: [
      { label: { en: 'Yes, something significant', es: 'Sí, algo importante' }, score: 3 },
      { label: { en: 'A small change', es: 'Un cambio pequeño' }, score: 2 },
      { label: { en: 'No clear change', es: 'Nada claro' }, score: 0 },
    ],
  },
  {
    id: 'bathroom-confidence',
    title: {
      en: 'Does bathing or toilet use feel less safe?',
      es: '¿El baño, la ducha o el inodoro se sienten menos seguros?',
    },
    hint: {
      en: 'Bathroom transfers, wet floors and night-time toilet trips are common warning signs.',
      es: 'Transferencias, suelo mojado e idas nocturnas al baño suelen ser señales importantes.',
    },
    options: [
      { label: { en: 'Yes, often', es: 'Sí, a menudo' }, score: 3 },
      { label: { en: 'Sometimes', es: 'A veces' }, score: 2 },
      { label: { en: 'Not really', es: 'No mucho' }, score: 0 },
    ],
  },
  {
    id: 'night-route',
    title: {
      en: 'Is the night route clear and well lit?',
      es: '¿La ruta nocturna está despejada e iluminada?',
    },
    hint: {
      en: 'Look from bed to bathroom: shadows, rugs, cables, thresholds and where support is reached.',
      es: 'Mira de cama a baño: sombras, alfombras, cables, umbrales y puntos de apoyo.',
    },
    options: [
      { label: { en: 'No, it worries us', es: 'No, nos preocupa' }, score: 3 },
      { label: { en: 'Mostly, but not perfect', es: 'Más o menos, pero no perfecto' }, score: 1 },
      { label: { en: 'Yes, it is clear', es: 'Sí, está clara' }, score: 0 },
    ],
  },
  {
    id: 'stairs-entry',
    title: {
      en: 'Are entrances, stairs or thresholds difficult?',
      es: '¿Cuestan la entrada, las escaleras o los umbrales?',
    },
    hint: {
      en: 'The first and last metres of the day often decide whether home still feels manageable.',
      es: 'Los primeros y últimos metros del día suelen decidir si la casa sigue siendo manejable.',
    },
    options: [
      { label: { en: 'Yes, clearly difficult', es: 'Sí, claramente' }, score: 3 },
      { label: { en: 'Sometimes', es: 'A veces' }, score: 2 },
      { label: { en: 'No major issue', es: 'Sin problema claro' }, score: 0 },
    ],
  },
  {
    id: 'help-response',
    title: {
      en: 'Can they ask for help from the risky rooms?',
      es: '¿Puede pedir ayuda desde las estancias de riesgo?',
    },
    hint: {
      en: 'A phone or alert only helps if it is reachable from bedroom, bathroom and daily living areas.',
      es: 'Un teléfono o aviso ayuda solo si está al alcance en dormitorio, baño y zonas de uso diario.',
    },
    options: [
      { label: { en: 'No, not reliably', es: 'No, no de forma fiable' }, score: 3 },
      { label: { en: 'Only in some rooms', es: 'Solo en algunas estancias' }, score: 2 },
      { label: { en: 'Yes, help is reachable', es: 'Sí, la ayuda está al alcance' }, score: 0 },
    ],
  },
]

const copy = {
  en: {
    lang: 'en',
    seoTitle: 'Is My Parent Safe at Home? Quick Family Quiz | CasaMia',
    seoDescription:
      'Answer five practical questions to understand whether an older parent may need a home safety review, room checklist or urgent next step.',
    eyebrow: 'Family safety quiz',
    title: 'Is home still working safely for them?',
    body:
      'Use this quick, non-medical check to spot whether the next step should be a simple family checklist, an online review or a focused CasaMia assessment.',
    startCta: 'Answer the 5 questions',
    resultEyebrow: 'Suggested next step',
    restart: 'Retake quiz',
    assessmentCta: 'Start guided review',
    checklistCta: 'Open Resources',
    resultLow: {
      title: 'Keep observing, then review one room',
      body:
        'There is no strong warning pattern in your answers. Start with the printable checklist and keep an eye on night routes, bathroom use and recent changes.',
    },
    resultMedium: {
      title: 'A focused home safety review would help',
      body:
        'There are enough signals to justify a practical review. Start online, collect photos or notes, and decide which room or routine should be checked first.',
    },
    resultHigh: {
      title: 'Prioritise safety before it becomes urgent',
      body:
        'Your answers suggest several risk points. Focus on entry, bedroom, bathroom, night routes and how help is requested. A guided review is the sensible next step.',
    },
    caveat: 'This is not a medical diagnosis. It is a practical family prompt to help decide what to review next.',
  },
  es: {
    lang: 'es',
    seoTitle: '¿Mi padre o madre está seguro en casa? Quiz rápido | CasaMia',
    seoDescription:
      'Responde cinco preguntas prácticas para saber si conviene una revisión de seguridad, una lista por estancias o un siguiente paso urgente.',
    eyebrow: 'Quiz de seguridad familiar',
    title: '¿La casa sigue funcionando con seguridad?',
    body:
      'Usa esta revisión breve, no médica, para decidir si el siguiente paso debe ser una lista familiar, una revisión online o una evaluación CasaMia.',
    startCta: 'Responder 5 preguntas',
    resultEyebrow: 'Siguiente paso sugerido',
    restart: 'Repetir quiz',
    assessmentCta: 'Empezar revisión guiada',
    checklistCta: 'Abrir Recursos',
    resultLow: {
      title: 'Observad y revisad una estancia',
      body:
        'No aparece un patrón fuerte de alerta. Empieza con la lista para imprimir y vigila rutas nocturnas, baño y cambios recientes.',
    },
    resultMedium: {
      title: 'Una revisión focalizada puede ayudar',
      body:
        'Hay señales suficientes para hacer una revisión práctica. Empieza online, reúne fotos o notas y decide qué estancia o rutina revisar primero.',
    },
    resultHigh: {
      title: 'Prioriza seguridad antes de la urgencia',
      body:
        'Tus respuestas sugieren varios puntos de riesgo. Revisa entrada, dormitorio, baño, rutas nocturnas y cómo se pide ayuda. Una revisión guiada es el siguiente paso prudente.',
    },
    caveat: 'No es un diagnóstico médico. Es una guía práctica para decidir qué revisar a continuación.',
  },
} as const

export function ParentSafetyQuizPage() {
  const { i18n } = useTranslation()
  const language: Language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const pageCopy = copy[language]
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const answeredCount = Object.keys(answers).length
  const totalScore = useMemo(() => Object.values(answers).reduce((sum, score) => sum + score, 0), [answers])
  const isComplete = answeredCount === questions.length
  const result = totalScore >= 10 ? pageCopy.resultHigh : totalScore >= 5 ? pageCopy.resultMedium : pageCopy.resultLow
  const ResultIcon = totalScore >= 10 ? ShieldAlert : totalScore >= 5 ? ShieldCheck : CheckCircle2

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${siteUrl}/tools/is-my-parent-safe-at-home#tool`,
      name: pageCopy.seoTitle,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      url: `${siteUrl}/tools/is-my-parent-safe-at-home`,
      provider: { '@type': 'Organization', name: 'CasaMia', url: siteUrl },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map((question) => ({
        '@type': 'Question',
        name: question.title[language],
        acceptedAnswer: {
          '@type': 'Answer',
          text: question.hint[language],
        },
      })),
    },
  ]

  return (
    <main className="parent-safety-quiz" lang={pageCopy.lang}>
      <SEO
        title={pageCopy.seoTitle}
        description={pageCopy.seoDescription}
        path="/tools/is-my-parent-safe-at-home"
        schema={schema}
      />

      <section className="parent-safety-hero">
        <div className="site-shell parent-safety-grid">
          <div className="parent-safety-copy">
            <p className="eyebrow">{pageCopy.eyebrow}</p>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.body}</p>
            <a className="btn btn-green" href="#quiz">
              {pageCopy.startCta}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <aside className="parent-safety-card" aria-label={pageCopy.eyebrow}>
            <Home size={42} aria-hidden="true" />
            <strong>{answeredCount}/{questions.length}</strong>
            <span>{language === 'es' ? 'respuestas' : 'answers'}</span>
          </aside>
        </div>
      </section>

      <section className="parent-safety-quiz-section" id="quiz">
        <div className="site-shell parent-safety-quiz-layout">
          <div className="parent-safety-question-list">
            {questions.map((question, index) => (
              <article className="parent-safety-question" key={question.id}>
                <span className="parent-safety-question-number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{question.title[language]}</h2>
                  <p>{question.hint[language]}</p>
                </div>
                <div className="parent-safety-options">
                  {question.options.map((option) => (
                    <button
                      className={answers[question.id] === option.score ? 'is-selected' : ''}
                      key={`${question.id}-${option.label.en}`}
                      type="button"
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.score }))}
                    >
                      {option.label[language]}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className={`parent-safety-result ${isComplete ? 'is-ready' : ''}`} aria-live="polite">
            {isComplete ? (
              <>
                <span className="parent-safety-result-icon">
                  <ResultIcon size={30} aria-hidden="true" />
                </span>
                <p className="eyebrow">{pageCopy.resultEyebrow}</p>
                <h2>{result.title}</h2>
                <p>{result.body}</p>
                <div className="parent-safety-result-actions">
                  <Link
                    className="btn btn-green"
                    to="/home-safety-assessment#self-inspection-tool"
                    onClick={() => trackEvent('assessment_booking_started', { location: 'parent_safety_quiz' })}
                  >
                    {pageCopy.assessmentCta}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <Link className="btn btn-white" to="/blog">
                    {pageCopy.checklistCta}
                  </Link>
                </div>
                <small>{pageCopy.caveat}</small>
                <button className="parent-safety-reset" type="button" onClick={() => setAnswers({})}>
                  {pageCopy.restart}
                </button>
              </>
            ) : (
              <>
                <HelpCircle size={34} aria-hidden="true" />
                <h2>{pageCopy.startCta}</h2>
                <p>{pageCopy.caveat}</p>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
