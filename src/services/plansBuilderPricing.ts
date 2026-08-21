import { getCustomerCatalogueByRoom, getMasterServiceCatalogue } from './masterServiceCatalogue.ts'
import { getPackageConfigForArea } from './serviceCatalogue.ts'
import { createLineItem } from './proposalsStorage.ts'
import type {
  EditableServiceCatalogue,
  LocalizedString,
  MasterCatalogueOutcome,
  MasterCataloguePackage,
  MasterCatalogueRoom,
  ServicePackageArea,
  ServicePackageConfig,
} from '../types/serviceCatalogue.ts'
import type { ProposalCategory, ProposalLineItem } from './proposalCalculations.ts'

export type PlansBuilderLanguage = 'en' | 'es'

export type PlansBuilderPackageSelection = {
  addOnOutcomeIds: string[]
  quantity: number
  selected: boolean
}

export type PlansBuilderSelectionState = Record<string, PlansBuilderPackageSelection>

export type PlansBuilderAddOnPackage = {
  outcomes: MasterCatalogueOutcome[]
  packageDescription: string
  packageLabel: string
  packageRecord: MasterCataloguePackage
  recurringMonthlyUnitPrice: number
  requiresReview: boolean
  unitPrice: number
}

export type PlansBuilderGroup = {
  addOnPackages: PlansBuilderAddOnPackage[]
  homeOutcomes: MasterCatalogueOutcome[]
  homePackage: MasterCataloguePackage
  packageArea: ServicePackageArea
  packageConfig?: ServicePackageConfig
  packageDescription: string
  packageLabel: string
  packageUnitPrice: number
  recurringMonthlyUnitPrice: number
  requiresReview: boolean
  room: MasterCatalogueRoom
  roomLabel: string
}

export type PlansBuilderEstimateLine = {
  description: string
  grantEligible: boolean
  id: string
  isRecurring: boolean
  label: string
  lineTotal: number
  packageId: string
  quantity: number
  requiresReview: boolean
  reviewReason?: string
  roomId: string
  sourceOutcomeId?: string
  unitPrice: number
}

export type PlansBuilderEstimate = {
  lineItems: PlansBuilderEstimateLine[]
  oneTimeEstimate: number
  proposalLineItems: ProposalLineItem[]
  recurringMonthlyEstimate: number
  requiresReview: boolean
  reviewItems: string[]
  selectedPackageCount: number
  selectedRoomQuantity: number
}

type BuildGroupsOptions = {
  publicOnly?: boolean
}

const masterRoomToPackageArea: Partial<Record<string, ServicePackageArea>> = {
  bathroom: 'bathroom',
  bedroom: 'bedroom',
  entrance: 'entrance',
  kitchen: 'kitchen',
  'living-room': 'living-room',
}

const proposalCategoryByRoom: Record<string, ProposalCategory> = {
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  entrance: 'Entryway',
  kitchen: 'Kitchen',
  'living-room': 'Living Room',
}

export function buildPlansBuilderGroups(
  catalogue: EditableServiceCatalogue,
  language: string,
  options: BuildGroupsOptions = {},
): PlansBuilderGroup[] {
  const masterCatalogue = catalogue.masterCatalogue ?? getMasterServiceCatalogue()
  const publicOnly = options.publicOnly ?? true

  return masterCatalogue.rooms
    .filter((room) => room.active)
    .sort(sortByOrder)
    .flatMap((room) => {
      const packageArea = masterRoomToPackageArea[room.id]

      if (!packageArea) {
        return []
      }

      const customerCatalogue = getCustomerCatalogueByRoom(room.id, masterCatalogue)
      const homePackageGroup = customerCatalogue.find(({ package: packageRecord }) =>
        isVisiblePackage(packageRecord, publicOnly) && packageRecord.section === 'home-safety-package',
      )

      if (!homePackageGroup) {
        return []
      }

      const packageConfig = getPackageConfigForArea(catalogue, packageArea)
      const homeUnitPrice = getPackageUnitPrice(homePackageGroup.package, packageConfig)
      const homeRecurringPrice = getPackageRecurringMonthlyPrice(homePackageGroup.package, packageConfig)
      const localizedHomePackageLabel = localizePlansString(
        homePackageGroup.package.customerName,
        language,
        homePackageGroup.package.internalName,
      )

      return [{
        addOnPackages: customerCatalogue
          .filter(({ package: packageRecord }) =>
            isVisiblePackage(packageRecord, publicOnly) && isPlansAddOnPackage(packageRecord),
          )
          .map(({ package: packageRecord, outcomes }) => ({
            outcomes: outcomes.filter((outcome) => isVisibleOutcome(outcome, publicOnly)).sort(sortByOrder),
            packageDescription: localizePlansString(packageRecord.shortDescription, language, packageRecord.internalName),
            packageLabel: localizePlansString(packageRecord.customerName, language, packageRecord.internalName),
            packageRecord,
            recurringMonthlyUnitPrice: getPackageRecurringMonthlyPrice(packageRecord),
            requiresReview: packageNeedsReview(packageRecord, getPackageUnitPrice(packageRecord)),
            unitPrice: getPackageUnitPrice(packageRecord),
          }))
          .filter((group) => group.outcomes.length > 0),
        homeOutcomes: homePackageGroup.outcomes.filter((outcome) => isVisibleOutcome(outcome, publicOnly)).sort(sortByOrder),
        homePackage: homePackageGroup.package,
        packageArea,
        packageConfig,
        packageDescription: localizePlansString(
          homePackageGroup.package.shortDescription,
          language,
          homePackageGroup.package.internalName,
        ),
        packageLabel: language.toLowerCase().startsWith('es')
          ? localizedHomePackageLabel
          : packageConfig?.name || localizedHomePackageLabel,
        packageUnitPrice: homeUnitPrice,
        recurringMonthlyUnitPrice: homeRecurringPrice,
        requiresReview: packageNeedsReview(homePackageGroup.package, homeUnitPrice, packageConfig),
        room,
        roomLabel: localizePlansString(room.name, language, room.id),
      }]
    })
}

export function calculatePlansBuilderEstimate(
  groups: PlansBuilderGroup[],
  selection: PlansBuilderSelectionState,
  language: string,
): PlansBuilderEstimate {
  const lineItems: PlansBuilderEstimateLine[] = []
  const reviewItems = new Set<string>()
  let selectedPackageCount = 0
  let selectedRoomQuantity = 0

  groups.forEach((group) => {
    const packageSelection = selection[group.homePackage.id]

    if (!packageSelection?.selected) {
      return
    }

    const quantity = normalisePlansQuantity(packageSelection.quantity)
    selectedRoomQuantity += quantity
    selectedPackageCount += 1
    const homeLine = buildEstimateLine({
      description: buildPlansPackageDescription(group, language),
      grantEligible: group.homeOutcomes.some((outcome) => outcome.grantEligible),
      id: `plans-package-${group.homePackage.id}`,
      label: getPlansPackageLineName(group.packageLabel),
      packageId: group.homePackage.id,
      quantity,
      requiresReview: group.requiresReview,
      reviewReason: group.requiresReview ? reviewCopy(language).package : undefined,
      roomId: group.room.id,
      unitPrice: group.packageUnitPrice,
    })

    lineItems.push(homeLine)
    if (homeLine.requiresReview) reviewItems.add(homeLine.label)

    if (group.recurringMonthlyUnitPrice > 0) {
      lineItems.push(buildEstimateLine({
        description: recurringDescription(language),
        grantEligible: false,
        id: `plans-recurring-${group.homePackage.id}`,
        isRecurring: true,
        label: `${getPlansPackageLineName(group.packageLabel)} support`,
        packageId: group.homePackage.id,
        quantity,
        roomId: group.room.id,
        unitPrice: group.recurringMonthlyUnitPrice,
      }))
    }

    const selectedAddOnIds = new Set(packageSelection.addOnOutcomeIds)

    group.addOnPackages.forEach((addOnPackage) => {
      const selectedOutcomes = addOnPackage.outcomes.filter((outcome) => selectedAddOnIds.has(outcome.id))

      if (!selectedOutcomes.length) {
        return
      }

      selectedPackageCount += 1

      if (addOnPackage.unitPrice > 0 || addOnPackage.recurringMonthlyUnitPrice > 0) {
        const packageLine = buildEstimateLine({
          description: buildPlansAddOnPackageDescription(addOnPackage, selectedOutcomes, language),
          grantEligible: selectedOutcomes.some((outcome) => outcome.grantEligible),
          id: `plans-addon-package-${addOnPackage.packageRecord.id}`,
          label: addOnPackage.packageLabel,
          packageId: addOnPackage.packageRecord.id,
          quantity,
          requiresReview: selectedOutcomes.some(outcomeNeedsReview),
          reviewReason: selectedOutcomes.some(outcomeNeedsReview) ? reviewCopy(language).compatibility : undefined,
          roomId: addOnPackage.packageRecord.roomId,
          unitPrice: addOnPackage.unitPrice,
        })

        lineItems.push(packageLine)
        if (packageLine.requiresReview) reviewItems.add(packageLine.label)

        if (addOnPackage.recurringMonthlyUnitPrice > 0) {
          lineItems.push(buildEstimateLine({
            description: recurringDescription(language),
            grantEligible: false,
            id: `plans-addon-recurring-${addOnPackage.packageRecord.id}`,
            isRecurring: true,
            label: `${addOnPackage.packageLabel} support`,
            packageId: addOnPackage.packageRecord.id,
            quantity,
            roomId: addOnPackage.packageRecord.roomId,
            unitPrice: addOnPackage.recurringMonthlyUnitPrice,
          }))
        }

        return
      }

      selectedOutcomes.forEach((outcome) => {
        const outcomeUnitPrice = getOutcomeUnitPrice(outcome)
        const outcomeLabel = localizePlansString(outcome.customerName, language, outcome.internalName)
        const outcomeReview = outcomeNeedsReview(outcome) || outcomeUnitPrice <= 0
        const outcomeLine = buildEstimateLine({
          description: buildPlansOutcomeDescription(addOnPackage.packageRecord, outcome, language),
          grantEligible: outcome.grantEligible,
          id: `plans-addon-outcome-${outcome.id}`,
          label: outcomeLabel,
          packageId: addOnPackage.packageRecord.id,
          quantity,
          requiresReview: outcomeReview,
          reviewReason: outcomeReview ? reviewCopy(language).package : undefined,
          roomId: outcome.roomId,
          sourceOutcomeId: outcome.id,
          unitPrice: outcomeUnitPrice,
        })

        lineItems.push(outcomeLine)
        if (outcomeLine.requiresReview) reviewItems.add(outcomeLine.label)
      })
    })
  })

  const oneTimeLines = lineItems.filter((line) => !line.isRecurring)
  const recurringLines = lineItems.filter((line) => line.isRecurring)

  return {
    lineItems,
    oneTimeEstimate: oneTimeLines.reduce((sum, line) => sum + line.lineTotal, 0),
    proposalLineItems: oneTimeLines.map(toProposalLineItem),
    recurringMonthlyEstimate: recurringLines.reduce((sum, line) => sum + line.lineTotal, 0),
    requiresReview: reviewItems.size > 0,
    reviewItems: [...reviewItems],
    selectedPackageCount,
    selectedRoomQuantity,
  }
}

export function buildPlansProposalLineItems(
  groups: PlansBuilderGroup[],
  selection: PlansBuilderSelectionState,
  options: { language?: string } = {},
) {
  return calculatePlansBuilderEstimate(groups, selection, options.language ?? 'en').proposalLineItems
}

export function buildPlansPackageDescription(group: PlansBuilderGroup, language: string) {
  const included = group.homeOutcomes
    .map((outcome) => localizePlansString(outcome.customerName, language, outcome.internalName))
    .filter(Boolean)
  const parts = [
    group.packageDescription,
    included.length ? `${copyFor(language).includes}: ${formatReadableList(included, language)}.` : '',
    group.requiresReview ? reviewCopy(language).package : '',
  ]

  return parts.filter(Boolean).join(' ')
}

export function getPlansPackageLineName(label: string) {
  return /package|paquete/i.test(label) ? label : `${label} package`
}

export function localizePlansString(value: LocalizedString, language: string, fallback = '') {
  return language.toLowerCase().startsWith('es')
    ? value.es ?? value.en ?? fallback
    : value.en ?? value.es ?? fallback
}

export function normalisePlansQuantity(value: number) {
  return Math.max(1, Math.min(12, Math.floor(Number.isFinite(value) ? value : 1)))
}

export function formatPlansCurrency(value: number, language: string) {
  return new Intl.NumberFormat(language.toLowerCase().startsWith('es') ? 'es-ES' : 'en-IE', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatPlansEstimateLabel(estimate: PlansBuilderEstimate, language: string) {
  const copy = copyFor(language)

  if (estimate.oneTimeEstimate <= 0) {
    return estimate.requiresReview ? copy.reviewOnly : copy.noSelection
  }

  return `${copy.from} ${formatPlansCurrency(estimate.oneTimeEstimate, language)}`
}

export function getPlansOutcomeUnitPrice(outcome: MasterCatalogueOutcome) {
  return getOutcomeUnitPrice(outcome)
}

function buildPlansAddOnPackageDescription(
  addOnPackage: PlansBuilderAddOnPackage,
  outcomes: MasterCatalogueOutcome[],
  language: string,
) {
  const selected = outcomes
    .map((outcome) => localizePlansString(outcome.customerName, language, outcome.internalName))
    .filter(Boolean)
  const parts = [
    addOnPackage.packageDescription,
    selected.length ? `${copyFor(language).selected}: ${formatReadableList(selected, language)}.` : '',
    outcomes.some(outcomeNeedsReview) ? reviewCopy(language).compatibility : '',
  ]

  return parts.filter(Boolean).join(' ')
}

function buildPlansOutcomeDescription(
  packageRecord: MasterCataloguePackage,
  outcome: MasterCatalogueOutcome,
  language: string,
) {
  const packageName = localizePlansString(packageRecord.customerName, language, packageRecord.internalName)
  const description = localizePlansString(outcome.shortDescription, language, outcome.internalName)
  const parts = [
    `${packageName}.`,
    description,
    outcomeNeedsReview(outcome) || getOutcomeUnitPrice(outcome) <= 0 ? reviewCopy(language).package : '',
  ]

  return parts.filter(Boolean).join(' ')
}

type BuildEstimateLineInput = Omit<PlansBuilderEstimateLine, 'isRecurring' | 'lineTotal' | 'requiresReview'> & {
  isRecurring?: boolean
  requiresReview?: boolean
}

function buildEstimateLine({
  description,
  grantEligible,
  id,
  isRecurring = false,
  label,
  packageId,
  quantity,
  requiresReview = false,
  reviewReason,
  roomId,
  sourceOutcomeId,
  unitPrice,
}: BuildEstimateLineInput): PlansBuilderEstimateLine {
  const safeQuantity = normalisePlansQuantity(quantity)
  const safePrice = safeCurrencyNumber(unitPrice)

  return {
    description,
    grantEligible,
    id,
    isRecurring,
    label,
    lineTotal: safePrice * safeQuantity,
    packageId,
    quantity: safeQuantity,
    requiresReview,
    reviewReason,
    roomId,
    sourceOutcomeId,
    unitPrice: safePrice,
  }
}

function toProposalLineItem(line: PlansBuilderEstimateLine): ProposalLineItem {
  return createLineItem({
    category: proposalCategoryByRoom[line.roomId] ?? 'General',
    description: line.description,
    grantEligible: line.grantEligible,
    id: line.id,
    name: line.label,
    priority: line.requiresReview ? 'Medium' : 'High',
    quantity: line.quantity,
    source: 'catalogue',
    sourceOutcomeId: line.sourceOutcomeId,
    sourcePackageId: line.packageId,
    unitPrice: line.unitPrice,
  })
}

function getPackageUnitPrice(packageRecord: MasterCataloguePackage, config?: ServicePackageConfig) {
  if (config?.active && config.pricingType !== 'quote_only') {
    return priceWithVat(
      config.pricingType === 'fixed' ? config.packagePrice : config.fromPrice,
      config.vatRate,
    )
  }

  if (packageRecord.pricingType === 'fixed') return priceWithVat(packageRecord.fixedPrice, packageRecord.vatRate)
  if (packageRecord.pricingType === 'from' || packageRecord.pricingType === 'range') {
    return priceWithVat(packageRecord.fromPrice, packageRecord.vatRate)
  }

  return 0
}

function getPackageRecurringMonthlyPrice(packageRecord: MasterCataloguePackage, config?: ServicePackageConfig) {
  const recurringMonthlyPrice = config?.active
    ? config.recurringMonthlyPrice ?? packageRecord.recurringMonthlyPrice
    : packageRecord.recurringMonthlyPrice

  return priceWithVat(recurringMonthlyPrice, config?.vatRate ?? packageRecord.vatRate)
}

function getOutcomeUnitPrice(outcome: MasterCatalogueOutcome) {
  if (outcome.pricingType === 'fixed') return priceWithVat(outcome.fixedPrice, outcome.vatRate)
  if (outcome.pricingType === 'from' || outcome.pricingType === 'range') {
    return priceWithVat(outcome.fromPrice, outcome.vatRate)
  }

  return 0
}

function packageNeedsReview(
  packageRecord: MasterCataloguePackage,
  unitPrice: number,
  config?: ServicePackageConfig,
) {
  return Boolean(
    packageRecord.requiresQuote
    || packageRecord.pricingType === 'quote'
    || config?.pricingType === 'quote_only'
    || unitPrice <= 0,
  )
}

function outcomeNeedsReview(outcome: MasterCatalogueOutcome) {
  return Boolean(
    outcome.requiresQuote
    || outcome.requiresMeasurement
    || outcome.requiresSiteVisit
    || outcome.requiresCompatibilityCheck
    || outcome.pricingType === 'quote',
  )
}

function isVisiblePackage(packageRecord: MasterCataloguePackage, publicOnly: boolean) {
  return packageRecord.active && packageRecord.proposalVisible && (!publicOnly || packageRecord.websiteVisible)
}

function isPlansAddOnPackage(packageRecord: MasterCataloguePackage) {
  return packageRecord.section === 'connected-room' || packageRecord.section === 'optional-adaptations'
}

function isVisibleOutcome(outcome: MasterCatalogueOutcome, publicOnly: boolean) {
  return outcome.active && outcome.proposalVisible && (!publicOnly || outcome.websiteVisible)
}

function priceWithVat(value: number | undefined, vatRate: number | undefined) {
  if (!Number.isFinite(value) || !value || value <= 0) {
    return 0
  }

  return Math.round(value * (1 + (vatRate ?? 0)))
}

function safeCurrencyNumber(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0
}

function sortByOrder<T extends { sortOrder: number }>(left: T, right: T) {
  return left.sortOrder - right.sortOrder
}

function formatReadableList(items: string[], language: string) {
  if (items.length <= 2) {
    return items.join(items.length === 2 ? ` ${copyFor(language).and} ` : '')
  }

  return `${items.slice(0, -1).join(', ')} ${copyFor(language).and} ${items[items.length - 1]}`
}

function recurringDescription(language: string) {
  return language.toLowerCase().startsWith('es')
    ? 'Coste mensual mostrado por separado. CasaMia confirma compatibilidad antes de activar el servicio.'
    : 'Monthly cost shown separately. CasaMia confirms compatibility before activating the service.'
}

function copyFor(language: string) {
  return language.toLowerCase().startsWith('es')
    ? {
        and: 'y',
        from: 'Desde',
        includes: 'Alcance habitual',
        noSelection: 'Elige una estancia',
        reviewOnly: 'Presupuesto tras revisión',
        selected: 'Seleccionado',
      }
    : {
        and: 'and',
        from: 'From',
        includes: 'Typical scope',
        noSelection: 'Choose a room',
        reviewOnly: 'Quote after review',
        selected: 'Selected',
      }
}

function reviewCopy(language: string) {
  return language.toLowerCase().startsWith('es')
    ? {
        compatibility: 'CasaMia confirmará compatibilidad y alcance antes de aprobar la propuesta.',
        package: 'Precio confirmado después de la revisión de CasaMia.',
      }
    : {
        compatibility: 'CasaMia will confirm compatibility and scope before approving the proposal.',
        package: 'Price confirmed after CasaMia review.',
      }
}
