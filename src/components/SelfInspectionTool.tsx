import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Mail,
  MessageCircle,
  Upload,
  UserRound,
  X,
} from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { submitAssessmentRequest } from '../services/assessmentRequests'
import { PhoneNumberField } from './PhoneNumberField'

type AnswerStatus = 'safe' | 'risk' | 'not-sure'

type InspectionQuestion = {
  id: string
  area: string
  prompt: string
  recommendation: string
}

type InspectionRoom = {
  id: string
  title: string
  intro: string
  questions: InspectionQuestion[]
}

type RoomPhoto = {
  id: string
  name: string
  url: string
}

type SelfInspectionReport = {
  answers: Record<string, AnswerStatus>
  completedAt: string
  contact: ContactDetails
  notes: Record<string, string>
  photoSummary: Record<string, string[]>
  recommendations: Array<{
    room: string
    question: string
    recommendation: string
    status: AnswerStatus
  }>
  resident: ResidentProfile
}

type ContactDetails = {
  name: string
  email: string
  phone: string
  consent: boolean
}

type ResidentProfile = {
  residentName: string
  ageRange: string
  livesWith: string
  propertyType: string
  bedrooms: string
  bathrooms: string
  floorCount: string
  entranceType: string
  entranceSpace: string
  mobilityLevel: string
  mobilityAids: string[]
  transferNeeds: string[]
  recentFalls: string
  visionHearing: string[]
  cognitiveConcerns: string
  dailyPriorities: string[]
  mainConcern: string
}

const storageKey = 'casamia-self-inspection-reports'

const mobilityAidOptions = ['None', 'Walking stick', 'Walker / rollator', 'Wheelchair', 'Grabber / reacher', 'Other']
const transferNeedOptions = ['Bed', 'Toilet', 'Shower / bath', 'Chair / sofa', 'Car / entrance', 'Stairs']
const visionHearingOptions = ['Low vision', 'Glare sensitivity', 'Hearing difficulty', 'Uses hearing aid', 'Dizziness', 'None']
const dailyPriorityOptions = [
  'Getting to bathroom at night',
  'Showering safely',
  'Using stairs',
  'Cooking independently',
  'Entering the home',
  'Emergency response',
]

const photoHelpfulQuestionIds = new Set([
  'bathroom-shower-entry',
  'bathroom-floor',
  'bathroom-toilet',
  'bathroom-lighting',
  'bathroom-reach',
  'stairs-handrails',
  'stairs-contrast',
  'stairs-surface',
  'stairs-rest',
  'bedroom-bed-height',
  'bedroom-route',
  'bedroom-reach',
  'bedroom-space',
  'kitchen-storage',
  'kitchen-lighting',
  'kitchen-floor',
  'kitchen-seated',
  'kitchen-hot-items',
  'entrance-threshold',
  'entrance-lighting',
  'entrance-keys',
  'entrance-width',
  'entrance-seating',
  'outdoor-path',
  'outdoor-steps',
  'outdoor-weather',
  'outdoor-parking',
  'outdoor-maintenance',
  'living-routes',
  'living-seating',
  'living-rugs',
  'living-controls',
])

const selfInspectionCopy = {
  en: {
    addPhotos: 'Add photos',
    addPhotosHelp: 'Add one if it helps explain a risk or recommendation.',
    addQuestionPhoto: 'Add photo',
    addMobilityDetails: 'More about daily support',
    ageRange: 'Age',
    ageRangePlaceholder: 'Age band',
    answerAnswered: 'answered',
    answerNeedsAttention: 'Needs attention',
    answerNotSure: 'Not sure',
    answerSafe: 'Safe',
    attachedPhotos: (count: number) => `${count} photo${count === 1 ? '' : 's'} attached`,
    consent: 'I agree CasaMia can use this survey to prepare a safety report and contact me.',
    close: 'Close',
    currentRoom: 'Current room',
    email: 'Email',
    emailCasaMia: 'Email CasaMia',
    entranceType: 'Entry',
    entranceTypePlaceholder: 'Steps or level?',
    eyebrow: 'Guided self-check',
    bathrooms: 'Bathrooms',
    bathroomsPlaceholder: 'How many?',
    bedrooms: 'Bedrooms',
    bedroomsPlaceholder: 'How many?',
    floorCount: 'Floors',
    floorCountPlaceholder: 'Levels',
    generateReport: 'Show my safety priorities',
    highPriority: 'High priority',
    homeBasics: 'Home basics',
    homeHelp: 'The broad home setup before we review each room.',
    intro: 'Start with the essentials, then review the person’s needs and each key room.',
    livesWith: 'Lives with',
    livesWithPlaceholder: 'Household',
    mainConcern: 'Main concern or extra context',
    mainConcernPlaceholder: 'Example: Mum is confident during the day but worries about getting to the bathroom at night.',
    memory: 'Memory or confusion',
    memoryPlaceholder: 'Any concern?',
    modalTitle: 'Quick home check',
    mobilityLevel: 'Usual support',
    mobilityPlaceholder: 'Usual support',
    name: 'Name',
    noPhotos: 'No photos yet',
    phone: 'Phone',
    questionPhotoHelp: 'Photo helpful: show the exact step, surface, support point, route, or object.',
    questionPhotoTitle: 'Photo for this point',
    photos: 'Photos',
    photosOptional: 'Optional: show steps, thresholds, surfaces, routes, or support points.',
    previousRoom: 'Previous room',
    progress: 'Progress',
    propertyType: 'Home type',
    propertyTypePlaceholder: 'Apartment, house...',
    recentFalls: 'Recent falls',
    recentFallsPlaceholder: 'Fall history',
    reportEmpty: 'Items marked Needs attention or Not sure will appear here.',
    reportContext: 'Home and person summary',
    reportPreview: 'Report preview',
    reportReady: 'Report ready to submit',
    reportStatus: 'Nothing flagged yet',
    residentContext: 'Who it’s for',
    residentNeeds: 'Who it’s for',
    residentNeedsHelp: 'Falls, confidence, routines, and daily support.',
    residentHelp: 'Only what helps us understand risk and comfort.',
    residentName: 'Name',
    roomNotes: 'Room notes',
    roomNotesPlaceholder: (room: string) => `Add notes about ${room.toLowerCase()}...`,
    stepOne: 'Step 1',
    startCheck: 'Start self-check',
    stepCards: [
      ['Home basics', 'Type, access, rooms and daily support.'],
      ['Room checks', 'Simple yes/no questions for each area.'],
      ['Helpful photos', 'Add photos only where they clarify something.'],
    ],
    steps: ['Home', 'Who it’s for', 'Rooms', 'Summary'],
    nextRoom: 'Next room',
    submit: 'Send summary',
    submitIncomplete: 'Add your name, phone or email, and consent before submitting the report.',
    submitReady: 'Sent to CasaMia. We’ll review it and follow up with your safety priorities.',
    submitSending: 'Sending to CasaMia...',
    submitLocalFallback: 'Saved locally, but the online submission endpoint is not available in this preview.',
    title: 'Check the home, step by step.',
    toReview: (count: number) => `${count} to review`,
  },
  es: {
    addPhotos: 'Añadir fotos',
    addPhotosHelp: 'Añade una foto si ayuda a explicar un riesgo.',
    addQuestionPhoto: 'Añadir foto',
    addMobilityDetails: 'Opcional',
    ageRange: 'Edad',
    ageRangePlaceholder: 'Franja',
    answerAnswered: 'respondidas',
    answerNeedsAttention: 'Revisar',
    answerNotSure: 'No sé',
    answerSafe: 'Bien',
    attachedPhotos: (count: number) => `${count} foto${count === 1 ? '' : 's'} adjunta${count === 1 ? '' : 's'}`,
    consent: 'Acepto que CasaMia use este cuestionario para preparar el informe y contactarme.',
    close: 'Cerrar',
    currentRoom: 'Zona actual',
    email: 'Email',
    emailCasaMia: 'Email a CasaMia',
    entranceType: 'Entrada',
    entranceTypePlaceholder: '¿Escalón o llano?',
    eyebrow: 'Revisión guiada',
    bathrooms: 'Baños',
    bathroomsPlaceholder: '¿Cuántos?',
    bedrooms: 'Dormitorios',
    bedroomsPlaceholder: '¿Cuántos?',
    floorCount: 'Plantas',
    floorCountPlaceholder: 'Niveles',
    generateReport: 'Ver mis prioridades',
    highPriority: 'Prioridad alta',
    homeBasics: 'Vivienda',
    homeHelp: 'Vivienda y rutinas clave.',
    intro: 'Añade lo esencial, revisa zonas clave y sube fotos útiles.',
    livesWith: 'Convive con',
    livesWithPlaceholder: 'Hogar',
    mainConcern: 'Preocupación principal',
    mainConcernPlaceholder: 'Ejemplo: se mueve bien de día, pero le preocupa ir al baño por la noche.',
    memory: 'Memoria o confusión',
    memoryPlaceholder: '¿Hay señales?',
    modalTitle: 'Revisión rápida',
    mobilityLevel: 'Movilidad',
    mobilityPlaceholder: 'Apoyo habitual',
    name: 'Nombre',
    noPhotos: 'Sin fotos',
    phone: 'Teléfono',
    questionPhotoHelp: 'Foto útil: muestra el escalón, suelo, apoyo, recorrido u objeto concreto.',
    questionPhotoTitle: 'Foto de este punto',
    photos: 'Fotos',
    photosOptional: 'Opcional: muestra escalones, umbrales, suelos, recorridos o puntos de apoyo.',
    previousRoom: 'Zona anterior',
    progress: 'Progreso',
    propertyType: 'Vivienda',
    propertyTypePlaceholder: 'Piso, casa...',
    recentFalls: 'Caídas recientes',
    recentFallsPlaceholder: 'Historial',
    reportEmpty: 'Los puntos marcados como Revisar o No sé aparecerán aquí.',
    reportContext: 'Resumen de vivienda y persona',
    reportPreview: 'Vista del informe',
    reportReady: 'Informe listo para enviar',
    reportStatus: 'Sin riesgos marcados',
    residentContext: 'Contexto de la persona',
    residentNeeds: 'Persona',
    residentNeedsHelp: 'Caídas, confianza, rutinas y apoyo diario.',
    residentHelp: 'Solo lo que orienta la revisión.',
    residentName: 'Nombre',
    roomNotes: 'Notas',
    roomNotesPlaceholder: (room: string) => `Añade notas sobre ${room.toLowerCase()}...`,
    stepOne: 'Paso 1',
    startCheck: 'Empezar revisión',
    stepCards: [
      ['Datos básicos', 'Vivienda, accesos, habitaciones y apoyo diario.'],
      ['Zonas clave', 'Preguntas sencillas para cada espacio.'],
      ['Fotos útiles', 'Solo donde ayuden a explicar algo.'],
    ],
    steps: ['Vivienda', 'Zonas', 'Resumen'],
    nextRoom: 'Siguiente zona',
    submit: 'Enviar resumen',
    submitIncomplete: 'Añade tu nombre, teléfono o email, y acepta el consentimiento para enviar el informe.',
    submitReady: 'Enviado a CasaMia. Revisaremos la información y te contactaremos.',
    submitSending: 'Enviando a CasaMia...',
    submitLocalFallback: 'Guardado localmente, pero el envío online no está disponible en esta vista previa.',
    title: 'Revisa la vivienda, paso a paso.',
    toReview: (count: number) => `${count} por revisar`,
  },
}

const selfInspectionCopyEsRefined: Partial<typeof selfInspectionCopy.en> = {
  addPhotos: 'Añadir fotos',
  addPhotosHelp: 'Añade una foto si ayuda a explicar un riesgo.',
  addQuestionPhoto: 'Añadir foto',
  addMobilityDetails: 'Más sobre el apoyo diario',
  answerNotSure: 'No sé',
  entranceTypePlaceholder: '¿Escalón o llano?',
  eyebrow: 'Revisión guiada',
  bathrooms: 'Baños',
  bathroomsPlaceholder: '¿Cuántos?',
  bedroomsPlaceholder: '¿Cuántos?',
  homeBasics: 'Datos de la vivienda',
  homeHelp: 'La configuración general antes de revisar cada zona.',
  intro: 'Empieza por lo esencial, después revisamos la persona y cada zona clave.',
  mainConcern: 'Preocupación principal',
  mainConcernPlaceholder: 'Ejemplo: se mueve bien de día, pero le preocupa ir al baño por la noche.',
  memory: 'Memoria o confusión',
  memoryPlaceholder: '¿Hay señales?',
  modalTitle: 'Revisión rápida',
  mobilityLevel: 'Apoyo habitual',
  phone: 'Teléfono',
  questionPhotoHelp: 'Foto útil: muestra el escalón, suelo, apoyo, recorrido u objeto concreto.',
  reportContext: 'Resumen de vivienda y persona',
  residentContext: 'Para quién es',
  residentNeeds: 'Para quién es',
  residentNeedsHelp: 'Caídas, confianza, rutinas y apoyo diario.',
  residentHelp: 'Solo lo que ayuda a entender riesgo y comodidad.',
  roomNotesPlaceholder: (room: string) => `Añade notas sobre ${room.toLowerCase()}...`,
  stepCards: [
    ['Datos básicos', 'Vivienda, accesos y apoyo diario.'],
    ['Zonas clave', 'Preguntas sencillas para cada espacio.'],
    ['Fotos útiles', 'Solo donde ayuden a explicar algo.'],
  ],
  steps: ['Vivienda', 'Para quién es', 'Zonas', 'Resumen'],
  submitIncomplete: 'Añade tu nombre, teléfono o email, y acepta el consentimiento para enviar el informe.',
  submitReady: 'Enviado a CasaMia. Revisaremos la información y te contactaremos.',
  submitSending: 'Enviando a CasaMia...',
  submitLocalFallback: 'Guardado localmente, pero el envío online no está disponible en esta vista previa.',
}

const roomCopyEs: Record<string, Pick<InspectionRoom, 'title' | 'intro'>> = {
  bathroom: {
    title: 'Baño',
    intro: 'Ducha, suelo mojado, altura del WC, entrada y puntos de apoyo.',
  },
  bedroom: {
    title: 'Dormitorio',
    intro: 'Entrada y salida de la cama, recorrido nocturno, alcance y aviso de emergencia.',
  },
  entrance: {
    title: 'Entrada',
    intro: 'Umbrales, escalones, puerta, iluminación exterior y rutina de llaves.',
  },
  kitchen: {
    title: 'Cocina',
    intro: 'Alcance, electrodomésticos, suelo, iluminación y superficies de trabajo.',
  },
  living: {
    title: 'Salón',
    intro: 'Sillón habitual, recorridos, alfombras, cables, mandos y ayuda cercana.',
  },
  outdoor: {
    title: 'Exterior',
    intro: 'Caminos, patio, escalones, lluvia y puntos de apoyo.',
  },
  stairs: {
    title: 'Escaleras',
    intro: 'Pasamanos, contraste, descansillos, iluminación y confianza al subir o bajar.',
  },
}

const questionCopyEs: Record<string, Pick<InspectionQuestion, 'area' | 'prompt' | 'recommendation'>> = {
  'bathroom-shower-entry': {
    area: 'Ducha y bañera',
    prompt: '¿Puede entrar y salir de la ducha o bañera sin superar un borde alto?',
    recommendation: 'Valorar ducha de acceso bajo, tabla de bañera, banco de transferencia o barras cerca de la entrada.',
  },
  'bathroom-floor': {
    area: 'Suelo',
    prompt: '¿El suelo del baño es antideslizante cuando está mojado y sin alfombras sueltas?',
    recommendation: 'Usar suelo o alfombrillas antideslizantes fijadas y retirar alfombras sueltas.',
  },
  'bathroom-toilet': {
    area: 'Uso del WC',
    prompt: '¿La altura del WC es cómoda y hay apoyo al sentarse o levantarse?',
    recommendation: 'Añadir elevador de WC, marco de apoyo o barra fijada a pared.',
  },
  'bathroom-lighting': {
    area: 'Iluminación',
    prompt: '¿Hay luz clara para ir al baño por la noche?',
    recommendation: 'Añadir iluminación con sensor entre dormitorio y baño y mejorar la luz junto al lavabo.',
  },
  'bathroom-reach': {
    area: 'Alcance',
    prompt: '¿Toallas, ropa, jabón y mandos quedan al alcance sin girarse, agacharse o alejarse del apoyo?',
    recommendation: 'Mover los objetos diarios al alcance y añadir estantes o colgadores junto al punto de apoyo más seguro.',
  },
  'bathroom-temperature': {
    area: 'Agua segura',
    prompt: '¿Los grifos y mandos de ducha son fáciles de usar y sin riesgo de agua demasiado caliente?',
    recommendation: 'Revisar mezcladores, añadir marcas claras y valorar protección termostática si hay riesgo de quemadura.',
  },
  'stairs-handrails': {
    area: 'Apoyo de manos',
    prompt: '¿Hay pasamanos seguro durante todo el recorrido de la escalera?',
    recommendation: 'Instalar pasamanos continuo, idealmente a ambos lados cuando el espacio lo permita.',
  },
  'stairs-contrast': {
    area: 'Visibilidad',
    prompt: '¿Se ven bien los bordes de los escalones con luz normal y poca luz?',
    recommendation: 'Añadir contraste en los bordes y mejorar la iluminación de escalera.',
  },
  'stairs-surface': {
    area: 'Superficie',
    prompt: '¿Los escalones son uniformes, antideslizantes y están libres de objetos?',
    recommendation: 'Reparar peldaños irregulares, añadir bandas antideslizantes y mantener la escalera despejada.',
  },
  'stairs-rest': {
    area: 'Descanso',
    prompt: '¿Hay un lugar seguro para pausar arriba, abajo o en el descansillo?',
    recommendation: 'Despejar descansillos, mejorar espacio de giro y valorar punto de descanso o revisión de salvaescaleras si hay fatiga.',
  },
  'stairs-carrying': {
    area: 'Transportar objetos',
    prompt: '¿Puede usar la escalera sin cargar ropa, bebidas u objetos que impidan agarrarse?',
    recommendation: 'Crear rutinas de almacenaje arriba/abajo o usar cestas, apoyos o ayuda para evitar cargas.',
  },
  'bedroom-bed-height': {
    area: 'Entrada y salida de cama',
    prompt: '¿Puede entrar y salir de la cama sin caer de golpe ni empujarse en exceso?',
    recommendation: 'Ajustar altura de cama, añadir barandilla de cama o revisar colchón y apoyo de transferencia.',
  },
  'bedroom-route': {
    area: 'Ruta nocturna',
    prompt: '¿El recorrido de la cama al baño está despejado e iluminado por la noche?',
    recommendation: 'Despejar el recorrido y añadir iluminación con sensor desde la cama hasta el baño.',
  },
  'bedroom-reach': {
    area: 'Alcance junto a cama',
    prompt: '¿Teléfono, agua, gafas, medicación y luz están al alcance desde la cama?',
    recommendation: 'Recolocar lo esencial y valorar controles por voz o mando remoto.',
  },
  'bedroom-space': {
    area: 'Espacio de transferencia',
    prompt: '¿Hay espacio junto a la cama para andador, silla, cuidador o ayuda de transferencia si hiciera falta?',
    recommendation: 'Reordenar muebles para dejar un lado claro y retirar obstáculos bajos cerca de la cama.',
  },
  'bedroom-emergency': {
    area: 'Aviso de emergencia',
    prompt: '¿Puede pedir ayuda desde la cama, incluso de noche o tras una caída?',
    recommendation: 'Añadir botón de emergencia, pulsera de aviso o punto de carga del teléfono al alcance.',
  },
  'kitchen-storage': {
    area: 'Almacenaje',
    prompt: '¿Los objetos diarios están guardados entre altura de hombros y rodillas?',
    recommendation: 'Mover lo diario a armarios fáciles de alcanzar o usar almacenaje extraíble.',
  },
  'kitchen-lighting': {
    area: 'Luz de trabajo',
    prompt: '¿Encimera, placa, fregadero y zonas de preparación están bien iluminadas?',
    recommendation: 'Añadir luz bajo armarios y reducir sombras cerca de electrodomésticos.',
  },
  'kitchen-floor': {
    area: 'Suelo y paso',
    prompt: '¿El suelo de cocina está seco, es antideslizante y no tiene cables o alfombras sueltas?',
    recommendation: 'Eliminar tropiezos, fijar cables y usar suelo antideslizante donde haga falta.',
  },
  'kitchen-seated': {
    area: 'Tareas sentado',
    prompt: '¿Se puede preparar comida sentado si estar de pie cansa?',
    recommendation: 'Crear zona de preparación sentada con silla estable y espacio libre para las rodillas.',
  },
  'kitchen-hot-items': {
    area: 'Objetos calientes',
    prompt: '¿Se pueden mover bebidas, sartenes y platos calientes sin recorridos largos ni giros rápidos?',
    recommendation: 'Acortar la ruta entre hervidor, fregadero, placa y mesa, y valorar carrito o distribución más segura.',
  },
  'entrance-threshold': {
    area: 'Umbral',
    prompt: '¿Puede entrar en casa sin un escalón difícil o umbral elevado?',
    recommendation: 'Añadir rampa de umbral, pasamanos o plataforma de entrada según el espacio.',
  },
  'entrance-lighting': {
    area: 'Iluminación',
    prompt: '¿La entrada está bien iluminada al llegar de noche?',
    recommendation: 'Instalar luz con sensor en la puerta y el camino de acceso.',
  },
  'entrance-keys': {
    area: 'Rutina de puerta',
    prompt: '¿Abrir, cerrar y usar llaves se puede hacer sin prisas ni agacharse?',
    recommendation: 'Valorar manillas más fáciles, caja de llaves, acceso inteligente o una rutina de llegada más clara.',
  },
  'entrance-width': {
    area: 'Anchura',
    prompt: '¿Hay anchura y giro suficientes para ayudas de marcha, bolsas o silla de ruedas si hiciera falta?',
    recommendation: 'Despejar la entrada y revisar si hacen falta ajustes de umbral, puerta o mobiliario.',
  },
  'entrance-seating': {
    area: 'Zapatos y bolsas',
    prompt: '¿Hay un lugar estable para sentarse o apoyarse al ponerse zapatos, abrigo o manejar bolsas?',
    recommendation: 'Añadir silla firme, colgadores a altura cómoda y superficie segura para bolsas o llaves.',
  },
  'outdoor-path': {
    area: 'Camino',
    prompt: '¿Los caminos exteriores son uniformes, estables y suficientemente anchos?',
    recommendation: 'Reparar zonas irregulares, retirar piedras sueltas y ampliar pasos estrechos cuando sea posible.',
  },
  'outdoor-steps': {
    area: 'Escalones exteriores',
    prompt: '¿Los escalones exteriores tienen apoyo de mano y bordes visibles?',
    recommendation: 'Añadir pasamanos exterior y contraste en bordes apto para exterior.',
  },
  'outdoor-weather': {
    area: 'Lluvia',
    prompt: '¿Las superficies siguen siendo seguras después de la lluvia?',
    recommendation: 'Usar tratamiento antideslizante, mejorar drenaje o cubrir zonas de transición.',
  },
  'outdoor-parking': {
    area: 'Llegada',
    prompt: '¿El recorrido desde aparcamiento, puerta o calle hasta la entrada es seguro y bien iluminado?',
    recommendation: 'Mejorar iluminación, corregir pavimento irregular y añadir apoyo donde cambie el nivel.',
  },
  'outdoor-maintenance': {
    area: 'Mantenimiento',
    prompt: '¿Plantas, cubos, mangueras y muebles de jardín quedan fuera de los pasos?',
    recommendation: 'Crear un recorrido exterior claro y revisar después de viento, lluvia o trabajos de jardín.',
  },
  'living-routes': {
    area: 'Recorridos',
    prompt: '¿Los recorridos entre sillón, baño, cocina y entrada son amplios y sin obstáculos?',
    recommendation: 'Reordenar muebles para crear pasos claros y retirar mesas bajas u obstáculos de zonas de giro.',
  },
  'living-seating': {
    area: 'Levantarse del sillón',
    prompt: '¿Puede levantarse del sillón habitual sin balancearse, tirar de objetos o perder equilibrio?',
    recommendation: 'Revisar altura y firmeza del asiento y valorar elevadores, reposabrazos o sillón elevador.',
  },
  'living-rugs': {
    area: 'Alfombras y cables',
    prompt: '¿Alfombras, cables, objetos de mascotas y muebles pequeños están fijados o fuera del paso?',
    recommendation: 'Retirar alfombras sueltas, fijar cables junto a la pared y mantener objetos móviles fuera de rutas.',
  },
  'living-controls': {
    area: 'Mandos y ayuda',
    prompt: '¿Teléfono, mandos, calefacción y ayuda de emergencia están al alcance desde el asiento principal?',
    recommendation: 'Crear una zona de control al alcance y valorar voz o aviso portátil para emergencias.',
  },
}

const valueCopyEs: Record<string, string> = {
  Apartment: 'Piso',
  'Single-storey home': 'Casa de una planta',
  'House with stairs': 'Casa con escaleras',
  'Townhouse / villa': 'Adosado o villa',
  'Residence / managed property': 'Residencia o vivienda gestionada',
  '1 bedroom': '1 dormitorio',
  '2 bedrooms': '2 dormitorios',
  '3 bedrooms': '3 dormitorios',
  '4+ bedrooms': '4+ dormitorios',
  '1 bathroom': '1 baño',
  '2 bathrooms': '2 baños',
  '3+ bathrooms': '3+ baños',
  '1 floor': '1 planta',
  '2 floors': '2 plantas',
  '3+ floors': '3+ plantas',
  'Level access': 'Acceso a nivel',
  'Small threshold': 'Umbral pequeño',
  'Outdoor steps': 'Escalones exteriores',
  Ramp: 'Rampa',
  'Lift / shared entrance': 'Ascensor o entrada comunitaria',
  'Standard width': 'Anchura estándar',
  'Narrow entrance': 'Entrada estrecha',
  'Walker-friendly': 'Apta para andador',
  'Wheelchair-friendly': 'Apta para silla de ruedas',
  'Not sure': 'No estoy seguro/a',
  'Under 65': 'Menos de 65',
  Alone: 'Solo/a',
  Partner: 'Pareja',
  Family: 'Familia',
  'Carer support': 'Apoyo de cuidador',
  Other: 'Otro',
  Independent: 'Independiente',
  'Uses support outside': 'Usa apoyo fuera',
  'Uses support indoors': 'Usa apoyo en casa',
  'Needs help with transfers': 'Necesita ayuda al levantarse',
  'Mostly seated / wheelchair': 'Principalmente sentado/a o silla de ruedas',
  'No recent falls': 'Sin caídas recientes',
  'One fall in last 12 months': 'Una caída en 12 meses',
  'Two or more falls': 'Dos o más caídas',
  'Near misses / fear of falling': 'Sustos o miedo a caer',
  'None known': 'No consta',
  'Mild forgetfulness': 'Olvidos leves',
  'Dementia / confusion': 'Demencia o confusión',
  None: 'Ninguno',
  'Walking stick': 'Bastón',
  'Walker / rollator': 'Andador',
  Wheelchair: 'Silla de ruedas',
  'Grabber / reacher': 'Pinza de alcance',
  Bed: 'Cama',
  Toilet: 'WC',
  'Shower / bath': 'Ducha o bañera',
  'Chair / sofa': 'Silla o sofá',
  'Car / entrance': 'Coche o entrada',
  Stairs: 'Escaleras',
  'Low vision': 'Baja visión',
  'Glare sensitivity': 'Sensibilidad al deslumbramiento',
  'Hearing difficulty': 'Dificultad auditiva',
  'Uses hearing aid': 'Usa audífono',
  Dizziness: 'Mareos',
  'Getting to bathroom at night': 'Ir al baño por la noche',
  'Showering safely': 'Ducharse con seguridad',
  'Using stairs': 'Usar escaleras',
  'Cooking independently': 'Cocinar con autonomía',
  'Entering the home': 'Entrar en casa',
  'Emergency response': 'Respuesta ante emergencias',
}

const inspectionRooms: InspectionRoom[] = [
  {
    id: 'bathroom',
    title: 'Bathroom',
    intro: 'Transfers, wet areas, toilet height, shower entry, and support points.',
    questions: [
      {
        id: 'bathroom-shower-entry',
        area: 'Shower and bath',
        prompt: 'Can the person enter and exit the shower or bath without stepping over a high edge?',
        recommendation: 'Consider a low-threshold shower, bath board, transfer bench, or grab bars near the entry point.',
      },
      {
        id: 'bathroom-floor',
        area: 'Floor surface',
        prompt: 'Is the bathroom floor non-slip when wet and free from loose mats?',
        recommendation: 'Use anti-slip flooring or fixed anti-slip mats and remove loose rugs.',
      },
      {
        id: 'bathroom-toilet',
        area: 'Toilet transfer',
        prompt: 'Is the toilet height comfortable, with support available when sitting or standing?',
        recommendation: 'Add a raised toilet seat, toilet frame, or wall-mounted support rail.',
      },
      {
        id: 'bathroom-lighting',
        area: 'Lighting',
        prompt: 'Is there clear lighting for night-time bathroom visits?',
        recommendation: 'Add motion lighting between bedroom and bathroom and improve task lighting around the sink.',
      },
      {
        id: 'bathroom-reach',
        area: 'Reach and drying',
        prompt: 'Can towels, clothes, soap, and controls be reached without twisting, bending, or stepping away from support?',
        recommendation: 'Move daily items within easy reach and add shelving or hooks beside the safest transfer point.',
      },
      {
        id: 'bathroom-temperature',
        area: 'Water safety',
        prompt: 'Are taps and shower controls easy to use, with low risk of sudden hot water or confusing settings?',
        recommendation: 'Review mixer controls, add clear markings, and consider thermostatic protection if scald risk is possible.',
      },
    ],
  },
  {
    id: 'stairs',
    title: 'Stairs',
    intro: 'Handrails, step contrast, landings, lighting, and route confidence.',
    questions: [
      {
        id: 'stairs-handrails',
        area: 'Hand support',
        prompt: 'Is there a secure handrail on the full stair route?',
        recommendation: 'Fit a continuous handrail, ideally on both sides when space allows.',
      },
      {
        id: 'stairs-contrast',
        area: 'Step visibility',
        prompt: 'Are step edges easy to see in normal and low light?',
        recommendation: 'Add contrast strips to step edges and improve stair lighting.',
      },
      {
        id: 'stairs-surface',
        area: 'Step surface',
        prompt: 'Are stairs even, non-slip, and clear of objects?',
        recommendation: 'Repair uneven treads, add anti-slip strips, and keep the stair route clear.',
      },
      {
        id: 'stairs-rest',
        area: 'Rest and landing',
        prompt: 'Is there a safe place to pause at the top, bottom, or landing without blocking balance or turning space?',
        recommendation: 'Clear landings, improve turning space, and consider a rest point or stairlift review if fatigue is common.',
      },
      {
        id: 'stairs-carrying',
        area: 'Carrying items',
        prompt: 'Can the person use the stairs without carrying laundry, drinks, or other items that reduce hand support?',
        recommendation: 'Create upstairs/downstairs storage routines or use baskets, rails, or support services to avoid carrying loads.',
      },
    ],
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    intro: 'Bed transfers, night routes, bedside reach, and emergency access.',
    questions: [
      {
        id: 'bedroom-bed-height',
        area: 'Bed transfer',
        prompt: 'Can the person get in and out of bed without dropping down or pushing excessively?',
        recommendation: 'Adjust bed height, add a bed rail, or review mattress and transfer support.',
      },
      {
        id: 'bedroom-route',
        area: 'Night route',
        prompt: 'Is the route from bed to bathroom clear and lit at night?',
        recommendation: 'Clear the route and add motion lighting from bedside to bathroom.',
      },
      {
        id: 'bedroom-reach',
        area: 'Bedside reach',
        prompt: 'Are phone, water, glasses, medication, and light controls reachable from bed?',
        recommendation: 'Reposition bedside essentials and consider voice or remote controls.',
      },
      {
        id: 'bedroom-space',
        area: 'Transfer space',
        prompt: 'Is there enough clear space beside the bed for a walker, wheelchair, carer, or transfer aid if needed?',
        recommendation: 'Rearrange furniture to create a clear transfer side and remove low obstacles near the bed.',
      },
      {
        id: 'bedroom-emergency',
        area: 'Emergency contact',
        prompt: 'Can the person call for help from bed, including at night or after a fall?',
        recommendation: 'Add an emergency call button, wearable alert, or phone charging point within reach from bed.',
      },
    ],
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    intro: 'Reach, appliance access, floor safety, task lighting, and work surfaces.',
    questions: [
      {
        id: 'kitchen-storage',
        area: 'Storage',
        prompt: 'Are everyday items stored between shoulder and knee height?',
        recommendation: 'Move daily-use items to easy-reach cupboards or pull-out storage.',
      },
      {
        id: 'kitchen-lighting',
        area: 'Task lighting',
        prompt: 'Are worktops, hob, sink, and preparation areas well lit?',
        recommendation: 'Add under-cabinet task lighting and reduce shadows near appliances.',
      },
      {
        id: 'kitchen-floor',
        area: 'Floor route',
        prompt: 'Is the kitchen floor dry, non-slip, and free from trailing cables or mats?',
        recommendation: 'Remove trip points, secure cables, and use non-slip flooring where needed.',
      },
      {
        id: 'kitchen-seated',
        area: 'Seated tasks',
        prompt: 'Can food preparation be done while seated if standing becomes tiring?',
        recommendation: 'Create a safe seated preparation area with stable chair height and clear knee space.',
      },
      {
        id: 'kitchen-hot-items',
        area: 'Hot items',
        prompt: 'Can hot drinks, pans, and plates be moved without crossing long distances or turning quickly?',
        recommendation: 'Shorten the route between kettle, sink, hob, and table, and consider a trolley or safer appliance layout.',
      },
    ],
  },
  {
    id: 'entrance',
    title: 'Entrance',
    intro: 'Thresholds, steps, door access, outdoor lighting, and key routines.',
    questions: [
      {
        id: 'entrance-threshold',
        area: 'Threshold',
        prompt: 'Can the person enter the home without a difficult step or raised threshold?',
        recommendation: 'Add a threshold ramp, handrail, or entry platform depending on available space.',
      },
      {
        id: 'entrance-lighting',
        area: 'Lighting',
        prompt: 'Is the entrance well lit when arriving after dark?',
        recommendation: 'Install motion-activated lighting at the doorway and path.',
      },
      {
        id: 'entrance-keys',
        area: 'Door routine',
        prompt: 'Is locking, unlocking, and opening the door manageable without rushing or bending?',
        recommendation: 'Consider easier handles, key-safe support, smart access, or a clearer arrival routine.',
      },
      {
        id: 'entrance-width',
        area: 'Door width',
        prompt: 'Is there enough width and turning space for walking aids, shopping bags, or a wheelchair if needed?',
        recommendation: 'Clear the entry zone, review furniture placement, and assess whether threshold or door adjustments are needed.',
      },
      {
        id: 'entrance-seating',
        area: 'Shoes and bags',
        prompt: 'Is there a stable place to sit or lean while putting on shoes, coats, or handling bags?',
        recommendation: 'Add a firm entry chair, wall hooks at reachable height, and a safe surface for bags or keys.',
      },
    ],
  },
  {
    id: 'outdoor',
    title: 'Outdoor areas',
    intro: 'Paths, patio surfaces, garden steps, weather risk, and hand support.',
    questions: [
      {
        id: 'outdoor-path',
        area: 'Pathway',
        prompt: 'Are outdoor paths even, stable, and wide enough for confident walking?',
        recommendation: 'Repair uneven paths, remove loose stones, and widen tight approach routes where possible.',
      },
      {
        id: 'outdoor-steps',
        area: 'Outdoor steps',
        prompt: 'Do outdoor steps have hand support and visible edges?',
        recommendation: 'Add external handrails and step-edge contrast suited for outdoor use.',
      },
      {
        id: 'outdoor-weather',
        area: 'Weather risk',
        prompt: 'Do surfaces remain safe after rain?',
        recommendation: 'Use anti-slip surface treatment, drainage improvements, or covered transition areas.',
      },
      {
        id: 'outdoor-parking',
        area: 'Arrival route',
        prompt: 'Is the route from parking, gate, or street to the front door safe and well lit?',
        recommendation: 'Improve route lighting, remove uneven paving, and add hand support where the approach changes level.',
      },
      {
        id: 'outdoor-maintenance',
        area: 'Maintenance',
        prompt: 'Are plants, bins, hoses, and garden furniture kept away from walking routes?',
        recommendation: 'Create a clear outdoor walking route and schedule regular checks after wind, rain, or garden work.',
      },
    ],
  },
  {
    id: 'living',
    title: 'Living areas',
    intro: 'Daily seating, walking routes, rugs, cables, controls, and emergency reach.',
    questions: [
      {
        id: 'living-routes',
        area: 'Walking routes',
        prompt: 'Are routes between chair, bathroom, kitchen, and entrance wide and free from clutter?',
        recommendation: 'Rearrange furniture to create clear routes and remove low tables or obstacles from turning areas.',
      },
      {
        id: 'living-seating',
        area: 'Chair transfer',
        prompt: 'Can the person stand from their usual chair without rocking, pulling, or losing balance?',
        recommendation: 'Review chair height and firmness, and consider chair raisers, arm support, or a riser recliner.',
      },
      {
        id: 'living-rugs',
        area: 'Rugs and cables',
        prompt: 'Are rugs, cables, pet items, and small furniture secured or removed from walking paths?',
        recommendation: 'Remove loose rugs, secure cables along walls, and keep small movable items away from routes.',
      },
      {
        id: 'living-controls',
        area: 'Controls and help',
        prompt: 'Are phone, remote controls, heating controls, and emergency support easy to reach from the main seat?',
        recommendation: 'Create a reachable control zone and consider voice controls or a wearable alert for emergencies.',
      },
    ],
  },
]

export function SelfInspectionTool() {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.startsWith('es')
  const copy = isSpanish ? { ...selfInspectionCopy.es, ...selfInspectionCopyEsRefined } : selfInspectionCopy.en
  const localizedRooms = useMemo(
    () =>
      inspectionRooms.map((room) => ({
        ...room,
        ...(isSpanish ? roomCopyEs[room.id] : {}),
        questions: room.questions.map((question) => ({
          ...question,
          ...(isSpanish ? questionCopyEs[question.id] : {}),
        })),
      })),
    [isSpanish],
  )
  const [activeRoomId, setActiveRoomId] = useState(inspectionRooms[0].id)
  const [answers, setAnswers] = useState<Record<string, AnswerStatus>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<Record<string, RoomPhoto[]>>({})
  const [contact, setContact] = useState<ContactDetails>({
    consent: false,
    email: '',
    name: '',
    phone: '',
  })
  const [resident, setResident] = useState<ResidentProfile>({
    ageRange: '',
    bathrooms: '',
    bedrooms: '',
    cognitiveConcerns: '',
    dailyPriorities: [],
    entranceSpace: '',
    entranceType: '',
    floorCount: '',
    livesWith: '',
    mainConcern: '',
    mobilityAids: [],
    mobilityLevel: '',
    propertyType: '',
    recentFalls: '',
    residentName: '',
    transferNeeds: [],
    visionHearing: [],
  })
  const [reportReady, setReportReady] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState(0)
  const reportRef = useRef<HTMLDivElement>(null)
  const quickCheckReference = useRef(
    `QHC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  ).current

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === '#self-inspection-tool') {
        setIsModalOpen(true)
      }
    }

    openFromHash()
    window.addEventListener('hashchange', openFromHash)

    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])

  useEffect(() => {
    if (!isModalOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isModalOpen])

  const activeRoom = localizedRooms.find((room) => room.id === activeRoomId) ?? localizedRooms[0]
  const activeRoomIndex = localizedRooms.findIndex((room) => room.id === activeRoom.id)
  const totalQuestions = localizedRooms.reduce((sum, room) => sum + room.questions.length, 0)
  const answeredCount = Object.keys(answers).length
  const completion = Math.round((answeredCount / totalQuestions) * 100)
  const riskItems = useMemo(
    () =>
      localizedRooms.flatMap((room) =>
        room.questions
          .filter((question) => answers[question.id] === 'risk' || answers[question.id] === 'not-sure')
          .map((question) => ({
            photoCount: photos[question.id]?.length ?? 0,
            question: question.prompt,
            recommendation: question.recommendation,
            room: room.title,
            status: answers[question.id],
          })),
      ),
    [answers, localizedRooms, photos],
  )
  const photoCount = Object.values(photos).reduce((sum, roomPhotos) => sum + roomPhotos.length, 0)
  const highPriorityCount = Object.values(answers).filter((answer) => answer === 'risk').length
  const currentRoomAnswered = activeRoom.questions.filter((question) => answers[question.id]).length
  const currentRoomComplete = currentRoomAnswered === activeRoom.questions.length
  const formatValue = (value: string) => (isSpanish ? valueCopyEs[value] ?? value : value)
  const selectPlaceholderClass = (value: string) => (value ? undefined : 'is-placeholder')
  const propertySummaryItems = [
    resident.propertyType,
    resident.bedrooms,
    resident.bathrooms,
    resident.floorCount,
    resident.entranceType,
  ].filter(Boolean)
  const residentSummaryItems = [
    resident.ageRange,
    resident.livesWith,
    resident.mobilityLevel,
    resident.recentFalls,
    resident.cognitiveConcerns,
  ].filter(Boolean)
  function answerQuestion(questionId: string, status: AnswerStatus) {
    setAnswers((current) => ({ ...current, [questionId]: status }))
    setReportReady(false)
  }

  function updateRoomNote(roomId: string, value: string) {
    setNotes((current) => ({ ...current, [roomId]: value }))
    setReportReady(false)
  }

  function updateResident<Field extends keyof ResidentProfile>(field: Field, value: ResidentProfile[Field]) {
    setResident((current) => ({ ...current, [field]: value }))
    setReportReady(false)
  }

  function toggleResidentValue(
    field: 'mobilityAids' | 'transferNeeds' | 'visionHearing' | 'dailyPriorities',
    value: string,
  ) {
    setResident((current) => {
      const values = current[field]
      const nextValues = values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
      const cleanedValues =
        value === 'None'
          ? ['None']
          : nextValues.filter((item) => !(item === 'None' && nextValues.length > 1))

      return {
        ...current,
        [field]: cleanedValues,
      }
    })
    setReportReady(false)
  }

  function addPhotos(roomId: string, event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    if (!files.length) {
      return
    }

    setPhotos((current) => ({
      ...current,
      [roomId]: [
        ...(current[roomId] ?? []),
        ...files.slice(0, 6).map((file) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          name: file.name,
          url: URL.createObjectURL(file),
        })),
      ],
    }))
    setReportReady(false)
    event.target.value = ''
  }

  function removePhoto(roomId: string, photoId: string) {
    setPhotos((current) => ({
      ...current,
      [roomId]: (current[roomId] ?? []).filter((photo) => photo.id !== photoId),
    }))
    setReportReady(false)
  }

  function generateReport() {
    setReportReady(true)
    setModalStep(3)
    window.setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function goToRoom(index: number) {
    const nextRoom = localizedRooms[index]

    if (nextRoom) {
      setActiveRoomId(nextRoom.id)
    }
  }

  function saveReportLocally(report: SelfInspectionReport) {
    const existing = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as unknown[]
    window.localStorage.setItem(storageKey, JSON.stringify([report, ...existing].slice(0, 20)))
  }

  async function submitReport() {
    if (!contact.name.trim() || (!contact.email.trim() && !contact.phone.trim()) || !contact.consent) {
      setSubmitMessage(copy.submitIncomplete)
      return
    }
    if (isSubmitting) {
      return
    }

    const report: SelfInspectionReport = {
      answers,
      completedAt: new Date().toISOString(),
      contact,
      notes,
      photoSummary: Object.fromEntries(
        Object.entries(photos).map(([roomId, roomPhotos]) => [roomId, roomPhotos.map((photo) => photo.name)]),
      ),
      recommendations: riskItems,
      resident,
    }
    saveReportLocally(report)
    setIsSubmitting(true)
    setSubmitMessage(copy.submitSending)

    try {
      await submitAssessmentRequest({
        city: '',
        consentAt: report.completedAt,
        consentConfirmed: contact.consent,
        email: contact.email,
        message: JSON.stringify(
          {
            answers,
            contact,
            highPriorityCount,
            language: i18n.language,
            notes,
            photoSummary: report.photoSummary,
            propertySummary: propertySummaryItems.map(formatValue),
            recommendations: riskItems,
            reference: quickCheckReference,
            resident,
            residentSummary: residentSummaryItems.map(formatValue),
            source: 'quick-home-check',
            submittedAt: report.completedAt,
            totalPhotos: photoCount,
          },
          null,
          2,
        ),
        name: contact.name,
        phone: contact.phone,
        preferredContactMethod: 'Quick home check form',
        preferredDate: '',
        selectedPlan: 'Quick Home Check',
        source: 'quick-home-check',
        wizardReference: quickCheckReference,
      })
      setSubmitMessage(copy.submitReady)
    } catch (error) {
      console.error('Quick home check submission failed', error)
      setSubmitMessage(copy.submitLocalFallback)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="self-inspection section-pad" id="self-inspection-tool">
      <div className="site-shell">
        <div className="self-inspection-invite">
          <div className="self-inspection-heading">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="display-title">{copy.title}</h2>
            <p>{copy.intro}</p>
            <button
              className="btn btn-navy self-inspection-open"
              type="button"
              onClick={() => {
                setModalStep(0)
                setIsModalOpen(true)
              }}
            >
              {copy.startCheck}
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="self-inspection-invite-visual" aria-label={copy.eyebrow}>
            {copy.stepCards.map(([title, body], index) => {
              const Icon = [Home, CheckCircle2, Camera][index] ?? FileText

              return (
                <article key={title}>
                  <span>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </article>
              )
            })}
          </div>
        </div>

        {isModalOpen ? (
          <div
            className="self-inspection-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsModalOpen(false)
              }
            }}
          >
            <div aria-labelledby="self-inspection-modal-title" aria-modal="true" className="self-inspection-modal" role="dialog">
              <header className="self-inspection-modal-header">
                <div>
                  <p className="self-inspection-modal-kicker">{copy.eyebrow}</p>
                  <h3 id="self-inspection-modal-title">{copy.modalTitle}</h3>
                </div>
                <button className="self-inspection-modal-close" type="button" aria-label={copy.close} onClick={() => setIsModalOpen(false)}>
                  <X size={22} aria-hidden="true" />
                </button>
              </header>

              <div className="self-inspection-guide" aria-label="How the inspection works">
                {copy.steps.map((step, index) => (
                  <button
                    className={`${modalStep === index ? 'is-active' : ''}${modalStep > index ? ' is-complete' : ''}`}
                    key={step}
                    type="button"
                    onClick={() => {
                      if (index === 3 && !reportReady) {
                        generateReport()
                        return
                      }

                      setModalStep(index)
                    }}
                  >
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </button>
                ))}
              </div>

              <div className="self-inspection-modal-body">
                <div className="self-inspection-shell">
                  {modalStep === 2 ? (
                    <aside className="self-inspection-sidebar" aria-label="Inspection rooms">
                      <div className="self-inspection-progress">
                        <span>{copy.progress}</span>
                        <div>
                          <i style={{ width: `${completion}%` }} />
                        </div>
                        <small>
                          {completion}% - {answeredCount}/{totalQuestions} {copy.answerAnswered}
                        </small>
                      </div>

            <div className="self-inspection-room-tabs">
              {localizedRooms.map((room) => {
                const answeredInRoom = room.questions.filter((question) => answers[question.id]).length
                const isComplete = answeredInRoom === room.questions.length

                return (
                  <button
                    className={`${room.id === activeRoom.id ? 'is-active' : ''}${isComplete ? ' is-complete' : ''}`}
                    key={room.id}
                    type="button"
                    onClick={() => setActiveRoomId(room.id)}
                  >
                    {isComplete ? <CheckCircle2 size={17} aria-hidden="true" /> : <Home size={17} aria-hidden="true" />}
                    <span>{room.title}</span>
                    <small>
                      {answeredInRoom}/{room.questions.length}
                    </small>
                  </button>
                )
              })}
            </div>
                    </aside>
                  ) : null}

          <div className="self-inspection-main">
            <div className="self-workflow-column">
              {modalStep === 0 ? (
              <section className="self-resident-card" aria-label="Resident profile">
                <div className="self-resident-heading">
                  <span>
                    <UserRound size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="eyebrow">{copy.stepOne}</p>
                    <h3>{copy.steps[0]}</h3>
                  </div>
                </div>

                <div className="self-profile-sections">
                  <section className="self-profile-block">
                    <header>
                      <span>1</span>
                      <div>
                        <strong>{copy.homeBasics}</strong>
                      </div>
                    </header>
                    <div className="self-resident-grid">
                      <label className="self-resident-field">
                        {copy.propertyType}
                        <select
                          className={selectPlaceholderClass(resident.propertyType)}
                          value={resident.propertyType}
                          onChange={(event) => updateResident('propertyType', event.target.value)}
                        >
                          <option value="">{copy.propertyTypePlaceholder}</option>
                          {['Apartment', 'Single-storey home', 'House with stairs', 'Townhouse / villa', 'Residence / managed property'].map(
                            (option) => (
                              <option key={option} value={option}>
                                {formatValue(option)}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                      <label className="self-resident-field">
                        {copy.floorCount}
                        <select
                          className={selectPlaceholderClass(resident.floorCount)}
                          value={resident.floorCount}
                          onChange={(event) => updateResident('floorCount', event.target.value)}
                        >
                          <option value="">{copy.floorCountPlaceholder}</option>
                          {['1 floor', '2 floors', '3+ floors'].map((option) => (
                            <option key={option} value={option}>
                              {formatValue(option)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="self-resident-field">
                        {copy.entranceType}
                        <select
                          className={selectPlaceholderClass(resident.entranceType)}
                          value={resident.entranceType}
                          onChange={(event) => updateResident('entranceType', event.target.value)}
                        >
                          <option value="">{copy.entranceTypePlaceholder}</option>
                          {['Level access', 'Small threshold', 'Outdoor steps', 'Ramp', 'Lift / shared entrance', 'Not sure'].map(
                            (option) => (
                              <option key={option} value={option}>
                                {formatValue(option)}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                    </div>
                  </section>

                </div>

                <label className="self-resident-notes">
                  {copy.mainConcern}
                  <textarea
                    placeholder={copy.mainConcernPlaceholder}
                    value={resident.mainConcern}
                    onChange={(event) => updateResident('mainConcern', event.target.value)}
                  />
                </label>

                {false ? (
                <details className="self-resident-more">
                  <summary>{copy.addMobilityDetails}</summary>
                  <div className="self-optional-grid">
                    <label className="self-resident-field">
                      {copy.residentName}
                      <input
                        value={resident.residentName}
                        onChange={(event) => updateResident('residentName', event.target.value)}
                      />
                    </label>
                    <label className="self-resident-field">
                      {copy.livesWith}
                      <select value={resident.livesWith} onChange={(event) => updateResident('livesWith', event.target.value)}>
                        <option value="">{copy.livesWithPlaceholder}</option>
                        {['Alone', 'Partner', 'Family', 'Carer support', 'Other'].map((option) => (
                          <option key={option} value={option}>
                            {formatValue(option)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="self-resident-field">
                      {copy.memory}
                      <select
                        value={resident.cognitiveConcerns}
                        onChange={(event) => updateResident('cognitiveConcerns', event.target.value)}
                      >
                        <option value="">{copy.memoryPlaceholder}</option>
                        {['None known', 'Mild forgetfulness', 'Dementia / confusion', 'Not sure'].map((option) => (
                          <option key={option} value={option}>
                            {formatValue(option)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="self-resident-checks">
                    <ResidentCheckGroup
                      formatOption={formatValue}
                      label={isSpanish ? 'Ayudas de movilidad' : 'Mobility aids used'}
                      options={mobilityAidOptions}
                      selected={resident.mobilityAids}
                      onToggle={(value) => toggleResidentValue('mobilityAids', value)}
                    />
                    <ResidentCheckGroup
                      formatOption={formatValue}
                      label={isSpanish ? 'Transferencias a revisar' : 'Transfers that need attention'}
                      options={transferNeedOptions}
                      selected={resident.transferNeeds}
                      onToggle={(value) => toggleResidentValue('transferNeeds', value)}
                    />
                    <ResidentCheckGroup
                      formatOption={formatValue}
                      label={isSpanish ? 'Visión, audición o equilibrio' : 'Vision, hearing, or balance'}
                      options={visionHearingOptions}
                      selected={resident.visionHearing}
                      onToggle={(value) => toggleResidentValue('visionHearing', value)}
                    />
                    <ResidentCheckGroup
                      formatOption={formatValue}
                      label={isSpanish ? 'Prioridades diarias' : 'Daily priorities'}
                      options={dailyPriorityOptions}
                      selected={resident.dailyPriorities}
                      onToggle={(value) => toggleResidentValue('dailyPriorities', value)}
                    />
                  </div>

                  <label className="self-resident-notes">
                    {copy.mainConcern}
                    <textarea
                      placeholder={copy.mainConcernPlaceholder}
                      value={resident.mainConcern}
                      onChange={(event) => updateResident('mainConcern', event.target.value)}
                    />
                  </label>
                </details>
                ) : null}
                <div className="self-room-actions self-modal-actions">
                  <button className="btn btn-white" type="button" onClick={() => setIsModalOpen(false)}>
                    {copy.close}
                  </button>
                  <button className="btn btn-navy" type="button" onClick={() => setModalStep(1)}>
                    {copy.steps[1]}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </section>
              ) : null}

              {modalStep === 1 ? (
              <section className="self-resident-card" aria-label={copy.residentContext}>
                <div className="self-resident-heading">
                  <span>
                    <UserRound size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="eyebrow">{copy.stepOne}</p>
                    <h3>{copy.residentNeeds}</h3>
                    <p>{copy.residentNeedsHelp}</p>
                  </div>
                </div>

                <div className="self-profile-sections self-profile-sections-single">
                  <section className="self-profile-block">
                    <header>
                      <span>2</span>
                      <div>
                        <strong>{copy.residentNeeds}</strong>
                        <p>{copy.residentHelp}</p>
                      </div>
                    </header>
                    <div className="self-resident-grid">
                      <label className="self-resident-field">
                        {copy.ageRange}
                        <select
                          className={selectPlaceholderClass(resident.ageRange)}
                          value={resident.ageRange}
                          onChange={(event) => updateResident('ageRange', event.target.value)}
                        >
                          <option value="">{copy.ageRangePlaceholder}</option>
                          {['Under 65', '65-74', '75-84', '85+'].map((option) => (
                            <option key={option} value={option}>
                              {formatValue(option)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="self-resident-field">
                        {copy.mobilityLevel}
                        <select
                          className={selectPlaceholderClass(resident.mobilityLevel)}
                          value={resident.mobilityLevel}
                          onChange={(event) => updateResident('mobilityLevel', event.target.value)}
                        >
                          <option value="">{copy.mobilityPlaceholder}</option>
                          {[
                            'Independent',
                            'Uses support outside',
                            'Uses support indoors',
                            'Needs help with transfers',
                            'Mostly seated / wheelchair',
                          ].map((option) => (
                            <option key={option} value={option}>
                              {formatValue(option)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="self-resident-field">
                        {copy.recentFalls}
                        <select
                          className={selectPlaceholderClass(resident.recentFalls)}
                          value={resident.recentFalls}
                          onChange={(event) => updateResident('recentFalls', event.target.value)}
                        >
                          <option value="">{copy.recentFallsPlaceholder}</option>
                          {['No recent falls', 'One fall in last 12 months', 'Two or more falls', 'Near misses / fear of falling'].map(
                            (option) => (
                              <option key={option} value={option}>
                                {formatValue(option)}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                      <label className="self-resident-field">
                        {copy.livesWith}
                        <select
                          className={selectPlaceholderClass(resident.livesWith)}
                          value={resident.livesWith}
                          onChange={(event) => updateResident('livesWith', event.target.value)}
                        >
                          <option value="">{copy.livesWithPlaceholder}</option>
                          {['Alone', 'Partner', 'Family', 'Carer support', 'Other'].map((option) => (
                            <option key={option} value={option}>
                              {formatValue(option)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="self-resident-field">
                        {copy.memory}
                        <select
                          className={selectPlaceholderClass(resident.cognitiveConcerns)}
                          value={resident.cognitiveConcerns}
                          onChange={(event) => updateResident('cognitiveConcerns', event.target.value)}
                        >
                          <option value="">{copy.memoryPlaceholder}</option>
                          {['None known', 'Mild forgetfulness', 'Dementia / confusion', 'Not sure'].map((option) => (
                            <option key={option} value={option}>
                              {formatValue(option)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </section>
                </div>

                <div className="self-resident-checks">
                  <ResidentCheckGroup
                    formatOption={formatValue}
                    label={isSpanish ? 'Ayudas y equipo' : 'Aids and equipment'}
                    options={mobilityAidOptions}
                    selected={resident.mobilityAids}
                    onToggle={(value) => toggleResidentValue('mobilityAids', value)}
                  />
                  <ResidentCheckGroup
                    formatOption={formatValue}
                    label={isSpanish ? 'Momentos de ayuda' : 'Help moments'}
                    options={transferNeedOptions}
                    selected={resident.transferNeeds}
                    onToggle={(value) => toggleResidentValue('transferNeeds', value)}
                  />
                  <ResidentCheckGroup
                    formatOption={formatValue}
                    label={isSpanish ? 'Visión, audición o equilibrio' : 'Vision, hearing, or balance'}
                    options={visionHearingOptions}
                    selected={resident.visionHearing}
                    onToggle={(value) => toggleResidentValue('visionHearing', value)}
                  />
                  <ResidentCheckGroup
                    formatOption={formatValue}
                    label={isSpanish ? 'Prioridades del día' : 'Daily priorities'}
                    options={dailyPriorityOptions}
                    selected={resident.dailyPriorities}
                    onToggle={(value) => toggleResidentValue('dailyPriorities', value)}
                  />
                </div>

                <div className="self-room-actions self-modal-actions">
                  <button className="btn btn-white" type="button" onClick={() => setModalStep(0)}>
                    <ChevronLeft size={18} aria-hidden="true" />
                    {copy.steps[0]}
                  </button>
                  <button className="btn btn-navy" type="button" onClick={() => setModalStep(2)}>
                    {copy.steps[2]}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </section>
              ) : null}

              {modalStep === 2 ? (
              <article className="self-room-card">
              <div className="self-room-card-header">
                <div>
                  <p className="eyebrow">{copy.currentRoom}</p>
                  <h3>{activeRoom.title}</h3>
                  <p>{activeRoom.intro}</p>
                </div>
                <span className={currentRoomComplete ? 'is-complete' : ''}>
                  {currentRoomAnswered}/{activeRoom.questions.length}
                </span>
              </div>

              {activeRoom.id === 'bathroom' || activeRoom.id === 'bedroom' ? (
                <div className="self-room-context-fields">
                  {activeRoom.id === 'bathroom' ? (
                    <label className="self-resident-field">
                      {copy.bathrooms}
                      <select
                        className={selectPlaceholderClass(resident.bathrooms)}
                        value={resident.bathrooms}
                        onChange={(event) => updateResident('bathrooms', event.target.value)}
                      >
                        <option value="">{copy.bathroomsPlaceholder}</option>
                        {['1 bathroom', '2 bathrooms', '3+ bathrooms'].map((option) => (
                          <option key={option} value={option}>
                            {formatValue(option)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  {activeRoom.id === 'bedroom' ? (
                    <label className="self-resident-field">
                      {copy.bedrooms}
                      <select
                        className={selectPlaceholderClass(resident.bedrooms)}
                        value={resident.bedrooms}
                        onChange={(event) => updateResident('bedrooms', event.target.value)}
                      >
                        <option value="">{copy.bedroomsPlaceholder}</option>
                        {['1 bedroom', '2 bedrooms', '3 bedrooms', '4+ bedrooms'].map((option) => (
                          <option key={option} value={option}>
                            {formatValue(option)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
              ) : null}

              <div className="self-question-list">
                {activeRoom.questions.map((question) => {
                  const answer = answers[question.id]
                  const questionPhotos = photos[question.id] ?? []
                  const showQuestionPhotos =
                    photoHelpfulQuestionIds.has(question.id) &&
                    (answer === 'risk' || answer === 'not-sure' || questionPhotos.length > 0)

                  return (
                    <fieldset className="self-question-card" key={question.id}>
                      <legend>
                        <span>{question.area}</span>
                        {question.prompt}
                      </legend>
                      <div className="self-answer-options">
                        <AnswerButton
                          active={answer === 'safe'}
                          label={copy.answerSafe}
                          onClick={() => answerQuestion(question.id, 'safe')}
                        />
                        <AnswerButton
                          active={answer === 'risk'}
                          label={copy.answerNeedsAttention}
                          onClick={() => answerQuestion(question.id, 'risk')}
                        />
                        <AnswerButton
                          active={answer === 'not-sure'}
                          label={copy.answerNotSure}
                          onClick={() => answerQuestion(question.id, 'not-sure')}
                        />
                      </div>
                      {answer === 'risk' || answer === 'not-sure' ? (
                        <p className="self-question-recommendation">{question.recommendation}</p>
                      ) : null}
                      {showQuestionPhotos ? (
                        <div className="self-question-photo-uploader">
                          <div className="self-question-photo-copy">
                            <Camera size={18} aria-hidden="true" />
                            <div>
                              <strong>{copy.questionPhotoTitle}</strong>
                              <span>{copy.questionPhotoHelp}</span>
                            </div>
                          </div>
                          <label className="self-upload-button">
                            <Upload size={16} aria-hidden="true" />
                            {copy.addQuestionPhoto}
                            <input accept="image/*" multiple type="file" onChange={(event) => addPhotos(question.id, event)} />
                          </label>
                          {questionPhotos.length > 0 ? (
                            <div className="self-question-photo-list">
                              {questionPhotos.map((photo) => (
                                <figure key={photo.id}>
                                  <img src={photo.url} alt="" />
                                  <figcaption>{photo.name}</figcaption>
                                  <button
                                    type="button"
                                    aria-label={`Remove ${photo.name}`}
                                    onClick={() => removePhoto(question.id, photo.id)}
                                  >
                                    <X size={13} aria-hidden="true" />
                                  </button>
                                </figure>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </fieldset>
                  )
                })}
              </div>

              <div className="self-room-evidence">
                <label>
                  <span>{copy.roomNotes}</span>
                  <textarea
                    placeholder={copy.roomNotesPlaceholder(activeRoom.title)}
                    value={notes[activeRoom.id] ?? ''}
                    onChange={(event) => updateRoomNote(activeRoom.id, event.target.value)}
                  />
                </label>

                <div className="self-photo-uploader">
                  <div className="self-photo-uploader-header">
                    <div>
                      <span>{copy.photos}</span>
                      <small>{copy.photosOptional}</small>
                    </div>
                    <label className="self-upload-button">
                      <Upload size={17} aria-hidden="true" />
                      {copy.addPhotos}
                      <input accept="image/*" multiple type="file" onChange={(event) => addPhotos(activeRoom.id, event)} />
                    </label>
                  </div>
                  <div className="self-photo-grid">
                    {(photos[activeRoom.id] ?? []).map((photo) => (
                      <figure key={photo.id}>
                        <img src={photo.url} alt="" />
                        <figcaption>{photo.name}</figcaption>
                        <button type="button" aria-label={`Remove ${photo.name}`} onClick={() => removePhoto(activeRoom.id, photo.id)}>
                          <X size={15} aria-hidden="true" />
                        </button>
                      </figure>
                    ))}
                    {(photos[activeRoom.id] ?? []).length === 0 ? (
                      <div className="self-photo-empty">
                        <Camera size={22} aria-hidden="true" />
                        <span>{copy.noPhotos}</span>
                        <small>{copy.addPhotosHelp}</small>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="self-room-actions">
                <button
                  className="btn btn-white"
                  type="button"
                  onClick={() => {
                    if (activeRoomIndex === 0) {
                      setModalStep(1)
                      return
                    }

                    goToRoom(activeRoomIndex - 1)
                  }}
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                  {activeRoomIndex === 0 ? copy.steps[1] : copy.previousRoom}
                </button>
                {activeRoomIndex < localizedRooms.length - 1 ? (
                  <button className="btn btn-navy" type="button" onClick={() => goToRoom(activeRoomIndex + 1)}>
                    {copy.nextRoom}
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                ) : (
                  <button className="btn btn-navy" type="button" onClick={generateReport}>
                    {copy.generateReport}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
              </article>
              ) : null}
            </div>

            {modalStep === 3 ? (
            <aside className="self-report-panel" ref={reportRef}>
              <div className="self-report-summary">
                <FileText size={24} aria-hidden="true" />
                <div>
                  <p className="eyebrow">{copy.reportPreview}</p>
                  <h3>{riskItems.length ? copy.toReview(riskItems.length) : copy.reportStatus}</h3>
                </div>
              </div>
              <div className="self-report-metrics">
                <Metric label={copy.highPriority} value={`${highPriorityCount}`} />
                <Metric label={copy.photos} value={`${photoCount}`} />
                <Metric label={copy.answerAnswered} value={`${completion}%`} />
              </div>
              {propertySummaryItems.length > 0 || residentSummaryItems.length > 0 || resident.mainConcern ? (
                <div className="self-report-resident">
                  <strong>{copy.reportContext}</strong>
                  {[...propertySummaryItems, ...residentSummaryItems].map((item) => (
                    <span key={item}>{formatValue(item)}</span>
                  ))}
                  {resident.mainConcern ? <p>{resident.mainConcern}</p> : null}
                </div>
              ) : null}
              <div className="self-report-list">
                {riskItems.slice(0, 6).map((item) => (
                  <article key={`${item.room}-${item.question}`}>
                    <strong>{item.room}</strong>
                    <p>{item.question}</p>
                    <small>{item.recommendation}</small>
                    {item.photoCount > 0 ? <em>{copy.attachedPhotos(item.photoCount)}</em> : null}
                  </article>
                ))}
                {riskItems.length === 0 ? (
                  <p className="self-report-placeholder">
                    {copy.reportEmpty}
                  </p>
                ) : null}
              </div>

              {!reportReady ? (
                <button className="btn btn-navy" type="button" onClick={generateReport}>
                  {copy.generateReport}
                  <ArrowRight size={19} aria-hidden="true" />
                </button>
              ) : null}

              {reportReady ? (
                <div className="self-submit-card">
                  <CheckCircle2 size={22} aria-hidden="true" />
                  <h4>{copy.reportReady}</h4>
                  <div className="self-contact-grid">
                    <label>
                      {copy.name}
                      <input value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} />
                    </label>
                    <label>
                      {copy.email}
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(event) => setContact({ ...contact, email: event.target.value })}
                      />
                    </label>
                    <PhoneNumberField
                      className="self-phone-field"
                      label={copy.phone}
                      value={contact.phone}
                      onChange={(phone) => setContact({ ...contact, phone })}
                    />
                  </div>
                  <label className="self-consent">
                    <input
                      checked={contact.consent}
                      type="checkbox"
                      onChange={(event) => setContact({ ...contact, consent: event.target.checked })}
                    />
                    <span>{copy.consent}</span>
                  </label>
                  {submitMessage ? <p className="self-submit-message">{submitMessage}</p> : null}
                  <div className="self-submit-actions">
                    <button className="btn btn-navy" type="button" disabled={isSubmitting} onClick={submitReport}>
                      {isSubmitting ? copy.submitSending : copy.submit}
                      <Mail size={18} aria-hidden="true" />
                    </button>
                    <a
                      className="btn btn-white"
                      href={`mailto:hola@casamia.com.es?subject=${encodeURIComponent(
                        isSpanish ? 'Seguimiento de autoinspección' : 'Self-inspection follow-up',
                      )}&body=${encodeURIComponent(
                        isSpanish
                          ? `Hola CasaMia, he completado la autoinspección. Hay ${riskItems.length} puntos por revisar.`
                          : `Hello CasaMia, I completed the self-inspection survey. ${riskItems.length} items need review.`,
                      )}`}
                    >
                      {copy.emailCasaMia}
                      <MessageCircle size={18} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ) : null}
            </aside>
            ) : null}
          </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function AnswerButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button className={active ? 'is-active' : ''} type="button" onClick={onClick}>
      {label}
    </button>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function ResidentCheckGroup({
  formatOption = (value: string) => value,
  label,
  onToggle,
  options,
  selected,
}: {
  formatOption?: (value: string) => string
  label: string
  onToggle: (value: string) => void
  options: string[]
  selected: string[]
}) {
  return (
    <fieldset className="self-resident-check-group">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <label className={selected.includes(option) ? 'is-selected' : ''} key={option}>
            <input checked={selected.includes(option)} type="checkbox" onChange={() => onToggle(option)} />
            <span>{formatOption(option)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
