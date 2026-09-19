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
import { type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SpainCoverageMap, type SpainCoverageCopy } from '../components/SpainCoverageMap'
import { TrustBar } from '../components/TrustBar'
import { TrustSection } from '../components/TrustSection'
import { submitContactRequest } from '../services/contactRequests'
import { trackEvent } from '../utils/analytics'

type WhyCasamiaCopy = {
  eyebrow: string
  headline: string
  intro: string
  coverage: SpainCoverageCopy & {
    eyebrow: string
    body: string
  }
  promiseTitle: string
  promiseBody: string
  promisePoints: string[]
  processEyebrow: string
  processTitle: string
  processSteps: Array<{
    title: string
    body: string
  }>
  proofEyebrow: string
  proofTitle: string
  proofBody: string
  proofItems: Array<{
    title: string
    body: string
    outcome: string
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
    eyebrow: 'Why CasaMia',
    headline: 'Know what to change, who will do it and how it will be checked',
    intro:
      'CasaMia helps you decide what to fix first, what can wait, who should do the work and how the finished change will be checked.',
    coverage: {
      eyebrow: 'Spain-wide service',
      title: 'Local help across Spain, with one clear CasaMia process.',
      body:
        'Wherever the home is, CasaMia keeps the review, explanation and follow-up consistent while checking what local help is actually available.',
      badge: 'All Spain',
      legend: 'Local coverage areas',
      hint: 'Hover or tap a marker to see the local team.',
      repSingular: 'local team',
      repPlural: 'local teams',
      orderNow: 'Order now',
    },
    promiseTitle: 'Clear decisions before any work starts.',
    promiseBody:
      'CasaMia turns a home concern into room priorities, practical recommendations, what needs measuring, what can wait and what the next decision is.',
    promisePoints: [
      'Daily-use focus: movement, support points, lighting, access and wet-floor risk.',
      'Plain explanations: what matters, why it matters and what still needs checking.',
      'Checked follow-through: fit confirmed first, work arranged carefully and the result reviewed.',
    ],
    processEyebrow: 'How CasaMia helps',
    processTitle: 'Know what happens before, during and after the next step',
    processSteps: [
      {
        title: 'Understand the daily routine',
        body: 'We look at the room, movement route, access, photos and measurements before recommending a change.',
      },
      {
        title: 'Separate urgent from optional',
        body: 'You see what deserves attention first, what is optional and what still needs measurement or confirmation.',
      },
      {
        title: 'Match the right help',
        body: 'Before work is arranged, fit and availability are checked against the room, location and recommended change.',
      },
      {
        title: 'Review the result',
        body: 'The result is checked with you, explained clearly and kept with one CasaMia point of contact.',
      },
    ],
    proofEyebrow: 'What we verify',
    proofTitle: 'Clear checks before you commit.',
    proofBody:
      'The risk is not only choosing the wrong product. It is starting without knowing what is included, what still needs confirmation, who is responsible and how the result will be checked.',
    proofItems: [
      {
        title: 'Right person for the work',
        body: 'The person doing the work must fit the room, change type, location, availability and standard needed for a lived-in home.',
        outcome: 'Clear responsibility',
      },
      {
        title: 'Plan and price clarity',
        body: 'The recommendation separates included work, optional items, measurement-dependent decisions and grant checks where relevant.',
        outcome: 'Clear scope',
      },
      {
        title: 'Daily-use fit',
        body: 'Recommendations consider whether the person living there will actually use the change day to day.',
        outcome: 'Used day to day',
      },
      {
        title: 'Aftercare follow-up',
        body: 'You know what happens after the key step: explanation, questions, photos, notes and any follow-up needed.',
        outcome: 'One contact',
      },
    ],
    sections: [
      {
        icon: 'inspectors',
        title: 'A clear record of the decision',
        body:
          'CasaMia keeps photos, priorities, decisions and follow-up notes together so the recommendation is easy to understand later.',
        points: ['Built around real home routines', 'Notes and photos kept together', 'Technology only where it reduces a named risk'],
      },
      {
        icon: 'partners',
        title: 'Local help checked for fit',
        body:
          'CasaMia checks local help for the room, type of work, availability, communication and respectful work in lived-in homes.',
        points: ['Local fit checked first', 'Clear briefing before the visit', 'Respectful work in the home'],
      },
      {
        icon: 'insured',
        title: 'Quality checks built in',
        body:
          'Every project needs more than a product list. CasaMia keeps the agreed scope, notes, updates and safe-use explanation in one place.',
        points: ['Agreed work before installation starts', 'Installation and explanation tracked', 'Follow-up after the key step'],
      },
      {
        icon: 'products',
        title: 'Recommendations based on use',
        body:
          'Small details matter: height, reach, lighting, door swing, wet surfaces, transfer points and what the person at home will actually use.',
        points: ['Room and routine considered together', 'Safety improvements before decorative upgrades', 'Smart devices only when they solve a real problem'],
      },
      {
        icon: 'pricing',
        title: 'Price and grant checks stay separate',
        body:
          'You should know what is included, what is optional and what still needs measurement or confirmation before deciding.',
        points: ['Clear estimate before commitment', 'Optional items separated from essentials', 'Grant guidance without false promises'],
      },
      {
        icon: 'acceptance',
        title: 'Respect guides the work',
        body:
          'CasaMia keeps the person at home visible in every decision: what changes, who enters the home, what is explained and what happens after.',
        points: ['Respect for the person at home', 'No pressure or confusing explanations', 'Accountability from first contact to follow-up'],
      },
    ],
    contactEyebrow: 'Speak with CasaMia',
    contactTitle: 'Tell us what worries you about the home.',
    contactBody:
      'Share the room, routine, location and urgency. CasaMia will suggest whether to start with photos, a visit, a priced plan or a grant check.',
    callTitle: 'Call CasaMia',
    emailTitle: 'Email support',
    messagePlaceholder:
      'Example: The stairs feel unsafe at night, the home is in Marbella, and we need to understand what to fix first.',
    formNote:
      'CasaMia checks the situation, likely review path and local availability before recommending what to do first.',
    ctaButton: 'Request home review',
  },
  es: {
    eyebrow: 'Por qué CasaMia',
    headline: 'Sabe qué cambiar, quién lo hará y cómo se comprobará',
    intro:
      'CasaMia te ayuda a decidir qué conviene arreglar primero, qué puede esperar, quién debe hacerlo y cómo se comprobará el resultado.',
    coverage: {
      eyebrow: 'Servicio en toda España',
      title: 'Ayuda local en toda España, con un proceso CasaMia claro.',
      body:
      'Esté donde esté la vivienda, CasaMia mantiene una revisión, explicación y seguimiento consistentes, comprobando qué ayuda local está realmente disponible.',
      badge: 'Toda España',
      legend: 'Zonas con cobertura representativa',
      hint: 'Pasa el cursor o toca un punto para ver el equipo local.',
      repSingular: 'representante',
      repPlural: 'representantes',
      orderNow: 'Pedir ahora',
    },
    promiseTitle: 'Decisiones claras antes de empezar cualquier trabajo.',
    promiseBody:
      'CasaMia convierte una preocupación sobre la vivienda en prioridades por estancia, recomendaciones prácticas, qué necesita medida, qué puede esperar y cuál es la siguiente decisión.',
    promisePoints: [
      'Foco en el uso diario: movimiento, puntos de apoyo, iluminación, accesos y suelos mojados.',
      'Explicaciones claras: qué importa, por qué importa y qué queda por comprobar.',
      'Seguimiento comprobado: encaje confirmado, trabajo organizado con cuidado y resultado revisado.',
    ],
    processEyebrow: 'Cómo ayuda CasaMia',
    processTitle: 'Saber qué ocurre antes, durante y después del siguiente paso',
    processSteps: [
      {
        title: 'Entender la rutina diaria',
        body: 'Miramos la estancia, la ruta de movimiento, accesos, fotos y medidas antes de recomendar un cambio.',
      },
      {
        title: 'Separar lo urgente de lo opcional',
        body: 'Ves qué merece atención primero, qué es opcional y qué todavía requiere medidas o confirmación.',
      },
      {
        title: 'Elegir la ayuda adecuada',
        body: 'Antes de organizar el trabajo, el encaje y la disponibilidad se comprueban con la estancia, ubicación y cambio recomendado.',
      },
      {
        title: 'Revisar el resultado',
        body: 'El resultado se comprueba contigo, se explica con claridad y queda conectado a un punto de contacto CasaMia.',
      },
    ],
    proofEyebrow: 'Qué comprobamos',
    proofTitle: 'Comprobaciones claras antes de comprometerte.',
    proofBody:
      'El riesgo no es solo elegir un producto equivocado. Es empezar trabajos sin saber qué está incluido, qué falta por confirmar, quién responde y cómo se comprobará el resultado.',
    proofItems: [
      {
        title: 'Persona adecuada para el trabajo',
        body: 'La persona que realiza el trabajo debe encajar con la estancia, tipo de cambio, ubicación, disponibilidad y estándar necesario para una vivienda en uso.',
        outcome: 'Responsabilidad clara',
      },
      {
        title: 'Plan y precio claros',
        body: 'La recomendación separa trabajo incluido, opciones, decisiones que requieren medida y revisión de ayudas cuando aplique.',
        outcome: 'Alcance claro',
      },
      {
        title: 'Encaje con el uso diario',
        body: 'Las recomendaciones consideran si la persona realmente usará el cambio en su rutina diaria.',
        outcome: 'Útil en casa',
      },
      {
        title: 'Seguimiento acordado',
        body: 'Sabes qué ocurre después del paso clave: explicación, dudas, fotos, notas y el seguimiento que haga falta.',
        outcome: 'Un contacto',
      },
    ],
    sections: [
      {
        icon: 'inspectors',
        title: 'Registro claro de la decisión',
        body:
          'CasaMia mantiene fotos, prioridades, decisiones y notas de seguimiento juntas para que la recomendación se entienda más adelante.',
        points: ['Pensado para rutinas reales en casa', 'Notas y fotos juntas', 'Tecnología solo cuando reduce un riesgo concreto'],
      },
      {
        icon: 'partners',
        title: 'Ayuda local revisada por encaje',
        body:
          'CasaMia comprueba la ayuda local por estancia, tipo de trabajo, disponibilidad, comunicación y capacidad de trabajar con respeto en una vivienda en uso.',
        points: ['Encaje local comprobado primero', 'Instrucciones claras antes de la visita', 'Trabajo respetuoso en casa'],
      },
      {
        icon: 'insured',
        title: 'Comprobaciones de calidad integradas',
        body:
          'Cada proyecto necesita más que una lista de productos. CasaMia mantiene juntos el alcance acordado, notas, comunicación y explicación final.',
        points: ['Trabajo definido antes de empezar', 'Instalación y explicación trazadas', 'Seguimiento después del paso clave'],
      },
      {
        icon: 'products',
        title: 'Recomendaciones basadas en el uso',
        body:
          'Los detalles importan: altura, alcance, iluminación, giro de puertas, superficies mojadas, transferencias y lo que la persona realmente usará.',
        points: ['Estancia y rutina se analizan juntas', 'Adaptaciones útiles antes que mejoras decorativas', 'Dispositivos smart solo si resuelven un problema real'],
      },
      {
        icon: 'pricing',
        title: 'Precio y ayudas, por separado',
        body:
          'Debes saber qué está incluido, qué es opcional y qué requiere medición o confirmación antes de decidir.',
        points: ['Estimación clara antes del compromiso', 'Opcionales separados de lo esencial', 'Orientación sobre ayudas sin falsas promesas'],
      },
      {
        icon: 'acceptance',
        title: 'El respeto guía el trabajo',
        body:
          'CasaMia mantiene visible a la persona que vive en casa en cada decisión: qué cambia, quién entra en la vivienda, qué se explica y qué ocurre después.',
        points: ['Respeto e independencia primero', 'Sin presión ni traspasos confusos', 'Responsabilidad desde el primer contacto hasta el seguimiento'],
      },
    ],
    contactEyebrow: 'Habla con CasaMia',
    contactTitle: 'Cuéntanos qué te preocupa del hogar.',
    contactBody:
      'Comparte estancia, rutina, ubicación y urgencia. CasaMia te dirá si conviene empezar con fotos, una visita, un plan con precio o una revisión de ayudas.',
    callTitle: 'Llamar a CasaMia',
    emailTitle: 'Email de soporte',
    messagePlaceholder:
      'Ejemplo: Las escaleras parecen inseguras por la noche, la vivienda está en Marbella y necesitamos saber qué arreglar primero.',
    formNote:
      'CasaMia comprueba tu solicitud, el primer paso recomendado y la disponibilidad local antes de decirte qué conviene hacer primero.',
    ctaButton: 'Solicitar revisión en casa',
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
  const [searchParams] = useSearchParams()
  const isSpanish = i18n.language.toLowerCase().startsWith('es')
  const copy = getWhyCasamiaCopy(i18n.language)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const planOptions = t('pages.contact.planOptions', { returnObjects: true }) as string[]
  const connectedHealthIntent = searchParams.get('service') === 'connected-health'
  const contactIntent = searchParams.get('intent')
  const intentMessage = connectedHealthIntent
    ? isSpanish
      ? contactIntent === 'platform'
        ? 'Quiero hablar sobre la plataforma completa de seguridad y salud conectada para mi organización.'
        : 'Quiero hablar sobre una integración de seguridad y salud conectada.'
      : contactIntent === 'platform'
        ? 'I would like to discuss the complete connected safety and health platform for my organisation.'
        : 'I would like to discuss a connected safety and health integration.'
    : ''
  const connectedPlan = planOptions[2] ?? planOptions[0]
  const [selectedPlan, setSelectedPlan] = useState(planOptions[0])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!connectedHealthIntent) return
    setSelectedPlan(connectedPlan)
    setMessage(intentMessage)
  }, [connectedHealthIntent, connectedPlan, intentMessage])

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
        locale: i18n.language,
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
          <aside className="why-hero-human" aria-label={isSpanish ? 'Acompañamiento CasaMia' : 'CasaMia guidance'}>
            <figure className="why-human-card">
              <img
                alt={isSpanish ? 'Asesora mostrando una revisión de seguridad del hogar' : 'Advisor showing a home-safety review'}
                className="why-human-image"
                loading="eager"
                src="/images/why-us/casamia-guidance-session.jpg"
              />
            </figure>
          </aside>
        </div>
      </section>

      <TrustBar />

      <TrustSection />

      <section className="section-pad bg-white">
        <div className="about-coverage-grid site-shell">
          <div className="about-section-copy">
            <p className="eyebrow">{copy.coverage.eyebrow}</p>
            <h2 className="display-title mt-5">{copy.coverage.title}</h2>
            <p>{copy.coverage.body}</p>
          </div>

          <SpainCoverageMap copy={copy.coverage} language={i18n.language} />
        </div>
      </section>

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

      <section className="why-verification-section section-pad" aria-labelledby="why-verification-title">
        <div className="site-shell why-verification-grid">
          <div className="why-verification-copy">
            <p className="eyebrow">{copy.proofEyebrow}</p>
            <h2 id="why-verification-title">{copy.proofTitle}</h2>
            <p>{copy.proofBody}</p>
            <Link className="btn btn-navy" to="/home-safety-assessment">
              {copy.ctaButton}
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>

          <div className="why-verification-list">
            {copy.proofItems.map((item, index) => (
              <article className="why-verification-card" key={item.title}>
                <span className="why-verification-number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
                <small>{item.outcome}</small>
              </article>
            ))}
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
                href="mailto:hola@casamia.com.es"
                onClick={() => trackEvent('email_clicked', { location: 'why_us_contact' })}
              >
                <Mail size={19} aria-hidden="true" />
                <span>
                  <strong>{copy.emailTitle}</strong>
                  hola@casamia.com.es
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
                <select className="contact-input" name="plan" value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value)}>
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
                onChange={(event) => setMessage(event.target.value)}
                placeholder={copy.messagePlaceholder}
                required
                value={message}
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
