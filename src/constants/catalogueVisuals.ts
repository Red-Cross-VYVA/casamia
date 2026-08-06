import type { ServiceRoom } from '../types/serviceCatalogue'

export type CatalogueVisualRoom = Extract<ServiceRoom, 'bathroom' | 'bedroom' | 'entrance' | 'kitchen' | 'living-room'>

const serviceProductImage = (name: string) => `/images/service-card-products/${name}.webp`

export const catalogueOutcomeImages: Record<string, string> = {
  'bathroom-anti-slip': serviceProductImage('floor-grip'),
  'bathroom-anti-slip-bath-mat': serviceProductImage('floor-grip'),
  'bathroom-anti-slip-floor-treatment': serviceProductImage('floor-grip'),
  'bathroom-bathtub-step-through': serviceProductImage('tub-cutout'),
  'bathroom-comfort-height-toilet': serviceProductImage('toilet-rails'),
  'bathroom-connected-guidance': serviceProductImage('motion-light'),
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
  'bathroom-water-temperature-controls': serviceProductImage('thermostatic-shower-mixer'),
  'bathroom-wider-doorway': serviceProductImage('wide-doorway'),
  'bedroom-accessible-wardrobe': serviceProductImage('reachable-wardrobe'),
  'bedroom-adjustable-bed': serviceProductImage('adjustable-bed'),
  'bedroom-advanced-bed-transfer': serviceProductImage('advanced-bed-transfer'),
  'bedroom-bed-support': serviceProductImage('bed-transfer'),
  'bedroom-door-accessibility': serviceProductImage('wide-doorway'),
  'bedroom-easier-bed-transfers': serviceProductImage('bed-transfer'),
  'bedroom-electric-adjustable-bed': serviceProductImage('adjustable-bed'),
  'bedroom-emergency-support': serviceProductImage('emergency-button'),
  'bedroom-fire-safety': serviceProductImage('smoke-detector'),
  'bedroom-night-route': serviceProductImage('clear-night-route'),
  'bedroom-safer-walking-routes': serviceProductImage('clear-night-route'),
  'bedroom-slip-resistance': '/images/service-card-products/bedside-exit-mat.png',
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

export const catalogueRoomFallbackImages: Record<CatalogueVisualRoom, string> = {
  bathroom: '/images/service-gallery/isometric/isometric-bathroom.jpg',
  bedroom: '/images/service-gallery/isometric/isometric-bedroom.jpg',
  entrance: '/images/service-gallery/isometric/isometric-exterior.jpg',
  kitchen: '/images/service-gallery/isometric/isometric-kitchen.jpg',
  'living-room': '/images/service-gallery/isometric/isometric-living.jpg',
}

export function isCatalogueVisualRoom(room: string): room is CatalogueVisualRoom {
  return room in catalogueRoomFallbackImages
}

export function getCatalogueOutcomeImage({
  id,
  roomId,
  slug,
}: {
  id?: string
  roomId?: string
  slug?: string
}) {
  const room = roomId && isCatalogueVisualRoom(roomId) ? roomId : undefined

  return (
    (id ? catalogueOutcomeImages[id] : undefined) ??
    (slug ? catalogueOutcomeImages[slug] : undefined) ??
    (room ? catalogueRoomFallbackImages[room] : catalogueRoomFallbackImages.bathroom)
  )
}
