import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  HeartHandshake,
  type LucideIcon,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  MonitorCheck,
  Phone,
  Radio,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SEO } from '../components/SEO'
import { TrustBar } from '../components/TrustBar'
import { submitContactRequest } from '../services/contactRequests'

type ContactIconName =
  | 'activity'
  | 'badge'
  | 'building'
  | 'clipboard'
  | 'heart'
  | 'map'
  | 'message'
  | 'monitor'
  | 'phone'
  | 'radio'
  | 'shield'
  | 'users'

type OperationTone = 'green' | 'blue' | 'gold'

type ContactCopy = {
  seoTitle: string
  seoDescription: string
  schemaDescription: string
  heroEyebrow: string
  heroTitle: string
  heroBody: string
  primaryCta: string
  heroProof: Array<{
    icon: ContactIconName
    label: string
  }>
  opsAria: string
  opsEyebrow: string
  opsTitle: string
  opsSignals: Array<{
    label: string
    value: string
    tone: OperationTone
  }>
  opsTimeline: string[]
  opsFooter: string
  trustEyebrow: string
  trustTitle: string
  trustBody: string
  trustPillars: Array<{
    icon: ContactIconName
    title: string
    body: string
  }>
  coverageEyebrow: string
  coverageTitle: string
  coverageBody: string
  coveragePoints: Array<{
    icon: ContactIconName
    label: string
  }>
  coverageAria: string
  coverageMapCountry: string
  coverageMapNeighbor: string
  coverageMapSea: string
  coverageFootnote: string
  coverageCities: Array<{
    city: string
    area: string
    note: string
    lng: number
    lat: number
    pinDx?: number
    pinDy?: number
    labelDx?: number
    labelDy?: number
    labelAnchor?: 'start' | 'middle' | 'end'
    tone: OperationTone
  }>
  processEyebrow: string
  processTitle: string
  contactSteps: Array<{
    icon: ContactIconName
    title: string
    body: string
  }>
  formEyebrow: string
  formTitle: string
  formBody: string
  callTitle: string
  emailTitle: string
  messagePlaceholder: string
  formNote: string
}

const contactIcons: Record<ContactIconName, LucideIcon> = {
  activity: Activity,
  badge: BadgeCheck,
  building: Building2,
  clipboard: ClipboardCheck,
  heart: HeartHandshake,
  map: MapPin,
  message: MessageCircle,
  monitor: MonitorCheck,
  phone: Phone,
  radio: Radio,
  shield: ShieldCheck,
  users: UsersRound,
}

const contactCopy: Record<'en' | 'es', ContactCopy> = {
  en: {
    seoTitle: 'Contact CasaMia',
    seoDescription:
      'Contact CasaMia to speak with home safety experts, check local coverage in Spain, and start a tracked home safety request.',
    schemaDescription:
      'Contact CasaMia for expert senior home safety support, local coverage planning, and tracked assessment requests in Spain.',
    heroEyebrow: 'Expert-led home safety support',
    heroTitle: 'Talk to the team that coordinates safer homes across Spain.',
    heroBody:
      'CasaMia combines home safety expertise, local coverage planning, and internal operations technology so families can move from concern to a clear, tracked next step.',
    primaryCta: 'Send a request',
    heroProof: [
      { icon: 'badge', label: 'Qualified safety review' },
      { icon: 'radio', label: 'Real-time internal tracking' },
      { icon: 'building', label: 'Local coordination across Spain' },
    ],
    opsAria: 'CasaMia operations dashboard preview',
    opsEyebrow: 'CasaMia Operations',
    opsTitle: 'Live request view',
    opsSignals: [
      { label: 'Lead received', value: 'Queued', tone: 'green' },
      { label: 'Expert triage', value: 'Assigned', tone: 'blue' },
      { label: 'Visit planning', value: 'Coverage check', tone: 'gold' },
      { label: 'Family updates', value: 'Tracked', tone: 'green' },
    ],
    opsTimeline: [
      'Contact details and home concern captured.',
      'Coverage, availability, and expert notes checked.',
      'Family follow-up, visit, and proposal status monitored.',
    ],
    opsFooter: 'Every request has a visible owner and next action internally.',
    trustEyebrow: 'Why families contact CasaMia',
    trustTitle: 'Confidence comes from expertise, coverage, and visibility.',
    trustBody:
      'A safer home is not just a product purchase. It takes the right review, the right local coordination, and a process that does not disappear after the first phone call.',
    trustPillars: [
      {
        icon: 'users',
        title: 'Expert team, not a call centre',
        body: 'Your request is reviewed by people who understand home safety, older-adult routines, installations, and family decision-making.',
      },
      {
        icon: 'map',
        title: 'Spain-wide coordination',
        body: 'CasaMia supports families across Spain through local coverage planning, remote triage, and trusted installation coordination.',
      },
      {
        icon: 'monitor',
        title: 'Tracked internally in real time',
        body: 'Requests, visits, proposals, documents, installations, and follow-ups are monitored through our internal operations dashboard.',
      },
      {
        icon: 'shield',
        title: 'Clear, accountable next steps',
        body: 'You know what happens next: review, call, visit, recommendation, proposal, installation, and handover where needed.',
      },
    ],
    coverageEyebrow: 'Geo presence',
    coverageTitle: 'Where are we?',
    coverageBody:
      'CasaMia coordinates requests from main city hubs across Spain, then checks the exact address, route, home type and urgency before confirming a visit or installation.',
    coveragePoints: [
      { icon: 'map', label: 'Spain-wide request intake' },
      { icon: 'users', label: 'Expert review before work starts' },
      { icon: 'monitor', label: 'Internal dashboard for request status' },
    ],
    coverageAria: 'CasaMia main city coverage hubs',
    coverageMapCountry: 'Spain',
    coverageMapNeighbor: 'Portugal',
    coverageMapSea: 'Mediterranean Sea',
    coverageFootnote:
      'Nearby towns are reviewed from the nearest city hub once the exact address and urgency are known.',
    coverageCities: [
      {
        city: 'Madrid',
        area: 'Central Spain',
        note: 'Assessment, project planning, and family coordination.',
        lng: -3.7038,
        lat: 40.4168,
        labelDx: 18,
        labelDy: 7,
        labelAnchor: 'start',
        tone: 'green',
      },
      {
        city: 'Barcelona',
        area: 'Catalonia',
        note: 'Urban apartments, access planning, and smart safety setup.',
        lng: 2.1734,
        lat: 41.3851,
        pinDx: -22,
        pinDy: 14,
        labelDx: -18,
        labelDy: -14,
        labelAnchor: 'end',
        tone: 'blue',
      },
      {
        city: 'Valencia',
        area: 'Mediterranean coast',
        note: 'Home assessments and installation coordination by address.',
        lng: -0.3763,
        lat: 39.4699,
        pinDx: -22,
        labelDx: 18,
        labelDy: 8,
        labelAnchor: 'start',
        tone: 'green',
      },
      {
        city: 'Seville',
        area: 'Andalusia',
        note: 'Bathroom, stairs, entrance, and whole-home safety planning.',
        lng: -5.9845,
        lat: 37.3891,
        labelDx: -18,
        labelDy: 18,
        labelAnchor: 'end',
        tone: 'gold',
      },
      {
        city: 'Malaga',
        area: 'Costa del Sol',
        note: 'Coastal homes, visiting family needs, and urgent safety checks.',
        lng: -4.4214,
        lat: 36.7213,
        pinDy: -18,
        labelDx: 18,
        labelDy: 10,
        labelAnchor: 'start',
        tone: 'green',
      },
      {
        city: 'Alicante',
        area: 'Costa Blanca',
        note: 'Senior living routines, access points, and home adaptations.',
        lng: -0.4907,
        lat: 38.3452,
        pinDx: -28,
        pinDy: -4,
        labelDx: 18,
        labelDy: 18,
        labelAnchor: 'start',
        tone: 'blue',
      },
      {
        city: 'Murcia',
        area: 'Southeast Spain',
        note: 'Coverage checked for nearby towns before confirming visits.',
        lng: -1.1307,
        lat: 37.9922,
        labelDx: -16,
        labelDy: 22,
        labelAnchor: 'end',
        tone: 'green',
      },
      {
        city: 'Palma',
        area: 'Balearic Islands',
        note: 'Island requests reviewed for availability and practical setup.',
        lng: 2.6502,
        lat: 39.5696,
        labelDx: 18,
        labelDy: 6,
        labelAnchor: 'start',
        tone: 'gold',
      },
      {
        city: 'Bilbao',
        area: 'Northern Spain',
        note: 'Remote triage and local coordination checked by request.',
        lng: -2.935,
        lat: 43.263,
        pinDx: -2,
        pinDy: 14,
        labelDx: 18,
        labelDy: -14,
        labelAnchor: 'start',
        tone: 'blue',
      },
      {
        city: 'Zaragoza',
        area: 'Northeast corridor',
        note: 'Assessment route and installation feasibility checked first.',
        lng: -0.8891,
        lat: 41.6488,
        labelDx: 18,
        labelDy: -8,
        labelAnchor: 'start',
        tone: 'green',
      },
    ],
    processEyebrow: 'What happens next',
    processTitle: 'You are not just filling in a form.',
    contactSteps: [
      {
        icon: 'message',
        title: '1. We review the request',
        body: 'A CasaMia coordinator checks the home context, location, concern, and urgency before recommending the next step.',
      },
      {
        icon: 'phone',
        title: '2. We clarify the priority',
        body: 'We confirm whether the family needs a safety report, an in-home assessment, smart safety, or a package proposal.',
      },
      {
        icon: 'clipboard',
        title: '3. We prepare the visit or plan',
        body: 'The request is tracked internally so the right expert, area coverage, notes, photos, and follow-up are kept together.',
      },
      {
        icon: 'heart',
        title: '4. We stay accountable',
        body: 'From first contact to proposal and installation, the family gets a clear path and CasaMia keeps the process visible internally.',
      },
    ],
    formEyebrow: 'Start here',
    formTitle: 'Tell us what worries you about the home.',
    formBody:
      'Share the room, routine, location, and urgency. A CasaMia coordinator will use this to route the request to the right next step.',
    callTitle: 'Call CasaMia',
    emailTitle: 'Email support',
    messagePlaceholder:
      'Example: My father is struggling with the stairs at night, we are in Marbella, and we need to understand what to fix first.',
    formNote:
      'Requests are logged in CasaMia operations so the team can track owner, status, next action, and family follow-up.',
  },
  es: {
    seoTitle: 'Contacto CasaMia',
    seoDescription:
      'Contacta con CasaMia para hablar con expertos en seguridad del hogar, revisar cobertura local en España e iniciar una solicitud con seguimiento.',
    schemaDescription:
      'Contacta con CasaMia para recibir apoyo experto en seguridad del hogar, planificación de cobertura local y solicitudes de evaluación con seguimiento en España.',
    heroEyebrow: 'Apoyo experto en seguridad del hogar',
    heroTitle: 'Habla con el equipo que coordina hogares más seguros en España.',
    heroBody:
      'CasaMia combina experiencia en seguridad del hogar, planificación local y tecnología interna de operaciones para que las familias pasen de la preocupación a un siguiente paso claro y trazable.',
    primaryCta: 'Enviar solicitud',
    heroProof: [
      { icon: 'badge', label: 'Revisión experta de seguridad' },
      { icon: 'radio', label: 'Seguimiento interno en tiempo real' },
      { icon: 'building', label: 'Coordinación local en España' },
    ],
    opsAria: 'Vista previa del panel operativo de CasaMia',
    opsEyebrow: 'Operaciones CasaMia',
    opsTitle: 'Vista activa de solicitudes',
    opsSignals: [
      { label: 'Solicitud recibida', value: 'En cola', tone: 'green' },
      { label: 'Triage experto', value: 'Asignado', tone: 'blue' },
      { label: 'Plan de visita', value: 'Cobertura', tone: 'gold' },
      { label: 'Familia informada', value: 'Trazado', tone: 'green' },
    ],
    opsTimeline: [
      'Datos de contacto y preocupación del hogar registrados.',
      'Cobertura, disponibilidad y notas expertas revisadas.',
      'Seguimiento familiar, visita y propuesta monitorizados.',
    ],
    opsFooter: 'Cada solicitud tiene responsable visible y siguiente acción interna.',
    trustEyebrow: 'Por qué las familias contactan con CasaMia',
    trustTitle: 'La confianza nace de la experiencia, la cobertura y la visibilidad.',
    trustBody:
      'Un hogar más seguro no es solo comprar productos. Requiere una buena revisión, coordinación local y un proceso que no desaparece tras la primera llamada.',
    trustPillars: [
      {
        icon: 'users',
        title: 'Equipo experto, no un call center',
        body: 'Tu solicitud la revisan personas que entienden seguridad del hogar, rutinas de personas mayores, instalaciones y decisiones familiares.',
      },
      {
        icon: 'map',
        title: 'Coordinación en toda España',
        body: 'CasaMia apoya a familias en España con planificación de cobertura local, triage remoto y coordinación de instaladores de confianza.',
      },
      {
        icon: 'monitor',
        title: 'Seguimiento interno en tiempo real',
        body: 'Solicitudes, visitas, propuestas, documentos, instalaciones y seguimientos se monitorizan desde nuestro panel interno de operaciones.',
      },
      {
        icon: 'shield',
        title: 'Siguientes pasos claros',
        body: 'Sabes qué ocurre después: revisión, llamada, visita, recomendación, propuesta, instalación y entrega cuando haga falta.',
      },
    ],
    coverageEyebrow: 'Presencia geográfica',
    coverageTitle: '¿Dónde estamos?',
    coverageBody:
      'CasaMia coordina solicitudes desde ciudades principales en España y después revisa dirección exacta, ruta, tipo de vivienda y urgencia antes de confirmar una visita o instalación.',
    coveragePoints: [
      { icon: 'map', label: 'Entrada de solicitudes en España' },
      { icon: 'users', label: 'Revisión experta antes de empezar' },
      { icon: 'monitor', label: 'Panel interno de estado y seguimiento' },
    ],
    coverageAria: 'Ciudades principales de cobertura CasaMia',
    coverageMapCountry: 'España',
    coverageMapNeighbor: 'Portugal',
    coverageMapSea: 'Mar Mediterráneo',
    coverageFootnote:
      'Las poblaciones cercanas se revisan desde el hub urbano más próximo cuando conocemos dirección exacta y urgencia.',
    coverageCities: [
      {
        city: 'Madrid',
        area: 'Centro peninsular',
        note: 'Evaluación, planificación del proyecto y coordinación familiar.',
        lng: -3.7038,
        lat: 40.4168,
        labelDx: 18,
        labelDy: 7,
        labelAnchor: 'start',
        tone: 'green',
      },
      {
        city: 'Barcelona',
        area: 'Cataluña',
        note: 'Pisos urbanos, planificación de accesos y seguridad smart.',
        lng: 2.1734,
        lat: 41.3851,
        pinDx: -22,
        pinDy: 14,
        labelDx: -18,
        labelDy: -14,
        labelAnchor: 'end',
        tone: 'blue',
      },
      {
        city: 'Valencia',
        area: 'Costa mediterránea',
        note: 'Evaluaciones e instalación coordinadas según dirección.',
        lng: -0.3763,
        lat: 39.4699,
        pinDx: -22,
        labelDx: 18,
        labelDy: 8,
        labelAnchor: 'start',
        tone: 'green',
      },
      {
        city: 'Sevilla',
        area: 'Andalucía',
        note: 'Baños, escaleras, entradas y seguridad integral del hogar.',
        lng: -5.9845,
        lat: 37.3891,
        labelDx: -18,
        labelDy: 18,
        labelAnchor: 'end',
        tone: 'gold',
      },
      {
        city: 'Málaga',
        area: 'Costa del Sol',
        note: 'Viviendas costeras, visitas familiares y revisiones urgentes.',
        lng: -4.4214,
        lat: 36.7213,
        pinDy: -18,
        labelDx: 18,
        labelDy: 10,
        labelAnchor: 'start',
        tone: 'green',
      },
      {
        city: 'Alicante',
        area: 'Costa Blanca',
        note: 'Rutinas de personas mayores, accesos y adaptaciones del hogar.',
        lng: -0.4907,
        lat: 38.3452,
        pinDx: -28,
        pinDy: -4,
        labelDx: 18,
        labelDy: 18,
        labelAnchor: 'start',
        tone: 'blue',
      },
      {
        city: 'Murcia',
        area: 'Sureste peninsular',
        note: 'Poblaciones cercanas revisadas antes de confirmar visitas.',
        lng: -1.1307,
        lat: 37.9922,
        labelDx: -16,
        labelDy: 22,
        labelAnchor: 'end',
        tone: 'green',
      },
      {
        city: 'Palma',
        area: 'Islas Baleares',
        note: 'Solicitudes insulares revisadas según disponibilidad y montaje.',
        lng: 2.6502,
        lat: 39.5696,
        labelDx: 18,
        labelDy: 6,
        labelAnchor: 'start',
        tone: 'gold',
      },
      {
        city: 'Bilbao',
        area: 'Norte de España',
        note: 'Triage remoto y coordinación local revisados por solicitud.',
        lng: -2.935,
        lat: 43.263,
        pinDx: -2,
        pinDy: 14,
        labelDx: 18,
        labelDy: -14,
        labelAnchor: 'start',
        tone: 'blue',
      },
      {
        city: 'Zaragoza',
        area: 'Corredor noreste',
        note: 'Ruta de evaluación y viabilidad de instalación revisadas primero.',
        lng: -0.8891,
        lat: 41.6488,
        labelDx: 18,
        labelDy: -8,
        labelAnchor: 'start',
        tone: 'green',
      },
    ],
    processEyebrow: 'Qué pasa después',
    processTitle: 'No estás rellenando solo un formulario.',
    contactSteps: [
      {
        icon: 'message',
        title: '1. Revisamos la solicitud',
        body: 'Un coordinador de CasaMia revisa contexto del hogar, ubicación, preocupación y urgencia antes de recomendar el siguiente paso.',
      },
      {
        icon: 'phone',
        title: '2. Aclaramos la prioridad',
        body: 'Confirmamos si la familia necesita informe de seguridad, evaluación en casa, seguridad smart o una propuesta de paquete.',
      },
      {
        icon: 'clipboard',
        title: '3. Preparamos la visita o plan',
        body: 'La solicitud queda trazada internamente para mantener juntos experto, cobertura, notas, fotos y seguimiento.',
      },
      {
        icon: 'heart',
        title: '4. Mantenemos la responsabilidad',
        body: 'Desde el primer contacto hasta la propuesta e instalación, la familia tiene un camino claro y CasaMia mantiene visibilidad interna.',
      },
    ],
    formEyebrow: 'Empieza aquí',
    formTitle: 'Cuéntanos qué te preocupa del hogar.',
    formBody:
      'Comparte la estancia, rutina, ubicación y urgencia. Un coordinador de CasaMia usará esta información para dirigir la solicitud al siguiente paso correcto.',
    callTitle: 'Llamar a CasaMia',
    emailTitle: 'Email de soporte',
    messagePlaceholder:
      'Ejemplo: Mi padre tiene dificultades con las escaleras por la noche, estamos en Marbella y necesitamos saber qué arreglar primero.',
    formNote:
      'Las solicitudes se registran en operaciones CasaMia para que el equipo controle responsable, estado, siguiente acción y seguimiento familiar.',
  },
}

type MapCoordinate = readonly [number, number]

const CONTACT_MAP_WIDTH = 1000
const CONTACT_MAP_HEIGHT = 650
const CONTACT_MAP_BOUNDS = {
  minLng: -10.1,
  maxLng: 4.2,
  minLat: 35.55,
  maxLat: 44.2,
}

function projectMapPoint(lng: number, lat: number) {
  const x =
    60 +
    ((lng - CONTACT_MAP_BOUNDS.minLng) /
      (CONTACT_MAP_BOUNDS.maxLng - CONTACT_MAP_BOUNDS.minLng)) *
      880
  const y =
    40 +
    ((CONTACT_MAP_BOUNDS.maxLat - lat) /
      (CONTACT_MAP_BOUNDS.maxLat - CONTACT_MAP_BOUNDS.minLat)) *
      560

  return { x, y }
}

function projectCityPoint(city: ContactCopy['coverageCities'][number]) {
  const point = projectMapPoint(city.lng, city.lat)

  return {
    x: point.x + (city.pinDx ?? 0),
    y: point.y + (city.pinDy ?? 0),
  }
}

function buildMapPath(points: MapCoordinate[]) {
  return points
    .map(([lng, lat], index) => {
      const point = projectMapPoint(lng, lat)
      return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    })
    .join(' ')
    .concat(' Z')
}

const spainMainlandPath = buildMapPath([
  [-9.28, 43.74],
  [-8.78, 43.52],
  [-7.82, 43.58],
  [-6.64, 43.66],
  [-5.54, 43.64],
  [-4.38, 43.52],
  [-3.22, 43.5],
  [-2.18, 43.34],
  [-1.26, 43.12],
  [-0.5, 42.86],
  [0.52, 42.74],
  [1.56, 42.58],
  [2.44, 42.34],
  [3.28, 41.96],
  [3.08, 41.34],
  [2.5, 41.08],
  [2.0, 40.82],
  [1.12, 40.58],
  [0.52, 40.18],
  [0.26, 39.72],
  [-0.04, 39.18],
  [-0.32, 38.66],
  [-0.62, 38.18],
  [-1.02, 37.82],
  [-1.38, 37.38],
  [-1.92, 36.98],
  [-2.58, 36.78],
  [-3.22, 36.72],
  [-3.82, 36.68],
  [-4.34, 36.58],
  [-4.82, 36.42],
  [-5.24, 36.2],
  [-5.62, 36.0],
  [-6.34, 36.02],
  [-6.98, 36.54],
  [-7.34, 37.25],
  [-7.24, 38.02],
  [-7.0, 38.8],
  [-7.0, 39.54],
  [-7.2, 40.24],
  [-6.92, 40.86],
  [-7.42, 41.56],
  [-8.34, 41.86],
  [-9.02, 42.44],
  [-9.28, 43.2],
])

const portugalMapPath = buildMapPath([
  [-9.5, 42.12],
  [-8.56, 41.9],
  [-8.24, 41.2],
  [-8.58, 40.58],
  [-8.68, 39.7],
  [-8.98, 38.72],
  [-8.84, 37.38],
  [-7.84, 37.0],
  [-7.34, 37.25],
  [-7.24, 38.02],
  [-7.0, 38.8],
  [-7.0, 39.54],
  [-7.2, 40.24],
  [-6.92, 40.86],
  [-7.42, 41.56],
  [-8.34, 41.86],
])

const mallorcaMapPath = buildMapPath([
  [2.23, 39.72],
  [2.65, 39.93],
  [3.22, 39.86],
  [3.7, 39.58],
  [3.28, 39.28],
  [2.58, 39.26],
  [2.1, 39.42],
])

const menorcaMapPath = buildMapPath([
  [3.75, 40.1],
  [4.13, 40.1],
  [4.0, 39.92],
  [3.6, 39.96],
])

const ibizaMapPath = buildMapPath([
  [1.24, 39.1],
  [1.54, 39.04],
  [1.48, 38.86],
  [1.2, 38.9],
])

const contactCoverageSignals: MapCoordinate[] = [
  [-8.24, 43.06],
  [-5.74, 42.86],
  [-3.78, 42.72],
  [-1.64, 42.52],
  [0.52, 41.72],
  [-4.72, 41.65],
  [-5.66, 40.97],
  [-6.12, 39.18],
  [-4.78, 37.88],
  [-3.6, 37.28],
  [-2.42, 37.06],
  [-1.72, 38.82],
  [1.04, 41.1],
  [-0.05, 39.99],
  [-4.03, 39.86],
  [-5.57, 42.38],
  [-3.7, 42.34],
  [-6.94, 37.36],
  [-2.45, 42.46],
]

function getContactCopy(language: string) {
  return language.startsWith('es') ? contactCopy.es : contactCopy.en
}

export function ContactPage() {
  const { i18n, t } = useTranslation()
  const copy = getContactCopy(i18n.language)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const planOptions = t('pages.contact.planOptions', { returnObjects: true }) as string[]
  const phoneNumber = t('nav.phone')
  const phoneHref = phoneNumber.replace(/\s+/g, '')
  const hubCity = copy.coverageCities.find((city) => city.city === 'Madrid')
  const hubPoint = hubCity ? projectCityPoint(hubCity) : null

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
        source: 'contact-page',
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
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/contact"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: copy.seoTitle,
          description: copy.schemaDescription,
        }}
      />

      <section className="contact-hero">
        <div className="contact-hero-grid site-shell">
          <div className="contact-hero-copy">
            <span className="eyebrow">
              <span className="dot" aria-hidden="true" />
              {copy.heroEyebrow}
            </span>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroBody}</p>
            <div className="contact-hero-actions">
              <a className="btn btn-green" href="#contact-form">
                {copy.primaryCta}
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              <a className="btn btn-white" href={`tel:${phoneHref}`}>
                <Phone size={18} aria-hidden="true" />
                {phoneNumber}
              </a>
            </div>
            <div className="contact-hero-proof">
              {copy.heroProof.map((proof) => {
                const Icon = contactIcons[proof.icon]

                return (
                  <span key={proof.label}>
                    <Icon size={18} aria-hidden="true" />
                    {proof.label}
                  </span>
                )
              })}
            </div>
          </div>

          <aside className="contact-ops-panel" aria-label={copy.opsAria}>
            <div className="contact-ops-header">
              <div>
                <span>{copy.opsEyebrow}</span>
                <strong>{copy.opsTitle}</strong>
              </div>
              <Activity size={24} aria-hidden="true" />
            </div>
            <div className="contact-ops-status">
              {copy.opsSignals.map((signal) => (
                <div className={`is-${signal.tone}`} key={signal.label}>
                  <span>{signal.label}</span>
                  <strong>{signal.value}</strong>
                </div>
              ))}
            </div>
            <div className="contact-ops-timeline">
              {copy.opsTimeline.map((item) => (
                <div key={item}>
                  <span aria-hidden="true" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
            <div className="contact-ops-footer">
              <CheckCircle2 size={18} aria-hidden="true" />
              {copy.opsFooter}
            </div>
          </aside>
        </div>
      </section>

      <TrustBar />

      <section className="contact-trust-section">
        <div className="site-shell">
          <div className="contact-section-heading">
            <p className="eyebrow">{copy.trustEyebrow}</p>
            <h2>{copy.trustTitle}</h2>
            <p>{copy.trustBody}</p>
          </div>

          <div className="contact-trust-grid">
            {copy.trustPillars.map((pillar) => {
              const Icon = contactIcons[pillar.icon]

              return (
                <article key={pillar.title}>
                  <span>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="contact-coverage-section">
        <div className="contact-coverage-grid site-shell">
          <div className="contact-coverage-copy">
            <p className="eyebrow">{copy.coverageEyebrow}</p>
            <h2>{copy.coverageTitle}</h2>
            <p>{copy.coverageBody}</p>
            <div className="contact-coverage-points">
              {copy.coveragePoints.map((point) => {
                const Icon = contactIcons[point.icon]

                return (
                  <span key={point.label}>
                    <Icon size={18} aria-hidden="true" />
                    {point.label}
                  </span>
                )
              })}
            </div>
            <a className="btn btn-green contact-coverage-cta" href="#contact-form">
              {copy.primaryCta}
              <ArrowRight size={20} aria-hidden="true" />
            </a>
            <p className="contact-coverage-note">
              <MapPin size={18} aria-hidden="true" />
              {copy.coverageFootnote}
            </p>
          </div>

          <div className="contact-city-panel" aria-label={copy.coverageAria}>
            <div className="contact-city-map">
              <svg
                aria-label={copy.coverageAria}
                className="contact-spain-map"
                focusable="false"
                role="img"
                viewBox={`0 0 ${CONTACT_MAP_WIDTH} ${CONTACT_MAP_HEIGHT}`}
              >
                <title>{copy.coverageAria}</title>
                <defs>
                  <linearGradient id="contactMapSea" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#dff2fb" />
                    <stop offset="100%" stopColor="#b7def3" />
                  </linearGradient>
                  <linearGradient id="contactMapLand" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#fff7d7" />
                    <stop offset="100%" stopColor="#eaf4d5" />
                  </linearGradient>
                  <filter id="contactMapShadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="18" floodColor="#0d1e2e" floodOpacity="0.18" stdDeviation="14" />
                  </filter>
                </defs>
                <rect className="contact-map-water" width={CONTACT_MAP_WIDTH} height={CONTACT_MAP_HEIGHT} rx="18" />
                <path className="contact-map-neighbor" d={portugalMapPath} />
                <path className="contact-map-mainland" d={spainMainlandPath} filter="url(#contactMapShadow)" />
                <path className="contact-map-island" d={mallorcaMapPath} filter="url(#contactMapShadow)" />
                <path className="contact-map-island is-small" d={menorcaMapPath} />
                <path className="contact-map-island is-small" d={ibizaMapPath} />
                <text className="contact-map-neighbor-label" x="198" y="374">
                  {copy.coverageMapNeighbor}
                </text>
                <text className="contact-map-sea-label" x="764" y="520">
                  {copy.coverageMapSea}
                </text>
                <text className="contact-map-country-label" x="480" y="330">
                  {copy.coverageMapCountry}
                </text>
                <g className="contact-map-support-dots" aria-hidden="true">
                  {contactCoverageSignals.map(([lng, lat]) => {
                    const point = projectMapPoint(lng, lat)

                    return <circle className="contact-map-support-dot" cx={point.x} cy={point.y} key={`${lng}-${lat}`} r="7" />
                  })}
                </g>
                {hubPoint ? (
                  <g className="contact-map-routes" aria-hidden="true">
                    {copy.coverageCities
                      .filter((city) => city.city !== hubCity?.city)
                      .map((city) => {
                        const point = projectCityPoint(city)

                        return (
                          <line
                            className={`contact-map-route is-${city.tone}`}
                            key={`${city.city}-route`}
                            x1={hubPoint.x}
                            x2={point.x}
                            y1={hubPoint.y}
                            y2={point.y}
                          />
                        )
                      })}
                  </g>
                ) : null}
                <g className="contact-map-city-pins">
                  {copy.coverageCities.map((city) => {
                    const point = projectCityPoint(city)

                    return (
                      <g
                        className={`contact-map-city-pin is-${city.tone}`}
                        key={`${city.city}-pin`}
                        transform={`translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`}
                      >
                        <title>
                          {city.city}: {city.area}
                        </title>
                        <path className="contact-map-pin-shape" d="M0 0 C0 0 13 -12 13 -24 C13 -32 7 -38 0 -38 C-7 -38 -13 -32 -13 -24 C-13 -12 0 0 0 0Z" />
                        <circle className="contact-map-pin-dot" cy="-24" r="5.2" />
                      </g>
                    )
                  })}
                </g>
                <g className="contact-map-city-labels">
                  {copy.coverageCities.map((city) => {
                    const point = projectCityPoint(city)

                    return (
                      <text
                        className="contact-map-city-label"
                        key={`${city.city}-label`}
                        textAnchor={city.labelAnchor ?? 'middle'}
                        x={point.x + (city.labelDx ?? 0)}
                        y={point.y + (city.labelDy ?? -18)}
                      >
                        {city.city}
                      </text>
                    )
                  })}
                </g>
                <g className="contact-map-scale" aria-hidden="true">
                  <line x1="58" x2="160" y1="590" y2="590" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-process-section">
        <div className="site-shell">
          <div className="contact-section-heading is-centered">
            <p className="eyebrow">{copy.processEyebrow}</p>
            <h2>{copy.processTitle}</h2>
          </div>

          <div className="contact-process-grid">
            {copy.contactSteps.map((step) => {
              const Icon = contactIcons[step.icon]

              return (
                <article key={step.title}>
                  <span>
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="contact-form-section" id="contact-form">
        <div className="contact-form-layout site-shell">
          <div className="contact-form-copy">
            <p className="eyebrow">{copy.formEyebrow}</p>
            <h2>{copy.formTitle}</h2>
            <p>{copy.formBody}</p>
            <div className="contact-direct-options">
              <a href={`tel:${phoneHref}`}>
                <Phone size={19} aria-hidden="true" />
                <span>
                  <strong>{copy.callTitle}</strong>
                  {phoneNumber}
                </span>
              </a>
              <a href="mailto:hello@casamia.es">
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
              <Field label={t('pages.contact.fields.name')} name="name" required />
              <Field label={t('pages.contact.fields.email')} name="email" type="email" required />
              <Field label={t('pages.contact.fields.phone')} name="phone" type="tel" />
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
            <p className="contact-form-note">
              <Clock3 size={17} aria-hidden="true" />
              {copy.formNote}
            </p>
          </form>
        </div>
      </section>
    </>
  )
}

function Field({
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
