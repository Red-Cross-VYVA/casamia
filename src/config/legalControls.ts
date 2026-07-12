export type LocalePublicationStatus = 'interface-only' | 'draft' | 'pending-legal-review' | 'approved' | 'superseded'

export const legalLocaleControls = {
  sourceLocale: 'es',
  interfaceLocales: ['en', 'es', 'de', 'fr', 'nl'],
  approvedContractLocales: ['es'],
  preparedLegalLocales: ['ca', 'valencia-agreed-locale', 'gl', 'eu'],
  publicationStatus: {
    de: 'interface-only',
    en: 'pending-legal-review',
    es: 'pending-legal-review',
    fr: 'interface-only',
    nl: 'interface-only',
  } satisfies Record<string, LocalePublicationStatus>,
} as const

export function isContractLocaleApproved(locale: string) {
  return (legalLocaleControls.approvedContractLocales as readonly string[]).includes(locale)
}

export function getContractLanguageForLocale(locale: string) {
  return isContractLocaleApproved(locale) ? locale : legalLocaleControls.sourceLocale
}
