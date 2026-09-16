import { CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import { catalogueOutcomeImages, getCatalogueOutcomeImage } from '../constants/catalogueVisuals'
import type { CasaMiaService } from '../types/serviceCatalogue'
import {
  getServiceCredibleDescription,
  getServiceProofChips,
  getServiceTrustSignals,
  getServiceTrustStandard,
} from '../utils/serviceTrust'
import { SafeImage } from './SafeImage'

type ServiceItemDetailModalProps = {
  imageSrc?: string
  language: string
  onClose: () => void
  service: CasaMiaService | null
}

const modalCopy = {
  en: {
    close: 'Close',
    detailLabel: 'Service details',
    included: 'Included in package',
    optional: 'Optional add-on',
    description: 'What this changes',
    benefit: 'Why it helps',
    includes: 'Included for this item',
    requirements: 'Planning notes',
    trust: 'Why you can trust it',
    standard: 'CasaMia standard',
    safetyNote: 'Important',
    assessment: 'Assessment recommended',
    installation: 'Professional installation',
    measurement: 'Measurement required',
    visit: 'Home visit required',
    compatibility: 'Compatibility check',
    quote: 'Quote confirmed after review',
    grant: 'May be eligible for grant support',
    fallbackInclude: 'We check fit and final scope before installation.',
  },
  es: {
    close: 'Cerrar',
    detailLabel: 'Detalles del servicio',
    included: 'Incluido en el paquete',
    optional: 'Extra opcional',
    description: 'Qué mejora',
    benefit: 'Por qué ayuda',
    includes: 'Incluido para este elemento',
    requirements: 'Notas de planificación',
    trust: 'Por qué puedes confiar',
    standard: 'Estándar CasaMia',
    safetyNote: 'Importante',
    assessment: 'Valoración recomendada',
    installation: 'Instalación profesional',
    measurement: 'Requiere medición',
    visit: 'Requiere visita',
    compatibility: 'Comprobación de compatibilidad',
    quote: 'Presupuesto confirmado tras revisión',
    grant: 'Puede optar a apoyo de subvención',
    fallbackInclude: 'Revisamos encaje y alcance final antes de instalar.',
  },
}

const roomFallbackImages: Record<CasaMiaService['room'], string> = {
  bathroom: '/images/service-gallery/isometric/isometric-bathroom.jpg',
  bedroom: '/images/service-gallery/isometric/isometric-bedroom.jpg',
  connected: '/images/how-it-works-smartphone.jpg',
  entrance: '/images/service-gallery/isometric/isometric-exterior.jpg',
  kitchen: '/images/service-gallery/isometric/isometric-kitchen.jpg',
  'living-room': '/images/service-gallery/isometric/isometric-living.jpg',
  movement: '/images/solutions/stairs-hallways.jpg',
}

function isOptionalService(service: CasaMiaService) {
  return (
    (service.componentRole ?? (service.priority === 'optional' ? 'option' : 'core')) === 'option'
    || service.section === 'connected_room'
    || service.section === 'optional_adaptations'
  )
}

function uniqueItems(items: string[] | undefined) {
  const seen = new Set<string>()

  return (items ?? []).filter((item) => {
    const key = item.trim().toLocaleLowerCase()

    if (!key || seen.has(key)) return false

    seen.add(key)
    return true
  })
}

function getServiceImage(service: CasaMiaService, imageSrc?: string) {
  return (
    imageSrc
    ?? catalogueOutcomeImages[service.id]
    ?? catalogueOutcomeImages[service.slug]
    ?? getCatalogueOutcomeImage({ id: service.id, roomId: service.room, slug: service.slug })
    ?? roomFallbackImages[service.room]
  )
}

function getRequirementLabels(service: CasaMiaService, languageKey: 'en' | 'es') {
  const copy = modalCopy[languageKey]

  return [
    (service.requirements?.assessment ?? service.requiresAssessment) ? copy.assessment : null,
    (service.requirements?.installation ?? service.requiresInstallation) ? copy.installation : null,
    (service.requirements?.measurement ?? service.requiresMeasurement) ? copy.measurement : null,
    (service.requirements?.siteVisit ?? service.requiresSiteVisit) ? copy.visit : null,
    (service.requirements?.compatibilityCheck ?? service.requiresCompatibilityCheck) ? copy.compatibility : null,
    (service.requirements?.quote ?? service.requiresQuote) ? copy.quote : null,
    service.grant?.eligible ? copy.grant : null,
  ].filter((item): item is string => Boolean(item))
}

export function ServiceItemDetailModal({
  imageSrc,
  language,
  onClose,
  service,
}: ServiceItemDetailModalProps) {
  const languageKey = language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = modalCopy[languageKey]

  useEffect(() => {
    if (!service) return

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
  }, [onClose, service])

  const detail = useMemo(() => {
    if (!service) return null

    const title = service.customerName ?? service.name
    const description = getServiceCredibleDescription(service, languageKey)
    const benefit = service.outcome ?? service.customerBenefit ?? description
    const includedItems = uniqueItems(service.includedItems)
    const requirements = getRequirementLabels(service, languageKey)
    const optional = isOptionalService(service)
    const trustSignals = getServiceTrustSignals(service, languageKey)

    return {
      benefit,
      description,
      image: getServiceImage(service, imageSrc),
      includedItems: includedItems.length ? includedItems : [copy.fallbackInclude],
      optional,
      proofChips: getServiceProofChips(service, languageKey),
      requirements,
      standard: getServiceTrustStandard(languageKey),
      title,
      trustSignals,
      typeLabel: optional ? copy.optional : copy.included,
    }
  }, [copy.fallbackInclude, copy.included, copy.optional, imageSrc, languageKey, service])

  if (!service || !detail) return null

  return (
    <div className="plan-detail-modal-backdrop service-item-detail-backdrop" role="presentation" onClick={onClose}>
      <section
        aria-labelledby="service-item-detail-title"
        aria-modal="true"
        className={`plan-detail-modal service-item-detail-modal${detail.optional ? ' plan-detail-modal--optional' : ''}`}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="plan-detail-modal-head">
          <div>
            <p>{detail.typeLabel}</p>
            <h2 id="service-item-detail-title">{detail.title}</h2>
            <div className="service-item-detail-proof-row" aria-label={copy.trust}>
              {detail.proofChips.map((chip) => (
                <strong key={chip}>{chip}</strong>
              ))}
            </div>
          </div>
          <button type="button" aria-label={copy.close} onClick={onClose}>
            <X size={18} aria-hidden="true" />
            {copy.close}
          </button>
        </div>

        <div className="plan-detail-story service-item-detail-story">
          <div className="plan-detail-media-column service-item-detail-media-column">
            <div className="plan-detail-story-media">
              <SafeImage
                alt={detail.title}
                className="plan-detail-story-safe-image"
                fallbackLabel={detail.title}
                imgClassName="plan-detail-story-image"
                loading="lazy"
                src={detail.image}
              />
              <div className="plan-detail-story-badge">
                <span>{copy.detailLabel}</span>
                <strong>{detail.typeLabel}</strong>
              </div>
            </div>

            <div className="plan-detail-included-card service-item-detail-trust">
              <h4>{copy.trust}</h4>
              <ul>
                {detail.trustSignals.map((signal) => (
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

            <p className="plan-detail-footnote service-item-detail-standard">
              <ShieldCheck size={16} aria-hidden="true" />
              <span><strong>{copy.standard}:</strong> {detail.standard}</span>
            </p>
          </div>

          <article className="plan-detail-story-panel">
            <span className="plan-detail-story-kicker">{service.category}</span>
            <h3>{detail.title}</h3>

            <div className="plan-detail-description-card">
              <h4>{copy.description}</h4>
              <p>{detail.description}</p>
            </div>

            <div className="plan-detail-included-card">
              <h4>{copy.includes}</h4>
              <ul>
                {detail.includedItems.map((item) => (
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
                <p>{detail.benefit}</p>
              </div>
            </div>

            {detail.requirements.length ? (
              <div className="plan-detail-included-card service-item-detail-requirements">
                <h4>{copy.requirements}</h4>
                <ul>
                  {detail.requirements.map((requirement) => (
                    <li key={requirement}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {service.safetyNotice ? (
              <p className="plan-detail-footnote">
                <ShieldCheck size={16} aria-hidden="true" />
                <span><strong>{copy.safetyNote}:</strong> {service.safetyNotice}</span>
              </p>
            ) : null}
          </article>
        </div>
      </section>
    </div>
  )
}
