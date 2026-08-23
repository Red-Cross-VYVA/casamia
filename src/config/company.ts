export const casamiaCompanyConfig = {
  legalName: 'MOKA DIGITECK, SOCIEDAD LIMITADA',
  commercialName: 'CasaMia',
  nif: 'B16929804',
  registeredAddress: 'Urbanización Sierra Blanca, Cascada de, n.º 311, 29602 Marbella (Málaga), España',
  registryDetails: '',
  customerServiceEmail: 'hola@casamia.com.es',
  customerServicePhone: '',
  customerServiceHours: '',
  complaintsEmail: 'hola@casamia.com.es',
  complaintsAddress: 'Urbanización Sierra Blanca, Cascada de, n.º 311, 29602 Marbella (Málaga), España',
  privacyEmail: 'hola@casamia.com.es',
  insurerDetails: '',
  adrEntityOrStatus: '',
  workmanshipGuaranteePeriod: '',
  supportedTerritories: ['Spain'],
  supportedLocales: ['es', 'en'],
  preparedLocales: ['ca', 'valencia-agreed-locale', 'gl', 'eu'],
} as const

export const legalVersionConfig = {
  effectiveDate: '2026-07-10',
  sourceLocale: 'es',
  sourceVersion: '1.0',
  version: '1.0',
} as const

export function hasCompanyPlaceholder(value: string) {
  return !value.trim() || (value.startsWith('[') && value.endsWith(']'))
}
