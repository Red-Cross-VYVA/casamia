import {
  ArrowRight,
  AtSign,
  CalendarDays,
  Clock3,
  LoaderCircle,
  MapPin,
  MessageSquareText,
  PhoneCall,
  UserRound,
} from 'lucide-react'
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'

import type { WizardCopy } from '../../config/wizardCopy'
import {
  WIZARD_CALLBACK_TIME_WINDOWS,
  type WizardCallbackRequest,
  type WizardCallbackTimeWindow,
  type WizardContact,
} from '../../types/wizard'
import {
  formatSpanishLocalNumber,
  getSpanishLocalNumber,
  isValidSpanishPhoneNumber,
  SPAIN_DIAL_CODE,
} from '../../utils/phone'
import { WizardStep } from './WizardStep'

type CallbackRequestStepProps = {
  callbackRequest: WizardCallbackRequest
  contact: WizardContact
  copy: WizardCopy['callback']
  onCallbackRequestChange: (callbackRequest: WizardCallbackRequest) => void
  onContactChange: (contact: WizardContact) => void
  onSubmit: (contact: WizardContact, callbackRequest: WizardCallbackRequest) => Promise<void> | void
}

type CallbackField =
  | 'fullName'
  | 'phone'
  | 'email'
  | 'city'
  | 'preferredDate'
  | 'preferredTimeWindow'
  | 'consent'

type CallbackErrors = Partial<Record<CallbackField, string>>

const callbackTimeWindows: readonly WizardCallbackTimeWindow[] = WIZARD_CALLBACK_TIME_WINDOWS

export function CallbackRequestStep({
  callbackRequest,
  contact,
  copy,
  onCallbackRequestChange,
  onContactChange,
  onSubmit,
}: CallbackRequestStepProps) {
  const [errors, setErrors] = useState<CallbackErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const minimumDate = useMemo(() => getLocalDate(0), [])
  const maximumDate = useMemo(() => getLocalDate(90), [])

  function updateContact<K extends keyof WizardContact>(key: K, value: WizardContact[K]) {
    onContactChange({ ...contact, [key]: value })
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError('')
  }

  function updateRequest<K extends keyof WizardCallbackRequest>(key: K, value: WizardCallbackRequest[K]) {
    onCallbackRequestChange({ ...callbackRequest, [key]: value })
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError('')
  }

  function validate() {
    const next: CallbackErrors = {}
    const email = contact.email.trim()

    if (!contact.fullName.trim()) next.fullName = copy.required
    if (!contact.phone.trim()) next.phone = copy.required
    else if (!isValidSpanishPhoneNumber(contact.phone)) next.phone = copy.invalidPhone
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = copy.invalidEmail
    if (!contact.city.trim()) next.city = copy.required
    if (!callbackRequest.preferredDate) next.preferredDate = copy.required
    else if (callbackRequest.preferredDate < minimumDate) next.preferredDate = copy.futureDate
    else if (callbackRequest.preferredDate > maximumDate) next.preferredDate = copy.tooFarDate
    if (!callbackRequest.preferredTimeWindow) next.preferredTimeWindow = copy.required
    if (!contact.consent) next.consent = copy.required

    setErrors(next)

    if (Object.keys(next).length) {
      window.requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      })
      return false
    }

    return true
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !validate()) return

    const normalizedContact: WizardContact = {
      ...contact,
      fullName: contact.fullName.trim(),
      phone: `${SPAIN_DIAL_CODE}${getSpanishLocalNumber(contact.phone)}`,
      email: contact.email.trim(),
      city: contact.city.trim(),
    }
    const normalizedRequest: WizardCallbackRequest = {
      ...callbackRequest,
      note: callbackRequest.note.trim(),
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      await onSubmit(normalizedContact, normalizedRequest)
    } catch {
      setSubmitError(copy.error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <WizardStep title={copy.title} body={copy.body} icon={<PhoneCall size={28} />} compact>
      <form className="safety-wizard-callback-form" noValidate onSubmit={handleSubmit} ref={formRef}>
        <div className="safety-wizard-callback-grid">
          <CallbackField
            error={errors.fullName}
            icon={<UserRound size={18} />}
            inputId="safety-wizard-callback-name"
            label={copy.name}
            required
          >
            <input
              aria-describedby={errors.fullName ? 'safety-wizard-callback-name-error' : undefined}
              aria-invalid={Boolean(errors.fullName)}
              autoComplete="name"
              id="safety-wizard-callback-name"
              onChange={(event) => updateContact('fullName', event.target.value)}
              type="text"
              value={contact.fullName}
            />
          </CallbackField>

          <CallbackField
            error={errors.phone}
            helper={copy.phoneHelp}
            icon={<PhoneCall size={18} />}
            inputId="safety-wizard-callback-phone"
            label={copy.phone}
            required
          >
            <span className="safety-wizard-callback-phone">
              <span aria-hidden="true">{SPAIN_DIAL_CODE}</span>
              <input
                aria-describedby={errors.phone
                  ? 'safety-wizard-callback-phone-error'
                  : 'safety-wizard-callback-phone-help'}
                aria-invalid={Boolean(errors.phone)}
                autoComplete="tel-national"
                id="safety-wizard-callback-phone"
                inputMode="tel"
                onChange={(event) => {
                  const localNumber = getSpanishLocalNumber(event.target.value)
                  updateContact('phone', localNumber ? `${SPAIN_DIAL_CODE}${localNumber}` : '')
                }}
                placeholder="600 000 000"
                type="tel"
                value={formatSpanishLocalNumber(getSpanishLocalNumber(contact.phone))}
              />
            </span>
          </CallbackField>

          <CallbackField
            error={errors.email}
            icon={<AtSign size={18} />}
            inputId="safety-wizard-callback-email"
            label={copy.email}
            optionalLabel={copy.optional}
          >
            <input
              aria-describedby={errors.email ? 'safety-wizard-callback-email-error' : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              id="safety-wizard-callback-email"
              inputMode="email"
              onChange={(event) => updateContact('email', event.target.value)}
              type="email"
              value={contact.email}
            />
          </CallbackField>

          <CallbackField
            error={errors.city}
            icon={<MapPin size={18} />}
            inputId="safety-wizard-callback-city"
            label={copy.cityArea}
            required
          >
            <input
              aria-describedby={errors.city ? 'safety-wizard-callback-city-error' : undefined}
              aria-invalid={Boolean(errors.city)}
              autoComplete="address-level2"
              id="safety-wizard-callback-city"
              onChange={(event) => updateContact('city', event.target.value)}
              type="text"
              value={contact.city}
            />
          </CallbackField>

          <CallbackField
            error={errors.preferredDate}
            icon={<CalendarDays size={18} />}
            inputId="safety-wizard-callback-date"
            label={copy.preferredDate}
            required
          >
            <input
              aria-describedby={errors.preferredDate ? 'safety-wizard-callback-date-error' : undefined}
              aria-invalid={Boolean(errors.preferredDate)}
              id="safety-wizard-callback-date"
              max={maximumDate}
              min={minimumDate}
              onChange={(event) => updateRequest('preferredDate', event.target.value)}
              type="date"
              value={callbackRequest.preferredDate}
            />
          </CallbackField>

          <fieldset
            aria-describedby={errors.preferredTimeWindow ? 'safety-wizard-callback-time-error' : undefined}
            className={`safety-wizard-callback-time${errors.preferredTimeWindow ? ' has-error' : ''}`}
          >
            <legend><Clock3 size={18} aria-hidden="true" />{copy.preferredTime}<strong aria-hidden="true">*</strong></legend>
            <div className="safety-wizard-callback-time-options">
              {callbackTimeWindows.map((timeWindow) => (
                <label key={timeWindow}>
                  <input
                    aria-invalid={Boolean(errors.preferredTimeWindow)}
                    checked={callbackRequest.preferredTimeWindow === timeWindow}
                    name="callback-time-window"
                    onChange={() => updateRequest('preferredTimeWindow', timeWindow)}
                    type="radio"
                    value={timeWindow}
                  />
                  <span>{copy.timeWindows[timeWindow]}</span>
                </label>
              ))}
            </div>
            {errors.preferredTimeWindow ? <small id="safety-wizard-callback-time-error" role="alert">{errors.preferredTimeWindow}</small> : null}
          </fieldset>

          <CallbackField
            icon={<MessageSquareText size={18} />}
            inputId="safety-wizard-callback-note"
            label={copy.note}
            wide
          >
            <textarea
              id="safety-wizard-callback-note"
              onChange={(event) => updateRequest('note', event.target.value)}
              placeholder={copy.notePlaceholder}
              rows={3}
              value={callbackRequest.note}
            />
          </CallbackField>
        </div>

        <label className={`safety-wizard-callback-consent${errors.consent ? ' has-error' : ''}`}>
          <input
            aria-describedby={errors.consent ? 'safety-wizard-callback-consent-error' : undefined}
            aria-invalid={Boolean(errors.consent)}
            checked={contact.consent}
            onChange={(event) => updateContact('consent', event.target.checked)}
            type="checkbox"
          />
          <span>{copy.consent}</span>
        </label>
        {errors.consent ? <small className="safety-wizard-callback-consent-error" id="safety-wizard-callback-consent-error" role="alert">{errors.consent}</small> : null}
        <p className="safety-wizard-callback-privacy">{copy.privacy}</p>

        {submitError ? <div className="safety-wizard-callback-error" role="alert">{submitError}</div> : null}

        <div className="safety-wizard-callback-actions">
          <button className="btn btn-navy" disabled={submitting} type="submit">
            {submitting ? <LoaderCircle className="is-spinning" size={20} aria-hidden="true" /> : <ArrowRight size={20} aria-hidden="true" />}
            {submitting ? copy.submitting : copy.submit}
          </button>
        </div>
      </form>
    </WizardStep>
  )
}

function CallbackField({
  children,
  error,
  helper,
  icon,
  inputId,
  label,
  optionalLabel,
  required = false,
  wide = false,
}: {
  children: ReactNode
  error?: string
  helper?: string
  icon: ReactNode
  inputId: string
  label: string
  optionalLabel?: string
  required?: boolean
  wide?: boolean
}) {
  return (
    <div className={`safety-wizard-callback-field${wide ? ' is-wide' : ''}${error ? ' has-error' : ''}`}>
      <label htmlFor={inputId}>
        <span>{icon}{label}</span>
        {required ? <strong aria-hidden="true">*</strong> : optionalLabel ? <small>{optionalLabel}</small> : null}
      </label>
      {children}
      {error ? <small id={`${inputId}-error`} role="alert">{error}</small> : helper ? <small className="is-helper" id={`${inputId}-help`}>{helper}</small> : null}
    </div>
  )
}

function getLocalDate(daysFromToday: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
