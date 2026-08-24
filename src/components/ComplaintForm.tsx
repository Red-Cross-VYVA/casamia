import { AlertCircle, CheckCircle2, LoaderCircle, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { submitContactRequest } from '../services/contactRequests'

export function ComplaintForm() {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.toLowerCase().startsWith('es')
  const copy = isSpanish ? copyEs : copyEn
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const form = event.currentTarget
    const data = new FormData(form)

    setIsSubmitting(true)
    setSubmitted(false)
    setError('')

    try {
      const result = await submitContactRequest({
        email: String(data.get('email') ?? '').trim(),
        consentConfirmed: data.get('consent') === 'on',
        immediateSafetyRisk: data.get('immediateSafetyRisk') === 'on',
        locale: i18n.language,
        message: String(data.get('message') ?? '').trim(),
        name: String(data.get('name') ?? '').trim(),
        orderReference: String(data.get('orderReference') ?? '').trim(),
        phone: String(data.get('phone') ?? '').trim(),
        plan: 'Complaint or service issue',
        source: 'complaints-page',
        type: 'complaint_request',
      })
      setConfirmationEmailSent(result.confirmationEmailSent)
      form.reset()
      setSubmitted(true)
    } catch {
      setError(copy.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="complaint-form-section" aria-labelledby="complaint-form-title">
      <div className="site-shell">
        <div className="complaint-form-layout">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 id="complaint-form-title">{copy.title}</h2>
            <p>{copy.intro}</p>
            <p className="complaint-safety-note">{copy.safety}</p>
          </div>

          <form className="complaint-form" noValidate onSubmit={handleSubmit}>
            <div className="complaint-form-grid">
              <Field label={copy.name} name="name" required />
              <Field label={copy.email} name="email" required type="email" />
              <Field label={copy.phone} name="phone" type="tel" />
              <Field label={copy.reference} name="orderReference" />
            </div>
            <label>
              <span>{copy.message}</span>
              <textarea name="message" required rows={6} />
            </label>
            <label className="complaint-checkbox">
              <input name="immediateSafetyRisk" type="checkbox" />
              <span>{copy.immediateRisk}</span>
            </label>
            <label className="complaint-checkbox">
              <input name="consent" required type="checkbox" />
              <span>{copy.consent}</span>
            </label>
            <button className="btn btn-green" disabled={isSubmitting} type="submit">
              {isSubmitting ? <LoaderCircle className="animate-spin" size={19} aria-hidden="true" /> : <Send size={19} aria-hidden="true" />}
              {isSubmitting ? copy.sending : copy.submit}
            </button>
            {error ? <p className="complaint-form-status is-error" role="alert"><AlertCircle size={18} aria-hidden="true" />{error}</p> : null}
            {submitted ? <p className="complaint-form-status is-success" role="status"><CheckCircle2 size={18} aria-hidden="true" />{confirmationEmailSent ? copy.success : copy.successSaved}</p> : null}
          </form>
        </div>
      </div>
    </section>
  )
}

function Field({ label, name, required, type = 'text' }: { label: string; name: string; required?: boolean; type?: string }) {
  return <label><span>{label}</span><input name={name} required={required} type={type} /></label>
}

const copyEn = {
  consent: 'I agree that CasaMia may use these details to investigate and respond to my complaint. See the Privacy Policy for more information.',
  email: 'Email',
  error: 'Your complaint could not be submitted. Please try again or email hola@casamia.com.es.',
  eyebrow: 'Send a complaint',
  immediateRisk: 'This issue presents an immediate safety risk.',
  intro: 'Tell us what happened and include the project reference when available. We will email a receipt in the language you are using.',
  message: 'What happened?',
  name: 'Name',
  phone: 'Phone',
  reference: 'Order or project reference',
  safety: 'If anyone is in immediate danger, stop using the affected installation and call 112.',
  sending: 'Sending...',
  submit: 'Submit complaint',
  success: 'Your complaint was recorded. A confirmation email has been sent to you.',
  successSaved: 'Your complaint was recorded. CasaMia will contact you using the details provided.',
  title: 'Tell CasaMia what needs attention.',
}

const copyEs = {
  consent: 'Acepto que CasaMia utilice estos datos para investigar y responder a mi reclamación. Consulta la Política de privacidad para más información.',
  email: 'Correo electrónico',
  error: 'No se pudo enviar la reclamación. Inténtalo de nuevo o escribe a hola@casamia.com.es.',
  eyebrow: 'Enviar una reclamación',
  immediateRisk: 'Esta incidencia presenta un riesgo inmediato de seguridad.',
  intro: 'Cuéntanos qué ha ocurrido e incluye la referencia del proyecto cuando la tengas. Te enviaremos un justificante en el idioma que estás utilizando.',
  message: '¿Qué ha ocurrido?',
  name: 'Nombre',
  phone: 'Teléfono',
  reference: 'Referencia del pedido o proyecto',
  safety: 'Si existe un peligro inmediato, deja de usar la instalación afectada y llama al 112.',
  sending: 'Enviando...',
  submit: 'Enviar reclamación',
  success: 'Tu reclamación ha quedado registrada. Te hemos enviado un correo de confirmación.',
  successSaved: 'Tu reclamación ha quedado registrada. CasaMia se pondrá en contacto contigo usando los datos facilitados.',
  title: 'Cuéntanos qué necesita atención.',
}
