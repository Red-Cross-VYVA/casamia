import type { CasaMiaService } from '../types/serviceCatalogue'

type LanguageKey = 'en' | 'es'

export type ServiceTrustSignal = {
  detail: string
  label: string
}

const copy = {
  en: {
    assessmentDetail: 'We look at the person, the room and the daily routine before recommending the final option.',
    assessmentLabel: 'Checked against daily use',
    compatibilityDetail: 'Measurements, fixing points, surfaces, device fit and home conditions are confirmed before work starts.',
    compatibilityLabel: 'Fit confirmed first',
    consentDetail: 'Smart alerts are only set up when the person understands who is notified and agrees to it.',
    consentLabel: 'Consent checked',
    grantDetail: 'We flag when an improvement may support grant paperwork. The public authority still decides approval.',
    grantLabel: 'Grant route explained',
    handoverDetail: 'Before the job is closed, the person using it knows what changed and how to use it safely.',
    handoverLabel: 'Clear explanation',
    installationDetail: 'The item is fitted or set up, tested in the real room and adjusted if something does not feel right.',
    installationLabel: 'Fitted and tested',
    quoteDetail: 'Scope and price are agreed after the home details are known, so the proposal reflects the real room.',
    quoteLabel: 'Price confirmed first',
    standard: 'We confirm fit, install or set up the right option, test it in place and explain safe use.',
    noHiddenFit: 'Fit checked first',
    professionalFitting: 'Fitted and tested',
    familyReady: 'Clear explanation',
    grantChip: 'Grant route explained',
    quoteChip: 'Price confirmed first',
    consentChip: 'Consent checked',
    typicalTime: 'Typical on-site task time',
    beforePrefix: 'Before recommending it, we confirm',
    measuredFit: 'measurements, fixing points and real room conditions',
    installedFinish: 'it can be fitted or set up and tested in place',
    quoteFinish: 'scope and price before quoting',
    grantFinish: 'whether it may support grant paperwork',
    dailyRoutineFit: 'that it suits the room and daily routine',
  },
  es: {
    assessmentDetail: 'Miramos a la persona, la estancia y la rutina diaria antes de recomendar la opción final.',
    assessmentLabel: 'Revisado según el uso diario',
    compatibilityDetail: 'Confirmamos medidas, puntos de fijación, superficies, compatibilidad y condiciones de la vivienda antes de empezar.',
    compatibilityLabel: 'Encaje confirmado primero',
    consentDetail: 'Los avisos inteligentes solo se configuran si la persona entiende quién recibe las notificaciones y lo acepta.',
    consentLabel: 'Consentimiento comprobado',
    grantDetail: 'Indicamos cuándo una mejora puede ayudar en la documentación de subvenciones. La aprobación depende de la administración.',
    grantLabel: 'Ruta de subvención explicada',
    handoverDetail: 'Antes de cerrar el trabajo, la persona que lo usa entiende qué ha cambiado y cómo usarlo con seguridad.',
    handoverLabel: 'Explicación clara',
    installationDetail: 'El elemento se instala o configura, se prueba en la estancia real y se ajusta si algo no resulta cómodo.',
    installationLabel: 'Instalado y probado',
    quoteDetail: 'El alcance y precio se acuerdan cuando ya se conocen los detalles de la vivienda.',
    quoteLabel: 'Precio confirmado primero',
    standard: 'Confirmamos el encaje, instalamos o configuramos la opción adecuada, la probamos y explicamos su uso seguro.',
    noHiddenFit: 'Encaje revisado',
    professionalFitting: 'Instalado y probado',
    familyReady: 'Explicación clara',
    grantChip: 'Subvención explicada',
    quoteChip: 'Precio confirmado',
    consentChip: 'Consentimiento',
    typicalTime: 'Tiempo orientativo de trabajo en casa',
    beforePrefix: 'Antes de recomendarlo, confirmamos',
    measuredFit: 'medidas, puntos de fijación y condiciones reales de la estancia',
    installedFinish: 'que pueda instalarse o configurarse y probarse en su sitio',
    quoteFinish: 'alcance y precio antes de presupuestar',
    grantFinish: 'si puede ayudar en la documentación de subvención',
    dailyRoutineFit: 'que encaje con la estancia y la rutina diaria',
  },
} as const

function languageKey(language: string): LanguageKey {
  return language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

function usesSmartOrConsent(service: CasaMiaService) {
  const searchable = `${service.id} ${service.name} ${service.category} ${service.shortDescription}`.toLowerCase()

  return Boolean(service.smartDependencies?.length)
    || /alert|avis|smart|sensor|voice|voz|monitor|doorbell|video|family|familia/.test(searchable)
}

export function getServiceTrustStandard(language: string) {
  return copy[languageKey(language)].standard
}

export function getServiceCredibleDescription(service: CasaMiaService, language: string) {
  const text = copy[languageKey(language)]
  const baseDescription = polishServiceDescription((service.customerDescription ?? service.shortDescription).trim())
  const needsFitCheck = Boolean(
    service.requiresAssessment
    || service.requirements?.assessment
    || service.requiresMeasurement
    || service.requiresCompatibilityCheck,
  )
  const proofParts = [
    needsFitCheck ? text.measuredFit : text.dailyRoutineFit,
    (service.requiresInstallation || service.requirements?.installation) ? text.installedFinish : null,
    (service.requiresQuote || service.requirements?.quote || service.pricingType === 'quote_only') ? text.quoteFinish : null,
    service.grant?.eligible ? text.grantFinish : null,
  ].filter(Boolean) as string[]

  const proofSentence = `${text.beforePrefix} ${formatTrustList(proofParts, language)}.`

  return baseDescription.endsWith(proofSentence)
    ? baseDescription
    : `${baseDescription.replace(/\s+$/, '').replace(/\.$/, '')}. ${proofSentence}`
}

export function getServicePreviewDescription(service: CasaMiaService) {
  const description = (
    service.customerBenefit
    ?? service.plainLanguageSummary
    ?? service.shortDescription
    ?? service.customerDescription
  ).trim()

  return compactPreviewDescription(polishServiceDescription(description))
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
    .concat('.')
}

function polishServiceDescription(description: string) {
  return description
    .replace(/^Adding\b/, 'Adds')
    .replace(/^Providing\b/, 'Provides')
    .replace(/^Installing\b/, 'Installs')
    .replace(/^Configuring\b/, 'Configures')
    .replace(/^Replacing\b/, 'Replaces')
}

function compactPreviewDescription(description: string) {
  const withoutOperationalProof = description
    .replace(/\s+(Before fitting|Before recommending it|Antes de recomendarlo|Antes de instalar)[^.]*\./gi, '')
    .replace(/\s+(Before fitting|Before recommending it|Antes de recomendarlo|Antes de instalar)[^.!?]*$/gi, '')
    .replace(/\s+(CasaMia confirms|Confirmamos)[^.]*\./gi, '')
    .replace(/\s+(CasaMia confirms|Confirmamos)[^.!?]*$/gi, '')
    .trim()

  const sentences = withoutOperationalProof.match(/[^.!?]+[.!?]+/g)
  const summary = (sentences?.slice(0, 1).join(' ') ?? withoutOperationalProof).trim()

  if (summary.length <= 96) return summary

  const clipped = summary.slice(0, 93)
  const lastSpace = clipped.lastIndexOf(' ')

  return `${clipped.slice(0, lastSpace > 62 ? lastSpace : clipped.length).trim()}...`
}

function formatTrustList(items: string[], language: string) {
  const conjunction = languageKey(language) === 'es' ? 'y' : 'and'

  if (items.length <= 2) {
    return items.join(items.length === 2 ? ` ${conjunction} ` : '')
  }

  return `${items.slice(0, -1).join(', ')} ${conjunction} ${items[items.length - 1]}`
}

export function getServiceProofChips(service: CasaMiaService, language: string) {
  const text = copy[languageKey(language)]
  const chips = [
    (service.requiresAssessment || service.requirements?.assessment || service.requiresMeasurement || service.requiresCompatibilityCheck)
      ? text.noHiddenFit
      : null,
    (service.requiresInstallation || service.requirements?.installation) ? text.professionalFitting : null,
    service.grant?.eligible ? text.grantChip : null,
    (service.requiresQuote || service.requirements?.quote || service.pricingType === 'quote_only') ? text.quoteChip : null,
    usesSmartOrConsent(service) ? text.consentChip : null,
    text.familyReady,
  ].filter(Boolean) as string[]

  return [...new Set(chips)].slice(0, 3)
}

export function getServiceTrustSignals(service: CasaMiaService, language: string): ServiceTrustSignal[] {
  const text = copy[languageKey(language)]
  const signals: ServiceTrustSignal[] = []

  if (service.requiresAssessment || service.requirements?.assessment || service.requiresSiteVisit || service.requirements?.siteVisit) {
    signals.push({ label: text.assessmentLabel, detail: text.assessmentDetail })
  }

  if (service.requiresMeasurement || service.requiresCompatibilityCheck || service.requirements?.measurement || service.requirements?.compatibilityCheck) {
    signals.push({ label: text.compatibilityLabel, detail: text.compatibilityDetail })
  }

  if (service.requiresInstallation || service.requirements?.installation) {
    signals.push({
      label: text.installationLabel,
      detail: service.typicalInstallationTime
        ? `${text.installationDetail} ${text.typicalTime}: ${service.typicalInstallationTime}.`
        : text.installationDetail,
    })
  }

  if (service.grant?.eligible) {
    signals.push({ label: text.grantLabel, detail: text.grantDetail })
  }

  if (service.requiresQuote || service.requirements?.quote || service.pricingType === 'quote_only') {
    signals.push({ label: text.quoteLabel, detail: service.pricing?.priceNotes ?? text.quoteDetail })
  }

  if (usesSmartOrConsent(service)) {
    signals.push({ label: text.consentLabel, detail: text.consentDetail })
  }

  signals.push({ label: text.handoverLabel, detail: text.handoverDetail })

  return signals.slice(0, 5)
}
