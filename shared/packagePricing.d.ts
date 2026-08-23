export const CORE_PACKAGE_STANDALONE_INSTALLATION_PRICE: number

export const CORE_PACKAGE_CUSTOMER_PRICES: Readonly<Record<string, number>>

export const STARTER_PACKAGE_CUSTOMER_PRICES: Readonly<Record<string, number>>

export const CORE_PACKAGE_INSTALLATION_SCHEDULE: ReadonlyArray<{
  packageCount: number
  totalInstallationPrice: number
}>

export function getApprovedCorePackageCustomerPrice(packageId: string): number | undefined

export function getCorePackageCataloguePrice(packageId: string, vatRate?: number): number | undefined

export function getApprovedStarterPackageCustomerPrice(packageId: string): number | undefined

export function getStarterPackageCataloguePrice(packageId: string, vatRate?: number): number | undefined

export function getCorePackageInstallationPolicy(packageCount: number): {
  confirmed: boolean
  discount: number
  packageCount: number
  totalInstallationPrice: number
}
