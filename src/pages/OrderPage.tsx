import {
  ArrowRight,
  CalendarClock,
  Check,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import {
  callbackTimeWindows,
  createCallbackRequestIdempotencyKey,
  submitCallbackRequest,
  type CallbackRequestInput,
} from '../services/callbackRequests'
import { createWizardReference } from '../services/wizardStorage'

type OrderCopy = {
  eyebrow: string
  title: string
  intro: string
  regionLabel: string
  whatsappTitle: string
  whatsappBody: string
  whatsappCta: string
  callbackTitle: string
  callbackBody: string
  callTitle: string
  callBody: string
  callCta: string
  formTitle: string
  formBody: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  timeOptions: Record<string, string>
  notes: string
  notesPlaceholder: string
  submit: string
  success: string
  successSaved: string
  error: string
  consent: string
  back: string
  trust: string[]
}

const orderCopy: Record<'en' | 'es', OrderCopy> = {
  en: {
    eyebrow: 'Contact CasaMia',
    title: 'Tell us what the home needs help with.',
    intro:
      'Choose the easiest way to ask about a visit, a room plan, grant-readiness or local availability. We will confirm what to check next before anything is booked.',
    regionLabel: 'Selected zone',
    whatsappTitle: 'Send a quick email',
    whatsappBody: 'Best if you already know the location, room or concern and want CasaMia to reply with the first things to confirm.',
    whatsappCta: 'Write email',
    callbackTitle: 'Request a callback',
    callbackBody: 'Best if you want CasaMia to call, understand the situation and suggest the next useful check.',
    callTitle: 'Need a fast answer?',
    callBody: 'Email CasaMia directly if the situation is time-sensitive or you are unsure which option to choose.',
    callCta: 'Contact CasaMia',
    formTitle: 'Request a callback',
    formBody: 'Choose a preferred time and add the room, routine or concern you want to discuss.',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    date: 'Preferred date',
    time: 'Preferred time',
    timeOptions: { '09:00-12:00': '09:00-12:00', '12:00-15:00': '12:00-15:00', '15:00-18:00': '15:00-18:00', '18:00-20:00': '18:00-20:00', flexible: 'Flexible' },
    notes: 'What should we understand first?',
    notesPlaceholder: 'Example: Madrid, bathroom transfers, night route, grant question...',
    submit: 'Request callback',
    success: 'Callback request received. We have emailed your confirmation.',
    successSaved: 'Callback request received. CasaMia will contact you using the details provided.',
    error: 'We could not send your callback details. Please check the details and try again.',
    consent: 'I agree that CasaMia may use these details to arrange and confirm my callback.',
    back: 'Back to coverage map',
    trust: ['No commitment', 'Room-first guidance', 'Safety and grant-readiness support'],
  },
  es: {
    eyebrow: 'Contacta con CasaMia',
    title: 'Cuéntanos en qué necesita ayuda la vivienda.',
    intro:
      'Elige la forma más sencilla de preguntar por una visita, un plan por estancia, preparación de ayudas o disponibilidad local. Confirmaremos qué revisar antes de reservar nada.',
    regionLabel: 'Zona seleccionada',
    whatsappTitle: 'Enviar un email rápido',
    whatsappBody: 'Mejor si ya sabes la ubicación, estancia o preocupación y quieres que CasaMia responda con lo primero que conviene confirmar.',
    whatsappCta: 'Escribir email',
    callbackTitle: 'Solicitar una llamada',
    callbackBody: 'Mejor si quieres que CasaMia llame, entienda la situación y sugiera la revisión más útil.',
    callTitle: '¿Necesitas respuesta rápida?',
    callBody: 'Escribe directamente a CasaMia si la situación tiene prisa o no sabes qué opción elegir.',
    callCta: 'Contactar con CasaMia',
    formTitle: 'Solicitar llamada',
    formBody: 'Elige un horario preferido y añade la estancia, rutina o preocupación que quieres comentar.',
    name: 'Nombre',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    date: 'Fecha preferida',
    time: 'Horario preferido',
    timeOptions: { '09:00-12:00': '09:00-12:00', '12:00-15:00': '12:00-15:00', '15:00-18:00': '15:00-18:00', '18:00-20:00': '18:00-20:00', flexible: 'Flexible' },
    notes: '¿Qué debemos entender primero?',
    notesPlaceholder: 'Ejemplo: Madrid, transferencias en baño, ruta nocturna, duda de ayudas...',
    submit: 'Solicitar llamada',
    success: 'Solicitud de llamada recibida. Te hemos enviado la confirmación por email.',
    successSaved: 'Solicitud de llamada recibida. CasaMia contactará usando los datos facilitados.',
    error: 'No se pudo enviar la solicitud. Revisa los datos e inténtalo de nuevo.',
    consent: 'Acepto que CasaMia utilice estos datos para organizar y confirmar mi llamada.',
    back: 'Volver al mapa de cobertura',
    trust: ['Sin compromiso', 'Orientación por estancia', 'Apoyo en seguridad y preparación de ayudas'],
  },
}

const zoneLabels: Record<string, { en: string; es: string }> = {
  galicia: { en: 'Galicia', es: 'Galicia' },
  'basque-country': { en: 'Basque Country', es: 'País Vasco' },
  catalonia: { en: 'Catalonia', es: 'Cataluña' },
  madrid: { en: 'Madrid', es: 'Madrid' },
  valencia: { en: 'Valencia', es: 'Valencia' },
  andalusia: { en: 'Andalusia', es: 'Andalucía' },
  'balearic-islands': { en: 'Balearic Islands', es: 'Baleares' },
  'canary-islands': { en: 'Canary Islands', es: 'Canarias' },
}

const casaMiaContact = 'hola@casamia.com.es'
const contactHref = `mailto:${casaMiaContact}`

function getOrderCopy(language: string) {
  return language.startsWith('es') ? orderCopy.es : orderCopy.en
}

export function OrderPage() {
  const { i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const copy = getOrderCopy(i18n.language)
  const isSpanish = i18n.language.startsWith('es')
  const selectedZone = searchParams.get('zone') ?? ''
  const zoneName = zoneLabels[selectedZone]?.[isSpanish ? 'es' : 'en'] ?? (isSpanish ? 'Toda España' : 'All Spain')
  const minimumCallbackDate = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Madrid',
    year: 'numeric',
  }).format(new Date())
  const [saved, setSaved] = useState(false)
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const whatsappHref = useMemo(() => {
    const message = isSpanish
      ? `Hola CasaMia, quiero pedir información para ${zoneName}.\n\nLa estancia o preocupación principal es:\nEl mejor momento para contactarme es:`
      : `Hello CasaMia, I'd like help with ${zoneName}.\n\nThe main room or concern is:\nThe best time to contact me is:`

    const subject = isSpanish ? `Consulta CasaMia para ${zoneName}` : `CasaMia enquiry for ${zoneName}`

    return `${contactHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
  }, [isSpanish, zoneName])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const formElement = event.currentTarget
    const form = new FormData(event.currentTarget)
    setIsSubmitting(true)
    setSaved(false)
    setSubmitError('')

    try {
      const result = await submitCallbackRequest({
        city: zoneName,
        consentConfirmed: form.get('consent') === 'on',
        email: String(form.get('email') ?? ''),
        idempotencyKey: createCallbackRequestIdempotencyKey(),
        locale: isSpanish ? 'es' : 'en',
        name: String(form.get('name') ?? ''),
        note: String(form.get('notes') ?? ''),
        phone: String(form.get('phone') ?? ''),
        preferredCallbackDate: String(form.get('date') ?? ''),
        preferredTimeWindow: String(form.get('time') ?? '') as CallbackRequestInput['preferredTimeWindow'],
        wizardReference: createWizardReference(),
      })
      setConfirmationEmailSent(result.confirmationEmailSent)
      setSaved(true)
      formElement.reset()
    } catch {
      setSubmitError(copy.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <SEO title={copy.eyebrow} description={copy.intro} path="/order" noindex />
      <section className="order-hero">
        <div className="order-hero-inner site-shell">
          <div>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <p>{copy.intro}</p>
          </div>

          <aside className="order-zone-panel">
            <ShieldCheck size={24} aria-hidden="true" />
            <span>{copy.regionLabel}</span>
            <strong>{zoneName}</strong>
          </aside>
        </div>
      </section>

      <section className="order-section">
        <div className="order-layout site-shell">
          <div className="order-option-grid">
            <a className="order-option-card is-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">
              <span>
                <Mail size={28} aria-hidden="true" />
              </span>
              <h2>{copy.whatsappTitle}</h2>
              <p>{copy.whatsappBody}</p>
              <strong>
                {copy.whatsappCta}
                <ArrowRight size={18} aria-hidden="true" />
              </strong>
            </a>

            <a className="order-option-card" href="#callback">
              <span>
                <CalendarClock size={28} aria-hidden="true" />
              </span>
              <h2>{copy.callbackTitle}</h2>
              <p>{copy.callbackBody}</p>
              <strong>
                {copy.submit}
                <ArrowRight size={18} aria-hidden="true" />
              </strong>
            </a>

            <a className="order-option-card" href={contactHref}>
              <span>
                <Mail size={28} aria-hidden="true" />
              </span>
              <h2>{copy.callTitle}</h2>
              <p>{copy.callBody}</p>
              <strong>
                {copy.callCta}
                <ArrowRight size={18} aria-hidden="true" />
              </strong>
            </a>
          </div>

          <aside className="order-contact-panel" id="callback">
            <h2>{copy.formTitle}</h2>
            <p>{copy.formBody}</p>

            <form className="order-callback-form" onSubmit={handleSubmit}>
              <label>
                <span>{copy.name}</span>
                <input name="name" required type="text" />
              </label>
              <label>
                <span>{copy.phone}</span>
                <input name="phone" required type="tel" />
              </label>
              <label>
                <span>{copy.email}</span>
                <input name="email" required type="email" />
              </label>
              <label>
                <span>{copy.date}</span>
                <input min={minimumCallbackDate} name="date" required type="date" />
              </label>
              <label>
                <span>{copy.time}</span>
                <select defaultValue="" name="time" required>
                  <option disabled value="">{copy.time}</option>
                  {callbackTimeWindows.map((window) => <option key={window} value={window}>{copy.timeOptions[window]}</option>)}
                </select>
              </label>
              <label>
                <span>{copy.notes}</span>
                <textarea name="notes" placeholder={copy.notesPlaceholder} rows={4} />
              </label>
              <label className="order-consent">
                <input name="consent" required type="checkbox" />
                <span>{copy.consent}</span>
              </label>
              <button className="btn btn-green" disabled={isSubmitting} type="submit">
                {copy.submit}
                {isSubmitting ? <LoaderCircle className="animate-spin" size={20} aria-hidden="true" /> : <ArrowRight size={20} aria-hidden="true" />}
              </button>
            </form>

            {submitError ? <p className="order-error" role="alert">{submitError}</p> : null}

            {saved ? (
              <p className="order-success">
                <Check size={18} aria-hidden="true" />
                {confirmationEmailSent ? copy.success : copy.successSaved}
              </p>
            ) : null}
          </aside>
        </div>

        <div className="order-trust-row site-shell">
          {copy.trust.map((item) => (
            <span key={item}>
              <Check size={17} aria-hidden="true" />
              {item}
            </span>
          ))}
          <a href={contactHref}>{casaMiaContact}</a>
        </div>

        <div className="site-shell">
          <Link className="order-back-link" to="/about">
            {copy.back}
          </Link>
        </div>
      </section>
    </>
  )
}
