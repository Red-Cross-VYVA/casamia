import {
  Accessibility,
  AlarmSmoke,
  ArrowRight,
  Bath,
  BedDouble,
  Bell,
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  DoorOpen,
  Droplets,
  FileText,
  Footprints,
  GraduationCap,
  Hammer,
  HeartPulse,
  Home,
  Lightbulb,
  MonitorSmartphone,
  Settings,
  ShieldCheck,
  Sofa,
  Trees,
  Utensils,
  Video,
  WalletCards,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'

import { FinalCTA } from '../components/FinalCTA'
import { TrustBar } from '../components/TrustBar'
import { TrustSection } from '../components/TrustSection'

type PlanLandingId = 'home-assessment' | 'home-safety' | 'smart-safety'

type PlanFeature = {
  icon: string
  title: string
  body: string
}

type PlanStep = {
  title: string
  body: string
}

type PlanFaq = {
  question: string
  answer: string
}

type PlanLanding = {
  id: PlanLandingId
  title: string
  subtitle: string
  heroPoints: string[]
  who: string[]
  includedIntro: string
  included: PlanFeature[]
  rooms: PlanFeature[]
  process: PlanStep[]
  deliverables: string[]
  payment: {
    terms: string[]
    note: string
  }
  faqs: PlanFaq[]
}

type PlanDetailCopy = {
  metaTitleSuffix: string
  backToPlans: string
  comparePlans: string
  primaryCta: string
  whoTitle: string
  includedTitle: string
  roomTitle: string
  processTitle: string
  deliverablesTitle: string
  paymentTitle: string
  paymentReassurance: string
  faqTitle: string
  finalTitle: string
  finalBody: string
  finalCta: string
  plans: PlanLanding[]
}

const legacyPlanMap: Record<string, PlanLandingId> = {
  advanced: 'home-safety',
  essential: 'home-assessment',
  premium: 'smart-safety',
}

const planIconMap: Record<PlanLandingId, LucideIcon> = {
  'home-assessment': ClipboardCheck,
  'home-safety': Hammer,
  'smart-safety': MonitorSmartphone,
}

const iconMap: Record<string, LucideIcon> = {
  accessibility: Accessibility,
  anchor: Hammer,
  bathroom: Bath,
  bedroom: BedDouble,
  doorbell: Video,
  emergency: Bell,
  entrance: DoorOpen,
  fall: ShieldCheck,
  flooring: Footprints,
  grab: ShieldCheck,
  handrail: Wrench,
  health: HeartPulse,
  inspection: ClipboardCheck,
  installation: Hammer,
  kitchen: Utensils,
  lighting: Lightbulb,
  living: Sofa,
  motion: MonitorSmartphone,
  outdoor: Trees,
  recommendation: Lightbulb,
  report: FileText,
  room: Home,
  settings: Settings,
  smoke: AlarmSmoke,
  stairway: Footprints,
  training: GraduationCap,
  water: Droplets,
}

function getFeatureIcon(icon: string) {
  return iconMap[icon] ?? BadgeCheck
}

function getPlanId(value: string | undefined): PlanLandingId | null {
  if (value === 'home-assessment' || value === 'home-safety' || value === 'smart-safety') {
    return value
  }

  return null
}

export function PlanDetailPage() {
  const { t } = useTranslation()
  const { planId } = useParams()
  const copy = t('pages.planDetail', { returnObjects: true }) as PlanDetailCopy
  const selectedPlanId = getPlanId(planId)
  const plan = selectedPlanId
    ? copy.plans.find((item) => item.id === selectedPlanId)
    : undefined

  useEffect(() => {
    if (plan) {
      document.title = `${plan.title} | ${copy.metaTitleSuffix}`
    }
  }, [copy.metaTitleSuffix, plan])

  if (!selectedPlanId && planId && legacyPlanMap[planId]) {
    return <Navigate to={`/plans/${legacyPlanMap[planId]}`} replace />
  }

  if (!selectedPlanId) {
    return <Navigate to="/plans" replace />
  }

  if (!plan) {
    return <Navigate to="/plans" replace />
  }

  const PlanIcon = planIconMap[plan.id]
  const assessmentPath = `/free-home-safety-assessment?plan=${plan.id}`
  const otherPlans = copy.plans.filter((item) => item.id !== plan.id)

  return (
    <>
      <section className="plan-landing-hero">
        <div className="plan-landing-hero-inner site-shell">
          <Link className="plan-back-link" to="/plans">
            <ChevronLeft size={18} aria-hidden="true" />
            {copy.backToPlans}
          </Link>

          <div className="plan-landing-hero-grid">
            <div className="plan-landing-copy">
              <span className="plan-landing-kicker">
                <PlanIcon size={18} aria-hidden="true" />
                {copy.metaTitleSuffix}
              </span>
              <h1>{plan.title}</h1>
              <p>{plan.subtitle}</p>

              <div className="plan-landing-actions">
                <Link className="btn btn-green" to={assessmentPath}>
                  {copy.primaryCta}
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
                <Link className="btn btn-white" to="/plans#compare-plans">
                  {copy.comparePlans}
                </Link>
              </div>
            </div>

            <aside className="plan-landing-hero-card" aria-label={plan.title}>
              <span className="plan-hero-card-icon">
                <PlanIcon size={30} aria-hidden="true" />
              </span>
              <h2>{copy.includedTitle}</h2>
              <ul>
                {plan.heroPoints.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="plan-hero-payment">
                <WalletCards size={20} aria-hidden="true" />
                <span>{plan.payment.terms[0]}</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="plan-landing-section bg-white">
        <div className="site-shell">
          <div className="plan-section-heading">
            <p className="eyebrow">{copy.whoTitle}</p>
            <h2>{plan.title}</h2>
          </div>

          <div className="plan-who-grid">
            {plan.who.map((item) => (
              <article className="plan-who-card" key={item}>
                <CheckCircle2 size={22} aria-hidden="true" />
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="plan-landing-section plan-included-section">
        <div className="site-shell">
          <div className="plan-section-heading">
            <p className="eyebrow">{copy.includedTitle}</p>
            <h2>{plan.includedIntro}</h2>
          </div>

          <div className="plan-feature-grid">
            {plan.included.map((feature) => {
              const FeatureIcon = getFeatureIcon(feature.icon)

              return (
                <article className="plan-feature-card" key={feature.title}>
                  <span>
                    <FeatureIcon size={24} aria-hidden="true" />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="plan-landing-section bg-white">
        <div className="site-shell">
          <div className="plan-section-heading">
            <p className="eyebrow">{copy.roomTitle}</p>
            <h2>{copy.roomTitle}</h2>
          </div>

          <div className="plan-room-grid">
            {plan.rooms.map((room) => {
              const RoomIcon = getFeatureIcon(room.icon)

              return (
                <article className="plan-room-card" key={room.title}>
                  <span>
                    <RoomIcon size={23} aria-hidden="true" />
                  </span>
                  <h3>{room.title}</h3>
                  <p>{room.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="plan-landing-process">
        <div className="site-shell">
          <div className="plan-section-heading is-centered">
            <p className="eyebrow">{copy.processTitle}</p>
            <h2>{copy.processTitle}</h2>
          </div>

          <div className="plan-process-grid">
            {plan.process.map((step, index) => (
              <article className="plan-process-card" key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="plan-landing-section bg-white">
        <div className="plan-delivery-grid site-shell">
          <article className="plan-deliverables-panel">
            <p className="eyebrow">{copy.deliverablesTitle}</p>
            <h2>{copy.deliverablesTitle}</h2>
            <ul>
              {plan.deliverables.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="plan-payment-panel">
            <span className="plan-payment-icon">
              <WalletCards size={30} aria-hidden="true" />
            </span>
            <p className="plan-payment-kicker">{copy.paymentTitle}</p>
            <h2>{copy.paymentReassurance}</h2>
            <ul>
              {plan.payment.terms.map((term) => (
                <li key={term}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
            <p>{plan.payment.note}</p>
          </article>
        </div>
      </section>

      <TrustSection />

      <section className="plan-landing-section plan-faq-section">
        <div className="site-shell">
          <div className="plan-section-heading">
            <p className="eyebrow">{copy.faqTitle}</p>
            <h2>{copy.faqTitle}</h2>
          </div>

          <div className="plan-faq-grid">
            {plan.faqs.map((faq) => (
              <details className="plan-faq-item" key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="plan-other-section">
        <div className="site-shell">
          <div className="plan-other-panel">
            <div>
              <h2>{copy.comparePlans}</h2>
              <p>{plan.subtitle}</p>
            </div>
            <div className="plan-other-links">
              {otherPlans.map((otherPlan) => (
                <Link key={otherPlan.id} to={`/plans/${otherPlan.id}`}>
                  <span>{otherPlan.title}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FinalCTA
        title={copy.finalTitle}
        body={copy.finalBody}
        cta={copy.finalCta}
        to={assessmentPath}
      />
    </>
  )
}
