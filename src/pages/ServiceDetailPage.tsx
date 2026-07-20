import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  CheckCircle2,
  ClipboardCheck,
  DoorOpen,
  Droplets,
  Footprints,
  Home,
  Lightbulb,
  PackageCheck,
  PlugZap,
  ShieldCheck,
  Smartphone,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { ServiceChecklist } from '../components/ServiceChecklist'
import { ServiceIcon } from '../components/ServiceIcon'
import { serviceVisuals } from '../constants/serviceVisuals'
import { primaryServices } from '../constants/siteContent'
import { formatCurrency } from '../services/serviceCatalogue'
import {
  formatServicePriceForLanguage,
  useLocalizedServicesByRoom,
} from '../services/serviceCatalogueLocalization'
import type { CasaMiaService, ServiceRoom } from '../types/serviceCatalogue'

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

const serviceDetailUiCopy = {
  en: {
    allServices: 'All services',
    buildPlan: 'Build My Safer Home',
    freeReport: 'Start Free Safety Report',
    quote: 'Quote',
    checkFirst: 'Check first',
    installed: 'Installed',
    product: 'Product',
    includedWith: 'Included with',
    kitchenEyebrow: 'Kitchen independence',
    kitchenStatsLabel: 'Kitchen safety services summary',
    entryItem: 'entry item',
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
    allServices: 'Todos los servicios',
    buildPlan: 'Crear mi plan seguro',
    freeReport: 'Empezar informe gratis',
    quote: 'Presupuesto',
    checkFirst: 'Revisar primero',
    installed: 'Instalado',
    product: 'Producto',
    includedWith: 'Incluido con',
    kitchenEyebrow: 'Autonomía en la cocina',
    kitchenStatsLabel: 'Resumen de servicios de seguridad en cocina',
    entryItem: 'opción inicial',
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

type KitchenVisual =
  | 'mat'
  | 'light'
  | 'voice'
  | 'plug'
  | 'leak'
  | 'gas'
  | 'shelf'
  | 'stove'
  | 'faucet'
  | 'handover'

const kitchenServicePresentation: Record<string, { icon: LucideIcon; visual: KitchenVisual }> = {
  'kitchen-prep-mats': { icon: ShieldCheck, visual: 'mat' },
  'kitchen-easy-grip-tools': { icon: Utensils, visual: 'voice' },
  'kitchen-lightweight-cookware': { icon: Utensils, visual: 'handover' },
  'kitchen-anti-fatigue-mat': { icon: ShieldCheck, visual: 'mat' },
  'kitchen-worktop-lighting': { icon: Lightbulb, visual: 'light' },
  'kitchen-voice-lighting-timers': { icon: Lightbulb, visual: 'light' },
  'kitchen-smart-plugs': { icon: PlugZap, visual: 'plug' },
  'kitchen-water-leak-sensor': { icon: Droplets, visual: 'leak' },
  'kitchen-gas-co-sensor': { icon: PlugZap, visual: 'gas' },
  'kitchen-pull-down-shelf': { icon: PackageCheck, visual: 'shelf' },
  'kitchen-stove-shutoff': { icon: ShieldCheck, visual: 'stove' },
  'kitchen-touchless-faucet': { icon: Droplets, visual: 'faucet' },
}

const roomServicePresentation: Record<ServiceRoom, { icon: LucideIcon; visual: KitchenVisual }> = {
  bathroom: { icon: Bath, visual: 'faucet' },
  bedroom: { icon: BedDouble, visual: 'light' },
  connected: { icon: Smartphone, visual: 'plug' },
  entrance: { icon: DoorOpen, visual: 'mat' },
  kitchen: { icon: Utensils, visual: 'handover' },
  movement: { icon: Footprints, visual: 'mat' },
}

const serviceRoomMap: Record<string, ServiceRoom> = {
  'bathroom-safety': 'bathroom',
  'stair-safety': 'movement',
  'entrance-accessibility': 'entrance',
  'kitchen-safety': 'kitchen',
  'bedroom-safety': 'bedroom',
  'smart-home-safety': 'connected',
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
      'Haz el dormitorio más seguro con transferencias de cama más fáciles, iluminación nocturna, rutas despejadas, apoyo junto a la cama y ayuda al alcance.',
    intro:
      'El dormitorio debe apoyar descanso y movimiento seguro, especialmente por la noche cuando la poca luz y la urgencia aumentan el riesgo.',
    risks: ['Transferencias de cama difíciles', 'Rutas nocturnas oscuras', 'Ayuda de emergencia fuera de alcance'],
    improvements: ['Apoyo junto a la cama y ayudas de transferencia', 'Iluminación nocturna con sensor', 'Rutas despejadas y ayuda al alcance'],
  },
  'smart-home-safety': {
    title: 'Seguridad conectada para personas mayores',
    shortTitle: 'Seguridad conectada',
    description:
      'Añade tecnología práctica como iluminación con sensor, alertas, sensores de fuga o puerta, dispositivos de emergencia y avisos familiares.',
    intro:
      'La seguridad conectada debe sentirse sencilla. CasaMia se centra en tecnología útil que da confianza sin complicar la vivienda.',
    risks: ['Sin aviso cuando cambian rutinas', 'Poca visibilidad nocturna', 'Riesgos ocultos de agua o humo'],
    improvements: ['Iluminación y sensores con movimiento', 'Dispositivos de respuesta de emergencia', 'Configuración sencilla y formación'],
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
    badge: 'Tranquilidad conectada',
    note: 'Sensores, VYVA y avisos familiares',
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

const roomServiceCopy: Record<ServiceRoom, { eyebrow: string; title: string; intro: string }> = {
  bathroom: {
    eyebrow: 'Bathroom improvements',
    title: 'Choose the bathroom support that fits the person.',
    intro: 'Rails, seats, toilet support, safer flooring and alerts can be added one by one after the home is reviewed.',
  },
  bedroom: {
    eyebrow: 'Bedroom improvements',
    title: 'Make nights and transfers calmer.',
    intro: 'Focus on the moments that matter: getting out of bed, finding the route, calling for help and moving without rushing.',
  },
  connected: {
    eyebrow: 'Connected safety',
    title: 'Add reassurance without making the home complicated.',
    intro: 'Simple sensors, alerts and controls help families stay informed while keeping the setup easy to live with.',
  },
  entrance: {
    eyebrow: 'Entrance improvements',
    title: 'Make arrival and leaving the home safer.',
    intro: 'CasaMia can combine lighting, threshold support, rails and ramp options around the entrance people actually use.',
  },
  kitchen: {
    eyebrow: 'Kitchen improvements',
    title: 'Choose the improvements that fit.',
    intro: 'Pick useful services one by one. CasaMia confirms measurements and compatibility before work starts.',
  },
  movement: {
    eyebrow: 'Movement improvements',
    title: 'Support the routes used every day.',
    intro: 'Handrails, contrast, anti-slip treatments and lighting can be matched to stairs, corridors and daily movement paths.',
  },
}

const roomServiceCopyEs: Record<ServiceRoom, { eyebrow: string; title: string; intro: string }> = {
  bathroom: {
    eyebrow: 'Mejoras de baño',
    title: 'Elige el apoyo de baño que encaja con la persona.',
    intro: 'Barras, asientos, apoyo para inodoro, suelos más seguros y avisos pueden añadirse uno a uno después de revisar la vivienda.',
  },
  bedroom: {
    eyebrow: 'Mejoras de dormitorio',
    title: 'Haz que las noches y las transferencias sean más tranquilas.',
    intro: 'Nos centramos en los momentos clave: levantarse, orientarse, pedir ayuda y moverse sin prisa.',
  },
  connected: {
    eyebrow: 'Seguridad conectada',
    title: 'Añade tranquilidad sin complicar la vivienda.',
    intro: 'Sensores, avisos y controles sencillos ayudan a la familia a estar informada manteniendo un uso fácil.',
  },
  entrance: {
    eyebrow: 'Mejoras de entrada',
    title: 'Haz más seguro llegar y salir de casa.',
    intro: 'CasaMia combina iluminación, apoyo en umbrales, pasamanos y opciones de rampa alrededor de la entrada que realmente se usa.',
  },
  kitchen: {
    eyebrow: 'Mejoras de cocina',
    title: 'Elige las mejoras que encajan.',
    intro: 'Selecciona servicios útiles uno a uno. CasaMia confirma medidas y compatibilidad antes de empezar.',
  },
  movement: {
    eyebrow: 'Mejoras de movimiento',
    title: 'Apoya las rutas que se usan cada día.',
    intro: 'Pasamanos, contraste, antideslizantes e iluminación se adaptan a escaleras, pasillos y rutas diarias.',
  },
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
      { title: 'Transferencias de cama más fáciles', body: 'Mejor altura, espacio, apoyo junto a la cama y ayudas cuando hacen falta.' },
      { title: 'Movimiento nocturno más seguro', body: 'Iluminación con sensor, rutas despejadas y menos desorientación.' },
      { title: 'Ayuda al alcance', body: 'Botón, teléfono, wearable o aviso conectado donde pueda usarse en el momento.' },
    ],
    includedTitle: 'Qué puede incluir un plan de dormitorio.',
    includedIntro: 'CasaMia revisa la rutina nocturna completa: cama, luz, muebles, suelo, medicación y ruta a la siguiente estancia.',
    included: ['Altura de cama y apoyo de transferencia', 'Iluminación nocturna de cama a puerta o baño', 'Espacio libre alrededor de muebles, alfombras y cables', 'Botón de emergencia, teléfono o alerta wearable', 'Elementos diarios al alcance seguro'],
    finalTitle: 'Haz el dormitorio más seguro antes de que la noche preocupe.',
  },
  'smart-home-safety': {
    ...defaultServiceDetailContentEs,
    benefitsTitle: 'Usa tecnología solo donde haga la vida más segura.',
    benefitsIntro:
      'La seguridad conectada no debe convertirse en un proyecto complicado. CasaMia se centra en alertas útiles, iluminación, respuesta de emergencia y tranquilidad familiar.',
    benefits: [
      { title: 'Aviso más temprano', body: 'Sensores pueden ayudar a detectar cambios de rutina, fugas, humo, puertas o movimiento nocturno.' },
      { title: 'Ayuda más rápida', body: 'Botones, wearables y alertas facilitan avisar a familia o cuidadores.' },
      { title: 'Menos fricción diaria', body: 'Voz, iluminación con sensor y automatización sencilla reducen desplazamientos y movimientos innecesarios.' },
    ],
    includedTitle: 'Qué puede incluir un plan conectado.',
    includedIntro: 'CasaMia revisa conectividad y recomienda solo dispositivos que encajan con la persona, la vivienda y la familia.',
    included: ['Iluminación con sensor y ruta nocturna', 'Botones de emergencia o alertas wearable', 'Sensores de fuga, humo, puerta o movimiento', 'Configuración de app y panel familiar si aplica', 'Preferencias de aviso y privacidad', 'Entrega sencilla para persona mayor y familia'],
    finalTitle: 'Añade seguridad conectada donde realmente ayuda.',
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
      'We focus on practical access improvements that fit the home, the resident, and the way family or caregivers visit.',
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
    reassuranceTitle: "A safer kitchen should still feel like the resident's kitchen.",
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
        title: 'Easier bed transfers',
        body: 'Support getting in and out of bed with the right height, clearance, bedside support, and transfer aids where needed.',
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
      'Bed height, transfer, and bedside support review',
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
      'Book a visit and CasaMia will review bed transfers, lighting, floor clearance, and emergency reach points.',
  },
  'smart-home-safety': {
    benefitsTitle: 'Use technology only where it makes daily life safer.',
    benefitsIntro:
      'Smart safety should not feel like a complicated smart-home project. CasaMia focuses on useful alerts, lighting, emergency support, and family reassurance.',
    benefits: [
      {
        title: 'Earlier awareness',
        body: 'Sensors can help notice changes in routines, leaks, smoke, doors, or night movement before a small issue becomes urgent.',
      },
      {
        title: 'Faster help',
        body: 'Emergency buttons, wearable support, and alerts make it easier to call family or caregivers quickly.',
      },
      {
        title: 'Less daily friction',
        body: 'Voice control, motion lighting, and simple automation can reduce rushing, bending, and unnecessary movement.',
      },
    ],
    includedTitle: 'What a smart safety plan can include.',
    includedIntro:
      'CasaMia checks connectivity and recommends only devices that match the person, the home, and the family’s comfort level.',
    included: [
      'Motion lighting and night-route setup',
      'Emergency buttons or wearable alert guidance',
      'Leak, smoke, door, and movement sensor recommendations',
      'VYVA app and caregiver dashboard setup where included',
      'Family alert preferences and privacy settings',
      'Simple handover for the older adult and family',
    ],
    reassuranceTitle: 'No complicated gimmicks and no cameras by default.',
    reassuranceBody:
      'The aim is connected reassurance: useful alerts, simple controls, and privacy-aware setup that the family understands.',
    reassurancePoints: ['Connectivity checked first', 'Family alerts agreed in advance', 'Simple setup and handover'],
    finalTitle: 'Add connected safety where it genuinely helps.',
    finalBody:
      'Book a visit and CasaMia will review the home, connectivity, and the most useful smart safety options.',
  },
}

function getServicePresentation(service: CasaMiaService) {
  return kitchenServicePresentation[service.id] ?? roomServicePresentation[service.room] ?? { icon: PackageCheck, visual: 'handover' as const }
}

function getServiceStatusLabel(service: CasaMiaService, language: string) {
  const copy = language.toLowerCase().startsWith('es') ? serviceDetailUiCopy.es : serviceDetailUiCopy.en

  if (service.pricingType === 'quote_only') {
    return copy.quote
  }

  if (service.requiresMeasurement || service.requiresSiteVisit || service.requiresCompatibilityCheck) {
    return copy.checkFirst
  }

  if (service.requiresInstallation) {
    return copy.installed
  }

  return copy.product
}

function getConfigurePath(serviceId: string) {
  void serviceId

  return '/home-safety-wizard'
}

function getLowestServicePrice(services: CasaMiaService[]) {
  return services.reduce<number | undefined>((lowest, service) => {
    const amount = getServicePriceAmount(service)

    if (!amount) {
      return lowest
    }

    return lowest === undefined ? amount : Math.min(lowest, amount)
  }, undefined)
}

function getServicePriceAmount(service: CasaMiaService) {
  if (service.pricingType === 'quote_only') {
    return undefined
  }

  if (service.pricingType === 'from') {
    return service.fromPrice
  }

  return (service.productPrice ?? 0) + (service.installationPrice ?? 0)
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

  return (
    <div className="service-kitchen-component-grid is-itemised">
      {services.map((item) => {
        const presentation = getServicePresentation(item)
        const Icon = presentation.icon

        return (
          <article key={item.id}>
            <div className={`service-kitchen-component-visual is-${presentation.visual}`} aria-hidden="true">
              <span className="service-kitchen-visual-main" />
              <span className="service-kitchen-visual-dot" />
              <span className="service-kitchen-visual-line" />
            </div>
            <div className="service-kitchen-component-copy">
              <div className="service-kitchen-component-topline">
                <span>{getServiceStatusLabel(item, language)}</span>
                <Icon size={21} aria-hidden="true" />
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
              <strong>{formatServicePriceForLanguage(item, language)}</strong>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function RoomServiceItemsSection({
  configurePath,
  language,
  room,
  services,
}: {
  configurePath: string
  language: string
  room: ServiceRoom
  services: CasaMiaService[]
}) {
  if (services.length === 0) {
    return null
  }

  const isSpanish = language.toLowerCase().startsWith('es')
  const copy = isSpanish ? roomServiceCopyEs[room] : roomServiceCopy[room]
  const uiCopy = isSpanish ? serviceDetailUiCopy.es : serviceDetailUiCopy.en

  return (
    <section className="service-detail-section bg-white">
      <div className="site-shell">
        <div className="service-detail-heading">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>

        <ServiceItemGrid language={language} services={services} />

        <div className="service-detail-actions service-detail-inline-actions">
          <Link className="btn btn-navy" to={configurePath}>
            {uiCopy.buildPlan}
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function KitchenSafetyShowcase({
  detail,
  kitchenServices,
  language,
}: {
  detail: ServiceDetailContent
  kitchenServices: CasaMiaService[]
  language: string
}) {
  const isSpanish = language.toLowerCase().startsWith('es')
  const uiCopy = isSpanish ? serviceDetailUiCopy.es : serviceDetailUiCopy.en
  const installCount = kitchenServices.filter((service) => service.requiresInstallation).length
  const siteCheckCount = kitchenServices.filter(
    (service) => service.requiresMeasurement || service.requiresSiteVisit || service.requiresCompatibilityCheck,
  ).length
  const lowestPrice = getLowestServicePrice(kitchenServices)
  const groupedServices = groupServicesByCategory(kitchenServices)

  return (
    <>
      <section className="service-detail-section service-kitchen-story bg-white">
        <div className="site-shell">
          <div className="service-kitchen-story-grid">
            <div className="service-detail-heading">
              <p className="eyebrow">{uiCopy.kitchenEyebrow}</p>
              <h2>{detail.benefitsTitle}</h2>
              <p>{detail.benefitsIntro}</p>
              <div className="service-kitchen-stats" aria-label={uiCopy.kitchenStatsLabel}>
                <article>
                  <strong>{lowestPrice ? formatCurrency(lowestPrice) : uiCopy.quote}</strong>
                  <span>{uiCopy.entryItem}</span>
                </article>
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
              <div className="service-kitchen-routine-visual" aria-hidden="true">
                <div className="service-kitchen-counter">
                  <span className="service-kitchen-zone is-light">{isSpanish ? 'Luz de trabajo' : 'Task light'}</span>
                  <span className="service-kitchen-zone is-sink">{isSpanish ? 'Sensor de fuga' : 'Leak sensor'}</span>
                  <span className="service-kitchen-zone is-stove">{isSpanish ? 'Seguridad de aparatos' : 'Appliance safety'}</span>
                  <span className="service-kitchen-zone is-mat">{isSpanish ? 'Zona estable' : 'Stable standing zone'}</span>
                  <span className="service-kitchen-zone is-reach">{isSpanish ? 'Alcance seguro' : 'Safer reach'}</span>
                </div>
              </div>
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

      <section className="service-detail-section bg-pale-blue">
        <div className="site-shell">
          <div className="service-detail-heading">
            <p className="eyebrow">{uiCopy.improvedEyebrow}</p>
            <h2>{uiCopy.improvedTitle}</h2>
            <p>{uiCopy.improvedBody}</p>
          </div>

          <ServiceItemGrid language={language} services={kitchenServices} />
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
  const stepCopy = isSpanish ? detailStepsEs : detailSteps
  const { serviceId } = useParams()
  const serviceRoom = serviceRoomMap[serviceId ?? ''] ?? 'bathroom'
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
  const serviceCatalogueItems = serviceRoomMap[service.id] ? roomServices : []
  const heroTitle = isKitchenService
    ? isSpanish
      ? 'Una cocina más segura, sin perder independencia.'
      : 'A safer kitchen, without losing independence.'
    : service.title
  const heroIntro = isKitchenService
    ? isSpanish
      ? 'Mejoras prácticas para estar de pie, iluminación, alcance, agua, electrodomésticos y tranquilidad familiar.'
      : 'Practical improvements for standing, lighting, reach, water, appliances and family reassurance.'
    : service.intro
  const configurePath = getConfigurePath(service.id)

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

      <section className="service-detail-hero">
        <div className="site-shell">
          <Link className="service-detail-back" to="/services">
            <ArrowLeft size={17} aria-hidden="true" />
            {uiCopy.allServices}
          </Link>

          <div className="service-detail-hero-grid">
            <div className="service-detail-copy">
              <span className="eyebrow">{visual.badge}</span>
              <h1>{heroTitle}</h1>
              <p>{heroIntro}</p>
              <div className="service-detail-actions">
                <Link
                  className="btn btn-green"
                  to={configurePath}
                >
                  {uiCopy.buildPlan}
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
                <Link className="btn btn-white" to="/home-safety-assessment#self-inspection-tool">
                  {uiCopy.freeReport}
                </Link>
              </div>
            </div>

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
          </div>
        </div>
      </section>

      {isKitchenService ? (
        <KitchenSafetyShowcase
          detail={detail}
          kitchenServices={serviceCatalogueItems}
          language={i18n.language}
        />
      ) : (
        <>
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
            configurePath={configurePath}
            language={i18n.language}
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
      )}

      <section className="service-detail-section bg-pale-blue">
        <div className="site-shell">
          <div className="service-detail-heading is-centered">
            <p className="eyebrow">{sectionCopy.serviceWorks}</p>
            <h2>{sectionCopy.clearPlan}</h2>
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

      <section className="service-detail-final">
        <div className="site-shell">
          <div>
            <p className="eyebrow">{sectionCopy.finalEyebrow}</p>
            <h2>{detail.finalTitle}</h2>
            <p>{detail.finalBody}</p>
          </div>
          <Link className="btn btn-green" to={configurePath}>
            {uiCopy.buildPlan}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
