import { ArrowRight, Eye, ListChecks, Route } from 'lucide-react'
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
  const insightCopy =
    language === 'es'
      ? {
          eyebrow: 'Cómo leer los ejemplos',
          title: 'No mires solo el cambio. Mira la rutina.',
          body: 'Cada imagen ayuda a identificar una situación diaria: dónde aparece el riesgo, qué apoyo falta y qué información conviene compartir antes de decidir.',
          steps: [
            {
              title: 'Detecta el momento difícil',
              body: 'Ducha, cama, escaleras, entrada, cocina o salón: empieza por la rutina que genera miedo o dependencia.',
            },
            {
              title: 'Observa el espacio real',
              body: 'Fíjate en suelos, apoyos, luz, distancia, puertas, giros y zonas donde la persona duda o necesita ayuda.',
            },
            {
              title: 'Convierte la idea en plan',
              body: 'CasaMia separa mejoras simples, trabajos que necesitan visita y opciones que requieren presupuesto o compatibilidad.',
            },
          ],
        }
      : {
          eyebrow: 'How to read the examples',
          title: 'Do not just look at the change. Look at the routine.',
          body: 'Each image helps identify a daily situation: where the risk appears, what support is missing, and what information is useful before deciding.',
          steps: [
            {
              title: 'Spot the difficult moment',
              body: 'Shower, bed, stairs, entrance, kitchen or living room: start with the routine that creates fear or dependence.',
            },
            {
              title: 'Look at the real space',
              body: 'Notice floors, support points, lighting, distances, doors, turning space and places where the person hesitates.',
            },
            {
              title: 'Turn the idea into a plan',
              body: 'CasaMia separates simple improvements, work that needs a visit and options that require a quote or compatibility check.',
            },
          ],
        }

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
        {
          '@type': 'HowTo',
          '@id': `${siteUrl}/before-after#how-to-use-examples`,
          name: insightCopy.title,
          description: insightCopy.body,
          step: insightCopy.steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.title,
            text: step.body,
          })),
        },
      ],
    }),
    [body, insightCopy.body, insightCopy.steps, insightCopy.title, language, title, transformations],
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

      <section className="before-after-insight-section">
        <div className="site-shell before-after-insight-card">
          <div className="before-after-insight-copy">
            <p className="eyebrow">{insightCopy.eyebrow}</p>
            <h2>{insightCopy.title}</h2>
            <p>{insightCopy.body}</p>
          </div>
          <div className="before-after-insight-steps">
            {insightCopy.steps.map((step, index) => {
              const Icon = index === 0 ? Eye : index === 1 ? ListChecks : Route
              return (
                <article key={step.title}>
                  <span>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </article>
              )
            })}
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
