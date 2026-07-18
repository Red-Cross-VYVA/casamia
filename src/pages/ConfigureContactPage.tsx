import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useConfigurator } from '../context/ConfiguratorContext'
import {
  formatSpanishLocalNumber,
  getSpanishLocalNumber,
  isValidSpanishPhoneNumber,
  SPAIN_DIAL_CODE,
} from '../utils/phone'

const contactCopy = {
  en: {
    eyebrow: 'Customer details',
    title: 'Where should CasaMia send your plan?',
    body: 'Add the best contact details so we can confirm your quote or arrange a visit.',
    fullName: 'Full name',
    email: 'Email address',
    telephone: 'Telephone',
    telephoneHint: 'Spanish number, 9 digits. Example: 600 000 000',
    preferredContact: 'Preferred contact method',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    propertyAddress: 'Property address',
    preferredLanguage: 'Preferred language',
    notes: 'Notes',
    notesPlaceholder: 'Access details, preferred timing or anything useful for the team.',
    consent: 'I give CasaMia permission to contact me about this plan.',
    submit: 'Choose next step',
    errors: {
      fullName: 'Add your full name.',
      email: 'Enter a valid email address.',
      telephone: 'Enter a valid 9-digit Spanish telephone number.',
      address: 'Add the property address.',
      consent: 'Confirm that CasaMia may contact you about this plan.',
    },
  },
  es: {
    eyebrow: 'Datos de contacto',
    title: '¿Dónde enviamos tu plan CasaMia?',
    body: 'Añade tus datos para que podamos confirmar el presupuesto o concertar una visita.',
    fullName: 'Nombre completo',
    email: 'Email',
    telephone: 'Teléfono',
    telephoneHint: 'Número español de 9 dígitos. Ejemplo: 600 000 000',
    preferredContact: 'Método de contacto preferido',
    phone: 'Teléfono',
    whatsapp: 'WhatsApp',
    propertyAddress: 'Dirección de la vivienda',
    preferredLanguage: 'Idioma preferido',
    notes: 'Notas',
    notesPlaceholder: 'Acceso, horario preferido o cualquier detalle útil para el equipo.',
    consent: 'Autorizo a CasaMia a contactarme sobre este plan.',
    submit: 'Elegir siguiente paso',
    errors: {
      fullName: 'Indica tu nombre completo.',
      email: 'Introduce un email válido.',
      telephone: 'Introduce un teléfono español válido de 9 dígitos.',
      address: 'Indica la dirección de la vivienda.',
      consent: 'Confirma que CasaMia puede contactarte sobre este plan.',
    },
  },
} as const

type ContactField = 'fullName' | 'email' | 'telephone' | 'address' | 'consent'

export function ConfigureContactPage() {
  const { i18n } = useTranslation()
  const { state, updateCustomer } = useConfigurator()
  const navigate = useNavigate()
  const copy = i18n.language.toLowerCase().startsWith('es') ? contactCopy.es : contactCopy.en
  const [error, setError] = useState<{ field: ContactField; message: string } | null>(null)

  function fail(field: ContactField, message: string) {
    setError({ field, message })
    requestAnimationFrame(() => document.getElementById(`configurator-${field}`)?.focus())
  }

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!state.customer.fullName.trim()) {
      fail('fullName', copy.errors.fullName)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customer.email.trim())) {
      fail('email', copy.errors.email)
      return
    }

    if (!isValidSpanishPhoneNumber(state.customer.telephone)) {
      fail('telephone', copy.errors.telephone)
      return
    }

    if (!state.customer.address.trim()) {
      fail('address', copy.errors.address)
      return
    }

    if (!state.customer.consentToContact) {
      fail('consent', copy.errors.consent)
      return
    }

    updateCustomer({
      email: state.customer.email.trim(),
      fullName: state.customer.fullName.trim(),
      telephone: `${SPAIN_DIAL_CODE} ${formatSpanishLocalNumber(getSpanishLocalNumber(state.customer.telephone))}`,
    })
    navigate('/configure/checkout')
  }

  const preferredLanguageOptions = copy === contactCopy.es
    ? [['Spanish', 'Español'], ['English', 'Inglés'], ['French', 'Francés'], ['German', 'Alemán'], ['Dutch', 'Neerlandés']]
    : [['Spanish', 'Spanish'], ['English', 'English'], ['French', 'French'], ['German', 'German'], ['Dutch', 'Dutch']]

  return (
    <section className="bg-light-blue pt-28">
      <div className="site-shell max-w-5xl py-14 md:py-20">
        <span className="eyebrow">
          <span className="dot" aria-hidden="true" />
          {copy.eyebrow}
        </span>
        <h1 className="display-title mt-5">{copy.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-mid">{copy.body}</p>

        <form
          className="mt-9 grid gap-5 rounded-lg border border-border bg-white p-6 shadow-soft md:grid-cols-2 md:p-8"
          noValidate
          onSubmit={submitContact}
        >
          <TextField
            autoComplete="name"
            error={error?.field === 'fullName'}
            id="configurator-fullName"
            label={copy.fullName}
            required
            value={state.customer.fullName}
            onChange={(value) => updateCustomer({ fullName: value })}
          />
          <TextField
            autoComplete="email"
            error={error?.field === 'email'}
            id="configurator-email"
            label={copy.email}
            required
            type="email"
            value={state.customer.email}
            onChange={(value) => updateCustomer({ email: value })}
          />
          <label className="grid gap-2 text-lg font-black text-text-dark" htmlFor="configurator-telephone">
            <span>{copy.telephone} *</span>
            <span className={`flex min-h-14 overflow-hidden rounded-lg border bg-white ${error?.field === 'telephone' ? 'border-red-500' : 'border-border'}`}>
              <span className="flex items-center border-r border-border bg-pale-blue px-4 text-navy">{SPAIN_DIAL_CODE}</span>
              <input
                aria-invalid={error?.field === 'telephone'}
                autoComplete="tel-national"
                className="min-w-0 flex-1 px-4 text-lg text-text-dark outline-none"
                id="configurator-telephone"
                inputMode="tel"
                maxLength={11}
                placeholder="600 000 000"
                required
                type="tel"
                value={formatSpanishLocalNumber(getSpanishLocalNumber(state.customer.telephone))}
                onChange={(event) => updateCustomer({ telephone: formatSpanishLocalNumber(getSpanishLocalNumber(event.target.value)) })}
              />
            </span>
            <small className="text-sm font-bold text-text-mid">{copy.telephoneHint}</small>
          </label>
          <SelectField
            id="configurator-preferred-contact"
            label={copy.preferredContact}
            value={state.customer.preferredContact}
            options={[["phone", copy.phone], ["whatsapp", copy.whatsapp], ["email", copy.email]]}
            onChange={(value) => updateCustomer({ preferredContact: value })}
          />
          <TextField
            autoComplete="street-address"
            error={error?.field === 'address'}
            id="configurator-address"
            label={copy.propertyAddress}
            required
            value={state.customer.address}
            wide
            onChange={(value) => updateCustomer({ address: value })}
          />
          <SelectField
            id="configurator-language"
            label={copy.preferredLanguage}
            value={state.customer.preferredLanguage}
            options={preferredLanguageOptions}
            onChange={(value) => updateCustomer({ preferredLanguage: value })}
          />
          <label className="grid gap-2 text-lg font-black text-text-dark md:col-span-2" htmlFor="configurator-notes">
            {copy.notes}
            <textarea
              className="min-h-32 rounded-lg border border-border bg-white px-4 py-3 text-lg text-text-dark"
              id="configurator-notes"
              placeholder={copy.notesPlaceholder}
              value={state.customer.notes}
              onChange={(event) => updateCustomer({ notes: event.target.value })}
            />
          </label>
          <label className={`flex gap-3 rounded-lg border p-4 text-base font-bold text-text-dark md:col-span-2 ${error?.field === 'consent' ? 'border-red-500 bg-red-50' : 'border-transparent bg-pale-blue'}`} htmlFor="configurator-consent">
            <input
              aria-invalid={error?.field === 'consent'}
              checked={state.customer.consentToContact}
              id="configurator-consent"
              required
              type="checkbox"
              onChange={(event) => updateCustomer({ consentToContact: event.target.checked })}
            />
            {copy.consent}
          </label>
          {error ? <p aria-live="assertive" className="rounded-lg bg-red-50 p-4 text-base font-bold text-red-700 md:col-span-2" role="alert">{error.message}</p> : null}
          <button className="btn btn-navy md:col-span-2 md:w-fit" type="submit">
            {copy.submit}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  )
}

function TextField({
  autoComplete,
  error = false,
  id,
  label,
  onChange,
  required = false,
  type = 'text',
  value,
  wide = false,
}: {
  autoComplete?: string
  error?: boolean
  id: string
  label: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  value: string
  wide?: boolean
}) {
  return (
    <label className={`grid gap-2 text-lg font-black text-text-dark ${wide ? 'md:col-span-2' : ''}`} htmlFor={id}>
      <span>{label}{required ? ' *' : ''}</span>
      <input
        aria-invalid={error}
        autoComplete={autoComplete}
        className={`min-h-14 rounded-lg border bg-white px-4 text-lg text-text-dark ${error ? 'border-red-500' : 'border-border'}`}
        id={id}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function SelectField({
  id,
  label,
  onChange,
  options,
  value,
}: {
  id: string
  label: string
  onChange: (value: string) => void
  options: ReadonlyArray<ReadonlyArray<string>>
  value: string
}) {
  return (
    <label className="grid gap-2 text-lg font-black text-text-dark" htmlFor={id}>
      {label}
      <select id={id} className="min-h-14 rounded-lg border border-border bg-white px-4 text-lg text-text-dark" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}
