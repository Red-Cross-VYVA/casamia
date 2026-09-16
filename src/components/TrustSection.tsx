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
    eyebrow: 'How CasaMia checks the work',
    headline: 'Know why a change is recommended before anything is fitted',
    body:
      'Every project starts with the person, the home and the routine. CasaMia confirms fit, measurements, what should be included, installation needs and safe-use handover before work is treated as complete.',
    learnMore: 'Learn why CasaMia',
    cards: [
      {
        icon: 'inspectors',
        title: 'Room risks checked first',
        body: 'Falls, access, lighting, transfers and daily movement are reviewed before products are recommended.',
      },
      {
        icon: 'partners',
        title: 'Installer fit reviewed',
        body: 'The proposed work is matched to the home, the surface, the measurements and the installation level needed.',
      },
      {
        icon: 'insured',
        title: 'Insured professional work',
        body: 'Work is planned around insured professional fitting, final checks and a clear handover.',
      },
      {
        icon: 'pricing',
        title: 'Price before commitment',
        body: 'You see the recommended work, assumptions and price before deciding whether anything goes ahead.',
      },
      {
        icon: 'products',
        title: 'Products chosen for use',
        body: 'Items are selected for the routine, room and safe use, not because they are the biggest upgrade available.',
      },
      {
        icon: 'acceptance',
        title: 'Acceptance before final payment',
        body: 'The final {{proposalBalancePercent}} is due only after the completed work has been reviewed and accepted.',
      },
    ],
  },
  es: {
    eyebrow: 'Cómo comprueba CasaMia el trabajo',
    headline: 'Sabe por qué se recomienda un cambio antes de instalar nada',
    body:
      'Cada proyecto empieza por la persona, la vivienda y la rutina. CasaMia confirma encaje, alcance, medidas, necesidades de instalación y explicación de uso seguro antes de dar el trabajo por cerrado.',
    learnMore: 'Ver por qué CasaMia',
    cards: [
      {
        icon: 'inspectors',
        title: 'Riesgos revisados primero',
        body: 'Caídas, accesos, iluminación, transferencias y movimiento diario se revisan antes de recomendar productos.',
      },
      {
        icon: 'partners',
        title: 'Encaje de instalación revisado',
        body: 'El trabajo propuesto se ajusta a la vivienda, superficie, medidas y nivel de instalación necesario.',
      },
      {
        icon: 'insured',
        title: 'Trabajo profesional asegurado',
        body: 'El trabajo se planifica con instalación profesional asegurada, comprobaciones finales y una entrega clara.',
      },
      {
        icon: 'pricing',
        title: 'Precio antes del compromiso',
        body: 'Ves el alcance recomendado, los supuestos y el precio antes de decidir si el trabajo sigue adelante.',
      },
      {
        icon: 'products',
        title: 'Productos elegidos por uso',
        body: 'Los elementos se seleccionan por rutina, estancia y uso seguro, no por ser la mejora más grande disponible.',
      },
      {
        icon: 'acceptance',
        title: 'Aceptación antes del pago final',
        body: 'El {{proposalBalancePercent}} final se paga solo después de revisar y aceptar el trabajo completado.',
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
