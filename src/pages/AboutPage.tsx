import {
  ArrowRight,
  Check,
  ExternalLink,
  FileCheck2,
  HeartPulse,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BrandLogo } from '../components/BrandLogo'
import { SEO } from '../components/SEO'
import { SpainCoverageMap, type SpainCoverageCopy } from '../components/SpainCoverageMap'

type AboutCopy = {
  eyebrow: string
  title: string
  accent: string
  intro: string
  primaryCta: string
  secondaryCta: string
  provider: {
    kicker: string
    title: string
    body: string
    bullets: string[]
  }
  coverage: SpainCoverageCopy & {
    eyebrow: string
    body: string
    regions: string[]
  }
  credibilityEyebrow: string
  credibilityTitle: string
  proof: Array<{
    icon: 'seniors' | 'safety' | 'funding' | 'service'
    title: string
    body: string
    link?: {
      label: string
      href: string
    }
  }>
  workflowEyebrow: string
  workflowTitle: string
  workflow: Array<{
    title: string
    body: string
  }>
  sourcesTitle: string
  sourcesIntro: string
  finalTitle: string
  finalBody: string
}

const aboutCopy: Record<'en' | 'es', AboutCopy> = {
  en: {
    eyebrow: 'About CasaMia',
    title: 'Practical help for',
    accent: 'safer ageing at home.',
    intro:
      'CasaMia helps you understand what is unsafe at home, what to change first, what it may cost and whether grant paperwork is worth preparing.',
    primaryCta: 'Check home safety',
    secondaryCta: 'Check grant eligibility',
    provider: {
      kicker: 'Tools behind the service',
      title: 'Built to make each step easier to follow.',
      body:
        'MOKA DigiTech supports CasaMia with tools that keep reports, visits, grant checks and follow-up organised from the first concern to the agreed plan.',
      bullets: [
        'Services designed around the person at home and the people helping them',
        'Clear reports, room notes and grant-readiness checks',
        'Experience with practical support tools through references such as VYVA and COCOON',
      ],
    },
    coverage: {
      eyebrow: 'Spain-wide service',
      title: 'Local help across Spain, guided by one clear standard.',
      body:
        'CasaMia is designed for national coverage: local teams can review the home, while the report keeps the advice, priorities and next steps consistent.',
      badge: 'All Spain',
      legend: 'Local coverage areas',
      hint: 'Hover or tap a marker to see the local team.',
      repSingular: 'local team',
      repPlural: 'local teams',
      orderNow: 'Order now',
      regions: [
        'Madrid',
        'Catalonia',
        'Valencia',
        'Andalusia',
        'Galicia',
        'Basque Country',
        'Balearic Islands',
        'Canary Islands',
      ],
    },
    credibilityEyebrow: 'How decisions are checked',
    credibilityTitle: 'CasaMia turns visible home risks into room priorities and confirmed actions.',
    proof: [
      {
        icon: 'seniors',
        title: 'Decision support, not complicated technology',
        body:
          'Projects and references such as VYVA and COCOON show the same direction CasaMia is taking: voice support, reminders, wellbeing checks and emergency help that should be easy to understand and act on.',
        link: {
          label: 'VYVA and COCOON reference',
          href: 'https://www.cocoon.services/meet-vyva-your-own-health-assistant-and-everyday-companion',
        },
      },
      {
        icon: 'safety',
        title: 'Aligned with European safety priorities',
        body:
          'The service is framed around injury prevention, safer homes, and older adults ageing safely, consistent with the European safety agenda promoted by EuroSafe.',
        link: {
          label: 'EuroSafe safety context',
          href: 'https://www.eurosafe.eu.com/home',
        },
      },
      {
        icon: 'funding',
        title: 'Funding readiness without false promises',
        body:
          'CasaMia prepares the home-need notes, adaptation summary and document checklist for relevant grant criteria. Approval always depends on the public authority.',
      },
      {
        icon: 'service',
        title: 'From report to action',
        body:
          'The goal is not only to detect risks. CasaMia turns findings into room priorities, changes to consider, grant-readiness notes and the next decision before anything is fitted.',
      },
    ],
    workflowEyebrow: 'How we work',
    workflowTitle: 'Start online. Bring in people when the home needs it.',
    workflow: [
      {
        title: 'Free check',
        body: 'Start with a home safety report or a grant check, depending on what you need to decide first.',
      },
      {
        title: 'Clear recommendation',
        body: 'CasaMia explains what looks risky, what could help and which decision comes next.',
      },
      {
        title: 'Local follow-up',
        body: 'Local professionals can review the home, check measurements and prepare the documents needed for the next step.',
      },
      {
        title: 'Ongoing support',
        body: 'Follow-up, notes and optional alerts help keep the safety plan visible after fitting.',
      },
    ],
    sourcesTitle: 'Credibility references',
    sourcesIntro:
      'These references support the home-safety and practical support context behind CasaMia. They do not imply grant approval or institutional endorsement.',
    finalTitle: 'Start with the free check that fits your situation.',
    finalBody:
      'Use the safety report to understand home risks, or the grant check to understand readiness before starting an adaptation project.',
  },
  es: {
    eyebrow: 'Sobre CasaMia',
    title: 'Ayuda práctica para',
    accent: 'envejecer con más seguridad en casa.',
    intro:
      'CasaMia te ayuda a entender qué es inseguro en casa, qué cambiar primero, cuánto puede costar y si merece la pena preparar documentación para ayudas.',
    primaryCta: 'Comprobar seguridad',
    secondaryCta: 'Comprobar ayudas',
    provider: {
      kicker: 'Herramientas detrás del servicio',
      title: 'Diseñado para que cada paso sea fácil de seguir.',
      body:
        'MOKA DigiTech apoya CasaMia con herramientas para mantener informes, visitas, revisión de ayudas y seguimiento ordenados desde la primera preocupación hasta el plan acordado.',
      bullets: [
        'Servicios pensados alrededor de la persona que vive en casa y quienes la ayudan',
        'Informes claros, notas por estancia y revisión de ayudas',
        'Experiencia con herramientas prácticas de apoyo como VYVA y COCOON',
      ],
    },
    coverage: {
      eyebrow: 'Servicio en toda España',
      title: 'Ayuda local en toda España, guiada por un estándar claro.',
      body:
        'CasaMia está pensada para cobertura nacional: equipos locales pueden revisar la vivienda, mientras el informe mantiene el consejo, las prioridades y los siguientes pasos ordenados.',
      badge: 'Toda España',
      legend: 'Zonas con cobertura local',
      hint: 'Pasa el cursor o toca un punto para ver el equipo local.',
      repSingular: 'representante',
      repPlural: 'representantes',
      orderNow: 'Pedir ahora',
      regions: [
        'Madrid',
        'Cataluña',
        'Valencia',
        'Andalucía',
        'Galicia',
        'País Vasco',
        'Baleares',
        'Canarias',
      ],
    },
    credibilityEyebrow: 'Por qué confiar en el modelo',
    credibilityTitle: 'CasaMia convierte riesgos visibles en siguientes pasos claros.',
    proof: [
      {
        icon: 'seniors',
        title: 'Apoyo para personas mayores, no tecnología complicada',
        body:
          'Proyectos y referencias como VYVA y COCOON apuntan en la misma dirección que CasaMia: asistencia por voz, recordatorios, revisiones de bienestar y ayuda de emergencia que debe ser fácil de entender y activar.',
        link: {
          label: 'Referencia VYVA y COCOON',
          href: 'https://www.cocoon.services/meet-vyva-your-own-health-assistant-and-everyday-companion',
        },
      },
      {
        icon: 'safety',
        title: 'Alineado con prioridades europeas de seguridad',
        body:
          'El servicio se construye alrededor de la prevención de lesiones, hogares más seguros y envejecimiento seguro, en línea con la agenda europea de seguridad que promueve EuroSafe.',
        link: {
          label: 'Contexto EuroSafe',
          href: 'https://www.eurosafe.eu.com/home',
        },
      },
      {
        icon: 'funding',
        title: 'Preparación para ayudas sin falsas promesas',
        body:
          'CasaMia ayuda a preparar evidencia práctica cuando pueda encajar una ayuda: necesidad de la vivienda, adaptación propuesta y checklist documental. La aprobación depende siempre de la administración.',
      },
      {
        icon: 'service',
        title: 'Del informe a la acción',
        body:
          'El objetivo no es solo detectar riesgos. CasaMia convierte los hallazgos en prioridades por estancia, cambios a valorar, notas para ayudas y la siguiente decisión antes de instalar nada.',
      },
    ],
    workflowEyebrow: 'Cómo trabajamos',
    workflowTitle: 'Empieza online. Añade personas cuando la vivienda lo necesita.',
    workflow: [
      {
        title: 'Check gratuito',
        body: 'Empieza con un informe de seguridad o un check de ayudas, según lo que necesites decidir primero.',
      },
      {
        title: 'Recomendación clara',
        body: 'CasaMia explica qué parece arriesgado, qué podría ayudar y qué decisión viene después.',
      },
      {
        title: 'Seguimiento local',
        body: 'Profesionales locales pueden revisar la vivienda, comprobar medidas y preparar los documentos necesarios para el siguiente paso.',
      },
      {
        title: 'Soporte continuo',
        body: 'El seguimiento, las notas y los avisos opcionales ayudan a mantener visible el plan tras el montaje.',
      },
    ],
    sourcesTitle: 'Referencias de credibilidad',
    sourcesIntro:
      'Estas referencias apoyan el contexto de seguridad en casa y apoyo práctico detrás de CasaMia. No implican aprobación de ayudas ni respaldo institucional.',
    finalTitle: 'Empieza con el check gratuito que encaja con tu situación.',
    finalBody:
      'Usa el informe de seguridad para entender los riesgos del hogar, o el check de ayudas para saber si estáis preparados antes de iniciar una adaptación.',
  },
}

const sourceLinks = [
  {
    label: 'EuroSafe',
    href: 'https://www.eurosafe.eu.com/home',
  },
  {
    label: 'European Health Information Portal: EuroSafe profile',
    href: 'https://www.healthinformationportal.eu/institutions/eurosafe-european-association-injury-prevention-and-safety-promotion',
  },
  {
    label: 'COCOON: VYVA health assistant',
    href: 'https://www.cocoon.services/meet-vyva-your-own-health-assistant-and-everyday-companion',
  },
  {
    label: 'COCOON assistive technology',
    href: 'https://www.cocoon.services/assistive-technology',
  },
]

function getAboutCopy(language: string) {
  return language.startsWith('es') ? aboutCopy.es : aboutCopy.en
}

function ProofIcon({ type }: { type: AboutCopy['proof'][number]['icon'] }) {
  if (type === 'seniors') {
    return <UsersRound size={26} aria-hidden="true" />
  }

  if (type === 'funding') {
    return <FileCheck2 size={26} aria-hidden="true" />
  }

  if (type === 'service') {
    return <HeartPulse size={26} aria-hidden="true" />
  }

  return <ShieldCheck size={26} aria-hidden="true" />
}

export function AboutPage() {
  const { i18n } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = getAboutCopy(language)
  const siteUrl = 'https://www.casamia.com.es'
  const seoTitle =
    language === 'es'
      ? 'Sobre CasaMia | Seguridad y adaptación del hogar en España'
      : 'About CasaMia | Senior Home Safety and Adaptation in Spain'
  const seoDescription = copy.intro

  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'AboutPage',
          '@id': `${siteUrl}/about#page`,
          url: `${siteUrl}/about`,
          name: seoTitle,
          description: seoDescription,
          inLanguage: language,
          mainEntity: {
            '@id': `${siteUrl}/#organization`,
          },
        },
        {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          name: 'CasaMia',
          url: siteUrl,
          description: seoDescription,
          areaServed: copy.coverage.regions.map((region) => ({
            '@type': 'AdministrativeArea',
            name: region,
          })),
          knowsAbout: copy.proof.map((proof) => proof.title),
          sameAs: copy.proof.flatMap((proof) => (proof.link?.href ? [proof.link.href] : [])),
        },
        {
          '@type': 'ItemList',
          '@id': `${siteUrl}/about#trust-signals`,
          name: copy.credibilityTitle,
          itemListElement: copy.proof.map((proof, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: proof.title,
            description: proof.body,
            url: proof.link?.href,
          })),
        },
      ],
    }),
    [copy.coverage.regions, copy.credibilityTitle, copy.proof, language, seoDescription, seoTitle],
  )

  return (
    <>
      <SEO title={seoTitle} description={seoDescription} path="/about" schema={schema} />
      <section className="about-hero">
        <div className="about-hero-grid site-shell">
          <div className="about-hero-copy">
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1>
              {copy.title}{' '}
              <span className="italic-accent text-green">{copy.accent}</span>
            </h1>
            <p>{copy.intro}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link className="btn btn-green" to="/#estimate-upload">
                {copy.primaryCta}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/grant-check">
                {copy.secondaryCta}
              </Link>
            </div>
          </div>

          <aside className="about-provider-panel">
            <BrandLogo variant="footer" />
            <p className="about-provider-kicker">{copy.provider.kicker}</p>
            <h2>{copy.provider.title}</h2>
            <p>{copy.provider.body}</p>
            <ul>
              {copy.provider.bullets.map((bullet) => (
                <li key={bullet}>
                  <Check size={17} aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="about-coverage-grid site-shell">
          <div className="about-section-copy">
            <p className="eyebrow">{copy.coverage.eyebrow}</p>
            <h2 className="display-title mt-5">{copy.coverage.title}</h2>
            <p>{copy.coverage.body}</p>
          </div>

          <SpainCoverageMap copy={copy.coverage} language={i18n.language} />
        </div>
      </section>

      <section className="section-pad bg-light-blue">
        <div className="site-shell">
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow">{copy.credibilityEyebrow}</p>
            <h2 className="display-title mt-5">{copy.credibilityTitle}</h2>
          </div>

          <div className="about-proof-grid mt-12">
            {copy.proof.map((proof) => (
              <article className="about-proof-card" key={proof.title}>
                <span className="about-proof-icon">
                  <ProofIcon type={proof.icon} />
                </span>
                <h3>{proof.title}</h3>
                <p>{proof.body}</p>
                {proof.link ? (
                  <a href={proof.link.href} target="_blank" rel="noreferrer">
                    {proof.link.label}
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell">
          <div className="about-workflow-intro">
            <p className="eyebrow">{copy.workflowEyebrow}</p>
            <h2 className="display-title mt-5">{copy.workflowTitle}</h2>
          </div>

          <div className="about-workflow-grid mt-12">
            {copy.workflow.map((step, index) => (
              <article className="about-workflow-step" key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-reference-section">
        <div className="site-shell">
          <div className="about-reference-panel">
            <div>
              <h2>{copy.sourcesTitle}</h2>
              <p>{copy.sourcesIntro}</p>
            </div>
            <div className="about-source-list">
              {sourceLinks.map((source) => (
                <a href={source.href} key={source.href} target="_blank" rel="noreferrer">
                  {source.label}
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="about-final-cta">
            <div>
              <h2>{copy.finalTitle}</h2>
              <p>{copy.finalBody}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="btn btn-green" to="/#estimate-upload">
                {copy.primaryCta}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-navy" to="/grant-check">
                {copy.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
