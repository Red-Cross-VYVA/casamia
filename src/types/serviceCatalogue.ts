import type { SafetyFindingCategory, SafetyFindingSeverity } from './safetyAnalysis.ts'

export type ServiceRoom =
  | 'entrance'
  | 'movement'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'connected'

export type ServicePackageArea =
  | 'bathroom'
  | 'bedroom'
  | 'kitchen'
  | 'living-room'
  | 'stairs'
  | 'entrance'
  | 'outdoor'
  | 'lighting'
  | 'smart-safety'

export type PricingType = 'fixed' | 'from' | 'quote_only'

export type ServiceComponentRole = 'core' | 'option'

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

export type CasaMiaServiceTranslation = {
  category?: string
  customerBenefit?: string
  includedItems?: string[]
  name?: string
  safetyNotice?: string
  shortDescription?: string
}

export type CasaMiaService = {
  id: string
  slug: string
  name: string
  shortDescription: string
  customerBenefit: string
  room: ServiceRoom
  category: string
  componentRole?: ServiceComponentRole
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
  evidenceCategories?: SafetyFindingCategory[]
  minimumEvidenceSeverity?: SafetyFindingSeverity
  evidenceReason?: string
  includedItems?: string[]
  wizardAreas?: ServicePackageArea[]
  safetyNotice?: string
  translations?: Partial<Record<'es', CasaMiaServiceTranslation>>
  active: boolean
}

export type ServicePackageConfig = {
  active: boolean
  area: ServicePackageArea
  fromPrice?: number
  name?: string
  packagePrice?: number
  pricingType: PricingType
  recurringMonthlyPrice?: number
  vatRate: number
}

export type EditableServiceCatalogue = {
  packageConfigs?: ServicePackageConfig[]
  services: CasaMiaService[]
  updatedAt?: string
}
