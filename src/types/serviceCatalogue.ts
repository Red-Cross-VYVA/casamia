export type ServiceRoom =
  | 'entrance'
  | 'movement'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'connected'

export type PricingType = 'fixed' | 'from' | 'quote_only'

export type QuantityType =
  | 'per_home'
  | 'per_room'
  | 'per_unit'
  | 'per_metre'
  | 'per_square_metre'

export type RecommendationRule = {
  answerKey: string
  matches: string | string[] | boolean
  reason: string
}

export type CasaMiaService = {
  id: string
  slug: string
  name: string
  shortDescription: string
  customerBenefit: string
  room: ServiceRoom
  category: string
  pricingType: PricingType
  productPrice?: number
  installationPrice?: number
  fromPrice?: number
  recurringMonthlyPrice?: number
  vatRate: number
  quantityType: QuantityType
  requiresInstallation: boolean
  requiresMeasurement: boolean
  requiresSiteVisit: boolean
  requiresCompatibilityCheck: boolean
  dependencies?: string[]
  recommendedWhen?: RecommendationRule[]
  includedItems?: string[]
  safetyNotice?: string
  active: boolean
}

export type EditableServiceCatalogue = {
  services: CasaMiaService[]
  updatedAt?: string
}
