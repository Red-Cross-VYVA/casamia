import type {
  ConfiguratorState,
  QuoteLine,
  QuoteSummary,
  ServiceComponent,
  ServiceSelection,
  SiteConfirmationItem,
} from '../types/configurator.ts'
import type { CasaMiaService } from '../types/serviceCatalogue.ts'
import { getSelectedRoomIds } from './configuratorRooms.ts'
import { getConfiguredServices } from './serviceCatalogue.ts'

const configuratorPricing = {
  currency: 'EUR',
  depositAmount: 99,
} as const

export function formatConfiguratorCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', {
    currency: configuratorPricing.currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount)
}

export function calculateConfiguratorQuote(state: ConfiguratorState): QuoteSummary {
  const selectedRooms = getSelectedRoomIds(state)
  const services = getConfiguredServices().filter(
    (service) =>
      service.active &&
      state.selectedServiceIds.includes(service.id) &&
      selectedRooms.includes(service.room),
  )
  const lines: QuoteLine[] = []
  const includedItems: ServiceComponent[] = []
  const quotationOnlyItems: ServiceComponent[] = []
  const siteConfirmationItems: SiteConfirmationItem[] = []
  let vat = 0
  const selectedServices: ServiceSelection[] = services.map((service) => ({
    serviceId: service.id,
    quantity: getSelectedServiceQuantity(service, state),
  }))

  services.forEach((service) => {
    const quantity = getSelectedServiceQuantity(service, state)

    if (quantity < 1) {
      return
    }

    const oneTimeUnitPrice = getServiceOneTimePrice(service)
    const oneTimeTotal = oneTimeUnitPrice * quantity
    vat += Math.round(oneTimeTotal * service.vatRate)

    lines.push({
      id: service.id,
      label: getServiceCustomerLabel(service),
      serviceId: service.id,
      quantity,
      unitPrice: oneTimeUnitPrice,
      total: oneTimeTotal,
      quotationOnly: service.pricingType === 'quote_only',
      requiresSiteConfirmation:
        service.requiresSiteVisit ||
        service.requiresMeasurement ||
        service.requiresCompatibilityCheck,
      note: getServiceLineNote(service),
    })

    if (service.recurringMonthlyPrice) {
      lines.push({
        id: `${service.id}-monthly`,
        label: `${getServiceCustomerLabel(service)} monthly support`,
        serviceId: service.id,
        quantity,
        unitPrice: 0,
        total: 0,
        recurringMonthly: service.recurringMonthlyPrice * quantity,
      })
    }

    includedItems.push(...getServiceIncludedItems(service))

    if (service.pricingType === 'quote_only') {
      quotationOnlyItems.push({
        id: service.id,
        label: getServiceCustomerLabel(service),
        type: 'quotation-only',
        customerNote: service.safetyNotice,
      })
    }

    if (service.requiresSiteVisit || service.requiresMeasurement || service.requiresCompatibilityCheck) {
      siteConfirmationItems.push({
        label: getServiceCustomerLabel(service),
        reason: getServiceConfirmationReason(service),
      })
    }
  })

  const oneTimeSubtotal = lines.reduce((sum, line) => sum + line.total, 0)
  const recurringMonthlySubtotal = lines.reduce((sum, line) => sum + (line.recurringMonthly ?? 0), 0)

  return {
    selectedServices,
    includedItems: uniqueComponents(includedItems),
    quotationOnlyItems: uniqueComponents(quotationOnlyItems),
    lines,
    siteConfirmationItems: uniqueSiteItems(siteConfirmationItems),
    oneTimeSubtotal,
    recurringMonthlySubtotal,
    vat,
    totalEstimate: oneTimeSubtotal + vat,
    deposit: lines.length > 0 ? configuratorPricing.depositAmount : 0,
  }
}

function getServiceCustomerLabel(service: CasaMiaService) {
  return service.customerName ?? service.name
}

function getSelectedServiceQuantity(service: CasaMiaService, state: ConfiguratorState) {
  if (service.quantityType === 'per_home') {
    return 1
  }

  if (service.room === 'entrance') {
    return Math.max(1, Number(state.quantities.entrances) || 1)
  }

  if (service.room === 'kitchen') {
    return Math.max(1, Number(state.quantities.kitchens) || 1)
  }

  if (service.room === 'bedroom') {
    return Math.max(1, Number(state.quantities.bedrooms) || 1)
  }

  if (service.room === 'bathroom') {
    return Math.max(1, Number(state.quantities.bathrooms) || 1)
  }

  if (service.room === 'movement' && service.category.toLowerCase().includes('stair')) {
    return state.property.hasInternalStairs === 'yes'
      ? Math.max(1, Number(state.quantities.staircases) || 1)
      : 0
  }

  return 1
}

function getServiceOneTimePrice(service: CasaMiaService) {
  if (service.pricingType === 'quote_only') {
    return 0
  }

  if (service.pricingType === 'from') {
    return service.fromPrice ?? 0
  }

  return (service.productPrice ?? 0) + (service.installationPrice ?? 0)
}

function getServiceLineNote(service: CasaMiaService) {
  if (service.pricingType === 'quote_only') {
    return 'Quoted after review'
  }

  if (service.pricingType === 'from') {
    return 'From price'
  }

  if (service.requiresInstallation) {
    return 'Product and managed installation'
  }

  return 'Product or setup'
}

function getServiceIncludedItems(service: CasaMiaService): ServiceComponent[] {
  return (service.includedItems ?? []).map((item, index) => ({
    id: `${service.id}-${index}`,
    label: item,
    type: 'standard',
  }))
}

function getServiceConfirmationReason(service: CasaMiaService) {
  if (service.safetyNotice) {
    return service.safetyNotice
  }

  if (service.requiresMeasurement) {
    return 'Measurements must be confirmed before final pricing or installation.'
  }

  if (service.requiresCompatibilityCheck) {
    return 'CasaMia checks compatibility before confirming the final scope.'
  }

  return 'A visit may be needed before final confirmation.'
}

function uniqueComponents(components: ServiceComponent[]) {
  return Array.from(new Map(components.map((component) => [component.id, component])).values())
}

function uniqueSiteItems(items: SiteConfirmationItem[]) {
  return Array.from(new Map(items.map((item) => [`${item.label}-${item.reason}`, item])).values())
}
