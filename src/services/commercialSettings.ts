import { DEFAULT_COMMERCIAL_SETTINGS, normaliseCommercialSettings } from '../../shared/commercialSettings.js'
import type { CommercialSettings, EditableServiceCatalogue, MasterServiceCatalogue } from '../types/serviceCatalogue.ts'

export { DEFAULT_COMMERCIAL_SETTINGS }

export function getCommercialSettings(
  source?: EditableServiceCatalogue | MasterServiceCatalogue | CommercialSettings,
): CommercialSettings {
  if (!source) return normaliseCommercialSettings(undefined)
  if ('assessmentVisitFeeGross' in source) return normaliseCommercialSettings(source)
  if ('masterCatalogue' in source) return normaliseCommercialSettings(source.masterCatalogue?.commercialSettings)
  return normaliseCommercialSettings('commercialSettings' in source ? source.commercialSettings : undefined)
}

export function formatCommercialCurrency(value: number, language = 'en') {
  return new Intl.NumberFormat(language.toLowerCase().startsWith('es') ? 'es-ES' : 'en-IE', {
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    style: 'currency',
  }).format(value)
}

export function formatCommercialPercent(rate: number) {
  return `${Math.round(rate * 100)}%`
}
