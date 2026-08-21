import {
  ArrowRight,
  BadgeEuro,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  Menu,
  SearchCheck,
  UserRoundCheck,
  X,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LocalizedLink as Link } from '../components/LocalizedLink'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { CASAMIA_CONTACT_PHONE, CASAMIA_WHATSAPP_URL } from '../constants/contact'
import { trackEvent } from '../utils/analytics'

import '../styles/grant-support-spain.css'

const phoneHref = CASAMIA_CONTACT_PHONE ? `tel:${CASAMIA_CONTACT_PHONE.replace(/\s+/g, '')}` : ''
const whatsappHref = CASAMIA_WHATSAPP_URL

const stepIcons = [
  <SearchCheck size={24} />,
  <FileCheck2 size={24} />,
  <UserRoundCheck size={24} />,
  <ClipboardCheck size={24} />,
] as const

const grantSupportCopy = {
  en: {
    seoTitle: 'Home adaptation grants in Spain',
    seoDescription:
      'CasaMia helps families in Spain review possible home adaptation grants, prepare documents and connect grant readiness with a practical home safety plan.',
    seoPath: '/grants',
    menuLabel: 'Menu',
    phoneLabel: 'Call',
    whatsappLabel: 'WhatsApp',
    primaryCta: 'Start review',
    navItems: [
      { id: 'ayudas-disponibles', label: 'Available grants' },
      { id: 'fuentes-oficiales', label: 'Official sources' },
      { id: 'recursos', label: 'Resources' },
      { id: 'catalogo-servicios', label: 'Service catalogue' },
      { id: 'contacto', label: 'Contact' },
    ],
    hero: {
      eyebrow: 'Home adaptation grants',
      title: 'Your home may qualify for support.',
      body:
        'Across Spain, public programmes can help with accessibility, bathroom adaptations, mobility, dependency and safer living at home. CasaMia helps identify the likely route, prepare the right documents and connect the grant file to a realistic adaptation plan.',
      primary: 'Start grant review',
      secondary: 'See official references',
    },
    imageAlt: 'Euro symbol for public grant support and home adaptation funding',
    fundingAria: 'Grant support summary',
    fundingTitle: 'Accessibility grants in Spain',
    fundingBody: 'Up to €13,000 per home under the 2026-2030 national housing plan reference.',
    proofAria: 'CasaMia grant support summary',
    proofCards: [
      ['Up to €13,000', 'National reference amount for eligible accessibility works.'],
      ['Local route review', 'State, regional, municipal and social-services channels checked.'],
      ['File-ready scope', 'Documents, quote and adaptation scope prepared before applying.'],
    ],
    promise: {
      eyebrow: 'Main point',
      title: 'Grant support only helps when the case is prepared properly.',
      body:
        'CasaMia turns a broad funding question into a practical route: what may apply, what evidence is missing, what should be quoted and what the family should not assume before approval.',
    },
    process: {
      eyebrow: 'Step-by-step guide',
      title: 'How to make a grant route usable.',
      lead: 'A simple process: identify the route, prepare the file and connect it to a workable home adaptation.',
      callout:
        'CasaMia supports the process from first orientation to documentation, technical review and adaptation proposal.',
    },
    steps: [
      {
        title: 'Identify the likely route',
        body: 'CasaMia reviews the person, home, region and family situation to point toward the most relevant programme.',
      },
      {
        title: 'Prepare the application file',
        body: 'We help organise the data, forms and documents normally required before a family commits to works.',
      },
      {
        title: 'Coordinate technical review',
        body: 'Where needed, we help connect the home assessment, measurements or technical evidence to the grant file.',
      },
      {
        title: 'Build the adaptation quote',
        body: 'CasaMia prepares a clear proposal so eligible works, costs and timing are easier to understand.',
      },
    ],
    official: {
      eyebrow: 'Official sources',
      title: 'Public references.',
      action: 'Check source',
      references: [
        {
          source: 'MIVAU',
          title: '2026-2030 National Housing Plan',
          body: 'The ministry references accessibility support of up to €13,000 per home.',
          href: 'https://www.mivau.gob.es/vivienda/info-plan-estatal-de-vivienda-2026-2030',
        },
        {
          source: 'BOE',
          title: 'Home accessibility programme',
          body: 'The national framework includes actions that improve accessibility in and to homes.',
          href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-802',
        },
        {
          source: 'BOE',
          title: 'Bathrooms, kitchens and home support',
          body: 'Interior adaptations, bathrooms, kitchens, home automation and support products may be relevant.',
          href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-802#d1e2062',
        },
        {
          source: 'BOE',
          title: 'Higher support for priority cases',
          body: 'Some programmes allow higher support where older people or people with disabilities live in the home.',
          href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-802#d1e2082',
        },
      ],
    },
    resources: {
      eyebrow: 'Recommended resources',
      title: 'Next step.',
      action: 'View resource',
      cards: [
        [
          'Practical guide',
          'Home adaptation grants in Spain: what families should prepare',
          'Documents, scope, requirements and realistic expectations.',
          '/blog/home-adaptation-grants-spain-family-guide',
        ],
        [
          'Tool',
          'Initial grant review',
          'An indicative route and missing-document check in a few minutes.',
          '/grant-check',
        ],
        [
          'CasaMia plan',
          'Create an adaptation plan',
          'Connect possible support with real services from the catalogue.',
          '/plans',
        ],
      ],
    },
    services: {
      eyebrow: 'Service catalogue',
      title: 'Related CasaMia services.',
      items: [
        'Grant route review',
        'Home safety assessment',
        'Accessibility report',
        'Adaptation design',
        'Grant-ready quotation',
        'Technical coordination',
        'Document preparation',
        'Permission planning',
        'Managed installation',
        'Application follow-up',
        'Cost evidence support',
        'Post-project aftercare',
      ],
    },
    final: {
      title: 'Request an initial review.',
      body: 'We identify the most likely grant route and the documents worth preparing before you move forward.',
      primary: 'Start review',
      phoneCta: 'Talk to CasaMia',
      note:
        'The review is indicative. Approval and final amounts depend on requirements, deadlines, available budget and the decision of the relevant public authority.',
    },
    schema: {
      home: 'Home',
      pageName: 'Home adaptation grants in Spain',
      serviceName: 'Home adaptation grant review',
      serviceType: 'Home accessibility grant guidance in Spain',
    },
    faqs: [
      ['Are there grants for people over 60?', 'Yes. Some programmes use age thresholds such as 60 or 65, alongside disability, dependency, mobility, income and accessibility criteria.'],
      ['Can every older person apply?', 'Many older people may have a possible route, but the specific grant depends on region, municipality, home, income, work type and open calls.'],
      ['Can a bathtub-to-shower change be supported?', 'Often yes. Bathroom adaptation is one of the common work types in accessibility and functional adaptation programmes.'],
      ['Can a stairlift be included?', 'Often yes. Stairlifts, platforms and mobility solutions may appear in regional, municipal or accessibility programmes.'],
      ['Can a tenant apply?', 'In many cases yes, if the home is the habitual residence and written owner approval is available when required.'],
      ['Does CasaMia guarantee approval?', 'No. CasaMia helps identify routes, prepare the case and support the process. The final decision belongs to the public authority.'],
    ],
  },
  es: {
    seoTitle: 'Ayudas para adaptar vivienda de personas mayores en España',
    seoDescription:
      'En toda España existen subvenciones y programas públicos para ayudar a personas mayores, con discapacidad, dependencia o movilidad reducida a adaptar su vivienda. CasaMia identifica la ayuda adecuada y coordina todo el proceso.',
    seoPath: '/es/grants',
    menuLabel: 'Menú',
    phoneLabel: 'Llamar',
    whatsappLabel: 'WhatsApp',
    primaryCta: 'Iniciar revisión',
    navItems: [
      { id: 'ayudas-disponibles', label: 'Ayudas disponibles' },
      { id: 'fuentes-oficiales', label: 'Fuentes oficiales' },
      { id: 'recursos', label: 'Recursos' },
      { id: 'catalogo-servicios', label: 'Catálogo servicios' },
      { id: 'contacto', label: 'Contacto' },
    ],
    hero: {
      eyebrow: 'Ayudas para adaptar viviendas',
      title: 'Tu hogar puede adaptarse. Y existen ayudas para hacerlo.',
      body:
        'En toda España existen subvenciones y programas públicos para ayudar a personas mayores, con discapacidad, dependencia o movilidad reducida a adaptar su vivienda. CasaMia identifica la ayuda adecuada y coordina todo el proceso.',
      primary: 'Iniciar revisión',
      secondary: 'Ver referencias oficiales',
    },
    imageAlt: 'Símbolo del euro para ayudas y financiación pública',
    fundingAria: 'Resumen de ayudas',
    fundingTitle: 'Ayudas de accesibilidad en España',
    fundingBody: 'Hasta 13.000 € por vivienda en el Plan Estatal 2026-2030.',
    proofAria: 'Resumen de servicio CasaMia',
    proofCards: [
      ['Hasta 13.000 €', 'Referencia estatal para obras de accesibilidad.'],
      ['Gestión territorial', 'Convocatorias estatales, autonómicas, municipales y sociales.'],
      ['Expediente preparado', 'Documentos, presupuesto y alcance antes de solicitar.'],
    ],
    promise: {
      eyebrow: 'Mensaje principal',
      title: 'Existen ayudas para adaptar el hogar de las personas mayores.',
      body:
        'En España, las administraciones públicas ofrecen subvenciones y programas para mejorar la accesibilidad, eliminar barreras y permitir que las personas mayores continúen viviendo en casa con seguridad e independencia.',
    },
    process: {
      eyebrow: 'Guía paso a paso',
      title: 'Cómo aprovechar una ayuda.',
      lead: 'Un proceso sencillo: identificar la ayuda, preparar la solicitud y convertirla en una reforma viable.',
      callout:
        'CasaMia acompaña el proceso de principio a fin: orientación, documentación, inspección técnica y presupuesto de reforma.',
    },
    steps: [
      {
        title: 'Identificamos la ayuda adecuada',
        body: 'CasaMia revisa tu perfil, vivienda, región y situación familiar para orientar la vía más probable.',
      },
      {
        title: 'Preparamos la solicitud',
        body: 'Te ayudamos a reunir los datos, completar formularios y presentar la documentación requerida.',
      },
      {
        title: 'Coordinamos la revisión técnica',
        body: 'Cuando haga falta, te ayudamos a encontrar el técnico o inspector adecuado para validar la vivienda.',
      },
      {
        title: 'Emitimos el presupuesto de reforma',
        body: 'CasaMia prepara una propuesta clara para adaptar el hogar y respaldar el expediente de ayuda.',
      },
    ],
    official: {
      eyebrow: 'Fuentes oficiales',
      title: 'Referencias públicas.',
      action: 'Consultar fuente',
      references: [
        {
          source: 'MIVAU',
          title: 'Plan Estatal de Vivienda 2026-2030',
          body: 'El Ministerio recoge ayudas de accesibilidad de hasta 13.000 euros por vivienda.',
          href: 'https://www.mivau.gob.es/vivienda/info-plan-estatal-de-vivienda-2026-2030',
        },
        {
          source: 'BOE',
          title: 'Programa de accesibilidad en viviendas',
          body: 'El Plan Estatal regula actuaciones para mejorar la accesibilidad en y a las viviendas.',
          href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-802',
        },
        {
          source: 'BOE',
          title: 'Baños, cocinas y apoyo en casa',
          body: 'Incluye adaptaciones interiores, baños, cocinas, domótica y productos de apoyo.',
          href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-802#d1e2062',
        },
        {
          source: 'BOE',
          title: 'Mayor intensidad para casos prioritarios',
          body: 'Prevé porcentajes superiores para viviendas con personas mayores o con discapacidad.',
          href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-802#d1e2082',
        },
      ],
    },
    resources: {
      eyebrow: 'Recursos recomendados',
      title: 'Siguiente paso.',
      action: 'Ver recurso',
      cards: [
        [
          'Guía práctica',
          'Ayudas para adaptar viviendas en España: qué debe preparar una familia',
          'Documentos, alcance, requisitos y expectativas realistas.',
          '/blog/home-adaptation-grants-spain-family-guide',
        ],
        [
          'Herramienta',
          'Revisión inicial de ayudas',
          'Ruta orientativa y documentos pendientes en unos minutos.',
          '/grant-check',
        ],
        [
          'Plan CasaMia',
          'Crear un plan de adaptación',
          'Conecta la posible ayuda con servicios reales del catálogo.',
          '/plans',
        ],
      ],
    },
    services: {
      eyebrow: 'Catálogo de servicios',
      title: 'Servicios CasaMia relacionados.',
      items: [
        'Revisión de ayudas',
        'Evaluación del hogar',
        'Informe de accesibilidad',
        'Diseño de adaptación',
        'Presupuesto subvencionable',
        'Coordinación técnica',
        'Preparación documental',
        'Gestión de autorizaciones',
        'Ejecución de la reforma',
        'Seguimiento del expediente',
        'Justificación de gastos',
        'Servicio post-reforma',
      ],
    },
    final: {
      title: 'Solicita una revisión inicial.',
      body: 'Identificamos la vía de ayuda más probable y qué documentación conviene preparar antes de avanzar.',
      primary: 'Iniciar revisión',
      phoneCta: 'Hablar con CasaMia',
      note:
        'La revisión es orientativa. La concesión y el importe final dependen de requisitos, plazos, disponibilidad presupuestaria y resolución de la administración competente.',
    },
    schema: {
      home: 'Inicio',
      pageName: 'Ayudas para adaptar vivienda',
      serviceName: 'Revisión de ayudas para adaptar vivienda',
      serviceType: 'Ayudas accesibilidad vivienda España',
    },
    faqs: [
      ['¿Hay ayudas para mayores de 60 años?', 'Sí. Existen programas que utilizan los 60 o 65 años como criterio, además de ayudas relacionadas con discapacidad, dependencia, movilidad, ingresos y accesibilidad.'],
      ['¿Todas las personas mayores pueden solicitar una ayuda?', 'Muchas personas mayores pueden acceder a alguna vía de apoyo. La ayuda concreta depende de la comunidad autónoma, municipio, vivienda, ingresos, tipo de obra y convocatoria disponible.'],
      ['¿Puedo recibir ayuda para cambiar la bañera por una ducha?', 'Sí. La adaptación del baño es una de las actuaciones más habituales en los programas de adaptación funcional y accesibilidad.'],
      ['¿Puedo recibir ayuda para un salvaescaleras?', 'Sí. Los salvaescaleras, plataformas y otras soluciones de movilidad pueden incluirse en programas regionales, municipales o de accesibilidad.'],
      ['¿Puede solicitarla un inquilino?', 'Sí, en muchos casos, siempre que la vivienda sea habitual y exista autorización escrita del propietario cuando sea necesaria.'],
      ['¿CasaMia garantiza la concesión?', 'CasaMia identifica programas, prepara el caso y ayuda durante todo el proceso. La resolución final corresponde a la administración pública.'],
    ],
  },
} as const

export function GrantSupportSpainPage() {
  const { i18n } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = grantSupportCopy[language]
  const [menuOpen, setMenuOpen] = useState(false)
  const schema = useMemo(() => buildGrantSchema(copy), [copy])

  return (
    <>
      <SEO
        title={copy.seoTitle}
        description={copy.seoDescription}
        path={copy.seoPath}
        image="/images/blog/grants-euro-symbol.jpg"
        schema={schema}
      />
      <div className="grant-spain-page">
        <header className="grant-spain-subnav">
          <a className="grant-spain-logo" href="#top">CasaMia</a>
          <button
            className="grant-spain-menu"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="grant-spain-links"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
            {copy.menuLabel}
          </button>
          <nav id="grant-spain-links" className={menuOpen ? 'is-open' : ''}>
            {copy.navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </nav>
          {phoneHref ? (
            <a className="grant-spain-call" href={phoneHref} onClick={() => trackEvent('grant_call_clicked')}>
              {copy.phoneLabel}
            </a>
          ) : null}
          <Link className="grant-spain-primary" to="/grant-check" onClick={() => trackEvent('grant_checker_started')}>
            {copy.primaryCta}
          </Link>
        </header>

        <section className="grant-spain-hero" id="top">
          <div className="site-shell grant-spain-hero-grid">
            <div className="grant-spain-hero-copy">
              <p className="grant-spain-kicker">{copy.hero.eyebrow}</p>
              <h1>{copy.hero.title}</h1>
              <p>{copy.hero.body}</p>
              <div className="grant-spain-actions">
                <Link className="grant-spain-button" to="/grant-check" onClick={() => trackEvent('grant_cta_clicked', { cta: 'hero_checker' })}>
                  {copy.hero.primary} <ArrowRight size={18} />
                </Link>
                <a className="grant-spain-button is-secondary" href="#fuentes-oficiales">
                  {copy.hero.secondary}
                </a>
              </div>
            </div>
            <div className="grant-spain-hero-visual">
              <SafeImage
                src="/images/blog/grants-euro-symbol.jpg"
                alt={copy.imageAlt}
                className="grant-spain-hero-image"
                imgClassName="grant-spain-hero-img"
                loading="eager"
              />
              <div className="grant-spain-hero-funding-card" aria-label={copy.fundingAria}>
                <span><BadgeEuro size={24} aria-hidden="true" /></span>
                <div>
                  <strong>{copy.fundingTitle}</strong>
                  <small>{copy.fundingBody}</small>
                </div>
              </div>
            </div>
          </div>
          <div className="site-shell grant-spain-hero-proof" aria-label={copy.proofAria}>
            {copy.proofCards.map(([title, body]) => (
              <article key={title}>
                <CheckCircle2 size={20} aria-hidden="true" />
                <strong>{title}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grant-spain-promise" aria-labelledby="grant-spain-promise-title">
          <div className="site-shell grant-spain-promise-grid">
            <div>
              <p className="grant-spain-kicker">{copy.promise.eyebrow}</p>
              <h2 id="grant-spain-promise-title">{copy.promise.title}</h2>
            </div>
            <p>{copy.promise.body}</p>
          </div>
        </section>

        <Section id="ayudas-disponibles" eyebrow={copy.process.eyebrow} title={copy.process.title}>
          <p className="grant-spain-lead">{copy.process.lead}</p>
          <div className="grant-spain-step-grid">
            {copy.steps.map((card, index) => (
              <StepCard key={card.title} step={index + 1} icon={stepIcons[index]} {...card} />
            ))}
          </div>
          <div className="grant-spain-callout">{copy.process.callout}</div>
        </Section>

        <Section id="fuentes-oficiales" eyebrow={copy.official.eyebrow} title={copy.official.title}>
          <div className="grant-spain-official-grid">
            {copy.official.references.map((item) => (
              <a className="grant-spain-official-card" href={item.href} key={item.title} rel="noreferrer" target="_blank">
                <span>{item.source}</span>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <small>{copy.official.action} <ExternalLink size={15} aria-hidden="true" /></small>
              </a>
            ))}
          </div>
        </Section>

        <Section id="recursos" eyebrow={copy.resources.eyebrow} title={copy.resources.title}>
          <div className="grant-spain-resource-grid">
            {copy.resources.cards.map(([eyebrow, title, body, to]) => (
              <Link className="grant-spain-resource-card" key={title} to={to}>
                <span>{eyebrow}</span>
                <strong>{title}</strong>
                <p>{body}</p>
                <small>{copy.resources.action} <ArrowRight size={16} aria-hidden="true" /></small>
              </Link>
            ))}
          </div>
        </Section>

        <Section id="catalogo-servicios" eyebrow={copy.services.eyebrow} title={copy.services.title}>
          <div className="grant-spain-pill-grid">
            {copy.services.items.map((item) => <span key={item}><CheckCircle2 size={16} />{item}</span>)}
          </div>
        </Section>

        <section className="grant-spain-final" id="contacto">
          <div className="site-shell">
            <h2>{copy.final.title}</h2>
            <p>{copy.final.body}</p>
            <div className="grant-spain-actions">
              <Link className="grant-spain-button" to="/grant-check">{copy.final.primary}</Link>
              {phoneHref ? (
                <a className="grant-spain-button is-secondary" href={phoneHref}>{copy.final.phoneCta}</a>
              ) : null}
            </div>
            <small>{copy.final.note}</small>
          </div>
        </section>

        {phoneHref || whatsappHref ? (
          <div className="grant-spain-mobile-ctas">
            {phoneHref ? <a href={phoneHref}>{copy.phoneLabel}</a> : null}
            {whatsappHref ? <a href={whatsappHref}>{copy.whatsappLabel}</a> : null}
          </div>
        ) : null}
      </div>
    </>
  )
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: ReactNode }) {
  return <section className="grant-spain-section" id={id}><div className="site-shell"><p className="grant-spain-kicker">{eyebrow}</p><h2>{title}</h2>{children}</div></section>
}

function StepCard({ icon, step, title, body }: { icon: ReactNode; step: number; title: string; body: string }) {
  return (
    <article className="grant-spain-step-card">
      <div className="grant-spain-step-card-top">
        <span>{icon}</span>
        <strong>{String(step).padStart(2, '0')}</strong>
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  )
}

function buildGrantSchema(copy: (typeof grantSupportCopy)['en'] | (typeof grantSupportCopy)['es']) {
  const path = `https://casamia.com.es${copy.seoPath}`
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: copy.schema.home, item: 'https://casamia.com.es/' },
        { '@type': 'ListItem', position: 2, name: copy.schema.pageName, item: path },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: copy.schema.serviceName,
      serviceType: copy.schema.serviceType,
      areaServed: 'Spain',
      provider: { '@id': 'https://casamia.com.es/#organization' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: copy.faqs.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ]
}
