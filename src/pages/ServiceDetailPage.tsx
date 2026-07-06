import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { ServiceIcon } from '../components/ServiceIcon'
import { primaryServices } from '../constants/siteContent'
import { ServiceChecklist } from './ServicesPage'

export function ServiceDetailPage() {
  const { serviceId } = useParams()
  const service = primaryServices.find((item) => item.id === serviceId)

  if (!service) {
    return <Navigate to="/services" replace />
  }

  return (
    <>
      <SEO
        title={`${service.title} | Senior Home Safety Spain`}
        description={service.description}
        path={service.path}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.description,
          provider: {
            '@type': 'Organization',
            name: 'CasaMia',
          },
          areaServed: 'Spain',
          serviceType: service.title,
        }}
      />

      <section className="seo-detail-hero bg-light-blue">
        <div className="site-shell">
          <Link className="seo-back-link" to="/services">
            <ArrowLeft size={17} aria-hidden="true" />
            All services
          </Link>
          <div className="seo-detail-hero-grid">
            <div>
              <h1>{service.title}</h1>
              <p>{service.intro}</p>
              <div className="seo-hero-actions">
                <Link
                  className="btn btn-green"
                  to={`/home-safety-assessment?plan=${service.ctaPlan}`}
                >
                  Book In-Home Visit
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
                <Link className="btn btn-white" to="/tools/safety-report">
                  Start Free Safety Report
                </Link>
              </div>
            </div>
            <aside className="seo-detail-icon-card">
              <ServiceIcon icon={service.icon} size={48} />
              <strong>{service.shortTitle}</strong>
              <span>Assessment, recommendation, installation plan</span>
            </aside>
          </div>
        </div>
      </section>

      <section className="seo-section">
        <div className="site-shell seo-two-column">
          <article>
            <h2>Common risks we look for</h2>
            <ServiceChecklist items={service.risks} />
          </article>
          <article>
            <h2>How CasaMia can help</h2>
            <ServiceChecklist items={service.improvements} />
          </article>
        </div>
      </section>

      <section className="seo-section bg-pale-blue">
        <div className="site-shell seo-process-strip">
          <article>
            <span>1</span>
            <h3>Visit</h3>
            <p>We inspect the home and understand the person's mobility needs.</p>
          </article>
          <article>
            <span>2</span>
            <h3>Report</h3>
            <p>You receive clear priorities and recommendations for the room.</p>
          </article>
          <article>
            <span>3</span>
            <h3>Proposal</h3>
            <p>Where works are needed, CasaMia prepares a practical next-step proposal.</p>
          </article>
        </div>
      </section>
    </>
  )
}
