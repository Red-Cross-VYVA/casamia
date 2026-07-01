import { ArrowRight, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { PlanId } from '../constants/shopify'

type PlanItem = {
  id: PlanId
  name: string
  price: string
  desc: string
  features: string[]
  popular?: boolean
}

type PlansProps = {
  standalone?: boolean
}

export function Plans({ standalone = false }: PlansProps) {
  const { t } = useTranslation()
  const plans = t('plans.items', { returnObjects: true }) as PlanItem[]

  return (
    <section className={`plans-section section-pad bg-white ${standalone ? 'pt-12' : ''}`} id="plans">
      <div className="site-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-title">
            {t('plans.title1')}{' '}
            <span className="italic-accent">{t('plans.title2')}</span>
          </h2>
          <p className="mt-4 text-xl text-text-mid">{t('plans.sub')}</p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan) => {
            const highlighted = Boolean(plan.popular)

            return (
              <article
                className={`plan-card relative flex flex-col rounded-lg p-8 shadow-soft ${
                  highlighted
                    ? 'plan-card-highlight bg-navy text-white lg:-my-5 lg:py-10'
                    : 'border border-border bg-white text-text-dark'
                }`}
                key={plan.id}
              >
                {highlighted ? (
                  <span className="mb-5 inline-flex w-fit rounded-full bg-green px-4 py-2 text-sm font-extrabold text-white">
                    {t('plans.popular')}
                  </span>
                ) : null}

                <p
                  className={`text-sm font-extrabold uppercase ${
                    highlighted ? 'text-white/70' : 'text-text-muted'
                  }`}
                >
                  {plan.name}
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <p className="font-display text-5xl font-black leading-none">{plan.price}</p>
                  <p className={highlighted ? 'text-white/70' : 'text-text-muted'}>
                    {t('plans.perUnit')}
                  </p>
                </div>
                <p className={`mt-4 ${highlighted ? 'text-white/80' : 'text-text-mid'}`}>
                  {plan.desc}
                </p>

                <ul className="mt-7 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li className="flex gap-3" key={feature}>
                      <Check
                        className="mt-1 shrink-0 text-green"
                        size={18}
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  className={`btn mt-8 ${highlighted ? 'btn-green' : 'btn-navy'}`}
                  to={`/plans/${plan.id}`}
                >
                  {t('plans.detailsCta', { defaultValue: 'See Full Details' })}
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
