import { ArrowLeft, ArrowRight, ClipboardCheck, Home, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { ServiceChecklist } from '../components/ServiceChecklist'
import { ServiceIcon } from '../components/ServiceIcon'
import { serviceVisuals } from '../constants/serviceVisuals'
import { primaryServices } from '../constants/siteContent'

const detailSteps = [
  {
    icon: ClipboardCheck,
    title: 'In-home review',
    body: 'We look at the room, the person using it, and the daily movement that creates risk.',
  },
  {
    icon: ShieldCheck,
    title: 'Clear priorities',
    body: 'You see which risks matter most and which improvements are practical for the home.',
  },
  {
    icon: Home,
    title: 'Practical next step',
    body: 'If work is needed, CasaMia prepares a proposal around products, installation, and handover.',
  },
]

export function ServiceDetailPage() {
  const { serviceId } = useParams()
  const service = primaryServices.find((item) => item.id === serviceId)

  if (!service) {
    return <Navigate to="/services" replace />
  }

  const visual = serviceVisuals[service.id] ?? serviceVisuals['bathroom-safety']
  const relatedServices = primaryServices.filter((item) => item.id !== service.id).slice(0, 3)

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

      <section className="service-detail-hero">
        <div className="site-shell">
          <Link className="service-detail-back" to="/services">
            <ArrowLeft size={17} aria-hidden="true" />
            All services
          </Link>

          <div className="service-detail-hero-grid">
            <div className="service-detail-copy">
              <span className="eyebrow">{visual.badge}</span>
              <h1>{service.title}</h1>
              <p>{service.intro}</p>
              <div className="service-detail-actions">
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

            <aside className="service-detail-media-card">
              <SafeImage
                src={visual.image}
                alt={service.shortTitle}
                className="service-detail-media"
                imgClassName="h-full w-full object-cover"
              />
              <div className="service-detail-media-caption">
                <span>
                  <ServiceIcon icon={service.icon} size={22} />
                </span>
                <div>
                  <strong>{service.shortTitle}</strong>
                  <p>{visual.note}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="service-detail-section bg-white">
        <div className="site-shell">
          <div className="service-detail-heading">
            <p className="eyebrow">What we check</p>
            <h2>Focused on the risks that make daily life harder.</h2>
            <p>
              CasaMia separates visible hazards from practical improvements, so families
              understand what matters before buying products or starting work.
            </p>
          </div>

          <div className="service-detail-check-grid">
            <article>
              <h3>Common risks we look for</h3>
              <ServiceChecklist items={service.risks} />
            </article>
            <article>
              <h3>How CasaMia can help</h3>
              <ServiceChecklist items={service.improvements} />
            </article>
          </div>
        </div>
      </section>

      <section className="service-detail-section bg-pale-blue">
        <div className="site-shell">
          <div className="service-detail-heading is-centered">
            <p className="eyebrow">How the service works</p>
            <h2>From concern to a clear plan.</h2>
          </div>

          <div className="service-detail-step-grid">
            {detailSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <article key={step.title}>
                  <span>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <small>{String(index + 1).padStart(2, '0')}</small>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="service-detail-section bg-white">
        <div className="site-shell">
          <div className="service-detail-related-header">
            <div>
              <p className="eyebrow">Related services</p>
              <h2>Other areas often worth checking.</h2>
            </div>
            <Link to="/services">
              View all services
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div className="service-detail-related-grid">
            {relatedServices.map((item) => {
              const relatedVisual = serviceVisuals[item.id] ?? visual

              return (
                <Link key={item.id} to={item.path}>
                  <SafeImage
                    src={relatedVisual.image}
                    alt={item.shortTitle}
                    className="service-detail-related-image"
                    imgClassName="h-full w-full object-cover"
                  />
                  <div>
                    <span>{relatedVisual.badge}</span>
                    <h3>{item.shortTitle}</h3>
                    <p>{item.intro}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="service-detail-final">
        <div className="site-shell">
          <div>
            <p className="eyebrow">Ready for clarity?</p>
            <h2>Start with a room-by-room visit.</h2>
            <p>
              CasaMia can review this service area alongside the rest of the home, then
              recommend what should happen first.
            </p>
          </div>
          <Link className="btn btn-green" to={`/home-safety-assessment?plan=${service.ctaPlan}`}>
            Book In-Home Visit
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
