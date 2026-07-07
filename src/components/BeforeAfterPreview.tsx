import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
  beforeAfterImagePairs,
  type BeforeAfterTransformation,
} from '../constants/beforeAfter'
import { SafeImage } from './SafeImage'

type BeforeAfterImagePair = {
  before: string
  after: string
}

export function BeforeAfterPreview() {
  const { t } = useTranslation()
  const transformations = t('beforeAfter.transformations', {
    returnObjects: true,
  }) as BeforeAfterTransformation[]

  return (
    <section className="section-pad bg-white">
      <div className="site-shell">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="display-title max-w-4xl">{t('beforeAfter.preview.title')}</h2>
            <p className="mt-5 max-w-3xl text-xl leading-relaxed text-text-mid">
              {t('beforeAfter.preview.body')}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link className="btn btn-navy" to="/before-after">
              {t('beforeAfter.preview.viewCta')}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link className="btn btn-green" to="/home-safety-assessment">
              {t('beforeAfter.preview.assessmentCta')}
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {transformations.slice(0, beforeAfterImagePairs.length).map((item, index) => (
            <BeforeAfterCard
              cta={t('beforeAfter.cardCta')}
              imagePair={beforeAfterImagePairs[index]}
              item={item}
              key={item.title}
              labels={{
                before: t('beforeAfter.labels.before'),
                after: t('beforeAfter.labels.after'),
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export function BeforeAfterCard({
  cta,
  imagePair,
  item,
  labels,
}: {
  cta: string
  imagePair: BeforeAfterImagePair
  item: BeforeAfterTransformation
  labels: { before: string; after: string }
}) {
  return (
    <article className="before-after-card overflow-hidden rounded-lg border border-border bg-white shadow-soft">
      <div className="before-after-visual">
        <figure className="before-after-image">
          <SafeImage
            alt={`${item.title} - ${labels.before}`}
            className="h-full"
            imgClassName="before-after-image-media h-full w-full object-cover"
            src={imagePair.before}
          />
          <figcaption className="absolute left-4 top-4 rounded-full bg-navy px-4 py-2 text-xs font-black uppercase text-white">
            {labels.before}
          </figcaption>
        </figure>
        <figure className="before-after-image">
          <SafeImage
            alt={`${item.title} - ${labels.after}`}
            className="h-full"
            imgClassName="before-after-image-media h-full w-full object-cover"
            src={imagePair.after}
          />
          <figcaption className="absolute left-4 top-4 rounded-full bg-green px-4 py-2 text-xs font-black uppercase text-white">
            {labels.after}
          </figcaption>
        </figure>
      </div>

      <div className="before-after-card-content p-6">
        <h3 className="font-display text-2xl font-bold leading-tight text-text-dark">{item.title}</h3>
        <ul className="mt-5 space-y-3">
          {item.benefits.map((benefit) => (
            <li className="flex gap-3 text-text-mid" key={benefit}>
              <CheckCircle2 className="mt-1 shrink-0 text-green" size={18} aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <Link className="before-after-card-link mt-6" to="/home-safety-assessment">
          {cta}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
