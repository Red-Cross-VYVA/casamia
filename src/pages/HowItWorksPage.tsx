import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  Home,
  Lightbulb,
  MapPin,
  MonitorCheck,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
  Wrench,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SafeImage } from '../components/SafeImage'
import { SEO } from '../components/SEO'
import { TrustBar } from '../components/TrustBar'
import { IMAGE_URLS } from '../constants/shopify'
import { serviceVisuals } from '../constants/serviceVisuals'

type HowIconName =
  | 'badge'
  | 'camera'
  | 'check'
  | 'clipboard'
  | 'file'
  | 'heart'
  | 'home'
  | 'light'
  | 'map'
  | 'monitor'
  | 'shield'
  | 'sparkles'
  | 'wrench'

type HowCopy = {
  seoTitle: string
  seoDescription: string
  heroEyebrow: string
  heroTitle: string
  heroBody: string
  primaryCta: string
  secondaryCta: string
  heroAlt: string
  heroStats: Array<{
    value: string
    label: string
  }>
  statusTitle: string
  statusRows: Array<{
    label: string
    value: string
  }>
  processEyebrow: string
  processTitle: string
  processBody: string
  steps: Array<{
    icon: HowIconName
    title: string
    body: string
    tag: string
    proof: string
  }>
  reviewEyebrow: string
  reviewTitle: string
  reviewBody: string
  reviewCta: string
  reviewAreas: Array<{
    icon: HowIconName
    title: string
    body: string
    visualKey: string
    alt: string
  }>
  deliverablesEyebrow: string
  deliverablesTitle: string
  deliverables: Array<{
    icon: HowIconName
    title: string
    body: string
  }>
  teamEyebrow: string
  teamTitle: string
  teamBody: string
  team: Array<{
    icon: HowIconName
    title: string
    body: string
  }>
  nextEyebrow: string
  nextTitle: string
  pathways: Array<{
    icon: HowIconName
    title: string
    body: string
    cta: string
    to: string
  }>
  finalEyebrow: string
  finalTitle: string
  finalBody: string
  finalCta: string
}

const howIcons: Record<HowIconName, LucideIcon> = {
  badge: BadgeCheck,
  camera: Camera,
  check: CheckCircle2,
  clipboard: ClipboardCheck,
  file: FileText,
  heart: HeartHandshake,
  home: Home,
  light: Lightbulb,
  map: MapPin,
  monitor: MonitorCheck,
  shield: ShieldCheck,
  sparkles: Sparkles,
  wrench: Wrench,
}

const howCopy: Record<'en' | 'es', HowCopy> = {
  en: {
    seoTitle: 'How CasaMia Works',
    seoDescription:
      'See how CasaMia turns photos, visits, expert review, installation, grants support, and smart safety into a clear home safety plan.',
    heroEyebrow: 'Clear path to a safer home',
    heroTitle: 'From home photos to safer daily routines.',
    heroBody:
      'CasaMia reviews the rooms that matter, prioritises the real risks, and coordinates practical adaptations or smart safety when they are useful.',
    primaryCta: 'Start Free Safety Report',
    secondaryCta: 'Book In-Home Visit',
    heroAlt: 'Older couple preparing food together at home',
    heroStats: [
      { value: '4', label: 'clear steps' },
      { value: '6', label: 'room checks' },
      { value: '1', label: 'tracked request' },
    ],
    statusTitle: 'Request tracking',
    statusRows: [
      { label: 'Photos or visit', value: 'Received' },
      { label: 'Review and report', value: 'In progress' },
      { label: 'Plan and next step', value: 'Ready' },
    ],
    processEyebrow: 'How it works',
    processTitle: 'Four clear steps from review to support.',
    processBody:
      'Start with photos or a visit. CasaMia reviews the home, reports the priorities, plans the work, and coordinates support.',
    steps: [
      {
        icon: 'camera',
        title: 'Share photos or book a visit',
        body: 'Use photos for a first report, or choose an in-home assessment when the situation needs measurements and transfer checks.',
        tag: 'Start',
        proof: 'Photos or visit request received',
      },
      {
        icon: 'shield',
        title: 'Review and report',
        body: 'We check falls, support points, access, lighting, routines, and emergency response, then show the priorities clearly.',
        tag: 'Report',
        proof: 'Risks and priorities checked',
      },
      {
        icon: 'clipboard',
        title: 'Plan the right work',
        body: 'CasaMia turns the priorities into a scoped package, grant-ready documentation, or smart safety setup.',
        tag: 'Plan',
        proof: 'Scope, budget, and next step',
      },
      {
        icon: 'wrench',
        title: 'Install and support',
        body: 'We coordinate installation, handover, VYVA support where chosen, and follow-up.',
        tag: 'Support',
        proof: 'Handover and follow-up tracked',
      },
    ],
    reviewEyebrow: 'Room-by-room',
    reviewTitle: 'We review the spaces that shape daily safety.',
    reviewBody:
      'Bathrooms, stairs, bedroom, kitchen, entrance, and connected safety all affect confidence at home.',
    reviewCta: 'View Services',
    reviewAreas: [
      {
        icon: 'shield',
        title: 'Bathroom',
        body: 'Transfers, water, toilet height, shower entry, and support points.',
        visualKey: 'bathroom-safety',
        alt: 'Accessible bathroom safety features',
      },
      {
        icon: 'home',
        title: 'Stairs',
        body: 'Handrails, step contrast, landings, and motion lighting.',
        visualKey: 'stair-safety',
        alt: 'Safer stairs and hallway',
      },
      {
        icon: 'heart',
        title: 'Bedroom',
        body: 'Bed transfers, night routes, bedside reach, and emergency access.',
        visualKey: 'bedroom-safety',
        alt: 'Bedroom routine safety',
      },
      {
        icon: 'light',
        title: 'Kitchen',
        body: 'Reach, storage, appliance safety, task lighting, and floor grip.',
        visualKey: 'kitchen-safety',
        alt: 'Older adults cooking safely at home',
      },
      {
        icon: 'map',
        title: 'Entrance',
        body: 'Thresholds, ramps, door support, exterior light, and visitor access.',
        visualKey: 'entrance-accessibility',
        alt: 'Safe entrance access with ramp and handrail',
      },
      {
        icon: 'monitor',
        title: 'Smart safety',
        body: 'Sensors, fall alerts, family notifications, VYVA, and privacy settings.',
        visualKey: 'smart-home-safety',
        alt: 'Smart safety support for seniors',
      },
    ],
    deliverablesEyebrow: 'What you get',
    deliverablesTitle: 'The output is clear and practical.',
    deliverables: [
      {
        icon: 'file',
        title: 'Safety report',
        body: 'Main risks and priorities.',
      },
      {
        icon: 'check',
        title: 'Room recommendations',
        body: 'Specific changes by space.',
      },
      {
        icon: 'clipboard',
        title: 'Scoped plan',
        body: 'Package, works, or smart setup.',
      },
      {
        icon: 'badge',
        title: 'Grant guidance',
        body: 'Documents and eligible works.',
      },
    ],
    teamEyebrow: 'Behind the scenes',
    teamTitle: 'Experts, installers, and tracking in one flow.',
    teamBody:
      'CasaMia keeps review notes, visit planning, proposals, installation status, and family updates together.',
    team: [
      {
        icon: 'shield',
        title: 'Safety review',
        body: 'Risk and routine checked.',
      },
      {
        icon: 'wrench',
        title: 'Installer coordination',
        body: 'Work planned and handed over.',
      },
      {
        icon: 'monitor',
        title: 'Smart support',
        body: 'VYVA, alerts, and setup.',
      },
    ],
    nextEyebrow: 'Choose your path',
    nextTitle: 'Start where you are.',
    pathways: [
      {
        icon: 'camera',
        title: 'Photo report',
        body: 'Quick first view from uploaded room photos.',
        cta: 'Upload Photos',
        to: '/#estimate-upload',
      },
      {
        icon: 'home',
        title: 'In-home assessment',
        body: 'Best when measurements or transfer checks matter.',
        cta: 'Book Assessment',
        to: '/home-safety-assessment',
      },
      {
        icon: 'sparkles',
        title: 'Safety packages',
        body: 'Compare Essential, Advanced, and Premium.',
        cta: 'Compare Plans',
        to: '/plans',
      },
      {
        icon: 'monitor',
        title: 'Smart Safety',
        body: 'Sensors, alerts, VYVA, and family reassurance.',
        cta: 'See Smart Safety',
        to: '/tech',
      },
    ],
    finalEyebrow: 'Next step',
    finalTitle: 'Start with photos or book the visit.',
    finalBody:
      'You do not need to choose the perfect product first. CasaMia starts with the home.',
    finalCta: 'Contact CasaMia',
  },
  es: {
    seoTitle: 'C\u00f3mo funciona CasaMia',
    seoDescription:
      'Descubre c\u00f3mo CasaMia convierte fotos, visitas, revisi\u00f3n experta, instalaci\u00f3n, ayudas y seguridad smart en un plan claro para la vivienda.',
    heroEyebrow: 'Camino claro hacia un hogar m\u00e1s seguro',
    heroTitle: 'De fotos del hogar a rutinas diarias m\u00e1s seguras.',
    heroBody:
      'CasaMia revisa las estancias importantes, prioriza los riesgos reales y coordina adaptaciones o seguridad smart cuando aporta valor.',
    primaryCta: 'Empezar informe gratis',
    secondaryCta: 'Reservar visita',
    heroAlt: 'Pareja mayor preparando comida juntos en casa',
    heroStats: [
      { value: '4', label: 'fases claras' },
      { value: '6', label: 'revisiones' },
      { value: '1', label: 'solicitud trazada' },
    ],
    statusTitle: 'Seguimiento',
    statusRows: [
      { label: 'Fotos o visita', value: 'Recibido' },
      { label: 'Revisi\u00f3n e informe', value: 'En curso' },
      { label: 'Plan y siguiente paso', value: 'Listo' },
    ],
    processEyebrow: 'C\u00f3mo funciona',
    processTitle: 'Cuatro pasos claros desde revisi\u00f3n hasta apoyo.',
    processBody:
      'Empieza con fotos o una visita. CasaMia revisa la vivienda, informa de las prioridades, planifica y coordina el apoyo.',
    steps: [
      {
        icon: 'camera',
        title: 'Sube fotos o reserva visita',
        body: 'Usa fotos para un primer informe o elige una evaluaci\u00f3n en casa si hacen falta medidas y revisi\u00f3n presencial.',
        tag: 'Inicio',
        proof: 'Fotos o visita recibidas',
      },
      {
        icon: 'shield',
        title: 'Revisi\u00f3n e informe',
        body: 'Miramos ca\u00eddas, apoyos, accesos, iluminaci\u00f3n, rutinas y emergencias, y mostramos las prioridades con claridad.',
        tag: 'Informe',
        proof: 'Riesgos y prioridades revisados',
      },
      {
        icon: 'clipboard',
        title: 'Plan adecuado',
        body: 'CasaMia convierte las prioridades en paquete, documentaci\u00f3n para ayudas o configuraci\u00f3n smart.',
        tag: 'Plan',
        proof: 'Alcance, presupuesto y paso siguiente',
      },
      {
        icon: 'wrench',
        title: 'Instalaci\u00f3n y apoyo',
        body: 'Coordinamos instalaci\u00f3n, entrega, soporte VYVA si se elige y seguimiento.',
        tag: 'Apoyo',
        proof: 'Entrega y seguimiento trazados',
      },
    ],
    reviewEyebrow: 'Estancia por estancia',
    reviewTitle: 'Revisamos los espacios que marcan la seguridad diaria.',
    reviewBody:
      'Ba\u00f1o, escaleras, dormitorio, cocina, entrada y seguridad conectada influyen en la confianza en casa.',
    reviewCta: 'Ver servicios',
    reviewAreas: [
      {
        icon: 'shield',
        title: 'Ba\u00f1o',
        body: 'Transferencias, agua, altura del WC, ducha y puntos de apoyo.',
        visualKey: 'bathroom-safety',
        alt: 'Ba\u00f1o accesible con elementos de seguridad',
      },
      {
        icon: 'home',
        title: 'Escaleras',
        body: 'Pasamanos, contraste, descansillos e iluminaci\u00f3n con sensor.',
        visualKey: 'stair-safety',
        alt: 'Escaleras y pasillo m\u00e1s seguros',
      },
      {
        icon: 'heart',
        title: 'Dormitorio',
        body: 'Cama, rutas nocturnas, alcance desde la mesilla y ayuda cercana.',
        visualKey: 'bedroom-safety',
        alt: 'Rutina segura en dormitorio',
      },
      {
        icon: 'light',
        title: 'Cocina',
        body: 'Alcance, almacenaje, electrodom\u00e9sticos, luz y agarre del suelo.',
        visualKey: 'kitchen-safety',
        alt: 'Personas mayores cocinando de forma segura',
      },
      {
        icon: 'map',
        title: 'Entrada',
        body: 'Umbrales, rampas, apoyo junto a puerta, luz exterior y visitas.',
        visualKey: 'entrance-accessibility',
        alt: 'Entrada segura con rampa y pasamanos',
      },
      {
        icon: 'monitor',
        title: 'Smart safety',
        body: 'Sensores, alertas de ca\u00edda, avisos familiares, VYVA y privacidad.',
        visualKey: 'smart-home-safety',
        alt: 'Seguridad smart para personas mayores',
      },
    ],
    deliverablesEyebrow: 'Qu\u00e9 recibes',
    deliverablesTitle: 'El resultado es claro y pr\u00e1ctico.',
    deliverables: [
      {
        icon: 'file',
        title: 'Informe',
        body: 'Riesgos y prioridades.',
      },
      {
        icon: 'check',
        title: 'Recomendaciones',
        body: 'Cambios por estancia.',
      },
      {
        icon: 'clipboard',
        title: 'Plan definido',
        body: 'Paquete, obra o smart.',
      },
      {
        icon: 'badge',
        title: 'Ayudas',
        body: 'Documentos y trabajos.',
      },
    ],
    teamEyebrow: 'Entre bastidores',
    teamTitle: 'Expertos, instaladores y seguimiento en un solo flujo.',
    teamBody:
      'CasaMia mantiene juntas notas, visita, propuesta, instalaci\u00f3n y actualizaciones familiares.',
    team: [
      {
        icon: 'shield',
        title: 'Revisi\u00f3n',
        body: 'Riesgo y rutina.',
      },
      {
        icon: 'wrench',
        title: 'Instalaci\u00f3n',
        body: 'Trabajo y entrega.',
      },
      {
        icon: 'monitor',
        title: 'Soporte smart',
        body: 'VYVA y alertas.',
      },
    ],
    nextEyebrow: 'Elige tu camino',
    nextTitle: 'Empieza donde est\u00e1s.',
    pathways: [
      {
        icon: 'camera',
        title: 'Informe con fotos',
        body: 'Primera revisi\u00f3n con fotos.',
        cta: 'Subir fotos',
        to: '/#estimate-upload',
      },
      {
        icon: 'home',
        title: 'Evaluaci\u00f3n en casa',
        body: 'Cuando hacen falta medidas.',
        cta: 'Reservar',
        to: '/home-safety-assessment',
      },
      {
        icon: 'sparkles',
        title: 'Paquetes',
        body: 'Essential, Advanced y Premium.',
        cta: 'Comparar',
        to: '/plans',
      },
      {
        icon: 'monitor',
        title: 'Smart Safety',
        body: 'Sensores, VYVA y alertas.',
        cta: 'Ver smart',
        to: '/tech',
      },
    ],
    finalEyebrow: 'Siguiente paso',
    finalTitle: 'Empieza con fotos o reserva la visita.',
    finalBody:
      'No necesitas elegir primero el producto perfecto. CasaMia empieza por la vivienda.',
    finalCta: 'Contactar con CasaMia',
  },
}

function getHowCopy(language: string) {
  return language.startsWith('es') ? howCopy.es : howCopy.en
}

function getVisual(key: string) {
  return serviceVisuals[key]?.image ?? IMAGE_URLS.finalCta
}

export function HowItWorksPage() {
  const { i18n } = useTranslation()
  const copy = getHowCopy(i18n.language)

  return (
    <>
      <SEO
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/how-it-works"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: copy.heroTitle,
          description: copy.heroBody,
          step: copy.steps.map((step) => ({
            '@type': 'HowToStep',
            name: step.title,
            text: step.body,
          })),
        }}
      />

      <section className="how-hero">
        <div className="how-hero-grid site-shell">
          <div className="how-hero-copy">
            <span className="eyebrow">
              <span className="dot" aria-hidden="true" />
              {copy.heroEyebrow}
            </span>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroBody}</p>
            <div className="how-hero-actions">
              <Link className="btn btn-green" to="/#estimate-upload">
                {copy.primaryCta}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/home-safety-assessment">
                {copy.secondaryCta}
              </Link>
            </div>
            <div className="how-hero-stats">
              {copy.heroStats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="how-hero-visual">
            <SafeImage
              src={IMAGE_URLS.finalCta}
              alt={copy.heroAlt}
              className="how-hero-image"
              imgClassName="h-full w-full object-cover"
              loading="eager"
            />
            <div className="how-status-panel" aria-label={copy.statusTitle}>
              <div className="how-status-header">
                <MonitorCheck size={21} aria-hidden="true" />
                <strong>{copy.statusTitle}</strong>
              </div>
              {copy.statusRows.map((row) => (
                <div className="how-status-row" key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="how-process-section">
        <div className="site-shell">
          <div className="how-section-heading">
            <p className="eyebrow">{copy.processEyebrow}</p>
            <h2>{copy.processTitle}</h2>
            <p>{copy.processBody}</p>
          </div>

          <div className="how-process-grid">
            {copy.steps.map((step, index) => {
              const Icon = howIcons[step.icon]

              return (
                <article className="how-step-card" key={step.title}>
                  <div className="how-flow-node" aria-hidden="true">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <Icon size={26} />
                  </div>
                  <div className="how-step-content">
                    <div className="how-step-topline">
                      <small>{step.tag}</small>
                      <strong>{step.proof}</strong>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="how-review-section">
        <div className="site-shell">
          <div className="how-review-heading">
            <div>
              <p className="eyebrow">{copy.reviewEyebrow}</p>
              <h2>{copy.reviewTitle}</h2>
              <p>{copy.reviewBody}</p>
            </div>
            <Link className="btn btn-navy" to="/services">
              {copy.reviewCta}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>

          <div className="how-review-grid">
            {copy.reviewAreas.map((area) => {
              const Icon = howIcons[area.icon]

              return (
                <article key={area.title}>
                  <SafeImage
                    src={getVisual(area.visualKey)}
                    alt={area.alt}
                    className="how-review-image"
                    imgClassName="h-full w-full object-cover"
                  />
                  <div className="how-review-content">
                    <span>
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <h3>{area.title}</h3>
                    <p>{area.body}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="how-deliverables-section">
        <div className="site-shell">
          <div className="how-section-heading is-centered">
            <p className="eyebrow">{copy.deliverablesEyebrow}</p>
            <h2>{copy.deliverablesTitle}</h2>
          </div>

          <div className="how-deliverables-grid">
            {copy.deliverables.map((item) => {
              const Icon = howIcons[item.icon]

              return (
                <article key={item.title}>
                  <Icon size={24} aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="how-team-section">
        <div className="how-team-layout site-shell">
          <div className="how-team-copy">
            <p className="eyebrow">{copy.teamEyebrow}</p>
            <h2>{copy.teamTitle}</h2>
            <p>{copy.teamBody}</p>
          </div>
          <div className="how-team-grid">
            {copy.team.map((member) => {
              const Icon = howIcons[member.icon]

              return (
                <article key={member.title}>
                  <span>
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <h3>{member.title}</h3>
                  <p>{member.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="how-next-section">
        <div className="site-shell">
          <div className="how-section-heading">
            <p className="eyebrow">{copy.nextEyebrow}</p>
            <h2>{copy.nextTitle}</h2>
          </div>

          <div className="how-pathway-grid">
            {copy.pathways.map((pathway) => {
              const Icon = howIcons[pathway.icon]

              return (
                <Link className="how-pathway-card" key={pathway.title} to={pathway.to}>
                  <span>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{pathway.title}</h3>
                  <p>{pathway.body}</p>
                  <strong>
                    {pathway.cta}
                    <ArrowRight size={17} aria-hidden="true" />
                  </strong>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="how-final-cta">
        <div className="site-shell">
          <div>
            <p className="eyebrow">{copy.finalEyebrow}</p>
            <h2>{copy.finalTitle}</h2>
            <p>{copy.finalBody}</p>
          </div>
          <Link className="btn btn-green" to="/contact">
            {copy.finalCta}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
