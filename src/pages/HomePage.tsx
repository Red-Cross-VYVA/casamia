import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bath,
  BedDouble,
  BellRing,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  DoorOpen,
  HeartHandshake,
  Home,
  Lightbulb,
  MessageCircle,
  ShieldCheck,
  Sofa,
  Utensils,
  Volume2,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { SafeImage } from '../components/SafeImage'
import { SEO } from '../components/SEO'
import { trackEvent } from '../utils/analytics'

type AudienceId = 'myself' | 'parents' | 'family' | 'residence'
type HomeTypeId = 'apartment' | 'townhouse' | 'detached' | 'villa'
type RoomId =
  | 'entrance'
  | 'bathroom'
  | 'bedroom'
  | 'kitchen'
  | 'living'
  | 'hallways'
  | 'stairs'
  | 'outdoor'
type UpgradeId =
  | 'voice'
  | 'family'
  | 'health'
  | 'lighting'
  | 'fall'
  | 'door'
  | 'alerts'

type SelectableCard<T extends string> = {
  id: T
  title: string
  body: string
  icon: LucideIcon
  visual?: {
    src: string
    alt: string
  }
}

const configuratorPath = '/home-safety-wizard'
const talkPath = '/why-us#contact-form'

const audiences: SelectableCard<AudienceId>[] = [
  {
    id: 'myself',
    title: 'Myself',
    body: 'I would like to stay independent and feel safer at home.',
    icon: Home,
    visual: {
      src: '/images/before-after/living-after-home.webp',
      alt: 'Comfortable adapted living room with clear walking space',
    },
  },
  {
    id: 'parents',
    title: 'My Parents',
    body: 'I want them to stay safe without taking away their independence.',
    icon: HeartHandshake,
    visual: {
      src: '/images/solutions/portrait-lovely-couple-together.jpg',
      alt: 'Older couple together at home',
    },
  },
  {
    id: 'family',
    title: 'A Family Member',
    body: 'We are adapting a home after illness, surgery or injury.',
    icon: ShieldCheck,
    visual: {
      src: '/images/before-after/bedroom-after-card.webp',
      alt: 'Bedroom adapted for safer daily movement',
    },
  },
  {
    id: 'residence',
    title: 'I Manage a Residence',
    body: 'I am looking for solutions for multiple residents.',
    icon: Building2,
    visual: {
      src: '/images/solutions/casamia-staff-kitchen-consultation.webp',
      alt: 'Home safety professional reviewing adaptations with a client',
    },
  },
]

const rooms: Array<SelectableCard<RoomId> & { improvements: string[]; position: string }> = [
  {
    id: 'entrance',
    title: 'Entrance',
    body: 'Safer arrivals, exits and visitor access.',
    icon: DoorOpen,
    position: 'home-hotspot-entrance',
    improvements: ['Safer access', 'Handrails', 'Threshold ramps', 'Improved lighting'],
  },
  {
    id: 'bathroom',
    title: 'Bathroom',
    body: 'The highest priority room for many families.',
    icon: Bath,
    position: 'home-hotspot-bathroom',
    improvements: ['Grab bars', 'Raised toilet seat', 'Handheld shower', 'Anti-slip protection'],
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    body: 'Better night movement and easier bed transfers.',
    icon: BedDouble,
    position: 'home-hotspot-bedroom',
    improvements: ['Bedside lighting', 'Bed rail where required', 'Clear movement path'],
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    body: 'Safer reach, lighting and daily routines.',
    icon: Utensils,
    position: 'home-hotspot-kitchen',
    improvements: ['Anti-slip protection', 'Anti-scald solutions', 'Better lighting', 'Easy-reach guidance'],
  },
  {
    id: 'living',
    title: 'Living Room',
    body: 'Reduce trip hazards where daily life happens.',
    icon: Sofa,
    position: 'home-hotspot-living',
    improvements: ['Trip-hazard reduction', 'Furniture stability', 'Improved lighting'],
  },
  {
    id: 'hallways',
    title: 'Hallways',
    body: 'Make routes clear and easier to navigate.',
    icon: Lightbulb,
    position: 'home-hotspot-hallways',
    improvements: ['Motion lighting', 'Clear pathways', 'Support points'],
  },
  {
    id: 'stairs',
    title: 'Stairways',
    body: 'Support and contrast from first step to last.',
    icon: Wrench,
    position: 'home-hotspot-stairs',
    improvements: ['Handrails', 'Anti-slip stair strips', 'Motion lighting'],
  },
  {
    id: 'outdoor',
    title: 'Outdoor Areas',
    body: 'Safer walkways before the front door.',
    icon: Home,
    position: 'home-hotspot-outdoor',
    improvements: ['Safer walkways', 'Ramps where required', 'Handrails', 'Motion lighting'],
  },
]

const corePillars: Array<SelectableCard<string>> = [
  {
    id: 'assessment',
    title: 'Home Safety Assessment',
    body: 'A professional evaluation of the home, daily routines and priority risks.',
    icon: CalendarCheck,
  },
  {
    id: 'report',
    title: 'Personal Safety Report',
    body: 'Clear recommendations, priorities and transparent pricing before work begins.',
    icon: ClipboardCheck,
  },
  {
    id: 'improvements',
    title: 'Essential Safety Improvements',
    body: 'The practical changes that make the biggest difference first.',
    icon: ShieldCheck,
  },
  {
    id: 'installation',
    title: 'Professional Installation',
    body: 'Supply, installation, setup, testing and basic training included.',
    icon: Wrench,
  },
  {
    id: 'support',
    title: 'Warranty and Support',
    body: 'CasaMia remains your point of contact after installation.',
    icon: BadgeCheck,
  },
]

const solutionCategories = [
  {
    title: 'Voice & Independence',
    body: 'Voice control, reminders, family calls, music and simple daily support.',
    price: 'From EUR 199 installed',
    cta: 'Explore Voice Solutions',
    to: '/tech',
    image: '/images/service-gallery/11-voice-controls-and-smart-routines.jpg',
    icon: Volume2,
  },
  {
    title: 'Connected Health',
    body: 'Vitals monitoring, health routines and sharing with approved family or care teams.',
    price: 'From EUR 99 installed',
    cta: 'Explore Connected Health',
    to: '/tech',
    image: '/images/service-gallery/10-health-and-vitals-monitoring.jpg',
    icon: Activity,
  },
  {
    title: 'Smart Safety',
    body: 'Fall detection, motion lighting, leak, smoke and emergency notifications.',
    price: 'From EUR 69 installed',
    cta: 'Explore Smart Safety',
    to: '/services/smart-home-safety',
    image: '/images/service-gallery/09-fall-detection-sensors.jpg',
    icon: BellRing,
  },
  {
    title: 'Everyday Living',
    body: 'Personal-care products, shopping, transport, housekeeping and companionship.',
    price: 'From EUR 49 per service',
    cta: 'Explore Everyday Support',
    to: '/services',
    image: '/images/service-gallery/12-smart-setup-and-user-training.jpg',
    icon: HeartHandshake,
  },
]

const homeTypes: SelectableCard<HomeTypeId>[] = [
  { id: 'apartment', title: 'Apartment', body: 'One-level living or shared access.', icon: Building2 },
  { id: 'townhouse', title: 'Townhouse', body: 'Internal stairs and entrance checks.', icon: Home },
  { id: 'detached', title: 'Detached Home', body: 'Room-by-room safety planning.', icon: Home },
  { id: 'villa', title: 'Villa', body: 'Indoor and outdoor access routes.', icon: Home },
]

const upgrades: SelectableCard<UpgradeId>[] = [
  { id: 'voice', title: 'Voice assistant', body: 'Hands-free support.', icon: Volume2 },
  { id: 'family', title: 'Family dashboard', body: 'Approved updates.', icon: HeartHandshake },
  { id: 'health', title: 'Health monitoring', body: 'Connected vitals.', icon: Activity },
  { id: 'lighting', title: 'Smart lighting', body: 'Motion routes.', icon: Lightbulb },
  { id: 'fall', title: 'Fall detection', body: 'Emergency alerts.', icon: ShieldCheck },
  { id: 'door', title: 'Smart door access', body: 'Safer entry.', icon: DoorOpen },
  { id: 'alerts', title: 'Emergency alerts', body: 'Fast notifications.', icon: BellRing },
]

const processSteps = [
  ['Book assessment', 'Choose a home visit or start with self-inspection photos.'],
  ['We review the home', 'CasaMia checks the rooms, routines and real safety priorities.'],
  ['Receive your report', 'You get clear recommendations and a confirmed next step.'],
  ['Choose improvements', 'Start with essentials and add only what is useful.'],
  ['Enjoy a safer home', 'Everything is installed, tested and ready to use.'],
]

const organisationTypes = [
  'Care homes',
  'Retirement villages',
  'Assisted living',
  'Municipal housing',
  'Hospitals and rehab',
]

function toggleItem<T extends string>(items: T[], item: T) {
  return items.includes(item) ? items.filter((current) => current !== item) : [...items, item]
}

function getEstimatedPrice(roomCount: number, upgradeCount: number) {
  return 299 + Math.max(roomCount - 1, 0) * 175 + upgradeCount * 69
}

export function HomePage() {
  const [selectedAudience, setSelectedAudience] = useState<AudienceId>('parents')
  const [activeRoom, setActiveRoom] = useState<RoomId>('bathroom')
  const [configStep, setConfigStep] = useState(0)
  const [homeType, setHomeType] = useState<HomeTypeId>('detached')
  const [selectedRooms, setSelectedRooms] = useState<RoomId[]>(['bathroom', 'bedroom', 'entrance'])
  const [selectedUpgrades, setSelectedUpgrades] = useState<UpgradeId[]>(['lighting', 'alerts'])
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [configuratorStarted, setConfiguratorStarted] = useState(false)
  const activeRoomData = rooms.find((room) => room.id === activeRoom) ?? rooms[1]
  const selectedHomeType = homeTypes.find((type) => type.id === homeType)
  const estimatedPrice = useMemo(
    () => getEstimatedPrice(selectedRooms.length, selectedUpgrades.length),
    [selectedRooms.length, selectedUpgrades.length],
  )

  function handleAudienceSelect(audience: AudienceId) {
    setSelectedAudience(audience)
    trackEvent('audience_selected', { audience })
    document.getElementById('home-overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleRoomOpen(room: RoomId) {
    setActiveRoom(room)
    trackEvent('room_hotspot_opened', { room })
  }

  function handleConfiguratorClick(location: string) {
    if (location === 'hero') {
      trackEvent('hero_configurator_cta_clicked', { audience: selectedAudience })
    }

    trackEvent('safer_home_configurator_opened', { location, audience: selectedAudience })
  }

  function handleTalkClick(location: string) {
    trackEvent('talk_to_casamia_clicked', { location, audience: selectedAudience })
  }

  function handleConfiguratorStart(location: string) {
    if (!configuratorStarted) {
      trackEvent('configurator_started', { location })
      setConfiguratorStarted(true)
    }
  }

  return (
    <>
      <SEO
        title="CasaMia | Safer Homes for Independent Living"
        description="CasaMia helps seniors and families create safer, smarter and more accessible homes through professional assessments, installation and personalised home-safety solutions."
        path="/"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'CasaMia',
          description:
            'Home safety assessments, installation and personalised independent-living solutions.',
          url: 'https://casamia.com.es',
          areaServed: 'Spain',
        }}
      />

      <section className="home-redesign-hero" id="top">
        <div className="home-redesign-hero-grid site-shell">
          <div className="home-redesign-hero-copy">
            <p className="home-redesign-kicker">Safer homes. Easier living.</p>
            <h1>
              Home Sweet
              <span>Home</span>
            </h1>
            <p>
              Thoughtful solutions that help you or someone you love live independently, with greater
              comfort, confidence and peace of mind.
            </p>
            <div className="home-redesign-actions">
              <Link
                className="btn btn-green"
                to={configuratorPath}
                onClick={() => handleConfiguratorClick('hero')}
              >
                Build My Safer Home
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
              <Link
                className="home-redesign-secondary"
                to="/how-it-works"
                onClick={() => trackEvent('hero_how_it_works_clicked')}
              >
                See How It Works
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="home-redesign-trust-points" aria-label="CasaMia reassurance points">
              {['Professional installation', 'Assessment credited back', 'Designed around your home'].map((item) => (
                <span key={item}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="home-redesign-hero-media">
            <SafeImage
              src="/images/solutions/front-view-adorable-couple-kitchen.jpg"
              alt="Older couple standing confidently in a bright home kitchen"
              className="home-redesign-hero-image"
              imgClassName="h-full w-full object-cover"
              loading="eager"
            />
            <div className="home-redesign-rating-card" aria-label="Trusted by families, 4.9 out of 5">
              <strong>Trusted by families</strong>
              <span>{'\u2605'.repeat(5)}</span>
              <b>4.9/5</b>
            </div>
          </div>
        </div>
      </section>

      <section className="home-redesign-section home-audience-section">
        <div className="site-shell">
          <div className="home-redesign-section-heading">
            <h2>Who are you here for?</h2>
          </div>
          <div className="home-audience-grid">
            {audiences.map((audience) => {
              const Icon = audience.icon
              const selected = audience.id === selectedAudience

              return (
                <button
                  type="button"
                  className={`home-audience-card ${selected ? 'is-selected' : ''}`}
                  key={audience.id}
                  onClick={() => handleAudienceSelect(audience.id)}
                >
                  {audience.visual ? (
                    <SafeImage
                      src={audience.visual.src}
                      alt={audience.visual.alt}
                      className="home-audience-visual"
                      imgClassName="h-full w-full object-cover"
                      fallbackLabel={audience.title}
                    />
                  ) : null}
                  <span className="home-audience-icon">
                    <Icon size={25} aria-hidden="true" />
                  </span>
                  <strong>{audience.title}</strong>
                  <p>{audience.body}</p>
                  <small>
                    Choose path
                    <ArrowRight size={14} aria-hidden="true" />
                  </small>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="home-redesign-section home-overview-section" id="home-overview">
        <div className="home-overview-grid site-shell">
          <div className="home-overview-copy">
            <p className="home-redesign-kicker">Room by room</p>
            <h2>Every safer home starts here.</h2>
            <p>
              We focus on the areas that matter most to help prevent falls and make daily living easier.
            </p>
            <Link className="home-redesign-secondary" to="#core-plan">
              See What Is Included
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-overview-visual">
            <SafeImage
              src="/images/before-after/living-after-home.webp"
              alt="Warm living room arranged for safer daily movement"
              className="home-overview-image"
              imgClassName="h-full w-full object-cover"
            />
            <div className="home-hotspot-layer" aria-label="Home areas CasaMia reviews">
              {rooms.map((room) => {
                const Icon = room.icon

                return (
                  <button
                    type="button"
                    className={`home-hotspot ${room.position} ${activeRoom === room.id ? 'is-active' : ''}`}
                    key={room.id}
                    onClick={() => handleRoomOpen(room.id)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {room.title}
                  </button>
                )
              })}
            </div>
            <div className="home-room-panel">
              <strong>{activeRoomData.title}</strong>
              <p>{activeRoomData.body}</p>
              <ul>
                {activeRoomData.improvements.map((item) => (
                  <li key={item}>
                    <Check size={15} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="home-redesign-section home-core-section" id="core-plan">
        <div className="site-shell">
          <div className="home-redesign-section-heading is-centered">
            <p className="home-redesign-kicker">One clear plan</p>
            <h2>Every CasaMia home includes</h2>
            <p>Start with a safer home. Add only what you need.</p>
          </div>
          <div className="home-core-grid">
            {corePillars.map((pillar) => {
              const Icon = pillar.icon

              return (
                <article className="home-core-card" key={pillar.id}>
                  <span>
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </article>
              )
            })}
          </div>
          <div className="home-core-details-action">
            <Link
              className="home-redesign-secondary"
              to={configuratorPath}
              onClick={() => trackEvent('core_plan_details_opened', { location: 'core_plan' })}
            >
              Build your CasaMia plan
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-credit-section">
        <div className="home-credit-panel site-shell">
          <div>
            <p className="home-redesign-kicker">Assessment credit</p>
            <h2>Your assessment pays for itself.</h2>
            <p>
              When you proceed with CasaMia's recommended home improvements, the assessment fee is
              deducted from your final installation invoice.
            </p>
          </div>
          <div className="home-credit-flow" aria-label="Assessment credit process">
            {['Home visit', 'Personal safety report', 'Choose improvements', 'Fee credited back'].map((item, index) => (
              <div className="home-credit-step" key={item}>
                <span>{index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-redesign-section home-solutions-section">
        <div className="site-shell">
          <div className="home-redesign-section-heading">
            <p className="home-redesign-kicker">Safety services</p>
            <h2>Make your home even smarter.</h2>
          </div>
          <div className="home-solutions-grid">
            {solutionCategories.map((solution) => {
              const Icon = solution.icon

              return (
                <Link
                  className="home-solution-card"
                  key={solution.title}
                  to={solution.to}
                  onClick={() => trackEvent('smart_category_selected', { category: solution.title })}
                >
                  <SafeImage
                    src={solution.image}
                    alt=""
                    className="home-solution-image"
                    imgClassName="h-full w-full object-cover"
                  />
                  <div className="home-solution-body">
                    <span>
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <small>{solution.price}</small>
                    <h3>{solution.title}</h3>
                    <p>{solution.body}</p>
                    <strong>
                      {solution.cta}
                      <ArrowRight size={15} aria-hidden="true" />
                    </strong>
                  </div>
                </Link>
              )
            })}
          </div>
          <p className="home-pricing-note">
            Final pricing depends on the home, installation requirements and selected equipment. A confirmed
            quotation is provided after assessment.
          </p>
        </div>
      </section>

      <section className="home-redesign-section home-configurator-section" id="configurator">
        <div className="home-configurator-layout site-shell">
          <div className="home-configurator-intro">
            <p className="home-redesign-kicker">Build your safer home</p>
            <h2>Answer a few quick questions.</h2>
            <p>
              See a helpful starting point before sharing any personal details. The final quote is confirmed
              after assessment.
            </p>
            <Link
              className="btn btn-green"
              to={configuratorPath}
              onClick={() => handleConfiguratorClick('configurator_intro')}
            >
              Start My Safer Home Plan
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-configurator-card">
            <div className="home-configurator-steps" aria-label="Configurator steps">
              {['Home type', 'Rooms', 'Upgrades', 'Summary'].map((label, index) => (
                <button
                  type="button"
                  className={configStep === index ? 'is-active' : ''}
                  key={label}
                  onClick={() => {
                    handleConfiguratorStart('step_tabs')
                    setConfigStep(index)
                  }}
                  onFocus={() => handleConfiguratorStart('step_tabs')}
                >
                  <span>{index + 1}</span>
                  {label}
                </button>
              ))}
            </div>

            {configStep === 0 ? (
              <ConfiguratorOptionGrid
                items={homeTypes}
                selected={[homeType]}
                onSelect={(id) => {
                  handleConfiguratorStart('home_type')
                  setHomeType(id)
                  trackEvent('home_type_selected', { homeType: id })
                }}
              />
            ) : null}

            {configStep === 1 ? (
              <ConfiguratorOptionGrid
                items={rooms}
                selected={selectedRooms}
                multi
                onSelect={(id) => {
                  handleConfiguratorStart('rooms')
                  setSelectedRooms((current) => toggleItem(current, id))
                  trackEvent('room_selected', { room: id })
                }}
              />
            ) : null}

            {configStep === 2 ? (
              <ConfiguratorOptionGrid
                items={upgrades}
                selected={selectedUpgrades}
                multi
                onSelect={(id) => {
                  handleConfiguratorStart('upgrades')
                  setSelectedUpgrades((current) => toggleItem(current, id))
                  trackEvent('upgrade_selected', { upgrade: id })
                }}
              />
            ) : null}

            {configStep === 3 ? (
              <div className="home-configurator-summary">
                <div>
                  <span>Home type</span>
                  <strong>{selectedHomeType?.title}</strong>
                </div>
                <div>
                  <span>Priority rooms</span>
                  <strong>{selectedRooms.length || 'None selected'}</strong>
                </div>
                <div>
                  <span>Smart upgrades</span>
                  <strong>{selectedUpgrades.length || 'None selected'}</strong>
                </div>
                <div className="home-configurator-price">
                  <span>Estimated starting price</span>
                  <strong>From EUR {estimatedPrice.toLocaleString('en-US')}</strong>
                  <p>Installation included. Assessment required to confirm final quote.</p>
                </div>
                <div className="home-configurator-actions">
                  <Link
                    className="btn btn-green"
                    to={configuratorPath}
                    onClick={() => {
                      trackEvent('configurator_completed', {
                        homeType,
                        roomCount: selectedRooms.length,
                        upgradeCount: selectedUpgrades.length,
                      })
                      handleConfiguratorClick('configurator_summary')
                    }}
                  >
                    Build My Safer Home
                  </Link>
                  <Link
                    className="home-redesign-secondary"
                    to={talkPath}
                    onClick={() => handleTalkClick('configurator_summary')}
                  >
                    Talk to CasaMia
                  </Link>
                </div>
              </div>
            ) : null}

            <div className="home-configurator-controls">
              <button
                type="button"
                disabled={configStep === 0}
                onClick={() => {
                  handleConfiguratorStart('controls')
                  setConfigStep((step) => Math.max(0, step - 1))
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  handleConfiguratorStart('controls')
                  setConfigStep((step) => Math.min(3, step + 1))
                }}
              >
                {configStep === 3 ? 'Review summary' : 'Next'}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="home-process-section">
        <div className="site-shell">
          <div className="home-process-grid">
            <div>
              <p className="home-redesign-kicker">How it works</p>
              <h2>From first visit to finished home.</h2>
            </div>
            <div className="home-process-timeline">
              {processSteps.map(([title, body], index) => (
                <article key={title}>
                  <span>{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-redesign-section home-family-section">
        <div className="home-family-grid site-shell">
          <div className="home-family-panel">
            <p className="home-redesign-kicker">For families</p>
            <h2>Peace of mind, wherever you are.</h2>
            <p>
              With the senior's consent, approved family members can receive important updates, selected
              health information and safety alerts without taking away independence.
            </p>
            <ul>
              {['Safety alerts', 'Health and activity updates', 'Medication reminders', 'Check-in notifications'].map(
                (item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" />
                    {item}
                  </li>
                ),
              )}
            </ul>
            <Link className="home-redesign-secondary" to="/services">
              Explore Safety Services
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-family-panel is-organisation">
            <p className="home-redesign-kicker">For organisations</p>
            <h2>We also help care organisations.</h2>
            <p>
              Custom quotation for voice assistants, smart-room technology, fall detection, connected health,
              staff and family dashboards, resident engagement, emergency alerts and integrations.
            </p>
            <strong className="home-organisation-quote">Custom quotation</strong>
            <div className="home-organisation-types">
              {organisationTypes.map((type) => (
                <span key={type}>{type}</span>
              ))}
            </div>
            <Link
              className="home-redesign-secondary"
              to="/assisted-living-solutions"
              onClick={() => trackEvent('care_organisation_consultation_clicked')}
            >
              Request a Consultation
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-final-section">
        <div className="home-final-panel site-shell">
          <p className="home-redesign-kicker">Next step</p>
          <h2>Every safer home starts with one conversation.</h2>
          <p>
            Let us explore how we can help you or someone you love live more safely, independently and
            confidently at home.
          </p>
          <div className="home-redesign-actions">
            <Link className="btn btn-green" to={configuratorPath} onClick={() => handleConfiguratorClick('final_cta')}>
              Build My Safer Home
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
            <Link className="home-redesign-secondary" to={talkPath} onClick={() => handleTalkClick('final_cta')}>
              Talk to CasaMia
            </Link>
          </div>
        </div>
      </section>

      <div className="home-agent">
        {assistantOpen ? (
          <div className="home-agent-panel" role="dialog" aria-label="CasaMia Assistant">
            <strong>Hi, I am the CasaMia Assistant.</strong>
            <p>
              I can explain our services, help you understand what your home might need, or guide you
              toward booking an assessment.
            </p>
            <div>
              <Link to={configuratorPath} onClick={() => handleConfiguratorClick('assistant')}>
                Build safer home
              </Link>
              <Link to={talkPath} onClick={() => handleTalkClick('assistant')}>Talk to CasaMia</Link>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          className="home-agent-button"
          aria-expanded={assistantOpen}
          onClick={() => {
            setAssistantOpen((open) => !open)
            if (!assistantOpen) {
              trackEvent('support_agent_opened')
            }
          }}
        >
          <MessageCircle size={22} aria-hidden="true" />
          Ask CasaMia
        </button>
      </div>
    </>
  )
}

function ConfiguratorOptionGrid<T extends string>({
  items,
  selected,
  onSelect,
  multi = false,
}: {
  items: SelectableCard<T>[]
  selected: T[]
  onSelect: (id: T) => void
  multi?: boolean
}) {
  return (
    <div className="home-configurator-options">
      {items.map((item) => {
        const Icon = item.icon
        const isSelected = selected.includes(item.id)

        return (
          <button
            type="button"
            className={isSelected ? 'is-selected' : ''}
            key={item.id}
            aria-pressed={multi ? isSelected : undefined}
            onClick={() => onSelect(item.id)}
          >
            <span>
              <Icon size={24} aria-hidden="true" />
            </span>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
            {isSelected ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
          </button>
        )
      })}
    </div>
  )
}
