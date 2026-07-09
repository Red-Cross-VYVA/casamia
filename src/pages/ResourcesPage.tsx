import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Home,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { resourcePages } from '../constants/siteContent'

const resourceMeta = {
  'preventing-falls-at-home': {
    category: 'Fall prevention',
    time: '5 min guide',
    image: '/images/solutions/stairs-hallways.jpg',
    highlights: ['Night routes', 'Stairs and handrails', 'Professional review'],
  },
  'bathroom-safety-for-seniors': {
    category: 'Bathroom safety',
    time: '4 min guide',
    image: '/images/solutions/bathroom-safety.jpg',
    highlights: ['Shower transfers', 'Grab bars', 'Anti-slip surfaces'],
  },
  'home-adaptation-grants-spain': {
    category: 'Grants and funding',
    time: '6 min guide',
    image: '/images/solutions/entrance-access.jpg',
    highlights: ['What may qualify', 'Documents to prepare', 'CasaMia support'],
  },
  'aging-in-place-spain': {
    category: 'Planning ahead',
    time: '6 min guide',
    image: '/images/solutions/entrance-access.jpg',
    highlights: ['Phased improvements', 'Smart safety', 'Family decisions'],
  },
} as const

const resourcePathways = [
  {
    icon: ClipboardCheck,
    title: 'Start with the risk',
    body: 'If someone has already slipped, avoids stairs, or struggles with transfers, begin with the guide closest to that routine.',
  },
  {
    icon: ShieldCheck,
    title: 'Prioritise what changes daily life',
    body: 'Focus first on lighting, support points, surfaces, access, and emergency response before cosmetic improvements.',
  },
  {
    icon: Home,
    title: 'Move from reading to action',
    body: 'Use the guides to prepare questions, then book an assessment when the family needs a clear room-by-room plan.',
  },
]

const resourceStats = [
  { value: '4', label: 'family guides' },
  { value: 'Room by room', label: 'practical focus' },
  { value: 'Spain', label: 'grant and home context' },
]

export function ResourcesPage() {
  const featuredArticle = resourcePages[0]
  const featuredMeta = resourceMeta[featuredArticle.id as keyof typeof resourceMeta]

  return (
    <>
      <SEO
        title="Senior Home Safety Resources"
        description="Practical CasaMia guides for families in Spain covering fall prevention, bathroom safety, aging in place, smart safety, and home adaptation grants."
        path="/resources"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'CasaMia senior home safety resources',
          description: 'Guides for families planning safer aging in place at home.',
        }}
      />

      <section className="resources-hero">
        <div className="resources-hero-grid site-shell">
          <div className="resources-hero-copy">
            <span className="eyebrow">
              <span className="dot" aria-hidden="true" />
              CasaMia resources
            </span>
            <h1>Clear guidance before families change the home.</h1>
            <p>
              Practical guides for spotting risk, comparing priorities, preparing grant
              questions, and deciding when a professional home safety assessment is worth it.
            </p>
            <div className="resources-hero-actions">
              <Link className="btn btn-green" to="/home-safety-assessment">
                Book In-Home Visit
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/tools/safety-report">
                Start Free Safety Report
              </Link>
            </div>
            <div className="resources-stats" aria-label="Resource highlights">
              {resourceStats.map((stat) => (
                <div key={stat.value}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Link className="resources-featured-guide" to={featuredArticle.path}>
            <SafeImage
              src={featuredMeta.image}
              alt={featuredArticle.title}
              className="resources-featured-image"
              imgClassName="h-full w-full object-cover"
              loading="eager"
            />
            <div className="resources-featured-content">
              <span>
                <BookOpen size={17} aria-hidden="true" />
                Featured guide
              </span>
              <h2>{featuredArticle.title}</h2>
              <p>{featuredArticle.description}</p>
              <strong>
                Read this first
                <ArrowRight size={18} aria-hidden="true" />
              </strong>
            </div>
          </Link>
        </div>
      </section>

      <section className="resources-pathway-section">
        <div className="site-shell">
          <div className="resources-section-heading">
            <p className="eyebrow">Use the guides well</p>
            <h2>Turn concern into a next step.</h2>
            <p>
              These resources are designed to help families move from vague worry to a
              practical decision about the rooms, routines, and support that matter most.
            </p>
          </div>

          <div className="resources-pathway-grid">
            {resourcePathways.map((item) => {
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

      <section className="resources-library-section">
        <div className="site-shell">
          <div className="resources-library-header">
            <div>
              <p className="eyebrow">Guide library</p>
              <h2>Choose the question closest to the family situation.</h2>
            </div>
            <Link className="btn btn-navy" to="/services">
              See Services
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>

          <div className="resources-card-grid">
            {resourcePages.map((article) => {
              const meta = resourceMeta[article.id as keyof typeof resourceMeta]

              return (
                <Link className="resources-card" key={article.id} to={article.path}>
                  <SafeImage
                    src={meta.image}
                    alt={article.title}
                    className="resources-card-image"
                    imgClassName="h-full w-full object-cover"
                  />
                  <div className="resources-card-body">
                    <div className="resources-card-meta">
                      <span>{meta.category}</span>
                      <span>{meta.time}</span>
                    </div>
                    <h3>{article.title}</h3>
                    <p>{article.description}</p>
                    <ul aria-label={`${article.title} highlights`}>
                      {meta.highlights.map((item) => (
                        <li key={item}>
                          <CheckCircle2 size={16} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <strong>
                      Read guide
                      <ArrowRight size={17} aria-hidden="true" />
                    </strong>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="resources-action-section">
        <div className="resources-action-grid site-shell">
          <div>
            <p className="eyebrow">Need a clearer answer?</p>
            <h2>Use the resources, then let CasaMia prioritise the home.</h2>
          </div>
          <div className="resources-action-cards">
            <Link to="/tools/safety-report">
              <FileText size={24} aria-hidden="true" />
              <span>Online safety report</span>
              <strong>Start with photos and visible risks.</strong>
            </Link>
            <Link to="/home-safety-assessment">
              <Sparkles size={24} aria-hidden="true" />
              <span>In-home visit</span>
              <strong>Get a practical room-by-room plan.</strong>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
