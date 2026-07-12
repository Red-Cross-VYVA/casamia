export const casamiaCompanyConfig = {
  legalName: '[CASAMIA_LEGAL_NAME]',
  commercialName: 'CasaMia',
  nif: '[CASAMIA_NIF]',
  registeredAddress: '[CASAMIA_REGISTERED_ADDRESS]',
  registryDetails: '[CASAMIA_REGISTRY_DETAILS]',
  customerServiceEmail: '[CUSTOMER_SERVICE_EMAIL]',
  customerServicePhone: '[CUSTOMER_SERVICE_PHONE]',
  customerServiceHours: '[CUSTOMER_SERVICE_HOURS]',
  complaintsEmail: '[COMPLAINTS_EMAIL]',
  complaintsAddress: '[COMPLAINTS_ADDRESS]',
  privacyEmail: '[PRIVACY_EMAIL]',
  insurerDetails: '[INSURER_DETAILS]',
  adrEntityOrStatus: '[ADR_ENTITY_OR_STATUS]',
  workmanshipGuaranteePeriod: '[WORKMANSHIP_GUARANTEE_PERIOD]',
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
