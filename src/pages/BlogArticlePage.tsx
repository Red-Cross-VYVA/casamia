import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { blogArticles } from '../constants/blogContent'

export function BlogArticlePage() {
  const { articleId } = useParams()
  const article = blogArticles.find((item) => item.id === articleId)

  if (!article) {
    return <Navigate to="/blog" replace />
  }

  const relatedArticles = blogArticles
    .filter((item) => item.id !== article.id)
    .slice(0, 3)

  return (
    <>
      <SEO
        title={article.title}
        description={article.description}
        path={article.path}
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: article.title,
            description: article.description,
            image: article.image,
            datePublished: article.date,
            dateModified: article.date,
            keywords: article.keywords.join(', '),
            author: {
              '@type': 'Organization',
              name: 'CasaMia',
            },
            publisher: {
              '@type': 'Organization',
              name: 'CasaMia',
            },
            mainEntityOfPage: article.path,
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
                Blog
              </Link>
              <div className="blog-article-meta">
                <span>{article.category}</span>
                <span>{article.readTime}</span>
              </div>
              <h1>{article.title}</h1>
              <p>{article.intro}</p>
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
          <aside className="blog-article-aside" aria-label="Article summary">
            <h2>Key takeaways</h2>
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
              <h2>Family checklist</h2>
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
              <h2>Common questions</h2>
              {article.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>
          </div>
        </div>
      </article>

      <section className="blog-related-section">
        <div className="site-shell">
          <div className="blog-library-header">
            <div>
              <p className="eyebrow">Keep learning</p>
              <h2>Related CasaMia articles</h2>
            </div>
            <Link className="btn btn-white" to="/blog">
              All Articles
            </Link>
          </div>

          <div className="blog-related-grid">
            {relatedArticles.map((item) => (
              <Link key={item.id} to={item.path}>
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <strong>
                  Read next
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
