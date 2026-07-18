export type WizardUserType = 'me' | 'family' | 'client'
export type WizardInputMethod = 'questions' | 'photos' | 'voice' | 'call' | 'callback' | 'visit'
export type HomeType = 'apartment' | 'house' | 'villa' | 'other'
export type FloorCount = 'one' | 'two' | 'three-plus'
export type StairsType = 'none' | 'inside' | 'outside' | 'both'
export type MobilityLevel = 'independent' | 'cane' | 'walker' | 'wheelchair' | 'assistance' | 'prefer-not'
export type Urgency = 'planning' | 'soon' | 'urgent'
export type WizardContactMethod = 'phone' | 'whatsapp' | 'email'
export const WIZARD_CALLBACK_TIME_WINDOWS = [
  '09:00-12:00',
  '12:00-15:00',
  '15:00-18:00',
  '18:00-20:00',
  'flexible',
] as const
export type WizardCallbackTimeWindow = (typeof WIZARD_CALLBACK_TIME_WINDOWS)[number]
export type WizardRoom =
  | 'bathroom'
  | 'bedroom'
  | 'kitchen'
  | 'living-room'
  | 'stairs'
  | 'entrance'
  | 'outdoor'
  | 'lighting'
  | 'smart-safety'
  | 'not-sure'

export type WizardChallenge =
  | 'falls'
  | 'balance'
  | 'vision'
  | 'strength'
  | 'memory'
  | 'arthritis'
  | 'night-movement'
  | 'emergency-support'
  | 'general-prevention'
  | 'other'

export type WizardRisk =
  | 'slippery-floors'
  | 'poor-lighting'
  | 'loose-rugs'
  | 'difficult-stairs'
  | 'high-thresholds'
  | 'hard-to-reach-storage'
  | 'unsafe-bathroom'
  | 'no-emergency-alert'
  | 'not-sure'

export type ClientType =
  | 'care-provider'
  | 'property-manager'
  | 'clinic'
  | 'hospital'
  | 'residence'
  | 'business'
  | 'public-body'
  | 'other'

export type ClientSiteCount = 'one' | '2-5' | '6-20' | '20-plus'
export type ClientNeed =
  | 'safety-audits'
  | 'home-adaptations'
  | 'smart-safety'
  | 'staff-support'
  | 'accessibility'
  | 'portfolio-review'
  | 'other'

export type WizardStepId =
  | 'entry'
  | 'user-type'
  | 'methods'
  | 'client-type'
  | 'client-sites'
  | 'client-need'
  | 'client-location'
  | 'home-type'
  | 'floors'
  | 'stairs'
  | 'areas'
  | 'mobility'
  | 'challenges'
  | 'risks'
  | 'urgency'
  | 'notes'
  | 'photos'
  | 'voice'
  | 'phone'
  | 'callback'
  | 'callback-confirmation'
  | 'visit'
  | 'contact'
  | 'result'

export type WizardPhoto = {
  id: string
  name: string
  size: number
  type: string
  kind?: 'image' | 'video'
  room: Exclude<WizardRoom, 'lighting' | 'smart-safety' | 'not-sure'> | 'other'
  storageBucket?: string
  storagePath?: string
  file?: File
  previewUrl?: string
  roomDetectionStatus?: 'detecting' | 'detected' | 'manual' | 'unavailable'
  roomDetectionSource?: 'image' | 'filename'
  roomDetectionConfidence?: number
}

export type WizardVoiceTranscriptMessage = {
  role: 'user' | 'agent'
  message: string
}

export type WizardVoiceSession = {
  provider: 'elevenlabs'
  conversationId: string
  language: 'en' | 'es'
  startedAt: string
  endedAt?: string
  durationSeconds: number
  transcript: WizardVoiceTranscriptMessage[]
}

export type WizardContact = {
  fullName: string
  phone: string
  email: string
  city: string
  preferredMethod: WizardContactMethod
  consent: boolean
}

export type WizardCallbackRequest = {
  preferredDate: string
  preferredTimeWindow: WizardCallbackTimeWindow | ''
  note: string
  consent: boolean
}

export type WizardCallbackSubmission = {
  id?: string
  submittedAt: string
}

export type WizardPriceRange = {
  minimum?: number
  maximum?: number
  label: string
  smartSafetyAddition?: string
  source?: 'service-catalogue'
  serviceIds?: string[]
  areaCount?: number
  recurringMonthlyMinimum?: number
  requiresQuote?: boolean
  vatIncluded?: boolean
}

export type WizardPriority = 'immediate' | 'recommended' | 'optional'

export type WizardImprovement = {
  id: string
  label: string
  priority: WizardPriority
}

export type WizardResult = {
  safetyProfile: 'prevention' | 'moderate' | 'high-priority' | 'smart-safety' | 'business'
  riskScore: number
  recommendedPlan: 'assessment' | 'home-safety' | 'smart-safety' | 'business-consultation'
  selectedPlan: 'assessment' | 'home-safety' | 'smart-safety' | 'business-consultation'
  improvements: WizardImprovement[]
  priceRange?: WizardPriceRange
  confidence: 'early' | 'supported' | 'inspection'
  nextAction: 'book-visit' | 'request-proposal' | 'business-consultation'
}

export type SafetyWizardState = {
  wizardReference: string
  currentStep: WizardStepId
  started: boolean
  userType?: WizardUserType
  inputMethods: WizardInputMethod[]
  clientType?: ClientType
  clientSiteCount?: ClientSiteCount
  clientNeed?: ClientNeed
  clientLocation: string
  homeType?: HomeType
  floorCount?: FloorCount
  stairsType?: StairsType
  areasOfConcern: WizardRoom[]
  mobilityLevel?: MobilityLevel
  challenges: WizardChallenge[]
  currentRisks: WizardRisk[]
  urgency?: Urgency
  notes: string
  photos: WizardPhoto[]
  voiceSession?: WizardVoiceSession
  callbackRequest: WizardCallbackRequest
  callbackSubmission?: WizardCallbackSubmission
  inspectionBooked: boolean
  inspectionFee: 99
  inspectionCreditThreshold: 300
  contact: WizardContact
  result?: WizardResult
  submitted: boolean
  updatedAt: string
}

export type WizardSubmissionPayload = {
  wizardReference: string
  source: 'home-safety-wizard'
  userType: WizardUserType
  clientType?: ClientType
  clientSiteCount?: ClientSiteCount
  clientNeed?: ClientNeed
  clientLocation?: string
  homeDetails: {
    homeType?: HomeType
    floorCount?: FloorCount
    stairsType?: StairsType
  }
  mobility?: MobilityLevel
  challenges: WizardChallenge[]
  risks: WizardRisk[]
  areasOfConcern: WizardRoom[]
  urgency?: Urgency
  notes?: string
  photoMetadata: Array<Omit<WizardPhoto, 'file' | 'previewUrl'>>
  videoMetadata: Array<Omit<WizardPhoto, 'file' | 'previewUrl'>>
  voiceMetadata?: WizardVoiceSession
  selectedPlan?: WizardResult['selectedPlan']
  estimatedPriceRange?: WizardPriceRange
  inspectionChoice: {
    booked: boolean
    fee: number
    creditThreshold: number
  }
  contactDetails: WizardContact
  submittedAt: string
}
