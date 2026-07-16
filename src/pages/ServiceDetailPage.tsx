import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  CheckCircle2,
  ClipboardCheck,
  DoorOpen,
  Droplets,
  Footprints,
  Home,
  Lightbulb,
  PackageCheck,
  PlugZap,
  ShieldCheck,
  Smartphone,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { ServiceChecklist } from '../components/ServiceChecklist'
import { ServiceIcon } from '../components/ServiceIcon'
import { serviceVisuals } from '../constants/serviceVisuals'
import { primaryServices } from '../constants/siteContent'
import { formatCurrency, formatServicePrice, useServicesByRoom } from '../services/serviceCatalogue'
import type { CasaMiaService, ServiceRoom } from '../types/serviceCatalogue'

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

type KitchenVisual =
  | 'mat'
  | 'light'
  | 'voice'
  | 'plug'
  | 'leak'
  | 'gas'
  | 'shelf'
  | 'stove'
  | 'faucet'
  | 'handover'

const kitchenServicePresentation: Record<string, { icon: LucideIcon; visual: KitchenVisual }> = {
  'kitchen-prep-mats': { icon: ShieldCheck, visual: 'mat' },
  'kitchen-easy-grip-tools': { icon: Utensils, visual: 'voice' },
  'kitchen-lightweight-cookware': { icon: Utensils, visual: 'handover' },
  'kitchen-anti-fatigue-mat': { icon: ShieldCheck, visual: 'mat' },
  'kitchen-worktop-lighting': { icon: Lightbulb, visual: 'light' },
  'kitchen-voice-lighting-timers': { icon: Lightbulb, visual: 'light' },
  'kitchen-smart-plugs': { icon: PlugZap, visual: 'plug' },
  'kitchen-water-leak-sensor': { icon: Droplets, visual: 'leak' },
  'kitchen-gas-co-sensor': { icon: PlugZap, visual: 'gas' },
  'kitchen-pull-down-shelf': { icon: PackageCheck, visual: 'shelf' },
  'kitchen-stove-shutoff': { icon: ShieldCheck, visual: 'stove' },
  'kitchen-touchless-faucet': { icon: Droplets, visual: 'faucet' },
}

const roomServicePresentation: Record<ServiceRoom, { icon: LucideIcon; visual: KitchenVisual }> = {
  bathroom: { icon: Bath, visual: 'faucet' },
  bedroom: { icon: BedDouble, visual: 'light' },
  connected: { icon: Smartphone, visual: 'plug' },
  entrance: { icon: DoorOpen, visual: 'mat' },
  kitchen: { icon: Utensils, visual: 'handover' },
  movement: { icon: Footprints, visual: 'mat' },
}

const serviceRoomMap: Record<string, ServiceRoom> = {
  'bathroom-safety': 'bathroom',
  'stair-safety': 'movement',
  'entrance-accessibility': 'entrance',
  'kitchen-safety': 'kitchen',
  'bedroom-safety': 'bedroom',
  'smart-home-safety': 'connected',
}

const roomServiceCopy: Record<ServiceRoom, { eyebrow: string; title: string; intro: string }> = {
  bathroom: {
    eyebrow: 'Bathroom improvements',
    title: 'Choose the bathroom support that fits the person.',
    intro: 'Rails, seats, toilet support, safer flooring and alerts can be added one by one after the home is reviewed.',
  },
  bedroom: {
    eyebrow: 'Bedroom improvements',
    title: 'Make nights and transfers calmer.',
    intro: 'Focus on the moments that matter: getting out of bed, finding the route, calling for help and moving without rushing.',
  },
  connected: {
    eyebrow: 'Connected safety',
    title: 'Add reassurance without making the home complicated.',
    intro: 'Simple sensors, alerts and controls help families stay informed while keeping the setup easy to live with.',
  },
  entrance: {
    eyebrow: 'Entrance improvements',
    title: 'Make arrival and leaving the home safer.',
    intro: 'CasaMia can combine lighting, threshold support, rails and ramp options around the entrance people actually use.',
  },
  kitchen: {
    eyebrow: 'Kitchen improvements',
    title: 'Choose the improvements that fit.',
    intro: 'Pick useful services one by one. CasaMia confirms measurements and compatibility before work starts.',
  },
  movement: {
    eyebrow: 'Movement improvements',
    title: 'Support the routes used every day.',
    intro: 'Handrails, contrast, anti-slip treatments and lighting can be matched to stairs, corridors and daily movement paths.',
  },
}

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
    benefitsTitle: 'Make the kitchen safer, easier and less tiring.',
    benefitsIntro:
      'CasaMia reviews how the kitchen is used, then recommends only the improvements that reduce daily risk or effort.',
    benefits: [
      {
        title: 'Less effort',
        body: 'Daily items, tools, and lighting are arranged so cooking requires less reaching, bending, and lifting.',
      },
      {
        title: 'Fewer risky moments',
        body: 'We reduce common triggers: wet floors, trailing cables, awkward turns, poor light, and cluttered worktops.',
      },
      {
        title: 'More reassurance',
        body: 'Sensors, timers, smart plugs, and optional shut-off support help family feel confident after cooking.',
      },
    ],
    includedTitle: 'Build your kitchen plan from individual services.',
    includedIntro:
      'Select the useful improvements, see an estimate, then decide whether to upload photos or book a visit.',
    included: [
      'Non-slip preparation and anti-fatigue standing zones',
      'Easy-grip utensils, openers, and lightweight cookware',
      'Improved worktop lighting, voice lighting, and timers',
      'Selected smart plugs plus leak and gas or carbon-monoxide sensors',
      'Optional pull-down shelf, automatic stove shut-off, or touchless faucet where needed',
    ],
    reassuranceTitle: "A safer kitchen should still feel like the resident's kitchen.",
    reassuranceBody:
      'We keep familiar routines where possible, choose what helps, coordinate installation, and explain the setup clearly.',
    reassurancePoints: ['Daily items within safer reach', 'Clearer work and walking zones', 'Installation and handover managed'],
    finalTitle: 'Keep cooking possible, safer, and calmer.',
    finalBody:
      'Book a visit and CasaMia will review reach, lighting, appliances, water risk, and the practical kitchen plan that fits the home.',
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

function getServicePresentation(service: CasaMiaService) {
  return kitchenServicePresentation[service.id] ?? roomServicePresentation[service.room] ?? { icon: PackageCheck, visual: 'handover' as const }
}

function getServiceStatusLabel(service: CasaMiaService) {
  if (service.pricingType === 'quote_only') {
    return 'Quote'
  }

  if (service.requiresMeasurement || service.requiresSiteVisit || service.requiresCompatibilityCheck) {
    return 'Check first'
  }

  if (service.requiresInstallation) {
    return 'Installed'
  }

  return 'Product'
}

function getConfigurePath(serviceId: string) {
  const room = serviceRoomMap[serviceId]

  return room ? `/configure?room=${room}` : '/configure'
}

function getLowestServicePrice(services: CasaMiaService[]) {
  return services.reduce<number | undefined>((lowest, service) => {
    const amount = getServicePriceAmount(service)

    if (!amount) {
      return lowest
    }

    return lowest === undefined ? amount : Math.min(lowest, amount)
  }, undefined)
}

function getServicePriceAmount(service: CasaMiaService) {
  if (service.pricingType === 'quote_only') {
    return undefined
  }

  if (service.pricingType === 'from') {
    return service.fromPrice
  }

  return (service.productPrice ?? 0) + (service.installationPrice ?? 0)
}

function groupServicesByCategory(services: CasaMiaService[]) {
  const groups = new Map<string, CasaMiaService[]>()

  services.forEach((service) => {
    const group = groups.get(service.category) ?? []
    groups.set(service.category, [...group, service])
  })

  return Array.from(groups, ([category, groupedServices]) => ({
    category,
    services: groupedServices,
  }))
}

function ServiceItemGrid({ services }: { services: CasaMiaService[] }) {
  return (
    <div className="service-kitchen-component-grid is-itemised">
      {services.map((item) => {
        const presentation = getServicePresentation(item)
        const Icon = presentation.icon

        return (
          <article key={item.id}>
            <div className={`service-kitchen-component-visual is-${presentation.visual}`} aria-hidden="true">
              <span className="service-kitchen-visual-main" />
              <span className="service-kitchen-visual-dot" />
              <span className="service-kitchen-visual-line" />
            </div>
            <div className="service-kitchen-component-copy">
              <div className="service-kitchen-component-topline">
                <span>{getServiceStatusLabel(item)}</span>
                <Icon size={21} aria-hidden="true" />
              </div>
              <h3>{item.name}</h3>
              <p>{item.shortDescription}</p>
            </div>
            <div className="service-kitchen-component-details">
              <p className="service-kitchen-component-benefit">
                <CheckCircle2 size={17} aria-hidden="true" />
                {item.customerBenefit}
              </p>
              {item.includedItems && item.includedItems.length > 0 ? (
                <ul className="service-kitchen-component-inclusions" aria-label={`Included with ${item.name}`}>
                  {item.includedItems.slice(0, 3).map((includedItem) => (
                    <li key={includedItem}>{includedItem}</li>
                  ))}
                </ul>
              ) : null}
              <strong>{formatServicePrice(item)}</strong>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function RoomServiceItemsSection({
  configurePath,
  room,
  services,
}: {
  configurePath: string
  room: ServiceRoom
  services: CasaMiaService[]
}) {
  if (services.length === 0) {
    return null
  }

  const copy = roomServiceCopy[room]

  return (
    <section className="service-detail-section bg-white">
      <div className="site-shell">
        <div className="service-detail-heading">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>

        <ServiceItemGrid services={services} />

        <div className="service-detail-actions service-detail-inline-actions">
          <Link className="btn btn-navy" to={configurePath}>
            Build My Safer Home
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function KitchenSafetyShowcase({
  detail,
  kitchenServices,
}: {
  detail: ServiceDetailContent
  kitchenServices: CasaMiaService[]
}) {
  const installCount = kitchenServices.filter((service) => service.requiresInstallation).length
  const siteCheckCount = kitchenServices.filter(
    (service) => service.requiresMeasurement || service.requiresSiteVisit || service.requiresCompatibilityCheck,
  ).length
  const lowestPrice = getLowestServicePrice(kitchenServices)
  const groupedServices = groupServicesByCategory(kitchenServices)

  return (
    <>
      <section className="service-detail-section service-kitchen-story bg-white">
        <div className="site-shell">
          <div className="service-kitchen-story-grid">
            <div className="service-detail-heading">
              <p className="eyebrow">Kitchen independence</p>
              <h2>{detail.benefitsTitle}</h2>
              <p>{detail.benefitsIntro}</p>
              <div className="service-kitchen-stats" aria-label="Kitchen safety services summary">
                <article>
                  <strong>{lowestPrice ? formatCurrency(lowestPrice) : 'Quote'}</strong>
                  <span>entry item</span>
                </article>
                <article>
                  <strong>{kitchenServices.length}</strong>
                  <span>safety services</span>
                </article>
                <article>
                  <strong>{installCount}</strong>
                  <span>managed installs</span>
                </article>
                <article>
                  <strong>{siteCheckCount}</strong>
                  <span>checked before install</span>
                </article>
              </div>
            </div>

            <div className="service-kitchen-visual-card">
              <div className="service-kitchen-routine-visual" aria-hidden="true">
                <div className="service-kitchen-counter">
                  <span className="service-kitchen-zone is-light">Task light</span>
                  <span className="service-kitchen-zone is-sink">Leak sensor</span>
                  <span className="service-kitchen-zone is-stove">Appliance safety</span>
                  <span className="service-kitchen-zone is-mat">Stable standing zone</span>
                  <span className="service-kitchen-zone is-reach">Safer reach</span>
                </div>
              </div>
              <div className="service-kitchen-visual-note">
                <span>
                  <CheckCircle2 size={19} aria-hidden="true" />
                </span>
                <p>Built around real kitchen moments: reach, prep, cooking, washing and reassurance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="service-detail-section bg-pale-blue">
        <div className="site-shell">
          <div className="service-detail-heading">
            <p className="eyebrow">What gets improved</p>
            <h2>Choose the improvements that fit.</h2>
            <p>Pick useful services one by one. CasaMia confirms measurements and compatibility before work starts.</p>
          </div>

          <ServiceItemGrid services={kitchenServices} />
        </div>
      </section>

      <section className="service-detail-section bg-white">
        <div className="site-shell">
          <div className="service-kitchen-selection-panel">
            <div className="service-kitchen-selection-copy">
              <p className="eyebrow">Your CasaMia plan</p>
              <h2>{detail.includedTitle}</h2>
              <p>{detail.includedIntro}</p>
              <Link className="btn btn-navy" to="/configure?room=kitchen">
                Build my plan
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
            </div>

            <div className="service-kitchen-selection-lists">
              {groupedServices.map((group) => (
                <article key={group.category}>
                  <h3>{group.category}</h3>
                  <div className="service-kitchen-pill-list">
                    {group.services.map((item) => (
                      <span key={item.id}>{item.name}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="service-detail-reassurance-card service-kitchen-reassurance">
            <div>
              <p className="eyebrow">Managed by CasaMia</p>
              <h3>{detail.reassuranceTitle}</h3>
              <p>{detail.reassuranceBody}</p>
            </div>
            <ServiceChecklist items={detail.reassurancePoints} />
          </div>
        </div>
      </section>
    </>
  )
}

export function ServiceDetailPage() {
  const { serviceId } = useParams()
  const serviceRoom = serviceRoomMap[serviceId ?? ''] ?? 'bathroom'
  const roomServices = useServicesByRoom(serviceRoom)
  const service = primaryServices.find((item) => item.id === serviceId)

  if (!service) {
    return <Navigate to="/services" replace />
  }

  const visual = serviceVisuals[service.id] ?? serviceVisuals['bathroom-safety']
  const detail = serviceDetailContent[service.id] ?? defaultServiceDetailContent
  const relatedServices = primaryServices.filter((item) => item.id !== service.id).slice(0, 3)
  const isKitchenService = service.id === 'kitchen-safety'
  const serviceCatalogueItems = serviceRoomMap[service.id] ? roomServices : []
  const heroTitle = isKitchenService ? 'A safer kitchen, without losing independence.' : service.title
  const heroIntro = isKitchenService
    ? 'Practical improvements for standing, lighting, reach, water, appliances and family reassurance.'
    : service.intro
  const configurePath = getConfigurePath(service.id)

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
              <h1>{heroTitle}</h1>
              <p>{heroIntro}</p>
              <div className="service-detail-actions">
                <Link
                  className="btn btn-green"
                  to={configurePath}
                >
                  Build My Safer Home
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
                <Link className="btn btn-white" to="/home-safety-assessment#self-inspection-tool">
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

      {isKitchenService ? (
        <KitchenSafetyShowcase
          detail={detail}
          kitchenServices={serviceCatalogueItems}
        />
      ) : (
        <>
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

          <RoomServiceItemsSection
            configurePath={configurePath}
            room={serviceRoom}
            services={serviceCatalogueItems}
          />

          <section className="service-detail-section bg-white">
            <div className="site-shell">
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
        </>
      )}

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
          <Link className="btn btn-green" to={configurePath}>
            Build My Safer Home
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
