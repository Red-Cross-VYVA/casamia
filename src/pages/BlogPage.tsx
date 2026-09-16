import {
  ArrowRight,
  Bath,
  Camera,
  ClipboardCheck,
  Download,
  FileCheck2,
  HandHeart,
  HelpCircle,
  Home,
  Lightbulb,
  MessageCircle,
  MoonStar,
  PhoneCall,
  SearchCheck,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { blogArticles, type BlogArticle } from '../constants/blogContent'
import { localizeBlogArticles } from '../constants/blogContentLocalization'
import { decisionGuidePages } from '../constants/needLandingPages'
import { localizeNeedLandingPages } from '../constants/needLandingPagesLocalization'
import {
  completeHomeChecklistDownloads,
  type ResourceDownloadLanguage,
} from '../constants/resourceDownloads'
import { trackEvent } from '../utils/analytics'
import '../styles/resources-hub.css'

const siteUrl = 'https://www.casamia.com.es'

const pageCopy = {
  en: {
    lang: 'en',
    seoTitle: 'Senior Home Safety Checklist & Decision Tools | CasaMia',
    seoDescription:
      'Download CasaMia\'s free room-by-room senior home conversion checklist for Spain and use clear tools for home safety, grant readiness and planning.',
    heroEyebrow: 'Decision tools for real homes',
    heroTitle: 'Make the home safer, one room at a time.',
    heroBody:
      'Start with a complete printable checklist, then use the right online tool or focused guide for the decision in front of you.',
    heroPrimary: 'Get the free checklist',
    heroSecondary: 'Use the online self-check',
    heroSignals: ['No sign-up needed', 'English and Spanish', 'Know what to check first'],
    educationEyebrow: 'CasaMia education hub',
    educationTitle: 'Find the check that matches today’s concern.',
    educationBody:
      'Choose by room, recent change or decision point, then use the checklist, guide or tool that shows what to review next.',
    downloadEyebrow: 'Free printable workbook',
    downloadTitle: 'The Complete Senior Home Conversion Checklist',
    downloadBody:
      'Walk through the home with the person who lives there, identify visible first fixes, flag work that needs professional review and finish with a clear action plan.',
    downloadStats: [
      { value: '10', label: 'home areas' },
      { value: '100+', label: 'room checks' },
      { value: '1', label: 'action plan' },
    ],
    downloadBenefits: [
      'Entrances, stairs, living areas, bedroom, bathroom and kitchen',
      'Lighting, emergency planning, connected safety and outdoor areas',
      'Priority guide, quotation prompts and a safe-use recheck',
    ],
    downloadPrimary: 'Download the English PDF',
    downloadSecondary: 'Descargar en español',
    downloadNote: 'Print-friendly PDF. No email or sign-up required.',
    coverLabel: 'CASAMIA HOME CHECKLIST',
    coverFooter: 'Room by room. Priority by priority.',
    previewRooms: ['Entrance', 'Bathroom', 'Bedroom', 'Kitchen'],
    toolsEyebrow: 'Choose the check you need',
    toolsTitle: 'Start with the task you need today.',
    toolsBody:
      'Each tool has one clear job. Use it online, save your observations and bring the result into a home discussion or professional assessment.',
    openTool: 'Open tool',
    journeyEyebrow: 'Choose by current concern',
    journeyTitle: 'Start where the risk is already showing.',
    journeyBody:
      'A safer home usually starts with one pressure point: a recent change, a worrying room, or a decision that needs structure.',
    topicsEyebrow: 'Explore by safety topic',
    topicsTitle: 'Go straight to the area you are trying to understand.',
    topicsBody:
      'These topic pages bring together the guidance, tools and CasaMia next steps for one home-safety question.',
    pathwaysEyebrow: 'Choose the closest situation',
    pathwaysTitle: 'Help by decision, not by article title.',
    pathwaysBody:
      'Most people arrive with one urgent question. Start there, then use the guide, checklist or tool that shows what to check or decide first.',
    pathwayCta: 'Start here',
    familyStarterEyebrow: '10-minute home discussion',
    familyStarterTitle: 'Before choosing products, name the risk to solve.',
    familyStarterBody:
      'Use these prompts with the person at home and anyone helping them. The aim is not to diagnose the home in one sitting; it is to agree the first room, daily path or routine to review.',
    familyStarterFinalTitle: 'Leave with one agreed action',
    familyStarterFinalBody:
      'Choose the room, daily path or routine causing the most concern this week. Then use the checklist, online review or CasaMia assessment to define the next action.',
    familyStarterCta: 'Start the guided review',
    comparisonEyebrow: 'Decision guides',
    comparisonTitle: 'Compare your options before you commit.',
    comparisonBody:
      'Short guides for the moments when you are choosing between review, adaptation, grant preparation or doing nothing yet.',
    downloadsEyebrow: 'Printable materials',
    downloadsTitle: 'Documents to share before a decision.',
    downloadsBody:
      'Download materials you can print, annotate, send to trusted contacts or take into a professional visit.',
    downloadAction: 'Download',
    momentsEyebrow: 'When people usually need help',
    momentsTitle: 'Resources for the moments that create pressure.',
    momentsBody:
      'Use these quick checks when something has changed at home, after hospital, or during a support conversation.',
    todayEyebrow: 'A clear first 20 minutes',
    todayTitle: 'Three checks worth doing today.',
    todayBody:
      'These are observations, not building work. If anything feels unstable or unsafe, stop using it and arrange an appropriate review.',
    localEyebrow: 'Spain-specific help',
    localTitle: 'Turn general advice into checks that fit a Spanish home.',
    localBody:
      'CasaMia resources are designed for the questions people face in Spain: local homes, regional grant criteria, measurements, installers and application documents.',
    guideEyebrow: 'Guidance by situation',
    guideTitle: 'Find the answer without scrolling through a wall of articles.',
    guideBody:
      'Guides are grouped around the decision you are trying to make. Choose the closest situation and go straight to the relevant advice.',
    guideLanguage: 'Guides are currently available in English.',
    searchLabel: 'Search resources',
    searchPlaceholder: 'Try bathroom, falls, grants, night safety...',
    searchResults: 'Showing matching guides for',
    searchClear: 'Clear search',
    searchEmpty: 'No matching guides yet. Try bathroom, falls, grants, bedroom, stairs or provider.',
    readGuide: 'Read guide',
    actionRouteEyebrow: 'From reading to action',
    actionRouteTitle: 'Turn good advice into a calm home safety plan.',
    actionRouteBody:
      'Use the Resources hub to learn what matters, then move into a guided CasaMia review when you want priorities, scope, grant readiness or a managed proposal.',
    actionRouteCta: 'Start the guided review',
    faqEyebrow: 'Common questions',
    faqTitle: 'Quick answers before you choose a resource.',
    faqItems: [
      {
        question: 'Which resource should I start with?',
        answer:
          'If you need a broad first pass, start with the printable checklist. If one area feels urgent, use the room guide or online safety review first.',
      },
      {
        question: 'Can I use these resources before booking CasaMia?',
        answer:
          'Yes. Use the checklist, guides and tools to prepare notes before deciding whether a professional visit is needed.',
      },
      {
        question: 'When should we arrange a home visit?',
        answer:
          'A visit is useful when measurements, installation details, mobility needs or several rooms need to be reviewed before a final proposal.',
      },
      {
        question: 'Can CasaMia help with grants and documents?',
        answer:
          'CasaMia organises the grant document checklist, safety wording and quotation information. Public authorities make the final grant decision.',
      },
    ],
    finalEyebrow: 'Need a plan for a real home?',
    finalTitle: 'Turn the checklist into a prioritised conversion plan.',
    finalBody:
      'CasaMia reviews the home, separates urgent changes from future improvements and defines the next action, scope and evidence needed.',
    finalCta: 'Request a home assessment',
  },
  es: {
    lang: 'es',
    seoTitle: 'Lista de seguridad y recursos para adaptar viviendas | CasaMia',
    seoDescription:
      'Descarga gratis la lista de CasaMia para revisar una vivienda estancia por estancia y utiliza herramientas claras de seguridad, ayudas y planificación.',
    heroEyebrow: 'Herramientas para decisiones reales',
    heroTitle: 'Haz el hogar más seguro, estancia por estancia.',
    heroBody:
      'Empieza con una lista completa para imprimir y utiliza después la herramienta o guía adecuada para la decisión que tienes delante.',
    heroPrimary: 'Descargar la lista gratuita',
    heroSecondary: 'Usar la revisión online',
    heroSignals: ['Sin registro', 'Español e inglés', 'Qué revisar primero'],
    educationEyebrow: 'Centro de aprendizaje CasaMia',
    educationTitle: 'Encuentra la revisión que encaja con la preocupación de hoy.',
    educationBody:
      'Elige por estancia, cambio reciente o decisión pendiente, y usa la lista, guía o herramienta que muestra qué revisar después.',
    downloadEyebrow: 'Cuaderno gratuito para imprimir',
    downloadTitle: 'Lista completa para adaptar la vivienda de una persona mayor',
    downloadBody:
      'Recorre la vivienda con la persona que vive en ella, identifica mejoras rápidas, señala los trabajos que necesitan revisión profesional y termina con un plan de acción claro.',
    downloadStats: [
      { value: '10', label: 'zonas del hogar' },
      { value: '100+', label: 'comprobaciones' },
      { value: '1', label: 'plan de acción' },
    ],
    downloadBenefits: [
      'Entrada, escaleras, salón, dormitorio, baño y cocina',
      'Iluminación, emergencias, seguridad conectada y exteriores',
      'Prioridades, preguntas para presupuestos y revisión final',
    ],
    downloadPrimary: 'Descargar el PDF en español',
    downloadSecondary: 'Download in English',
    downloadNote: 'PDF preparado para imprimir. Sin email ni registro.',
    coverLabel: 'LISTA CASAMIA',
    coverFooter: 'Estancia por estancia. Prioridad por prioridad.',
    previewRooms: ['Entrada', 'Baño', 'Dormitorio', 'Cocina'],
    toolsEyebrow: 'Elige la revisión que necesitas',
    toolsTitle: 'Empieza por lo que necesitas hoy.',
    toolsBody:
      'Cada herramienta tiene una función clara. Úsala online, guarda tus observaciones y llévalas a una conversación sobre la vivienda o a una evaluación profesional.',
    openTool: 'Abrir herramienta',
    journeyEyebrow: 'Elige por preocupación actual',
    journeyTitle: 'Empieza donde el riesgo ya se nota.',
    journeyBody:
      'Un hogar más seguro suele empezar por un punto de presión: un cambio reciente, una estancia que preocupa o una decisión que necesita orden.',
    topicsEyebrow: 'Explora por tema de seguridad',
    topicsTitle: 'Ve directamente al área que quieres entender.',
    topicsBody:
      'Estas páginas reúnen guías, herramientas y próximos pasos CasaMia para una pregunta concreta de seguridad en casa.',
    pathwaysEyebrow: 'Elige la situación más cercana',
    pathwaysTitle: 'Ayuda por decisión, no por título de artículo.',
    pathwaysBody:
      'Muchas personas llegan con una pregunta urgente. Empieza ahí y pasa después a la guía, lista o herramienta que muestra qué revisar o decidir primero.',
    pathwayCta: 'Empezar aquí',
    familyStarterEyebrow: 'Primeros 10 minutos de conversación',
    familyStarterTitle: 'Antes de elegir productos, nombrad el riesgo que queréis resolver.',
    familyStarterBody:
      'Usa estas preguntas con la persona que vive en casa y quienes la apoyan. No se trata de diagnosticar la vivienda en una conversación, sino de acordar la primera estancia, paso diario o rutina para revisar.',
    familyStarterFinalTitle: 'Terminad con una acción acordada',
    familyStarterFinalBody:
      'Elegid la estancia, paso diario o rutina que más preocupa esta semana. Después usad la lista, la revisión online o una evaluación CasaMia para definir la próxima acción.',
    familyStarterCta: 'Empezar revisión guiada',
    comparisonEyebrow: 'Guías de decisión',
    comparisonTitle: 'Compara las opciones antes de decidir.',
    comparisonBody:
      'Guías breves para cuando hay que elegir entre revisar, adaptar, preparar ayudas o no actuar todavía.',
    downloadsEyebrow: 'Materiales para imprimir',
    downloadsTitle: 'Documentos para compartir antes de decidir.',
    downloadsBody:
      'Descarga materiales para imprimir, anotar, enviar a contactos de confianza o llevar a una visita profesional.',
    downloadAction: 'Descargar',
    momentsEyebrow: 'Cuándo suele hacer falta ayuda',
    momentsTitle: 'Recursos para los momentos que generan presión.',
    momentsBody:
      'Usa estas revisiones rápidas cuando algo ha cambiado en casa, tras el hospital o durante una conversación de apoyo.',
    todayEyebrow: 'Primeros 20 minutos claros',
    todayTitle: 'Tres comprobaciones que merece la pena hacer hoy.',
    todayBody:
      'Son observaciones, no trabajos de obra. Si algo está inestable o parece peligroso, deja de usarlo y solicita una revisión adecuada.',
    localEyebrow: 'Ayuda adaptada a España',
    localTitle: 'Convierte el consejo general en revisiones útiles para una vivienda en España.',
    localBody:
      'Los recursos CasaMia están pensados para preguntas reales en España: tipos de vivienda, ayudas autonómicas, mediciones, instaladores y documentos de solicitud.',
    guideEyebrow: 'Guías por situación',
    guideTitle: 'Encuentra la respuesta sin recorrer una pared de artículos.',
    guideBody:
      'Las guías están agrupadas según la decisión que necesitas tomar. Elige la situación más cercana y ve directamente al consejo relevante.',
    guideLanguage: '',
    searchLabel: 'Buscar recursos',
    searchPlaceholder: 'Prueba baño, caídas, ayudas, noche...',
    searchResults: 'Mostrando guías relacionadas con',
    searchClear: 'Borrar búsqueda',
    searchEmpty: 'No hay guías que coincidan. Prueba baño, caídas, ayudas, dormitorio, escaleras o proveedor.',
    readGuide: 'Leer guía',
    actionRouteEyebrow: 'De la lectura a la acción',
    actionRouteTitle: 'Convierte buenos consejos en un plan claro para la vivienda.',
    actionRouteBody:
      'Usa Recursos para entender qué importa y pasa a una revisión guiada CasaMia cuando quieras prioridades, alcance, preparación de ayudas o una propuesta gestionada.',
    actionRouteCta: 'Empezar revisión guiada',
    faqEyebrow: 'Preguntas frecuentes',
    faqTitle: 'Respuestas rápidas antes de elegir un recurso.',
    faqItems: [
      {
        question: '¿Por qué recurso debería empezar?',
        answer:
          'Si necesitas una primera revisión general, empieza con la lista para imprimir. Si una zona preocupa más, usa la guía por estancia o la revisión online.',
      },
      {
        question: '¿Puedo usar estos recursos antes de contratar a CasaMia?',
        answer:
          'Sí. La lista, las guías y las herramientas ayudan a preparar la conversación antes de decidir si hace falta apoyo profesional.',
      },
      {
        question: '¿Cuándo conviene pedir una visita a domicilio?',
        answer:
          'Una visita ayuda cuando hacen falta medidas, detalles de instalación, revisión de movilidad o una propuesta final que afecte a varias estancias.',
      },
      {
        question: '¿Cómo se ordenan las ayudas y documentos?',
        answer:
          'CasaMia ordena la vía de ayuda, la lista de documentos y la información del presupuesto. La autoridad pública decide la aprobación final.',
      },
    ],
    finalEyebrow: '¿Necesitas un plan para una vivienda real?',
    finalTitle: 'Convierte la lista en un plan de adaptación con prioridades.',
    finalBody:
      'CasaMia revisa la vivienda, separa los cambios urgentes de las mejoras futuras y define alcance, evidencia y siguiente acción.',
    finalCta: 'Solicitar una evaluación',
  },
} as const

const toolContent = [
  {
    icon: HelpCircle,
    title: { en: 'Is this home safe day to day?', es: '¿Esta casa es segura en el día a día?' },
    body: {
      en: 'Answer five everyday questions and see whether to monitor, check one room or request a focused CasaMia review.',
      es: 'Responde cinco preguntas cotidianas y ve si conviene observar, revisar una estancia o pedir una revisión CasaMia.',
    },
    to: '/tools/senior-friendly-home-check',
  },
  {
    icon: ClipboardCheck,
    title: { en: '15-minute room-by-room check', es: 'Revisión online por estancias' },
    body: {
      en: 'Answer guided questions across seven areas and leave with a room-by-room list of items to review.',
      es: 'Responde preguntas guiadas en siete zonas y obtén una lista por estancia de puntos que revisar.',
    },
    to: '/home-safety-assessment?open=self-inspection#self-inspection-tool',
  },
  {
    icon: Camera,
    title: { en: 'Photo safety review', es: 'Revisión de seguridad con fotos' },
    body: {
      en: 'Organise room photos and context so the visible concerns can be compared and prioritised.',
      es: 'Organiza fotos y contexto para comparar y priorizar las preocupaciones visibles.',
    },
    to: '/#estimate-upload',
  },
  {
    icon: FileCheck2,
    title: { en: 'Grant-readiness check', es: 'Revisión para preparar ayudas' },
    body: {
      en: 'Prepare the documents and funding questions to check before a local grant call or quotation.',
      es: 'Prepara los documentos y preguntas que conviene revisar antes de una convocatoria o presupuesto.',
    },
    to: '/grant-check',
  },
] as const

const educationHubSteps = [
  {
    icon: SearchCheck,
    label: { en: 'Understand', es: 'Entender' },
    title: { en: 'Start with the worry', es: 'Empieza por la preocupación' },
    body: {
      en: 'Falls, bathroom access, night routes, grants or a recent change at home.',
      es: 'Caídas, acceso al baño, rutas nocturnas, ayudas o un cambio reciente en casa.',
    },
  },
  {
    icon: ClipboardCheck,
    label: { en: 'Check', es: 'Revisar' },
    title: { en: 'Use one focused tool', es: 'Usa una herramienta concreta' },
    body: {
      en: 'Checklist, room guide, cost planner, grant check or short safety quiz.',
      es: 'Lista, guía por estancia, comparador de costes, ayudas o test breve.',
    },
  },
  {
    icon: Camera,
    label: { en: 'Capture', es: 'Capturar' },
    title: { en: 'Add real-home evidence', es: 'Añade evidencia real' },
    body: {
      en: 'Photos, notes and context show which priority should be checked first.',
      es: 'Fotos, notas y contexto ayudan a comparar prioridades.',
    },
  },
  {
    icon: HandHeart,
    label: { en: 'Act', es: 'Actuar' },
    title: { en: 'Move into a managed plan', es: 'Pasa a un plan gestionado' },
    body: {
      en: 'CasaMia can coordinate assessment, proposal, grant support and installation.',
      es: 'CasaMia puede coordinar evaluación, propuesta, ayudas e instalación.',
    },
  },
] as const

const resourceJourneys = [
  {
    icon: Stethoscope,
    title: { en: 'Something changed recently', es: 'Algo ha cambiado hace poco' },
    body: {
      en: 'A fall, hospital stay, new diagnosis or hesitation when walking can make the home feel different overnight.',
      es: 'Una caída, ingreso, diagnóstico o dudas al caminar pueden cambiar la vivienda de un día para otro.',
    },
    steps: {
      en: ['Check the urgent routes', 'Collect photos or notes', 'Decide what needs review first'],
      es: ['Revisa las rutas urgentes', 'Reúne fotos o notas', 'Decide qué revisar primero'],
    },
    to: '/blog/hospital-discharge-home-safety-checklist',
    cta: { en: 'Use discharge checklist', es: 'Usar lista del alta' },
    download: false,
  },
  {
    icon: Bath,
    title: { en: 'One room is creating worry', es: 'Una estancia preocupa más' },
    body: {
      en: 'Bathrooms, stairs, bedrooms and entrances are often the first places where small changes reduce daily risk.',
      es: 'Baños, escaleras, dormitorios y entradas suelen ser los primeros lugares donde pequeños cambios reducen riesgo diario.',
    },
    steps: {
      en: ['Pick the room', 'Read the focused guide', 'Compare scoped options'],
      es: ['Elige la estancia', 'Lee la guía específica', 'Compara opciones con alcance'],
    },
    to: '/services/bathroom-safety',
    cta: { en: 'See a room guide', es: 'Ver guía por estancia' },
    download: false,
  },
  {
    icon: HandHeart,
    title: { en: 'The support circle needs a plan', es: 'El círculo de apoyo necesita un plan' },
    body: {
      en: 'When relatives disagree, a shared checklist and priorities make the conversation calmer and more useful.',
      es: 'Cuando hay opiniones distintas, una lista compartida y prioridades claras ordenan la conversación.',
    },
    steps: {
      en: ['Download the checklist', 'Mark what feels unsafe', 'Bring the notes into one conversation'],
      es: ['Descarga la lista', 'Marca lo que parece inseguro', 'Lleva las notas a una conversación'],
    },
    to: completeHomeChecklistDownloads.en.href,
    cta: { en: 'Download checklist', es: 'Descargar lista' },
    download: true,
  },
] as const

const topicRoutes = [
  {
    icon: ShieldCheck,
    to: '/fall-prevention-at-home',
    title: { en: 'Fall prevention at home', es: 'Prevención de caídas en casa' },
    body: {
      en: 'Understand the rooms, routes and routines that usually create the highest fall risk.',
      es: 'Entiende las estancias, rutas y rutinas que suelen concentrar mayor riesgo de caída.',
    },
    pill: { en: 'Whole-home safety', es: 'Seguridad global' },
  },
  {
    icon: Bath,
    to: '/services/bathroom-safety',
    title: { en: 'Bathroom safety', es: 'Seguridad en el baño' },
    body: {
      en: 'Focus on bathing, toilet transfers, lighting, water controls and safer access.',
      es: 'Céntrate en ducha, inodoro, iluminación, controles de agua y acceso más seguro.',
    },
    pill: { en: 'Highest-risk room', es: 'Estancia crítica' },
  },
  {
    icon: MoonStar,
    to: '/services/bedroom-safety',
    title: { en: 'Bedroom and night routes', es: 'Dormitorio y ruta nocturna' },
    body: {
      en: 'Review getting out of bed, night lighting and the route to the bathroom.',
      es: 'Mejora la salida de la cama, la luz nocturna y la ruta hacia el baño.',
    },
    pill: { en: 'Night route', es: 'Ruta nocturna' },
  },
  {
    icon: Home,
    to: '/aging-in-place-home-assessment',
    title: { en: 'Home assessment', es: 'Evaluación del hogar' },
    body: {
      en: 'See when a guided review is needed before choosing products or installation.',
      es: 'Comprueba cuándo una revisión guiada convierte preocupaciones sueltas en un plan claro.',
    },
    pill: { en: 'Professional route', es: 'Ruta profesional' },
  },
  {
    icon: FileCheck2,
    to: '/grants',
    title: { en: 'Grants and documents', es: 'Ayudas y documentos' },
    body: {
      en: 'Prepare the location, documents and scope questions before relying on funding.',
      es: 'Prepara ubicación, documentos y alcance antes de contar con financiación.',
    },
    pill: { en: 'Funding readiness', es: 'Preparación ayudas' },
  },
  {
    icon: HandHeart,
    to: '/home-adaptations-for-elderly',
    title: { en: 'Home adaptations', es: 'Adaptaciones del hogar' },
    body: {
      en: 'See which home changes protect useful routines while reducing daily risk.',
      es: 'Revisa qué cambios protegen rutinas útiles mientras reducen riesgo diario.',
    },
    pill: { en: 'Turnkey support', es: 'Servicio integral' },
  },
] as const

const decisionPathways = [
  {
    icon: ShieldCheck,
    image: '/images/solutions/bathroom-risk-map-numbered.png',
    title: { en: 'I need to know what is risky first', es: 'Necesito saber qué es arriesgado primero' },
    body: {
      en: 'Use the checklist or photo review to separate urgent risks from nice-to-have improvements.',
      es: 'Usa la lista o la revisión con fotos para separar riesgos urgentes de mejoras futuras.',
    },
    actions: [
      { label: { en: 'Start safety report', es: 'Iniciar informe' }, to: '/#estimate-upload' },
      { label: { en: 'Read fall guide', es: 'Leer guía de caídas' }, to: '/blog/fall-prevention-home-checklist-spain' },
    ],
  },
  {
    icon: Bath,
    image: '/images/blog/bathroom-mistakes.webp',
    title: { en: 'The bathroom is the main worry', es: 'El baño es la mayor preocupación' },
    body: {
      en: 'Focus on bathing, toilet transfers, floor grip, lighting, water controls and access.',
      es: 'Céntrate en baño/ducha, inodoro, agarre del suelo, iluminación, controles de agua y acceso.',
    },
    actions: [
      { label: { en: 'Bathroom guide', es: 'Guía de baño' }, to: '/blog/bathroom-safety-seniors-costly-mistakes' },
      { label: { en: 'View services', es: 'Ver servicios' }, to: '/services' },
    ],
  },
  {
    icon: FileCheck2,
    image: '/images/solutions/adorable-mature-couple-kitchen.jpg',
    title: { en: 'I want to understand grants or funding', es: 'Quiero entender ayudas o financiación' },
    body: {
      en: 'Prepare the documents, eligibility questions and scope notes before relying on any programme.',
      es: 'Prepara documentos, requisitos y notas de alcance antes de contar con una ayuda.',
    },
    actions: [
      { label: { en: 'Grant check', es: 'Revisar ayudas' }, to: '/grant-check' },
      { label: { en: 'Grant guide', es: 'Guía de ayudas' }, to: '/blog/home-adaptation-grants-spain-family-guide' },
    ],
  },
  {
    icon: Home,
    image: '/images/blog/provider-choice.webp',
    title: { en: 'We are unsure if staying home is still realistic', es: 'No sabemos si seguir en casa sigue siendo realista' },
    body: {
      en: 'Compare what home adaptations can solve with the point where more support or a residence route should be considered.',
      es: 'Compara lo que puede resolver una adaptación con el momento en que conviene valorar más apoyo o una residencia.',
    },
    actions: [
      { label: { en: 'Read decision guide', es: 'Leer guía de decisión' }, to: '/blog/when-home-adaptations-are-not-enough' },
      { label: { en: 'Start a home review', es: 'Empezar revisión' }, to: '/home-safety-wizard' },
    ],
  },
] as const

const familyStarterPrompts = [
  {
    icon: MessageCircle,
    title: { en: 'What changed recently?', es: '¿Qué ha cambiado últimamente?' },
    body: {
      en: 'A fall, hospital stay, new medication, night wandering, pain, fatigue or a room that suddenly feels harder.',
      es: 'Una caída, hospitalización, medicación nueva, paseos nocturnos, dolor, cansancio o una estancia que ahora cuesta más.',
    },
  },
  {
    icon: SearchCheck,
    title: { en: 'Where does worry appear?', es: '¿Dónde aparece la preocupación?' },
    body: {
      en: 'Name the exact moment: showering, toilet transfers, stairs, getting out of bed, cooking or reaching the entrance.',
      es: 'Nombra el momento exacto: ducha, inodoro, escaleras, levantarse de la cama, cocinar o llegar a la entrada.',
    },
  },
  {
    icon: HandHeart,
    title: { en: 'What must stay familiar?', es: '¿Qué debe seguir siendo reconocible?' },
    body: {
      en: 'Name the routines, rooms and details that should stay familiar wherever safety allows.',
      es: 'Nombra las rutinas, estancias y detalles que conviene mantener reconocibles siempre que la seguridad lo permita.',
    },
  },
  {
    icon: ClipboardCheck,
    title: { en: 'What decision is needed this week?', es: '¿Qué decisión hace falta esta semana?' },
    body: {
      en: 'Choose one action: clear a route, download the checklist, send photos, request a visit or compare home with residence.',
      es: 'Elegid un paso: despejar una ruta, descargar la lista, enviar fotos, pedir una visita o comparar casa y residencia.',
    },
  },
] as const

const printableMaterials = [
  {
    icon: ClipboardCheck,
    title: { en: 'Complete home conversion checklist', es: 'Lista completa de adaptación del hogar' },
    body: {
      en: 'Room-by-room workbook with priorities, notes and an action plan.',
      es: 'Cuaderno estancia por estancia con prioridades, notas y plan de acción.',
    },
    kind: { en: 'PDF workbook', es: 'Cuaderno PDF' },
    getHref: (language: ResourceDownloadLanguage) => completeHomeChecklistDownloads[language].href,
    downloadLanguage: (language: ResourceDownloadLanguage) => language,
  },
  {
    icon: MoonStar,
    title: { en: 'Night route mini-check', es: 'Mini revisión de la ruta nocturna' },
    body: {
      en: 'A focused printable prompt for bed-to-bathroom movement, lighting and support points.',
      es: 'Una guía breve para revisar ruta cama-baño, iluminación y puntos de apoyo.',
    },
    kind: { en: 'Quick checklist', es: 'Lista breve' },
    getHref: () => '/blog/bedroom-night-safety-older-adults',
    downloadLanguage: undefined,
  },
  {
    icon: SearchCheck,
    title: { en: 'Grant preparation notes', es: 'Notas para preparar ayudas' },
    body: {
      en: 'What to gather before a grant conversation: home, resident, ownership, quotes and timing.',
      es: 'Qué reunir antes de hablar de ayudas: vivienda, persona, propiedad, presupuestos y plazos.',
    },
    kind: { en: 'Guide', es: 'Guía' },
    getHref: () => '/blog/home-adaptation-grants-spain-family-guide',
    downloadLanguage: undefined,
  },
] as const

const familyMoments = [
  {
    icon: Stethoscope,
    title: { en: 'After a fall, surgery or hospital stay', es: 'Después de una caída, operación u hospital' },
    body: {
      en: 'Prioritise entry, bathroom, bedroom routes and the first week back home.',
      es: 'Prioriza entrada, baño, rutas del dormitorio y la primera semana en casa.',
    },
    to: '/blog/hospital-discharge-home-safety-checklist',
  },
  {
    icon: HandHeart,
    title: { en: 'When people disagree on what to fix', es: 'Cuando no hay acuerdo sobre qué cambiar' },
    body: {
      en: 'Use a shared checklist and a clear risk-first plan instead of scattered opinions.',
      es: 'Usa una lista compartida y un plan por riesgo, no opiniones dispersas.',
    },
    to: '/blog/choose-home-safety-provider-spain',
  },
  {
    icon: Home,
    title: { en: 'When the home still feels fine — but harder', es: 'Cuando la casa sigue bien, pero cuesta más' },
    body: {
      en: 'Look for small signals: night trips, bending, stairs, wet floors and reaching for furniture.',
      es: 'Observa señales pequeñas: noches, agacharse, escaleras, suelos mojados y apoyarse en muebles.',
    },
    to: '/blog/fall-prevention-home-checklist-spain',
  },
] as const

const quickChecks = [
  {
    icon: MoonStar,
    title: { en: 'Walk the night route', es: 'Recorre la ruta nocturna' },
    body: {
      en: 'Check the route from bed to bathroom in low light. Note shadows, thresholds, cables and what the person reaches for.',
      es: 'Revisa con poca luz el recorrido de la cama al baño. Anota sombras, umbrales, cables y dónde busca apoyo la persona.',
    },
  },
  {
    icon: Lightbulb,
    title: { en: 'Clear one daily route', es: 'Despeja una ruta diaria' },
    body: {
      en: 'Remove loose rugs, pet items and low furniture from the route used most between the main rooms.',
      es: 'Retira alfombras sueltas, objetos de mascotas y muebles bajos de la ruta más utilizada entre las estancias principales.',
    },
  },
  {
    icon: PhoneCall,
    title: { en: 'Put help within reach', es: 'Deja la ayuda al alcance' },
    body: {
      en: 'Confirm a charged phone or call device can be reached from the bed and bathroom, and agree who responds.',
      es: 'Comprueba que hay un teléfono cargado o dispositivo de aviso accesible desde la cama y el baño, y acuerda quién responde.',
    },
  },
] as const

const actionRouteSteps = [
  {
    icon: SearchCheck,
    title: { en: 'Learn what matters', es: 'Entender lo importante' },
    body: {
      en: 'Start with the checklist, room guide or decision page that matches the main concern.',
      es: 'Empieza con la lista, guía por estancia o página de decisión que encaja con la preocupación principal.',
    },
  },
  {
    icon: Camera,
    title: { en: 'Capture the real home', es: 'Capturar la vivienda real' },
    body: {
      en: 'Add photos, notes or a guided self-check so the plan is based on actual rooms and routines.',
      es: 'Añade fotos, notas o una revisión guiada para basar el plan en estancias y rutinas reales.',
    },
  },
  {
    icon: ClipboardCheck,
    title: { en: 'Prioritise the first works', es: 'Priorizar los primeros cambios' },
    body: {
      en: 'Separate urgent safety actions from later improvements before spending money.',
      es: 'Separa acciones urgentes de seguridad de mejoras posteriores antes de gastar.',
    },
  },
  {
    icon: HandHeart,
    title: { en: 'Let CasaMia coordinate', es: 'Dejar que CasaMia coordine' },
    body: {
      en: 'Move from information to assessment, proposal, grant support and managed installation.',
      es: 'Pasa de información a evaluación, propuesta, apoyo con ayudas e instalación gestionada.',
    },
  },
] as const

const localSpainRoutes = [
  {
    icon: Home,
    title: { en: 'Start with the real home', es: 'Empezar por la vivienda real' },
    body: {
      en: 'Apartment, villa, old building, stairs, narrow bathrooms and rented homes can all change the safest route.',
      es: 'Piso, chalet, edificio antiguo, escaleras, baños estrechos o alquiler pueden cambiar la ruta más segura.',
    },
  },
  {
    icon: SearchCheck,
    title: { en: 'Check what needs evidence', es: 'Ver qué necesita evidencia' },
    body: {
      en: 'Photos, room notes, ownership status and mobility context help turn a worry into a scoped proposal.',
      es: 'Fotos, notas por estancia, situación de la vivienda y movilidad ayudan a convertir una preocupación en propuesta.',
    },
  },
  {
    icon: FileCheck2,
    title: { en: 'Prepare grant support early', es: 'Preparar ayudas desde el inicio' },
    body: {
      en: 'Regional routes can depend on timing, documentation and official criteria, so the file should be structured before work starts.',
      es: 'Las rutas autonómicas dependen de plazos, documentos y criterios oficiales; conviene ordenar el expediente antes de empezar.',
    },
  },
  {
    icon: HandHeart,
    title: { en: 'Move into one managed plan', es: 'Pasar a un plan gestionado' },
    body: {
      en: 'When you are ready, CasaMia connects assessment, proposal, products, installation and follow-up.',
      es: 'Cuando estés listo, CasaMia conecta evaluación, propuesta, productos, instalación y seguimiento.',
    },
  },
] as const

const guideGroups = [
  {
    icon: ShieldCheck,
    title: { en: 'Reduce everyday fall risk', es: 'Reducir el riesgo de caídas' },
    articleIds: [
      'fall-prevention-home-checklist-spain',
      'bathroom-safety-seniors-costly-mistakes',
      'stair-safety-handrails-older-adults',
      'bedroom-night-safety-older-adults',
    ],
  },
  {
    icon: Home,
    title: { en: 'Support routines and daily safety', es: 'Apoyar rutinas y seguridad diaria' },
    articleIds: [
      'kitchen-safety-aging-in-place',
      'dementia-friendly-home-safety',
      'hospital-discharge-home-safety-checklist',
      'smart-home-safety-without-overcomplicating',
      'emergency-plan-aging-parents-home',
      'when-home-adaptations-are-not-enough',
    ],
  },
  {
    icon: Bath,
    title: { en: 'Plan work and funding', es: 'Planificar obras y financiación' },
    articleIds: [
      'home-adaptation-grants-spain-family-guide',
      'choose-home-safety-provider-spain',
    ],
  },
] as const

function normalizeResourceSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function articleMatchesResourceSearch(article: BlogArticle, query: string) {
  if (!query) {
    return true
  }

  const searchable = [
    article.title,
    article.description,
    article.category,
    article.intro,
    ...article.keywords,
    ...article.takeaways,
  ].join(' ')

  return normalizeResourceSearch(searchable).includes(query)
}

export function BlogPage() {
  const { i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const language: ResourceDownloadLanguage = i18n.language.startsWith('es') ? 'es' : 'en'
  const copy = pageCopy[language]
  const primaryDownload = completeHomeChecklistDownloads[language]
  const localizedArticles = useMemo(() => localizeBlogArticles(blogArticles, language), [language])
  const localizedDecisionGuides = useMemo(
    () => localizeNeedLandingPages(decisionGuidePages, language),
    [language],
  )
  const resourceSearchQuery = searchParams.get('search')?.trim() ?? ''
  const normalizedResourceSearch = normalizeResourceSearch(resourceSearchQuery)
  const filteredGuideGroups = useMemo(
    () =>
      guideGroups
        .map((group) => {
          const articles = group.articleIds
            .map((articleId) => localizedArticles.find((article) => article.id === articleId))
            .filter((article): article is (typeof localizedArticles)[number] => Boolean(article))
            .filter((article) => articleMatchesResourceSearch(article, normalizedResourceSearch))

          return { ...group, articles }
        })
        .filter((group) => group.articles.length > 0),
    [localizedArticles, normalizedResourceSearch],
  )
  const filteredGuideCount = filteredGuideGroups.reduce((total, group) => total + group.articles.length, 0)

  function updateResourceSearch(value: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (value.trim()) {
      nextParams.set('search', value)
    } else {
      nextParams.delete('search')
    }

    setSearchParams(nextParams, { replace: true })
  }

  const resourceHubSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${siteUrl}/blog#resources`,
          url: `${siteUrl}/blog`,
          name: copy.seoTitle,
          description: copy.seoDescription,
          inLanguage: copy.lang,
          publisher: {
            '@type': 'Organization',
            name: 'CasaMia',
            url: siteUrl,
          },
          mainEntity: { '@id': `${siteUrl}/blog#resource-list` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${siteUrl}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: language === 'es' ? 'Recursos' : 'Resources',
              item: `${siteUrl}/blog`,
            },
          ],
        },
        ...printableMaterials.map((material) => {
          const href = material.getHref(language)
          const documentLanguage = material.downloadLanguage?.(language)
          const isPdf = Boolean(documentLanguage)

          return {
            '@type': 'DigitalDocument',
            '@id': `${siteUrl}${href}#document`,
            name: material.title[language],
            description: material.body[language],
            inLanguage: documentLanguage ?? copy.lang,
            encodingFormat: isPdf ? 'application/pdf' : 'text/html',
            url: `${siteUrl}${href}`,
            ...(isPdf ? { contentUrl: `${siteUrl}${href}` } : {}),
            isAccessibleForFree: true,
            publisher: {
              '@type': 'Organization',
              name: 'CasaMia',
              url: siteUrl,
            },
          }
        }),
        {
          '@type': 'FAQPage',
          '@id': `${siteUrl}/blog#faq`,
          mainEntity: copy.faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        },
        {
          '@type': 'HowTo',
          '@id': `${siteUrl}/blog#education-path`,
          name: copy.educationTitle,
          description: copy.educationBody,
          inLanguage: copy.lang,
          step: educationHubSteps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.title[language],
            text: step.body[language],
          })),
        },
        {
          '@type': 'HowTo',
          '@id': `${siteUrl}/blog#family-starter`,
          name: copy.familyStarterTitle,
          description: copy.familyStarterBody,
          inLanguage: copy.lang,
          step: familyStarterPrompts.map((prompt, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: prompt.title[language],
            text: prompt.body[language],
          })),
        },
        {
          '@type': 'HowTo',
          '@id': `${siteUrl}/blog#spain-route`,
          name: copy.localTitle,
          description: copy.localBody,
          inLanguage: copy.lang,
          step: localSpainRoutes.map((route, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: route.title[language],
            text: route.body[language],
          })),
        },
        {
          '@type': 'ItemList',
          '@id': `${siteUrl}/blog#resource-list`,
          name: language === 'es' ? 'Herramientas y guías de seguridad en el hogar' : 'Senior home safety tools and guides',
          numberOfItems:
            toolContent.length
            + educationHubSteps.length
            + resourceJourneys.length
            + topicRoutes.length
            + printableMaterials.length
            + decisionPathways.length
            + localizedDecisionGuides.length
            + localizedArticles.length
            + 1,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: primaryDownload.title,
              url: `${siteUrl}${primaryDownload.href}`,
            },
            ...toolContent.map((tool, index) => ({
              '@type': 'ListItem',
              position: index + 2,
              name: tool.title[language],
              url: `${siteUrl}${tool.to}`,
            })),
            ...educationHubSteps.map((step, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + index + 2,
              name: step.title[language],
              url: `${siteUrl}/blog#education-path`,
            })),
            ...resourceJourneys.map((journey, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + educationHubSteps.length + index + 2,
              name: journey.title[language],
              url: `${siteUrl}${journey.download && language === 'es' ? completeHomeChecklistDownloads.es.href : journey.to}`,
            })),
            ...topicRoutes.map((topic, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + educationHubSteps.length + resourceJourneys.length + index + 2,
              name: topic.title[language],
              url: `${siteUrl}${topic.to}`,
            })),
            ...printableMaterials.map((material, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + educationHubSteps.length + resourceJourneys.length + topicRoutes.length + index + 2,
              name: material.title[language],
              url: `${siteUrl}${material.getHref(language)}`,
            })),
            ...decisionPathways.map((pathway, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + educationHubSteps.length + resourceJourneys.length + topicRoutes.length + printableMaterials.length + index + 2,
              name: pathway.title[language],
              url: `${siteUrl}${pathway.actions[0].to}`,
            })),
            ...localizedDecisionGuides.map((guide, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + educationHubSteps.length + resourceJourneys.length + topicRoutes.length + printableMaterials.length + decisionPathways.length + index + 2,
              name: guide.title,
              url: `${siteUrl}${guide.path}`,
            })),
            ...localizedArticles.map((article, index) => ({
              '@type': 'ListItem',
              position:
                toolContent.length
                + educationHubSteps.length
                + resourceJourneys.length
                + topicRoutes.length
                + printableMaterials.length
                + decisionPathways.length
                + localizedDecisionGuides.length
                + index
                + 2,
              name: article.title,
              url: `${siteUrl}${article.path}`,
            })),
          ],
        },
      ],
    }),
    [copy, language, localizedArticles, localizedDecisionGuides, primaryDownload],
  )

  function trackDownload(downloadLanguage: ResourceDownloadLanguage) {
    trackEvent('resource_download', {
      resource: 'complete_senior_home_conversion_checklist',
      language: downloadLanguage,
      location: 'resources_hub',
    })
  }

  return (
    <>
      <SEO
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/blog"
        schema={resourceHubSchema}
      />

      <main className="resource-hub" lang={copy.lang}>
        <section className="resource-hub-hero" aria-labelledby="resources-page-title">
          <div className="site-shell resource-hub-hero-grid">
            <div className="resource-hub-hero-copy">
              <span className="eyebrow">
                <span className="dot" aria-hidden="true" />
                {copy.heroEyebrow}
              </span>
              <h1 id="resources-page-title">{copy.heroTitle}</h1>
              <p>{copy.heroBody}</p>
              <div className="resource-hub-hero-actions">
                <a
                  className="btn btn-green"
                  href={primaryDownload.href}
                  target="_blank"
                  rel="noopener"
                  onClick={() => trackDownload(primaryDownload.language)}
                >
                  <Download size={19} aria-hidden="true" />
                  {copy.heroPrimary}
                  <ArrowRight size={19} aria-hidden="true" />
                </a>
              </div>
              <div
                className="resource-hub-hero-signals"
                aria-label={language === 'es' ? 'Ventajas de los recursos' : 'Resource benefits'}
              >
                {copy.heroSignals.map((signal) => (
                  <span key={signal}>
                    <ShieldCheck size={16} aria-hidden="true" />
                    {signal}
                  </span>
                ))}
              </div>
            </div>

            <div className="resource-hub-hero-visual" aria-hidden="true">
              <img
                src="/images/solutions/close-up-senior-couple-love.jpg"
                alt=""
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </section>

        <section className="resource-education-section" id="education-path" aria-labelledby="resource-education-title">
          <div className="site-shell">
            <div className="resource-education-panel">
              <div className="resource-education-copy">
                <p className="eyebrow">{copy.educationEyebrow}</p>
                <h2 id="resource-education-title">{copy.educationTitle}</h2>
                <p>{copy.educationBody}</p>
              </div>

              <div className="resource-education-steps" aria-label={language === 'es' ? 'Ruta de aprendizaje CasaMia' : 'CasaMia learning path'}>
                {educationHubSteps.map((step, index) => {
                  const Icon = step.icon

                  return (
                    <article className="resource-education-step" key={step.title.en}>
                      <span className="resource-education-step-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="resource-education-step-icon">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <p>{step.label[language]}</p>
                        <h3>{step.title[language]}</h3>
                        <span>{step.body[language]}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="resource-tools-section" aria-labelledby="resource-tools-title">
          <div className="site-shell">
            <div className="resource-hub-heading">
              <p className="eyebrow">{copy.toolsEyebrow}</p>
              <h2 id="resource-tools-title">{copy.toolsTitle}</h2>
              <p>{copy.toolsBody}</p>
            </div>

            <div className="resource-tool-grid">
              {toolContent.map((tool, index) => {
                const Icon = tool.icon

                return (
                  <Link key={tool.to} className="resource-tool-card" to={tool.to}>
                    <div className="resource-tool-card-topline">
                      <span className="resource-tool-icon">
                        <Icon size={24} aria-hidden="true" />
                      </span>
                      <span className="resource-tool-number">0{index + 1}</span>
                    </div>
                    <h3>{tool.title[language]}</h3>
                    <p>{tool.body[language]}</p>
                    <strong>
                      {copy.openTool}
                      <ArrowRight size={17} aria-hidden="true" />
                    </strong>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resource-journey-section" aria-labelledby="resource-journey-title">
          <div className="site-shell">
            <div className="resource-hub-heading resource-hub-heading-wide">
              <p className="eyebrow">{copy.journeyEyebrow}</p>
              <h2 id="resource-journey-title">{copy.journeyTitle}</h2>
              <p>{copy.journeyBody}</p>
            </div>

            <div className="resource-journey-grid">
              {resourceJourneys.map((journey) => {
                const Icon = journey.icon
                const href = journey.download && language === 'es'
                  ? completeHomeChecklistDownloads.es.href
                  : journey.to

                return (
                  <a
                    className="resource-journey-card"
                    href={href}
                    key={journey.title.en}
                    target={journey.download ? '_blank' : undefined}
                    rel={journey.download ? 'noopener' : undefined}
                    onClick={journey.download ? () => trackDownload(language) : undefined}
                  >
                    <span className="resource-journey-icon">
                      <Icon size={25} aria-hidden="true" />
                    </span>
                    <h3>{journey.title[language]}</h3>
                    <p>{journey.body[language]}</p>
                    <ol>
                      {journey.steps[language].map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <strong>
                      {journey.cta[language]}
                      <ArrowRight size={17} aria-hidden="true" />
                    </strong>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resource-topics-section" aria-labelledby="resource-topics-title">
          <div className="site-shell">
            <div className="resource-hub-heading resource-hub-heading-wide">
              <p className="eyebrow">{copy.topicsEyebrow}</p>
              <h2 id="resource-topics-title">{copy.topicsTitle}</h2>
              <p>{copy.topicsBody}</p>
            </div>

            <div className="resource-topic-grid">
              {topicRoutes.map((topic) => {
                const Icon = topic.icon

                return (
                  <Link className="resource-topic-card" key={topic.to} to={topic.to}>
                    <span className="resource-topic-icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="resource-topic-pill">{topic.pill[language]}</span>
                    <h3>{topic.title[language]}</h3>
                    <p>{topic.body[language]}</p>
                    <strong>
                      {language === 'es' ? 'Ver tema' : 'Explore topic'}
                      <ArrowRight size={17} aria-hidden="true" />
                    </strong>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resource-family-starter-section" aria-labelledby="resource-family-starter-title">
          <div className="site-shell">
            <div className="resource-family-starter-panel">
              <div className="resource-family-starter-copy">
                <p className="eyebrow">{copy.familyStarterEyebrow}</p>
                <h2 id="resource-family-starter-title">{copy.familyStarterTitle}</h2>
                <p>{copy.familyStarterBody}</p>
                <Link className="btn btn-green" to="/tools/senior-friendly-home-check">
                  {copy.familyStarterCta}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>

              <div className="resource-family-prompt-grid">
                {familyStarterPrompts.map((prompt, index) => {
                  const Icon = prompt.icon

                  return (
                    <article className="resource-family-prompt-card" key={prompt.title.en}>
                      <span className="resource-family-prompt-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="resource-family-prompt-icon">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <h3>{prompt.title[language]}</h3>
                      <p>{prompt.body[language]}</p>
                    </article>
                  )
                })}
              </div>

              <aside className="resource-family-decision-card" aria-label={copy.familyStarterFinalTitle}>
                <ShieldCheck size={28} aria-hidden="true" />
                <h3>{copy.familyStarterFinalTitle}</h3>
                <p>{copy.familyStarterFinalBody}</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="resource-pathways-section" aria-labelledby="resource-pathways-title">
          <div className="site-shell">
            <div className="resource-hub-heading">
              <p className="eyebrow">{copy.pathwaysEyebrow}</p>
              <h2 id="resource-pathways-title">{copy.pathwaysTitle}</h2>
              <p>{copy.pathwaysBody}</p>
            </div>

            <div className="resource-pathway-grid">
              {decisionPathways.map((pathway) => {
                const Icon = pathway.icon

                return (
                  <article className="resource-pathway-card" key={pathway.title.en}>
                    <img src={pathway.image} alt="" loading="lazy" decoding="async" />
                    <div className="resource-pathway-card-content">
                      <span className="resource-pathway-icon">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <h3>{pathway.title[language]}</h3>
                      <p>{pathway.body[language]}</p>
                      <div>
                        {pathway.actions.map((action, index) => (
                          <Link className={index === 0 ? 'btn btn-green' : 'resource-inline-link'} key={action.to} to={action.to}>
                            {action.label[language]}
                            <ArrowRight size={17} aria-hidden="true" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resource-comparison-section" aria-labelledby="resource-comparison-title">
          <div className="site-shell">
            <div className="resource-hub-heading resource-hub-heading-wide">
              <p className="eyebrow">{copy.comparisonEyebrow}</p>
              <h2 id="resource-comparison-title">{copy.comparisonTitle}</h2>
              <p>{copy.comparisonBody}</p>
            </div>

            <div className="resource-comparison-grid">
              {localizedDecisionGuides.map((guide) => (
                <Link className="resource-comparison-card" key={guide.slug} to={guide.path}>
                  <span>{guide.eyebrow}</span>
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                  <strong>
                    {language === 'es' ? 'Comparar opciones' : 'Compare options'}
                    <ArrowRight size={17} aria-hidden="true" />
                  </strong>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="resource-downloads-section" aria-labelledby="resource-downloads-title">
          <div className="site-shell">
            <div className="resource-hub-heading resource-hub-heading-wide">
              <p className="eyebrow">{copy.downloadsEyebrow}</p>
              <h2 id="resource-downloads-title">{copy.downloadsTitle}</h2>
              <p>{copy.downloadsBody}</p>
            </div>

            <div className="resource-material-grid">
              {printableMaterials.map((material) => {
                const Icon = material.icon
                const href = material.getHref(language)
                const downloadLanguage = material.downloadLanguage?.(language)
                const isPdf = href.endsWith('.pdf')

                return (
                  <a
                    className="resource-material-card"
                    href={href}
                    key={material.title.en}
                    target={isPdf ? '_blank' : undefined}
                    rel={isPdf ? 'noopener' : undefined}
                    onClick={downloadLanguage ? () => trackDownload(downloadLanguage) : undefined}
                  >
                    <span className="resource-material-icon">
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <span className="resource-material-kind">{material.kind[language]}</span>
                    <h3>{material.title[language]}</h3>
                    <p>{material.body[language]}</p>
                    <strong>
                      {copy.downloadAction}
                      <ArrowRight size={17} aria-hidden="true" />
                    </strong>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resource-quick-section" aria-labelledby="resource-quick-title">
          <div className="site-shell resource-quick-panel">
            <div className="resource-quick-copy">
              <p className="eyebrow">{copy.todayEyebrow}</p>
              <h2 id="resource-quick-title">{copy.todayTitle}</h2>
              <p>{copy.todayBody}</p>
            </div>

            <ol className="resource-quick-list">
              {quickChecks.map((item, index) => {
                const Icon = item.icon

                return (
                  <li key={item.title.en}>
                    <span className="resource-quick-index">{index + 1}</span>
                    <span className="resource-quick-icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{item.title[language]}</h3>
                      <p>{item.body[language]}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        <section className="resource-local-section" aria-labelledby="resource-local-title">
          <div className="site-shell resource-local-panel">
            <div className="resource-hub-heading resource-hub-heading-wide">
              <p className="eyebrow">{copy.localEyebrow}</p>
              <h2 id="resource-local-title">{copy.localTitle}</h2>
              <p>{copy.localBody}</p>
            </div>

            <div className="resource-local-grid">
              {localSpainRoutes.map((route, index) => {
                const Icon = route.icon

                return (
                  <article className="resource-local-card" key={route.title.en}>
                    <span className="resource-local-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="resource-local-icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <h3>{route.title[language]}</h3>
                    <p>{route.body[language]}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resource-moments-section" aria-labelledby="resource-moments-title">
          <div className="site-shell resource-moments-grid">
            <div className="resource-hub-heading">
              <p className="eyebrow">{copy.momentsEyebrow}</p>
              <h2 id="resource-moments-title">{copy.momentsTitle}</h2>
              <p>{copy.momentsBody}</p>
            </div>

            <div className="resource-moment-list">
              {familyMoments.map((moment) => {
                const Icon = moment.icon

                return (
                  <Link className="resource-moment-row" key={moment.title.en} to={moment.to}>
                    <span>
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{moment.title[language]}</strong>
                      <small>{moment.body[language]}</small>
                    </span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="resource-guides-section" aria-labelledby="resource-guides-title">
          <div className="site-shell">
            <div className="resource-hub-heading resource-hub-heading-wide">
              <p className="eyebrow">{copy.guideEyebrow}</p>
              <h2 id="resource-guides-title">{copy.guideTitle}</h2>
              <p>{copy.guideBody}</p>
              {copy.guideLanguage ? <small>{copy.guideLanguage}</small> : null}
            </div>

            <div className="resource-guide-search" role="search">
              <label htmlFor="resource-guide-search">{copy.searchLabel}</label>
              <div className="resource-guide-search-control">
                <SearchCheck size={21} aria-hidden="true" />
                <input
                  id="resource-guide-search"
                  type="search"
                  value={resourceSearchQuery}
                  placeholder={copy.searchPlaceholder}
                  onChange={(event) => updateResourceSearch(event.target.value)}
                />
                {resourceSearchQuery ? (
                  <button type="button" onClick={() => updateResourceSearch('')}>
                    {copy.searchClear}
                  </button>
                ) : null}
              </div>
              {resourceSearchQuery ? (
                <p>
                  {copy.searchResults} <strong>“{resourceSearchQuery}”</strong> · {filteredGuideCount}
                </p>
              ) : null}
            </div>

            <div className="resource-guide-groups">
              {filteredGuideGroups.map((group) => {
                const Icon = group.icon

                return (
                  <article className="resource-guide-group" key={group.title.en}>
                    <div className="resource-guide-group-heading">
                      <span>
                        <Icon size={23} aria-hidden="true" />
                      </span>
                      <h3>{group.title[language]}</h3>
                    </div>
                    <ul>
                      {group.articles.map((article) => (
                        <li key={article.id}>
                          <Link to={article.path}>
                            <span>
                              <strong>{article.title}</strong>
                              <small>{article.readTime}</small>
                            </span>
                            <ArrowRight size={17} aria-label={copy.readGuide} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>

            {filteredGuideGroups.length === 0 ? (
              <div className="resource-guide-empty">
                <SearchCheck size={28} aria-hidden="true" />
                <p>{copy.searchEmpty}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="resource-action-route-section" aria-labelledby="resource-action-route-title">
          <div className="site-shell resource-action-route-panel">
            <div className="resource-action-route-copy">
              <p className="eyebrow">{copy.actionRouteEyebrow}</p>
              <h2 id="resource-action-route-title">{copy.actionRouteTitle}</h2>
              <p>{copy.actionRouteBody}</p>
              <Link className="btn btn-green" to="/tools/senior-friendly-home-check">
                {copy.actionRouteCta}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <ol className="resource-action-route-steps">
              {actionRouteSteps.map((step, index) => {
                const Icon = step.icon

                return (
                  <li key={step.title.en}>
                    <span className="resource-action-route-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="resource-action-route-icon">
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{step.title[language]}</h3>
                      <p>{step.body[language]}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        <section className="resource-faq-section" aria-labelledby="resource-faq-title">
          <div className="site-shell resource-faq-layout">
            <div className="resource-hub-heading">
              <p className="eyebrow">{copy.faqEyebrow}</p>
              <h2 id="resource-faq-title">{copy.faqTitle}</h2>
            </div>

            <div className="resource-faq-list">
              {copy.faqItems.map((item) => (
                <details key={item.question}>
                  <summary>
                    {item.question}
                    <ArrowRight size={18} aria-hidden="true" />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="resource-final-section">
          <div className="site-shell resource-final-panel">
            <div>
              <p className="eyebrow">{copy.finalEyebrow}</p>
              <h2>{copy.finalTitle}</h2>
              <p>{copy.finalBody}</p>
            </div>
            <Link className="btn btn-green" to="/home-safety-assessment">
              {copy.finalCta}
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
