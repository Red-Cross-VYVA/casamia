import { BadgeEuro, Bath, BedDouble, ChevronDown, ClipboardCheck, Footprints, Mail, Menu, Wifi, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { BrandLogo } from './BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { allNeedLandingPages } from '../constants/needLandingPages'
import { trackEvent } from '../utils/analytics'
import { CASAMIA_CONTACT_EMAIL } from '../constants/contact'

type HeaderLink = {
  label: string
  to: string
  match: string[]
}

function getAssessmentPath() {
  return '/home-safety-assessment'
}

function isActiveLink(pathname: string, link: HeaderLink) {
  return link.match.some((matchPath) => pathname === matchPath || pathname.startsWith(`${matchPath}/`))
}

type NavLocale = 'en' | 'es' | 'nl'
type LocalizedNavText = Readonly<Record<NavLocale, string>>

function getNavLocale(language: string): NavLocale {
  const normalizedLanguage = language.toLowerCase()
  if (normalizedLanguage.startsWith('es')) return 'es'
  if (normalizedLanguage.startsWith('nl')) return 'nl'
  return 'en'
}

const solutionMenuCopy = {
  en: {
    eyebrow: 'Popular paths',
    title: 'What do you need to make safer?',
    primaryCta: 'See all solutions',
    secondaryCta: 'Book a visit',
    mobileHeading: 'Choose a safety path',
  },
  es: {
    eyebrow: 'Rutas frecuentes',
    title: '¿Qué necesitas hacer más seguro?',
    primaryCta: 'Ver soluciones',
    secondaryCta: 'Reservar visita',
    mobileHeading: 'Elige una ruta de seguridad',
  },
  nl: {
    eyebrow: 'Populaire keuzes',
    title: 'Wat moet veiliger worden?',
    primaryCta: 'Bekijk oplossingen',
    secondaryCta: 'Boek bezoek',
    mobileHeading: 'Kies een veiligheidsroute',
  },
} satisfies Record<NavLocale, Record<string, string>>

const solutionMenuItems = [
  {
    icon: Bath,
    to: '/bathroom-safety-for-seniors',
    title: { en: 'Bathroom safety', es: 'Baño seguro', nl: 'Veilige badkamer' },
    description: {
      en: 'Bathing, toilet transfers and wet-floor risk.',
      es: 'Ducha, WC y riesgo en suelo mojado.',
      nl: 'Douchen, toilet en natte vloeren.',
    },
  },
  {
    icon: Footprints,
    to: '/fall-prevention-at-home',
    title: { en: 'Prevent falls', es: 'Prevenir caídas', nl: 'Vallen voorkomen' },
    description: {
      en: 'Find the routines where risk builds up.',
      es: 'Detecta rutinas donde se acumula riesgo.',
      nl: 'Vind routines waar risico ontstaat.',
    },
  },
  {
    icon: ClipboardCheck,
    to: '/aging-in-place-home-assessment',
    title: { en: 'Home assessment', es: 'Revisión del hogar', nl: 'Woningcheck' },
    description: {
      en: 'Start with a clear review before works.',
      es: 'Empieza con una revisión clara.',
      nl: 'Begin met een duidelijke check.',
    },
  },
  {
    icon: BedDouble,
    to: '/senior-bedroom-safety',
    title: { en: 'Bedroom & night', es: 'Dormitorio y noche', nl: 'Slaapkamer en nacht' },
    description: {
      en: 'Bed transfers, lighting and night routes.',
      es: 'Cama, luz y rutas nocturnas.',
      nl: 'Bed, verlichting en nachtroutes.',
    },
  },
  {
    icon: Wifi,
    to: '/connected-home-for-seniors',
    title: { en: 'Connected support', es: 'Apoyo conectado', nl: 'Slimme ondersteuning' },
    description: {
      en: 'Simple alerts, voice help and routines.',
      es: 'Avisos, voz y rutinas sencillas.',
      nl: 'Eenvoudige meldingen en routines.',
    },
  },
  {
    icon: BadgeEuro,
    to: '/grants-for-home-adaptations-spain',
    title: { en: 'Grants guidance', es: 'Ayudas y trámites', nl: 'Subsidiehulp' },
    description: {
      en: 'Check possible routes and documents.',
      es: 'Revisa rutas posibles y documentos.',
      nl: 'Check routes en documenten.',
    },
  },
] as const

export function Nav() {
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const assessmentPath = getAssessmentPath()
  const isSpanish = i18n.language.startsWith('es')
  const navLocale = getNavLocale(i18n.language)
  const localizeMenuText = (text: LocalizedNavText) => text[navLocale]
  const currentSolutionMenuCopy = solutionMenuCopy[navLocale]
  const navLabels = {
    home: t('nav.home'),
    plans: t('nav.plans'),
    solutions: t('nav.services'),
    organisations: t('nav.organisations'),
    about: t('nav.whyCasamia'),
    resources: t('nav.resources'),
    cta: t('nav.cta'),
  }

  const links: HeaderLink[] = [
    { label: navLabels.home, to: '/#top', match: ['/'] },
    {
      label: navLabels.solutions,
      to: '/services',
      match: ['/services', ...allNeedLandingPages.map((page) => page.path)],
    },
    { label: navLabels.plans, to: '/plans', match: ['/plans'] },
    { label: navLabels.organisations, to: '/assisted-living-solutions', match: ['/assisted-living-solutions'] },
    { label: navLabels.resources, to: '/blog', match: ['/blog', '/resources', '/tools', '/service-areas'] },
    { label: navLabels.about, to: '/why-us', match: ['/why-us', '/why-casamia', '/about', '/contact'] },
  ]
  const desktopLinks = links
  const resourceMenuGroups = [
    {
      title: isSpanish ? 'Empieza aquí' : 'Start here',
      links: [
        {
          label: isSpanish ? 'Centro de recursos' : 'Resources hub',
          to: '/blog',
        },
        {
          label: isSpanish ? 'Herramientas gratuitas' : 'Free tools',
          to: '/tools',
        },
        {
          label: isSpanish ? 'Zonas de servicio' : 'Service areas',
          to: '/service-areas',
        },
      ],
    },
    {
      title: isSpanish ? 'Guías prácticas' : 'Practical guides',
      links: [
        {
          label: isSpanish ? 'Prevención de caídas' : 'Fall prevention',
          to: '/blog/fall-prevention-home-checklist-spain',
        },
        {
          label: isSpanish ? 'Seguridad en el baño' : 'Bathroom safety',
          to: '/blog/bathroom-safety-seniors-costly-mistakes',
        },
        {
          label: isSpanish ? 'Seguridad nocturna' : 'Night-time safety',
          to: '/blog/bedroom-night-safety-older-adults',
        },
        {
          label: isSpanish ? 'Ayudas y documentación' : 'Grants and paperwork',
          to: '/blog/home-adaptation-grants-spain-family-guide',
        },
      ],
    },
    {
      title: isSpanish ? 'Decidir con calma' : 'Decision support',
      links: [
        {
          label: isSpanish ? 'Evaluación o contratista' : 'Assessment or contractor',
          to: '/home-safety-assessment-vs-general-contractor',
        },
        {
          label: isSpanish ? 'Tecnología o monitorización' : 'Smart safety or monitoring',
          to: '/smart-home-safety-vs-monitoring',
        },
        {
          label: isSpanish ? 'Antes de la visita' : 'Before the visit',
          to: '/blog/family-conversation-before-home-safety-visit',
        },
      ],
    },
  ]

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.hash])

  return (
    <header className="site-header">
      <nav className="site-header-inner site-shell">
        <Link className="site-header-logo" to="/#top" aria-label="CasaMia">
          <BrandLogo />
        </Link>

        <div className="site-header-links">
          {desktopLinks.map((link) => {
            const active = isActiveLink(location.pathname, link)

            if (link.to === '/services') {
              return (
                <div className="site-header-menu-group" key={link.to}>
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`nav-link site-header-menu-trigger${active ? ' is-active' : ''}`}
                    to={link.to}
                  >
                    {link.label}
                    <ChevronDown size={15} aria-hidden="true" />
                  </Link>
                  <div className="site-header-mega-menu site-header-mega-menu--solutions" aria-label="CasaMia solutions by need">
                    <div className="site-header-mega-panel site-header-mega-panel--solutions">
                      <div className="site-header-mega-intro">
                        <span>{currentSolutionMenuCopy.eyebrow}</span>
                        <strong>{currentSolutionMenuCopy.title}</strong>
                        <div className="site-header-mega-actions">
                          <Link className="is-primary" to="/services">
                            {currentSolutionMenuCopy.primaryCta}
                          </Link>
                          <Link to={assessmentPath}>
                            {currentSolutionMenuCopy.secondaryCta}
                          </Link>
                        </div>
                      </div>
                      <div className="site-header-solution-grid">
                        {solutionMenuItems.map((item) => {
                          const Icon = item.icon
                          const itemActive = location.pathname === item.to

                          return (
                            <Link
                              className={`site-header-solution-card${itemActive ? ' is-active' : ''}`}
                              key={item.to}
                              to={item.to}
                            >
                              <span className="site-header-solution-icon">
                                <Icon size={19} aria-hidden="true" />
                              </span>
                              <span className="site-header-solution-copy">
                                <strong>{localizeMenuText(item.title)}</strong>
                                <small>{localizeMenuText(item.description)}</small>
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            if (link.to === '/blog') {
              return (
                <div className="site-header-menu-group" key={link.to}>
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`nav-link site-header-menu-trigger${active ? ' is-active' : ''}`}
                    to={link.to}
                  >
                    {link.label}
                    <ChevronDown size={15} aria-hidden="true" />
                  </Link>
                  <div className="site-header-mega-menu" aria-label="CasaMia resources by situation">
                    <div className="site-header-mega-panel">
                      <div className="site-header-mega-intro">
                        <span>{isSpanish ? 'Recursos por situación' : 'Resources by situation'}</span>
                        <strong>{isSpanish ? 'Encuentra el siguiente paso útil.' : 'Find the next useful step.'}</strong>
                        <Link to="/blog">
                          {isSpanish ? 'Ver todos los recursos' : 'View all resources'}
                        </Link>
                      </div>
                      <div className="site-header-mega-grid">
                        {resourceMenuGroups.map((group) => (
                          <div className="site-header-mega-column" key={group.title}>
                            <p>{group.title}</p>
                            {group.links.map((item) => (
                              <Link key={`${group.title}-${item.to}-${item.label}`} to={item.to}>
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={link.to}
                aria-current={active ? 'page' : undefined}
                className={`nav-link${active ? ' is-active' : ''}`}
                to={link.to}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="site-header-actions">
          <a
            className="site-header-phone"
            href={`mailto:${CASAMIA_CONTACT_EMAIL}`}
            onClick={() => trackEvent('email_contact_clicked', { location: 'nav' })}
          >
            <Mail size={17} aria-hidden="true" />
            {CASAMIA_CONTACT_EMAIL}
          </a>
          <Link
            className="site-header-cta btn btn-green"
            to={assessmentPath}
            onClick={() => trackEvent('assessment_booking_started', { location: 'nav' })}
          >
            {navLabels.cta}
          </Link>
          <LanguageSwitcher compact />
        </div>

        <button
          type="button"
          className="site-header-menu-button"
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.menu')}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div className="site-mobile-menu">
          <div className="site-mobile-menu-inner">
            {links.map((link) => {
              const active = isActiveLink(location.pathname, link)

              return (
                <Link
                  key={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`nav-link min-h-12 py-2 text-lg${active ? ' is-active' : ''}`}
                  to={link.to}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="site-mobile-needs site-mobile-needs--solutions">
              <p>{currentSolutionMenuCopy.mobileHeading}</p>
              <div className="site-mobile-solution-list">
                {solutionMenuItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <Link key={item.to} to={item.to}>
                      <span className="site-mobile-solution-icon">
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span className="site-mobile-solution-copy">
                        <strong>{localizeMenuText(item.title)}</strong>
                        <small>{localizeMenuText(item.description)}</small>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="site-mobile-needs">
              <p>{isSpanish ? 'Recursos útiles' : 'Useful resources'}</p>
              <div className="site-mobile-quick-list">
                {resourceMenuGroups[0].links.map((item) => (
                  <Link key={`mobile-resource-${item.to}-${item.label}`} to={item.to}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <a
              className="nav-link min-h-12 py-2 text-lg"
              href={`mailto:${CASAMIA_CONTACT_EMAIL}`}
              onClick={() => trackEvent('email_contact_clicked', { location: 'mobile_nav' })}
            >
              {CASAMIA_CONTACT_EMAIL}
            </a>
            <Link
              className="btn btn-green w-full"
              to={assessmentPath}
              onClick={() => trackEvent('assessment_booking_started', { location: 'mobile_nav' })}
            >
              {navLabels.cta}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      ) : null}
    </header>
  )
}
