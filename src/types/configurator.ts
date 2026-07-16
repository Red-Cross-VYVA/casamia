export type ConfiguratorRoomId =
  | 'entrance'
  | 'movement'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'connected'

export type LegacyPackageId =
  | 'entrance-safe'
  | 'home-movement-safe'
  | 'kitchen-independence'
  | 'bedroom-night-safe'
  | 'bathroom-safe'
  | 'connected-safety-vyva'

export type ServiceComponentType = 'standard' | 'quotation-only' | 'monthly'

export type ServiceComponent = {
  id: string
  label: string
  type: ServiceComponentType
  customerNote?: string
}

export type ConfiguratorQuantities = {
  entrances: number
  kitchens: number
  bedrooms: number
  bathrooms: number
  staircases: number
}

export type PropertyInformation = {
  propertyType: string
  floors: number
  hasInternalStairs: 'yes' | 'no' | 'unsure'
  postcode: string
  relationship: string
}

export type CustomerAnswer = string | number | boolean | string[]

export type ServiceSelection = {
  serviceId: string
  quantity: number
}

export type QuoteLine = {
  id: string
  label: string
  serviceId?: string
  quantity: number
  unitPrice: number
  total: number
  recurringMonthly?: number
  quotationOnly?: boolean
  requiresSiteConfirmation?: boolean
  note?: string
}

export type SiteConfirmationItem = {
  label: string
  reason: string
}

export type CustomerContact = {
  fullName: string
  email: string
  telephone: string
  address: string
  preferredContact: string
  preferredLanguage: string
  notes: string
  consentToContact: boolean
}

export type ConfiguratorState = {
  currentStep: number
  property: PropertyInformation
  selectedRoomIds: ConfiguratorRoomId[]
  selectedServiceIds: string[]
  quantities: ConfiguratorQuantities
  answers: Record<string, CustomerAnswer>
  customer: CustomerContact
  updatedAt?: string
}

export type QuoteSummary = {
  selectedServices: ServiceSelection[]
  includedItems: ServiceComponent[]
  quotationOnlyItems: ServiceComponent[]
  lines: QuoteLine[]
  siteConfirmationItems: SiteConfirmationItem[]
  oneTimeSubtotal: number
  recurringMonthlySubtotal: number
  vat: number
  totalEstimate: number
  deposit: number
}

export type WizardSubmission = {
  configurationId: string
  timestamp: string
  source: string
  campaign?: string
  customer: CustomerContact
  property: PropertyInformation
  selectedServices: ServiceSelection[]
  quantities: ConfiguratorQuantities
  customerAnswers: Record<string, CustomerAnswer>
  includedItems: ServiceComponent[]
  quotationOnlyItems: ServiceComponent[]
  oneTimeSubtotal: number
  recurringMonthlySubtotal: number
  vat: number
  totalEstimate: number
  deposit: number
  siteConfirmationItems: SiteConfirmationItem[]
  quoteLines?: QuoteLine[]
  consentRecords: Array<{ label: string; accepted: boolean; timestamp: string }>
}
