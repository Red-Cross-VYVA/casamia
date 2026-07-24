import { getPackageConfigForArea } from '../services/serviceCatalogue.ts'
import type { CasaMiaService, EditableServiceCatalogue, ServicePackageArea } from '../types/serviceCatalogue.ts'
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
 * Builds an intentionally conservative starting estimate from the live package
 * catalogue. Prices are set at package-area level; individual components are
 * included as core or optional items inside those packages.
 */
export function getWizardPriceRange(
  state: SafetyWizardState,
  servicesOrCatalogue: CasaMiaService[] | EditableServiceCatalogue,
  language = 'en',
): WizardPriceRange | undefined {
  const areas = getRelevantAreas(state)

  if (!areas.length) {
    return undefined
  }

  const catalogue = Array.isArray(servicesOrCatalogue)
    ? { services: servicesOrCatalogue }
    : servicesOrCatalogue
  const selectedServiceIds = new Set<string>()
  let requiresQuote = false
  let minimum = 0
  let recurringMonthlyMinimum = 0

  areas.forEach((area) => {
    const packageConfig = getPackageConfigForArea(catalogue, area)
    const packagePrice = getPackagePriceIncludingVat(packageConfig)

    if (packagePrice > 0) {
      minimum += packagePrice
      recurringMonthlyMinimum += packageConfig?.recurringMonthlyPrice ?? 0
      catalogue.services
        .filter((service) => service.active && (service.wizardAreas ?? []).includes(area))
        .forEach((service) => selectedServiceIds.add(service.id))
    } else {
      requiresQuote = true
    }
  })

  if (!minimum && !recurringMonthlyMinimum) {
    return requiresQuote
      ? {
          label: language.toLowerCase().startsWith('es') ? 'Presupuesto personalizado' : 'Tailored quote',
          source: 'service-catalogue',
          areaCount: areas.length,
          requiresQuote: true,
          serviceIds: [...selectedServiceIds],
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
    serviceIds: [...selectedServiceIds],
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

function getPackagePriceIncludingVat(config: ReturnType<typeof getPackageConfigForArea>) {
  if (!config || !config.active || config.pricingType === 'quote_only') return 0

  const price = config.pricingType === 'from' ? config.fromPrice : config.packagePrice

  if (!price) return 0

  return price + Math.round(price * config.vatRate)
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
