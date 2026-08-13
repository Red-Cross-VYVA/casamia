import { masterServiceCatalogue } from '../config/masterServiceCatalogue.ts'
import type {
  CasaMiaService,
  MasterCatalogueCapability,
  MasterCatalogueInstallationTask,
  MasterCatalogueOutcome,
  MasterCataloguePackage,
  MasterCatalogueProduct,
  MasterCatalogueRelation,
  MasterCatalogueRoom,
  MasterServiceCatalogue,
  ServiceCatalogueSection,
  ServicePackageConfig,
  ServicePackageArea,
  ServiceRoom,
} from '../types/serviceCatalogue.ts'

const sectionMap: Record<MasterCatalogueOutcome['section'], ServiceCatalogueSection> = {
  'connected-room': 'connected_room',
  'home-safety-package': 'home_safety_package',
  'optional-adaptations': 'optional_adaptations',
}

const packageAreaIds = new Set<ServicePackageArea>(['bathroom', 'bedroom', 'kitchen', 'living-room', 'entrance'])

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

export function getActiveCatalogueRooms(catalogue = masterServiceCatalogue): MasterCatalogueRoom[] {
  return catalogue.rooms.filter((room) => room.active).sort(sortByOrder)
}

export function getPackagesByRoom(roomId: string, catalogue = masterServiceCatalogue) {
  return catalogue.packages
    .filter((item) => item.active && item.roomId === roomId)
    .sort(sortByOrder)
}

export function getHomeSafetyPackageForRoom(roomId: string, catalogue = masterServiceCatalogue) {
  return getPackagesByRoom(roomId, catalogue).find((item) => item.section === 'home-safety-package')
}

export function getCataloguePackagesForRoom(roomId: string, catalogue = masterServiceCatalogue) {
  return getPackagesByRoom(roomId, catalogue).map((packageRecord) => ({
    package: packageRecord,
    outcomes: getOutcomesByPackage(packageRecord.id, catalogue),
  }))
}

export function derivePackageConfigFromMasterPackage(
  packageRecord: MasterCataloguePackage,
): ServicePackageConfig | undefined {
  if (!isServicePackageArea(packageRecord.roomId)) {
    return undefined
  }

  return {
    active: packageRecord.active,
    area: packageRecord.roomId,
    fromPrice: packageRecord.fromPrice,
    name: getLocalizedName(packageRecord.customerName) || packageRecord.internalName,
    packagePrice: packageRecord.fixedPrice,
    pricingType: mapMasterPricingType(packageRecord.pricingType),
    recurringMonthlyPrice: packageRecord.recurringMonthlyPrice,
    section: sectionMap[packageRecord.section],
    vatRate: packageRecord.vatRate,
  }
}

export function deriveHomeSafetyPackageConfigs(catalogue = masterServiceCatalogue): ServicePackageConfig[] {
  return getActiveCatalogueRooms(catalogue)
    .map((room) => getHomeSafetyPackageForRoom(room.id, catalogue))
    .filter((packageRecord): packageRecord is MasterCataloguePackage => Boolean(packageRecord))
    .map(derivePackageConfigFromMasterPackage)
    .filter((config): config is ServicePackageConfig => Boolean(config))
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
  return getCataloguePackagesForRoom(roomId, catalogue)
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
  const includedItems = uniqueTextItems(capabilities.map((capability) => capability.name))
  const spanishIncludedItems = uniqueTextItems(
    capabilities.map((capability) => getSpanishCapabilityName(capability.id, capability.name)),
  )
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
    includedItems,
    wizardAreas: outcome.wizardAreas as ServicePackageArea[],
    safetyNotice: outcome.safetyNotice?.en,
    translations: {
      es: {
        customerBenefit: outcome.customerBenefit.es,
        customerDescription: outcome.shortDescription.es,
        customerName: outcome.customerName.es,
        includedItems: spanishIncludedItems,
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

function isServicePackageArea(value: string): value is ServicePackageArea {
  return packageAreaIds.has(value as ServicePackageArea)
}

function mapMasterPricingType(pricingType: MasterCataloguePackage['pricingType']): ServicePackageConfig['pricingType'] {
  if (pricingType === 'fixed') return 'fixed'
  if (pricingType === 'from' || pricingType === 'range' || pricingType === 'recurring') return 'from'
  return 'quote_only'
}

function getLocalizedName(value: Partial<Record<'en' | 'es', string>>) {
  return value.en ?? value.es ?? ''
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()]
}

function uniqueTextItems(items: string[]) {
  const seen = new Set<string>()

  return items.filter((item) => {
    const key = item.trim().toLowerCase()

    if (!key || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function getSpanishCapabilityName(capabilityId: string, fallback: string) {
  const names: Record<string, string> = {
    'bathroom-anti-slip-bath-shower-mat': 'Juego de alfombrillas antideslizantes para bañera y salida',
    'bathroom-anti-slip-floor-treatment': 'Tratamiento antideslizante de suelo',
    'bathroom-bathtub-step-through-conversion': 'Conversión de bañera con acceso bajo',
    'bathroom-door-adjustment': 'Ajuste de puerta para reducir resistencia',
    'bathroom-easy-release-privacy-lock': 'Cierre de privacidad con desbloqueo fácil',
    'bathroom-folding-shower-seat-support': 'Asiento abatible de ducha',
    'bathroom-handheld-shower-control': 'Ducha de mano y soporte',
    'bathroom-lever-door-handle': 'Manilla de puerta tipo palanca',
    'bathroom-lever-mixer-tap': 'Grifo monomando de palanca',
    'bathroom-lever-shower-controls': 'Mandos de ducha de palanca',
    'bathroom-motion-night-lighting': 'Luz nocturna con sensor de movimiento',
    'bathroom-raised-toilet-seat': 'Elevador de inodoro',
    'bathroom-safer-floor-transition': 'Perfil de transición bajo',
    'bathroom-task-lighting': 'Iluminación de baño apta para zona húmeda',
    'bathroom-visual-contrast-markers': 'Marcadores de contraste en baño',
    'bathroom-thermostatic-anti-scald-valve': 'Válvula termostática antiquemaduras',
    'bathroom-toilet-support-rails': 'Barras de apoyo para inodoro',
    'bathroom-vertical-support-rail': 'Barra de apoyo vertical',
    'bathroom-wall-mounted-grab-bars': 'Barras de apoyo en pared',
    'bathroom-wider-doorway-adaptation': 'Ensanche de puerta de baño',
    'threshold-reduction': 'Reducción de umbral',
    'accessible-wardrobe-adaptation': 'Adaptación de armario accesible',
    'advanced-bed-transfer-solution': 'Solución avanzada para entrar y salir de la cama',
    'automatic-water-shutoff': 'Válvula automática de corte de agua, si es compatible',
    'bed-height-optimisation': 'Ajuste de altura de la cama',
    'bed-positioning-adjustment': 'Mejor colocación de la cama',
    'bed-to-door-clear-route': 'Ruta despejada entre la cama y la puerta',
    'bedroom-dressing-chair-support': 'Silla estable para vestirse junto a la cama',
    'bedroom-door-accessibility-adaptation': 'Puerta de dormitorio más ancha',
    'bedroom-motion-night-lighting': 'Iluminación nocturna con sensor de movimiento',
    'bedroom-to-bathroom-route-improvement': 'Ruta segura del dormitorio al baño',
    'bedside-emergency-assistance': 'Ayuda de emergencia junto a la cama',
    'bedside-lighting': 'Luz de mesilla',
    'cable-management': 'Organización de cables',
    'discreet-transfer-support': 'Asa de apoyo para cama',
    'easy-see-switches': 'Marcadores de alto contraste para interruptores',
    'electric-adjustable-bed': 'Cama eléctrica ajustable',
    'enhanced-smoke-alerting': 'Configuración de aviso de humo reforzado',
    'emergency-call-access': 'Botón de emergencia',
    'family-carer-notifications': 'Avisos a familiares o cuidadores',
    'furniture-repositioning': 'Recolocación de muebles',
    'hands-free-calling': 'Llamadas manos libres',
    'hot-water-temperature-setting': 'Ajuste de temperatura del agua caliente',
    'loose-rug-securing': 'Retirada o fijación de alfombras sueltas',
    'morning-evening-routines': 'Rutinas de mañana y noche',
    'movement-reassurance': 'Avisos de movimiento en el dormitorio',
    'night-time-safety-alerts': 'Configuración de alertas nocturnas',
    'nominated-carer-alerting': 'Configuración de aviso a familiar o cuidador',
    'routine-reminders': 'Recordatorios de medicación',
    'appointment-reminders': 'Recordatorios de citas',
    'resident-phone-alerting': 'Configuración de aviso al teléfono del residente',
    'smart-speaker-setup': 'Configuración de altavoz inteligente',
    'smoke-alerting': 'Detector de humo',
    'specialist-measurement': 'Medición profesional y comprobación de encaje',
    'voice-controlled-lighting': 'Iluminación controlada por voz',
    'voice-help-requests': 'Peticiones sencillas por voz',
    'wearable-emergency-support': 'Colgante de emergencia',
    'water-leak-alerting': 'Sensor de fuga de agua',
    'lever-water-control': 'Grifo monomando de palanca',
    'automatic-jar-opening': 'Abrefrascos automático',
    'easy-grip-kitchen-tools': 'Utensilios de cocina de agarre fácil',
    'non-slip-chopping-support': 'Tabla de cortar antideslizante',
    'easy-pour-kettle-support': 'Hervidor fácil de verter o basculante',
    'anti-fatigue-standing-zone': 'Alfombrilla antifatiga colocada de forma segura',
    'safer-hob-control': 'Placa de inducción con apagado automático',
    'automatic-gas-shutoff': 'Sistema automático de corte de gas, cuando aplique',
    'motion-activated-lighting': 'Iluminación con sensor de movimiento',
    'kitchen-circulation-space': 'Mejor espacio de circulación en la cocina',
    'kitchen-motion-alerting': 'Sensor de detección de movimiento',
    'kitchen-storage-organisation': 'Objetos frecuentes organizados al alcance',
    'pull-out-pantry-storage': 'Almacenamiento extraíble de despensa',
    'shopping-list-management': 'Gestión de lista de la compra',
    'voice-cooking-assistance': 'Asistencia de cocina por voz',
    'waist-height-storage': 'Objetos frecuentes reubicados a altura de cintura',
    'wider-kitchen-doorway': 'Puerta de cocina más ancha',
    'seating-height-adjustment': 'Ajuste de altura del asiento',
    'living-room-furniture-risers': 'Elevadores resistentes para sofá o silla',
    'sofa-chair-support-handle': 'Asa de apoyo para sofá o silla',
    'living-room-couch-assist-handle': 'Bastidor de apoyo para sofá',
    'living-room-furniture-positioning': 'Mejor colocación de muebles',
    'living-room-power-strip-tower': 'Torre de enchufes con USB a altura cómoda',
    'anti-slip-rug-tape': 'Cinta antideslizante para alfombras',
    'living-room-circulation-space': 'Mejor espacio de circulación',
    'living-room-anti-slip-floor-treatment': 'Tratamiento antideslizante del suelo',
    'living-room-secure-floor-coverings': 'Revestimientos de suelo asegurados',
    'living-room-beveled-transition-strips': 'Tiras de transición biseladas para umbrales',
    'living-room-d-shaped-cabinet-pulls': 'Tiradores en D fáciles de agarrar',
    'furniture-anchoring': 'Correías antivuelco sin taladro para muebles',
    'tv-unit-anchoring': 'Correías antivuelco sin taladro para mueble de TV',
    'corner-protection': 'Protección de esquinas cuando proceda',
    'living-room-motion-alerting': 'Sensor de detección de movimiento',
    'emergency-voice-assistance': 'Asistencia de emergencia por voz',
    'specialist-seating-accessories': 'Accesorios especializados de apoyo para sentarse',
    'riser-cushion-or-chair-base': 'Cojín elevador o adaptación de base de silla',
    'electric-recliner-chair': 'Sillón relax eléctrico',
    'wider-living-room-doorway': 'Puerta de salón más ancha',
    'raised-electrical-outlet-relocation': 'Enchufes a una altura más cómoda',
    'living-room-raised-electrical-outlets': 'Enchufes a una altura más cómoda',
    'stair-handrail': 'Pasamanos de escalera',
    'non-slip-stair-treads': 'Peldaños antideslizantes',
    'high-visibility-stair-edge-markings': 'Señalización visible del borde del escalón',
    'stair-route-lighting': 'Iluminación de ruta en escaleras',
    'entrance-handrail': 'Pasamanos de entrada',
    'entrance-threshold-ramp': 'Rampa de umbral de bajo perfil',
    'slip-resistant-entrance-surface': 'Superficie de entrada antideslizante',
    'high-visibility-step-edge-markings': 'Señalización visible del borde del escalón',
    'secure-entrance-mat': 'Felpudo de entrada seguro',
    'entrance-lever-door-handle': 'Manilla tipo palanca',
    'easy-to-use-entrance-lock': 'Cerradura fácil de usar',
    'smart-video-doorbell': 'Videoportero inteligente',
    'two-way-door-communication': 'Comunicación bidireccional',
    'live-visitor-view': 'Vista en directo del visitante',
    'doorbell-motion-detection': 'Detección de movimiento en la puerta',
    'package-detection': 'Detección de paquetes, cuando esté disponible',
    'mobile-door-notifications': 'Avisos móviles de la puerta',
    'entrance-family-notifications': 'Avisos familiares de la puerta',
    'entrance-key-safe-access': 'Caja de llaves de emergencia',
    'motion-activated-entrance-lighting': 'Iluminación de entrada con sensor de movimiento',
    'porch-lighting': 'Iluminación de porche',
    'wider-entrance-doorway': 'Puerta de entrada más ancha',
    'accessibility-ramp': 'Rampa de accesibilidad',
    'entrance-seating-option': 'Asiento de entrada',
  }

  return names[capabilityId] ?? fallback
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
