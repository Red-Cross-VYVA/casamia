import type { ServiceRoom } from '../types/serviceCatalogue'

export type ZoneGalleryRoom = Extract<ServiceRoom, 'bathroom' | 'bedroom' | 'entrance' | 'kitchen' | 'living-room'>

export const zoneGalleryCopy: Record<ZoneGalleryRoom, { en: { eyebrow: string; title: string; body: string }; es: { eyebrow: string; title: string; body: string } }> = {
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
      body: 'Revisa si los objetos quedan a mano, las zonas de preparación, la iluminación, el tiempo de pie, el almacenamiento y la protección frente a fugas o electrodomésticos.',
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
