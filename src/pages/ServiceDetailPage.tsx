import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  HeartPulse,
  Home,
  LayoutDashboard,
  LoaderCircle,
  MessageSquareText,
  MousePointer2,
  Radio,
  Settings2,
  ShieldCheck,
  Stethoscope,
  Wifi,
} from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { LocalizedLink as Link, LocalizedNavigate as Navigate } from '../components/LocalizedLink'

import { PackageDetailModal } from '../components/PackageDetailModal'
import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { ServiceChecklist } from '../components/ServiceChecklist'
import { ServiceIcon } from '../components/ServiceIcon'
import { ServiceItemDetailModal } from '../components/ServiceItemDetailModal'
import { isZoneGalleryRoom, ZoneServiceGallery } from '../components/ZoneServiceGallery'
import { serviceVisuals } from '../constants/serviceVisuals'
import { primaryServices } from '../constants/siteContent'
import { getZoneRiskHotspotStyle, zoneRiskMaps, type ZoneRiskArea, type ZoneRiskMap } from '../constants/zoneRiskMaps'
import { buildPlansBuilderGroups, type PlansBuilderGroup } from '../services/plansBuilderPricing'
import { getMasterServiceCatalogue } from '../services/masterServiceCatalogue'
import { useServiceCatalogue } from '../services/serviceCatalogue'
import { useLocalizedServicesByRoom } from '../services/serviceCatalogueLocalization'
import type { CasaMiaService, ServicePackageArea, ServiceRoom } from '../types/serviceCatalogue'
import '../styles/home-hero-ctas.css'
import '../styles/services-catalogue.css'

const SpecialistVoiceAgentModal = lazy(() =>
  import('../components/SpecialistVoiceAgentModal').then((module) => ({
    default: module.SpecialistVoiceAgentModal,
  })),
)

const detailSteps = [
  {
    icon: ClipboardCheck,
    title: 'In-home review',
    body: 'We look at the room, the person using it, and the daily movement that creates risk.',
  },
  {
    icon: ShieldCheck,
    title: 'Clear priorities',
    body: 'You see which risks matter most and which improvements are practical for the home.',
  },
  {
    icon: Home,
    title: 'Practical next step',
    body: 'If work is needed, CasaMia prepares a proposal around products, installation, and handover.',
  },
]

const detailStepsEs = [
  {
    icon: ClipboardCheck,
    title: 'Revisión en casa',
    body: 'Miramos la estancia, la persona que la usa y los movimientos diarios que generan riesgo.',
  },
  {
    icon: ShieldCheck,
    title: 'Prioridades claras',
    body: 'Ves qué riesgos importan más y qué mejoras son prácticas para la vivienda.',
  },
  {
    icon: Home,
    title: 'Siguiente paso práctico',
    body: 'Si hace falta actuar, CasaMia prepara una propuesta con productos, instalación y entrega.',
  },
]

const smartDetailSteps = [
  {
    icon: ClipboardCheck,
    title: 'Define the use case',
    body: 'Choose the outcome: independence, vitals, reminders, alerts or family view.',
  },
  {
    icon: Settings2,
    title: 'Configure and integrate',
    body: 'CasaMia connects compatible devices, assistant flows, dashboards and permissions.',
  },
  {
    icon: Home,
    title: 'Train and support',
    body: 'We train the senior and family, then adjust the setup as routines change.',
  },
]

const smartDetailStepsEs = [
  {
    icon: ClipboardCheck,
    title: 'Definir el caso de uso',
    body: 'Elige el objetivo: autonomía, constantes, recordatorios, avisos o vista familiar.',
  },
  {
    icon: Settings2,
    title: 'Configurar e integrar',
    body: 'CasaMia conecta dispositivos compatibles, asistente, paneles y permisos.',
  },
  {
    icon: Home,
    title: 'Formar y acompañar',
    body: 'Formamos a la persona y la familia, y ajustamos la configuración cuando cambian rutinas.',
  },
]

const smartHomeSafetyShowcaseCopy = {
  en: {
    eyebrow: 'Smart support at home',
    title: 'Technology that quietly supports daily life.',
    body:
      'CasaMia configures the assistant, health devices, alerts and family view so the home feels easier to manage.',
    platformTitle: 'CasaMia Connect',
    platformBody:
      'One managed setup for the person at home, family visibility and care follow-up.',
    flowKicker: 'How it works',
    flowTitle: 'Signals become useful support.',
    flowBody:
      'CasaMia connects voice, vitals and home signals, then shares only the agreed updates.',
    visualAlt: 'Voice assistant device in a calm bedroom setting',
    homeLabel: 'Senior at home',
    homeMeta: 'Talks, asks, checks in',
    connectLabel: 'CasaMia Connect',
    connectMeta: 'Organises the signals',
    careLabel: 'Family and care',
    careMeta: 'Sees what matters',
    assistantLabel: 'AI assistant',
    dashboardLabel: 'Family view',
    vitalsLabel: 'Vitals',
    privacyLabel: 'Consent-led alerts',
    capabilities: [
      {
        icon: Bot,
        title: 'AI assistant and voice support',
        body: 'Reminders, calls, routines and help requests.',
      },
      {
        icon: HeartPulse,
        title: 'Health and vitals monitoring',
        body: 'Blood pressure, pulse, oxygen, weight or glucose.',
      },
      {
        icon: LayoutDashboard,
        title: 'Family dashboard',
        body: 'Agreed updates, reminders and alerts.',
      },
      {
        icon: Stethoscope,
        title: 'Remote patient management',
        body: 'Readings, escalation and carer follow-up.',
      },
      {
        icon: Radio,
        title: 'Smart-home safety layer',
        body: 'Lighting, doors, water, emergency and routines.',
      },
      {
        icon: Settings2,
        title: 'Configuration and integration',
        body: 'Device setup, app setup, training and support.',
      },
    ],
    outcomes: [
      'More independence',
      'Clearer family reassurance',
      'Better follow-up',
    ],
  },
  es: {
    eyebrow: 'Apoyo inteligente en casa',
    title: 'Tecnología que acompaña la vida diaria.',
    body:
      'CasaMia configura el asistente, dispositivos de salud, avisos y vista familiar para que el hogar sea más fácil de gestionar.',
    platformTitle: 'CasaMia Connect',
    platformBody:
      'Una configuración gestionada para la persona en casa, la familia y el seguimiento cuando procede.',
    flowKicker: 'Cómo funciona',
    flowTitle: 'Las señales se convierten en apoyo útil.',
    flowBody:
      'CasaMia conecta voz, constantes y señales del hogar, y comparte solo los avisos acordados.',
    visualAlt: 'Dispositivo de asistencia por voz en un dormitorio tranquilo',
    homeLabel: 'Persona en casa',
    homeMeta: 'Habla, pregunta, avisa',
    connectLabel: 'CasaMia Connect',
    connectMeta: 'Ordena las señales',
    careLabel: 'Familia y cuidado',
    careMeta: 'Ve lo importante',
    assistantLabel: 'Asistente IA',
    dashboardLabel: 'Vista familiar',
    vitalsLabel: 'Constantes',
    privacyLabel: 'Alertas con consentimiento',
    capabilities: [
      {
        icon: Bot,
        title: 'Asistente de IA y apoyo por voz',
        body: 'Recordatorios, llamadas, rutinas y peticiones de ayuda.',
      },
      {
        icon: HeartPulse,
        title: 'Monitorización de salud y constantes',
        body: 'Tensión, pulso, oxígeno, peso o glucosa.',
      },
      {
        icon: LayoutDashboard,
        title: 'Panel familiar',
        body: 'Actualizaciones, recordatorios y avisos acordados.',
      },
      {
        icon: Stethoscope,
        title: 'Seguimiento remoto del paciente',
        body: 'Lecturas, escalado y seguimiento de cuidadores.',
      },
      {
        icon: Radio,
        title: 'Capa smart-home de seguridad',
        body: 'Luces, puerta, agua, emergencia y rutinas.',
      },
      {
        icon: Settings2,
        title: 'Configuración e integración',
        body: 'Dispositivos, apps, formación y soporte.',
      },
    ],
    outcomes: [
      'Más autonomía',
      'Más tranquilidad familiar',
      'Mejor seguimiento',
    ],
  },
} as const

const smartRemotePatientMonitoringCopy = {
  en: {
    eyebrow: 'Remote patient monitoring',
    title: 'Health follow-up that fits the home.',
    body:
      'CasaMia can configure a remote monitoring pathway around the person: compatible devices, simple reminders, family visibility and escalation rules agreed before anything goes live.',
    visualAlt: 'Connected blood pressure monitor in a home bedroom',
    statLabel: 'Configured readings',
    statValue: 'Vitals + symptoms',
    workflowTitle: 'From reading to response',
    workflow: [
      {
        icon: HeartPulse,
        title: 'Measure what matters',
        body: 'Blood pressure, oxygen, pulse, weight or glucose, selected around the person’s condition and routine.',
      },
      {
        icon: MessageSquareText,
        title: 'Capture daily context',
        body: 'Short check-ins, reminders and symptom questions help explain changes instead of showing numbers alone.',
      },
      {
        icon: LayoutDashboard,
        title: 'See trends and gaps',
        body: 'Family or care teams can see agreed readings, missed measurements and changes that need attention.',
      },
      {
        icon: ShieldCheck,
        title: 'Escalate with consent',
        body: 'Alert thresholds, contacts and handover rules are configured up front to avoid noisy or intrusive monitoring.',
      },
    ],
    focusTitle: 'CasaMia can coordinate',
    focusItems: [
      'Device selection and setup',
      'Patient-friendly reminders',
      'Family dashboard permissions',
      'Missing-reading visibility',
      'Threshold and escalation rules',
      'Care-provider integration support',
    ],
  },
  es: {
    eyebrow: 'Seguimiento remoto',
    title: 'Seguimiento de salud adaptado al hogar.',
    body:
      'CasaMia puede configurar un circuito de seguimiento alrededor de la persona: dispositivos compatibles, recordatorios sencillos, visibilidad familiar y reglas de escalado acordadas antes de activarlo.',
    visualAlt: 'Tensiómetro conectado en un dormitorio de casa',
    statLabel: 'Lecturas configuradas',
    statValue: 'Constantes + síntomas',
    workflowTitle: 'De la lectura a la respuesta',
    workflow: [
      {
        icon: HeartPulse,
        title: 'Medir lo importante',
        body: 'Tensión, oxígeno, pulso, peso o glucosa, elegidos según la situación y la rutina de la persona.',
      },
      {
        icon: MessageSquareText,
        title: 'Añadir contexto diario',
        body: 'Check-ins breves, recordatorios y preguntas de síntomas ayudan a entender cambios, no solo números.',
      },
      {
        icon: LayoutDashboard,
        title: 'Ver tendencias y ausencias',
        body: 'La familia o el equipo de cuidado puede ver lecturas acordadas, mediciones omitidas y cambios relevantes.',
      },
      {
        icon: ShieldCheck,
        title: 'Escalar con consentimiento',
        body: 'Umbrales, contactos y reglas de actuación se configuran antes para evitar avisos ruidosos o invasivos.',
      },
    ],
    focusTitle: 'CasaMia puede coordinar',
    focusItems: [
      'Selección y configuración de dispositivos',
      'Recordatorios fáciles para la persona',
      'Permisos del panel familiar',
      'Visibilidad de lecturas ausentes',
      'Umbrales y reglas de escalado',
      'Soporte de integración con proveedores',
    ],
  },
} as const

const serviceDetailUiCopy = {
  en: {
    explorePackage: (roomLabel: string) => `Explore ${roomLabel} package`,
    orderPackage: (roomLabel: string) => `Order Safer ${roomLabel}`,
    askSafetyExpert: 'Ask the Safety Expert',
    quote: 'Quote',
    checkFirst: 'Check first',
    installed: 'Installed',
    product: 'Product',
    includedWith: 'Included with',
    kitchenEyebrow: 'Kitchen independence',
    kitchenStatsLabel: 'Kitchen safety services summary',
    safetyServices: 'safety services',
    managedInstalls: 'managed installs',
    checkedBeforeInstall: 'checked before install',
    kitchenVisualNote:
      'Built around real kitchen moments: reach, prep, cooking, washing and reassurance.',
    improvedEyebrow: 'What gets improved',
    improvedTitle: 'Choose the improvements that fit.',
    improvedBody:
      'Pick useful services one by one. CasaMia confirms measurements and compatibility before work starts.',
    planEyebrow: 'Your CasaMia plan',
    buildMyPlan: 'Build my plan',
    managedBy: 'Managed by CasaMia',
    startsAt: 'Senior Home Safety Spain',
  },
  es: {
    explorePackage: (roomLabel: string) => `Explorar paquete de ${roomLabel.toLocaleLowerCase('es')}`,
    orderPackage: (roomLabel: string) => `Pedir ${roomLabel.toLocaleLowerCase('es')} más seguro`,
    askSafetyExpert: 'Preguntar al experto en seguridad',
    quote: 'Presupuesto',
    checkFirst: 'Revisar primero',
    installed: 'Instalado',
    product: 'Producto',
    includedWith: 'Incluido con',
    kitchenEyebrow: 'Autonomía en la cocina',
    kitchenStatsLabel: 'Resumen de servicios de seguridad en cocina',
    safetyServices: 'servicios de seguridad',
    managedInstalls: 'instalaciones gestionadas',
    checkedBeforeInstall: 'revisados antes de instalar',
    kitchenVisualNote:
      'Diseñado alrededor de momentos reales de cocina: alcance, preparación, cocción, lavado y tranquilidad.',
    improvedEyebrow: 'Qué se mejora',
    improvedTitle: 'Elige las mejoras que encajan.',
    improvedBody:
      'Selecciona servicios útiles uno a uno. CasaMia confirma medidas y compatibilidad antes de empezar.',
    planEyebrow: 'Tu plan CasaMia',
    buildMyPlan: 'Crear mi plan',
    managedBy: 'Gestionado por CasaMia',
    startsAt: 'Seguridad del hogar senior en España',
  },
} as const

const serviceRoomMap: Record<string, ServiceRoom> = {
  'bathroom-safety': 'bathroom',
  'stair-safety': 'movement',
  'entrance-accessibility': 'entrance',
  'kitchen-safety': 'kitchen',
  'bedroom-safety': 'bedroom',
  'smart-home-safety': 'connected',
}

const servicePackageAreaMap: Partial<Record<string, ServicePackageArea>> = {
  'bathroom-safety': 'bathroom',
  'entrance-accessibility': 'entrance',
  'kitchen-safety': 'kitchen',
  'bedroom-safety': 'bedroom',
}

const primaryServiceCopyEs: Record<string, Partial<typeof primaryServices[number]>> = {
  'bathroom-safety': {
    title: 'Seguridad en el baño para personas mayores',
    shortTitle: 'Seguridad en baño',
    description:
      'Haz el baño más seguro con barras de apoyo, superficies antideslizantes, transferencias más fáciles, iluminación y mejoras de accesibilidad.',
    intro:
      'El baño es una de las estancias más importantes porque el agua, las transferencias y la falta de apoyo aumentan rápido el riesgo de caída.',
    risks: ['Suelos mojados resbaladizos', 'Transferencias difíciles al inodoro', 'Acceso inseguro a la ducha'],
    improvements: ['Barras y puntos de apoyo', 'Suelos y alfombrillas antideslizantes', 'Acceso más seguro a ducha e inodoro'],
  },
  'stair-safety': {
    title: 'Seguridad en escaleras y pasamanos',
    shortTitle: 'Seguridad en escaleras',
    description:
      'Reduce riesgos en escaleras y pasillos con pasamanos continuos, mejor iluminación, bandas de contraste y rutas más seguras.',
    intro:
      'Las escaleras y pasillos deben entenderse de un vistazo, con apoyo fiable desde el primer escalón hasta el último.',
    risks: ['Pasamanos ausentes o interrumpidos', 'Poco contraste en escalones', 'Baja iluminación en descansillos'],
    improvements: ['Apoyo continuo con pasamanos', 'Bordes de escalón más visibles', 'Iluminación con sensor y rutas más seguras'],
  },
  'entrance-accessibility': {
    title: 'Mejoras de accesibilidad en la entrada',
    shortTitle: 'Entradas seguras',
    description:
      'Mejora entradas con umbrales más seguros, rampas cuando encajan, iluminación, puntos de apoyo y rutas de acceso claras.',
    intro:
      'La entrada es donde empieza la independencia diaria. Pequeños cambios pueden hacer más seguro entrar, salir y recibir visitas.',
    risks: ['Umbrales elevados', 'Poca iluminación exterior', 'Apoyo limitado junto a la puerta'],
    improvements: ['Guía sobre umbrales y rampas', 'Iluminación de entrada', 'Puntos de apoyo para equilibrio'],
  },
  'kitchen-safety': {
    title: 'Seguridad en cocina para envejecer en casa',
    shortTitle: 'Seguridad en cocina',
    description:
      'Haz la cocina más cómoda y segura con mejor alcance, rutas despejadas, iluminación, almacenamiento y medidas de seguridad en electrodomésticos.',
    intro:
      'Una cocina más segura mantiene rutinas diarias con menos alcances, flexiones, desorden y riesgo con aparatos.',
    risks: ['Objetos diarios difíciles de alcanzar', 'Rutas de movimiento con obstáculos', 'Poca luz en la zona de trabajo'],
    improvements: ['Almacenamiento y alcance más seguros', 'Circulación más despejada', 'Iluminación y protección de aparatos'],
  },
  'bedroom-safety': {
    title: 'Seguridad en dormitorio para personas mayores',
    shortTitle: 'Seguridad en dormitorio',
    description:
      'Haz el dormitorio más seguro con entradas y salidas de la cama más estables, iluminación nocturna, rutas despejadas, apoyo junto a la cama y ayuda al alcance.',
    intro:
      'El dormitorio debe apoyar descanso y movimiento seguro, especialmente por la noche cuando la poca luz y la urgencia aumentan el riesgo.',
    risks: ['Entrar y salir de la cama cuesta o da inseguridad', 'Rutas nocturnas oscuras', 'Ayuda de emergencia fuera de alcance'],
    improvements: ['Apoyo junto a la cama y altura adecuada', 'Iluminación nocturna con sensor', 'Rutas despejadas y ayuda al alcance'],
  },
  'smart-home-safety': {
    title: 'Tecnología conectada y cuidado digital para personas mayores',
    shortTitle: 'Cuidado conectado',
    description:
      'Configura asistente de IA, constantes, check-ins de síntomas, panel familiar, seguimiento remoto, seguridad inteligente e integraciones para vivir mejor en casa.',
    intro:
      'CasaMia diseña y configura la capa conectada alrededor de la persona: apoyo por voz, lecturas útiles, contexto de síntomas, visibilidad de mediciones ausentes, permisos familiares y reglas de escalado respetuosas con la privacidad.',
    risks: ['Tecnología fragmentada', 'La familia no tiene una visión clara', 'Lecturas, síntomas y señales de seguridad desconectados'],
    improvements: ['Asistente de IA y apoyo por voz', 'Constantes, síntomas y panel familiar', 'Seguimiento remoto e integración smart-home'],
  },
}

const serviceVisualCopyEs: Record<string, { badge: string; note: string }> = {
  'bathroom-safety': {
    badge: 'Estancia con alto riesgo de caída',
    note: 'Transferencias, agua y puntos de apoyo',
  },
  'stair-safety': {
    badge: 'Ruta diaria de movimiento',
    note: 'Pasamanos, contraste e iluminación',
  },
  'entrance-accessibility': {
    badge: 'El acceso empieza fuera',
    note: 'Umbrales, rampas y acceso de visitas',
  },
  'kitchen-safety': {
    badge: 'Rutina y alcance',
    note: 'Alcance, luz, electrodomésticos y agua',
  },
  'bedroom-safety': {
    badge: 'Descanso y rutinas nocturnas',
    note: 'Transferencias, rutas nocturnas y ayuda al alcance',
  },
  'smart-home-safety': {
    badge: 'Cuidado conectado en casa',
    note: 'Asistente IA, constantes y panel familiar',
  },
}

function getLocalizedPrimaryService(service: typeof primaryServices[number], language: string) {
  if (!language.toLowerCase().startsWith('es')) {
    return service
  }

  return {
    ...service,
    ...primaryServiceCopyEs[service.id],
  }
}

function getLocalizedServiceVisual(serviceId: string, language: string) {
  const visual = serviceVisuals[serviceId] ?? serviceVisuals['bathroom-safety']

  if (!language.toLowerCase().startsWith('es')) {
    return visual
  }

  return {
    ...visual,
    ...serviceVisualCopyEs[serviceId],
  }
}

type ServiceDetailContent = {
  benefitsTitle: string
  benefitsIntro: string
  benefits: Array<{
    title: string
    body: string
  }>
  includedTitle: string
  includedIntro: string
  included: string[]
  reassuranceTitle: string
  reassuranceBody: string
  reassurancePoints: string[]
  finalTitle: string
  finalBody: string
}

const defaultServiceDetailContent: ServiceDetailContent = {
  benefitsTitle: 'Make the space easier to use every day.',
  benefitsIntro:
    'CasaMia focuses on practical outcomes: fewer risky movements, clearer support, better visibility, and a home that feels easier for the person living there.',
  benefits: [
    {
      title: 'Less daily hesitation',
      body: 'Reduce the small moments where someone pauses, reaches, twists, or feels unsure about moving through the room.',
    },
    {
      title: 'Clearer support',
      body: 'Place support where it is actually useful for the person, not just where a product happens to fit.',
    },
    {
      title: 'More family confidence',
      body: 'Give relatives a clearer view of what has been checked, what matters most, and what can be improved first.',
    },
  ],
  includedTitle: 'A practical plan, not a generic product list.',
  includedIntro:
    'The visit connects the room layout, daily routine, mobility profile, and installation options before recommending changes.',
  included: [
    'Room and routine review',
    'Risk priorities explained in plain language',
    'Product and installation recommendations where useful',
    'Clear next step for urgent, useful, and optional improvements',
  ],
  reassuranceTitle: 'Designed around the person using the room.',
  reassuranceBody:
    'The goal is not to make the home look clinical. It is to make everyday movement safer while keeping the home comfortable and familiar.',
  reassurancePoints: ['Practical for the existing home', 'Explained for the family', 'Focused on prevention before incidents happen'],
  finalTitle: 'Start with the room that worries you most.',
  finalBody:
    'CasaMia can review this service area alongside the rest of the home, then recommend what should happen first.',
}

const defaultServiceDetailContentEs: ServiceDetailContent = {
  benefitsTitle: 'Haz que el espacio sea más fácil de usar cada día.',
  benefitsIntro:
    'CasaMia se centra en resultados prácticos: menos movimientos de riesgo, apoyo más claro, mejor visibilidad y una vivienda más fácil para quien vive allí.',
  benefits: [
    {
      title: 'Menos dudas diarias',
      body: 'Reduce los momentos en los que alguien se detiene, se estira, gira o no se siente seguro al moverse.',
    },
    {
      title: 'Apoyo más claro',
      body: 'Coloca el apoyo donde realmente sirve para la persona, no solo donde cabe un producto.',
    },
    {
      title: 'Más confianza familiar',
      body: 'La familia entiende qué se ha revisado, qué importa más y qué conviene mejorar primero.',
    },
  ],
  includedTitle: 'Un plan práctico, no una lista genérica de productos.',
  includedIntro:
    'La visita conecta distribución, rutina diaria, movilidad y opciones de instalación antes de recomendar cambios.',
  included: [
    'Revisión de estancia y rutina',
    'Prioridades de riesgo explicadas de forma clara',
    'Recomendaciones de producto e instalación cuando aportan valor',
    'Siguiente paso claro para mejoras urgentes, útiles y opcionales',
  ],
  reassuranceTitle: 'Diseñado alrededor de la persona que usa la estancia.',
  reassuranceBody:
    'El objetivo no es que la vivienda parezca clínica, sino que el movimiento diario sea más seguro manteniendo comodidad y familiaridad.',
  reassurancePoints: ['Práctico para la vivienda actual', 'Explicado para la familia', 'Prevención antes de que ocurra un incidente'],
  finalTitle: 'Empieza por la estancia que más te preocupa.',
  finalBody:
    'CasaMia puede revisar esta zona junto con el resto de la vivienda y recomendar qué debe pasar primero.',
}

const serviceDetailContentEs: Record<string, ServiceDetailContent> = {
  'bathroom-safety': {
    ...defaultServiceDetailContentEs,
    benefitsTitle: 'Convierte una estancia de alto riesgo en una rutina diaria más segura.',
    benefitsIntro:
      'La seguridad en el baño no consiste solo en añadir una barra. CasaMia revisa transferencias, superficies mojadas, alcance, iluminación y cómo se ducha o usa el inodoro la persona.',
    benefits: [
      { title: 'Transferencias más seguras', body: 'Apoyo para entrar en la ducha, sentarse, levantarse y usar el inodoro sin depender de toalleros o muebles.' },
      { title: 'Menos riesgo de resbalón', body: 'Mejor agarre y rutas más claras donde agua, alfombras, umbrales o espacios estrechos crean riesgo.' },
      { title: 'Más privacidad e independencia', body: 'Ayuda a mantener las rutinas de baño con menos asistencia física de familiares o cuidadores.' },
    ],
    includedTitle: 'Qué puede incluir un plan de seguridad de baño.',
    includedIntro: 'CasaMia prioriza las mejoras que más cambian el baño, el aseo y el movimiento seguro en zona húmeda.',
    included: ['Colocación de barras y puntos de apoyo', 'Superficies o tratamientos antideslizantes', 'Entrada de ducha y transferencia al inodoro', 'Iluminación, alcance y orden', 'Asiento de ducha, elevador o cambios de acceso cuando ayudan'],
    finalTitle: 'Haz el baño más seguro antes del próximo susto.',
  },
  'stair-safety': {
    ...defaultServiceDetailContentEs,
    benefitsTitle: 'Haz que cada escalón sea más visible y más fiable.',
    benefitsIntro:
      'La seguridad en escaleras depende de apoyo continuo, bordes visibles, iluminación predecible y reducir prisas o cargas innecesarias.',
    benefits: [
      { title: 'Movimiento más estable', body: 'Mejor apoyo desde el primer escalón hasta el último, sin zonas intermedias sin soporte.' },
      { title: 'Mejor visibilidad', body: 'Contraste e iluminación para entender de un vistazo escalones, descansillos y giros.' },
      { title: 'Menos miedo a usar la casa', body: 'Mantiene accesibles zonas importantes haciendo que escaleras y pasillos se sientan menos arriesgados.' },
    ],
    includedTitle: 'Qué puede incluir un plan de escaleras.',
    includedIntro: 'CasaMia revisa toda la ruta de movimiento, no solo la escalera.',
    included: ['Pasamanos continuos y puntos de apoyo', 'Contraste y agarre en bordes', 'Iluminación con sensor', 'Revisión de obstáculos', 'Recomendaciones de rutina para subir y bajar con más seguridad'],
    finalTitle: 'Haz que las escaleras sean más seguras antes de que se eviten.',
  },
  'entrance-accessibility': {
    ...defaultServiceDetailContentEs,
    benefitsTitle: 'Haz que llegar y salir de casa sea más tranquilo.',
    benefitsIntro:
      'La entrada condiciona la independencia. CasaMia revisa el recorrido desde fuera hasta dentro: escalones, umbrales, luz, apoyo, visitas y rutinas de acceso.',
    benefits: [
      { title: 'Acceso diario más fácil', body: 'Reduce umbrales incómodos, escalones y momentos sin apoyo al entrar o salir.' },
      { title: 'Rutinas de visita más seguras', body: 'Facilita abrir la puerta, recibir entregas o hablar con visitas sin correr.' },
      { title: 'Más confianza fuera de casa', body: 'El primer y último tramo de cada salida se vuelve más predecible.' },
    ],
    includedTitle: 'Qué puede incluir un plan de entrada.',
    includedIntro: 'CasaMia revisa la entrada como una ruta completa, desde la luz exterior hasta el primer punto seguro dentro.',
    included: ['Umbrales, escalones y opciones de rampa', 'Iluminación exterior y de puerta', 'Pasamanos y puntos de apoyo', 'Rutina de llaves, visitas y acceso', 'Timbre o control de acceso cuando ayuda'],
    finalTitle: 'Haz que la entrada sea más fácil de cruzar cada día.',
  },
  'kitchen-safety': {
    ...defaultServiceDetailContentEs,
    benefitsTitle: 'Haz la cocina más segura, fácil y menos cansada.',
    benefitsIntro:
      'CasaMia revisa cómo se usa la cocina y recomienda solo las mejoras que reducen riesgo o esfuerzo diario.',
    benefits: [
      { title: 'Menos esfuerzo', body: 'Objetos, herramientas e iluminación se colocan para cocinar con menos alcance, flexión y carga.' },
      { title: 'Menos momentos de riesgo', body: 'Reducimos desencadenantes habituales: suelos mojados, cables, giros, poca luz y encimeras saturadas.' },
      { title: 'Más tranquilidad', body: 'Sensores, temporizadores, enchufes inteligentes y apagado opcional ayudan a la familia después de cocinar.' },
    ],
    includedTitle: 'Crea tu plan de cocina desde servicios individuales.',
    includedIntro: 'Selecciona mejoras útiles, revisa una estimación y decide si subir fotos o reservar una visita.',
    included: ['Zonas antideslizantes de preparación', 'Utensilios de agarre fácil y menaje ligero', 'Iluminación de encimera, voz y temporizadores', 'Enchufes inteligentes, sensores de fuga, gas o CO', 'Estante abatible, apagado automático o grifo sin contacto si procede'],
    finalTitle: 'Mantén la cocina posible, segura y tranquila.',
  },
  'bedroom-safety': {
    ...defaultServiceDetailContentEs,
    benefitsTitle: 'Haz que las noches sean más tranquilas y seguras.',
    benefitsIntro:
      'Muchas situaciones de riesgo ocurren con sueño, poca luz o prisa por llegar al baño. CasaMia diseña el dormitorio alrededor de cama, ruta nocturna y ayuda al alcance.',
    benefits: [
      { title: 'Entrar y salir de la cama con más seguridad', body: 'Mejor altura, espacio, apoyo junto a la cama y ayudas cuando hacen falta.' },
      { title: 'Movimiento nocturno más seguro', body: 'Iluminación con sensor, rutas despejadas y menos desorientación.' },
      { title: 'Ayuda al alcance', body: 'Botón, teléfono, wearable o aviso conectado donde pueda usarse en el momento.' },
    ],
    includedTitle: 'Qué puede incluir un plan de dormitorio.',
    includedIntro: 'CasaMia revisa la rutina nocturna completa: cama, luz, muebles, suelo, medicación y ruta a la siguiente estancia.',
    included: ['Altura de cama y apoyo junto a la cama', 'Iluminación nocturna de cama a puerta o baño', 'Espacio libre alrededor de muebles, alfombras y cables', 'Botón de emergencia, teléfono o alerta wearable', 'Elementos diarios al alcance seguro'],
    finalTitle: 'Haz el dormitorio más seguro antes de que la noche preocupe.',
  },
  'smart-home-safety': {
    ...defaultServiceDetailContentEs,
    benefitsTitle: 'Tecnología que ayuda a vivir mejor, no solo a vigilar.',
    benefitsIntro:
      'CasaMia combina asistente de IA, dispositivos de salud, automatización sencilla y visibilidad familiar para que la persona disfrute más de su casa con menos fricción diaria.',
    benefits: [
      { title: 'Más autonomía cotidiana', body: 'Voz, recordatorios, rutinas y controles sencillos ayudan a pedir apoyo, gestionar luces, llamadas o tareas sin pelearse con apps complejas.' },
      { title: 'Más contexto para la familia', body: 'El panel familiar puede mostrar señales acordadas, lecturas y avisos sin convertir la casa en vigilancia constante.' },
      { title: 'Mejor seguimiento cuando importa', body: 'Constantes, alertas y escalado pueden organizarse para cuidadores o profesionales cuando el caso lo necesita.' },
    ],
    includedTitle: 'Qué puede incluir una solución conectada CasaMia.',
    includedIntro: 'Revisamos la vivienda, la conectividad, las preferencias de privacidad, los dispositivos existentes y el flujo familiar o asistencial antes de configurar nada.',
    included: ['Asistente de IA y comandos de voz útiles', 'Dispositivos compatibles de salud y constantes', 'Panel familiar y permisos por rol', 'Sensores, iluminación, puerta, agua y alertas de emergencia', 'Seguimiento remoto o coordinación con cuidadores cuando procede', 'Configuración, integración, formación y soporte posterior'],
    reassuranceTitle: 'Privacidad, consentimiento y sencillez primero.',
    reassuranceBody:
      'La tecnología solo ayuda si la persona la acepta y la familia entiende qué hace. CasaMia evita cámaras por defecto, acuerda avisos y deja instrucciones claras.',
    reassurancePoints: ['Sin vigilancia intrusiva por defecto', 'Permisos y alertas acordados', 'Instalación, formación y soporte incluidos'],
    finalTitle: 'Convierte la casa en un entorno conectado, útil y humano.',
    finalBody:
      'Cuéntanos qué quieres conseguir: más autonomía, mejor seguimiento de salud, panel familiar, asistente de IA o integración con sistemas existentes. CasaMia definirá una solución conectada práctica.',
  },
}

const serviceDetailContent: Record<string, ServiceDetailContent> = {
  'bathroom-safety': {
    benefitsTitle: 'Turn a high-risk room into a safer daily routine.',
    benefitsIntro:
      'Bathroom safety is about more than adding a rail. CasaMia looks at transfers, wet surfaces, reach, lighting, and the way the person actually bathes, showers, and uses the toilet.',
    benefits: [
      {
        title: 'Safer transfers',
        body: 'Support entering the shower, standing, sitting, and using the toilet without relying on towel rails or furniture.',
      },
      {
        title: 'Lower slip risk',
        body: 'Improve traction and route clarity where water, mats, thresholds, and tight layouts create avoidable risk.',
      },
      {
        title: 'More privacy and independence',
        body: 'Help the person keep bathroom routines manageable with less physical help from family or caregivers.',
      },
    ],
    includedTitle: 'What a bathroom safety plan can include.',
    includedIntro:
      'CasaMia prioritises the improvements that make the biggest difference for bathing, toileting, and moving safely in a wet room.',
    included: [
      'Grab bar and support-point placement',
      'Anti-slip surfaces, mats, or flooring guidance',
      'Safer shower entry and toilet transfer recommendations',
      'Lighting, reach, and clutter review',
      'Optional shower seat, raised toilet, or access changes where useful',
    ],
    reassuranceTitle: 'Better support without making the bathroom feel institutional.',
    reassuranceBody:
      'We recommend discreet, practical changes that fit the room and the person using it, then explain what is urgent and what can wait.',
    reassurancePoints: ['Focus on wet-room fall risk', 'Recommendations matched to mobility', 'Installation guidance before buying products'],
    finalTitle: 'Make the bathroom safer before the next near miss.',
    finalBody:
      'Book a visit and CasaMia will review transfers, surfaces, support points, and practical improvements room by room.',
  },
  'stair-safety': {
    benefitsTitle: 'Make every step easier to read and easier to trust.',
    benefitsIntro:
      'Stair safety depends on continuous support, visible edges, predictable lighting, and reducing the need to rush or carry too much.',
    benefits: [
      {
        title: 'More stable movement',
        body: 'Improve hand support from the first step to the last so the person is not left unsupported mid-route.',
      },
      {
        title: 'Better visibility',
        body: 'Use contrast and lighting to make step edges, landings, and turns easier to understand at a glance.',
      },
      {
        title: 'Less fear of using the home',
        body: 'Keep important rooms accessible by making stairs and hallways feel less risky during daily routines.',
      },
    ],
    includedTitle: 'What a stair safety plan can include.',
    includedIntro:
      'CasaMia checks the whole movement route, not just the staircase itself.',
    included: [
      'Continuous handrail and grab-point review',
      'Step-edge contrast and anti-slip guidance',
      'Motion lighting for stairs, halls, and landings',
      'Trip hazard and clutter review',
      'Recommendations for safer carrying and daily movement routines',
    ],
    reassuranceTitle: 'Small changes can protect an important route.',
    reassuranceBody:
      'When stairs feel unsafe, whole parts of the home can become harder to use. CasaMia focuses on keeping movement routes clear, visible, and supported.',
    reassurancePoints: ['Support along the full route', 'Clearer step edges', 'Lighting where hesitation happens'],
    finalTitle: 'Make stairs feel safer before they become avoided.',
    finalBody:
      'Book a visit and CasaMia will review rails, lighting, contrast, and the full route used every day.',
  },
  'entrance-accessibility': {
    benefitsTitle: 'Make arriving and leaving the home calmer.',
    benefitsIntro:
      'Entrance safety shapes independence. CasaMia checks the path from outside to inside, including steps, thresholds, lighting, support, visitors, and access routines.',
    benefits: [
      {
        title: 'Easier daily access',
        body: 'Reduce awkward thresholds, steps, and unsupported moments when entering or leaving the home.',
      },
      {
        title: 'Safer visitor routines',
        body: 'Make it easier to open the door, receive deliveries, or speak with visitors without rushing.',
      },
      {
        title: 'More confidence outside the home',
        body: 'Support independence by making the first and last part of every outing more predictable.',
      },
    ],
    includedTitle: 'What an entrance safety plan can include.',
    includedIntro:
      'CasaMia reviews the entrance as a route, from exterior lighting through the doorway and into the first safe standing area.',
    included: [
      'Threshold, step, and ramp suitability review',
      'Exterior and doorway lighting guidance',
      'Support-point and handrail recommendations',
      'Door access, visitor, and key routine review',
      'Smart doorbell or access control guidance where useful',
    ],
    reassuranceTitle: 'The entrance should support independence, not create stress.',
    reassuranceBody:
      'We focus on practical access improvements that fit the home, the person, and the way family or caregivers visit.',
    reassurancePoints: ['Safer thresholds', 'Better doorway support', 'Clearer access routines'],
    finalTitle: 'Make the entrance easier to cross every day.',
    finalBody:
      'Book a visit and CasaMia will review thresholds, lighting, support, and access options together.',
  },
  'kitchen-safety': {
    benefitsTitle: 'Make the kitchen safer, easier and less tiring.',
    benefitsIntro:
      'CasaMia reviews how the kitchen is used, then recommends only the improvements that reduce daily risk or effort.',
    benefits: [
      {
        title: 'Less effort',
        body: 'Daily items, tools, and lighting are arranged so cooking requires less reaching, bending, and lifting.',
      },
      {
        title: 'Fewer risky moments',
        body: 'We reduce common triggers: wet floors, trailing cables, awkward turns, poor light, and cluttered worktops.',
      },
      {
        title: 'More reassurance',
        body: 'Sensors, timers, smart plugs, and optional shut-off support help family feel confident after cooking.',
      },
    ],
    includedTitle: 'Build your kitchen plan from individual services.',
    includedIntro:
      'Select the useful improvements, see an estimate, then decide whether to upload photos or book a visit.',
    included: [
      'Non-slip preparation and anti-fatigue standing zones',
      'Easy-grip utensils, openers, and lightweight cookware',
      'Improved worktop lighting, voice lighting, and timers',
      'Selected smart plugs plus leak and gas or carbon-monoxide sensors',
      'Optional pull-down shelf, automatic stove shut-off, or touchless faucet where needed',
    ],
    reassuranceTitle: "A safer kitchen should still feel like the person's kitchen.",
    reassuranceBody:
      'We keep familiar routines where possible, choose what helps, coordinate installation, and explain the setup clearly.',
    reassurancePoints: ['Daily items within safer reach', 'Clearer work and walking zones', 'Installation and handover managed'],
    finalTitle: 'Keep cooking possible, safer, and calmer.',
    finalBody:
      'Book a visit and CasaMia will review reach, lighting, appliances, water risk, and the practical kitchen plan that fits the home.',
  },
  'bedroom-safety': {
    benefitsTitle: 'Make nights calmer, safer, and easier to manage.',
    benefitsIntro:
      'Bedroom safety matters because many risky moments happen when someone is tired, moving in low light, or trying to reach the bathroom quickly. CasaMia designs the room around safer bed access, clearer night routes, and help within reach.',
    benefits: [
      {
        title: 'Getting in and out of bed',
        body: 'Support the first movement of the day with the right bed height, clearance, bedside support, and practical aids where needed.',
      },
      {
        title: 'Safer night movement',
        body: 'Reduce disorientation with motion lighting, clear floor paths, and safer routes from bed to bathroom or hallway.',
      },
      {
        title: 'Help within reach',
        body: 'Position emergency buttons, phone access, wearable support, or connected alerts so urgent help is not across the room.',
      },
    ],
    includedTitle: 'What a bedroom safety plan can include.',
    includedIntro:
      'CasaMia reviews the room as a night-time routine: bed access, lighting, furniture, flooring, medication reach, and the path to the next room.',
    included: [
      'Bed height, bedside support, and first-step review',
      'Motion night lighting from bed to door or bathroom',
      'Clearance around furniture, rugs, cables, and walking aids',
      'Bedside emergency button, phone, or wearable alert placement',
      'Medication, water, glasses, and daily essentials within safer reach',
      'Optional smart sensor or VYVA alert support where appropriate',
    ],
    reassuranceTitle: 'Designed for independence and family peace of mind.',
    reassuranceBody:
      'The bedroom should help someone rest, move, and call for help without turning the room into a clinical space. CasaMia keeps the focus on comfort, dignity, and practical prevention.',
    reassurancePoints: [
      'Less risk during night bathroom trips',
      'More confidence getting in and out of bed',
      'Clearer emergency access for family or caregivers',
    ],
    finalTitle: 'Make the bedroom safer before night routines become stressful.',
    finalBody:
      'Book a visit and CasaMia will review bed access, lighting, floor clearance, and emergency reach points.',
  },
  'smart-home-safety': {
    benefitsTitle: 'Technology that helps seniors live better, not just be monitored.',
    benefitsIntro:
      'CasaMia combines AI assistance, health devices, simple automation and family visibility so the person can enjoy home with less friction and more confidence.',
    benefits: [
      {
        title: 'More everyday independence',
        body: 'Voice support, reminders, routines and simple controls help with calls, lights, questions and tasks without asking the person to manage complex apps.',
      },
      {
        title: 'Better family context',
        body: 'A family dashboard can show agreed readings, reminders and alerts without turning the home into constant surveillance.',
      },
      {
        title: 'Clearer follow-up when it matters',
        body: 'Vitals, safety signals and escalation paths can be structured for carers or professionals when the situation calls for it.',
      },
    ],
    includedTitle: 'What a CasaMia connected solution can include.',
    includedIntro:
      'We review the home, connectivity, privacy preferences, existing devices and the family or care workflow before configuring anything.',
    included: [
      'AI assistant and useful voice commands',
      'Compatible health and vitals devices',
      'Family dashboard and role-based permissions',
      'Sensors, lighting, door awareness, water and emergency alerts',
      'Remote patient management or carer coordination where suitable',
      'Configuration, integration, training and aftercare',
    ],
    reassuranceTitle: 'Privacy, consent and simplicity come first.',
    reassuranceBody:
      'Technology only helps when the person accepts it and the family understands it. CasaMia avoids cameras by default, agrees alert rules and leaves a clear handover.',
    reassurancePoints: ['No intrusive monitoring by default', 'Permissions and alerts agreed first', 'Installation, training and support included'],
    finalTitle: 'Turn the home into a connected, useful and human support environment.',
    finalBody:
      'Tell us what you want to achieve: more independence, better health follow-up, a family dashboard, an AI assistant or integration with existing systems. CasaMia will scope a practical connected solution.',
  },
}

const plansPath = '/plans'

const orderRoomLabels = {
  en: {
    bathroom: 'Bathroom',
    bedroom: 'Bedroom',
    connected: 'Smart Safety',
    entrance: 'Entrance',
    kitchen: 'Kitchen',
    'living-room': 'Living Room',
    movement: 'Stairs',
  },
  es: {
    bathroom: 'baño',
    bedroom: 'dormitorio',
    connected: 'seguridad conectada',
    entrance: 'entrada',
    kitchen: 'cocina',
    'living-room': 'salón',
    movement: 'escaleras',
  },
} satisfies Record<'en' | 'es', Record<ServiceRoom, string>>

function getOrderRoomLabel(room: ServiceRoom, language: string) {
  return language.toLowerCase().startsWith('es')
    ? orderRoomLabels.es[room]
    : orderRoomLabels.en[room]
}

function isZoneRiskArea(value: ServiceRoom): value is ZoneRiskArea {
  return Object.prototype.hasOwnProperty.call(zoneRiskMaps, value)
}

function groupServicesByCategory(services: CasaMiaService[]) {
  const groups = new Map<string, CasaMiaService[]>()

  services.forEach((service) => {
    const group = groups.get(service.category) ?? []
    groups.set(service.category, [...group, service])
  })

  return Array.from(groups, ([category, groupedServices]) => ({
    category,
    services: groupedServices,
  }))
}

function ServiceItemGrid({ language, services }: { language: string; services: CasaMiaService[] }) {
  const copy = language.toLowerCase().startsWith('es') ? serviceDetailUiCopy.es : serviceDetailUiCopy.en
  const viewDetailsLabel = language.toLowerCase().startsWith('es') ? 'Ver detalles' : 'View details'
  const [activeService, setActiveService] = useState<CasaMiaService | null>(null)

  return (
    <>
      <div className="service-kitchen-component-grid is-itemised">
        {services.map((item) => (
          <article key={item.id}>
            <div className="service-kitchen-component-copy">
              <div className="service-kitchen-component-topline">
                <span>{item.category}</span>
              </div>
              <h3>{item.name}</h3>
              <p>{item.shortDescription}</p>
            </div>
            <div className="service-kitchen-component-details">
              <p className="service-kitchen-component-benefit">
                <CheckCircle2 size={17} aria-hidden="true" />
                {item.customerBenefit}
              </p>
              {item.includedItems && item.includedItems.length > 0 ? (
                <ul className="service-kitchen-component-inclusions" aria-label={`${copy.includedWith} ${item.name}`}>
                  {item.includedItems.slice(0, 3).map((includedItem) => (
                    <li key={includedItem}>{includedItem}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="service-kitchen-component-actions">
              <button className="catalogue-item-detail-button" type="button" onClick={() => setActiveService(item)}>
                {viewDetailsLabel}
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
      <ServiceItemDetailModal
        language={language}
        onClose={() => setActiveService(null)}
        service={activeService}
      />
    </>
  )
}

function RoomServiceItemsSection({
  ctaPath = plansPath,
  language,
  orderCtaLabel,
  room,
  services,
}: {
  ctaPath?: string
  language: string
  orderCtaLabel: string
  room: ServiceRoom
  services: CasaMiaService[]
}) {
  if (services.length === 0) {
    return null
  }

  return (
    <section className="service-detail-section bg-white">
      <div className="site-shell">
        {isZoneGalleryRoom(room) ? (
          <ZoneServiceGallery
            language={language}
            room={room}
            services={services}
          />
        ) : (
          <ServiceItemGrid language={language} services={services} />
        )}

        <div className="service-detail-actions service-detail-inline-actions">
          <Link className="btn btn-navy" to={ctaPath}>
            {orderCtaLabel}
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function KitchenSafetyShowcase({
  detail,
  hideStory = false,
  kitchenServices,
  language,
}: {
  detail: ServiceDetailContent
  hideStory?: boolean
  kitchenServices: CasaMiaService[]
  language: string
}) {
  const isSpanish = language.toLowerCase().startsWith('es')
  const uiCopy = isSpanish ? serviceDetailUiCopy.es : serviceDetailUiCopy.en
  const installCount = kitchenServices.filter((service) => service.requiresInstallation).length
  const siteCheckCount = kitchenServices.filter(
    (service) => service.requiresMeasurement || service.requiresSiteVisit || service.requiresCompatibilityCheck,
  ).length
  const groupedServices = groupServicesByCategory(kitchenServices)

  return (
    <>
      {hideStory ? null : (
      <section className="service-detail-section service-kitchen-story bg-white">
        <div className="site-shell">
          <div className="service-kitchen-story-grid">
            <div className="service-detail-heading">
              <p className="eyebrow">{uiCopy.kitchenEyebrow}</p>
              <h2>{detail.benefitsTitle}</h2>
              <p>{detail.benefitsIntro}</p>
              <div className="service-kitchen-stats" aria-label={uiCopy.kitchenStatsLabel}>
                <article>
                  <strong>{kitchenServices.length}</strong>
                  <span>{uiCopy.safetyServices}</span>
                </article>
                <article>
                  <strong>{installCount}</strong>
                  <span>{uiCopy.managedInstalls}</span>
                </article>
                <article>
                  <strong>{siteCheckCount}</strong>
                  <span>{uiCopy.checkedBeforeInstall}</span>
                </article>
              </div>
            </div>

            <div className="service-kitchen-visual-card">
              <SafeImage
                alt={isSpanish
                  ? 'Mapa visual de cocina con riesgos cotidianos señalados'
                  : 'Annotated kitchen risk map showing everyday safety points'}
                className="service-kitchen-routine-visual"
                imgClassName="service-kitchen-risk-map"
                src="/images/solutions/kitchen-risk-map-numbered.png"
              />
              <div className="service-kitchen-visual-note">
                <span>
                  <CheckCircle2 size={19} aria-hidden="true" />
                </span>
                <p>{uiCopy.kitchenVisualNote}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      )}

      <section className="service-detail-section bg-pale-blue">
        <div className="site-shell">
          <div className="service-detail-heading">
            <p className="eyebrow">{uiCopy.improvedEyebrow}</p>
            <h2>{uiCopy.improvedTitle}</h2>
            <p>{uiCopy.improvedBody}</p>
          </div>

          <ZoneServiceGallery
            language={language}
            room="kitchen"
            services={kitchenServices}
          />
        </div>
      </section>

      <section className="service-detail-section bg-white">
        <div className="site-shell">
          <div className="service-kitchen-selection-panel">
            <div className="service-kitchen-selection-copy">
              <p className="eyebrow">{uiCopy.planEyebrow}</p>
              <h2>{detail.includedTitle}</h2>
              <p>{detail.includedIntro}</p>
              <Link className="btn btn-navy" to="/home-safety-wizard">
                {uiCopy.buildMyPlan}
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
            </div>

            <div className="service-kitchen-selection-lists">
              {groupedServices.map((group) => (
                <article key={group.category}>
                  <h3>{group.category}</h3>
                  <div className="service-kitchen-pill-list">
                    {group.services.map((item) => (
                      <span key={item.id}>{item.name}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="service-detail-reassurance-card service-kitchen-reassurance">
            <div>
              <p className="eyebrow">{uiCopy.managedBy}</p>
              <h3>{detail.reassuranceTitle}</h3>
              <p>{detail.reassuranceBody}</p>
            </div>
            <ServiceChecklist items={detail.reassurancePoints} />
          </div>
        </div>
      </section>
    </>
  )
}

function ServiceZoneRiskMapSection({ language, riskMap }: { language: 'en' | 'es'; riskMap: ZoneRiskMap }) {
  const copy = riskMap.copy[language]
  const headingId = `service-detail-zone-risk-${copy.eyebrow.replace(/\W+/g, '-').toLowerCase()}`
  const [activeRiskId, setActiveRiskId] = useState<string | null>(null)
  const panelTitle = language === 'es' ? 'Puntos que revisamos' : 'Risk points we review'
  const panelBody = language === 'es'
    ? 'Cada número del mapa corresponde a una fila con la recomendación vinculada.'
    : 'Each number on the map matches a row with the linked recommendation.'
  const panelKicker = language === 'es' ? 'Mapa interactivo' : 'Interactive map'
  const riskItems = copy.risks.map((risk, index) => ({
    id: `${headingId}-risk-${index + 1}`,
    label: risk,
    number: index + 1,
    detail: copy.riskDetails?.[index],
    position: riskMap.labelPositions[index],
  }))
  const legendItems = copy.legend.map((label, index) => ({
    label,
    position: riskMap.labelPositions[copy.risks.length + index],
  }))
  const hasMapLabels = riskItems.some((item) => item.position) || legendItems.some((item) => item.position)
  const interactionHint = language === 'es' ? 'Pasa o toca' : 'Hover or tap'

  return (
    <section className="service-detail-section service-detail-zone-risk-section bg-white" aria-labelledby={headingId}>
      <div className="site-shell">
        <div className="services-zone-risk">
          <header className="services-zone-risk-head">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 id={headingId}>{copy.title}</h2>
            <p>{copy.body}</p>
          </header>
          <div className="services-zone-risk-body">
            <div className="services-zone-risk-stage">
              <SafeImage
                alt={copy.imageAlt}
                className="services-zone-risk-media"
                imgClassName="services-zone-risk-image"
                src={riskMap.image}
              />
              {hasMapLabels ? (
                <span className="services-zone-risk-hint" aria-hidden="true">
                  <MousePointer2 size={14} strokeWidth={2.4} />
                  {interactionHint}
                </span>
              ) : null}
              {hasMapLabels ? (
                <div className="services-zone-risk-labels">
                  {riskItems.map((item) => {
                    if (!item.position) return null

                    const isActive = activeRiskId === item.id
                    const detailSide = item.position.detailSide ?? 'opens-up'
                    const detailId = item.detail
                      ? `service-detail-zone-risk-note-${item.id}`
                      : undefined

                    if (item.detail && detailId) {
                      return (
                        <span
                          className={`services-zone-risk-hotspot${isActive ? ' is-active' : ''}`}
                          key={item.id}
                          onMouseEnter={() => setActiveRiskId(item.id)}
                          onMouseLeave={() => setActiveRiskId((current) => current === item.id ? null : current)}
                          style={getZoneRiskHotspotStyle(item.position)}
                        >
                          <button
                            aria-describedby={detailId}
                            aria-label={item.label}
                            className={`services-zone-risk-label has-detail ${detailSide}${isActive ? ' is-active' : ''}`}
                            onBlur={() => setActiveRiskId((current) => current === item.id ? null : current)}
                            onClick={() => setActiveRiskId((current) => current === item.id ? null : item.id)}
                            onFocus={() => setActiveRiskId(item.id)}
                            type="button"
                          >
                            <span aria-hidden="true" />
                          </button>
                          <aside className={`services-zone-risk-detail ${detailSide}`} id={detailId}>
                            <strong>{item.detail.solution}</strong>
                            <p>{item.detail.helps}</p>
                            {item.detail.product ? <small>{item.detail.product}</small> : null}
                            {item.detail.stat ? <em>{item.detail.stat}</em> : null}
                          </aside>
                        </span>
                      )
                    }

                    return (
                      <span
                        className="services-zone-risk-label"
                        key={item.id}
                        style={{
                          height: `${item.position.h}%`,
                          left: `${item.position.x}%`,
                          top: `${item.position.y}%`,
                          width: `${item.position.w}%`,
                        }}
                      >
                        <span aria-hidden="true" />
                      </span>
                    )
                  })}
                  {legendItems.map((item, index) => {
                    if (!item.position) return null

                    return (
                      <span
                        aria-hidden="true"
                        className="services-zone-risk-label is-legend"
                        key={`${item.label}-${index}`}
                        style={{
                          height: `${item.position.h}%`,
                          left: `${item.position.x}%`,
                          top: `${item.position.y}%`,
                          width: `${item.position.w}%`,
                        }}
                      >
                        {item.label}
                      </span>
                    )
                  })}
                </div>
              ) : null}
            </div>
            <aside className="services-zone-risk-copy" aria-label={panelTitle}>
              <div className="services-zone-risk-panel-head">
                <span>{panelKicker}</span>
                <h3>{panelTitle}</h3>
                <p>{panelBody}</p>
              </div>
              <ul className="services-zone-risk-list">
                {riskItems.map((item) => (
                  <li
                    className={activeRiskId === item.id ? 'is-active' : undefined}
                    key={item.id}
                    onMouseEnter={() => setActiveRiskId(item.id)}
                    onMouseLeave={() => setActiveRiskId((current) => current === item.id ? null : current)}
                  >
                    <button
                      aria-label={item.detail ? `${item.label}: ${item.detail.solution}` : item.label}
                      className="services-zone-risk-list-button"
                      onBlur={() => setActiveRiskId((current) => current === item.id ? null : current)}
                      onClick={() => setActiveRiskId((current) => current === item.id ? null : item.id)}
                      onFocus={() => setActiveRiskId(item.id)}
                      type="button"
                    >
                      <span className="services-zone-risk-list-number" aria-hidden="true">{item.number}</span>
                      <span>
                        <strong>{item.label}</strong>
                        {item.detail ? <small>{item.detail.solution}</small> : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}

function SmartHomeSafetyHeroVisual({ image, language }: { image: string; language: string }) {
  const alt = language.toLowerCase().startsWith('es')
    ? 'Persona mayor en casa con señales de constantes y cuidado conectado'
    : 'Older adult at home with vitals and connected-care signals'

  return (
    <aside className="service-smart-hero-visual">
      <SafeImage
        src={image}
        alt={alt}
        className="service-smart-hero-photo"
        imgClassName="h-full w-full object-cover"
      />
    </aside>
  )
}

function SmartHomeSafetyShowcase({ language }: { language: string }) {
  const copy = language.toLowerCase().startsWith('es')
    ? smartHomeSafetyShowcaseCopy.es
    : smartHomeSafetyShowcaseCopy.en

  return (
    <section className="service-detail-section service-smart-showcase bg-white" id="connected-care-stack">
      <div className="site-shell">
        <div className="service-smart-showcase-grid">
          <div className="service-smart-showcase-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
            <p>{copy.body}</p>
            <ul className="service-smart-outcome-list">
              {copy.outcomes.map((outcome) => (
                <li key={outcome}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="service-smart-platform-card" aria-label={copy.platformTitle}>
            <div className="service-smart-platform-head">
              <span>
                <Wifi size={18} aria-hidden="true" />
              </span>
              <div>
                <strong>{copy.platformTitle}</strong>
                <p>{copy.platformBody}</p>
              </div>
            </div>

            <div className="service-smart-care-visual" aria-label={copy.platformTitle}>
              <div className="service-smart-care-media">
                <SafeImage
                  src="/images/service-gallery/11-voice-controls-and-smart-routines.jpg"
                  alt={copy.visualAlt}
                  className="service-smart-care-photo"
                  imgClassName="h-full w-full object-cover"
                />
                <div className="service-smart-care-story">
                  <span>{copy.flowKicker}</span>
                  <strong>{copy.flowTitle}</strong>
                  <p>{copy.flowBody}</p>
                </div>
              </div>

              <div className="service-smart-care-panel">
                <div className="service-smart-care-path">
                  <article className="service-smart-care-stage is-home">
                    <span>
                      <Home size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{copy.homeLabel}</strong>
                      <small>{copy.homeMeta}</small>
                    </div>
                  </article>

                  <article className="service-smart-care-stage is-connect">
                    <span>
                      <Activity size={22} aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{copy.connectLabel}</strong>
                      <small>{copy.connectMeta}</small>
                    </div>
                  </article>

                  <article className="service-smart-care-stage is-care">
                    <span>
                      <LayoutDashboard size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{copy.careLabel}</strong>
                      <small>{copy.careMeta}</small>
                    </div>
                  </article>
                </div>
              </div>
            </div>

            <div className="service-smart-care-chip-list">
              {copy.capabilities.map((capability) => {
                const Icon = capability.icon

                return (
                  <span key={capability.title}>
                    <Icon size={17} aria-hidden="true" />
                    {capability.title}
                  </span>
                )
              })}
            </div>

            <div className="service-smart-platform-status">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>{copy.privacyLabel}</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function SmartRemotePatientMonitoringSection({ language }: { language: string }) {
  const copy = language.toLowerCase().startsWith('es')
    ? smartRemotePatientMonitoringCopy.es
    : smartRemotePatientMonitoringCopy.en

  return (
    <section className="service-detail-section service-rpm-section bg-white">
      <div className="site-shell">
        <div className="service-rpm-grid">
          <div className="service-rpm-visual">
            <SafeImage
              src="/images/service-gallery/10-health-and-vitals-monitoring.jpg"
              alt={copy.visualAlt}
              className="service-rpm-photo"
              imgClassName="h-full w-full object-cover"
            />
            <div className="service-rpm-visual-card">
              <span>{copy.statLabel}</span>
              <strong>{copy.statValue}</strong>
            </div>
          </div>

          <div className="service-rpm-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
            <p>{copy.body}</p>

            <div className="service-rpm-workflow" aria-label={copy.workflowTitle}>
              {copy.workflow.map((item) => {
                const Icon = item.icon

                return (
                  <article key={item.title}>
                    <span>
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="service-rpm-focus">
              <h3>{copy.focusTitle}</h3>
              <ul>
                {copy.focusItems.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ServiceDetailPage() {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.toLowerCase().startsWith('es')
  const uiCopy = isSpanish ? serviceDetailUiCopy.es : serviceDetailUiCopy.en
  const sectionCopy = isSpanish
    ? {
        whatWeCheck: 'Qué revisamos',
        risksTitle: 'Centrado en los riesgos que complican la vida diaria.',
        risksBody:
          'CasaMia separa peligros visibles de mejoras prácticas para que la familia entienda qué importa antes de comprar productos o empezar obras.',
        commonRisks: 'Riesgos habituales que buscamos',
        howWeHelp: 'Cómo puede ayudar CasaMia',
        whyItHelps: 'Por qué ayuda',
        userBenefit: 'Beneficio para la persona',
        serviceWorks: 'Cómo funciona el servicio',
        clearPlan: 'De la preocupación a un plan claro.',
        related: 'Servicios relacionados',
        otherAreas: 'Otras zonas que suelen merecer revisión.',
        viewAll: 'Ver todos los servicios',
        finalEyebrow: '¿Quieres claridad?',
      }
    : {
        whatWeCheck: 'What we check',
        risksTitle: 'Focused on the risks that make daily life harder.',
        risksBody:
          'CasaMia separates visible hazards from practical improvements, so families understand what matters before buying products or starting work.',
        commonRisks: 'Common risks we look for',
        howWeHelp: 'How CasaMia can help',
        whyItHelps: 'Why it helps',
        userBenefit: 'User benefit',
        serviceWorks: 'How the service works',
        clearPlan: 'From concern to a clear plan.',
        related: 'Related services',
        otherAreas: 'Other areas often worth checking.',
        viewAll: 'View all services',
        finalEyebrow: 'Ready for clarity?',
      }
  const { serviceId } = useParams()
  const serviceRoom = serviceRoomMap[serviceId ?? ''] ?? 'bathroom'
  const serviceCatalogue = useServiceCatalogue()
  const masterCatalogue = serviceCatalogue.masterCatalogue ?? getMasterServiceCatalogue()
  const packageGroups = useMemo(
    () => buildPlansBuilderGroups(serviceCatalogue, i18n.language),
    [i18n.language, serviceCatalogue],
  )
  const servicePackageArea = servicePackageAreaMap[serviceId ?? '']
  const servicePackageGroup = servicePackageArea
    ? packageGroups.find((group) => group.packageArea === servicePackageArea) ?? null
    : null
  const [activePackageGroup, setActivePackageGroup] = useState<PlansBuilderGroup | null>(null)
  const [specialistOpen, setSpecialistOpen] = useState(false)
  const roomServices = useLocalizedServicesByRoom(serviceRoom, i18n.language)
  const baseService = primaryServices.find((item) => item.id === serviceId)

  if (!baseService) {
    return <Navigate to="/services" replace />
  }

  const service = getLocalizedPrimaryService(baseService, i18n.language)
  const visual = getLocalizedServiceVisual(service.id, i18n.language)
  const detail = isSpanish
    ? serviceDetailContentEs[service.id] ?? defaultServiceDetailContentEs
    : serviceDetailContent[service.id] ?? defaultServiceDetailContent
  const relatedServices = primaryServices
    .filter((item) => item.id !== service.id)
    .slice(0, 3)
    .map((item) => getLocalizedPrimaryService(item, i18n.language))
  const isKitchenService = service.id === 'kitchen-safety'
  const isSmartService = service.id === 'smart-home-safety'
  const stepCopy = isSmartService
    ? isSpanish
      ? smartDetailStepsEs
      : smartDetailSteps
    : isSpanish
      ? detailStepsEs
      : detailSteps
  const serviceCatalogueItems = serviceRoomMap[service.id] ? roomServices : []
  const zoneRiskMap = !isSmartService && isZoneRiskArea(serviceRoom) ? zoneRiskMaps[serviceRoom] : null
  const heroTitle = isKitchenService
    ? isSpanish
      ? 'Una cocina más segura, sin perder independencia.'
      : 'A safer kitchen, without losing independence.'
    : isSmartService
      ? isSpanish
        ? 'Cuidado conectado para vivir mejor en casa.'
        : 'Connected care that helps seniors enjoy home more.'
    : service.title
  const heroIntro = isKitchenService
    ? isSpanish
      ? 'Mejoras prácticas para estar de pie, iluminación, alcance, agua, electrodomésticos y tranquilidad familiar.'
      : 'Practical improvements for standing, lighting, reach, water, appliances and family reassurance.'
    : isSmartService
      ? isSpanish
        ? 'Asistente de IA, constantes, panel familiar y seguimiento remoto configurados como un único sistema sencillo.'
        : 'AI assistant, vitals, family dashboard and remote care, configured as one simple home system.'
    : service.intro
  const specialistEntryPoint = `service_detail_${service.id.replace(/-/g, '_')}`
  const orderRoomLabel = servicePackageGroup?.roomLabel ?? getOrderRoomLabel(serviceRoom, i18n.language)
  const orderCtaLabel = isSmartService
    ? isSpanish
      ? 'Explorar cuidado conectado'
      : 'Explore connected care'
    : uiCopy.orderPackage(orderRoomLabel)
  const primaryCtaPath = isSmartService ? '/tech#connected-inclusions' : plansPath
  const serviceWorksEyebrow = isSmartService
    ? isSpanish
      ? 'Cómo se configura'
      : 'How it is configured'
    : sectionCopy.serviceWorks
  const clearPlanTitle = isSmartService
    ? isSpanish
      ? 'De dispositivos sueltos a una experiencia conectada.'
      : 'From disconnected devices to one connected experience.'
    : sectionCopy.clearPlan

  return (
    <>
      <SEO
        title={`${service.title} | ${uiCopy.startsAt}`}
        description={service.description}
        path={service.path}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.description,
          provider: {
            '@type': 'Organization',
            name: 'CasaMia',
          },
          areaServed: 'Spain',
          serviceType: service.title,
        }}
      />

      <section className={`service-detail-hero${isSmartService ? ' is-smart-service' : ''}`}>
        <div className="site-shell">
          <div className="service-detail-hero-grid">
            <div className="service-detail-copy">
              <span className="eyebrow">{visual.badge}</span>
              <h1>{heroTitle}</h1>
              <p>{heroIntro}</p>
              <div className="service-detail-actions">
                {servicePackageGroup ? (
                  <button
                    className="btn btn-green"
                    type="button"
                    onClick={() => setActivePackageGroup(servicePackageGroup)}
                  >
                    {uiCopy.explorePackage(servicePackageGroup.roomLabel)}
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                ) : (
                  <Link
                    className="btn btn-green"
                    to={primaryCtaPath}
                  >
                    {orderCtaLabel}
                    <ArrowRight size={20} aria-hidden="true" />
                  </Link>
                )}
                <button
                  className="btn btn-white"
                  type="button"
                  onClick={() => setSpecialistOpen(true)}
                >
                  <MessageSquareText size={20} aria-hidden="true" />
                  {uiCopy.askSafetyExpert}
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>
            </div>

            {isSmartService ? (
              <SmartHomeSafetyHeroVisual image={visual.image} language={i18n.language} />
            ) : (
              <aside className="service-detail-media-card">
                <SafeImage
                  src={visual.image}
                  alt={service.shortTitle}
                  className="service-detail-media"
                  imgClassName="h-full w-full object-cover"
                />
                <div className="service-detail-media-caption">
                  <span>
                    <ServiceIcon icon={service.icon} size={22} />
                  </span>
                  <div>
                    <strong>{service.shortTitle}</strong>
                    <p>{visual.note}</p>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {isKitchenService ? (
        <>
          {zoneRiskMap ? <ServiceZoneRiskMapSection language={isSpanish ? 'es' : 'en'} riskMap={zoneRiskMap} /> : null}
          <KitchenSafetyShowcase
            detail={detail}
            hideStory
            kitchenServices={serviceCatalogueItems}
            language={i18n.language}
          />
        </>
      ) : (
        isSmartService ? (
          <>
            <SmartHomeSafetyShowcase language={i18n.language} />
            <SmartRemotePatientMonitoringSection language={i18n.language} />
          </>
        ) : (
          <>
            {zoneRiskMap ? (
              <ServiceZoneRiskMapSection language={isSpanish ? 'es' : 'en'} riskMap={zoneRiskMap} />
            ) : (
              <section className="service-detail-section bg-white">
                <div className="site-shell">
                  <div className="service-detail-heading">
                    <p className="eyebrow">{sectionCopy.whatWeCheck}</p>
                    <h2>{sectionCopy.risksTitle}</h2>
                    <p>{sectionCopy.risksBody}</p>
                  </div>

                  <div className="service-detail-check-grid">
                    <article>
                      <h3>{sectionCopy.commonRisks}</h3>
                      <ServiceChecklist items={service.risks} />
                    </article>
                    <article>
                      <h3>{sectionCopy.howWeHelp}</h3>
                      <ServiceChecklist items={service.improvements} />
                    </article>
                  </div>
                </div>
              </section>
            )}

            <section className="service-detail-section bg-pale-blue">
              <div className="site-shell">
                <div className="service-detail-heading">
                  <p className="eyebrow">{sectionCopy.whyItHelps}</p>
                  <h2>{detail.benefitsTitle}</h2>
                  <p>{detail.benefitsIntro}</p>
                </div>

                <div className="service-detail-benefit-grid">
                  {detail.benefits.map((benefit, index) => (
                    <article key={benefit.title}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <RoomServiceItemsSection
              ctaPath={primaryCtaPath}
              language={i18n.language}
              orderCtaLabel={orderCtaLabel}
              room={serviceRoom}
              services={serviceCatalogueItems}
            />

            <section className="service-detail-section bg-white">
              <div className="site-shell">
                <div className="service-detail-reassurance-card">
                  <div>
                    <p className="eyebrow">{sectionCopy.userBenefit}</p>
                    <h3>{detail.reassuranceTitle}</h3>
                    <p>{detail.reassuranceBody}</p>
                  </div>
                  <ServiceChecklist items={detail.reassurancePoints} />
                </div>
              </div>
            </section>
          </>
        )
      )}

      <section className="service-detail-section bg-pale-blue">
        <div className="site-shell">
          <div className="service-detail-heading is-centered">
            <p className="eyebrow">{serviceWorksEyebrow}</p>
            <h2>{clearPlanTitle}</h2>
          </div>

          <div className="service-detail-step-grid">
            {stepCopy.map((step, index) => {
              const Icon = step.icon

              return (
                <article key={step.title}>
                  <span>
                    <Icon size={24} aria-hidden="true" />
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

      {isSmartService ? null : (
        <section className="service-detail-section bg-white">
          <div className="site-shell">
            <div className="service-detail-related-header">
              <div>
                <p className="eyebrow">{sectionCopy.related}</p>
                <h2>{sectionCopy.otherAreas}</h2>
              </div>
              <Link to="/services">
                {sectionCopy.viewAll}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <div className="service-detail-related-grid">
              {relatedServices.map((item) => {
                const relatedVisual = getLocalizedServiceVisual(item.id, i18n.language)

                return (
                  <Link key={item.id} to={item.path}>
                    <SafeImage
                      src={relatedVisual.image}
                      alt={item.shortTitle}
                      className="service-detail-related-image"
                      imgClassName="h-full w-full object-cover"
                    />
                    <div>
                      <span>{relatedVisual.badge}</span>
                      <h3>{item.shortTitle}</h3>
                      <p>{item.intro}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="service-detail-final">
        <div className="site-shell">
          <div>
            <p className="eyebrow">{sectionCopy.finalEyebrow}</p>
            <h2>{detail.finalTitle}</h2>
            <p>{detail.finalBody}</p>
          </div>
          <Link className="btn btn-green" to={primaryCtaPath}>
            {orderCtaLabel}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <PackageDetailModal
        catalogue={masterCatalogue}
        group={activePackageGroup}
        language={i18n.language}
        onClose={() => setActivePackageGroup(null)}
      />
      {specialistOpen ? (
        <Suspense
          fallback={(
            <div className="specialist-voice-backdrop" role="presentation">
              <div className="specialist-voice-loading" role="status">
                <LoaderCircle size={28} aria-hidden="true" />
                <span>{isSpanish ? 'Cargando...' : 'Loading...'}</span>
              </div>
            </div>
          )}
        >
          <SpecialistVoiceAgentModal
            entryPoint={specialistEntryPoint}
            isOpen={specialistOpen}
            language={i18n.language}
            onClose={() => setSpecialistOpen(false)}
          />
        </Suspense>
      ) : null}
    </>
  )
}
