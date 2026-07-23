import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { blogArticles } from '../constants/blogContent'
import { localizeBlogArticle, localizeBlogArticles } from '../constants/blogContentLocalization'

const siteUrl = 'https://casamia.com.es'

const articleShellCopy = {
  en: {
    resources: 'Resources',
    summary: 'Article summary',
    takeaways: 'Key takeaways',
    familyChecklist: 'Family checklist',
    commonQuestions: 'Common questions',
    keepLearning: 'Keep learning',
    related: 'Related CasaMia articles',
    allResources: 'All Resources',
    readNext: 'Read next',
    nextStepEyebrow: 'Useful next step',
    nextStepTitle: 'Turn this guide into a practical plan.',
    nextStepBody:
      'Use the guide as a starting point, then choose the action that best matches what your family needs today.',
    nextStepActions: {
      checklist: 'Get the printable checklist',
      selfCheck: 'Start the online safety review',
    },
    englishNotice: '',
  },
  es: {
    resources: 'Recursos',
    summary: 'Resumen del artículo',
    takeaways: 'Ideas clave',
    familyChecklist: 'Lista para familias',
    commonQuestions: 'Preguntas frecuentes',
    keepLearning: 'Seguir aprendiendo',
    related: 'Artículos relacionados de CasaMia',
    allResources: 'Todos los recursos',
    readNext: 'Leer después',
    nextStepEyebrow: 'Siguiente paso útil',
    nextStepTitle: 'Convierte esta guía en un plan práctico.',
    nextStepBody:
      'Usa la guía como punto de partida y elige la acción que mejor encaje con lo que tu familia necesita hoy.',
    nextStepActions: {
      checklist: 'Descargar la lista para imprimir',
      selfCheck: 'Empezar la revisión online',
    },
    englishNotice: '',
  },
} as const

export function BlogArticlePage() {
  const { i18n } = useTranslation()
  const { articleId } = useParams()
  const baseArticle = blogArticles.find((item) => item.id === articleId)
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = articleShellCopy[language]

  if (!baseArticle) {
    return <Navigate to="/blog" replace />
  }

  const article = localizeBlogArticle(baseArticle, language)
  const articleUrl = `${siteUrl}${article.path}`
  const articleImageUrl = new URL(article.image, siteUrl).toString()
  const relatedArticles = localizeBlogArticles(
    blogArticles.filter((item) => item.id !== article.id),
    language,
  )
    .slice(0, 3)

  return (
    <>
      <SEO
        title={article.title}
        description={article.description}
        path={article.path}
        image={article.image}
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': `${articleUrl}#article`,
            headline: article.title,
            description: article.description,
            image: [articleImageUrl],
            datePublished: article.date,
            dateModified: article.date,
            articleSection: article.category,
            keywords: article.keywords.join(', '),
            author: {
              '@type': 'Organization',
              '@id': `${siteUrl}/#organization`,
              name: 'CasaMia',
            },
            publisher: {
              '@type': 'Organization',
              '@id': `${siteUrl}/#organization`,
              name: 'CasaMia',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': articleUrl,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${siteUrl}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: copy.resources,
                item: `${siteUrl}/blog`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: article.title,
                item: articleUrl,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: article.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          },
        ]}
      />

      <article className="blog-article">
        <header className="blog-article-hero">
          <div className="site-shell blog-article-hero-grid">
            <div>
              <Link className="seo-back-link" to="/blog">
                <ArrowLeft size={18} aria-hidden="true" />
                {copy.resources}
              </Link>
              <div className="blog-article-meta">
                <span>{article.category}</span>
                <span>{article.readTime}</span>
              </div>
              <h1>{article.title}</h1>
              <p>{article.intro}</p>
              {copy.englishNotice ? <p className="mt-4 text-sm font-extrabold text-white/80">{copy.englishNotice}</p> : null}
            </div>
            <SafeImage
              src={article.image}
              alt={article.imageAlt}
              className="blog-article-image"
              imgClassName="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        </header>

        <div className="site-shell blog-article-layout">
          <aside className="blog-article-aside" aria-label={copy.summary}>
            <h2>{copy.takeaways}</h2>
            <ul>
              {article.takeaways.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link className="btn btn-green" to={article.cta.to}>
              {article.cta.label}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </aside>

          <div className="blog-article-body">
            {article.sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}

            <section className="blog-checklist">
              <h2>{copy.familyChecklist}</h2>
              <ul>
                {article.checklist.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="blog-faq">
              <h2>{copy.commonQuestions}</h2>
              {article.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>

            <section className="blog-next-step-card" aria-labelledby="blog-next-step-title">
              <p className="eyebrow">{copy.nextStepEyebrow}</p>
              <h2 id="blog-next-step-title">{copy.nextStepTitle}</h2>
              <p>{copy.nextStepBody}</p>
              <div className="blog-next-step-actions">
                <Link className="btn btn-green" to={article.cta.to}>
                  {article.cta.label}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="btn btn-white" to="/blog">
                  {copy.nextStepActions.checklist}
                </Link>
                <Link className="blog-next-step-link" to="/home-safety-assessment#self-inspection-tool">
                  {copy.nextStepActions.selfCheck}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </article>

      <section className="blog-related-section">
        <div className="site-shell">
          <div className="blog-library-header">
            <div>
              <p className="eyebrow">{copy.keepLearning}</p>
              <h2>{copy.related}</h2>
            </div>
            <Link className="btn btn-white" to="/blog">
              {copy.allResources}
            </Link>
          </div>

          <div className="blog-related-grid">
            {relatedArticles.map((item) => (
              <Link key={item.id} to={item.path}>
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <strong>
                  {copy.readNext}
                  <ArrowRight size={17} aria-hidden="true" />
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
