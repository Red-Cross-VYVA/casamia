import {
  ArrowLeft,
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
import { useEffect, useState } from 'react'
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
  statusTitle: string
  statusIntro: string
  statusRows: Array<{
    label: string
    value: string
  }>
  statusNote: string
  processEyebrow: string
  processTitle: string
  processBody: string
  steps: Array<{
    icon: HowIconName
    title: string
    body: string
    tag: string
    proof: string
    options?: Array<{
      title: string
      body: string
      note?: string
      cta: string
      to: string
    }>
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
    heroAlt: 'CasaMia home safety worker ready for a home assessment',
    statusTitle: 'Your next step is clear',
    statusIntro: 'CasaMia keeps the family guided from first check to practical action.',
    statusRows: [
      { label: 'Share photos or book a visit', value: 'Start' },
      { label: 'We review the home risks', value: 'Review' },
      { label: 'You get a clear action plan', value: 'Plan' },
    ],
    statusNote: 'No product guesswork. We start with the home.',
    processEyebrow: 'How it works',
    processTitle: 'Choose how to start.',
    processBody: 'Upload photos for a faster quote, or book a measured home visit.',
    steps: [
      {
        icon: 'camera',
        title: 'Photos or visit',
        body: 'Upload photos for a direct quote, or book a home visit. The 99 EUR visit is deducted if you continue.',
        tag: 'Start',
        proof: 'Clear quote route',
        options: [
          {
            title: 'Self-inspection',
            body: 'Photos, key measurements and home details.',
            note: 'No visit needed.',
            cta: 'Start',
            to: '/home-safety-assessment#self-inspection-tool',
          },
          {
            title: 'Home visit',
            body: 'We measure access, bathrooms, stairs and support points.',
            note: '99 EUR, deducted later.',
            cta: 'Book visit',
            to: '/home-safety-assessment?visit=inspector#assessment-form',
          },
        ],
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
        body: 'We coordinate the installer, confirm the work is completed, and keep the family updated on next steps.',
        tag: 'Support',
        proof: 'Installer and family updates tracked',
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
        icon: 'heart',
        title: 'Bedroom',
        body: 'Bed transfers, night routes, bedside reach, and emergency access.',
        visualKey: 'bedroom-safety',
        alt: 'Bedroom routine safety',
      },
      {
        icon: 'monitor',
        title: 'Living areas',
        body: 'Clear routes, safer seating, lighting, cables, rugs, and everyday movement.',
        visualKey: 'smart-home-safety',
        alt: 'Living area risk map showing common trip hazards',
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
      {
        icon: 'badge',
        title: 'Grant management',
        body: 'Eligibility, documents, and follow-up.',
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
        title: 'Home Safety Plan',
        body: 'Start with one clear plan, then add optional upgrades after the report.',
        cta: 'See Plan',
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
    heroAlt: 'Profesional de CasaMia preparado para una evaluación de seguridad en casa',
    statusTitle: 'Tu siguiente paso claro',
    statusIntro: 'CasaMia acompaña a la familia desde la primera revisión hasta la acción práctica.',
    statusRows: [
      { label: 'Envía fotos o reserva visita', value: 'Inicio' },
      { label: 'Revisamos los riesgos', value: 'Revisión' },
      { label: 'Recibes un plan claro', value: 'Plan' },
    ],
    statusNote: 'Sin adivinar productos. Empezamos por la vivienda.',
    processEyebrow: 'C\u00f3mo funciona',
    processTitle: 'Elige c\u00f3mo empezar.',
    processBody: 'Sube fotos para presupuesto directo o reserva una visita con medidas.',
    steps: [
      {
        icon: 'camera',
        title: 'Fotos o visita',
        body: 'Sube fotos para presupuesto directo o reserva visita. La visita cuesta 99 EUR y se descuenta si contin\u00faas.',
        tag: 'Inicio',
        proof: 'Presupuesto claro',
        options: [
          {
            title: 'Autoinspecci\u00f3n',
            body: 'Fotos, medidas clave y datos de la vivienda.',
            note: 'Sin visita.',
            cta: 'Empezar',
            to: '/home-safety-assessment#self-inspection-tool',
          },
          {
            title: 'Visita a domicilio',
            body: 'Medimos accesos, ba\u00f1os, escaleras y apoyos.',
            note: '99 EUR, descontable.',
            cta: 'Reservar visita',
            to: '/home-safety-assessment?visit=inspector#assessment-form',
          },
        ],
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
        body: 'Coordinamos al instalador, confirmamos el trabajo realizado y mantenemos informada a la familia.',
        tag: 'Apoyo',
        proof: 'Instalador y familia informados',
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
        icon: 'heart',
        title: 'Dormitorio',
        body: 'Cama, rutas nocturnas, alcance desde la mesilla y ayuda cercana.',
        visualKey: 'bedroom-safety',
        alt: 'Rutina segura en dormitorio',
      },
      {
        icon: 'monitor',
        title: 'Sal\u00f3n',
        body: 'Rutas despejadas, asientos, iluminaci\u00f3n, cables, alfombras y movimiento diario.',
        visualKey: 'smart-home-safety',
        alt: 'Mapa de riesgos del sal\u00f3n con obst\u00e1culos y zonas de paso',
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
      {
        icon: 'badge',
        title: 'Gestión de ayudas',
        body: 'Elegibilidad, documentos y seguimiento.',
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
        title: 'Home Safety Plan',
        body: 'Un plan claro primero, con extras opcionales tras el informe.',
        cta: 'Ver plan',
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

type ReviewRiskLabel = {
  x: number
  y: number
  w: number
}

const reviewRiskVisuals: Record<string, string> = {
  'bathroom-safety': '/images/solutions/bathroom-risk-map.png',
  'bedroom-safety': '/images/solutions/bedroom-risk-map.png',
  'smart-home-safety': '/images/solutions/living-risk-map.png',
}

const reviewRiskLabels: Record<string, ReviewRiskLabel[]> = {
  'bathroom-safety': [
    { x: 36.2, y: 80.2, w: 7.8 },
    { x: 86.8, y: 26.1, w: 8.8 },
    { x: 86.8, y: 46.0, w: 8.8 },
    { x: 41.0, y: 63.2, w: 8.4 },
    { x: 7.8, y: 18.0, w: 10.2 },
    { x: 88.6, y: 64.2, w: 8.4 },
    { x: 76.8, y: 90.2, w: 8.4 },
    { x: 6.2, y: 88.8, w: 8.4 },
    { x: 6.2, y: 93.2, w: 8.4 },
  ],
  'bedroom-safety': [
    { x: 11.8, y: 19.2, w: 13.0 },
    { x: 14.2, y: 36.5, w: 12.0 },
    { x: 24.7, y: 75.4, w: 13.2 },
    { x: 10.0, y: 61.8, w: 15.0 },
    { x: 79.8, y: 44.1, w: 15.8 },
    { x: 76.2, y: 18.8, w: 15.6 },
    { x: 69.0, y: 81.5, w: 14.5 },
    { x: 6.2, y: 88.8, w: 8.4 },
    { x: 6.2, y: 93.2, w: 8.4 },
  ],
  'smart-home-safety': [
    { x: 44.6, y: 85.6, w: 10.8 },
    { x: 86.6, y: 28.2, w: 10.8 },
    { x: 70.3, y: 70.2, w: 11.8 },
    { x: 6.6, y: 72.7, w: 8.8 },
    { x: 6.9, y: 18.4, w: 9.4 },
    { x: 6.9, y: 51.5, w: 10.0 },
    { x: 90.3, y: 54.5, w: 8.6 },
    { x: 6.2, y: 88.8, w: 8.4 },
    { x: 6.2, y: 93.2, w: 8.4 },
  ],
}

const reviewRiskCopy: Record<'en' | 'es', Record<string, string[]>> = {
  en: {
    'bathroom-safety': [
      'Loose rug',
      'High step',
      'Shower entry',
      'Toilet height',
      'Wet zone',
      'Visible cable',
      'Narrow door',
      'High risk',
      'Medium risk',
    ],
    'bedroom-safety': [
      'Loose rug',
      'Low bed',
      'Poor night lighting',
      'Slippers in route',
      'Narrow path',
      'No support',
      'Door in route',
      'High risk',
      'Medium risk',
    ],
    'smart-home-safety': [
      'Loose rug',
      'Obstructed route',
      'Furniture corner',
      'Poor lighting',
      'Visible cable',
      'Low seating',
      'Narrow path',
      'High risk',
      'Medium risk',
    ],
  },
  es: {
    'bathroom-safety': [
      'Alfombra suelta',
      'Escalón alto',
      'Entrada a ducha',
      'Altura del WC',
      'Zona mojada',
      'Cable visible',
      'Puerta estrecha',
      'Riesgo alto',
      'Riesgo medio',
    ],
    'bedroom-safety': [
      'Alfombra suelta',
      'Cama baja',
      'Poca luz nocturna',
      'Calzado en el paso',
      'Paso estrecho',
      'Sin apoyo',
      'Puerta en la ruta',
      'Riesgo alto',
      'Riesgo medio',
    ],
    'smart-home-safety': [
      'Alfombra suelta',
      'Ruta obstruida',
      'Esquina de mueble',
      'Poca iluminación',
      'Cable visible',
      'Asiento bajo',
      'Paso estrecho',
      'Riesgo alto',
      'Riesgo medio',
    ],
  },
}

function getReviewVisual(key: string) {
  return reviewRiskVisuals[key] ?? getVisual(key)
}

export function HowItWorksPage() {
  const { i18n } = useTranslation()
  const copy = getHowCopy(i18n.language)
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)
  const activeReviewArea = copy.reviewAreas[activeReviewIndex] ?? copy.reviewAreas[0]
  const ActiveReviewIcon = activeReviewArea ? howIcons[activeReviewArea.icon] : ShieldCheck
  const riskLanguage = i18n.language.startsWith('es') ? 'es' : 'en'
  const activeRiskLabels = activeReviewArea ? reviewRiskLabels[activeReviewArea.visualKey] : undefined
  const activeRiskCopy = activeReviewArea ? reviewRiskCopy[riskLanguage][activeReviewArea.visualKey] : undefined
  const projectSupport = i18n.language.startsWith('es')
    ? {
        eyebrow: 'Acompa\u00f1amiento',
        body:
          'Te damos un camino claro desde la primera revisi\u00f3n hasta la soluci\u00f3n final, sin que tengas que coordinar cada detalle por tu cuenta.',
        highlights: [
          'Un equipo que revisa la vivienda y explica las prioridades',
          'Una propuesta clara antes de decidir',
          'Coordinaci\u00f3n de visita, instalaci\u00f3n y seguimiento',
        ],
        title: 'CasaMia coordina el proceso por ti',
      }
    : {
        eyebrow: 'Project support',
        body:
          'We give you a clear path from the first review to the final solution, so your family does not have to coordinate every detail alone.',
        highlights: [
          'One team reviews the home and explains the priorities',
          'You see a clear proposal before deciding',
          'Visits, installation and follow-up stay coordinated',
        ],
        title: 'CasaMia coordinates the process for you',
      }

  useEffect(() => {
    if (copy.reviewAreas.length < 2) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveReviewIndex((current) => (current + 1) % copy.reviewAreas.length)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [copy.reviewAreas.length])

  useEffect(() => {
    setActiveReviewIndex(0)
  }, [i18n.language])

  function showPreviousReviewArea() {
    setActiveReviewIndex((current) => (current - 1 + copy.reviewAreas.length) % copy.reviewAreas.length)
  }

  function showNextReviewArea() {
    setActiveReviewIndex((current) => (current + 1) % copy.reviewAreas.length)
  }

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
          </div>

          <div className="how-hero-visual">
            <SafeImage
              src="/images/solutions/casamia-worker-process.webp"
              alt={copy.heroAlt}
              className="how-hero-image"
              imgClassName="h-full w-full object-cover"
              loading="eager"
            />
            <div className="how-status-panel" aria-label={copy.statusTitle}>
              <div className="how-status-header">
                <MonitorCheck size={21} aria-hidden="true" />
                <div>
                  <strong>{copy.statusTitle}</strong>
                  <p>{copy.statusIntro}</p>
                </div>
              </div>
              {copy.statusRows.map((row, index) => (
                <div className="how-status-row" key={row.label}>
                  <span className="how-status-step" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
              <p className="how-status-note">{copy.statusNote}</p>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="how-contract-section">
        <div className="how-contract-panel site-shell">
          <div>
            <p className="eyebrow">{projectSupport.eyebrow}</p>
            <h2>{projectSupport.title}</h2>
            <p>{projectSupport.body}</p>
          </div>
          <div className="how-support-list">
            {projectSupport.highlights.map((item) => (
              <div key={item}>
                <CheckCircle2 size={21} aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                <article className={`how-step-card ${step.options ? 'has-options' : ''}`} key={step.title}>
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
                    {step.options ? (
                      <div className="how-step-options">
                        {step.options.map((option) => (
                          <div className="how-step-option" key={option.title}>
                            <strong>{option.title}</strong>
                            <p>{option.body}</p>
                            {option.note ? <span>{option.note}</span> : null}
                            <Link to={option.to}>
                              {option.cta}
                              <ArrowRight size={15} aria-hidden="true" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : null}
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

          {activeReviewArea ? (
            <div className="how-review-gallery" aria-live="polite">
              <div className={`how-review-gallery-stage ${activeRiskLabels?.length ? 'has-risk-map' : ''}`}>
                <SafeImage
                  src={getReviewVisual(activeReviewArea.visualKey)}
                  alt={activeReviewArea.alt}
                  className="how-review-gallery-image"
                  imgClassName="h-full w-full object-cover"
                />
                {activeRiskLabels?.length ? (
                  <div className="how-review-risk-labels" aria-hidden="true">
                    {activeRiskLabels.map((label, labelIndex) => (
                      <span
                        className="how-review-risk-label"
                        key={`${activeReviewArea.visualKey}-${labelIndex}`}
                        style={{
                          left: `${label.x}%`,
                          top: `${label.y}%`,
                          width: `${label.w}%`,
                        }}
                      >
                        {activeRiskCopy?.[labelIndex]}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="how-review-gallery-caption">
                  <p className="how-review-gallery-count">
                    {activeReviewIndex + 1} / {copy.reviewAreas.length}
                  </p>
                  <span>
                    <ActiveReviewIcon size={20} aria-hidden="true" />
                  </span>
                  <h3>{activeReviewArea.title}</h3>
                  <p>{activeReviewArea.body}</p>
                </div>
                <div className="how-review-gallery-controls" aria-label={copy.reviewEyebrow}>
                  <button type="button" onClick={showPreviousReviewArea} aria-label="Show previous room">
                    <ArrowLeft size={20} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={showNextReviewArea} aria-label="Show next room">
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="how-review-gallery-thumbnails" aria-label={copy.reviewEyebrow}>
                {copy.reviewAreas.map((area, index) => (
                  <button
                    className={index === activeReviewIndex ? 'is-active' : ''}
                    key={area.title}
                    type="button"
                    onClick={() => setActiveReviewIndex(index)}
                    aria-label={area.title}
                  >
                    <img src={getReviewVisual(area.visualKey)} alt="" />
                    <span>{area.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
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
          <Link className="btn btn-green" to="/why-us#contact-form">
            {copy.finalCta}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
