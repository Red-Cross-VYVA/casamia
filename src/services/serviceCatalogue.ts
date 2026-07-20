import { useEffect, useMemo, useState } from 'react'

import { casaMiaServices } from '../config/serviceCatalogue.ts'
import { defaultSpanishServiceCopy } from '../config/serviceCatalogueSpanishCopy.ts'
import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth.ts'
import { getPublicSiteJson, hasPublicSiteApi } from './publicSiteApi.ts'
import type {
  CasaMiaService,
  EditableServiceCatalogue,
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
  return {
    services: clone(casaMiaServices).map(withPackageAreaDefaults),
  }
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
    const defaults = getDefaultServiceCatalogue()

    return {
      services: mergeServices(defaults.services, parsed.services),
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

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount)
}

function mergeServices(defaultServices: CasaMiaService[], savedServices: CasaMiaService[] | undefined) {
  if (savedServices === undefined) {
    return defaultServices.map(withPackageAreaDefaults)
  }

  return savedServices.map(withPackageAreaDefaults)
}

function withPackageAreaDefaults(service: CasaMiaService): CasaMiaService {
  const defaultSpanishTranslation = defaultSpanishServiceCopy[service.id]
  const translations = {
    ...(defaultSpanishTranslation ? { es: defaultSpanishTranslation } : {}),
    ...(service.translations ?? {}),
  }

  return {
    ...service,
    wizardAreas: Array.isArray(service.wizardAreas)
      ? service.wizardAreas
      : getDefaultServicePackageAreas(service),
    translations: Object.keys(translations).length > 0 ? translations : undefined,
  }
}

function normaliseServiceCatalogue(payload: Partial<EditableServiceCatalogue> | undefined): EditableServiceCatalogue {
  const defaults = getDefaultServiceCatalogue()

  return {
    services: mergeServices(defaults.services, payload?.services),
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
