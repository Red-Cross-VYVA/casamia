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
import {
  type ServiceIconId,
  primaryServices,
  serviceHubHighlights,
} from '../constants/siteContent'

type SolutionGalleryCard = {
  title: string
  badge: string
  body: string
  icon: ServiceIconId
  image: string
  path: string
  points: string[]
}

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

const solutionGalleryCards: SolutionGalleryCard[] = [
  {
    title: 'Grab bars and support points',
    badge: 'Support where balance matters',
    body: 'Fixed support in bathrooms, corridors and transfer points so standing, turning and stepping feel safer.',
    icon: 'shield',
    image: '/images/service-gallery/01-grab-bars-and-support-points.jpg',
    path: '/services/bathroom-safety',
    points: ['Transfers', 'Standing support'],
  },
  {
    title: 'Anti-slip safety improvements',
    badge: 'Reduce surface risk',
    body: 'Practical grip improvements for wet floors, steps and daily routes where slips are most likely.',
    icon: 'check',
    image: '/images/service-gallery/02-anti-slip-safety-improvements.jpg',
    path: '/services/bathroom-safety',
    points: ['Wet areas', 'Trip reduction'],
  },
  {
    title: 'Stairway and hallway support',
    badge: 'Safer daily routes',
    body: 'Continuous handrails, contrast and lighting for the routes used every day, not only the obvious stairs.',
    icon: 'stairs',
    image: '/images/service-gallery/03-stairway-and-hallway-support.jpg',
    path: '/services/stair-safety',
    points: ['Handrails', 'Step visibility'],
  },
  {
    title: 'Bathroom and kitchen adaptations',
    badge: 'High-use rooms',
    body: 'Targeted changes for washing, toileting, cooking and reach where everyday routines create pressure.',
    icon: 'bath',
    image: '/images/service-gallery/04-bathroom-and-kitchen-adaptations.jpg',
    path: '/services/kitchen-safety',
    points: ['Access', 'Reach'],
  },
  {
    title: 'Entryway and threshold support',
    badge: 'Arrive and leave safely',
    body: 'Lower trip points, improve lighting and add support where people enter, exit and receive visitors.',
    icon: 'door',
    image: '/images/service-gallery/05-entryway-and-threshold-support.jpg',
    path: '/services/entrance-accessibility',
    points: ['Thresholds', 'Outdoor support'],
  },
  {
    title: 'Furniture and movement flow',
    badge: 'Clearer movement',
    body: 'Reposition furniture, rugs and everyday items so movement through the home is less awkward.',
    icon: 'home',
    image: '/images/service-gallery/06-furniture-and-movement-flow-optimisation.jpg',
    path: '/services/bedroom-safety',
    points: ['Clear paths', 'Daily routines'],
  },
  {
    title: 'Smart access devices',
    badge: 'Trusted access',
    body: 'Simple access support for doors, locks, family visits and emergency response without adding confusion.',
    icon: 'smartphone',
    image: '/images/service-gallery/07-smart-access-devices.jpg',
    path: '/services/smart-home-safety',
    points: ['Doors', 'Family access'],
  },
  {
    title: 'Emergency response device',
    badge: 'Help within reach',
    body: 'A clear way to call for help from the rooms and routines where risk is highest.',
    icon: 'shield',
    image: '/images/service-gallery/08-emergency-response-device.jpg',
    path: '/services/smart-home-safety',
    points: ['Emergency call', 'Peace of mind'],
  },
  {
    title: 'Fall detection sensors',
    badge: 'Discreet awareness',
    body: 'Monitoring that helps family notice a fall or unusual routine without turning the home into a clinic.',
    icon: 'light',
    image: '/images/service-gallery/09-fall-detection-sensors.jpg',
    path: '/services/smart-home-safety',
    points: ['Fall alerts', 'Routine changes'],
  },
  {
    title: 'Health and vitals monitoring',
    badge: 'Wellbeing signals',
    body: 'Simple monitoring options that add useful context for family support where appropriate.',
    icon: 'smartphone',
    image: '/images/service-gallery/10-health-and-vitals-monitoring.jpg',
    path: '/services/smart-home-safety',
    points: ['Vitals', 'Family updates'],
  },
  {
    title: 'Voice controls and smart routines',
    badge: 'Less reaching',
    body: 'Voice, lighting and routines that reduce unnecessary movement, especially at night or during fatigue.',
    icon: 'light',
    image: '/images/service-gallery/11-voice-controls-and-smart-routines.jpg',
    path: '/services/smart-home-safety',
    points: ['Voice control', 'Night routines'],
  },
  {
    title: 'Smart setup and user training',
    badge: 'Clear handover',
    body: 'Devices are configured, explained and handed over so the resident and family know what to expect.',
    icon: 'book',
    image: '/images/service-gallery/12-smart-setup-and-user-training.jpg',
    path: '/services/smart-home-safety',
    points: ['Setup', 'Training'],
  },
]

export function ServicesPage() {
  const featuredServices = primaryServices.slice(0, 3)
  const supportServices = primaryServices.slice(3)

  return (
    <>
      <SEO
        title="CasaMia Safety Services for Safer Independent Living"
        description="Explore CasaMia home adaptations and safety services for bathrooms, stairs, entrances, kitchens, bedrooms, smart safety and family reassurance."
        path="/services"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'CasaMia home safety services',
          provider: {
            '@type': 'Organization',
            name: 'CasaMia',
          },
          areaServed: 'Spain',
          serviceType: 'Home adaptations, smart safety, health monitoring and aging-in-place services',
        }}
      />

      <section className="services-hub-hero">
        <div className="services-hub-hero-grid site-shell">
          <div className="services-hub-copy">
            <span className="eyebrow">Safety services</span>
            <h1>Choose the improvements that make daily life safer.</h1>
            <p>
              CasaMia helps families select practical home adaptations, smart safety
              and support services around the resident, the home and the routine.
            </p>
            <div className="services-hub-actions">
              <Link className="btn btn-green" to="/configure">
                Build My Safer Home
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/home-safety-assessment#self-inspection-tool">
                Start Free Report
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
            <p className="eyebrow">Home adaptations</p>
            <h2>Add only what the resident and home actually need.</h2>
            <p>
              Each service is easier to choose when the risks, routines and support
              gaps are clear. Start with a room, then build the right CasaMia plan.
            </p>
          </div>

          <div className="services-hub-grid services-solution-grid">
            {solutionGalleryCards.map((service) => {
              return (
                <Link
                  className="services-hub-card services-solution-card"
                  key={service.title}
                  to={service.path}
                >
                  <SafeImage
                    src={service.image}
                    alt={service.title}
                    className="services-hub-card-image"
                    imgClassName="h-full w-full object-cover"
                  />
                  <div className="services-hub-card-body">
                    <span className="services-hub-badge">{service.badge}</span>
                    <div className="services-hub-card-title">
                      <ServiceIcon icon={service.icon} size={25} />
                      <h3>{service.title}</h3>
                    </div>
                    <p>{service.body}</p>
                    <ul>
                      {service.points.map((item) => (
                        <li key={item}>
                          <CheckCircle2 size={16} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <strong>
                      View related service
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
              <p className="eyebrow">How services fit</p>
              <h2>Clarity first. Improvements second.</h2>
              <p>
                CasaMia does not ask families to guess. We identify priorities, then
                recommend the services that match the resident, routine and budget.
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
            <h2>Useful technology, not technology for its own sake.</h2>
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
              <h2>Build one clear CasaMia plan.</h2>
              <p>
                Physical adaptations, smart safety and family reassurance work best
                when they are chosen together around real daily routines.
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
            <p className="eyebrow">Not sure what to add?</p>
            <h2>Start with the room that worries you most.</h2>
            <p>
              Answer a few guided questions and CasaMia will recommend practical
              improvements before you request a quote or reserve a visit.
            </p>
          </div>
          <Link className="btn btn-green" to="/configure">
            Build My Safer Home
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
