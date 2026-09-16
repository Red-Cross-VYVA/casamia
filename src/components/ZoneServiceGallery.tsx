import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { SafeImage } from './SafeImage'
import { ServiceItemDetailModal } from './ServiceItemDetailModal'
import { getCatalogueOutcomeImage } from '../constants/catalogueVisuals'
import type { CasaMiaService, ServiceCatalogueSection, ServiceRoom } from '../types/serviceCatalogue'
import { getServicePreviewDescription } from '../utils/serviceTrust'

type ZoneGalleryRoom = Extract<ServiceRoom, 'bathroom' | 'bedroom' | 'entrance' | 'kitchen' | 'living-room'>

type ZoneServiceGalleryProps = {
  className?: string
  language: string
  room: ZoneGalleryRoom
  services: CasaMiaService[]
}

const sectionLabels: Record<ServiceCatalogueSection, { en: string; es: string }> = {
  connected_room: { en: 'Connected support', es: 'Apoyo conectado' },
  home_safety_package: { en: 'Home safety package', es: 'Paquete de seguridad' },
  starter_essentials: { en: 'Starter essentials', es: 'Esenciales de inicio' },
  optional_adaptations: { en: 'Optional adaptation', es: 'Adaptación opcional' },
}

const galleryTabCopy = {
  en: {
    included: 'Included package',
    optional: 'Optional add-ons',
    count: (count: number) => `${count} item${count === 1 ? '' : 's'}`,
    ariaLabel: 'Filter catalogue items',
  },
  es: {
    included: 'Paquete incluido',
    optional: 'Extras opcionales',
    count: (count: number) => `${count} elemento${count === 1 ? '' : 's'}`,
    ariaLabel: 'Filtrar elementos del catálogo',
  },
}

const zoneGalleryCopy: Record<ZoneGalleryRoom, { en: { eyebrow: string; title: string; body: string }; es: { eyebrow: string; title: string; body: string } }> = {
  bathroom: {
    en: {
      eyebrow: 'Catalogue gallery',
      title: 'Bathroom checks and items to compare.',
      body: 'Review shower entry, toilet transfers, wet-floor grip, lighting and hand support before choosing items.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Revisiones y elementos de baño para comparar.',
      body: 'Revisa entrada de ducha, transferencias al WC, agarre en suelo mojado, iluminación y puntos de apoyo antes de elegir.',
    },
  },
  bedroom: {
    en: {
      eyebrow: 'Catalogue gallery',
      title: 'Bedroom checks and items to compare.',
      body: 'Review bed transfers, night movement, lighting, clear routes and how help is reached from bed.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Revisiones y elementos de dormitorio para comparar.',
      body: 'Revisa entrada y salida de la cama, ruta nocturna, iluminación, obstáculos y cómo pedir ayuda desde la cama.',
    },
  },
  entrance: {
    en: {
      eyebrow: 'Catalogue gallery',
      title: 'Entrance checks and items to compare.',
      body: 'Review thresholds, doorway width, lighting, hand support and visitor awareness at the entrance used most.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Revisiones y elementos de entrada para comparar.',
      body: 'Revisa umbrales, ancho de puerta, iluminación, apoyo de mano y control de visitas en la entrada que más se usa.',
    },
  },
  kitchen: {
    en: {
      eyebrow: 'Catalogue gallery',
      title: 'Kitchen checks and items to compare.',
      body: 'Review reach, preparation zones, lighting, standing tolerance, storage and appliance or leak safeguards.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Revisiones y elementos de cocina para comparar.',
      body: 'Revisa alcance, zonas de preparación, iluminación, tiempo de pie, almacenamiento y protección frente a fugas o electrodomésticos.',
    },
  },
  'living-room': {
    en: {
      eyebrow: 'Catalogue gallery',
      title: 'Living room checks and items to compare.',
      body: 'Review seating height, rugs, cables, furniture stability, lighting and movement routes through the room.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Revisiones y elementos de salón para comparar.',
      body: 'Revisa altura de asiento, alfombras, cables, estabilidad de muebles, iluminación y rutas de paso por la estancia.',
    },
  },
}

export function isZoneGalleryRoom(room: ServiceRoom): room is ZoneGalleryRoom {
  return room in zoneGalleryCopy
}

export function ZoneServiceGallery({ className = '', language, room, services }: ZoneServiceGalleryProps) {
  const languageKey = language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = zoneGalleryCopy[room][languageKey]
  const tabCopy = galleryTabCopy[languageKey]
  const viewDetailsLabel = languageKey === 'es' ? 'Ver detalles' : 'View details'
  const classes = ['zone-service-gallery', className].filter(Boolean).join(' ')
  const [selectedGroup, setSelectedGroup] = useState<'included' | 'optional'>('included')
  const [activeService, setActiveService] = useState<CasaMiaService | null>(null)
  const includedServices = useMemo(
    () => services.filter((service) => (service.section ?? 'home_safety_package') === 'home_safety_package'),
    [services],
  )
  const optionalServices = useMemo(
    () => services.filter((service) => (service.section ?? 'home_safety_package') !== 'home_safety_package'),
    [services],
  )
  const selectedServices = selectedGroup === 'optional' ? optionalServices : includedServices
  const activeServices = selectedServices.length > 0 ? selectedServices : optionalServices.length > 0 ? optionalServices : includedServices

  if (services.length === 0 || activeServices.length === 0) {
    return null
  }

  return (
    <div className={classes}>
      <div className="zone-service-gallery-header">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>
        <p>{copy.body}</p>
      </div>
      {optionalServices.length > 0 ? (
        <div className="zone-service-gallery-tabs" aria-label={tabCopy.ariaLabel}>
          <button
            aria-pressed={selectedGroup !== 'optional'}
            className={selectedGroup === 'optional' ? '' : 'is-active'}
            type="button"
            onClick={() => setSelectedGroup('included')}
          >
            <strong>{tabCopy.included}</strong>
            <span>{tabCopy.count(includedServices.length)}</span>
          </button>
          <button
            aria-pressed={selectedGroup === 'optional'}
            className={selectedGroup === 'optional' ? 'is-active' : ''}
            type="button"
            onClick={() => setSelectedGroup('optional')}
          >
            <strong>{tabCopy.optional}</strong>
            <span>{tabCopy.count(optionalServices.length)}</span>
          </button>
        </div>
      ) : null}
      <div className="zone-service-gallery-grid">
        {activeServices.map((service) => (
          <ZoneServiceGalleryCard
            key={service.id}
            languageKey={languageKey}
            onViewDetails={setActiveService}
            room={room}
            service={service}
            viewDetailsLabel={viewDetailsLabel}
          />
        ))}
      </div>
      <ServiceItemDetailModal
        language={language}
        onClose={() => setActiveService(null)}
        service={activeService}
      />
    </div>
  )
}

function ZoneServiceGalleryCard({
  languageKey,
  onViewDetails,
  room,
  service,
  viewDetailsLabel,
}: {
  languageKey: 'en' | 'es'
  onViewDetails: (service: CasaMiaService) => void
  room: ZoneGalleryRoom
  service: CasaMiaService
  viewDetailsLabel: string
}) {
  const section = service.section ?? 'home_safety_package'
  const title = service.customerName ?? service.name
  const description = getServicePreviewDescription(service)

  return (
    <article className="zone-service-gallery-card">
      <SafeImage
        alt={title}
        className="zone-service-gallery-media"
        fallbackLabel={title}
        imgClassName="zone-service-gallery-image"
        loading="lazy"
        src={getZoneServiceImage(service, room)}
      />
      <div className="zone-service-gallery-card-copy">
        <span>{sectionLabels[section][languageKey]}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="zone-service-gallery-card-actions">
          <button className="catalogue-item-detail-button" type="button" onClick={() => onViewDetails(service)}>
            {viewDetailsLabel}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}

function getZoneServiceImage(service: CasaMiaService, room: ZoneGalleryRoom) {
  return getCatalogueOutcomeImage({ id: service.id, roomId: room, slug: service.slug })
}
