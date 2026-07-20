import { Download, Send } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

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

const withdrawalCopy = {
  en: {
    documentTitle: 'Withdrawal form',
    statement: 'I hereby give notice that I withdraw from my CasaMia contract/order.',
    reference: 'Reference',
    name: 'Customer name',
    orderReference: 'Order or project reference',
    address: 'Installation address',
    contact: 'Email or telephone',
    orderDate: 'Contract or order date',
    submissionDate: 'Submission date',
    comments: 'Comments',
    none: 'None',
    customerServiceEmail: 'Customer-service email',
    postalAddress: 'Postal withdrawal address',
    eyebrow: 'Withdrawal form',
    title: 'Withdraw from an order or project',
    body:
      'Submit this form online, download a printable copy, or contact customer service by email or post. No account login is required.',
    optionalComments: 'Optional supporting comments',
    submit: 'Submit form',
    download: 'Download printable copy',
    submitted:
      'Your request was submitted to the configured withdrawal endpoint. Keep the downloadable copy for your records.',
    localOnly:
      'This form was prepared locally only. Legal receipt is not confirmed until CasaMia receives it by email, post, or a configured backend.',
    alternatives: 'Alternative submission routes',
    email: 'Email:',
    post: 'Post:',
    errors: {
      name: 'Enter your name.',
      orderReference: 'Enter the order or project reference.',
      address: 'Enter the installation address.',
      contact: 'Enter an email address or telephone number.',
      orderDate: 'Enter the contract or order date.',
      submissionDate: 'Enter the submission date.',
      declaration: 'Confirm the withdrawal declaration.',
    },
  },
  es: {
    documentTitle: 'Formulario de desistimiento',
    statement: 'Por la presente comunico que desisto de mi contrato/pedido CasaMia.',
    reference: 'Referencia',
    name: 'Nombre del cliente',
    orderReference: 'Referencia del pedido o proyecto',
    address: 'Dirección de instalación',
    contact: 'Email o teléfono',
    orderDate: 'Fecha del contrato o pedido',
    submissionDate: 'Fecha de envío',
    comments: 'Comentarios',
    none: 'Ninguno',
    customerServiceEmail: 'Email de atención al cliente',
    postalAddress: 'Dirección postal para desistimiento',
    eyebrow: 'Formulario de desistimiento',
    title: 'Desistir de un pedido o proyecto',
    body:
      'Envía este formulario online, descarga una copia para imprimir o contacta con atención al cliente por email o correo postal. No necesitas iniciar sesión.',
    optionalComments: 'Comentarios opcionales de apoyo',
    submit: 'Enviar formulario',
    download: 'Descargar copia imprimible',
    submitted:
      'Tu solicitud se envió al endpoint de desistimiento configurado. Guarda la copia descargable para tus registros.',
    localOnly:
      'Este formulario solo se preparó localmente. La recepción legal no queda confirmada hasta que CasaMia lo reciba por email, correo postal o un backend configurado.',
    alternatives: 'Vías alternativas de envío',
    email: 'Email:',
    post: 'Correo postal:',
    errors: {
      name: 'Introduce tu nombre.',
      orderReference: 'Introduce la referencia del pedido o proyecto.',
      address: 'Introduce la dirección de instalación.',
      contact: 'Introduce un email o teléfono.',
      orderDate: 'Introduce la fecha del contrato o pedido.',
      submissionDate: 'Introduce la fecha de envío.',
      declaration: 'Confirma la declaración de desistimiento.',
    },
  },
} as const

type WithdrawalCopy = (typeof withdrawalCopy)[keyof typeof withdrawalCopy]

function buildWithdrawalText(values: WithdrawalValues, reference: string, copy: WithdrawalCopy) {
  return `${copy.documentTitle}
Reference: ${reference}

${copy.statement}

${copy.name}: ${values.name}
${copy.orderReference}: ${values.orderReference}
${copy.address}: ${values.address}
${copy.contact}: ${values.contact}
${copy.orderDate}: ${values.orderDate}
${copy.submissionDate}: ${values.submissionDate}
${copy.comments}: ${values.comments || copy.none}

${copy.customerServiceEmail}: ${casamiaCompanyConfig.customerServiceEmail}
${copy.postalAddress}: ${casamiaCompanyConfig.registeredAddress}
`
}

export function WithdrawalFormPage() {
  const { i18n } = useTranslation()
  const copy = i18n.language.toLowerCase().startsWith('es') ? withdrawalCopy.es : withdrawalCopy.en
  const [values, setValues] = useState<WithdrawalValues>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmationReference, setConfirmationReference] = useState('')
  const withdrawalApiUrl = import.meta.env.VITE_WITHDRAWAL_API_URL || (import.meta.env.PROD ? '/api/withdrawal-requests' : '')
  const withdrawalBackendConfigured = Boolean(withdrawalApiUrl)
  const downloadableText = useMemo(
    () => buildWithdrawalText(values, confirmationReference || 'DRAFT', copy),
    [confirmationReference, copy, values],
  )

  useEffect(() => {
    document.title = `${copy.documentTitle} | CasaMia`
  }, [copy.documentTitle])

  function updateValue<Field extends keyof WithdrawalValues>(field: Field, value: WithdrawalValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (!values.name.trim()) nextErrors.name = copy.errors.name
    if (!values.orderReference.trim()) nextErrors.orderReference = copy.errors.orderReference
    if (!values.address.trim()) nextErrors.address = copy.errors.address
    if (!values.contact.trim()) nextErrors.contact = copy.errors.contact
    if (!values.orderDate) nextErrors.orderDate = copy.errors.orderDate
    if (!values.submissionDate) nextErrors.submissionDate = copy.errors.submissionDate
    if (!values.declaration) nextErrors.declaration = copy.errors.declaration
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
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>

        <form className="withdrawal-form" onSubmit={handleSubmit}>
          <WithdrawalField error={errors.name} label={copy.name}>
            <input value={values.name} onChange={(event) => updateValue('name', event.target.value)} />
          </WithdrawalField>
          <WithdrawalField error={errors.orderReference} label={copy.orderReference}>
            <input value={values.orderReference} onChange={(event) => updateValue('orderReference', event.target.value)} />
          </WithdrawalField>
          <WithdrawalField error={errors.address} label={copy.address}>
            <textarea value={values.address} rows={3} onChange={(event) => updateValue('address', event.target.value)} />
          </WithdrawalField>
          <WithdrawalField error={errors.contact} label={copy.contact}>
            <input value={values.contact} onChange={(event) => updateValue('contact', event.target.value)} />
          </WithdrawalField>
          <WithdrawalField error={errors.orderDate} label={copy.orderDate}>
            <input type="date" value={values.orderDate} onChange={(event) => updateValue('orderDate', event.target.value)} />
          </WithdrawalField>
          <WithdrawalField error={errors.submissionDate} label={copy.submissionDate}>
            <input
              type="date"
              value={values.submissionDate}
              onChange={(event) => updateValue('submissionDate', event.target.value)}
            />
          </WithdrawalField>
          <WithdrawalField label={copy.optionalComments}>
            <textarea value={values.comments} rows={4} onChange={(event) => updateValue('comments', event.target.value)} />
          </WithdrawalField>

          <label className="withdrawal-declaration">
            <input
              checked={values.declaration}
              type="checkbox"
              onChange={(event) => updateValue('declaration', event.target.checked)}
            />
            <span>{copy.statement}</span>
          </label>
          {errors.declaration ? <small className="withdrawal-error">{errors.declaration}</small> : null}

          <div className="withdrawal-actions">
            <button className="btn btn-green" type="submit">
              {copy.submit}
              <Send size={18} aria-hidden="true" />
            </button>
            <button className="btn btn-white" type="button" onClick={downloadForm}>
              {copy.download}
              <Download size={18} aria-hidden="true" />
            </button>
          </div>
        </form>

        {confirmationReference ? (
          <div className="withdrawal-confirmation" role="status">
            <strong>{copy.reference}: {confirmationReference}</strong>
            <p>
              {withdrawalBackendConfigured
                ? copy.submitted
                : copy.localOnly}
            </p>
          </div>
        ) : null}

        <aside className="withdrawal-alternatives">
          <h2>{copy.alternatives}</h2>
          <p>{copy.email} {casamiaCompanyConfig.customerServiceEmail}</p>
          <p>{copy.post} {casamiaCompanyConfig.registeredAddress}</p>
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
