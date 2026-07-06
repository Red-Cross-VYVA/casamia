import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BeforeAfterCard, BeforeAfterFeature } from '../components/BeforeAfterPreview'
import { SEO } from '../components/SEO'
import { type BeforeAfterTransformation } from '../constants/beforeAfter'

export function BeforeAfterPage() {
  const { t } = useTranslation()
  const transformations = t('beforeAfter.transformations', {
    returnObjects: true,
  }) as BeforeAfterTransformation[]
  const [featuredTransformation, ...secondaryTransformations] = transformations
  const comparisonLabels = {
    before: t('beforeAfter.labels.before'),
    after: t('beforeAfter.labels.after'),
  }

  return (
    <>
      <SEO
        title="Before & After Home Safety Transformations"
        description="Explore CasaMia home safety transformation examples, from bathroom and stair risks to safer entrances, kitchens, outdoor areas, and smart safety upgrades."
        path="/before-after"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Before & After Home Safety Transformations',
          description:
            'Examples of home safety improvements for aging in place, accessibility, and fall prevention.',
        }}
      />

      <section className="before-after-hero">
        <div className="site-shell before-after-hero-inner">
          <div className="before-after-hero-copy">
            <h1 className="display-title">{t('beforeAfter.page.title')}</h1>
            <p>{t('beforeAfter.page.body')}</p>
            <div className="before-after-hero-actions">
              <a className="btn btn-navy" href="#transformation-gallery">
                {t('beforeAfter.page.galleryCta')}
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              <Link className="btn btn-green" to="/home-safety-assessment">
                {t('beforeAfter.preview.assessmentCta')}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <aside className="before-after-hero-panel" aria-label="Transformation process">
            <span>Risk</span>
            <strong>Room findings become a practical safety plan.</strong>
            <ul>
              <li>What needs attention</li>
              <li>How CasaMia can mitigate it</li>
              <li>Which work should happen first</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="before-after-gallery-section bg-white">
        <div className="site-shell">
          <div className="before-after-gallery-header" id="transformation-gallery">
            <h2 className="display-title max-w-4xl">{t('beforeAfter.page.galleryTitle')}</h2>
            <p>{t('beforeAfter.page.galleryBody')}</p>
          </div>
          {featuredTransformation ? (
            <BeforeAfterFeature
              cta={t('beforeAfter.cardCta')}
              item={featuredTransformation}
              labels={comparisonLabels}
            />
          ) : null}

          <div className="before-after-gallery-grid">
            {secondaryTransformations.map((item, index) => (
              <BeforeAfterCard
                cta={t('beforeAfter.cardCta')}
                item={item}
                key={item.title}
                labels={comparisonLabels}
                variantIndex={index + 1}
              />
            ))}
          </div>

          <p className="mt-10 rounded-lg border border-border bg-light-blue p-5 text-sm leading-relaxed text-text-muted">
            {t('beforeAfter.disclaimer')}
          </p>
        </div>
      </section>
    </>
  )
}
