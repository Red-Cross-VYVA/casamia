import { ArrowRight, HeartPulse } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type OfferCard = {
  icon: string
  title: string
  desc: string | string[]
  termsLink?: string
  disclaimer?: string
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
          {cards.map((card) => {
            const cardContent = (
              <>
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
                <div className="mt-3 space-y-3 text-text-mid">
                  {Array.isArray(card.desc) ? (
                    card.desc.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                  ) : (
                    <p>{card.desc}</p>
                  )}
                </div>
                {card.icon === 'G' && card.termsLink ? (
                  <Link
                    className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-navy transition hover:text-green"
                    to="/terms-and-conditions#grant-management"
                  >
                    {card.termsLink}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ) : null}
                {card.icon === 'G' && card.disclaimer ? (
                  <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-text-muted">
                    {card.disclaimer}
                  </p>
                ) : null}
                {card.icon === 'S' ? (
                  <span className="offer-card-cta">
                    {t('common.learnMore')}
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                ) : null}
              </>
            )

            return card.icon === 'S' ? (
              <Link
                className="offer-card offer-card-link rounded-lg bg-light-blue p-8"
                key={card.title}
                to="/tech"
              >
                {cardContent}
              </Link>
            ) : (
              <article className="offer-card rounded-lg bg-light-blue p-8" key={card.title}>
                {cardContent}
              </article>
            )
          })}
        </div>

        <Link
          className="health-card health-card-premium mt-8 items-center gap-8 rounded-lg bg-navy p-8 text-white"
          to="/tech#package-inclusions"
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
