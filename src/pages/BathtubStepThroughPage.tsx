import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Ruler,
  ShieldCheck,
  ShowerHead,
  Wrench,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LocalizedLink as Link } from '../components/LocalizedLink'
import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'

const pageCopy = {
  en: {
    assessment: {
      body: 'This is a measured adaptation, not a one-size-fits-all product. CasaMia confirms the bath material, wall access, pipework, surrounding floor and the person’s transfer needs before recommending it.',
      title: 'Suitability comes first',
    },
    benefits: [
      'Keeps the existing bathroom layout where replacement is unnecessary.',
      'Creates a lower, clearer entry point for showering or assisted washing.',
      'Reduces the need to step over the full bath wall.',
      'Can be combined with grab bars, anti-slip treatment and seating where suitable.',
    ],
    body:
      'CasaMia creates a lower-entry opening in a suitable existing bath, fits a sealed step-through insert, then finishes and tests the work before handover.',
    cta: 'Request a bathroom assessment',
    eyebrow: 'Bath adaptation',
    imageAlt: 'A white bathtub converted with a lower step-through entrance and nearby support rail',
    introTitle: 'A practical way to make bath access easier without replacing the whole room.',
    metaDescription:
      'How CasaMia plans and installs a bathtub step-through conversion for a suitable existing bath.',
    metaTitle: 'Bathtub Step-through Conversion | CasaMia',
    plansCta: 'Back to plans',
    process: [
      {
        body: 'We check the bath type, available space, wall and floor condition, drainage, nearby fittings and the safest movement pattern for the person using it.',
        title: 'Assess the bath and route',
      },
      {
        body: 'The proposed opening is measured and marked so the step-through point supports the intended showering or transfer routine.',
        title: 'Measure the entry point',
      },
      {
        body: 'A trained installer creates the side opening with controlled cutting and protects the surrounding surfaces during the work.',
        title: 'Create the opening',
      },
      {
        body: 'A low-entry insert is fitted into the opening and bonded into place so the new edge is smooth, stable and easy to clean.',
        title: 'Fit the insert',
      },
      {
        body: 'The joins are sealed, finished and checked carefully so water is directed back into the bath area during normal use.',
        title: 'Seal and finish',
      },
      {
        body: 'CasaMia reviews the finished access, confirms any companion safety items and explains care, cleaning and aftercare before handover.',
        title: 'Test and hand over',
      },
    ],
    processTitle: 'How CasaMia does it',
    reassurance: [
      'No other bath-conversion brand is required or disclosed in the proposal.',
      'Final dimensions and price are confirmed only after measurement.',
      'If the existing bath is not suitable, CasaMia recommends a safer alternative.',
    ],
    title: 'Bathtub Step-through Conversion',
  },
  es: {
    assessment: {
      body: 'Es una adaptación medida, no un producto único para todos los baños. CasaMia confirma el material de la bañera, el acceso a paredes, la fontanería, el suelo cercano y las necesidades de transferencia antes de recomendarla.',
      title: 'Primero se confirma la idoneidad',
    },
    benefits: [
      'Mantiene la distribución del baño cuando no hace falta sustituirlo entero.',
      'Crea un punto de entrada más bajo y claro para ducharse o lavarse con ayuda.',
      'Reduce la necesidad de pasar por encima de toda la pared de la bañera.',
      'Puede combinarse con barras de apoyo, tratamiento antideslizante y asiento cuando encaje.',
    ],
    body:
      'CasaMia crea una entrada más baja en una bañera existente adecuada, coloca una pieza de acceso sellada y después remata y prueba el trabajo antes de la entrega.',
    cta: 'Pedir valoración del baño',
    eyebrow: 'Adaptación de bañera',
    imageAlt: 'Bañera blanca convertida con entrada de paso bajo y barra de apoyo cercana',
    introTitle: 'Una forma práctica de facilitar el acceso a la bañera sin sustituir todo el baño.',
    metaDescription:
      'Cómo CasaMia planifica e instala una conversión de bañera con acceso bajo cuando la bañera existente es adecuada.',
    metaTitle: 'Conversión de bañera con acceso bajo | CasaMia',
    plansCta: 'Volver a planes',
    process: [
      {
        body: 'Revisamos el tipo de bañera, el espacio disponible, el estado de paredes y suelo, el desagüe, los elementos cercanos y el movimiento más seguro para la persona.',
        title: 'Evaluar bañera y acceso',
      },
      {
        body: 'Se mide y marca la abertura propuesta para que el punto de paso apoye la rutina prevista de ducha o transferencia.',
        title: 'Medir el punto de entrada',
      },
      {
        body: 'Un instalador formado crea la abertura lateral con corte controlado y protege las superficies cercanas durante el trabajo.',
        title: 'Crear la abertura',
      },
      {
        body: 'Se coloca una pieza de entrada baja en la abertura y se fija para que el nuevo borde quede liso, estable y fácil de limpiar.',
        title: 'Colocar la pieza',
      },
      {
        body: 'Las juntas se sellan, se rematan y se comprueban para que el agua vuelva a la zona de la bañera durante el uso normal.',
        title: 'Sellar y rematar',
      },
      {
        body: 'CasaMia revisa el acceso terminado, confirma elementos de seguridad complementarios y explica cuidados, limpieza y seguimiento.',
        title: 'Probar y entregar',
      },
    ],
    processTitle: 'Cómo lo hace CasaMia',
    reassurance: [
      'No hace falta nombrar ni mostrar ninguna otra marca de conversión de bañera.',
      'Las medidas finales y el precio se confirman solo después de medir.',
      'Si la bañera existente no es adecuada, CasaMia recomienda una alternativa más segura.',
    ],
    title: 'Conversión de bañera con acceso bajo',
  },
}

const processIcons = [ClipboardCheck, Ruler, Wrench, ShowerHead, ShieldCheck, CheckCircle2]

export function BathtubStepThroughPage() {
  const { i18n } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = pageCopy[language]
  const path = '/services/bathtub-step-through-conversion'
  const siteUrl = 'https://www.casamia.com.es'

  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${siteUrl}${path}#page`,
          url: `${siteUrl}${path}`,
          name: copy.metaTitle,
          description: copy.metaDescription,
          inLanguage: language,
          isPartOf: {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            name: 'CasaMia',
            url: siteUrl,
          },
          about: {
            '@id': `${siteUrl}${path}#service`,
          },
        },
        {
          '@type': 'Service',
          '@id': `${siteUrl}${path}#service`,
          name: copy.title,
          description: copy.body,
          serviceType: language === 'es' ? 'Adaptación de bañera' : 'Bath adaptation',
          provider: {
            '@type': 'Organization',
            '@id': `${siteUrl}/#organization`,
            name: 'CasaMia',
            url: siteUrl,
          },
        },
        {
          '@type': 'HowTo',
          '@id': `${siteUrl}${path}#process`,
          name: copy.processTitle,
          description: copy.body,
          step: copy.process.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.title,
            text: step.body,
          })),
        },
      ],
    }),
    [copy, language],
  )

  return (
    <>
      <SEO title={copy.metaTitle} description={copy.metaDescription} path={path} schema={schema} />

      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1 className="display-title">{copy.title}</h1>
              <p className="mt-5 max-w-3xl text-xl leading-relaxed text-text-mid">{copy.body}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link className="btn btn-green" to="/home-safety-assessment">
                  {copy.cta}
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
                <Link
                  className="btn border border-border bg-white text-navy hover:border-green hover:text-green"
                  to="/plans"
                >
                  {copy.plansCta}
                </Link>
              </div>
            </div>

            <SafeImage
              alt={copy.imageAlt}
              className="overflow-hidden rounded-lg border border-border bg-white shadow-soft"
              fallbackLabel={copy.title}
              imgClassName="h-full min-h-[340px] w-full object-cover"
              src="/images/service-card-products/tub-cutout.webp"
            />
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight text-text-dark md:text-5xl">
              {copy.introTitle}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.benefits.map((benefit) => (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-light-blue p-5" key={benefit}>
                <CheckCircle2 className="mt-1 shrink-0 text-green" size={20} aria-hidden="true" />
                <p className="font-bold leading-relaxed text-navy">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-light-blue">
        <div className="site-shell">
          <div className="max-w-3xl">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight text-text-dark md:text-5xl">
              {copy.processTitle}
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {copy.process.map((step, index) => {
              const Icon = processIcons[index] ?? CheckCircle2

              return (
                <article className="soft-card" key={step.title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-white">
                    <Icon size={23} aria-hidden="true" />
                  </div>
                  <span className="mt-5 inline-flex text-sm font-black uppercase tracking-[0.08em] text-green">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 text-xl font-extrabold text-navy">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-text-mid">{step.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell">
          <div className="rounded-lg border border-gold/40 bg-gold/10 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row">
              <AlertCircle className="shrink-0 text-gold" size={28} aria-hidden="true" />
              <div>
                <h2 className="text-xl font-extrabold text-navy">{copy.assessment.title}</h2>
                <p className="mt-2 leading-relaxed text-text-mid">{copy.assessment.body}</p>
                <ul className="mt-5 grid gap-3 md:grid-cols-3">
                  {copy.reassurance.map((item) => (
                    <li className="flex items-start gap-2 font-bold text-navy" key={item}>
                      <CheckCircle2 className="mt-0.5 shrink-0 text-green" size={18} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-navy text-white">
        <div className="site-shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="eyebrow border-white/20 bg-white/10 text-white">{copy.eyebrow}</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight md:text-5xl">
              {copy.introTitle}
            </h2>
          </div>
          <Link className="btn btn-green shrink-0" to="/home-safety-assessment">
            {copy.cta}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
