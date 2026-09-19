import { ArrowRight, CheckCircle2, Clock3, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SEO } from '../components/SEO'
import { getServiceAreaCitySlug, serviceAreaCities } from '../constants/serviceAreas'
import { trackEvent } from '../utils/analytics'

const siteUrl = 'https://www.casamia.com.es'

const serviceAreaCopy = {
  en: {
    seoTitle: 'CasaMia service areas in Spain',
    seoDescription:
      'See where CasaMia coordinates senior home-safety assessments, agreed adaptations, connected-living setup and grant-application support across Spain.',
    eyebrow: 'Service areas',
    title: 'Senior home safety support, coordinated city by city.',
    intro:
      'CasaMia checks the home concern, confirms what can be reviewed remotely and coordinates local visits or providers when adaptations need measurements.',
    primaryCta: 'Start your home review',
    secondaryCta: 'Ask about your area',
    mapLabel: 'Spain coverage',
    active: 'Active coordination',
    building: 'Building provider network',
    planned: 'Priority rollout',
    howTitle: 'How coverage works',
    howIntro:
      'We check postcode, room type, provider availability, measurement needs and timing before asking you to commit.',
    howItems: [
      {
        title: 'Start with the concern',
        body: 'Share the rooms, routines, photos or video that show what has become difficult, unsafe or uncertain.',
      },
      {
        title: 'Local fit checked',
        body: 'We check the room type, urgency, postcode, provider availability and whether measurements are needed before adaptations are agreed.',
      },
      {
        title: 'Review path confirmed',
        body: 'You receive a practical recommendation: remote review, expert visit, priced plan, grant preparation or staged plan.',
      },
    ],
    cityTitle: 'Priority cities',
    cityIntro:
      'Coverage expands as local teams, timing and visit availability are confirmed. If your city is not listed, you can still ask us to check it.',
    unknownTitle: 'Not listed?',
    unknownBody:
      'Send your postcode and the rooms you are worried about. We will tell you whether to start with a remote review, a visit, grant preparation or a staged plan.',
    unknownCta: 'Check my postcode',
    citySeoTitle: (city: string) => `Senior home safety services in ${city}`,
    citySeoDescription: (city: string, region: string) =>
      `CasaMia coordinates senior home-safety checks, agreed adaptations, provider availability and grant-ready notes in ${city}, ${region}.`,
    cityEyebrow: 'Local service check',
    cityPageTitle: (city: string) => `Home safety support in ${city}`,
    cityIntroPrefix: 'In',
    cityIntroSuffix:
      'CasaMia checks what should be reviewed first, what can be handled remotely and when a local visit or installation partner is needed.',
    cityFocusTitle: 'Common local priorities',
    cityProcessTitle: 'What happens locally',
    cityProcess: [
      'Start online with a guided review, photos, video, voice brief or a call.',
      'We check the home context, urgency, rooms and local visit fit.',
      'You receive a practical recommendation: remote plan, expert visit, priced plan, grant preparation or staged installation.',
    ],
    cityFaqTitle: (city: string) => `Questions people ask in ${city}`,
    cityFaqIntro:
      'Start with the concern, the rooms involved and the postcode. We will confirm whether a remote plan is enough or a local visit is needed.',
    cityFaqCta: 'Start your home review',
    cityFaqItems: (city: string) => [
      {
        question: `Can I start before my home in ${city} is ready for a visit?`,
        answer:
          'Yes. You can start with guided questions, photos, videos or a voice brief. We will confirm whether a remote plan is enough or whether a local visit is needed.',
      },
      {
        question: `Does CasaMia install directly in ${city}?`,
        answer:
          'CasaMia coordinates the path: remote review, priced plan, checked local professional, installation planning and follow-up. Local support depends on timing, agreed adaptations and confirmed availability.',
      },
      {
        question: `What happens with grants and required documents in ${city}?`,
        answer:
          'CasaMia structures the project information and likely grant fit, but public authorities decide eligibility, approval, amount and timing.',
      },
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
      'CasaMia revisa la preocupación en casa, confirma qué puede verse en remoto y coordina visitas o profesionales locales cuando las adaptaciones necesitan medidas.',
    primaryCta: 'Empezar revisión',
    secondaryCta: 'Preguntar por mi zona',
    mapLabel: 'Cobertura en España',
    active: 'Coordinación activa',
    building: 'Red en desarrollo',
    planned: 'Despliegue prioritario',
    howTitle: 'Cómo funciona la cobertura',
    howIntro:
      'No se trata solo de listar ciudades. Revisamos si el apoyo profesional, los tiempos y las adaptaciones son realistas antes de pedirte compromiso.',
    howItems: [
      {
        title: 'Empieza por la preocupación',
        body: 'Comparte estancias, rutinas, fotos o vídeo que muestren qué se ha vuelto difícil, inseguro o incierto.',
      },
      {
        title: 'Encaje local',
        body: 'Comprobamos estancia, urgencia, código postal, disponibilidad profesional y si hacen falta medidas antes de definir el plan.',
      },
      {
        title: 'Revisión confirmada',
        body: 'Recibes una recomendación práctica: revisión remota, visita experta, plan con precio, preparación de ayudas o plan por fases.',
      },
    ],
    cityTitle: 'Ciudades prioritarias',
    cityIntro:
      'La cobertura crece a medida que confirmamos equipos locales, tiempos y disponibilidad de visita. Si tu ciudad no aparece, igualmente podemos revisarla.',
    unknownTitle: '¿Tu zona no aparece?',
    unknownBody:
      'Envíanos el código postal y las estancias que te preocupan. Te indicaremos si conviene una revisión remota, una visita u otra vía de revisión.',
    unknownCta: 'Comprobar mi código postal',
    citySeoTitle: (city: string) => `Servicios de seguridad del hogar senior en ${city}`,
    citySeoDescription: (city: string, region: string) =>
      `CasaMia coordina revisiones de seguridad, adaptaciones definidas, disponibilidad profesional y notas preparadas para ayudas en ${city}, ${region}.`,
    cityEyebrow: 'Revisión local del servicio',
    cityPageTitle: (city: string) => `Seguridad en casa para mayores en ${city}`,
    cityIntroPrefix: 'En',
    cityIntroSuffix:
      'CasaMia revisa qué conviene resolver primero, qué puede verse en remoto y cuándo hace falta una visita o instalación local.',
    cityFocusTitle: 'Prioridades frecuentes en la zona',
    cityProcessTitle: 'Qué ocurre localmente',
    cityProcess: [
      'Empieza online con revisión guiada, fotos, vídeo, nota de voz o llamada.',
      'Revisamos contexto, urgencia, estancias y encaje con una visita o apoyo local.',
      'Recibes una recomendación práctica: plan remoto, visita experta, plan con precio, preparación de ayudas o instalación por fases.',
    ],
    cityFaqTitle: (city: string) => `Preguntas frecuentes en ${city}`,
    cityFaqIntro:
      'Empieza por la preocupación, las estancias y el código postal. Confirmaremos si basta con un plan remoto o si hace falta visita local.',
    cityFaqCta: 'Empezar revisión',
    cityFaqItems: (city: string) => [
      {
        question: `¿Puedo empezar si mi vivienda en ${city} aún no está lista para una visita?`,
        answer:
          'Sí. Puedes empezar con preguntas guiadas, fotos, vídeos o una nota de voz. Confirmaremos si basta con un plan remoto o si hace falta visita local.',
      },
      {
        question: `¿CasaMia instala directamente en ${city}?`,
        answer:
          'CasaMia coordina el plan: revisión remota, precio definido, profesional local revisado, planificación de instalación y seguimiento. El apoyo local depende de las adaptaciones, los tiempos y la disponibilidad confirmada.',
      },
      {
        question: `¿Qué pasa con ayudas y documentación en ${city}?`,
        answer:
          'CasaMia ordena la información del proyecto e identifica el posible encaje de ayudas, pero la administración pública decide elegibilidad, aprobación, importe y plazos.',
      },
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
    const cityFaqItems = copy.cityFaqItems(selectedCity.city)
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
        mainEntity: cityFaqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
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

        <section className="service-area-city-faq section-pad">
          <div className="site-shell service-area-city-faq-shell">
            <div className="service-area-city-faq-card">
              <div className="service-area-city-faq-copy">
                <p className="eyebrow">{selectedCity.city}</p>
                <h2>{copy.cityFaqTitle(selectedCity.city)}</h2>
                <p>{copy.cityFaqIntro}</p>
              </div>
              <div className="service-area-city-faq-list">
                {cityFaqItems.map((item) => (
                  <details key={item.question}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
              <Link
                className="service-area-city-faq-action"
                to="/home-safety-wizard"
                onClick={() => trackEvent('service_area_faq_cta_clicked', { city: selectedCity.city })}
              >
                {copy.cityFaqCta}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
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
                    {language === 'es' ? 'Ver revisión local' : 'View local check'}
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
