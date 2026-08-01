import { SafeImage } from './SafeImage'
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
      body: 'Practical supports for bed transfers, night movement, lighting, storage and emergency reach, selected around the resident’s routine.',
    },
    es: {
      eyebrow: 'Galería del catálogo',
      title: 'Elementos de dormitorio disponibles.',
      body: 'Apoyos prácticos para transferencias de cama, movimiento nocturno, iluminación, almacenamiento y ayuda al alcance, elegidos según la rutina.',
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

const serviceProductImage = (name: string) => `/images/service-card-products/${name}.webp`

const zoneServiceImages: Record<string, string> = {
  'bathroom-anti-slip': serviceProductImage('floor-grip'),
  'bathroom-anti-slip-bath-mat': serviceProductImage('floor-grip'),
  'bathroom-anti-slip-floor-treatment': serviceProductImage('floor-grip'),
  'bathroom-bathtub-step-through': serviceProductImage('tub-cutout'),
  'bathroom-comfort-height-toilet': serviceProductImage('toilet-rails'),
  'bathroom-connected-guidance': serviceProductImage('motion-light'),
  'bathroom-easier-tap-control': serviceProductImage('lever-tap'),
  'bathroom-folding-shower-seat': serviceProductImage('shower-seat'),
  'bathroom-grab-bars': serviceProductImage('vertical-rail'),
  'bathroom-improved-lighting': serviceProductImage('motion-light'),
  'bathroom-improved-visibility': serviceProductImage('motion-light'),
  'bathroom-lever-mixer-tap': serviceProductImage('lever-tap'),
  'bathroom-motion-lighting': serviceProductImage('motion-light'),
  'bathroom-nightlight': serviceProductImage('motion-light'),
  'bathroom-raised-toilet': serviceProductImage('toilet-rails'),
  'bathroom-raised-toilet-seat': serviceProductImage('toilet-rails'),
  'bathroom-safer-access': serviceProductImage('threshold-reduction'),
  'bathroom-safer-bathing': serviceProductImage('shower-seat'),
  'bathroom-safer-toilet-transfers': serviceProductImage('toilet-rails'),
  'bathroom-safety-monitoring': serviceProductImage('water-monitoring'),
  'bathroom-shower-chair': serviceProductImage('shower-seat'),
  'bathroom-slip-prevention': serviceProductImage('floor-grip'),
  'bathroom-temperature-safety': serviceProductImage('thermostatic-shower-mixer'),
  'bathroom-thermostatic-valve': serviceProductImage('thermostatic-shower-mixer'),
  'bathroom-threshold-removal': serviceProductImage('threshold-reduction'),
  'bathroom-toilet-support-rails': serviceProductImage('toilet-rails'),
  'bathroom-tub-cutout': serviceProductImage('tub-cutout'),
  'bathroom-vertical-support': serviceProductImage('vertical-rail'),
  'bathroom-vertical-support-rail': serviceProductImage('vertical-rail'),
  'bathroom-wider-doorway': serviceProductImage('wide-doorway'),
  'bedroom-accessible-wardrobe': serviceProductImage('reachable-wardrobe'),
  'bedroom-adjustable-bed': serviceProductImage('adjustable-bed'),
  'bedroom-advanced-bed-transfer': serviceProductImage('bed-transfer'),
  'bedroom-automated-curtains': serviceProductImage('automated-curtains'),
  'bedroom-bathroom-safety-route': serviceProductImage('clear-night-route'),
  'bedroom-bed-exit-safety-system': serviceProductImage('bed-exit-sensor'),
  'bedroom-bed-exit-sensor': serviceProductImage('bed-exit-sensor'),
  'bedroom-bed-support': serviceProductImage('bed-transfer'),
  'bedroom-connected-safety': serviceProductImage('motion-sensor'),
  'bedroom-daily-living-support': serviceProductImage('emergency-button'),
  'bedroom-dementia-support': serviceProductImage('voice-speaker-bedroom'),
  'bedroom-door-accessibility': serviceProductImage('wide-doorway'),
  'bedroom-easier-bed-transfers': serviceProductImage('bed-transfer'),
  'bedroom-electric-adjustable-bed': serviceProductImage('adjustable-bed'),
  'bedroom-emergency-support': serviceProductImage('emergency-button'),
  'bedroom-family-reassurance': serviceProductImage('bed-exit-sensor'),
  'bedroom-fire-safety': serviceProductImage('smoke-detector'),
  'bedroom-night-route': serviceProductImage('clear-night-route'),
  'bedroom-safer-lighting': serviceProductImage('underbed-lighting'),
  'bedroom-safer-walking-routes': serviceProductImage('clear-night-route'),
  'bedroom-slip-resistance': serviceProductImage('rug-grip'),
  'bedroom-smart-lighting': serviceProductImage('underbed-lighting'),
  'bedroom-specialist-layout': serviceProductImage('clear-night-route'),
  'bedroom-underbed-lighting': serviceProductImage('underbed-lighting'),
  'bedroom-voice-assistance': serviceProductImage('voice-speaker-bedroom'),
  'entrance-accessibility-ramp': serviceProductImage('threshold-ramp'),
  'entrance-connected-door-awareness': serviceProductImage('video-doorbell'),
  'entrance-easier-door-access': serviceProductImage('entrance-door-handle'),
  'entrance-improved-lighting': serviceProductImage('entrance-motion-lighting'),
  'entrance-motion-lighting': serviceProductImage('entrance-motion-lighting'),
  'entrance-safer-access': serviceProductImage('threshold-ramp'),
  'entrance-seating': serviceProductImage('entry-seat'),
  'entrance-wider-doorway': serviceProductImage('wide-doorway'),
  'kitchen-anti-fatigue-mat': serviceProductImage('kitchen-anti-fatigue-mat'),
  'kitchen-connected-experience': serviceProductImage('kitchen-voice-speaker'),
  'kitchen-easier-storage': serviceProductImage('pull-out-storage'),
  'kitchen-easy-grip-tools': serviceProductImage('kitchen-tools'),
  'kitchen-improved-lighting': serviceProductImage('kitchen-worktop-lighting'),
  'kitchen-pull-down-shelf': serviceProductImage('pull-out-storage'),
  'kitchen-pull-out-pantry-storage': serviceProductImage('pull-out-storage'),
  'kitchen-safer-cooking': serviceProductImage('hob-shutoff'),
  'kitchen-safer-food-preparation': serviceProductImage('kitchen-tools'),
  'kitchen-safer-movement': serviceProductImage('kitchen-anti-fatigue-mat'),
  'kitchen-safety-monitoring': serviceProductImage('kitchen-water-monitoring'),
  'kitchen-stove-shutoff': serviceProductImage('hob-shutoff'),
  'kitchen-voice-lighting-timers': serviceProductImage('kitchen-voice-speaker'),
  'kitchen-water-leak-sensor': serviceProductImage('kitchen-water-monitoring'),
  'kitchen-wider-doorway': serviceProductImage('wide-doorway'),
  'kitchen-worktop-lighting': serviceProductImage('kitchen-worktop-lighting'),
  'living-room-advanced-seating': serviceProductImage('recliner'),
  'living-room-connected-experience': serviceProductImage('voice-speaker-bedroom'),
  'living-room-easier-sitting-standing': serviceProductImage('recliner'),
  'living-room-electric-recliner-chair': serviceProductImage('recliner'),
  'living-room-improved-lighting': serviceProductImage('clear-night-route'),
  'living-room-safer-furniture': serviceProductImage('furniture-anchor'),
  'living-room-safer-room': serviceProductImage('rug-grip'),
  'living-room-safety-monitoring': serviceProductImage('motion-sensor'),
  'living-room-slip-prevention': serviceProductImage('rug-grip'),
  'living-room-stair-safety': serviceProductImage('stair-support'),
  'living-room-wider-doorway': serviceProductImage('wide-doorway'),
  'movement-hallway-lighting': serviceProductImage('clear-night-route'),
  'movement-rug-securing': serviceProductImage('rug-grip'),
  'movement-stand-assist': serviceProductImage('recliner'),
}

const roomFallbackImages: Record<ZoneGalleryRoom, string> = {
  bathroom: '/images/service-gallery/isometric/isometric-bathroom.jpg',
  bedroom: '/images/service-gallery/isometric/isometric-bedroom.jpg',
  entrance: '/images/service-gallery/isometric/isometric-exterior.jpg',
  kitchen: '/images/service-gallery/isometric/isometric-kitchen.jpg',
  'living-room': '/images/service-gallery/isometric/isometric-living.jpg',
}

export function isZoneGalleryRoom(room: ServiceRoom): room is ZoneGalleryRoom {
  return room in zoneGalleryCopy
}

export function ZoneServiceGallery({ className = '', language, room, services }: ZoneServiceGalleryProps) {
  if (services.length === 0) {
    return null
  }

  const languageKey = language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = zoneGalleryCopy[room][languageKey]
  const classes = ['zone-service-gallery', className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className="zone-service-gallery-header">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>
        <p>{copy.body}</p>
      </div>
      <div className="zone-service-gallery-grid">
        {services.map((service) => (
          <ZoneServiceGalleryCard
            key={service.id}
            languageKey={languageKey}
            room={room}
            service={service}
          />
        ))}
      </div>
    </div>
  )
}

function ZoneServiceGalleryCard({
  languageKey,
  room,
  service,
}: {
  languageKey: 'en' | 'es'
  room: ZoneGalleryRoom
  service: CasaMiaService
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
      </div>
    </article>
  )
}

function getZoneServiceImage(service: CasaMiaService, room: ZoneGalleryRoom) {
  return zoneServiceImages[service.id] ?? zoneServiceImages[service.slug] ?? roomFallbackImages[room]
}
