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
import { useCommercialSettings } from '../context/CommercialSettingsContext'
import { applyCommercialCopy } from '../services/commercialCopy'

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
    eyebrow: 'Why people trust CasaMia',
    headline: 'Why CasaMia feels safer to choose',
    body:
      'Every project starts with the person, the home and the daily routine. CasaMia checks what fits, coordinates qualified help and keeps the scope clear before work begins.',
    learnMore: 'Learn why CasaMia',
    cards: [
      {
        icon: 'inspectors',
        title: 'Qualified Safety Inspectors',
        body: 'Risks are reviewed by specialists who understand falls, access, lighting and everyday movement.',
      },
      {
        icon: 'partners',
        title: 'Trusted Installation Partners',
        body: 'CasaMia works with reliable installers who adapt homes carefully and respectfully.',
      },
      {
        icon: 'insured',
        title: 'Fully Insured Services',
        body: 'Projects are structured around insured professional work, from review to installation.',
      },
      {
        icon: 'pricing',
        title: 'Transparent Pricing',
        body: 'You see the recommended scope and price clearly before committing to the work.',
      },
      {
        icon: 'products',
        title: 'Quality Products',
        body: 'We focus on durable, practical safety products chosen for daily use, not confusing gadgetry.',
      },
      {
        icon: 'acceptance',
        title: 'Customer Acceptance Before Final Payment',
        body: 'The final {{proposalBalancePercent}} is due only after the customer has reviewed and accepted the completed work.',
      },
    ],
  },
  es: {
    eyebrow: 'Por qué confiar en CasaMia',
    headline: 'Por qué CasaMia da más seguridad al elegir',
    body:
      'Cada proyecto empieza por la persona, la vivienda y la rutina diaria. CasaMia revisa qué encaja, coordina ayuda cualificada y mantiene el alcance claro antes de empezar.',
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
        body: 'Ves claramente el alcance recomendado y el precio antes de comprometerte.',
      },
      {
        icon: 'products',
        title: 'Productos de calidad',
        body: 'Priorizamos productos de seguridad duraderos y prácticos para el uso diario.',
      },
      {
        icon: 'acceptance',
        title: 'Aceptación del cliente antes del pago final',
        body: 'El {{proposalBalancePercent}} final se paga solo después de que el cliente revise y acepte el trabajo completado.',
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
  const commercialSettings = useCommercialSettings()
  const copy = applyCommercialCopy(getTrustSectionCopy(i18n.language), commercialSettings)

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

        <Link className="trust-section-link" to="/why-us">
          {copy.learnMore}
        </Link>
      </div>
    </section>
  )
}
