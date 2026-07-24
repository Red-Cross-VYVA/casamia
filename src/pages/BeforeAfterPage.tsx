import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BeforeAfterCard } from '../components/BeforeAfterPreview'
import { SEO } from '../components/SEO'
import {
  beforeAfterVisuals,
  type BeforeAfterTransformation,
} from '../constants/beforeAfter'

const siteUrl = 'https://casamia.com.es'

export function BeforeAfterPage() {
  const { i18n, t } = useTranslation()
  const transformations = t('beforeAfter.transformations', {
    returnObjects: true,
  }) as BeforeAfterTransformation[]
  const title = t('beforeAfter.page.title')
  const body = t('beforeAfter.page.body')
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'

  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${siteUrl}/before-after#collection`,
          url: `${siteUrl}/before-after`,
          name: title,
          description: body,
          inLanguage: language,
          publisher: {
            '@type': 'Organization',
            name: 'CasaMia',
            url: siteUrl,
          },
          mainEntity: { '@id': `${siteUrl}/before-after#transformations` },
        },
        {
          '@type': 'ItemList',
          '@id': `${siteUrl}/before-after#transformations`,
          name: title,
          itemListElement: transformations.slice(0, beforeAfterVisuals.length).map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.title,
            image: `${siteUrl}${beforeAfterVisuals[index]?.after ?? beforeAfterVisuals[index]?.before}`,
          })),
        },
      ],
    }),
    [body, language, title, transformations],
  )

  return (
    <>
      <SEO
        title={title}
        description={body}
        path="/before-after"
        image="/images/before-after/bathroom-after.jpg"
        schema={schema}
      />

      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="display-title">{title}</h1>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed text-text-mid">
            {body}
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
