import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  LifeBuoy,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Plug,
  Radio,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
  Watch,
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
type TechnologyKind = 'fall' | 'bathroom' | 'health' | 'room'

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
    audiencesLabel: string
    audiences: string[]
    imageAlt: string
    visualEyebrow: string
    visualTitle: string
    visualBody: string
    visualEvent: string
    visualRoom: string
    visualRoute: string
    privacyLabel: string
  }
  expertise: {
    eyebrow: string
    title: string
    body: string
    inputs: Array<{ title: string; body: string }>
    outcomeLabel: string
    outcomeTitle: string
    outcomes: string[]
    note: string
  }
  operatingModel: {
    eyebrow: string
    title: string
    body: string
    cards: Array<{ title: string; body: string; metric: string }>
  }
  technology: {
    eyebrow: string
    title: string
    body: string
    compatibility: string
    items: Array<{
      kind: TechnologyKind
      tag: string
      title: string
      body: string
      points: string[]
      visualLabel: string
    }>
  }
  partners: {
    eyebrow: string
    title: string
    body: string
    providerLabel: string
    providerName: string
    providerBody: string
    referencesLabel: string
    references: Array<{ name: string; category: string; href: string }>
    examplesLabel: string
    examples: Array<{ name: string; category: string; href: string }>
    note: string
  }
  ecosystem: {
    eyebrow: string
    title: string
    body: string
    aria: string
    sourceTitle: string
    sourceBody: string
    layerBadge: string
    layerTitle: string
    layerBody: string
    layerCapabilities: string[]
    destinations: Array<{ title: string; body: string }>
    flow: string[]
  }
  interfaces: {
    eyebrow: string
    title: string
    body: string
    operator: {
      label: string
      title: string
      status: string
      summary: string
      metrics: Array<{ value: string; label: string }>
      queueTitle: string
      queue: Array<{ room: string; event: string; owner: string; state: string; tone: 'urgent' | 'active' | 'clear' }>
    }
    caregiver: {
      label: string
      title: string
      shift: string
      eventType: string
      eventRoom: string
      eventTime: string
      context: string
      primaryAction: string
      secondaryAction: string
      footer: string
    }
  }
  rollout: {
    eyebrow: string
    title: string
    body: string
    steps: Array<{ title: string; body: string }>
    onboardingLabel: string
    onboarding: string[]
    ready: string
  }
  trust: {
    title: string
    outcomes: Array<{ title: string; body: string }>
    boundaryTitle: string
    boundary: string
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
    seoTitle: 'Assisted Living Technology & Fall Detection | CasaMia Spain',
    seoDescription:
      'CasaMia integrates non-wearable fall detection, senior-living sensors, connected health devices, caregiver apps and operator workflows for residences in Spain.',
    hero: {
      eyebrow: 'Technology integration for senior living',
      title: 'Pilot safer rooms without adding another disconnected system.',
      body:
        'CasaMia helps residences test camera-free fall detection, room sensors, continence prompts, connected health checks and caregiver workflows around one priority use case.',
      primaryCta: 'Design a facility pilot',
      secondaryCta: 'See pilot options',
      proof: ['One use case first', 'Camera-free options', 'Existing systems reviewed', 'Staff workflow included'],
      audiencesLabel: 'Built for',
      audiences: ['Assisted living', 'Senior residences', 'Senior communities', 'Multi-site operators'],
      imageAlt: 'Discreet camera-free room sensor in a calm senior-living residence',
      visualEyebrow: 'Passive safety, active response',
      visualTitle: 'A signal only matters when the team knows what to do next.',
      visualBody: 'Supported sensors and devices route agreed events to the right role, with context and a clear response path.',
      visualEvent: 'Suspected fall',
      visualRoom: 'Suite 214 · private room',
      visualRoute: 'Routed to the care team',
      privacyLabel: 'Camera-free option',
    },
    expertise: {
      eyebrow: 'Designed around your residence',
      title: 'Every residence is different. Its technology plan should be too.',
      body:
        'We begin with the building, residents, staff routines and systems already in place. Then we select, connect and pilot only the technology that fits.',
      inputs: [
        { title: 'Residents', body: 'Abilities, risks, routines and consent' },
        { title: 'Residence', body: 'Rooms, bathrooms, coverage and connectivity' },
        { title: 'Care model', body: 'Staff roles, escalation and handover' },
        { title: 'Current systems', body: 'Nurse call, care platform, apps and data routes' },
      ],
      outcomeLabel: 'Your CasaMia blueprint',
      outcomeTitle: 'One tailored solution with a clear operating model.',
      outcomes: ['Selected devices', 'Integration route', 'Alert and response model', 'Training and rollout plan'],
      note: 'Start with one priority. Scale only after the workflow works in practice.',
    },
    operatingModel: {
      eyebrow: 'What CasaMia delivers',
      title: 'Not just devices. A working operating model for the residence.',
      body:
        'The value is not a sensor on a wall. It is knowing which resident, which room, which event, who owns the response and what happens next—without creating another disconnected tool for staff.',
      cards: [
        {
          title: 'Home clinic layer',
          body: 'Optional health checks, guided telehealth devices and authorised readings can sit beside daily safety workflows.',
          metric: 'Health context',
        },
        {
          title: 'Fall and room-safety layer',
          body: 'Camera-free fall detection, bed-exit, bathroom, environment and routine signals are selected by use case.',
          metric: 'Room events',
        },
        {
          title: 'Care workflow layer',
          body: 'Alerts are routed to the right role with context, escalation and handover so teams can act clearly.',
          metric: 'Team response',
        },
      ],
    },
    technology: {
      eyebrow: 'High-value pilot options',
      title: 'Choose the first use case worth proving.',
      body:
        'Start with the resident risk or operational bottleneck that matters most. CasaMia validates the device fit, coverage, permissions and staff response before anything scales.',
      compatibility:
        'Device compatibility, room coverage, consent, certification and response ownership are checked before the pilot.',
      items: [
        {
          kind: 'fall',
          tag: 'Camera-free options',
          title: 'Ambient fall detection',
          body:
            'Supported radar, bed-exit, presence and environmental sensors can add passive coverage without asking a resident to press a button.',
          points: ['Wall or ceiling radar', 'Bed-exit and occupancy sensing', 'Door, temperature, air or leak events'],
          visualLabel: 'Examples: radar · bed exit · environment',
        },
        {
          kind: 'bathroom',
          tag: 'Dignity by design',
          title: 'Bathroom and continence insights',
          body:
            'Compatible continence sensors can prompt a change; supported toilet or urine-analysis devices can surface selected measurements or trends for authorised review.',
          points: ['Saturation and change prompts', 'Toileting-event patterns', 'Professional review where appropriate'],
          visualLabel: 'Bathroom signals, not cameras',
        },
        {
          kind: 'health',
          tag: 'Opt-in health check',
          title: 'rPPG mirror and connected health',
          body:
            'A supported smart mirror can estimate selected signals during a deliberate optical rPPG check-in. Compatible blood-pressure monitors, oximeters, thermometers and scales can join the same authorised workflow.',
          points: ['Opt-in, not continuous room monitoring', 'Selected pulse and breathing signals', 'Certification and intended use reviewed'],
          visualLabel: 'rPPG mirror concept · optical check-in',
        },
        {
          kind: 'room',
          tag: 'Optional personal devices',
          title: 'Wearables when they add value',
          body:
            'Compatible watches, wristbands and pendants can support SOS, location, activity or selected health readings for residents who accept and reliably use them.',
          points: ['Optional—not required for ambient detection', 'Useful beyond the resident room', 'Integrated only with consent and a clear response'],
          visualLabel: 'Wearable, pendant and fixed-call options',
        },
      ],
    },
    partners: {
      eyebrow: 'Technology relationships and ecosystem',
      title: 'Specialist technology, brought together around the residence.',
      body:
        'CasaMia combines senior-technology experience with a vendor-aware selection process. We validate supported interfaces, market availability and the operating workflow before recommending any product.',
      providerLabel: 'CasaMia technology and service provider',
      providerName: 'MOKA DigiTech',
      providerBody: 'Senior-focused service design, digital workflows and technology integration.',
      referencesLabel: 'Senior-technology references',
      references: [
        { name: 'VYVA', category: 'Health assistant and caregiver workflows', href: 'https://www.cocoon.services/meet-vyva-your-own-health-assistant-and-everyday-companion' },
        { name: 'COCOON', category: 'Assistive-technology experience', href: 'https://www.cocoon.services/assistive-technology' },
      ],
      examplesLabel: 'Specialist technologies we can assess',
      examples: [
        { name: 'Vayyar Care', category: 'Camera-free room radar', href: 'https://vayyar.com/care-pages/how/' },
        { name: 'TENA SmartCare', category: 'Digital continence care', href: 'https://www.tena.co.uk/professionals/products/digital-care-solutions/change-indicator/tena-smartcare-change-indicator-sensor-strip/' },
        { name: 'NuraLogix', category: 'Optical rPPG mirror', href: 'https://www.nuralogix.ai/' },
        { name: 'CarePredict', category: 'Senior-focused wearable', href: 'https://www.carepredict.com/who-we-serve/at-home' },
        { name: 'Withings', category: 'Connected health devices', href: 'https://www.withings.com/us/en/health-solutions/remote-patient-monitoring' },
        { name: 'TytoCare', category: 'Guided telehealth exams', href: 'https://www.tytocare.com/' },
      ],
      note:
        'Manufacturer and technology examples only. Inclusion does not imply a partnership or endorsement. Availability, regulatory status and integration suitability vary by market and deployment.',
    },
    ecosystem: {
      eyebrow: 'Signal to action',
      title: 'From a room signal to a managed response.',
      body:
        'CasaMia connects agreed device events into workflows run by your authorised team: who sees it, who owns it, what context they receive and how the action is recorded.',
      aria:
        'Resident room sensors and compatible devices connect through CasaMia integration to caregiver, operator and existing care-system workflows.',
      sourceTitle: 'Resident space',
      sourceBody: 'Passive sensors and compatible health devices',
      layerBadge: 'Integration cloud',
      layerTitle: 'CasaMia cloud',
      layerBody: 'Permissions, event rules and routing',
      layerCapabilities: ['Consent & access', 'Event rules', 'Role routing'],
      destinations: [
        { title: 'Caregiver mobile', body: 'The next action, with context' },
        { title: 'Operator view', body: 'Ownership, status and handover' },
        { title: 'Existing systems', body: 'Supported nurse-call or care platforms' },
      ],
      flow: ['Signal detected', 'Route to role', 'Respond or escalate', 'Record the action'],
    },
    interfaces: {
      eyebrow: 'Built for each role',
      title: 'Operators see the operation. Care teams see the next action.',
      body:
        'A residence-wide view for operators and a focused mobile queue for authorised care staff.',
      operator: {
        label: 'Illustrative operator view',
        title: 'Residence overview',
        status: 'All connected areas',
        summary: 'A calm view of ownership and service readiness',
        metrics: [
          { value: '3', label: 'open events' },
          { value: '2', label: 'in progress' },
          { value: '24', label: 'connected rooms' },
        ],
        queueTitle: 'Event ownership',
        queue: [
          { room: 'Suite 214', event: 'Suspected fall', owner: 'Lucía · responding', state: 'In progress', tone: 'urgent' },
          { room: 'Suite 108', event: 'Bed exit', owner: 'Night team', state: 'Acknowledged', tone: 'active' },
          { room: 'West wing', event: 'Device check', owner: 'Facilities', state: 'Scheduled', tone: 'clear' },
        ],
      },
      caregiver: {
        label: 'Illustrative caregiver view',
        title: 'Priority event',
        shift: 'Morning shift · West wing',
        eventType: 'Suspected fall',
        eventRoom: 'Suite 214',
        eventTime: 'Just now',
        context: 'Camera-free room sensor · resident context available to authorised staff',
        primaryAction: 'I am responding',
        secondaryAction: 'Escalate',
        footer: 'Acknowledge · act · add a note · hand over',
      },
    },
    rollout: {
      eyebrow: 'A responsible rollout',
      title: 'One contained pilot, then evidence-based scale.',
      body:
        'Begin with one use case, one area and one success measure. Validate coverage, response time and staff adoption before expanding across rooms, wings or sites.',
      steps: [
        { title: 'Assess', body: 'Define the use case, site and success measure.' },
        { title: 'Configure', body: 'Validate devices, integrations and routing.' },
        { title: 'Pilot', body: 'Install, train and rehearse the response.' },
        { title: 'Scale', body: 'Review, improve and expand.' },
      ],
      onboardingLabel: 'Resident activation',
      onboarding: ['Add resident', 'Assign roles', 'Pair devices', 'Activate'],
      ready: 'One clear handover for every resident and every shift.',
    },
    trust: {
      title: 'What the pilot must prove.',
      outcomes: [
        { title: 'Useful signals', body: 'The agreed events are relevant enough for staff to trust and act on.' },
        { title: 'Clear ownership', body: 'The right role can acknowledge, respond, escalate and hand over.' },
        { title: 'Workflow fit', body: 'The pilot supports existing routines instead of creating another isolated screen.' },
        { title: 'Repeatable standards', body: 'The model is documented before it expands to more rooms or sites.' },
      ],
      boundaryTitle: 'Responsible technology boundary',
      boundary:
        'Fall detection flags possible events; it cannot prevent every fall or guarantee an emergency response, and we do not operate a remote monitoring centre. Health, continence and urine-related outputs depend on the selected device, certification, consent and qualified interpretation.',
    },
    faq: {
      eyebrow: 'Practical questions',
      title: 'What facility teams usually ask us.',
      items: [
        {
          question: 'Do residents need to wear a pendant?',
          answer:
            'Not with supported ambient options. We validate coverage, resident suitability and the response protocol during the pilot.',
        },
        {
          question: 'Can CasaMia work with our existing nurse-call or care system?',
          answer:
            'Where supported, yes. We validate interfaces, permissions and vendor requirements; if direct integration is unavailable, we propose a clearly scoped alternative.',
        },
        {
          question: 'Do bathroom or urine sensors diagnose health conditions?',
          answer:
            'No. They provide prompts or measurements for staff review; clinical interpretation requires an appropriate certified device and qualified professional.',
        },
        {
          question: 'How do we begin without disrupting the whole residence?',
          answer:
            'Pilot one defined use case in a limited area. CasaMia coordinates assessment, integration, installation, training and review before expansion.',
        },
      ],
    },
    form: {
      eyebrow: 'Start with one use case',
      title: 'Start with the first pilot.',
      body:
        'Tell us about the site, current systems and first priority. We will recommend the smallest practical pilot worth testing.',
      emailLabel: 'Prefer email?',
      cardTitle: 'Request a facility consultation',
      cardIntro: 'A few details help us bring the right specialist to the first call.',
      organisation: 'Organisation',
      role: 'Your role',
      facilityType: 'Facility type',
      facilityPlaceholder: 'Select a facility type',
      facilityOptions: ['Assisted living residence', 'Senior living community', 'Care home', 'Multi-site operator', 'Public or municipal provider', 'Other'],
      location: 'Location',
      sites: 'Number of sites or residents',
      priority: 'First priority',
      priorityPlaceholder: 'Select the first challenge',
      priorityOptions: ['Seamless fall detection', 'Bathroom or continence technology', 'Connected health devices', 'Caregiver and operator workflows', 'Smart rooms', 'Not sure yet'],
      timeline: 'Desired timeline',
      timelinePlaceholder: 'Select a timeline',
      timelineOptions: ['Within 3 months', '3–6 months', '6–12 months', 'Exploring options'],
      name: 'Name',
      email: 'Work email',
      phone: 'Phone',
      message: 'Anything we should know?',
      messagePlaceholder: 'Existing systems, rooms, current process or the outcome you want to improve…',
      optionalDetails: 'Add project details (optional)',
      submit: 'Request a consultation',
      submitting: 'Sending request…',
      success: 'Thank you. The CasaMia team will contact you to arrange the discovery session.',
      error: 'We could not send your request. Please try again or email us directly.',
      note: 'No generic sales pitch. We will focus on the first viable pilot.',
      privacyPrefix: 'By submitting this form, you agree to our',
      privacyLink: 'privacy policy',
    },
  },
  es: {
    lang: 'es',
    seoTitle: 'Tecnología para residencias y detección de caídas | CasaMia',
    seoDescription:
      'CasaMia integra detección de caídas sin wearables, sensores para senior living, dispositivos de salud, apps para cuidadores y flujos para residencias en España.',
    hero: {
      eyebrow: 'Integración tecnológica para residencias',
      title: 'Pilota habitaciones más seguras sin añadir otro sistema aislado.',
      body:
        'CasaMia ayuda a residencias a probar detección de caídas sin cámara, sensores de habitación, avisos de continencia, controles de salud conectados y flujos para cuidadores alrededor de una prioridad concreta.',
      primaryCta: 'Diseñar un piloto',
      secondaryCta: 'Ver opciones de piloto',
      proof: ['Un caso de uso primero', 'Opciones sin cámara', 'Sistemas actuales revisados', 'Flujo del equipo incluido'],
      audiencesLabel: 'Pensado para',
      audiences: ['Residencias asistidas', 'Residencias senior', 'Comunidades senior', 'Operadores multicentro'],
      imageAlt: 'Sensor discreto sin cámara en una residencia senior tranquila',
      visualEyebrow: 'Seguridad pasiva, respuesta activa',
      visualTitle: 'Una señal solo aporta valor si el equipo sabe qué hacer después.',
      visualBody: 'Sensores y dispositivos compatibles envían eventos acordados al rol adecuado, con contexto y una ruta clara de respuesta.',
      visualEvent: 'Posible caída',
      visualRoom: 'Habitación 214 · espacio privado',
      visualRoute: 'Enviado al equipo asistencial',
      privacyLabel: 'Opción sin cámara',
    },
    expertise: {
      eyebrow: 'Diseñado alrededor de tu residencia',
      title: 'Cada residencia es distinta. Su plan tecnológico también debe serlo.',
      body:
        'Empezamos por el edificio, los residentes, las rutinas del personal y los sistemas actuales. Después seleccionamos, conectamos y pilotamos solo la tecnología que encaja.',
      inputs: [
        { title: 'Residentes', body: 'Capacidades, riesgos, rutinas y consentimiento' },
        { title: 'Residencia', body: 'Habitaciones, baños, cobertura y conectividad' },
        { title: 'Modelo asistencial', body: 'Roles, escalado y relevo del equipo' },
        { title: 'Sistemas actuales', body: 'Llamada, plataforma asistencial, apps y datos' },
      ],
      outcomeLabel: 'Tu blueprint CasaMia',
      outcomeTitle: 'Una solución a medida con un modelo operativo claro.',
      outcomes: ['Dispositivos seleccionados', 'Ruta de integración', 'Modelo de aviso y respuesta', 'Plan de formación y despliegue'],
      note: 'Empieza por una prioridad. Amplía solo cuando el flujo funcione en la práctica.',
    },
    operatingModel: {
      eyebrow: 'Qué entrega CasaMia',
      title: 'No solo dispositivos. Un modelo operativo que funciona en la residencia.',
      body:
        'El valor no está en colocar un sensor. Está en saber qué residente, qué habitación, qué evento, quién responde y cuál es el siguiente paso, sin crear otra herramienta aislada para el equipo.',
      cards: [
        {
          title: 'Capa de home clinic',
          body: 'Controles de salud opcionales, dispositivos de telesalud guiada y lecturas autorizadas pueden convivir con los flujos diarios de seguridad.',
          metric: 'Contexto de salud',
        },
        {
          title: 'Capa de caídas y seguridad',
          body: 'Detección de caídas sin cámara, salida de cama, baño, ambiente y rutinas se seleccionan según el caso de uso.',
          metric: 'Eventos de habitación',
        },
        {
          title: 'Capa de flujo asistencial',
          body: 'Los avisos llegan al rol adecuado con contexto, escalado y relevo para que el equipo actúe con claridad.',
          metric: 'Respuesta del equipo',
        },
      ],
    },
    technology: {
      eyebrow: 'Opciones de piloto de alto valor',
      title: 'Elige el primer caso de uso que merece validarse.',
      body:
        'Empieza por el riesgo del residente o el cuello de botella operativo que más importa. CasaMia valida dispositivo, cobertura, permisos y respuesta del equipo antes de escalar.',
      compatibility:
        'Validamos compatibilidad, cobertura, consentimiento, certificación y responsables de respuesta antes del piloto.',
      items: [
        {
          kind: 'fall',
          tag: 'Opciones sin cámara',
          title: 'Detección ambiental de caídas',
          body:
            'Los sensores compatibles de radar, salida de cama, presencia y ambiente pueden aportar cobertura pasiva sin pedir al residente que pulse un botón.',
          points: ['Radar de pared o techo', 'Salida de cama y ocupación', 'Puerta, temperatura, aire o fugas'],
          visualLabel: 'Ejemplos: radar · salida de cama · ambiente',
        },
        {
          kind: 'bathroom',
          tag: 'Dignidad desde el diseño',
          title: 'Información de baño y continencia',
          body:
            'Los sensores de continencia compatibles pueden avisar de un cambio; determinados dispositivos de inodoro o análisis de orina pueden mostrar mediciones o tendencias para una revisión autorizada.',
          points: ['Avisos de saturación y cambio', 'Patrones de uso del baño', 'Revisión profesional cuando corresponda'],
          visualLabel: 'Señales de baño, no cámaras',
        },
        {
          kind: 'health',
          tag: 'Control de salud opcional',
          title: 'Espejo rPPG y salud conectada',
          body:
            'Un espejo inteligente compatible puede estimar determinadas señales durante un control óptico rPPG deliberado. Tensiómetros, pulsioxímetros, termómetros y básculas compatibles pueden unirse al mismo flujo autorizado.',
          points: ['Uso opcional, no monitorización continua', 'Señales seleccionadas de pulso y respiración', 'Revisión de certificación y finalidad prevista'],
          visualLabel: 'Concepto de espejo rPPG · control óptico',
        },
        {
          kind: 'room',
          tag: 'Dispositivos personales opcionales',
          title: 'Wearables cuando aportan valor',
          body:
            'Relojes, pulseras y colgantes compatibles pueden apoyar SOS, localización, actividad o determinadas lecturas de salud cuando el residente los acepta y utiliza de forma fiable.',
          points: ['Opcional: no necesario para la detección ambiental', 'Útil también fuera de la habitación', 'Integración con consentimiento y respuesta clara'],
          visualLabel: 'Wearable, colgante y llamada fija',
        },
      ],
    },
    partners: {
      eyebrow: 'Relaciones tecnológicas y ecosistema',
      title: 'Tecnología especializada, reunida alrededor de la residencia.',
      body:
        'CasaMia combina experiencia en tecnología senior con una selección abierta a distintos fabricantes. Validamos interfaces, disponibilidad y el flujo operativo antes de recomendar un producto.',
      providerLabel: 'Proveedor tecnológico y de servicio de CasaMia',
      providerName: 'MOKA DigiTech',
      providerBody: 'Diseño de servicios senior, flujos digitales e integración tecnológica.',
      referencesLabel: 'Referencias en tecnología senior',
      references: [
        { name: 'VYVA', category: 'Asistente de salud y flujos para cuidadores', href: 'https://www.cocoon.services/meet-vyva-your-own-health-assistant-and-everyday-companion' },
        { name: 'COCOON', category: 'Experiencia en tecnología asistencial', href: 'https://www.cocoon.services/assistive-technology' },
      ],
      examplesLabel: 'Tecnologías especializadas que podemos evaluar',
      examples: [
        { name: 'Vayyar Care', category: 'Radar de habitación sin cámara', href: 'https://vayyar.com/care-pages/how/' },
        { name: 'TENA SmartCare', category: 'Continencia digital', href: 'https://www.tena.co.uk/professionals/products/digital-care-solutions/change-indicator/tena-smartcare-change-indicator-sensor-strip/' },
        { name: 'NuraLogix', category: 'Espejo óptico rPPG', href: 'https://www.nuralogix.ai/' },
        { name: 'CarePredict', category: 'Wearable para personas mayores', href: 'https://www.carepredict.com/who-we-serve/at-home' },
        { name: 'Withings', category: 'Dispositivos de salud conectados', href: 'https://www.withings.com/us/en/health-solutions/remote-patient-monitoring' },
        { name: 'TytoCare', category: 'Exploraciones guiadas por telesalud', href: 'https://www.tytocare.com/' },
      ],
      note:
        'Ejemplos de fabricantes y tecnologías. Su inclusión no implica colaboración ni recomendación. La disponibilidad, la situación regulatoria y la idoneidad de integración varían según el mercado y el proyecto.',
    },
    ecosystem: {
      eyebrow: 'De la señal a la acción',
      title: 'De una señal en la habitación a una respuesta gestionada.',
      body:
        'CasaMia conecta los eventos acordados con los flujos de tu equipo autorizado: quién lo ve, quién responde, qué contexto recibe y cómo queda registrada la acción.',
      aria:
        'Los sensores de habitación y dispositivos compatibles se conectan mediante la integración CasaMia con los flujos de cuidadores, operadores y sistemas existentes.',
      sourceTitle: 'Espacio del residente',
      sourceBody: 'Sensores pasivos y dispositivos de salud compatibles',
      layerBadge: 'Nube de integración',
      layerTitle: 'Nube CasaMia',
      layerBody: 'Permisos, reglas de evento y enrutamiento',
      layerCapabilities: ['Acceso y consentimiento', 'Reglas de evento', 'Aviso por rol'],
      destinations: [
        { title: 'Móvil del cuidador', body: 'La siguiente acción con contexto' },
        { title: 'Vista del operador', body: 'Responsable, estado y relevo' },
        { title: 'Sistemas existentes', body: 'Plataformas compatibles de llamada o cuidados' },
      ],
      flow: ['Señal detectada', 'Aviso al rol adecuado', 'Responder o escalar', 'Registrar la acción'],
    },
    interfaces: {
      eyebrow: 'Diseñado para cada rol',
      title: 'El operador ve la operación. El equipo asistencial ve la siguiente acción.',
      body:
        'Una vista global para operadores y una cola móvil enfocada para el personal autorizado.',
      operator: {
        label: 'Ejemplo de vista del operador',
        title: 'Vista de la residencia',
        status: 'Todas las áreas conectadas',
        summary: 'Una vista tranquila de responsables y disponibilidad',
        metrics: [
          { value: '3', label: 'eventos abiertos' },
          { value: '2', label: 'en curso' },
          { value: '24', label: 'habitaciones conectadas' },
        ],
        queueTitle: 'Responsables de eventos',
        queue: [
          { room: 'Hab. 214', event: 'Posible caída', owner: 'Lucía · en camino', state: 'En curso', tone: 'urgent' },
          { room: 'Hab. 108', event: 'Salida de cama', owner: 'Equipo de noche', state: 'Confirmado', tone: 'active' },
          { room: 'Ala oeste', event: 'Revisión de dispositivo', owner: 'Mantenimiento', state: 'Programada', tone: 'clear' },
        ],
      },
      caregiver: {
        label: 'Ejemplo de vista del cuidador',
        title: 'Evento prioritario',
        shift: 'Turno de mañana · Ala oeste',
        eventType: 'Posible caída',
        eventRoom: 'Habitación 214',
        eventTime: 'Ahora mismo',
        context: 'Sensor de habitación sin cámara · contexto disponible para personal autorizado',
        primaryAction: 'Voy en camino',
        secondaryAction: 'Escalar',
        footer: 'Confirmar · actuar · añadir nota · pasar relevo',
      },
    },
    rollout: {
      eyebrow: 'Un despliegue responsable',
      title: 'Un piloto acotado, después escala con evidencia.',
      body:
        'Empieza por un caso de uso, una zona y una medida de éxito. Valida cobertura, tiempo de respuesta y adopción del equipo antes de ampliar a más habitaciones, alas o centros.',
      steps: [
        { title: 'Evaluar', body: 'Definimos el caso de uso, la zona y la medida de éxito.' },
        { title: 'Configurar', body: 'Validamos dispositivos, integraciones y enrutamiento.' },
        { title: 'Pilotar', body: 'Instalamos, formamos y ensayamos la respuesta.' },
        { title: 'Escalar', body: 'Revisamos, mejoramos y ampliamos.' },
      ],
      onboardingLabel: 'Alta del residente',
      onboarding: ['Añadir residente', 'Asignar roles', 'Vincular dispositivos', 'Activar'],
      ready: 'Un relevo claro para cada residente y cada turno.',
    },
    trust: {
      title: 'Qué debe demostrar el piloto.',
      outcomes: [
        { title: 'Señales útiles', body: 'Los eventos acordados son relevantes para que el equipo confíe y actúe.' },
        { title: 'Responsables claros', body: 'El rol adecuado puede confirmar, responder, escalar y pasar relevo.' },
        { title: 'Encaje operativo', body: 'El piloto apoya las rutinas actuales sin crear otra pantalla aislada.' },
        { title: 'Estándares replicables', body: 'El modelo queda documentado antes de ampliar a más habitaciones o centros.' },
      ],
      boundaryTitle: 'Límite responsable de la tecnología',
      boundary:
        'La detección de caídas señala posibles eventos; no puede prevenir todas las caídas ni garantizar una respuesta de emergencia, y no operamos una central de monitorización remota. Los datos de salud, continencia y orina dependen del dispositivo, su certificación, el consentimiento y una interpretación profesional cualificada.',
    },
    faq: {
      eyebrow: 'Preguntas prácticas',
      title: 'Lo que suelen preguntarnos los equipos de residencias.',
      items: [
        {
          question: '¿Los residentes tienen que llevar un colgante?',
          answer:
            'No con las opciones ambientales compatibles. Validamos la cobertura, la idoneidad para el residente y el protocolo de respuesta durante el piloto.',
        },
        {
          question: '¿CasaMia puede trabajar con nuestro sistema de llamada o cuidados?',
          answer:
            'Cuando existe compatibilidad, sí. Validamos interfaces, permisos y requisitos del proveedor; si no hay integración directa, proponemos una alternativa claramente delimitada.',
        },
        {
          question: '¿Los sensores de baño u orina diagnostican problemas de salud?',
          answer:
            'No. Aportan avisos o mediciones para revisión; la interpretación clínica requiere un dispositivo certificado adecuado y un profesional cualificado.',
        },
        {
          question: '¿Cómo empezamos sin interrumpir toda la residencia?',
          answer:
            'Pilota un caso de uso concreto en una zona limitada. CasaMia coordina evaluación, integración, instalación, formación y revisión antes de ampliar.',
        },
      ],
    },
    form: {
      eyebrow: 'Empieza por un caso de uso',
      title: 'Empieza por el primer piloto.',
      body:
        'Cuéntanos el centro, los sistemas actuales y la prioridad. Recomendaremos el piloto práctico más pequeño que merece probarse.',
      emailLabel: '¿Prefieres email?',
      cardTitle: 'Solicita una consulta para tu centro',
      cardIntro: 'Unos datos nos ayudan a asignar al especialista adecuado.',
      organisation: 'Organización',
      role: 'Tu cargo',
      facilityType: 'Tipo de centro',
      facilityPlaceholder: 'Selecciona el tipo de centro',
      facilityOptions: ['Residencia asistida', 'Comunidad senior', 'Residencia de mayores', 'Operador multicentro', 'Proveedor público o municipal', 'Otro'],
      location: 'Ubicación',
      sites: 'Número de centros o residentes',
      priority: 'Primera prioridad',
      priorityPlaceholder: 'Selecciona el primer reto',
      priorityOptions: ['Detección de caídas sin fricción', 'Tecnología de baño o continencia', 'Dispositivos de salud conectados', 'Flujos para cuidadores y operadores', 'Habitaciones inteligentes', 'Aún no lo sé'],
      timeline: 'Plazo deseado',
      timelinePlaceholder: 'Selecciona un plazo',
      timelineOptions: ['En 3 meses', '3–6 meses', '6–12 meses', 'Explorando opciones'],
      name: 'Nombre',
      email: 'Email profesional',
      phone: 'Teléfono',
      message: '¿Hay algo más que debamos saber?',
      messagePlaceholder: 'Sistemas actuales, habitaciones, proceso o resultado que quieres mejorar…',
      optionalDetails: 'Añadir detalles del proyecto (opcional)',
      submit: 'Solicitar consulta',
      submitting: 'Enviando solicitud…',
      success: 'Gracias. El equipo CasaMia contactará contigo para organizar la sesión de descubrimiento.',
      error: 'No hemos podido enviar la solicitud. Inténtalo de nuevo o escríbenos directamente.',
      note: 'Sin discurso comercial genérico. Nos centraremos en el primer piloto viable.',
      privacyPrefix: 'Al enviar este formulario, aceptas nuestra',
      privacyLink: 'política de privacidad',
    },
  },
}

const rolloutIcons: LucideIcon[] = [ClipboardCheck, Link2, UserRoundCheck, Sparkles]

function getLanguageKey(language: string): LanguageKey {
  return language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

function HeroFacilityVisual({ copy }: { copy: AssistedLivingCopy['hero'] }) {
  return (
    <div className="alx-hero-visual" role="img" aria-label={`${copy.imageAlt}. ${copy.visualTitle}`}>
      <SafeImage
        src="/images/service-gallery/09-fall-detection-sensors.jpg"
        alt=""
        className="alx-hero-photo"
        imgClassName="alx-hero-photo-img"
      />
      <div className="alx-photo-pulse" aria-hidden="true"><i /><i /></div>
      <div className="alx-hero-rail">
        <div className="alx-hero-story">
          <div className="alx-story-meta">
            <span>{copy.visualEyebrow}</span>
            <span className="alx-privacy-chip"><ShieldCheck size={15} aria-hidden="true" />{copy.privacyLabel}</span>
          </div>
          <strong>{copy.visualTitle}</strong>
          <p>{copy.visualBody}</p>
        </div>
        <div className="alx-event-card">
          <span className="alx-event-pulse"><Activity size={19} aria-hidden="true" /></span>
          <div>
            <small>{copy.visualEvent}</small>
            <strong>{copy.visualRoom}</strong>
            <span><CheckCircle2 size={14} aria-hidden="true" />{copy.visualRoute}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TechnologyVisual({ kind, label, lang }: { kind: TechnologyKind; label: string; lang: LanguageKey }) {
  const isSpanish = lang === 'es'
  if (kind === 'fall') {
    return (
      <div className="alx-tech-visual is-fall" aria-hidden="true">
        <div className="alx-room-corner" />
        <span className="alx-wall-sensor"><Radio size={20} /></span>
        <span className="alx-radar-ring is-one" />
        <span className="alx-radar-ring is-two" />
        <span className="alx-person-marker"><UsersRound size={24} /></span>
        <div className="alx-visual-caption"><ShieldCheck size={15} />{label}</div>
      </div>
    )
  }

  if (kind === 'bathroom') {
    return (
      <div className="alx-tech-visual is-bathroom" aria-hidden="true">
        <SafeImage
          src="/images/service-gallery/04-bathroom-and-kitchen-adaptations.jpg"
          alt=""
          className="alx-tech-photo"
          imgClassName="alx-tech-photo-img"
        />
        <div className="alx-visual-caption"><LockKeyhole size={15} />{label}</div>
      </div>
    )
  }

  if (kind === 'health') {
    return (
      <div className="alx-tech-visual alx-mirror-device is-health is-mirror" aria-hidden="true">
        <SafeImage
          src="/images/service-gallery/10-health-and-vitals-monitoring.jpg"
          alt=""
          className="alx-tech-photo"
          imgClassName="alx-tech-photo-img"
        />
        <div className="alx-visual-caption"><Wifi size={15} />{label}</div>
      </div>
    )
  }

  return (
    <div className="alx-tech-visual is-room" aria-hidden="true">
      <SafeImage
        src="/images/service-gallery/08-emergency-response-device.jpg"
        alt=""
        className="alx-wearable-photo"
        imgClassName="alx-wearable-photo-img"
      />
      <div className="alx-wearable-options">
        <span><Watch size={18} /><small>{isSpanish ? 'Reloj o pulsera' : 'Watch or wristband'}</small></span>
        <span><LifeBuoy size={18} /><small>{isSpanish ? 'Colgante SOS' : 'SOS pendant'}</small></span>
      </div>
      <div className="alx-visual-caption"><Sparkles size={15} />{label}</div>
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
        '@id': 'https://www.casamia.com.es/assisted-living-solutions#service',
        name: copy.seoTitle,
        description: copy.seoDescription,
        url: 'https://www.casamia.com.es/assisted-living-solutions',
        serviceType: 'Senior-living technology integration and facility rollout',
        inLanguage: copy.lang,
        provider: { '@type': 'Organization', name: 'CasaMia', url: 'https://www.casamia.com.es' },
        areaServed: { '@type': 'Country', name: 'Spain' },
        audience: {
          '@type': 'BusinessAudience',
          audienceType: 'Assisted living facilities, senior residences, senior communities and multi-site operators',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.casamia.com.es/assisted-living-solutions#faq',
        inLanguage: copy.lang,
        mainEntity: copy.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

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
        locale: languageKey,
        name,
        email,
        phone,
        plan: 'Assisted living technology pilot',
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

      trackEvent('facility_enquiry_submitted', { facility_type: facilityType, language: languageKey, priority })
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
      <SEO title={copy.seoTitle} description={copy.seoDescription} path="/assisted-living-solutions" schema={schema} />

      <div className="alx-page" lang={copy.lang}>
        <section className="alx-hero" aria-labelledby="alx-page-title">
          <div className="site-shell alx-hero-grid">
            <div className="alx-hero-copy">
              <span className="eyebrow alx-eyebrow-light"><span className="dot" aria-hidden="true" />{copy.hero.eyebrow}</span>
              <h1 id="alx-page-title">{copy.hero.title}</h1>
              <p>{copy.hero.body}</p>
              <div className="alx-hero-actions">
                <a
                  className="btn btn-green"
                  href="#facility-enquiry"
                  onClick={() => trackEvent('facility_discovery_started', { location: 'assisted_hero' })}
                >
                  {copy.hero.primaryCta}<ArrowRight size={20} aria-hidden="true" />
                </a>
                <a className="btn alx-btn-ghost" href="#technology">{copy.hero.secondaryCta}<ChevronRight size={19} aria-hidden="true" /></a>
              </div>
              <ul className="alx-proof-list" aria-label={copy.hero.proof.join(', ')}>
                {copy.hero.proof.map((item) => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}
              </ul>
            </div>
            <HeroFacilityVisual copy={copy.hero} />
          </div>
          <div className="site-shell alx-audience-strip">
            <strong>{copy.hero.audiencesLabel}</strong>
            {copy.hero.audiences.map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <section className="alx-section alx-technology" id="technology" aria-labelledby="alx-technology-title">
          <div className="site-shell">
            <header className="alx-section-heading">
              <div><p className="eyebrow">{copy.technology.eyebrow}</p><h2 id="alx-technology-title">{copy.technology.title}</h2></div>
              <p>{copy.technology.body}</p>
            </header>
            <div className="alx-technology-grid">
              {copy.technology.items.map((item, index) => (
                <article className={`alx-tech-card is-${item.kind}${index === 0 ? ' is-featured' : ''}`} key={item.title}>
                  <div className="alx-tech-card-visual"><TechnologyVisual kind={item.kind} label={item.visualLabel} lang={languageKey} /></div>
                  <div className="alx-tech-card-copy">
                    <span className="alx-tech-index">0{index + 1}</span>
                    <span className="alx-tech-tag">{item.tag}</span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <ul>{item.points.map((point) => <li key={point}><CheckCircle2 size={16} aria-hidden="true" />{point}</li>)}</ul>
                  </div>
                </article>
              ))}
            </div>
            <p className="alx-compatibility-note"><Plug size={18} aria-hidden="true" />{copy.technology.compatibility}</p>
          </div>
        </section>

        <section className="alx-section alx-rollout" id="delivery-model" aria-labelledby="alx-rollout-title">
          <div className="site-shell">
            <header className="alx-section-heading">
              <div><p className="eyebrow">{copy.rollout.eyebrow}</p><h2 id="alx-rollout-title">{copy.rollout.title}</h2></div>
              <p>{copy.rollout.body}</p>
            </header>
            <ol className="alx-rollout-steps">
              {copy.rollout.steps.map((step, index) => {
                const Icon = rolloutIcons[index] ?? BadgeCheck
                return (
                  <li key={step.title} id={index === 2 ? 'onboarding' : undefined}>
                    <span className="alx-rollout-number">0{index + 1}</span>
                    <span className="alx-rollout-icon"><Icon size={22} aria-hidden="true" /></span>
                    <div><h3>{step.title}</h3><p>{step.body}</p></div>
                    {index === 2 ? (
                      <div className="alx-rollout-activation">
                        <strong>{copy.rollout.onboardingLabel}</strong>
                        <span>{copy.rollout.onboarding.join(' · ')}</span>
                      </div>
                    ) : null}
                    {index < copy.rollout.steps.length - 1 ? <ChevronRight size={20} aria-hidden="true" /> : null}
                  </li>
                )
              })}
            </ol>
            <p className="alx-rollout-ready"><CheckCircle2 size={18} aria-hidden="true" />{copy.rollout.ready}</p>
          </div>
        </section>

        <section className="alx-section alx-trust" aria-labelledby="alx-trust-title">
          <div className="site-shell">
            <h2 id="alx-trust-title">{copy.trust.title}</h2>
            <div className="alx-outcome-grid">
              {copy.trust.outcomes.map((item, index) => {
                const Icon = [Activity, UserRoundCheck, Link2, Building2][index] ?? BadgeCheck
                return <article key={item.title}><span><Icon size={22} aria-hidden="true" /></span><div><h3>{item.title}</h3><p>{item.body}</p></div></article>
              })}
            </div>
            <aside className="alx-boundary"><ShieldCheck size={24} aria-hidden="true" /><div><strong>{copy.trust.boundaryTitle}</strong><p>{copy.trust.boundary}</p></div></aside>
          </div>
        </section>

        <section className="alx-section alx-faq" aria-labelledby="alx-faq-title">
          <div className="site-shell alx-faq-layout">
            <div><p className="eyebrow">{copy.faq.eyebrow}</p><h2 id="alx-faq-title">{copy.faq.title}</h2></div>
            <div className="alx-faq-list">
              {copy.faq.items.map((item) => <details key={item.question}><summary>{item.question}<ChevronRight size={20} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="alx-enquiry" id="facility-enquiry" aria-labelledby="alx-enquiry-title">
          <div className="site-shell alx-enquiry-layout">
            <div className="alx-enquiry-copy">
              <p className="eyebrow alx-eyebrow-light">{copy.form.eyebrow}</p>
              <h2 id="alx-enquiry-title">{copy.form.title}</h2>
              <p>{copy.form.body}</p>
              <div className="alx-pilot-preview">
                <span><ClipboardCheck size={22} aria-hidden="true" /></span>
                <div><small>01</small><strong>{copy.rollout.steps[0].title}</strong></div>
                <ChevronRight size={18} aria-hidden="true" />
                <div><small>02</small><strong>{copy.rollout.steps[2].title}</strong></div>
                <ChevronRight size={18} aria-hidden="true" />
                <div><small>03</small><strong>{copy.rollout.steps[3].title}</strong></div>
              </div>
              <a className="alx-email-link" href="mailto:hola@casamia.com.es?subject=Assisted%20living%20technology%20pilot" onClick={() => trackEvent('email_clicked', { location: 'assisted_living_enquiry' })}>
                <Mail size={20} aria-hidden="true" /><span><small>{copy.form.emailLabel}</small><strong>hola@casamia.com.es</strong></span>
              </a>
            </div>

            <form className="alx-enquiry-form" onSubmit={handleSubmit}>
              <div className="alx-form-heading"><h3>{copy.form.cardTitle}</h3><p>{copy.form.cardIntro}</p></div>
              <div className="alx-form-grid">
                <FacilityField label={copy.form.organisation} name="organisation" required />
                <label><span>{copy.form.facilityType}</span><select name="facilityType" required defaultValue=""><option value="" disabled>{copy.form.facilityPlaceholder}</option>{copy.form.facilityOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                <FacilityField label={copy.form.location} name="location" required />
                <label><span>{copy.form.priority}</span><select name="priority" required defaultValue=""><option value="" disabled>{copy.form.priorityPlaceholder}</option>{copy.form.priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                <FacilityField label={copy.form.name} name="name" required />
                <FacilityField label={copy.form.email} name="email" type="email" required />
                <FacilityField label={copy.form.phone} name="phone" type="tel" />
              </div>
              <details className="alx-form-optional">
                <summary>{copy.form.optionalDetails}<ChevronRight size={18} aria-hidden="true" /></summary>
                <div className="alx-form-grid">
                  <FacilityField label={copy.form.role} name="role" />
                  <FacilityField label={copy.form.sites} name="sites" />
                  <label><span>{copy.form.timeline}</span><select name="timeline" defaultValue=""><option value="">{copy.form.timelinePlaceholder}</option>{copy.form.timelineOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                  <label className="alx-form-wide"><span>{copy.form.message}</span><textarea name="message" rows={4} placeholder={copy.form.messagePlaceholder} /></label>
                </div>
              </details>
              <p className="alx-form-privacy">{copy.form.privacyPrefix} <Link to="/privacy-policy">{copy.form.privacyLink}</Link>.</p>
              <button className="btn btn-green alx-form-submit" disabled={isSubmitting} type="submit">
                {isSubmitting ? copy.form.submitting : copy.form.submit}
                {isSubmitting ? <LoaderCircle className="animate-spin" size={20} aria-hidden="true" /> : <ArrowRight size={20} aria-hidden="true" />}
              </button>
              {submitError ? <p className="alx-form-message is-error" role="alert"><AlertCircle size={19} aria-hidden="true" />{submitError}</p> : null}
              {submitted ? <p className="alx-form-message is-success" role="status"><CheckCircle2 size={19} aria-hidden="true" />{copy.form.success}</p> : null}
              <p className="alx-form-note">{copy.form.note}</p>
            </form>
          </div>
        </section>
      </div>
    </>
  )
}

function FacilityField({ label, name, required, type = 'text' }: { label: string; name: string; required?: boolean; type?: 'email' | 'tel' | 'text' }) {
  return <label><span>{label}</span><input name={name} required={required} type={type} /></label>
}
