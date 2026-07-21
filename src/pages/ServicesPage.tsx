import {
  ArrowRight,
  Bath,
  BedDouble,
  CheckCircle2,
  CookingPot,
  DoorOpen,
  Footprints,
  Home,
  Lightbulb,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SampleReportPreview } from '../components/SampleReportPreview'
import { SafeImage } from '../components/SafeImage'
import { SEO } from '../components/SEO'
import {
  getServicesForPackageArea,
} from '../services/serviceCatalogue'
import { useLocalizedServiceCatalogue } from '../services/serviceCatalogueLocalization'
import type { CasaMiaService, ServicePackageArea } from '../types/serviceCatalogue'
import '../styles/services-catalogue.css'

type CatalogueGroupId = ServicePackageArea | 'other'

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

type ServicesPageCopy = {
  seoTitle: string
  seoDescription: string
  heroEyebrow: string
  heroTitle: string
  heroBody: string
  browseCta: string
  planCta: string
  catalogueLabel: string
  currentOptions: string
  activeServices: string
  packageAreas: string
  inclusionsVisible: string
  homeVisualTitle: string
  homeVisualIntro: string
  sectionEyebrow: string
  sectionTitle: string
  sectionBody: string
  packageNavigation: string
  optionSingular: string
  optionPlural: string
  tailoredQuote: string
  selectedEyebrow: string
  packageOptions: string
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

const catalogueAreas: CatalogueAreaDefinition[] = [
  {
    id: 'bathroom',
    icon: Bath,
    image: '/images/solutions/bathroom-safety.jpg',
    title: { en: 'Safer bathroom', es: 'Baño seguro' },
    description: {
      en: 'Safer transfers, showering, toileting, grip and night-time access.',
      es: 'Transferencias, ducha, aseo, agarre y acceso nocturno más seguros.',
    },
  },
  {
    id: 'bedroom',
    icon: BedDouble,
    image: '/images/before-after/bedroom-after-card.webp',
    title: { en: 'Restful bedroom', es: 'Dormitorio tranquilo' },
    description: {
      en: 'Bed transfers, bedside reach, lighting and safer night routes.',
      es: 'Transferencias, alcance, iluminación y rutas nocturnas más seguras.',
    },
  },
  {
    id: 'kitchen',
    icon: CookingPot,
    image: '/images/solutions/casamia-staff-kitchen-consultation.webp',
    title: { en: 'Confident kitchen', es: 'Cocina cómoda' },
    description: {
      en: 'Safer reach, preparation, appliances, water and everyday routines.',
      es: 'Alcance, preparación, electrodomésticos, agua y rutinas más seguras.',
    },
  },
  {
    id: 'living-room',
    icon: Home,
    image: '/images/before-after/living-after-home.webp',
    title: { en: 'Comfortable movement', es: 'Movimiento cómodo' },
    description: {
      en: 'Clearer routes through furniture, rugs, cables and daily-use spaces.',
      es: 'Rutas más despejadas entre muebles, alfombras, cables y zonas de uso diario.',
    },
  },
  {
    id: 'stairs',
    icon: Footprints,
    image: '/images/solutions/stairs-hallways.jpg',
    title: { en: 'Steady stairs', es: 'Escaleras seguras' },
    description: {
      en: 'Handrails, grip, contrast and lighting for changes of level.',
      es: 'Pasamanos, agarre, contraste e iluminación para cambios de nivel.',
    },
  },
  {
    id: 'entrance',
    icon: DoorOpen,
    image: '/images/solutions/entrance-access.jpg',
    title: { en: 'Easy entrance', es: 'Entrada fácil' },
    description: {
      en: 'Thresholds, steps, access, lighting and support at the door.',
      es: 'Umbrales, escalones, acceso, iluminación y apoyo junto a la puerta.',
    },
  },
  {
    id: 'outdoor',
    icon: MapPin,
    image: '/images/before-after/outdoor-after.jpg',
    title: { en: 'Safer outdoors', es: 'Exterior seguro' },
    description: {
      en: 'Paths, exterior steps, lighting and the route to the entrance.',
      es: 'Caminos, escalones, iluminación y la ruta hasta la entrada.',
    },
  },
  {
    id: 'lighting',
    icon: Lightbulb,
    image: '/images/service-gallery/03-stairway-and-hallway-support.jpg',
    title: { en: 'Comfort lighting', es: 'Luz de confort' },
    description: {
      en: 'Task, motion and night-route lighting where visibility matters.',
      es: 'Iluminación de trabajo, movimiento y rutas nocturnas donde más importa.',
    },
  },
  {
    id: 'smart-safety',
    icon: ShieldCheck,
    image: '/images/before-after/smart-after.jpg',
    title: { en: 'Connected comfort', es: 'Confort conectado' },
    description: {
      en: 'Compatible alerts, sensors, voice support and family handover.',
      es: 'Alertas, sensores, apoyo por voz y configuración para la familia.',
    },
  },
]

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

const homeVisualSlides: Array<{ areaId: ServicePackageArea; image: string }> = [
  { areaId: 'bedroom', image: '/images/service-gallery/isometric/isometric-bedroom.jpg' },
  { areaId: 'living-room', image: '/images/service-gallery/isometric/isometric-living.jpg' },
  { areaId: 'kitchen', image: '/images/service-gallery/isometric/isometric-kitchen.jpg' },
  { areaId: 'outdoor', image: '/images/service-gallery/isometric/isometric-exterior.jpg' },
  { areaId: 'bathroom', image: '/images/service-gallery/isometric/isometric-bathroom.jpg' },
]

const servicesPageCopy: Record<'en' | 'es', ServicesPageCopy> = {
  en: {
    seoTitle: 'CasaMia Home Safety Service Catalogue',
    seoDescription: 'Explore CasaMia home safety services and current inclusions by room and safety area.',
    heroEyebrow: 'CasaMia service catalogue',
    heroTitle: 'Every safer-home option, clearly organised.',
    heroBody: 'Choose an area to see the active services CasaMia can assess, supply, install or coordinate. Your confirmed proposal is prepared after we understand the home.',
    browseCta: 'Browse package areas',
    planCta: 'Build my safer home',
    catalogueLabel: 'Current catalogue',
    currentOptions: 'service options available now',
    activeServices: 'Active services',
    packageAreas: 'Package areas',
    inclusionsVisible: 'Inclusions shown',
    homeVisualTitle: 'One home, every key area covered.',
    homeVisualIntro: 'Browse services by the spaces people use every day.',
    sectionEyebrow: 'Choose a package area',
    sectionTitle: 'See exactly what CasaMia can include.',
    sectionBody: 'Select an area to review the current service components and delivery requirements. Final recommendations are confirmed after your proposal request.',
    packageNavigation: 'CasaMia package areas',
    optionSingular: 'option',
    optionPlural: 'options',
    tailoredQuote: 'Tailored quote',
    selectedEyebrow: 'Current package',
    packageOptions: 'current options',
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
    heroTitle: 'Todas las opciones para un hogar más seguro, bien organizadas.',
    heroBody: 'Elige un área para ver los servicios activos que CasaMia puede evaluar, suministrar, instalar o coordinar. La propuesta confirmada se prepara cuando entendemos la vivienda.',
    browseCta: 'Ver áreas de servicio',
    planCta: 'Crear mi hogar más seguro',
    catalogueLabel: 'Catálogo actual',
    currentOptions: 'opciones de servicio disponibles',
    activeServices: 'Servicios activos',
    packageAreas: 'Áreas de servicio',
    inclusionsVisible: 'Inclusiones visibles',
    homeVisualTitle: 'Una casa, cada zona clave cubierta.',
    homeVisualIntro: 'Explora los servicios por los espacios que se usan a diario.',
    sectionEyebrow: 'Elige un área',
    sectionTitle: 'Consulta exactamente qué puede incluir CasaMia.',
    sectionBody: 'Selecciona un área para revisar sus componentes actuales y requisitos de instalación. Las recomendaciones finales se confirman después de solicitar propuesta.',
    packageNavigation: 'Áreas de servicio CasaMia',
    optionSingular: 'opción',
    optionPlural: 'opciones',
    tailoredQuote: 'Presupuesto a medida',
    selectedEyebrow: 'Área actual',
    packageOptions: 'opciones actuales',
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
    service.requiresInstallation ? copy.requirements.installation : null,
    service.requiresMeasurement ? copy.requirements.measurement : null,
    service.requiresSiteVisit ? copy.requirements.visit : null,
    service.requiresCompatibilityCheck ? copy.requirements.compatibility : null,
  ].filter((item): item is string => Boolean(item))
}

export function ServicesPage() {
  const { i18n } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = servicesPageCopy[language]
  const catalogue = useLocalizedServiceCatalogue(i18n.language)
  const [selectedGroupId, setSelectedGroupId] = useState<CatalogueGroupId>('bathroom')
  const activeServices = useMemo(
    () => catalogue.services.filter((service) => service.active),
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
  }, [activeServices])
  const selectedGroup = serviceGroups.find((group) => group.area.id === selectedGroupId) ?? serviceGroups[0]
  const SelectedIcon = selectedGroup?.area.icon ?? PackageCheck
  const heroSlides = homeVisualSlides
    .map(({ areaId, image }) => {
      const area = serviceGroups.find((item) => item.area.id === areaId)?.area
        ?? catalogueAreas.find((item) => item.id === areaId)

      return area ? { area, image } : null
    })
    .filter((item): item is { area: CatalogueAreaDefinition; image: string } => Boolean(item))

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
            name: service.name,
            description: service.shortDescription,
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
              <a className="btn btn-green" href="#catalogue-packages">
                {copy.browseCta}
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              <Link className="btn btn-white" to="/home-safety-wizard">
                {copy.planCta}
              </Link>
            </div>
          </div>

          <aside className="services-catalogue-home-visual" aria-label={copy.homeVisualTitle}>
            <div className="services-catalogue-home-rotator" aria-hidden="true">
              {heroSlides.map(({ area, image }) => (
                <figure className="services-catalogue-home-slide" key={area.id}>
                  <SafeImage
                    alt={area.title[language]}
                    className="services-catalogue-home-slide-media"
                    imgClassName="services-catalogue-home-slide-image"
                    loading="eager"
                    src={image}
                  />
                  <figcaption className="services-catalogue-home-slide-caption">
                    <span>{area.title[language]}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <SampleReportPreview />

      <section className="services-catalogue-section" id="catalogue-packages">
        <div className="site-shell">
          <header className="services-catalogue-heading">
            <p className="eyebrow">{copy.sectionEyebrow}</p>
            <h2>{copy.sectionTitle}</h2>
            <p>{copy.sectionBody}</p>
          </header>

          {serviceGroups.length ? (
            <div className="services-catalogue-explorer">
              <nav className="services-catalogue-nav" aria-label={copy.packageNavigation}>
                {serviceGroups.map((group) => {
                  const Icon = group.area.icon
                  const isSelected = group.area.id === selectedGroup?.area.id

                  return (
                    <button
                      aria-controls="active-service-package"
                      aria-pressed={isSelected}
                      className={`services-catalogue-nav-item${isSelected ? ' is-selected' : ''}`}
                      key={group.area.id}
                      onClick={() => setSelectedGroupId(group.area.id)}
                      type="button"
                    >
                      <span className="services-catalogue-nav-icon"><Icon size={23} aria-hidden="true" /></span>
                      <span className="services-catalogue-nav-copy">
                        <strong>{group.area.title[language]}</strong>
                        <small>
                          {group.services.length} {group.services.length === 1 ? copy.optionSingular : copy.optionPlural}
                        </small>
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
                        <p>{copy.selectedEyebrow} · {selectedGroup.services.length} {copy.packageOptions}</p>
                        <h2 id="active-service-package-title">{selectedGroup.area.title[language]}</h2>
                        <span>{selectedGroup.area.description[language]}</span>
                      </div>
                    </div>
                  </header>

                  <div className="services-catalogue-service-grid">
                    {selectedGroup.services.map((service) => {
                      const requirements = getRequirementLabels(service, copy)

                      return (
                        <article className="services-catalogue-service" key={service.id}>
                          <header>
                            <div>
                              <small>{service.category}</small>
                              <h3>{service.name}</h3>
                            </div>
                          </header>

                          <p className="services-catalogue-service-description">{service.shortDescription}</p>
                          <div className="services-catalogue-service-benefit">
                            <Sparkles size={18} aria-hidden="true" />
                            <div>
                              <strong>{copy.customerBenefit}</strong>
                              <p>{service.customerBenefit}</p>
                            </div>
                          </div>

                          {service.includedItems?.length ? (
                            <div className="services-catalogue-inclusions">
                              <strong>{copy.included}</strong>
                              <ul>
                                {service.includedItems?.map((item) => (
                                  <li key={item}>
                                    <CheckCircle2 size={16} aria-hidden="true" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
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
    </>
  )
}
