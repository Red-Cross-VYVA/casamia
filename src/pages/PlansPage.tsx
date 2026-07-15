import {
  ArrowRight,
  ArrowUpDown,
  Bath,
  BedDouble,
  CheckCircle2,
  ClipboardCheck,
  CookingPot,
  DoorOpen,
  Footprints,
  HeartPulse,
  Home,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UsersRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { TrustBar } from '../components/TrustBar'
import { TrustSection } from '../components/TrustSection'

type Outcome = {
  icon: LucideIcon
  title: string
  body: string
  points: string[]
}

type RoomCard = {
  icon: LucideIcon
  room: string
  focus: string
  chips: string[]
}

type AddOn = {
  icon: LucideIcon
  title: string
  body: string
  to: string
}

const planFlow = [
  {
    title: 'Assess',
    body: 'Home, resident and daily routines.',
  },
  {
    title: 'Plan',
    body: 'Clear risks, priorities and quote.',
  },
  {
    title: 'Install',
    body: 'Coordinated products, providers and follow-up.',
  },
]

const outcomes: Outcome[] = [
  {
    icon: ShieldCheck,
    title: 'A safer home plan',
    body: 'A practical review of the spaces where falls, trips and daily friction are most likely.',
    points: ['Room-by-room check', 'Home Safety Score', 'Clear priorities'],
  },
  {
    icon: ClipboardCheck,
    title: 'A decision-ready report',
    body: 'A simple recommendation showing what to fix first, what can wait and what each step is for.',
    points: ['Written scope', 'Fixed quote', 'No blind buying'],
  },
  {
    icon: Wrench,
    title: 'Managed installation',
    body: 'CasaMia keeps the family, products, provider and handover together under one coordinated process.',
    points: ['Vetted providers', 'Quality check', 'Follow-up'],
  },
]

const roomCards: RoomCard[] = [
  {
    icon: DoorOpen,
    room: 'Entrance',
    focus: 'Getting in and out safely, especially with steps, thresholds or poor evening light.',
    chips: ['Thresholds', 'Lighting', 'Handrail'],
  },
  {
    icon: Home,
    room: 'Living room',
    focus: 'Reducing trip risks around rugs, furniture, cables and common movement routes.',
    chips: ['Clear routes', 'Furniture', 'Trip risks'],
  },
  {
    icon: Footprints,
    room: 'Hallways',
    focus: 'Making night movement easier between bedroom, bathroom and living areas.',
    chips: ['Night route', 'Obstacles', 'Door swing'],
  },
  {
    icon: ArrowUpDown,
    room: 'Stairs',
    focus: 'Improving grip, contrast, lighting and support on the highest-risk route.',
    chips: ['Handrails', 'Anti-slip', 'Contrast'],
  },
  {
    icon: Bath,
    room: 'Bathroom',
    focus: 'Supporting shower entry, toilet transfer, wet floors and safe reach.',
    chips: ['Grab bars', 'Shower access', 'Toilet height'],
  },
  {
    icon: CookingPot,
    room: 'Kitchen',
    focus: 'Making everyday cooking and washing safer through better reach, light and surface control.',
    chips: ['Reach', 'Heat risk', 'Floor grip'],
  },
  {
    icon: BedDouble,
    room: 'Bedroom',
    focus: 'Supporting bed transfers, bedside reach and the route to the bathroom at night.',
    chips: ['Bed transfer', 'Bedside reach', 'Motion light'],
  },
  {
    icon: Lightbulb,
    room: 'Outdoor spaces',
    focus: 'Checking paths, steps, exterior light and the first movement from the doorway.',
    chips: ['Pathway', 'Step support', 'Exterior light'],
  },
]

const addOns: AddOn[] = [
  {
    icon: Smartphone,
    title: 'Smart home',
    body: 'Voice controls, smart lighting, locks, plugs and routines where they make life easier.',
    to: '/services',
  },
  {
    icon: ShieldCheck,
    title: 'Safety technology',
    body: 'Sensors, alerts, emergency buttons, leak detection and connected safety devices.',
    to: '/services',
  },
  {
    icon: HeartPulse,
    title: 'Health monitoring',
    body: 'Simple vitals and wellbeing monitoring with family visibility when appropriate.',
    to: '/services',
  },
  {
    icon: UsersRound,
    title: 'Family dashboard',
    body: 'A clearer way for relatives to track requests, alerts, handover and follow-up.',
    to: '/family-dashboard',
  },
  {
    icon: Sparkles,
    title: 'AI and voice support',
    body: 'Optional prompts, reminders and routines for people who benefit from guided support.',
    to: '/services',
  },
  {
    icon: Home,
    title: 'Living support',
    body: 'Extra services for families planning bigger care, comfort or assisted living decisions.',
    to: '/assisted-living-solutions',
  },
]

export function PlansPage() {
  useEffect(() => {
    document.title = 'Home Safety Plan | CasaMia'
  }, [])

  return (
    <>
      <section className="plans-conversion-hero core-plan-hero">
        <div className="plans-conversion-hero-inner site-shell">
          <div>
            <p className="section-kicker">CasaMia Home Safety Plan</p>
            <h1>Home safety, handled.</h1>
            <p>
              Assessment, clear recommendations and coordinated installation in one practical CasaMia plan.
            </p>
            <div className="plans-hero-actions">
              <Link className="btn btn-green" to="/home-safety-assessment?plan=home-safety">
                Book My Assessment
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <a className="btn btn-white" href="#plan-includes">
                See what is included
              </a>
            </div>
          </div>

          <aside className="core-plan-visual" aria-label="CasaMia Home Safety Plan process">
            <div className="core-plan-visual-heading">
              <span>
                <ShieldCheck size={24} aria-hidden="true" />
              </span>
              <div>
                <strong>Simple first. Personalised after.</strong>
                <p>We find the risks, prioritise the fixes and manage the next step.</p>
              </div>
            </div>
            <div className="core-plan-flow">
              {planFlow.map((step, index) => (
                <div className="core-plan-flow-card" key={step.title}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <TrustBar />

      <section className="plans-choice-section section-pad" id="plan-includes">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">What you get</h2>
            <p>
              The plan is designed to help families move from worry to a clear, practical next step.
            </p>
          </div>

          <div className="core-plan-outcome-grid">
            {outcomes.map((outcome) => {
              const Icon = outcome.icon

              return (
                <article className="core-plan-outcome-card" key={outcome.title}>
                  <span>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{outcome.title}</h3>
                  <p>{outcome.body}</p>
                  <ul>
                    {outcome.points.map((point) => (
                      <li key={point}>
                        <CheckCircle2 size={17} aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="plans-next-section section-pad">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">How it works</h2>
            <p>Four steps, one point of responsibility and no need to choose products before the home is reviewed.</p>
          </div>
          <div className="core-plan-step-strip" aria-label="Home Safety Plan steps">
            {planFlow.map((step, index) => (
              <article key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="plans-matrix-section section-pad">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">Room-by-room coverage</h2>
            <p>
              CasaMia reviews the whole home, then recommends only the improvements that fit the resident and the
              property.
            </p>
          </div>

          <div className="core-plan-room-grid">
            {roomCards.map((room) => {
              const Icon = room.icon

              return (
                <article className="core-plan-room-card" key={room.room}>
                  <header>
                    <span className="core-plan-room-icon">
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <h3>{room.room}</h3>
                  </header>
                  <p>{room.focus}</p>
                  <div className="core-plan-chip-list">
                    {room.chips.map((chip) => (
                      <span key={chip}>{chip}</span>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="plans-payment-section section-pad">
        <div className="site-shell">
          <div className="plans-payment-panel core-plan-addon-panel">
            <div>
              <p className="section-kicker">Optional after assessment</p>
              <h2 className="display-title">Add support only where it helps</h2>
              <p>
                Add-ons are not bundled blindly. CasaMia recommends them after the report, so the family can choose
                extra support with context.
              </p>
            </div>

            <div className="core-plan-addon-grid">
              {addOns.map((addOn) => {
                const Icon = addOn.icon

                return (
                  <Link className="core-plan-addon-card" to={addOn.to} key={addOn.title}>
                    <span>
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{addOn.title}</h3>
                      <p>{addOn.body}</p>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="plans-payment-reassurance">
              <CheckCircle2 size={22} aria-hidden="true" />
              <p>Start with the core plan. Add technology, monitoring or family tools only when they solve a real need.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="plans-final-cta">
        <div className="site-shell">
          <div className="plans-final-panel">
            <div>
              <h2>Ready to make the home safer?</h2>
              <p>Book the assessment first. CasaMia will turn the home review into a clear plan of action.</p>
            </div>
            <Link className="btn btn-green" to="/home-safety-assessment?plan=home-safety">
              Book Assessment
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <TrustSection />
    </>
  )
}
