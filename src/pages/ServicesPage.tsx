import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Home,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { ServiceIcon } from '../components/ServiceIcon'
import { serviceVisuals } from '../constants/serviceVisuals'
import { primaryServices, serviceHubHighlights } from '../constants/siteContent'

const pathwayItems = [
  {
    icon: ClipboardCheck,
    title: 'Assess first',
    body: 'CasaMia reviews visible risks, routines, mobility needs, and what the home can realistically support.',
  },
  {
    icon: ShieldCheck,
    title: 'Prioritise clearly',
    body: 'You see what should be handled first, what can wait, and which improvements actually fit the family.',
  },
  {
    icon: Home,
    title: 'Adapt with confidence',
    body: 'Where work is needed, CasaMia coordinates practical products, installers, setup, and handover.',
  },
]

export function ServicesPage() {
  const featuredServices = primaryServices.slice(0, 3)
  const supportServices = primaryServices.slice(3)

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

      <section className="services-hub-hero">
        <div className="services-hub-hero-grid site-shell">
          <div className="services-hub-copy">
            <span className="eyebrow">CasaMia services</span>
            <h1>Make the rooms used every day safer, easier, and calmer.</h1>
            <p>
              Choose the area that worries you most, or start with a professional
              in-home assessment and let CasaMia prioritise the right improvements.
            </p>
            <div className="services-hub-actions">
              <Link className="btn btn-green" to="/home-safety-assessment">
                Book In-Home Visit
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/tools/safety-report">
                Start Free Safety Report
              </Link>
            </div>
          </div>

          <div className="services-hub-visual" aria-label="CasaMia service areas">
            {featuredServices.map((service) => {
              const visual = serviceVisuals[service.id]

              return (
                <Link className="services-hub-photo" key={service.id} to={service.path}>
                  <SafeImage
                    src={visual.image}
                    alt={service.shortTitle}
                    className="services-hub-photo-image"
                    imgClassName="h-full w-full object-cover"
                  />
                  <span>{service.shortTitle}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="services-hub-section bg-white">
        <div className="site-shell">
          <div className="services-hub-heading">
            <p className="eyebrow">Service areas</p>
            <h2>Start where the risk, worry, or daily friction is highest.</h2>
            <p>
              Each service is grounded in a real room or routine, with clear risks,
              practical improvements, and a next step that does not require guessing.
            </p>
          </div>

          <div className="services-hub-grid">
            {primaryServices.map((service) => {
              const visual = serviceVisuals[service.id]

              return (
                <Link className="services-hub-card" key={service.id} to={service.path}>
                  <SafeImage
                    src={visual.image}
                    alt={service.shortTitle}
                    className="services-hub-card-image"
                    imgClassName="h-full w-full object-cover"
                  />
                  <div className="services-hub-card-body">
                    <span className="services-hub-badge">{visual.badge}</span>
                    <div className="services-hub-card-title">
                      <ServiceIcon icon={service.icon} size={25} />
                      <h3>{service.shortTitle}</h3>
                    </div>
                    <p>{service.intro}</p>
                    <ul>
                      {service.improvements.slice(0, 2).map((item) => (
                        <li key={item}>
                          <CheckCircle2 size={16} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <strong>
                      {visual.note}
                      <ArrowRight size={17} aria-hidden="true" />
                    </strong>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="services-hub-section bg-pale-blue">
        <div className="site-shell">
          <div className="services-pathway">
            <div>
              <p className="eyebrow">How CasaMia helps</p>
              <h2>One service flow, adapted to the home.</h2>
              <p>
                A safer home usually needs more than a product list. CasaMia connects
                assessment, practical recommendations, installation planning, and
                connected support where it makes sense.
              </p>
            </div>

            <div className="services-pathway-grid">
              {pathwayItems.map((item) => {
                const Icon = item.icon

                return (
                  <article key={item.title}>
                    <span>
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="services-hub-section bg-white">
        <div className="site-shell">
          <div className="services-hub-heading is-compact">
            <p className="eyebrow">What stays consistent</p>
            <h2>Clear advice before work begins.</h2>
          </div>

          <div className="services-highlight-grid">
            {serviceHubHighlights.map((item) => (
              <article key={item.title}>
                <span>
                  <ServiceIcon icon={item.icon} size={24} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <div className="services-support-band">
            <div>
              <Sparkles size={24} aria-hidden="true" />
              <h2>Need kitchen or smart safety support too?</h2>
              <p>
                CasaMia also reviews daily routines, appliance risks, connected
                sensors, VYVA assistance, and family alerts as part of the broader
                home safety picture.
              </p>
            </div>
            <div className="services-support-links">
              {supportServices.map((service) => (
                <Link key={service.id} to={service.path}>
                  <ServiceIcon icon={service.icon} size={20} />
                  {service.shortTitle}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="services-hub-final">
        <div className="site-shell">
          <div>
            <p className="eyebrow">Not sure where to start?</p>
            <h2>Start with the home, not the product.</h2>
            <p>
              Book a professional in-home visit and receive practical recommendations
              for the rooms and routines that matter most.
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
