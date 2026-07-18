import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { primaryServices } from '../constants/siteContent'
import { ServiceIcon } from './ServiceIcon'

export function ServicesPreview() {
  return (
    <section className="services-preview-section section-pad bg-white">
      <div className="site-shell">
        <div className="services-preview-heading">
          <span className="eyebrow">Room-by-room safety</span>
          <h2 className="display-title">
            Make the rooms used every day safer, easier, and calmer.
          </h2>
          <p>
            CasaMia focuses on practical changes families can understand: safer bathrooms,
            stairs, entrances, bedrooms, kitchens, and smart safety where it genuinely helps.
          </p>
        </div>

        <div className="services-preview-grid">
          {primaryServices.map((service) => (
            <Link className="services-preview-card" key={service.id} to={service.path}>
              <ServiceIcon icon={service.icon} size={25} />
              <h3>{service.shortTitle}</h3>
              <p>{service.intro}</p>
              <span>
                View service
                <ArrowRight size={17} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        <div className="services-preview-cta">
          <div>
            <CheckCircle2 size={24} aria-hidden="true" />
            <p>
              Not sure which room to start with? The EUR 99 in-home visit identifies
              the priorities before any works are proposed.
            </p>
          </div>
          <Link className="btn btn-green" to="/home-safety-assessment">
            Book Visit
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
