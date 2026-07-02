import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  ShieldCheck,
  Tags,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { TrustBar } from '../components/TrustBar'

type WhyCasamiaCopy = {
  eyebrow: string
  headline: string
  intro: string
  sections: Array<{
    icon: 'inspectors' | 'partners' | 'insured' | 'products' | 'pricing' | 'acceptance'
    title: string
    body: string
    points: string[]
  }>
  ctaTitle: string
  ctaBody: string
  ctaButton: string
}

const whyCasamiaCopy: Record<'en' | 'es', WhyCasamiaCopy> = {
  en: {
    eyebrow: 'Why CasaMia',
    headline: 'Why Families Trust CasaMia',
    intro:
      'Choosing a home safety partner means trusting someone with your home, your comfort, and your loved ones. CasaMia combines qualified inspections, trusted installation partners, transparent pricing, and careful follow-through to help seniors age in place with confidence.',
    sections: [
      {
        icon: 'inspectors',
        title: 'Qualified Safety Inspectors',
        body:
          'Our process starts with practical home safety thinking: where falls happen, where movement feels difficult, and where simple adaptations can make daily life safer.',
        points: ['Room-by-room risk review', 'Falls, lighting, access, and mobility focus', 'Clear recommendations before work begins'],
      },
      {
        icon: 'partners',
        title: 'Trusted Installation Partners',
        body:
          'CasaMia works with installation partners selected for reliability, respect inside the home, and the ability to complete adaptations neatly.',
        points: ['Experienced local support', 'Respectful in-home work', 'Practical installation planning'],
      },
      {
        icon: 'insured',
        title: 'Fully Insured Services',
        body:
          'Families need confidence that the work is handled professionally. CasaMia structures projects around insured services and accountable delivery.',
        points: ['Professional work standards', 'Clear responsibility', 'Confidence from inspection to completion'],
      },
      {
        icon: 'products',
        title: 'Quality Safety Products',
        body:
          'The best safety products are the ones people actually use every day. CasaMia prioritises reliable, practical equipment suited to the home.',
        points: ['Grab bars, lighting, access, and alert systems', 'Durable products for daily routines', 'Smart technology only where it helps'],
      },
      {
        icon: 'pricing',
        title: 'Transparent Pricing',
        body:
          'No family should feel pushed into unclear work. CasaMia explains the recommended scope, likely cost, and possible grant routes before installation.',
        points: ['Clear scope before commitment', 'Plan-based package structure', 'Grant-readiness guidance where available'],
      },
      {
        icon: 'acceptance',
        title: 'Satisfaction & Customer Acceptance',
        body:
          'The final payment is tied to acceptance. Families pay 50% as a deposit and the remaining 50% only after reviewing the completed work.',
        points: ['50% deposit to begin', '50% after customer acceptance', 'Follow-through until the family is comfortable'],
      },
    ],
    ctaTitle: 'Ready to make your home safer?',
    ctaBody:
      'Book your free home safety assessment and receive expert recommendations tailored to your home.',
    ctaButton: 'Book Free Assessment',
  },
  es: {
    eyebrow: 'Por qué CasaMia',
    headline: 'Por qué las familias confían en CasaMia',
    intro:
      'Elegir un partner de seguridad para el hogar significa confiarle tu casa, tu comodidad y a tus seres queridos. CasaMia combina inspecciones cualificadas, partners de instalación de confianza, precios transparentes y seguimiento cuidadoso para ayudar a las personas mayores a vivir en casa con más seguridad.',
    sections: [
      {
        icon: 'inspectors',
        title: 'Inspectores de seguridad cualificados',
        body:
          'El proceso empieza con una mirada práctica: dónde ocurren las caídas, dónde cuesta moverse y qué adaptaciones pueden mejorar la vida diaria.',
        points: ['Revisión estancia por estancia', 'Foco en caídas, luz, accesos y movilidad', 'Recomendaciones claras antes de empezar'],
      },
      {
        icon: 'partners',
        title: 'Partners de instalación de confianza',
        body:
          'CasaMia trabaja con partners seleccionados por fiabilidad, respeto dentro del hogar y capacidad para instalar adaptaciones de forma cuidada.',
        points: ['Soporte local con experiencia', 'Trabajo respetuoso en casa', 'Planificación práctica de la instalación'],
      },
      {
        icon: 'insured',
        title: 'Servicios totalmente asegurados',
        body:
          'Las familias necesitan confianza. CasaMia estructura los proyectos alrededor de servicios asegurados y una entrega responsable.',
        points: ['Estándares profesionales', 'Responsabilidad clara', 'Confianza desde inspección hasta finalización'],
      },
      {
        icon: 'products',
        title: 'Productos de seguridad de calidad',
        body:
          'Los mejores productos de seguridad son los que se usan cada día. CasaMia prioriza equipamiento fiable y práctico para cada vivienda.',
        points: ['Barras, iluminación, accesos y alertas', 'Productos duraderos para rutinas diarias', 'Tecnología smart solo donde aporta'],
      },
      {
        icon: 'pricing',
        title: 'Precios transparentes',
        body:
          'Ninguna familia debería aceptar trabajos poco claros. CasaMia explica el alcance, coste probable y posibles vías de ayuda antes de instalar.',
        points: ['Alcance claro antes del compromiso', 'Estructura por paquetes', 'Orientación sobre ayudas cuando existan'],
      },
      {
        icon: 'acceptance',
        title: 'Satisfacción y aceptación del cliente',
        body:
          'El pago final está ligado a la aceptación. La familia paga 50% de reserva y el 50% restante solo después de revisar el trabajo completado.',
        points: ['50% de reserva para empezar', '50% tras aceptación del cliente', 'Seguimiento hasta que la familia esté tranquila'],
      },
    ],
    ctaTitle: '¿Listo para hacer tu hogar más seguro?',
    ctaBody:
      'Reserva tu evaluación gratuita de seguridad y recibe recomendaciones expertas adaptadas a tu vivienda.',
    ctaButton: 'Reservar evaluación gratuita',
  },
}

function getWhyCasamiaCopy(language: string) {
  return language.startsWith('es') ? whyCasamiaCopy.es : whyCasamiaCopy.en
}

function WhyIcon({ type }: { type: WhyCasamiaCopy['sections'][number]['icon'] }) {
  if (type === 'partners') {
    return <Handshake size={28} aria-hidden="true" />
  }

  if (type === 'insured') {
    return <ShieldCheck size={28} aria-hidden="true" />
  }

  if (type === 'products') {
    return <BadgeCheck size={28} aria-hidden="true" />
  }

  if (type === 'pricing') {
    return <Tags size={28} aria-hidden="true" />
  }

  if (type === 'acceptance') {
    return <CheckCircle2 size={28} aria-hidden="true" />
  }

  return <ClipboardCheck size={28} aria-hidden="true" />
}

export function WhyCasamiaPage() {
  const { i18n } = useTranslation()
  const copy = getWhyCasamiaCopy(i18n.language)

  return (
    <>
      <section className="why-casamia-hero">
        <div className="site-shell">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.headline}</h1>
          <p>{copy.intro}</p>
          <Link className="btn btn-green mt-8" to="/free-home-safety-assessment">
            {copy.ctaButton}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <TrustBar />

      <section className="why-proof-section section-pad">
        <div className="site-shell">
          <div className="why-proof-grid">
            {copy.sections.map((section) => (
              <article className="why-proof-card" key={section.title}>
                <span className="why-proof-icon">
                  <WhyIcon type={section.icon} />
                </span>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  <ul>
                    {section.points.map((point) => (
                      <li key={point}>
                        <CheckCircle2 size={17} aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="why-final-cta">
        <div className="site-shell">
          <div className="why-final-panel">
            <div>
              <h2>{copy.ctaTitle}</h2>
              <p>{copy.ctaBody}</p>
            </div>
            <Link className="btn btn-green" to="/free-home-safety-assessment">
              {copy.ctaButton}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
