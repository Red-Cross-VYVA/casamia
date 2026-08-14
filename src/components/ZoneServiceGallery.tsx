import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { SafeImage } from './SafeImage'
import { ServiceItemDetailModal } from './ServiceItemDetailModal'
import { getCatalogueOutcomeImage } from '../constants/catalogueVisuals'
import type { CasaMiaService, ServiceCatalogueSection, ServiceRoom } from '../types/serviceCatalogue'

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
      title: 'Bathroom items available.',
      body: 'A visual view of the products and adaptations CasaMia can combine around the bathroom, routine and level of support needed.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Elementos de baño disponibles.',
      body: 'Una vista visual de los productos y adaptaciones que CasaMia puede combinar según el baño, la rutina y el nivel de apoyo necesario.',
    },
  },
  bedroom: {
    en: {
      eyebrow: 'Catalogue gallery',
      title: 'Bedroom items available.',
      body: 'Practical supports for getting in and out of bed, night movement, lighting, storage and emergency reach, selected around the resident’s routine.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Elementos de dormitorio disponibles.',
      body: 'Apoyos prácticos para entrar y salir de la cama, moverse de noche, mejorar la iluminación, ordenar el almacenamiento y tener ayuda al alcance.',
    },
  },
  entrance: {
    en: {
      eyebrow: 'Catalogue gallery',
      title: 'Entrance items available.',
      body: 'Support for thresholds, door access, lighting, visitor awareness and safer pauses around the entrance people actually use.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Elementos de entrada disponibles.',
      body: 'Apoyo para umbrales, acceso a la puerta, iluminación, control de visitas y pausas más seguras en la entrada que realmente se usa.',
    },
  },
  kitchen: {
    en: {
      eyebrow: 'Catalogue gallery',
      title: 'Kitchen items available.',
      body: 'Products and adaptations for safer preparation, cooking, lighting, standing zones, storage and selected kitchen alerts.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Elementos de cocina disponibles.',
      body: 'Productos y adaptaciones para preparar, cocinar, iluminar, estar de pie, almacenar y recibir avisos útiles con más seguridad.',
    },
  },
  'living-room': {
    en: {
      eyebrow: 'Catalogue gallery',
      title: 'Living room items available.',
      body: 'Supports for sitting, standing, clearer movement, safer furniture, lighting and simple connected reassurance.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Elementos de salón disponibles.',
      body: 'Apoyos para sentarse, levantarse, moverse con más claridad, asegurar muebles, mejorar la luz y añadir tranquilidad conectada.',
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
  const description = service.customerDescription || service.customerBenefit || service.shortDescription

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
