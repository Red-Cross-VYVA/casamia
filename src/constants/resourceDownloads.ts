export type ResourceDownloadLanguage = 'en' | 'es'

export type ResourceDownload = {
  fileName: string
  href: string
  language: ResourceDownloadLanguage
  languageLabel: string
  title: string
}

export const completeHomeChecklistDownloads: Record<ResourceDownloadLanguage, ResourceDownload> = {
  en: {
    fileName: 'casamia-complete-senior-home-conversion-checklist-en.pdf',
    href: '/downloads/casamia-complete-senior-home-conversion-checklist-en.pdf',
    language: 'en',
    languageLabel: 'English',
    title: 'The Complete Senior Home Conversion Checklist',
  },
  es: {
    fileName: 'casamia-lista-completa-adaptacion-vivienda-personas-mayores-es.pdf',
    href: '/downloads/casamia-lista-completa-adaptacion-vivienda-personas-mayores-es.pdf',
    language: 'es',
    languageLabel: 'Español',
    title: 'Lista completa para adaptar la vivienda de una persona mayor',
  },
}
