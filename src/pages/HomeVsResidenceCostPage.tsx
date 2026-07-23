import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  Euro,
  Home,
  PiggyBank,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { trackEvent } from '../utils/analytics'
import '../styles/home-vs-residence-cost.css'

const siteUrl = 'https://casamia.com.es'

type CalculatorCopy = {
  lang: 'en' | 'es'
  seoTitle: string
  seoDescription: string
  eyebrow: string
  title: string
  body: string
  primaryCta: string
  secondaryCta: string
  calculatorEyebrow: string
  calculatorTitle: string
  calculatorBody: string
  labels: {
    residenceCost: string
    months: string
    adaptationBudget: string
    homeSupport: string
    grantSupport: string
    setupCost: string
  }
  help: {
    residenceCost: string
    months: string
    adaptationBudget: string
    homeSupport: string
    grantSupport: string
    setupCost: string
  }
  results: {
    stayHome: string
    residence: string
    difference: string
    lower: string
    higher: string
    similar: string
    comparedWithResidence: string
  }
  insightTitle: string
  insightBody: string
  insightPoints: string[]
  routeTitle: string
  routeBody: string
  routeSteps: Array<{ title: string; body: string }>
  caveat: string
  finalTitle: string
  finalBody: string
  finalCta: string
}

const copyByLanguage: Record<'en' | 'es', CalculatorCopy> = {
  en: {
    lang: 'en',
    seoTitle: 'Home Adaptation vs Assisted Living Cost Calculator | CasaMia',
    seoDescription:
      'Compare the planning cost of adapting a senior home with the monthly cost of assisted living or a residence in Spain. Use CasaMia’s free family decision tool.',
    eyebrow: 'Family decision tool',
    title: 'Compare adapting the home with moving to a residence.',
    body:
      'A safe home plan is not only about products. It is a family decision about comfort, care, timing and cost. Use this quick calculator to frame the conversation before requesting a professional proposal.',
    primaryCta: 'Calculate your route',
    secondaryCta: 'Request CasaMia guidance',
    calculatorEyebrow: 'Planning calculator',
    calculatorTitle: 'Put both routes on the same page.',
    calculatorBody:
      'Adjust the numbers to match your family’s situation. CasaMia can then review the home and turn the preferred route into a practical plan.',
    labels: {
      residenceCost: 'Residence or assisted-living monthly cost',
      months: 'Planning period',
      adaptationBudget: 'Estimated home adaptation budget',
      homeSupport: 'Extra monthly home support',
      grantSupport: 'Possible grant contribution',
      setupCost: 'Move-in or setup costs',
    },
    help: {
      residenceCost: 'Use the monthly cost you are comparing against.',
      months: 'A 24–36 month view is often useful for family planning.',
      adaptationBudget: 'Use a rough expected adaptation budget before the final proposal.',
      homeSupport: 'Include extra help, visits, checks or support at home.',
      grantSupport: 'Enter only support that seems realistic, not guaranteed.',
      setupCost: 'Include deposit, furniture, admin or move-related costs if relevant.',
    },
    results: {
      stayHome: 'Adapt and support at home',
      residence: 'Residence route',
      difference: 'Estimated difference',
      lower: 'Home route is lower in this scenario',
      higher: 'Home route is higher in this scenario',
      similar: 'The routes are close in this scenario',
      comparedWithResidence: 'compared with the residence route',
    },
    insightTitle: 'How to use this result',
    insightBody:
      'The number is not the decision by itself. Use it to decide whether a home assessment is worth exploring before committing to a bigger life change.',
    insightPoints: [
      'If the home route looks realistic, check the rooms that create daily risk first.',
      'If the numbers are close, comfort, routines, family capacity and urgency matter more.',
      'If a grant may apply, confirm requirements before assuming it will reduce the budget.',
    ],
    routeTitle: 'What CasaMia can do next',
    routeBody:
      'CasaMia turns the comparison into a managed plan: assessment, priorities, quotation, installation coordination and grant support where relevant.',
    routeSteps: [
      {
        title: 'Review the real home',
        body: 'We check mobility, routines, rooms, photos or visit notes so the plan is based on the actual space.',
      },
      {
        title: 'Prioritise what matters first',
        body: 'We separate urgent safety changes from optional comfort improvements and future work.',
      },
      {
        title: 'Coordinate the route',
        body: 'We align products, installers, documentation, grants where possible and family follow-up.',
      },
    ],
    caveat:
      'This is a planning estimate only. Final costs depend on the home, selected works, installation scope, care needs, public grant decisions and local availability.',
    finalTitle: 'Want CasaMia to check the home route?',
    finalBody:
      'Start with a guided review. You can answer questions, add photos or request a visit before deciding what to do.',
    finalCta: 'Start the guided review',
  },
  es: {
    lang: 'es',
    seoTitle: 'Calculadora: adaptar la vivienda o residencia | CasaMia',
    seoDescription:
      'Compara el coste orientativo de adaptar una vivienda para una persona mayor con el coste mensual de una residencia o assisted living. Herramienta gratuita de CasaMia.',
    eyebrow: 'Herramienta de decisión familiar',
    title: 'Compara adaptar la vivienda con mudarse a una residencia.',
    body:
      'Un plan de vivienda segura no va solo de productos. Es una decisión familiar sobre comodidad, cuidados, tiempos y coste. Usa esta calculadora para ordenar la conversación antes de pedir una propuesta profesional.',
    primaryCta: 'Calcular la ruta',
    secondaryCta: 'Pedir orientación CasaMia',
    calculatorEyebrow: 'Calculadora orientativa',
    calculatorTitle: 'Pon las dos opciones en la misma página.',
    calculatorBody:
      'Ajusta los importes a la situación de tu familia. CasaMia puede revisar la vivienda y convertir la ruta preferida en un plan práctico.',
    labels: {
      residenceCost: 'Coste mensual de residencia o assisted living',
      months: 'Periodo de planificación',
      adaptationBudget: 'Presupuesto estimado de adaptación',
      homeSupport: 'Apoyo mensual adicional en casa',
      grantSupport: 'Posible ayuda o subvención',
      setupCost: 'Costes de entrada o traslado',
    },
    help: {
      residenceCost: 'Usa el coste mensual contra el que estás comparando.',
      months: 'Una visión de 24–36 meses suele ayudar a planificar en familia.',
      adaptationBudget: 'Indica una estimación antes de la propuesta final.',
      homeSupport: 'Incluye ayuda, visitas, revisiones o apoyo adicional en casa.',
      grantSupport: 'Incluye solo una ayuda realista, nunca garantizada.',
      setupCost: 'Añade fianza, mobiliario, gestión o costes de traslado si aplica.',
    },
    results: {
      stayHome: 'Adaptar y apoyar en casa',
      residence: 'Ruta residencia',
      difference: 'Diferencia estimada',
      lower: 'La ruta en casa es menor en este escenario',
      higher: 'La ruta en casa es mayor en este escenario',
      similar: 'Las rutas están cerca en este escenario',
      comparedWithResidence: 'comparado con la ruta residencia',
    },
    insightTitle: 'Cómo usar este resultado',
    insightBody:
      'El número no decide por sí solo. Sirve para saber si merece la pena revisar la vivienda antes de tomar una decisión vital más grande.',
    insightPoints: [
      'Si la ruta en casa parece realista, revisa primero las estancias que generan riesgo diario.',
      'Si los números están cerca, pesan más la comodidad, las rutinas, la capacidad familiar y la urgencia.',
      'Si puede haber ayudas, confirma requisitos antes de asumir que reducirán el presupuesto.',
    ],
    routeTitle: 'Qué puede hacer CasaMia después',
    routeBody:
      'CasaMia convierte la comparación en un plan gestionado: evaluación, prioridades, presupuesto, coordinación de instalación y apoyo con ayudas cuando corresponda.',
    routeSteps: [
      {
        title: 'Revisar la vivienda real',
        body: 'Analizamos movilidad, rutinas, estancias, fotos o notas de visita para basar el plan en el espacio real.',
      },
      {
        title: 'Priorizar lo importante',
        body: 'Separamos cambios urgentes de seguridad de mejoras opcionales de confort o trabajos futuros.',
      },
      {
        title: 'Coordinar la ruta',
        body: 'Alineamos productos, instaladores, documentación, ayudas cuando sea posible y seguimiento familiar.',
      },
    ],
    caveat:
      'Esta herramienta es una estimación orientativa. Los costes finales dependen de la vivienda, trabajos seleccionados, instalación, necesidades de cuidado, decisiones públicas sobre ayudas y disponibilidad local.',
    finalTitle: '¿Quieres que CasaMia revise la ruta en casa?',
    finalBody:
      'Empieza con una revisión guiada. Puedes responder preguntas, añadir fotos o solicitar una visita antes de decidir.',
    finalCta: 'Iniciar revisión guiada',
  },
}

function formatCurrency(value: number, language: 'en' | 'es') {
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)))
}

function NumericField({
  label,
  help,
  value,
  min = 0,
  step = 100,
  onChange,
}: {
  label: string
  help: string
  value: number
  min?: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="cost-tool-field">
      <span>{label}</span>
      <div>
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value || 0))}
        />
        <small>{help}</small>
      </div>
    </label>
  )
}

export function HomeVsResidenceCostPage() {
  const { i18n } = useTranslation()
  const language = i18n.language.startsWith('es') ? 'es' : 'en'
  const copy = copyByLanguage[language]
  const [residenceCost, setResidenceCost] = useState(2600)
  const [months, setMonths] = useState(24)
  const [adaptationBudget, setAdaptationBudget] = useState(8500)
  const [homeSupport, setHomeSupport] = useState(450)
  const [grantSupport, setGrantSupport] = useState(2500)
  const [setupCost, setSetupCost] = useState(1500)

  const result = useMemo(() => {
    const residenceTotal = residenceCost * months + setupCost
    const homeTotal = Math.max(0, adaptationBudget - grantSupport) + homeSupport * months
    const difference = residenceTotal - homeTotal
    const near = Math.abs(difference) < Math.max(1200, residenceTotal * 0.08)
    const status: 'similar' | 'lower' | 'higher' = near ? 'similar' : difference > 0 ? 'lower' : 'higher'

    return {
      residenceTotal,
      homeTotal,
      difference,
      status,
    }
  }, [adaptationBudget, grantSupport, homeSupport, months, residenceCost, setupCost])

  const costToolSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': `${siteUrl}/tools/home-vs-residence-cost-calculator#tool`,
          name: copy.seoTitle,
          description: copy.seoDescription,
          url: `${siteUrl}/tools/home-vs-residence-cost-calculator`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          isAccessibleForFree: true,
          inLanguage: copy.lang,
          publisher: {
            '@type': 'Organization',
            name: 'CasaMia',
            url: siteUrl,
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
            {
              '@type': 'ListItem',
              position: 2,
              name: language === 'es' ? 'Recursos' : 'Resources',
              item: `${siteUrl}/blog`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: copy.seoTitle,
              item: `${siteUrl}/tools/home-vs-residence-cost-calculator`,
            },
          ],
        },
      ],
    }),
    [copy, language],
  )

  return (
    <>
      <SEO
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/tools/home-vs-residence-cost-calculator"
        schema={costToolSchema}
      />

      <main className="cost-tool-page" lang={copy.lang}>
        <section className="cost-tool-hero">
          <div className="site-shell cost-tool-hero-grid">
            <div className="cost-tool-hero-copy">
              <span className="eyebrow">
                <span className="dot" aria-hidden="true" />
                {copy.eyebrow}
              </span>
              <h1>{copy.title}</h1>
              <p>{copy.body}</p>
              <div className="cost-tool-actions">
                <a className="btn btn-green" href="#calculator">
                  {copy.primaryCta}
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <Link className="btn btn-white" to="/home-safety-assessment">
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="cost-tool-hero-card" aria-label={copy.calculatorTitle}>
              <div className="cost-tool-route is-home">
                <Home size={24} aria-hidden="true" />
                <span>{copy.results.stayHome}</span>
              </div>
              <div className="cost-tool-route-divider">
                <Calculator size={30} aria-hidden="true" />
              </div>
              <div className="cost-tool-route is-residence">
                <Building2 size={24} aria-hidden="true" />
                <span>{copy.results.residence}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="cost-tool-section" id="calculator" aria-labelledby="cost-tool-title">
          <div className="site-shell cost-tool-shell">
            <div className="cost-tool-panel">
              <p className="eyebrow">{copy.calculatorEyebrow}</p>
              <h2 id="cost-tool-title">{copy.calculatorTitle}</h2>
              <p>{copy.calculatorBody}</p>

              <div className="cost-tool-fields">
                <NumericField
                  label={copy.labels.residenceCost}
                  help={copy.help.residenceCost}
                  value={residenceCost}
                  step={100}
                  onChange={setResidenceCost}
                />
                <NumericField
                  label={copy.labels.months}
                  help={copy.help.months}
                  value={months}
                  min={1}
                  step={1}
                  onChange={setMonths}
                />
                <NumericField
                  label={copy.labels.adaptationBudget}
                  help={copy.help.adaptationBudget}
                  value={adaptationBudget}
                  step={250}
                  onChange={setAdaptationBudget}
                />
                <NumericField
                  label={copy.labels.homeSupport}
                  help={copy.help.homeSupport}
                  value={homeSupport}
                  step={50}
                  onChange={setHomeSupport}
                />
                <NumericField
                  label={copy.labels.grantSupport}
                  help={copy.help.grantSupport}
                  value={grantSupport}
                  step={250}
                  onChange={setGrantSupport}
                />
                <NumericField
                  label={copy.labels.setupCost}
                  help={copy.help.setupCost}
                  value={setupCost}
                  step={250}
                  onChange={setSetupCost}
                />
              </div>
            </div>

            <aside className={`cost-tool-result is-${result.status}`} aria-live="polite">
              <span className="cost-tool-result-icon">
                <Euro size={27} aria-hidden="true" />
              </span>
              <div className="cost-tool-result-grid">
                <div>
                  <span>{copy.results.stayHome}</span>
                  <strong>{formatCurrency(result.homeTotal, language)}</strong>
                </div>
                <div>
                  <span>{copy.results.residence}</span>
                  <strong>{formatCurrency(result.residenceTotal, language)}</strong>
                </div>
              </div>
              <div className="cost-tool-difference">
                <span>{copy.results.difference}</span>
                <strong>{formatCurrency(Math.abs(result.difference), language)}</strong>
                <p>{copy.results[result.status]} {copy.results.comparedWithResidence}.</p>
              </div>
              <small>{copy.caveat}</small>
            </aside>
          </div>
        </section>

        <section className="cost-tool-explain-section" aria-labelledby="cost-tool-insight-title">
          <div className="site-shell cost-tool-explain-grid">
            <article className="cost-tool-explain-card">
              <span>
                <PiggyBank size={24} aria-hidden="true" />
              </span>
              <h2 id="cost-tool-insight-title">{copy.insightTitle}</h2>
              <p>{copy.insightBody}</p>
              <ul>
                {copy.insightPoints.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>

            <article className="cost-tool-explain-card is-dark">
              <span>
                <ShieldCheck size={24} aria-hidden="true" />
              </span>
              <h2>{copy.routeTitle}</h2>
              <p>{copy.routeBody}</p>
              <ol>
                {copy.routeSteps.map((step, index) => (
                  <li key={step.title}>
                    <strong>{String(index + 1).padStart(2, '0')}</strong>
                    <span>
                      <b>{step.title}</b>
                      {step.body}
                    </span>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        <section className="cost-tool-final">
          <div className="site-shell cost-tool-final-panel">
            <div>
              <p className="eyebrow">{language === 'es' ? 'Siguiente paso' : 'Next step'}</p>
              <h2>{copy.finalTitle}</h2>
              <p>{copy.finalBody}</p>
            </div>
            <Link
              className="btn btn-green"
              to="/home-safety-assessment"
              onClick={() => trackEvent('assessment_booking_started', { location: 'home_vs_residence_cost_tool' })}
            >
              {copy.finalCta}
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
