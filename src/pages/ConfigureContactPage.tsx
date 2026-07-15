import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useConfigurator } from '../context/ConfiguratorContext'

export function ConfigureContactPage() {
  const { state, updateCustomer } = useConfigurator()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!state.customer.fullName.trim() || !state.customer.email.trim() || !state.customer.telephone.trim()) {
      setError('Please add name, email and telephone.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customer.email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!state.customer.address.trim()) {
      setError('Please add the property address.')
      return
    }

    if (!state.customer.consentToContact) {
      setError('Please confirm CasaMia may contact you about this configuration.')
      return
    }

    navigate('/configure/checkout')
  }

  return (
    <section className="bg-light-blue pt-28">
      <div className="site-shell max-w-5xl py-14 md:py-20">
        <span className="eyebrow">
          <span className="dot" aria-hidden="true" />
          Customer details
        </span>
        <h1 className="display-title mt-5">Where should CasaMia send the quote?</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-mid">
          Add the best contact details and any notes that help us finalise the recommendation.
        </p>

        <form className="mt-9 grid gap-5 rounded-lg border border-border bg-white p-6 shadow-soft md:grid-cols-2 md:p-8" onSubmit={submitContact}>
          <TextField label="Full name" value={state.customer.fullName} onChange={(value) => updateCustomer({ fullName: value })} />
          <TextField label="Email" type="email" value={state.customer.email} onChange={(value) => updateCustomer({ email: value })} />
          <TextField label="Telephone" type="tel" value={state.customer.telephone} onChange={(value) => updateCustomer({ telephone: value })} />
          <SelectField
            label="Preferred contact method"
            value={state.customer.preferredContact}
            options={[
              ['phone', 'Phone'],
              ['whatsapp', 'WhatsApp'],
              ['email', 'Email'],
            ]}
            onChange={(value) => updateCustomer({ preferredContact: value })}
          />
          <TextField label="Property address" value={state.customer.address} onChange={(value) => updateCustomer({ address: value })} wide />
          <SelectField
            label="Preferred language"
            value={state.customer.preferredLanguage}
            options={[
              ['Spanish', 'Spanish'],
              ['English', 'English'],
              ['French', 'French'],
              ['German', 'German'],
              ['Dutch', 'Dutch'],
            ]}
            onChange={(value) => updateCustomer({ preferredLanguage: value })}
          />
          <label className="grid gap-2 text-lg font-black text-text-dark md:col-span-2">
            Notes
            <textarea
              className="min-h-32 rounded-lg border border-border bg-white px-4 py-3 text-lg text-text-dark"
              value={state.customer.notes}
              onChange={(event) => updateCustomer({ notes: event.target.value })}
            />
          </label>
          <label className="flex gap-3 rounded-lg bg-pale-blue p-4 text-base font-bold text-text-dark md:col-span-2">
            <input
              checked={state.customer.consentToContact}
              type="checkbox"
              onChange={(event) => updateCustomer({ consentToContact: event.target.checked })}
            />
            I give CasaMia permission to contact me about this configuration.
          </label>
          {error ? <p className="rounded-lg bg-red-50 p-4 text-base font-bold text-red-700 md:col-span-2">{error}</p> : null}
          <button className="btn btn-navy md:col-span-2 md:w-fit" type="submit">
            Continue to final step
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  )
}

function TextField({
  label,
  onChange,
  type = 'text',
  value,
  wide = false,
}: {
  label: string
  onChange: (value: string) => void
  type?: string
  value: string
  wide?: boolean
}) {
  return (
    <label className={`grid gap-2 text-lg font-black text-text-dark ${wide ? 'md:col-span-2' : ''}`}>
      {label}
      <input
        className="min-h-14 rounded-lg border border-border bg-white px-4 text-lg text-text-dark"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: string[][]
  value: string
}) {
  return (
    <label className="grid gap-2 text-lg font-black text-text-dark">
      {label}
      <select className="min-h-14 rounded-lg border border-border bg-white px-4 text-lg text-text-dark" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}
