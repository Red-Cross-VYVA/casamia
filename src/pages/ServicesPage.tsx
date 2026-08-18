import {
  ArrowDown,
  ArrowRight,
  Bath,
  BedDouble,
  CheckCircle2,
  CookingPot,
  DoorOpen,
  Home,
  MousePointer2,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LocalizedLink as Link } from '../components/LocalizedLink'

import { SafeImage } from '../components/SafeImage'
import { ServiceItemDetailModal } from '../components/ServiceItemDetailModal'
import { getZoneRiskHotspotStyle, zoneRiskMaps, type ZoneRiskArea, type ZoneRiskMap } from '../constants/zoneRiskMaps'
import { SEO } from '../components/SEO'
import {
  getActiveCatalogueRooms,
  getHomeSafetyPackageForRoom,
  getMasterServiceCatalogue,
} from '../services/masterServiceCatalogue'
import { getServicesForPackageArea } from '../services/serviceCatalogue'
import { useLocalizedServiceCatalogue } from '../services/serviceCatalogueLocalization'
import type {
  CasaMiaService,
  LocalizedString,
  MasterServiceCatalogue,
  ServicePackageArea,
} from '../types/serviceCatalogue'
import '../styles/services-catalogue.css'

type CatalogueGroupId = ServicePackageArea | 'other'
type CatalogueZoneRiskArea = Extract<ZoneRiskArea, CatalogueGroupId>

type CatalogueAreaDefinition = {
  id: CatalogueGroupId
  icon: LucideIcon
  image: string
  title: Record<'en' | 'es', string>
  description: Record<'en' | 'es', string>
}

type ServiceGroup = {
  area: CatalogueAreaDefinition
  services: CasaMiaService[]
}

type ServiceCardVisualTone =
  | 'access'
  | 'alert'
  | 'fire'
  | 'food'
  | 'light'
  | 'mobility'
  | 'support'
  | 'water'

type ServiceCardVisualKind =
  | 'adjustable-bed'
  | 'bed-alert'
  | 'bed-transfer'
  | 'clear-route'
  | 'door-handle'
  | 'emergency-button'
  | 'entry-seat'
  | 'floor-grip'
  | 'furniture-anchor'
  | 'generic-product'
  | 'hob-shutoff'
  | 'kitchen-tools'
  | 'lever-tap'
  | 'motion-light'
  | 'motion-sensor'
  | 'pull-out-storage'
  | 'reachable-storage'
  | 'recliner'
  | 'shower-seat'
  | 'smoke-detector'
  | 'stair-support'
  | 'thermostatic-valve'
  | 'threshold-ramp'
  | 'toilet-rails'
  | 'tub-cutout'
  | 'vertical-rail'
  | 'video-doorbell'
  | 'voice-speaker'
  | 'water-monitoring'
  | 'wide-doorway'

type ServiceCardVisualConfig = {
  kind: ServiceCardVisualKind
  tone: ServiceCardVisualTone
  image?: string
}

type ServicesPageCopy = {
  seoTitle: string
  seoDescription: string
  heroEyebrow: string
  heroTitle: string
  heroBody: string
  browseCta: string
  catalogueGuide: {
    eyebrow: string
    title: string
    body: string
    points: string[]
    visualTitle: string
    visualBody: string
    visualAreas: string[]
    singleRoomLabel: string
    planLabel: string
    startCta: string
    close: string
  }
  planCta: string
  catalogueLabel: string
  currentOptions: string
  activeServices: string
  packageAreas: string
  inclusionsVisible: string
  sectionEyebrow: string
  sectionTitle: string
  sectionBody: string
  packageNavigation: string
  includedItemSingular: string
  includedItemPlural: string
  addOnSingular: string
  addOnPlural: string
  selectedEyebrow: string
  coreComponent: string
  optionalComponent: string
  included: string
  customerBenefit: string
  customPackageEyebrow: string
  customPackageTitle: string
  customPackageBody: string
  customPackageCta: string
  requirements: {
    installation: string
    measurement: string
    visit: string
    compatibility: string
  }
  safetyNote: string
  emptyTitle: string
  emptyBody: string
  finalEyebrow: string
  finalTitle: string
  finalBody: string
  startCta: string
  contactCta: string
}

const catalogueAreaVisuals: Record<ServicePackageArea, { icon: LucideIcon; image: string }> = {
  bathroom: { icon: Bath, image: '/images/solutions/bathroom-safety.jpg' },
  bedroom: { icon: BedDouble, image: '/images/before-after/bedroom-after-card.webp' },
  entrance: { icon: DoorOpen, image: '/images/service-card-products/entrance-safer-access.png' },
  kitchen: { icon: CookingPot, image: '/images/solutions/adorable-mature-couple-kitchen.jpg' },
  lighting: { icon: Sparkles, image: '/images/service-gallery/isometric/isometric-living.jpg' },
  'living-room': { icon: Home, image: '/images/before-after/living-after-home.webp' },
  outdoor: { icon: DoorOpen, image: '/images/service-card-products/entrance-safer-access.png' },
  'smart-safety': { icon: Sparkles, image: '/images/how-it-works-smartphone.jpg' },
  stairs: { icon: Home, image: '/images/solutions/stairs-hallways.jpg' },
}
const otherArea: CatalogueAreaDefinition = {
  id: 'other',
  icon: PackageCheck,
  image: '/images/how-it-works-smartphone.jpg',
  title: { en: 'Other current services', es: 'Otros servicios actuales' },
  description: {
    en: 'Active catalogue options not yet assigned to a package area.',
    es: 'Opciones activas todavía no asignadas a un área concreta.',
  },
}

const serviceCardProduct = (name: string) => `/images/service-card-products/${name}.webp`

const roomFallbackProductImages: Partial<Record<CasaMiaService['room'], string>> = {
  bathroom: serviceCardProduct('shower-seat'),
  bedroom: serviceCardProduct('bed-transfer'),
  kitchen: serviceCardProduct('kitchen-tools'),
  entrance: serviceCardProduct('threshold-ramp'),
  movement: serviceCardProduct('clear-night-route'),
  connected: serviceCardProduct('motion-sensor'),
  'living-room': serviceCardProduct('recliner'),
}

const packageZoneNavImages: Partial<Record<CatalogueGroupId, string>> = {
  bathroom: serviceCardProduct('shower-seat'),
  bedroom: serviceCardProduct('underbed-lighting'),
  kitchen: serviceCardProduct('kitchen-worktop-lighting'),
  'living-room': serviceCardProduct('recliner'),
  stairs: serviceCardProduct('stair-support'),
  entrance: serviceCardProduct('threshold-ramp'),
  outdoor: serviceCardProduct('entrance-motion-lighting'),
  lighting: serviceCardProduct('clear-night-route'),
  'smart-safety': serviceCardProduct('motion-sensor'),
}

const catalogueGuideVisualImages = [
  '/images/solutions/bathroom-safety.jpg',
  '/images/solutions/adorable-mature-couple-kitchen.jpg',
  '/images/before-after/bedroom-after-card.webp',
  '/images/service-card-products/entrance-safer-access.png',
]

const serviceCardVisuals: Record<string, ServiceCardVisualConfig> = {
  'bathroom-grab-bars': { kind: 'vertical-rail', tone: 'support', image: '/images/service-gallery/01-grab-bars-and-support-points.jpg' },
  'bathroom-folding-shower-seat': { kind: 'shower-seat', tone: 'water', image: '/images/service-card-products/folding-shower-seat.png' },
  'bathroom-raised-toilet-seat': { kind: 'toilet-rails', tone: 'support', image: serviceCardProduct('toilet-rails') },
  'bathroom-toilet-support-rails': { kind: 'toilet-rails', tone: 'support', image: serviceCardProduct('toilet-rails') },
  'bathroom-comfort-height-toilet': { kind: 'toilet-rails', tone: 'support', image: serviceCardProduct('toilet-rails') },
  'bathroom-anti-slip-floor-treatment': { kind: 'floor-grip', tone: 'mobility', image: serviceCardProduct('floor-grip') },
  'bathroom-anti-slip-bath-mat': { kind: 'floor-grip', tone: 'mobility', image: '/images/service-card-products/anti-slip-bath-mat.png' },
  'bathroom-improved-lighting': { kind: 'motion-light', tone: 'light', image: '/images/service-gallery/04-bathroom-and-kitchen-adaptations.jpg' },
  'bathroom-lever-mixer-tap': { kind: 'lever-tap', tone: 'water', image: serviceCardProduct('lever-tap') },
  'bathroom-thermostatic-valve': { kind: 'thermostatic-valve', tone: 'water', image: serviceCardProduct('thermostatic-shower-mixer') },
  'bathroom-threshold-removal': { kind: 'threshold-ramp', tone: 'access', image: serviceCardProduct('threshold-reduction') },
  'bathroom-door-hardware': { kind: 'door-handle', tone: 'access', image: serviceCardProduct('door-handle') },
  'bathroom-safety-monitoring': { kind: 'water-monitoring', tone: 'alert', image: serviceCardProduct('water-monitoring') },
  'bathroom-motion-lighting': { kind: 'motion-light', tone: 'light', image: serviceCardProduct('motion-light') },
  'bathroom-tub-cutout': { kind: 'tub-cutout', tone: 'access', image: serviceCardProduct('tub-cutout') },
  'bathroom-wider-doorway': { kind: 'wide-doorway', tone: 'access', image: serviceCardProduct('wide-doorway') },
  'bathroom-vertical-support-rail': { kind: 'vertical-rail', tone: 'support', image: '/images/service-card-products/vertical-shower-grab-bar.png' },
  'bedroom-underbed-lighting': { kind: 'motion-light', tone: 'light', image: serviceCardProduct('underbed-lighting') },
  'bedroom-bed-support': { kind: 'bed-transfer', tone: 'support', image: serviceCardProduct('bed-transfer') },
  'bedroom-bed-wedge-support': { kind: 'bed-transfer', tone: 'support', image: serviceCardProduct('bed-wedge-back-support') },
  'bedroom-night-time-visibility': { kind: 'motion-light', tone: 'light', image: serviceCardProduct('clear-night-route') },
  'bedroom-night-route': { kind: 'clear-route', tone: 'mobility', image: serviceCardProduct('clear-night-route') },
  'bedroom-safer-walking-routes': { kind: 'floor-grip', tone: 'mobility', image: '/images/service-card-products/rug-stabilised.png' },
  'bedroom-slip-resistance': { kind: 'floor-grip', tone: 'mobility', image: '/images/service-card-products/bedside-exit-mat.png' },
  'bedroom-fire-safety': { kind: 'smoke-detector', tone: 'fire', image: serviceCardProduct('smoke-detector') },
  'bedroom-voice-assistance': { kind: 'voice-speaker', tone: 'alert', image: serviceCardProduct('voice-speaker-bedroom') },
  'bedroom-emergency-support': { kind: 'emergency-button', tone: 'alert', image: serviceCardProduct('emergency-button') },
  'bedroom-accessible-wardrobe': { kind: 'reachable-storage', tone: 'support', image: serviceCardProduct('reachable-wardrobe') },
  'bedroom-advanced-bed-transfer': { kind: 'bed-transfer', tone: 'support', image: serviceCardProduct('advanced-bed-transfer') },
  'bedroom-adjustable-bed': { kind: 'adjustable-bed', tone: 'support', image: serviceCardProduct('adjustable-bed') },
  'bedroom-door-accessibility': { kind: 'wide-doorway', tone: 'access', image: serviceCardProduct('wide-doorway') },
  'kitchen-easy-grip-tools': { kind: 'kitchen-tools', tone: 'food', image: serviceCardProduct('kitchen-tools') },
  'kitchen-stove-shutoff': { kind: 'hob-shutoff', tone: 'fire', image: serviceCardProduct('hob-shutoff') },
  'kitchen-worktop-lighting': { kind: 'motion-light', tone: 'light', image: serviceCardProduct('kitchen-worktop-lighting') },
  'kitchen-anti-fatigue-mat': { kind: 'floor-grip', tone: 'mobility', image: serviceCardProduct('kitchen-anti-fatigue-mat') },
  'kitchen-easier-storage': { kind: 'pull-out-storage', tone: 'support', image: serviceCardProduct('pull-out-storage') },
  'kitchen-water-leak-sensor': { kind: 'water-monitoring', tone: 'alert', image: serviceCardProduct('kitchen-water-monitoring') },
  'kitchen-voice-lighting-timers': { kind: 'voice-speaker', tone: 'alert', image: serviceCardProduct('kitchen-voice-speaker') },
  'kitchen-pull-down-shelf': { kind: 'pull-out-storage', tone: 'support', image: serviceCardProduct('pull-out-storage') },
  'kitchen-wider-doorway': { kind: 'wide-doorway', tone: 'access', image: serviceCardProduct('wide-doorway') },
  'living-room-easier-sitting-standing': { kind: 'recliner', tone: 'support', image: serviceCardProduct('recliner') },
  'movement-stand-assist': { kind: 'recliner', tone: 'support', image: '/images/service-card-products/living-room-seating-support.png' },
  'movement-rug-securing': { kind: 'floor-grip', tone: 'mobility', image: '/images/service-card-products/living-room-route-power-access.png' },
  'movement-hallway-lighting': { kind: 'motion-light', tone: 'light', image: '/images/service-card-products/living-room-motion-lighting.png' },
  'living-room-slip-prevention': { kind: 'floor-grip', tone: 'mobility', image: serviceCardProduct('rug-grip') },
  'living-room-safer-furniture': { kind: 'furniture-anchor', tone: 'support', image: serviceCardProduct('furniture-anchor') },
  'living-room-safety-monitoring': { kind: 'motion-sensor', tone: 'alert', image: serviceCardProduct('motion-sensor') },
  'living-room-connected-experience': { kind: 'voice-speaker', tone: 'alert', image: '/images/service-gallery/11-voice-controls-and-smart-routines.jpg' },
  'living-room-electric-recliner-chair': { kind: 'recliner', tone: 'support', image: serviceCardProduct('recliner') },
  'living-room-wider-doorway': { kind: 'wide-doorway', tone: 'access', image: serviceCardProduct('wide-doorway') },
  'living-room-raised-electrical-outlets': { kind: 'motion-light', tone: 'light', image: '/images/service-card-products/living-room-raised-outlets.png' },
  'living-room-stair-safety': { kind: 'stair-support', tone: 'mobility', image: serviceCardProduct('stair-support') },
  'entrance-safer-access': { kind: 'threshold-ramp', tone: 'access', image: '/images/service-card-products/entrance-safer-access.png' },
  'entrance-step-handrail': { kind: 'stair-support', tone: 'support', image: '/images/service-card-products/entrance-safer-access.png' },
  'entrance-threshold-treatment': { kind: 'threshold-ramp', tone: 'access', image: serviceCardProduct('threshold-reduction') },
  'entrance-easier-door-access': { kind: 'door-handle', tone: 'access', image: serviceCardProduct('entrance-door-handle') },
  'entrance-motion-lighting': { kind: 'motion-light', tone: 'light', image: serviceCardProduct('entrance-motion-lighting') },
  'entrance-connected-door-awareness': { kind: 'video-doorbell', tone: 'alert', image: serviceCardProduct('video-doorbell') },
  'entrance-secure-access': { kind: 'video-doorbell', tone: 'alert', image: serviceCardProduct('video-doorbell') },
  'entrance-wider-doorway': { kind: 'wide-doorway', tone: 'access', image: serviceCardProduct('wide-doorway') },
  'entrance-accessibility-ramp': { kind: 'threshold-ramp', tone: 'access', image: serviceCardProduct('threshold-ramp') },
  'entrance-modular-ramp': { kind: 'threshold-ramp', tone: 'access', image: serviceCardProduct('threshold-ramp') },
  'entrance-seating': { kind: 'entry-seat', tone: 'support', image: serviceCardProduct('entry-seat') },
  'entrance-key-safe': { kind: 'door-handle', tone: 'access', image: '/images/service-gallery/07-smart-access-devices.jpg' },
  'movement-stair-handrails': { kind: 'stair-support', tone: 'mobility', image: '/images/service-gallery/03-stairway-and-hallway-support.jpg' },
  'movement-stair-treads': { kind: 'floor-grip', tone: 'mobility', image: '/images/service-gallery/02-anti-slip-safety-improvements.jpg' },
  'connected-emergency-button': { kind: 'emergency-button', tone: 'alert', image: '/images/service-gallery/08-emergency-response-device.jpg' },
  'connected-voice-hub': { kind: 'voice-speaker', tone: 'alert', image: '/images/service-gallery/07-smart-access-devices.jpg' },
  'connected-family-alerts': { kind: 'motion-sensor', tone: 'alert', image: '/images/how-it-works-smartphone.jpg' },
  'connected-fall-detection': { kind: 'motion-sensor', tone: 'alert', image: '/images/service-gallery/09-fall-detection-sensors.jpg' },
  'connected-monitoring': { kind: 'motion-sensor', tone: 'alert', image: '/images/service-gallery/12-smart-setup-and-user-training.jpg' },
}

const servicesPageCopy: Record<'en' | 'es', ServicesPageCopy> = {
  en: {
    seoTitle: 'CasaMia Home Safety Service Catalogue',
    seoDescription: 'Explore CasaMia home safety services and current inclusions by room and safety area.',
    heroEyebrow: 'CasaMia service catalogue',
    heroTitle: 'Home safety packages, room by room.',
    heroBody: 'Choose a room or safety area to see the core improvements CasaMia can assess, quote and coordinate.',
    browseCta: 'Explore services',
    catalogueGuide: {
      eyebrow: 'Before you browse',
      title: 'Pick rooms. Build one plan.',
      body: 'Start with one package or combine areas across the home before you browse.',
      points: ['One package', 'Several areas', 'One CasaMia plan'],
      visualTitle: 'Choose the areas to include',
      visualBody: 'Bathroom, kitchen, bedroom, entrance and more.',
      visualAreas: ['Bathroom', 'Kitchen', 'Bedroom', 'Entrance'],
      singleRoomLabel: '1 room',
      planLabel: 'Combined plan',
      startCta: 'Start catalogue',
      close: 'Close',
    },
    planCta: 'Build my safer home',
    catalogueLabel: 'Current catalogue',
    currentOptions: 'included items and add-ons available now',
    activeServices: 'Active services',
    packageAreas: 'Package areas',
    inclusionsVisible: 'Inclusions shown',
    sectionEyebrow: 'Catalogue',
    sectionTitle: 'Choose a room.',
    sectionBody: '',
    packageNavigation: 'CasaMia package areas',
    includedItemSingular: 'included item',
    includedItemPlural: 'included items',
    addOnSingular: 'optional add-on',
    addOnPlural: 'optional add-ons',
    selectedEyebrow: 'Package area',
    coreComponent: 'Included in package',
    optionalComponent: 'Optional add-on',
    included: 'What is included',
    customerBenefit: 'Why it helps',
    customPackageEyebrow: 'Need a different mix?',
    customPackageTitle: 'Customise your own package',
    customPackageBody: 'Choose the rooms, routines and services that matter most. CasaMia will turn them into one clear plan.',
    customPackageCta: 'Build my package',
    requirements: {
      installation: 'Professional installation',
      measurement: 'Measurement required',
      visit: 'Home visit required',
      compatibility: 'Compatibility check',
    },
    safetyNote: 'Important',
    emptyTitle: 'No active services are available yet.',
    emptyBody: 'Activate services in the CasaMia admin catalogue to publish them here.',
    finalEyebrow: 'Need help choosing?',
    finalTitle: 'Start with the concern. We will shape the right package.',
    finalBody: 'A short guided review helps identify the most useful services before you request a quote or book a visit.',
    startCta: 'Start guided review',
    contactCta: 'Contact CasaMia',
  },
  es: {
    seoTitle: 'Catálogo de servicios de seguridad CasaMia',
    seoDescription: 'Explora servicios CasaMia e inclusiones actuales por estancia y área de seguridad.',
    heroEyebrow: 'Catálogo de servicios CasaMia',
    heroTitle: 'Paquetes de seguridad, estancia por estancia.',
    heroBody: 'Elige una estancia o zona de seguridad para ver las mejoras que CasaMia puede valorar, presupuestar y coordinar.',
    browseCta: 'Ver servicios',
    catalogueGuide: {
      eyebrow: 'Antes de ver el catalogo',
      title: 'Elige zonas. Crea un plan.',
      body: 'Empieza con un paquete o combina varias areas de la casa antes de ver el catalogo.',
      points: ['Un paquete', 'Varias zonas', 'Un plan CasaMia'],
      visualTitle: 'Elige las zonas',
      visualBody: 'Bano, cocina, dormitorio, entrada y mas.',
      visualAreas: ['Bano', 'Cocina', 'Dormitorio', 'Entrada'],
      singleRoomLabel: '1 estancia',
      planLabel: 'Plan combinado',
      startCta: 'Empezar catalogo',
      close: 'Cerrar',
    },
    planCta: 'Crear mi hogar más seguro',
    catalogueLabel: 'Catálogo actual',
    currentOptions: 'incluidos y extras disponibles',
    activeServices: 'Servicios activos',
    packageAreas: 'Áreas de servicio',
    inclusionsVisible: 'Inclusiones visibles',
    sectionEyebrow: 'Catálogo',
    sectionTitle: 'Elige una zona.',
    sectionBody: '',
    packageNavigation: 'Áreas de servicio CasaMia',
    includedItemSingular: 'incluido',
    includedItemPlural: 'incluidos',
    addOnSingular: 'extra opcional',
    addOnPlural: 'extras opcionales',
    selectedEyebrow: 'Zona del paquete',
    coreComponent: 'Incluido en el paquete',
    optionalComponent: 'Extra opcional',
    included: 'Qué incluye',
    customerBenefit: 'Por qué ayuda',
    customPackageEyebrow: '¿Necesitas otra combinación?',
    customPackageTitle: 'Crea tu paquete a medida',
    customPackageBody: 'Elige las estancias, rutinas y servicios que más importan. CasaMia lo convierte en un plan claro.',
    customPackageCta: 'Crear mi paquete',
    requirements: {
      installation: 'Instalación profesional',
      measurement: 'Requiere medición',
      visit: 'Requiere visita',
      compatibility: 'Comprobación de compatibilidad',
    },
    safetyNote: 'Importante',
    emptyTitle: 'Todavía no hay servicios activos.',
    emptyBody: 'Activa servicios en el catálogo de administración para publicarlos aquí.',
    finalEyebrow: '¿Necesitas ayuda para elegir?',
    finalTitle: 'Empieza por lo que te preocupa. Crearemos el paquete adecuado.',
    finalBody: 'Una revisión guiada ayuda a identificar los servicios más útiles antes de solicitar presupuesto o reservar una visita.',
    startCta: 'Empezar revisión guiada',
    contactCta: 'Contactar con CasaMia',
  },
}

function getRequirementLabels(service: CasaMiaService, copy: ServicesPageCopy) {
  return [
    (service.requirements?.installation ?? service.requiresInstallation) ? copy.requirements.installation : null,
    (service.requirements?.measurement ?? service.requiresMeasurement) ? copy.requirements.measurement : null,
    (service.requirements?.siteVisit ?? service.requiresSiteVisit) ? copy.requirements.visit : null,
    (service.requirements?.compatibilityCheck ?? service.requiresCompatibilityCheck) ? copy.requirements.compatibility : null,
  ].filter((item): item is string => Boolean(item))
}

const getCustomerServiceName = (service: CasaMiaService) => service.customerName ?? service.name
const getCustomerServiceDescription = (service: CasaMiaService) =>
  service.customerDescription ?? service.shortDescription
const getCustomerServiceBenefit = (service: CasaMiaService) =>
  service.outcome ?? service.customerBenefit

const isWebsiteVisible = (service: CasaMiaService) =>
  service.websiteVisible ?? service.visibility?.website ?? true

const isOptionalAddOn = (service: CasaMiaService) =>
  (service.componentRole ?? (service.priority === 'optional' ? 'option' : 'core')) === 'option'
  || service.section === 'connected_room'
  || service.section === 'optional_adaptations'

function uniqueIncludedItems(items: string[] | undefined) {
  const seen = new Set<string>()

  return (items ?? []).filter((item) => {
    const key = item.trim().toLowerCase()

    if (!key || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function formatPackageComposition(services: CasaMiaService[], copy: ServicesPageCopy) {
  const optionalAddOns = services.filter(isOptionalAddOn).length
  const includedItems = services.length - optionalAddOns
  const includedLabel = includedItems === 1 ? copy.includedItemSingular : copy.includedItemPlural
  const addOnLabel = optionalAddOns === 1 ? copy.addOnSingular : copy.addOnPlural

  return optionalAddOns > 0
    ? `${includedItems} ${includedLabel} · ${optionalAddOns} ${addOnLabel}`
    : `${includedItems} ${includedLabel}`
}

function getCatalogueAreaTitle(area: ServicePackageArea): Record<'en' | 'es', string> {
  const titles: Record<ServicePackageArea, Record<'en' | 'es', string>> = {
    bathroom: { en: 'Bathroom', es: 'Baño' },
    bedroom: { en: 'Bedroom', es: 'Dormitorio' },
    entrance: { en: 'Entrance', es: 'Entrada' },
    kitchen: { en: 'Kitchen', es: 'Cocina' },
    lighting: { en: 'Lighting', es: 'Iluminación' },
    'living-room': { en: 'Living room', es: 'Salón' },
    outdoor: { en: 'Outdoor', es: 'Exterior' },
    'smart-safety': { en: 'Smart safety', es: 'Seguridad conectada' },
    stairs: { en: 'Stairs', es: 'Escaleras' },
  }

  return titles[area]
}

function buildCatalogueAreas(masterCatalogue: MasterServiceCatalogue): CatalogueAreaDefinition[] {
  const areas: CatalogueAreaDefinition[] = []

  getActiveCatalogueRooms(masterCatalogue).forEach((room) => {
    if (!isCataloguePackageArea(room.id)) {
      return
    }

    const packageRecord = getHomeSafetyPackageForRoom(room.id, masterCatalogue)
    const visual = catalogueAreaVisuals[room.id]

    areas.push({
      id: room.id,
      icon: visual.icon,
      image: visual.image,
      title: getCatalogueAreaTitle(room.id),
      description: localizeRecord(
        packageRecord?.shortDescription ?? packageRecord?.customerBenefit ?? room.name,
        room.name,
      ),
    })
  })

  return areas
}

function uniqueServicesById(services: CasaMiaService[]) {
  const seen = new Set<string>()

  return services.filter((service) => {
    if (seen.has(service.id)) {
      return false
    }

    seen.add(service.id)
    return true
  })
}

function isCataloguePackageArea(value: string): value is ServicePackageArea {
  return Object.prototype.hasOwnProperty.call(catalogueAreaVisuals, value)
}

function isZoneRiskArea(value: CatalogueGroupId): value is CatalogueZoneRiskArea {
  return Object.prototype.hasOwnProperty.call(zoneRiskMaps, value)
}

function localizeRecord(value: LocalizedString, fallback: LocalizedString): Record<'en' | 'es', string> {
  const english = value.en ?? value.es ?? fallback.en ?? fallback.es ?? ''
  const spanish = value.es ?? value.en ?? fallback.es ?? fallback.en ?? english

  return { en: english, es: spanish }
}

function getServiceCardVisual(service: CasaMiaService): ServiceCardVisualConfig {
  const mappedVisual = serviceCardVisuals[service.id]

  if (mappedVisual) return mappedVisual

  const category = service.category.toLowerCase()
  const roomFallbackImage = roomFallbackProductImages[service.room]

  if (category.includes('light') || category.includes('ilumin')) {
    return { kind: 'motion-light', tone: 'light', image: serviceCardProduct('motion-light') }
  }
  if (category.includes('toilet') || category.includes('inodoro')) {
    return { kind: 'toilet-rails', tone: 'support', image: serviceCardProduct('toilet-rails') }
  }
  if (category.includes('bath') || category.includes('ducha')) {
    return { kind: 'shower-seat', tone: 'water', image: serviceCardProduct('shower-seat') }
  }
  if (category.includes('water') || category.includes('agua') || category.includes('fontan')) {
    return { kind: 'water-monitoring', tone: 'water', image: serviceCardProduct('water-monitoring') }
  }
  if (category.includes('floor') || category.includes('suelo') || category.includes('slip')) {
    return { kind: 'floor-grip', tone: 'mobility', image: serviceCardProduct('floor-grip') }
  }
  if (category.includes('door') || category.includes('access') || category.includes('acceso')) {
    return { kind: 'wide-doorway', tone: 'access', image: serviceCardProduct('wide-doorway') }
  }
  if (category.includes('connected') || category.includes('alert') || category.includes('aviso')) {
    return { kind: 'motion-sensor', tone: 'alert', image: serviceCardProduct('motion-sensor') }
  }

  if (service.room === 'bathroom') return { kind: 'shower-seat', tone: 'water', image: roomFallbackImage }
  if (service.room === 'bedroom') return { kind: 'bed-transfer', tone: 'support', image: roomFallbackImage }
  if (service.room === 'kitchen') return { kind: 'kitchen-tools', tone: 'food', image: roomFallbackImage }
  if (service.room === 'entrance') return { kind: 'threshold-ramp', tone: 'access', image: roomFallbackImage }
  if (service.room === 'movement') return { kind: 'clear-route', tone: 'mobility', image: roomFallbackImage }
  if (service.room === 'connected') return { kind: 'motion-sensor', tone: 'alert', image: roomFallbackImage }
  if (service.room === 'living-room') return { kind: 'recliner', tone: 'support', image: roomFallbackImage }

  return { kind: 'generic-product', tone: 'support', image: serviceCardProduct('vertical-rail') }
}

export function ServicesPage() {
  const { i18n } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = servicesPageCopy[language]
  const viewDetailsLabel = language === 'es' ? 'Ver detalles' : 'View details'
  const catalogue = useLocalizedServiceCatalogue(i18n.language)
  const masterCatalogue = useMemo(
    () => catalogue.masterCatalogue ?? getMasterServiceCatalogue(),
    [catalogue.masterCatalogue],
  )
  const catalogueAreas = useMemo(() => buildCatalogueAreas(masterCatalogue), [masterCatalogue])
  const [selectedGroupId, setSelectedGroupId] = useState<CatalogueGroupId>('bathroom')
  const [activeService, setActiveService] = useState<CasaMiaService | null>(null)
  const activeServices = useMemo(
    () => uniqueServicesById(catalogue.services.filter((service) => service.active && isWebsiteVisible(service))),
    [catalogue.services],
  )
  const serviceGroups = useMemo<ServiceGroup[]>(() => {
    const groupedServices = catalogueAreas
      .map((area) => ({
        area,
        services: getServicesForPackageArea(activeServices, area.id as ServicePackageArea),
      }))
      .filter((group) => group.services.length > 0)
    const assignedServiceIds = new Set(
      groupedServices.flatMap((group) => group.services.map((service) => service.id)),
    )
    const unassignedServices = activeServices.filter((service) => !assignedServiceIds.has(service.id))

    return unassignedServices.length
      ? [...groupedServices, { area: otherArea, services: unassignedServices }]
      : groupedServices
  }, [activeServices, catalogueAreas])
  const selectedGroup = serviceGroups.find((group) => group.area.id === selectedGroupId) ?? serviceGroups[0]
  const SelectedIcon = selectedGroup?.area.icon ?? PackageCheck
  const selectedRiskMap = selectedGroup && isZoneRiskArea(selectedGroup.area.id)
    ? zoneRiskMaps[selectedGroup.area.id]
    : undefined
  const [isCatalogueGuideOpen, setIsCatalogueGuideOpen] = useState(false)

  useEffect(() => {
    if (!isCatalogueGuideOpen) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCatalogueGuideOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCatalogueGuideOpen])

  const startCatalogue = () => {
    setIsCatalogueGuideOpen(false)
    window.setTimeout(() => {
      const catalogue = document.getElementById('catalogue-packages')

      if (!catalogue) return

      const catalogueTop = catalogue.getBoundingClientRect().top + window.scrollY
      window.history.replaceState(null, '', '#catalogue-packages')
      window.scrollTo({ top: Math.max(catalogueTop - 92, 0), behavior: 'smooth' })
    }, 0)
  }

  return (
    <>
      <SEO
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/services"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: copy.seoTitle,
          numberOfItems: activeServices.length,
          itemListElement: activeServices.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: getCustomerServiceName(service),
            description: getCustomerServiceDescription(service),
          })),
        }}
      />

      <section className="services-catalogue-hero">
        <div className="services-catalogue-hero-grid site-shell">
          <div className="services-catalogue-hero-copy">
            <span className="eyebrow">{copy.heroEyebrow}</span>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroBody}</p>
            <div className="services-catalogue-hero-actions">
              <button
                aria-expanded={isCatalogueGuideOpen}
                aria-haspopup="dialog"
                className="btn btn-green services-catalogue-hero-cta"
                onClick={() => setIsCatalogueGuideOpen(true)}
                type="button"
              >
                {copy.browseCta}
                <ArrowDown size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {isCatalogueGuideOpen ? (
        <div className="services-catalogue-guide-backdrop" onClick={() => setIsCatalogueGuideOpen(false)}>
          <div
            aria-describedby="services-catalogue-guide-body"
            aria-labelledby="services-catalogue-guide-title"
            aria-modal="true"
            className="services-catalogue-guide-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label={copy.catalogueGuide.close}
              className="services-catalogue-guide-close"
              onClick={() => setIsCatalogueGuideOpen(false)}
              type="button"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <div className="services-catalogue-guide-layout">
              <div className="services-catalogue-guide-copy">
                <p className="eyebrow">{copy.catalogueGuide.eyebrow}</p>
                <h2 id="services-catalogue-guide-title">{copy.catalogueGuide.title}</h2>
                <p id="services-catalogue-guide-body">{copy.catalogueGuide.body}</p>
                <ul className="services-catalogue-guide-points">
                  {copy.catalogueGuide.points.map((point) => (
                    <li key={point}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="services-catalogue-guide-actions">
                  <button className="btn btn-green" onClick={startCatalogue} type="button">
                    {copy.catalogueGuide.startCta}
                    <ArrowDown size={19} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <aside className="services-catalogue-guide-visual" aria-label={copy.catalogueGuide.visualTitle}>
                <div className="services-catalogue-guide-visual-header">
                  <span className="services-catalogue-guide-visual-icon">
                    <PackageCheck size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{copy.catalogueGuide.visualTitle}</strong>
                    <small>{copy.catalogueGuide.visualBody}</small>
                  </div>
                </div>
                <div className="services-catalogue-guide-room-grid">
                  {copy.catalogueGuide.visualAreas.map((area, index) => (
                    <span
                      className={`services-catalogue-guide-room${index < 3 ? ' is-selected' : ''}`}
                      key={area}
                    >
                      <SafeImage
                        alt=""
                        className="services-catalogue-guide-room-media"
                        fallbackLabel=""
                        imgClassName="services-catalogue-guide-room-image"
                        src={catalogueGuideVisualImages[index]}
                      />
                      <span className="services-catalogue-guide-room-check">
                        <CheckCircle2 size={14} aria-hidden="true" />
                      </span>
                      <span className="services-catalogue-guide-room-label">{area}</span>
                    </span>
                  ))}
                </div>
                <div className="services-catalogue-guide-flow">
                  <span>
                    <PackageCheck size={15} aria-hidden="true" />
                    {copy.catalogueGuide.singleRoomLabel}
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                  <span>
                    <Home size={15} aria-hidden="true" />
                    {copy.catalogueGuide.planLabel}
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}

      <section className="services-catalogue-section" id="catalogue-packages">
        <div className="site-shell">
          <header className="services-catalogue-heading">
            <p className="eyebrow">{copy.sectionEyebrow}</p>
            <h2>{copy.sectionTitle}</h2>
            {copy.sectionBody ? <p>{copy.sectionBody}</p> : null}
          </header>

          {serviceGroups.length ? (
            <div className="services-catalogue-explorer">
              <nav className="services-catalogue-nav" aria-label={copy.packageNavigation}>
                {serviceGroups.map((group) => {
                  const Icon = group.area.icon
                  const isSelected = group.area.id === selectedGroup?.area.id
                  const zoneNavImage = packageZoneNavImages[group.area.id]

                  return (
                    <button
                      aria-controls="active-service-package"
                      aria-pressed={isSelected}
                      className={`services-catalogue-nav-item${isSelected ? ' is-selected' : ''}`}
                      key={group.area.id}
                      onClick={() => setSelectedGroupId(group.area.id)}
                      type="button"
                    >
                      {zoneNavImage ? (
                        <span className="services-catalogue-nav-photo" aria-hidden="true">
                          <SafeImage
                            alt=""
                            className="services-catalogue-nav-photo-media"
                            fallbackLabel=""
                            imgClassName="services-catalogue-nav-photo-image"
                            src={zoneNavImage}
                          />
                        </span>
                      ) : (
                        <span className="services-catalogue-nav-icon"><Icon size={23} aria-hidden="true" /></span>
                      )}
                      <span className="services-catalogue-nav-copy">
                        <strong>{group.area.title[language]}</strong>
                        <small>{formatPackageComposition(group.services, copy)}</small>
                      </span>
                    </button>
                  )
                })}
              </nav>

              {selectedGroup ? (
                <section
                  aria-labelledby="active-service-package-title"
                  className="services-catalogue-package"
                  id="active-service-package"
                >
                  <header className="services-catalogue-package-header">
                    <SafeImage
                      alt={selectedGroup.area.title[language]}
                      className="services-catalogue-package-media"
                      imgClassName="services-catalogue-package-image"
                      src={selectedGroup.area.image}
                    />
                    <div className="services-catalogue-package-overlay" />
                    <div className="services-catalogue-package-heading">
                      <span className="services-catalogue-package-icon"><SelectedIcon size={26} aria-hidden="true" /></span>
                      <div>
                        <p>{formatPackageComposition(selectedGroup.services, copy)}</p>
                        <h2 id="active-service-package-title">{selectedGroup.area.title[language]}</h2>
                      </div>
                    </div>
                  </header>

                  {selectedRiskMap ? (
                    <ZoneRiskMapPreview language={language} riskMap={selectedRiskMap} />
                  ) : null}

                  <div className="services-catalogue-service-grid">
                    {selectedGroup.services.map((service) => {
                      const requirements = getRequirementLabels(service, copy)
                      const includedItems = uniqueIncludedItems(service.includedItems)
                      const visibleIncludedItems = includedItems.slice(0, 2)
                      const remainingIncludedItems = includedItems.length - visibleIncludedItems.length
                      const optionalAddOn = isOptionalAddOn(service)
                      const description = getCustomerServiceDescription(service)
                      const benefit = getCustomerServiceBenefit(service)

                      return (
                        <article
                          className={`services-catalogue-service${optionalAddOn ? ' is-optional-add-on' : ''}`}
                          key={service.id}
                        >
                          <header>
                            <ServiceCardVisual service={service} />
                            <div>
                              <small>{service.category}</small>
                              <h3>{getCustomerServiceName(service)}</h3>
                            </div>
                            <span className="services-catalogue-component-role">
                              {optionalAddOn ? copy.optionalComponent : copy.coreComponent}
                            </span>
                          </header>

                          <p className="services-catalogue-service-description">
                            {description}
                          </p>

                          {visibleIncludedItems.length ? (
                            <div className="services-catalogue-key-inclusions">
                              <ul>
                                {visibleIncludedItems.map((item) => (
                                  <li key={item}>
                                    <CheckCircle2 size={16} aria-hidden="true" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                                {remainingIncludedItems > 0 ? (
                                  <li className="services-catalogue-more-inclusions">
                                    +{remainingIncludedItems} {language === 'es' ? 'más' : 'more'}
                                  </li>
                                ) : null}
                              </ul>
                            </div>
                          ) : null}

                          {benefit !== description ? (
                            <p className="services-catalogue-service-benefit">
                              <Sparkles size={16} aria-hidden="true" />
                              <span>{benefit}</span>
                            </p>
                          ) : null}

                          {requirements.length ? (
                            <div className="services-catalogue-requirements">
                              {requirements.map((requirement) => <span key={requirement}>{requirement}</span>)}
                            </div>
                          ) : null}

                          {service.safetyNotice ? (
                            <p className="services-catalogue-safety-note">
                              <ShieldCheck size={17} aria-hidden="true" />
                              <span><strong>{copy.safetyNote}:</strong> {service.safetyNotice}</span>
                            </p>
                          ) : null}

                          <div className="services-catalogue-service-actions">
                            <button
                              className="catalogue-item-detail-button"
                              type="button"
                              onClick={() => setActiveService(service)}
                            >
                              {viewDetailsLabel}
                              <ArrowRight size={15} aria-hidden="true" />
                            </button>
                          </div>
                        </article>
                      )
                    })}

                    <Link className="services-catalogue-custom-package" to="/home-safety-wizard">
                      <span className="services-catalogue-custom-icon">
                        <PackageCheck size={24} aria-hidden="true" />
                      </span>
                      <span className="services-catalogue-custom-copy">
                        <small>{copy.customPackageEyebrow}</small>
                        <strong>{copy.customPackageTitle}</strong>
                        <span>{copy.customPackageBody}</span>
                      </span>
                      <span className="services-catalogue-custom-action">
                        {copy.customPackageCta}
                        <ArrowRight size={18} aria-hidden="true" />
                      </span>
                    </Link>
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div className="services-catalogue-empty">
              <PackageCheck size={34} aria-hidden="true" />
              <h2>{copy.emptyTitle}</h2>
              <p>{copy.emptyBody}</p>
            </div>
          )}
        </div>
      </section>

      <section className="services-catalogue-final">
        <div className="site-shell">
          <div>
            <p className="eyebrow">{copy.finalEyebrow}</p>
            <h2>{copy.finalTitle}</h2>
            <p>{copy.finalBody}</p>
          </div>
          <div className="services-catalogue-final-actions">
            <Link className="btn btn-green" to="/home-safety-wizard">
              {copy.startCta}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link className="btn btn-white" to="/why-us#contact-form">{copy.contactCta}</Link>
          </div>
        </div>
      </section>

      <ServiceItemDetailModal
        imageSrc={activeService ? getServiceCardVisual(activeService).image : undefined}
        language={language}
        onClose={() => setActiveService(null)}
        service={activeService}
      />
    </>
  )
}

function ZoneRiskMapPreview({ language, riskMap }: { language: 'en' | 'es'; riskMap: ZoneRiskMap }) {
  const copy = riskMap.copy[language]
  const [activeRiskId, setActiveRiskId] = useState<string | null>(null)
  const riskMapId = `services-zone-risk-${copy.eyebrow.replace(/\W+/g, '-').toLowerCase()}`
  const riskItems = copy.risks.map((risk, index) => ({
    id: `${riskMapId}-risk-${index + 1}`,
    label: risk,
    detail: copy.riskDetails?.[index],
    position: riskMap.labelPositions[index],
  }))
  const legendItems = copy.legend.map((label, index) => ({
    label,
    position: riskMap.labelPositions[copy.risks.length + index],
  }))
  const interactionHint = language === 'es' ? 'Pasa o toca' : 'Hover or tap'

  return (
    <section className="services-zone-risk" aria-labelledby={riskMapId}>
      <div className="services-zone-risk-stage">
        <SafeImage
          alt={copy.imageAlt}
          className="services-zone-risk-media"
          imgClassName="services-zone-risk-image"
          src={riskMap.image}
        />
        <span className="services-zone-risk-hint" aria-hidden="true">
          <MousePointer2 size={14} strokeWidth={2.4} />
          {interactionHint}
        </span>
        <div className="services-zone-risk-labels">
          {riskItems.map((item) => {
            if (!item.position) return null

            const isActive = activeRiskId === item.id
            const detailSide = item.position.detailSide ?? (item.position.x > 64 ? 'opens-left' : 'opens-right')
            const detailId = item.detail
              ? `services-zone-risk-detail-${item.id}`
              : undefined

            return item.detail ? (
              <span
                className={`services-zone-risk-hotspot${isActive ? ' is-active' : ''}`}
                key={item.id}
                onMouseEnter={() => setActiveRiskId(item.id)}
                onMouseLeave={() => setActiveRiskId((current) => current === item.id ? null : current)}
                style={getZoneRiskHotspotStyle(item.position)}
              >
                <button
                  aria-describedby={detailId}
                  aria-label={item.label}
                  className={`services-zone-risk-label has-detail ${detailSide}${isActive ? ' is-active' : ''}`}
                  onBlur={() => setActiveRiskId((current) => current === item.id ? null : current)}
                  onClick={() => setActiveRiskId((current) => current === item.id ? null : item.id)}
                  onFocus={() => setActiveRiskId(item.id)}
                  type="button"
                >
                  <span>{item.label}</span>
                </button>
                <aside className={`services-zone-risk-detail ${detailSide}`} id={detailId}>
                  <strong>{item.detail.solution}</strong>
                  <p>{item.detail.helps}</p>
                  {item.detail.product ? <small>{item.detail.product}</small> : null}
                  {item.detail.stat ? <em>{item.detail.stat}</em> : null}
                </aside>
              </span>
            ) : (
              <span
                aria-label={item.label}
                className="services-zone-risk-label"
                key={item.id}
                style={{
                  height: `${item.position.h}%`,
                  left: `${item.position.x}%`,
                  top: `${item.position.y}%`,
                  width: `${item.position.w}%`,
                }}
              >
                <span>{item.label}</span>
              </span>
            )
          })}
          {legendItems.map((item, index) => {
            if (!item.position) return null

            return (
              <span
                aria-hidden="true"
                className="services-zone-risk-label is-legend"
                key={`${item.label}-${index}`}
                style={{
                  height: `${item.position.h}%`,
                  left: `${item.position.x}%`,
                  top: `${item.position.y}%`,
                  width: `${item.position.w}%`,
                }}
              >
                {item.label}
              </span>
            )
          })}
        </div>
      </div>
      <div className="services-zone-risk-copy">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h3 id={riskMapId}>{copy.title}</h3>
        <p>{copy.body}</p>
        <ul className="services-zone-risk-list">
          {riskItems.map((item) => (
            <li
              className={activeRiskId === item.id ? 'is-active' : undefined}
              key={item.id}
              onMouseEnter={() => setActiveRiskId(item.id)}
              onMouseLeave={() => setActiveRiskId((current) => current === item.id ? null : current)}
            >
              <button
                aria-label={item.label}
                className="services-zone-risk-list-button"
                onBlur={() => setActiveRiskId((current) => current === item.id ? null : current)}
                onClick={() => setActiveRiskId((current) => current === item.id ? null : item.id)}
                onFocus={() => setActiveRiskId(item.id)}
                type="button"
              >
                <strong>{item.label}</strong>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ServiceCardVisual({ service }: { service: CasaMiaService }) {
  const visual = getServiceCardVisual(service)
  const className = `services-catalogue-card-visual is-${visual.tone} is-${visual.kind}${
    visual.image ? ' has-photo' : ''
  }`

  return (
    <div className={className} aria-hidden="true">
      {visual.image ? (
        <SafeImage
          alt=""
          className="services-catalogue-card-visual-media"
          fallbackLabel=""
          imgClassName="services-catalogue-card-visual-image"
          loading="lazy"
          src={visual.image}
        />
      ) : (
        <ProductVisualSvg kind={visual.kind} />
      )}
    </div>
  )
}

function ProductVisualSvg({ kind }: { kind: ServiceCardVisualKind }) {
  const svgProps = {
    className: 'services-catalogue-product-svg',
    focusable: 'false',
    viewBox: '0 0 92 64',
  } as const

  switch (kind) {
    case 'shower-seat':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="9" y="8" width="46" height="48" rx="9" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M22 13v38" />
            <path d="M22 18h27" />
            <path d="M49 18c8 0 14 6 14 14" />
            <path d="M30 36h25v10H30z" />
            <path d="M34 46v8M52 46v8" />
            <path className="services-catalogue-product-muted" d="M64 32h8M59 39h7M55 29l5-6" />
          </g>
          <circle className="services-catalogue-product-accent" cx="71" cy="20" r="4" />
        </svg>
      )
    case 'toilet-rails':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="40" y="12" width="23" height="24" rx="6" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M30 36h36c0 10-7 17-18 17s-18-7-18-17z" />
            <path d="M44 18h15v18" />
            <path d="M21 25v27M75 25v27" />
            <path d="M21 31h17M58 31h17" />
          </g>
          <circle className="services-catalogue-product-accent" cx="30" cy="31" r="3.5" />
        </svg>
      )
    case 'floor-grip':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="10" y="16" width="72" height="39" rx="8" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
            <path className="services-catalogue-product-muted" d="M10 30h72M10 43h72M32 16v39M57 16v39" />
            <path d="M47 26c-5 4-8 10-6 15 2 6 9 8 14 5 5-3 6-10 2-15-3-4-6-6-10-5z" />
          </g>
          <circle className="services-catalogue-product-accent" cx="35" cy="25" r="3" />
          <circle className="services-catalogue-product-accent" cx="29" cy="30" r="2.7" />
          <circle className="services-catalogue-product-accent" cx="26" cy="36" r="2.3" />
        </svg>
      )
    case 'motion-light':
      return (
        <svg {...svgProps}>
          <circle className="services-catalogue-product-fill" cx="46" cy="32" r="25" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M35 30h22l-5 15H40z" />
            <path d="M40 51h12" />
            <path className="services-catalogue-product-muted" d="M46 11v8M29 21l-6-6M63 21l6-6" />
            <path className="services-catalogue-product-muted" d="M28 42c-4-3-6-6-6-10M64 42c4-3 6-6 6-10" />
          </g>
          <circle className="services-catalogue-product-accent" cx="46" cy="37" r="4" />
        </svg>
      )
    case 'lever-tap':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="18" y="45" width="39" height="9" rx="4" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M26 45h33" />
            <path d="M35 28h18c8 0 13 5 13 13v4" />
            <path d="M45 28V16" />
            <path d="M36 16h18" />
            <path d="M70 47c0 5-4 8-7 8s-7-3-7-8c0-4 7-12 7-12s7 8 7 12z" />
          </g>
          <circle className="services-catalogue-product-accent" cx="65" cy="45" r="3.5" />
        </svg>
      )
    case 'thermostatic-valve':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="20" y="24" width="52" height="18" rx="9" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M12 33h18M62 33h18" />
            <circle cx="46" cy="33" r="15" />
            <path d="M46 23v6" />
            <path d="M38 33h16" />
            <path className="services-catalogue-product-muted" d="M37 18l-4-5M55 18l4-5" />
          </g>
          <circle className="services-catalogue-product-accent" cx="46" cy="33" r="4" />
        </svg>
      )
    case 'door-handle':
      return (
        <svg {...svgProps}>
          <path className="services-catalogue-product-fill" d="M24 54V10h32l12 8v36z" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M24 54V10h32l12 8v36" />
            <path d="M56 18v36" />
            <path d="M49 34h12" />
          </g>
          <circle className="services-catalogue-product-accent" cx="49" cy="34" r="4" />
        </svg>
      )
    case 'water-monitoring':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="18" y="20" width="30" height="30" rx="9" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <rect x="18" y="20" width="30" height="30" rx="9" />
            <circle cx="33" cy="35" r="6" />
            <path d="M63 48c0 5-4 8-8 8s-8-3-8-8c0-5 8-15 8-15s8 10 8 15z" />
            <path className="services-catalogue-product-muted" d="M56 20c6 2 10 6 12 12M62 14c8 3 14 9 17 18" />
          </g>
          <circle className="services-catalogue-product-accent" cx="33" cy="35" r="3.5" />
        </svg>
      )
    case 'tub-cutout':
      return (
        <svg {...svgProps}>
          <path className="services-catalogue-product-fill" d="M15 35h62v10c0 7-6 12-13 12H29c-8 0-14-5-14-12z" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M15 35h62v10c0 7-6 12-13 12H29c-8 0-14-5-14-12z" />
            <path d="M24 35V19h18" />
            <path d="M48 35v15" />
            <path d="M48 35h17" />
            <path className="services-catalogue-product-muted" d="M28 20c0-6 5-9 10-6" />
          </g>
          <rect className="services-catalogue-product-accent" x="53" y="39" width="9" height="5" rx="2.5" />
        </svg>
      )
    case 'wide-doorway':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="23" y="11" width="46" height="43" rx="6" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M24 54V12h44v42" />
            <path d="M34 45h24" />
            <path d="M29 45l8-7M29 45l8 7" />
            <path d="M64 45l-8-7M64 45l-8 7" />
          </g>
          <rect className="services-catalogue-product-accent" x="41" y="19" width="10" height="24" rx="5" />
        </svg>
      )
    case 'vertical-rail':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="36" y="7" width="20" height="50" rx="10" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M46 12v40" />
            <path d="M34 21h24M34 33h24M34 45h24" />
            <path className="services-catalogue-product-muted" d="M25 13v41M67 13v41" />
          </g>
          <circle className="services-catalogue-product-accent" cx="46" cy="33" r="4" />
        </svg>
      )
    case 'bed-transfer':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="12" y="31" width="48" height="16" rx="5" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M13 47V24" />
            <path d="M13 31h47v16H13" />
            <path d="M24 47v8M57 47v8" />
            <circle cx="69" cy="20" r="6" />
            <path d="M68 27l-7 11h14" />
            <path className="services-catalogue-product-muted" d="M53 27h12M59 21l6 6-6 6" />
          </g>
          <circle className="services-catalogue-product-accent" cx="57" cy="27" r="3.5" />
        </svg>
      )
    case 'adjustable-bed':
      return (
        <svg {...svgProps}>
          <path className="services-catalogue-product-fill" d="M13 39h66v12H13z" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M13 39h66v12H13z" />
            <path d="M18 39l22-16 13 16" />
            <path d="M20 51v6M73 51v6" />
            <path className="services-catalogue-product-muted" d="M63 30h9M68 25v10" />
          </g>
          <circle className="services-catalogue-product-accent" cx="40" cy="31" r="3.5" />
        </svg>
      )
    case 'bed-alert':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="13" y="33" width="48" height="15" rx="5" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M14 48V24" />
            <path d="M14 33h47v15H14" />
            <path d="M24 48v7M58 48v7" />
            <rect x="61" y="16" width="18" height="25" rx="7" />
            <path className="services-catalogue-product-muted" d="M55 18c-4 4-4 10 0 14M50 13c-7 7-7 18 0 25" />
          </g>
          <circle className="services-catalogue-product-accent" cx="70" cy="29" r="4" />
        </svg>
      )
    case 'clear-route':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="10" y="17" width="72" height="37" rx="9" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M18 45c15-18 30 8 51-16" />
            <path d="M63 29h8v8" />
            <path className="services-catalogue-product-muted" d="M21 25h8M35 25h8M49 25h8" />
          </g>
          <circle className="services-catalogue-product-accent" cx="24" cy="45" r="4" />
          <circle className="services-catalogue-product-accent" cx="38" cy="40" r="3" />
        </svg>
      )
    case 'smoke-detector':
      return (
        <svg {...svgProps}>
          <ellipse className="services-catalogue-product-fill" cx="46" cy="16" rx="25" ry="9" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M22 16c3 6 12 9 24 9s21-3 24-9" />
            <path className="services-catalogue-product-muted" d="M34 37c-5 4-5 9 0 13M46 34c-5 5-5 12 0 17M58 37c5 4 5 9 0 13" />
          </g>
          <circle className="services-catalogue-product-accent" cx="46" cy="16" r="4" />
        </svg>
      )
    case 'motion-sensor':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="31" y="19" width="30" height="29" rx="9" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <rect x="31" y="19" width="30" height="29" rx="9" />
            <circle cx="46" cy="34" r="6" />
            <path className="services-catalogue-product-muted" d="M22 26c-6 5-6 12 0 17M70 26c6 5 6 12 0 17M15 18c-10 9-10 24 0 33M77 18c10 9 10 24 0 33" />
          </g>
          <circle className="services-catalogue-product-accent" cx="46" cy="34" r="3.5" />
        </svg>
      )
    case 'voice-speaker':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="24" y="12" width="31" height="42" rx="11" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <rect x="24" y="12" width="31" height="42" rx="11" />
            <circle cx="39.5" cy="37" r="7" />
            <path className="services-catalogue-product-muted" d="M63 25c5 5 5 12 0 17M70 18c9 9 9 24 0 33" />
          </g>
          <circle className="services-catalogue-product-accent" cx="39.5" cy="37" r="3.5" />
        </svg>
      )
    case 'emergency-button':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="21" y="13" width="50" height="40" rx="12" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <rect x="21" y="13" width="50" height="40" rx="12" />
            <circle cx="46" cy="33" r="13" />
            <path d="M46 26v14M39 33h14" />
          </g>
          <circle className="services-catalogue-product-accent" cx="46" cy="33" r="7" />
        </svg>
      )
    case 'video-doorbell':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="32" y="8" width="28" height="48" rx="9" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <rect x="32" y="8" width="28" height="48" rx="9" />
            <circle cx="46" cy="25" r="7" />
            <path d="M41 44h10" />
            <path className="services-catalogue-product-muted" d="M66 22c5 4 5 10 0 14M72 15c9 8 9 22 0 30" />
          </g>
          <circle className="services-catalogue-product-accent" cx="46" cy="25" r="3.5" />
        </svg>
      )
    case 'kitchen-tools':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="15" y="36" width="62" height="17" rx="8" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M30 13v39" />
            <path d="M23 13v12M30 13v12M37 13v12" />
            <path d="M23 25c0 6 14 6 14 0" />
            <path d="M57 13c7 10 5 20-2 25v14" />
            <path className="services-catalogue-product-muted" d="M20 52h54" />
          </g>
          <circle className="services-catalogue-product-accent" cx="56" cy="39" r="3.5" />
        </svg>
      )
    case 'hob-shutoff':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="15" y="13" width="62" height="40" rx="10" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <rect x="15" y="13" width="62" height="40" rx="10" />
            <circle cx="34" cy="29" r="8" />
            <circle cx="58" cy="29" r="8" />
            <path d="M28 45h36" />
            <path className="services-catalogue-product-muted" d="M25 15l42 38" />
          </g>
          <circle className="services-catalogue-product-accent" cx="67" cy="20" r="4" />
        </svg>
      )
    case 'reachable-storage':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="19" y="11" width="54" height="43" rx="8" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <rect x="19" y="11" width="54" height="43" rx="8" />
            <path d="M19 27h54M46 11v43" />
            <path d="M35 41h22" />
            <path className="services-catalogue-product-muted" d="M33 41l-7 7M59 41l7 7" />
          </g>
          <rect className="services-catalogue-product-accent" x="37" y="36" width="18" height="8" rx="4" />
        </svg>
      )
    case 'pull-out-storage':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="16" y="11" width="43" height="43" rx="8" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <rect x="16" y="11" width="43" height="43" rx="8" />
            <path d="M16 27h43" />
            <path d="M40 41h31v11H40z" />
            <path d="M62 35l9 6-9 6" />
          </g>
          <rect className="services-catalogue-product-accent" x="39" y="38" width="12" height="8" rx="4" />
        </svg>
      )
    case 'recliner':
      return (
        <svg {...svgProps}>
          <path className="services-catalogue-product-fill" d="M24 51h33l13-13H45V18H31l-7 19z" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M31 18h19v25H23l1-6z" />
            <path d="M24 51h33l13-13H46" />
            <path d="M29 51v6M57 51v6" />
            <path className="services-catalogue-product-muted" d="M61 28h9M66 23v10" />
          </g>
          <circle className="services-catalogue-product-accent" cx="43" cy="43" r="4" />
        </svg>
      )
    case 'furniture-anchor':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="24" y="18" width="35" height="36" rx="7" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M20 10h47" />
            <rect x="24" y="18" width="35" height="36" rx="7" />
            <path d="M24 31h35M24 43h35" />
            <path d="M59 24l9-10" />
            <path d="M64 14h8v8" />
          </g>
          <circle className="services-catalogue-product-accent" cx="42" cy="31" r="3.5" />
        </svg>
      )
    case 'entry-seat':
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="19" y="30" width="45" height="14" rx="7" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M19 30h45v14H19z" />
            <path d="M26 44v11M58 44v11" />
            <path d="M66 13v41" />
            <path d="M66 13h12" />
            <path className="services-catalogue-product-muted" d="M26 19h23M36 13v12" />
          </g>
          <circle className="services-catalogue-product-accent" cx="72" cy="34" r="3.5" />
        </svg>
      )
    case 'threshold-ramp':
      return (
        <svg {...svgProps}>
          <path className="services-catalogue-product-fill" d="M15 49h62L53 29H15z" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M15 49h62L53 29H15" />
            <path d="M20 29V11h30v18" />
            <path d="M28 42h27" />
            <path d="M48 35l8 7-8 7" />
          </g>
          <circle className="services-catalogue-product-accent" cx="25" cy="42" r="4" />
        </svg>
      )
    case 'stair-support':
      return (
        <svg {...svgProps}>
          <path className="services-catalogue-product-fill" d="M15 52h16V40h16V28h16V16h14v36z" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <path d="M15 52h16V40h16V28h16V16h14" />
            <path d="M17 30l58-16" />
            <path d="M21 33v19M50 25v27M73 18v34" />
          </g>
          <circle className="services-catalogue-product-accent" cx="47" cy="22" r="3.5" />
        </svg>
      )
    case 'generic-product':
    default:
      return (
        <svg {...svgProps}>
          <rect className="services-catalogue-product-fill" x="20" y="15" width="52" height="38" rx="10" />
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
            <rect x="20" y="15" width="52" height="38" rx="10" />
            <path d="M31 34l10 10 22-23" />
          </g>
          <circle className="services-catalogue-product-accent" cx="68" cy="18" r="4" />
        </svg>
      )
  }
}
