import type {
  ConfiguratorState,
  PackageComponent,
  PackageId,
  PackageSelection,
  QuoteLine,
  QuoteSummary,
  SiteConfirmationItem,
} from '../types/configurator.ts'
import {
  getConfiguredPackageById,
  getConfiguredPackages,
  getConfiguredPricing,
} from './packageConfig.ts'

const householdPackageIds: PackageId[] = ['home-movement-safe', 'connected-safety-vyva']

export function formatConfiguratorCurrency(amount: number) {
  const pricing = getConfiguredPricing()

  return new Intl.NumberFormat('es-ES', {
    currency: pricing.currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount)
}

export function getSelectedPackageQuantity(packageId: PackageId, state: ConfiguratorState) {
  const packageDefinition = getConfiguredPackageById(packageId)

  if (!packageDefinition) {
    return 0
  }

  if (householdPackageIds.includes(packageId)) {
    return state.selectedPackageIds.includes(packageId) ? 1 : 0
  }

  if (!packageDefinition.quantityKey) {
    return 1
  }

  return Math.max(0, Number(state.quantities[packageDefinition.quantityKey]) || 0)
}

export function calculateConfiguratorQuote(state: ConfiguratorState): QuoteSummary {
  const pricing = getConfiguredPricing()
  const lines: QuoteLine[] = []
  const standardComponents: PackageComponent[] = []
  const conditionalComponents: PackageComponent[] = []
  const quotationOnlyItems: PackageComponent[] = []
  const siteConfirmationItems: SiteConfirmationItem[] = []
  const selections: PackageSelection[] = state.selectedPackageIds.map((packageId) => ({
    packageId,
    quantity: getSelectedPackageQuantity(packageId, state),
  }))

  state.selectedPackageIds.forEach((packageId) => {
    const packageDefinition = getConfiguredPackageById(packageId)
    const quantity = getSelectedPackageQuantity(packageId, state)

    if (!packageDefinition || quantity < 1) {
      return
    }

    lines.push({
      id: packageId,
      label: packageDefinition.name,
      packageId,
      quantity,
      unitPrice: pricing.packagePrices[packageId],
      total: pricing.packagePrices[packageId] * quantity,
      note: packageDefinition.salesUnit,
    })

    standardComponents.push(...getApplicableStandardComponents(packageId, state))
  })

  applyEntranceOptions(state, lines, conditionalComponents, quotationOnlyItems, siteConfirmationItems)
  applyMovementOptions(state, lines, conditionalComponents)
  applyKitchenOptions(state, lines, conditionalComponents, siteConfirmationItems)
  applyBedroomOptions(state, lines, conditionalComponents, quotationOnlyItems)
  applyBathroomOptions(state, siteConfirmationItems)
  applyConnectedOptions(state, lines, conditionalComponents)

  const oneTimeSubtotal = lines.reduce((sum, line) => sum + line.total, 0)
  const recurringMonthlySubtotal = lines.reduce((sum, line) => sum + (line.recurringMonthly ?? 0), 0)
  const vat = Math.round(oneTimeSubtotal * pricing.vatRate)

  return {
    selections,
    standardComponents: uniqueComponents(standardComponents),
    conditionalComponents: uniqueComponents(conditionalComponents),
    quotationOnlyItems: uniqueComponents(quotationOnlyItems),
    lines,
    siteConfirmationItems: uniqueSiteItems(siteConfirmationItems),
    oneTimeSubtotal,
    recurringMonthlySubtotal,
    vat,
    totalEstimate: oneTimeSubtotal + vat,
    deposit: pricing.depositAmount,
  }
}

function getApplicableStandardComponents(packageId: PackageId, state: ConfiguratorState) {
  const packageDefinition = getConfiguredPackageById(packageId)

  if (!packageDefinition) {
    return []
  }

  if (packageId !== 'kitchen-independence') {
    return packageDefinition.standardComponents
  }

  const hasGas = range(state.quantities.kitchens).some((index) => getAnswer(state, `kitchen-${index}-gas`) === 'yes')

  return packageDefinition.standardComponents.filter((component) => component.id !== 'gas-co-sensor' || hasGas)
}

function applyEntranceOptions(
  state: ConfiguratorState,
  lines: QuoteLine[],
  conditionalComponents: PackageComponent[],
  quotationOnlyItems: PackageComponent[],
  siteConfirmationItems: SiteConfirmationItem[],
) {
  if (!state.selectedPackageIds.includes('entrance-safe')) {
    return
  }

  const packageDefinition = getConfiguredPackageById('entrance-safe')

  range(state.quantities.entrances).forEach((index) => {
    const ramp = getAnswer(state, `entrance-${index}-ramp`)

    if (ramp === 'small-threshold-ramp') {
      addConditionalLine({
        componentId: 'small-threshold-ramp',
        label: `Small threshold ramp, entrance ${index}`,
        lines,
        packageId: 'entrance-safe',
        priceKey: 'small-threshold-ramp',
        sourceComponents: packageDefinition?.conditionalComponents ?? [],
      })
      conditionalComponents.push(...findComponents(packageDefinition?.conditionalComponents, ['small-threshold-ramp']))
    }

    if (ramp === 'modular-access-ramp' || ramp === 'unsure') {
      quotationOnlyItems.push(...findComponents(packageDefinition?.quotationOnlyComponents, ['modular-access-ramp']))
      siteConfirmationItems.push({
        label: `Entrance ${index} ramp`,
        reason: 'Ramp type, length and gradient require measurement before final pricing.',
      })
    }
  })
}

function applyMovementOptions(state: ConfiguratorState, lines: QuoteLine[], conditionalComponents: PackageComponent[]) {
  if (!state.selectedPackageIds.includes('home-movement-safe') || state.property.hasInternalStairs !== 'yes') {
    return
  }

  const staircases = Math.max(0, Number(state.quantities.staircases) || 0)
  const pricing = getConfiguredPricing()
  const packageDefinition = getConfiguredPackageById('home-movement-safe')

  if (staircases < 1) {
    return
  }

  lines.push({
    id: 'staircase-module',
    label: 'Staircase safety module',
    packageId: 'home-movement-safe',
    quantity: staircases,
    unitPrice: pricing.staircaseModulePrice,
    total: pricing.staircaseModulePrice * staircases,
    note: 'Only applied because internal stairs were selected.',
  })
  conditionalComponents.push(...(packageDefinition?.conditionalComponents ?? []))
}

function applyKitchenOptions(
  state: ConfiguratorState,
  lines: QuoteLine[],
  conditionalComponents: PackageComponent[],
  siteConfirmationItems: SiteConfirmationItem[],
) {
  if (!state.selectedPackageIds.includes('kitchen-independence')) {
    return
  }

  const packageDefinition = getConfiguredPackageById('kitchen-independence')
  const components = packageDefinition?.conditionalComponents ?? []

  range(state.quantities.kitchens).forEach((index) => {
    if (getAnswer(state, `kitchen-${index}-upperCabinets`) === 'yes') {
      addConditionalLine({
        componentId: 'pull-down-shelf',
        label: `Pull-down cabinet shelf, kitchen ${index}`,
        lines,
        packageId: 'kitchen-independence',
        priceKey: 'pull-down-shelf',
        sourceComponents: components,
      })
      conditionalComponents.push(...findComponents(components, ['pull-down-shelf']))
      siteConfirmationItems.push({
        label: `Kitchen ${index} upper cabinets`,
        reason: 'Cabinet dimensions and hardware compatibility must be confirmed.',
      })
    }

    if (getAnswer(state, `kitchen-${index}-stoveShutoff`) === 'yes') {
      addConditionalLine({
        componentId: 'stove-shutoff',
        label: `Automatic stove shut-off, kitchen ${index}`,
        lines,
        packageId: 'kitchen-independence',
        priceKey: 'stove-shutoff',
        sourceComponents: components,
      })
      conditionalComponents.push(...findComponents(components, ['stove-shutoff']))
    }

    if (getAnswer(state, `kitchen-${index}-touchlessFaucet`) === 'yes') {
      addConditionalLine({
        componentId: 'touchless-faucet',
        label: `Touchless faucet, kitchen ${index}`,
        lines,
        packageId: 'kitchen-independence',
        priceKey: 'touchless-faucet',
        sourceComponents: components,
      })
      conditionalComponents.push(...findComponents(components, ['touchless-faucet']))
      siteConfirmationItems.push({
        label: `Kitchen ${index} faucet`,
        reason: 'Tap compatibility must be checked before installation.',
      })
    }
  })
}

function applyBedroomOptions(
  state: ConfiguratorState,
  lines: QuoteLine[],
  conditionalComponents: PackageComponent[],
  quotationOnlyItems: PackageComponent[],
) {
  if (!state.selectedPackageIds.includes('bedroom-night-safe')) {
    return
  }

  const packageDefinition = getConfiguredPackageById('bedroom-night-safe')
  const conditional = packageDefinition?.conditionalComponents ?? []
  const quoteOnly = packageDefinition?.quotationOnlyComponents ?? []

  range(state.quantities.bedrooms).forEach((index) => {
    if (getAnswer(state, `bedroom-${index}-caregiverAlerts`) === 'yes') {
      addConditionalLine({
        componentId: 'bed-exit-sensor',
        label: `Bed-exit sensor, bedroom ${index}`,
        lines,
        packageId: 'bedroom-night-safe',
        priceKey: 'bed-exit-sensor',
        sourceComponents: conditional,
      })
      conditionalComponents.push(...findComponents(conditional, ['bed-exit-sensor']))
    }

    if (getAnswer(state, `bedroom-${index}-adjustableBed`) === 'yes') {
      quotationOnlyItems.push(...findComponents(quoteOnly, ['adjustable-bed']))
    }

    if (getAnswer(state, `bedroom-${index}-pressureMattress`) === 'yes') {
      quotationOnlyItems.push(...findComponents(quoteOnly, ['pressure-mattress']))
    }
  })
}

function applyBathroomOptions(state: ConfiguratorState, siteConfirmationItems: SiteConfirmationItem[]) {
  if (!state.selectedPackageIds.includes('bathroom-safe')) {
    return
  }

  range(state.quantities.bathrooms).forEach((index) => {
    const wallType = getAnswer(state, `bathroom-${index}-wallType`)

    if (wallType === 'unsure' || wallType === 'lightweight') {
      siteConfirmationItems.push({
        label: `Bathroom ${index} wall structure`,
        reason: 'Wall structure must be confirmed before grab bars are fixed.',
      })
    }
  })
}

function applyConnectedOptions(state: ConfiguratorState, lines: QuoteLine[], conditionalComponents: PackageComponent[]) {
  if (!state.selectedPackageIds.includes('connected-safety-vyva')) {
    return
  }

  const packageDefinition = getConfiguredPackageById('connected-safety-vyva')
  const selectedAlerts = getAnswer(state, 'connected-alerts')
  const alertList = Array.isArray(selectedAlerts) ? selectedAlerts : []

  if (alertList.includes('monitoring')) {
    addRecurringLine({
      componentId: 'monitoring-plan',
      label: 'Professional response-centre monitoring',
      lines,
      packageId: 'connected-safety-vyva',
      recurringPriceKey: 'monitoring-plan',
    })
    conditionalComponents.push(...findComponents(packageDefinition?.conditionalComponents, ['monitoring-plan']))
  }

  if (getAnswer(state, 'connected-outsideProtection') === 'yes') {
    addRecurringLine({
      componentId: 'gps-protection',
      label: 'Mobile or GPS protection outside the home',
      lines,
      packageId: 'connected-safety-vyva',
      recurringPriceKey: 'gps-protection',
    })
    conditionalComponents.push(...findComponents(packageDefinition?.conditionalComponents, ['gps-protection']))
  }
}

function addConditionalLine({
  componentId,
  label,
  lines,
  packageId,
  priceKey,
  sourceComponents,
}: {
  componentId: string
  label: string
  lines: QuoteLine[]
  packageId: PackageId
  priceKey: string
  sourceComponents: PackageComponent[]
}) {
  const component = findComponents(sourceComponents, [componentId])[0]
  const pricing = getConfiguredPricing()
  const price = pricing.componentPrices[priceKey] ?? 0

  lines.push({
    id: `${componentId}-${lines.length + 1}`,
    label: component?.label ? label : label,
    packageId,
    quantity: 1,
    unitPrice: price,
    total: price,
  })
}

function addRecurringLine({
  componentId,
  label,
  lines,
  packageId,
  recurringPriceKey,
}: {
  componentId: string
  label: string
  lines: QuoteLine[]
  packageId: PackageId
  recurringPriceKey: string
}) {
  const pricing = getConfiguredPricing()
  const monthly = pricing.recurringPrices[recurringPriceKey] ?? 0

  lines.push({
    id: componentId,
    label,
    packageId,
    quantity: 1,
    unitPrice: 0,
    total: 0,
    recurringMonthly: monthly,
  })
}

function getAnswer(state: ConfiguratorState, key: string) {
  if (key === 'property.hasInternalStairs') {
    return state.property.hasInternalStairs
  }

  return state.answers[key]
}

function range(count: number) {
  return Array.from({ length: Math.max(0, Number(count) || 0) }, (_, index) => index + 1)
}

function findComponents(components: PackageComponent[] | undefined, componentIds: string[]) {
  return (components ?? []).filter((component) => componentIds.includes(component.id))
}

function uniqueComponents(components: PackageComponent[]) {
  return Array.from(new Map(components.map((component) => [component.id, component])).values())
}

function uniqueSiteItems(items: SiteConfirmationItem[]) {
  return Array.from(new Map(items.map((item) => [`${item.label}-${item.reason}`, item])).values())
}

export function getConfiguratorPackageOptions() {
  return getConfiguredPackages()
}
