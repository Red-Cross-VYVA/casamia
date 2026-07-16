import {
  ArrowRight,
  Bath,
  BookOpen,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Footprints,
  Home,
  Lightbulb,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { blogArticles, featuredBlogArticle } from '../constants/blogContent'

const siteUrl = 'https://casamia.es'

const resourceTools = [
  {
    icon: ClipboardCheck,
    title: 'Room-by-room self-check',
    body: 'Work through seven areas of the home and flag points that may need review before discussing priorities as a family.',
    to: '/home-safety-assessment#self-inspection-tool',
  },
  {
    icon: Camera,
    title: 'Photo safety review',
    body: 'Upload room photos and add context to organise possible risks and questions for a closer review.',
    to: '/#estimate-upload',
  },
  {
    icon: FileCheck2,
    title: 'Grant-readiness checker',
    body: 'Answer a short questionnaire to understand which documents and funding questions to prepare next.',
    to: '/grant-check',
  },
  {
    icon: Sparkles,
    title: 'Home adaptation planner',
    body: 'Choose rooms and priorities to organise possible improvements before requesting a final quotation.',
    to: '/configure',
  },
] as const

const quickWins = [
  {
    icon: ShieldCheck,
    title: 'Clear the walking routes',
    body: 'Move loose cables, clutter and unstable furniture away from the routes used every day.',
  },
  {
    icon: Lightbulb,
    title: 'Light the night-time route',
    body: 'Check the path from the bed to the bathroom and add easy-to-reach or motion lighting where needed.',
  },
  {
    icon: Bath,
    title: 'Review bathroom support',
    body: 'Look at shower entry, toilet transfers, wet surfaces and what the person currently holds for balance.',
  },
  {
    icon: Footprints,
    title: 'Make steps easier to read',
    body: 'Improve lighting and contrast around stairs, thresholds and level changes, and check stable hand support.',
  },
  {
    icon: Home,
    title: 'Bring essentials within reach',
    body: 'Keep frequently used kitchen, bedroom and bathroom items between comfortable waist and shoulder height.',
  },
  {
    icon: PhoneCall,
    title: 'Prepare an emergency routine',
    body: 'Keep help reachable and store key contacts, agreed access instructions and responder information securely with trusted people.',
  },
] as const

const familyQuestions = [
  {
    question: 'Where should we start if nobody has fallen yet?',
    answer:
      'Start with the routes and rooms used every day: the bathroom, stairs, bedroom-to-bathroom route, entrance and kitchen. Look for moments where the person pauses, reaches for furniture or avoids part of the home.',
  },
  {
    question: 'Which safety improvements can families make immediately?',
    answer:
      'Clearing walking routes, improving lighting, moving daily items within easy reach and making emergency help accessible are sensible first steps. Fixed support, electrical work and structural changes should be assessed and installed appropriately.',
  },
  {
    question: 'When is a professional home assessment useful?',
    answer:
      'An assessment is useful when mobility has changed, a fall or near miss has happened, several rooms need work, or the family needs a clear order of priorities before comparing products and quotations.',
  },
  {
    question: 'Can CasaMia guarantee a home adaptation grant?',
    answer:
      'No. CasaMia can help families prepare questions, documents and a clearer scope of work, but eligibility, approval and payment are decided by the relevant public authority.',
  },
] as const

const resourceStats = [
  { value: '4', label: 'guided planning tools' },
  { value: '10', label: 'practical family guides' },
  { value: '7 areas', label: 'in the room-by-room check' },
] as const

const resourceHubSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/blog#resources`,
      url: `${siteUrl}/blog`,
      name: 'Senior Home Safety Resources & Tools | CasaMia',
      description:
        'Practical senior home safety resources for families in Spain, including quick checks, room-by-room tips, fall-prevention guides and grant-readiness help.',
      inLanguage: 'en',
      publisher: {
        '@type': 'Organization',
        name: 'CasaMia',
        url: siteUrl,
      },
      mainEntity: {
        '@id': `${siteUrl}/blog#resource-list`,
      },
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/blog#resource-list`,
      name: 'CasaMia home safety tools and guides',
      numberOfItems: resourceTools.length + blogArticles.length,
      itemListElement: [
        ...resourceTools.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: tool.title,
          url: `${siteUrl}${tool.to}`,
        })),
        ...blogArticles.map((article, index) => ({
          '@type': 'ListItem',
          position: resourceTools.length + index + 1,
          name: article.title,
          url: `${siteUrl}${article.path}`,
        })),
      ],
    },
    {
      '@type': 'Blog',
      '@id': `${siteUrl}/blog#articles`,
      url: `${siteUrl}/blog`,
      name: 'CasaMia senior home safety guides',
      publisher: {
        '@type': 'Organization',
        name: 'CasaMia',
        url: siteUrl,
      },
      blogPost: blogArticles.map((article) => ({
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.description,
        url: `${siteUrl}${article.path}`,
        image: `${siteUrl}${article.image}`,
        datePublished: article.date,
        dateModified: article.date,
        author: {
          '@type': 'Organization',
          name: 'CasaMia',
          url: siteUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: 'CasaMia',
          url: siteUrl,
        },
        mainEntityOfPage: `${siteUrl}${article.path}`,
      })),
    },
  ],
}

export function BlogPage() {
  const remainingArticles = blogArticles.filter((article) => article.id !== featuredBlogArticle.id)

  return (
    <>
      <SEO
        title="Senior Home Safety Resources & Tools | CasaMia"
        description="Practical senior home safety resources for families in Spain: quick checks, room-by-room tips, fall-prevention guides, grant help and useful tools."
        path="/blog"
        schema={resourceHubSchema}
      />

      <div lang="en">
        <section className="resources-hero" aria-labelledby="resources-page-title">
          <div className="resources-hero-grid site-shell">
            <div className="resources-hero-copy">
              <span className="eyebrow">
                <span className="dot" aria-hidden="true" />
                CasaMia resources
              </span>
              <h1 id="resources-page-title">Senior home safety resources and practical tools for families</h1>
              <p>
                Use clear checklists, room-by-room tips and guided tools to reduce avoidable risk,
                plan home adaptations and prepare better questions before making big decisions in Spain.
              </p>
              <div className="resources-hero-actions">
                <a className="btn btn-green" href="#tools">
                  Use the free tools
                  <ArrowRight size={20} aria-hidden="true" />
                </a>
                <a className="btn btn-white" href="#guides">
                  Browse practical guides
                </a>
              </div>
              <div className="resources-stats" aria-label="CasaMia resource highlights">
                {resourceStats.map((stat) => (
                  <div key={stat.value}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link className="resources-featured-guide" to={featuredBlogArticle.path}>
              <SafeImage
                src={featuredBlogArticle.image}
                alt={featuredBlogArticle.imageAlt}
                className="resources-featured-image"
                imgClassName="h-full w-full object-cover"
                loading="eager"
              />
              <div className="resources-featured-content">
                <span>
                  <BookOpen size={17} aria-hidden="true" />
                  Start with this checklist
                </span>
                <h2>{featuredBlogArticle.title}</h2>
                <p>{featuredBlogArticle.description}</p>
                <strong>
                  Open the fall-prevention guide
                  <ArrowRight size={18} aria-hidden="true" />
                </strong>
              </div>
            </Link>
          </div>
        </section>

        <section className="resources-action-section" id="tools" aria-labelledby="resources-tools-title">
          <div className="resources-action-grid site-shell">
            <div>
              <p className="eyebrow">Free planning tools</p>
              <h2 id="resources-tools-title">Start with what you need today.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
                Choose a guided check when you need a first view of the home, funding readiness or the work to plan next.
              </p>
            </div>

            <div className="resources-action-cards">
              {resourceTools.map((tool) => {
                const Icon = tool.icon

                return (
                  <Link key={tool.title} to={tool.to}>
                    <Icon size={24} aria-hidden="true" />
                    <h3>
                      <span>{tool.title}</span>
                    </h3>
                    <strong>{tool.body}</strong>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resources-pathway-section" id="quick-wins" aria-labelledby="resources-quick-wins-title">
          <div className="site-shell">
            <div className="resources-section-heading">
              <p className="eyebrow">Quick wins you can do today</p>
              <h2 id="resources-quick-wins-title">Small checks that make everyday routines safer.</h2>
              <p>
                Start with changes that improve visibility, reach and clear movement. These checks do not replace professional advice where fixed support, electrical work or structural changes are needed.
              </p>
            </div>

            <div className="resources-pathway-grid">
              {quickWins.map((item) => {
                const Icon = item.icon

                return (
                  <article key={item.title}>
                    <span>
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resources-library-section" id="guides" aria-labelledby="resources-guides-title">
          <div className="site-shell">
            <div className="resources-library-header">
              <div>
                <p className="eyebrow">Practical guides and advice</p>
                <h2 id="resources-guides-title">Room-by-room home safety guidance for real family decisions.</h2>
              </div>
              <Link className="btn btn-navy" to="/before-after">
                See before-and-after ideas
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
                      Read this guide
                      <ArrowRight size={17} aria-hidden="true" />
                    </strong>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="blog-value-section" aria-labelledby="resources-questions-title">
          <div className="site-shell">
            <div className="blog-section-heading">
              <p className="eyebrow">Popular family questions</p>
              <h2 id="resources-questions-title">Simple answers before you choose the next step.</h2>
              <p>
                Use these answers as a starting point, then choose the tool or guide that best matches the home and the person living there.
              </p>
            </div>

            <div className="blog-faq mt-12">
              {familyQuestions.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="blog-final-section">
          <div className="site-shell blog-final-card">
            <div>
              <p className="eyebrow">Need advice for a real home?</p>
              <h2>Turn the useful ideas into a clear room-by-room plan.</h2>
              <p>
                CasaMia can review the home, prioritise the work and explain practical next steps for the family.
              </p>
            </div>
            <Link className="btn btn-green" to="/home-safety-assessment">
              Request a home assessment
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
