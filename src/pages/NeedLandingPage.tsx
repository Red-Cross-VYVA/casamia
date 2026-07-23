import { ArrowRight, CheckCircle2, ClipboardCheck, HeartHandshake, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { getNeedLandingPage, needLandingPages } from '../constants/needLandingPages'

import '../styles/need-landing.css'

export function NeedLandingPage() {
  const { needSlug } = useParams()
  const page = getNeedLandingPage(needSlug)

  if (!page) {
    return <Navigate to="/services" replace />
  }

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.title,
      description: page.description,
      provider: {
        '@type': 'Organization',
        name: 'CasaMia',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Spain',
      },
      serviceType: page.eyebrow,
      url: `https://casamia.com.es${page.path}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ]

  const siblingPages = needLandingPages.filter((item) => item.slug !== page.slug).slice(0, 4)

  return (
    <>
      <SEO title={page.seoTitle} description={page.description} path={page.path} schema={schema} />

      <main className="need-landing">
        <section className="need-landing-hero">
          <div className="site-shell need-landing-hero-grid">
            <div className="need-landing-copy">
              <p className="eyebrow">{page.eyebrow}</p>
              <h1>{page.title}</h1>
              <p>{page.intro}</p>
              <div className="need-landing-actions">
                <Link className="btn btn-green" to="/home-safety-wizard">
                  Build my CasaMia plan
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="btn btn-white" to={page.servicePath}>
                  See related services
                </Link>
              </div>
            </div>

            <aside className="need-landing-visual" aria-label={`${page.title} overview`}>
              <SafeImage
                src={page.image}
                alt=""
                className="need-landing-photo"
                imgClassName="need-landing-photo-img"
                loading="eager"
              />
              <div className="need-landing-quick-card">
                <span><ShieldCheck size={20} aria-hidden="true" /></span>
                <strong>CasaMia plan</strong>
                <p>Assessment, package selection, installation coordination and follow-up in one managed route.</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="need-landing-section">
          <div className="site-shell need-landing-three">
            <NeedPanel
              icon={<HeartHandshake size={24} aria-hidden="true" />}
              title="Who this helps"
              items={page.whoFor}
            />
            <NeedPanel
              icon={<ShieldCheck size={24} aria-hidden="true" />}
              title="What to check first"
              items={page.priorities}
            />
            <NeedPanel
              icon={<ClipboardCheck size={24} aria-hidden="true" />}
              title="How CasaMia handles it"
              items={page.casamiaPlan}
            />
          </div>
        </section>

        <section className="need-landing-process">
          <div className="site-shell need-landing-process-grid">
            <div>
              <p className="eyebrow">Turnkey support</p>
              <h2>From concern to clear next step.</h2>
              <p>
                CasaMia turns a broad worry into a practical home-safety route: what matters now, what can wait,
                what needs measurement, and what can be coordinated as one package.
              </p>
            </div>
            <ol className="need-landing-steps">
              {['Tell us what changed', 'Review the home and routines', 'Receive a practical proposal', 'Install, configure and support'].map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="need-landing-section">
          <div className="site-shell need-landing-links-grid">
            <div className="need-landing-related">
              <p className="eyebrow">Useful next pages</p>
              <h2>Go deeper without getting lost.</h2>
              <div>
                {page.relatedServices.map((link) => (
                  <Link key={link.to} to={link.to}>
                    {link.label}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="need-landing-faq">
              <p className="eyebrow">Questions families ask</p>
              {page.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="need-landing-more">
          <div className="site-shell">
            <div className="need-landing-more-card">
              <div>
                <p className="eyebrow">Popular CasaMia needs</p>
                <h2>More ways families search for help.</h2>
              </div>
              <div className="need-landing-chip-list">
                {siblingPages.map((item) => (
                  <Link key={item.slug} to={item.path}>{item.title}</Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

function NeedPanel({
  icon,
  title,
  items,
}: {
  icon: ReactNode
  title: string
  items: string[]
}) {
  return (
    <article className="need-panel">
      <span>{icon}</span>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <CheckCircle2 size={17} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
