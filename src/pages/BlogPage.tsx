import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { blogArticles, featuredBlogArticle } from '../constants/blogContent'

const blogTopicCards = [
  {
    icon: ShieldCheck,
    title: 'Prevent avoidable risk',
    body: 'Understand the home details that make falls, transfers, and daily movement harder.',
  },
  {
    icon: ClipboardList,
    title: 'Plan works in the right order',
    body: 'Separate urgent safety changes from nice-to-have improvements and future phases.',
  },
  {
    icon: Search,
    title: 'Know what to ask',
    body: 'Use each article to prepare better questions before requesting quotes, grants, or assessments.',
  },
]

export function BlogPage() {
  const articles = blogArticles
  const remainingArticles = articles.filter((article) => article.id !== featuredBlogArticle.id)

  return (
    <>
      <SEO
        title="Senior Home Safety Blog"
        description="Expert CasaMia articles on senior home safety, aging in place, fall prevention, bathroom adaptations, grants, and smart safety in Spain."
        path="/blog"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'CasaMia Senior Home Safety Blog',
          description:
            'Expert articles for families planning safer aging in place, home adaptations, grants, and senior safety improvements in Spain.',
          publisher: {
            '@type': 'Organization',
            name: 'CasaMia',
          },
          blogPost: articles.map((article) => ({
            '@type': 'BlogPosting',
            headline: article.title,
            description: article.description,
            url: article.path,
            datePublished: article.date,
          })),
        }}
      />

      <section className="blog-hero">
        <div className="site-shell blog-hero-grid">
          <div className="blog-hero-copy">
            <span className="eyebrow">
              <span className="dot" aria-hidden="true" />
              CasaMia blog
            </span>
            <h1>Practical senior home-safety advice before families make big decisions.</h1>
            <p>
              Clear guidance on fall prevention, bathroom adaptations, smart safety,
              funding readiness, and choosing the right support for aging in place in Spain.
            </p>
            <div className="blog-hero-actions">
              <Link className="btn btn-green" to="/home-safety-assessment">
                Book Assessment
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/grant-check">
                Check Grant Readiness
              </Link>
            </div>
          </div>

          <Link className="blog-feature-card" to={featuredBlogArticle.path}>
            <SafeImage
              src={featuredBlogArticle.image}
              alt={featuredBlogArticle.imageAlt}
              className="blog-feature-image"
              imgClassName="h-full w-full object-cover"
              loading="eager"
            />
            <div className="blog-feature-content">
              <span>
                <BookOpen size={17} aria-hidden="true" />
                Featured article
              </span>
              <h2>{featuredBlogArticle.title}</h2>
              <p>{featuredBlogArticle.description}</p>
              <strong>
                Read article
                <ArrowRight size={18} aria-hidden="true" />
              </strong>
            </div>
          </Link>
        </div>
      </section>

      <section className="blog-value-section">
        <div className="site-shell">
          <div className="blog-section-heading">
            <p className="eyebrow">What the blog helps with</p>
            <h2>Better decisions, fewer rushed purchases.</h2>
            <p>
              Every article is written to help families spot risk, compare options,
              prepare documentation, and understand when professional help is worth it.
            </p>
          </div>

          <div className="blog-topic-grid">
            {blogTopicCards.map((card) => {
              const Icon = card.icon

              return (
                <article key={card.title}>
                  <span>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="blog-library-section">
        <div className="site-shell">
          <div className="blog-library-header">
            <div>
              <p className="eyebrow">Latest articles</p>
              <h2>Start with the topic closest to your family situation.</h2>
            </div>
            <Link className="btn btn-navy" to="/resources">
              View Guides
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>

          <div className="blog-card-grid">
            {remainingArticles.map((article) => (
              <Link className="blog-card" key={article.id} to={article.path}>
                <SafeImage
                  src={article.image}
                  alt={article.imageAlt}
                  className="blog-card-image"
                  imgClassName="h-full w-full object-cover"
                />
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span>{article.category}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <ul aria-label={`${article.title} key takeaways`}>
                    {article.takeaways.slice(0, 2).map((item) => (
                      <li key={item}>
                        <CheckCircle2 size={16} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <strong>
                    Read article
                    <ArrowRight size={17} aria-hidden="true" />
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="blog-final-section">
        <div className="site-shell blog-final-card">
          <div>
            <p className="eyebrow">Need advice for a real home?</p>
            <h2>Turn reading into a clear room-by-room plan.</h2>
            <p>
              CasaMia can assess the home, prioritise the works, help with grant readiness,
              and coordinate trusted local providers where needed.
            </p>
          </div>
          <Link className="btn btn-green" to="/home-safety-assessment">
            Start Your Assessment
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
