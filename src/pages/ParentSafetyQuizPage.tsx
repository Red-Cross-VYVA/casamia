import { ArrowRight, CheckCircle2, HelpCircle, Home, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { trackEvent } from '../utils/analytics'
import '../styles/parent-safety-quiz.css'

const siteUrl = 'https://www.casamia.com.es'

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
      en: 'In the last 30 days, has there been a fall, near fall or medical change?',
      es: 'En los últimos 30 días, ¿ha habido una caída, casi caída o cambio médico?',
    },
    hint: {
      en: 'Include hospital visits, surgery, new medication, dizziness, new pain or a clear drop in walking confidence.',
      es: 'Incluye ingresos, cirugía, medicación nueva, mareos, dolor nuevo o una bajada clara de confianza al caminar.',
    },
    options: [
      { label: { en: 'Yes, a fall or medical change', es: 'Sí, caída o cambio médico' }, score: 3 },
      { label: { en: 'New pain, dizziness or hesitation', es: 'Dolor, mareos o dudas nuevas' }, score: 2 },
      { label: { en: 'No recent change noticed', es: 'No hemos notado cambios' }, score: 0 },
    ],
  },
  {
    id: 'bathroom-confidence',
    title: {
      en: 'In the bathroom, do they hold walls, furniture or towel rails for support?',
      es: 'En el baño, ¿se apoya en paredes, muebles o toalleros para moverse?',
    },
    hint: {
      en: 'Check shower entry, toilet transfers, wet floors, bath mats and night-time toilet trips.',
      es: 'Revisa entrada a la ducha, sentarse y levantarse del inodoro, suelo mojado, alfombrillas e idas nocturnas.',
    },
    options: [
      { label: { en: 'Yes, most bathroom visits', es: 'Sí, casi siempre' }, score: 3 },
      { label: { en: 'Sometimes or only at night', es: 'A veces o solo de noche' }, score: 2 },
      { label: { en: 'No, movement looks stable', es: 'No, se mueve estable' }, score: 0 },
    ],
  },
  {
    id: 'night-route',
    title: {
      en: 'From bed to bathroom at night, are there trip hazards or dark spots?',
      es: 'De la cama al baño por la noche, ¿hay tropiezos o zonas oscuras?',
    },
    hint: {
      en: 'Look for rugs, cables, thresholds, furniture corners, shadows and whether a light is reachable before standing.',
      es: 'Busca alfombras, cables, umbrales, esquinas de muebles, sombras y si puede encender una luz antes de levantarse.',
    },
    options: [
      { label: { en: 'Yes, several hazards', es: 'Sí, varios riesgos' }, score: 3 },
      { label: { en: 'One or two small issues', es: 'Uno o dos detalles' }, score: 1 },
      { label: { en: 'No, clear and lit', es: 'No, está despejado e iluminado' }, score: 0 },
    ],
  },
  {
    id: 'stairs-entry',
    title: {
      en: 'At the entrance, stairs or thresholds, do they pause, pull up or need help?',
      es: 'En la entrada, escaleras o umbrales, ¿se para, se impulsa o necesita ayuda?',
    },
    hint: {
      en: 'Watch for reaching for the wall, dragging feet, avoiding steps, carrying items awkwardly or struggling with the door.',
      es: 'Observa si busca la pared, arrastra los pies, evita escalones, lleva cosas con dificultad o le cuesta la puerta.',
    },
    options: [
      { label: { en: 'Yes, help is often needed', es: 'Sí, suele necesitar ayuda' }, score: 3 },
      { label: { en: 'Sometimes or when tired', es: 'A veces o si está cansado/a' }, score: 2 },
      { label: { en: 'No, they manage safely', es: 'No, lo gestiona con seguridad' }, score: 0 },
    ],
  },
  {
    id: 'help-response',
    title: {
      en: 'If they fell in the bedroom, bathroom or kitchen, could they call for help without standing?',
      es: 'Si se cayera en dormitorio, baño o cocina, ¿podría pedir ayuda sin levantarse?',
    },
    hint: {
      en: 'A phone, pendant, watch or voice assistant only helps if it is reachable from the floor in the rooms where falls are most likely.',
      es: 'Un teléfono, colgante, reloj o asistente de voz solo ayuda si está al alcance desde el suelo en las estancias de más riesgo.',
    },
    options: [
      { label: { en: 'No, not from the floor', es: 'No, no desde el suelo' }, score: 3 },
      { label: { en: 'Only in some rooms', es: 'Solo en algunas estancias' }, score: 2 },
      { label: { en: 'Yes, in the key rooms', es: 'Sí, en las estancias clave' }, score: 0 },
    ],
  },
]

const copy = {
  en: {
    lang: 'en',
    seoTitle: 'Is Your Home Senior-Friendly? Quick Safety Check | CasaMia',
    seoDescription:
      'Answer five practical questions to understand whether a home may need a senior safety review, room checklist or urgent next step.',
    eyebrow: 'Senior-friendly home check',
    title: 'Is your home senior-friendly?',
    body:
      'Use this quick, non-medical check for yourself or someone you care about. It helps decide whether the next step should be a room checklist, an online review or a focused CasaMia assessment.',
    startCta: 'Answer the 5 questions',
    resultEyebrow: 'Suggested next step',
    restart: 'Retake quiz',
    assessmentCta: 'Start guided review',
    checklistCta: 'Open Resources',
    resultLow: {
      title: 'Keep observing, then review one room',
      body:
        'There is no strong warning pattern in your answers. Start with the printable checklist and keep an eye on night routes, bathroom movement, new pain, dizziness or medication changes.',
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
    caveat: 'This is not a medical diagnosis. It is a practical home-safety prompt to help decide what to review next.',
  },
  es: {
    lang: 'es',
    seoTitle: '¿Tu casa es adecuada para mayores? Revisión rápida | CasaMia',
    seoDescription:
      'Responde cinco preguntas prácticas para saber si una vivienda necesita una revisión de seguridad senior, una lista por estancias o un siguiente paso urgente.',
    eyebrow: 'Revisión de vivienda senior',
    title: '¿Tu casa es adecuada para mayores?',
    body:
      'Usa esta revisión breve, no médica, para ti o para alguien a quien cuidas. Ayuda a decidir si el siguiente paso debe ser una lista por estancias, una revisión online o una evaluación CasaMia.',
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
    caveat: 'No es un diagnóstico médico. Es una guía práctica de seguridad en casa para decidir qué revisar a continuación.',
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
                    to="/home-safety-assessment?open=self-inspection#self-inspection-tool"
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
