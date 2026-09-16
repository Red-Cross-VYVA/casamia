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
    headline: 'A safer home plan with one accountable team',
    intro:
      'CasaMia shows what needs changing, what can wait, who should do the work and how the result will be checked.',
    coverage: {
      eyebrow: 'Spain-wide service',
      title: 'Local coverage across Spain, connected by CasaMia.',
      body:
        'CasaMia combines local representatives with one shared process, so the advice, proposal and follow-up stay consistent wherever the home is.',
      badge: 'All Spain',
      legend: 'Representative coverage areas',
      hint: 'Hover or tap a marker to see the local team.',
      repSingular: 'representative',
      repPlural: 'representatives',
      orderNow: 'Order now',
    },
    promiseTitle: 'Clear decisions before work starts.',
    promiseBody:
      'CasaMia turns a home concern into room priorities, agreed work, price assumptions, grant-application checks and coordinated delivery.',
    promisePoints: [
      'Practical focus: daily movement, support points, lighting, access and wet-floor risk.',
      'Transparent recommendations: what matters, why it matters and what it may cost.',
      'Managed delivery: fit confirmed first, work coordinated and results checked.',
    ],
    processEyebrow: 'Operating model',
    processTitle: 'Know what happens before, during and after the work',
    processSteps: [
      {
        title: 'Understand the home',
        body: 'We look at the room, daily routine, access, photos and measurements before recommending work.',
      },
      {
        title: 'Set priorities',
        body: 'You see what matters first, what is optional and what still needs measurement or confirmation.',
      },
      {
        title: 'Vet and coordinate',
        body: 'Local providers are matched to the room, job type, location and agreed work before anything is coordinated through CasaMia.',
      },
      {
        title: 'Check the result',
        body: 'The result is checked, explained and kept connected to one CasaMia point of contact.',
      },
    ],
    proofEyebrow: 'What we verify',
    proofTitle: 'Clear checks before you commit.',
    proofBody:
      'The biggest risk is not choosing the wrong product. It is starting work without knowing who is responsible, what is included, what still needs confirmation and how the result will be checked.',
    proofItems: [
      {
        title: 'Provider fit',
        body: 'The provider must match the room, work type, location, availability and senior-home standard.',
        outcome: 'Fewer handoffs',
      },
      {
        title: 'Scope and price clarity',
        body: 'The proposal separates included work, optional items, measurement-dependent work and grant steps.',
        outcome: 'No vague quote',
      },
      {
        title: 'Daily-use fit',
        body: 'Recommendations consider whether the person living there will actually use the change day to day.',
        outcome: 'Used day to day',
      },
      {
        title: 'Aftercare follow-up',
        body: 'You know what happens after installation: explanation, questions, photos, notes and follow-up.',
        outcome: 'One contact',
      },
    ],
    sections: [
      {
        icon: 'inspectors',
        title: 'Practical safety technology',
        body:
          'CasaMia uses digital tools to make the review clearer: room photos, priorities, notes, handover evidence and follow-up stay connected.',
        points: ['Built for ageing-in-place needs', 'Digital tools that support human decisions', 'Technology only where it reduces a named risk'],
      },
      {
        icon: 'partners',
        title: 'Vetted provider model',
        body:
          'CasaMia is not an open marketplace. Providers are selected for fit, availability, communication and the ability to work respectfully in senior homes.',
        points: ['Local providers checked before assignment', 'Clear briefing before the visit', 'Respectful work in occupied homes'],
      },
      {
        icon: 'insured',
        title: 'Quality control built in',
        body:
          'Every project needs more than a product list. CasaMia keeps the agreed work, installation notes, customer updates and safe-use explanation connected.',
        points: ['Agreed work before work starts', 'Installation and explanation tracked', 'Follow-up after the key step'],
      },
      {
        icon: 'products',
        title: 'Detail-led recommendations',
        body:
          'Small details matter in senior safety: height, reach, lighting, door swing, wet surfaces, transfer points and what the person at home will actually use.',
        points: ['Room and routine considered together', 'Safety improvements before decorative upgrades', 'Smart devices only when they solve a real problem'],
      },
      {
        icon: 'pricing',
        title: 'Scope, price and grant checks',
        body:
          'You should know what is included, what is optional and what still needs measurement or confirmation. CasaMia separates advice, installation and grant-application support.',
        points: ['Clear estimate before commitment', 'Optional items separated from essentials', 'Grant guidance without false promises'],
      },
      {
        icon: 'acceptance',
        title: 'Values that guide the work',
        body:
          'CasaMia keeps the person at home visible in every decision: what changes, who enters the home, what is explained and what happens after the work.',
        points: ['Respect for the person at home', 'No pressure or confusing explanations', 'Accountability from first contact to follow-up'],
      },
    ],
    contactEyebrow: 'Speak with CasaMia',
    contactTitle: 'Tell us what worries you about the home.',
    contactBody:
      'Share the room, routine, location and urgency. A CasaMia coordinator will confirm whether to start with photos, a visit, a proposal or a grant check.',
    callTitle: 'Call CasaMia',
    emailTitle: 'Email support',
    messagePlaceholder:
      'Example: My father is struggling with the stairs at night, we are in Marbella, and we need to understand what to fix first.',
    formNote:
      'CasaMia checks your request, likely review path and local availability before recommending what to do first.',
    ctaButton: 'Request In-Home Assessment',
  },
  es: {
    eyebrow: 'Por qué CasaMia',
    headline: 'Un plan de hogar más seguro con un equipo responsable',
    intro:
      'CasaMia muestra qué conviene cambiar, qué puede esperar, quién debe hacerlo y cómo se comprobará el resultado.',
    coverage: {
      eyebrow: 'Servicio en toda España',
      title: 'Cobertura local en toda España, conectada por CasaMia.',
      body:
        'CasaMia combina representantes locales con un proceso compartido para que el consejo, la propuesta y el seguimiento sean consistentes esté donde esté la vivienda.',
      badge: 'Toda España',
      legend: 'Zonas con cobertura representativa',
      hint: 'Pasa el cursor o toca un punto para ver el equipo local.',
      repSingular: 'representante',
      repPlural: 'representantes',
      orderNow: 'Pedir ahora',
    },
    promiseTitle: 'Decisiones claras antes de empezar.',
    promiseBody:
      'CasaMia convierte una preocupación sobre la vivienda en prioridades por estancia, alcance medido, supuestos de precio, revisión de documentación para ayudas y entrega coordinada.',
    promisePoints: [
      'Foco práctico: movimiento diario, puntos de apoyo, iluminación, accesos y suelos mojados.',
      'Recomendaciones transparentes: qué importa, por qué importa y cuánto puede costar.',
      'Entrega gestionada: encaje confirmado, trabajo coordinado y resultado comprobado.',
    ],
    processEyebrow: 'Modelo operativo',
    processTitle: 'Saber qué ocurre antes, durante y después del trabajo',
    processSteps: [
      {
        title: 'Entender la vivienda',
        body: 'Miramos la estancia, la rutina diaria, accesos, fotos y medidas antes de recomendar trabajos.',
      },
      {
        title: 'Recomendar con claridad',
        body: 'Ves qué importa primero, qué es opcional y qué todavía requiere medidas o confirmación.',
      },
      {
        title: 'Validar y coordinar',
        body: 'Asignamos profesionales locales adecuados, les damos instrucciones claras y coordinamos el proceso.',
      },
      {
        title: 'Comprobar el resultado',
        body: 'El resultado se comprueba, se explica y queda conectado a un punto de contacto CasaMia.',
      },
    ],
    proofEyebrow: 'Qué comprobamos',
    proofTitle: 'Comprobaciones claras antes de comprometerte.',
    proofBody:
      'El mayor riesgo no es elegir un producto concreto. Es empezar trabajos sin saber quién responde, qué está incluido, qué falta por confirmar y cómo se comprobará el resultado.',
    proofItems: [
      {
        title: 'Encaje del profesional',
        body: 'El proveedor debe encajar con la estancia, tipo de trabajo, ubicación, disponibilidad y estándar senior.',
        outcome: 'Menos traspasos',
      },
      {
        title: 'Alcance y precio claros',
        body: 'La propuesta separa trabajo incluido, opcionales, partidas que requieren medida y pasos de ayuda o subvención.',
        outcome: 'Sin presupuesto vago',
      },
      {
        title: 'Encaje con el uso diario',
        body: 'Las recomendaciones consideran si la persona realmente usará el cambio en su rutina diaria.',
        outcome: 'Útil en casa',
      },
      {
        title: 'Seguimiento acordado',
        body: 'Sabes qué ocurre después: explicación, dudas, fotos, notas y seguimiento.',
        outcome: 'Un contacto',
      },
    ],
    sections: [
      {
        icon: 'inspectors',
        title: 'Tecnología práctica para seguridad',
        body:
          'CasaMia usa herramientas digitales para que la revisión sea más clara: fotos, prioridades, notas, evidencia de entrega y seguimiento quedan conectados.',
        points: ['Diseñado para envejecer mejor en casa', 'Herramientas digitales que apoyan decisiones humanas', 'Tecnología solo cuando reduce un riesgo concreto'],
      },
      {
        icon: 'partners',
        title: 'Modelo de proveedores validados',
        body:
          'CasaMia no es un directorio abierto. Seleccionamos proveedores por encaje, disponibilidad, comunicación y capacidad de trabajar con respeto en hogares de personas mayores.',
        points: ['Profesionales revisados antes de asignar', 'Briefing claro antes de la visita', 'Trabajo respetuoso en viviendas habitadas'],
      },
      {
        icon: 'insured',
        title: 'Control de calidad integrado',
        body:
          'Cada proyecto necesita más que una lista de productos. CasaMia mantiene conectados alcance, notas de instalación, comunicación y explicación final.',
        points: ['Alcance definido antes de empezar', 'Instalación y explicación trazadas', 'Seguimiento después del paso clave'],
      },
      {
        icon: 'products',
        title: 'Recomendaciones con atención al detalle',
        body:
          'En seguridad senior los detalles importan: altura, alcance, iluminación, giro de puertas, superficies mojadas, transferencias y lo que la persona realmente usará.',
        points: ['Estancia y rutina se analizan juntas', 'Adaptaciones útiles antes que mejoras decorativas', 'Dispositivos smart solo si resuelven un problema real'],
      },
      {
        icon: 'pricing',
        title: 'Alcance, precio y ayudas claras',
        body:
          'Debes saber qué está incluido, qué es opcional y qué requiere medición o confirmación. CasaMia separa claramente asesoramiento, instalación y apoyo con ayudas.',
        points: ['Estimación clara antes del compromiso', 'Opcionales separados de lo esencial', 'Orientación sobre ayudas sin falsas promesas'],
      },
      {
        icon: 'acceptance',
        title: 'Valores que guían el trabajo',
        body:
          'CasaMia mantiene visible a la persona que vive en casa en cada decisión: qué cambia, quién entra en la vivienda, qué se explica y qué ocurre después.',
        points: ['Respeto e independencia primero', 'Sin presión ni traspasos confusos', 'Responsabilidad desde el primer contacto hasta el seguimiento'],
      },
    ],
    contactEyebrow: 'Habla con CasaMia',
    contactTitle: 'Cuéntanos qué te preocupa del hogar.',
    contactBody:
      'Comparte estancia, rutina, ubicación y urgencia. Un coordinador de CasaMia confirmará si conviene empezar con fotos, visita, propuesta o revisión de ayudas.',
    callTitle: 'Llamar a CasaMia',
    emailTitle: 'Email de soporte',
    messagePlaceholder:
      'Ejemplo: Mi padre tiene dificultades con las escaleras por la noche, estamos en Marbella y necesitamos saber qué arreglar primero.',
    formNote:
      'CasaMia comprueba tu solicitud, el primer paso recomendado y la disponibilidad local antes de decirte qué conviene hacer primero.',
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
                alt={isSpanish ? 'Asesora mostrando una propuesta de seguridad a personas mayores' : 'Advisor showing a home-safety plan to older adults'}
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
