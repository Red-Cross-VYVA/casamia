import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  DoorOpen,
  HeartPulse,
  Lightbulb,
  LoaderCircle,
  Mail,
  MonitorCheck,
  Radar,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SafeImage } from '../components/SafeImage'
import { SEO } from '../components/SEO'
import { submitContactRequest } from '../services/contactRequests'
import { trackEvent } from '../utils/analytics'
import '../styles/assisted-living-solutions.css'

type LanguageKey = 'en' | 'es'

type AssistedLivingCopy = {
  lang: LanguageKey
  seoTitle: string
  seoDescription: string
  hero: {
    eyebrow: string
    title: string
    body: string
    primaryCta: string
    secondaryCta: string
    proof: string[]
    imageAlt: string
    visualLabel: string
    visualTitle: string
    layers: Array<{ title: string; body: string }>
  }
  outcomes: {
    eyebrow: string
    title: string
    body: string
    disclaimer: string
    items: Array<{ title: string; body: string; examples: string }>
  }
  solutions: {
    eyebrow: string
    title: string
    body: string
    link: string
    note: string
    items: Array<{ title: string; body: string }>
  }
  example: {
    eyebrow: string
    badge: string
    title: string
    body: string
    challengeLabel: string
    challenge: string
    phaseLabel: string
    phase: string
    deliverablesLabel: string
    deliverables: string[]
  }
  delivery: {
    eyebrow: string
    title: string
    body: string
    outputLabel: string
    items: Array<{ title: string; body: string; output: string }>
  }
  governance: {
    eyebrow: string
    title: string
    body: string
    points: string[]
    boundaryTitle: string
    boundaryBody: string
  }
  links: {
    eyebrow: string
    title: string
    items: Array<{ title: string; body: string; cta: string; to: string }>
  }
  faq: {
    eyebrow: string
    title: string
    items: Array<{ question: string; answer: string }>
  }
  form: {
    eyebrow: string
    title: string
    body: string
    emailLabel: string
    cardTitle: string
    cardIntro: string
    organisation: string
    role: string
    facilityType: string
    facilityPlaceholder: string
    facilityOptions: string[]
    location: string
    sites: string
    priority: string
    priorityPlaceholder: string
    priorityOptions: string[]
    timeline: string
    timelinePlaceholder: string
    timelineOptions: string[]
    name: string
    email: string
    phone: string
    message: string
    messagePlaceholder: string
    submit: string
    submitting: string
    success: string
    error: string
    note: string
    privacyPrefix: string
    privacyLink: string
  }
}

const assistedLivingCopy: Record<LanguageKey, AssistedLivingCopy> = {
  en: {
    lang: 'en',
    seoTitle: 'Assisted Living Technology & Care Home Solutions Spain',
    seoDescription:
      'CasaMia helps assisted living operators in Spain assess, select and implement senior living technology, smart rooms, safety systems and care-team workflows.',
    hero: {
      eyebrow: 'For care homes, senior living operators & municipalities',
      title: 'Safer residents. Simpler operations. One coordinated implementation partner.',
      body:
        'CasaMia helps you assess the setting, build a practical roadmap, compare technology, coordinate delivery and prepare teams—without forcing a black-box bundle.',
      primaryCta: 'Request a facility discovery',
      secondaryCta: 'See the delivery model',
      proof: ['Technology fit first', 'Privacy considered early', 'Pilot-to-rollout planning'],
      imageAlt: 'Voice-assistance device in a calm, accessible resident bedroom',
      visualLabel: 'Illustrative solution view',
      visualTitle: 'One roadmap from resident space to operator handover',
      layers: [
        { title: 'Resident spaces', body: 'Sensors, call points, lighting and voice support' },
        { title: 'Care-team workflows', body: 'Agreed alerts, response paths and clear ownership' },
        { title: 'Operator delivery', body: 'Pilot scope, rollout, training and support handover' },
      ],
    },
    outcomes: {
      eyebrow: 'Start with the outcome',
      title: 'Solve the operational problem before choosing the device.',
      body:
        'Every residence has different residents, staffing, buildings and protocols. CasaMia starts with the outcome your team needs, then explores appropriate options.',
      disclaimer:
        'Capabilities depend on the setting, consent model, connectivity, provider availability and the operator’s clinical and response responsibilities.',
      items: [
        {
          title: 'Reduce fall and night-time risk',
          body: 'Review where movement becomes uncertain and where staff need earlier, clearer signals.',
          examples: 'Examples: presence sensing, motion lighting and call points',
        },
        {
          title: 'Support care-team response',
          body: 'Turn agreed events into practical notification, escalation and follow-up workflows.',
          examples: 'Examples: alert logic, dashboard options and response paths',
        },
        {
          title: 'Improve resident and family communication',
          body: 'Make routine support and agreed updates easier without adding unnecessary complexity.',
          examples: 'Examples: voice support, reminders and consent-based updates',
        },
        {
          title: 'Modernise access and building flow',
          body: 'Coordinate safer entrances, visitor journeys, wayfinding and resident-friendly controls.',
          examples: 'Examples: access options, reception support and smart routines',
        },
      ],
    },
    solutions: {
      eyebrow: 'A connected facility roadmap',
      title: 'Bring rooms, technology and care workflows into one plan.',
      body:
        'CasaMia can compare and coordinate a modular mix of safety technology, smart-room support and implementation services. The final specification follows a setting review.',
      link: 'Explore CasaMia smart safety',
      note: 'Options are proposed only after checking fit, infrastructure, governance and day-to-day ownership.',
      items: [
        {
          title: 'Falls, movement and night risk',
          body: 'Fall-detection options, presence sensing, motion lighting and emergency call points.',
        },
        {
          title: 'Health and wellbeing support',
          body: 'Compatible vitals devices, reminders and check-in routines where responsibilities are agreed.',
        },
        {
          title: 'Resident and family communication',
          body: 'Voice support, activity prompts and agreed updates with consent and access rules defined.',
        },
        {
          title: 'Access and building flow',
          body: 'Visitor handling, wayfinding, safer entrances and smart-access options.',
        },
        {
          title: 'Care-team workflows',
          body: 'Alert routing, response logic, implementation checklists and role-based handover.',
        },
        {
          title: 'Smart-room automation',
          body: 'Lighting, sensors, voice routines and simple controls configured around real daily use.',
        },
      ],
    },
    example: {
      eyebrow: 'Example facility roadmap',
      badge: 'Illustrative—not a client case study',
      title: 'Turn one operational concern into a decision-ready pilot.',
      body:
        'A discovery should reduce uncertainty before procurement. This example shows how CasaMia can structure an initial phase without claiming a result before the setting is assessed.',
      challengeLabel: 'Starting concern',
      challenge: 'Night-time movement is difficult to observe consistently, and escalation varies by shift.',
      phaseLabel: 'Possible first phase',
      phase:
        'Review two corridors, selected rooms, call points, Wi-Fi coverage and the existing response protocol.',
      deliverablesLabel: 'What the operator receives',
      deliverables: [
        'A room and workflow priority map',
        'A reasoned comparison of suitable options',
        'A pilot scope with dependencies and exclusions',
        'A training and acceptance checklist',
      ],
    },
    delivery: {
      eyebrow: 'End-to-end delivery',
      title: 'A clear decision gate at every stage.',
      body:
        'CasaMia keeps the project connected across assessment, selection, providers, installation and team adoption—so responsibilities do not disappear between suppliers.',
      outputLabel: 'You receive',
      items: [
        {
          title: 'Understand the setting',
          body: 'Review resident needs, workflows, rooms, access, connectivity, current systems and governance constraints.',
          output: 'Setting and workflow brief',
        },
        {
          title: 'Choose the roadmap',
          body: 'Compare priorities, options, dependencies, budget ranges and whether a pilot is the right next step.',
          output: 'Prioritised roadmap or pilot brief',
        },
        {
          title: 'Coordinate delivery',
          body: 'Align selected products, providers, schedule, installation checks and acceptance criteria.',
          output: 'Delivery and acceptance plan',
        },
        {
          title: 'Enable the teams',
          body: 'Prepare staff, residents and agreed family users for operation, escalation and support.',
          output: 'Training and support handover',
        },
      ],
    },
    governance: {
      eyebrow: 'Governance & procurement',
      title: 'Clear choices before anyone commits.',
      body:
        'Technology in a care setting needs more than a product list. CasaMia makes assumptions, responsibilities and trade-offs visible before procurement and installation.',
      points: [
        'Supplier comparison with clear reasoning',
        'Compatibility and connectivity checks before procurement',
        'Consent, access and data-role questions built into the proposal',
        'Itemised scope, dependencies and exclusions',
        'Training, handover and acceptance criteria',
        'Support expectations defined for the selected solution',
      ],
      boundaryTitle: 'Responsible scope, not inflated promises',
      boundaryBody:
        'CasaMia does not promise clinical outcomes, guaranteed fall prevention or 24/7 response unless a specific contracted service and responsibility model provide it.',
    },
    links: {
      eyebrow: 'Explore the wider model',
      title: 'Go deeper where your project needs it.',
      items: [
        {
          title: 'Smart safety technology',
          body: 'See the types of sensors, voice support and connected safety CasaMia can explore.',
          cta: 'Explore technology',
          to: '/tech',
        },
        {
          title: 'Delivery network',
          body: 'Understand how CasaMia works with specialist local providers and quality standards.',
          cta: 'See provider model',
          to: '/provider-partners',
        },
        {
          title: 'Practical resources',
          body: 'Use guides and tools covering safer environments, planning and family decisions.',
          cta: 'Browse resources',
          to: '/blog',
        },
      ],
    },
    faq: {
      eyebrow: 'Operator questions',
      title: 'What teams usually need to know before discovery.',
      items: [
        {
          question: 'Can CasaMia work with systems we already use?',
          answer:
            'Potentially. The first review maps current systems, contracts, connectivity and data responsibilities. CasaMia then identifies what may be retained, what needs technical confirmation and where a new option may be justified.',
        },
        {
          question: 'Do we need to start with a full-facility rollout?',
          answer:
            'No. A focused pilot may be the more responsible first step when the use case, workflow or infrastructure needs validation. The roadmap should define what the pilot is intended to learn and the criteria for moving forward.',
        },
        {
          question: 'Who is responsible for privacy and resident consent?',
          answer:
            'The operator remains responsible for its legal and clinical duties. CasaMia can help surface data flows, access roles, consent questions and supplier documentation so the appropriate operator advisers can review them.',
        },
        {
          question: 'Is staff training included?',
          answer:
            'Training and handover requirements are scoped with the solution. The proposal should state who is trained, what materials are provided, how acceptance is recorded and what support applies afterwards.',
        },
        {
          question: 'Can the roadmap cover multiple sites?',
          answer:
            'Yes, subject to location, provider coverage and technical fit. A multi-site plan can distinguish common standards from site-specific constraints and sequence rollout in manageable phases.',
        },
        {
          question: 'How is pricing established?',
          answer:
            'Pricing follows discovery because building layout, resident needs, existing systems, integration effort, training and support all affect scope. CasaMia can provide options and budget ranges before a final commitment.',
        },
      ],
    },
    form: {
      eyebrow: 'Facility project discovery',
      title: 'Tell us what your team is trying to improve.',
      body:
        'Share the setting, priority and timing. CasaMia will use that context to decide whether a remote discovery, site review or focused pilot conversation is the most useful next step.',
      emailLabel: 'Prefer email?',
      cardTitle: 'Request a facility discovery',
      cardIntro: 'Fields marked with * are required. This form is for operator and organisation projects.',
      organisation: 'Organisation *',
      role: 'Your role',
      facilityType: 'Facility type *',
      facilityPlaceholder: 'Select a facility type',
      facilityOptions: ['Care home', 'Assisted living residence', 'Senior housing', 'Municipal programme', 'Other'],
      location: 'City or region *',
      sites: 'Number of sites or residents',
      priority: 'Main priority *',
      priorityPlaceholder: 'Select the main priority',
      priorityOptions: [
        'Fall and night-time risk',
        'Care-team response workflows',
        'Resident and family communication',
        'Access and building flow',
        'Smart-room modernisation',
        'Multi-site technology roadmap',
        'Not sure yet',
      ],
      timeline: 'Project timing *',
      timelinePlaceholder: 'Select an approximate timing',
      timelineOptions: ['Exploring now', 'Within 3 months', 'Within 6 months', 'Within 12 months', 'No fixed timing'],
      name: 'Name *',
      email: 'Work email *',
      phone: 'Phone',
      message: 'What would make this project useful?',
      messagePlaceholder: 'Tell us about the setting, current challenge or decision your team needs to make.',
      submit: 'Send facility enquiry',
      submitting: 'Sending enquiry…',
      success: 'Thank you. Your facility enquiry has been received.',
      error: 'We could not send the enquiry. Please try again or email hola@casamia.com.es.',
      note: 'No obligation. CasaMia will only use these details to respond to this project enquiry.',
      privacyPrefix: 'By sending this enquiry, you acknowledge our',
      privacyLink: 'Privacy Policy',
    },
  },
  es: {
    lang: 'es',
    seoTitle: 'Tecnología para residencias y senior living en España',
    seoDescription:
      'CasaMia ayuda a residencias y operadores de senior living en España a evaluar, seleccionar e implantar tecnología, habitaciones inteligentes y flujos de atención.',
    hero: {
      eyebrow: 'Para residencias, operadores de senior living y municipios',
      title: 'Residentes más seguros. Operaciones más sencillas. Un socio que coordina la implantación.',
      body:
        'CasaMia ayuda a evaluar el centro, definir una hoja de ruta práctica, comparar tecnología, coordinar la ejecución y preparar a los equipos, sin imponer una solución cerrada.',
      primaryCta: 'Solicitar una sesión para el centro',
      secondaryCta: 'Ver el modelo de trabajo',
      proof: ['Primero, el encaje real', 'Privacidad desde el inicio', 'Del piloto al despliegue'],
      imageAlt: 'Dispositivo de asistencia por voz en una habitación tranquila y accesible',
      visualLabel: 'Vista ilustrativa de la solución',
      visualTitle: 'Una hoja de ruta desde la habitación hasta la entrega al operador',
      layers: [
        { title: 'Espacios de residentes', body: 'Sensores, pulsadores, iluminación y apoyo por voz' },
        { title: 'Flujos del equipo asistencial', body: 'Alertas acordadas, respuesta y responsables claros' },
        { title: 'Implantación del operador', body: 'Piloto, despliegue, formación y soporte' },
      ],
    },
    outcomes: {
      eyebrow: 'Empezar por el resultado',
      title: 'Resolver el problema operativo antes de elegir el dispositivo.',
      body:
        'Cada residencia tiene residentes, equipos, edificios y protocolos distintos. CasaMia parte del resultado que necesita el centro y después estudia las opciones adecuadas.',
      disclaimer:
        'Las capacidades dependen del centro, el consentimiento, la conectividad, la disponibilidad de proveedores y las responsabilidades clínicas y de respuesta del operador.',
      items: [
        {
          title: 'Reducir el riesgo de caídas y por la noche',
          body: 'Revisar dónde el movimiento es más incierto y dónde el equipo necesita señales más tempranas y claras.',
          examples: 'Ejemplos: presencia, iluminación por movimiento y pulsadores',
        },
        {
          title: 'Apoyar la respuesta del equipo',
          body: 'Convertir eventos acordados en avisos, escalado y seguimiento que funcionen en la práctica.',
          examples: 'Ejemplos: lógica de alertas, paneles y rutas de respuesta',
        },
        {
          title: 'Mejorar la comunicación',
          body: 'Facilitar el apoyo diario y las actualizaciones acordadas sin añadir complejidad innecesaria.',
          examples: 'Ejemplos: voz, recordatorios y avisos con consentimiento',
        },
        {
          title: 'Modernizar accesos y circulación',
          body: 'Coordinar entradas más seguras, visitas, orientación y controles fáciles de usar.',
          examples: 'Ejemplos: accesos, recepción y rutinas inteligentes',
        },
      ],
    },
    solutions: {
      eyebrow: 'Una hoja de ruta conectada',
      title: 'Integrar habitaciones, tecnología y flujos asistenciales en un solo plan.',
      body:
        'CasaMia puede comparar y coordinar una combinación modular de tecnología de seguridad, habitaciones inteligentes y servicios de implantación. La especificación final se define tras revisar el centro.',
      link: 'Explorar la seguridad inteligente',
      note: 'Las opciones se plantean después de revisar encaje, infraestructura, gobierno y responsables del uso diario.',
      items: [
        {
          title: 'Caídas, movimiento y riesgo nocturno',
          body: 'Opciones de detección de caídas, presencia, iluminación por movimiento y pulsadores.',
        },
        {
          title: 'Apoyo a salud y bienestar',
          body: 'Dispositivos compatibles de constantes, recordatorios y rutinas cuando las responsabilidades están acordadas.',
        },
        {
          title: 'Comunicación con residentes y familias',
          body: 'Apoyo por voz, actividades y avisos acordados con reglas de consentimiento y acceso.',
        },
        {
          title: 'Accesos y circulación del edificio',
          body: 'Gestión de visitas, orientación, entradas más seguras y opciones de acceso inteligente.',
        },
        {
          title: 'Flujos del equipo asistencial',
          body: 'Alertas, lógica de respuesta, listas de implantación y entrega por roles.',
        },
        {
          title: 'Habitaciones inteligentes',
          body: 'Iluminación, sensores, rutinas por voz y controles sencillos adaptados al uso real.',
        },
      ],
    },
    example: {
      eyebrow: 'Ejemplo de hoja de ruta',
      badge: 'Ejemplo ilustrativo, no un caso de cliente',
      title: 'Convertir una preocupación operativa en un piloto listo para decidir.',
      body:
        'Una sesión inicial debe reducir la incertidumbre antes de comprar. Este ejemplo muestra cómo CasaMia puede estructurar una primera fase sin prometer resultados antes de evaluar el centro.',
      challengeLabel: 'Preocupación inicial',
      challenge: 'El movimiento nocturno no se observa de forma uniforme y el escalado cambia según el turno.',
      phaseLabel: 'Posible primera fase',
      phase:
        'Revisar dos pasillos, habitaciones seleccionadas, pulsadores, cobertura Wi-Fi y el protocolo de respuesta actual.',
      deliverablesLabel: 'Qué recibe el operador',
      deliverables: [
        'Mapa de prioridades por espacios y flujos',
        'Comparativa razonada de opciones adecuadas',
        'Alcance de piloto con dependencias y exclusiones',
        'Lista de formación y aceptación',
      ],
    },
    delivery: {
      eyebrow: 'Implantación de principio a fin',
      title: 'Una decisión clara en cada etapa.',
      body:
        'CasaMia mantiene unido el proyecto entre evaluación, selección, proveedores, instalación y adopción por el equipo, para que las responsabilidades no se pierdan entre empresas.',
      outputLabel: 'Se entrega',
      items: [
        {
          title: 'Entender el centro',
          body: 'Revisar residentes, flujos, espacios, accesos, conectividad, sistemas actuales y límites de gobierno.',
          output: 'Documento de centro y flujos',
        },
        {
          title: 'Elegir la hoja de ruta',
          body: 'Comparar prioridades, opciones, dependencias, rangos de presupuesto y si conviene empezar con un piloto.',
          output: 'Hoja de ruta o propuesta de piloto',
        },
        {
          title: 'Coordinar la ejecución',
          body: 'Alinear productos, proveedores, calendario, comprobaciones y criterios de aceptación.',
          output: 'Plan de ejecución y aceptación',
        },
        {
          title: 'Preparar a los equipos',
          body: 'Formar a personal, residentes y familiares autorizados sobre uso, escalado y soporte.',
          output: 'Formación y entrega de soporte',
        },
      ],
    },
    governance: {
      eyebrow: 'Gobierno y compras',
      title: 'Decisiones claras antes de comprometerse.',
      body:
        'La tecnología en una residencia necesita más que una lista de productos. CasaMia hace visibles los supuestos, responsabilidades y decisiones antes de comprar e instalar.',
      points: [
        'Comparación de proveedores con criterios claros',
        'Comprobaciones de compatibilidad y conectividad',
        'Consentimiento, accesos y roles de datos en la propuesta',
        'Alcance, dependencias y exclusiones desglosados',
        'Formación, entrega y criterios de aceptación',
        'Expectativas de soporte definidas para la solución',
      ],
      boundaryTitle: 'Un alcance responsable, sin promesas infladas',
      boundaryBody:
        'CasaMia no promete resultados clínicos, prevención garantizada de caídas ni respuesta 24/7 salvo que exista un servicio contratado y un modelo de responsabilidad que lo proporcionen.',
    },
    links: {
      eyebrow: 'Explorar el modelo',
      title: 'Profundiza donde lo necesite el proyecto.',
      items: [
        {
          title: 'Tecnología de seguridad inteligente',
          body: 'Conoce sensores, apoyo por voz y seguridad conectada que CasaMia puede estudiar.',
          cta: 'Explorar tecnología',
          to: '/tech',
        },
        {
          title: 'Red de ejecución',
          body: 'Descubre cómo CasaMia trabaja con proveedores especializados y criterios de calidad.',
          cta: 'Ver modelo de proveedores',
          to: '/provider-partners',
        },
        {
          title: 'Recursos prácticos',
          body: 'Utiliza guías y herramientas sobre entornos más seguros, planificación y decisiones familiares.',
          cta: 'Ver recursos',
          to: '/blog',
        },
      ],
    },
    faq: {
      eyebrow: 'Preguntas de operadores',
      title: 'Lo que los equipos suelen necesitar saber antes de empezar.',
      items: [
        {
          question: '¿Puede CasaMia trabajar con los sistemas que ya utilizamos?',
          answer:
            'Es posible. La primera revisión identifica sistemas, contratos, conectividad y responsabilidades de datos. Después se aclara qué puede mantenerse, qué necesita validación técnica y dónde puede justificarse una opción nueva.',
        },
        {
          question: '¿Tenemos que empezar con todo el centro?',
          answer:
            'No. Un piloto limitado puede ser el primer paso más responsable cuando hay que validar el uso, el flujo o la infraestructura. La hoja de ruta debe definir qué se quiere aprender y los criterios para avanzar.',
        },
        {
          question: '¿Quién responde de la privacidad y el consentimiento?',
          answer:
            'El operador mantiene sus obligaciones legales y clínicas. CasaMia puede ayudar a identificar flujos de datos, roles de acceso, preguntas de consentimiento y documentación de proveedores para que los asesores del operador los revisen.',
        },
        {
          question: '¿Se incluye formación del personal?',
          answer:
            'La formación y la entrega se definen con la solución. La propuesta debe indicar quién recibe formación, qué materiales se entregan, cómo se acepta el sistema y qué soporte se aplica después.',
        },
        {
          question: '¿La hoja de ruta puede cubrir varios centros?',
          answer:
            'Sí, según ubicación, cobertura de proveedores y encaje técnico. Un plan multientro puede separar los estándares comunes de las limitaciones de cada centro y ordenar el despliegue por fases.',
        },
        {
          question: '¿Cómo se calcula el precio?',
          answer:
            'El precio se define después de la sesión inicial porque el edificio, los residentes, los sistemas existentes, la integración, la formación y el soporte cambian el alcance. Antes del compromiso final pueden plantearse opciones y rangos.',
        },
      ],
    },
    form: {
      eyebrow: 'Sesión para proyectos de centros',
      title: 'Cuéntanos qué quiere mejorar tu equipo.',
      body:
        'Comparte el tipo de centro, la prioridad y los plazos. CasaMia utilizará ese contexto para valorar si conviene una sesión remota, una visita o una conversación sobre un piloto.',
      emailLabel: '¿Prefieres escribir?',
      cardTitle: 'Solicitar una sesión para el centro',
      cardIntro: 'Los campos con * son obligatorios. Este formulario es para operadores y organizaciones.',
      organisation: 'Organización *',
      role: 'Tu cargo',
      facilityType: 'Tipo de centro *',
      facilityPlaceholder: 'Selecciona un tipo de centro',
      facilityOptions: ['Residencia', 'Vivienda asistida', 'Senior living', 'Programa municipal', 'Otro'],
      location: 'Ciudad o región *',
      sites: 'Número de centros o residentes',
      priority: 'Prioridad principal *',
      priorityPlaceholder: 'Selecciona la prioridad principal',
      priorityOptions: [
        'Caídas y riesgo nocturno',
        'Respuesta del equipo asistencial',
        'Comunicación con residentes y familias',
        'Accesos y circulación del edificio',
        'Modernización de habitaciones',
        'Hoja de ruta para varios centros',
        'Todavía no lo sabemos',
      ],
      timeline: 'Plazo del proyecto *',
      timelinePlaceholder: 'Selecciona un plazo aproximado',
      timelineOptions: ['En fase de exploración', 'En 3 meses', 'En 6 meses', 'En 12 meses', 'Sin plazo definido'],
      name: 'Nombre *',
      email: 'Email profesional *',
      phone: 'Teléfono',
      message: '¿Qué haría útil este proyecto?',
      messagePlaceholder: 'Describe el centro, el reto actual o la decisión que necesita tomar el equipo.',
      submit: 'Enviar consulta del centro',
      submitting: 'Enviando consulta…',
      success: 'Gracias. Hemos recibido la consulta del centro.',
      error: 'No hemos podido enviar la consulta. Inténtalo de nuevo o escribe a hola@casamia.com.es.',
      note: 'Sin compromiso. CasaMia solo utilizará estos datos para responder a esta consulta.',
      privacyPrefix: 'Al enviar esta consulta, confirmas que has leído nuestra',
      privacyLink: 'Política de privacidad',
    },
  },
}

const outcomeIcons: LucideIcon[] = [Radar, BellRing, UsersRound, DoorOpen]
const solutionIcons: LucideIcon[] = [ShieldCheck, HeartPulse, UsersRound, Building2, ClipboardCheck, Lightbulb]
const visualIcons: LucideIcon[] = [Sparkles, MonitorCheck, BadgeCheck]

function getLanguageKey(language: string): LanguageKey {
  return language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function AssistedLivingSolutionsPage() {
  const { i18n } = useTranslation()
  const languageKey = getLanguageKey(i18n.language)
  const copy = assistedLivingCopy[languageKey]
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': 'https://casamia.es/assisted-living-solutions#service',
        name: copy.seoTitle,
        description: copy.seoDescription,
        url: 'https://casamia.es/assisted-living-solutions',
        serviceType: 'Assisted living technology assessment and implementation coordination',
        inLanguage: copy.lang,
        provider: {
          '@type': 'Organization',
          name: 'CasaMia',
          url: 'https://casamia.es',
        },
        areaServed: {
          '@type': 'Country',
          name: 'Spain',
        },
        audience: {
          '@type': 'BusinessAudience',
          audienceType: 'Care homes, assisted living operators, senior housing providers and municipalities',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://casamia.es/assisted-living-solutions#faq',
        inLanguage: copy.lang,
        mainEntity: copy.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const organisation = String(formData.get('organisation') ?? '').trim()
    const role = String(formData.get('role') ?? '').trim()
    const facilityType = String(formData.get('facilityType') ?? '').trim()
    const location = String(formData.get('location') ?? '').trim()
    const sites = String(formData.get('sites') ?? '').trim()
    const priority = String(formData.get('priority') ?? '').trim()
    const timeline = String(formData.get('timeline') ?? '').trim()
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const notes = String(formData.get('message') ?? '').trim()

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitted(false)

    try {
      await submitContactRequest({
        name,
        email,
        phone,
        plan: 'Assisted living / operator project',
        message: [
          `Organisation: ${organisation}`,
          `Role: ${role || 'Not provided'}`,
          `Facility type: ${facilityType}`,
          `Location: ${location}`,
          `Sites or residents: ${sites || 'Not provided'}`,
          `Priority: ${priority}`,
          `Timeline: ${timeline}`,
          `Project notes: ${notes || 'Not provided'}`,
        ].join('\n'),
        source: 'assisted-living-solutions',
      })

      trackEvent('facility_enquiry_submitted', {
        facility_type: facilityType,
        language: languageKey,
        priority,
      })
      form.reset()
      setSubmitted(true)
    } catch (error) {
      console.error('CasaMia facility enquiry failed', error)
      setSubmitError(copy.form.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <SEO
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/assisted-living-solutions"
        schema={schema}
      />

      <div className="als-page" lang={copy.lang}>
        <section className="als-hero" aria-labelledby="als-page-title">
          <div className="als-hero-grid site-shell">
            <div className="als-hero-copy">
              <span className="eyebrow als-eyebrow-on-dark">
                <span className="dot" aria-hidden="true" />
                {copy.hero.eyebrow}
              </span>
              <h1 id="als-page-title">{copy.hero.title}</h1>
              <p>{copy.hero.body}</p>
              <div className="als-hero-actions">
                <a
                  className="btn btn-green"
                  href="#facility-enquiry"
                  onClick={() => trackEvent('facility_discovery_started', { location: 'assisted_hero' })}
                >
                  {copy.hero.primaryCta}
                  <ArrowRight size={20} aria-hidden="true" />
                </a>
                <a className="btn btn-white" href="#delivery-model">
                  {copy.hero.secondaryCta}
                </a>
              </div>
              <ul className="als-proof-list" aria-label={copy.hero.proof.join(', ')}>
                {copy.hero.proof.map((item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="als-hero-visual">
              <SafeImage
                src="/images/service-gallery/11-voice-controls-and-smart-routines.jpg"
                alt={copy.hero.imageAlt}
                className="als-hero-image"
                imgClassName="als-hero-image-img"
                loading="eager"
              />
              <div className="als-system-card">
                <span className="als-system-label">{copy.hero.visualLabel}</span>
                <h2>{copy.hero.visualTitle}</h2>
                <ol>
                  {copy.hero.layers.map((layer, index) => {
                    const Icon = visualIcons[index] ?? BadgeCheck

                    return (
                      <li key={layer.title}>
                        <span>
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <div>
                          <strong>{layer.title}</strong>
                          <small>{layer.body}</small>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="als-section als-outcomes" aria-labelledby="als-outcomes-title">
          <div className="site-shell">
            <div className="als-section-heading">
              <p className="eyebrow">{copy.outcomes.eyebrow}</p>
              <h2 id="als-outcomes-title">{copy.outcomes.title}</h2>
              <p>{copy.outcomes.body}</p>
            </div>

            <div className="als-outcome-grid">
              {copy.outcomes.items.map((item, index) => {
                const Icon = outcomeIcons[index] ?? ShieldCheck

                return (
                  <article key={item.title}>
                    <span className="als-card-icon">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <small>{item.examples}</small>
                  </article>
                )
              })}
            </div>

            <p className="als-scope-note">
              <ShieldCheck size={18} aria-hidden="true" />
              {copy.outcomes.disclaimer}
            </p>
          </div>
        </section>

        <section className="als-section als-solutions" aria-labelledby="als-solutions-title">
          <div className="site-shell als-solutions-layout">
            <div className="als-solutions-copy">
              <p className="eyebrow als-eyebrow-on-dark">{copy.solutions.eyebrow}</p>
              <h2 id="als-solutions-title">{copy.solutions.title}</h2>
              <p>{copy.solutions.body}</p>
              <Link className="als-text-link" to="/tech">
                {copy.solutions.link}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <div className="als-solutions-note">
                <Wifi size={21} aria-hidden="true" />
                <span>{copy.solutions.note}</span>
              </div>
            </div>

            <div className="als-solution-grid">
              {copy.solutions.items.map((item, index) => {
                const Icon = solutionIcons[index] ?? ShieldCheck

                return (
                  <article key={item.title}>
                    <Icon size={22} aria-hidden="true" />
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="als-section als-example" aria-labelledby="als-example-title">
          <div className="site-shell als-example-layout">
            <div className="als-example-copy">
              <p className="eyebrow">{copy.example.eyebrow}</p>
              <span className="als-example-badge">{copy.example.badge}</span>
              <h2 id="als-example-title">{copy.example.title}</h2>
              <p>{copy.example.body}</p>
            </div>

            <div className="als-roadmap-card">
              <div className="als-roadmap-stage is-challenge">
                <span>01</span>
                <div>
                  <small>{copy.example.challengeLabel}</small>
                  <p>{copy.example.challenge}</p>
                </div>
              </div>
              <div className="als-roadmap-stage is-phase">
                <span>02</span>
                <div>
                  <small>{copy.example.phaseLabel}</small>
                  <p>{copy.example.phase}</p>
                </div>
              </div>
              <div className="als-roadmap-deliverables">
                <small>{copy.example.deliverablesLabel}</small>
                <ul>
                  {copy.example.deliverables.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="als-section als-delivery" id="delivery-model" aria-labelledby="als-delivery-title">
          <div className="site-shell">
            <div className="als-delivery-heading">
              <div>
                <p className="eyebrow">{copy.delivery.eyebrow}</p>
                <h2 id="als-delivery-title">{copy.delivery.title}</h2>
              </div>
              <p>{copy.delivery.body}</p>
            </div>

            <ol className="als-delivery-list">
              {copy.delivery.items.map((item, index) => (
                <li key={item.title}>
                  <span className="als-step-number">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <div>
                    <small>{copy.delivery.outputLabel}</small>
                    <strong>{item.output}</strong>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="als-section als-governance" aria-labelledby="als-governance-title">
          <div className="site-shell als-governance-panel">
            <div>
              <p className="eyebrow als-eyebrow-on-dark">{copy.governance.eyebrow}</p>
              <h2 id="als-governance-title">{copy.governance.title}</h2>
              <p>{copy.governance.body}</p>
              <div className="als-boundary-card">
                <ShieldCheck size={23} aria-hidden="true" />
                <div>
                  <strong>{copy.governance.boundaryTitle}</strong>
                  <p>{copy.governance.boundaryBody}</p>
                </div>
              </div>
            </div>
            <ul>
              {copy.governance.points.map((point) => (
                <li key={point}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="als-section als-links" aria-labelledby="als-links-title">
          <div className="site-shell">
            <div className="als-section-heading is-centered">
              <p className="eyebrow">{copy.links.eyebrow}</p>
              <h2 id="als-links-title">{copy.links.title}</h2>
            </div>
            <div className="als-link-grid">
              {copy.links.items.map((item) => (
                <Link key={item.title} to={item.to}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <span>
                    {item.cta}
                    <ArrowRight size={17} aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="als-section als-faq" aria-labelledby="als-faq-title">
          <div className="site-shell als-faq-layout">
            <div className="als-faq-heading">
              <p className="eyebrow">{copy.faq.eyebrow}</p>
              <h2 id="als-faq-title">{copy.faq.title}</h2>
            </div>
            <div className="als-faq-list">
              {copy.faq.items.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="als-enquiry" id="facility-enquiry" aria-labelledby="als-enquiry-title">
          <div className="site-shell als-enquiry-layout">
            <div className="als-enquiry-copy">
              <p className="eyebrow als-eyebrow-on-dark">{copy.form.eyebrow}</p>
              <h2 id="als-enquiry-title">{copy.form.title}</h2>
              <p>{copy.form.body}</p>
              <a
                className="als-email-link"
                href="mailto:hola@casamia.com.es?subject=Assisted%20living%20facility%20project"
                onClick={() => trackEvent('email_clicked', { location: 'assisted_living_enquiry' })}
              >
                <Mail size={20} aria-hidden="true" />
                <span>
                  <small>{copy.form.emailLabel}</small>
                  <strong>hola@casamia.com.es</strong>
                </span>
              </a>
            </div>

            <form className="als-enquiry-form" onSubmit={handleSubmit}>
              <div className="als-form-heading">
                <h3>{copy.form.cardTitle}</h3>
                <p>{copy.form.cardIntro}</p>
              </div>

              <div className="als-form-grid">
                <FacilityField label={copy.form.organisation} name="organisation" required />
                <FacilityField label={copy.form.role} name="role" />
                <label>
                  <span>{copy.form.facilityType}</span>
                  <select name="facilityType" required defaultValue="">
                    <option value="" disabled>
                      {copy.form.facilityPlaceholder}
                    </option>
                    {copy.form.facilityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <FacilityField label={copy.form.location} name="location" required />
                <FacilityField label={copy.form.sites} name="sites" />
                <label>
                  <span>{copy.form.priority}</span>
                  <select name="priority" required defaultValue="">
                    <option value="" disabled>
                      {copy.form.priorityPlaceholder}
                    </option>
                    {copy.form.priorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{copy.form.timeline}</span>
                  <select name="timeline" required defaultValue="">
                    <option value="" disabled>
                      {copy.form.timelinePlaceholder}
                    </option>
                    {copy.form.timelineOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <FacilityField label={copy.form.name} name="name" required />
                <FacilityField label={copy.form.email} name="email" type="email" required />
                <FacilityField label={copy.form.phone} name="phone" type="tel" />
                <label className="als-form-wide">
                  <span>{copy.form.message}</span>
                  <textarea name="message" rows={5} placeholder={copy.form.messagePlaceholder} />
                </label>
              </div>

              <p className="als-form-privacy">
                {copy.form.privacyPrefix}{' '}
                <Link to="/privacy-policy">{copy.form.privacyLink}</Link>.
              </p>

              <button className="btn btn-green als-form-submit" disabled={isSubmitting} type="submit">
                {isSubmitting ? copy.form.submitting : copy.form.submit}
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin" size={20} aria-hidden="true" />
                ) : (
                  <ArrowRight size={20} aria-hidden="true" />
                )}
              </button>

              {submitError ? (
                <p className="als-form-message is-error" role="alert">
                  <AlertCircle size={19} aria-hidden="true" />
                  {submitError}
                </p>
              ) : null}
              {submitted ? (
                <p className="als-form-message is-success" role="status">
                  <CheckCircle2 size={19} aria-hidden="true" />
                  {copy.form.success}
                </p>
              ) : null}
              <p className="als-form-note">{copy.form.note}</p>
            </form>
          </div>
        </section>
      </div>
    </>
  )
}

function FacilityField({
  label,
  name,
  required,
  type = 'text',
}: {
  label: string
  name: string
  required?: boolean
  type?: 'email' | 'tel' | 'text'
}) {
  return (
    <label>
      <span>{label}</span>
      <input name={name} required={required} type={type} />
    </label>
  )
}
