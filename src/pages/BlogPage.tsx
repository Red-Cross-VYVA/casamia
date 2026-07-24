import {
  ArrowRight,
  Bath,
  Camera,
  Calculator,
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
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { blogArticles } from '../constants/blogContent'
import { localizeBlogArticles } from '../constants/blogContentLocalization'
import { decisionGuidePages } from '../constants/needLandingPages'
import {
  completeHomeChecklistDownloads,
  type ResourceDownloadLanguage,
} from '../constants/resourceDownloads'
import { trackEvent } from '../utils/analytics'
import '../styles/resources-hub.css'

const siteUrl = 'https://casamia.com.es'

const pageCopy = {
  en: {
    lang: 'en',
    seoTitle: 'Senior Home Safety Checklist & Practical Resources | CasaMia',
    seoDescription:
      'Download CasaMia\'s free room-by-room senior home conversion checklist for Spain and use practical tools for home safety, grant readiness and family planning.',
    heroEyebrow: 'Practical resources for real homes',
    heroTitle: 'Make the home safer, one room at a time.',
    heroBody:
      'Start with a complete printable checklist, then use the right online tool or focused guide for the decision in front of you.',
    heroPrimary: 'Get the free checklist',
    heroSecondary: 'Use the online self-check',
    heroSignals: ['No sign-up needed', 'English and Spanish', 'Clear next step in minutes'],
    downloadEyebrow: 'Free printable workbook',
    downloadTitle: 'The Complete Senior Home Conversion Checklist',
    downloadBody:
      'Walk through the home with the person who lives there, identify quick wins, flag work that needs professional review and finish with a clear family action plan.',
    downloadStats: [
      { value: '10', label: 'home areas' },
      { value: '100+', label: 'practical checks' },
      { value: '1', label: 'action plan' },
    ],
    downloadBenefits: [
      'Entrances, stairs, living areas, bedroom, bathroom and kitchen',
      'Lighting, emergency planning, connected safety and outdoor areas',
      'Priority guide, quotation prompts and a handover recheck',
    ],
    downloadPrimary: 'Download the English PDF',
    downloadSecondary: 'Descargar en español',
    downloadNote: 'Print-friendly PDF. No email or sign-up required.',
    coverLabel: 'CASAMIA PRACTICAL GUIDE',
    coverFooter: 'Room by room. Priority by priority.',
    previewRooms: ['Entrance', 'Bathroom', 'Bedroom', 'Kitchen'],
    toolsEyebrow: 'Choose one useful next step',
    toolsTitle: 'Start with the task you need today.',
    toolsBody:
      'Each tool has one clear job. Use it online, save your observations and bring the result into a family discussion or professional assessment.',
    openTool: 'Open tool',
    journeyEyebrow: 'Not sure where to begin?',
    journeyTitle: 'Choose the situation that sounds closest.',
    journeyBody:
      'A safer home usually starts with one pressure point: a recent change, a worrying room, or a family decision that needs structure.',
    topicsEyebrow: 'Explore by safety topic',
    topicsTitle: 'Go straight to the area you are trying to understand.',
    topicsBody:
      'These topic pages bring together the practical guidance, tools and CasaMia routes around one family question.',
    pathwaysEyebrow: 'Choose the closest situation',
    pathwaysTitle: 'Practical help by decision, not by article title.',
    pathwaysBody:
      'Families usually arrive with one urgent question. Start there, then move into the guide, checklist or tool that helps you make the next decision calmly.',
    pathwayCta: 'Start here',
    familyStarterEyebrow: '10-minute family starter',
    familyStarterTitle: 'Before choosing a solution, agree what problem you are solving.',
    familyStarterBody:
      'Use these prompts with a parent, partner, sibling or carer. The aim is not to diagnose the home in one sitting — it is to turn scattered worries into one calm next step.',
    familyStarterFinalTitle: 'Leave with one useful decision',
    familyStarterFinalBody:
      'Choose the room, route or routine that creates the most worry this week. Then use the checklist, online review or a CasaMia assessment to make it practical.',
    familyStarterCta: 'Start the guided review',
    comparisonEyebrow: 'Decision guides',
    comparisonTitle: 'Compare the routes before you commit.',
    comparisonBody:
      'Short, practical guides for the moments when the family is choosing between two very different next steps.',
    downloadsEyebrow: 'Printable materials',
    downloadsTitle: 'Useful documents to share around the table.',
    downloadsBody:
      'Download simple, family-friendly materials you can print, annotate, send to relatives or take into a professional visit.',
    downloadAction: 'Download',
    momentsEyebrow: 'When families usually need help',
    momentsTitle: 'Resources for the moments that create pressure.',
    momentsBody:
      'Use these as quick routes into CasaMia advice when something has changed at home, in hospital, or in the family conversation.',
    todayEyebrow: 'A useful first 20 minutes',
    todayTitle: 'Three checks worth doing today.',
    todayBody:
      'These are simple observations, not building work. If anything feels unstable or unsafe, stop using it and arrange an appropriate review.',
    guideEyebrow: 'Practical guidance by situation',
    guideTitle: 'Find the answer without scrolling through a wall of articles.',
    guideBody:
      'Guides are grouped around the decision a family is trying to make. Choose the closest situation and go straight to the relevant advice.',
    guideLanguage: 'Guides are currently available in English.',
    readGuide: 'Read guide',
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
          'Yes. The checklist, guides and tools are designed to help families prepare calmly before deciding whether they need professional help.',
      },
      {
        question: 'When should we arrange a home visit?',
        answer:
          'A visit is useful when measurements, installation details, mobility needs or several rooms need to be reviewed before a final proposal.',
      },
      {
        question: 'Can CasaMia help with grants and paperwork?',
        answer:
          'CasaMia can help organise the route, documents, quotation information and next steps. Public authorities make the final grant decision.',
      },
    ],
    finalEyebrow: 'Need a plan for a real home?',
    finalTitle: 'Turn the checklist into a prioritised conversion plan.',
    finalBody:
      'CasaMia can review the home, separate urgent changes from future improvements and explain the practical next steps.',
    finalCta: 'Request a home assessment',
  },
  es: {
    lang: 'es',
    seoTitle: 'Lista de seguridad y recursos para adaptar viviendas | CasaMia',
    seoDescription:
      'Descarga gratis la lista de CasaMia para adaptar una vivienda estancia por estancia y utiliza herramientas prácticas de seguridad, ayudas y planificación familiar.',
    heroEyebrow: 'Recursos prácticos para hogares reales',
    heroTitle: 'Haz el hogar más seguro, estancia por estancia.',
    heroBody:
      'Empieza con una lista completa para imprimir y utiliza después la herramienta o guía adecuada para la decisión que tienes delante.',
    heroPrimary: 'Descargar la lista gratuita',
    heroSecondary: 'Usar la revisión online',
    heroSignals: ['Sin registro', 'Español e inglés', 'Siguiente paso en minutos'],
    downloadEyebrow: 'Cuaderno gratuito para imprimir',
    downloadTitle: 'Lista completa para adaptar la vivienda de una persona mayor',
    downloadBody:
      'Recorre la vivienda con la persona que vive en ella, identifica mejoras rápidas, señala los trabajos que necesitan revisión profesional y termina con un plan de acción familiar.',
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
    coverLabel: 'GUÍA PRÁCTICA CASAMIA',
    coverFooter: 'Estancia por estancia. Prioridad por prioridad.',
    previewRooms: ['Entrada', 'Baño', 'Dormitorio', 'Cocina'],
    toolsEyebrow: 'Elige un siguiente paso útil',
    toolsTitle: 'Empieza por lo que necesitas hoy.',
    toolsBody:
      'Cada herramienta tiene una función clara. Úsala online, guarda tus observaciones y llévalas a la conversación familiar o a una evaluación profesional.',
    openTool: 'Abrir herramienta',
    journeyEyebrow: '¿No sabes por dónde empezar?',
    journeyTitle: 'Elige la situación que más se parece.',
    journeyBody:
      'Un hogar más seguro suele empezar por un punto de presión: un cambio reciente, una estancia que preocupa o una decisión familiar que necesita orden.',
    topicsEyebrow: 'Explora por tema de seguridad',
    topicsTitle: 'Ve directamente al área que quieres entender.',
    topicsBody:
      'Estas páginas reúnen guías, herramientas y rutas CasaMia alrededor de una pregunta familiar concreta.',
    pathwaysEyebrow: 'Elige la situación más cercana',
    pathwaysTitle: 'Ayuda práctica por decisión, no por título de artículo.',
    pathwaysBody:
      'Las familias suelen llegar con una pregunta urgente. Empieza ahí y pasa después a la guía, lista o herramienta que ayuda a decidir con calma el siguiente paso.',
    pathwayCta: 'Empezar aquí',
    familyStarterEyebrow: 'Primeros 10 minutos en familia',
    familyStarterTitle: 'Antes de elegir una solución, acordad qué problema queréis resolver.',
    familyStarterBody:
      'Usa estas preguntas con madre, padre, pareja, hermanos o cuidador. No se trata de diagnosticar la vivienda en una conversación, sino de convertir preocupaciones sueltas en un siguiente paso claro.',
    familyStarterFinalTitle: 'Terminad con una decisión útil',
    familyStarterFinalBody:
      'Elegid la estancia, ruta o rutina que más preocupa esta semana. Después usad la lista, la revisión online o una evaluación CasaMia para hacerlo práctico.',
    familyStarterCta: 'Empezar revisión guiada',
    comparisonEyebrow: 'Guías de decisión',
    comparisonTitle: 'Compara las opciones antes de decidir.',
    comparisonBody:
      'Guías breves y prácticas para cuando la familia tiene que elegir entre dos caminos distintos.',
    downloadsEyebrow: 'Materiales para imprimir',
    downloadsTitle: 'Documentos útiles para compartir en familia.',
    downloadsBody:
      'Descarga materiales sencillos para imprimir, anotar, enviar a familiares o llevar a una visita profesional.',
    downloadAction: 'Descargar',
    momentsEyebrow: 'Cuándo suele hacer falta ayuda',
    momentsTitle: 'Recursos para los momentos que generan presión.',
    momentsBody:
      'Usa estas rutas rápidas cuando algo ha cambiado en casa, en el hospital o en la conversación familiar.',
    todayEyebrow: 'Unos primeros 20 minutos útiles',
    todayTitle: 'Tres comprobaciones que merece la pena hacer hoy.',
    todayBody:
      'Son observaciones sencillas, no trabajos de obra. Si algo está inestable o parece peligroso, deja de usarlo y solicita una revisión adecuada.',
    guideEyebrow: 'Guías prácticas por situación',
    guideTitle: 'Encuentra la respuesta sin recorrer una pared de artículos.',
    guideBody:
      'Las guías están agrupadas según la decisión que una familia intenta tomar. Elige la situación más cercana y ve directamente al consejo relevante.',
    guideLanguage: '',
    readGuide: 'Leer guía',
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
          'Sí. La lista, las guías y las herramientas ayudan a preparar la conversación familiar antes de decidir si hace falta apoyo profesional.',
      },
      {
        question: '¿Cuándo conviene pedir una visita a domicilio?',
        answer:
          'Una visita ayuda cuando hacen falta medidas, detalles de instalación, revisión de movilidad o una propuesta final que afecte a varias estancias.',
      },
      {
        question: '¿CasaMia puede ayudar con ayudas y documentación?',
        answer:
          'CasaMia puede ayudar a ordenar el proceso, documentos, información del presupuesto y próximos pasos. La autoridad pública decide la aprobación final.',
      },
    ],
    finalEyebrow: '¿Necesitas un plan para una vivienda real?',
    finalTitle: 'Convierte la lista en un plan de adaptación con prioridades.',
    finalBody:
      'CasaMia puede revisar la vivienda, separar los cambios urgentes de las mejoras futuras y explicar los siguientes pasos prácticos.',
    finalCta: 'Solicitar una evaluación',
  },
} as const

const toolContent = [
  {
    icon: HelpCircle,
    title: { en: 'Is my parent safe at home?', es: '¿Está seguro en casa?' },
    body: {
      en: 'Answer five everyday questions and get a clear next step: checklist, guided review or focused CasaMia assessment.',
      es: 'Responde cinco preguntas cotidianas y obtén un siguiente paso claro: lista, revisión guiada o evaluación CasaMia.',
    },
    to: '/tools/is-my-parent-safe-at-home',
  },
  {
    icon: ClipboardCheck,
    title: { en: '15-minute room-by-room check', es: 'Revisión online por estancias' },
    body: {
      en: 'Answer guided questions across seven areas and leave with a practical list of items to review.',
      es: 'Responde preguntas guiadas en siete zonas y obtén una lista práctica de puntos que revisar.',
    },
    to: '/home-safety-assessment#self-inspection-tool',
  },
  {
    icon: Camera,
    title: { en: 'Photo safety review', es: 'Revisión de seguridad con fotos' },
    body: {
      en: 'Organise room photos and context so the biggest concerns are easier to discuss and prioritise.',
      es: 'Organiza fotos y contexto para comentar y priorizar con más facilidad las principales preocupaciones.',
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
  {
    icon: Calculator,
    title: { en: 'Home vs residence cost planner', es: 'Casa o residencia: comparador de coste' },
    body: {
      en: 'Compare adapting the home with a residence route so the family can discuss cost, comfort and timing clearly.',
      es: 'Compara adaptar la vivienda con una residencia para hablar con claridad de coste, comodidad y plazos.',
    },
    to: '/tools/home-vs-residence-cost-calculator',
  },
] as const

const resourceJourneys = [
  {
    icon: Stethoscope,
    title: { en: 'Something changed recently', es: 'Algo ha cambiado hace poco' },
    body: {
      en: 'A fall, hospital stay, new diagnosis or reduced confidence can make the home feel different overnight.',
      es: 'Una caída, ingreso, diagnóstico o pérdida de confianza puede cambiar la vivienda de un día para otro.',
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
      en: 'Bathrooms, stairs, bedrooms and entrances often become the first place where small changes restore confidence.',
      es: 'Baños, escaleras, dormitorios y entradas suelen ser el primer lugar donde pequeños cambios devuelven confianza.',
    },
    steps: {
      en: ['Pick the room', 'Read the focused guide', 'Compare practical options'],
      es: ['Elige la estancia', 'Lee la guía específica', 'Compara opciones prácticas'],
    },
    to: '/safe-bathroom-access',
    cta: { en: 'See a room guide', es: 'Ver guía por estancia' },
    download: false,
  },
  {
    icon: HandHeart,
    title: { en: 'The family needs a plan', es: 'La familia necesita un plan' },
    body: {
      en: 'When relatives disagree, a shared checklist and priorities make the conversation calmer and more useful.',
      es: 'Cuando la familia no se pone de acuerdo, una lista compartida y prioridades claras ordenan la conversación.',
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
    to: '/bathroom-safety-for-seniors',
    title: { en: 'Bathroom safety', es: 'Seguridad en el baño' },
    body: {
      en: 'Focus on bathing, toilet transfers, lighting, water controls and safer access.',
      es: 'Céntrate en ducha, inodoro, iluminación, controles de agua y acceso más seguro.',
    },
    pill: { en: 'Highest-risk room', es: 'Estancia crítica' },
  },
  {
    icon: MoonStar,
    to: '/senior-bedroom-safety',
    title: { en: 'Bedroom and night routes', es: 'Dormitorio y ruta nocturna' },
    body: {
      en: 'Make bed transfers, night lighting and the route to the bathroom easier to manage.',
      es: 'Mejora transferencias de cama, luz nocturna y la ruta hacia el baño.',
    },
    pill: { en: 'Night confidence', es: 'Confianza nocturna' },
  },
  {
    icon: Home,
    to: '/aging-in-place-home-assessment',
    title: { en: 'Home assessment', es: 'Evaluación del hogar' },
    body: {
      en: 'See when a guided review helps turn scattered worries into a clear action plan.',
      es: 'Comprueba cuándo una revisión guiada convierte preocupaciones sueltas en un plan claro.',
    },
    pill: { en: 'Professional route', es: 'Ruta profesional' },
  },
  {
    icon: FileCheck2,
    to: '/grants-for-home-adaptations-spain',
    title: { en: 'Grants and paperwork', es: 'Ayudas y documentación' },
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
      en: 'Learn how practical changes can preserve comfort, independence and dignity.',
      es: 'Aprende cómo los cambios prácticos preservan comodidad, autonomía y dignidad.',
    },
    pill: { en: 'Turnkey support', es: 'Servicio integral' },
  },
] as const

const decisionPathways = [
  {
    icon: ShieldCheck,
    image: '/images/solutions/bathroom-risk-map.png',
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
    image: '/images/solutions/casamia-staff-kitchen-consultation.webp',
    title: { en: 'I want to understand grants or funding', es: 'Quiero entender ayudas o financiación' },
    body: {
      en: 'Prepare the documents, eligibility questions and next steps before relying on any programme.',
      es: 'Prepara documentos, requisitos y próximos pasos antes de contar con una ayuda.',
    },
    actions: [
      { label: { en: 'Grant check', es: 'Revisar ayudas' }, to: '/grant-check' },
      { label: { en: 'Grant guide', es: 'Guía de ayudas' }, to: '/blog/home-adaptation-grants-spain-family-guide' },
    ],
  },
  {
    icon: Home,
    image: '/images/blog/provider-choice.webp',
    title: { en: 'We are unsure if home is still the right route', es: 'No sabemos si casa sigue siendo la mejor opción' },
    body: {
      en: 'Compare what home adaptations can solve with the point where more support or a residence route should be considered.',
      es: 'Compara lo que puede resolver una adaptación con el momento en que conviene valorar más apoyo o una residencia.',
    },
    actions: [
      { label: { en: 'Read decision guide', es: 'Leer guía de decisión' }, to: '/blog/when-home-adaptations-are-not-enough' },
      { label: { en: 'Compare costs', es: 'Comparar costes' }, to: '/tools/home-vs-residence-cost-calculator' },
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
    title: { en: 'What must stay easy or familiar?', es: '¿Qué debe seguir siendo cómodo o familiar?' },
    body: {
      en: 'Preserve dignity, routines, favourite spaces and the look of the home wherever safety allows.',
      es: 'Preservar dignidad, rutinas, espacios favoritos y el aspecto del hogar siempre que la seguridad lo permita.',
    },
  },
  {
    icon: ClipboardCheck,
    title: { en: 'What decision is needed this week?', es: '¿Qué decisión hace falta esta semana?' },
    body: {
      en: 'Choose one next step: clear a route, download the checklist, send photos, request a visit or compare home with residence.',
      es: 'Elegid un paso: despejar una ruta, descargar la lista, enviar fotos, pedir una visita o comparar casa y residencia.',
    },
  },
] as const

const printableMaterials = [
  {
    icon: ClipboardCheck,
    title: { en: 'Complete home conversion checklist', es: 'Lista completa de adaptación del hogar' },
    body: {
      en: 'Room-by-room workbook with priorities, notes and family action planning.',
      es: 'Cuaderno estancia por estancia con prioridades, notas y plan familiar.',
    },
    kind: { en: 'PDF workbook', es: 'Cuaderno PDF' },
    getHref: (language: ResourceDownloadLanguage) => completeHomeChecklistDownloads[language].href,
    downloadLanguage: (language: ResourceDownloadLanguage) => language,
  },
  {
    icon: MoonStar,
    title: { en: 'Night route mini-check', es: 'Mini revisión de la ruta nocturna' },
    body: {
      en: 'A quick printable prompt for bed-to-bathroom movement, lighting and support points.',
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
    title: { en: 'When family disagrees on what to fix', es: 'Cuando la familia no se pone de acuerdo' },
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
    title: { en: 'Support routines and independence', es: 'Apoyar rutinas y autonomía' },
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

export function BlogPage() {
  const { i18n } = useTranslation()
  const language: ResourceDownloadLanguage = i18n.language.startsWith('es') ? 'es' : 'en'
  const copy = pageCopy[language]
  const primaryDownload = completeHomeChecklistDownloads[language]
  const localizedArticles = useMemo(() => localizeBlogArticles(blogArticles, language), [language])

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
        {
          '@type': 'DigitalDocument',
          '@id': `${siteUrl}${primaryDownload.href}#document`,
          name: primaryDownload.title,
          description: copy.downloadBody,
          inLanguage: primaryDownload.language,
          encodingFormat: 'application/pdf',
          contentUrl: `${siteUrl}${primaryDownload.href}`,
          isAccessibleForFree: true,
          publisher: {
            '@type': 'Organization',
            name: 'CasaMia',
            url: siteUrl,
          },
        },
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
          '@type': 'ItemList',
          '@id': `${siteUrl}/blog#resource-list`,
          name: language === 'es' ? 'Herramientas y guías de seguridad en el hogar' : 'Senior home safety tools and guides',
          numberOfItems:
            toolContent.length
            + resourceJourneys.length
            + topicRoutes.length
            + printableMaterials.length
            + decisionPathways.length
            + decisionGuidePages.length
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
            ...resourceJourneys.map((journey, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + index + 2,
              name: journey.title[language],
              url: `${siteUrl}${journey.download && language === 'es' ? completeHomeChecklistDownloads.es.href : journey.to}`,
            })),
            ...topicRoutes.map((topic, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + resourceJourneys.length + index + 2,
              name: topic.title[language],
              url: `${siteUrl}${topic.to}`,
            })),
            ...printableMaterials.map((material, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + resourceJourneys.length + topicRoutes.length + index + 2,
              name: material.title[language],
              url: `${siteUrl}${material.getHref(language)}`,
            })),
            ...decisionPathways.map((pathway, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + resourceJourneys.length + topicRoutes.length + printableMaterials.length + index + 2,
              name: pathway.title[language],
              url: `${siteUrl}${pathway.actions[0].to}`,
            })),
            ...decisionGuidePages.map((guide, index) => ({
              '@type': 'ListItem',
              position: toolContent.length + resourceJourneys.length + topicRoutes.length + printableMaterials.length + decisionPathways.length + index + 2,
              name: guide.title,
              url: `${siteUrl}${guide.path}`,
            })),
            ...localizedArticles.map((article, index) => ({
              '@type': 'ListItem',
              position:
                toolContent.length
                + resourceJourneys.length
                + topicRoutes.length
                + printableMaterials.length
                + decisionPathways.length
                + decisionGuidePages.length
                + index
                + 2,
              name: article.title,
              url: `${siteUrl}${article.path}`,
            })),
          ],
        },
      ],
    }),
    [copy, language, localizedArticles, primaryDownload],
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
                src="/images/solutions/front-view-adorable-couple-kitchen.jpg"
                alt=""
                loading="eager"
                decoding="async"
              />
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
                <Link className="btn btn-green" to="/home-safety-assessment#self-inspection-tool">
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
              {decisionGuidePages.map((guide) => (
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

            <div className="resource-guide-groups">
              {guideGroups.map((group) => {
                const Icon = group.icon
                const articles = group.articleIds
                  .map((articleId) => localizedArticles.find((article) => article.id === articleId))
                  .filter((article): article is (typeof localizedArticles)[number] => Boolean(article))

                return (
                  <article className="resource-guide-group" key={group.title.en}>
                    <div className="resource-guide-group-heading">
                      <span>
                        <Icon size={23} aria-hidden="true" />
                      </span>
                      <h3>{group.title[language]}</h3>
                    </div>
                    <ul>
                      {articles.map((article) => (
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
