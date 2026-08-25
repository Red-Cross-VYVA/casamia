export type CommercialInstallationScheduleEntry = {
  packageCount: number
  totalInstallationPrice: number
}

export type CommercialSettings = {
  assessmentVisitFeeGross: number
  assessmentVisitVatRate: number
  proposalDepositRate: number
  corePackageStandaloneInstallationPrice: number
  corePackageInstallationSchedule: CommercialInstallationScheduleEntry[]
  installationQuoteFromPackageCount: number
}

export const DEFAULT_COMMERCIAL_SETTINGS: Readonly<CommercialSettings>
export function normaliseCommercialSettings(value: unknown): CommercialSettings
