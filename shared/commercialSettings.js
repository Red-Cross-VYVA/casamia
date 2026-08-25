export const DEFAULT_COMMERCIAL_SETTINGS = Object.freeze({
  assessmentVisitFeeGross: 99,
  assessmentVisitVatRate: 0.21,
  proposalDepositRate: 0.5,
  corePackageStandaloneInstallationPrice: 100,
  corePackageInstallationSchedule: Object.freeze([
    Object.freeze({ packageCount: 1, totalInstallationPrice: 100 }),
    Object.freeze({ packageCount: 2, totalInstallationPrice: 170 }),
    Object.freeze({ packageCount: 3, totalInstallationPrice: 150 }),
  ]),
  installationQuoteFromPackageCount: 4,
})

export function normaliseCommercialSettings(value) {
  const source = value && typeof value === 'object' ? value : {}
  const schedule = Array.isArray(source.corePackageInstallationSchedule)
    ? source.corePackageInstallationSchedule
        .map((entry) => ({
          packageCount: integerInRange(entry?.packageCount, 1, 12, 0),
          totalInstallationPrice: money(entry?.totalInstallationPrice, -1),
        }))
        .filter((entry) => entry.packageCount > 0 && entry.totalInstallationPrice >= 0)
    : []

  return {
    assessmentVisitFeeGross: money(source.assessmentVisitFeeGross, DEFAULT_COMMERCIAL_SETTINGS.assessmentVisitFeeGross),
    assessmentVisitVatRate: rate(source.assessmentVisitVatRate, DEFAULT_COMMERCIAL_SETTINGS.assessmentVisitVatRate),
    proposalDepositRate: rate(source.proposalDepositRate, DEFAULT_COMMERCIAL_SETTINGS.proposalDepositRate, 0.01, 1),
    corePackageStandaloneInstallationPrice: money(
      source.corePackageStandaloneInstallationPrice,
      DEFAULT_COMMERCIAL_SETTINGS.corePackageStandaloneInstallationPrice,
    ),
    corePackageInstallationSchedule: schedule.length
      ? [...new Map(schedule.map((entry) => [entry.packageCount, entry])).values()].sort((a, b) => a.packageCount - b.packageCount)
      : DEFAULT_COMMERCIAL_SETTINGS.corePackageInstallationSchedule.map((entry) => ({ ...entry })),
    installationQuoteFromPackageCount: integerInRange(
      source.installationQuoteFromPackageCount,
      2,
      12,
      DEFAULT_COMMERCIAL_SETTINGS.installationQuoteFromPackageCount,
    ),
  }
}

function money(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : fallback
}

function rate(value, fallback, min = 0, max = 1) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback
}

function integerInRange(value, min, max, fallback) {
  const parsed = Math.floor(Number(value))
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback
}
