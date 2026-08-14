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

type InspectionCreditCopy = {
  amount: string
  title: string
  body: string
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

type ProposalSnapshotCopy = {
  heading: string
  items: string[]
  label: string
  priorityLabel: string
  priorityTitle: string
}

const fallbackProposalSnapshot: ProposalSnapshotCopy = {
  heading: 'Safety Proposal',
  items: ['Bathroom access', 'Kitchen reach', 'Night route'],
  label: 'Sample CasaMia proposal snapshot',
  priorityLabel: 'Priority',
  priorityTitle: 'Room-by-room plan',
}

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
    image: '/images/solutions/front-view-adorable-couple-kitchen.jpg',
    alt: 'Older couple standing together in a bright kitchen after home support',
  },
]

function OfferVisualMedia({
  proposalSnapshot,
  title,
  visual,
}: {
  proposalSnapshot: ProposalSnapshotCopy
  title: string
  visual: OfferVisual
}) {
  if (visual.kind === 'proposal') {
    return (
      <div className="offer-proposal-snapshot" role="img" aria-label={proposalSnapshot.label || visual.label}>
        <div className="offer-proposal-sheet">
          <div className="offer-proposal-header">
            <span>CasaMia</span>
            <strong>{proposalSnapshot.heading}</strong>
          </div>
          <div className="offer-proposal-score">
            <span>{proposalSnapshot.priorityLabel}</span>
            <strong>{proposalSnapshot.priorityTitle}</strong>
          </div>
          <div className="offer-proposal-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="offer-proposal-items" aria-hidden="true">
            {proposalSnapshot.items.map((item) => (
              <span key={item}>{item}</span>
            ))}
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

function getProposalSnapshotCopy(value: unknown): ProposalSnapshotCopy {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallbackProposalSnapshot

  const candidate = value as Partial<ProposalSnapshotCopy>
  const items = Array.isArray(candidate.items)
    ? candidate.items.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []

  return {
    heading: candidate.heading || fallbackProposalSnapshot.heading,
    items: items.length ? items : fallbackProposalSnapshot.items,
    label: candidate.label || fallbackProposalSnapshot.label,
    priorityLabel: candidate.priorityLabel || fallbackProposalSnapshot.priorityLabel,
    priorityTitle: candidate.priorityTitle || fallbackProposalSnapshot.priorityTitle,
  }
}

function getInspectionCreditCopy(value: unknown): InspectionCreditCopy | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const candidate = value as Partial<InspectionCreditCopy>

  if (!candidate.amount || !candidate.title || !candidate.body) return null

  return {
    amount: candidate.amount,
    title: candidate.title,
    body: candidate.body,
  }
}

export function WhatWeOffer() {
  const { t } = useTranslation()
  const cards = t('offer.cards', { returnObjects: true }) as OfferCard[]
  const intro = t('offer.intro', { defaultValue: '' })
  const proposalSnapshot = getProposalSnapshotCopy(t('offer.proposalSnapshot', { returnObjects: true }))
  const inspectionCredit = getInspectionCreditCopy(t('offer.inspectionCredit', { returnObjects: true }))

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
                  <OfferVisualMedia proposalSnapshot={proposalSnapshot} title={card.title} visual={visual} />
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
                  {index === 0 && inspectionCredit ? (
                    <div className="offer-credit-note">
                      <span className="offer-credit-note-badge">
                        <BadgeEuro size={20} aria-hidden="true" />
                        <strong>{inspectionCredit.amount}</strong>
                      </span>
                      <div>
                        <b>{inspectionCredit.title}</b>
                        <small>{inspectionCredit.body}</small>
                      </div>
                    </div>
                  ) : null}
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
