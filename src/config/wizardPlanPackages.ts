import {
  derivePackageConfigFromMasterPackage,
  getCustomerCatalogueByRoom,
  getMasterServiceCatalogue,
} from '../services/masterServiceCatalogue.ts'
import { getPackageConfigForArea } from '../services/serviceCatalogue.ts'
import type {
  EditableServiceCatalogue,
  LocalizedString,
  MasterCatalogueOutcome,
  MasterCataloguePackage,
  ServicePackageArea,
  ServicePackageConfig,
} from '../types/serviceCatalogue.ts'
import type { SafetyWizardState, WizardResult, WizardRisk } from '../types/wizard.ts'

export type WizardConsumerPlan = Exclude<WizardResult['selectedPlan'], 'business-consultation'>

export type WizardPlanPackage = {
  id: string
  packageId: string
  planId: WizardConsumerPlan
  name: string
  price: string
  summary: string
  outcome: string
  components: string[]
  roomId: string
  section: MasterCataloguePackage['section']
}

type WizardPlanPackageOptions = {
  catalogue: EditableServiceCatalogue
  language: string
  result: WizardResult
  state: SafetyWizardState
}

const roomPackageAreas = new Set<ServicePackageArea>(['bathroom', 'bedroom', 'kitchen', 'living-room', 'entrance'])

const riskAreaMap: Partial<Record<WizardRisk, ServicePackageArea>> = {
  'difficult-stairs': 'stairs',
  'hard-to-reach-storage': 'kitchen',
  'high-thresholds': 'entrance',
  'loose-rugs': 'living-room',
  'no-emergency-alert': 'smart-safety',
  'poor-lighting': 'lighting',
  'slippery-floors': 'living-room',
  'unsafe-bathroom': 'bathroom',
}

export function getWizardPlanPackages(options: WizardPlanPackageOptions): WizardPlanPackage[] {
  const masterCatalogue = options.catalogue.masterCatalogue ?? getMasterServiceCatalogue()
  const relevantAreas = getRelevantAreas(options.state)
  const scoredPackages = masterCatalogue.rooms
    .filter((room) => room.active)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .flatMap((room) =>
      getCustomerCatalogueByRoom(room.id, masterCatalogue)
        .filter(({ package: packageRecord }) => packageRecord.wizardVisible)
        .map(({ package: packageRecord, outcomes }) => ({
          outcomes: outcomes.filter((outcome) => outcome.wizardVisible),
          packageRecord,
          score: scorePackage(packageRecord, outcomes, relevantAreas, options.result.recommendedPlan),
        })),
    )
    .filter(({ packageRecord, score }) =>
      score > 0 || (relevantAreas.size === 0 && packageRecord.section === 'home-safety-package'),
    )
    .sort((left, right) => right.score - left.score || left.packageRecord.sortOrder - right.packageRecord.sortOrder)

  const visiblePackages = scoredPackages.length
    ? scoredPackages
    : masterCatalogue.rooms.flatMap((room) =>
        getCustomerCatalogueByRoom(room.id, masterCatalogue)
          .filter(({ package: packageRecord }) =>
            packageRecord.wizardVisible && packageRecord.section === 'home-safety-package',
          )
          .map(({ package: packageRecord, outcomes }) => ({ outcomes, packageRecord, score: 0 })),
      )

  return visiblePackages.slice(0, relevantAreas.size ? 6 : 5).map(({ packageRecord, outcomes }) =>
    toWizardPlanPackage(packageRecord, outcomes, options),
  )
}

function toWizardPlanPackage(
  packageRecord: MasterCataloguePackage,
  outcomes: MasterCatalogueOutcome[],
  options: WizardPlanPackageOptions,
): WizardPlanPackage {
  const relevantAreas = getRelevantAreas(options.state)
  const matchedOutcomes = outcomes.filter((outcome) =>
    outcome.wizardAreas.some((area) => relevantAreas.has(area)),
  )
  const displayedOutcomes = matchedOutcomes.length ? matchedOutcomes : outcomes
  const components = displayedOutcomes
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .slice(0, 6)
    .map((outcome) => localize(outcome.customerName, options.language, outcome.internalName))
    .filter(Boolean)

  return {
    id: packageRecord.id,
    packageId: packageRecord.id,
    planId: planIdForPackage(packageRecord),
    name: localize(packageRecord.customerName, options.language, packageRecord.internalName),
    price: formatWizardPackagePrice(getPackageConfig(packageRecord, options.catalogue), options.language),
    summary: localize(packageRecord.shortDescription, options.language, packageRecord.internalName),
    outcome: localize(packageRecord.customerBenefit, options.language, packageRecord.internalName),
    components,
    roomId: packageRecord.roomId,
    section: packageRecord.section,
  }
}

function scorePackage(
  packageRecord: MasterCataloguePackage,
  outcomes: MasterCatalogueOutcome[],
  relevantAreas: Set<ServicePackageArea>,
  recommendedPlan: WizardResult['recommendedPlan'],
) {
  let score = 0

  if (isRoomPackageArea(packageRecord.roomId) && relevantAreas.has(packageRecord.roomId)) {
    score += 35
  }

  const matchingOutcomes = outcomes.filter((outcome) =>
    outcome.wizardVisible && outcome.wizardAreas.some((area) => relevantAreas.has(area)),
  )
  const matchesRelevantRoom = isRoomPackageArea(packageRecord.roomId) && relevantAreas.has(packageRecord.roomId)
  score += matchingOutcomes.length * 12

  if (recommendedPlan === 'smart-safety') {
    if (packageRecord.section === 'connected-room') score += 70
    if (matchingOutcomes.some((outcome) => outcome.technologyEnabled)) score += 20
  } else if (recommendedPlan === 'home-safety') {
    if (
      packageRecord.section === 'home-safety-package'
      && (relevantAreas.size === 0 || matchingOutcomes.length > 0 || matchesRelevantRoom)
    ) {
      score += 55
    }
    if (packageRecord.section === 'optional-adaptations') score += 15
  } else if (recommendedPlan === 'assessment') {
    if (
      packageRecord.section === 'home-safety-package'
      && (relevantAreas.size === 0 || matchingOutcomes.length > 0 || matchesRelevantRoom)
    ) {
      score += 25
    }
  }

  return score
}

function getRelevantAreas(state: SafetyWizardState) {
  const areas = new Set<ServicePackageArea>()

  state.areasOfConcern.forEach((area) => {
    if (area !== 'not-sure') {
      areas.add(area)
    }
  })

  state.currentRisks.forEach((risk) => {
    const area = riskAreaMap[risk]
    if (area) areas.add(area)
  })

  if (state.challenges.includes('emergency-support')) areas.add('smart-safety')
  if (state.challenges.includes('night-movement')) areas.add('lighting')
  if (state.stairsType && state.stairsType !== 'none') areas.add('stairs')
  if (
    state.bedroomCount
    && (
      state.challenges.includes('night-movement')
      || (state.mobilityLevel && !['independent', 'prefer-not'].includes(state.mobilityLevel))
    )
  ) {
    areas.add('bedroom')
  }
  if (state.mobilityLevel && !['independent', 'prefer-not'].includes(state.mobilityLevel)) {
    areas.add('bathroom')
    areas.add('entrance')
  }

  return areas
}

function getPackageConfig(packageRecord: MasterCataloguePackage, catalogue: EditableServiceCatalogue) {
  if (packageRecord.section === 'home-safety-package' && isRoomPackageArea(packageRecord.roomId)) {
    return getPackageConfigForArea(catalogue, packageRecord.roomId)
  }

  return derivePackageConfigFromMasterPackage(packageRecord)
}

function formatWizardPackagePrice(config: ServicePackageConfig | undefined, language: string) {
  const isSpanish = language.toLowerCase().startsWith('es')

  if (!config || !config.active || config.pricingType === 'quote_only') {
    return isSpanish ? 'Presupuesto tras revision' : 'Package price confirmed after review'
  }

  const amount = config.pricingType === 'from' ? config.fromPrice : config.packagePrice

  if (!amount) {
    return isSpanish ? 'Presupuesto tras revision' : 'Package price confirmed after review'
  }

  const total = amount + Math.round(amount * config.vatRate)
  const formatted = new Intl.NumberFormat(isSpanish ? 'es-ES' : 'en-IE', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(total)

  return `${isSpanish ? 'Desde' : 'From'} ${formatted}`
}

function planIdForPackage(packageRecord: MasterCataloguePackage): WizardConsumerPlan {
  return packageRecord.section === 'connected-room' ? 'smart-safety' : 'home-safety'
}

function isRoomPackageArea(value: string): value is ServicePackageArea {
  return roomPackageAreas.has(value as ServicePackageArea)
}

function localize(value: LocalizedString, language: string, fallback: string) {
  return language.toLowerCase().startsWith('es')
    ? value.es ?? value.en ?? fallback
    : value.en ?? value.es ?? fallback
}
