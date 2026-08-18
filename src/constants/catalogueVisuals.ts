import type { ServiceRoom } from '../types/serviceCatalogue'

export type CatalogueVisualRoom = Extract<ServiceRoom, 'bathroom' | 'bedroom' | 'entrance' | 'kitchen' | 'living-room'>

const serviceProductImage = (name: string) => `/images/service-card-products/${name}.webp`

export const catalogueOutcomeImages: Record<string, string> = {
  'bathroom-anti-slip': serviceProductImage('floor-grip'),
  'bathroom-anti-slip-bath-mat': '/images/service-card-products/anti-slip-bath-mat.png',
  'bathroom-anti-slip-floor-treatment': serviceProductImage('floor-grip'),
  'bathroom-bathtub-step-through': serviceProductImage('tub-cutout'),
  'bathroom-comfort-height-toilet': serviceProductImage('toilet-rails'),
  'bathroom-connected-guidance': serviceProductImage('motion-light'),
  'bathroom-door-hardware': serviceProductImage('door-handle'),
  'bathroom-folding-shower-seat': '/images/service-card-products/folding-shower-seat.png',
  'bathroom-grab-bars': serviceProductImage('vertical-rail'),
  'bathroom-improved-lighting': serviceProductImage('motion-light'),
  'bathroom-improved-visibility': serviceProductImage('motion-light'),
  'bathroom-lever-mixer-tap': serviceProductImage('lever-tap'),
  'bathroom-motion-lighting': serviceProductImage('motion-light'),
  'bathroom-nightlight': serviceProductImage('motion-light'),
  'bathroom-raised-toilet': serviceProductImage('toilet-rails'),
  'bathroom-raised-toilet-seat': serviceProductImage('toilet-rails'),
  'bathroom-safer-access': serviceProductImage('threshold-reduction'),
  'bathroom-safer-bathing': serviceProductImage('vertical-rail'),
  'bathroom-safer-toilet-transfers': serviceProductImage('toilet-rails'),
  'bathroom-safety-monitoring': serviceProductImage('water-monitoring'),
  'bathroom-shower-chair': serviceProductImage('shower-seat'),
  'bathroom-slip-prevention': serviceProductImage('floor-grip'),
  'bathroom-temperature-safety': serviceProductImage('thermostatic-shower-mixer'),
  'bathroom-thermostatic-valve': serviceProductImage('thermostatic-shower-mixer'),
  'bathroom-threshold-removal': serviceProductImage('threshold-reduction'),
  'bathroom-toilet-support-rails': serviceProductImage('toilet-rails'),
  'bathroom-tub-cutout': serviceProductImage('tub-cutout'),
  'bathroom-vertical-support': '/images/service-card-products/vertical-shower-grab-bar.png',
  'bathroom-vertical-support-rail': '/images/service-card-products/vertical-shower-grab-bar.png',
  'bathroom-water-temperature-controls': serviceProductImage('thermostatic-shower-mixer'),
  'bathroom-wider-doorway': serviceProductImage('wide-doorway'),
  'bedroom-accessible-wardrobe': serviceProductImage('reachable-wardrobe'),
  'bedroom-adjustable-bed': serviceProductImage('adjustable-bed'),
  'bedroom-advanced-bed-transfer': serviceProductImage('advanced-bed-transfer'),
  'bedroom-bed-support': serviceProductImage('bed-transfer'),
  'bedroom-bed-wedge-support': serviceProductImage('bed-wedge-back-support'),
  'bedroom-door-accessibility': serviceProductImage('wide-doorway'),
  'bedroom-easier-bed-transfers': serviceProductImage('bed-transfer'),
  'bedroom-electric-adjustable-bed': serviceProductImage('adjustable-bed'),
  'bedroom-emergency-support': serviceProductImage('emergency-button'),
  'bedroom-fire-safety': serviceProductImage('smoke-detector'),
  'bedroom-night-time-visibility': serviceProductImage('clear-night-route'),
  'bedroom-night-route': serviceProductImage('clear-night-route'),
  'bedroom-safer-walking-routes': '/images/service-card-products/bedside-exit-mat.png',
  'bedroom-slip-resistance': '/images/service-card-products/bedside-exit-mat.png',
  'bedroom-underbed-lighting': serviceProductImage('underbed-lighting'),
  'bedroom-voice-assistance': serviceProductImage('voice-speaker-bedroom'),
  'entrance-accessibility-ramp': serviceProductImage('threshold-ramp'),
  'entrance-connected-door-awareness': serviceProductImage('video-doorbell'),
  'entrance-easier-door-access': serviceProductImage('entrance-door-handle'),
  'entrance-improved-lighting': serviceProductImage('entrance-motion-lighting'),
  'entrance-key-safe': serviceProductImage('entrance-door-handle'),
  'entrance-modular-ramp': serviceProductImage('threshold-ramp'),
  'entrance-motion-lighting': serviceProductImage('entrance-motion-lighting'),
  'entrance-safer-access': '/images/service-card-products/entrance-safer-access.png',
  'entrance-seating': serviceProductImage('entry-seat'),
  'entrance-secure-access': serviceProductImage('video-doorbell'),
  'entrance-step-handrail': '/images/service-gallery/05-entryway-and-threshold-support.jpg',
  'entrance-threshold-treatment': serviceProductImage('threshold-reduction'),
  'entrance-wider-doorway': serviceProductImage('wide-doorway'),
  'kitchen-anti-fatigue-mat': '/images/service-card-products/kitchen-standing-comfort-mat.png',
  'kitchen-connected-experience': serviceProductImage('kitchen-voice-speaker'),
  'kitchen-easy-grip-tools': serviceProductImage('kitchen-tools'),
  'kitchen-gas-co-sensor': serviceProductImage('kitchen-water-monitoring'),
  'kitchen-improved-lighting': serviceProductImage('kitchen-worktop-lighting'),
  'kitchen-lightweight-cookware': serviceProductImage('kitchen-tools'),
  'kitchen-pull-down-shelf': serviceProductImage('pull-out-storage'),
  'kitchen-pull-out-pantry-storage': serviceProductImage('pull-out-storage'),
  'kitchen-prep-mats': '/images/service-card-products/kitchen-standing-comfort-mat.png',
  'kitchen-safer-cooking': '/images/service-card-products/kitchen-cooking-safety-control.png',
  'kitchen-safer-food-preparation': serviceProductImage('kitchen-tools'),
  'kitchen-safer-movement': '/images/service-card-products/kitchen-standing-comfort-mat.png',
  'kitchen-safety-monitoring': serviceProductImage('kitchen-water-monitoring'),
  'kitchen-smart-plugs': serviceProductImage('kitchen-voice-speaker'),
  'kitchen-stove-shutoff': '/images/service-card-products/kitchen-cooking-safety-control.png',
  'kitchen-touchless-faucet': serviceProductImage('lever-tap'),
  'kitchen-voice-lighting-timers': serviceProductImage('kitchen-voice-speaker'),
  'kitchen-water-leak-sensor': serviceProductImage('kitchen-water-monitoring'),
  'kitchen-wider-doorway': serviceProductImage('wide-doorway'),
  'kitchen-worktop-lighting': serviceProductImage('kitchen-worktop-lighting'),
  'living-room-connected-experience': serviceProductImage('voice-speaker-bedroom'),
  'living-room-couch-assist-frame': '/images/service-card-products/living-room-seating-support.png',
  'living-room-couch-assist-handle': '/images/service-card-products/living-room-seating-support.png',
  'living-room-d-shaped-cabinet-pulls': serviceProductImage('door-handle'),
  'living-room-d-shaped-cabinet-pulls-product': serviceProductImage('door-handle'),
  'living-room-easier-sitting-standing': '/images/service-card-products/living-room-seating-support.png',
  'living-room-electric-recliner-chair': '/images/service-card-products/living-room-electric-recliner.png',
  'living-room-furniture-risers': '/images/service-card-products/living-room-seating-support.png',
  'living-room-furniture-risers-product': '/images/service-card-products/living-room-seating-support.png',
  'living-room-improved-lighting': '/images/service-card-products/living-room-motion-lighting.png',
  'living-room-beveled-transition-strips': serviceProductImage('threshold-ramp'),
  'living-room-beveled-transition-strips-product': serviceProductImage('threshold-ramp'),
  'living-room-anti-slip-floor-treatment': serviceProductImage('floor-grip'),
  'living-room-safer-furniture': serviceProductImage('furniture-anchor'),
  'living-room-safer-room': '/images/service-card-products/living-room-route-power-access.png',
  'living-room-safety-monitoring': serviceProductImage('motion-sensor'),
  'living-room-slip-prevention': serviceProductImage('rug-grip'),
  'living-room-stair-safety': serviceProductImage('stair-support'),
  'living-room-raised-electrical-outlets': '/images/service-card-products/living-room-raised-outlets.png',
  'raised-electrical-outlet-relocation': '/images/service-card-products/living-room-raised-outlets.png',
  'living-room-wider-doorway': serviceProductImage('wide-doorway'),
  'movement-cable-management': '/images/service-card-products/living-room-route-power-access.png',
  'movement-hallway-lighting': '/images/service-card-products/living-room-motion-lighting.png',
  'movement-rug-securing': serviceProductImage('rug-grip'),
  'movement-stand-assist': '/images/service-card-products/living-room-seating-support.png',
  'movement-stair-handrails': '/images/service-gallery/03-stairway-and-hallway-support.jpg',
  'movement-stair-treads': '/images/service-gallery/02-anti-slip-safety-improvements.jpg',
  'seating-height-adjustment': '/images/service-card-products/living-room-seating-support.png',
  'connected-emergency-button': serviceProductImage('emergency-button'),
  'connected-family-alerts': '/images/how-it-works-smartphone.jpg',
  'connected-fall-detection': '/images/service-gallery/09-fall-detection-sensors.jpg',
  'connected-monitoring': '/images/service-gallery/12-smart-setup-and-user-training.jpg',
  'connected-voice-hub': '/images/service-gallery/11-voice-controls-and-smart-routines.jpg',
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
