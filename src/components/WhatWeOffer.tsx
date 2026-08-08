import {
  ArrowRight,
  BadgeEuro,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  HeartPulse,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SafeImage } from './SafeImage'

type OfferCard = {
  icon: string
  title: string
  desc: string | string[]
  points?: string[]
}

type OfferVisual = {
  Icon: LucideIcon
  className: string
} & (
  | {
      kind: 'image'
      image: string
      alt: string
    }
  | {
      kind: 'proposal'
      label: string
    }
)

const offerVisuals: OfferVisual[] = [
  {
    Icon: Camera,
    className: 'is-assessment',
    kind: 'image',
    image: '/images/solutions/casamia-staff-kitchen-consultation.webp',
    alt: 'CasaMia advisor discussing safety improvements in a kitchen',
  },
  {
    Icon: ClipboardCheck,
    className: 'is-proposal',
    kind: 'proposal',
    label: 'Sample CasaMia proposal snapshot',
  },
  {
    Icon: BadgeEuro,
    className: 'is-grant',
    kind: 'image',
    image: '/images/solutions/euro-grant-support-retouched.jpg',
    alt: 'Euro sculpture in a European financial district representing grant support',
  },
  {
    Icon: Wrench,
    className: 'is-installation',
    kind: 'image',
    image: '/images/solutions/casamia-worker-process.webp',
    alt: 'CasaMia installer preparing home safety equipment',
  },
]

function OfferVisualMedia({ title, visual }: { title: string; visual: OfferVisual }) {
  if (visual.kind === 'proposal') {
    return (
      <div className="offer-proposal-snapshot" role="img" aria-label={visual.label}>
        <div className="offer-proposal-sheet">
          <div className="offer-proposal-header">
            <span>CasaMia</span>
            <strong>Safety Proposal</strong>
          </div>
          <div className="offer-proposal-score">
            <span>Priority</span>
            <strong>Room-by-room plan</strong>
          </div>
          <div className="offer-proposal-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="offer-proposal-items" aria-hidden="true">
            <span>Bathroom access</span>
            <span>Kitchen reach</span>
            <span>Night route</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SafeImage
      src={visual.image}
      alt={visual.alt}
      className="offer-card-image"
      imgClassName="h-full w-full object-cover"
      fallbackLabel={title}
    />
  )
}

export function WhatWeOffer() {
  const { t } = useTranslation()
  const cards = t('offer.cards', { returnObjects: true }) as OfferCard[]
  const intro = t('offer.intro', { defaultValue: '' })
  const primaryCta = t('offer.ctaPrimary', { defaultValue: 'Build your CasaMia plan' })
  const secondaryCta = t('offer.ctaSecondary', { defaultValue: 'Ask us to contact you' })

  return (
    <section className="offer-section section-pad bg-white" id="what-we-offer">
      <div className="site-shell">
        <span className="eyebrow">{t('offer.badge')}</span>
        <h2 className="display-title mt-5 max-w-4xl">
          {t('offer.line1')}{' '}
          <span className="italic-accent">{t('offer.line2')}</span>
        </h2>
        {intro ? <p className="offer-intro">{intro}</p> : null}

        <div className="offer-grid" aria-label="CasaMia service journey">
          {cards.map((card, index) => {
            const visual = offerVisuals[index] ?? offerVisuals[0]
            const Icon = visual.Icon

            return (
              <article className="offer-card offer-step-card rounded-lg bg-light-blue" key={card.title}>
                <div className={`offer-card-media is-${visual.kind}`}>
                  <OfferVisualMedia title={card.title} visual={visual} />
                  <span className="offer-card-step" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="offer-card-body">
                  <div className="offer-card-heading">
                    <span className={`offer-card-icon ${visual.className}`}>
                      <Icon size={25} strokeWidth={2.3} aria-hidden="true" />
                    </span>
                    <span className="offer-card-label">{card.icon}</span>
                  </div>
                  <h3 className="font-display text-3xl font-bold leading-tight text-text-dark">
                    {card.title}
                  </h3>
                  <div className="offer-card-copy">
                    {Array.isArray(card.desc) ? (
                      card.desc.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                    ) : (
                      <p>{card.desc}</p>
                    )}
                  </div>
                  {card.points?.length ? (
                    <ul className="offer-card-points">
                      {card.points.map((point) => (
                        <li key={point}>
                          <CheckCircle2 size={16} aria-hidden="true" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>

        <div className="offer-actions">
          <Link className="btn btn-green" to="/home-safety-wizard">
            {primaryCta}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link className="offer-secondary-link" to="/why-us#contact-form">
            {secondaryCta}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <Link
          className="health-card health-card-premium mt-8 items-center gap-8 rounded-lg bg-navy p-8 text-white"
          to="/tech#connected-inclusions"
        >
          <div className="flex gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-green text-white">
              <HeartPulse size={28} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-3xl font-bold leading-tight">
                {t('offer.health.title')}
              </h3>
              <p className="mt-2 max-w-3xl text-white/80">{t('offer.health.desc')}</p>
            </div>
          </div>
          <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-green px-5 text-sm font-extrabold">
            {t('offer.health.badge')}
            <ArrowRight size={17} aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  )
}
