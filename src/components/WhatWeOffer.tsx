import { HeartPulse } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type OfferCard = {
  icon: string
  title: string
  desc: string
}

export function WhatWeOffer() {
  const { t } = useTranslation()
  const cards = t('offer.cards', { returnObjects: true }) as OfferCard[]

  return (
    <section className="offer-section section-pad bg-white">
      <div className="site-shell">
        <span className="eyebrow">{t('offer.badge')}</span>
        <h2 className="display-title mt-5 max-w-4xl">
          {t('offer.line1')}{' '}
          <span className="italic-accent">{t('offer.line2')}</span>
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:gap-8">
          {cards.map((card) => (
            <article className="offer-card rounded-lg bg-light-blue p-8" key={card.title}>
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-lg text-xl font-black text-white ${
                  card.icon === 'G' ? 'bg-green' : 'bg-navy'
                }`}
              >
                {card.icon}
              </div>
              <h3 className="font-display text-3xl font-bold leading-tight text-text-dark">
                {card.title}
              </h3>
              <p className="mt-3 text-text-mid">{card.desc}</p>
            </article>
          ))}
        </div>

        <article className="health-card health-card-premium mt-8 items-center gap-8 rounded-lg bg-navy p-8 text-white">
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
          <span className="inline-flex min-h-10 items-center justify-center rounded-full bg-green px-5 text-sm font-extrabold">
            {t('offer.health.badge')}
          </span>
        </article>
      </div>
    </section>
  )
}
