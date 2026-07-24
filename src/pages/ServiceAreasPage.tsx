import { ArrowRight, CheckCircle2, Clock3, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SEO } from '../components/SEO'
import { getServiceAreaCitySlug, serviceAreaCities } from '../constants/serviceAreas'
import { trackEvent } from '../utils/analytics'

const siteUrl = 'https://casamia.com.es'

const serviceAreaCopy = {
  en: {
    seoTitle: 'CasaMia service areas in Spain',
    seoDescription:
      'See where CasaMia coordinates senior home-safety assessments, practical adaptations, connected living setup and grant-support preparation across Spain.',
    eyebrow: 'Service areas',
    title: 'Senior home safety support, coordinated city by city.',
    intro:
      'CasaMia is building reliable local coverage across Spain: clear home reviews, scoped proposals, vetted provider coordination and aftercare that families can actually follow.',
    primaryCta: 'Start your home review',
    secondaryCta: 'Ask about your area',
    mapLabel: 'Spain coverage',
    active: 'Active coordination',
    building: 'Building provider network',
    planned: 'Priority rollout',
    howTitle: 'How coverage works',
    howIntro:
      'We do not simply list cities. We confirm whether the right professional support, timing and scope are realistic for the home before asking a family to commit.',
    howItems: [
      {
        title: 'Online first',
        body: 'Start with guided questions, photos, video or a call so CasaMia understands the home and the person.',
      },
      {
        title: 'Local fit checked',
        body: 'We check room type, urgency, service area, provider fit and whether a visit or measurement is needed.',
      },
      {
        title: 'Clear next step',
        body: 'You receive a practical route: remote review, paid expert visit, proposal, grant support or staged plan.',
      },
    ],
    cityTitle: 'Priority cities',
    cityIntro:
      'Coverage expands as CasaMia verifies local partners and support routes. If your city is not listed, you can still ask us to check it.',
    unknownTitle: 'Not listed?',
    unknownBody:
      'Send your postcode and the rooms you are worried about. CasaMia can confirm whether we can help remotely, coordinate a visit, or advise the best next route.',
    unknownCta: 'Check my postcode',
    citySeoTitle: (city: string) => `Senior home safety services in ${city}`,
    citySeoDescription: (city: string, region: string) =>
      `CasaMia coordinates senior home-safety reviews, practical adaptations and family support in ${city}, ${region}.`,
    cityEyebrow: 'Local service route',
    cityPageTitle: (city: string) => `Home safety support in ${city}`,
    cityIntroPrefix: 'CasaMia helps families in',
    cityIntroSuffix:
      'understand what to fix first, what can be handled remotely, and when a local visit or installation partner is the right next step.',
    cityFocusTitle: 'Common local priorities',
    cityProcessTitle: 'How we help locally',
    cityProcess: [
      'Start online with a guided review, photos, video, voice brief or a call.',
      'CasaMia checks the home context, urgency, rooms and local delivery fit.',
      'You get a clear next step: remote plan, expert visit, proposal, grant support or staged installation.',
    ],
    cityBack: 'View all service areas',
  },
  es: {
    seoTitle: 'Zonas de servicio de CasaMia en España',
    seoDescription:
      'Consulta dónde coordina CasaMia revisiones de seguridad, adaptaciones prácticas, configuración conectada y apoyo con ayudas para viviendas senior en España.',
    eyebrow: 'Zonas de servicio',
    title: 'Seguridad en casa para mayores, coordinada ciudad a ciudad.',
    intro:
      'CasaMia construye cobertura local fiable en España: revisión clara de la vivienda, propuesta definida, coordinación de profesionales y seguimiento comprensible para la familia.',
    primaryCta: 'Empezar revisión',
    secondaryCta: 'Preguntar por mi zona',
    mapLabel: 'Cobertura en España',
    active: 'Coordinación activa',
    building: 'Red en desarrollo',
    planned: 'Despliegue prioritario',
    howTitle: 'Cómo funciona la cobertura',
    howIntro:
      'No se trata solo de listar ciudades. Confirmamos si el apoyo profesional, los tiempos y el alcance son realistas antes de pedir a la familia que se comprometa.',
    howItems: [
      {
        title: 'Primero online',
        body: 'Empieza con preguntas guiadas, fotos, vídeo o llamada para entender la vivienda y la persona.',
      },
      {
        title: 'Encaje local',
        body: 'Comprobamos estancia, urgencia, zona, profesional adecuado y si hace falta visita o medición.',
      },
      {
        title: 'Siguiente paso claro',
        body: 'Recibes una ruta práctica: revisión remota, visita experta, propuesta, apoyo con ayudas o plan por fases.',
      },
    ],
    cityTitle: 'Ciudades prioritarias',
    cityIntro:
      'La cobertura crece cuando CasaMia verifica colaboradores locales y rutas de apoyo. Si tu ciudad no aparece, igualmente podemos revisarla.',
    unknownTitle: '¿Tu zona no aparece?',
    unknownBody:
      'Envíanos el código postal y las estancias que te preocupan. CasaMia puede confirmar si puede ayudar en remoto, coordinar una visita o indicar la mejor ruta.',
    unknownCta: 'Comprobar mi código postal',
    citySeoTitle: (city: string) => `Servicios de seguridad del hogar senior en ${city}`,
    citySeoDescription: (city: string, region: string) =>
      `CasaMia coordina revisiones de seguridad, adaptaciones prácticas y apoyo familiar en ${city}, ${region}.`,
    cityEyebrow: 'Ruta local de servicio',
    cityPageTitle: (city: string) => `Seguridad en casa para mayores en ${city}`,
    cityIntroPrefix: 'CasaMia ayuda a familias en',
    cityIntroSuffix:
      'a entender qué conviene resolver primero, qué puede revisarse en remoto y cuándo una visita o instalación local es el siguiente paso adecuado.',
    cityFocusTitle: 'Prioridades frecuentes en la zona',
    cityProcessTitle: 'Cómo ayudamos localmente',
    cityProcess: [
      'Empieza online con revisión guiada, fotos, vídeo, nota de voz o llamada.',
      'CasaMia revisa contexto, urgencia, estancias y encaje con la entrega local.',
      'Recibes una ruta clara: plan remoto, visita experta, propuesta, apoyo con ayudas o instalación por fases.',
    ],
    cityBack: 'Ver todas las zonas',
  },
} as const

const statusIcon = {
  active: CheckCircle2,
  building: Sparkles,
  planned: Clock3,
} as const

export function ServiceAreasPage() {
  const { citySlug } = useParams()
  const { i18n } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = serviceAreaCopy[language]
  const selectedCity = citySlug
    ? serviceAreaCities.find((area) => getServiceAreaCitySlug(area.city) === citySlug)
    : undefined

  if (citySlug && !selectedCity) {
    return <Navigate to="/service-areas" replace />
  }

  if (selectedCity) {
    const Status = statusIcon[selectedCity.status]
    const statusLabel = copy[selectedCity.status]
    const cityPath = `/service-areas/${getServiceAreaCitySlug(selectedCity.city)}`
    const citySchema = [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${siteUrl}${cityPath}#service`,
        name: copy.cityPageTitle(selectedCity.city),
        serviceType: language === 'es' ? 'Adaptación y seguridad del hogar senior' : 'Senior home safety adaptation',
        provider: { '@type': 'Organization', name: 'CasaMia', url: siteUrl },
        areaServed: {
          '@type': 'City',
          name: selectedCity.city,
          containedInPlace: selectedCity.region,
        },
        url: `${siteUrl}${cityPath}`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: copy.cityProcess.map((item) => ({
          '@type': 'Question',
          name: item,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item,
          },
        })),
      },
    ]

    return (
      <>
        <SEO
          title={copy.citySeoTitle(selectedCity.city)}
          description={copy.citySeoDescription(selectedCity.city, selectedCity.region)}
          path={cityPath}
          schema={citySchema}
        />

        <section className="service-areas-hero service-area-city-hero">
          <div className="site-shell service-area-city-hero-grid">
            <div className="service-areas-hero-copy">
              <p className="eyebrow">{copy.cityEyebrow}</p>
              <h1>{copy.cityPageTitle(selectedCity.city)}</h1>
              <p>
                {copy.cityIntroPrefix} {selectedCity.city} {copy.cityIntroSuffix}
              </p>
              <div className="service-area-city-status-card">
                <span className={`service-areas-city-status is-${selectedCity.status}`}>
                  <Status size={16} aria-hidden="true" />
                  {statusLabel}
                </span>
                <strong>{selectedCity.region}</strong>
                <p>{selectedCity.headline[language]}</p>
              </div>
              <div className="service-areas-actions">
                <Link
                  className="btn btn-green"
                  to="/home-safety-assessment"
                  onClick={() =>
                    trackEvent('assessment_booking_started', {
                      location: 'service_area_city_hero',
                      city: selectedCity.city,
                    })
                  }
                >
                  {copy.primaryCta}
                  <ArrowRight size={19} aria-hidden="true" />
                </Link>
                <Link className="btn btn-white" to="/service-areas">
                  {copy.cityBack}
                </Link>
              </div>
            </div>

            <aside className="service-area-city-panel" aria-label={copy.cityFocusTitle}>
              <span className="service-areas-map-label">{copy.cityFocusTitle}</span>
              <h2>{selectedCity.city}</h2>
              <ul>
                {selectedCity.focus[language].map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="service-areas-process section-pad bg-white">
          <div className="site-shell">
            <div className="service-areas-section-heading">
              <p className="eyebrow">{copy.cityProcessTitle}</p>
              <h2>{copy.howIntro}</h2>
            </div>
            <div className="service-areas-process-grid">
              {copy.cityProcess.map((item, index) => (
                <article className="service-areas-process-card" key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <ShieldCheck size={28} aria-hidden="true" />
                  <h3>{item}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      </>
    )
  }

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${siteUrl}/service-areas#service`,
      name: language === 'es' ? 'Zonas de servicio CasaMia' : 'CasaMia service areas',
      serviceType: language === 'es' ? 'Adaptación y seguridad del hogar senior' : 'Senior home safety adaptation',
      provider: { '@type': 'Organization', name: 'CasaMia', url: siteUrl },
      areaServed: serviceAreaCities.map((area) => ({
        '@type': 'City',
        name: area.city,
        containedInPlace: area.region,
      })),
      url: `${siteUrl}/service-areas`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: copy.howItems.map((item) => ({
        '@type': 'Question',
        name: item.title,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.body,
        },
      })),
    },
  ]

  return (
    <>
      <SEO title={copy.seoTitle} description={copy.seoDescription} path="/service-areas" schema={schema} />

      <section className="service-areas-hero">
        <div className="site-shell service-areas-hero-grid">
          <div className="service-areas-hero-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.intro}</p>
            <div className="service-areas-actions">
              <Link
                className="btn btn-green"
                to="/home-safety-assessment"
                onClick={() => trackEvent('assessment_booking_started', { location: 'service_areas_hero' })}
              >
                {copy.primaryCta}
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
              <a
                className="btn btn-white"
                href="mailto:hola@casamia.com.es?subject=CasaMia%20service%20area%20check"
                onClick={() => trackEvent('email_contact_clicked', { location: 'service_areas_hero' })}
              >
                {copy.secondaryCta}
              </a>
            </div>
          </div>

          <aside className="service-areas-map-card" aria-label={copy.mapLabel}>
            <span className="service-areas-map-label">{copy.mapLabel}</span>
            <div className="service-areas-map-orbit" aria-hidden="true">
              {serviceAreaCities.slice(0, 6).map((area) => (
                <span className={`service-areas-map-dot is-${area.status}`} key={area.city} />
              ))}
            </div>
            <div className="service-areas-map-center">
              <MapPin size={30} aria-hidden="true" />
              <strong>CasaMia</strong>
              <span>{language === 'es' ? 'España' : 'Spain'}</span>
            </div>
            <div className="service-areas-status-legend">
              <span><i className="is-active" />{copy.active}</span>
              <span><i className="is-building" />{copy.building}</span>
              <span><i className="is-planned" />{copy.planned}</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="service-areas-process section-pad bg-white">
        <div className="site-shell">
          <div className="service-areas-section-heading">
            <p className="eyebrow">{copy.howTitle}</p>
            <h2>{copy.howIntro}</h2>
          </div>
          <div className="service-areas-process-grid">
            {copy.howItems.map((item, index) => (
              <article className="service-areas-process-card" key={item.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <ShieldCheck size={28} aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="service-areas-city-section section-pad">
        <div className="site-shell service-areas-city-layout">
          <div className="service-areas-city-intro">
            <p className="eyebrow">{copy.cityTitle}</p>
            <h2>{copy.cityIntro}</h2>
            <div className="service-areas-not-listed">
              <strong>{copy.unknownTitle}</strong>
              <p>{copy.unknownBody}</p>
              <a
                className="btn btn-navy"
                href="mailto:hola@casamia.com.es?subject=CasaMia%20postcode%20coverage%20check"
                onClick={() => trackEvent('email_contact_clicked', { location: 'service_areas_postcode' })}
              >
                {copy.unknownCta}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="service-areas-city-grid">
            {serviceAreaCities.map((area) => {
              const Status = statusIcon[area.status]
              const statusLabel = copy[area.status]

              return (
                <article className={`service-areas-city-card is-${area.status}`} key={area.city}>
                  <div>
                    <span className="service-areas-city-status">
                      <Status size={16} aria-hidden="true" />
                      {statusLabel}
                    </span>
                    <h3>{area.city}</h3>
                    <p>{area.region}</p>
                  </div>
                  <p>{area.headline[language]}</p>
                  <ul>
                    {area.focus[language].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Link className="service-areas-city-link" to={`/service-areas/${getServiceAreaCitySlug(area.city)}`}>
                    {language === 'es' ? 'Ver ruta local' : 'View local route'}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
