import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleCheckBig,
  ClipboardCheck,
  HeartPulse,
  House,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageCircle,
  MonitorCheck,
  PhoneCall,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserPlus,
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
  ecosystem: {
    eyebrow: string
    title: string
    body: string
    summary: string
    resident: { title: string; body: string; status: string }
    platform: { title: string; body: string; signals: string[] }
    operator: { title: string; body: string }
    caregiver: { title: string; body: string }
    family: { title: string; body: string }
    telehealth: { title: string; body: string }
  }
  onboarding: {
    eyebrow: string
    title: string
    body: string
    support: string
    readyTitle: string
    readyBody: string
    steps: Array<{ title: string; body: string }>
  }
  interfaces: {
    eyebrow: string
    title: string
    body: string
    operator: {
      eyebrow: string
      title: string
      body: string
      live: string
      metrics: Array<{ value: string; label: string }>
      residentsTitle: string
      residents: Array<{ name: string; detail: string; status: string }>
      alertsTitle: string
      alerts: Array<{ title: string; detail: string; tone: 'attention' | 'good' | 'info' }>
    }
    caregiver: {
      eyebrow: string
      title: string
      body: string
      greeting: string
      shift: string
      priorities: string
      residents: Array<{ initials: string; name: string; task: string; status: string }>
      actions: string[]
    }
  }
  workflow: {
    eyebrow: string
    title: string
    body: string
    steps: Array<{ title: string; body: string }>
  }
  trust: {
    items: Array<{ title: string; body: string }>
    boundary: string
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
    optionalDetails: string
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
      eyebrow: 'One friendly system for the whole residence',
      title: 'One connected system for residents, care teams and operators.',
      body:
        'CasaMia brings resident devices, daily care and operational oversight into one clear, easy-to-use ecosystem.',
      primaryCta: 'Request a facility demo',
      secondaryCta: 'See easy onboarding',
      proof: ['Works with your current tools', 'Role-based views', 'Guided rollout'],
      imageAlt: 'Voice-assistance device in a calm, accessible resident bedroom',
      visualLabel: 'Illustrative solution view',
      visualTitle: 'One roadmap from resident space to operator handover',
      layers: [
        { title: 'Resident spaces', body: 'Sensors, call points, lighting and voice support' },
        { title: 'Care-team workflows', body: 'Agreed alerts, response paths and clear ownership' },
        { title: 'Operator delivery', body: 'Pilot scope, rollout, training and support handover' },
      ],
    },
    ecosystem: {
      eyebrow: 'The CasaMia ecosystem',
      title: 'Every person, device and action in one clear flow.',
      body:
        'Resident spaces connect to the people who need the right information—without making every user learn the same complex system.',
      summary:
        'Resident rooms and devices connect through the CasaMia platform to an operator dashboard, caregiver mobile app, family visibility and telehealth.',
      resident: {
        title: 'Resident spaces',
        body: 'Voice, call points, safety sensors, vitals and supportive routines.',
        status: 'Connected around the resident',
      },
      platform: {
        title: 'CasaMia platform',
        body: 'One permission-based flow for people, devices, alerts and actions.',
        signals: ['Residents', 'Devices', 'Alerts', 'Actions'],
      },
      operator: {
        title: 'Operator dashboard',
        body: 'Sites, residents, device status, alerts, tasks and oversight.',
      },
      caregiver: {
        title: 'Caregiver app',
        body: 'Priorities, check-ins, notes, handovers and escalation.',
      },
      family: {
        title: 'Family visibility',
        body: 'Agreed updates and reassurance, based on consent.',
      },
      telehealth: {
        title: 'Telehealth',
        body: 'Simple access to scheduled remote consultations.',
      },
    },
    onboarding: {
      eyebrow: 'Easy resident onboarding',
      title: 'From new resident to ready-to-support in four clear steps.',
      body: 'Use guided setup and reusable templates instead of rebuilding the workflow every time.',
      support: 'CasaMia guides setup, training and rollout—site by site.',
      readyTitle: 'Resident ready',
      readyBody: 'Team invited · permissions checked · routines active',
      steps: [
        { title: 'Add the resident', body: 'Profile, room and support preferences.' },
        { title: 'Assign the care circle', body: 'Team, family and role-based access.' },
        { title: 'Connect services', body: 'Devices, routines and alert routes.' },
        { title: 'Invite and activate', body: 'App access, checks and a clear handover.' },
      ],
    },
    interfaces: {
      eyebrow: 'Friendly by design',
      title: 'One platform. Two simple views.',
      body: 'Operators keep oversight; caregivers see exactly what matters for their shift.',
      operator: {
        eyebrow: 'Illustrative operator view',
        title: 'The residence at a glance',
        body: 'See what needs attention without chasing separate systems.',
        live: 'Operational view',
        metrics: [
          { value: 'Live', label: 'Resident overview' },
          { value: 'Prioritised', label: 'Needs attention' },
          { value: 'Visible', label: 'Device status' },
          { value: 'Tracked', label: 'Shift actions' },
        ],
        residentsTitle: 'Resident overview',
        residents: [
          { name: 'Room 204', detail: 'Morning check-in', status: 'Ready' },
          { name: 'Room 118', detail: 'Hydration routine', status: 'Due' },
          { name: 'Room 306', detail: 'Night route', status: 'Stable' },
        ],
        alertsTitle: 'Activity',
        alerts: [
          { title: 'Night-route review', detail: 'Assigned to the right caregiver', tone: 'attention' },
          { title: 'Vitals routine', detail: 'Reading recorded', tone: 'info' },
          { title: 'Morning support', detail: 'Completed and handed over', tone: 'good' },
        ],
      },
      caregiver: {
        eyebrow: 'Illustrative caregiver app',
        title: 'The right information, in the caregiver’s pocket.',
        body: 'Each caregiver sees the residents, priorities and actions relevant to their shift.',
        greeting: 'Good morning',
        shift: 'Morning shift',
        priorities: 'Today’s priorities',
        residents: [
          { initials: '204', name: 'Room 204', task: 'Morning check-in', status: 'Now' },
          { initials: '118', name: 'Room 118', task: 'Hydration reminder', status: '10:30' },
          { initials: '306', name: 'Room 306', task: 'Routine completed', status: 'Done' },
        ],
        actions: ['Acknowledge', 'Add note', 'Call team'],
      },
    },
    workflow: {
      eyebrow: 'Smooth daily operations',
      title: 'From an event to a closed action—without losing the thread.',
      body: 'A simple flow keeps the resident, caregiver and operator aligned.',
      steps: [
        { title: 'Resident event', body: 'A request, routine or agreed signal.' },
        { title: 'Right person alerted', body: 'Priority and responsibility are clear.' },
        { title: 'Action recorded', body: 'Notes and status stay with the event.' },
        { title: 'Operator retains oversight', body: 'Follow-up remains visible across the site.' },
      ],
    },
    trust: {
      items: [
        { title: 'Role-based access', body: 'Each user sees only what their role requires.' },
        { title: 'Consent and privacy', body: 'Permissions and visibility are agreed before launch.' },
        { title: 'Guided onboarding', body: 'CasaMia supports setup, training and handover.' },
      ],
      boundary:
        'Illustrative interface views. Final capabilities depend on the agreed system, integrations, devices, connectivity and response responsibilities.',
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
      optionalDetails: 'Add optional project details',
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
      eyebrow: 'Un sistema sencillo para toda la residencia',
      title: 'Un único sistema conectado para residentes, equipos y operadores.',
      body:
        'CasaMia reúne los dispositivos del residente, la atención diaria y la gestión del centro en un ecosistema claro y fácil de usar.',
      primaryCta: 'Solicitar una demo',
      secondaryCta: 'Ver la incorporación',
      proof: ['Compatible con tus herramientas', 'Vistas según el rol', 'Despliegue guiado'],
      imageAlt: 'Dispositivo de asistencia por voz en una habitación tranquila y accesible',
      visualLabel: 'Vista ilustrativa de la solución',
      visualTitle: 'Una hoja de ruta desde la habitación hasta la entrega al operador',
      layers: [
        { title: 'Espacios de residentes', body: 'Sensores, pulsadores, iluminación y apoyo por voz' },
        { title: 'Flujos del equipo asistencial', body: 'Alertas acordadas, respuesta y responsables claros' },
        { title: 'Implantación del operador', body: 'Piloto, despliegue, formación y soporte' },
      ],
    },
    ecosystem: {
      eyebrow: 'El ecosistema CasaMia',
      title: 'Cada persona, dispositivo y acción en un flujo claro.',
      body:
        'Los espacios de residentes se conectan con quienes necesitan la información adecuada, sin obligar a todos a utilizar el mismo sistema complejo.',
      summary:
        'Las habitaciones y dispositivos se conectan mediante la plataforma CasaMia con el panel del operador, la app del cuidador, la visibilidad familiar y la telesalud.',
      resident: {
        title: 'Espacios de residentes',
        body: 'Voz, pulsadores, sensores, constantes y rutinas de apoyo.',
        status: 'Conectado alrededor del residente',
      },
      platform: {
        title: 'Plataforma CasaMia',
        body: 'Un flujo con permisos para personas, dispositivos, alertas y acciones.',
        signals: ['Residentes', 'Dispositivos', 'Alertas', 'Acciones'],
      },
      operator: {
        title: 'Panel del operador',
        body: 'Centros, residentes, dispositivos, alertas, tareas y supervisión.',
      },
      caregiver: {
        title: 'App del cuidador',
        body: 'Prioridades, seguimientos, notas, relevos y escalado.',
      },
      family: {
        title: 'Visibilidad familiar',
        body: 'Actualizaciones acordadas y tranquilidad, con consentimiento.',
      },
      telehealth: {
        title: 'Telesalud',
        body: 'Acceso sencillo a videoconsultas programadas.',
      },
    },
    onboarding: {
      eyebrow: 'Incorporación sencilla',
      title: 'De nuevo residente a atención preparada en cuatro pasos.',
      body: 'La configuración guiada y las plantillas reutilizables evitan empezar de cero cada vez.',
      support: 'CasaMia acompaña la configuración, la formación y el despliegue, centro por centro.',
      readyTitle: 'Residente preparado',
      readyBody: 'Equipo invitado · permisos revisados · rutinas activas',
      steps: [
        { title: 'Añadir al residente', body: 'Perfil, habitación y preferencias de apoyo.' },
        { title: 'Asignar el círculo de atención', body: 'Equipo, familia y acceso según el rol.' },
        { title: 'Conectar servicios', body: 'Dispositivos, rutinas y rutas de aviso.' },
        { title: 'Invitar y activar', body: 'Acceso a la app, comprobaciones y entrega clara.' },
      ],
    },
    interfaces: {
      eyebrow: 'Diseñado para ser sencillo',
      title: 'Una plataforma. Dos vistas muy fáciles.',
      body: 'El operador mantiene la supervisión; cada cuidador ve lo relevante para su turno.',
      operator: {
        eyebrow: 'Vista ilustrativa del operador',
        title: 'La residencia de un vistazo',
        body: 'Vea qué necesita atención sin consultar sistemas separados.',
        live: 'Vista operativa',
        metrics: [
          { value: 'En directo', label: 'Vista de residentes' },
          { value: 'Priorizado', label: 'Requiere atención' },
          { value: 'Visible', label: 'Estado de dispositivos' },
          { value: 'Registrado', label: 'Acciones del turno' },
        ],
        residentsTitle: 'Vista de residentes',
        residents: [
          { name: 'Habitación 204', detail: 'Seguimiento matinal', status: 'Preparado' },
          { name: 'Habitación 118', detail: 'Rutina de hidratación', status: 'Pendiente' },
          { name: 'Habitación 306', detail: 'Ruta nocturna', status: 'Estable' },
        ],
        alertsTitle: 'Actividad',
        alerts: [
          { title: 'Revisión de ruta nocturna', detail: 'Asignada al cuidador adecuado', tone: 'attention' },
          { title: 'Rutina de constantes', detail: 'Lectura registrada', tone: 'info' },
          { title: 'Apoyo matinal', detail: 'Completado y entregado', tone: 'good' },
        ],
      },
      caregiver: {
        eyebrow: 'App ilustrativa del cuidador',
        title: 'La información adecuada, en el bolsillo del cuidador.',
        body: 'Cada cuidador ve los residentes, prioridades y acciones relevantes para su turno.',
        greeting: 'Buenos días',
        shift: 'Turno de mañana',
        priorities: 'Prioridades de hoy',
        residents: [
          { initials: '204', name: 'Habitación 204', task: 'Seguimiento matinal', status: 'Ahora' },
          { initials: '118', name: 'Habitación 118', task: 'Recordatorio de hidratación', status: '10:30' },
          { initials: '306', name: 'Habitación 306', task: 'Rutina completada', status: 'Hecho' },
        ],
        actions: ['Confirmar', 'Añadir nota', 'Llamar al equipo'],
      },
    },
    workflow: {
      eyebrow: 'Operaciones diarias fluidas',
      title: 'Del evento a la acción cerrada, sin perder el hilo.',
      body: 'Un flujo sencillo mantiene alineados al residente, al cuidador y al operador.',
      steps: [
        { title: 'Evento del residente', body: 'Una solicitud, rutina o señal acordada.' },
        { title: 'Aviso a la persona adecuada', body: 'La prioridad y la responsabilidad quedan claras.' },
        { title: 'Acción registrada', body: 'Las notas y el estado permanecen con el evento.' },
        { title: 'Supervisión del operador', body: 'El seguimiento sigue visible en todo el centro.' },
      ],
    },
    trust: {
      items: [
        { title: 'Acceso según el rol', body: 'Cada usuario ve solo lo necesario para su función.' },
        { title: 'Consentimiento y privacidad', body: 'Los permisos y la visibilidad se acuerdan antes de empezar.' },
        { title: 'Incorporación guiada', body: 'CasaMia acompaña la configuración, formación y entrega.' },
      ],
      boundary:
        'Vistas ilustrativas. Las capacidades finales dependen del sistema acordado, las integraciones, los dispositivos, la conectividad y las responsabilidades de respuesta.',
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
      optionalDetails: 'Añadir detalles opcionales del proyecto',
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

const onboardingIcons: LucideIcon[] = [UserPlus, UsersRound, Link2, CircleCheckBig]
const workflowIcons: LucideIcon[] = [Activity, BellRing, ClipboardCheck, MonitorCheck]
const trustIcons: LucideIcon[] = [LockKeyhole, ShieldCheck, BadgeCheck]

function getLanguageKey(language: string): LanguageKey {
  return language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

function HeroProductVisual({ copy }: { copy: AssistedLivingCopy['interfaces'] }) {
  return (
    <div
      className="als2-hero-product"
      role="img"
      aria-label={`${copy.operator.title}. ${copy.caregiver.title}`}
    >
      <div className="als2-hero-screen">
        <div className="als2-hero-screen-bar">
          <span><Building2 size={17} aria-hidden="true" />CasaMia</span>
          <small><i />{copy.operator.live}</small>
        </div>
        <div className="als2-hero-metrics">
          {copy.operator.metrics.slice(0, 3).map((metric) => (
            <span key={metric.label}>
              <strong>{metric.value}</strong>
              <small>{metric.label}</small>
            </span>
          ))}
        </div>
        <div className="als2-hero-residents">
          {copy.operator.residents.map((resident, index) => (
            <div key={resident.name}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p><strong>{resident.name}</strong><small>{resident.detail}</small></p>
              <i>{resident.status}</i>
            </div>
          ))}
        </div>
      </div>

      <div className="als2-hero-phone">
        <div className="als2-phone-speaker" />
        <small>{copy.caregiver.shift}</small>
        <strong>{copy.caregiver.priorities}</strong>
        {copy.caregiver.residents.slice(0, 2).map((resident) => (
          <div key={resident.name}>
            <span>{resident.initials}</span>
            <p><b>{resident.name}</b><small>{resident.task}</small></p>
            <i>{resident.status}</i>
          </div>
        ))}
        <span className="als2-hero-phone-action">{copy.caregiver.actions[0]}</span>
      </div>

      <div className="als2-hero-status">
        <CircleCheckBig size={18} aria-hidden="true" />
        <span>{copy.body}</span>
      </div>
    </div>
  )
}

function EcosystemVisual({ copy }: { copy: AssistedLivingCopy['ecosystem'] }) {
  return (
    <div className="als2-ecosystem-map" role="img" aria-label={copy.summary}>
      <article className="als2-eco-node is-resident">
        <SafeImage
          src="/images/service-gallery/11-voice-controls-and-smart-routines.jpg"
          alt=""
          className="als2-eco-photo"
          imgClassName="als2-eco-photo-img"
        />
        <div>
          <span><House size={19} aria-hidden="true" />{copy.resident.status}</span>
          <h3>{copy.resident.title}</h3>
          <p>{copy.resident.body}</p>
        </div>
      </article>

      <span className="als2-eco-connector is-in" aria-hidden="true"><ChevronRight size={20} /></span>

      <article className="als2-eco-hub">
        <span className="als2-eco-hub-icon"><Link2 size={28} aria-hidden="true" /></span>
        <h3>{copy.platform.title}</h3>
        <p>{copy.platform.body}</p>
        <div>
          {copy.platform.signals.map((signal) => <small key={signal}>{signal}</small>)}
        </div>
      </article>

      <span className="als2-eco-connector is-out" aria-hidden="true"><ChevronRight size={20} /></span>

      <div className="als2-eco-destinations">
        <article>
          <span><MonitorCheck size={21} aria-hidden="true" /></span>
          <div><h3>{copy.operator.title}</h3><p>{copy.operator.body}</p></div>
        </article>
        <article>
          <span><Smartphone size={21} aria-hidden="true" /></span>
          <div><h3>{copy.caregiver.title}</h3><p>{copy.caregiver.body}</p></div>
        </article>
        <article>
          <span><UsersRound size={21} aria-hidden="true" /></span>
          <div><h3>{copy.family.title}</h3><p>{copy.family.body}</p></div>
        </article>
        <article>
          <span><HeartPulse size={21} aria-hidden="true" /></span>
          <div><h3>{copy.telehealth.title}</h3><p>{copy.telehealth.body}</p></div>
        </article>
      </div>
    </div>
  )
}

function OperatorDashboard({ copy }: { copy: AssistedLivingCopy['interfaces']['operator'] }) {
  return (
    <div className="als2-dashboard" role="img" aria-label={`${copy.eyebrow}. ${copy.title}`}>
      <div className="als2-dashboard-topbar">
        <span className="als2-dashboard-brand"><Building2 size={18} aria-hidden="true" />CasaMia</span>
        <nav aria-hidden="true"><i /><i /><i /></nav>
        <small><b />{copy.live}</small>
      </div>

      <div className="als2-dashboard-heading">
        <div><span>{copy.eyebrow}</span><h3>{copy.title}</h3></div>
        <span className="als2-dashboard-highlight"><Sparkles size={16} aria-hidden="true" />{copy.metrics[3].value}</span>
      </div>

      <div className="als2-dashboard-metrics">
        {copy.metrics.map((metric, index) => (
          <article key={metric.label}>
            <span>{index === 0 ? <UsersRound size={19} aria-hidden="true" /> : index === 1 ? <BellRing size={19} aria-hidden="true" /> : index === 2 ? <Wifi size={19} aria-hidden="true" /> : <ClipboardCheck size={19} aria-hidden="true" />}</span>
            <strong>{metric.value}</strong>
            <small>{metric.label}</small>
          </article>
        ))}
      </div>

      <div className="als2-dashboard-body">
        <section>
          <header><strong>{copy.residentsTitle}</strong><small>•••</small></header>
          <div className="als2-resident-table">
            {copy.residents.map((resident, index) => (
              <div key={resident.name}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p><strong>{resident.name}</strong><small>{resident.detail}</small></p>
                <i className={resident.status.toLowerCase().includes('due') || resident.status.toLowerCase().includes('pendiente') ? 'is-due' : ''}>{resident.status}</i>
              </div>
            ))}
          </div>
        </section>

        <section>
          <header><strong>{copy.alertsTitle}</strong><small>•••</small></header>
          <div className="als2-activity-list">
            {copy.alerts.map((alert) => (
              <div key={alert.title} className={`is-${alert.tone}`}>
                <span><i /></span>
                <p><strong>{alert.title}</strong><small>{alert.detail}</small></p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function CaregiverPhone({ copy }: { copy: AssistedLivingCopy['interfaces']['caregiver'] }) {
  return (
    <div className="als2-caregiver-composition">
      <header>
        <span>{copy.eyebrow}</span>
        <h3>{copy.title}</h3>
        <p>{copy.body}</p>
      </header>

      <div className="als2-caregiver-phone" role="img" aria-label={`${copy.eyebrow}. ${copy.title}`}>
        <div className="als2-caregiver-speaker" />
        <div className="als2-caregiver-header">
          <div><small>{copy.shift}</small><strong>{copy.greeting}</strong></div>
          <span><BellRing size={17} aria-hidden="true" /><i /></span>
        </div>
        <div className="als2-shift-progress"><span /></div>
        <div className="als2-priority-heading"><strong>{copy.priorities}</strong><small>{copy.residents.length}</small></div>
        <div className="als2-caregiver-residents">
          {copy.residents.map((resident, index) => (
            <article key={resident.name} className={index === 0 ? 'is-current' : ''}>
              <span>{resident.initials}</span>
              <p><strong>{resident.name}</strong><small>{resident.task}</small></p>
              <i>{resident.status}</i>
            </article>
          ))}
        </div>
        <div className="als2-caregiver-actions">
          {copy.actions.map((action, index) => (
            <span className="als2-caregiver-action" key={action}>
              {index === 0 ? <CheckCircle2 size={16} aria-hidden="true" /> : index === 1 ? <MessageCircle size={16} aria-hidden="true" /> : <PhoneCall size={16} aria-hidden="true" />}
              {action}
            </span>
          ))}
        </div>
        <nav aria-hidden="true"><span /><span className="is-active" /><span /></nav>
      </div>
    </div>
  )
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
        mainEntity: copy.faq.items.slice(0, 4).map((item) => ({
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
          `Timeline: ${timeline || 'Not provided'}`,
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
                <a className="btn btn-white" href="#onboarding">
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

            <HeroProductVisual copy={copy.interfaces} />
          </div>
        </section>

        <section className="als2-section als2-ecosystem" aria-labelledby="als2-ecosystem-title">
          <div className="site-shell">
            <header className="als2-section-heading is-centered">
              <p className="eyebrow">{copy.ecosystem.eyebrow}</p>
              <h2 id="als2-ecosystem-title">{copy.ecosystem.title}</h2>
              <p>{copy.ecosystem.body}</p>
            </header>
            <EcosystemVisual copy={copy.ecosystem} />
          </div>
        </section>

        <section className="als2-section als2-onboarding" id="onboarding" aria-labelledby="als2-onboarding-title">
          <div className="site-shell als2-onboarding-layout">
            <div className="als2-onboarding-copy">
              <p className="eyebrow als-eyebrow-on-dark">{copy.onboarding.eyebrow}</p>
              <h2 id="als2-onboarding-title">{copy.onboarding.title}</h2>
              <p>{copy.onboarding.body}</p>
              <div className="als2-onboarding-support">
                <BadgeCheck size={22} aria-hidden="true" />
                <span>{copy.onboarding.support}</span>
              </div>
            </div>

            <ol className="als2-onboarding-steps">
              {copy.onboarding.steps.map((step, index) => {
                const Icon = onboardingIcons[index] ?? CircleCheckBig
                return (
                  <li key={step.title}>
                    <span className="als2-onboarding-icon"><Icon size={21} aria-hidden="true" /></span>
                    <span className="als2-onboarding-number">{String(index + 1).padStart(2, '0')}</span>
                    <div><h3>{step.title}</h3><p>{step.body}</p></div>
                    {index < copy.onboarding.steps.length - 1 ? <ChevronRight size={18} aria-hidden="true" /> : null}
                  </li>
                )
              })}
              <li className="als2-onboarding-ready">
                <CircleCheckBig size={25} aria-hidden="true" />
                <div><strong>{copy.onboarding.readyTitle}</strong><small>{copy.onboarding.readyBody}</small></div>
              </li>
            </ol>
          </div>
        </section>

        <section className="als2-section als2-interfaces" aria-labelledby="als2-interfaces-title">
          <div className="site-shell">
            <header className="als2-section-heading is-centered">
              <p className="eyebrow">{copy.interfaces.eyebrow}</p>
              <h2 id="als2-interfaces-title">{copy.interfaces.title}</h2>
              <p>{copy.interfaces.body}</p>
            </header>

            <div className="als2-interface-grid">
              <div className="als2-operator-showcase">
                <header><span>{copy.interfaces.operator.eyebrow}</span><p>{copy.interfaces.operator.body}</p></header>
                <OperatorDashboard copy={copy.interfaces.operator} />
              </div>
              <CaregiverPhone copy={copy.interfaces.caregiver} />
            </div>
          </div>
        </section>

        <section className="als2-section als2-workflow" id="delivery-model" aria-labelledby="als2-workflow-title">
          <div className="site-shell">
            <header className="als2-section-heading is-centered is-inverse">
              <p className="eyebrow als-eyebrow-on-dark">{copy.workflow.eyebrow}</p>
              <h2 id="als2-workflow-title">{copy.workflow.title}</h2>
              <p>{copy.workflow.body}</p>
            </header>

            <ol className="als2-workflow-flow">
              {copy.workflow.steps.map((step, index) => {
                const Icon = workflowIcons[index] ?? Activity
                return (
                  <li key={step.title}>
                    <span><Icon size={21} aria-hidden="true" /></span>
                    <div><strong>{step.title}</strong><small>{step.body}</small></div>
                    {index < copy.workflow.steps.length - 1 ? <ChevronRight size={21} aria-hidden="true" /> : null}
                  </li>
                )
              })}
            </ol>

            <div className="als2-trust-strip">
              {copy.trust.items.map((item, index) => {
                const Icon = trustIcons[index] ?? ShieldCheck
                return (
                  <article key={item.title}>
                    <Icon size={20} aria-hidden="true" />
                    <div><strong>{item.title}</strong><small>{item.body}</small></div>
                  </article>
                )
              })}
            </div>
            <p className="als2-system-boundary"><ShieldCheck size={17} aria-hidden="true" />{copy.trust.boundary}</p>
          </div>
        </section>

        <section className="als-section als-faq" aria-labelledby="als-faq-title">
          <div className="site-shell als-faq-layout">
            <div className="als-faq-heading">
              <p className="eyebrow">{copy.faq.eyebrow}</p>
              <h2 id="als-faq-title">{copy.faq.title}</h2>
            </div>
            <div className="als-faq-list">
              {copy.faq.items.slice(0, 4).map((item) => (
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
                <FacilityField label={copy.form.name} name="name" required />
                <FacilityField label={copy.form.email} name="email" type="email" required />
                <FacilityField label={copy.form.phone} name="phone" type="tel" />
              </div>

              <details className="als2-form-optional">
                <summary>{copy.form.optionalDetails}<ChevronRight size={18} aria-hidden="true" /></summary>
                <div className="als-form-grid">
                  <FacilityField label={copy.form.role} name="role" />
                  <FacilityField label={copy.form.sites} name="sites" />
                  <label>
                    <span>{copy.form.timeline}</span>
                    <select name="timeline" defaultValue="">
                      <option value="">{copy.form.timelinePlaceholder}</option>
                      {copy.form.timelineOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label className="als-form-wide">
                    <span>{copy.form.message}</span>
                    <textarea name="message" rows={4} placeholder={copy.form.messagePlaceholder} />
                  </label>
                </div>
              </details>

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
