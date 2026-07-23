import { useEffect, useMemo, useState } from 'react'

import { casaMiaServices } from '../config/serviceCatalogue.ts'
import { defaultSpanishServiceCopy } from '../config/serviceCatalogueSpanishCopy.ts'
import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth.ts'
import { flattenMasterCatalogueForCompatibility } from './masterServiceCatalogue.ts'
import { getPublicSiteJson, hasPublicSiteApi } from './publicSiteApi.ts'
import type {
  CasaMiaService,
  EditableServiceCatalogue,
  MasterServiceCatalogue,
  ServiceCatalogueSection,
  ServicePackageConfig,
  ServicePackageArea,
  ServiceRoom,
} from '../types/serviceCatalogue.ts'

const serviceCatalogueStorageKey = 'casamia-service-catalogue'
const serviceCatalogueUpdatedEvent = 'casamia-service-catalogue-updated'
const publicServiceCataloguePath = '/api/public/service-catalogue'
const internalServiceCataloguePath = '/api/internal/service-catalogue'

type ServiceCatalogueLoadResult = {
  catalogue: EditableServiceCatalogue
  remote: boolean
}

type ServiceCatalogueSaveResult = ServiceCatalogueLoadResult & {
  savedLocally: boolean
}

export function getDefaultServiceCatalogue(): EditableServiceCatalogue {
  return buildServiceCatalogueFromMaster()
}

function buildServiceCatalogueFromMaster(masterCatalogue?: MasterServiceCatalogue): EditableServiceCatalogue {
  const masterRooms = new Set(['bathroom', 'bedroom'])

  return {
    masterCatalogue,
    packageConfigs: getDefaultPackageConfigs(),
    services: [
      ...flattenMasterCatalogueForCompatibility(masterCatalogue),
      ...clone(casaMiaServices).filter((service) => !masterRooms.has(service.room)),
    ].map(withPackageAreaDefaults),
  }
}

export function getDefaultPackageConfigs(): ServicePackageConfig[] {
  return [
    {
      active: true,
      area: 'bathroom',
      name: 'Safer Bathroom Access',
      pricingType: 'quote_only',
      section: 'home_safety_package',
      vatRate: 0.21,
    },
    {
      active: true,
      area: 'bedroom',
      name: 'Easier Bedroom Comfort',
      pricingType: 'quote_only',
      section: 'home_safety_package',
      vatRate: 0.21,
    },
    { active: true, area: 'kitchen', name: 'Confident kitchen', pricingType: 'quote_only', vatRate: 0.21 },
    { active: true, area: 'living-room', name: 'Comfortable movement', pricingType: 'quote_only', vatRate: 0.21 },
    { active: true, area: 'stairs', name: 'Safer stairs', pricingType: 'quote_only', vatRate: 0.21 },
    { active: true, area: 'entrance', name: 'Easy entrance', pricingType: 'quote_only', vatRate: 0.21 },
    { active: true, area: 'outdoor', name: 'Outdoor access', pricingType: 'quote_only', vatRate: 0.21 },
    { active: true, area: 'lighting', name: 'Clearer lighting', pricingType: 'quote_only', vatRate: 0.21 },
    { active: true, area: 'smart-safety', name: 'Connected safety', pricingType: 'quote_only', vatRate: 0.21 },
  ]
}

export function getDefaultServicePackageAreas(
  service: Pick<CasaMiaService, 'category' | 'id' | 'name' | 'room'>,
): ServicePackageArea[] {
  const areas = new Set<ServicePackageArea>()

  if (service.room === 'bathroom') areas.add('bathroom')
  if (service.room === 'bedroom') areas.add('bedroom')
  if (service.room === 'kitchen') areas.add('kitchen')
  if (service.room === 'entrance') {
    areas.add('entrance')
    areas.add('outdoor')
  }
  if (service.room === 'connected') areas.add('smart-safety')

  const searchable = `${service.id} ${service.name} ${service.category}`.toLowerCase()
  const isStairService = service.room === 'movement' && /stair|step/.test(searchable)

  if (service.room === 'movement') {
    areas.add(isStairService ? 'stairs' : 'living-room')
  }

  if (/\blight(?:ing)?\b|\bvisibility\b|\bnight route\b/.test(searchable)) areas.add('lighting')
  if (/smart|sensor|alert|monitor|voice|detection|emergency|shut.?off/.test(searchable)) {
    areas.add('smart-safety')
  }

  return [...areas]
}

export function getServicesForPackageArea(
  services: CasaMiaService[],
  area: ServicePackageArea | 'not-sure',
) {
  const activeServices = services.filter((service) => service.active)

  if (area === 'not-sure') {
    return activeServices
  }

  return activeServices.filter((service) =>
    (service.wizardAreas ?? getDefaultServicePackageAreas(service)).includes(area),
  )
}

export function getServiceCatalogue(): EditableServiceCatalogue {
  if (typeof window === 'undefined') {
    return getDefaultServiceCatalogue()
  }

  try {
    const saved = window.localStorage.getItem(serviceCatalogueStorageKey)

    if (!saved) {
      return getDefaultServiceCatalogue()
    }

    const parsed = JSON.parse(saved) as Partial<EditableServiceCatalogue>
    const masterCatalogue = parsed.masterCatalogue
    const defaults = buildServiceCatalogueFromMaster(masterCatalogue)

    return {
      masterCatalogueBackups: parsed.masterCatalogueBackups,
      masterCatalogue,
      packageConfigs: mergePackageConfigs(defaults.packageConfigs, parsed.packageConfigs),
      services: mergeServices(defaults.services, parsed.services, masterCatalogue),
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return getDefaultServiceCatalogue()
  }
}

export async function loadServiceCatalogue(options: { internal?: boolean } = {}): Promise<ServiceCatalogueLoadResult> {
  if (!hasPublicSiteApi()) {
    return { catalogue: getServiceCatalogue(), remote: false }
  }

  if (options.internal && !hasInternalBackendSession()) {
    return { catalogue: getServiceCatalogue(), remote: false }
  }

  try {
    const path = options.internal ? internalServiceCataloguePath : publicServiceCataloguePath
    const payload = options.internal
      ? await getInternalServiceCatalogue(path)
      : await getPublicSiteJson<Partial<EditableServiceCatalogue>>(path)
    const catalogue = normaliseServiceCatalogue(payload)

    writeServiceCatalogue(catalogue)

    return {
      catalogue,
      remote: true,
    }
  } catch {
    return { catalogue: getServiceCatalogue(), remote: false }
  }
}

export function saveServiceCatalogue(config: EditableServiceCatalogue) {
  if (typeof window === 'undefined') {
    return getDefaultServiceCatalogue()
  }

  const nextConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  }

  return writeServiceCatalogue(nextConfig)
}

export async function saveServiceCatalogueToBackend(
  config: EditableServiceCatalogue,
): Promise<ServiceCatalogueSaveResult> {
  const localCatalogue = saveServiceCatalogue(config)

  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    return {
      catalogue: localCatalogue,
      remote: false,
      savedLocally: true,
    }
  }

  try {
    const payload = await putInternalServiceCatalogue(localCatalogue)
    const catalogue = normaliseServiceCatalogue(payload)
    saveServiceCatalogue(catalogue)

    return {
      catalogue,
      remote: true,
      savedLocally: true,
    }
  } catch {
    return {
      catalogue: localCatalogue,
      remote: false,
      savedLocally: true,
    }
  }
}

export function resetServiceCatalogue() {
  if (typeof window === 'undefined') {
    return getDefaultServiceCatalogue()
  }

  window.localStorage.removeItem(serviceCatalogueStorageKey)
  window.dispatchEvent(new CustomEvent(serviceCatalogueUpdatedEvent))

  return getDefaultServiceCatalogue()
}

export function getConfiguredServices() {
  return getServiceCatalogue().services
}

export function getPackageConfigForArea(
  catalogue: Pick<EditableServiceCatalogue, 'packageConfigs'>,
  area: ServicePackageArea,
) {
  return mergePackageConfigs(getDefaultPackageConfigs(), catalogue.packageConfigs).find(
    (config) => config.area === area,
  )
}

export function getConfiguredServicesByRoom(room: ServiceRoom) {
  return getConfiguredServices().filter((service) => service.room === room && service.active)
}

export function getConfiguredServiceById(serviceId: string) {
  return getConfiguredServices().find((service) => service.id === serviceId)
}

export function useServiceCatalogue() {
  const [catalogue, setCatalogue] = useState<EditableServiceCatalogue>(() => getServiceCatalogue())

  useEffect(() => {
    let active = true

    loadServiceCatalogue().then((result) => {
      if (active) {
        setCatalogue(result.catalogue)
      }
    })

    function refreshCatalogue() {
      setCatalogue(getServiceCatalogue())
    }

    window.addEventListener(serviceCatalogueUpdatedEvent, refreshCatalogue)
    window.addEventListener('storage', refreshCatalogue)

    return () => {
      active = false
      window.removeEventListener(serviceCatalogueUpdatedEvent, refreshCatalogue)
      window.removeEventListener('storage', refreshCatalogue)
    }
  }, [])

  return catalogue
}

export function useServicesByRoom(room: ServiceRoom) {
  const catalogue = useServiceCatalogue()

  return useMemo(
    () => catalogue.services.filter((service) => service.room === room && service.active),
    [catalogue.services, room],
  )
}

export function formatServicePrice(service: CasaMiaService) {
  if (service.pricingType === 'quote_only') {
    return 'Quote after review'
  }

  const amount =
    service.pricingType === 'from'
      ? service.fromPrice
      : (service.productPrice ?? 0) + (service.installationPrice ?? 0)

  if (!amount) {
    return 'Included after review'
  }

  return `${service.pricingType === 'from' ? 'From ' : ''}${formatCurrency(amount)}`
}

export function formatPackagePrice(config: ServicePackageConfig | undefined) {
  if (!config || !config.active || config.pricingType === 'quote_only') {
    return 'Package price confirmed after review'
  }

  const amount = config.pricingType === 'from' ? config.fromPrice : config.packagePrice

  if (!amount) {
    return 'Package price confirmed after review'
  }

  const total = amount + Math.round(amount * config.vatRate)

  return `${config.pricingType === 'from' ? 'From ' : ''}${formatCurrency(total)}`
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount)
}

function mergeServices(
  defaultServices: CasaMiaService[],
  savedServices: CasaMiaService[] | undefined,
  masterCatalogue?: MasterServiceCatalogue,
) {
  if (savedServices === undefined) {
    return defaultServices.map(withPackageAreaDefaults)
  }

  if (masterCatalogue) {
    const masterRooms = new Set(['bathroom', 'bedroom'])

    return [
      ...defaultServices.filter((service) => masterRooms.has(service.room)),
      ...savedServices.filter((service) => !masterRooms.has(service.room)),
    ].map(withPackageAreaDefaults)
  }

  return savedServices.map(withPackageAreaDefaults)
}

function mergePackageConfigs(
  defaultConfigs: ServicePackageConfig[] | undefined,
  savedConfigs: ServicePackageConfig[] | undefined,
) {
  const defaults = defaultConfigs ?? getDefaultPackageConfigs()
  const savedByArea = new Map((savedConfigs ?? []).map((config) => [config.area, config]))

  return defaults.map((defaultConfig) => ({
    ...defaultConfig,
    ...(savedByArea.get(defaultConfig.area) ?? {}),
    vatRate: savedByArea.get(defaultConfig.area)?.vatRate ?? defaultConfig.vatRate,
  }))
}

function withPackageAreaDefaults(service: CasaMiaService): CasaMiaService {
  const defaultSpanishTranslation = defaultSpanishServiceCopy[service.id]
  const translations = {
    ...(defaultSpanishTranslation ? { es: defaultSpanishTranslation } : {}),
    ...(service.translations ?? {}),
  }
  const componentRole = service.componentRole ?? (service.priority === 'optional' ? 'option' : 'core')
  const section = service.section ?? getDefaultCatalogueSection(service)
  const requiresQuote = service.requiresQuote ?? service.pricingType === 'quote_only'

  return {
    ...service,
    adminVisible: service.adminVisible ?? service.visibility?.admin ?? true,
    componentRole,
    crmVisible: service.crmVisible ?? service.visibility?.crm ?? true,
    customerDescription: service.customerDescription ?? service.shortDescription,
    customerName: service.customerName ?? service.name,
    grant: {
      eligible: false,
      ...(service.grant ?? {}),
    },
    inspectorVisible: service.inspectorVisible ?? service.visibility?.inspector ?? true,
    internalName: service.internalName ?? service.name,
    mobileVisible: service.mobileVisible ?? service.visibility?.mobile ?? true,
    outcome: service.outcome ?? service.customerBenefit,
    plainLanguageSummary: service.plainLanguageSummary ?? service.shortDescription,
    priority: service.priority ?? (componentRole === 'option' ? 'optional' : 'essential'),
    proposalVisible: service.proposalVisible ?? service.visibility?.proposal ?? true,
    requiresAssessment: service.requiresAssessment ?? service.requiresSiteVisit ?? service.requiresMeasurement,
    requiresQuote,
    requirements: {
      assessment: service.requiresAssessment ?? service.requiresSiteVisit ?? service.requiresMeasurement,
      compatibilityCheck: service.requiresCompatibilityCheck,
      installation: service.requiresInstallation,
      measurement: service.requiresMeasurement,
      quote: requiresQuote,
      siteVisit: service.requiresSiteVisit,
      ...(service.requirements ?? {}),
    },
    section,
    status: service.status ?? (service.active ? 'active' : 'draft'),
    version: service.version ?? '1.0.0',
    visibility: {
      admin: service.adminVisible ?? service.visibility?.admin ?? true,
      crm: service.crmVisible ?? service.visibility?.crm ?? true,
      inspector: service.inspectorVisible ?? service.visibility?.inspector ?? true,
      mobile: service.mobileVisible ?? service.visibility?.mobile ?? true,
      proposal: service.proposalVisible ?? service.visibility?.proposal ?? true,
      website: service.websiteVisible ?? service.visibility?.website ?? true,
      wizard: service.wizardVisible ?? service.visibility?.wizard ?? true,
    },
    websiteVisible: service.websiteVisible ?? service.visibility?.website ?? true,
    wizardAreas: Array.isArray(service.wizardAreas)
      ? service.wizardAreas
      : getDefaultServicePackageAreas(service),
    wizardVisible: service.wizardVisible ?? service.visibility?.wizard ?? true,
    translations: Object.keys(translations).length > 0 ? translations : undefined,
  }
}

export function getDefaultCatalogueSection(service: CasaMiaService): ServiceCatalogueSection {
  if ((service.componentRole ?? 'core') === 'option' || service.requiresQuote || service.pricingType === 'quote_only') {
    return 'optional_adaptations'
  }

  const searchable = `${service.id} ${service.name} ${service.category}`.toLowerCase()

  if (/smart|sensor|alert|monitor|voice|connected|emergency|routine|reminder|speaker/.test(searchable)) {
    return 'connected_room'
  }

  return 'home_safety_package'
}

function normaliseServiceCatalogue(payload: Partial<EditableServiceCatalogue> | undefined): EditableServiceCatalogue {
  const masterCatalogue = payload?.masterCatalogue
  const defaults = buildServiceCatalogueFromMaster(masterCatalogue)

  return {
    masterCatalogue,
    masterCatalogueBackups: payload?.masterCatalogueBackups,
    packageConfigs: mergePackageConfigs(defaults.packageConfigs, payload?.packageConfigs),
    services: mergeServices(defaults.services, payload?.services, masterCatalogue),
    updatedAt: payload?.updatedAt,
  }
}

function writeServiceCatalogue(config: EditableServiceCatalogue) {
  if (typeof window === 'undefined') {
    return config
  }

  window.localStorage.setItem(serviceCatalogueStorageKey, JSON.stringify(config))
  window.dispatchEvent(new CustomEvent(serviceCatalogueUpdatedEvent))

  return config
}

async function getInternalServiceCatalogue(path: string) {
  const response = await fetch(path, {
    headers: getInternalAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Service catalogue request failed with ${response.status}.`)
  }

  return response.json() as Promise<Partial<EditableServiceCatalogue>>
}

async function putInternalServiceCatalogue(config: EditableServiceCatalogue) {
  const response = await fetch(internalServiceCataloguePath, {
    body: JSON.stringify(config),
    headers: {
      'content-type': 'application/json',
      ...getInternalAuthHeaders(),
    },
    method: 'PUT',
  })

  if (!response.ok) {
    throw new Error(`Service catalogue save failed with ${response.status}.`)
  }

  return response.json() as Promise<Partial<EditableServiceCatalogue>>
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
