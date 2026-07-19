import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  CookingPot,
  DoorOpen,
  FileText,
  HeartHandshake,
  Home,
  Lightbulb,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  MonitorCheck,
  PhoneCall,
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
import { CASAMIA_CONTACT_EMAIL, CASAMIA_CONTACT_PHONE, CASAMIA_WHATSAPP_URL } from '../constants/contact'
import { IMAGE_URLS } from '../constants/shopify'
import { serviceVisuals } from '../constants/serviceVisuals'
import '../styles/how-it-works-process.css'

type HowIconName =
  | 'badge'
  | 'camera'
  | 'check'
  | 'clipboard'
  | 'door'
  | 'file'
  | 'heart'
  | 'home'
  | 'light'
  | 'map'
  | 'monitor'
  | 'phone'
  | 'kitchen'
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
  previousRoomLabel: string
  nextRoomLabel: string
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
  door: DoorOpen,
  file: FileText,
  heart: HeartHandshake,
  home: Home,
  light: Lightbulb,
  map: MapPin,
  monitor: MonitorCheck,
  phone: PhoneCall,
  kitchen: CookingPot,
  shield: ShieldCheck,
  sparkles: Sparkles,
  wrench: Wrench,
}

type ServiceChannelKey = 'online' | 'voice' | 'whatsapp' | 'call' | 'email'

type EasyProcessCopy = {
  title: string
  body: string
  heroOutcomeEyebrow: string
  heroOutcomeText: string
  channelsTitle: string
  channelsBody: string
  humanAlt: string
  channels: Array<{ key: ServiceChannelKey; title: string; body: string }>
  steps: Array<{ title: string; body: string }>
}

const easyProcessCopy: Record<'en' | 'es', EasyProcessCopy> = {
  en: {
    title: 'Start your way.',
    body: 'CasaMia handles the rest.',
    heroOutcomeEyebrow: 'What you receive',
    heroOutcomeText: 'Clear priorities, practical next steps, and CasaMia coordinating the work.',
    channelsTitle: 'Choose a channel',
    channelsBody: 'Every route reaches the same CasaMia team.',
    humanAlt: 'Older woman smiling while using her smartphone at home',
    channels: [
      { key: 'online', title: 'Online', body: 'Simple guided questions' },
      { key: 'voice', title: 'Voice', body: 'Tell us naturally' },
      { key: 'whatsapp', title: 'WhatsApp', body: 'Message us from your phone' },
      { key: 'call', title: 'Phone', body: 'Call us or request a callback' },
      { key: 'email', title: 'Email', body: 'hola@casamia.com.es' },
    ],
    steps: [
      {
        title: 'Tell us what you need',
        body: 'Share what feels difficult, unsafe or urgent.',
      },
      {
        title: 'We assess your home',
        body: 'Using photos or a home visit, we identify the priorities.',
      },
      {
        title: 'Review your plan',
        body: 'See the recommended work and the next step before you decide.',
      },
      {
        title: 'We coordinate and follow up',
        body: 'We arrange the work, check the result and stay available.',
      },
    ],
  },
  es: {
    title: 'Empieza como prefieras.',
    body: 'CasaMia se encarga del resto.',
    heroOutcomeEyebrow: 'Qu\u00e9 recibes',
    heroOutcomeText: 'Prioridades claras, pasos prácticos y CasaMia coordinando el trabajo.',
    channelsTitle: 'Elige tu canal',
    channelsBody: 'Todas las v\u00edas llegan al mismo equipo CasaMia.',
    humanAlt: 'Mujer mayor sonriendo mientras usa su tel\u00e9fono m\u00f3vil en casa',
    channels: [
      { key: 'online', title: 'Online', body: 'Preguntas sencillas y guiadas' },
      { key: 'voice', title: 'Voz', body: 'Habla con naturalidad' },
      { key: 'whatsapp', title: 'WhatsApp', body: 'Escr\u00edbenos desde el m\u00f3vil' },
      { key: 'call', title: 'Tel\u00e9fono', body: 'Ll\u00e1manos o pide que te llamemos' },
      { key: 'email', title: 'Email', body: 'hola@casamia.com.es' },
    ],
    steps: [
      {
        title: 'Cu\u00e9ntanos qu\u00e9 necesitas',
        body: 'Expl\u00edcanos qu\u00e9 resulta dif\u00edcil, inseguro o urgente.',
      },
      {
        title: 'Evaluamos la vivienda',
        body: 'Con fotos o una visita, identificamos las prioridades.',
      },
      {
        title: 'Revisa tu plan',
        body: 'Consulta las mejoras recomendadas y el siguiente paso antes de decidir.',
      },
      {
        title: 'Coordinamos y hacemos seguimiento',
        body: 'Organizamos el trabajo, comprobamos el resultado y seguimos disponibles.',
      },
    ],
  },
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
    statusTitle: 'Four clear steps',
    statusIntro: 'You start. CasaMia coordinates the rest.',
    statusRows: [
      { label: 'One call or click', value: 'Start' },
      { label: 'We understand the home', value: 'Discover' },
      { label: 'We coordinate the work', value: 'Install' },
      { label: 'We stay with you', value: 'Support' },
    ],
    statusNote: 'One team from first contact to follow-up.',
    processEyebrow: 'That simple',
    processTitle: 'One call or one click. We coordinate the rest.',
    processBody:
      'Tell us what you need. CasaMia turns the first conversation into a clear plan, coordinated installation and ongoing support.',
    steps: [
      {
        icon: 'phone',
        title: 'Call us or start online',
        body: 'Choose what feels easiest. We listen and guide you from the first moment.',
        tag: 'Start',
        proof: 'Phone or online',
      },
      {
        icon: 'home',
        title: 'We understand the home',
        body: 'Together, we review the space, daily routines and priorities.',
        tag: 'Discover',
        proof: 'Home · routines · priorities',
        options: [
          {
            title: 'Self-inspection',
            body: 'Photos + measurements.',
            note: 'Fastest route',
            cta: 'Upload photos',
            to: '/home-safety-assessment#self-inspection-tool',
          },
          {
            title: 'Home visit',
            body: 'We measure for you.',
            note: '99 EUR deductible',
            cta: 'Book visit',
            to: '/home-safety-assessment?visit=inspector#assessment-form',
          },
        ],
      },
      {
        icon: 'wrench',
        title: 'We coordinate the installation',
        body: 'We agree the scope and date, coordinate the work and check the result.',
        tag: 'Install',
        proof: 'Plan · date · final check',
      },
      {
        icon: 'heart',
        title: 'We stay with you',
        body: 'We answer questions, follow up and adapt the plan when needs change.',
        tag: 'Support',
        proof: 'Follow-up stays active',
      },
    ],
    reviewEyebrow: 'Room-by-room',
    reviewTitle: 'We review the spaces that shape daily safety.',
    reviewBody:
      'Bathrooms, bedrooms, living areas, entrances, and kitchens all affect confidence at home.',
    reviewCta: 'View Services',
    previousRoomLabel: 'Show previous room',
    nextRoomLabel: 'Show next room',
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
      {
        icon: 'door',
        title: 'Entrance',
        body: 'Thresholds, steps, lighting, hand support, door clearance, and a clear route in and out.',
        visualKey: 'entrance-safety',
        alt: 'Entrance safety risk map highlighting low light, a loose doormat, obstacles and shoes in the route, a high threshold, a narrow passage, and an unmarked step.',
      },
      {
        icon: 'kitchen',
        title: 'Kitchen',
        body: 'Wet floors, reach, task lighting, out-of-reach storage, appliance use, and clear work routes.',
        visualKey: 'kitchen-safety',
        alt: 'Kitchen safety risk map highlighting a wet floor, a loose mat, items stored out of reach, poor task lighting, a pan handle facing out, an open drawer, and a visible cable.',
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
        body: 'Works, safety services, or smart setup.',
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
        title: 'Build your plan',
        body: 'Choose rooms and receive recommended improvements.',
        cta: 'Build plan',
        to: '/home-safety-wizard',
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
    statusTitle: 'Cuatro pasos claros',
    statusIntro: 'CasaMia acompaña a la familia desde la primera revisión hasta la acción práctica.',
    statusRows: [
      { label: 'Envía fotos o reserva visita', value: 'Inicio' },
      { label: 'Revisamos los riesgos', value: 'Revisión' },
      { label: 'Recibes un plan claro', value: 'Plan' },
    ],
    statusNote: 'Un solo equipo desde el primer contacto hasta el seguimiento.',
    processEyebrow: 'As\u00ed de f\u00e1cil',
    processTitle: 'Empieza como te resulte m\u00e1s c\u00f3modo.',
    processBody: 'Sube fotos o reserva visita. En ambos casos, llegas a un siguiente paso claro.',
    steps: [
      {
        icon: 'camera',
        title: 'Elige c\u00f3mo empezar',
        body: 'Fotos ahora o visita a domicilio.',
        tag: 'Inicio',
        proof: 'Inicio claro',
        options: [
          {
            title: 'Autoinspecci\u00f3n',
            body: 'Fotos + medidas.',
            note: 'Ruta m\u00e1s r\u00e1pida',
            cta: 'Subir fotos',
            to: '/home-safety-assessment#self-inspection-tool',
          },
          {
            title: 'Visita a domicilio',
            body: 'Medimos por ti.',
            note: '99 EUR descontables',
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
        body: 'CasaMia convierte las prioridades en mejoras seleccionadas, documentaci\u00f3n para ayudas o configuraci\u00f3n smart.',
        tag: 'Plan',
        proof: 'Alcance y paso siguiente',
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
      'Ba\u00f1o, dormitorio, sal\u00f3n, entrada y cocina influyen en la confianza y la seguridad en casa.',
    reviewCta: 'Ver servicios',
    previousRoomLabel: 'Mostrar la estancia anterior',
    nextRoomLabel: 'Mostrar la estancia siguiente',
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
      {
        icon: 'door',
        title: 'Entrada',
        body: 'Umbrales, escalones, iluminaci\u00f3n, apoyos, apertura de la puerta y una ruta despejada.',
        visualKey: 'entrance-safety',
        alt: 'Mapa de seguridad de la entrada que destaca poca luz, un felpudo suelto, obst\u00e1culos y calzado en el paso, un umbral alto, un paso estrecho y un escal\u00f3n sin se\u00f1alizar.',
      },
      {
        icon: 'kitchen',
        title: 'Cocina',
        body: 'Suelos mojados, alcance, luz de trabajo, almacenamiento fuera de alcance, aparatos y rutas despejadas.',
        visualKey: 'kitchen-safety',
        alt: 'Mapa de seguridad de la cocina que destaca un suelo mojado, una alfombra suelta, objetos fuera de alcance, poca luz de trabajo, un mango de sart\u00e9n hacia fuera, un caj\u00f3n abierto y un cable visible.',
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
        title: 'Crear tu plan',
        body: 'Elige estancias y recibe mejoras recomendadas.',
        cta: 'Crear plan',
        to: '/home-safety-wizard',
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
  'entrance-safety': '/images/solutions/entrance-risk-map.png',
  'kitchen-safety': '/images/solutions/kitchen-risk-map.png',
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
  'entrance-safety': [
    { x: 82.0, y: 6.1, w: 12.4 },
    { x: 82.0, y: 27.1, w: 12.4 },
    { x: 8.0, y: 32.3, w: 12.0 },
    { x: 82.0, y: 51.6, w: 12.4 },
    { x: 10.0, y: 18.0, w: 12.5 },
    { x: 82.0, y: 69.8, w: 12.4 },
    { x: 8.0, y: 69.6, w: 12.0 },
    { x: 8.3, y: 84.3, w: 10.3 },
    { x: 8.3, y: 90.0, w: 10.3 },
  ],
  'kitchen-safety': [
    { x: 7.0, y: 43.5, w: 10.8 },
    { x: 7.0, y: 65.6, w: 12.0 },
    { x: 7.0, y: 9.2, w: 12.0 },
    { x: 83.0, y: 11.0, w: 12.0 },
    { x: 86.0, y: 38.6, w: 11.0 },
    { x: 86.0, y: 63.5, w: 11.0 },
    { x: 83.5, y: 84.5, w: 11.5 },
    { x: 8.3, y: 84.7, w: 10.3 },
    { x: 8.3, y: 90.3, w: 10.3 },
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
    'entrance-safety': [
      'Low light',
      'Loose doormat',
      'Obstacle in route',
      'Shoes in route',
      'High threshold',
      'Narrow passage',
      'Unmarked step',
      'High risk',
      'Medium risk',
    ],
    'kitchen-safety': [
      'Wet floor',
      'Loose mat',
      'Items too high',
      'Poor task lighting',
      'Handle facing out',
      'Open drawer',
      'Visible cable',
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
    'entrance-safety': [
      'Poca luz',
      'Felpudo suelto',
      'Obst\u00e1culo en el paso',
      'Calzado en el paso',
      'Umbral alto',
      'Paso estrecho',
      'Escal\u00f3n sin se\u00f1alizar',
      'Riesgo alto',
      'Riesgo medio',
    ],
    'kitchen-safety': [
      'Suelo mojado',
      'Alfombra suelta',
      'Objetos en alto',
      'Poca luz de trabajo',
      'Mango hacia fuera',
      'Caj\u00f3n abierto',
      'Cable visible',
      'Riesgo alto',
      'Riesgo medio',
    ],
  },
}

function getReviewVisual(key: string) {
  return reviewRiskVisuals[key] ?? getVisual(key)
}

const easyStepIcons: LucideIcon[] = [MessageCircle, Home, ClipboardCheck, HeartHandshake]
const serviceChannelIcons: Record<ServiceChannelKey, LucideIcon> = {
  online: MonitorCheck,
  voice: Mic,
  whatsapp: MessageCircle,
  call: PhoneCall,
  email: Mail,
}

function EasyProcessJourney({ copy }: { copy: EasyProcessCopy }) {
  const callHref = CASAMIA_CONTACT_PHONE
    ? `tel:${CASAMIA_CONTACT_PHONE.replaceAll(' ', '')}`
    : null
  const whatsappHref = CASAMIA_WHATSAPP_URL || null

  return (
    <section className="how-easy-process" aria-labelledby="how-easy-process-title">
      <div className="site-shell">
        <header className="how-easy-heading">
          <h2 id="how-easy-process-title">{copy.title}</h2>
          <p>{copy.body}</p>
        </header>

        <div className="how-easy-canvas">
          <figure className="how-easy-human">
            <SafeImage
              alt={copy.humanAlt}
              className="how-easy-human-media"
              imgClassName="how-easy-human-image"
              src="/images/how-it-works-smartphone.jpg"
            />
          </figure>

          <div className="how-easy-journey">
            <nav
              className="how-easy-channel-panel"
              aria-label={`${copy.channelsTitle}. ${copy.channelsBody}`}
            >
              <h3>{copy.channelsTitle}</h3>
              <div className="how-easy-channel-grid">
                {copy.channels.map((channel) => {
                  const Icon = serviceChannelIcons[channel.key]
                  const externalHref = channel.key === 'call'
                    ? callHref
                    : channel.key === 'whatsapp'
                      ? whatsappHref
                      : channel.key === 'email'
                        ? `mailto:${CASAMIA_CONTACT_EMAIL}`
                        : null
                  const content = (
                    <>
                      <span><Icon size={21} aria-hidden="true" /></span>
                      <strong>{channel.title}</strong>
                    </>
                  )

                  return externalHref ? (
                    <a
                      className={`how-easy-channel is-${channel.key}`}
                      href={externalHref}
                      key={channel.key}
                      aria-label={`${channel.title}: ${channel.body}`}
                      target={channel.key === 'whatsapp' ? '_blank' : undefined}
                      rel={channel.key === 'whatsapp' ? 'noopener' : undefined}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      aria-label={`${channel.title}: ${channel.body}`}
                      className={`how-easy-channel is-${channel.key}`}
                      key={channel.key}
                      to="/home-safety-wizard"
                    >
                      {content}
                    </Link>
                  )
                })}
              </div>
            </nav>

            <div className="how-easy-flow-wrap">
              <ol className="how-easy-flow">
                {copy.steps.map((step, index) => {
                  const Icon = easyStepIcons[index] ?? CheckCircle2

                  return (
                    <li className={`how-easy-step is-step-${index + 1}`} key={step.title}>
                      <div className="how-easy-step-marker">
                        <span className="how-easy-icon"><Icon size={25} aria-hidden="true" /></span>
                        <span className="how-easy-number">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <div className="how-easy-step-copy">
                        <h3>{step.title}</h3>
                        <p>{step.body}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
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
  const processCopy = easyProcessCopy[riskLanguage]

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
          step: processCopy.steps.map((step) => ({
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
            <div className="how-hero-outcome">
              <span>{processCopy.heroOutcomeEyebrow}</span>
              <p>{processCopy.heroOutcomeText}</p>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <EasyProcessJourney copy={processCopy} />

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
                        className={`how-review-risk-label ${
                          labelIndex >= activeRiskLabels.length - 2 ? 'is-legend' : ''
                        }`}
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
                  <button type="button" onClick={showPreviousReviewArea} aria-label={copy.previousRoomLabel}>
                    <ArrowLeft size={20} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={showNextReviewArea} aria-label={copy.nextRoomLabel}>
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
