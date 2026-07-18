import {
  ArrowRight,
  BadgeEuro,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  House,
  Mail,
  MessageCircle,
  RadioTower,
  RotateCcw,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import type { WizardCopy } from '../../config/wizardCopy'
import { getWizardPlanPackages, type WizardConsumerPlan } from '../../config/wizardPlanPackages'
import { CASAMIA_CONTACT_EMAIL, CASAMIA_CONTACT_PHONE } from '../../constants/contact'
import type { SafetyWizardState, WizardResult } from '../../types/wizard'
import { PriceRangeCard } from './PriceRangeCard'
import { WizardVisualSafetyReport } from './WizardVisualSafetyReport'
import { WizardStep } from './WizardStep'

type PlanResultProps = {
  copy: WizardCopy
  language: string
  state: SafetyWizardState
  result: WizardResult
  submitting: boolean
  submitStatus?: 'success' | 'error'
  onPlanChange: (plan: WizardResult['selectedPlan']) => void
  onAction: (action: 'book-visit' | 'request-proposal' | 'business-consultation') => void
  onReset: () => void
}

const spanishImprovementLabels: Record<string, string> = {
  'secure-flooring': 'Asegurar alfombras y superficies resbaladizas',
  'improve-lighting': 'Mejorar la iluminación en rutas habituales',
  'secure-rugs': 'Retirar o fijar alfombras sueltas',
  'stair-support': 'Añadir agarre, luz y apoyo en escaleras',
  'threshold-access': 'Reducir o señalizar umbrales difíciles',
  'storage-reach': 'Colocar lo cotidiano a una altura accesible',
  'bathroom-support': 'Mejorar el acceso y los apoyos del baño',
  'emergency-alert': 'Añadir una opción de alerta de emergencia',
  'bathroom-review': 'Revisar transferencias y apoyos del baño',
  'bedroom-route': 'Hacer más segura la cama y la ruta nocturna',
  'kitchen-reach': 'Mejorar alcance, luz y agarre en la cocina',
  'living-route': 'Crear una ruta despejada en el salón',
  'stairs-review': 'Revisar pasamanos, contraste e iluminación',
  'entrance-support': 'Mejorar acceso y apoyo en la entrada',
  'outdoor-route': 'Mejorar caminos, escalones y luz exterior',
  'motion-lighting': 'Añadir luz con sensor en la ruta nocturna',
  'smart-safety': 'Revisar alertas, sensores y seguridad inteligente',
  'professional-review': 'Realizar una revisión guiada estancia por estancia',
}

const planIcons = {
  assessment: ClipboardCheck,
  'home-safety': House,
  'smart-safety': RadioTower,
  'business-consultation': ShieldCheck,
}

export function PlanResult({
  copy,
  language,
  state,
  result,
  submitting,
  submitStatus,
  onPlanChange,
  onAction,
  onReset,
}: PlanResultProps) {
  const isSpanish = language.toLowerCase().startsWith('es')
  const isClient = state.userType === 'client'
  const action = isClient ? 'business-consultation' : state.inspectionBooked ? 'request-proposal' : 'book-visit'
  const primaryLabel = isClient ? copy.result.business : state.inspectionBooked ? copy.result.requestProposal : copy.result.bookVisit
  const PlanIcon = planIcons[result.recommendedPlan]
  const immediateCount = result.improvements.filter((item) => item.priority === 'immediate').length
  const areaCount = result.priceRange?.areaCount
    ?? state.areasOfConcern.filter((area) => area !== 'not-sure').length
  const prioritySummary = isSpanish
    ? `${result.improvements.length} ${result.improvements.length === 1 ? 'prioridad' : 'prioridades'}`
    : `${result.improvements.length} ${result.improvements.length === 1 ? 'priority' : 'priorities'}`
  const areaSummary = isSpanish
    ? `${areaCount} ${areaCount === 1 ? 'zona relevante' : 'zonas relevantes'}`
    : `${areaCount} relevant ${areaCount === 1 ? 'area' : 'areas'}`
  const packages = getWizardPlanPackages(language)
  const recommendedConsumerPlan = result.recommendedPlan === 'business-consultation' ? 'assessment' : result.recommendedPlan
  const [expandedPlan, setExpandedPlan] = useState<WizardConsumerPlan | null>(recommendedConsumerPlan)
  const hasVisualReport = Boolean(result.safetyReport?.analysedPhotoCount)

  return (
    <WizardStep
      title={hasVisualReport
        ? isSpanish ? 'Tu informe de seguridad del hogar' : 'Your home safety report'
        : copy.result.title}
      icon={<ShieldCheck size={28} />}
      compact
    >
      {hasVisualReport && result.safetyReport ? (
        <WizardVisualSafetyReport language={language} report={result.safetyReport} state={state} />
      ) : <section className="safety-wizard-result-hero" aria-labelledby="wizard-result-plan-title">
        <span className="safety-wizard-result-plan-icon" aria-hidden="true">
          <PlanIcon size={28} />
        </span>
        <div>
          <p>{copy.result.recommendedPlan}</p>
          <h2 id="wizard-result-plan-title">{copy.result.plans[result.recommendedPlan]}</h2>
          <div className="safety-wizard-result-profile">
            <strong>{copy.result.profiles[result.safetyProfile]}</strong>
            <span>{copy.result.confidence[result.confidence]}</span>
          </div>
          {!isClient ? (
            <div className="safety-wizard-result-chips" aria-label={copy.result.profile}>
              <span><CheckCircle2 size={16} aria-hidden="true" /> {prioritySummary}</span>
              {areaCount ? <span><House size={16} aria-hidden="true" /> {areaSummary}</span> : null}
              {immediateCount ? <span className="is-urgent">{immediateCount} {copy.result.immediate.toLowerCase()}</span> : null}
            </div>
          ) : null}
        </div>
      </section>}

      {!isClient ? (
        <>
        <div className={`safety-wizard-result-content${hasVisualReport ? ' has-visual-report' : ''}`}>
          {!hasVisualReport ? <section className="safety-wizard-recommendations" aria-labelledby="wizard-result-improvements">
            <div className="safety-wizard-recommendations-heading">
              <h2 id="wizard-result-improvements">{copy.result.improvements}</h2>
              <span>{result.improvements.length}</span>
            </div>
            <ol className="safety-wizard-improvement-list">
              {result.improvements.map((improvement, index) => (
                <li className={improvement.priority === 'immediate' ? 'is-immediate' : undefined} key={improvement.id}>
                  <span className="safety-wizard-improvement-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <span>{copy.result[improvement.priority]}</span>
                    <strong>{isSpanish ? spanishImprovementLabels[improvement.id] ?? improvement.label : improvement.label}</strong>
                  </div>
                </li>
              ))}
            </ol>
          </section> : null}

          <aside className="safety-wizard-result-next-step" aria-label={copy.result.recommendedPlan}>
            {result.priceRange ? (
              <PriceRangeCard copy={copy} language={language} range={result.priceRange} />
            ) : (
              <div className="safety-wizard-estimate-pending">
                <ShieldCheck size={22} aria-hidden="true" />
                <div>
                  <strong>{copy.result.plans.assessment}</strong>
                  <p>{isSpanish ? 'Revisaremos la vivienda antes de confirmar productos y precio.' : 'We will review the home before confirming products and price.'}</p>
                </div>
              </div>
            )}

            {action === 'book-visit' ? (
              <div className="safety-wizard-result-visit-note">
                <CalendarCheck size={22} aria-hidden="true" />
                <div>
                  <strong>{copy.visit.price}</strong>
                  <span>{copy.visit.credit}</span>
                </div>
              </div>
            ) : null}

            {submitStatus ? (
              <div className={`safety-wizard-submit-status is-${submitStatus}`} role={submitStatus === 'error' ? 'alert' : 'status'}>
                {copy.submit[submitStatus]}
              </div>
            ) : null}

            <div className="safety-wizard-result-primary-actions">
              <button className="btn btn-navy" disabled={submitting} onClick={() => onAction(action)} type="button">
                {action === 'book-visit' ? <CalendarCheck size={20} aria-hidden="true" /> : <Send size={20} aria-hidden="true" />}
                {submitting ? copy.submit.sending : primaryLabel}
              </button>
              {CASAMIA_CONTACT_PHONE ? (
                <a className="btn btn-white" href={`tel:${CASAMIA_CONTACT_PHONE.replaceAll(' ', '')}`}>
                  <MessageCircle size={20} aria-hidden="true" /> {copy.result.speak}
                </a>
              ) : null}
            </div>

            <div className="safety-wizard-result-quiet-actions">
              <a href={`mailto:${CASAMIA_CONTACT_EMAIL}?subject=${encodeURIComponent(`CasaMia plan ${state.wizardReference}`)}`}>
                <Mail size={17} aria-hidden="true" /> {copy.result.email}
              </a>
              <button onClick={onReset} type="button">
                <RotateCcw size={17} aria-hidden="true" /> {copy.nav.startAgain}
              </button>
            </div>
          </aside>
        </div>

        <section className="safety-wizard-packages" aria-labelledby="safety-wizard-packages-title">
          <div className="safety-wizard-packages-heading">
            <header>
              <h2 id="safety-wizard-packages-title">{copy.result.packagesTitle}</h2>
              <p>{copy.result.packagesBody}</p>
            </header>
            <aside className="safety-wizard-grant-note" aria-label={copy.result.grantTitle}>
              <span className="safety-wizard-grant-note-icon" aria-hidden="true"><BadgeEuro size={22} /></span>
              <div>
                <strong>{copy.result.grantTitle}</strong>
                <p>{copy.result.grantBody}</p>
                <span>{copy.result.grantIncluded}</span>
                <small>{copy.result.grantCaveat}</small>
                <Link to="/grant-check">{copy.result.grantLink}<ArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            </aside>
          </div>

          <div className="safety-wizard-package-cards">
            {packages.map((plan) => {
              const PackageIcon = planIcons[plan.id]
              const isRecommended = plan.id === result.recommendedPlan
              const isSelected = plan.id === result.selectedPlan
              const isExpanded = plan.id === expandedPlan
              const detailsId = `safety-wizard-plan-${plan.id}`

              return (
                <article className={`safety-wizard-plan-card${isSelected ? ' is-selected' : ''}`} key={plan.id}>
                  <button
                    aria-controls={detailsId}
                    aria-expanded={isExpanded}
                    className="safety-wizard-plan-card-summary"
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                    type="button"
                  >
                    <span className="safety-wizard-plan-card-icon" aria-hidden="true">
                      <PackageIcon size={23} />
                    </span>
                    <span className="safety-wizard-plan-card-title">
                      <span className="safety-wizard-plan-card-badges">
                        {isRecommended ? <small>{copy.result.packageRecommended}</small> : null}
                        {isSelected ? <small className="is-selected"><Check size={13} aria-hidden="true" />{copy.result.packageSelected}</small> : null}
                      </span>
                      <strong>{copy.result.plans[plan.id]}</strong>
                      <span>{plan.summary}</span>
                    </span>
                    <span className="safety-wizard-plan-card-price">
                      {plan.price}
                      <small><Check size={14} aria-hidden="true" />{copy.result.packageManagement}</small>
                    </span>
                    <span className="safety-wizard-plan-card-more">
                      {isExpanded ? copy.result.packageHide : copy.result.packageDetails}
                      <ChevronDown className={isExpanded ? 'is-open' : ''} size={18} aria-hidden="true" />
                    </span>
                  </button>

                  {isExpanded ? (
                    <div className="safety-wizard-plan-card-details" id={detailsId}>
                      <p>{plan.outcome}</p>
                      <strong>{copy.result.packageIncludes}</strong>
                      <ul>
                        {plan.components.map((component) => (
                          <li key={component}><CheckCircle2 size={17} aria-hidden="true" />{component}</li>
                        ))}
                      </ul>
                      <button
                        className={isSelected ? 'btn btn-white' : 'btn btn-navy'}
                        disabled={isSelected}
                        onClick={() => onPlanChange(plan.id)}
                        type="button"
                      >
                        {isSelected ? copy.result.packageSelected : copy.result.packageChoose}
                      </button>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
        </>
      ) : (
        <>
          <div className="safety-wizard-business-result">
            <MessageCircle size={24} aria-hidden="true" />
            <p>{copy.result.confidence[result.confidence]}</p>
          </div>
          {submitStatus ? (
            <div className={`safety-wizard-submit-status is-${submitStatus}`} role={submitStatus === 'error' ? 'alert' : 'status'}>
              {copy.submit[submitStatus]}
            </div>
          ) : null}
          <div className="safety-wizard-result-actions">
            <button className="btn btn-navy" disabled={submitting} onClick={() => onAction(action)} type="button">
              <Send size={20} aria-hidden="true" /> {submitting ? copy.submit.sending : primaryLabel}
            </button>
            <button className="safety-wizard-text-button" onClick={onReset} type="button">
              <RotateCcw size={18} aria-hidden="true" /> {copy.nav.startAgain}
            </button>
          </div>
        </>
      )}
    </WizardStep>
  )
}
