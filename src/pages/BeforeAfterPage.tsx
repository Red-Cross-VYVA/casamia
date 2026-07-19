import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BeforeAfterCard } from '../components/BeforeAfterPreview'
import {
  beforeAfterVisuals,
  type BeforeAfterTransformation,
} from '../constants/beforeAfter'

export function BeforeAfterPage() {
  const { t } = useTranslation()
  const transformations = t('beforeAfter.transformations', {
    returnObjects: true,
  }) as BeforeAfterTransformation[]

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="display-title">{t('beforeAfter.page.title')}</h1>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed text-text-mid">
            {t('beforeAfter.page.body')}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link className="btn btn-green" to="/home-safety-assessment">
              {t('beforeAfter.preview.assessmentCta')}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link
              className="btn border border-border bg-white text-navy hover:border-green hover:text-green"
              to="/home-safety-wizard"
            >
              {t('beforeAfter.page.compareCta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell">
          <div className="grid gap-8 lg:grid-cols-2">
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

          <p className="mt-10 rounded-lg border border-border bg-light-blue p-5 text-sm leading-relaxed text-text-muted">
            {t('beforeAfter.disclaimer')}
          </p>
        </div>
      </section>
    </>
  )
}
