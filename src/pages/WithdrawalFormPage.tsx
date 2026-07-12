import { Download, Send } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { casamiaCompanyConfig } from '../config/company'

type WithdrawalValues = {
  address: string
  comments: string
  contact: string
  declaration: boolean
  name: string
  orderDate: string
  orderReference: string
  submissionDate: string
}

const initialValues: WithdrawalValues = {
  address: '',
  comments: '',
  contact: '',
  declaration: false,
  name: '',
  orderDate: '',
  orderReference: '',
  submissionDate: new Date().toISOString().slice(0, 10),
}

function buildWithdrawalText(values: WithdrawalValues, reference: string) {
  return `Withdrawal form
Reference: ${reference}

I hereby give notice that I withdraw from my CasaMia contract/order.

Customer name: ${values.name}
Order or project reference: ${values.orderReference}
Installation address: ${values.address}
Email or telephone: ${values.contact}
Contract or order date: ${values.orderDate}
Submission date: ${values.submissionDate}
Comments: ${values.comments || 'None'}

Customer-service email: ${casamiaCompanyConfig.customerServiceEmail}
Postal withdrawal address: ${casamiaCompanyConfig.registeredAddress}
`
}

export function WithdrawalFormPage() {
  const [values, setValues] = useState<WithdrawalValues>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmationReference, setConfirmationReference] = useState('')
  const withdrawalApiUrl = import.meta.env.VITE_WITHDRAWAL_API_URL || (import.meta.env.PROD ? '/api/withdrawal-requests' : '')
  const withdrawalBackendConfigured = Boolean(withdrawalApiUrl)
  const downloadableText = useMemo(
    () => buildWithdrawalText(values, confirmationReference || 'DRAFT'),
    [confirmationReference, values],
  )

  function updateValue<Field extends keyof WithdrawalValues>(field: Field, value: WithdrawalValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (!values.name.trim()) nextErrors.name = 'Enter your name.'
    if (!values.orderReference.trim()) nextErrors.orderReference = 'Enter the order or project reference.'
    if (!values.address.trim()) nextErrors.address = 'Enter the installation address.'
    if (!values.contact.trim()) nextErrors.contact = 'Enter an email address or telephone number.'
    if (!values.orderDate) nextErrors.orderDate = 'Enter the contract or order date.'
    if (!values.submissionDate) nextErrors.submissionDate = 'Enter the submission date.'
    if (!values.declaration) nextErrors.declaration = 'Confirm the withdrawal declaration.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    if (withdrawalBackendConfigured) {
      // The public contract is defined here; production should wire this to a durable backend receipt service.
      await fetch(withdrawalApiUrl, {
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    }

    setConfirmationReference(`WD-${Date.now().toString(36).toUpperCase()}`)
  }

  function downloadForm() {
    const blob = new Blob([downloadableText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${confirmationReference || 'withdrawal-form'}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="legal-page withdrawal-page">
      <div className="site-shell">
        <p className="eyebrow">Withdrawal form</p>
        <h1>Withdraw from an order or project</h1>
        <p>
          Submit this form online, download a printable copy, or contact customer service by email or post. No account
          login is required.
        </p>

        <form className="withdrawal-form" onSubmit={handleSubmit}>
          <WithdrawalField error={errors.name} label="Customer name">
            <input value={values.name} onChange={(event) => updateValue('name', event.target.value)} />
          </WithdrawalField>
          <WithdrawalField error={errors.orderReference} label="Order or project reference">
            <input value={values.orderReference} onChange={(event) => updateValue('orderReference', event.target.value)} />
          </WithdrawalField>
          <WithdrawalField error={errors.address} label="Installation address">
            <textarea value={values.address} rows={3} onChange={(event) => updateValue('address', event.target.value)} />
          </WithdrawalField>
          <WithdrawalField error={errors.contact} label="Email or telephone">
            <input value={values.contact} onChange={(event) => updateValue('contact', event.target.value)} />
          </WithdrawalField>
          <WithdrawalField error={errors.orderDate} label="Contract or order date">
            <input type="date" value={values.orderDate} onChange={(event) => updateValue('orderDate', event.target.value)} />
          </WithdrawalField>
          <WithdrawalField error={errors.submissionDate} label="Submission date">
            <input
              type="date"
              value={values.submissionDate}
              onChange={(event) => updateValue('submissionDate', event.target.value)}
            />
          </WithdrawalField>
          <WithdrawalField label="Optional supporting comments">
            <textarea value={values.comments} rows={4} onChange={(event) => updateValue('comments', event.target.value)} />
          </WithdrawalField>

          <label className="withdrawal-declaration">
            <input
              checked={values.declaration}
              type="checkbox"
              onChange={(event) => updateValue('declaration', event.target.checked)}
            />
            <span>I hereby give notice that I withdraw from my CasaMia contract/order.</span>
          </label>
          {errors.declaration ? <small className="withdrawal-error">{errors.declaration}</small> : null}

          <div className="withdrawal-actions">
            <button className="btn btn-green" type="submit">
              Submit form
              <Send size={18} aria-hidden="true" />
            </button>
            <button className="btn btn-white" type="button" onClick={downloadForm}>
              Download printable copy
              <Download size={18} aria-hidden="true" />
            </button>
          </div>
        </form>

        {confirmationReference ? (
          <div className="withdrawal-confirmation" role="status">
            <strong>Reference: {confirmationReference}</strong>
            <p>
              {withdrawalBackendConfigured
                ? 'Your request was submitted to the configured withdrawal endpoint. Keep the downloadable copy for your records.'
                : 'This form was prepared locally only. Legal receipt is not confirmed until CasaMia receives it by email, post, or a configured backend.'}
            </p>
          </div>
        ) : null}

        <aside className="withdrawal-alternatives">
          <h2>Alternative submission routes</h2>
          <p>Email: {casamiaCompanyConfig.customerServiceEmail}</p>
          <p>Post: {casamiaCompanyConfig.registeredAddress}</p>
        </aside>
      </div>
    </main>
  )
}

function WithdrawalField({
  children,
  error,
  label,
}: {
  children: ReactNode
  error?: string
  label: string
}) {
  return (
    <label className="withdrawal-field">
      <span>{label} *</span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  )
}
