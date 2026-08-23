export const CORE_PACKAGE_STANDALONE_INSTALLATION_PRICE = 100

export const CORE_PACKAGE_CUSTOMER_PRICES = Object.freeze({
  'bathroom-home-safety-package': 749,
  'bedroom-home-safety-package': 649,
  'entrance-home-safety-package': 749,
  'kitchen-home-safety-package': 699,
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

  return Math.round(customerPrice / (1 + vatRate))
}

export function getCorePackageInstallationPolicy(packageCount) {
  const count = Math.max(0, Math.floor(Number(packageCount) || 0))
  const standaloneTotal = count * CORE_PACKAGE_STANDALONE_INSTALLATION_PRICE
  const scheduled = CORE_PACKAGE_INSTALLATION_SCHEDULE.find((entry) => entry.packageCount === count)

  if (!scheduled) {
    return {
      confirmed: count < 4,
      discount: 0,
      packageCount: count,
      totalInstallationPrice: standaloneTotal,
    }
  }

  return {
    confirmed: true,
    discount: Math.max(0, standaloneTotal - scheduled.totalInstallationPrice),
    packageCount: count,
    totalInstallationPrice: scheduled.totalInstallationPrice,
  }
}
