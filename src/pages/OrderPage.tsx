import {
  ArrowRight,
  CalendarClock,
  Check,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

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
  phone: string
  notes: string
  notesPlaceholder: string
  submit: string
  success: string
  back: string
  trust: string[]
}

const orderCopy: Record<'en' | 'es', OrderCopy> = {
  en: {
    eyebrow: 'Start your CasaMia order',
    title: 'Choose how you want the local team to contact you.',
    intro:
      'Pick the fastest option. CasaMia will connect you with the right representative for your zone and next step.',
    regionLabel: 'Selected zone',
    whatsappTitle: 'Email',
    whatsappBody: 'Send a quick email and get a response with the next available support option.',
    whatsappCta: 'Email CasaMia',
    callbackTitle: 'Call me',
    callbackBody: 'Leave your number and CasaMia will prepare a callback request for the local team.',
    callTitle: 'Contact us',
    callBody: 'Email CasaMia if the home needs urgent support or a fast answer.',
    callCta: 'Email CasaMia',
    formTitle: 'Request a callback',
    formBody: 'This demo saves the request locally until the lead backend is connected.',
    name: 'Name',
    phone: 'Phone',
    notes: 'What should we know?',
    notesPlaceholder: 'Example: Madrid, bathroom safety, preferred call time...',
    submit: 'Request callback',
    success: 'Callback request saved.',
    back: 'Back to coverage map',
    trust: ['No commitment', 'Local follow-up', 'Safety and grant guidance'],
  },
  es: {
    eyebrow: 'Empieza tu pedido CasaMia',
    title: 'Elige cómo quieres que contacte el equipo local.',
    intro:
      'Escoge la opción más cómoda. CasaMia te conecta con el representante adecuado para tu zona y siguiente paso.',
    regionLabel: 'Zona seleccionada',
    whatsappTitle: 'Email',
    whatsappBody: 'Envía un email y recibe respuesta con la siguiente opción disponible.',
    whatsappCta: 'Enviar email',
    callbackTitle: 'Llamadme',
    callbackBody: 'Deja tu número y CasaMia preparará una solicitud de llamada para el equipo local.',
    callTitle: 'Contactar',
    callBody: 'Escribe a CasaMia si la vivienda necesita apoyo urgente o una respuesta rápida.',
    callCta: 'Enviar email',
    formTitle: 'Solicitar llamada',
    formBody: 'Esta demo guarda la solicitud localmente hasta conectar el backend de leads.',
    name: 'Nombre',
    phone: 'Teléfono',
    notes: '¿Qué debemos saber?',
    notesPlaceholder: 'Ejemplo: Madrid, seguridad en baño, mejor hora para llamar...',
    submit: 'Solicitar llamada',
    success: 'Solicitud de llamada guardada.',
    back: 'Volver al mapa de cobertura',
    trust: ['Sin compromiso', 'Seguimiento local', 'Guía de seguridad y ayudas'],
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
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    document.title = `${copy.eyebrow} | CasaMia`
  }, [copy.eyebrow])

  const whatsappHref = useMemo(() => {
    const message = isSpanish
      ? `Hola CasaMia, quiero pedir información para ${zoneName}.`
      : `Hello CasaMia, I want to request support for ${zoneName}.`

    return `${contactHref}?subject=${encodeURIComponent(`CasaMia support for ${zoneName}`)}&body=${encodeURIComponent(message)}`
  }, [isSpanish, zoneName])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = {
      createdAt: new Date().toISOString(),
      zone: zoneName,
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      notes: String(form.get('notes') ?? ''),
    }

    const stored = JSON.parse(localStorage.getItem('casamia_callback_requests') ?? '[]') as unknown[]
    localStorage.setItem('casamia_callback_requests', JSON.stringify([payload, ...stored].slice(0, 20)))
    setSaved(true)
    event.currentTarget.reset()
  }

  return (
    <>
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
                <span>{copy.notes}</span>
                <textarea name="notes" placeholder={copy.notesPlaceholder} rows={4} />
              </label>
              <button className="btn btn-green" type="submit">
                {copy.submit}
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            </form>

            {saved ? (
              <p className="order-success">
                <Check size={18} aria-hidden="true" />
                {copy.success}
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
