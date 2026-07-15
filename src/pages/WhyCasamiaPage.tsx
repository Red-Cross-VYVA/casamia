import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Handshake,
  Home,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Tags,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { TrustBar } from '../components/TrustBar'
import { submitContactRequest } from '../services/contactRequests'
import { trackEvent } from '../utils/analytics'

type WhyCasamiaCopy = {
  eyebrow: string
  headline: string
  intro: string
  heroProof: Array<{
    value: string
    label: string
  }>
  promiseTitle: string
  promiseBody: string
  promisePoints: string[]
  processEyebrow: string
  processTitle: string
  processSteps: Array<{
    title: string
    body: string
  }>
  sections: Array<{
    icon: 'inspectors' | 'partners' | 'insured' | 'products' | 'pricing' | 'acceptance'
    title: string
    body: string
    points: string[]
  }>
  contactEyebrow: string
  contactTitle: string
  contactBody: string
  callTitle: string
  emailTitle: string
  messagePlaceholder: string
  formNote: string
  ctaButton: string
}

const whyCasamiaCopy: Record<'en' | 'es', WhyCasamiaCopy> = {
  en: {
    eyebrow: 'Why us',
    headline: 'Why families choose CasaMia',
    intro:
      'Choosing a home safety partner means trusting someone with your home, your comfort, and your loved ones. CasaMia combines qualified reviews, trusted local coordination, transparent proposals, and careful follow-through.',
    heroProof: [
      { value: 'Room-by-room', label: 'risk review before recommendations' },
      { value: 'Clear scope', label: 'before any work is agreed' },
      { value: 'One team', label: 'from first concern to follow-up' },
    ],
    promiseTitle: 'A careful, accountable way to adapt the home.',
    promiseBody:
      'CasaMia is built for families who need practical changes without pressure, guesswork, or confusing handovers. Every recommendation starts with the resident, the home, and the daily routine.',
    promisePoints: [
      'We explain why each adaptation is recommended.',
      'We separate urgent safety priorities from nice-to-have improvements.',
      'We keep the family informed from first review to completion.',
    ],
    processEyebrow: 'CasaMia method',
    processTitle: 'How trust is built into the work',
    processSteps: [
      {
        title: 'Assess first',
        body: 'We review rooms, routes, mobility needs, lighting, access, and transfer points before suggesting products.',
      },
      {
        title: 'Agree the scope',
        body: 'You see the plan, priorities, likely cost, and timing before committing to installation.',
      },
      {
        title: 'Coordinate delivery',
        body: 'CasaMia keeps visit notes, installer briefing, family updates, and handover details together.',
      },
      {
        title: 'Support after handover',
        body: 'The family has a clear point of contact for questions, follow-up, and next steps.',
      },
    ],
    sections: [
      {
        icon: 'inspectors',
        title: 'Qualified Safety Review',
        body:
          'Our process starts with practical home safety thinking: where falls happen, where movement feels difficult, and where simple adaptations can make daily life safer.',
        points: ['Room-by-room risk review', 'Falls, lighting, access, and mobility focus', 'Clear recommendations before work begins'],
      },
      {
        icon: 'partners',
        title: 'Trusted Local Coordination',
        body:
          'CasaMia coordinates reliable local professionals where installation is needed, while keeping the family journey clear and joined up.',
        points: ['Local availability checked', 'Respectful in-home work', 'Practical installation planning'],
      },
      {
        icon: 'insured',
        title: 'Professional Standards',
        body:
          'Families need confidence that the work is handled professionally. CasaMia structures projects around clear standards and accountable delivery.',
        points: ['Professional work standards', 'Clear responsibility', 'Confidence from inspection to completion'],
      },
      {
        icon: 'products',
        title: 'Quality Safety Products',
        body:
          'The best safety products are the ones people actually use every day. CasaMia prioritises reliable, practical equipment suited to the home.',
        points: ['Grab bars, lighting, access, and alert systems', 'Durable products for daily routines', 'Smart technology only where it helps'],
      },
      {
        icon: 'pricing',
        title: 'Transparent Proposals',
        body:
          'No family should feel pushed into unclear work. CasaMia explains the recommended scope, likely cost, and possible grant routes before installation.',
        points: ['Clear scope before commitment', 'Plan-based package structure', 'Grant-readiness guidance where available'],
      },
      {
        icon: 'acceptance',
        title: 'Clear Follow-Through',
        body:
          'The process does not stop at the first call. CasaMia keeps the request, notes, visit, proposal, installation and follow-up connected.',
        points: ['Request tracked internally', 'Family updates kept together', 'Follow-up after the next step'],
      },
    ],
    contactEyebrow: 'Speak with CasaMia',
    contactTitle: 'Tell us what worries you about the home.',
    contactBody:
      'Share the room, routine, location, and urgency. A CasaMia coordinator will route your request to the right next step.',
    callTitle: 'Call CasaMia',
    emailTitle: 'Email support',
    messagePlaceholder:
      'Example: My father is struggling with the stairs at night, we are in Marbella, and we need to understand what to fix first.',
    formNote:
      'Your request is reviewed by the CasaMia team so we can confirm the best next step and local availability.',
    ctaButton: 'Request In-Home Assessment',
  },
  es: {
    eyebrow: 'Por qué nosotros',
    headline: 'Por qué las familias eligen CasaMia',
    intro:
      'Elegir un partner de seguridad para el hogar significa confiarle tu casa, tu comodidad y a tus seres queridos. CasaMia combina revisión experta, coordinación local, propuestas claras y seguimiento cuidadoso.',
    heroProof: [
      { value: 'Estancia por estancia', label: 'revisión de riesgos antes de recomendar' },
      { value: 'Alcance claro', label: 'antes de acordar cualquier trabajo' },
      { value: 'Un equipo', label: 'desde la preocupación inicial hasta el seguimiento' },
    ],
    promiseTitle: 'Una forma cuidadosa y responsable de adaptar el hogar.',
    promiseBody:
      'CasaMia está pensada para familias que necesitan cambios prácticos sin presión, dudas ni entregas confusas. Cada recomendación empieza por la persona, la vivienda y la rutina diaria.',
    promisePoints: [
      'Explicamos por qué se recomienda cada adaptación.',
      'Separamos prioridades urgentes de mejoras opcionales.',
      'Mantenemos informada a la familia desde la revisión hasta la finalización.',
    ],
    processEyebrow: 'Método CasaMia',
    processTitle: 'Cómo incorporamos confianza al trabajo',
    processSteps: [
      {
        title: 'Evaluar primero',
        body: 'Revisamos estancias, recorridos, movilidad, iluminación, accesos y puntos de transferencia antes de proponer productos.',
      },
      {
        title: 'Acordar el alcance',
        body: 'Ves el plan, prioridades, coste aproximado y tiempos antes de comprometerte con la instalación.',
      },
      {
        title: 'Coordinar la entrega',
        body: 'CasaMia mantiene juntas las notas de visita, briefing del instalador, actualizaciones familiares y entrega.',
      },
      {
        title: 'Apoyar después',
        body: 'La familia tiene un punto de contacto claro para dudas, seguimiento y siguientes pasos.',
      },
    ],
    sections: [
      {
        icon: 'inspectors',
        title: 'Revisión de seguridad cualificada',
        body:
          'El proceso empieza con una mirada práctica: dónde ocurren las caídas, dónde cuesta moverse y qué adaptaciones pueden mejorar la vida diaria.',
        points: ['Revisión estancia por estancia', 'Foco en caídas, luz, accesos y movilidad', 'Recomendaciones claras antes de empezar'],
      },
      {
        icon: 'partners',
        title: 'Coordinación local de confianza',
        body:
          'CasaMia coordina profesionales locales fiables cuando hace falta instalación, manteniendo claro todo el recorrido para la familia.',
        points: ['Disponibilidad local revisada', 'Trabajo respetuoso en casa', 'Planificación práctica de la instalación'],
      },
      {
        icon: 'insured',
        title: 'Estándares profesionales',
        body:
          'Las familias necesitan confianza. CasaMia estructura los proyectos con estándares claros y una entrega responsable.',
        points: ['Estándares profesionales', 'Responsabilidad clara', 'Confianza desde inspección hasta finalización'],
      },
      {
        icon: 'products',
        title: 'Productos de seguridad de calidad',
        body:
          'Los mejores productos de seguridad son los que se usan cada día. CasaMia prioriza equipamiento fiable y práctico para cada vivienda.',
        points: ['Barras, iluminación, accesos y alertas', 'Productos duraderos para rutinas diarias', 'Tecnología smart solo donde aporta'],
      },
      {
        icon: 'pricing',
        title: 'Propuestas transparentes',
        body:
          'Ninguna familia debería aceptar trabajos poco claros. CasaMia explica el alcance, coste probable y posibles vías de ayuda antes de instalar.',
        points: ['Alcance claro antes del compromiso', 'Estructura por paquetes', 'Orientación sobre ayudas cuando existan'],
      },
      {
        icon: 'acceptance',
        title: 'Seguimiento claro',
        body:
          'El proceso no termina en la primera llamada. CasaMia mantiene conectadas solicitud, notas, visita, propuesta, instalación y seguimiento.',
        points: ['Solicitud trazada internamente', 'Actualizaciones familiares juntas', 'Seguimiento después del siguiente paso'],
      },
    ],
    contactEyebrow: 'Habla con CasaMia',
    contactTitle: 'Cuéntanos qué te preocupa del hogar.',
    contactBody:
      'Comparte la estancia, rutina, ubicación y urgencia. Un coordinador de CasaMia dirigirá tu solicitud al siguiente paso correcto.',
    callTitle: 'Llamar a CasaMia',
    emailTitle: 'Email de soporte',
    messagePlaceholder:
      'Ejemplo: Mi padre tiene dificultades con las escaleras por la noche, estamos en Marbella y necesitamos saber qué arreglar primero.',
    formNote:
      'Tu solicitud la revisa el equipo CasaMia para confirmar el mejor siguiente paso y la disponibilidad local.',
    ctaButton: 'Solicitar evaluación a domicilio',
  },
}

function getWhyCasamiaCopy(language: string) {
  return language.startsWith('es') ? whyCasamiaCopy.es : whyCasamiaCopy.en
}

function WhyIcon({ type }: { type: WhyCasamiaCopy['sections'][number]['icon'] }) {
  if (type === 'partners') {
    return <Handshake size={28} aria-hidden="true" />
  }

  if (type === 'insured') {
    return <ShieldCheck size={28} aria-hidden="true" />
  }

  if (type === 'products') {
    return <BadgeCheck size={28} aria-hidden="true" />
  }

  if (type === 'pricing') {
    return <Tags size={28} aria-hidden="true" />
  }

  if (type === 'acceptance') {
    return <CheckCircle2 size={28} aria-hidden="true" />
  }

  return <ClipboardCheck size={28} aria-hidden="true" />
}

export function WhyCasamiaPage() {
  const { i18n, t } = useTranslation()
  const copy = getWhyCasamiaCopy(i18n.language)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const planOptions = t('pages.contact.planOptions', { returnObjects: true }) as string[]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const formData = new FormData(event.currentTarget)

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitted(false)

    try {
      await submitContactRequest({
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        phone: String(formData.get('phone') ?? '').trim(),
        plan: String(formData.get('plan') ?? '').trim(),
        message: String(formData.get('message') ?? '').trim(),
        source: 'why-us-page',
      })
      event.currentTarget.reset()
      setSubmitted(true)
    } catch (error) {
      console.error('CasaMia contact request failed', error)
      setSubmitError(t('pages.contact.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <SEO
        title={copy.headline}
        description={copy.intro}
        path="/why-us"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: copy.headline,
          description: copy.intro,
        }}
      />

      <section className="why-casamia-hero">
        <div className="why-hero-grid site-shell">
          <div>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1>{copy.headline}</h1>
            <p>{copy.intro}</p>
            <Link className="btn btn-green mt-8" to="/home-safety-assessment">
              {copy.ctaButton}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
          <aside className="why-hero-proof" aria-label="CasaMia trust proof">
            {copy.heroProof.map((proof) => (
              <div key={proof.value}>
                <strong>{proof.value}</strong>
                <span>{proof.label}</span>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <TrustBar />

      <section className="why-promise-section section-pad">
        <div className="why-promise-grid site-shell">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2>{copy.promiseTitle}</h2>
            <p>{copy.promiseBody}</p>
          </div>
          <ul>
            {copy.promisePoints.map((point) => (
              <li key={point}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="why-process-section">
        <div className="site-shell">
          <div className="why-section-heading">
            <p className="eyebrow">{copy.processEyebrow}</p>
            <h2>{copy.processTitle}</h2>
          </div>
          <div className="why-process-grid">
            {copy.processSteps.map((step, index) => {
              const StepIcon = [ClipboardCheck, FileText, Home, CalendarCheck][index] ?? ClipboardCheck

              return (
                <article className="why-process-card" key={step.title}>
                  <span>
                    <StepIcon size={23} aria-hidden="true" />
                  </span>
                  <small>{String(index + 1).padStart(2, '0')}</small>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="why-proof-section section-pad">
        <div className="site-shell">
          <div className="why-proof-grid">
            {copy.sections.map((section) => (
              <article className="why-proof-card" key={section.title}>
                <span className="why-proof-icon">
                  <WhyIcon type={section.icon} />
                </span>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  <ul>
                    {section.points.map((point) => (
                      <li key={point}>
                        <CheckCircle2 size={17} aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-form-section" id="contact-form">
        <div className="contact-form-layout site-shell">
          <div className="contact-form-copy">
            <p className="eyebrow">{copy.contactEyebrow}</p>
            <h2>{copy.contactTitle}</h2>
            <p>{copy.contactBody}</p>
            <div className="contact-direct-options">
              <a
                href="mailto:hello@casamia.es"
                onClick={() => trackEvent('email_clicked', { location: 'why_us_contact' })}
              >
                <Mail size={19} aria-hidden="true" />
                <span>
                  <strong>{copy.emailTitle}</strong>
                  hello@casamia.es
                </span>
              </a>
            </div>
          </div>

          <form className="contact-form-card" onSubmit={handleSubmit}>
            <div className="contact-form-grid">
              <ContactField label={t('pages.contact.fields.name')} name="name" required />
              <ContactField label={t('pages.contact.fields.email')} name="email" type="email" required />
              <ContactField label={t('pages.contact.fields.phone')} name="phone" type="tel" />
              <label className="contact-field">
                {t('pages.contact.fields.plan')}
                <select className="contact-input" name="plan">
                  {planOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="contact-field">
              {t('pages.contact.fields.message')}
              <textarea
                className="contact-input contact-textarea"
                name="message"
                placeholder={copy.messagePlaceholder}
                required
              />
            </label>
            <button className="btn btn-green contact-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? t('pages.contact.submitting') : t('pages.contact.submit')}
              {isSubmitting ? <LoaderCircle className="animate-spin" size={20} aria-hidden="true" /> : null}
            </button>
            {submitError ? (
              <p className="contact-form-message is-error">
                <AlertCircle size={20} aria-hidden="true" />
                {submitError}
              </p>
            ) : null}
            {submitted ? (
              <p className="contact-form-message is-success">
                <CheckCircle2 size={20} aria-hidden="true" />
                {t('pages.contact.success')}
              </p>
            ) : null}
            <p className="contact-form-note">{copy.formNote}</p>
          </form>
        </div>
      </section>
    </>
  )
}

function ContactField({
  label,
  name,
  required,
  type = 'text',
}: {
  label: string
  name: string
  required?: boolean
  type?: string
}) {
  return (
    <label className="contact-field">
      {label}
      <input className="contact-input" name={name} required={required} type={type} />
    </label>
  )
}
