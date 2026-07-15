export type PackageId =
  | 'entrance-safe'
  | 'home-movement-safe'
  | 'kitchen-independence'
  | 'bedroom-night-safe'
  | 'bathroom-safe'
  | 'connected-safety-vyva'

export type PackageComponentType = 'standard' | 'conditional' | 'quotation-only' | 'monthly'

export type PackageComponent = {
  id: string
  label: string
  type: PackageComponentType
  customerNote?: string
}

export type ConditionalRule = {
  id: string
  packageId: PackageId
  answerKey: string
  matches: string | string[] | boolean
  addComponentIds?: string[]
  quoteOnlyComponentIds?: string[]
  siteConfirmation?: string
  priceKey?: string
  recurringPriceKey?: string
}

export type WizardQuestion = {
  id: string
  packageId?: PackageId
  label: string
  help?: string
  type: 'text' | 'number' | 'single' | 'multi' | 'boolean'
  options?: Array<{ value: string; label: string }>
}

export type CasaMiaPackage = {
  id: PackageId
  name: string
  shortName: string
  outcome: string
  salesUnit: string
  quantityKey?: keyof PackageQuantities
  standardComponents: PackageComponent[]
  conditionalComponents: PackageComponent[]
  quotationOnlyComponents: PackageComponent[]
}

export type PackageQuantities = {
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

export type PackageSelection = {
  packageId: PackageId
  quantity: number
}

export type QuoteLine = {
  id: string
  label: string
  packageId?: PackageId
  quantity: number
  unitPrice: number
  total: number
  recurringMonthly?: number
  quotationOnly?: boolean
  requiresSiteConfirmation?: boolean
  note?: string
}

export type OneTimeCharge = {
  label: string
  amount: number
}

export type RecurringCharge = {
  label: string
  amount: number
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
  selectedPackageIds: PackageId[]
  quantities: PackageQuantities
  answers: Record<string, CustomerAnswer>
  customer: CustomerContact
  updatedAt?: string
}

export type ConfiguratorPricing = {
  currency: 'EUR'
  vatRate: number
  depositAmount: number
  packagePrices: Record<PackageId, number>
  staircaseModulePrice: number
  componentPrices: Record<string, number>
  recurringPrices: Record<string, number>
}

export type QuoteSummary = {
  selections: PackageSelection[]
  standardComponents: PackageComponent[]
  conditionalComponents: PackageComponent[]
  quotationOnlyItems: PackageComponent[]
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
  selectedPackages: PackageSelection[]
  quantities: PackageQuantities
  customerAnswers: Record<string, CustomerAnswer>
  standardComponents: PackageComponent[]
  conditionalComponents: PackageComponent[]
  quotationOnlyItems: PackageComponent[]
  oneTimeSubtotal: number
  recurringMonthlySubtotal: number
  vat: number
  totalEstimate: number
  deposit: number
  siteConfirmationItems: SiteConfirmationItem[]
  consentRecords: Array<{ label: string; accepted: boolean; timestamp: string }>
}
