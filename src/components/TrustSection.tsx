import {
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  ShieldCheck,
  Tags,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type TrustSectionCopy = {
  eyebrow: string
  headline: string
  body: string
  learnMore: string
  cards: Array<{
    icon: 'inspectors' | 'partners' | 'insured' | 'pricing' | 'products' | 'acceptance'
    title: string
    body: string
  }>
}

const trustSectionCopy: Record<'en' | 'es', TrustSectionCopy> = {
  en: {
    eyebrow: 'Why families trust CasaMia',
    headline: 'Why Families Trust CasaMia',
    body:
      'Every CasaMia project is delivered with care, professionalism, and transparency. From the first inspection to the final installation, we work with qualified experts and trusted partners to help seniors age safely and comfortably at home.',
    learnMore: 'Learn why CasaMia',
    cards: [
      {
        icon: 'inspectors',
        title: 'Qualified Safety Inspectors',
        body: 'Home risks are reviewed by trained safety specialists who understand falls, access, lighting, and daily mobility.',
      },
      {
        icon: 'partners',
        title: 'Trusted Installation Partners',
        body: 'CasaMia works through reliable installation partners who can adapt each home with care and respect.',
      },
      {
        icon: 'insured',
        title: 'Fully Insured Services',
        body: 'Projects are structured around insured professional work, giving families reassurance from assessment to installation.',
      },
      {
        icon: 'pricing',
        title: 'Transparent Pricing',
        body: 'Families see the recommended scope and pricing clearly before committing to the work.',
      },
      {
        icon: 'products',
        title: 'Quality Products',
        body: 'We focus on durable, practical safety products chosen for daily use, not confusing gadgetry.',
      },
      {
        icon: 'acceptance',
        title: 'Customer Acceptance Before Final Payment',
        body: 'The final 50% is due only after the customer has reviewed and accepted the completed work.',
      },
    ],
  },
  es: {
    eyebrow: 'Por qué confían las familias',
    headline: 'Por qué las familias confían en CasaMia',
    body:
      'Cada proyecto CasaMia se entrega con cuidado, profesionalidad y transparencia. Desde la primera inspección hasta la instalación final, trabajamos con expertos cualificados y partners de confianza para ayudar a las personas mayores a vivir mejor y con más seguridad en casa.',
    learnMore: 'Ver por qué CasaMia',
    cards: [
      {
        icon: 'inspectors',
        title: 'Inspectores de seguridad cualificados',
        body: 'Los riesgos del hogar los revisan especialistas que entienden caídas, accesos, iluminación y movilidad diaria.',
      },
      {
        icon: 'partners',
        title: 'Partners de instalación de confianza',
        body: 'CasaMia trabaja con partners fiables que adaptan cada vivienda con cuidado y respeto.',
      },
      {
        icon: 'insured',
        title: 'Servicios asegurados',
        body: 'Los proyectos se estructuran con trabajo profesional asegurado, desde la evaluación hasta la instalación.',
      },
      {
        icon: 'pricing',
        title: 'Precios transparentes',
        body: 'La familia ve claramente el alcance recomendado y el precio antes de comprometerse.',
      },
      {
        icon: 'products',
        title: 'Productos de calidad',
        body: 'Priorizamos productos de seguridad duraderos y prácticos para el uso diario.',
      },
      {
        icon: 'acceptance',
        title: 'Aceptación del cliente antes del pago final',
        body: 'El 50% final se paga solo después de que el cliente revise y acepte el trabajo completado.',
      },
    ],
  },
}

function getTrustSectionCopy(language: string) {
  return language.startsWith('es') ? trustSectionCopy.es : trustSectionCopy.en
}

function TrustIcon({ type }: { type: TrustSectionCopy['cards'][number]['icon'] }) {
  if (type === 'partners') {
    return <Handshake size={25} aria-hidden="true" />
  }

  if (type === 'insured') {
    return <ShieldCheck size={25} aria-hidden="true" />
  }

  if (type === 'pricing') {
    return <Tags size={25} aria-hidden="true" />
  }

  if (type === 'products') {
    return <BadgeCheck size={25} aria-hidden="true" />
  }

  if (type === 'acceptance') {
    return <CheckCircle2 size={25} aria-hidden="true" />
  }

  return <ClipboardCheck size={25} aria-hidden="true" />
}

export function TrustSection() {
  const { i18n } = useTranslation()
  const copy = getTrustSectionCopy(i18n.language)

  return (
    <section className="trust-section section-pad">
      <div className="site-shell">
        <div className="trust-section-header">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="display-title mt-5">{copy.headline}</h2>
          <p>{copy.body}</p>
        </div>

        <div className="trust-card-grid mt-12">
          {copy.cards.map((card) => (
            <article className="trust-card" key={card.title}>
              <span className="trust-card-icon">
                <TrustIcon type={card.icon} />
              </span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>

        <Link className="trust-section-link" to="/why-casamia">
          {copy.learnMore}
        </Link>
      </div>
    </section>
  )
}
