import { getServicesForPackageArea } from '../services/serviceCatalogue.ts'
import type { CasaMiaService, ServicePackageArea } from '../types/serviceCatalogue.ts'
import type { SafetyWizardState, WizardPriceRange, WizardRisk } from '../types/wizard.ts'

const riskAreaMap: Partial<Record<WizardRisk, ServicePackageArea>> = {
  'slippery-floors': 'living-room',
  'poor-lighting': 'lighting',
  'loose-rugs': 'living-room',
  'difficult-stairs': 'stairs',
  'high-thresholds': 'entrance',
  'hard-to-reach-storage': 'kitchen',
  'unsafe-bathroom': 'bathroom',
  'no-emergency-alert': 'smart-safety',
}

/**
 * Builds an intentionally conservative starting estimate from the live service
 * catalogue. One lowest-priced active option is selected per relevant area,
 * then duplicate services are removed. This is not presented as a quotation.
 */
export function getWizardPriceRange(
  state: SafetyWizardState,
  services: CasaMiaService[],
  language = 'en',
): WizardPriceRange | undefined {
  const areas = getRelevantAreas(state)

  if (!areas.length) {
    return undefined
  }

  const selectedServices = new Map<string, CasaMiaService>()
  let requiresQuote = false

  areas.forEach((area) => {
    const options = getServicesForPackageArea(services, area)
    const pricedOptions = options
      .filter((service) => getOneTimePrice(service) > 0)
      .sort((left, right) => getPriceIncludingVat(left) - getPriceIncludingVat(right))

    if (pricedOptions[0]) {
      selectedServices.set(pricedOptions[0].id, pricedOptions[0])
    } else if (options.some((service) => service.pricingType === 'quote_only')) {
      requiresQuote = true
    }
  })

  const starterServices = [...selectedServices.values()]
  const minimum = starterServices.reduce(
    (total, service) => total + getPriceIncludingVat(service),
    0,
  )
  const recurringMonthlyMinimum = starterServices.reduce(
    (total, service) => total + (service.recurringMonthlyPrice ?? 0),
    0,
  )

  if (!minimum && !recurringMonthlyMinimum) {
    return requiresQuote
      ? {
          label: language.toLowerCase().startsWith('es') ? 'Presupuesto personalizado' : 'Tailored quote',
          source: 'service-catalogue',
          areaCount: areas.length,
          requiresQuote: true,
          serviceIds: [],
          vatIncluded: true,
        }
      : undefined
  }

  return {
    minimum,
    label: formatStartingPrice(minimum, language),
    source: 'service-catalogue',
    areaCount: areas.length,
    recurringMonthlyMinimum: recurringMonthlyMinimum || undefined,
    requiresQuote,
    serviceIds: starterServices.map((service) => service.id),
    vatIncluded: true,
  }
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

  if (state.challenges.includes('night-movement')) areas.add('lighting')
  if (state.challenges.includes('emergency-support')) areas.add('smart-safety')
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

  return [...areas]
}

function getOneTimePrice(service: CasaMiaService) {
  if (service.pricingType === 'quote_only') return 0
  if (service.pricingType === 'from') return service.fromPrice ?? 0
  return (service.productPrice ?? 0) + (service.installationPrice ?? 0)
}

function getPriceIncludingVat(service: CasaMiaService) {
  const price = getOneTimePrice(service)
  return price + Math.round(price * service.vatRate)
}

function formatStartingPrice(amount: number, language: string) {
  const isSpanish = language.toLowerCase().startsWith('es')
  const formatted = new Intl.NumberFormat(isSpanish ? 'es-ES' : 'en-IE', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount)

  return `${isSpanish ? 'Desde' : 'From'} ${formatted}`
}
