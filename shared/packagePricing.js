export const CORE_PACKAGE_STANDALONE_INSTALLATION_PRICE = 100

export const CORE_PACKAGE_CUSTOMER_PRICES = Object.freeze({
  'bathroom-home-safety-package': 749,
  'bedroom-home-safety-package': 649,
  'entrance-home-safety-package': 749,
  'kitchen-home-safety-package': 699,
})

export const STARTER_PACKAGE_CUSTOMER_PRICES = Object.freeze({
  'bathroom-essentials-pack': 499,
  'night-movement-pack': 399,
  'kitchen-safety-starter-pack': 399,
  'core-rails-pack': 349,
  'entrance-basics-pack': 449,
})

export const CORE_PACKAGE_INSTALLATION_SCHEDULE = Object.freeze([
  { packageCount: 1, totalInstallationPrice: 100 },
  { packageCount: 2, totalInstallationPrice: 170 },
  { packageCount: 3, totalInstallationPrice: 150 },
])

export function getApprovedCorePackageCustomerPrice(packageId) {
  const customerPrice = CORE_PACKAGE_CUSTOMER_PRICES[packageId]

  return Number.isFinite(customerPrice) && customerPrice > 0
    ? customerPrice
    : undefined
}

export function getCorePackageCataloguePrice(packageId, vatRate = 0.21) {
  const customerPrice = getApprovedCorePackageCustomerPrice(packageId)

  if (!Number.isFinite(customerPrice) || customerPrice <= 0) {
    return undefined
  }

  return Math.round((customerPrice / (1 + vatRate)) * 100) / 100
}

export function getApprovedStarterPackageCustomerPrice(packageId) {
  const customerPrice = STARTER_PACKAGE_CUSTOMER_PRICES[packageId]

  return Number.isFinite(customerPrice) && customerPrice > 0
    ? customerPrice
    : undefined
}

export function getStarterPackageCataloguePrice(packageId, vatRate = 0.21) {
  const customerPrice = getApprovedStarterPackageCustomerPrice(packageId)

  if (!Number.isFinite(customerPrice) || customerPrice <= 0) {
    return undefined
  }

  return Math.round((customerPrice / (1 + vatRate)) * 100) / 100
}

export function getCorePackageInstallationPolicy(packageCount, commercialSettings = {}) {
  const count = Math.max(0, Math.floor(Number(packageCount) || 0))
  const standalonePrice = finiteNonNegative(
    commercialSettings.corePackageStandaloneInstallationPrice,
    CORE_PACKAGE_STANDALONE_INSTALLATION_PRICE,
  )
  const configuredSchedule = Array.isArray(commercialSettings.corePackageInstallationSchedule)
    ? commercialSettings.corePackageInstallationSchedule
    : CORE_PACKAGE_INSTALLATION_SCHEDULE
  const quoteFrom = Math.max(2, Math.floor(Number(commercialSettings.installationQuoteFromPackageCount) || 4))
  const standaloneTotal = count * standalonePrice
  const scheduled = configuredSchedule.find((entry) => Number(entry?.packageCount) === count)

  if (!scheduled) {
    return {
      confirmed: count < quoteFrom,
      discount: 0,
      packageCount: count,
      totalInstallationPrice: standaloneTotal,
    }
  }

  return {
    confirmed: true,
    discount: Math.max(0, standaloneTotal - finiteNonNegative(scheduled.totalInstallationPrice, standaloneTotal)),
    packageCount: count,
    totalInstallationPrice: finiteNonNegative(scheduled.totalInstallationPrice, standaloneTotal),
  }
}

function finiteNonNegative(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}
