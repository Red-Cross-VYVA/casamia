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
    title: 'Practical help when',
    accent: 'home needs to feel safer.',
    intro:
      'CasaMia helps you work out what is making daily life harder at home, what to check first, what can wait and when a visit, quote or grant check is worth doing.',
    primaryCta: 'Check home safety',
    secondaryCta: 'Check grant eligibility',
    provider: {
      kicker: 'How the service stays clear',
      title: 'Notes, photos, decisions and next steps in one place.',
      body:
        'MOKA DigiTech supports CasaMia with tools that keep reports, visit notes, grant checks and follow-up easy to follow from the first concern to the next agreed action.',
      bullets: [
        'Built around the person at home and any trusted contact helping with decisions',
        'Room notes, photos, recommendations and grant-readiness checks kept together',
        'Practical support experience informed by references such as VYVA and COCOON',
      ],
    },
    coverage: {
      eyebrow: 'Spain-wide service',
      title: 'Local help across Spain, with one clear way of working.',
      body:
        'CasaMia is designed for national coverage: local help can review the home, while the report keeps the advice, priorities, evidence and next steps consistent.',
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
    credibilityEyebrow: 'What guides the advice',
    credibilityTitle: 'CasaMia turns home concerns into room priorities and next actions.',
    proof: [
      {
        icon: 'seniors',
        title: 'Support should stay simple',
        body:
          'References such as VYVA and COCOON point to the same idea CasaMia follows: reminders, wellbeing checks, voice help and emergency support should be easy to understand and use.',
        link: {
          label: 'VYVA and COCOON reference',
          href: 'https://www.cocoon.services/meet-vyva-your-own-health-assistant-and-everyday-companion',
        },
      },
      {
        icon: 'safety',
        title: 'Grounded in home-safety priorities',
        body:
          'The service is framed around injury prevention, safer homes and practical daily routines, consistent with the European safety agenda promoted by EuroSafe.',
        link: {
          label: 'EuroSafe safety context',
          href: 'https://www.eurosafe.eu.com/home',
        },
      },
      {
        icon: 'funding',
        title: 'Grant readiness without false promises',
        body:
          'CasaMia helps prepare home-need notes, an adaptation summary and a document checklist where grant criteria may apply. Approval always belongs to the public authority.',
      },
      {
        icon: 'service',
        title: 'From report to action',
        body:
          'The goal is not only to detect risks. CasaMia turns findings into room priorities, changes to consider, grant-readiness notes and the next decision before anything is fitted.',
      },
    ],
    workflowEyebrow: 'How we work',
    workflowTitle: 'Start online. Bring in help when the home needs it.',
    workflow: [
      {
        title: 'Free check',
        body: 'Start with a home safety check or a grant check, depending on what you need to decide first.',
      },
      {
        title: 'Clear recommendation',
        body: 'CasaMia explains what looks risky, what could help, what needs measuring and which decision comes next.',
      },
      {
        title: 'Local follow-up',
        body: 'Local professionals can review the home, check measurements and prepare the information needed for the next step.',
      },
      {
        title: 'Ongoing support',
        body: 'Follow-up notes and optional alerts help keep the safety plan visible after work is fitted or a routine changes.',
      },
    ],
    sourcesTitle: 'Credibility references',
    sourcesIntro:
      'These references support the home-safety and practical support context behind CasaMia. They do not imply grant approval, medical advice or institutional endorsement.',
    finalTitle: 'Start with the check that fits the decision in front of you.',
    finalBody:
      'Use the safety check to understand room risks, or the grant check to understand document readiness before starting adaptation work.',
  },
  es: {
    eyebrow: 'Sobre CasaMia',
    title: 'Ayuda práctica cuando',
    accent: 'la casa necesita sentirse más segura.',
    intro:
      'CasaMia te ayuda a entender qué dificulta el día a día en casa, qué conviene revisar primero, qué puede esperar y cuándo merece la pena hacer una visita, pedir precio o revisar ayudas.',
    primaryCta: 'Comprobar seguridad',
    secondaryCta: 'Comprobar ayudas',
    provider: {
      kicker: 'Cómo se mantiene claro el servicio',
      title: 'Notas, fotos, decisiones y siguientes pasos en un solo lugar.',
      body:
        'MOKA DigiTech apoya CasaMia con herramientas para que informes, notas de visita, revisión de ayudas y seguimiento sean fáciles de seguir desde la primera preocupación hasta la siguiente acción acordada.',
      bullets: [
        'Pensado para la persona que vive en casa y cualquier contacto de confianza que ayude a decidir',
        'Notas por estancia, fotos, recomendaciones y revisión de ayudas en un solo lugar',
        'Experiencia práctica informada por referencias como VYVA y COCOON',
      ],
    },
    coverage: {
      eyebrow: 'Servicio en toda España',
      title: 'Ayuda local en toda España, con una forma clara de trabajar.',
      body:
        'CasaMia está pensada para cobertura nacional: la ayuda local puede revisar la vivienda, mientras el informe mantiene consejo, prioridades, evidencia y siguientes pasos ordenados.',
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
    credibilityEyebrow: 'Qué guía el consejo',
    credibilityTitle: 'CasaMia convierte preocupaciones del hogar en prioridades y próximos pasos.',
    proof: [
      {
        icon: 'seniors',
        title: 'El apoyo debe seguir siendo sencillo',
        body:
          'Referencias como VYVA y COCOON apuntan a la misma idea que sigue CasaMia: recordatorios, revisiones de bienestar, asistencia por voz y ayuda de emergencia deben ser fáciles de entender y usar.',
        link: {
          label: 'Referencia VYVA y COCOON',
          href: 'https://www.cocoon.services/meet-vyva-your-own-health-assistant-and-everyday-companion',
        },
      },
      {
        icon: 'safety',
        title: 'Basado en prioridades de seguridad en casa',
        body:
          'El servicio se construye alrededor de la prevención de lesiones, hogares más seguros y rutinas diarias prácticas, en línea con la agenda europea de seguridad que promueve EuroSafe.',
        link: {
          label: 'Contexto EuroSafe',
          href: 'https://www.eurosafe.eu.com/home',
        },
      },
      {
        icon: 'funding',
        title: 'Preparación de ayudas sin falsas promesas',
        body:
          'CasaMia ayuda a preparar evidencia práctica cuando pueda encajar una ayuda: necesidad de la vivienda, resumen de adaptación y lista documental. La aprobación depende siempre de la administración.',
      },
      {
        icon: 'service',
        title: 'Del informe a la acción',
        body:
          'El objetivo no es solo detectar riesgos. CasaMia convierte los hallazgos en prioridades por estancia, cambios a valorar, notas para ayudas y la siguiente decisión antes de instalar nada.',
      },
    ],
    workflowEyebrow: 'Cómo trabajamos',
    workflowTitle: 'Empieza online. Añade ayuda cuando la vivienda lo necesita.',
    workflow: [
      {
        title: 'Check gratuito',
        body: 'Empieza con un check de seguridad o un check de ayudas, según lo que necesites decidir primero.',
      },
      {
        title: 'Recomendación clara',
        body: 'CasaMia explica qué parece arriesgado, qué podría ayudar, qué necesita medidas y qué decisión viene después.',
      },
      {
        title: 'Seguimiento local',
        body: 'Profesionales locales pueden revisar la vivienda, comprobar medidas y preparar la información necesaria para el siguiente paso.',
      },
      {
        title: 'Soporte continuo',
        body: 'Las notas de seguimiento y los avisos opcionales ayudan a mantener visible el plan tras el montaje o cuando cambia una rutina.',
      },
    ],
    sourcesTitle: 'Referencias de credibilidad',
    sourcesIntro:
      'Estas referencias apoyan el contexto de seguridad en casa y apoyo práctico detrás de CasaMia. No implican aprobación de ayudas, consejo médico ni respaldo institucional.',
    finalTitle: 'Empieza con el check que encaja con la decisión de hoy.',
    finalBody:
      'Usa el check de seguridad para entender riesgos por estancia, o el check de ayudas para saber si conviene preparar documentación antes de iniciar una adaptación.',
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
      : 'About CasaMia | Home Safety and Adaptation in Spain'
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
