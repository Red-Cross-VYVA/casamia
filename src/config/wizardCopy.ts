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
  nav: {
    back: string
    continue: string
    skip: string
    save: string
    saved: string
    saving: string
    saveError: string
    close: string
    startAgain: string
  }
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
    title: 'Find what to check first at home',
    body: 'Answer a few questions, add photos, or describe the difficult moment. You will get a clear room-by-room starting point.',
    start: 'Start',
    time: 'Most people finish in under 3 minutes.',
    resume: 'Continue saved plan',
  },
  nav: { back: 'Back', continue: 'Continue', skip: 'Skip', save: 'Auto-saved', saved: 'Saved', saving: 'Saving...', saveError: 'Saved locally', close: 'Back to website', startAgain: 'Start again' },
  progress: { label: 'Wizard progress', step: 'Step', of: 'of' },
  micro: { chooseOne: 'Choose one', chooseAll: 'Choose all that apply', changeLater: 'You can change this later', optional: 'You can skip this', notSure: "Not sure? That's okay" },
  userType: { title: 'Who is this home check for?', body: 'Choose the closest match so the questions fit the person, the home and the decision to make next.', options: { me: 'Me', family: 'Someone I help', client: 'My facility or business' } },
  methods: {
    title: 'How would you like to start?',
    body: 'Start with the easiest option now. You can add photos, notes or a visit later if the first answers are not enough.',
    options: { questions: 'Answer a few questions', audio: 'Send an audio', voice: 'Talk to Jo', call: 'Call us', whatsapp: 'WhatsApp', callback: 'We call you', photos: 'Photos or videos', visit: 'Schedule visit' },
    descriptions: { questions: 'Best for a first direction', audio: 'Explain the concern in your words', voice: 'Talk through the room or routine', call: 'Answer a few questions by phone', whatsapp: 'Message us when convenient', callback: 'Choose a convenient time', photos: 'Show the rooms or routes that worry you', visit: 'Measure and check the home in person' },
  },
  homeType: { title: 'What kind of home is it?', familyTitle: 'What kind of home is it?', options: { apartment: 'Apartment', house: 'House', villa: 'Villa', other: 'Other' } },
  floors: { title: 'How many floors?', familyTitle: 'How many floors does the home have?', options: { one: 'One', two: 'Two', 'three-plus': 'Three+' } },
  stairs: { title: 'Where are the steps or stairs?', familyTitle: 'Where are the steps or stairs?', options: { none: 'None', inside: 'Inside', outside: 'Outside', both: 'Both' } },
  bedrooms: { title: 'How many bedrooms?', familyTitle: 'How many bedrooms are in the home?', options: { studio: 'Studio', one: '1 bedroom', two: '2 bedrooms', 'three-plus': '3+ bedrooms' } },
  areas: {
    title: 'Which areas should CasaMia check first?',
    familyTitle: 'Which areas should CasaMia check first?',
    options: { bathroom: 'Bathroom', bedroom: 'Bedroom', kitchen: 'Kitchen', 'living-room': 'Living room', stairs: 'Stairs', entrance: 'Entrance', outdoor: 'Outdoor', lighting: 'Lighting', 'smart-safety': 'Smart safety', 'not-sure': 'Not sure' },
    viewPackage: "View what's included",
    viewAll: 'Browse all options',
    packageTitle: 'current options',
    allOptionsTitle: 'All current options',
    catalogueEyebrow: 'CasaMia service catalogue',
    packageIntro: 'These are the services CasaMia can usually combine for this area. The final recommendation depends on the room, measurements, support points and daily movement.',
    currentOptions: 'active options',
    includes: 'Includes',
    emptyPackage: 'Select this area if it matters. CasaMia will review it even if there is no ready-made option listed yet.',
    close: 'Close',
  },
  mobility: { title: 'What support is used day to day?', options: { independent: 'Independent', cane: 'Cane', walker: 'Walker', wheelchair: 'Wheelchair', assistance: 'Assistance', 'prefer-not': 'Prefer not to say' } },
  challenges: { title: 'What is making daily movement harder?', options: { falls: 'Falls', balance: 'Balance', vision: 'Vision', strength: 'Strength', memory: 'Memory', arthritis: 'Arthritis', 'night-movement': 'Night movement', 'emergency-support': 'Emergency support', 'general-prevention': 'Prevention', other: 'Other' } },
  risks: { title: 'What have you noticed at home?', familyTitle: 'What has been noticed at home?', options: { 'slippery-floors': 'Slippery floors', 'poor-lighting': 'Poor lighting', 'loose-rugs': 'Loose rugs', 'difficult-stairs': 'Difficult stairs', 'high-thresholds': 'High thresholds', 'hard-to-reach-storage': 'Hard-to-reach storage', 'unsafe-bathroom': 'Bathroom feels risky', 'no-emergency-alert': 'No easy way to call for help', 'not-sure': 'Not sure' } },
  urgency: { title: 'When would you like to act?', options: { planning: 'Planning', soon: 'Soon', urgent: 'Urgent' } },
  notes: { title: 'Add anything that changes the recommendation', body: 'Use one or two lines to flag recent changes, risky moments or rooms we should prioritise.', placeholder: 'Example: a recent fall, night bathroom trips, shower entry, stairs, or who should be contacted...' },
  client: {
    typeTitle: 'What type of organisation?', siteTitle: 'How many properties or sites?', needTitle: 'What do you need most?', locationTitle: 'Where do you need support?', locationPlaceholder: 'City, region or service area',
    types: { 'care-provider': 'Care provider', 'property-manager': 'Property manager', clinic: 'Clinic', hospital: 'Hospital', residence: 'Residence', business: 'Business', 'public-body': 'Public body', other: 'Other' },
    sites: { one: 'One', '2-5': '2-5', '6-20': '6-20', '20-plus': '20+' },
    needs: { 'safety-audits': 'Safety audits', 'home-adaptations': 'Home adaptations', 'smart-safety': 'Smart safety', 'staff-support': 'Staff support', accessibility: 'Accessibility', 'portfolio-review': 'Portfolio review', other: 'Other' },
  },
  photos: {
    title: 'Show us the home',
    body: "Photos and short videos help us spot visible risks such as thresholds, loose rugs, low light or awkward bathroom access. Upload only what you're comfortable sharing.",
    add: 'Add photos or videos',
    remove: 'Remove file',
    room: 'Room',
    empty: 'No photos or videos added yet',
    rules: 'JPG, PNG, WebP, MP4, WebM or MOV. Up to 8 files, including 3 videos. Images up to 8 MB, videos up to 50 MB, 100 MB total. We check only visible home-safety details; files upload privately when you submit.',
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
    body: 'Talk with Jo from CasaMia. Describe the room, route or daily task that feels less safe, and what changed if anything did.',
    assistant: 'Jo, CasaMia specialist',
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
    unsupported: 'Live voice is not supported on this device. You can type a note instead.',
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
    body: 'Record or upload a short voice note. Describe the room, route or daily task that feels less safe, and what changed if anything did.',
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
    body: "Leave your contact details and choose a time window. We'll call to understand the concern and agree the next practical step.",
    name: 'Full name',
    phone: 'Phone number',
    phoneHelp: 'Enter a Spanish mobile or landline number.',
    email: 'Email',
    optional: 'Optional',
    cityArea: 'City / area',
    preferredDate: 'Preferred day',
    preferredTime: 'Preferred time',
    note: 'What should we prepare for the call?',
    notePlaceholder: 'For example: bathroom transfers, stairs, recent fall, access needs, or who should join the call...',
    consent: 'I agree CasaMia may contact me to arrange this callback and discuss the home-safety concern.',
    privacy: 'We use these details only to arrange the call, prepare for it and handle this home-safety request. We never sell your data.',
    submit: 'Book my callback',
    submitting: 'Sending callback request…',
    required: 'This field is required.',
    invalidPhone: 'Enter a valid Spanish phone number.',
    invalidEmail: 'Enter a valid email address.',
    futureDate: 'Choose today or a future date.',
    noTimesToday: 'No callback times remain today. Choose another day.',
    tooFarDate: 'Choose a date within the next 90 days.',
    timeUnavailable: 'Choose a time that has not already passed.',
    error: "We couldn't book your callback. Your details are still here—please try again.",
    timeWindows: {
      '09:00-12:00': 'Morning · 09:00–12:00',
      '12:00-15:00': 'Midday · 12:00–15:00',
      '15:00-18:00': 'Afternoon · 15:00–18:00',
      '18:00-20:00': 'Evening · 18:00–20:00',
      flexible: 'Any time',
    },
    confirmation: {
      title: "We'll call you",
      body: 'Your callback details are with CasaMia. We will use your note and preferred time to prepare the call; you do not need to complete the rest of the assessment.',
      confirmed: 'Callback booked',
      reference: 'Request reference',
      phone: 'Number we will call',
      date: 'Preferred day',
      time: 'Preferred time',
      reassurance: 'We will only use these details to arrange and prepare your call.',
      requestAnother: 'Book another callback',
      home: 'Return to CasaMia',
    },
  },
  phone: { title: 'Prefer to speak with us?', body: 'We can complete the assessment with you by phone.', call: 'Call CasaMia', whatsapp: 'WhatsApp', email: 'Email CasaMia', reference: 'Your reference', unavailable: 'Our phone line is being configured. Continue and choose Phone or WhatsApp as your preferred contact.' },
  visit: { title: 'Professional home safety visit', price: '{{visitFee}} · {{visitVatPercent}} VAT included · paid in advance', body: 'A CasaMia professional reviews the home room by room.', credit: 'The {{visitFee}} fee is deducted from approved CasaMia installation if you continue.', example: 'The visit credit is shown in your plan.', book: 'Book visit', without: 'Continue without visit', selected: 'Visit selected' },
  contact: { title: 'Where should we send your plan?', body: 'Add the contact details needed to send the secure plan link and confirm the next action.', name: 'Full name', phone: 'Phone', email: 'Email', city: 'City / area', method: 'Preferred contact', consent: 'I agree CasaMia may contact me about this home-safety plan and next steps.', privacy: 'We use this only to prepare your plan, send the link and contact you about it. We never sell your data.', phoneOrEmail: 'Add a phone number or email.', invalidEmail: 'Enter a valid email address.', required: 'This field is required.', detect: 'Detect', detecting: 'Finding...', detected: 'Location added', detectError: "We couldn't detect your city. Enter it manually." },
  result: {
    title: 'Your room-by-room safety plan', profile: 'Safety profile', recommendedPlan: 'Recommended starting point', improvements: 'What to address first', estimated: 'Early price guide', priceDisclaimer: 'This early guide uses current catalogue options for the areas you selected. Final pricing needs measurements, photos or a home visit.', immediate: 'Immediate', recommended: 'Recommended', optional: 'Optional',
    profiles: { prevention: 'Prevention focused', moderate: 'Moderate safety needs', 'high-priority': 'High-priority improvements', 'smart-safety': 'Smart safety recommended', business: 'Business support' },
    plans: { assessment: 'Home Assessment Plan', 'home-safety': 'Home Safety Plan', 'smart-safety': 'Smart Safety Plan', 'business-consultation': 'Business consultation' },
    confidence: { early: 'This is a first direction based on your answers.', supported: 'Photos, notes or voice details made the next step clearer.', inspection: 'A home visit confirms measurements, fitting details and the final price.' },
    bookVisit: 'Book home visit', requestProposal: 'Review priced plan', speak: 'Speak to CasaMia', business: 'Book business consultation', email: 'Email my plan',
    recommendationNote: 'Suggested from your answers. Compare the options before choosing.', packagesTitle: 'Helpful starting packages', packagesBody: 'Open a card to see what it covers, why it helps and what must be checked before anything is fitted.', packageRecommended: 'Recommended for you', packageSelected: 'Selected', packageDetails: 'View package', packageHide: 'Hide package', packageChoose: 'Choose this package', packageIncludes: 'What it covers', packageManagement: 'CasaMia checks and follow-up included', grantTitle: 'Could public support help pay for this?', grantBody: 'We check the likely rules and tell you what evidence may be needed before you spend time on paperwork.', grantIncluded: 'Grant guidance is included where the selected service can support it.', grantCaveat: 'The authority decides approval and the final amount.', grantLink: 'Check grant options',
  },
  submit: { sending: 'Uploading files and preparing your plan...', success: 'Your details have been sent. CasaMia will review the rooms and contact you about the next action.', error: 'We could not send this yet. Your answers are saved; keep this page open to retry the selected files.' },
}

const es: WizardCopy = {
  entry: { eyebrow: 'Plan guiado CasaMia', title: 'Encuentra qué revisar primero en casa', body: 'Responde unas preguntas, añade fotos o describe el momento difícil. Recibirás un punto de partida claro por estancias.', start: 'Empezar', time: 'La mayoría termina en menos de 3 minutos.', resume: 'Continuar plan guardado' },
  nav: { back: 'Atrás', continue: 'Continuar', skip: 'Omitir', save: 'Guardado automático', saved: 'Guardado', saving: 'Guardando...', saveError: 'Guardado localmente', close: 'Volver al sitio', startAgain: 'Empezar de nuevo' },
  progress: { label: 'Progreso del asistente', step: 'Paso', of: 'de' },
  micro: { chooseOne: 'Elige una opción', chooseAll: 'Elige todas las que correspondan', changeLater: 'Podrás cambiarlo después', optional: 'Puedes omitir este paso', notSure: '¿No lo sabes? No pasa nada' },
  userType: { title: '¿Para quién es esta revisión?', body: 'Elige la opción más cercana para que las preguntas encajen con la persona, la vivienda y la siguiente decisión.', options: { me: 'Para mí', family: 'Alguien a quien ayudo', client: 'Mi centro o negocio' } },
  methods: { title: '¿Cómo quieres empezar?', body: 'Empieza por la opción más fácil ahora. Después podrás añadir fotos, notas o una visita si las primeras respuestas no bastan.', options: { questions: 'Responder unas preguntas', audio: 'Enviar un audio', voice: 'Hablar con Jo', call: 'Llámanos', whatsapp: 'WhatsApp', callback: 'Te llamamos', photos: 'Fotos o vídeos', visit: 'Programar visita' }, descriptions: { questions: 'Ideal para una primera orientación', audio: 'Explica la preocupación con tus palabras', voice: 'Habla sobre la estancia o rutina', call: 'Responde unas preguntas por teléfono', whatsapp: 'Escríbenos cuando te venga bien', callback: 'Elige el día y la franja horaria', photos: 'Muestra las zonas o rutas que preocupan', visit: 'Medir y revisar la vivienda en persona' } },
  homeType: { title: '¿Qué tipo de vivienda es?', familyTitle: '¿Qué tipo de vivienda es?', options: { apartment: 'Piso', house: 'Casa', villa: 'Chalet', other: 'Otra' } },
  floors: { title: '¿Cuántas plantas tiene?', familyTitle: '¿Cuántas plantas tiene la vivienda?', options: { one: 'Una', two: 'Dos', 'three-plus': 'Tres+' } },
  stairs: { title: '¿Dónde hay escalones o escaleras?', familyTitle: '¿Dónde hay escalones o escaleras?', options: { none: 'Ninguno', inside: 'Interior', outside: 'Exterior', both: 'Ambos' } },
  bedrooms: { title: '¿Cuántos dormitorios tiene?', familyTitle: '¿Cuántos dormitorios tiene la vivienda?', options: { studio: 'Estudio', one: '1 dormitorio', two: '2 dormitorios', 'three-plus': '3+ dormitorios' } },
  areas: {
    title: '¿Qué zonas debe revisar CasaMia primero?',
    familyTitle: '¿Qué zonas debe revisar CasaMia primero?',
    options: { bathroom: 'Baño', bedroom: 'Dormitorio', kitchen: 'Cocina', 'living-room': 'Salón', stairs: 'Escaleras', entrance: 'Entrada', outdoor: 'Exterior', lighting: 'Iluminación', 'smart-safety': 'Seguridad inteligente', 'not-sure': 'No lo sé' },
    viewPackage: 'Ver qué incluye',
    viewAll: 'Ver todas las opciones',
    packageTitle: 'opciones actuales',
    allOptionsTitle: 'Todas las opciones actuales',
    catalogueEyebrow: 'Catálogo de servicios CasaMia',
    packageIntro: 'Estos son los servicios que CasaMia suele combinar para esta zona. La recomendación final depende de la estancia, las medidas, los puntos de apoyo y el movimiento diario.',
    currentOptions: 'opciones activas',
    includes: 'Incluye',
    emptyPackage: 'Selecciona esta zona si es importante. CasaMia la revisará aunque todavía no haya una opción cerrada publicada.',
    close: 'Cerrar',
  },
  mobility: { title: '¿Qué apoyo utiliza a diario?', options: { independent: 'Independiente', cane: 'Bastón', walker: 'Andador', wheelchair: 'Silla de ruedas', assistance: 'Ayuda de otra persona', 'prefer-not': 'Prefiero no decirlo' } },
  challenges: { title: '¿Qué está dificultando el movimiento diario?', options: { falls: 'Caídas', balance: 'Equilibrio', vision: 'Visión', strength: 'Fuerza', memory: 'Memoria', arthritis: 'Artritis', 'night-movement': 'Moverse de noche', 'emergency-support': 'Ayuda en emergencias', 'general-prevention': 'Prevención', other: 'Otro' } },
  risks: { title: '¿Qué has observado en casa?', familyTitle: '¿Qué se ha observado en casa?', options: { 'slippery-floors': 'Suelos resbaladizos', 'poor-lighting': 'Poca luz', 'loose-rugs': 'Alfombras sueltas', 'difficult-stairs': 'Escaleras difíciles', 'high-thresholds': 'Umbrales altos', 'hard-to-reach-storage': 'Almacenamiento difícil', 'unsafe-bathroom': 'El baño se siente arriesgado', 'no-emergency-alert': 'No hay forma fácil de pedir ayuda', 'not-sure': 'No lo sé' } },
  urgency: { title: '¿Cuándo quieres actuar?', options: { planning: 'Estoy planificando', soon: 'Pronto', urgent: 'Urgente' } },
  notes: { title: 'Añade algo que pueda cambiar la recomendación', body: 'Una nota breve es suficiente. Céntrate en cambios recientes, momentos de riesgo o estancias prioritarias.', placeholder: 'Ejemplo: caída reciente, idas nocturnas al baño, entrada de ducha, escaleras o a quién contactar...' },
  client: { typeTitle: '¿Qué tipo de organización?', siteTitle: '¿Cuántos centros o inmuebles?', needTitle: '¿Qué necesitáis principalmente?', locationTitle: '¿Dónde necesitáis el servicio?', locationPlaceholder: 'Ciudad, región o zona de servicio', types: { 'care-provider': 'Proveedor de cuidados', 'property-manager': 'Gestor inmobiliario', clinic: 'Clínica', hospital: 'Hospital', residence: 'Residencia', business: 'Empresa', 'public-body': 'Organismo público', other: 'Otro' }, sites: { one: 'Uno', '2-5': '2-5', '6-20': '6-20', '20-plus': '20+' }, needs: { 'safety-audits': 'Auditorías de seguridad', 'home-adaptations': 'Adaptaciones del hogar', 'smart-safety': 'Seguridad inteligente', 'staff-support': 'Apoyo al personal', accessibility: 'Accesibilidad', 'portfolio-review': 'Revisión de cartera', other: 'Otro' } },
  photos: {
    title: 'Muéstranos la vivienda',
    body: 'Las fotos y los vídeos cortos ayudan a detectar riesgos visibles como umbrales, alfombras sueltas, poca luz o accesos incómodos al baño. Sube solo lo que quieras compartir.',
    add: 'Añadir fotos o vídeos',
    remove: 'Eliminar archivo',
    room: 'Zona',
    empty: 'Aún no has añadido fotos ni vídeos',
    rules: 'JPG, PNG, WebP, MP4, WebM o MOV. Hasta 8 archivos, incluidos 3 vídeos. Imágenes de hasta 8 MB, vídeos de hasta 50 MB y 100 MB en total. Revisamos solo detalles visibles de seguridad en la vivienda; los archivos se suben de forma privada al enviar.',
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
    body: 'Habla con Jo de CasaMia. Describe la estancia, ruta o tarea diaria que se siente menos segura, y qué ha cambiado si ha cambiado algo.',
    assistant: 'Jo, especialista CasaMia',
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
    unsupported: 'Este dispositivo no permite voz en directo. Puedes escribir una nota.',
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
    body: 'Graba o sube una nota de voz breve. Describe la estancia, ruta o tarea diaria que se siente menos segura, y qué ha cambiado si ha cambiado algo.',
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
    body: 'Déjanos tus datos y elige una franja. Te llamaremos para entender la preocupación y acordar el siguiente paso práctico.',
    name: 'Nombre completo',
    phone: 'Número de teléfono',
    phoneHelp: 'Introduce un móvil o teléfono fijo de España.',
    email: 'Email',
    optional: 'Opcional',
    cityArea: 'Ciudad / zona',
    preferredDate: 'Día preferido',
    preferredTime: 'Hora preferida',
    note: '¿Qué debemos preparar para la llamada?',
    notePlaceholder: 'Por ejemplo: transferencias en baño, escaleras, caída reciente, acceso o quién debe participar...',
    consent: 'Acepto que CasaMia contacte conmigo para organizar esta llamada y comentar la preocupación de seguridad.',
    privacy: 'Solo usamos estos datos para organizar y preparar la llamada y gestionar esta solicitud de seguridad en casa. Nunca los vendemos.',
    submit: 'Solicitar mi llamada',
    submitting: 'Enviando solicitud de llamada…',
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
      body: 'CasaMia ya tiene tu solicitud. Usaremos tu nota y franja preferida para preparar la llamada; no necesitas completar el resto de la evaluación.',
      confirmed: 'Llamada solicitada',
      reference: 'Referencia de la solicitud',
      phone: 'Número al que llamaremos',
      date: 'Día preferido',
      time: 'Hora preferida',
      reassurance: 'Solo usaremos estos datos para organizar y preparar tu llamada.',
      requestAnother: 'Solicitar otra llamada',
      home: 'Volver a CasaMia',
    },
  },
  phone: { title: '¿Prefieres hablar con nosotros?', body: 'Podemos completar la evaluación contigo por teléfono.', call: 'Llamar a CasaMia', whatsapp: 'WhatsApp', email: 'Escribir a CasaMia', reference: 'Tu referencia', unavailable: 'Estamos configurando la línea telefónica. Continúa y elige Teléfono o WhatsApp como contacto preferido.' },
  visit: { title: 'Visita profesional de seguridad', price: '{{visitFee}} · {{visitVatPercent}} de IVA incluido · pago por adelantado', body: 'Un profesional CasaMia revisará la vivienda estancia por estancia.', credit: 'Los {{visitFee}} se descuentan de la instalación CasaMia aprobada si continúas.', example: 'El descuento de la visita se muestra en tu plan.', book: 'Reservar visita', without: 'Continuar sin visita', selected: 'Visita seleccionada' },
  contact: { title: '¿Dónde enviamos tu plan?', body: 'Añade los datos necesarios para enviar el enlace seguro del plan y confirmar la siguiente acción.', name: 'Nombre completo', phone: 'Teléfono', email: 'Email', city: 'Ciudad / zona', method: 'Contacto preferido', consent: 'Acepto que CasaMia contacte conmigo sobre este plan de seguridad y los siguientes pasos.', privacy: 'Solo usamos estos datos para preparar tu plan, enviar el enlace y contactarte sobre él. Nunca los vendemos.', phoneOrEmail: 'Añade un teléfono o email.', invalidEmail: 'Introduce un email válido.', required: 'Este campo es obligatorio.', detect: 'Detectar', detecting: 'Buscando...', detected: 'Ubicación añadida', detectError: 'No hemos podido detectar tu ciudad. Escríbela manualmente.' },
  result: { title: 'Tu plan de seguridad por estancia', profile: 'Perfil de seguridad', recommendedPlan: 'Punto de partida recomendado', improvements: 'Qué conviene atender primero', estimated: 'Guía inicial de precio', priceDisclaimer: 'Esta guía inicial usa opciones actuales del catálogo para las zonas seleccionadas. El precio final necesita medidas, fotos o una visita.', immediate: 'Inmediato', recommended: 'Recomendado', optional: 'Opcional', profiles: { prevention: 'Enfoque preventivo', moderate: 'Necesidades moderadas', 'high-priority': 'Mejoras prioritarias', 'smart-safety': 'Seguridad inteligente recomendada', business: 'Soporte profesional' }, plans: { assessment: 'Plan de evaluación', 'home-safety': 'Plan de seguridad del hogar', 'smart-safety': 'Plan de seguridad inteligente', 'business-consultation': 'Consulta profesional' }, confidence: { early: 'Esta es una primera orientación basada en tus respuestas.', supported: 'Las fotos, notas o detalles de voz aclaran el siguiente paso.', inspection: 'Una visita confirma medidas, detalles de encaje y precio final.' }, bookVisit: 'Reservar visita', requestProposal: 'Revisar plan con precio', speak: 'Hablar con CasaMia', business: 'Reservar consulta profesional', email: 'Enviar mi plan', recommendationNote: 'Sugerido según tus respuestas. Compara las opciones antes de elegir.', packagesTitle: 'Paquetes iniciales útiles', packagesBody: 'Abre una tarjeta para ver qué cubre, por qué ayuda y qué debe comprobarse antes de instalar nada.', packageRecommended: 'Recomendado para ti', packageSelected: 'Seleccionado', packageDetails: 'Ver paquete', packageHide: 'Ocultar paquete', packageChoose: 'Elegir este paquete', packageIncludes: 'Qué cubre', packageManagement: 'Comprobaciones y seguimiento CasaMia incluidos', grantTitle: '¿Podría ayudarte una ayuda pública?', grantBody: 'Revisamos las reglas probables y te decimos qué evidencias pueden hacer falta antes de dedicar tiempo al papeleo.', grantIncluded: 'La orientación sobre ayudas está incluida cuando el servicio seleccionado puede respaldarla.', grantCaveat: 'La administración decide la aprobación y el importe final.', grantLink: 'Comprobar opciones de ayuda' },
  submit: { sending: 'Subiendo archivos y preparando tu plan...', success: 'Solicitud enviada. CasaMia revisará las estancias y contactará contigo sobre la siguiente acción.', error: 'No hemos podido enviarla todavía. Tus respuestas están guardadas; mantén esta página abierta para reintentar los archivos.' },
}

export function getWizardCopy(language: string): WizardCopy {
  return language.toLowerCase().startsWith('es') ? es : en
}
