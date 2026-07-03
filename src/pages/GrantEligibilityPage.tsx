import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  FileText,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ReportDeliveryForm } from '../components/ReportDeliveryForm'
import { sendReportDelivery, type DeliveryChannelStatus } from '../services/estimateWorkflow'
import { isReportDeliveryReady } from '../utils/reportDelivery'

type FormState = {
  region: string
  postcode: string
  homeType: string
  ownership: string
  residentAge: string
  mobility: string
  recognisedStatus: string
  needs: string[]
  timeline: string
  name: string
  phone: string
  email: string
  deliveryEmail: boolean
  deliveryWhatsapp: boolean
  consent: boolean
}

type Result = {
  title: string
  summary: string
  score: number
  tone: 'strong' | 'review' | 'watch'
  reasons: string[]
  managedByCasamia: string[]
  neededFromUser: string[]
}

type Option = {
  value: string
  label: string
}

const initialForm: FormState = {
  region: '',
  postcode: '',
  homeType: '',
  ownership: '',
  residentAge: '',
  mobility: '',
  recognisedStatus: '',
  needs: [],
  timeline: '',
  name: '',
  phone: '',
  email: '',
  deliveryEmail: true,
  deliveryWhatsapp: false,
  consent: false,
}

export function GrantEligibilityPage() {
  const { i18n } = useTranslation()
  const copy = useMemo(() => getGrantCopy(i18n.resolvedLanguage ?? i18n.language), [
    i18n.language,
    i18n.resolvedLanguage,
  ])
  const [form, setForm] = useState<FormState>(initialForm)
  const [step, setStep] = useState(0)
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [delivery, setDelivery] = useState<{
    email: DeliveryChannelStatus
    whatsapp: DeliveryChannelStatus
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [reportToken] = useState(() => createGrantToken())

  const result = useMemo(() => calculateResult(form, copy), [form, copy])
  const canContinue = getStepCompletion(step, form)

  function updateField<Field extends keyof FormState>(field: Field, value: FormState[Field]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleNeed(need: string) {
    setForm((current) => ({
      ...current,
      needs: current.needs.includes(need)
        ? current.needs.filter((item) => item !== need)
        : [...current.needs, need],
    }))
  }

  async function sendGrantReport() {
    try {
      setDeliveryStatus('loading')
      setErrorMessage('')
      const queued = await sendReportDelivery({
        reportType: 'grant',
        token: reportToken,
        reportTitle: result.title,
        reportUrl: `${window.location.origin}/grant-check?report=${reportToken}`,
        contact: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          deliveryEmail: form.deliveryEmail,
          deliveryWhatsapp: form.deliveryWhatsapp,
          consentAt: new Date().toISOString(),
        },
      })
      setDelivery(queued)
      setDeliveryStatus('success')
    } catch {
      setDeliveryStatus('error')
      setErrorMessage(copy.errors.delivery)
    }

    window.localStorage.setItem(
      'casamia-grant-readiness-lead',
      JSON.stringify({
        capturedAt: new Date().toISOString(),
        form,
        result,
        token: reportToken,
      }),
    )
  }

  const reportSummary = buildReportSummary(form, result, copy)

  return (
    <>
      <section className="grant-check-hero page-hero">
        <div className="page-hero-inner">
          <div className="grant-hero-card">
            <div className="grant-hero-main">
              <Link className="grant-back-link" to="/#grants">
                <ArrowLeft size={18} aria-hidden="true" />
                {copy.hero.back}
              </Link>
              <h1 className="display-title">{copy.hero.title}</h1>
              <p className="mt-5 max-w-3xl text-xl text-text-mid">
                {copy.hero.intro}
              </p>
              <div className="grant-hero-actions">
                <a className="btn btn-green" href="#grant-check-wizard">
                  {copy.actions.startNow}
                  <ArrowRight size={20} aria-hidden="true" />
                </a>
                <span>{copy.hero.helper}</span>
              </div>
              <div className="grant-hero-points" aria-label={copy.hero.pointsLabel}>
                {copy.hero.points.map((point) => (
                  <span key={point}>
                    <Check size={16} aria-hidden="true" />
                    {point}
                  </span>
                ))}
              </div>
            </div>
            <aside className="grant-check-note">
              <ShieldCheck className="text-green" size={26} aria-hidden="true" />
              <p>{copy.hero.note}</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="grant-check-section section-pad bg-white">
        <div className="site-shell grant-check-shell" id="grant-check-wizard">
          <div className="grant-check-panel">
            <div className="grant-progress" aria-label={copy.progressLabel}>
              {copy.progress.map((label, index) => (
                <button
                  className={`grant-progress-step ${step === index ? 'is-active' : ''} ${step > index ? 'is-complete' : ''}`}
                  key={label}
                  onClick={() => {
                    if (index <= step) {
                      setStep(index)
                    }
                  }}
                  type="button"
                >
                  <span>{index + 1}</span>
                  {label}
                </button>
              ))}
            </div>

            <div className="grant-step-card">
              {step === 0 ? (
                <StepCard
                  icon={<MapPin size={24} aria-hidden="true" />}
                  kicker={copy.steps.home.kicker}
                  title={copy.steps.home.title}
                  intro={copy.steps.home.intro}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField
                      label={copy.fields.region}
                      value={form.region}
                      options={copy.options.regions}
                      placeholder={copy.placeholders.region}
                      onChange={(value) => updateField('region', value)}
                    />
                    <TextField
                      label={copy.fields.postcode}
                      value={form.postcode}
                      placeholder={copy.placeholders.postcode}
                      onChange={(value) => updateField('postcode', value)}
                    />
                    <SelectField
                      label={copy.fields.homeType}
                      value={form.homeType}
                      options={copy.options.homeTypes}
                      placeholder={copy.placeholders.homeType}
                      onChange={(value) => updateField('homeType', value)}
                    />
                    <SelectField
                      label={copy.fields.ownership}
                      value={form.ownership}
                      options={copy.options.ownership}
                      placeholder={copy.placeholders.ownership}
                      onChange={(value) => updateField('ownership', value)}
                    />
                  </div>
                </StepCard>
              ) : null}

              {step === 1 ? (
                <StepCard
                  icon={<UserRound size={24} aria-hidden="true" />}
                  kicker={copy.steps.resident.kicker}
                  title={copy.steps.resident.title}
                  intro={copy.steps.resident.intro}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField
                      label={copy.fields.residentAge}
                      value={form.residentAge}
                      options={copy.options.ages}
                      placeholder={copy.placeholders.residentAge}
                      onChange={(value) => updateField('residentAge', value)}
                    />
                    <SelectField
                      label={copy.fields.mobility}
                      value={form.mobility}
                      options={copy.options.mobility}
                      placeholder={copy.placeholders.mobility}
                      onChange={(value) => updateField('mobility', value)}
                    />
                    <SelectField
                      label={copy.fields.recognisedStatus}
                      value={form.recognisedStatus}
                      options={copy.options.statuses}
                      placeholder={copy.placeholders.recognisedStatus}
                      onChange={(value) => updateField('recognisedStatus', value)}
                    />
                    <SelectField
                      label={copy.fields.timeline}
                      value={form.timeline}
                      options={copy.options.timelines}
                      placeholder={copy.placeholders.timeline}
                      onChange={(value) => updateField('timeline', value)}
                    />
                  </div>
                </StepCard>
              ) : null}

              {step === 2 ? (
                <StepCard
                  icon={<Home size={24} aria-hidden="true" />}
                  kicker={copy.steps.needs.kicker}
                  title={copy.steps.needs.title}
                  intro={copy.steps.needs.intro}
                >
                  <div className="grant-choice-grid">
                    {copy.options.needs.map((need) => (
                      <button
                        className={`grant-choice ${form.needs.includes(need.value) ? 'is-selected' : ''}`}
                        key={need.value}
                        onClick={() => toggleNeed(need.value)}
                        type="button"
                      >
                        <Check size={18} aria-hidden="true" />
                        {need.label}
                      </button>
                    ))}
                  </div>
                </StepCard>
              ) : null}

              {step === 3 ? (
                <StepCard
                  icon={<Sparkles size={24} aria-hidden="true" />}
                  kicker={copy.steps.report.kicker}
                  title={result.title}
                  intro={result.summary}
                >
                  <div className="grant-inline-result grant-report-handoff">
                    <div className="grant-result-score">
                      <span>{result.score}%</span>
                      <small>{copy.result.readiness}</small>
                    </div>
                    <div className="grant-handoff-copy">
                      <h3>{copy.result.handoffTitle}</h3>
                      <p>{copy.result.handoffBody}</p>
                      <ul>
                        {copy.result.handoffPoints.map((point) => (
                          <li key={point}>
                            <Check size={16} aria-hidden="true" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </StepCard>
              ) : null}

              {step === 4 ? (
                <StepCard
                  icon={<UserRound size={24} aria-hidden="true" />}
                  kicker={copy.steps.send.kicker}
                  title={copy.steps.send.title}
                  intro={copy.steps.send.intro}
                >
                  <ReportDeliveryForm
                    value={form}
                    consentText={copy.steps.send.consent}
                    onChange={updateField}
                  />
                  {deliveryStatus === 'success' && delivery ? (
                    <p className="delivery-status-message is-success">
                      {buildDeliveryMessage(delivery, copy.delivery)}
                    </p>
                  ) : null}
                  {deliveryStatus === 'error' ? (
                    <p className="delivery-status-message is-error">{errorMessage}</p>
                  ) : null}
                </StepCard>
              ) : null}

              <div className="grant-step-actions">
                <button
                  className="btn btn-white"
                  disabled={step === 0}
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  type="button"
                >
                  {copy.actions.back}
                </button>
                {step < 4 ? (
                  <button
                    className="btn btn-navy"
                    disabled={!canContinue}
                    onClick={() => setStep((current) => Math.min(4, current + 1))}
                    type="button"
                  >
                    {step === 3 ? copy.actions.sendThisReport : copy.actions.continue}
                    {step === 3 ? (
                      <ClipboardCheck size={20} aria-hidden="true" />
                    ) : (
                      <ArrowRight size={20} aria-hidden="true" />
                    )}
                  </button>
                ) : (
                  <button
                    className="btn btn-green"
                    disabled={!canContinue || deliveryStatus === 'loading' || deliveryStatus === 'success'}
                    onClick={sendGrantReport}
                    type="button"
                  >
                    {deliveryStatus === 'loading' ? copy.actions.sending : copy.actions.sendReport}
                    <ClipboardCheck size={20} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className={`grant-result-card result-${result.tone}`}>
            <div className="grant-result-score">
              <span>{result.score}%</span>
              <small>{copy.result.readiness}</small>
            </div>
            <p className="text-sm font-black uppercase tracking-wide text-green">{copy.result.instantReport}</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-text-dark">{result.title}</h2>
            <p className="mt-4 text-text-mid">{result.summary}</p>

            <ResultList title={copy.result.reasonsTitle} icon={<Sparkles size={18} aria-hidden="true" />} items={result.reasons} />
            <ResultList title={copy.result.managedTitle} icon={<ClipboardCheck size={18} aria-hidden="true" />} items={result.managedByCasamia} />
            <ResultList title={copy.result.neededTitle} icon={<FileText size={18} aria-hidden="true" />} items={result.neededFromUser} />

            {step >= 3 ? (
              <div className="grant-submitted">
                <p className="font-bold text-navy">{copy.result.readyTitle}</p>
                <p className="mt-1 text-sm text-text-mid">
                  {copy.result.readyBody(formatGrantValue(form.region, copy.options.regions, copy.summary.yourRegion))}
                </p>
              </div>
            ) : (
              <p className="mt-6 rounded-lg border border-border bg-light-blue p-4 text-sm font-semibold text-text-mid">
                {copy.result.placeholder}
              </p>
            )}

            <details className="grant-report-details">
              <summary>{copy.result.detailsSummary}</summary>
              <pre>{reportSummary}</pre>
            </details>
          </aside>
        </div>
      </section>
    </>
  )
}

function StepCard({
  children,
  icon,
  kicker,
  title,
  intro,
}: {
  children: ReactNode
  icon: ReactNode
  kicker: string
  title: string
  intro: string
}) {
  return (
    <div>
      <div className="grant-step-heading">
        <span>{icon}</span>
        <div>
          <p>{kicker}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-text-mid">{intro}</p>
      <div className="mt-8">{children}</div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <label className="grant-field">
      {label}
      <input
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  options: Option[]
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grant-field">
      {label}
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ResultList({
  title,
  icon,
  items,
}: {
  title: string
  icon: ReactNode
  items: string[]
}) {
  return (
    <div className="grant-result-list">
      <h3>
        {icon}
        {title}
      </h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <Check size={16} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function getStepCompletion(step: number, form: FormState) {
  if (step === 0) {
    return Boolean(form.region && form.postcode && form.homeType && form.ownership)
  }

  if (step === 1) {
    return Boolean(form.residentAge && form.mobility && form.recognisedStatus && form.timeline)
  }

  if (step === 2) {
    return form.needs.length > 0
  }

  if (step === 3) {
    return true
  }

  return isReportDeliveryReady(form)
}

function calculateResult(form: FormState, copy: GrantCopy): Result {
  const calculation = copy.calculation
  let score = 18
  const reasons: string[] = []
  const neededFromUser = [...calculation.neededFromUser.base]

  if (form.region) {
    score += 8
    reasons.push(calculation.reasons.region(formatGrantValue(form.region, copy.options.regions, form.region)))
  } else {
    reasons.push(calculation.reasons.missingRegion)
  }

  if (form.residentAge === '75+') {
    score += 18
    reasons.push(calculation.reasons.age75)
  } else if (form.residentAge === '65 to 74') {
    score += 13
    reasons.push(calculation.reasons.age65)
  } else if (form.residentAge === 'Family member answering') {
    score += 8
    reasons.push(calculation.reasons.family)
  }

  if (form.recognisedStatus === 'Recognised disability or dependency') {
    score += 18
    reasons.push(calculation.reasons.recognisedStatus)
    neededFromUser.push(calculation.neededFromUser.disability)
  } else if (form.recognisedStatus === 'Application in progress') {
    score += 11
    reasons.push(calculation.reasons.statusInProgress)
    neededFromUser.push(calculation.neededFromUser.statusInProgress)
  } else if (form.recognisedStatus === 'Prefer not to say') {
    score += 4
    reasons.push(calculation.reasons.privateStatus)
  }

  if (form.mobility.includes('cane') || form.mobility.includes('Wheelchair')) {
    score += 15
    reasons.push(calculation.reasons.mobilityNeed)
  } else if (form.mobility.includes('balance')) {
    score += 10
    reasons.push(calculation.reasons.balance)
  }

  if (form.needs.some((need) => ['Bathroom safety', 'Entrance access', 'Stairs or handrails', 'Door widening'].includes(need))) {
    score += 13
    reasons.push(calculation.reasons.commonWorks)
  } else if (form.needs.length > 0) {
    score += 8
    reasons.push(calculation.reasons.safetyNeeds)
  }

  if (form.ownership === 'Owner occupied' || form.ownership === 'Owned by family') {
    score += 8
    reasons.push(calculation.reasons.owner)
  } else if (form.ownership === 'Rented home') {
    score += 3
    reasons.push(calculation.reasons.rented)
    neededFromUser.push(calculation.neededFromUser.landlord)
  } else if (form.ownership === 'Community building works') {
    score += 6
    reasons.push(calculation.reasons.community)
    neededFromUser.push(calculation.neededFromUser.community)
  }

  if (form.timeline === 'As soon as possible' || form.timeline === 'Within 1 month') {
    score += 5
    reasons.push(calculation.reasons.urgent)
  }

  const readiness = Math.min(96, score)
  const baseManagement = calculation.casamiaManagement.base

  if (readiness >= 72) {
    return {
      title: calculation.results.strong.title,
      summary: calculation.results.strong.summary,
      score: readiness,
      tone: 'strong',
      reasons,
      managedByCasamia: baseManagement,
      neededFromUser,
    }
  }

  if (readiness >= 46) {
    return {
      title: calculation.results.review.title,
      summary: calculation.results.review.summary,
      score: readiness,
      tone: 'review',
      reasons,
      managedByCasamia: baseManagement,
      neededFromUser,
    }
  }

  return {
    title: calculation.results.watch.title,
    summary: calculation.results.watch.summary,
    score: readiness,
    tone: 'watch',
    reasons,
    managedByCasamia: calculation.casamiaManagement.watch,
    neededFromUser,
  }
}

type GrantCopy = ReturnType<typeof getGrantCopy>

function buildReportSummary(form: FormState, result: Result, copy: GrantCopy) {
  const empty = copy.summary.notProvided

  return [
    copy.summary.title,
    `${copy.summary.result}: ${result.title} (${result.score}% ${copy.result.readiness})`,
    `${copy.summary.region}: ${formatGrantValue(form.region, copy.options.regions, empty)} | ${copy.summary.postcode}: ${form.postcode || empty}`,
    `${copy.summary.home}: ${formatGrantValue(form.homeType, copy.options.homeTypes, empty)} | ${copy.summary.ownership}: ${formatGrantValue(form.ownership, copy.options.ownership, empty)}`,
    `${copy.summary.resident}: ${formatGrantValue(form.residentAge, copy.options.ages, empty)} | ${copy.summary.mobility}: ${formatGrantValue(form.mobility, copy.options.mobility, empty)}`,
    `${copy.summary.status}: ${formatGrantValue(form.recognisedStatus, copy.options.statuses, empty)}`,
    `${copy.summary.needs}: ${formatGrantNeeds(form.needs, copy.options.needs, empty)}`,
    `${copy.summary.timeline}: ${formatGrantValue(form.timeline, copy.options.timelines, empty)}`,
    `${copy.summary.contact}: ${form.name || empty} | ${form.phone || copy.summary.noPhone} | ${form.email || copy.summary.noEmail}`,
    ``,
    result.summary,
  ].join('\n')
}

function buildDeliveryMessage(
  delivery: { email: DeliveryChannelStatus; whatsapp: DeliveryChannelStatus },
  copy: GrantCopy['delivery'],
) {
  const messages = []

  if (delivery.email !== 'not_requested') {
    messages.push(copy.email)
  }

  if (delivery.whatsapp !== 'not_requested') {
    messages.push(copy.whatsapp)
  }

  return messages.join(' ')
}

function formatGrantValue(value: string, options: Option[], empty: string) {
  if (!value) {
    return empty
  }

  return options.find((option) => option.value === value)?.label ?? value
}

function formatGrantNeeds(values: string[], options: Option[], empty: string) {
  if (values.length === 0) {
    return empty
  }

  return values.map((value) => formatGrantValue(value, options, empty)).join(', ')
}

function getGrantCopy(language: string) {
  const regions: Option[] = [
    { value: 'Andalucia', label: language === 'es' ? 'Andalucía' : 'Andalucia' },
    { value: 'Aragon', label: language === 'es' ? 'Aragón' : 'Aragon' },
    { value: 'Asturias', label: 'Asturias' },
    { value: 'Balearic Islands', label: language === 'es' ? 'Islas Baleares' : 'Balearic Islands' },
    { value: 'Canary Islands', label: language === 'es' ? 'Canarias' : 'Canary Islands' },
    { value: 'Cantabria', label: 'Cantabria' },
    { value: 'Castilla-La Mancha', label: 'Castilla-La Mancha' },
    { value: 'Castilla y Leon', label: language === 'es' ? 'Castilla y León' : 'Castilla y Leon' },
    { value: 'Catalonia', label: language === 'es' ? 'Cataluña' : 'Catalonia' },
    { value: 'Community of Madrid', label: language === 'es' ? 'Comunidad de Madrid' : 'Community of Madrid' },
    { value: 'Comunidad Valenciana', label: 'Comunidad Valenciana' },
    { value: 'Extremadura', label: 'Extremadura' },
    { value: 'Galicia', label: 'Galicia' },
    { value: 'La Rioja', label: 'La Rioja' },
    { value: 'Murcia', label: 'Murcia' },
    { value: 'Navarra', label: 'Navarra' },
    { value: 'Basque Country', label: language === 'es' ? 'País Vasco' : 'Basque Country' },
    { value: 'Ceuta', label: 'Ceuta' },
    { value: 'Melilla', label: 'Melilla' },
  ]

  if (language === 'es') {
    return {
      hero: {
        back: 'Volver a ayudas',
        title: '¿Puedes recibir ayudas? Compruébalo gratis.',
        intro:
          'Responde unas preguntas, sin subir fotos, y recibe un informe práctico sobre tu preparación para posibles ayudas.',
        note:
          'No es una aprobación de ayudas. Las opciones dependen de la comunidad autónoma, convocatorias abiertas, vivienda y documentación.',
        helper: 'Tarda unos minutos y no necesitas documentos para empezar.',
        pointsLabel: 'Qué incluye el check',
        points: ['Sin subir fotos', 'Informe inmediato', 'Próximos pasos claros'],
      },
      progressLabel: 'Progreso de elegibilidad',
      progress: ['Vivienda', 'Persona', 'Necesidades', 'Informe', 'Enviar'],
      steps: {
        home: {
          kicker: 'Paso 1',
          title: '¿Dónde está la vivienda?',
          intro:
            'La ubicación y el tipo de vivienda son clave porque la mayoría de ayudas se gestionan por comunidad autónoma o municipio.',
        },
        resident: {
          kicker: 'Paso 2',
          title: '¿Quién necesita la adaptación?',
          intro:
            'Mantén la información general. CasaMia solo revisaría documentos sensibles más adelante si fueran necesarios.',
        },
        needs: {
          kicker: 'Paso 3',
          title: '¿Qué necesita mejorar?',
          intro:
            'Selecciona las adaptaciones o riesgos que ya conoces. Este flujo no necesita fotos.',
        },
        report: {
          kicker: 'Tu informe',
        },
        send: {
          kicker: 'Enviar informe',
          title: 'Envía tu informe de elegibilidad',
          intro:
            'El resultado ya está visible. Añade tus datos solo si quieres recibirlo por email o WhatsApp.',
          consent:
            'Acepto que CasaMia use esta información para enviarme mi informe de elegibilidad y contactarme sobre posibles ayudas regionales.',
        },
      },
      fields: {
        region: 'Comunidad autónoma',
        postcode: 'Código postal',
        homeType: 'Tipo de vivienda',
        ownership: 'Situación de la vivienda',
        residentAge: 'Edad de la persona residente',
        mobility: 'Movilidad',
        recognisedStatus: 'Discapacidad o dependencia',
        timeline: 'Plazo',
      },
      placeholders: {
        region: 'Elige comunidad',
        postcode: 'Ejemplo: 28013',
        homeType: 'Elige tipo de vivienda',
        ownership: 'Elige situación',
        residentAge: 'Elige edad',
        mobility: 'Elige la opción más cercana',
        recognisedStatus: 'Elige estado',
        timeline: 'Elige plazo',
      },
      options: {
        regions,
        homeTypes: [
          { value: 'Apartment', label: 'Piso' },
          { value: 'Townhouse', label: 'Casa adosada' },
          { value: 'Villa or detached home', label: 'Casa independiente' },
          { value: 'Residential building community', label: 'Comunidad de vecinos' },
        ],
        ownership: [
          { value: 'Owner occupied', label: 'Propietario residente' },
          { value: 'Owned by family', label: 'Propiedad familiar' },
          { value: 'Rented home', label: 'Vivienda alquilada' },
          { value: 'Community building works', label: 'Obras en zona común' },
        ],
        ages: [
          { value: 'Under 65', label: 'Menos de 65' },
          { value: '65 to 74', label: '65 a 74' },
          { value: '75+', label: '75+' },
          { value: 'Family member answering', label: 'Responde un familiar' },
        ],
        mobility: [
          { value: 'No major mobility issue', label: 'Sin problema importante de movilidad' },
          { value: 'Occasional balance or mobility concern', label: 'Equilibrio o movilidad ocasional' },
          { value: 'Uses cane or walker', label: 'Usa bastón o andador' },
          { value: 'Wheelchair or major mobility need', label: 'Silla de ruedas o movilidad reducida' },
        ],
        statuses: [
          { value: 'Recognised disability or dependency', label: 'Discapacidad o dependencia reconocida' },
          { value: 'Application in progress', label: 'Solicitud en trámite' },
          { value: 'No recognised status yet', label: 'Sin reconocimiento todavía' },
          { value: 'Prefer not to say', label: 'Prefiero no decirlo' },
        ],
        needs: [
          { value: 'Bathroom safety', label: 'Seguridad en baño' },
          { value: 'Entrance access', label: 'Acceso a la vivienda' },
          { value: 'Stairs or handrails', label: 'Escaleras o pasamanos' },
          { value: 'Non-slip flooring', label: 'Suelo antideslizante' },
          { value: 'Motion lighting', label: 'Iluminación con sensor' },
          { value: 'Door widening', label: 'Ensanche de puertas' },
          { value: 'Emergency alerts', label: 'Alertas de emergencia' },
          { value: 'Smart access', label: 'Acceso inteligente' },
          { value: 'Fall detection', label: 'Detección de caídas' },
        ],
        timelines: [
          { value: 'As soon as possible', label: 'Lo antes posible' },
          { value: 'Within 1 month', label: 'En 1 mes' },
          { value: 'Within 3 months', label: 'En 3 meses' },
          { value: 'Planning ahead', label: 'Estoy planificando' },
        ],
      },
      result: {
        readiness: 'preparación',
        instantReport: 'Informe instantáneo',
        reasonsTitle: 'Por qué aparece este resultado',
        managedTitle: 'Qué gestionará CasaMia',
        neededTitle: 'Qué necesitamos de ti',
        handoffTitle: 'El informe ya tiene lo esencial.',
        handoffBody:
          'En el siguiente paso puedes enviarlo por email o WhatsApp. CasaMia usará estos datos para revisar la vía de ayuda y decirte exactamente qué falta.',
        handoffPoints: [
          'No pedimos certificados ahora si no los tienes.',
          'No presentamos nada sin revisar la convocatoria y confirmarlo contigo.',
          'El seguimiento se centra en permisos, alcance y documentación real.',
        ],
        readyTitle: 'Tu informe está listo.',
        readyBody: (region: string) =>
          `CasaMia puede revisar la vía de ayuda para ${region} y enviarte un resumen claro de lo que falta si eliges recibirlo.`,
        placeholder:
          'Responde las preguntas para ver tu informe de elegibilidad. No necesitas subir fotos.',
        detailsSummary: 'Ver resumen del informe',
      },
      actions: {
        back: 'Atrás',
        continue: 'Continuar',
        startNow: 'Empezar ahora',
        sendThisReport: 'Enviar este informe',
        sendReport: 'Enviar informe',
        sending: 'Preparando envío',
      },
      delivery: {
        email: 'El informe completo queda preparado para enviarse por email.',
        whatsapp: 'El WhatsApp incluirá solo un enlace seguro al informe.',
      },
      errors: {
        delivery: 'No pudimos preparar el envío del informe. Inténtalo de nuevo.',
      },
      summary: {
        title: 'Informe CasaMia de elegibilidad de ayudas',
        result: 'Resultado',
        region: 'Comunidad',
        postcode: 'Código postal',
        home: 'Vivienda',
        ownership: 'Situación',
        resident: 'Residente',
        mobility: 'Movilidad',
        status: 'Estado',
        needs: 'Necesidades',
        timeline: 'Plazo',
        contact: 'Contacto',
        notProvided: 'No indicado',
        noPhone: 'Sin teléfono',
        noEmail: 'Sin email',
        yourRegion: 'tu comunidad',
      },
      calculation: {
        neededFromUser: {
          base: [
            'Código postal y municipio exacto de la vivienda.',
            'Situación de la vivienda: propiedad, alquiler, familiar o comunidad de vecinos.',
            'Quién vive en la vivienda y qué dificultad práctica tiene: baño, acceso, escaleras, suelo o iluminación.',
          ],
          disability: 'Certificado de discapacidad o resolución de dependencia, solo si ya lo tienes.',
          statusInProgress: 'Justificante de solicitud de discapacidad o dependencia en trámite, si existe.',
          landlord: 'Contacto o autorización del propietario si la vivienda es alquilada.',
          community: 'Administrador, presidente o acta de comunidad si la mejora afecta zonas comunes.',
        },
        reasons: {
          region: (region: string) => `${region} puede revisarse frente a convocatorias regionales o municipales.`,
          missingRegion: 'Falta la comunidad autónoma, necesaria para revisar la ruta de ayuda correcta.',
          age75: 'Una persona residente de 75+ suele ser una señal fuerte para ayudas de accesibilidad.',
          age65: 'Una persona mayor de 65 puede encajar en muchos criterios de accesibilidad.',
          family: 'Las solicitudes gestionadas por familiares son habituales, pero conviene confirmar los datos de la persona residente.',
          recognisedStatus: 'La discapacidad o dependencia reconocida puede reforzar la solicitud.',
          statusInProgress: 'Una solicitud en trámite puede ser útil para revisar la vía regional.',
          privateStatus: 'La información sensible puede revisarse más adelante de forma privada si hace falta.',
          mobilityNeed: 'Las necesidades actuales de movilidad ayudan a justificar obras de accesibilidad.',
          balance: 'Los problemas de equilibrio o movilidad apoyan un caso preventivo de seguridad.',
          commonWorks: 'Las adaptaciones seleccionadas son categorías habituales en ayudas de accesibilidad.',
          safetyNeeds: 'Las necesidades seleccionadas pueden apoyar una revisión de adaptación del hogar.',
          owner: 'La propiedad propia o familiar suele simplificar permisos y documentación.',
          rented: 'En vivienda alquilada puede ser posible, pero normalmente hará falta permiso del propietario.',
          community: 'Las obras en zonas comunes pueden requerir aprobación de la comunidad.',
          urgent: 'Un plazo cercano ayuda a priorizar convocatorias y preparación documental.',
        },
        casamiaManagement: {
          base: [
            'Verificar la convocatoria activa para tu comunidad, municipio y tipo de vivienda.',
            'Clasificar las mejoras como accesibilidad, seguridad preventiva o soporte inteligente.',
            'Preparar la lista final de documentos y el orden correcto antes de presentar nada.',
            'Convertir la necesidad en una propuesta clara para que sepas qué se solicita y por qué.',
          ],
          watch: [
            'Empezar con el informe online gratuito para aclarar el alcance inicial.',
            'Completar solo los datos mínimos que una ayuda concreta pueda exigir.',
            'Mantener la vivienda en seguimiento y avisarte si aparece una convocatoria relevante.',
          ],
        },
        results: {
          strong: {
            title: 'Buen encaje para ayudas',
            summary:
              'Tus respuestas muestran varias señales habituales de elegibilidad. CasaMia debería verificar la vía regional activa y preparar la documentación.',
          },
          review: {
            title: 'Necesita revisión regional',
            summary:
              'Hay señales útiles, pero la vía de ayuda depende de la comunidad, permisos y clasificación correcta de la adaptación.',
          },
          watch: {
            title: 'Primero plan de seguridad',
            summary:
              'Todavía no hay suficiente información para un encaje fuerte. CasaMia puede crear un plan de seguridad y vigilar futuras convocatorias.',
          },
        },
      },
    }
  }

  return {
    hero: {
      back: 'Back to grants',
      title: 'Could you receive grants? Check for free.',
      intro:
        'Answer a few questions, with no photo upload, and get a practical readiness report for possible accessibility grants.',
      note:
        'This is not a grant approval. Support depends on your autonomous community, open calls, home details, and documentation.',
      helper: 'Takes a few minutes and you do not need documents to start.',
      pointsLabel: 'What the check includes',
      points: ['No photo upload', 'Instant report', 'Clear next steps'],
    },
    progressLabel: 'Grant check progress',
    progress: ['Home', 'Resident', 'Needs', 'Report', 'Send'],
    steps: {
      home: {
        kicker: 'Step 1',
        title: 'Where is the home?',
        intro:
          'Location and property type matter because most applications are handled by region or municipality.',
      },
      resident: {
        kicker: 'Step 2',
        title: 'Who needs the adaptation?',
        intro: 'Keep this broad. CasaMia can review sensitive documents later only if they are needed.',
      },
      needs: {
        kicker: 'Step 3',
        title: 'What needs to change?',
        intro: 'Select the adaptations or risks you already know about. This check does not need photos.',
      },
      report: {
        kicker: 'Your report',
      },
      send: {
        kicker: 'Send report',
        title: 'Send your grant eligibility report',
        intro:
          'Your result is already visible. Add contact details only if you want CasaMia to send it by email or WhatsApp.',
        consent:
          'I agree CasaMia can use this information to send my grant eligibility report and contact me about relevant regional options.',
      },
    },
    fields: {
      region: 'Autonomous community',
      postcode: 'Postcode',
      homeType: 'Home type',
      ownership: 'Ownership situation',
      residentAge: 'Resident age',
      mobility: 'Mobility situation',
      recognisedStatus: 'Disability or dependency status',
      timeline: 'Timing',
    },
    placeholders: {
      region: 'Choose region',
      postcode: 'Example: 28013',
      homeType: 'Choose home type',
      ownership: 'Choose situation',
      residentAge: 'Choose age band',
      mobility: 'Choose closest match',
      recognisedStatus: 'Choose status',
      timeline: 'Choose timing',
    },
    options: {
      regions,
      homeTypes: [
        { value: 'Apartment', label: 'Apartment' },
        { value: 'Townhouse', label: 'Townhouse' },
        { value: 'Villa or detached home', label: 'Villa or detached home' },
        { value: 'Residential building community', label: 'Residential building community' },
      ],
      ownership: [
        { value: 'Owner occupied', label: 'Owner occupied' },
        { value: 'Owned by family', label: 'Owned by family' },
        { value: 'Rented home', label: 'Rented home' },
        { value: 'Community building works', label: 'Community building works' },
      ],
      ages: [
        { value: 'Under 65', label: 'Under 65' },
        { value: '65 to 74', label: '65 to 74' },
        { value: '75+', label: '75+' },
        { value: 'Family member answering', label: 'Family member answering' },
      ],
      mobility: [
        { value: 'No major mobility issue', label: 'No major mobility issue' },
        { value: 'Occasional balance or mobility concern', label: 'Occasional balance or mobility concern' },
        { value: 'Uses cane or walker', label: 'Uses cane or walker' },
        { value: 'Wheelchair or major mobility need', label: 'Wheelchair or major mobility need' },
      ],
      statuses: [
        { value: 'Recognised disability or dependency', label: 'Recognised disability or dependency' },
        { value: 'Application in progress', label: 'Application in progress' },
        { value: 'No recognised status yet', label: 'No recognised status yet' },
        { value: 'Prefer not to say', label: 'Prefer not to say' },
      ],
      needs: [
        { value: 'Bathroom safety', label: 'Bathroom safety' },
        { value: 'Entrance access', label: 'Entrance access' },
        { value: 'Stairs or handrails', label: 'Stairs or handrails' },
        { value: 'Non-slip flooring', label: 'Non-slip flooring' },
        { value: 'Motion lighting', label: 'Motion lighting' },
        { value: 'Door widening', label: 'Door widening' },
        { value: 'Emergency alerts', label: 'Emergency alerts' },
        { value: 'Smart access', label: 'Smart access' },
        { value: 'Fall detection', label: 'Fall detection' },
      ],
      timelines: [
        { value: 'As soon as possible', label: 'As soon as possible' },
        { value: 'Within 1 month', label: 'Within 1 month' },
        { value: 'Within 3 months', label: 'Within 3 months' },
        { value: 'Planning ahead', label: 'Planning ahead' },
      ],
    },
    result: {
      readiness: 'readiness',
      instantReport: 'Instant report',
      reasonsTitle: 'Why this result appears',
      managedTitle: 'What CasaMia will manage',
      neededTitle: 'What we need from you',
      handoffTitle: 'The report now has the essentials.',
      handoffBody:
        'In the next step you can send it by email or WhatsApp. CasaMia will use these details to review the grant route and tell you exactly what is still missing.',
      handoffPoints: [
        'We do not ask for certificates now if you do not already have them.',
        'Nothing is filed before the call is checked and confirmed with you.',
        'Follow-up focuses on permissions, scope, and real documentation.',
      ],
      readyTitle: 'Your report is ready.',
      readyBody: (region: string) =>
        `CasaMia can review the grant route for ${region} and send a clear summary of what is still needed if you choose delivery.`,
      placeholder: 'Answer the questions to see your eligibility report. No photos needed.',
      detailsSummary: 'View report summary',
    },
    actions: {
      back: 'Back',
      continue: 'Continue',
      startNow: 'Start now',
      sendThisReport: 'Send this report',
      sendReport: 'Send report',
      sending: 'Preparing delivery',
    },
    delivery: {
      email: 'The full report is ready to send by email.',
      whatsapp: 'The WhatsApp message will contain only a secure report link.',
    },
    errors: {
      delivery: 'We could not queue the report delivery. Please try again.',
    },
    summary: {
      title: 'CasaMia grant-readiness report',
      result: 'Result',
      region: 'Region',
      postcode: 'Postcode',
      home: 'Home',
      ownership: 'Ownership',
      resident: 'Resident',
      mobility: 'Mobility',
      status: 'Status',
      needs: 'Needs',
      timeline: 'Timeline',
      contact: 'Contact',
      notProvided: 'Not provided',
      noPhone: 'No phone',
      noEmail: 'No email',
      yourRegion: 'your region',
    },
    calculation: {
      neededFromUser: {
        base: [
          'The exact postcode and municipality of the home.',
          'The housing situation: owned, rented, family-owned, or building community.',
          'Who lives in the home and the practical difficulty: bathroom, access, stairs, flooring, or lighting.',
        ],
        disability: 'Disability certificate or dependency resolution, only if you already have it.',
        statusInProgress: 'Proof that a disability or dependency application is in progress, if it exists.',
        landlord: 'Landlord contact or authorisation if the home is rented.',
        community: 'Building administrator, president, or meeting minutes if shared areas are involved.',
      },
      reasons: {
        region: (region: string) => `${region} can be checked against regional and municipal accessibility calls.`,
        missingRegion: 'Region is still needed because most grant routes are managed locally.',
        age75: 'A resident aged 75+ is often a strong signal for accessibility support.',
        age65: 'A resident over 65 can match many senior accessibility criteria.',
        family: 'Family-led applications are common, but CasaMia should confirm the resident details.',
        recognisedStatus: 'Recognised disability or dependency can strengthen the application and funding level.',
        statusInProgress: 'A pending disability or dependency application may still be useful for regional review.',
        privateStatus: 'Sensitive status can be reviewed privately later if it becomes relevant.',
        mobilityNeed: 'Current mobility needs make accessibility works easier to justify.',
        balance: 'Balance or mobility concerns support a prevention-led safety case.',
        commonWorks: 'The selected work types are common accessibility grant categories.',
        safetyNeeds: 'The selected safety needs can still support a home adaptation review.',
        owner: 'Owner or family ownership usually makes permissions and documentation simpler.',
        rented: 'A rented home may still be possible, but landlord permission will likely be needed.',
        community: 'Community building works may need building community approval before filing.',
        urgent: 'A near-term timeline helps CasaMia prioritise call deadlines and document prep.',
      },
      casamiaManagement: {
        base: [
          'Verify the active call for your region, municipality, and home type.',
          'Classify the improvements as accessibility, preventive safety, or smart support.',
          'Prepare the final document list and correct order before anything is filed.',
          'Turn the need into a clear proposal so you know what is being requested and why.',
        ],
        watch: [
          'Start with the free online safety report so the initial scope is clearer.',
          'Collect only the minimum details a specific funding route may require.',
          'Keep the home on a regional watch list and notify you if a relevant call appears.',
        ],
      },
      results: {
        strong: {
          title: 'Strong grant match',
          summary:
            'The answers show several common eligibility signals. CasaMia should now verify the active regional route and prepare the documentation package.',
        },
        review: {
          title: 'Needs regional review',
          summary:
            'There are useful signals, but the grant route depends on region, permissions, and whether the adaptation is classified correctly.',
        },
        watch: {
          title: 'Safety plan first',
          summary:
            'There may not be enough information yet for a strong grant match. CasaMia can still build a safety plan and monitor suitable calls.',
        },
      },
    },
  }
}

function createGrantToken() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}
