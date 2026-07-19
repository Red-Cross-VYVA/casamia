import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  CircleCheck,
  ClipboardCheck,
  FileText,
  Handshake,
  Home,
  LoaderCircle,
  Mail,
  PackageCheck,
  ShieldCheck,
  Tags,
  UsersRound,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SpainCoverageMap, type SpainCoverageCopy } from '../components/SpainCoverageMap'
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
    headline: 'One turnkey service for a safer home, without the coordination headache',
    intro:
      'CasaMia handles the full journey for families: understanding the home, recommending what matters, preparing the scope, coordinating trusted professionals, managing installation and following up afterwards. You get one accountable team instead of chasing products, installers, grants and advice separately.',
    heroProof: [
      { value: 'End-to-end', label: 'assessment, plan, products, installation and follow-up' },
      { value: 'Turnkey delivery', label: 'CasaMia coordinates the people, dates and details' },
      { value: 'One point of contact', label: 'clear scope, family updates and accountable handover' },
    ],
    coverage: {
      eyebrow: 'Spain-wide service',
      title: 'Local coverage across Spain, connected by CasaMia.',
      body:
        'CasaMia combines local representatives with one digital workflow, so assessments, recommendations and follow-up stay consistent wherever a family lives.',
      badge: 'All Spain',
      legend: 'Representative coverage areas',
      hint: 'Hover or tap a marker to see the local team.',
      repSingular: 'representative',
      repPlural: 'representatives',
      orderNow: 'Order now',
    },
    promiseTitle: 'A technology company with a service mindset.',
    promiseBody:
      'MOKA built CasaMia to make home adaptation less fragmented. Instead of sending families to guess between products, grants and installers, CasaMia brings assessment, recommendations, quotation, provider coordination and follow-up into one managed workflow.',
    promisePoints: [
      'Senior-market focus: practical safety, independence and family confidence.',
      'Transparent recommendations: what matters, why it matters and what it may cost.',
      'Managed delivery: vetted providers, clear handover and quality checks.',
    ],
    processEyebrow: 'Operating model',
    processTitle: 'A managed service, not a directory of installers',
    processSteps: [
      {
        title: 'Understand the home',
        body: 'We collect the room, resident, photos, access, measurements and daily-routine context before recommending work.',
      },
      {
        title: 'Recommend clearly',
        body: 'CasaMia turns the information into practical priorities, service options and a clear scope before commitment.',
      },
      {
        title: 'Vett and coordinate',
        body: 'Local providers are matched to the job, briefed on the standard and coordinated through the CasaMia process.',
      },
      {
        title: 'Check the result',
        body: 'The job is followed through with handover notes, family updates and a clear point of contact after delivery.',
      },
    ],
    sections: [
      {
        icon: 'inspectors',
        title: 'Senior-focused technology',
        body:
          'MOKA DigiTech focuses on technology and services for older adults: prevention, independence, simpler access to support and clearer information for families.',
        points: ['Built for ageing-in-place needs', 'Digital tools that support human decisions', 'Technology only where it makes life easier'],
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
          'Every project needs more than a product list. CasaMia keeps the scope, installation notes, family communication and handover details connected.',
        points: ['Defined scope before work starts', 'Installation and handover tracked', 'Follow-up after the key step'],
      },
      {
        icon: 'products',
        title: 'Detail-led recommendations',
        body:
          'Small details matter in senior safety: height, reach, lighting, door swing, wet surfaces, transfer points and what the resident will actually use.',
        points: ['Room and routine considered together', 'Useful adaptations before decorative upgrades', 'Smart devices only when they solve a real problem'],
      },
      {
        icon: 'pricing',
        title: 'Transparent commercial model',
        body:
          'Families should know what is included, what is optional and what still needs measurement or confirmation. CasaMia separates advice, installation and grant support clearly.',
        points: ['Clear estimate before commitment', 'Optional items separated from essentials', 'Grant guidance without false promises'],
      },
      {
        icon: 'acceptance',
        title: 'Values that guide the work',
        body:
          'The senior market depends on trust. CasaMia is built around respect for the resident, honest communication with the family and careful execution in the home.',
        points: ['Respect and independence first', 'No pressure or confusing handovers', 'Accountability from first contact to follow-up'],
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
    eyebrow: 'Por qué CasaMia',
    headline: 'Una solución llave en mano para adaptar la vivienda sin dolores de cabeza',
    intro:
      'CasaMia se encarga del proceso completo: entender la vivienda, recomendar lo importante, preparar el alcance, coordinar profesionales de confianza, gestionar la instalación y hacer seguimiento después. La familia tiene un solo equipo responsable, sin perseguir productos, instaladores, ayudas y consejos por separado.',
    heroProof: [
      { value: 'De principio a fin', label: 'evaluación, plan, productos, instalación y seguimiento' },
      { value: 'Llave en mano', label: 'CasaMia coordina personas, fechas y detalles' },
      { value: 'Un solo contacto', label: 'alcance claro, información a la familia y entrega responsable' },
    ],
    coverage: {
      eyebrow: 'Servicio en toda España',
      title: 'Cobertura local en toda España, conectada por CasaMia.',
      body:
        'CasaMia combina representantes locales con un único flujo digital para mantener evaluaciones, recomendaciones y seguimiento consistentes, viva donde viva la familia.',
      badge: 'Toda España',
      legend: 'Zonas con cobertura representativa',
      hint: 'Pasa el cursor o toca un punto para ver el equipo local.',
      repSingular: 'representante',
      repPlural: 'representantes',
      orderNow: 'Pedir ahora',
    },
    promiseTitle: 'Una empresa tecnológica con mentalidad de servicio.',
    promiseBody:
      'MOKA creó CasaMia para que adaptar una vivienda no sea un proceso fragmentado. En lugar de dejar a la familia elegir a ciegas entre productos, ayudas e instaladores, CasaMia reúne evaluación, recomendaciones, presupuesto, coordinación y seguimiento en un flujo gestionado.',
    promisePoints: [
      'Foco senior: seguridad práctica, independencia y tranquilidad familiar.',
      'Recomendaciones transparentes: qué importa, por qué importa y cuánto puede costar.',
      'Entrega gestionada: proveedores validados, traspaso claro y control de calidad.',
    ],
    processEyebrow: 'Modelo operativo',
    processTitle: 'Un servicio gestionado, no un directorio de instaladores',
    processSteps: [
      {
        title: 'Entender la vivienda',
        body: 'Recogemos contexto de estancias, persona, fotos, accesos, medidas y rutinas antes de recomendar trabajos.',
      },
      {
        title: 'Recomendar con claridad',
        body: 'CasaMia convierte la información en prioridades prácticas, servicios recomendados y alcance claro antes del compromiso.',
      },
      {
        title: 'Validar y coordinar',
        body: 'Asignamos profesionales locales adecuados, les damos instrucciones claras y coordinamos el proceso CasaMia.',
      },
      {
        title: 'Comprobar el resultado',
        body: 'El trabajo se cierra con notas de entrega, actualización a la familia y un punto de contacto para seguimiento.',
      },
    ],
    sections: [
      {
        icon: 'inspectors',
        title: 'Tecnología centrada en seniors',
        body:
          'MOKA DigiTech trabaja en tecnología y servicios para personas mayores: prevención, independencia, acceso más sencillo al apoyo e información clara para las familias.',
        points: ['Diseñado para envejecer mejor en casa', 'Herramientas digitales que apoyan decisiones humanas', 'Tecnología solo cuando facilita la vida'],
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
          'Cada proyecto necesita más que una lista de productos. CasaMia mantiene conectados alcance, notas de instalación, comunicación familiar y entrega.',
        points: ['Alcance definido antes de empezar', 'Instalación y entrega trazadas', 'Seguimiento después del paso clave'],
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
        title: 'Modelo comercial transparente',
        body:
          'La familia debe saber qué está incluido, qué es opcional y qué requiere medición o confirmación. CasaMia separa claramente asesoramiento, instalación y apoyo con ayudas.',
        points: ['Estimación clara antes del compromiso', 'Opcionales separados de lo esencial', 'Orientación sobre ayudas sin falsas promesas'],
      },
      {
        icon: 'acceptance',
        title: 'Valores que guían el trabajo',
        body:
          'El mercado senior exige confianza. CasaMia trabaja con respeto por la persona, comunicación honesta con la familia y ejecución cuidadosa dentro del hogar.',
        points: ['Respeto e independencia primero', 'Sin presión ni traspasos confusos', 'Responsabilidad desde el primer contacto hasta el seguimiento'],
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
  const isSpanish = i18n.language.toLowerCase().startsWith('es')
  const copy = getWhyCasamiaCopy(i18n.language)
  const heroJourney = [
    {
      icon: ClipboardCheck,
      title: isSpanish ? 'Revisión clara' : 'Clear review',
      detail: isSpanish ? 'Casa, persona y riesgos' : 'Home, resident and risks',
    },
    {
      icon: FileText,
      title: isSpanish ? 'Plan práctico' : 'Practical plan',
      detail: isSpanish ? 'Qué hacer primero' : 'What to do first',
    },
    {
      icon: PackageCheck,
      title: isSpanish ? 'Trabajo coordinado' : 'Coordinated work',
      detail: isSpanish ? 'Productos, fechas y proveedor' : 'Products, timing and provider',
    },
    {
      icon: CircleCheck,
      title: isSpanish ? 'Entrega revisada' : 'Checked handover',
      detail: isSpanish ? 'Resultado y seguimiento' : 'Result and follow-up',
    },
  ]
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
          <aside className="why-hero-proof" aria-label="CasaMia managed service flow">
            <div className="why-managed-card">
              <div className="why-managed-header">
                <span className="why-managed-logo">Casa<span>Mia</span></span>
                <span className="why-managed-badge">
                  <ShieldCheck size={17} aria-hidden="true" />
                  {isSpanish ? 'Servicio gestionado' : 'Managed service'}
                </span>
              </div>

              <div className="why-managed-summary">
                <p>{isSpanish ? 'Un equipo responsable' : 'One accountable team'}</p>
                <strong>{isSpanish ? 'De la duda inicial a una vivienda más segura.' : 'From first concern to a safer home.'}</strong>
              </div>

              <ol className="why-managed-steps">
                {heroJourney.map(({ icon: Icon, title, detail }, index) => (
                  <li key={title}>
                    <span className="why-managed-step-icon">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{title}</strong>
                      <small>{detail}</small>
                    </span>
                    <em>{String(index + 1).padStart(2, '0')}</em>
                  </li>
                ))}
              </ol>

              <div className="why-managed-footer">
                <UsersRound size={18} aria-hidden="true" />
                <span>{copy.heroProof[2]?.label}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <TrustBar />

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
