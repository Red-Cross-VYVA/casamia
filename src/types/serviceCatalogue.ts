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

export type ServiceCatalogueSection =
  | 'home_safety_package'
  | 'connected_room'
  | 'optional_adaptations'

export type ServicePriority = 'essential' | 'recommended' | 'optional'

export type ServiceStatus = 'draft' | 'active' | 'deprecated'

export type MasterCatalogueSectionId =
  | 'home-safety-package'
  | 'connected-room'
  | 'optional-adaptations'

export type MasterPricingType =
  | 'fixed'
  | 'from'
  | 'included-in-package'
  | 'quote'
  | 'range'
  | 'recurring'

export type MasterRelationType =
  | 'capabilityInstallationTask'
  | 'capabilityProduct'
  | 'outcomeCapability'
  | 'packageOutcome'
  | 'productInstallationTask'

export type LocalizedString = Partial<Record<'en' | 'es', string>>

export type ServiceComponentType =
  | 'assessment'
  | 'configuration'
  | 'hardware'
  | 'installation'
  | 'partner_work'
  | 'service'
  | 'software'

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
  customerDescription?: string
  customerName?: string
  includedItems?: string[]
  name?: string
  outcome?: string
  plainLanguageSummary?: string
  safetyNotice?: string
  shortDescription?: string
}

export type ServiceVisibility = {
  admin?: boolean
  crm?: boolean
  inspector?: boolean
  mobile?: boolean
  proposal?: boolean
  website?: boolean
  wizard?: boolean
}

export type ServiceRequirements = {
  assessment?: boolean
  compatibilityCheck?: boolean
  consent?: boolean
  installation?: boolean
  measurement?: boolean
  ownerPermission?: boolean
  quote?: boolean
  siteVisit?: boolean
}

export type ServiceGrantMetadata = {
  eligible?: boolean
  categories?: string[]
  evidenceNeeded?: string[]
  notes?: string
}

export type ServicePricingMetadata = {
  vatReason?: string
  priceNotes?: string
  packagePriceContribution?: number
}

export type ServiceIncludedComponent = {
  componentType: ServiceComponentType
  customerVisible?: boolean
  internalName: string
  notes?: string
  sku?: string
  supplier?: string
}

export type ServiceSmartDependency = {
  dependencyType: 'app' | 'compatible_device' | 'connectivity' | 'smart_speaker' | 'subscription'
  internalName: string
  required: boolean
  customerVisible?: boolean
  notes?: string
}

export type MasterCatalogueRoom = {
  id: string
  slug: string
  name: LocalizedString
  active: boolean
  sortOrder: number
}

export type MasterCatalogueSection = {
  id: MasterCatalogueSectionId
  slug: MasterCatalogueSectionId
  name: LocalizedString
  description: LocalizedString
  active: boolean
  sortOrder: number
}

export type MasterCataloguePackage = {
  id: string
  slug: string
  roomId: string
  section: MasterCatalogueSectionId
  customerName: LocalizedString
  internalName: string
  shortDescription: LocalizedString
  customerBenefit: LocalizedString
  active: boolean
  sortOrder: number
  pricingType: MasterPricingType
  fromPrice?: number
  fixedPrice?: number
  recurringMonthlyPrice?: number
  vatRate: number
  requiresAssessment: boolean
  requiresSiteVisit: boolean
  requiresQuote: boolean
  wizardVisible: boolean
  websiteVisible: boolean
  proposalVisible: boolean
  inspectorVisible: boolean
  adminVisible: boolean
  version: string
  createdAt: string
  updatedAt: string
}

export type MasterCatalogueOutcome = {
  id: string
  legacyId?: string
  slug: string
  roomId: string
  section: MasterCatalogueSectionId
  packageId: string
  customerName: LocalizedString
  internalName: string
  category: string
  shortDescription: LocalizedString
  detailedDescription?: LocalizedString
  customerBenefit: LocalizedString
  active: boolean
  sortOrder: number
  priority: ServicePriority
  pricingType: MasterPricingType
  fromPrice?: number
  fixedPrice?: number
  recurringMonthlyPrice?: number
  vatRate: number
  requiresAssessment: boolean
  requiresMeasurement: boolean
  requiresSiteVisit: boolean
  requiresCompatibilityCheck: boolean
  requiresQuote: boolean
  grantEligible: boolean
  technologyEnabled: boolean
  voiceEnabled: boolean
  requiresSmartSpeaker: boolean
  wizardAreas: ServicePackageArea[]
  wizardTags: string[]
  safetyNotice?: LocalizedString
  implementationNotes?: string
  websiteVisible: boolean
  wizardVisible: boolean
  proposalVisible: boolean
  inspectorVisible: boolean
  adminVisible: boolean
  localisation?: Partial<Record<'es', Partial<MasterCatalogueOutcome>>>
  version: string
  createdAt: string
  updatedAt: string
}

export type MasterCatalogueCapability = {
  id: string
  slug: string
  name: string
  description: string
  active: boolean
  technologyEnabled: boolean
  requiresCompatibilityCheck: boolean
  implementationNotes?: string
}

export type MasterCatalogueProduct = {
  id: string
  slug: string
  sku?: string
  supplier?: string
  manufacturer?: string
  model?: string
  productType: 'device' | 'hardware' | 'material' | 'service' | 'software'
  name: string
  internalDescription: string
  active: boolean
  unitCost?: number
  retailPrice?: number
  recurringMonthlyPrice?: number
  vatRate: number
  currency: 'EUR'
  quantityType: QuantityType
  stockTracked: boolean
  grantEligible: boolean
  installationRequired: boolean
  requiresCompatibilityCheck: boolean
  compatibilityNotes?: string
  safetyNotice?: string
  technicalSpecification?: string
  version: string
}

export type MasterCatalogueInstallationTask = {
  id: string
  slug: string
  name: string
  description: string
  active: boolean
  estimatedMinutes: number
  skillType: 'assessment' | 'carpentry' | 'electrical' | 'general' | 'plumbing' | 'smart_home'
  installerType: 'casamia' | 'partner' | 'specialist'
  labourRate?: number
  requiresSiteVisit: boolean
  requiresMeasurement: boolean
  safetyChecklist: string[]
  completionChecklist: string[]
  version: string
}

export type MasterCatalogueRelation = {
  id: string
  type: MasterRelationType
  fromId: string
  toId: string
  required: boolean
  defaultIncluded: boolean
  optionalUpgrade: boolean
  minimumQuantity?: number
  maximumQuantity?: number
  sortOrder: number
  notes?: string
}

export type MasterServiceCatalogue = {
  rooms: MasterCatalogueRoom[]
  sections: MasterCatalogueSection[]
  packages: MasterCataloguePackage[]
  outcomes: MasterCatalogueOutcome[]
  capabilities: MasterCatalogueCapability[]
  products: MasterCatalogueProduct[]
  installationTasks: MasterCatalogueInstallationTask[]
  relations: MasterCatalogueRelation[]
  version: string
  updatedAt: string
}

export type CasaMiaService = {
  id: string
  slug: string
  name: string
  shortDescription: string
  customerBenefit: string
  room: ServiceRoom
  category: string
  section?: ServiceCatalogueSection
  customerName?: string
  customerDescription?: string
  outcome?: string
  plainLanguageSummary?: string
  internalName?: string
  internalDescription?: string
  status?: ServiceStatus
  version?: string
  priority?: ServicePriority
  websiteVisible?: boolean
  wizardVisible?: boolean
  proposalVisible?: boolean
  inspectorVisible?: boolean
  adminVisible?: boolean
  crmVisible?: boolean
  mobileVisible?: boolean
  visibility?: ServiceVisibility
  componentRole?: ServiceComponentRole
  pricingType: PricingType
  productPrice?: number
  installationPrice?: number
  fromPrice?: number
  recurringMonthlyPrice?: number
  vatRate: number
  pricing?: ServicePricingMetadata
  quantityType: QuantityType
  requiresAssessment?: boolean
  requiresInstallation: boolean
  requiresMeasurement: boolean
  requiresSiteVisit: boolean
  requiresCompatibilityCheck: boolean
  requiresQuote?: boolean
  requirements?: ServiceRequirements
  grant?: ServiceGrantMetadata
  typicalInstallationTime?: string
  internalComponents?: ServiceIncludedComponent[]
  smartDependencies?: ServiceSmartDependency[]
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
  section?: ServiceCatalogueSection
  fromPrice?: number
  name?: string
  packagePrice?: number
  pricingType: PricingType
  recurringMonthlyPrice?: number
  vatRate: number
}

export type EditableServiceCatalogue = {
  masterCatalogue?: MasterServiceCatalogue
  packageConfigs?: ServicePackageConfig[]
  services: CasaMiaService[]
  updatedAt?: string
}
