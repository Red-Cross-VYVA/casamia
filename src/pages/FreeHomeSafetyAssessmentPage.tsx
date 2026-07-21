import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Home,
  ShieldCheck,
  SmilePlus,
  Stethoscope,
  UsersRound,
} from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { AssessmentForm } from '../components/AssessmentForm'
import { SelfInspectionTool } from '../components/SelfInspectionTool'
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
  const { i18n, t } = useTranslation()
  const [searchParams] = useSearchParams()
  const benefits = t('assessment.benefits.items', { returnObjects: true }) as BenefitItem[]
  const included = t('assessment.included.items', { returnObjects: true }) as IncludedItem[]
  const steps = t('assessment.how.items', { returnObjects: true }) as StepItem[]
  const pricing = t('assessment.pricing', { returnObjects: true }) as PricingCopy
  const isReportBookingFlow = searchParams.get('source') === 'free-report'
  const isSpanish = i18n.language.startsWith('es')

  useEffect(() => {
    document.title = `${t('assessment.metaTitle')} | CasaMia`
  }, [t])

  useEffect(() => {
    if (!isReportBookingFlow) {
      return
    }

    window.requestAnimationFrame(() => {
      document.getElementById('assessment-form')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }, [isReportBookingFlow])

  return (
    <>
      <section className="assessment-hero">
        <div className="assessment-hero-grid site-shell">
          <div>
            <h1>
              {isReportBookingFlow
                ? isSpanish
                  ? 'Coordina tu evaluación a domicilio'
                  : 'Coordinate your in-home assessment'
                : t('assessment.hero.title')}
            </h1>
            <p>
              {isReportBookingFlow
                ? isSpanish
                  ? 'Ya has completado el informe gratuito. Elige el mejor canal y horario para que CasaMia coordine la visita.'
                  : 'You have completed the free report. Choose the best way and time for CasaMia to coordinate the visit.'
                : t('assessment.hero.subtitle')}
            </p>
            <div className="assessment-hero-actions">
              <a className="btn btn-green" href="#assessment-form">
                {t('assessment.hero.cta')}
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              <Link className="btn btn-white" to="/home-safety-wizard">
                {t('wizard.cta')}
              </Link>
              <span>{t('assessment.hero.reassurance')}</span>
            </div>
          </div>

          <aside className="assessment-hero-panel assessment-hero-panel-visual">
            <img
              alt={isSpanish ? 'Inspector CasaMia revisando una vivienda' : 'CasaMia inspector reviewing a home'}
              src="/images/assessment/casamia-inspector-tablet.jpg"
            />
            <div className="assessment-visit-overlay">
              <div>
                <span className="assessment-visit-kicker">
                  {isSpanish ? 'Visita opcional' : 'Optional expert visit'}
                </span>
                <h2>{isSpanish ? 'Un experto revisa la vivienda contigo.' : 'An expert reviews the home with you.'}</h2>
                <ul>
                  {included.slice(0, 2).map((item) => (
                    <li key={item.title}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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

      <SelfInspectionTool />

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
            <h2 className="display-title">
              {isReportBookingFlow
                ? isSpanish
                  ? 'Elige cómo debe coordinar CasaMia la visita'
                  : 'Choose how CasaMia should coordinate the visit'
                : t('assessment.formSection.title')}
            </h2>
            <p>
              {isReportBookingFlow
                ? isSpanish
                  ? 'Indica el canal y horario más cómodo para que el equipo confirme tu evaluación a domicilio.'
                  : 'Tell us the best contact channel and timing so the team can confirm your in-home assessment.'
                : t('assessment.formSection.body')}
            </p>
          </div>
          <AssessmentForm mode={isReportBookingFlow ? 'booking' : 'default'} />
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
