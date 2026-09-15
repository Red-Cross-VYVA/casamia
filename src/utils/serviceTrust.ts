import type { CasaMiaService } from '../types/serviceCatalogue'

type LanguageKey = 'en' | 'es'

export type ServiceTrustSignal = {
  detail: string
  label: string
}

const copy = {
  en: {
    assessmentDetail: 'CasaMia reviews the resident, room layout and daily routine before confirming the final recommendation.',
    assessmentLabel: 'Checked before recommendation',
    compatibilityDetail: 'We confirm measurements, surface strength, device fit or home conditions before installation is agreed.',
    compatibilityLabel: 'Compatibility reviewed',
    consentDetail: 'Smart or family-alert features are configured only where suitable, understood and consented.',
    consentLabel: 'Consent-aware setup',
    grantDetail: 'This type of improvement may support grant paperwork where local criteria apply. Approval is always decided by the authority.',
    grantLabel: 'Grant-aware scope',
    handoverDetail: 'The resident or family receives a practical handover so the improvement is understood before CasaMia closes the job.',
    handoverLabel: 'CasaMia handover',
    installationDetail: 'Professional fitting is followed by a practical use and stability check before handover.',
    installationLabel: 'Installed and tested',
    quoteDetail: 'Final scope and price are confirmed after the home check, so the proposal reflects the real room and materials.',
    quoteLabel: 'Measured quote',
    standard: 'CasaMia checks fit, coordinates installation, tests the result and explains safe use before handover.',
    bestForPrefix: 'Best for',
    bestForFallback: 'families who want a practical improvement matched to the existing home before work begins.',
    noHiddenFit: 'No guesswork on fit',
    professionalFitting: 'Professional fitting',
    familyReady: 'Family handover',
    grantChip: 'Grant support',
    quoteChip: 'Measured quote',
    consentChip: 'Consent-aware',
    typicalTime: 'Typical on-site task time',
  },
  es: {
    assessmentDetail: 'CasaMia revisa a la persona, la distribución y la rutina diaria antes de confirmar la recomendación final.',
    assessmentLabel: 'Revisado antes de recomendar',
    compatibilityDetail: 'Confirmamos medidas, resistencia de superficies, compatibilidad de dispositivos o condiciones de la vivienda antes de acordar la instalación.',
    compatibilityLabel: 'Compatibilidad revisada',
    consentDetail: 'Las funciones inteligentes o avisos familiares se configuran solo cuando encajan, se entienden y cuentan con consentimiento.',
    consentLabel: 'Configuración con consentimiento',
    grantDetail: 'Este tipo de mejora puede ayudar en la documentación de subvenciones cuando se cumplen criterios locales. La aprobación siempre depende de la administración.',
    grantLabel: 'Alcance orientado a subvención',
    handoverDetail: 'La persona o la familia recibe una entrega práctica para entender la mejora antes de cerrar el trabajo.',
    handoverLabel: 'Entrega CasaMia',
    installationDetail: 'La instalación profesional se completa con una comprobación práctica de uso y estabilidad antes de la entrega.',
    installationLabel: 'Instalado y probado',
    quoteDetail: 'El alcance y precio final se confirman tras revisar la vivienda, para que la propuesta refleje la estancia y materiales reales.',
    quoteLabel: 'Presupuesto medido',
    standard: 'CasaMia comprueba el encaje, coordina la instalación, prueba el resultado y explica el uso seguro antes de la entrega.',
    bestForPrefix: 'Ideal para',
    bestForFallback: 'familias que quieren una mejora práctica adaptada a la vivienda existente antes de empezar.',
    noHiddenFit: 'Sin suposiciones',
    professionalFitting: 'Instalación profesional',
    familyReady: 'Entrega a la familia',
    grantChip: 'Apoyo subvención',
    quoteChip: 'Presupuesto medido',
    consentChip: 'Con consentimiento',
    typicalTime: 'Tiempo orientativo de trabajo en casa',
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

export function getServiceBestFor(service: CasaMiaService, language: string) {
  const text = copy[languageKey(language)]
  const benefit = service.outcome ?? service.customerBenefit ?? service.shortDescription
  const cleanedBenefit = benefit.trim().replace(/\.$/, '')

  return `${text.bestForPrefix} ${cleanedBenefit ? cleanedBenefit.charAt(0).toLowerCase() + cleanedBenefit.slice(1) : text.bestForFallback}`
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
