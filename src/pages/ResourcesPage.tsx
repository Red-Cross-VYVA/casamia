import { ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { resourcePages } from '../constants/siteContent'

export function ResourcesPage() {
  return (
    <>
      <SEO
        title="Senior Home Safety Resources"
        description="Guides for families in Spain covering fall prevention, bathroom safety, aging in place, and home adaptation grants."
        path="/resources"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'CasaMia senior home safety resources',
          description: 'Guides for families planning safer aging in place at home.',
        }}
      />

      <section className="seo-hero bg-light-blue">
        <div className="site-shell">
          <div className="seo-hero-copy">
            <h1>Practical guides for safer aging at home</h1>
            <p>
              Learn what to check, what to prioritise, and when to ask for a professional
              home safety assessment.
            </p>
          </div>
        </div>
      </section>

      <section className="seo-section">
        <div className="site-shell">
          <div className="seo-card-grid">
            {resourcePages.map((article) => (
              <Link className="seo-resource-card" key={article.id} to={article.path}>
                <BookOpen size={24} aria-hidden="true" />
                <h2>{article.title}</h2>
                <p>{article.description}</p>
                <strong>
                  Read guide
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
