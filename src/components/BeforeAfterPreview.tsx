import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
  beforeAfterImagePairs,
  type BeforeAfterTransformation,
} from '../constants/beforeAfter'
import { SafeImage } from './SafeImage'

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
            <Link className="btn btn-green" to="/free-home-safety-assessment">
              {t('beforeAfter.preview.assessmentCta')}
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {transformations.slice(0, 3).map((item, index) => (
            <BeforeAfterCard
              cta={t('beforeAfter.cardCta')}
              item={item}
              key={item.title}
              labels={{
                before: t('beforeAfter.labels.before'),
                after: t('beforeAfter.labels.after'),
              }}
              imagePair={beforeAfterImagePairs[index]}
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
  imagePair: { before: string; after: string }
  item: BeforeAfterTransformation
  labels: { before: string; after: string }
}) {
  return (
    <article className="before-after-card overflow-hidden rounded-lg border border-border bg-white shadow-soft">
      <div className="before-after-visual grid grid-cols-2 bg-light-blue">
        <BeforeAfterImage
          alt={`${labels.before}: ${item.title}`}
          label={labels.before}
          src={imagePair.before}
        />
        <BeforeAfterImage
          alt={`${labels.after}: ${item.title}`}
          label={labels.after}
          src={imagePair.after}
        />
      </div>

      <div className="p-5 md:p-6">
        <h3 className="font-display text-2xl font-bold leading-tight text-text-dark">{item.title}</h3>
        <ul className="mt-4 space-y-3">
          {item.benefits.map((benefit) => (
            <li className="flex gap-3 text-text-mid" key={benefit}>
              <CheckCircle2 className="mt-0.5 shrink-0 text-green" size={18} aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <Link
          className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-navy transition hover:text-green"
          to="/free-home-safety-assessment"
        >
          {cta}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

function BeforeAfterImage({
  alt,
  label,
  src,
}: {
  alt: string
  label: string
  src: string
}) {
  return (
    <div className="before-after-image relative overflow-hidden border-r border-white/60 last:border-r-0">
      <SafeImage
        src={src}
        alt={alt}
        fallbackLabel={label}
        className="h-full w-full"
        imgClassName="before-after-image-media h-full w-full object-cover"
      />
      <span className="absolute left-3 top-3 rounded-full bg-navy px-3 py-1 text-xs font-extrabold uppercase text-white shadow-soft">
        {label}
      </span>
    </div>
  )
}
