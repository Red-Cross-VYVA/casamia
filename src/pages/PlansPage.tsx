import {
  ArrowRight,
  ArrowUpDown,
  Bath,
  BedDouble,
  CheckCircle2,
  ClipboardCheck,
  CookingPot,
  DoorOpen,
  Footprints,
  HeartPulse,
  Home,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { TrustBar } from '../components/TrustBar'
import { TrustSection } from '../components/TrustSection'

type Outcome = {
  icon: LucideIcon
  title: string
  body: string
  points: string[]
}

type RoomCard = {
  icon: LucideIcon
  room: string
  focus: string
  chips: string[]
}

type AddOn = {
  icon: LucideIcon
  title: string
  body: string
  to: string
}

type PlansCopy = {
  metaTitle: string
  eyebrow: string
  title: string
  body: string
  servicesCta: string
  howCta: string
  visualLabel: string
  visualTitle: string
  visualBody: string
  outcomesTitle: string
  outcomesBody: string
  howTitle: string
  howBody: string
  roomsTitle: string
  roomsBody: string
  addOnsEyebrow: string
  addOnsTitle: string
  addOnsBody: string
  reassurance: string
  finalTitle: string
  finalBody: string
  flow: Array<{ title: string; body: string }>
  outcomes: Outcome[]
  rooms: RoomCard[]
  addOns: AddOn[]
}

const plansCopy: Record<'en' | 'es', PlansCopy> = {
  en: {
    metaTitle: 'CasaMia Safety Services | CasaMia',
    eyebrow: 'Your CasaMia plan',
    title: 'Home safety, handled.',
    body:
      'Choose the rooms and routines that worry you most. CasaMia recommends practical improvements, confirms what fits, and coordinates the work.',
    servicesCta: 'View services',
    howCta: 'See how it works',
    visualLabel: 'CasaMia safety service process',
    visualTitle: 'Pick the concern. We shape the plan.',
    visualBody: 'Start online, then decide whether to upload photos or reserve a home visit.',
    outcomesTitle: 'What you get',
    outcomesBody:
      'A clear route from concern to action: room-by-room priorities, selected improvements, and a managed next step.',
    howTitle: 'How it works',
    howBody: 'One point of responsibility and no need to choose products before the home is understood.',
    roomsTitle: 'Room-by-room coverage',
    roomsBody:
      'CasaMia reviews the whole home, then recommends only the improvements that fit the resident and the property.',
    addOnsEyebrow: 'Optional after assessment',
    addOnsTitle: 'Add improvements only where they help',
    addOnsBody:
      'Every service should solve a real need. CasaMia recommends the right mix after reviewing the home, routine and resident.',
    reassurance: 'Build your CasaMia plan from useful services, then confirm pricing, installation and handover.',
    finalTitle: 'Ready to make the home safer?',
    finalBody: 'Start with the rooms that matter most. CasaMia turns your answers into a clear plan of action.',
    flow: [
      { title: 'Assess', body: 'Home, resident and daily routines.' },
      { title: 'Plan', body: 'Clear risks, priorities and quote.' },
      { title: 'Install', body: 'Coordinated products, providers and follow-up.' },
    ],
    outcomes: [
      {
        icon: ShieldCheck,
        title: 'A safer home plan',
        body: 'A practical review of the spaces where falls, trips and daily friction are most likely.',
        points: ['Room-by-room check', 'Home Safety Score', 'Clear priorities'],
      },
      {
        icon: ClipboardCheck,
        title: 'A decision-ready report',
        body: 'A simple recommendation showing what to fix first, what can wait and what each step is for.',
        points: ['Written scope', 'Fixed quote', 'No blind buying'],
      },
      {
        icon: Wrench,
        title: 'Managed installation',
        body: 'CasaMia keeps the family, products, provider and handover together under one coordinated process.',
        points: ['Vetted providers', 'Quality check', 'Follow-up'],
      },
    ],
    rooms: [
      {
        icon: DoorOpen,
        room: 'Entrance',
        focus: 'Getting in and out safely, especially with steps, thresholds or poor evening light.',
        chips: ['Thresholds', 'Lighting', 'Handrail'],
      },
      {
        icon: Home,
        room: 'Living room',
        focus: 'Reducing trip risks around rugs, furniture, cables and common movement routes.',
        chips: ['Clear routes', 'Furniture', 'Trip risks'],
      },
      {
        icon: Footprints,
        room: 'Hallways',
        focus: 'Making night movement easier between bedroom, bathroom and living areas.',
        chips: ['Night route', 'Obstacles', 'Door swing'],
      },
      {
        icon: ArrowUpDown,
        room: 'Stairs',
        focus: 'Improving grip, contrast, lighting and support on the highest-risk route.',
        chips: ['Handrails', 'Anti-slip', 'Contrast'],
      },
      {
        icon: Bath,
        room: 'Bathroom',
        focus: 'Supporting shower entry, toilet transfer, wet floors and safe reach.',
        chips: ['Grab bars', 'Shower access', 'Toilet height'],
      },
      {
        icon: CookingPot,
        room: 'Kitchen',
        focus: 'Making everyday cooking and washing safer through better reach, light and surface control.',
        chips: ['Reach', 'Heat risk', 'Floor grip'],
      },
      {
        icon: BedDouble,
        room: 'Bedroom',
        focus: 'Supporting bed transfers, bedside reach and the route to the bathroom at night.',
        chips: ['Bed transfer', 'Bedside reach', 'Motion light'],
      },
      {
        icon: Lightbulb,
        room: 'Outdoor spaces',
        focus: 'Checking paths, steps, exterior light and the first movement from the doorway.',
        chips: ['Pathway', 'Step support', 'Exterior light'],
      },
    ],
    addOns: [
      {
        icon: Smartphone,
        title: 'Smart home',
        body: 'Voice controls, smart lighting, locks, plugs and routines where they make life easier.',
        to: '/services',
      },
      {
        icon: ShieldCheck,
        title: 'Safety technology',
        body: 'Sensors, alerts, emergency buttons, leak detection and connected safety devices.',
        to: '/services',
      },
      {
        icon: HeartPulse,
        title: 'Health monitoring',
        body: 'Simple vitals and wellbeing monitoring with family visibility when appropriate.',
        to: '/services',
      },
      {
        icon: Sparkles,
        title: 'AI and voice support',
        body: 'Optional prompts, reminders and routines for people who benefit from guided support.',
        to: '/services',
      },
      {
        icon: Home,
        title: 'Living support',
        body: 'Extra services for families planning bigger care, comfort or assisted living decisions.',
        to: '/assisted-living-solutions',
      },
    ],
  },
  es: {
    metaTitle: 'Servicios de seguridad CasaMia | CasaMia',
    eyebrow: 'Tu plan CasaMia',
    title: 'Seguridad en casa, sin complicaciones.',
    body:
      'Elige las estancias y rutinas que más te preocupan. CasaMia recomienda mejoras prácticas, confirma qué encaja y coordina el trabajo.',
    servicesCta: 'Ver servicios',
    howCta: 'Ver cómo funciona',
    visualLabel: 'Proceso de servicio de seguridad CasaMia',
    visualTitle: 'Elige la preocupación. Nosotros damos forma al plan.',
    visualBody: 'Empieza online y luego decide si quieres subir fotos o reservar una visita a domicilio.',
    outcomesTitle: 'Qué recibes',
    outcomesBody:
      'Un camino claro desde la preocupación hasta la acción: prioridades por estancia, mejoras seleccionadas y un siguiente paso gestionado.',
    howTitle: 'Cómo funciona',
    howBody: 'Un único responsable y sin tener que elegir productos antes de entender la vivienda.',
    roomsTitle: 'Cobertura estancia por estancia',
    roomsBody:
      'CasaMia revisa la vivienda completa y recomienda solo las mejoras que encajan con la persona y la propiedad.',
    addOnsEyebrow: 'Opcional después de la evaluación',
    addOnsTitle: 'Añade mejoras solo donde ayudan',
    addOnsBody:
      'Cada servicio debe resolver una necesidad real. CasaMia recomienda la combinación adecuada tras revisar la vivienda, la rutina y la persona residente.',
    reassurance: 'Crea tu plan CasaMia con servicios útiles y después confirma precio, instalación y entrega.',
    finalTitle: '¿Listo para hacer la vivienda más segura?',
    finalBody: 'Empieza por las estancias que más importan. CasaMia convierte tus respuestas en un plan de acción claro.',
    flow: [
      { title: 'Evaluamos', body: 'Vivienda, persona residente y rutinas diarias.' },
      { title: 'Planificamos', body: 'Riesgos claros, prioridades y presupuesto.' },
      { title: 'Instalamos', body: 'Productos, profesionales y seguimiento coordinados.' },
    ],
    outcomes: [
      {
        icon: ShieldCheck,
        title: 'Un plan para una vivienda más segura',
        body: 'Una revisión práctica de los espacios donde es más probable que aparezcan caídas, tropiezos y fricción diaria.',
        points: ['Revisión por estancia', 'Puntuación de seguridad', 'Prioridades claras'],
      },
      {
        icon: ClipboardCheck,
        title: 'Un informe listo para decidir',
        body: 'Una recomendación sencilla que muestra qué arreglar primero, qué puede esperar y para qué sirve cada paso.',
        points: ['Alcance escrito', 'Presupuesto claro', 'Sin compras a ciegas'],
      },
      {
        icon: Wrench,
        title: 'Instalación gestionada',
        body: 'CasaMia mantiene a la familia, productos, proveedor y entrega bajo un único proceso coordinado.',
        points: ['Profesionales validados', 'Control de calidad', 'Seguimiento'],
      },
    ],
    rooms: [
      {
        icon: DoorOpen,
        room: 'Entrada',
        focus: 'Entrar y salir con seguridad, especialmente si hay escalones, umbrales o poca luz por la tarde.',
        chips: ['Umbrales', 'Iluminación', 'Pasamanos'],
      },
      {
        icon: Home,
        room: 'Salón',
        focus: 'Reducir tropiezos alrededor de alfombras, muebles, cables y rutas de movimiento habituales.',
        chips: ['Rutas despejadas', 'Muebles', 'Tropiezos'],
      },
      {
        icon: Footprints,
        room: 'Pasillos',
        focus: 'Facilitar el movimiento nocturno entre dormitorio, baño y zonas principales.',
        chips: ['Ruta nocturna', 'Obstáculos', 'Puertas'],
      },
      {
        icon: ArrowUpDown,
        room: 'Escaleras',
        focus: 'Mejorar agarre, contraste, luz y apoyo en una de las rutas de mayor riesgo.',
        chips: ['Pasamanos', 'Antideslizante', 'Contraste'],
      },
      {
        icon: Bath,
        room: 'Baño',
        focus: 'Apoyar la entrada a la ducha, la transferencia al inodoro, suelos mojados y alcance seguro.',
        chips: ['Barras de apoyo', 'Acceso ducha', 'Altura inodoro'],
      },
      {
        icon: CookingPot,
        room: 'Cocina',
        focus: 'Hacer que cocinar y lavar sea más seguro con mejor alcance, luz y control de superficies.',
        chips: ['Alcance', 'Calor', 'Agarre suelo'],
      },
      {
        icon: BedDouble,
        room: 'Dormitorio',
        focus: 'Apoyar transferencias de cama, alcance junto a la cama y ruta nocturna al baño.',
        chips: ['Transferencia', 'Alcance', 'Luz con sensor'],
      },
      {
        icon: Lightbulb,
        room: 'Exterior',
        focus: 'Revisar caminos, escalones, luz exterior y el primer movimiento desde la puerta.',
        chips: ['Camino', 'Apoyo en escalón', 'Luz exterior'],
      },
    ],
    addOns: [
      {
        icon: Smartphone,
        title: 'Hogar inteligente',
        body: 'Control por voz, iluminación inteligente, cerraduras, enchufes y rutinas cuando facilitan la vida.',
        to: '/services',
      },
      {
        icon: ShieldCheck,
        title: 'Tecnología de seguridad',
        body: 'Sensores, alertas, botones de emergencia, detección de fugas y dispositivos conectados.',
        to: '/services',
      },
      {
        icon: HeartPulse,
        title: 'Salud conectada',
        body: 'Mediciones sencillas y seguimiento de bienestar con visibilidad familiar cuando corresponde.',
        to: '/services',
      },
      {
        icon: Sparkles,
        title: 'IA y apoyo por voz',
        body: 'Recordatorios, indicaciones y rutinas opcionales para personas que se benefician de guía.',
        to: '/services',
      },
      {
        icon: Home,
        title: 'Apoyo residencial',
        body: 'Servicios adicionales para familias y organizaciones que planifican decisiones de cuidado o estancia asistida.',
        to: '/assisted-living-solutions',
      },
    ],
  },
}

export function PlansPage() {
  const { i18n, t } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = plansCopy[language]

  useEffect(() => {
    document.title = copy.metaTitle
  }, [copy.metaTitle])

  return (
    <>
      <section className="plans-conversion-hero core-plan-hero">
        <div className="plans-conversion-hero-inner site-shell">
          <div>
            <p className="section-kicker">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
            <div className="plans-hero-actions">
              <Link className="btn btn-green" to="/home-safety-wizard">
                {t('wizard.cta')}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/services">
                {copy.servicesCta}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <a className="btn btn-white" href="#plan-includes">
                {copy.howCta}
              </a>
            </div>
          </div>

          <aside className="core-plan-visual" aria-label={copy.visualLabel}>
            <div className="core-plan-visual-heading">
              <span>
                <ShieldCheck size={24} aria-hidden="true" />
              </span>
              <div>
                <strong>{copy.visualTitle}</strong>
                <p>{copy.visualBody}</p>
              </div>
            </div>
            <div className="core-plan-flow">
              {copy.flow.map((step, index) => (
                <div className="core-plan-flow-card" key={step.title}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <TrustBar />

      <section className="plans-choice-section section-pad" id="plan-includes">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">{copy.outcomesTitle}</h2>
            <p>{copy.outcomesBody}</p>
          </div>

          <div className="core-plan-outcome-grid">
            {copy.outcomes.map((outcome) => {
              const Icon = outcome.icon

              return (
                <article className="core-plan-outcome-card" key={outcome.title}>
                  <span>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{outcome.title}</h3>
                  <p>{outcome.body}</p>
                  <ul>
                    {outcome.points.map((point) => (
                      <li key={point}>
                        <CheckCircle2 size={17} aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="plans-next-section section-pad">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">{copy.howTitle}</h2>
            <p>{copy.howBody}</p>
          </div>
          <div className="core-plan-step-strip" aria-label={copy.visualLabel}>
            {copy.flow.map((step, index) => (
              <article key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="plans-matrix-section section-pad">
        <div className="site-shell">
          <div className="plans-section-heading">
            <h2 className="display-title">{copy.roomsTitle}</h2>
            <p>{copy.roomsBody}</p>
          </div>

          <div className="core-plan-room-grid">
            {copy.rooms.map((room) => {
              const Icon = room.icon

              return (
                <article className="core-plan-room-card" key={room.room}>
                  <header>
                    <span className="core-plan-room-icon">
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <h3>{room.room}</h3>
                  </header>
                  <p>{room.focus}</p>
                  <div className="core-plan-chip-list">
                    {room.chips.map((chip) => (
                      <span key={chip}>{chip}</span>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="plans-payment-section section-pad">
        <div className="site-shell">
          <div className="plans-payment-panel core-plan-addon-panel">
            <div>
              <p className="section-kicker">{copy.addOnsEyebrow}</p>
              <h2 className="display-title">{copy.addOnsTitle}</h2>
              <p>{copy.addOnsBody}</p>
            </div>

            <div className="core-plan-addon-grid">
              {copy.addOns.map((addOn) => {
                const Icon = addOn.icon

                return (
                  <Link className="core-plan-addon-card" to={addOn.to} key={addOn.title}>
                    <span>
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{addOn.title}</h3>
                      <p>{addOn.body}</p>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="plans-payment-reassurance">
              <CheckCircle2 size={22} aria-hidden="true" />
              <p>{copy.reassurance}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="plans-final-cta">
        <div className="site-shell">
          <div className="plans-final-panel">
            <div>
              <h2>{copy.finalTitle}</h2>
              <p>{copy.finalBody}</p>
            </div>
            <Link className="btn btn-green" to="/home-safety-wizard">
              {t('wizard.cta')}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link className="btn btn-white" to="/services">
              {copy.servicesCta}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <TrustSection />
    </>
  )
}
