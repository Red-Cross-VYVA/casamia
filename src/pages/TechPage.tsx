import { ArrowRight, Check, HeartPulse, Home, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SafeImage } from '../components/SafeImage'
import { PLAN_DETAIL_LIST } from '../constants/planDetails'
import { IMAGE_URLS } from '../constants/shopify'

type LocalisedTechCopy = {
  eyebrow: string
  title: string
  accent: string
  intro: string
  primaryCta: string
  secondaryCta: string
  systemEyebrow: string
  systemTitle: string
  roomEyebrow: string
  roomTitle: string
  packagesEyebrow: string
  packagesTitle: string
  packagesIntro: string
  viewPlan: string
  allInclusions: string
  finalTitle: string
  finalBody: string
  finalCta: string
  systems: Array<{
    icon: 'shield' | 'home' | 'heart'
    title: string
    body: string
    bullets: string[]
  }>
  rooms: Array<{
    title: string
    body: string
  }>
}

const techCopy: Record<'en' | 'es', LocalisedTechCopy> = {
  en: {
    eyebrow: 'CasaMia Tech',
    title: 'Smart technology that protects,',
    accent: 'installed at home.',
    intro:
      'Access, lights, alerts, and health support connected to protect each room without complicating the home.',
    primaryCta: 'See package inclusions',
    secondaryCta: 'Compare plans',
    systemEyebrow: 'What the tech does',
    systemTitle: 'Built around the moments where families worry most.',
    roomEyebrow: 'Room by room',
    roomTitle: 'Technology that supports the home without making it complicated.',
    packagesEyebrow: 'Package inclusions',
    packagesTitle: 'Everything included in each CasaMia package.',
    packagesIntro:
      'Use this section to understand what is installed or managed in Essential, Advanced, and Premium before choosing a plan.',
    viewPlan: 'View full plan',
    allInclusions: 'All inclusions',
    finalTitle: 'Not sure which tech level fits the home?',
    finalBody:
      'Start with the free safety report. CasaMia can review the rooms, flag the risks, and recommend the right package.',
    finalCta: 'Start free safety report',
    systems: [
      {
        icon: 'shield',
        title: 'Access and emergency confidence',
        body: 'Smart locks, video door communication, emergency buttons, and alert systems help reduce rushed movement and delayed response.',
        bullets: ['Smart access', 'Emergency call buttons', 'Family alerts'],
      },
      {
        icon: 'home',
        title: 'Lighting and daily control',
        body: 'Motion lighting, voice controls, smart plugs, and safer routines make movement easier during the day and at night.',
        bullets: ['Motion lighting', 'Voice control', 'Smart plugs and appliances'],
      },
      {
        icon: 'heart',
        title: 'Monitoring and reassurance',
        body: 'Premium support can include health reminders, vitals devices, fall detection, smoke/CO monitoring, and family notification workflows.',
        bullets: ['Health and vitals', 'Fall detection', 'Medication reminders'],
      },
    ],
    rooms: [
      {
        title: 'Entrance and stairs',
        body: 'Smart locks, video doorbells, handrail lighting, motion lighting, stair treads, and fall alerts support safer movement through access points.',
      },
      {
        title: 'Bathroom',
        body: 'Anti-slip surfaces, grab bars, safer lighting, water-temperature awareness, leak detection, and emergency buttons reduce high-risk moments.',
      },
      {
        title: 'Kitchen',
        body: 'Smart appliances, shutoff support, leak detectors, pull-out access, medication reminders, and easier lighting help daily routines stay safer.',
      },
      {
        title: 'Bedroom and living room',
        body: 'Voice assistance, automated lighting, smart sensors, wearable alerts, and health monitoring support nighttime and everyday independence.',
      },
    ],
  },
  es: {
    eyebrow: 'Tecnología CasaMia',
    title: 'Tecnología que protege,',
    accent: 'instalada en casa.',
    intro:
      'Acceso, luces, alertas y salud conectados para proteger cada estancia sin complicar la casa.',
    primaryCta: 'Ver inclusiones por paquete',
    secondaryCta: 'Comparar planes',
    systemEyebrow: 'Qué hace la tecnología',
    systemTitle: 'Pensada para los momentos que más preocupan a las familias.',
    roomEyebrow: 'Estancia por estancia',
    roomTitle: 'Tecnología que ayuda sin complicar la casa.',
    packagesEyebrow: 'Inclusiones por paquete',
    packagesTitle: 'Todo lo que incluye cada paquete CasaMia.',
    packagesIntro:
      'Usa esta sección para entender qué se instala o gestiona en Essential, Advanced y Premium antes de elegir un plan.',
    viewPlan: 'Ver plan completo',
    allInclusions: 'Todas las inclusiones',
    finalTitle: '¿No sabes qué nivel de tecnología encaja con la vivienda?',
    finalBody:
      'Empieza con el informe de seguridad gratuito. CasaMia puede revisar las estancias, detectar riesgos y recomendar el paquete adecuado.',
    finalCta: 'Empezar informe gratis',
    systems: [
      {
        icon: 'shield',
        title: 'Acceso y respuesta de emergencia',
        body: 'Cerraduras inteligentes, comunicación por video, botones de emergencia y sistemas de alerta ayudan a evitar movimientos apresurados y retrasos ante una urgencia.',
        bullets: ['Acceso inteligente', 'Botones de emergencia', 'Alertas familiares'],
      },
      {
        icon: 'home',
        title: 'Iluminación y control diario',
        body: 'Luces con movimiento, control por voz, enchufes inteligentes y rutinas más seguras facilitan moverse de día y de noche.',
        bullets: ['Iluminación con sensor', 'Control por voz', 'Enchufes y aparatos smart'],
      },
      {
        icon: 'heart',
        title: 'Monitorización y tranquilidad',
        body: 'Premium puede incluir recordatorios de medicación, dispositivos de constantes, detección de caídas, sensores de humo/CO y avisos familiares.',
        bullets: ['Salud y constantes', 'Detección de caídas', 'Recordatorios de medicación'],
      },
    ],
    rooms: [
      {
        title: 'Entrada y escaleras',
        body: 'Cerraduras inteligentes, videoportero, iluminación en pasamanos, luces con movimiento, bandas antideslizantes y alertas de caída ayudan en accesos y pasos.',
      },
      {
        title: 'Baño',
        body: 'Superficies antideslizantes, barras de apoyo, mejor iluminación, control de temperatura, detección de fugas y botones de emergencia reducen los momentos de mayor riesgo.',
      },
      {
        title: 'Cocina',
        body: 'Electrodomésticos inteligentes, apoyo de apagado, detectores de fugas, acceso extraíble, recordatorios de medicación e iluminación fácil hacen la rutina más segura.',
      },
      {
        title: 'Dormitorio y salón',
        body: 'Asistencia por voz, iluminación automática, sensores smart, alertas portátiles y monitorización de salud apoyan la independencia diaria y nocturna.',
      },
    ],
  },
}

function getTechCopy(language: string) {
  return language.startsWith('es') ? techCopy.es : techCopy.en
}

function TechIcon({ type }: { type: 'shield' | 'home' | 'heart' }) {
  if (type === 'home') {
    return <Home size={26} aria-hidden="true" />
  }

  if (type === 'heart') {
    return <HeartPulse size={26} aria-hidden="true" />
  }

  return <ShieldCheck size={26} aria-hidden="true" />
}

const planRouteMap: Record<string, string> = {
  advanced: 'home-safety',
  essential: 'home-assessment',
  premium: 'smart-safety',
}

export function TechPage() {
  const { i18n } = useTranslation()
  const copy = getTechCopy(i18n.language)

  return (
    <>
      <section className="tech-hero">
        <div className="tech-hero-grid site-shell">
          <div>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-tight text-white md:text-6xl">
              {copy.title}{' '}
              <span className="italic-accent text-green">{copy.accent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/80">
              {copy.intro}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link className="btn btn-green" to="#package-inclusions">
                {copy.primaryCta}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/plans">
                {copy.secondaryCta}
              </Link>
            </div>
          </div>

          <SafeImage
            src={IMAGE_URLS.gallery[2]}
            alt="Smart home safety technology"
            className="tech-hero-media overflow-hidden rounded-lg"
            imgClassName="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell">
          <div className="max-w-3xl">
            <p className="eyebrow">{copy.systemEyebrow}</p>
            <h2 className="display-title mt-5">{copy.systemTitle}</h2>
          </div>

          <div className="tech-system-grid mt-12">
            {copy.systems.map((system) => (
              <article className="tech-system-card" key={system.title}>
                <span className="tech-system-icon">
                  <TechIcon type={system.icon} />
                </span>
                <h3>{system.title}</h3>
                <p>{system.body}</p>
                <ul>
                  {system.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Check size={16} aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-light-blue">
        <div className="site-shell">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">{copy.roomEyebrow}</p>
            <h2 className="display-title mt-5">{copy.roomTitle}</h2>
          </div>

          <div className="tech-room-grid mt-12">
            {copy.rooms.map((room) => (
              <article className="tech-room-item" key={room.title}>
                <h3>{room.title}</h3>
                <p>{room.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white" id="package-inclusions">
        <div className="site-shell">
          <div className="max-w-4xl">
            <p className="eyebrow">{copy.packagesEyebrow}</p>
            <h2 className="display-title mt-5">{copy.packagesTitle}</h2>
            <p className="mt-5 text-xl leading-relaxed text-text-mid">
              {copy.packagesIntro}
            </p>
          </div>

          <div className="tech-package-stack mt-12">
            {PLAN_DETAIL_LIST.map((plan) => (
              <article className="tech-package-card" key={plan.id}>
                <header className="tech-package-header">
                  <div>
                    <p>{plan.marketingName}</p>
                    <h3>{plan.shopifyTitle}</h3>
                  </div>
                  <div className="tech-package-price">
                    <strong>{plan.price}</strong>
                    <span>one-time</span>
                  </div>
                </header>

                <p className="mt-5 max-w-4xl text-text-mid">{plan.summary}</p>
                <p className="mt-8 text-sm font-extrabold uppercase text-navy">
                  {copy.allInclusions}
                </p>

                <div className="tech-inclusion-grid mt-5">
                  {plan.included.map((section) => (
                    <section className="tech-inclusion-group" key={section.title}>
                      <h4>{section.title}</h4>
                      <ul>
                        {section.items.map((item) => (
                          <li key={item}>
                            <Check size={16} aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>

                <Link className="btn btn-navy mt-8" to={`/plans/${planRouteMap[plan.id] ?? plan.id}`}>
                  {copy.viewPlan}
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-pale-blue py-14">
        <div className="tech-final-cta site-shell">
          <div>
            <h2>{copy.finalTitle}</h2>
            <p>{copy.finalBody}</p>
          </div>
          <Link className="btn btn-green" to="/#estimate-upload">
            {copy.finalCta}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
