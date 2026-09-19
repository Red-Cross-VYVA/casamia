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
import { useCommercialSettings } from '../context/CommercialSettingsContext'
import { applyCommercialCopy } from '../services/commercialCopy'
import { Link } from 'react-router-dom'

import { SafeImage } from '../components/SafeImage'
import { SEO } from '../components/SEO'
import { TrustBar } from '../components/TrustBar'
import { CASAMIA_CONTACT_EMAIL, CASAMIA_CONTACT_PHONE, buildCasaMiaWhatsappUrl } from '../constants/contact'
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
    title: 'Start with what is easiest today.',
    body: 'A few answers, photos, a voice note or a visit can all lead to the same clear next step.',
    heroOutcomeEyebrow: 'What you receive',
    heroOutcomeText: 'Room priorities, what to fix first, what can wait, and when a visit or quote is needed.',
    channelsTitle: 'Choose how to start',
    channelsBody: 'Use the channel that feels simplest. CasaMia keeps the context together.',
    humanAlt: 'Person smiling while using a smartphone at home',
    channels: [
      { key: 'online', title: 'Online', body: 'Answer guided room questions' },
      { key: 'voice', title: 'Voice', body: 'Talk through the room or routine' },
      { key: 'whatsapp', title: 'WhatsApp', body: 'Send a quick message from your phone' },
      { key: 'call', title: 'Phone', body: 'Call or ask us to call back' },
      { key: 'email', title: 'Email', body: 'hola@casamia.com.es' },
    ],
    steps: [
      {
        title: 'Describe the concern',
        body: 'Tell us which room, route or daily task feels harder or less safe.',
      },
      {
        title: 'We check the risk points',
        body: 'Photos, answers or a visit help us see what is urgent and what needs measuring.',
      },
      {
        title: 'Review the next step',
        body: 'See what to fix first, what can wait, and where a price or home visit is needed.',
      },
      {
        title: 'We confirm and follow up',
        body: 'If work goes ahead, we confirm the scope, check the result and stay available.',
      },
    ],
  },
  es: {
    title: 'Empieza por lo más fácil hoy.',
    body: 'Unas respuestas, fotos, una nota de voz o una visita pueden llevar al mismo siguiente paso claro.',
    heroOutcomeEyebrow: 'Qu\u00e9 recibes',
    heroOutcomeText: 'Prioridades por estancia, qué revisar primero, qué puede esperar y cuándo hace falta visita o presupuesto.',
    channelsTitle: 'Elige tu canal',
    channelsBody: 'Usa el canal que te resulte más sencillo. CasaMia mantiene el contexto unido.',
    humanAlt: 'Persona sonriendo mientras usa su tel\u00e9fono m\u00f3vil en casa',
    channels: [
      { key: 'online', title: 'Online', body: 'Responde preguntas guiadas por estancia' },
      { key: 'voice', title: 'Voz', body: 'Habla de la estancia o rutina' },
      { key: 'whatsapp', title: 'WhatsApp', body: 'Envía un mensaje rápido desde el móvil' },
      { key: 'call', title: 'Tel\u00e9fono', body: 'Llámanos o pide que te llamemos' },
      { key: 'email', title: 'Email', body: 'hola@casamia.com.es' },
    ],
    steps: [
      {
        title: 'Describe la preocupación',
        body: 'Indica qué estancia, ruta o tarea diaria resulta más difícil o menos segura.',
      },
      {
        title: 'Revisamos los puntos de riesgo',
        body: 'Fotos, respuestas o una visita ayudan a ver qué es urgente y qué necesita medida.',
      },
      {
        title: 'Revisa el siguiente paso',
        body: 'Ve qué revisar primero, qué puede esperar y dónde hace falta precio o visita.',
      },
      {
        title: 'Confirmamos y seguimos',
        body: 'Si hay trabajo, confirmamos alcance, comprobamos el resultado y seguimos disponibles.',
      },
    ],
  },
}

const howCopy: Record<'en' | 'es', HowCopy> = {
  en: {
    seoTitle: 'How CasaMia Works',
    seoDescription:
      'See how CasaMia turns questions, photos or a home visit into clear room priorities, practical next steps and a checked safety plan.',
    heroEyebrow: 'From concern to checked plan',
    heroTitle: 'Know what to fix first at home.',
    heroBody:
      'Start with photos, guided questions or a visit. CasaMia helps you separate urgent risks from changes that can wait.',
    primaryCta: 'Start free review',
    secondaryCta: 'Book a visit',
    heroAlt: 'CasaMia home safety worker ready for a home assessment',
    statusTitle: 'Four practical steps',
    statusIntro: 'You choose the starting point. CasaMia turns it into priorities, a clear scope and follow-up.',
    statusRows: [
      { label: 'One call or click', value: 'Start' },
      { label: 'Rooms and routines checked', value: 'Review' },
      { label: 'Next steps agreed before work', value: 'Plan' },
      { label: 'Work checked and explained', value: 'Handover' },
    ],
    statusNote: 'One team from first contact to follow-up.',
    processEyebrow: 'How the review moves forward',
    processTitle: 'Start small. Leave with a clear next step.',
    processBody:
      'Tell us what is happening at home. CasaMia turns the first concern into room priorities, practical options, checks before work starts and follow-up.',
    steps: [
      {
        icon: 'phone',
        title: 'Start by phone, online or photos',
        body: 'Share the room, routine and level of urgency in the way that suits you.',
        tag: 'Start',
        proof: 'Phone or online',
      },
      {
        icon: 'home',
        title: 'We review the real routine',
        body: 'Together, we look at the space, daily movement and the moments that feel least safe.',
        tag: 'Review',
        proof: 'Rooms · routines · risk points',
        options: [
          {
            title: 'Self-inspection',
            body: 'Use photos and simple measurements.',
            note: 'Fastest option',
            cta: 'Upload photos',
            to: '/home-safety-assessment?open=self-inspection#self-inspection-tool',
          },
          {
            title: 'Home visit',
            body: 'We measure and check fit on site.',
            note: '{{visitFee}} deductible',
            cta: 'Book visit',
            to: '/home-safety-assessment?visit=inspector#assessment-form',
          },
        ],
      },
      {
        icon: 'wrench',
        title: 'You approve the scope before work',
        body: 'You see what is included, what needs measuring, what it costs when priced, and what will be checked after.',
        tag: 'Work',
        proof: 'Adaptations · date · final check',
      },
      {
        icon: 'heart',
        title: 'We stay available',
        body: 'After the review or work, we answer questions and update the plan if needs change.',
        tag: 'Follow-up',
        proof: 'Follow-up stays active',
      },
    ],
    reviewEyebrow: 'Room-by-room',
    reviewTitle: 'We check the rooms that shape daily safety.',
    reviewBody:
      'Bathrooms, bedrooms, living areas, entrances and kitchens each create different risks. CasaMia checks them by how they are actually used.',
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
        body: 'Bed access, night movement, bedside reach, and emergency access.',
        visualKey: 'bedroom-safety',
        alt: 'Bedroom routine safety',
      },
      {
        icon: 'monitor',
        title: 'Living areas',
        body: 'Walking space, safer seating, lighting, cables, rugs, and everyday movement.',
        visualKey: 'smart-home-safety',
        alt: 'Living area risk map showing common trip hazards',
      },
      {
        icon: 'door',
        title: 'Entrance',
        body: 'Thresholds, steps, lighting, hand support, door clearance, and safer entry or exit.',
        visualKey: 'entrance-safety',
        alt: 'Entrance safety risk map highlighting low light, a loose doormat, obstacles and shoes in the route, a high threshold, a narrow passage, and an unmarked step.',
      },
      {
        icon: 'kitchen',
        title: 'Kitchen',
        body: 'Wet floors, reach, task lighting, out-of-reach storage, appliance use, and safer work zones.',
        visualKey: 'kitchen-safety',
        alt: 'Kitchen safety risk map highlighting a wet floor, a loose mat, items stored out of reach, poor task lighting, a pan handle facing out, an open drawer, and a visible cable.',
      },
    ],
    deliverablesEyebrow: 'What you get',
    deliverablesTitle: 'You leave knowing what to do next.',
    deliverables: [
      {
        icon: 'file',
        title: 'Safety report',
        body: 'Main risks, limits of the review and what to address first.',
      },
      {
        icon: 'check',
        title: 'Room recommendations',
        body: 'Specific changes by room.',
      },
      {
        icon: 'clipboard',
        title: 'Items to confirm',
        body: 'What needs measuring, fitting checks or a priced scope.',
      },
      {
        icon: 'badge',
        title: 'Grant-readiness notes',
        body: 'Which documents or photos may help if you apply for support.',
      },
    ],
    teamEyebrow: 'What stays organised',
    teamTitle: 'Your notes, visit details and follow-up stay together.',
    teamBody:
      'CasaMia keeps review notes, visit planning, priced scopes, installation status and approved updates together so you do not have to explain everything again.',
    team: [
      {
        icon: 'shield',
        title: 'Safety review',
        body: 'Risk points and daily routine checked.',
      },
      {
        icon: 'wrench',
        title: 'Fitting details',
        body: 'Who comes, what they fit and how the result is checked.',
      },
      {
        icon: 'monitor',
        title: 'Connected support',
        body: 'Alerts, VYVA and approved-contact setup where useful.',
      },
      {
        icon: 'badge',
        title: 'Grant notes',
        body: 'Possible fit, missing documents and next steps.',
      },
    ],
    nextEyebrow: 'Choose your first step',
    nextTitle: 'Start with what you already know.',
    pathways: [
      {
        icon: 'camera',
        title: 'Photo review',
        body: 'First risk notes from uploaded room photos, with limitations clearly stated.',
        cta: 'Upload Photos',
        to: '/#estimate-upload',
      },
      {
        icon: 'home',
        title: 'In-home assessment',
        body: 'For measurements, transfer checks or decisions that need someone on site.',
        cta: 'Book Assessment',
        to: '/home-safety-assessment',
      },
      {
        icon: 'sparkles',
        title: 'Build your plan',
        body: 'Choose rooms and see practical improvements to review.',
        cta: 'Build plan',
        to: '/home-safety-wizard',
      },
      {
        icon: 'monitor',
        title: 'Connected safety',
        body: 'Alerts, sensors, VYVA and approved-contact setup where they add value.',
        cta: 'See connected safety',
        to: '/tech',
      },
    ],
    finalEyebrow: 'Next step',
    finalTitle: 'Start with photos, questions or a visit.',
    finalBody:
      'You do not need to choose a product first. CasaMia starts with the room, routine and risk.',
    finalCta: 'Contact CasaMia',
  },
  es: {
    seoTitle: 'C\u00f3mo funciona CasaMia',
    seoDescription:
      'Descubre c\u00f3mo CasaMia convierte preguntas, fotos o una visita en prioridades por estancia, siguientes pasos claros y un plan de seguridad comprobado.',
    heroEyebrow: 'De la preocupaci\u00f3n al siguiente paso',
    heroTitle: 'Sabe qué revisar primero en casa.',
    heroBody:
      'Empieza con fotos, preguntas guiadas o una visita. CasaMia ayuda a separar riesgos urgentes de cambios que pueden esperar.',
    primaryCta: 'Empezar revisión gratis',
    secondaryCta: 'Reservar visita',
    heroAlt: 'Profesional de CasaMia preparado para una evaluación de seguridad en casa',
    statusTitle: 'Cuatro pasos pr\u00e1cticos',
    statusIntro: 'Tú eliges el punto de partida. CasaMia lo convierte en prioridades, alcance claro y seguimiento.',
    statusRows: [
      { label: 'Envía fotos, responde preguntas o reserva visita', value: 'Inicio' },
      { label: 'Estancias y rutinas revisadas', value: 'Revisión' },
      { label: 'Siguiente paso acordado antes del trabajo', value: 'Plan' },
      { label: 'Trabajo comprobado y explicado', value: 'Entrega' },
    ],
    statusNote: 'Un solo equipo desde el primer contacto hasta el seguimiento.',
    processEyebrow: 'C\u00f3mo avanza la revisi\u00f3n',
    processTitle: 'Empieza pequeño. Sal con un siguiente paso claro.',
    processBody: 'Cuéntanos qué ocurre en casa. CasaMia convierte esa preocupación en prioridades por estancia, opciones prácticas, comprobaciones antes del trabajo y seguimiento.',
    steps: [
      {
        icon: 'camera',
        title: 'Elige cómo empezar',
        body: 'Comparte estancia, rutina y urgencia por el canal que te resulte más cómodo.',
        tag: 'Inicio',
        proof: 'Canal, estancia y urgencia',
        options: [
          {
            title: 'Autoinspecci\u00f3n',
            body: 'Usa fotos y medidas sencillas.',
            note: 'Opci\u00f3n m\u00e1s r\u00e1pida',
            cta: 'Subir fotos',
            to: '/home-safety-assessment?open=self-inspection#self-inspection-tool',
          },
          {
            title: 'Visita a domicilio',
            body: 'Medimos y revisamos el encaje en casa.',
            note: '{{visitFee}} descontables',
            cta: 'Reservar visita',
            to: '/home-safety-assessment?visit=inspector#assessment-form',
          },
        ],
      },
      {
        icon: 'shield',
        title: 'Revisión e informe',
        body: 'Miramos caídas, apoyos, accesos, iluminación, rutinas y emergencias, y mostramos qué va primero.',
        tag: 'Informe',
        proof: 'Riesgos, rutina y prioridades',
      },
      {
        icon: 'clipboard',
        title: 'Plan claro',
        body: 'CasaMia convierte las prioridades en mejoras seleccionadas, documentos para ayudas o soporte conectado cuando aporta valor.',
        tag: 'Plan',
        proof: 'Alcance y siguiente acci\u00f3n',
      },
      {
        icon: 'wrench',
        title: 'Instalación y apoyo',
        body: 'Antes de organizar el trabajo, acuerdas alcance, fecha y detalles de encaje; después se comprueba el resultado y se explica el uso seguro.',
        tag: 'Entrega',
        proof: 'Trabajo explicado con claridad',
      },
    ],
    reviewEyebrow: 'Estancia por estancia',
    reviewTitle: 'Revisamos las estancias que marcan la seguridad diaria.',
    reviewBody:
      'Baño, dormitorio, salón, entrada y cocina crean riesgos distintos. CasaMia los revisa según cómo se usan de verdad.',
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
        body: 'Cama, movimiento nocturno, alcance desde la mesilla y ayuda cercana.',
        visualKey: 'bedroom-safety',
        alt: 'Rutina segura en dormitorio',
      },
      {
        icon: 'monitor',
        title: 'Sal\u00f3n',
        body: 'Zonas de paso, asientos, iluminaci\u00f3n, cables, alfombras y movimiento diario.',
        visualKey: 'smart-home-safety',
        alt: 'Mapa de riesgos del sal\u00f3n con obst\u00e1culos y zonas de paso',
      },
      {
        icon: 'door',
        title: 'Entrada',
        body: 'Umbrales, escalones, iluminaci\u00f3n, apoyos, apertura de la puerta y entrada o salida m\u00e1s segura.',
        visualKey: 'entrance-safety',
        alt: 'Mapa de seguridad de la entrada que destaca poca luz, un felpudo suelto, obst\u00e1culos y calzado en el paso, un umbral alto, un paso estrecho y un escal\u00f3n sin se\u00f1alizar.',
      },
      {
        icon: 'kitchen',
        title: 'Cocina',
        body: 'Suelos mojados, alcance, luz de trabajo, almacenamiento fuera de alcance, aparatos y zonas de trabajo m\u00e1s seguras.',
        visualKey: 'kitchen-safety',
        alt: 'Mapa de seguridad de la cocina que destaca un suelo mojado, una alfombra suelta, objetos fuera de alcance, poca luz de trabajo, un mango de sart\u00e9n hacia fuera, un caj\u00f3n abierto y un cable visible.',
      },
    ],
    deliverablesEyebrow: 'Qu\u00e9 recibes',
    deliverablesTitle: 'Sales sabiendo qué hacer después.',
    deliverables: [
      {
        icon: 'file',
        title: 'Informe',
        body: 'Riesgos, límites de la revisión y qué abordar primero.',
      },
      {
        icon: 'check',
        title: 'Recomendaciones por estancia',
        body: 'Cambios concretos por estancia.',
      },
      {
        icon: 'clipboard',
        title: 'Plan definido',
        body: 'Qué necesita medida, comprobación de encaje o precio.',
      },
      {
        icon: 'badge',
        title: 'Documentos para ayudas',
        body: 'Fotos o documentos que pueden ayudar si solicitas apoyo.',
      },
    ],
    teamEyebrow: 'Qué queda ordenado',
    teamTitle: 'Notas, visita y seguimiento quedan juntos.',
    teamBody:
      'CasaMia mantiene juntas notas, visita, alcance con precio, estado de instalación y actualizaciones autorizadas para que no tengas que explicarlo todo otra vez.',
    team: [
      {
        icon: 'shield',
        title: 'Revisi\u00f3n',
        body: 'Riesgos y rutina diaria revisados.',
      },
      {
        icon: 'wrench',
        title: 'Instalaci\u00f3n',
        body: 'Quién viene, qué se instala y cómo se comprueba.',
      },
      {
        icon: 'monitor',
        title: 'Soporte conectado',
        body: 'Alertas, VYVA y contactos autorizados cuando aporta valor.',
      },
      {
        icon: 'badge',
        title: 'Notas de ayudas',
        body: 'Posible encaje, documentos pendientes y próximos pasos.',
      },
    ],
    nextEyebrow: 'Elige tu primer paso',
    nextTitle: 'Empieza con lo que ya sabes.',
    pathways: [
      {
        icon: 'camera',
        title: 'Revisión con fotos',
        body: 'Primeras notas de riesgo desde fotos, con límites claros.',
        cta: 'Subir fotos',
        to: '/#estimate-upload',
      },
      {
        icon: 'home',
        title: 'Evaluaci\u00f3n en casa',
        body: 'Para medidas, transferencias o decisiones que necesitan ver la casa.',
        cta: 'Reservar',
        to: '/home-safety-assessment',
      },
      {
        icon: 'sparkles',
        title: 'Crear tu plan',
        body: 'Elige estancias y revisa mejoras prácticas.',
        cta: 'Crear plan',
        to: '/home-safety-wizard',
      },
      {
        icon: 'monitor',
        title: 'Seguridad conectada',
        body: 'Alertas, sensores, VYVA y contactos autorizados cuando aportan valor.',
        cta: 'Ver seguridad conectada',
        to: '/tech',
      },
    ],
    finalEyebrow: 'Siguiente paso',
    finalTitle: 'Empieza con fotos, preguntas o una visita.',
    finalBody:
      'No necesitas elegir primero un producto. CasaMia empieza por la estancia, la rutina y el riesgo.',
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
  'bathroom-safety': '/images/solutions/bathroom-risk-map-numbered.png',
  'bedroom-safety': '/images/solutions/bedroom-risk-map-numbered.png',
  'entrance-safety': '/images/solutions/entrance-risk-map-numbered.png',
  'kitchen-safety': '/images/solutions/kitchen-risk-map-numbered.png',
  'smart-home-safety': '/images/solutions/living-risk-map-numbered.png',
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

function EasyProcessJourney({ copy, language }: { copy: EasyProcessCopy; language: string }) {
  const callHref = CASAMIA_CONTACT_PHONE
    ? `tel:${CASAMIA_CONTACT_PHONE.replaceAll(' ', '')}`
    : null
  const whatsappHref = buildCasaMiaWhatsappUrl(
    language.startsWith('es')
      ? 'Hola CasaMia, quiero saber cómo empezar a hacer mi hogar más seguro.'
      : 'Hello CasaMia, I would like to know how to start making my home safer.',
  ) || null

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
  const commercialSettings = useCommercialSettings()
  const copy = applyCommercialCopy(getHowCopy(i18n.language), commercialSettings)
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
              src="/images/solutions/casamia-worker-process-branded.png"
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

      <EasyProcessJourney copy={processCopy} language={i18n.language} />

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
