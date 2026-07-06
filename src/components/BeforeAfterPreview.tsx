import {
  ArrowRight,
  ArrowUpDown,
  Bath,
  CheckCircle2,
  CookingPot,
  DoorOpen,
  Home,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { type BeforeAfterTransformation } from '../constants/beforeAfter'

const transformationIcons: LucideIcon[] = [
  Bath,
  ArrowUpDown,
  DoorOpen,
  CookingPot,
  Home,
  Smartphone,
]

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
          {transformations.slice(0, 3).map((item, index) => (
            <BeforeAfterCard
              cta={t('beforeAfter.cardCta')}
              item={item}
              key={item.title}
              labels={{
                before: t('beforeAfter.labels.before'),
                after: t('beforeAfter.labels.after'),
              }}
              variantIndex={index}
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
  variantIndex = 0,
}: {
  cta: string
  item: BeforeAfterTransformation
  labels: { before: string; after: string }
  variantIndex?: number
}) {
  const Icon = transformationIcons[variantIndex] ?? ShieldCheck

  return (
    <article className="before-after-card">
      <TransformationVisual icon={Icon} item={item} labels={labels} compact />

      <div className="before-after-card-content">
        <h3>{item.title}</h3>
        <ul>
          {item.benefits.map((benefit) => (
            <li key={benefit}>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <Link className="before-after-card-link" to="/home-safety-assessment">
          {cta}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

export function BeforeAfterFeature({
  cta,
  item,
  labels,
}: {
  cta: string
  item: BeforeAfterTransformation
  labels: { before: string; after: string }
}) {
  return (
    <article className="before-after-feature">
      <div className="before-after-feature-copy">
        <span>{item.title}</span>
        <h3>{item.after}</h3>
        <p>{item.before}</p>
        <ul>
          {item.benefits.map((benefit) => (
            <li key={benefit}>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <Link className="btn btn-green" to="/home-safety-assessment">
          {cta}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <TransformationVisual icon={Bath} item={item} labels={labels} featured />
    </article>
  )
}

function TransformationVisual({
  compact = false,
  featured = false,
  icon: Icon,
  item,
  labels,
}: {
  compact?: boolean
  featured?: boolean
  icon: LucideIcon
  item: BeforeAfterTransformation
  labels: { before: string; after: string }
}) {
  return (
    <div
      className={[
        'before-after-visual',
        compact ? 'is-compact' : '',
        featured ? 'is-featured' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="before-after-visual-room">
        <span>
          <Icon size={featured ? 34 : 28} aria-hidden="true" />
        </span>
        <strong>{item.title}</strong>
      </div>

      <div className="before-after-visual-states">
        <div className="before-after-state is-before">
          <span>{labels.before}</span>
          <p>{item.before}</p>
        </div>
        <div className="before-after-transition" aria-hidden="true">
          <Lightbulb size={18} />
          <span>CasaMia</span>
        </div>
        <div className="before-after-state is-after">
          <span>{labels.after}</span>
          <p>{item.after}</p>
        </div>
      </div>
    </div>
  )
}
