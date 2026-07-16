import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
  beforeAfterVisuals,
  type BeforeAfterVisual,
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
            <Link className="btn btn-green" to="/home-safety-assessment">
              {t('beforeAfter.preview.assessmentCta')}
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {transformations.slice(0, beforeAfterVisuals.length).map((item, index) => (
            <BeforeAfterCard
              cta={t('beforeAfter.cardCta')}
              item={item}
              key={item.title}
              labels={{
                before: t('beforeAfter.labels.before'),
                after: t('beforeAfter.labels.after'),
                focus: t('beforeAfter.labels.focus'),
              }}
              visual={beforeAfterVisuals[index]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export function BeforeAfterCard({
  cta,
  item,
  labels,
  visual,
}: {
  cta: string
  item: BeforeAfterTransformation
  labels: { before: string; after: string; focus: string }
  visual: BeforeAfterVisual
}) {
  const isComparison = visual.mode === 'compare' && Boolean(visual.after)

  return (
    <article className="before-after-card overflow-hidden rounded-lg border border-border bg-white shadow-soft">
      <div className="before-after-visual">
        <figure className={`before-after-image before-after-fade-frame ${isComparison ? 'is-comparison' : 'is-focus'}`}>
          <SafeImage
            alt={`${item.title} - ${isComparison ? labels.before : labels.focus}`}
            className="before-after-layer h-full"
            imgClassName="before-after-image-media h-full w-full object-cover"
            src={visual.before}
          />
          {isComparison && visual.after ? (
            <>
              <SafeImage
                alt={`${item.title} - ${labels.after}`}
                className="before-after-layer before-after-layer-after h-full"
                imgClassName="before-after-image-media h-full w-full object-cover"
                src={visual.after}
              />
              <figcaption className="before-after-badge before-after-badge-before rounded-full bg-navy px-4 py-2 text-xs font-black uppercase text-white">
                {labels.before}
              </figcaption>
              <figcaption className="before-after-badge before-after-badge-after rounded-full bg-green px-4 py-2 text-xs font-black uppercase text-white">
                {labels.after}
              </figcaption>
            </>
          ) : (
            <figcaption className="before-after-badge before-after-badge-focus rounded-full bg-navy px-4 py-2 text-xs font-black uppercase text-white">
              {labels.focus}
            </figcaption>
          )}
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
