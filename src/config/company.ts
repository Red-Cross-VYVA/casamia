export const casamiaCompanyConfig = {
  legalName: 'MOKA DIGITECK, SOCIEDAD LIMITADA',
  commercialName: 'CasaMia',
  nif: 'B16929804',
  registeredAddress: 'Urbanización Sierra Blanca, Cascada de, n.º 311, 29602 Marbella (Málaga), España',
  registryDetails: 'Registro Mercantil de Málaga, tomo 6075, libro 4982, folio 162, sección 8, hoja MA-163207, inscripción 1',
  customerServiceEmail: 'hola@casamia.com.es',
  customerServicePhone: '+34 648 027 076',
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
  effectiveDate: '2026-08-26',
  sourceLocale: 'es',
  sourceVersion: '1.1',
  version: '1.1',
} as const

export function hasCompanyPlaceholder(value: string) {
  return !value.trim() || (value.startsWith('[') && value.endsWith(']'))
}
