import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { TrustBar } from '../components/TrustBar'
import { TrustSection } from '../components/TrustSection'

type PlanCard = {
  id: string
  name: string
  description: string
  bestFor: string
  deliverables: string[]
  cta: string
}

type ComparisonRow = {
  feature: string
  assessment: ComparisonStatus
  safety: ComparisonStatus
  smart: ComparisonStatus
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

const planIcons = [ClipboardCheck, ShieldCheck, Smartphone]

export function PlansPage() {
  const { t } = useTranslation()
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
                <article className="plans-choice-card" key={plan.id}>
                  <span className="plans-choice-icon">
                    <Icon size={26} aria-hidden="true" />
                  </span>
                  <h3>{plan.name}</h3>
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
                  <Link className="btn btn-navy" to={`/plans/${plan.id}`}>
                    {plan.cta}
                    <ArrowRight size={20} aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
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
                    <ComparisonCell label={statusLabels[row.assessment]} status={row.assessment} />
                    <ComparisonCell label={statusLabels[row.safety]} status={row.safety} />
                    <ComparisonCell label={statusLabels[row.smart]} status={row.smart} />
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
