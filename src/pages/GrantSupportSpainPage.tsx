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
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { CASAMIA_CONTACT_PHONE } from '../constants/contact'
import { trackEvent } from '../utils/analytics'

import '../styles/grant-support-spain.css'

const phoneHref = CASAMIA_CONTACT_PHONE ? `tel:${CASAMIA_CONTACT_PHONE.replace(/\s+/g, '')}` : 'tel:+34900000000'
const whatsappHref = 'https://wa.me/34900000000?text=Hola%20CasaMia%2C%20quiero%20iniciar%20una%20revisi%C3%B3n%20de%20ayudas%20para%20adaptar%20una%20vivienda.'

const grantSteps = [
  {
    icon: <SearchCheck size={24} />,
    title: 'Identificamos la ayuda adecuada',
    body: 'CasaMia revisa tu perfil, vivienda, región y situación familiar para orientar la vía más probable.',
  },
  {
    icon: <FileCheck2 size={24} />,
    title: 'Preparamos la solicitud',
    body: 'Te ayudamos a reunir los datos, completar formularios y presentar la documentación requerida.',
  },
  {
    icon: <UserRoundCheck size={24} />,
    title: 'Coordinamos la revisión técnica',
    body: 'Cuando haga falta, te ayudamos a encontrar el técnico o inspector adecuado para validar la vivienda.',
  },
  {
    icon: <ClipboardCheck size={24} />,
    title: 'Emitimos el presupuesto de reforma',
    body: 'CasaMia prepara una propuesta clara para adaptar el hogar y respaldar el expediente de ayuda.',
  },
]

const officialReferences = [
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
]

const services = [
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
]

const faqs = [
  ['¿Hay ayudas para mayores de 60 años?', 'Sí. Existen programas que utilizan los 60 o 65 años como criterio, además de ayudas relacionadas con discapacidad, dependencia, movilidad, ingresos y accesibilidad.'],
  ['¿Todas las personas mayores pueden solicitar una ayuda?', 'Muchas personas mayores pueden acceder a alguna vía de apoyo. La ayuda concreta depende de la comunidad autónoma, municipio, vivienda, ingresos, tipo de obra y convocatoria disponible.'],
  ['¿Puedo recibir ayuda para cambiar la bañera por una ducha?', 'Sí. La adaptación del baño es una de las actuaciones más habituales en los programas de adaptación funcional y accesibilidad.'],
  ['¿Puedo recibir ayuda para un salvaescaleras?', 'Sí. Los salvaescaleras, plataformas y otras soluciones de movilidad pueden incluirse en programas regionales, municipales o de accesibilidad.'],
  ['¿Puede solicitarla un inquilino?', 'Sí, en muchos casos, siempre que la vivienda sea habitual y exista autorización escrita del propietario cuando sea necesaria.'],
  ['¿Necesito estar empadronado?', 'El empadronamiento suele ser un requisito importante para demostrar que se trata de la vivienda habitual.'],
  ['¿Necesito un certificado médico?', 'Depende de la ayuda. Algunos programas solicitan certificado médico, informe social, reconocimiento de discapacidad, dependencia o informe técnico.'],
  ['¿Cuánto dinero puedo recibir?', 'Las cantidades varían. Algunos programas cubren un porcentaje de la obra y otros establecen una cantidad máxima por vivienda, persona o actuación.'],
  ['¿Puede cubrirse toda la obra?', 'En algunos programas y situaciones prioritarias, la ayuda puede cubrir una parte muy elevada del coste. CasaMia revisará el porcentaje aplicable a tu caso.'],
  ['¿Puedo empezar la obra antes de solicitarla?', 'En muchos programas es recomendable u obligatorio solicitar la ayuda antes de iniciar la obra. CasaMia revisará las condiciones antes de que tomes una decisión.'],
  ['¿Servicios Sociales es el primer paso?', 'Puede ser uno de los primeros contactos, especialmente en situaciones de dependencia o vulnerabilidad. También pueden intervenir oficinas de vivienda, rehabilitación, ayuntamientos y organismos autonómicos.'],
  ['¿Qué ocurre si no hay una convocatoria abierta?', 'CasaMia puede identificar programas próximos, ayudas alternativas, convocatorias municipales o vías complementarias.'],
  ['¿Qué significa IPREM?', 'Es una referencia pública de ingresos. Muchas ayudas la usan para priorizar hogares con ingresos bajos o medios. CasaMia puede ayudarte a entender qué tramo puede aplicar.'],
  ['¿CasaMia garantiza la concesión?', 'CasaMia identifica programas, prepara el caso y ayuda durante todo el proceso. La resolución final corresponde a la administración pública.'],
]

export function GrantSupportSpainPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const schema = useMemo(() => buildGrantSchema(), [])

  return (
    <>
      <SEO
        title="Ayudas para adaptar vivienda de personas mayores en España"
        description="En toda España existen subvenciones y programas públicos para ayudar a personas mayores, con discapacidad, dependencia o movilidad reducida a adaptar su vivienda. CasaMia identifica la ayuda adecuada y coordina todo el proceso."
        path="/grants"
        image="/images/blog/grants-euro-symbol.jpg"
        schema={schema}
      />
      <div className="grant-spain-page">
        <header className="grant-spain-subnav">
          <a className="grant-spain-logo" href="#top">CasaMia</a>
          <button className="grant-spain-menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="grant-spain-links">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
            Menú
          </button>
          <nav id="grant-spain-links" className={menuOpen ? 'is-open' : ''}>
            {['Ayudas disponibles', 'Fuentes oficiales', 'Recursos', 'Catálogo servicios', 'Contacto'].map((item) => (
              <a key={item} href={`#${slugify(item)}`}>{item}</a>
            ))}
          </nav>
          <a className="grant-spain-call" href={phoneHref} onClick={() => trackEvent('grant_call_clicked')}>Llamar</a>
          <Link className="grant-spain-primary" to="/grant-check" onClick={() => trackEvent('grant_checker_started')}>Iniciar revisión</Link>
        </header>

        <section className="grant-spain-hero" id="top">
          <div className="site-shell grant-spain-hero-grid">
            <div className="grant-spain-hero-copy">
              <p className="grant-spain-kicker">Ayudas para adaptar viviendas</p>
              <h1>Tu hogar puede adaptarse. Y existen ayudas para hacerlo.</h1>
              <p>En toda España existen subvenciones y programas públicos para ayudar a personas mayores, con discapacidad, dependencia o movilidad reducida a adaptar su vivienda. CasaMia identifica la ayuda adecuada y coordina todo el proceso.</p>
              <div className="grant-spain-actions">
                <Link className="grant-spain-button" to="/grant-check" onClick={() => trackEvent('grant_cta_clicked', { cta: 'hero_checker' })}>Iniciar revisión <ArrowRight size={18} /></Link>
                <a className="grant-spain-button is-secondary" href="#fuentes-oficiales">Ver referencias oficiales</a>
              </div>
            </div>
            <div className="grant-spain-hero-visual">
              <SafeImage
                src="/images/blog/grants-euro-symbol.jpg"
                alt="Símbolo del euro para ayudas y financiación pública"
                className="grant-spain-hero-image"
                imgClassName="grant-spain-hero-img"
                loading="eager"
              />
              <div className="grant-spain-hero-funding-card" aria-label="Resumen de ayudas">
                <span><BadgeEuro size={24} aria-hidden="true" /></span>
                <div>
                  <strong>Ayudas de accesibilidad en España</strong>
                  <small>Hasta 13.000 € por vivienda en el Plan Estatal 2026-2030</small>
                </div>
              </div>
            </div>
          </div>
          <div className="site-shell grant-spain-hero-proof" aria-label="Resumen de servicio CasaMia">
            {[
              ['Hasta 13.000 €', 'Referencia estatal para obras de accesibilidad.'],
              ['Gestión territorial', 'Convocatorias estatales, autonómicas, municipales y sociales.'],
              ['Expediente preparado', 'Documentos, presupuesto y alcance antes de solicitar.'],
            ].map(([title, body]) => (
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
              <p className="grant-spain-kicker">Mensaje principal</p>
              <h2 id="grant-spain-promise-title">Existen ayudas para adaptar el hogar de las personas mayores.</h2>
            </div>
            <p>En España, las administraciones públicas ofrecen subvenciones y programas para mejorar la accesibilidad, eliminar barreras y permitir que las personas mayores continúen viviendo en casa con seguridad e independencia.</p>
          </div>
        </section>

        <Section id="ayudas-disponibles" eyebrow="Guía paso a paso" title="Cómo aprovechar una ayuda.">
          <p className="grant-spain-lead">Un proceso sencillo: identificar la ayuda, preparar la solicitud y convertirla en una reforma viable.</p>
          <div className="grant-spain-step-grid">
            {grantSteps.map((card, index) => <StepCard key={card.title} step={index + 1} {...card} />)}
          </div>
          <div className="grant-spain-callout">CasaMia acompaña el proceso de principio a fin: orientación, documentación, inspección técnica y presupuesto de reforma.</div>
        </Section>

        <Section id="fuentes-oficiales" eyebrow="Fuentes oficiales" title="Referencias públicas.">
          <div className="grant-spain-official-grid">
            {officialReferences.map((item) => (
              <a className="grant-spain-official-card" href={item.href} key={item.title} rel="noreferrer" target="_blank">
                <span>{item.source}</span>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <small>Consultar fuente <ExternalLink size={15} aria-hidden="true" /></small>
              </a>
            ))}
          </div>
        </Section>

        <Section id="recursos" eyebrow="Recursos recomendados" title="Siguiente paso.">
          <div className="grant-spain-resource-grid">
            {[
              ['Guía práctica', 'Ayudas para adaptar viviendas en España: qué debe preparar una familia', 'Documentos, alcance, requisitos y expectativas realistas.', '/blog/home-adaptation-grants-spain-family-guide'],
              ['Herramienta', 'Revisión inicial de ayudas', 'Ruta orientativa y documentos pendientes en unos minutos.', '/grant-check'],
              ['Plan CasaMia', 'Crear un plan de adaptación', 'Conecta la posible ayuda con servicios reales del catálogo.', '/plans'],
            ].map(([eyebrow, title, body, to]) => (
              <Link className="grant-spain-resource-card" key={title} to={to}>
                <span>{eyebrow}</span>
                <strong>{title}</strong>
                <p>{body}</p>
                <small>Ver recurso <ArrowRight size={16} aria-hidden="true" /></small>
              </Link>
            ))}
          </div>
        </Section>

        <Section id="catalogo-servicios" eyebrow="Catálogo de servicios" title="Servicios CasaMia relacionados.">
          <div className="grant-spain-pill-grid">{services.map((item) => <span key={item}><CheckCircle2 size={16} />{item}</span>)}</div>
        </Section>

        <section className="grant-spain-final" id="contacto">
          <div className="site-shell">
            <h2>Solicita una revisión inicial.</h2>
            <p>Identificamos la vía de ayuda más probable y qué documentación conviene preparar antes de avanzar.</p>
            <div className="grant-spain-actions">
              <Link className="grant-spain-button" to="/grant-check">Iniciar revisión</Link>
              <a className="grant-spain-button is-secondary" href={phoneHref}>Hablar con CasaMia</a>
            </div>
            <small>La revisión es orientativa. La concesión y el importe final dependen de requisitos, plazos, disponibilidad presupuestaria y resolución de la administración competente.</small>
          </div>
        </section>

        <div className="grant-spain-mobile-ctas">
          <a href={phoneHref}>Llamar</a>
          <a href={whatsappHref}>WhatsApp</a>
        </div>
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

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-')
}

function buildGrantSchema() {
  const path = 'https://casamia.com.es/grants'
  return [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://casamia.com.es/' }, { '@type': 'ListItem', position: 2, name: 'Ayudas para adaptar vivienda', item: path }] },
    { '@context': 'https://schema.org', '@type': 'Service', name: 'Revisión de ayudas para adaptar vivienda', serviceType: 'Ayudas accesibilidad vivienda España', areaServed: 'España', provider: { '@id': 'https://casamia.com.es/#organization' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
  ]
}
