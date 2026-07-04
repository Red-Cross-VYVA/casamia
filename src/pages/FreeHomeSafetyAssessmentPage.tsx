import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Home,
  Lightbulb,
  ShieldCheck,
  SmilePlus,
  Stethoscope,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { AssessmentForm } from '../components/AssessmentForm'
import { TrustBar } from '../components/TrustBar'

type BenefitItem = {
  title: string
  body: string
}

type IncludedItem = {
  title: string
  body: string
}

type StepItem = {
  title: string
  body: string
}

type PricingCopy = {
  title: string
  feeLabel: string
  fee: string
  body: string
  points: string[]
}

const benefitIcons = [ShieldCheck, SmilePlus, Home, Stethoscope, ClipboardCheck, UsersRound]

export function FreeHomeSafetyAssessmentPage() {
  const { t } = useTranslation()
  const benefits = t('assessment.benefits.items', { returnObjects: true }) as BenefitItem[]
  const included = t('assessment.included.items', { returnObjects: true }) as IncludedItem[]
  const steps = t('assessment.how.items', { returnObjects: true }) as StepItem[]
  const pricing = t('assessment.pricing', { returnObjects: true }) as PricingCopy

  useEffect(() => {
    document.title = `${t('assessment.metaTitle')} | CasaMia`
  }, [t])

  return (
    <>
      <section className="assessment-hero">
        <div className="assessment-hero-grid site-shell">
          <div>
            <h1>{t('assessment.hero.title')}</h1>
            <p>{t('assessment.hero.subtitle')}</p>
            <div className="assessment-hero-actions">
              <a className="btn btn-green" href="#assessment-form">
                {t('assessment.hero.cta')}
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              <a className="btn btn-white" href="/#top">
                {t('assessment.hero.secondaryCta')}
              </a>
              <span>{t('assessment.hero.reassurance')}</span>
            </div>
          </div>

          <aside className="assessment-hero-panel">
            <span>
              <Lightbulb size={26} aria-hidden="true" />
            </span>
            <h2>{t('assessment.hero.panelTitle')}</h2>
            <p>{t('assessment.hero.panelBody')}</p>
            <div className="assessment-fee-card">
              <WalletCards size={24} aria-hidden="true" />
              <div>
                <small>{pricing.feeLabel}</small>
                <strong>{pricing.fee}</strong>
              </div>
            </div>
            <ul>
              {included.slice(0, 3).map((item) => (
                <li key={item.title}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {item.title}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <TrustBar />

      <section className="assessment-pricing-strip">
        <div className="assessment-pricing-panel site-shell">
          <div>
            <p className="eyebrow">{pricing.feeLabel}</p>
            <h2>{pricing.title}</h2>
            <p>{pricing.body}</p>
          </div>
          <ul>
            {pricing.points.map((point) => (
              <li key={point}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="assessment-benefits section-pad">
        <div className="site-shell">
          <div className="assessment-section-heading">
            <h2 className="display-title">{t('assessment.benefits.title')}</h2>
          </div>
          <div className="assessment-benefit-grid mt-12">
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[index] ?? ShieldCheck

              return (
                <article className="assessment-benefit-card" key={benefit.title}>
                  <span>
                    <Icon size={25} aria-hidden="true" />
                  </span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="assessment-included section-pad">
        <div className="site-shell">
          <div className="assessment-included-grid">
            <div>
              <h2 className="display-title">{t('assessment.included.title')}</h2>
              <p>{t('assessment.included.body')}</p>
            </div>
            <div className="assessment-included-list">
              {included.map((item) => (
                <article key={item.title}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="assessment-how section-pad">
        <div className="site-shell">
          <div className="assessment-section-heading">
            <h2 className="display-title">{t('assessment.how.title')}</h2>
          </div>
          <div className="assessment-step-grid mt-12">
            {steps.map((step, index) => (
              <article className="assessment-step-card" key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="assessment-form-section section-pad">
        <div className="assessment-form-layout site-shell">
          <div className="assessment-form-copy">
            <h2 className="display-title">{t('assessment.formSection.title')}</h2>
            <p>{t('assessment.formSection.body')}</p>
          </div>
          <AssessmentForm />
        </div>
      </section>

      <section className="assessment-final-cta">
        <div className="site-shell">
          <div className="assessment-final-panel">
            <h2>{t('assessment.final.title')}</h2>
            <a className="btn btn-green" href="#assessment-form">
              {t('assessment.hero.cta')}
              <ArrowRight size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
