import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { SafeImage } from './SafeImage'
import { getCatalogueOutcomeImage } from '../constants/catalogueVisuals'
import { getProposalSpecificationForOutcome } from '../services/masterServiceCatalogue'
import { localizePlansString, type PlansBuilderGroup } from '../services/plansBuilderPricing'
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
    includes: 'What CasaMia includes',
    next: 'Next',
    noDetailItems: 'No items to show in this section.',
    optionalTab: 'Optional add-ons',
    previous: 'Previous',
    slideLabel: 'Item',
  },
  es: {
    benefit: 'Por que ayuda',
    close: 'Cerrar',
    coreTab: 'Paquete base',
    includes: 'Que incluye CasaMia',
    next: 'Siguiente',
    noDetailItems: 'No hay elementos para mostrar en esta seccion.',
    optionalTab: 'Extras opcionales',
    previous: 'Anterior',
    slideLabel: 'Elemento',
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

function getDetailIncludedItems(
  outcome: MasterCatalogueOutcome,
  catalogue: MasterServiceCatalogue,
  language: 'en' | 'es',
) {
  const specification = getProposalSpecificationForOutcome(outcome.id, catalogue)
  const productItems = dedupeDetailItems(
    specification.products.filter((product) => product.active).map((product) => product.name),
  )
  const resolvedItems = productItems.length >= 2
    ? productItems
    : dedupeDetailItems([
        ...specification.products.filter((product) => product.active).map((product) => product.name),
        ...specification.capabilities.filter((capability) => capability.active).map((capability) => capability.name),
        ...specification.installationTasks.filter((task) => task.active).map((task) => task.name),
      ])

  if (resolvedItems.length) {
    return resolvedItems.slice(0, 5)
  }

  const fallback = localizePlansString(
    outcome.detailedDescription ?? outcome.customerBenefit,
    language,
    localizePlansString(outcome.shortDescription, language, outcome.internalName),
  )

  return splitDetailFallback(fallback)
}

function getDetailPrimaryProductName(outcome: MasterCatalogueOutcome, catalogue: MasterServiceCatalogue) {
  const specification = getProposalSpecificationForOutcome(outcome.id, catalogue)

  return dedupeDetailItems(
    specification.products.filter((product) => product.active).map((product) => product.name),
  )[0] ?? ''
}

function getDetailSlideTitle(
  outcome: MasterCatalogueOutcome,
  catalogue: MasterServiceCatalogue,
  language: 'en' | 'es',
) {
  const fallbackTitle = localizePlansString(outcome.customerName, language, outcome.internalName)
  const primaryProduct = getDetailPrimaryProductName(outcome, catalogue)

  if (!primaryProduct) {
    return fallbackTitle
  }

  const titleKey = fallbackTitle.toLocaleLowerCase()
  const productKey = primaryProduct.toLocaleLowerCase()

  return titleKey.includes(productKey) ? fallbackTitle : primaryProduct
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
  }, [group?.homePackage.id])

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
  const slideTitle = activeSlide ? getDetailSlideTitle(activeSlide, catalogue, languageKey) : ''
  const slideBenefit = activeSlide ? getDetailBenefit(activeSlide, languageKey) : ''
  const slideImage = activeSlide ? getDetailSlideImage(activeSlide) : ''
  const includedItems = activeSlide ? getDetailIncludedItems(activeSlide, catalogue, languageKey) : []
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
            <div className="plan-detail-story">
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

              <article className="plan-detail-story-panel">
                <span className="plan-detail-story-kicker">
                  {activeSlide.category || (displayMode === 'optional' ? copy.optionalTab : copy.coreTab)}
                </span>
                <h3>{slideTitle}</h3>

                <div className="plan-detail-benefit">
                  <Sparkles size={18} aria-hidden="true" />
                  <div>
                    <strong>{copy.benefit}</strong>
                    <p>{slideBenefit}</p>
                  </div>
                </div>

                <div className="plan-detail-included-card">
                  <h4>{copy.includes}</h4>
                  <ul>
                    {includedItems.map((item) => (
                      <li key={item}>
                        <CheckCircle2 size={16} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
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
