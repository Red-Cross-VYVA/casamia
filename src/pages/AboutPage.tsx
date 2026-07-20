import {
  ArrowRight,
  Check,
  ExternalLink,
  FileCheck2,
  HeartPulse,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BrandLogo } from '../components/BrandLogo'
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
    title: 'Technology and service for',
    accent: 'safer ageing at home.',
    intro:
      'CasaMia brings home safety assessment, practical adaptations, connected technology, and funding guidance into one clear service for families across Spain.',
    primaryCta: 'Check home safety',
    secondaryCta: 'Check grant eligibility',
    provider: {
      kicker: 'Technology and service partner',
      title: 'Built with MOKA DigiTech.',
      body:
        'MOKA DigiTech supports CasaMia as a technology and service provider dedicated to senior empowerment: making care easier to access, homes easier to adapt, and families better informed before risk becomes an emergency.',
      bullets: [
        'Service design for families, installers, and care partners',
        'Digital workflows for safety reports and grant-readiness checks',
        'Senior-focused technology experience through references such as VYVA and COCOON',
      ],
    },
    coverage: {
      eyebrow: 'Spain-wide service',
      title: 'Representatives across Spain, supported by one digital workflow.',
      body:
        'CasaMia is designed for national coverage: local representatives can help families understand the home, while the digital report keeps every assessment, recommendation, and follow-up consistent.',
      badge: 'All Spain',
      legend: 'Representative coverage areas',
      hint: 'Hover or tap a marker to see the local team.',
      repSingular: 'representative',
      repPlural: 'representatives',
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
    credibilityEyebrow: 'Why families can trust the model',
    credibilityTitle: 'CasaMia is built around prevention, evidence, and practical follow-through.',
    proof: [
      {
        icon: 'seniors',
        title: 'Senior empowerment, not complicated technology',
        body:
          'Projects and references such as VYVA and COCOON show the same direction CasaMia is taking: voice support, reminders, wellbeing checks, and emergency workflows that extend care without replacing human support.',
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
          'CasaMia helps families prepare practical evidence for regional, public, and EU-backed support routes where available: the home need, proposed adaptation, and document checklist. Approval always depends on the relevant authority.',
      },
      {
        icon: 'service',
        title: 'A service layer after the report',
        body:
          'The goal is not only to detect risks. CasaMia turns findings into a plan, installation scope, grant-readiness checklist, and next step a family can act on.',
      },
    ],
    workflowEyebrow: 'How we work',
    workflowTitle: 'Digital first, human where it matters.',
    workflow: [
      {
        title: 'Free check',
        body: 'Families start with either a home safety report or a grant eligibility check.',
      },
      {
        title: 'Clear recommendation',
        body: 'CasaMia explains the risks, the likely adaptation level, and the practical next step.',
      },
      {
        title: 'Local follow-up',
        body: 'Representatives can help validate the home, organise installation, and prepare documents.',
      },
      {
        title: 'Ongoing support',
        body: 'Connected technology, alerts, and service follow-up help the home stay safer over time.',
      },
    ],
    sourcesTitle: 'Credibility references',
    sourcesIntro:
      'These references support the safety and senior-tech context behind CasaMia. They do not imply grant approval or institutional endorsement.',
    finalTitle: 'Start with the free check that fits your family.',
    finalBody:
      'Use the safety report to understand home risks, or the grant check to understand readiness before starting an adaptation project.',
  },
  es: {
    eyebrow: 'Sobre CasaMia',
    title: 'Tecnología y servicio para',
    accent: 'envejecer con más seguridad en casa.',
    intro:
      'CasaMia une evaluación del hogar, adaptaciones prácticas, tecnología conectada y orientación sobre ayudas en un servicio claro para familias en toda España.',
    primaryCta: 'Comprobar seguridad',
    secondaryCta: 'Comprobar ayudas',
    provider: {
      kicker: 'Partner tecnológico y de servicio',
      title: 'Construido con MOKA DigiTech.',
      body:
        'MOKA DigiTech apoya CasaMia como proveedor tecnológico y de servicio dedicado al empowerment de las personas mayores: hacer la atención más accesible, las viviendas más fáciles de adaptar y las familias mejor informadas antes de que el riesgo se convierta en emergencia.',
      bullets: [
        'Diseño de servicio para familias, instaladores y partners de cuidado',
        'Flujos digitales para informes de seguridad y checks de ayudas',
        'Experiencia en tecnología senior con referencias como VYVA y COCOON',
      ],
    },
    coverage: {
      eyebrow: 'Servicio en toda España',
      title: 'Representantes en toda España, conectados por un mismo flujo digital.',
      body:
        'CasaMia está pensada para cobertura nacional: representantes locales ayudan a entender la vivienda, mientras el informe digital mantiene cada evaluación, recomendación y seguimiento ordenados.',
      badge: 'Toda España',
      legend: 'Zonas con cobertura representativa',
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
    credibilityTitle: 'CasaMia se basa en prevención, evidencia y seguimiento práctico.',
    proof: [
      {
        icon: 'seniors',
        title: 'Empowerment senior, no tecnología complicada',
        body:
          'Proyectos y referencias como VYVA y COCOON apuntan en la misma dirección que CasaMia: asistencia por voz, recordatorios, checks de bienestar y flujos de emergencia que amplían el cuidado sin sustituir el apoyo humano.',
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
          'CasaMia ayuda a preparar evidencia práctica para vías regionales, públicas y de financiación europea cuando existan: necesidad de la vivienda, adaptación propuesta y checklist documental. La aprobación depende siempre de la autoridad competente.',
      },
      {
        icon: 'service',
        title: 'Un servicio después del informe',
        body:
          'El objetivo no es solo detectar riesgos. CasaMia convierte los hallazgos en un plan, alcance de instalación, checklist de ayudas y próximo paso accionable.',
      },
    ],
    workflowEyebrow: 'Cómo trabajamos',
    workflowTitle: 'Digital primero, humano donde importa.',
    workflow: [
      {
        title: 'Check gratuito',
        body: 'La familia empieza con un informe de seguridad del hogar o un check de elegibilidad de ayudas.',
      },
      {
        title: 'Recomendación clara',
        body: 'CasaMia explica los riesgos, el nivel probable de adaptación y el siguiente paso práctico.',
      },
      {
        title: 'Seguimiento local',
        body: 'Los representantes pueden ayudar a validar la vivienda, organizar instalación y preparar documentos.',
      },
      {
        title: 'Soporte continuo',
        body: 'La tecnología conectada, las alertas y el seguimiento ayudan a mantener el hogar más seguro en el tiempo.',
      },
    ],
    sourcesTitle: 'Referencias de credibilidad',
    sourcesIntro:
      'Estas referencias apoyan el contexto de seguridad y tecnología senior detrás de CasaMia. No implican aprobación de ayudas ni respaldo institucional.',
    finalTitle: 'Empieza con el check gratuito que encaja con tu familia.',
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
  const copy = getAboutCopy(i18n.language)

  useEffect(() => {
    document.title = `${copy.eyebrow} | CasaMia`
  }, [copy.eyebrow])

  return (
    <>
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
