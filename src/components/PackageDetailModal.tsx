import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { SafeImage } from './SafeImage'
import { getCatalogueOutcomeImage } from '../constants/catalogueVisuals'
import { getProposalSpecificationForOutcome } from '../services/masterServiceCatalogue'
import { getPlansOutcomeCredibleDescription, localizePlansString, type PlansBuilderGroup } from '../services/plansBuilderPricing'
import type { MasterCatalogueOutcome, MasterServiceCatalogue } from '../types/serviceCatalogue'

type PackageDetailModalProps = {
  catalogue: MasterServiceCatalogue
  group: PlansBuilderGroup | null
  language: string
  onClose: () => void
}

type PackageDetailTab = 'core' | 'optional'

const packageModalCopy = {
  en: {
    benefit: 'Why it helps',
    close: 'Close',
    coreTab: 'Core package',
    description: 'Item description',
    includes: 'What CasaMia includes',
    itemIncludes: 'For this item, CasaMia includes',
    professionalFitting: 'Professional fitting',
    familyReady: 'Family handover',
    grantChip: 'Grant support',
    quoteChip: 'Measured quote',
    noHiddenFit: 'No guesswork on fit',
    next: 'Next',
    noDetailItems: 'No items to show in this section.',
    optionalTab: 'Optional add-ons',
    previous: 'Previous',
    slideLabel: 'Item',
    standard: 'We check the fit, coordinate installation, test the result and explain safe use before handover.',
    trust: 'Why families can trust it',
    trustSignals: {
      assessment: {
        label: 'Checked before recommendation',
        detail: 'We review the resident, room layout and daily routine before agreeing the final scope.',
      },
      compatibility: {
        label: 'Compatibility reviewed',
        detail: 'Measurements, surface strength, device fit and home conditions are checked before installation is agreed.',
      },
      grant: {
        label: 'Grant-aware scope',
        detail: 'This improvement may support grant paperwork where local criteria apply. Approval is always decided by the authority.',
      },
      handover: {
        label: 'CasaMia handover',
        detail: 'The resident or family receives a practical handover so the improvement is understood before the job is closed.',
      },
      installation: {
        label: 'Installed and tested',
        detail: 'Professional fitting is followed by a practical use and stability check before handover.',
      },
      quote: {
        label: 'Measured quote',
        detail: 'Final scope and price are agreed after review, so the proposal reflects the real room and materials.',
      },
    },
  },
  es: {
    benefit: 'Por qué ayuda',
    close: 'Cerrar',
    coreTab: 'Paquete base',
    description: 'Descripción del elemento',
    includes: 'Qué incluye CasaMia',
    itemIncludes: 'Para este elemento, CasaMia incluye',
    professionalFitting: 'Instalación profesional',
    familyReady: 'Entrega a la familia',
    grantChip: 'Apoyo subvención',
    quoteChip: 'Presupuesto medido',
    noHiddenFit: 'Sin suposiciones',
    next: 'Siguiente',
    noDetailItems: 'No hay elementos para mostrar en esta sección.',
    optionalTab: 'Extras opcionales',
    previous: 'Anterior',
    slideLabel: 'Elemento',
    standard: 'Revisamos el encaje, coordinamos la instalación, probamos el resultado y explicamos el uso seguro antes de la entrega.',
    trust: 'Por qué aporta confianza',
    trustSignals: {
      assessment: {
        label: 'Revisado antes de recomendar',
        detail: 'Revisamos a la persona, la distribución y la rutina diaria antes de acordar el alcance final.',
      },
      compatibility: {
        label: 'Compatibilidad revisada',
        detail: 'Se comprueban medidas, resistencia de superficies, compatibilidad de dispositivos y condiciones de la vivienda antes de acordar la instalación.',
      },
      grant: {
        label: 'Alcance orientado a subvención',
        detail: 'Esta mejora puede ayudar en la documentación de subvenciones cuando se cumplen criterios locales. La aprobación siempre depende de la administración.',
      },
      handover: {
        label: 'Entrega CasaMia',
        detail: 'La persona o la familia recibe una entrega práctica para entender la mejora antes de cerrar el trabajo.',
      },
      installation: {
        label: 'Instalado y probado',
        detail: 'La instalación profesional se completa con una comprobación práctica de uso y estabilidad antes de la entrega.',
      },
      quote: {
        label: 'Presupuesto medido',
        detail: 'El alcance y precio final se acuerdan tras la revisión, para que la propuesta refleje la estancia y materiales reales.',
      },
    },
  },
} as const

function cleanDetailItem(item: string) {
  return item
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
    .trim()
}

function normalizeDetailItem(item: string) {
  return cleanDetailItem(item)
    .replace(/^(Bathroom|Bedroom|Kitchen|Living room|Living Room|Entrance)\s+/i, '')
    .replace(/\s+(service|task)$/i, '')
    .trim()
}

function getDetailItemKey(item: string) {
  const normalized = normalizeDetailItem(item).toLocaleLowerCase()

  if (/anti[-\s]?slip.*floor|floor.*anti[-\s]?slip/.test(normalized)) {
    return 'anti-slip-floor-treatment'
  }

  if (/secure.*floor covering|floor covering/.test(normalized)) {
    return 'secure-floor-coverings'
  }

  return normalized
    .replace(/\b(apply|install|fit|add|create|clear and secure|improved|safer|service)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function dedupeDetailItems(items: string[]) {
  const seen = new Set<string>()

  return items
    .map(normalizeDetailItem)
    .filter((item) => {
      if (!item || item.length < 3) {
        return false
      }

      const key = getDetailItemKey(item)
      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
}

function splitDetailFallback(text: string) {
  return dedupeDetailItems(
    text
      .replace(/\band\b/gi, ',')
      .replace(/\by\b/gi, ',')
      .split(/[.;,]+/)
      .map((item) => item.trim()),
  ).slice(0, 6)
}

function getDetailBenefit(outcome: MasterCatalogueOutcome, language: 'en' | 'es') {
  return localizePlansString(
    outcome.customerBenefit,
    language,
    localizePlansString(outcome.shortDescription, language, outcome.internalName),
  )
}

function getDetailDescription(outcome: MasterCatalogueOutcome, language: 'en' | 'es') {
  return getPlansOutcomeCredibleDescription(outcome, language)
}

function getOutcomeProofChips(
  outcome: MasterCatalogueOutcome,
  catalogue: MasterServiceCatalogue,
  language: 'en' | 'es',
) {
  const text = packageModalCopy[language]
  const specification = getProposalSpecificationForOutcome(outcome.id, catalogue)
  const hasInstallation = specification.installationTasks.length > 0
  const chips = [
    (outcome.requiresAssessment || outcome.requiresMeasurement || outcome.requiresCompatibilityCheck || outcome.requiresSiteVisit)
      ? text.noHiddenFit
      : null,
    hasInstallation ? text.professionalFitting : null,
    outcome.grantEligible ? text.grantChip : null,
    outcome.requiresQuote || outcome.pricingType === 'quote' ? text.quoteChip : null,
    text.familyReady,
  ].filter(Boolean) as string[]

  return [...new Set(chips)].slice(0, 3)
}

function getOutcomeTrustSignals(
  outcome: MasterCatalogueOutcome,
  catalogue: MasterServiceCatalogue,
  language: 'en' | 'es',
) {
  const text = packageModalCopy[language].trustSignals
  const specification = getProposalSpecificationForOutcome(outcome.id, catalogue)
  const signals = []

  if (outcome.requiresAssessment || outcome.requiresSiteVisit) {
    signals.push(text.assessment)
  }

  if (outcome.requiresMeasurement || outcome.requiresCompatibilityCheck) {
    signals.push(text.compatibility)
  }

  if (specification.installationTasks.length > 0) {
    signals.push(text.installation)
  }

  if (outcome.grantEligible) {
    signals.push(text.grant)
  }

  if (outcome.requiresQuote || outcome.pricingType === 'quote') {
    signals.push(text.quote)
  }

  signals.push(text.handover)

  return signals.slice(0, 5)
}

function localizeDetailItem(item: string, language: 'en' | 'es') {
  if (language === 'en') return item

  const translations: Record<string, string> = {
    'Anti-slip floor treatment': 'Tratamiento antideslizante de suelo',
    'Automatic water shut-off valve': 'Valvula automatica de corte de agua',
    'Bathroom door adjustment': 'Ajuste de puerta de bano',
    'Easy-release privacy lock': 'Cierre de privacidad con desbloqueo facil',
    'Family or carer alert setup': 'Avisos para familia o cuidador',
    'Folding shower seat': 'Asiento abatible de ducha',
    'Grab bar': 'Barra de apoyo',
    'Lever door handle': 'Manilla tipo palanca',
    'Lever mixer tap': 'Grifo monomando de palanca',
    'Lever-operated shower control': 'Mando de ducha de palanca',
    'Low-threshold transition strip': 'Perfil de transicion de bajo umbral',
    'Loose rug securing or removal': 'Fijacion o retirada de alfombras sueltas',
    'Low-level floor light': 'Luz baja de suelo',
    'Bed-to-door route clearance service': 'Despeje de ruta entre cama y puerta',
    'Bedside light': 'Luz junto a la cama',
    'Bed height, transfer and room-fit assessment': 'Revisión de altura, transferencias y espacio del dormitorio',
    'Cable management kit': 'Kit de organizacion de cables',
    'Delivery and installation coordination': 'Coordinación de entrega e instalación',
    'Electric adjustable bed': 'Cama eléctrica ajustable',
    'Family contact notification setup': 'Configuracion de avisos a contactos familiares',
    'Hands-free calling setup': 'Configuracion de llamadas manos libres',
    'Medication and routine reminder setup': 'Configuracion de recordatorios y rutinas',
    'Mattress and pressure-comfort guidance': 'Orientación sobre colchón, presión y confort',
    'Motion sensor': 'Sensor de movimiento',
    'Raised toilet seat': 'Elevador de inodoro',
    'Resident phone alert setup': 'Avisos al telefono del residente',
    'Remote control setup and handover': 'Configuración de mando y explicación de uso',
    'Safer hot-water temperature setting': 'Ajuste seguro de agua caliente',
    'Secure anti-slip bath mat': 'Alfombrilla antideslizante segura',
    'Secure anti-slip bath and exit mat set': 'Juego de alfombrillas antideslizantes para bañera y salida',
    'Smart speaker': 'Altavoz inteligente',
    'Smoke detector': 'Detector de humo',
    'Thermostatic anti-scald valve': 'Valvula termostatica antiquemaduras',
    'Toilet support rail': 'Barra de apoyo para inodoro',
    'Vertical support rail': 'Barra de apoyo vertical',
    'Water leak sensor': 'Sensor de fuga de agua',
    'Wider bathroom doorway': 'Puerta de bano mas ancha',
    'Wider bathroom doorway service': 'Ensanche de puerta de bano',
    'Wider bedroom doorway': 'Puerta de dormitorio mas ancha',
    'Wider bedroom doorway service': 'Ensanche de puerta de dormitorio',
    'Wider entrance doorway': 'Puerta de entrada mas ancha',
    'Wider entrance doorway service': 'Ensanche de puerta de entrada',
    'Wider kitchen doorway': 'Puerta de cocina mas ancha',
    'Wider kitchen doorway service': 'Ensanche de puerta de cocina',
    'Wider living room doorway': 'Puerta de salon mas ancha',
    'Wider living room doorway service': 'Ensanche de puerta de salon',
    'Outdoor key safe': 'Caja de llaves exterior',
    'Raised electrical outlet relocation service': 'Reubicacion de enchufes a una altura mas comoda',
    'Voice command setup for lights, calls and help requests': 'Configuracion de voz para luces, llamadas y peticiones de ayuda',
    'Voice help request setup': 'Configuracion de peticiones de ayuda por voz',
  }

  return translations[item] ?? item
}

function getDetailServiceSummaryItems(
  outcome: MasterCatalogueOutcome,
  catalogue: MasterServiceCatalogue,
  language: 'en' | 'es',
) {
  const specification = getProposalSpecificationForOutcome(outcome.id, catalogue)
  const taskText = specification.installationTasks.map((task) => task.name).join(' ').toLocaleLowerCase()
  const serviceItems: string[] = []

  if (/inspect|measure/.test(taskText)) {
    serviceItems.push(language === 'es' ? 'Revision de medidas y encaje' : 'Measurement and fit check')
  }

  if (/configure|alert/.test(taskText)) {
    serviceItems.push(language === 'es' ? 'Configuracion y prueba de avisos con consentimiento' : 'Consent-aware setup and testing')
  }

  if (/install|fit|apply|reduce|mark|set|adjust/.test(taskText)) {
    serviceItems.push(language === 'es' ? 'Instalacion o ajuste profesional' : 'Professional installation or setup')
  }

  if (taskText) {
    serviceItems.push(language === 'es' ? 'Prueba, explicacion de uso y soporte posterior' : 'Testing, handover and aftercare')
  }

  return serviceItems
}

function getDetailIncludedItems(
  outcome: MasterCatalogueOutcome,
  catalogue: MasterServiceCatalogue,
  language: 'en' | 'es',
) {
  const specification = getProposalSpecificationForOutcome(outcome.id, catalogue)
  const productItems = dedupeDetailItems(
    specification.products.filter((product) => product.active).map((product) => product.name),
  )
  const localizedProductItems = productItems.map((item) => localizeDetailItem(item, language))
  const capabilityFallbackItems = productItems.length
    ? []
    : specification.capabilities.filter((capability) => capability.active).map((capability) => capability.name)
  const serviceItems = getDetailServiceSummaryItems(outcome, catalogue, language)
  const visibleProductItems = localizedProductItems.slice(0, Math.max(1, 6 - serviceItems.length))
  const resolvedItems = dedupeDetailItems([
    ...visibleProductItems,
    ...capabilityFallbackItems,
    ...serviceItems,
  ])

  if (resolvedItems.length) {
    return resolvedItems.slice(0, 6)
  }

  const fallback = localizePlansString(
    outcome.detailedDescription ?? outcome.customerBenefit,
    language,
    localizePlansString(outcome.shortDescription, language, outcome.internalName),
  )

  return splitDetailFallback(fallback)
}

function getDetailSlideTitle(
  outcome: MasterCatalogueOutcome,
  language: 'en' | 'es',
) {
  return localizePlansString(outcome.customerName, language, outcome.internalName)
}

function getDetailSlideImage(outcome: MasterCatalogueOutcome) {
  return getCatalogueOutcomeImage({
    id: outcome.id,
    roomId: outcome.roomId,
    slug: outcome.slug,
  })
}

function getDetailImageClass(outcome?: MasterCatalogueOutcome) {
  if (!outcome) return ''

  if (outcome.id === 'bathroom-improved-visibility' || outcome.slug === 'bathroom-improved-visibility') {
    return 'is-bathroom-visibility'
  }

  return ''
}

export function PackageDetailModal({
  catalogue,
  group,
  language,
  onClose,
}: PackageDetailModalProps) {
  const languageKey = language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = packageModalCopy[languageKey]
  const [activeTab, setActiveTab] = useState<PackageDetailTab>('core')
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!group) return

    setActiveTab('core')
    setActiveIndex(0)
  }, [group])

  useEffect(() => {
    if (!group) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [group, onClose])

  const optionalItems = useMemo(
    () => group?.addOnPackages.flatMap((addOnPackage) => addOnPackage.outcomes) ?? [],
    [group],
  )
  const tabs = group
    ? [
        ...(group.homeOutcomes.length
          ? [{ id: 'core' as const, items: group.homeOutcomes, label: copy.coreTab }]
          : []),
        ...(optionalItems.length
          ? [{ id: 'optional' as const, items: optionalItems, label: copy.optionalTab }]
          : []),
      ]
    : []
  const currentTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : tabs[0]?.id ?? 'core'
  const slides = tabs.find((tab) => tab.id === currentTab)?.items ?? []
  const safeIndex = Math.min(activeIndex, Math.max(slides.length - 1, 0))
  const activeSlide = slides[safeIndex]
  const displayMode = currentTab === 'optional' ? 'optional' : 'core'
  const title = group?.packageLabel ?? ''
  const slideTitle = activeSlide ? getDetailSlideTitle(activeSlide, languageKey) : ''
  const slideDescription = activeSlide ? getDetailDescription(activeSlide, languageKey) : ''
  const slideBenefit = activeSlide ? getDetailBenefit(activeSlide, languageKey) : ''
  const slideImage = activeSlide ? getDetailSlideImage(activeSlide) : ''
  const includesHeading = activeSlide ? copy.itemIncludes : copy.includes
  const includedItems = activeSlide ? getDetailIncludedItems(activeSlide, catalogue, languageKey) : []
  const proofChips = activeSlide ? getOutcomeProofChips(activeSlide, catalogue, languageKey) : []
  const trustSignals = activeSlide ? getOutcomeTrustSignals(activeSlide, catalogue, languageKey) : []
  const hasMultiple = slides.length > 1

  if (!group) return null

  function goToPreviousSlide() {
    setActiveIndex((current) => (slides.length ? (current - 1 + slides.length) % slides.length : 0))
  }

  function goToNextSlide() {
    setActiveIndex((current) => (slides.length ? (current + 1) % slides.length : 0))
  }

  return (
    <div
      className="plan-detail-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        aria-labelledby="package-detail-title"
        aria-modal="true"
        className={`plan-detail-modal plan-detail-modal--${displayMode} plan-detail-modal--compact`}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="plan-detail-modal-head">
          <div>
            <p>{displayMode === 'optional' ? copy.optionalTab : copy.coreTab}</p>
            <h2 id="package-detail-title">{title}</h2>
            {proofChips.length ? (
              <div className="package-detail-proof-row" aria-label={copy.trust}>
                {proofChips.map((chip) => (
                  <strong key={chip}>{chip}</strong>
                ))}
              </div>
            ) : null}
          </div>
          <button type="button" aria-label={copy.close} onClick={onClose}>
            <X size={18} aria-hidden="true" />
            {copy.close}
          </button>
        </div>

        {tabs.length > 1 ? (
          <div className="plan-detail-tabs" role="tablist" aria-label={`${title} sections`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                aria-selected={tab.id === currentTab}
                className={`plan-detail-tab plan-detail-tab--${tab.id} ${tab.id === currentTab ? 'is-active' : ''}`}
                role="tab"
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  setActiveIndex(0)
                }}
              >
                <span>{tab.label}</span>
                <strong>{tab.items.length}</strong>
              </button>
            ))}
          </div>
        ) : null}

        {activeSlide ? (
          <>
            <div className="plan-detail-story package-detail-story">
              <div className="plan-detail-media-column package-detail-media-column">
                <div className="plan-detail-story-media">
                  <SafeImage
                    alt={slideTitle}
                    className="plan-detail-story-safe-image"
                    fallbackLabel={slideTitle}
                    imgClassName={`plan-detail-story-image ${getDetailImageClass(activeSlide)}`.trim()}
                    loading="lazy"
                    src={slideImage}
                  />
                  <div className="plan-detail-story-badge">
                    <span>{copy.slideLabel}</span>
                    <strong>
                      {safeIndex + 1} / {slides.length}
                    </strong>
                  </div>
                  {hasMultiple ? (
                    <div className="plan-detail-story-controls" aria-label={`${title} navigation`}>
                      <button
                        aria-label={copy.previous}
                        className="plan-detail-arrow"
                        type="button"
                        onClick={goToPreviousSlide}
                      >
                        <ArrowLeft size={18} aria-hidden="true" />
                      </button>
                      <button
                        aria-label={copy.next}
                        className="plan-detail-arrow"
                        type="button"
                        onClick={goToNextSlide}
                      >
                        <ArrowRight size={18} aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </div>

                {trustSignals.length ? (
                  <div className="plan-detail-included-card package-detail-trust">
                    <h4>{copy.trust}</h4>
                    <ul>
                      {trustSignals.map((signal) => (
                        <li key={signal.label}>
                          <CheckCircle2 size={16} aria-hidden="true" />
                          <span>
                            <strong>{signal.label}</strong>
                            <small>{signal.detail}</small>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <p className="package-detail-standard">
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>{copy.standard}</span>
                </p>
              </div>

              <article className="plan-detail-story-panel">
                <span className="plan-detail-story-kicker">
                  {activeSlide.category || (displayMode === 'optional' ? copy.optionalTab : copy.coreTab)}
                </span>
                <h3>{slideTitle}</h3>

                <div className="plan-detail-description-card">
                  <h4>{copy.description}</h4>
                  <p>{slideDescription}</p>
                </div>

                <div className="plan-detail-included-card">
                  <h4>{includesHeading}</h4>
                  <ul>
                    {includedItems.map((item) => (
                      <li key={item}>
                        <CheckCircle2 size={16} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="plan-detail-benefit">
                  <Sparkles size={18} aria-hidden="true" />
                  <div>
                    <strong>{copy.benefit}</strong>
                    <p>{slideBenefit}</p>
                  </div>
                </div>

              </article>
            </div>

          </>
        ) : (
          <p className="plan-detail-empty">{copy.noDetailItems}</p>
        )}
      </section>
    </div>
  )
}
