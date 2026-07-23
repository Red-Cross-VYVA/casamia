import type {
  MasterCatalogueCapability,
  MasterCatalogueInstallationTask,
  MasterCatalogueOutcome,
  MasterCataloguePackage,
  MasterCatalogueProduct,
  MasterCatalogueRelation,
  MasterCatalogueSectionId,
  MasterPricingType,
  MasterRelationType,
  MasterServiceCatalogue,
  QuantityType,
  ServicePackageArea,
  ServicePriority,
} from '../types/serviceCatalogue.ts'

export const masterCatalogueCsvBundleFiles = [
  'packages.csv',
  'outcomes.csv',
  'capabilities.csv',
  'products.csv',
  'installation-tasks.csv',
  'package-outcomes.csv',
  'outcome-capabilities.csv',
  'capability-products.csv',
  'capability-tasks.csv',
] as const

export type MasterCatalogueCsvBundleFile = (typeof masterCatalogueCsvBundleFiles)[number]

export type MasterCatalogueBundleImportPreview = {
  catalogue: MasterServiceCatalogue
  counts: {
    capabilities: number
    installationTasks: number
    outcomes: number
    packages: number
    products: number
    relations: number
  }
  errors: string[]
  roomId: 'bathroom'
  warnings: string[]
}

const now = '2026-07-23T00:00:00.000Z'

const packageColumns = [
  'id',
  'slug',
  'roomId',
  'section',
  'customerNameEn',
  'customerNameEs',
  'internalName',
  'shortDescriptionEn',
  'shortDescriptionEs',
  'customerBenefitEn',
  'customerBenefitEs',
  'pricingType',
  'fromPrice',
  'fixedPrice',
  'recurringMonthlyPrice',
  'vatRate',
  'requiresAssessment',
  'requiresSiteVisit',
  'requiresQuote',
  'active',
  'wizardVisible',
  'websiteVisible',
  'proposalVisible',
  'inspectorVisible',
  'adminVisible',
  'sortOrder',
  'version',
] as const

const outcomeColumns = [
  'id',
  'legacyId',
  'slug',
  'roomId',
  'section',
  'packageId',
  'customerNameEn',
  'customerNameEs',
  'internalName',
  'category',
  'shortDescriptionEn',
  'shortDescriptionEs',
  'detailedDescriptionEn',
  'detailedDescriptionEs',
  'customerBenefitEn',
  'customerBenefitEs',
  'priority',
  'pricingType',
  'fromPrice',
  'fixedPrice',
  'recurringMonthlyPrice',
  'vatRate',
  'requiresAssessment',
  'requiresMeasurement',
  'requiresSiteVisit',
  'requiresCompatibilityCheck',
  'requiresQuote',
  'grantEligible',
  'technologyEnabled',
  'voiceEnabled',
  'requiresSmartSpeaker',
  'wizardAreas',
  'wizardTags',
  'safetyNoticeEn',
  'safetyNoticeEs',
  'implementationNotes',
  'active',
  'websiteVisible',
  'wizardVisible',
  'proposalVisible',
  'inspectorVisible',
  'adminVisible',
  'sortOrder',
  'version',
] as const

const capabilityColumns = [
  'id',
  'slug',
  'name',
  'description',
  'technologyEnabled',
  'requiresCompatibilityCheck',
  'implementationNotes',
  'active',
] as const

const productColumns = [
  'id',
  'slug',
  'sku',
  'supplier',
  'manufacturer',
  'model',
  'productType',
  'name',
  'internalDescription',
  'unitCost',
  'retailPrice',
  'recurringMonthlyPrice',
  'vatRate',
  'currency',
  'quantityType',
  'stockTracked',
  'grantEligible',
  'installationRequired',
  'requiresCompatibilityCheck',
  'compatibilityNotes',
  'safetyNotice',
  'technicalSpecification',
  'active',
  'version',
] as const

const taskColumns = [
  'id',
  'slug',
  'name',
  'description',
  'estimatedMinutes',
  'skillType',
  'installerType',
  'labourRate',
  'requiresSiteVisit',
  'requiresMeasurement',
  'safetyChecklist',
  'completionChecklist',
  'active',
  'version',
] as const

const relationColumns = [
  'id',
  'type',
  'fromId',
  'toId',
  'required',
  'defaultIncluded',
  'optionalUpgrade',
  'minimumQuantity',
  'maximumQuantity',
  'sortOrder',
  'notes',
] as const

export function exportBathroomMasterCatalogueCsvTemplates(
  catalogue: MasterServiceCatalogue,
): Record<MasterCatalogueCsvBundleFile, string> {
  const roomId = 'bathroom'
  const packages = catalogue.packages.filter((item) => item.roomId === roomId)
  const packageIds = new Set(packages.map((item) => item.id))
  const outcomes = catalogue.outcomes.filter((item) => item.roomId === roomId || packageIds.has(item.packageId))
  const outcomeIds = new Set(outcomes.map((item) => item.id))
  const packageOutcomeRelations = catalogue.relations.filter(
    (item) => item.type === 'packageOutcome' && packageIds.has(item.fromId) && outcomeIds.has(item.toId),
  )
  const outcomeCapabilityRelations = catalogue.relations.filter(
    (item) => item.type === 'outcomeCapability' && outcomeIds.has(item.fromId),
  )
  const capabilityIds = new Set(outcomeCapabilityRelations.map((item) => item.toId))
  const capabilities = catalogue.capabilities.filter((item) => capabilityIds.has(item.id))
  const capabilityProductRelations = catalogue.relations.filter(
    (item) => item.type === 'capabilityProduct' && capabilityIds.has(item.fromId),
  )
  const capabilityTaskRelations = catalogue.relations.filter(
    (item) => item.type === 'capabilityInstallationTask' && capabilityIds.has(item.fromId),
  )
  const productIds = new Set(capabilityProductRelations.map((item) => item.toId))
  const taskIds = new Set(capabilityTaskRelations.map((item) => item.toId))

  return {
    'packages.csv': toCsv(packageColumns, packages.map(packageToRow)),
    'outcomes.csv': toCsv(outcomeColumns, outcomes.map(outcomeToRow)),
    'capabilities.csv': toCsv(capabilityColumns, capabilities.map(capabilityToRow)),
    'products.csv': toCsv(productColumns, catalogue.products.filter((item) => productIds.has(item.id)).map(productToRow)),
    'installation-tasks.csv': toCsv(
      taskColumns,
      catalogue.installationTasks.filter((item) => taskIds.has(item.id)).map(taskToRow),
    ),
    'package-outcomes.csv': toCsv(relationColumns, packageOutcomeRelations.map(relationToRow)),
    'outcome-capabilities.csv': toCsv(relationColumns, outcomeCapabilityRelations.map(relationToRow)),
    'capability-products.csv': toCsv(relationColumns, capabilityProductRelations.map(relationToRow)),
    'capability-tasks.csv': toCsv(relationColumns, capabilityTaskRelations.map(relationToRow)),
  }
}

export function buildBathroomMasterCatalogueImportPreview(
  files: Partial<Record<MasterCatalogueCsvBundleFile, string>>,
  currentCatalogue: MasterServiceCatalogue,
): MasterCatalogueBundleImportPreview {
  const warnings: string[] = []
  const errors: string[] = []
  const missingFiles = masterCatalogueCsvBundleFiles.filter((fileName) => !files[fileName]?.trim())

  if (missingFiles.length) {
    errors.push(`Missing required CSV file${missingFiles.length === 1 ? '' : 's'}: ${missingFiles.join(', ')}`)
  }

  const packages = parseRows(files['packages.csv'] ?? '').map(packageFromRow)
  const outcomes = parseRows(files['outcomes.csv'] ?? '').map(outcomeFromRow)
  const capabilities = parseRows(files['capabilities.csv'] ?? '').map(capabilityFromRow)
  const products = parseRows(files['products.csv'] ?? '').map(productFromRow)
  const installationTasks = parseRows(files['installation-tasks.csv'] ?? '').map(taskFromRow)
  const relations = [
    ...parseRelationFile(files['package-outcomes.csv'], 'packageOutcome'),
    ...parseRelationFile(files['outcome-capabilities.csv'], 'outcomeCapability'),
    ...parseRelationFile(files['capability-products.csv'], 'capabilityProduct'),
    ...parseRelationFile(files['capability-tasks.csv'], 'capabilityInstallationTask'),
  ]

  const packageIds = new Set(packages.map((item) => item.id))
  const outcomeIds = new Set(outcomes.map((item) => item.id))
  const capabilityIds = new Set(capabilities.map((item) => item.id))
  const productIds = new Set(products.map((item) => item.id))
  const taskIds = new Set(installationTasks.map((item) => item.id))

  validateDuplicateIds('packages', packages, errors)
  validateDuplicateIds('outcomes', outcomes, errors)
  validateDuplicateIds('capabilities', capabilities, errors)
  validateDuplicateIds('products', products, errors)
  validateDuplicateIds('installation tasks', installationTasks, errors)
  validateDuplicateIds('relations', relations, errors)

  packages.forEach((item) => {
    if (item.roomId !== 'bathroom') errors.push(`${item.id}: Bathroom import only accepts bathroom packages.`)
    if (!item.customerName.en) errors.push(`${item.id}: missing customerNameEn.`)
  })

  outcomes.forEach((item) => {
    if (item.roomId !== 'bathroom') errors.push(`${item.id}: Bathroom import only accepts bathroom outcomes.`)
    if (!packageIds.has(item.packageId)) errors.push(`${item.id}: packageId does not exist in packages.csv.`)
    if (!item.customerName.en) errors.push(`${item.id}: missing customerNameEn.`)
    if (!item.shortDescription.en) warnings.push(`${item.id}: customer short description is empty.`)
    if (!item.wizardAreas.length) warnings.push(`${item.id}: wizardAreas is empty.`)
  })

  relations.forEach((relation) => {
    if (relation.type === 'packageOutcome') {
      if (!packageIds.has(relation.fromId)) errors.push(`${relation.id}: packageOutcome fromId not found.`)
      if (!outcomeIds.has(relation.toId)) errors.push(`${relation.id}: packageOutcome toId not found.`)
    }

    if (relation.type === 'outcomeCapability') {
      if (!outcomeIds.has(relation.fromId)) errors.push(`${relation.id}: outcomeCapability fromId not found.`)
      if (!capabilityIds.has(relation.toId)) errors.push(`${relation.id}: outcomeCapability toId not found.`)
    }

    if (relation.type === 'capabilityProduct') {
      if (!capabilityIds.has(relation.fromId)) errors.push(`${relation.id}: capabilityProduct fromId not found.`)
      if (!productIds.has(relation.toId)) errors.push(`${relation.id}: capabilityProduct toId not found.`)
    }

    if (relation.type === 'capabilityInstallationTask') {
      if (!capabilityIds.has(relation.fromId)) errors.push(`${relation.id}: capabilityTask fromId not found.`)
      if (!taskIds.has(relation.toId)) errors.push(`${relation.id}: capabilityTask toId not found.`)
    }
  })

  const bathroomPackageIds = new Set(currentCatalogue.packages.filter((item) => item.roomId === 'bathroom').map((item) => item.id))
  const bathroomOutcomeIds = new Set(currentCatalogue.outcomes.filter((item) => item.roomId === 'bathroom').map((item) => item.id))
  const bathroomRelationIdsToReplace = new Set(
    currentCatalogue.relations
      .filter((relation) => {
        if (relation.type === 'packageOutcome') return bathroomPackageIds.has(relation.fromId)
        if (relation.type === 'outcomeCapability') return bathroomOutcomeIds.has(relation.fromId)
        return false
      })
      .map((relation) => relation.id),
  )
  const uploadedCapabilityIds = new Set(capabilities.map((item) => item.id))

  const catalogue: MasterServiceCatalogue = {
    ...currentCatalogue,
    packages: [
      ...currentCatalogue.packages.filter((item) => item.roomId !== 'bathroom'),
      ...packages,
    ].sort(sortByOrder),
    outcomes: [
      ...currentCatalogue.outcomes.filter((item) => item.roomId !== 'bathroom'),
      ...outcomes,
    ].sort(sortByOrder),
    capabilities: upsertById(currentCatalogue.capabilities, capabilities),
    products: upsertById(currentCatalogue.products, products),
    installationTasks: upsertById(currentCatalogue.installationTasks, installationTasks),
    relations: [
      ...currentCatalogue.relations.filter((relation) => {
        if (bathroomRelationIdsToReplace.has(relation.id)) return false
        if (
          (relation.type === 'capabilityProduct' || relation.type === 'capabilityInstallationTask') &&
          uploadedCapabilityIds.has(relation.fromId)
        ) {
          return false
        }
        return true
      }),
      ...relations,
    ].sort(sortByOrder),
    updatedAt: now,
  }

  return {
    catalogue,
    counts: {
      capabilities: capabilities.length,
      installationTasks: installationTasks.length,
      outcomes: outcomes.length,
      packages: packages.length,
      products: products.length,
      relations: relations.length,
    },
    errors,
    roomId: 'bathroom',
    warnings,
  }
}

function packageToRow(item: MasterCataloguePackage) {
  return {
    active: String(item.active),
    adminVisible: String(item.adminVisible),
    customerBenefitEn: item.customerBenefit.en ?? '',
    customerBenefitEs: item.customerBenefit.es ?? '',
    customerNameEn: item.customerName.en ?? '',
    customerNameEs: item.customerName.es ?? '',
    fixedPrice: optionalNumber(item.fixedPrice),
    fromPrice: optionalNumber(item.fromPrice),
    id: item.id,
    inspectorVisible: String(item.inspectorVisible),
    internalName: item.internalName,
    pricingType: item.pricingType,
    proposalVisible: String(item.proposalVisible),
    recurringMonthlyPrice: optionalNumber(item.recurringMonthlyPrice),
    requiresAssessment: String(item.requiresAssessment),
    requiresQuote: String(item.requiresQuote),
    requiresSiteVisit: String(item.requiresSiteVisit),
    roomId: item.roomId,
    section: item.section,
    shortDescriptionEn: item.shortDescription.en ?? '',
    shortDescriptionEs: item.shortDescription.es ?? '',
    slug: item.slug,
    sortOrder: String(item.sortOrder),
    vatRate: String(item.vatRate),
    version: item.version,
    websiteVisible: String(item.websiteVisible),
    wizardVisible: String(item.wizardVisible),
  }
}

function outcomeToRow(item: MasterCatalogueOutcome) {
  return {
    active: String(item.active),
    adminVisible: String(item.adminVisible),
    category: item.category,
    customerBenefitEn: item.customerBenefit.en ?? '',
    customerBenefitEs: item.customerBenefit.es ?? '',
    customerNameEn: item.customerName.en ?? '',
    customerNameEs: item.customerName.es ?? '',
    detailedDescriptionEn: item.detailedDescription?.en ?? '',
    detailedDescriptionEs: item.detailedDescription?.es ?? '',
    fixedPrice: optionalNumber(item.fixedPrice),
    fromPrice: optionalNumber(item.fromPrice),
    grantEligible: String(item.grantEligible),
    id: item.id,
    implementationNotes: item.implementationNotes ?? '',
    inspectorVisible: String(item.inspectorVisible),
    internalName: item.internalName,
    legacyId: item.legacyId ?? '',
    packageId: item.packageId,
    pricingType: item.pricingType,
    priority: item.priority,
    proposalVisible: String(item.proposalVisible),
    recurringMonthlyPrice: optionalNumber(item.recurringMonthlyPrice),
    requiresAssessment: String(item.requiresAssessment),
    requiresCompatibilityCheck: String(item.requiresCompatibilityCheck),
    requiresMeasurement: String(item.requiresMeasurement),
    requiresQuote: String(item.requiresQuote),
    requiresSiteVisit: String(item.requiresSiteVisit),
    requiresSmartSpeaker: String(item.requiresSmartSpeaker),
    roomId: item.roomId,
    safetyNoticeEn: item.safetyNotice?.en ?? '',
    safetyNoticeEs: item.safetyNotice?.es ?? '',
    section: item.section,
    shortDescriptionEn: item.shortDescription.en ?? '',
    shortDescriptionEs: item.shortDescription.es ?? '',
    slug: item.slug,
    sortOrder: String(item.sortOrder),
    technologyEnabled: String(item.technologyEnabled),
    vatRate: String(item.vatRate),
    version: item.version,
    voiceEnabled: String(item.voiceEnabled),
    websiteVisible: String(item.websiteVisible),
    wizardAreas: item.wizardAreas.join('|'),
    wizardTags: item.wizardTags.join('|'),
    wizardVisible: String(item.wizardVisible),
  }
}

function capabilityToRow(item: MasterCatalogueCapability) {
  return {
    active: String(item.active),
    description: item.description,
    id: item.id,
    implementationNotes: item.implementationNotes ?? '',
    name: item.name,
    requiresCompatibilityCheck: String(item.requiresCompatibilityCheck),
    slug: item.slug,
    technologyEnabled: String(item.technologyEnabled),
  }
}

function productToRow(item: MasterCatalogueProduct) {
  return {
    active: String(item.active),
    compatibilityNotes: item.compatibilityNotes ?? '',
    currency: item.currency,
    grantEligible: String(item.grantEligible),
    id: item.id,
    installationRequired: String(item.installationRequired),
    internalDescription: item.internalDescription,
    manufacturer: item.manufacturer ?? '',
    model: item.model ?? '',
    name: item.name,
    productType: item.productType,
    quantityType: item.quantityType,
    recurringMonthlyPrice: optionalNumber(item.recurringMonthlyPrice),
    requiresCompatibilityCheck: String(item.requiresCompatibilityCheck),
    retailPrice: optionalNumber(item.retailPrice),
    safetyNotice: item.safetyNotice ?? '',
    sku: item.sku ?? '',
    slug: item.slug,
    stockTracked: String(item.stockTracked),
    supplier: item.supplier ?? '',
    technicalSpecification: item.technicalSpecification ?? '',
    unitCost: optionalNumber(item.unitCost),
    vatRate: String(item.vatRate),
    version: item.version,
  }
}

function taskToRow(item: MasterCatalogueInstallationTask) {
  return {
    active: String(item.active),
    completionChecklist: item.completionChecklist.join('|'),
    description: item.description,
    estimatedMinutes: String(item.estimatedMinutes),
    id: item.id,
    installerType: item.installerType,
    labourRate: optionalNumber(item.labourRate),
    name: item.name,
    requiresMeasurement: String(item.requiresMeasurement),
    requiresSiteVisit: String(item.requiresSiteVisit),
    safetyChecklist: item.safetyChecklist.join('|'),
    skillType: item.skillType,
    slug: item.slug,
    version: item.version,
  }
}

function relationToRow(item: MasterCatalogueRelation) {
  return {
    defaultIncluded: String(item.defaultIncluded),
    fromId: item.fromId,
    id: item.id,
    maximumQuantity: optionalNumber(item.maximumQuantity),
    minimumQuantity: optionalNumber(item.minimumQuantity),
    notes: item.notes ?? '',
    optionalUpgrade: String(item.optionalUpgrade),
    required: String(item.required),
    sortOrder: String(item.sortOrder),
    toId: item.toId,
    type: item.type,
  }
}

function packageFromRow(row: Record<string, string>): MasterCataloguePackage {
  return {
    active: parseBoolean(row.active, true),
    adminVisible: parseBoolean(row.adminVisible, true),
    createdAt: now,
    customerBenefit: { en: clean(row.customerBenefitEn), es: clean(row.customerBenefitEs) },
    customerName: { en: clean(row.customerNameEn), es: clean(row.customerNameEs) },
    fixedPrice: parseOptionalNumber(row.fixedPrice),
    fromPrice: parseOptionalNumber(row.fromPrice),
    id: requiredText(row.id),
    inspectorVisible: parseBoolean(row.inspectorVisible, true),
    internalName: clean(row.internalName) || clean(row.customerNameEn),
    pricingType: parsePricingType(row.pricingType),
    proposalVisible: parseBoolean(row.proposalVisible, true),
    recurringMonthlyPrice: parseOptionalNumber(row.recurringMonthlyPrice),
    requiresAssessment: parseBoolean(row.requiresAssessment, true),
    requiresQuote: parseBoolean(row.requiresQuote, false),
    requiresSiteVisit: parseBoolean(row.requiresSiteVisit, false),
    roomId: clean(row.roomId) || 'bathroom',
    section: parseSection(row.section),
    shortDescription: { en: clean(row.shortDescriptionEn), es: clean(row.shortDescriptionEs) },
    slug: clean(row.slug) || requiredText(row.id),
    sortOrder: parseNumber(row.sortOrder, 999),
    updatedAt: now,
    vatRate: parseVatRate(row.vatRate),
    version: clean(row.version) || '1.0.0',
    websiteVisible: parseBoolean(row.websiteVisible, true),
    wizardVisible: parseBoolean(row.wizardVisible, true),
  }
}

function outcomeFromRow(row: Record<string, string>): MasterCatalogueOutcome {
  const detailedDescription = localizedOptional(row.detailedDescriptionEn, row.detailedDescriptionEs)
  const safetyNotice = localizedOptional(row.safetyNoticeEn, row.safetyNoticeEs)

  return {
    active: parseBoolean(row.active, true),
    adminVisible: parseBoolean(row.adminVisible, true),
    category: clean(row.category),
    customerBenefit: { en: clean(row.customerBenefitEn), es: clean(row.customerBenefitEs) },
    customerName: { en: clean(row.customerNameEn), es: clean(row.customerNameEs) },
    detailedDescription,
    fixedPrice: parseOptionalNumber(row.fixedPrice),
    fromPrice: parseOptionalNumber(row.fromPrice),
    grantEligible: parseBoolean(row.grantEligible, false),
    id: requiredText(row.id),
    implementationNotes: clean(row.implementationNotes) || undefined,
    inspectorVisible: parseBoolean(row.inspectorVisible, true),
    internalName: clean(row.internalName) || clean(row.customerNameEn),
    legacyId: clean(row.legacyId) || undefined,
    packageId: requiredText(row.packageId),
    pricingType: parsePricingType(row.pricingType),
    priority: parsePriority(row.priority),
    proposalVisible: parseBoolean(row.proposalVisible, true),
    recurringMonthlyPrice: parseOptionalNumber(row.recurringMonthlyPrice),
    requiresAssessment: parseBoolean(row.requiresAssessment, true),
    requiresCompatibilityCheck: parseBoolean(row.requiresCompatibilityCheck, false),
    requiresMeasurement: parseBoolean(row.requiresMeasurement, false),
    requiresQuote: parseBoolean(row.requiresQuote, false),
    requiresSiteVisit: parseBoolean(row.requiresSiteVisit, false),
    requiresSmartSpeaker: parseBoolean(row.requiresSmartSpeaker, false),
    roomId: clean(row.roomId) || 'bathroom',
    safetyNotice,
    section: parseSection(row.section),
    shortDescription: { en: clean(row.shortDescriptionEn), es: clean(row.shortDescriptionEs) },
    slug: clean(row.slug) || requiredText(row.id),
    sortOrder: parseNumber(row.sortOrder, 999),
    technologyEnabled: parseBoolean(row.technologyEnabled, false),
    updatedAt: now,
    vatRate: parseVatRate(row.vatRate),
    version: clean(row.version) || '1.0.0',
    voiceEnabled: parseBoolean(row.voiceEnabled, false),
    websiteVisible: parseBoolean(row.websiteVisible, true),
    wizardAreas: parseList(row.wizardAreas) as ServicePackageArea[],
    wizardTags: parseList(row.wizardTags),
    wizardVisible: parseBoolean(row.wizardVisible, true),
    createdAt: now,
  }
}

function capabilityFromRow(row: Record<string, string>): MasterCatalogueCapability {
  return {
    active: parseBoolean(row.active, true),
    description: clean(row.description),
    id: requiredText(row.id),
    implementationNotes: clean(row.implementationNotes) || undefined,
    name: clean(row.name),
    requiresCompatibilityCheck: parseBoolean(row.requiresCompatibilityCheck, false),
    slug: clean(row.slug) || requiredText(row.id),
    technologyEnabled: parseBoolean(row.technologyEnabled, false),
  }
}

function productFromRow(row: Record<string, string>): MasterCatalogueProduct {
  return {
    active: parseBoolean(row.active, true),
    compatibilityNotes: clean(row.compatibilityNotes) || undefined,
    currency: 'EUR',
    grantEligible: parseBoolean(row.grantEligible, false),
    id: requiredText(row.id),
    installationRequired: parseBoolean(row.installationRequired, true),
    internalDescription: clean(row.internalDescription),
    manufacturer: clean(row.manufacturer) || undefined,
    model: clean(row.model) || undefined,
    name: clean(row.name),
    productType: parseProductType(row.productType),
    quantityType: parseQuantityType(row.quantityType),
    recurringMonthlyPrice: parseOptionalNumber(row.recurringMonthlyPrice),
    requiresCompatibilityCheck: parseBoolean(row.requiresCompatibilityCheck, false),
    retailPrice: parseOptionalNumber(row.retailPrice),
    safetyNotice: clean(row.safetyNotice) || undefined,
    sku: clean(row.sku) || undefined,
    slug: clean(row.slug) || requiredText(row.id),
    stockTracked: parseBoolean(row.stockTracked, false),
    supplier: clean(row.supplier) || undefined,
    technicalSpecification: clean(row.technicalSpecification) || undefined,
    unitCost: parseOptionalNumber(row.unitCost),
    vatRate: parseVatRate(row.vatRate),
    version: clean(row.version) || '1.0.0',
  }
}

function taskFromRow(row: Record<string, string>): MasterCatalogueInstallationTask {
  return {
    active: parseBoolean(row.active, true),
    completionChecklist: parseList(row.completionChecklist),
    description: clean(row.description),
    estimatedMinutes: parseNumber(row.estimatedMinutes, 30),
    id: requiredText(row.id),
    installerType: parseInstallerType(row.installerType),
    labourRate: parseOptionalNumber(row.labourRate),
    name: clean(row.name),
    requiresMeasurement: parseBoolean(row.requiresMeasurement, false),
    requiresSiteVisit: parseBoolean(row.requiresSiteVisit, false),
    safetyChecklist: parseList(row.safetyChecklist),
    skillType: parseSkillType(row.skillType),
    slug: clean(row.slug) || requiredText(row.id),
    version: clean(row.version) || '1.0.0',
  }
}

function parseRelationFile(text: string | undefined, expectedType: MasterRelationType) {
  return parseRows(text ?? '').map((row): MasterCatalogueRelation => ({
    defaultIncluded: parseBoolean(row.defaultIncluded, true),
    fromId: requiredText(row.fromId),
    id: clean(row.id) || `${expectedType}-${requiredText(row.fromId)}-${requiredText(row.toId)}`,
    maximumQuantity: parseOptionalNumber(row.maximumQuantity),
    minimumQuantity: parseOptionalNumber(row.minimumQuantity),
    notes: clean(row.notes) || undefined,
    optionalUpgrade: parseBoolean(row.optionalUpgrade, false),
    required: parseBoolean(row.required, true),
    sortOrder: parseNumber(row.sortOrder, 999),
    toId: requiredText(row.toId),
    type: expectedType,
  }))
}

function parseRows(text: string) {
  if (!text.trim()) return []
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim()))
  const headers = rows[0]?.map((header) => header.trim()) ?? []
  return rows.slice(1).map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() ?? ''])),
  )
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let cell = ''
  let row: string[] = []
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"' && quoted && nextChar === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && nextChar === '\n') index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

function toCsv<T extends readonly string[]>(columns: T, rows: Array<Record<T[number], string>>) {
  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column as T[number]] ?? '')).join(',')),
  ].join('\r\n')
}

function csvEscape(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function localizedOptional(en: string | undefined, es: string | undefined) {
  const next = { en: clean(en), es: clean(es) }
  return next.en || next.es ? next : undefined
}

function optionalNumber(value: number | undefined) {
  return value === undefined ? '' : String(value)
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function requiredText(value: unknown) {
  return clean(value)
}

function parseList(value: string | undefined) {
  return clean(value).split('|').map((item) => item.trim()).filter(Boolean)
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  const cleaned = clean(value).toLowerCase()
  if (!cleaned) return fallback
  return ['1', 'true', 'yes', 'y', 'si', 'sí', 'active', 'live'].includes(cleaned)
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(clean(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseOptionalNumber(value: string | undefined) {
  const cleaned = clean(value).replace(',', '.')
  if (!cleaned) return undefined
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseVatRate(value: string | undefined) {
  const parsed = parseOptionalNumber(value)
  if (parsed === undefined) return 0.21
  return parsed > 1 ? parsed / 100 : parsed
}

function parsePricingType(value: string | undefined): MasterPricingType {
  const cleaned = clean(value)
  if (['fixed', 'from', 'included-in-package', 'quote', 'range', 'recurring'].includes(cleaned)) {
    return cleaned as MasterPricingType
  }
  return 'quote'
}

function parseSection(value: string | undefined): MasterCatalogueSectionId {
  const cleaned = clean(value)
  if (cleaned === 'connected-room' || cleaned === 'optional-adaptations') return cleaned
  return 'home-safety-package'
}

function parsePriority(value: string | undefined): ServicePriority {
  const cleaned = clean(value)
  if (cleaned === 'recommended' || cleaned === 'optional') return cleaned
  return 'essential'
}

function parseProductType(value: string | undefined): MasterCatalogueProduct['productType'] {
  const cleaned = clean(value)
  if (cleaned === 'device' || cleaned === 'material' || cleaned === 'service' || cleaned === 'software') return cleaned
  return 'hardware'
}

function parseQuantityType(value: string | undefined): QuantityType {
  const cleaned = clean(value)
  if (cleaned === 'per_home' || cleaned === 'per_room' || cleaned === 'per_metre' || cleaned === 'per_square_metre') {
    return cleaned
  }
  return 'per_unit'
}

function parseSkillType(value: string | undefined): MasterCatalogueInstallationTask['skillType'] {
  const cleaned = clean(value)
  if (cleaned === 'carpentry' || cleaned === 'electrical' || cleaned === 'general' || cleaned === 'plumbing' || cleaned === 'smart_home') {
    return cleaned
  }
  return 'assessment'
}

function parseInstallerType(value: string | undefined): MasterCatalogueInstallationTask['installerType'] {
  const cleaned = clean(value)
  if (cleaned === 'partner' || cleaned === 'specialist') return cleaned
  return 'casamia'
}

function validateDuplicateIds(label: string, items: Array<{ id: string }>, errors: string[]) {
  const seen = new Set<string>()

  items.forEach((item) => {
    if (!item.id) {
      errors.push(`${label}: a row is missing an id.`)
      return
    }

    if (seen.has(item.id)) {
      errors.push(`${label}: duplicate id ${item.id}.`)
      return
    }

    seen.add(item.id)
  })
}

function upsertById<T extends { id: string }>(existing: T[], incoming: T[]) {
  const incomingIds = new Set(incoming.map((item) => item.id))
  return [...existing.filter((item) => !incomingIds.has(item.id)), ...incoming]
}

function sortByOrder<T extends { sortOrder?: number }>(left: T, right: T) {
  return (left.sortOrder ?? 999) - (right.sortOrder ?? 999)
}
