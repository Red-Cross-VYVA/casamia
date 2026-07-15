import { AlertCircle, ArrowRight, CalendarClock, CheckCircle2, LoaderCircle, Mail, MapPin, PhoneCall, UserRound } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { submitAssessmentRequest } from '../services/assessmentRequests'
import { trackEvent } from '../utils/analytics'
import { isValidSpanishPhoneNumber } from '../utils/phone'
import { PhoneNumberField } from './PhoneNumberField'

const DEFAULT_PLAN_VALUE = 'not-sure'
const KNOWN_PLAN_VALUES = new Set([
  'home-assessment',
  'home-safety',
  'smart-safety',
  'essential',
  'advanced',
  'premium',
])

type AssessmentFormValues = {
  name: string
  phone: string
  email: string
  city: string
  contactMethod: string
  selectedPlan: string
  date: string
  message: string
  consent: boolean
}

type AssessmentFormErrors = Partial<Record<'name' | 'contact' | 'phone' | 'email' | 'city' | 'consent', string>>

const initialValues: AssessmentFormValues = {
  name: '',
  phone: '',
  email: '',
  city: '',
  contactMethod: 'phone',
  selectedPlan: DEFAULT_PLAN_VALUE,
  date: '',
  message: '',
  consent: false,
}

const contactTimingOptions = {
  en: [
    'Weekday mornings',
    'Weekday afternoons',
    'Early evening',
    'Saturday morning',
    'Flexible',
  ],
  es: [
    'Mañanas entre semana',
    'Tardes entre semana',
    'Primera hora de la tarde',
    'Sábado por la mañana',
    'Flexible',
  ],
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

type AssessmentFormProps = {
  mode?: 'default' | 'checkout' | 'booking'
}

export function AssessmentForm({ mode = 'default' }: AssessmentFormProps) {
  const { i18n, t } = useTranslation()
  const [searchParams] = useSearchParams()
  const planFromUrl = normalizePlanValue(searchParams.get('plan'))
  const reportToken = searchParams.get('report') ?? undefined
  const [values, setValues] = useState(() => ({
    ...initialValues,
    selectedPlan: planFromUrl,
  }))
  const [errors, setErrors] = useState<AssessmentFormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submittedPlan, setSubmittedPlan] = useState(DEFAULT_PLAN_VALUE)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactTimings, setContactTimings] = useState<string[]>([])
  const contactOptions = t('assessment.form.contactOptions', { returnObjects: true }) as Array<{
    value: string
    label: string
  }>
  const planOptions = t('assessment.form.planOptions', { returnObjects: true }) as Array<{
    value: string
    label: string
  }>
  const selectedPlanLabel = useMemo(
    () => getPlanLabel(values.selectedPlan, planOptions),
    [planOptions, values.selectedPlan],
  )
  const submittedPlanLabel = useMemo(
    () => getPlanLabel(submittedPlan, planOptions),
    [planOptions, submittedPlan],
  )
  const isCheckout = mode === 'checkout'
  const isBooking = mode === 'booking'
  const isSpanish = i18n.language.startsWith('es')
  const emailFormatError = i18n.language.startsWith('es')
    ? 'Introduce un email válido, por ejemplo nombre@email.com.'
    : 'Enter a valid email address, for example name@email.com.'
  const phoneFormatError = i18n.language.startsWith('es')
    ? 'Introduce un teléfono español de 9 dígitos.'
    : 'Enter a Spanish phone number with 9 digits.'

  useEffect(() => {
    setValues((current) => {
      if (current.selectedPlan === planFromUrl) {
        return current
      }

      return { ...current, selectedPlan: planFromUrl }
    })
  }, [planFromUrl])

  function updateValue(field: keyof AssessmentFormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === 'phone' || field === 'email' ? { contact: undefined } : {}),
    }))
    setSubmitError('')
    setSubmitted(false)
  }

  function validateEmailField(value = values.email) {
    const email = value.trim()

    if (!email) {
      setErrors((current) => ({ ...current, email: undefined }))
      return true
    }

    if (!isValidEmail(email)) {
      setErrors((current) => ({ ...current, email: emailFormatError }))
      return false
    }

    setErrors((current) => ({ ...current, email: undefined }))
    return true
  }

  function toggleContactTiming(option: string) {
    setContactTimings((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    )
    setSubmitted(false)
  }

  function validate() {
    const nextErrors: AssessmentFormErrors = {}

    if (!isBooking && !values.name.trim()) {
      nextErrors.name = t('assessment.form.errors.name')
    }

    if (!isBooking && !values.phone.trim() && !values.email.trim()) {
      nextErrors.contact = t('assessment.form.errors.contact')
    }

    if (values.phone.trim() && !isValidSpanishPhoneNumber(values.phone)) {
      nextErrors.phone = phoneFormatError
    }

    if (values.email.trim() && !isValidEmail(values.email)) {
      nextErrors.email = emailFormatError
    }

    if (!isBooking && !values.city.trim()) {
      nextErrors.city = t('assessment.form.errors.city')
    }

    if (!values.consent) {
      nextErrors.consent = t('assessment.form.errors.consent')
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    const bookingMessage = [
      contactTimings.length
        ? `${isSpanish ? 'Horarios preferidos' : 'Preferred contact times'}: ${contactTimings.join(', ')}`
        : '',
      values.message.trim()
        ? `${isSpanish ? 'Nota' : 'Note'}: ${values.message.trim()}`
        : '',
    ].filter(Boolean).join('\n')

    try {
      await submitAssessmentRequest({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        city: values.city.trim(),
        preferredContactMethod: values.contactMethod,
        selectedPlan: selectedPlanLabel,
        preferredDate: values.date,
        message: isBooking ? bookingMessage : values.message.trim(),
        consentAt: new Date().toISOString(),
        source: isBooking ? 'free-report-booking' : 'home-safety-assessment',
        reportToken,
      })
      trackEvent('assessment_booking_completed', {
        mode,
        selectedPlan: values.selectedPlan,
        source: isBooking ? 'free-report-booking' : 'home-safety-assessment',
      })
      setSubmittedPlan(values.selectedPlan)
      setSubmitted(true)
      setValues({
        ...initialValues,
        selectedPlan: planFromUrl,
      })
      setContactTimings([])
      setErrors({})
    } catch (error) {
      console.error('CasaMia assessment request failed', error)
      setSubmitError(t('assessment.form.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`assessment-form-card ${isCheckout || isBooking ? 'is-checkout' : ''}`} id="assessment-form">
      <div className="assessment-form-heading">
        <span>
          <CalendarClock size={24} aria-hidden="true" />
        </span>
        <div>
          <h2>
            {isBooking
              ? isSpanish
                ? 'Coordinar la evaluación a domicilio'
                : 'Coordinate your in-home assessment'
              : isCheckout
                ? 'Confirm your request'
                : t('assessment.form.title')}
          </h2>
          <p>
            {isBooking
              ? isSpanish
                ? 'Ya tenemos los datos del informe gratuito. Indica cómo y cuándo prefieres que contactemos para cerrar la visita.'
                : 'We already have the free report details. Tell us how and when you prefer us to contact you to arrange the visit.'
              : isCheckout
              ? `We have selected ${selectedPlanLabel}. Add your details and CasaMia will confirm the visit before booking.`
              : t('assessment.form.intro')}
          </p>
        </div>
      </div>

      {isCheckout ? (
        <div className="assessment-selected-plan">
          <CheckCircle2 size={19} aria-hidden="true" />
          <div>
            <span>Selected package</span>
            <strong>{selectedPlanLabel}</strong>
          </div>
        </div>
      ) : null}

      <form className="assessment-form" noValidate onSubmit={handleSubmit}>
        {isBooking ? (
          <section className="assessment-form-section-card assessment-booking-card">
            <div className="assessment-form-section-heading">
              <span><CalendarClock size={20} aria-hidden="true" /></span>
              <div>
                <strong>{isSpanish ? 'Preferencias de coordinación' : 'Coordination preferences'}</strong>
                <p>
                  {isSpanish
                    ? 'Elige el canal y la franja más cómoda para confirmar la cita.'
                    : 'Choose the easiest channel and timing for confirming the appointment.'}
                </p>
              </div>
            </div>
            <div className="assessment-form-grid">
              <FormField label={t('assessment.form.fields.contactMethod')}>
                <select
                  name="contactMethod"
                  onChange={(event) => updateValue('contactMethod', event.target.value)}
                  value={values.contactMethod}
                >
                  {contactOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label={t('assessment.form.fields.date')}>
                <input
                  name="date"
                  onChange={(event) => updateValue('date', event.target.value)}
                  type="date"
                  value={values.date}
                />
              </FormField>

              <FormField
                label={isSpanish ? 'Mejor horario para contactar' : 'Best time to contact'}
                wide
              >
                <div className="assessment-booking-timing-options" role="group" aria-label={isSpanish ? 'Mejor horario para contactar' : 'Best time to contact'}>
                  {(isSpanish ? contactTimingOptions.es : contactTimingOptions.en).map((option) => (
                    <button
                      className={contactTimings.includes(option) ? 'is-selected' : ''}
                      key={option}
                      type="button"
                      onClick={() => toggleContactTiming(option)}
                    >
                      <span aria-hidden="true">{contactTimings.includes(option) ? '✓' : ''}</span>
                      {option}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField
                label={isSpanish ? 'Nota adicional' : 'Additional note'}
                wide
              >
                <textarea
                  name="message"
                  onChange={(event) => updateValue('message', event.target.value)}
                  placeholder={
                    isSpanish
                      ? 'Ej. WhatsApp primero, llamar a mi hija si no respondo, evitar la hora de la siesta...'
                      : 'E.g. WhatsApp first, call my daughter if I do not answer, avoid lunchtime...'
                  }
                  rows={4}
                  value={values.message}
                />
              </FormField>
            </div>
          </section>
        ) : (
        <>
        <section className="assessment-form-section-card">
          <div className="assessment-form-section-heading">
            <span><UserRound size={20} aria-hidden="true" /></span>
            <div>
              <strong>{i18n.language.startsWith('es') ? 'Contacto principal' : 'Main contact'}</strong>
              <p>{i18n.language.startsWith('es') ? 'Indica un teléfono o un email para poder confirmar la visita.' : 'Add a phone number or email so we can confirm the visit.'}</p>
            </div>
          </div>
          <div className="assessment-form-grid is-contact">
            <FormField
              error={errors.name}
              label={t('assessment.form.fields.name')}
              required
              wide
            >
              <input
                aria-invalid={Boolean(errors.name)}
                autoComplete="name"
                name="name"
                onChange={(event) => updateValue('name', event.target.value)}
                required
                type="text"
                value={values.name}
              />
            </FormField>

            <div className="assessment-contact-method-card">
              <span className="assessment-contact-method-icon">
                <PhoneCall size={18} aria-hidden="true" />
              </span>
              <PhoneNumberField
                className="assessment-field"
                error={errors.phone ?? errors.contact}
                label={t('assessment.form.fields.phone')}
                required
                value={values.phone}
                onChange={(nextValue) => updateValue('phone', nextValue)}
              />
            </div>

            <div className="assessment-contact-method-card">
              <span className="assessment-contact-method-icon">
                <Mail size={18} aria-hidden="true" />
              </span>
              <FormField error={errors.email ?? errors.contact} label={t('assessment.form.fields.email')} required>
                <input
                  aria-invalid={Boolean(errors.email ?? errors.contact)}
                  aria-required="true"
                  autoComplete="email"
                  inputMode="email"
                  name="email"
                  onBlur={(event) => validateEmailField(event.target.value)}
                  onChange={(event) => updateValue('email', event.target.value)}
                  placeholder="nombre@email.com"
                  type="email"
                  value={values.email}
                />
              </FormField>
            </div>
          </div>
        </section>

        <section className="assessment-form-section-card">
          <div className="assessment-form-section-heading">
            <span><MapPin size={20} aria-hidden="true" /></span>
            <div>
              <strong>{i18n.language.startsWith('es') ? 'Zona y preferencias' : 'Area and preferences'}</strong>
              <p>{i18n.language.startsWith('es') ? 'Ayúdanos a preparar la evaluación antes de llamarte.' : 'Help us prepare the assessment before we call you.'}</p>
            </div>
          </div>
          <div className="assessment-form-grid">
            <FormField
              error={errors.city}
              label={t('assessment.form.fields.city')}
              required
            >
              <input
                aria-invalid={Boolean(errors.city)}
                autoComplete="address-level2"
                name="city"
                onChange={(event) => updateValue('city', event.target.value)}
                required
                type="text"
                value={values.city}
              />
            </FormField>

            <FormField label={t('assessment.form.fields.contactMethod')}>
              <select
                name="contactMethod"
                onChange={(event) => updateValue('contactMethod', event.target.value)}
                value={values.contactMethod}
              >
                {contactOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label={t('assessment.form.fields.selectedPlan')}>
              <select
                name="selectedPlan"
                onChange={(event) => updateValue('selectedPlan', event.target.value)}
                value={values.selectedPlan}
              >
                {planOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label={t('assessment.form.fields.date')}>
              <input
                name="date"
                onChange={(event) => updateValue('date', event.target.value)}
                type="date"
                value={values.date}
              />
            </FormField>
          </div>
        </section>

        <FormField label={t('assessment.form.fields.message')} wide>
          <textarea
            name="message"
            onChange={(event) => updateValue('message', event.target.value)}
            rows={4}
            value={values.message}
          />
        </FormField>
        </>
        )}

        <label className="assessment-consent">
          <input
            checked={values.consent}
            name="consent"
            onChange={(event) => updateValue('consent', event.target.checked)}
            required
            type="checkbox"
          />
          <span>{t('assessment.form.consent')}</span>
          {errors.consent ? <small>{errors.consent}</small> : null}
        </label>

        <p className="assessment-privacy-note">{t('assessment.form.privacy')}</p>

        {submitError ? (
          <div className="assessment-error" role="alert">
            <AlertCircle size={20} aria-hidden="true" />
            <p>{submitError}</p>
          </div>
        ) : null}

        <button className="btn btn-green assessment-submit" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? t('assessment.form.submitting')
            : isCheckout
              ? `Confirm ${selectedPlanLabel} request`
              : isBooking
                ? isSpanish
                  ? 'Enviar preferencias de coordinación'
                  : 'Send coordination preferences'
              : t('assessment.form.submit')}
          {isSubmitting ? (
            <LoaderCircle className="assessment-loading-icon" size={20} aria-hidden="true" />
          ) : (
            <ArrowRight size={20} aria-hidden="true" />
          )}
        </button>
      </form>

      {submitted ? (
        <div className="assessment-success" role="status">
          <CheckCircle2 size={24} aria-hidden="true" />
          <p>
            {isBooking
              ? isSpanish
                ? 'Gracias. Hemos recibido tus preferencias de coordinación. CasaMia usará los datos de tu informe gratuito para confirmar la evaluación a domicilio.'
                : 'Thank you. Your coordination preferences have been received. CasaMia will use your free report details to confirm the in-home assessment.'
              : submittedPlan === DEFAULT_PLAN_VALUE
              ? t('assessment.form.success')
              : t('assessment.form.successWithPlan', { plan: submittedPlanLabel })}
          </p>
          {isBooking ? null : (
            <a
              className="btn btn-navy"
              href="mailto:hello@casamia.es?subject=Assessment%20visit%20request"
            >
              {t('assessment.form.schedule')}
              <ArrowRight size={20} aria-hidden="true" />
            </a>
          )}
        </div>
      ) : null}
    </div>
  )
}

function normalizePlanValue(value: string | null) {
  if (value && KNOWN_PLAN_VALUES.has(value)) {
    return value
  }

  return DEFAULT_PLAN_VALUE
}

function getPlanLabel(value: string, options: Array<{ value: string; label: string }>) {
  return options.find((option) => option.value === value)?.label ?? options[0]?.label ?? value
}

function FormField({
  children,
  error,
  label,
  required,
  wide,
}: {
  children: ReactNode
  error?: string
  label: string
  required?: boolean
  wide?: boolean
}) {
  return (
    <label className={`assessment-field${wide ? ' is-wide' : ''}${error ? ' has-error' : ''}`}>
      <span>
        {label}
        {required ? <strong> *</strong> : null}
      </span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  )
}
