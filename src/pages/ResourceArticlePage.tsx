import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { resourcePages } from '../constants/siteContent'

export function ResourceArticlePage() {
  const { articleId } = useParams()
  const article = resourcePages.find((item) => item.id === articleId)

  if (!article) {
    return <Navigate to="/resources" replace />
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.description}
        path={article.path}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.description,
          author: {
            '@type': 'Organization',
            name: 'CasaMia',
          },
          publisher: {
            '@type': 'Organization',
            name: 'CasaMia',
          },
        }}
      />

      <article className="resource-article">
        <header className="resource-article-hero bg-light-blue">
          <div className="site-shell">
            <Link className="seo-back-link" to="/resources">
              <ArrowLeft size={18} aria-hidden="true" />
              Resources
            </Link>
            <h1>{article.title}</h1>
            <p>{article.intro}</p>
          </div>
        </header>

        <div className="site-shell resource-article-body">
          {article.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </article>

      <section className="seo-final-cta">
        <div className="site-shell">
          <div>
            <h2>Want recommendations for a specific home?</h2>
            <p>Book a CasaMia in-home visit and receive practical next steps.</p>
          </div>
          <Link className="btn btn-green" to="/home-safety-assessment">
            Book In-Home Visit
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
