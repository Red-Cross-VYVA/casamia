import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { TrustBar } from '../components/TrustBar'
import { TrustSection } from '../components/TrustSection'

type PlanCard = {
  id: string
  name: string
  price?: string
  description: string
  bestFor: string
  deliverables: string[]
  cta: string
  featured?: boolean
}

type ComparisonRow = {
  feature: string
  essential: ComparisonStatus
  advanced: ComparisonStatus
  premium: ComparisonStatus
}

type ComparisonStatus = 'included' | 'notIncluded' | 'whereNeeded' | 'optional' | 'recommendationsOnly'

type PaymentTerm = {
  title: string
  body: string
}

type NextStep = {
  title: string
  body: string
}

type FaqItem = {
  question: string
  answer: string
}

type PlanMatrixItem = {
  item: string
  room: string
  essential: boolean
  advanced: boolean
  premium: boolean
}

type PlanMatrixPlanId = 'essential' | 'advanced' | 'premium'

const planIcons = [ClipboardCheck, ShieldCheck, Smartphone]

const planMatrixItems: PlanMatrixItem[] = [
  { item: 'Free home safety audit', room: 'Whole Home', essential: true, advanced: true, premium: true },
  { item: 'Grant application management', room: 'Whole Home', essential: true, advanced: true, premium: true },
  { item: 'Handrails & grab bars', room: 'Entry', essential: true, advanced: true, premium: true },
  { item: 'Motion-activated lighting', room: 'Entry', essential: true, advanced: true, premium: true },
  { item: 'Non-slip entry flooring', room: 'Entry', essential: true, advanced: true, premium: true },
  { item: 'Smart door lock', room: 'Entry', essential: false, advanced: true, premium: true },
  { item: 'Furniture optimisation (clear pathways)', room: 'Living Room', essential: false, advanced: true, premium: true },
  { item: 'Non-slip flooring', room: 'Living Room', essential: true, advanced: true, premium: true },
  { item: 'Motion-activated lighting', room: 'Living Room', essential: true, advanced: true, premium: true },
  { item: 'Emergency call button', room: 'Living Room', essential: false, advanced: true, premium: true },
  { item: 'Handrails (both sides)', room: 'Stairway', essential: true, advanced: true, premium: true },
  { item: 'Non-slip stair treads with contrast edging', room: 'Stairway', essential: true, advanced: true, premium: true },
  { item: 'Motion-activated stairway lighting', room: 'Stairway', essential: true, advanced: true, premium: true },
  { item: 'Stair & hallway safety upgrade', room: 'Stairway', essential: false, advanced: true, premium: true },
  { item: 'Water leak & auto shut-off sensor', room: 'Kitchen', essential: false, advanced: true, premium: true },
  { item: 'Stove/cooktop auto shut-off', room: 'Kitchen', essential: false, advanced: false, premium: true },
  { item: 'Task lighting upgrade', room: 'Kitchen', essential: false, advanced: true, premium: true },
  { item: 'Medication reminders', room: 'Kitchen', essential: false, advanced: false, premium: true },
  { item: 'Smart pill dispenser with caregiver alerts', room: 'Kitchen', essential: false, advanced: false, premium: true },
  { item: 'Bedside fall mat & bed-exit sensor', room: 'Bedroom', essential: false, advanced: true, premium: true },
  { item: 'Adjustable bed / bed rail', room: 'Bedroom', essential: false, advanced: true, premium: true },
  { item: 'Motion-activated night lighting', room: 'Bedroom', essential: true, advanced: true, premium: true },
  { item: 'Emergency call pendant', room: 'Bedroom', essential: false, advanced: true, premium: true },
  { item: 'Sleep & fatigue tracking', room: 'Bedroom', essential: false, advanced: false, premium: true },
  { item: 'Horizontal grab bars', room: 'Bathroom', essential: true, advanced: true, premium: true },
  { item: 'Vertical grab bar at shower entry', room: 'Bathroom', essential: true, advanced: true, premium: true },
  { item: 'Adjustable motorized grab bar', room: 'Bathroom', essential: false, advanced: true, premium: true },
  { item: 'Raised toilet seat with armrests', room: 'Bathroom', essential: true, advanced: true, premium: true },
  { item: 'Non-slip flooring/surfaces', room: 'Bathroom', essential: true, advanced: true, premium: true },
  { item: 'Walk-in tub / curbless shower (optional upgrade)', room: 'Bathroom', essential: false, advanced: true, premium: true },
  { item: 'Cordless phone / signal repeater', room: 'Whole Home', essential: true, advanced: true, premium: true },
  { item: 'Anti-slip flooring throughout', room: 'Whole Home', essential: false, advanced: true, premium: true },
  { item: 'Contactless fall-detection sensor', room: 'Whole Home', essential: false, advanced: true, premium: true },
  { item: 'Voice-activated controls', room: 'Whole Home', essential: false, advanced: false, premium: true },
  { item: 'Smart lighting everywhere', room: 'Whole Home', essential: false, advanced: false, premium: true },
  { item: 'Vitals & health monitoring', room: 'Whole Home', essential: false, advanced: false, premium: true },
  { item: 'Fall detection sensors (wearable/pendant)', room: 'Whole Home', essential: false, advanced: false, premium: true },
  { item: 'Gait & balance monitoring', room: 'Whole Home', essential: false, advanced: false, premium: true },
  { item: '24/7 family & emergency alerts', room: 'Whole Home', essential: false, advanced: false, premium: true },
]

const planMatrixSummaries = [
  {
    id: 'essential',
    label: 'Essential',
    price: '€269',
    body: 'Entry, living room and stairway essentials.',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    price: '€1,149',
    body: 'Every room adapted with smart access and emergency systems.',
  },
  {
    id: 'premium',
    label: 'Premium',
    price: '€1,449',
    body: 'Full smart home and health monitoring in every room.',
  },
] as const

export function PlansPage() {
  const { t } = useTranslation()
  const [selectedMatrixPlan, setSelectedMatrixPlan] = useState<PlanMatrixPlanId>('advanced')
  const [selectedMatrixRoom, setSelectedMatrixRoom] = useState('All rooms')
  const [modalPlanId, setModalPlanId] = useState<PlanMatrixPlanId | null>(null)
  const [selectedDetailRoom, setSelectedDetailRoom] = useState('Whole Home')
  const cards = t('pages.plans.cards', { returnObjects: true }) as PlanCard[]
  const comparisonRows = t('pages.plans.comparison.rows', {
    returnObjects: true,
  }) as ComparisonRow[]
  const paymentTerms = t('pages.plans.payment.items', { returnObjects: true }) as PaymentTerm[]
  const nextSteps = t('pages.plans.next.steps', { returnObjects: true }) as NextStep[]
  const faqs = t('pages.plans.faq.items', { returnObjects: true }) as FaqItem[]
  const statusLabels = t('pages.plans.comparison.status', {
    returnObjects: true,
  }) as Record<ComparisonStatus, string>

  useEffect(() => {
    document.title = `${t('pages.plans.metaTitle')} | CasaMia`
  }, [t])

  const matrixRooms = useMemo(() => getPlanMatrixRooms(planMatrixItems), [])
  const matrixRoomGroups = useMemo(
    () => getPlanMatrixRoomGroups(planMatrixItems, selectedMatrixPlan, selectedMatrixRoom),
    [selectedMatrixPlan, selectedMatrixRoom],
  )
  const selectedPlanSummary = planMatrixSummaries.find((plan) => plan.id === selectedMatrixPlan) ?? planMatrixSummaries[0]
  const modalPlanSummary = modalPlanId
    ? planMatrixSummaries.find((plan) => plan.id === modalPlanId)
    : undefined
  const modalRoomGroups = modalPlanId
    ? getPlanMatrixRoomGroups(planMatrixItems, modalPlanId, 'All rooms')
    : []
  const modalRooms = modalRoomGroups.map((group) => group.room)
  const activeModalRoom = modalRooms.includes(selectedDetailRoom) ? selectedDetailRoom : modalRooms[0]
  const activeModalItems =
    modalRoomGroups.find((group) => group.room === activeModalRoom)?.items ?? []

  function openPlanGallery(planId: string) {
    if (!isPlanMatrixPlanId(planId)) {
      return
    }

    setSelectedMatrixPlan(planId)
    setSelectedMatrixRoom('All rooms')
    setSelectedDetailRoom(getPlanMatrixRoomGroups(planMatrixItems, planId, 'All rooms')[0]?.room ?? 'Whole Home')
    setModalPlanId(planId)
  }

  return (
    <>
      <section className="plans-conversion-hero">
        <div className="plans-conversion-hero-inner site-shell">
          <div>
            <h1>{t('pages.plans.hero.title')}</h1>
            <p>{t('pages.plans.hero.subtitle')}</p>
            <div className="plans-hero-actions">
              <Link className="btn btn-green" to="/home-safety-assessment">
                {t('pages.plans.hero.primaryCta')}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <a className="btn btn-white" href="#compare-plans">
                {t('pages.plans.hero.secondaryCta')}
              </a>
            </div>
          </div>
          <aside className="plans-hero-summary" aria-label={t('pages.plans.explainer.title')}>
            <span>
              <Lightbulb size={25} aria-hidden="true" />
            </span>
            <h2>{t('pages.plans.explainer.title')}</h2>
            <p>{t('pages.plans.explainer.body')}</p>
          </aside>
        </div>
      </section>

      <TrustBar />

      <section className="plans-choice-section section-pad">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">{t('pages.plans.cardsTitle')}</h2>
            <p>{t('pages.plans.cardsIntro')}</p>
          </div>

          <div className="plans-choice-grid">
            {cards.map((plan, index) => {
              const Icon = planIcons[index] ?? ClipboardCheck

              return (
                <article className={`plans-choice-card ${plan.featured ? 'is-featured' : ''}`} key={plan.id}>
                  <span className="plans-choice-icon">
                    <Icon size={26} aria-hidden="true" />
                  </span>
                  <h3>{plan.name}</h3>
                  {plan.price ? <p className="plans-choice-price">{plan.price}</p> : null}
                  <p className="plans-choice-description">{plan.description}</p>
                  <div className="plans-best-for">
                    <strong>{t('pages.plans.bestForLabel')}</strong>
                    <span>{plan.bestFor}</span>
                  </div>
                  <ul>
                    {plan.deliverables.map((deliverable) => (
                      <li key={deliverable}>
                        <CheckCircle2 size={18} aria-hidden="true" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn btn-navy"
                    type="button"
                    onClick={() => openPlanGallery(plan.id)}
                  >
                    More
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {modalPlanId && modalPlanSummary ? (
        <div className="plan-detail-modal-backdrop" role="presentation" onClick={() => setModalPlanId(null)}>
          <section
            className="plan-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-detail-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="plan-detail-modal-head">
              <div>
                <p>{modalPlanSummary.label} package</p>
                <h2 id="plan-detail-modal-title">{modalPlanSummary.label} included solutions</h2>
                <span>
                  {countPlanItems(planMatrixItems, modalPlanId)} items grouped by room, so families can see exactly
                  what the package covers.
                </span>
              </div>
              <button type="button" onClick={() => setModalPlanId(null)} aria-label="Close plan details">
                Close
              </button>
            </div>

            <div className="plan-detail-modal-tabs" aria-label={`${modalPlanSummary.label} rooms`}>
              {modalRooms.map((room) => (
                <button
                  className={room === activeModalRoom ? 'is-active' : ''}
                  key={room}
                  type="button"
                  onClick={() => setSelectedDetailRoom(room)}
                  aria-pressed={room === activeModalRoom}
                >
                  {room}
                </button>
              ))}
            </div>

            <div className="plan-detail-modal-grid">
              {activeModalItems.map((item) => (
                <article key={`${activeModalRoom}-${item.item}`}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <div>
                    <h3>{item.item}</h3>
                    <p>{getSolutionExplanation(item.item, activeModalRoom)}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="plan-detail-modal-actions">
              <Link className="btn btn-navy" to={`/home-safety-assessment?plan=${modalPlanId}`}>
                Request {modalPlanSummary.label}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      ) : null}

      <section className="plans-matrix-section section-pad" id="plan-product-gallery">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">Plan items by room</h2>
            <p>
              A room-by-room view of what each CasaMia package includes, based on the plan item sheet.
            </p>
          </div>

          <div className="plans-matrix-summary" aria-label="Choose a plan to inspect">
            {planMatrixSummaries.map((plan) => (
              <button
                className={plan.id === selectedMatrixPlan ? 'is-active' : ''}
                key={plan.id}
                type="button"
                onClick={() => setSelectedMatrixPlan(plan.id)}
                aria-pressed={plan.id === selectedMatrixPlan}
              >
                <strong>{plan.label}</strong>
                <span>{plan.price}</span>
                <p>{plan.body}</p>
                <small>{countPlanItems(planMatrixItems, plan.id)} included items</small>
              </button>
            ))}
          </div>

          <div className="plans-matrix-explorer">
            <div className="plans-matrix-explorer-heading">
              <div>
                <p>{selectedPlanSummary.label} package</p>
                <h3>{countPlanItems(planMatrixItems, selectedMatrixPlan)} included items by room</h3>
              </div>
              <Link className="btn btn-navy" to={`/home-safety-assessment?plan=${selectedMatrixPlan}`}>
                Request {selectedPlanSummary.label}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </div>

            <div className="plans-matrix-room-filter" aria-label="Filter plan items by room">
              {['All rooms', ...matrixRooms].map((room) => (
                <button
                  className={room === selectedMatrixRoom ? 'is-active' : ''}
                  key={room}
                  type="button"
                  onClick={() => setSelectedMatrixRoom(room)}
                  aria-pressed={room === selectedMatrixRoom}
                >
                  {room}
                </button>
              ))}
            </div>

            <div className="plans-matrix-list">
            {matrixRoomGroups.map((group) => (
              <article className="plans-matrix-room" key={group.room}>
                <div className="plans-matrix-room-header">
                  <h3>{group.room}</h3>
                  <span>{group.items.length} items</span>
                </div>
                <div className="plans-matrix-card-grid">
                  {group.items.map((item) => (
                    <div className="plans-matrix-item-card" key={`${group.room}-${item.item}`}>
                      <CheckCircle2 size={19} aria-hidden="true" />
                      <div>
                        <h4>{item.item}</h4>
                        <p>Included in {getIncludedPlanLabels(item).join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section className="plans-compare-section section-pad" id="compare-plans">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">{t('pages.plans.comparison.title')}</h2>
            <p>{t('pages.plans.comparison.intro')}</p>
          </div>
          <div className="plans-compare-scroll" role="region" aria-label={t('pages.plans.comparison.title')}>
            <table className="plans-comparison-table">
              <thead>
                <tr>
                  {(t('pages.plans.comparison.headers', { returnObjects: true }) as string[]).map(
                    (header) => (
                      <th key={header}>{header}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    <ComparisonCell label={statusLabels[row.essential]} status={row.essential} />
                    <ComparisonCell label={statusLabels[row.advanced]} status={row.advanced} />
                    <ComparisonCell label={statusLabels[row.premium]} status={row.premium} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="plans-payment-section section-pad">
        <div className="site-shell">
          <div className="plans-payment-panel">
            <div>
              <h2 className="display-title">{t('pages.plans.payment.title')}</h2>
              <p>{t('pages.plans.payment.body')}</p>
            </div>
            <div className="plans-payment-grid">
              {paymentTerms.map((term) => (
                <article key={term.title}>
                  <h3>{term.title}</h3>
                  <p>{term.body}</p>
                </article>
              ))}
            </div>
            <div className="plans-payment-reassurance">
              <CheckCircle2 size={22} aria-hidden="true" />
              <p>{t('pages.plans.payment.reassurance')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="plans-next-section section-pad">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">{t('pages.plans.next.title')}</h2>
          </div>
          <div className="plans-next-grid">
            {nextSteps.map((step, index) => (
              <article className="plans-next-card" key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="plans-faq-section section-pad">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">{t('pages.plans.faq.title')}</h2>
          </div>
          <div className="plans-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <TrustSection />

      <section className="plans-final-cta">
        <div className="site-shell">
          <div className="plans-final-panel">
            <div>
              <h2>{t('pages.plans.final.title')}</h2>
              <p>{t('pages.plans.final.body')}</p>
            </div>
            <Link className="btn btn-green" to="/home-safety-assessment">
              {t('pages.plans.final.cta')}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function ComparisonCell({ label, status }: { label: string; status: ComparisonStatus }) {
  const included = status !== 'notIncluded'
  const Icon = included ? CheckCircle2 : XCircle

  return (
    <td className={`plans-comparison-status is-${status}`}>
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
    </td>
  )
}

function getPlanMatrixRooms(items: PlanMatrixItem[]) {
  const rooms = ['Whole Home', 'Entry', 'Living Room', 'Stairway', 'Kitchen', 'Bedroom', 'Bathroom']
  return rooms.filter((room) => items.some((item) => item.room === room))
}

function getPlanMatrixRoomGroups(
  items: PlanMatrixItem[],
  plan: PlanMatrixPlanId,
  selectedRoom: string,
) {
  const rooms = selectedRoom === 'All rooms' ? getPlanMatrixRooms(items) : [selectedRoom]

  return rooms
    .map((room) => ({
      room,
      items: items.filter((item) => item.room === room && item[plan]),
    }))
    .filter((group) => group.items.length > 0)
}

function countPlanItems(items: PlanMatrixItem[], plan: PlanMatrixPlanId) {
  return items.filter((item) => item[plan]).length
}

function getIncludedPlanLabels(item: PlanMatrixItem) {
  return planMatrixSummaries
    .filter((plan) => item[plan.id])
    .map((plan) => plan.label)
}

function isPlanMatrixPlanId(planId: string): planId is PlanMatrixPlanId {
  return planId === 'essential' || planId === 'advanced' || planId === 'premium'
}

function getSolutionExplanation(item: string, room: string) {
  const lowerItem = item.toLowerCase()
  const lowerRoom = room.toLowerCase()

  if (lowerItem.includes('audit')) {
    return 'A specialist reviews the home first, so the package is based on real daily movement and risk.'
  }

  if (lowerItem.includes('grant')) {
    return 'CasaMia helps organise the paperwork and follow-up needed for eligible adaptation support.'
  }

  if (lowerItem.includes('grab') || lowerItem.includes('handrail') || lowerItem.includes('bed rail')) {
    return 'Adds a stable support point exactly where standing, turning, stairs, or transfers need extra control.'
  }

  if (lowerItem.includes('motion') || lowerItem.includes('lighting') || lowerItem.includes('light')) {
    return 'Improves visibility before the person reaches the risky area, especially at night or between rooms.'
  }

  if (lowerItem.includes('non-slip') || lowerItem.includes('anti-slip') || lowerItem.includes('treads')) {
    return 'Creates more grip underfoot so smooth floors, wet areas, thresholds, and steps feel more secure.'
  }

  if (lowerItem.includes('lock') || lowerItem.includes('door')) {
    return 'Reduces rushed trips to the entrance and gives family safer access when help is needed.'
  }

  if (lowerItem.includes('furniture') || lowerItem.includes('pathway')) {
    return 'Clears the walking route so daily movement is easier with a cane, walker, or reduced balance.'
  }

  if (lowerItem.includes('emergency') || lowerItem.includes('call') || lowerItem.includes('alert')) {
    return 'Keeps help within reach from the room where a fall, dizziness, or urgent moment may happen.'
  }

  if (lowerItem.includes('leak') || lowerItem.includes('shut-off')) {
    return 'Catches water or appliance risks early, before they create slippery floors or a bigger home emergency.'
  }

  if (lowerItem.includes('stove') || lowerItem.includes('cooktop')) {
    return 'Adds protection around cooking routines where forgetfulness, reach, or heat can create risk.'
  }

  if (lowerItem.includes('medication') || lowerItem.includes('pill')) {
    return 'Supports daily medication timing and can reduce the family’s need to chase routine reminders.'
  }

  if (lowerItem.includes('bedside') || lowerItem.includes('bed-exit') || lowerItem.includes('fall mat')) {
    return 'Adds extra protection around getting in and out of bed, when fatigue and low light often combine.'
  }

  if (lowerItem.includes('sleep') || lowerItem.includes('fatigue')) {
    return 'Helps family understand rest patterns that may affect balance, alertness, and fall risk.'
  }

  if (lowerItem.includes('toilet')) {
    return 'Raises and supports toilet transfers so sitting and standing require less strain and less balance recovery.'
  }

  if (lowerItem.includes('shower') || lowerItem.includes('tub')) {
    return 'Reduces the hardest bathroom transfer by lowering the step, improving access, and adding support.'
  }

  if (lowerItem.includes('voice')) {
    return 'Lets the person control lights or compatible devices without rushing, reaching, or walking unnecessarily.'
  }

  if (lowerItem.includes('vitals') || lowerItem.includes('health')) {
    return 'Adds a clearer picture of wellbeing so family can spot changes before they become urgent.'
  }

  if (lowerItem.includes('gait') || lowerItem.includes('balance')) {
    return 'Looks for changes in walking stability that may signal rising fall risk.'
  }

  if (lowerItem.includes('phone') || lowerItem.includes('signal')) {
    return 'Improves the chance that help, calls, and alerts work from the places used most often.'
  }

  return `Explains how this ${lowerRoom} improvement reduces friction, supports confidence, and lowers everyday risk.`
}
