import {
  ArrowRight,
  Bath,
  Bed,
  BellRing,
  CameraOff,
  Check,
  ChefHat,
  DoorOpen,
  Droplets,
  Footprints,
  HeartPulse,
  Lightbulb,
  Radar,
  ShieldCheck,
  Smartphone,
  Wrench,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SafeImage } from '../components/SafeImage'
import { PLAN_DETAILS } from '../constants/planDetails'
import { IMAGE_URLS } from '../constants/shopify'

type TechIconName =
  | 'bath'
  | 'bed'
  | 'bell'
  | 'camera'
  | 'chef'
  | 'door'
  | 'droplets'
  | 'footprints'
  | 'heart'
  | 'light'
  | 'radar'
  | 'shield'
  | 'smartphone'
  | 'wrench'

type LocalisedTechCopy = {
  eyebrow: string
  title: string
  accent: string
  intro: string
  primaryCta: string
  secondaryCta: string
  heroAlt: string
  heroStats: string[]
  pillarsEyebrow: string
  pillarsTitle: string
  roomsEyebrow: string
  roomsTitle: string
  setupEyebrow: string
  setupTitle: string
  privacyEyebrow: string
  privacyTitle: string
  devicesEyebrow: string
  devicesTitle: string
  packageEyebrow: string
  packageTitle: string
  packageIntro: string
  allInclusions: string
  viewPlan: string
  finalTitle: string
  finalBody: string
  finalCta: string
  pillars: Array<{
    icon: TechIconName
    title: string
    body: string
    bullets: string[]
  }>
  rooms: Array<{
    icon: TechIconName
    title: string
    body: string
  }>
  setup: Array<{
    title: string
    body: string
  }>
  privacy: Array<{
    icon: TechIconName
    title: string
    body: string
  }>
  platforms: Array<{
    kind: 'dashboard' | 'app'
    kicker: string
    title: string
    body: string
    highlights: string[]
  }>
}

const techCopy: Record<'en' | 'es', LocalisedTechCopy> = {
  en: {
    eyebrow: 'CasaMia Smart Safety',
    title: 'Connected safety that helps your home',
    accent: 'respond sooner.',
    intro:
      'Sensors, fall detection, emergency buttons, health reminders, smart lighting, and family alerts configured around the way each person lives at home.',
    primaryCta: 'See Smart Safety plan',
    secondaryCta: 'Start safety report',
    heroAlt: 'Older adult using smart home safety assistance at home',
    heroStats: ['Fall alerts', 'Family notified', 'Motion lighting'],
    pillarsEyebrow: 'What the technology covers',
    pillarsTitle: 'Practical connected support for the moments families worry about most.',
    roomsEyebrow: 'Room by room',
    roomsTitle: 'The right devices in the places where risk actually happens.',
    setupEyebrow: 'How CasaMia sets it up',
    setupTitle: 'A smart safety system should feel simple from day one.',
    privacyEyebrow: 'Trust and privacy',
    privacyTitle: 'Useful monitoring without turning the home into a complicated control room.',
    devicesEyebrow: 'Caregiver dashboard and VYVA app',
    devicesTitle: 'A clearer view for families, and a simpler assistant for the person at home.',
    packageEyebrow: 'Smart Safety package',
    packageTitle: 'The connected safety layer sits on top of practical home adaptations.',
    packageIntro:
      'The Smart Safety plan combines whole-home safety improvements with connected devices, setup, training, and support.',
    allInclusions: 'Smart Safety inclusions',
    viewPlan: 'View full Smart Safety plan',
    finalTitle: 'Not sure which devices are right for the home?',
    finalBody:
      'Start with the safety report. CasaMia reviews the rooms, connectivity, routines, and family preferences before recommending any technology.',
    finalCta: 'Start safety report',
    pillars: [
      {
        icon: 'bell',
        title: 'Fall detection and emergency response',
        body: 'Wearable buttons, wall buttons, and compatible fall-detection support make it easier to call for help quickly.',
        bullets: ['Wearable SOS options', 'Wall-mounted call points', 'Family alert workflows'],
      },
      {
        icon: 'radar',
        title: 'Sensors for everyday risks',
        body: 'Motion, water, smoke, door, and night-time sensors help the home notice risk before it becomes a crisis.',
        bullets: ['Movement awareness', 'Leak and smoke alerts', 'Door and access notifications'],
      },
      {
        icon: 'heart',
        title: 'Health assistance at home',
        body: 'CasaMia can support compatible reminders and monitoring devices when families want extra health reassurance.',
        bullets: ['Medication reminders', 'Vitals device setup', 'Caregiver visibility where agreed'],
      },
      {
        icon: 'light',
        title: 'Smart routines that stay simple',
        body: 'Lighting, voice control, smart plugs, and access routines reduce rushed movement and make daily tasks easier.',
        bullets: ['Motion lighting', 'Voice control', 'Simple daily automation'],
      },
    ],
    rooms: [
      {
        icon: 'bath',
        title: 'Bathroom',
        body: 'Leak alerts, motion lighting, emergency buttons, and safer water routines support one of the highest-risk rooms.',
      },
      {
        icon: 'bed',
        title: 'Bedroom',
        body: 'Bedside emergency access, night lighting, wearable support, and optional monitoring help with movement after dark.',
      },
      {
        icon: 'footprints',
        title: 'Stairs and hallways',
        body: 'Motion lighting, fall-risk awareness, and safer movement routines reduce uncertainty in transition spaces.',
      },
      {
        icon: 'chef',
        title: 'Kitchen',
        body: 'Leak, smoke, smart plug, appliance safety, and medication reminder support keep daily routines more manageable.',
      },
      {
        icon: 'door',
        title: 'Entrance',
        body: 'Smart doorbells, access control, lighting, and family notifications reduce rushed movement to the door.',
      },
    ],
    setup: [
      {
        title: 'Assess the home and connectivity',
        body: 'CasaMia checks risk areas, Wi-Fi, device placement, and the routines the technology needs to support.',
      },
      {
        title: 'Recommend only useful devices',
        body: 'The plan focuses on practical alerts and controls, not unnecessary smart-home complexity.',
      },
      {
        title: 'Install, configure, and test',
        body: 'Devices, alerts, routines, and family contacts are set up so the system works before handover.',
      },
      {
        title: 'Train the household',
        body: 'The older adult and family learn how to use the system, what alerts mean, and how support works.',
      },
    ],
    privacy: [
      {
        icon: 'camera',
        title: 'No cameras by default',
        body: 'CasaMia prioritises simple alerts and sensors unless the family specifically agrees to camera-based devices.',
      },
      {
        icon: 'smartphone',
        title: 'Family alerts by consent',
        body: 'Notifications are configured around the preferences of the person living at home and their support circle.',
      },
      {
        icon: 'wrench',
        title: 'Reliability checked first',
        body: 'Connectivity and placement are reviewed before recommending devices, so the setup is realistic.',
      },
    ],
    platforms: [
      {
        kind: 'dashboard',
        kicker: 'Caregiver view',
        title: 'Real-time wellness dashboard',
        body:
          'A secure dashboard can show alerts, wellbeing signals, routines, and unusual patterns so caregivers know when to respond without constant check-ins.',
        highlights: ['Live alerts', 'Wellbeing trends', 'Role-based family access'],
      },
      {
        kind: 'app',
        kicker: 'VYVA assistant',
        title: 'Voice-first help through the VYVA app',
        body:
          'Vyva gives residents a friendly way to ask for reminders, wellbeing checks, music, news, conversation, or help, with clear support for senior routines.',
        highlights: ['Voice reminders', 'Vitals check-ins', 'Multilingual companion'],
      },
    ],
  },
  es: {
    eyebrow: 'CasaMia Seguridad Smart',
    title: 'Seguridad conectada para responder antes',
    accent: 'en casa.',
    intro:
      'Sensores, detección de caídas, botones de emergencia, recordatorios de salud, iluminación inteligente y alertas familiares configuradas según la rutina de cada persona.',
    primaryCta: 'Ver Plan Seguridad Smart',
    secondaryCta: 'Empezar informe',
    heroAlt: 'Persona mayor usando asistencia inteligente de seguridad en casa',
    heroStats: ['Alertas de caída', 'Familia avisada', 'Luz con sensor'],
    pillarsEyebrow: 'Qué cubre la tecnología',
    pillarsTitle: 'Apoyo conectado y práctico para los momentos que más preocupan a las familias.',
    roomsEyebrow: 'Estancia por estancia',
    roomsTitle: 'Los dispositivos adecuados en los lugares donde realmente aparece el riesgo.',
    setupEyebrow: 'Cómo lo configura CasaMia',
    setupTitle: 'Un sistema smart de seguridad debe sentirse sencillo desde el primer día.',
    privacyEyebrow: 'Confianza y privacidad',
    privacyTitle: 'Monitorización útil sin convertir la vivienda en algo complicado.',
    devicesEyebrow: 'Panel de cuidadores y app VYVA',
    devicesTitle: 'Una vista clara para la familia y una asistente sencilla para la persona en casa.',
    packageEyebrow: 'Plan Seguridad Smart',
    packageTitle: 'La capa conectada se suma a las adaptaciones prácticas del hogar.',
    packageIntro:
      'El Plan Seguridad Smart combina mejoras de seguridad en toda la vivienda con dispositivos conectados, configuración, formación y soporte.',
    allInclusions: 'Inclusiones de Seguridad Smart',
    viewPlan: 'Ver Plan Seguridad Smart completo',
    finalTitle: '¿No sabes qué dispositivos encajan con la vivienda?',
    finalBody:
      'Empieza con el informe de seguridad. CasaMia revisa estancias, conectividad, rutinas y preferencias familiares antes de recomendar tecnología.',
    finalCta: 'Empezar informe',
    pillars: [
      {
        icon: 'bell',
        title: 'Detección de caídas y respuesta de emergencia',
        body: 'Botones portátiles, botones de pared y apoyo compatible de detección de caídas ayudan a pedir ayuda con rapidez.',
        bullets: ['Opciones SOS portátiles', 'Puntos de llamada en pared', 'Flujos de alerta familiar'],
      },
      {
        icon: 'radar',
        title: 'Sensores para riesgos diarios',
        body: 'Sensores de movimiento, agua, humo, puertas y noche ayudan a detectar riesgos antes de que se conviertan en urgencia.',
        bullets: ['Conciencia de movimiento', 'Alertas de fuga y humo', 'Avisos de puertas y accesos'],
      },
      {
        icon: 'heart',
        title: 'Asistencia de salud en casa',
        body: 'CasaMia puede apoyar recordatorios y dispositivos compatibles cuando la familia quiere una capa extra de tranquilidad.',
        bullets: ['Recordatorios de medicación', 'Configuración de constantes', 'Visibilidad familiar si se acuerda'],
      },
      {
        icon: 'light',
        title: 'Rutinas smart sencillas',
        body: 'Iluminación, control por voz, enchufes smart y rutinas de acceso reducen movimientos apresurados y facilitan tareas diarias.',
        bullets: ['Iluminación con movimiento', 'Control por voz', 'Automatización diaria sencilla'],
      },
    ],
    rooms: [
      {
        icon: 'bath',
        title: 'Baño',
        body: 'Alertas de fuga, luz con movimiento, botones de emergencia y rutinas de agua más seguras apoyan una de las estancias de mayor riesgo.',
      },
      {
        icon: 'bed',
        title: 'Dormitorio',
        body: 'Acceso de emergencia junto a la cama, luz nocturna, apoyo portátil y monitorización opcional ayudan al moverse de noche.',
      },
      {
        icon: 'footprints',
        title: 'Escaleras y pasillos',
        body: 'Iluminación con movimiento, conciencia de riesgo de caída y rutinas más seguras reducen la incertidumbre en zonas de paso.',
      },
      {
        icon: 'chef',
        title: 'Cocina',
        body: 'Apoyo con fugas, humo, enchufes smart, seguridad de electrodomésticos y recordatorios hace la rutina más manejable.',
      },
      {
        icon: 'door',
        title: 'Entrada',
        body: 'Timbres smart, control de acceso, iluminación y avisos familiares reducen movimientos apresurados hacia la puerta.',
      },
    ],
    setup: [
      {
        title: 'Evaluar vivienda y conectividad',
        body: 'CasaMia revisa zonas de riesgo, Wi-Fi, ubicación de dispositivos y rutinas que la tecnología debe apoyar.',
      },
      {
        title: 'Recomendar solo dispositivos útiles',
        body: 'El plan prioriza alertas y controles prácticos, no complejidad smart innecesaria.',
      },
      {
        title: 'Instalar, configurar y probar',
        body: 'Dispositivos, alertas, rutinas y contactos familiares se dejan configurados antes de la entrega.',
      },
      {
        title: 'Formar a la vivienda',
        body: 'La persona mayor y la familia aprenden a usar el sistema, entender alertas y pedir soporte.',
      },
    ],
    privacy: [
      {
        icon: 'camera',
        title: 'Sin cámaras por defecto',
        body: 'CasaMia prioriza alertas y sensores sencillos salvo que la familia acepte dispositivos con cámara.',
      },
      {
        icon: 'smartphone',
        title: 'Alertas familiares con consentimiento',
        body: 'Las notificaciones se configuran según las preferencias de la persona que vive en casa y su círculo de apoyo.',
      },
      {
        icon: 'wrench',
        title: 'Fiabilidad revisada primero',
        body: 'Conectividad y ubicación se revisan antes de recomendar dispositivos, para que la solución sea realista.',
      },
    ],
    platforms: [
      {
        kind: 'dashboard',
        kicker: 'Vista para cuidadores',
        title: 'Panel de bienestar en tiempo real',
        body:
          'Un panel seguro puede mostrar alertas, señales de bienestar, rutinas y patrones inusuales para que los cuidadores sepan cuándo responder sin llamadas constantes.',
        highlights: ['Alertas en vivo', 'Tendencias de bienestar', 'Acceso familiar por roles'],
      },
      {
        kind: 'app',
        kicker: 'Asistente VYVA',
        title: 'Ayuda por voz desde la app VYVA',
        body:
          'Vyva ofrece una forma amable de pedir recordatorios, checks de bienestar, música, noticias, conversación o ayuda, con soporte claro para rutinas senior.',
        highlights: ['Recordatorios por voz', 'Checks de constantes', 'Compañía multilingüe'],
      },
    ],
  },
}

function getTechCopy(language: string) {
  return language.startsWith('es') ? techCopy.es : techCopy.en
}

function TechIcon({ type, size = 26 }: { type: TechIconName; size?: number }) {
  const props = { size, 'aria-hidden': true }

  if (type === 'bath') return <Bath {...props} />
  if (type === 'bed') return <Bed {...props} />
  if (type === 'bell') return <BellRing {...props} />
  if (type === 'camera') return <CameraOff {...props} />
  if (type === 'chef') return <ChefHat {...props} />
  if (type === 'door') return <DoorOpen {...props} />
  if (type === 'droplets') return <Droplets {...props} />
  if (type === 'footprints') return <Footprints {...props} />
  if (type === 'heart') return <HeartPulse {...props} />
  if (type === 'light') return <Lightbulb {...props} />
  if (type === 'radar') return <Radar {...props} />
  if (type === 'smartphone') return <Smartphone {...props} />
  if (type === 'wrench') return <Wrench {...props} />

  return <ShieldCheck {...props} />
}

function CaregiverDashboardPreview() {
  return (
    <div className="tech-dashboard-preview" aria-hidden="true">
      <div className="tech-dashboard-topbar">
        <div>
          <span>VYVA Care</span>
          <strong>Caregiver dashboard</strong>
        </div>
        <span className="tech-dashboard-status">Live</span>
      </div>

      <div className="tech-dashboard-metrics">
        <span>
          <strong>98%</strong>
          Routine
        </span>
        <span>
          <strong>72</strong>
          Pulse
        </span>
        <span>
          <strong>0</strong>
          Alerts
        </span>
      </div>

      <div className="tech-dashboard-chart">
        <span style={{ height: '42%' }} />
        <span style={{ height: '74%' }} />
        <span style={{ height: '58%' }} />
        <span style={{ height: '86%' }} />
        <span style={{ height: '66%' }} />
        <span style={{ height: '92%' }} />
      </div>

      <div className="tech-dashboard-alerts">
        <p>
          <strong>Medication reminder completed</strong>
          09:12 today
        </p>
        <p>
          <strong>Bathroom motion normal</strong>
          No unusual pattern detected
        </p>
      </div>
    </div>
  )
}

function VyvaAppPreview() {
  return (
    <div className="tech-vyva-phone" aria-hidden="true">
      <div className="tech-vyva-phone-screen">
        <div className="tech-vyva-header">
          <span>VYVA</span>
          <strong>Today</strong>
        </div>
        <div className="tech-vyva-orb">
          <span />
        </div>
        <div className="tech-vyva-message is-vyva">
          Good morning. Your hydration check is due after breakfast.
        </div>
        <div className="tech-vyva-message is-user">
          Remind me about my walk.
        </div>
        <div className="tech-vyva-actions">
          <span>Vitals</span>
          <span>Reminder</span>
          <span>Help</span>
        </div>
      </div>
    </div>
  )
}

export function TechPage() {
  const { i18n } = useTranslation()
  const copy = getTechCopy(i18n.language)
  const smartPlan = PLAN_DETAILS.premium

  return (
    <>
      <section className="tech-hero">
        <div className="tech-hero-grid site-shell">
          <div className="tech-hero-copy">
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1>
              {copy.title}{' '}
              <span className="italic-accent text-green">{copy.accent}</span>
            </h1>
            <p>{copy.intro}</p>
            <div className="tech-hero-actions">
              <Link className="btn btn-green" to="/plans/smart-safety">
                {copy.primaryCta}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/#estimate-upload">
                {copy.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="tech-hero-visual">
            <SafeImage
              src={IMAGE_URLS.techHero}
              alt={copy.heroAlt}
              className="tech-hero-media overflow-hidden rounded-lg"
              imgClassName="h-full w-full object-cover"
            />
            <div className="tech-hero-signal" aria-hidden="true">
              {copy.heroStats.map((stat) => (
                <span key={stat}>
                  <Check size={15} />
                  {stat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell">
          <div className="max-w-4xl">
            <p className="eyebrow">{copy.pillarsEyebrow}</p>
            <h2 className="display-title mt-5">{copy.pillarsTitle}</h2>
          </div>

          <div className="tech-system-grid mt-12">
            {copy.pillars.map((pillar) => (
              <article className="tech-system-card" key={pillar.title}>
                <span className="tech-system-icon">
                  <TechIcon type={pillar.icon} />
                </span>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
                <ul>
                  {pillar.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Check size={16} aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-light-blue">
        <div className="site-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">{copy.roomsEyebrow}</p>
            <h2 className="display-title mt-5">{copy.roomsTitle}</h2>
          </div>

          <div className="tech-room-grid mt-12">
            {copy.rooms.map((room) => (
              <article className="tech-room-item" key={room.title}>
                <span className="tech-room-icon">
                  <TechIcon type={room.icon} size={24} />
                </span>
                <h3>{room.title}</h3>
                <p>{room.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell">
          <div className="tech-setup-intro">
            <div>
              <p className="eyebrow">{copy.setupEyebrow}</p>
              <h2 className="display-title mt-5">{copy.setupTitle}</h2>
            </div>
            <div className="tech-privacy-panel">
              <p className="eyebrow">{copy.privacyEyebrow}</p>
              <h3>{copy.privacyTitle}</h3>
              <div className="tech-privacy-list">
                {copy.privacy.map((item) => (
                  <article key={item.title}>
                    <span>
                      <TechIcon type={item.icon} size={20} />
                    </span>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="tech-setup-grid mt-12">
            {copy.setup.map((step, index) => (
              <article className="tech-setup-step" key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-pale-blue">
        <div className="site-shell">
          <div className="max-w-4xl">
            <p className="eyebrow">{copy.devicesEyebrow}</p>
            <h2 className="display-title mt-5">{copy.devicesTitle}</h2>
          </div>

          <div className="tech-platform-grid mt-12">
            {copy.platforms.map((platform) => (
              <article className="tech-platform-card" key={platform.title}>
                <div className="tech-platform-visual">
                  {platform.kind === 'dashboard' ? <CaregiverDashboardPreview /> : <VyvaAppPreview />}
                </div>
                <div className="tech-platform-copy">
                  <p>{platform.kicker}</p>
                  <h3>{platform.title}</h3>
                  <span>{platform.body}</span>
                  <ul>
                    {platform.highlights.map((highlight) => (
                      <li key={highlight}>
                        <Check size={16} aria-hidden="true" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white" id="package-inclusions">
        <div className="site-shell">
          <div className="max-w-4xl">
            <p className="eyebrow">{copy.packageEyebrow}</p>
            <h2 className="display-title mt-5">{copy.packageTitle}</h2>
            <p className="mt-5 text-xl leading-relaxed text-text-mid">
              {copy.packageIntro}
            </p>
          </div>

          <article className="tech-package-card mt-12">
            <header className="tech-package-header">
              <div>
                <p>{smartPlan.marketingName}</p>
                <h3>{smartPlan.shopifyTitle}</h3>
              </div>
              <div className="tech-package-price">
                <strong>{smartPlan.price}</strong>
                <span>one-time</span>
              </div>
            </header>

            <p className="mt-5 max-w-4xl text-text-mid">{smartPlan.summary}</p>
            <p className="mt-8 text-sm font-extrabold uppercase text-navy">
              {copy.allInclusions}
            </p>

            <div className="tech-inclusion-grid mt-5">
              {smartPlan.included.map((section) => (
                <section className="tech-inclusion-group" key={section.title}>
                  <h4>{section.title}</h4>
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>
                        <Check size={16} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <Link className="btn btn-navy mt-8" to="/plans/smart-safety">
              {copy.viewPlan}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      <section className="bg-pale-blue py-14">
        <div className="tech-final-cta site-shell">
          <div>
            <h2>{copy.finalTitle}</h2>
            <p>{copy.finalBody}</p>
          </div>
          <Link className="btn btn-green" to="/#estimate-upload">
            {copy.finalCta}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
