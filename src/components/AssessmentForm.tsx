import { AlertCircle, ArrowRight, CalendarClock, CheckCircle2, LoaderCircle } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { submitAssessmentRequest } from '../services/assessmentRequests'
import { PhoneNumberField } from './PhoneNumberField'

const DEFAULT_PLAN_VALUE = 'not-sure'
const KNOWN_PLAN_VALUES = new Set(['home-assessment', 'home-safety', 'smart-safety'])

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

type AssessmentFormErrors = Partial<Record<'name' | 'contact' | 'city' | 'consent', string>>

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

export function AssessmentForm() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const planFromUrl = normalizePlanValue(searchParams.get('plan'))
  const [values, setValues] = useState(() => ({
    ...initialValues,
    selectedPlan: planFromUrl,
  }))
  const [errors, setErrors] = useState<AssessmentFormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submittedPlan, setSubmittedPlan] = useState(DEFAULT_PLAN_VALUE)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    setSubmitError('')
    setSubmitted(false)
  }

  function validate() {
    const nextErrors: AssessmentFormErrors = {}

    if (!values.name.trim()) {
      nextErrors.name = t('assessment.form.errors.name')
    }

    if (!values.phone.trim() && !values.email.trim()) {
      nextErrors.contact = t('assessment.form.errors.contact')
    }

    if (!values.city.trim()) {
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

    try {
      await submitAssessmentRequest({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        city: values.city.trim(),
        preferredContactMethod: values.contactMethod,
        selectedPlan: selectedPlanLabel,
        preferredDate: values.date,
        message: values.message.trim(),
        consentAt: new Date().toISOString(),
        source: 'home-safety-assessment',
      })
      setSubmittedPlan(values.selectedPlan)
      setSubmitted(true)
      setValues({
        ...initialValues,
        selectedPlan: planFromUrl,
      })
      setErrors({})
    } catch (error) {
      console.error('CasaMia assessment request failed', error)
      setSubmitError(t('assessment.form.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="assessment-form-card" id="assessment-form">
      <div className="assessment-form-heading">
        <span>
          <CalendarClock size={24} aria-hidden="true" />
        </span>
        <div>
          <h2>{t('assessment.form.title')}</h2>
          <p>{t('assessment.form.intro')}</p>
        </div>
      </div>

      <form className="assessment-form" noValidate onSubmit={handleSubmit}>
        <FormField
          error={errors.name}
          label={t('assessment.form.fields.name')}
          required
        >
          <input
            autoComplete="name"
            name="name"
            onChange={(event) => updateValue('name', event.target.value)}
            required
            type="text"
            value={values.name}
          />
        </FormField>

        <PhoneNumberField
          className="assessment-field"
          label={t('assessment.form.fields.phone')}
          value={values.phone}
          onChange={(nextValue) => updateValue('phone', nextValue)}
        />

        <FormField error={errors.contact} label={t('assessment.form.fields.email')}>
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => updateValue('email', event.target.value)}
            type="email"
            value={values.email}
          />
        </FormField>

        <FormField
          error={errors.city}
          label={t('assessment.form.fields.city')}
          required
        >
          <input
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

        <FormField label={t('assessment.form.fields.message')} wide>
          <textarea
            name="message"
            onChange={(event) => updateValue('message', event.target.value)}
            rows={5}
            value={values.message}
          />
        </FormField>

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
          {isSubmitting ? t('assessment.form.submitting') : t('assessment.form.submit')}
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
            {submittedPlan === DEFAULT_PLAN_VALUE
              ? t('assessment.form.success')
              : t('assessment.form.successWithPlan', { plan: submittedPlanLabel })}
          </p>
          <a
            className="btn btn-navy"
            href="https://wa.me/34900000000?text=I%20would%20like%20to%20request%20a%20CasaMia%20in-home%20safety%20assessment%20visit%20for%2089%20euros."
            rel="noreferrer"
            target="_blank"
          >
            {t('assessment.form.schedule')}
            <ArrowRight size={20} aria-hidden="true" />
          </a>
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
    <label className={`assessment-field${wide ? ' is-wide' : ''}`}>
      <span>
        {label}
        {required ? <strong> *</strong> : null}
      </span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  )
}
