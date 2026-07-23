import { ArrowRight, Calculator, CheckCircle2, ClipboardList, Home, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { trackEvent } from '../utils/analytics'

const decisionCopy = {
  en: {
    eyebrow: 'Decide with clarity',
    title: 'Before a big move, see what home can still become.',
    body:
      'Many families are comparing two routes: adapt the home, or move to a residence sooner than planned. CasaMia helps put safety, comfort, cost and practical next steps on one calm page.',
    ctaPrimary: 'Compare home vs residence',
    ctaSecondary: 'Start guided review',
    proof: 'Most families can start with a remote review, photos or a short call.',
    cards: [
      {
        title: 'Know what matters first',
        body: 'Separate urgent safety issues from changes that can be planned later.',
        metric: '01',
      },
      {
        title: 'Compare real routes',
        body: 'Look at adaptation, monthly support and possible grant assumptions beside residence costs.',
        metric: '02',
      },
      {
        title: 'Keep the family aligned',
        body: 'Turn uncertainty into a simple plan everyone can discuss.',
        metric: '03',
      },
    ],
    flow: ['Review the home', 'Compare the options', 'Choose the next step'],
  },
  es: {
    eyebrow: 'Decidir con claridad',
    title: 'Antes de una gran decisión, mira qué puede seguir siendo el hogar.',
    body:
      'Muchas familias comparan dos caminos: adaptar la vivienda o mudarse antes de lo previsto a una residencia. CasaMia ayuda a poner seguridad, comodidad, coste y próximos pasos en una misma página clara.',
    ctaPrimary: 'Comparar casa y residencia',
    ctaSecondary: 'Empezar revisión guiada',
    proof: 'La mayoría de familias puede empezar con revisión remota, fotos o una llamada breve.',
    cards: [
      {
        title: 'Saber qué va primero',
        body: 'Separar los riesgos urgentes de los cambios que pueden planificarse después.',
        metric: '01',
      },
      {
        title: 'Comparar rutas reales',
        body: 'Ver adaptación, apoyo mensual y posibles ayudas junto al coste de una residencia.',
        metric: '02',
      },
      {
        title: 'Alinear a la familia',
        body: 'Convertir la incertidumbre en un plan sencillo que todos puedan comentar.',
        metric: '03',
      },
    ],
    flow: ['Revisar la vivienda', 'Comparar opciones', 'Elegir el siguiente paso'],
  },
} as const

export function HomeDecisionSupport() {
  const { i18n } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = decisionCopy[language]

  return (
    <section className="home-decision-section section-pad" aria-labelledby="home-decision-title">
      <div className="site-shell home-decision-grid">
        <div className="home-decision-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="home-decision-title">{copy.title}</h2>
          <p>{copy.body}</p>

          <div className="home-decision-actions">
            <Link
              className="btn btn-green"
              to="/tools/home-vs-residence-cost-calculator"
              onClick={() => trackEvent('home_cost_comparison_clicked', { location: 'home_decision_support' })}
            >
              <Calculator size={18} aria-hidden="true" />
              {copy.ctaPrimary}
            </Link>
            <Link
              className="btn btn-white"
              to="/home-safety-assessment#self-inspection-tool"
              onClick={() => trackEvent('assessment_booking_started', { location: 'home_decision_support' })}
            >
              {copy.ctaSecondary}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <p className="home-decision-proof">
            <CheckCircle2 size={18} aria-hidden="true" />
            {copy.proof}
          </p>
        </div>

        <div className="home-decision-panel" aria-label={copy.eyebrow}>
          <div className="home-decision-flow">
            {copy.flow.map((step, index) => (
              <div className="home-decision-flow-step" key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>

          <div className="home-decision-visual">
            <div className="home-decision-home" aria-hidden="true">
              <Home size={46} />
              <span />
            </div>
            <div className="home-decision-mini-card is-left">
              <ClipboardList size={20} aria-hidden="true" />
              <span>{copy.cards[0].title}</span>
            </div>
            <div className="home-decision-mini-card is-right">
              <ShieldCheck size={20} aria-hidden="true" />
              <span>{copy.cards[1].title}</span>
            </div>
          </div>

          <div className="home-decision-card-grid">
            {copy.cards.map((card) => (
              <article className="home-decision-card" key={card.title}>
                <span>{card.metric}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

