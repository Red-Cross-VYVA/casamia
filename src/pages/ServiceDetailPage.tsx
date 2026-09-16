import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Home,
  LoaderCircle,
  MessageSquareText,
  MousePointer2,
  ShieldCheck,
} from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'

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
import { getServicePreviewDescription, getServiceProofChips } from '../utils/serviceTrust'
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
    body: 'You see which risks matter most and which improvements fit the home.',
  },
  {
    icon: Home,
    title: 'Defined next step',
    body: 'If work makes sense, CasaMia prepares a clear proposal with scope, installation and safe-use explanation.',
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
    body: 'Ves qué riesgos importan más y qué mejoras encajan con la vivienda.',
  },
  {
    icon: Home,
    title: 'Siguiente paso definido',
    body: 'Si hace falta actuar, CasaMia prepara una propuesta con productos, instalación y entrega.',
  },
]

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
    kitchenEyebrow: 'Kitchen safety',
    kitchenStatsLabel: 'Kitchen safety services summary',
    safetyServices: 'safety services',
    managedInstalls: 'managed installs',
    checkedBeforeInstall: 'checked before install',
    kitchenVisualNote:
      'Built around real kitchen moments: reach, prep, cooking, washing and after-cooking checks.',
    improvedEyebrow: 'What gets improved',
    improvedTitle: 'Choose the improvements that fit.',
    improvedBody:
      'Pick services one by one. We check measurements and compatibility before any work starts.',
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
      'Diseñado alrededor de momentos reales de cocina: alcance, preparación, cocción, lavado y revisión posterior.',
    improvedEyebrow: 'Qué se mejora',
    improvedTitle: 'Elige las mejoras que encajan.',
    improvedBody:
      'Selecciona servicios útiles uno a uno. Revisamos medidas y compatibilidad antes de empezar.',
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
      'Haz el baño más seguro con barras de apoyo, superficies antideslizantes, transferencias más estables, iluminación y mejoras de accesibilidad.',
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
      'Haz la cocina más segura con menos alcance, rutas despejadas, mejor iluminación, almacenamiento y control de electrodomésticos.',
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
    title: 'Seguridad conectada para personas mayores',
    shortTitle: 'Seguridad conectada',
    description:
      'Añade tecnología enfocada: iluminación con sensor, alertas, sensores de fuga o puerta, dispositivos de emergencia y avisos a contactos acordados.',
    intro:
      'La seguridad conectada debe entenderse rápido. CasaMia se centra en tecnología útil que reduce riesgos concretos sin complicar la vivienda.',
    risks: ['Sin aviso cuando cambian rutinas', 'Poca visibilidad nocturna', 'Riesgos ocultos de agua o humo'],
    improvements: ['Iluminación y sensores con movimiento', 'Dispositivos de respuesta de emergencia', 'Configuración clara y formación'],
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
    note: 'Sensores, VYVA y avisos acordados',
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
  benefitsTitle: 'Reduce the room risks that interrupt daily routines.',
  benefitsIntro:
    'CasaMia reviews the exact moments that make a room harder to use: reaching, turning, standing, poor light, wet floors or support missing where it is needed.',
  benefits: [
    {
      title: 'Fewer unsupported movements',
      body: 'Reduce the moments where someone pauses, reaches, twists or needs support but has nothing reliable nearby.',
    },
    {
      title: 'Clearer support',
      body: 'Place support where the person can reach it naturally, not just where a product happens to fit.',
    },
    {
      title: 'More clarity for the next decision',
      body: 'Show what has been checked, what matters most and which improvement should happen first.',
    },
  ],
  includedTitle: 'A room-specific plan, not a generic product list.',
  includedIntro:
    'The visit connects the room layout, daily routine, mobility profile, and installation options before recommending changes.',
  included: [
    'Room and routine review',
    'Risk priorities explained in plain language',
    'Product and installation recommendations that fit the room',
    'Next action separated into urgent, recommended and optional improvements',
  ],
  reassuranceTitle: 'Matched to the person using the room.',
  reassuranceBody:
    'The goal is not to make the home look clinical. It is to make everyday movement safer while keeping familiar routines in place.',
  reassurancePoints: ['Matched to the existing home', 'Explained before work starts', 'Focused on prevention before incidents happen'],
  finalTitle: 'Start with the room that worries you most.',
  finalBody:
    'CasaMia can check this area alongside the rest of the home, then confirm what to change first and what still needs measurement.',
}

const defaultServiceDetailContentEs: ServiceDetailContent = {
  benefitsTitle: 'Reduce los riesgos de la estancia que interrumpen la rutina diaria.',
  benefitsIntro:
    'CasaMia revisa los momentos exactos que hacen difícil usar una estancia: alcanzar, girar, levantarse, poca luz, suelo mojado o falta de apoyo donde se necesita.',
  benefits: [
    {
      title: 'Menos movimientos sin apoyo',
      body: 'Reduce los momentos en los que alguien se detiene, se estira, gira o no se siente seguro al moverse.',
    },
    {
      title: 'Apoyo más claro',
      body: 'Coloca el apoyo donde la persona puede alcanzarlo de forma natural, no solo donde cabe un producto.',
    },
    {
      title: 'Más claridad para decidir',
      body: 'Queda más claro qué se ha revisado, qué importa más y qué conviene mejorar primero.',
    },
  ],
  includedTitle: 'Un plan específico para la estancia, no una lista genérica de productos.',
  includedIntro:
    'La visita conecta distribución, rutina diaria, movilidad y opciones de instalación antes de recomendar cambios.',
  included: [
    'Revisión de estancia y rutina',
    'Prioridades de riesgo explicadas de forma clara',
    'Recomendaciones de producto e instalación que encajan con la estancia',
    'Acción siguiente separada entre mejoras urgentes, recomendadas y opcionales',
  ],
  reassuranceTitle: 'Adaptado a la persona que usa la estancia.',
  reassuranceBody:
    'El objetivo no es que la vivienda parezca clínica, sino que el movimiento diario sea más seguro manteniendo rutinas reconocibles.',
  reassurancePoints: ['Adaptado a la vivienda actual', 'Explicado antes de empezar', 'Prevención antes de que ocurra un incidente'],
  finalTitle: 'Empieza por la estancia que más te preocupa.',
  finalBody:
    'CasaMia puede revisar esta zona junto con el resto de la vivienda y confirmar qué cambiar primero y qué todavía necesita medidas.',
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
      { title: 'Menos ayuda física directa', body: 'Apoyo más seguro en los puntos donde la persona se ducha, gira o usa el inodoro.' },
    ],
    includedTitle: 'Qué puede incluir un plan de seguridad de baño.',
    includedIntro: 'CasaMia prioriza las mejoras que más cambian el baño, el aseo y el movimiento seguro en zona húmeda.',
    included: ['Colocación de barras y puntos de apoyo', 'Superficies o tratamientos antideslizantes', 'Entrada de ducha y transferencia al inodoro', 'Iluminación, alcance y orden', 'Asiento de ducha, elevador o cambios de acceso cuando ayudan'],
    finalTitle: 'Haz el baño más seguro antes del próximo susto.',
  },
  'stair-safety': {
    ...defaultServiceDetailContentEs,
    benefitsTitle: 'Haz que cada borde de escalón y punto de apoyo se identifique mejor.',
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
      { title: 'Acceso diario más seguro', body: 'Reduce umbrales incómodos, escalones y momentos sin apoyo al entrar o salir.' },
      { title: 'Rutinas de visita más seguras', body: 'Facilita abrir la puerta, recibir entregas o hablar con visitas sin correr.' },
      { title: 'Salida y llegada más predecibles', body: 'El primer y último tramo de cada salida se vuelve más predecible.' },
    ],
    includedTitle: 'Qué puede incluir un plan de entrada.',
    includedIntro: 'CasaMia revisa la entrada como una ruta completa, desde la luz exterior hasta el primer punto seguro dentro.',
    included: ['Umbrales, escalones y opciones de rampa', 'Iluminación exterior y de puerta', 'Pasamanos y puntos de apoyo', 'Rutina de llaves, visitas y acceso', 'Timbre o control de acceso cuando ayuda'],
    finalTitle: 'Reduce el riesgo de entrada antes de que limite las salidas diarias.',
  },
  'kitchen-safety': {
    ...defaultServiceDetailContentEs,
    benefitsTitle: 'Reduce riesgos de alcance, resbalón y electrodomésticos en la cocina.',
    benefitsIntro:
      'CasaMia revisa cómo se usa la cocina y recomienda solo las mejoras que reducen riesgo o esfuerzo diario.',
    benefits: [
      { title: 'Menos alcance y carga', body: 'Objetos, herramientas e iluminación se colocan para cocinar con menos alcance, flexión y peso.' },
      { title: 'Menos momentos de riesgo', body: 'Reducimos desencadenantes habituales: suelos mojados, cables, giros, poca luz y encimeras saturadas.' },
      { title: 'Avisos y controles más claros', body: 'Sensores, temporizadores, enchufes inteligentes y apagado opcional aclaran qué revisar después de cocinar.' },
    ],
    includedTitle: 'Crea tu plan de cocina desde servicios individuales.',
    includedIntro: 'Selecciona mejoras útiles, revisa una estimación y decide si subir fotos o reservar una visita.',
    included: ['Zonas antideslizantes de preparación', 'Utensilios de agarre fácil y menaje ligero', 'Iluminación de encimera, voz y temporizadores', 'Enchufes inteligentes, sensores de fuga, gas o CO', 'Estante abatible, apagado automático o grifo sin contacto cuando encaje'],
    finalTitle: 'Mantén la cocina utilizable con menos riesgo diario.',
  },
  'bedroom-safety': {
    ...defaultServiceDetailContentEs,
    benefitsTitle: 'Reduce el riesgo de movimiento nocturno entre cama y baño.',
    benefitsIntro:
      'Muchas situaciones de riesgo ocurren con sueño, poca luz o prisa por llegar al baño. CasaMia diseña el dormitorio alrededor de cama, ruta nocturna y ayuda al alcance.',
    benefits: [
      { title: 'Entrar y salir de la cama con más seguridad', body: 'Mejor altura, espacio, apoyo junto a la cama y ayudas que encajan con la rutina.' },
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
    benefitsTitle: 'Usa tecnología solo donde reduzca un riesgo concreto.',
    benefitsIntro:
      'La seguridad conectada no debe convertirse en un proyecto complicado. CasaMia se centra en alertas claras, iluminación, respuesta de emergencia y contactos autorizados.',
    benefits: [
      { title: 'Aviso más temprano', body: 'Sensores pueden ayudar a detectar cambios de rutina, fugas, humo, puertas o movimiento nocturno.' },
      { title: 'Ayuda más rápida', body: 'Botones, wearables y alertas facilitan avisar a los contactos acordados.' },
      { title: 'Menos movimientos innecesarios', body: 'Voz, iluminación con sensor y automatización clara reducen desplazamientos, flexiones y prisas.' },
    ],
    includedTitle: 'Qué puede incluir un plan conectado.',
    includedIntro: 'CasaMia revisa conectividad y recomienda solo dispositivos que encajan con la persona, la vivienda y los contactos autorizados.',
    included: ['Iluminación con sensor y ruta nocturna', 'Botones de emergencia o alertas wearable', 'Sensores de fuga, humo, puerta o movimiento', 'Configuración de app y vista de contactos si aplica', 'Preferencias de aviso y privacidad', 'Explicación clara para el uso diario'],
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
        title: 'Less need for hands-on help',
        body: 'Place safer support at the points where the person washes, turns or uses the toilet.',
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
      'Optional shower seat, raised toilet or access changes when they improve daily use',
    ],
    reassuranceTitle: 'Support where bathing and toilet transfers actually happen.',
    reassuranceBody:
      'We recommend discreet changes that fit the room and the person using it, then explain what is urgent and what can wait.',
    reassurancePoints: ['Focus on wet-room fall risk', 'Recommendations matched to mobility', 'Installation guidance before buying products'],
    finalTitle: 'Make the bathroom safer before the next near miss.',
    finalBody:
      'Book a visit and we will review transfers, surfaces, support points and the changes that fit the room.',
  },
  'stair-safety': {
    benefitsTitle: 'Make stair edges and support points visible before moving.',
    benefitsIntro:
      'Stair safety depends on continuous support, visible edges, predictable lighting, and reducing the need to rush or carry too much.',
    benefits: [
      {
        title: 'More stable movement',
        body: 'Improve hand support from the first step to the last so the person is not left unsupported mid-route.',
      },
      {
        title: 'Better visibility',
        body: 'Use contrast and lighting so step edges, landings and turns are visible before the person moves.',
      },
      {
        title: 'Less fear of using the home',
        body: 'Keep important rooms accessible by making stairs and hallways feel less risky during daily routines.',
      },
    ],
    includedTitle: 'What a stair safety plan can include.',
    includedIntro:
      'We check the whole movement route, not just the staircase itself.',
    included: [
      'Continuous handrail and grab-point review',
      'Step-edge contrast and anti-slip guidance',
      'Motion lighting for stairs, halls, and landings',
      'Trip hazard and clutter review',
      'Recommendations for safer carrying and daily movement routines',
    ],
    reassuranceTitle: 'Small changes can protect an important route.',
    reassuranceBody:
      'When stairs feel unsafe, whole parts of the home can become harder to use. The focus is keeping movement routes clear, visible, and supported.',
    reassurancePoints: ['Support along the full route', 'Clearer step edges', 'Lighting where hesitation happens'],
    finalTitle: 'Make stairs feel safer before they become avoided.',
    finalBody:
      'Book a visit and we will review rails, lighting, contrast, and the full route used every day.',
  },
  'entrance-accessibility': {
    benefitsTitle: 'Reduce risk at the doorway used every day.',
    benefitsIntro:
      'Entrance safety starts at the path from outside to inside: steps, thresholds, lighting, hand support, visitors and access routines.',
    benefits: [
      {
        title: 'Safer daily access',
        body: 'Reduce awkward thresholds, steps and unsupported moments when entering or leaving the home.',
      },
      {
        title: 'Safer visitor routines',
        body: 'Reduce rushing when opening the door, receiving deliveries or speaking with visitors.',
      },
      {
        title: 'A steadier first and last step',
        body: 'Make the first and last part of every outing more predictable.',
      },
    ],
    includedTitle: 'What an entrance safety plan can include.',
    includedIntro:
      'We review the entrance as a route, from exterior lighting through the doorway and into the first safe standing area.',
    included: [
      'Threshold, step, and ramp fit review',
      'Exterior and doorway lighting guidance',
      'Support-point and handrail recommendations',
      'Door access, visitor, and key routine review',
      'Smart doorbell or access control guidance when it improves daily access',
    ],
    reassuranceTitle: 'The entrance should make leaving and arriving less risky.',
    reassuranceBody:
      'We focus on access improvements that fit the home, the person using it and the everyday arrival routine.',
    reassurancePoints: ['Safer thresholds', 'Better doorway support', 'Clearer access routines'],
    finalTitle: 'Reduce entrance risk before it limits daily outings.',
    finalBody:
      'Book a visit and we will review thresholds, lighting, support, and access options together.',
  },
  'kitchen-safety': {
    benefitsTitle: 'Reduce kitchen reach, slip and appliance risks.',
    benefitsIntro:
      'We review how the kitchen is used, then recommend only the improvements that reduce daily risk or effort.',
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
        title: 'Clearer cooking checks',
        body: 'Sensors, timers, smart plugs and optional shut-off support show what needs checking after cooking.',
      },
    ],
    includedTitle: 'Build your kitchen plan from individual services.',
    includedIntro:
      'Select the improvements that match the kitchen, see an estimate, then decide whether to upload photos or book a visit.',
    included: [
      'Non-slip preparation and anti-fatigue standing zones',
      'Easy-grip utensils, openers, and lightweight cookware',
      'Improved worktop lighting, voice lighting, and timers',
      'Selected smart plugs plus leak and gas or carbon-monoxide sensors',
      'Optional pull-down shelf, automatic stove shut-off or touchless faucet when it fits the kitchen',
    ],
    reassuranceTitle: 'A safer kitchen should still work like your kitchen.',
    reassuranceBody:
      'We keep familiar routines where possible, choose the changes that reduce risk, coordinate installation and explain how the setup works.',
    reassurancePoints: ['Daily items within safer reach', 'Clearer work and walking zones', 'Installation and explanation managed'],
    finalTitle: 'Keep cooking possible, safer, and calmer.',
    finalBody:
      'Book a visit and we will review reach, lighting, appliances, water risk, and the kitchen plan that fits the home.',
  },
  'bedroom-safety': {
    benefitsTitle: 'Reduce night-time movement risk from bed to bathroom.',
    benefitsIntro:
      'Bedroom safety matters because many risky moments happen when someone is tired, moving in low light, or trying to reach the bathroom quickly. The room is planned around steadier bed access, visible night routes, and help within reach.',
    benefits: [
      {
        title: 'Getting in and out of bed',
        body: 'Support the first movement of the day with the right bed height, clearance, bedside support and chosen aids.',
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
      'We review the room as a night-time routine: bed access, lighting, furniture, flooring, medication reach, and the path to the next room.',
    included: [
      'Bed height, bedside support, and first-step review',
      'Motion night lighting from bed to door or bathroom',
      'Clearance around furniture, rugs, cables, and walking aids',
      'Bedside emergency button, phone, or wearable alert placement',
      'Medication, water, glasses, and daily essentials within safer reach',
      'Optional smart sensor or VYVA alert support after consent and placement are checked',
    ],
    reassuranceTitle: 'Designed for safer night movement.',
    reassuranceBody:
      'The bedroom should help someone rest, move, and call for help without turning the room into a clinical space. The focus stays on night routes, support points and prevention.',
    reassurancePoints: [
      'Less risk during night bathroom trips',
      'Steadier bed entry and exit',
      'Clearer emergency access for the right helper',
    ],
    finalTitle: 'Make the bedroom safer before night routines become stressful.',
    finalBody:
      'Book a visit and we will review bed access, lighting, floor clearance, and emergency reach points.',
  },
  'smart-home-safety': {
    benefitsTitle: 'Use technology only where it reduces a named risk.',
    benefitsIntro:
      'Smart safety should not feel like a complicated smart-home project. We focus on alerts, lighting and emergency support that are agreed, explainable and useful in the daily routine.',
    benefits: [
      {
        title: 'Earlier awareness',
        body: 'Sensors can flag routine changes, leaks, smoke, doors or night movement before a small issue becomes urgent.',
      },
      {
        title: 'Faster help',
        body: 'Emergency buttons, wearable support and alerts help contact the right responder quickly.',
      },
      {
        title: 'Less daily friction',
        body: 'Voice control, motion lighting, and focused automation can reduce rushing, bending, and unnecessary movement.',
      },
    ],
    includedTitle: 'What a smart safety plan can include.',
    includedIntro:
      'We check connectivity and recommend only devices that match the person, the home and the agreed privacy level.',
    included: [
      'Motion lighting and night-route setup',
      'Emergency buttons or wearable alert guidance',
      'Leak, smoke, door, and movement sensor recommendations',
      'VYVA app and caregiver dashboard setup where included',
      'Alert preferences and privacy settings',
      'Plain safe-use explanation for the person using it',
    ],
    reassuranceTitle: 'No complicated gimmicks and no cameras by default.',
    reassuranceBody:
      'The aim is connected safety: helpful alerts, understandable controls and privacy-aware setup that everyone involved understands.',
    reassurancePoints: ['Connectivity checked first', 'Alert recipients agreed in advance', 'Setup and explanation included'],
    finalTitle: 'Add connected safety where it genuinely helps.',
    finalBody:
      'Book a visit and we will review the home, connectivity and the connected options that match the routine.',
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
  const viewDetailsLabel = language.toLowerCase().startsWith('es') ? 'Ver detalles' : 'View details'
  const [activeService, setActiveService] = useState<CasaMiaService | null>(null)

  return (
    <>
      <div className="service-kitchen-component-grid is-itemised">
        {services.map((item) => {
          const proofChips = getServiceProofChips(item, language)

          return (
            <article key={item.id}>
              <div className="service-kitchen-component-copy">
                <div className="service-kitchen-component-topline">
                  <span>{item.category}</span>
                </div>
                <h3>{item.name}</h3>
                <p>{getServicePreviewDescription(item)}</p>
              </div>
              {proofChips.length ? (
                <div className="service-kitchen-component-details">
                  <div className="services-catalogue-proof-chips" aria-label={language.toLowerCase().startsWith('es') ? 'Señales de confianza' : 'Trust signals'}>
                    {proofChips.map((chip) => <span key={chip}>{chip}</span>)}
                  </div>
                </div>
              ) : null}
              <div className="service-kitchen-component-actions">
                <button className="catalogue-item-detail-button" type="button" onClick={() => setActiveService(item)}>
                  {viewDetailsLabel}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </article>
          )
        })}
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
  language,
  orderCtaLabel,
  room,
  services,
}: {
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
          <Link className="btn btn-navy" to={plansPath}>
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

export function ServiceDetailPage() {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.toLowerCase().startsWith('es')
  const uiCopy = isSpanish ? serviceDetailUiCopy.es : serviceDetailUiCopy.en
  const sectionCopy = isSpanish
      ? {
        whatWeCheck: 'Qué revisamos',
        risksTitle: 'Centrado en los riesgos que complican la vida diaria.',
        risksBody:
          'CasaMia separa peligros visibles de mejoras con alcance definido para saber qué importa antes de comprar productos o empezar obras.',
        commonRisks: 'Riesgos habituales que buscamos',
        howWeHelp: 'Qué revisa CasaMia',
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
          'CasaMia separates visible hazards from scoped improvements, so you know what matters before buying products or starting work.',
        commonRisks: 'Common risks we look for',
        howWeHelp: 'What CasaMia checks',
        whyItHelps: 'Why it helps',
        userBenefit: 'User benefit',
        serviceWorks: 'How the service works',
        clearPlan: 'From concern to a clear plan.',
        related: 'Related services',
        otherAreas: 'Other areas to review next.',
        viewAll: 'View all services',
        finalEyebrow: 'Ready for clarity?',
      }
  const stepCopy = isSpanish ? detailStepsEs : detailSteps
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
  const serviceCatalogueItems = serviceRoomMap[service.id] ? roomServices : []
  const zoneRiskMap = isZoneRiskArea(serviceRoom) ? zoneRiskMaps[serviceRoom] : null
  const heroTitle = isKitchenService
    ? isSpanish
      ? 'Una cocina más segura, sin perder rutinas útiles.'
      : 'A safer kitchen, without losing useful routines.'
    : service.title
  const heroIntro = isKitchenService
    ? isSpanish
      ? 'Mejoras para estar de pie, iluminación, alcance, agua, electrodomésticos y rutinas con menos riesgo.'
      : 'Improvements for standing, lighting, reach, water, appliances and lower-risk routines.'
    : service.intro
  const specialistEntryPoint = `service_detail_${service.id.replace(/-/g, '_')}`
  const orderRoomLabel = servicePackageGroup?.roomLabel ?? getOrderRoomLabel(serviceRoom, i18n.language)
  const orderCtaLabel = uiCopy.orderPackage(orderRoomLabel)

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
                    to={plansPath}
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
          <Link className="btn btn-green" to={plansPath}>
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
