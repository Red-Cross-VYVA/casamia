import type {
  ClientNeed,
  ClientSiteCount,
  ClientType,
  BedroomCount,
  FloorCount,
  HomeType,
  MobilityLevel,
  StairsType,
  Urgency,
  WizardChallenge,
  WizardCallbackTimeWindow,
  WizardInputMethod,
  WizardRisk,
  WizardRoom,
  WizardUserType,
} from '../types/wizard'

type ChoiceCopy<T extends string> = Record<T, string>

export type WizardCopy = {
  entry: { eyebrow: string; title: string; body: string; start: string; time: string; resume: string }
  nav: { back: string; continue: string; skip: string; save: string; saved: string; startAgain: string }
  progress: { label: string; step: string; of: string }
  micro: { chooseOne: string; chooseAll: string; changeLater: string; optional: string; notSure: string }
  userType: { title: string; body: string; options: ChoiceCopy<WizardUserType> }
  methods: {
    title: string
    body: string
    options: ChoiceCopy<WizardInputMethod>
    descriptions: ChoiceCopy<WizardInputMethod>
  }
  homeType: { title: string; familyTitle: string; options: ChoiceCopy<HomeType> }
  floors: { title: string; familyTitle: string; options: ChoiceCopy<FloorCount> }
  stairs: { title: string; familyTitle: string; options: ChoiceCopy<StairsType> }
  bedrooms: { title: string; familyTitle: string; options: ChoiceCopy<BedroomCount> }
  areas: {
    title: string
    familyTitle: string
    options: ChoiceCopy<WizardRoom>
    viewPackage: string
    viewAll: string
    packageTitle: string
    allOptionsTitle: string
    catalogueEyebrow: string
    packageIntro: string
    currentOptions: string
    includes: string
    emptyPackage: string
    close: string
  }
  mobility: { title: string; options: ChoiceCopy<MobilityLevel> }
  challenges: { title: string; options: ChoiceCopy<WizardChallenge> }
  risks: { title: string; familyTitle: string; options: ChoiceCopy<WizardRisk> }
  urgency: { title: string; options: ChoiceCopy<Urgency> }
  notes: { title: string; body: string; placeholder: string }
  client: {
    typeTitle: string
    siteTitle: string
    needTitle: string
    locationTitle: string
    locationPlaceholder: string
    types: ChoiceCopy<ClientType>
    sites: ChoiceCopy<ClientSiteCount>
    needs: ChoiceCopy<ClientNeed>
  }
  photos: {
    title: string
    body: string
    add: string
    remove: string
    room: string
    empty: string
    rules: string
    image: string
    video: string
    otherRoom: string
    detectingRoom: string
    roomDetected: string
    roomSuggested: string
    chooseRoom: string
    analysingPhoto: string
    analysedPhoto: string
    analysisUnavailable: string
    analysisUnavailableTitle: string
    analysisUnavailableBody: string
    retryAnalysis: string
    retryAll: string
    continueWithoutAnalysis: string
    analysisErrors: {
      invalid: string
      notConfigured: string
      rateLimited: string
      timedOut: string
      unavailable: string
    }
    findingsFound: (count: number) => string
    count: (count: number) => string
    errors: {
      unsupported: (name: string) => string
      imageTooLarge: (name: string) => string
      videoTooLarge: (name: string) => string
      tooManyFiles: string
      tooManyVideos: string
      totalTooLarge: string
    }
  }
  voice: {
    title: string
    body: string
    assistant: string
    start: string
    restart: string
    stop: string
    mute: string
    unmute: string
    connecting: string
    ending: string
    listening: string
    speaking: string
    muted: string
    saved: string
    clear: string
    unsupported: string
    permission: string
    error: string
    privacy: string
    transcript: string
    agentLabel: string
    userLabel: string
    fallback: string
  }
  audio: {
    title: string
    body: string
    add: string
    record: string
    stop: string
    recording: string
    remove: string
    empty: string
    rules: string
    unsupportedRecorder: string
    permission: string
    count: (count: number) => string
    errors: {
      unsupported: (name: string) => string
      tooLarge: (name: string) => string
      tooMany: string
      totalTooLarge: string
      recordingFailed: string
    }
  }
  callback: {
    title: string
    body: string
    name: string
    phone: string
    phoneHelp: string
    email: string
    optional: string
    cityArea: string
    preferredDate: string
    preferredTime: string
    note: string
    notePlaceholder: string
    consent: string
    privacy: string
    submit: string
    submitting: string
    required: string
    invalidPhone: string
    invalidEmail: string
    futureDate: string
    noTimesToday: string
    tooFarDate: string
    timeUnavailable: string
    error: string
    timeWindows: ChoiceCopy<WizardCallbackTimeWindow>
    confirmation: {
      title: string
      body: string
      confirmed: string
      reference: string
      phone: string
      date: string
      time: string
      reassurance: string
      requestAnother: string
      home: string
    }
  }
  phone: { title: string; body: string; call: string; whatsapp: string; email: string; reference: string; unavailable: string }
  visit: {
    title: string
    price: string
    body: string
    credit: string
    example: string
    book: string
    without: string
    selected: string
  }
  contact: {
    title: string
    body: string
    name: string
    phone: string
    email: string
    city: string
    method: string
    consent: string
    privacy: string
    phoneOrEmail: string
    invalidEmail: string
    required: string
    detect: string
    detecting: string
    detected: string
    detectError: string
  }
  result: {
    title: string
    profile: string
    recommendedPlan: string
    improvements: string
    estimated: string
    priceDisclaimer: string
    immediate: string
    recommended: string
    optional: string
    profiles: Record<string, string>
    plans: Record<string, string>
    confidence: Record<string, string>
    bookVisit: string
    requestProposal: string
    speak: string
    business: string
    email: string
    recommendationNote: string
    packagesTitle: string
    packagesBody: string
    packageRecommended: string
    packageSelected: string
    packageDetails: string
    packageHide: string
    packageChoose: string
    packageIncludes: string
    packageManagement: string
    grantTitle: string
    grantBody: string
    grantIncluded: string
    grantCaveat: string
    grantLink: string
  }
  submit: { sending: string; success: string; error: string }
}

const en: WizardCopy = {
  entry: {
    eyebrow: 'CasaMia guided plan',
    title: "Let's make your home safer",
    body: 'Answer a few questions, add photos or videos, or tell us in your own words.',
    start: 'Start',
    time: 'Most people finish in under 3 minutes.',
    resume: 'Continue saved plan',
  },
  nav: { back: 'Back', continue: 'Continue', skip: 'Skip', save: 'Save for later', saved: 'Saved on this device', startAgain: 'Start again' },
  progress: { label: 'Wizard progress', step: 'Step', of: 'of' },
  micro: { chooseOne: 'Choose one', chooseAll: 'Choose all that apply', changeLater: 'You can change this later', optional: 'You can skip this', notSure: "Not sure? That's okay" },
  userType: { title: 'Who is this for?', body: 'We will adapt the questions to you.', options: { me: 'Me', family: 'Family', client: 'My facility or business' } },
  methods: {
    title: 'Choose your preferred channel',
    body: 'Start in the way that feels easiest. You can still add photos or videos later if helpful.',
    options: { questions: 'Answer a few questions', audio: 'Send an audio', voice: 'Talk to Jo', call: 'Call us', whatsapp: 'WhatsApp', callback: 'We call you', photos: 'Photos or videos', visit: 'Schedule visit' },
    descriptions: { questions: 'Guided online form', audio: 'Record or upload a short brief', voice: 'AI agent', call: 'Answer a few questions by phone', whatsapp: 'Message us on WhatsApp', callback: 'Choose a convenient time', photos: 'Upload photos or short videos', visit: 'Book a home visit' },
  },
  homeType: { title: 'What kind of home is it?', familyTitle: 'What kind of home do they live in?', options: { apartment: 'Apartment', house: 'House', villa: 'Villa', other: 'Other' } },
  floors: { title: 'How many floors?', familyTitle: 'How many floors does their home have?', options: { one: 'One', two: 'Two', 'three-plus': 'Three+' } },
  stairs: { title: 'Where are the steps or stairs?', familyTitle: 'Where are their steps or stairs?', options: { none: 'None', inside: 'Inside', outside: 'Outside', both: 'Both' } },
  bedrooms: { title: 'How many bedrooms?', familyTitle: 'How many bedrooms are in their home?', options: { studio: 'Studio', one: '1 bedroom', two: '2 bedrooms', 'three-plus': '3+ bedrooms' } },
  areas: {
    title: 'Where would you like more confidence?',
    familyTitle: 'Which areas worry you most?',
    options: { bathroom: 'Bathroom', bedroom: 'Bedroom', kitchen: 'Kitchen', 'living-room': 'Living room', stairs: 'Stairs', entrance: 'Entrance', outdoor: 'Outdoor', lighting: 'Lighting', 'smart-safety': 'Smart safety', 'not-sure': 'Not sure' },
    viewPackage: "View what's included",
    viewAll: 'Browse all options',
    packageTitle: 'current options',
    allOptionsTitle: 'All current options',
    catalogueEyebrow: 'CasaMia service catalogue',
    packageIntro: 'These are the current active services from our catalogue. Your final package will be tailored after we review the home.',
    currentOptions: 'active options',
    includes: 'Includes',
    emptyPackage: 'No options are listed for this area yet. You can still select it and we will review it with you.',
    close: 'Close',
  },
  mobility: { title: 'What support is used day to day?', options: { independent: 'Independent', cane: 'Cane', walker: 'Walker', wheelchair: 'Wheelchair', assistance: 'Assistance', 'prefer-not': 'Prefer not to say' } },
  challenges: { title: 'What feels most difficult?', options: { falls: 'Falls', balance: 'Balance', vision: 'Vision', strength: 'Strength', memory: 'Memory', arthritis: 'Arthritis', 'night-movement': 'Night movement', 'emergency-support': 'Emergency support', 'general-prevention': 'Prevention', other: 'Other' } },
  risks: { title: 'What have you noticed at home?', familyTitle: 'What have you noticed in their home?', options: { 'slippery-floors': 'Slippery floors', 'poor-lighting': 'Poor lighting', 'loose-rugs': 'Loose rugs', 'difficult-stairs': 'Difficult stairs', 'high-thresholds': 'High thresholds', 'hard-to-reach-storage': 'Hard-to-reach storage', 'unsafe-bathroom': 'Unsafe bathroom', 'no-emergency-alert': 'No emergency alert', 'not-sure': 'Not sure' } },
  urgency: { title: 'When would you like to act?', options: { planning: 'Planning', soon: 'Soon', urgent: 'Urgent' } },
  notes: { title: 'Anything else we should know?', body: 'A short note is enough.', placeholder: 'Tell us what feels difficult, unsafe or worrying...' },
  client: {
    typeTitle: 'What type of organisation?', siteTitle: 'How many properties or sites?', needTitle: 'What do you need most?', locationTitle: 'Where do you need support?', locationPlaceholder: 'City, region or service area',
    types: { 'care-provider': 'Care provider', 'property-manager': 'Property manager', clinic: 'Clinic', hospital: 'Hospital', residence: 'Residence', business: 'Business', 'public-body': 'Public body', other: 'Other' },
    sites: { one: 'One', '2-5': '2-5', '6-20': '6-20', '20-plus': '20+' },
    needs: { 'safety-audits': 'Safety audits', 'home-adaptations': 'Home adaptations', 'smart-safety': 'Smart safety', 'staff-support': 'Staff support', accessibility: 'Accessibility', 'portfolio-review': 'Portfolio review', other: 'Other' },
  },
  photos: {
    title: 'Show us the home',
    body: "Photos and short videos help us understand the space. Upload only what you're comfortable sharing.",
    add: 'Add photos or videos',
    remove: 'Remove file',
    room: 'Room',
    empty: 'No photos or videos added yet',
    rules: 'JPG, PNG, WebP, MP4, WebM or MOV. Up to 8 files, including 3 videos. Images up to 8 MB, videos up to 50 MB, 100 MB total. Photos are checked securely to suggest a room; files upload privately when you submit.',
    image: 'Photo',
    video: 'Video',
    otherRoom: 'Other',
    detectingRoom: 'Detecting room...',
    roomDetected: 'Room detected from photo',
    roomSuggested: 'Room suggested from file name',
    chooseRoom: 'Choose the room',
    analysingPhoto: 'Checking visible safety details...',
    analysedPhoto: 'Safety review complete',
    analysisUnavailable: 'Visual review unavailable',
    analysisUnavailableTitle: 'Some photos still need analysis',
    analysisUnavailableBody: 'Your photos are saved. Retry the visual review before continuing, or explicitly continue without photo evidence.',
    retryAnalysis: 'Retry analysis',
    retryAll: 'Retry all photos',
    continueWithoutAnalysis: 'Continue without photo analysis',
    analysisErrors: {
      invalid: 'This image could not be checked. Try a clear JPG, PNG or WebP photo.',
      notConfigured: 'CasaMia visual analysis is not available in this environment yet.',
      rateLimited: 'The visual review service is busy. Please retry in a moment.',
      timedOut: 'The visual review took too long. Please retry this photo.',
      unavailable: 'The visual review could not run. Your photo is saved; please retry.',
    },
    findingsFound: (count) => `${count} visible ${count === 1 ? 'finding' : 'findings'}`,
    count: (count) => `${count} of 8 files added`,
    errors: {
      unsupported: (name) => `${name} is not a supported photo or video format.`,
      imageTooLarge: (name) => `${name} is larger than the 8 MB image limit.`,
      videoTooLarge: (name) => `${name} is larger than the 50 MB video limit.`,
      tooManyFiles: 'You can add up to 8 files.',
      tooManyVideos: 'You can add up to 3 videos.',
      totalTooLarge: 'The selected files would exceed the 100 MB total limit.',
    },
  },
  voice: {
    title: 'Talk to Jo',
    body: 'Have a natural conversation with Jo, CasaMia’s AI assistant. Explain what feels difficult, unsafe or worrying.',
    assistant: 'Jo, CasaMia AI agent',
    start: 'Talk to Jo',
    restart: 'Start another conversation',
    stop: 'End conversation',
    mute: 'Mute microphone',
    unmute: 'Unmute microphone',
    connecting: 'Connecting securely…',
    ending: 'Ending conversation…',
    listening: 'Listening to you',
    speaking: 'Jo is speaking',
    muted: 'Microphone muted',
    saved: 'Conversation saved',
    clear: 'Clear conversation',
    unsupported: 'Live voice conversation is not supported on this device. You can type a note instead.',
    permission: 'Microphone access is needed to start. Allow access in your browser, then try again.',
    error: 'The voice assistant could not connect. Try again or type a note below.',
    privacy: 'By starting, you allow microphone access and ElevenLabs to process the audio for this home-safety conversation. You can stop at any time.',
    transcript: 'Conversation transcript',
    agentLabel: 'Jo',
    userLabel: 'You',
    fallback: 'Prefer to type? Add a note',
  },
  audio: {
    title: 'Send an audio',
    body: 'Record or upload a short voice note. Tell us what feels difficult, unsafe or worrying.',
    add: 'Upload audio',
    record: 'Record audio',
    stop: 'Stop recording',
    recording: 'Recording…',
    remove: 'Remove audio',
    empty: 'No audio added yet',
    rules: 'MP3, M4A, WAV, OGG, WebM or AAC. Up to 2 audio files, 25 MB each.',
    unsupportedRecorder: 'Recording is not supported on this device. You can upload an audio file or type a note instead.',
    permission: 'Microphone access is needed to record. Allow access in your browser, then try again.',
    count: (count) => `${count} of 2 audio files added`,
    errors: {
      unsupported: (name) => `${name} is not a supported audio format.`,
      tooLarge: (name) => `${name} is larger than the 25 MB audio limit.`,
      tooMany: 'You can add up to 2 audio files.',
      totalTooLarge: 'The selected audio files would exceed the total limit.',
      recordingFailed: 'We could not save that recording. Please try again or upload an audio file.',
    },
  },
  callback: {
    title: 'When should CasaMia call you?',
    body: "Leave your contact details and choose a convenient time. We'll call you back without asking you to complete the assessment.",
    name: 'Full name',
    phone: 'Phone number',
    phoneHelp: 'Enter a Spanish mobile or landline number.',
    email: 'Email',
    optional: 'Optional',
    cityArea: 'City / area',
    preferredDate: 'Preferred day',
    preferredTime: 'Preferred time',
    note: 'Anything we should know?',
    notePlaceholder: 'For example: bathroom safety, access needs, or the best person to speak with…',
    consent: 'I agree that CasaMia may contact me about this callback request.',
    privacy: 'We use these details only to arrange your call and help with your request. We never sell your data.',
    submit: 'Ask CasaMia to call me',
    submitting: 'Requesting your callback…',
    required: 'This field is required.',
    invalidPhone: 'Enter a valid Spanish phone number.',
    invalidEmail: 'Enter a valid email address.',
    futureDate: 'Choose today or a future date.',
    noTimesToday: 'No callback times remain today. Choose another day.',
    tooFarDate: 'Choose a date within the next 90 days.',
    timeUnavailable: 'Choose a time that has not already passed.',
    error: "We couldn't request your callback. Your details are still here—please try again.",
    timeWindows: {
      '09:00-12:00': 'Morning · 09:00–12:00',
      '12:00-15:00': 'Midday · 12:00–15:00',
      '15:00-18:00': 'Afternoon · 15:00–18:00',
      '18:00-20:00': 'Evening · 18:00–20:00',
      flexible: 'Any time',
    },
    confirmation: {
      title: "We'll call you",
      body: 'Your request is with CasaMia. You do not need to complete the rest of the assessment.',
      confirmed: 'Callback requested',
      reference: 'Request reference',
      phone: 'Number we will call',
      date: 'Preferred day',
      time: 'Preferred time',
      reassurance: 'We will only use these details to arrange your call and help with your request.',
      requestAnother: 'Request another callback',
      home: 'Return to CasaMia',
    },
  },
  phone: { title: 'Prefer to speak with us?', body: 'We can complete the assessment with you by phone.', call: 'Call CasaMia', whatsapp: 'WhatsApp', email: 'Email CasaMia', reference: 'Your reference', unavailable: 'Our phone line is being configured. Continue and choose Phone or WhatsApp as your preferred contact.' },
  visit: { title: 'Professional home safety visit', price: '99 EUR', body: 'A CasaMia professional reviews the home room by room.', credit: 'The 99 EUR fee is deducted from approved CasaMia work above 300 EUR.', example: 'Example: on a 650 EUR project, 551 EUR remains after the visit credit.', book: 'Book visit', without: 'Continue without visit', selected: 'Visit selected' },
  contact: { title: 'Where should we send your plan?', body: 'Last step. We only need enough to help.', name: 'Full name', phone: 'Phone', email: 'Email', city: 'City / area', method: 'Preferred contact', consent: 'I agree to be contacted by CasaMia about my home safety plan.', privacy: 'We use this only to prepare your plan and contact you. We never sell your data.', phoneOrEmail: 'Add a phone number or email.', invalidEmail: 'Enter a valid email address.', required: 'This field is required.', detect: 'Detect', detecting: 'Finding...', detected: 'Location added', detectError: "We couldn't detect your city. Enter it manually." },
  result: {
    title: 'Your personalised home safety plan', profile: 'Safety profile', recommendedPlan: 'Recommended starting point', improvements: 'Your priority actions', estimated: 'Live catalogue estimate', priceDisclaimer: 'A conservative starting estimate using the lowest-priced active option for each relevant area. Your final scope is confirmed after reviewing the home.', immediate: 'Immediate', recommended: 'Recommended', optional: 'Optional',
    profiles: { prevention: 'Prevention focused', moderate: 'Moderate safety needs', 'high-priority': 'High-priority improvements', 'smart-safety': 'Smart safety recommended', business: 'Business support' },
    plans: { assessment: 'Home Assessment Plan', 'home-safety': 'Home Safety Plan', 'smart-safety': 'Smart Safety Plan', 'business-consultation': 'Business consultation' },
    confidence: { early: 'Based on the information provided, this is an early estimate.', supported: 'We used your answers and supporting information to improve this estimate.', inspection: 'Your on-site inspection will confirm the final recommendations and quotation.' },
    bookVisit: 'Book home visit', requestProposal: 'Request proposal', speak: 'Speak to CasaMia', business: 'Book business consultation', email: 'Email my plan',
    recommendationNote: 'Recommended from your answers. Compare every option below.', packagesTitle: 'Choose how CasaMia helps', packagesBody: 'Each plan has clear deliverables. Open a card to see exactly what is included.', packageRecommended: 'Recommended for you', packageSelected: 'Selected', packageDetails: 'View deliverables', packageHide: 'Hide deliverables', packageChoose: 'Choose this plan', packageIncludes: 'Included deliverables', packageManagement: 'CasaMia management included', grantTitle: 'Could your project qualify for a grant?', grantBody: 'CasaMia checks possible support and manages the grant process when applicable.', grantIncluded: 'Grant management is included in the displayed service price.', grantCaveat: 'Approval and the final amount are decided by the relevant authority.', grantLink: 'Check grant eligibility',
  },
  submit: { sending: 'Uploading and sending...', success: 'Your request has been sent. CasaMia will contact you shortly.', error: 'We could not send this yet. Your answers are saved; keep this page open to retry the selected files.' },
}

const es: WizardCopy = {
  entry: { eyebrow: 'Plan guiado CasaMia', title: 'Hagamos tu hogar más seguro', body: 'Responde unas preguntas, añade fotos o vídeos, o cuéntanoslo con tus propias palabras.', start: 'Empezar', time: 'La mayoría termina en menos de 3 minutos.', resume: 'Continuar plan guardado' },
  nav: { back: 'Atrás', continue: 'Continuar', skip: 'Omitir', save: 'Guardar para después', saved: 'Guardado en este dispositivo', startAgain: 'Empezar de nuevo' },
  progress: { label: 'Progreso del asistente', step: 'Paso', of: 'de' },
  micro: { chooseOne: 'Elige una opción', chooseAll: 'Elige todas las que correspondan', changeLater: 'Podrás cambiarlo después', optional: 'Puedes omitir este paso', notSure: '¿No lo sabes? No pasa nada' },
  userType: { title: '¿Para quién es?', body: 'Adaptaremos las preguntas a tu situación.', options: { me: 'Para mí', family: 'Familiar', client: 'Mi centro o negocio' } },
  methods: { title: 'Elige tu canal preferido', body: 'Empieza de la forma que te resulte más cómoda. Si ayuda, podrás añadir fotos o vídeos después.', options: { questions: 'Responder unas preguntas', audio: 'Enviar un audio', voice: 'Hablar con Jo', call: 'Llámanos', whatsapp: 'WhatsApp', callback: 'Te llamamos', photos: 'Fotos o vídeos', visit: 'Programar visita' }, descriptions: { questions: 'Formulario online guiado', audio: 'Graba o sube una nota breve', voice: 'Agente con IA', call: 'Responde unas preguntas por teléfono', whatsapp: 'Escríbenos por WhatsApp', callback: 'Elige el día y la franja horaria', photos: 'Sube fotos o vídeos cortos', visit: 'Reservar una visita a domicilio' } },
  homeType: { title: '¿Qué tipo de vivienda es?', familyTitle: '¿En qué tipo de vivienda vive?', options: { apartment: 'Piso', house: 'Casa', villa: 'Chalet', other: 'Otra' } },
  floors: { title: '¿Cuántas plantas tiene?', familyTitle: '¿Cuántas plantas tiene su vivienda?', options: { one: 'Una', two: 'Dos', 'three-plus': 'Tres+' } },
  stairs: { title: '¿Dónde hay escalones o escaleras?', familyTitle: '¿Dónde tiene escalones o escaleras?', options: { none: 'Ninguno', inside: 'Interior', outside: 'Exterior', both: 'Ambos' } },
  bedrooms: { title: '¿Cuántos dormitorios tiene?', familyTitle: '¿Cuántos dormitorios tiene su vivienda?', options: { studio: 'Estudio', one: '1 dormitorio', two: '2 dormitorios', 'three-plus': '3+ dormitorios' } },
  areas: {
    title: '¿Dónde quieres sentirte más seguro?',
    familyTitle: '¿Qué zonas te preocupan más?',
    options: { bathroom: 'Baño', bedroom: 'Dormitorio', kitchen: 'Cocina', 'living-room': 'Salón', stairs: 'Escaleras', entrance: 'Entrada', outdoor: 'Exterior', lighting: 'Iluminación', 'smart-safety': 'Seguridad inteligente', 'not-sure': 'No lo sé' },
    viewPackage: 'Ver qué incluye',
    viewAll: 'Ver todas las opciones',
    packageTitle: 'opciones actuales',
    allOptionsTitle: 'Todas las opciones actuales',
    catalogueEyebrow: 'Catálogo de servicios CasaMia',
    packageIntro: 'Estas son las opciones activas de nuestro catálogo. Adaptaremos el paquete final después de revisar la vivienda.',
    currentOptions: 'opciones activas',
    includes: 'Incluye',
    emptyPackage: 'Todavía no hay opciones publicadas para esta zona. Puedes seleccionarla igualmente y la revisaremos contigo.',
    close: 'Cerrar',
  },
  mobility: { title: '¿Qué apoyo utiliza a diario?', options: { independent: 'Independiente', cane: 'Bastón', walker: 'Andador', wheelchair: 'Silla de ruedas', assistance: 'Ayuda de otra persona', 'prefer-not': 'Prefiero no decirlo' } },
  challenges: { title: '¿Qué resulta más difícil?', options: { falls: 'Caídas', balance: 'Equilibrio', vision: 'Visión', strength: 'Fuerza', memory: 'Memoria', arthritis: 'Artritis', 'night-movement': 'Moverse de noche', 'emergency-support': 'Ayuda en emergencias', 'general-prevention': 'Prevención', other: 'Otro' } },
  risks: { title: '¿Qué has observado en casa?', familyTitle: '¿Qué has observado en su casa?', options: { 'slippery-floors': 'Suelos resbaladizos', 'poor-lighting': 'Poca luz', 'loose-rugs': 'Alfombras sueltas', 'difficult-stairs': 'Escaleras difíciles', 'high-thresholds': 'Umbrales altos', 'hard-to-reach-storage': 'Almacenamiento difícil', 'unsafe-bathroom': 'Baño inseguro', 'no-emergency-alert': 'Sin alerta de emergencia', 'not-sure': 'No lo sé' } },
  urgency: { title: '¿Cuándo quieres actuar?', options: { planning: 'Estoy planificando', soon: 'Pronto', urgent: 'Urgente' } },
  notes: { title: '¿Hay algo más que debamos saber?', body: 'Una nota breve es suficiente.', placeholder: 'Cuéntanos qué resulta difícil, inseguro o preocupante...' },
  client: { typeTitle: '¿Qué tipo de organización?', siteTitle: '¿Cuántos centros o inmuebles?', needTitle: '¿Qué necesitáis principalmente?', locationTitle: '¿Dónde necesitáis el servicio?', locationPlaceholder: 'Ciudad, región o zona de servicio', types: { 'care-provider': 'Proveedor de cuidados', 'property-manager': 'Gestor inmobiliario', clinic: 'Clínica', hospital: 'Hospital', residence: 'Residencia', business: 'Empresa', 'public-body': 'Organismo público', other: 'Otro' }, sites: { one: 'Uno', '2-5': '2-5', '6-20': '6-20', '20-plus': '20+' }, needs: { 'safety-audits': 'Auditorías de seguridad', 'home-adaptations': 'Adaptaciones del hogar', 'smart-safety': 'Seguridad inteligente', 'staff-support': 'Apoyo al personal', accessibility: 'Accesibilidad', 'portfolio-review': 'Revisión de cartera', other: 'Otro' } },
  photos: {
    title: 'Muéstranos la vivienda',
    body: 'Las fotos y los vídeos cortos nos ayudan a entender el espacio. Sube solo lo que quieras compartir.',
    add: 'Añadir fotos o vídeos',
    remove: 'Eliminar archivo',
    room: 'Zona',
    empty: 'Aún no has añadido fotos ni vídeos',
    rules: 'JPG, PNG, WebP, MP4, WebM o MOV. Hasta 8 archivos, incluidos 3 vídeos. Imágenes de hasta 8 MB, vídeos de hasta 50 MB y 100 MB en total. Analizamos la foto de forma segura para sugerir la zona; los archivos se suben de forma privada al enviar.',
    image: 'Foto',
    video: 'Vídeo',
    otherRoom: 'Otra',
    detectingRoom: 'Detectando zona...',
    roomDetected: 'Zona detectada en la foto',
    roomSuggested: 'Zona sugerida por el nombre',
    chooseRoom: 'Elige la zona',
    analysingPhoto: 'Revisando detalles visibles de seguridad...',
    analysedPhoto: 'Revisión de seguridad completada',
    analysisUnavailable: 'Revisión visual no disponible',
    analysisUnavailableTitle: 'Aún quedan fotos por analizar',
    analysisUnavailableBody: 'Tus fotos están guardadas. Reintenta el análisis antes de continuar o elige expresamente seguir sin evidencia visual.',
    retryAnalysis: 'Reintentar análisis',
    retryAll: 'Reintentar todas',
    continueWithoutAnalysis: 'Continuar sin analizar las fotos',
    analysisErrors: {
      invalid: 'No hemos podido revisar esta imagen. Prueba con una foto clara en JPG, PNG o WebP.',
      notConfigured: 'El análisis visual de CasaMia todavía no está disponible en este entorno.',
      rateLimited: 'El servicio de revisión está ocupado. Reinténtalo dentro de un momento.',
      timedOut: 'La revisión ha tardado demasiado. Reintenta esta foto.',
      unavailable: 'No se ha podido ejecutar la revisión visual. La foto está guardada; reinténtalo.',
    },
    findingsFound: (count) => `${count} ${count === 1 ? 'hallazgo visible' : 'hallazgos visibles'}`,
    count: (count) => `${count} de 8 archivos añadidos`,
    errors: {
      unsupported: (name) => `${name} no tiene un formato de foto o vídeo compatible.`,
      imageTooLarge: (name) => `${name} supera el límite de 8 MB para imágenes.`,
      videoTooLarge: (name) => `${name} supera el límite de 50 MB para vídeos.`,
      tooManyFiles: 'Puedes añadir hasta 8 archivos.',
      tooManyVideos: 'Puedes añadir hasta 3 vídeos.',
      totalTooLarge: 'Los archivos seleccionados superarían el límite total de 100 MB.',
    },
  },
  voice: {
    title: 'Habla con Jo',
    body: 'Habla con Jo, el asistente con IA de CasaMia. Explica con naturalidad qué resulta difícil, inseguro o preocupante.',
    assistant: 'Jo, agente con IA de CasaMia',
    start: 'Hablar con Jo',
    restart: 'Iniciar otra conversación',
    stop: 'Finalizar conversación',
    mute: 'Silenciar micrófono',
    unmute: 'Activar micrófono',
    connecting: 'Conectando de forma segura…',
    ending: 'Finalizando conversación…',
    listening: 'Te estamos escuchando',
    speaking: 'Jo está hablando',
    muted: 'Micrófono silenciado',
    saved: 'Conversación guardada',
    clear: 'Eliminar conversación',
    unsupported: 'Este dispositivo no permite una conversación de voz en directo. Puedes escribir una nota.',
    permission: 'Necesitamos acceso al micrófono para empezar. Permítelo en el navegador e inténtalo de nuevo.',
    error: 'No hemos podido conectar con el asistente de voz. Inténtalo de nuevo o escribe una nota abajo.',
    privacy: 'Al iniciar, permites el acceso al micrófono y que ElevenLabs procese el audio de esta conversación sobre seguridad en el hogar. Puedes finalizarla cuando quieras.',
    transcript: 'Transcripción de la conversación',
    agentLabel: 'Jo',
    userLabel: 'Tú',
    fallback: '¿Prefieres escribir? Añade una nota',
  },
  audio: {
    title: 'Enviar un audio',
    body: 'Graba o sube una nota de voz breve. Cuéntanos qué resulta difícil, inseguro o preocupante.',
    add: 'Subir audio',
    record: 'Grabar audio',
    stop: 'Detener grabación',
    recording: 'Grabando…',
    remove: 'Eliminar audio',
    empty: 'Aún no has añadido ningún audio',
    rules: 'MP3, M4A, WAV, OGG, WebM o AAC. Hasta 2 audios, 25 MB cada uno.',
    unsupportedRecorder: 'Este dispositivo no permite grabar audio. Puedes subir un archivo o escribir una nota.',
    permission: 'Necesitamos acceso al micrófono para grabar. Permítelo en el navegador e inténtalo de nuevo.',
    count: (count) => `${count} de 2 audios añadidos`,
    errors: {
      unsupported: (name) => `${name} no tiene un formato de audio compatible.`,
      tooLarge: (name) => `${name} supera el límite de 25 MB para audio.`,
      tooMany: 'Puedes añadir hasta 2 audios.',
      totalTooLarge: 'Los audios seleccionados superarían el límite total.',
      recordingFailed: 'No hemos podido guardar esa grabación. Inténtalo de nuevo o sube un audio.',
    },
  },
  callback: {
    title: '¿Cuándo quieres que te llamemos?',
    body: 'Déjanos tus datos de contacto y elige el momento que te venga mejor. Te llamaremos sin pedirte que completes la evaluación.',
    name: 'Nombre completo',
    phone: 'Número de teléfono',
    phoneHelp: 'Introduce un móvil o teléfono fijo de España.',
    email: 'Email',
    optional: 'Opcional',
    cityArea: 'Ciudad / zona',
    preferredDate: 'Día preferido',
    preferredTime: 'Hora preferida',
    note: '¿Hay algo que debamos saber?',
    notePlaceholder: 'Por ejemplo: seguridad del baño, necesidades de acceso o con quién debemos hablar…',
    consent: 'Acepto que CasaMia contacte conmigo sobre esta solicitud de llamada.',
    privacy: 'Solo usamos estos datos para organizar la llamada y ayudarte con tu solicitud. Nunca los vendemos.',
    submit: 'Pedir que CasaMia me llame',
    submitting: 'Solicitando la llamada…',
    required: 'Este campo es obligatorio.',
    invalidPhone: 'Introduce un número de teléfono español válido.',
    invalidEmail: 'Introduce un email válido.',
    futureDate: 'Elige hoy o una fecha futura.',
    noTimesToday: 'Ya no quedan horarios de llamada para hoy. Elige otro día.',
    tooFarDate: 'Elige una fecha dentro de los próximos 90 días.',
    timeUnavailable: 'Elige una franja horaria que todavía no haya terminado.',
    error: 'No hemos podido solicitar la llamada. Tus datos siguen aquí; inténtalo de nuevo.',
    timeWindows: {
      '09:00-12:00': 'Mañana · 09:00–12:00',
      '12:00-15:00': 'Mediodía · 12:00–15:00',
      '15:00-18:00': 'Tarde · 15:00–18:00',
      '18:00-20:00': 'Última hora · 18:00–20:00',
      flexible: 'Cualquier hora',
    },
    confirmation: {
      title: 'Te llamaremos',
      body: 'CasaMia ya tiene tu solicitud. No necesitas completar el resto de la evaluación.',
      confirmed: 'Llamada solicitada',
      reference: 'Referencia de la solicitud',
      phone: 'Número al que llamaremos',
      date: 'Día preferido',
      time: 'Hora preferida',
      reassurance: 'Solo usaremos estos datos para organizar la llamada y ayudarte con tu solicitud.',
      requestAnother: 'Solicitar otra llamada',
      home: 'Volver a CasaMia',
    },
  },
  phone: { title: '¿Prefieres hablar con nosotros?', body: 'Podemos completar la evaluación contigo por teléfono.', call: 'Llamar a CasaMia', whatsapp: 'WhatsApp', email: 'Escribir a CasaMia', reference: 'Tu referencia', unavailable: 'Estamos configurando la línea telefónica. Continúa y elige Teléfono o WhatsApp como contacto preferido.' },
  visit: { title: 'Visita profesional de seguridad', price: '99 EUR', body: 'Un profesional CasaMia revisará la vivienda estancia por estancia.', credit: 'Los 99 EUR se descuentan de trabajos CasaMia aprobados superiores a 300 EUR.', example: 'Ejemplo: en un proyecto de 650 EUR, quedarían 551 EUR tras aplicar el descuento.', book: 'Reservar visita', without: 'Continuar sin visita', selected: 'Visita seleccionada' },
  contact: { title: '¿Dónde enviamos tu plan?', body: 'Último paso. Solo pedimos lo necesario para ayudarte.', name: 'Nombre completo', phone: 'Teléfono', email: 'Email', city: 'Ciudad / zona', method: 'Contacto preferido', consent: 'Acepto que CasaMia contacte conmigo sobre mi plan de seguridad.', privacy: 'Solo usamos estos datos para preparar tu plan y contactarte. Nunca los vendemos.', phoneOrEmail: 'Añade un teléfono o email.', invalidEmail: 'Introduce un email válido.', required: 'Este campo es obligatorio.', detect: 'Detectar', detecting: 'Buscando...', detected: 'Ubicación añadida', detectError: 'No hemos podido detectar tu ciudad. Escríbela manualmente.' },
  result: { title: 'Tu plan personalizado de seguridad', profile: 'Perfil de seguridad', recommendedPlan: 'Punto de partida recomendado', improvements: 'Tus acciones prioritarias', estimated: 'Estimación del catálogo', priceDisclaimer: 'Estimación inicial conservadora basada en la opción activa de menor precio para cada zona relevante. Confirmaremos el alcance final después de revisar la vivienda.', immediate: 'Inmediato', recommended: 'Recomendado', optional: 'Opcional', profiles: { prevention: 'Enfoque preventivo', moderate: 'Necesidades moderadas', 'high-priority': 'Mejoras prioritarias', 'smart-safety': 'Seguridad inteligente recomendada', business: 'Soporte profesional' }, plans: { assessment: 'Plan de evaluación', 'home-safety': 'Plan de seguridad del hogar', 'smart-safety': 'Plan de seguridad inteligente', 'business-consultation': 'Consulta profesional' }, confidence: { early: 'Con la información facilitada, esta es una estimación inicial.', supported: 'Hemos usado tus respuestas y la información adicional para mejorar la estimación.', inspection: 'La visita confirmará las recomendaciones y el presupuesto final.' }, bookVisit: 'Reservar visita', requestProposal: 'Solicitar propuesta', speak: 'Hablar con CasaMia', business: 'Reservar consulta profesional', email: 'Enviar mi plan', recommendationNote: 'Recomendado según tus respuestas. Compara todas las opciones abajo.', packagesTitle: 'Elige cómo te ayuda CasaMia', packagesBody: 'Cada plan tiene entregables claros. Abre una tarjeta para ver todo lo incluido.', packageRecommended: 'Recomendado para ti', packageSelected: 'Seleccionado', packageDetails: 'Ver entregables', packageHide: 'Ocultar entregables', packageChoose: 'Elegir este plan', packageIncludes: 'Entregables incluidos', packageManagement: 'Gestión CasaMia incluida', grantTitle: '¿Tu proyecto puede recibir ayudas?', grantBody: 'CasaMia revisa posibles ayudas y gestiona la solicitud cuando corresponda.', grantIncluded: 'La gestión de ayudas está incluida en el precio del servicio mostrado.', grantCaveat: 'La administración competente decide la concesión y el importe final.', grantLink: 'Comprobar ayudas' },
  submit: { sending: 'Subiendo y enviando...', success: 'Solicitud enviada. CasaMia contactará contigo pronto.', error: 'No hemos podido enviarla todavía. Tus respuestas están guardadas; mantén esta página abierta para reintentar los archivos.' },
}

export function getWizardCopy(language: string): WizardCopy {
  return language.toLowerCase().startsWith('es') ? es : en
}
