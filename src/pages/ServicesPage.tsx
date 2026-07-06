import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { ServiceIcon } from '../components/ServiceIcon'
import { primaryServices, serviceHubHighlights } from '../constants/siteContent'

export function ServicesPage() {
  return (
    <>
      <SEO
        title="Senior Home Safety Services in Spain"
        description="Explore CasaMia home safety services for seniors, including bathroom safety, stair safety, entrance accessibility, kitchen safety, and smart home safety."
        path="/services"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Senior home safety adaptations',
          provider: {
            '@type': 'Organization',
            name: 'CasaMia',
          },
          areaServed: 'Spain',
          serviceType: 'Home safety assessment and aging-in-place adaptations',
        }}
      />

      <section className="seo-hero bg-light-blue">
        <div className="site-shell">
          <div className="seo-hero-copy">
            <h1>Home safety services for aging in place</h1>
            <p>
              CasaMia helps families make everyday rooms safer, easier to use, and better
              prepared for independent living at home.
            </p>
            <div className="seo-hero-actions">
              <Link className="btn btn-green" to="/home-safety-assessment">
                Book In-Home Visit
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/plans">
                Compare Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="seo-section">
        <div className="site-shell">
          <div className="seo-section-heading">
            <h2>Start with the room that worries you most</h2>
            <p>
              Each service page explains the risks we look for, the improvements we can
              recommend, and the next step for families.
            </p>
          </div>

          <div className="seo-card-grid">
            {primaryServices.map((service) => (
              <Link className="seo-service-card" key={service.id} to={service.path}>
                <span>
                  <ServiceIcon icon={service.icon} size={26} />
                </span>
                <h3>{service.shortTitle}</h3>
                <p>{service.description}</p>
                <strong>
                  Learn more
                  <ArrowRight size={17} aria-hidden="true" />
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-section bg-pale-blue">
        <div className="site-shell">
          <div className="seo-highlight-grid">
            {serviceHubHighlights.map((item) => (
              <article key={item.title}>
                <ServiceIcon icon={item.icon} size={24} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-final-cta">
        <div className="site-shell">
          <div>
            <h2>Not sure where to start?</h2>
            <p>
              Book a professional in-home visit and receive practical recommendations for
              your home.
            </p>
          </div>
          <Link className="btn btn-green" to="/home-safety-assessment">
            Book Visit
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}

export function ServiceChecklist({ items }: { items: string[] }) {
  return (
    <ul className="seo-check-list">
      {items.map((item) => (
        <li key={item}>
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
