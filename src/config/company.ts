export const casamiaCompanyConfig = {
  legalName: 'MOKA DIGITECK, SOCIEDAD LIMITADA',
  commercialName: 'CasaMia',
  nif: 'B16929804',
  registeredAddress: 'URB SIERRA BLANCA, CASCADA DE, NUM 311, 29602 MARBELLA (MALAGA), Spain',
  registryDetails: 'Definitive NIF issued by AEAT on 07-10-2021. CSV: BWUDX82GNRUVUUMF.',
  customerServiceEmail: 'hola@casamia.com.es',
  customerServicePhone: '+34 900 000 000',
  customerServiceHours: 'Monday to Friday, 09:00-18:00 CET',
  complaintsEmail: 'hola@casamia.com.es',
  complaintsAddress: 'URB SIERRA BLANCA, CASCADA DE, NUM 311, 29602 MARBELLA (MALAGA), Spain',
  privacyEmail: 'hola@casamia.com.es',
  insurerDetails: 'Project-specific insurance details are confirmed in the accepted proposal or installation documentation.',
  adrEntityOrStatus:
    'CasaMia will consider recognised consumer ADR channels where applicable. Customers may also contact the competent consumer authority.',
  workmanshipGuaranteePeriod: 'as stated in the accepted proposal',
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
  return value.startsWith('[') && value.endsWith(']')
}
