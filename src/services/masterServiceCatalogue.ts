import { masterServiceCatalogue } from '../config/masterServiceCatalogue.ts'
import type {
  CasaMiaService,
  MasterCatalogueCapability,
  MasterCatalogueInstallationTask,
  MasterCatalogueOutcome,
  MasterCatalogueProduct,
  MasterCatalogueRelation,
  MasterServiceCatalogue,
  ServiceCatalogueSection,
  ServicePackageArea,
  ServiceRoom,
} from '../types/serviceCatalogue.ts'

const sectionMap: Record<MasterCatalogueOutcome['section'], ServiceCatalogueSection> = {
  'connected-room': 'connected_room',
  'home-safety-package': 'home_safety_package',
  'optional-adaptations': 'optional_adaptations',
}

const pricingMap: Record<MasterCatalogueOutcome['pricingType'], CasaMiaService['pricingType']> = {
  fixed: 'fixed',
  from: 'from',
  'included-in-package': 'quote_only',
  quote: 'quote_only',
  range: 'from',
  recurring: 'from',
}

export function getMasterServiceCatalogue(): MasterServiceCatalogue {
  return clone(masterServiceCatalogue)
}

export function getPackagesByRoom(roomId: string, catalogue = masterServiceCatalogue) {
  return catalogue.packages
    .filter((item) => item.active && item.roomId === roomId)
    .sort(sortByOrder)
}

export function getOutcomesByPackage(packageId: string, catalogue = masterServiceCatalogue) {
  const outcomeIds = getRelatedIds(catalogue.relations, 'packageOutcome', packageId)
  return outcomeIds
    .map((id) => catalogue.outcomes.find((item) => item.id === id))
    .filter((item): item is MasterCatalogueOutcome => Boolean(item?.active))
    .sort(sortByOrder)
}

export function getCapabilitiesByOutcome(outcomeId: string, catalogue = masterServiceCatalogue) {
  const capabilityIds = getRelatedIds(catalogue.relations, 'outcomeCapability', outcomeId)
  return capabilityIds
    .map((id) => catalogue.capabilities.find((item) => item.id === id))
    .filter((item): item is MasterCatalogueCapability => Boolean(item?.active))
}

export function getProductsByCapability(capabilityId: string, catalogue = masterServiceCatalogue) {
  const productIds = getRelatedIds(catalogue.relations, 'capabilityProduct', capabilityId)
  return productIds
    .map((id) => catalogue.products.find((item) => item.id === id))
    .filter((item): item is MasterCatalogueProduct => Boolean(item?.active))
}

export function getTasksByCapability(capabilityId: string, catalogue = masterServiceCatalogue) {
  const taskIds = getRelatedIds(catalogue.relations, 'capabilityInstallationTask', capabilityId)
  return taskIds
    .map((id) => catalogue.installationTasks.find((item) => item.id === id))
    .filter((item): item is MasterCatalogueInstallationTask => Boolean(item?.active))
}

export function getCustomerCatalogueByRoom(roomId: string, catalogue = masterServiceCatalogue) {
  return getPackagesByRoom(roomId, catalogue).map((packageRecord) => ({
    package: packageRecord,
    outcomes: getOutcomesByPackage(packageRecord.id, catalogue),
  }))
}

export function getWizardVisibleOutcomes(catalogue = masterServiceCatalogue) {
  return catalogue.outcomes.filter((item) => item.active && item.wizardVisible).sort(sortByOrder)
}

export function getQuoteRequiredOutcomes(catalogue = masterServiceCatalogue) {
  return catalogue.outcomes.filter((item) => item.active && item.requiresQuote).sort(sortByOrder)
}

export function getInspectorSpecificationForOutcome(outcomeId: string, catalogue = masterServiceCatalogue) {
  const outcome = catalogue.outcomes.find((item) => item.id === outcomeId)
  const capabilities = getCapabilitiesByOutcome(outcomeId, catalogue)
  const products = uniqueById(capabilities.flatMap((capability) => getProductsByCapability(capability.id, catalogue)))
  const installationTasks = uniqueById(capabilities.flatMap((capability) => getTasksByCapability(capability.id, catalogue)))

  return { capabilities, installationTasks, outcome, products }
}

export function getProposalSpecificationForOutcome(outcomeId: string, catalogue = masterServiceCatalogue) {
  return getInspectorSpecificationForOutcome(outcomeId, catalogue)
}

export function flattenMasterCatalogueForCompatibility(catalogue = masterServiceCatalogue): CasaMiaService[] {
  return catalogue.outcomes
    .filter((outcome) => outcome.active)
    .sort(sortByOrder)
    .map((outcome) => flattenOutcome(outcome, catalogue))
}

export function getCataloguePricingInputForOutcome(outcomeId: string, catalogue = masterServiceCatalogue) {
  const packageRecord = catalogue.packages.find((item) =>
    getOutcomesByPackage(item.id, catalogue).some((outcome) => outcome.id === outcomeId),
  )
  const outcome = catalogue.outcomes.find((item) => item.id === outcomeId)
  const specification = getInspectorSpecificationForOutcome(outcomeId, catalogue)

  return {
    outcome,
    package: packageRecord,
    productRetailTotal: specification.products.reduce((sum, product) => sum + (product.retailPrice ?? 0), 0),
    taskMinutes: specification.installationTasks.reduce((sum, task) => sum + task.estimatedMinutes, 0),
  }
}

export function exportMasterCatalogueJson(catalogue = masterServiceCatalogue) {
  return JSON.stringify(catalogue, null, 2)
}

export function exportMasterCatalogueCsvFiles(catalogue = masterServiceCatalogue) {
  return {
    'packages.csv': toCsv(catalogue.packages),
    'outcomes.csv': toCsv(catalogue.outcomes),
    'capabilities.csv': toCsv(catalogue.capabilities),
    'products.csv': toCsv(catalogue.products),
    'installation-tasks.csv': toCsv(catalogue.installationTasks),
    'package-outcomes.csv': toCsv(catalogue.relations.filter((relation) => relation.type === 'packageOutcome')),
    'outcome-capabilities.csv': toCsv(catalogue.relations.filter((relation) => relation.type === 'outcomeCapability')),
    'capability-products.csv': toCsv(catalogue.relations.filter((relation) => relation.type === 'capabilityProduct')),
    'capability-tasks.csv': toCsv(catalogue.relations.filter((relation) => relation.type === 'capabilityInstallationTask')),
  }
}

function flattenOutcome(outcome: MasterCatalogueOutcome, catalogue: MasterServiceCatalogue): CasaMiaService {
  const capabilities = getCapabilitiesByOutcome(outcome.id, catalogue)
  const products = uniqueById(capabilities.flatMap((capability) => getProductsByCapability(capability.id, catalogue)))
  const tasks = uniqueById(capabilities.flatMap((capability) => getTasksByCapability(capability.id, catalogue)))
  const packageRecord = catalogue.packages.find((item) => item.id === outcome.packageId)
  const smartDependencies = [
    outcome.requiresSmartSpeaker
      ? {
          dependencyType: 'smart_speaker' as const,
          internalName: 'Configured smart speaker',
          required: true,
          customerVisible: false,
          notes: 'Device selected internally after compatibility review.',
        }
      : null,
    outcome.requiresCompatibilityCheck
      ? {
          dependencyType: 'compatible_device' as const,
          internalName: 'Compatibility check',
          required: true,
          customerVisible: false,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))

  return {
    id: outcome.legacyId ?? outcome.id,
    slug: outcome.slug,
    name: outcome.customerName.en ?? outcome.internalName,
    customerName: outcome.customerName.en ?? outcome.internalName,
    internalName: outcome.internalName,
    shortDescription: outcome.shortDescription.en ?? '',
    customerDescription: outcome.shortDescription.en ?? '',
    customerBenefit: outcome.customerBenefit.en ?? '',
    outcome: outcome.customerBenefit.en ?? '',
    plainLanguageSummary: outcome.shortDescription.en ?? '',
    room: outcome.roomId as ServiceRoom,
    category: outcome.category,
    section: sectionMap[outcome.section],
    status: 'active',
    version: outcome.version,
    priority: outcome.priority,
    websiteVisible: outcome.websiteVisible,
    wizardVisible: outcome.wizardVisible,
    proposalVisible: outcome.proposalVisible,
    inspectorVisible: outcome.inspectorVisible,
    adminVisible: outcome.adminVisible,
    crmVisible: true,
    mobileVisible: true,
    visibility: {
      admin: outcome.adminVisible,
      crm: true,
      inspector: outcome.inspectorVisible,
      mobile: true,
      proposal: outcome.proposalVisible,
      website: outcome.websiteVisible,
      wizard: outcome.wizardVisible,
    },
    componentRole: outcome.priority === 'optional' ? 'option' : 'core',
    pricingType: pricingMap[outcome.pricingType],
    fromPrice: outcome.fromPrice,
    productPrice: outcome.fixedPrice,
    recurringMonthlyPrice: outcome.recurringMonthlyPrice,
    vatRate: outcome.vatRate,
    pricing: {
      priceNotes: packageRecord?.pricingType === 'quote' ? 'Package price confirmed after assessment.' : undefined,
    },
    quantityType: 'per_room',
    requiresAssessment: outcome.requiresAssessment,
    requiresInstallation: tasks.length > 0,
    requiresMeasurement: outcome.requiresMeasurement,
    requiresSiteVisit: outcome.requiresSiteVisit,
    requiresCompatibilityCheck: outcome.requiresCompatibilityCheck,
    requiresQuote: outcome.requiresQuote,
    requirements: {
      assessment: outcome.requiresAssessment,
      compatibilityCheck: outcome.requiresCompatibilityCheck,
      installation: tasks.length > 0,
      measurement: outcome.requiresMeasurement,
      quote: outcome.requiresQuote,
      siteVisit: outcome.requiresSiteVisit,
    },
    grant: {
      categories: outcome.grantEligible ? [outcome.roomId, outcome.section] : [],
      eligible: outcome.grantEligible,
    },
    typicalInstallationTime: tasks.length
      ? `${tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0)} minutes estimated`
      : undefined,
    internalComponents: products.map((product) => ({
      componentType: product.productType === 'device' ? 'hardware' : product.productType === 'software' ? 'software' : 'hardware',
      customerVisible: false,
      internalName: product.name,
      sku: product.sku,
      supplier: product.supplier,
    })),
    smartDependencies: smartDependencies.length ? smartDependencies : undefined,
    includedItems: capabilities.map((capability) => capability.name),
    wizardAreas: outcome.wizardAreas as ServicePackageArea[],
    safetyNotice: outcome.safetyNotice?.en,
    translations: {
      es: {
        customerBenefit: outcome.customerBenefit.es,
        customerDescription: outcome.shortDescription.es,
        customerName: outcome.customerName.es,
        includedItems: capabilities.map((capability) => capability.name),
        name: outcome.customerName.es,
        outcome: outcome.customerBenefit.es,
        plainLanguageSummary: outcome.shortDescription.es,
        safetyNotice: outcome.safetyNotice?.es,
        shortDescription: outcome.shortDescription.es,
      },
    },
    active: outcome.active,
  }
}

function getRelatedIds(relations: MasterCatalogueRelation[], type: MasterCatalogueRelation['type'], fromId: string) {
  return relations
    .filter((relation) => relation.type === type && relation.fromId === fromId)
    .sort(sortByOrder)
    .map((relation) => relation.toId)
}

function sortByOrder<T extends { sortOrder: number }>(left: T, right: T) {
  return left.sortOrder - right.sortOrder
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()]
}

function toCsv(records: Array<Record<string, unknown>>) {
  if (!records.length) return ''
  const columns = [...new Set(records.flatMap((record) => Object.keys(record)))]
  const rows = records.map((record) => columns.map((column) => csvEscape(record[column])).join(','))
  return [columns.join(','), ...rows].join('\n')
}

function csvEscape(value: unknown) {
  if (value === undefined || value === null) return ''
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
