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

type ServiceDetailContent = {
  benefitsTitle: string
  benefitsIntro: string
  benefits: Array<{
    title: string
    body: string
  }>
  includedTitle: string
  includedIntro: string
  included: string[]
  reassuranceTitle: string
  reassuranceBody: string
  reassurancePoints: string[]
  finalTitle: string
  finalBody: string
}

const defaultServiceDetailContent: ServiceDetailContent = {
  benefitsTitle: 'Make the space easier to use every day.',
  benefitsIntro:
    'CasaMia focuses on practical outcomes: fewer risky movements, clearer support, better visibility, and a home that feels easier for the person living there.',
  benefits: [
    {
      title: 'Less daily hesitation',
      body: 'Reduce the small moments where someone pauses, reaches, twists, or feels unsure about moving through the room.',
    },
    {
      title: 'Clearer support',
      body: 'Place support where it is actually useful for the person, not just where a product happens to fit.',
    },
    {
      title: 'More family confidence',
      body: 'Give relatives a clearer view of what has been checked, what matters most, and what can be improved first.',
    },
  ],
  includedTitle: 'A practical plan, not a generic product list.',
  includedIntro:
    'The visit connects the room layout, daily routine, mobility profile, and installation options before recommending changes.',
  included: [
    'Room and routine review',
    'Risk priorities explained in plain language',
    'Product and installation recommendations where useful',
    'Clear next step for urgent, useful, and optional improvements',
  ],
  reassuranceTitle: 'Designed around the person using the room.',
  reassuranceBody:
    'The goal is not to make the home look clinical. It is to make everyday movement safer while keeping the home comfortable and familiar.',
  reassurancePoints: ['Practical for the existing home', 'Explained for the family', 'Focused on prevention before incidents happen'],
  finalTitle: 'Start with the room that worries you most.',
  finalBody:
    'CasaMia can review this service area alongside the rest of the home, then recommend what should happen first.',
}

const serviceDetailContent: Record<string, ServiceDetailContent> = {
  'bathroom-safety': {
    benefitsTitle: 'Turn a high-risk room into a safer daily routine.',
    benefitsIntro:
      'Bathroom safety is about more than adding a rail. CasaMia looks at transfers, wet surfaces, reach, lighting, and the way the person actually bathes, showers, and uses the toilet.',
    benefits: [
      {
        title: 'Safer transfers',
        body: 'Support entering the shower, standing, sitting, and using the toilet without relying on towel rails or furniture.',
      },
      {
        title: 'Lower slip risk',
        body: 'Improve traction and route clarity where water, mats, thresholds, and tight layouts create avoidable risk.',
      },
      {
        title: 'More privacy and independence',
        body: 'Help the person keep bathroom routines manageable with less physical help from family or caregivers.',
      },
    ],
    includedTitle: 'What a bathroom safety plan can include.',
    includedIntro:
      'CasaMia prioritises the improvements that make the biggest difference for bathing, toileting, and moving safely in a wet room.',
    included: [
      'Grab bar and support-point placement',
      'Anti-slip surfaces, mats, or flooring guidance',
      'Safer shower entry and toilet transfer recommendations',
      'Lighting, reach, and clutter review',
      'Optional shower seat, raised toilet, or access changes where useful',
    ],
    reassuranceTitle: 'Better support without making the bathroom feel institutional.',
    reassuranceBody:
      'We recommend discreet, practical changes that fit the room and the person using it, then explain what is urgent and what can wait.',
    reassurancePoints: ['Focus on wet-room fall risk', 'Recommendations matched to mobility', 'Installation guidance before buying products'],
    finalTitle: 'Make the bathroom safer before the next near miss.',
    finalBody:
      'Book a visit and CasaMia will review transfers, surfaces, support points, and practical improvements room by room.',
  },
  'stair-safety': {
    benefitsTitle: 'Make every step easier to read and easier to trust.',
    benefitsIntro:
      'Stair safety depends on continuous support, visible edges, predictable lighting, and reducing the need to rush or carry too much.',
    benefits: [
      {
        title: 'More stable movement',
        body: 'Improve hand support from the first step to the last so the person is not left unsupported mid-route.',
      },
      {
        title: 'Better visibility',
        body: 'Use contrast and lighting to make step edges, landings, and turns easier to understand at a glance.',
      },
      {
        title: 'Less fear of using the home',
        body: 'Keep important rooms accessible by making stairs and hallways feel less risky during daily routines.',
      },
    ],
    includedTitle: 'What a stair safety plan can include.',
    includedIntro:
      'CasaMia checks the whole movement route, not just the staircase itself.',
    included: [
      'Continuous handrail and grab-point review',
      'Step-edge contrast and anti-slip guidance',
      'Motion lighting for stairs, halls, and landings',
      'Trip hazard and clutter review',
      'Recommendations for safer carrying and daily movement routines',
    ],
    reassuranceTitle: 'Small changes can protect an important route.',
    reassuranceBody:
      'When stairs feel unsafe, whole parts of the home can become harder to use. CasaMia focuses on keeping movement routes clear, visible, and supported.',
    reassurancePoints: ['Support along the full route', 'Clearer step edges', 'Lighting where hesitation happens'],
    finalTitle: 'Make stairs feel safer before they become avoided.',
    finalBody:
      'Book a visit and CasaMia will review rails, lighting, contrast, and the full route used every day.',
  },
  'entrance-accessibility': {
    benefitsTitle: 'Make arriving and leaving the home calmer.',
    benefitsIntro:
      'Entrance safety shapes independence. CasaMia checks the path from outside to inside, including steps, thresholds, lighting, support, visitors, and access routines.',
    benefits: [
      {
        title: 'Easier daily access',
        body: 'Reduce awkward thresholds, steps, and unsupported moments when entering or leaving the home.',
      },
      {
        title: 'Safer visitor routines',
        body: 'Make it easier to open the door, receive deliveries, or speak with visitors without rushing.',
      },
      {
        title: 'More confidence outside the home',
        body: 'Support independence by making the first and last part of every outing more predictable.',
      },
    ],
    includedTitle: 'What an entrance safety plan can include.',
    includedIntro:
      'CasaMia reviews the entrance as a route, from exterior lighting through the doorway and into the first safe standing area.',
    included: [
      'Threshold, step, and ramp suitability review',
      'Exterior and doorway lighting guidance',
      'Support-point and handrail recommendations',
      'Door access, visitor, and key routine review',
      'Smart doorbell or access control guidance where useful',
    ],
    reassuranceTitle: 'The entrance should support independence, not create stress.',
    reassuranceBody:
      'We focus on practical access improvements that fit the home, the resident, and the way family or caregivers visit.',
    reassurancePoints: ['Safer thresholds', 'Better doorway support', 'Clearer access routines'],
    finalTitle: 'Make the entrance easier to cross every day.',
    finalBody:
      'Book a visit and CasaMia will review thresholds, lighting, support, and access options together.',
  },
  'kitchen-safety': {
    benefitsTitle: 'Keep everyday routines manageable and safer.',
    benefitsIntro:
      'Kitchen safety is about reach, movement, lighting, appliance routines, and reducing fatigue while preparing food or drinks.',
    benefits: [
      {
        title: 'Less reaching and bending',
        body: 'Move daily items into safer zones so the person does not need to stretch, climb, or bend unnecessarily.',
      },
      {
        title: 'Clearer work areas',
        body: 'Improve circulation and reduce clutter around the places where spills, heat, and carrying happen.',
      },
      {
        title: 'Safer appliance routines',
        body: 'Add reminders, alerts, or setup changes where cooking, water, or electricity creates risk.',
      },
    ],
    includedTitle: 'What a kitchen safety plan can include.',
    includedIntro:
      'CasaMia reviews how the kitchen is used, which tasks are tiring, and which changes make the routine easier.',
    included: [
      'Storage, reach, and worktop review',
      'Task lighting and night-route guidance',
      'Flooring, mat, and spill-risk review',
      'Appliance safety and shutoff recommendations',
      'Leak, smoke, or reminder technology where useful',
    ],
    reassuranceTitle: 'A safer kitchen should still feel like the resident’s kitchen.',
    reassuranceBody:
      'We focus on changes that support familiar routines rather than forcing the person to relearn how the room works.',
    reassurancePoints: ['Daily items within reach', 'Clearer routes', 'Support for cooking and hydration routines'],
    finalTitle: 'Make kitchen routines safer without overcomplicating them.',
    finalBody:
      'Book a visit and CasaMia will review storage, lighting, appliances, and movement through the kitchen.',
  },
  'bedroom-safety': {
    benefitsTitle: 'Make nights calmer, safer, and easier to manage.',
    benefitsIntro:
      'Bedroom safety matters because many risky moments happen when someone is tired, moving in low light, or trying to reach the bathroom quickly. CasaMia designs the room around safer bed access, clearer night routes, and help within reach.',
    benefits: [
      {
        title: 'Easier bed transfers',
        body: 'Support getting in and out of bed with the right height, clearance, bedside support, and transfer aids where needed.',
      },
      {
        title: 'Safer night movement',
        body: 'Reduce disorientation with motion lighting, clear floor paths, and safer routes from bed to bathroom or hallway.',
      },
      {
        title: 'Help within reach',
        body: 'Position emergency buttons, phone access, wearable support, or connected alerts so urgent help is not across the room.',
      },
    ],
    includedTitle: 'What a bedroom safety plan can include.',
    includedIntro:
      'CasaMia reviews the room as a night-time routine: bed access, lighting, furniture, flooring, medication reach, and the path to the next room.',
    included: [
      'Bed height, transfer, and bedside support review',
      'Motion night lighting from bed to door or bathroom',
      'Clearance around furniture, rugs, cables, and walking aids',
      'Bedside emergency button, phone, or wearable alert placement',
      'Medication, water, glasses, and daily essentials within safer reach',
      'Optional smart sensor or VYVA alert support where appropriate',
    ],
    reassuranceTitle: 'Designed for independence and family peace of mind.',
    reassuranceBody:
      'The bedroom should help someone rest, move, and call for help without turning the room into a clinical space. CasaMia keeps the focus on comfort, dignity, and practical prevention.',
    reassurancePoints: [
      'Less risk during night bathroom trips',
      'More confidence getting in and out of bed',
      'Clearer emergency access for family or caregivers',
    ],
    finalTitle: 'Make the bedroom safer before night routines become stressful.',
    finalBody:
      'Book a visit and CasaMia will review bed transfers, lighting, floor clearance, and emergency reach points.',
  },
  'smart-home-safety': {
    benefitsTitle: 'Use technology only where it makes daily life safer.',
    benefitsIntro:
      'Smart safety should not feel like a complicated smart-home project. CasaMia focuses on useful alerts, lighting, emergency support, and family reassurance.',
    benefits: [
      {
        title: 'Earlier awareness',
        body: 'Sensors can help notice changes in routines, leaks, smoke, doors, or night movement before a small issue becomes urgent.',
      },
      {
        title: 'Faster help',
        body: 'Emergency buttons, wearable support, and alerts make it easier to call family or caregivers quickly.',
      },
      {
        title: 'Less daily friction',
        body: 'Voice control, motion lighting, and simple automation can reduce rushing, bending, and unnecessary movement.',
      },
    ],
    includedTitle: 'What a smart safety plan can include.',
    includedIntro:
      'CasaMia checks connectivity and recommends only devices that match the person, the home, and the family’s comfort level.',
    included: [
      'Motion lighting and night-route setup',
      'Emergency buttons or wearable alert guidance',
      'Leak, smoke, door, and movement sensor recommendations',
      'VYVA app and caregiver dashboard setup where included',
      'Family alert preferences and privacy settings',
      'Simple handover for the older adult and family',
    ],
    reassuranceTitle: 'No complicated gimmicks and no cameras by default.',
    reassuranceBody:
      'The aim is connected reassurance: useful alerts, simple controls, and privacy-aware setup that the family understands.',
    reassurancePoints: ['Connectivity checked first', 'Family alerts agreed in advance', 'Simple setup and handover'],
    finalTitle: 'Add connected safety where it genuinely helps.',
    finalBody:
      'Book a visit and CasaMia will review the home, connectivity, and the most useful smart safety options.',
  },
}

export function ServiceDetailPage() {
  const { serviceId } = useParams()
  const service = primaryServices.find((item) => item.id === serviceId)

  if (!service) {
    return <Navigate to="/services" replace />
  }

  const visual = serviceVisuals[service.id] ?? serviceVisuals['bathroom-safety']
  const detail = serviceDetailContent[service.id] ?? defaultServiceDetailContent
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
          <div className="service-detail-heading">
            <p className="eyebrow">Why it helps</p>
            <h2>{detail.benefitsTitle}</h2>
            <p>{detail.benefitsIntro}</p>
          </div>

          <div className="service-detail-benefit-grid">
            {detail.benefits.map((benefit, index) => (
              <article key={benefit.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="service-detail-section bg-white">
        <div className="site-shell">
          <div className="service-detail-inclusion-panel">
            <div className="service-detail-inclusion-copy">
              <p className="eyebrow">What CasaMia can include</p>
              <h2>{detail.includedTitle}</h2>
              <p>{detail.includedIntro}</p>
            </div>
            <div className="service-detail-inclusion-list">
              <ServiceChecklist items={detail.included} />
            </div>
          </div>

          <div className="service-detail-reassurance-card">
            <div>
              <p className="eyebrow">User benefit</p>
              <h3>{detail.reassuranceTitle}</h3>
              <p>{detail.reassuranceBody}</p>
            </div>
            <ServiceChecklist items={detail.reassurancePoints} />
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
            <h2>{detail.finalTitle}</h2>
            <p>{detail.finalBody}</p>
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
