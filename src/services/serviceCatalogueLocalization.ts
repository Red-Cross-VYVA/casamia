import { useMemo } from 'react'

import {
  formatCurrency,
  getServiceCatalogue,
  useServiceCatalogue,
  useServicesByRoom,
} from './serviceCatalogue'
import { defaultSpanishServiceCopy } from '../config/serviceCatalogueSpanishCopy'
import type {
  CasaMiaService,
  CasaMiaServiceTranslation,
  EditableServiceCatalogue,
  ServiceRoom,
} from '../types/serviceCatalogue'

function isSpanish(language: string) {
  return language.toLowerCase().startsWith('es')
}

function cleanLocalizedCopy(copy: CasaMiaServiceTranslation | undefined) {
  if (!copy) {
    return undefined
  }

  const cleaned = Object.fromEntries(
    Object.entries(copy).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return typeof value !== 'string' || value.trim().length > 0
    }),
  ) as Partial<CasaMiaService>

  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

export function localizeService(service: CasaMiaService, language: string): CasaMiaService {
  if (!isSpanish(language)) {
    return service
  }

  const copy = cleanLocalizedCopy(service.translations?.es ?? defaultSpanishServiceCopy[service.id])

  return copy ? { ...service, ...copy } : service
}

export function localizeServices(services: CasaMiaService[], language: string) {
  return services.map((service) => localizeService(service, language))
}

export function getLocalizedServiceCatalogue(language: string): EditableServiceCatalogue {
  const catalogue = getServiceCatalogue()

  return {
    ...catalogue,
    services: localizeServices(catalogue.services, language),
  }
}

export function useLocalizedServiceCatalogue(language: string) {
  const catalogue = useServiceCatalogue()

  return useMemo(
    () => ({
      ...catalogue,
      services: localizeServices(catalogue.services, language),
    }),
    [catalogue, language],
  )
}

export function useLocalizedServicesByRoom(room: ServiceRoom, language: string) {
  const services = useServicesByRoom(room)

  return useMemo(() => localizeServices(services, language), [language, services])
}

export function formatServicePriceForLanguage(service: CasaMiaService, language: string) {
  if (!isSpanish(language)) {
    if (service.pricingType === 'quote_only') return 'Quote after review'

    const amount =
      service.pricingType === 'from'
        ? service.fromPrice
        : (service.productPrice ?? 0) + (service.installationPrice ?? 0)

    if (!amount) return 'Included after review'

    return `${service.pricingType === 'from' ? 'From ' : ''}${formatCurrency(amount)}`
  }

  if (service.pricingType === 'quote_only') return 'Presupuesto tras revisión'

  const amount =
    service.pricingType === 'from'
      ? service.fromPrice
      : (service.productPrice ?? 0) + (service.installationPrice ?? 0)

  if (!amount) return 'Incluido tras revisión'

  return `${service.pricingType === 'from' ? 'Desde ' : ''}${formatCurrency(amount)}`
}
