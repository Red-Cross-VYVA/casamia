import { ChevronDown, Mail, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { BrandLogo } from './BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { allNeedLandingPages, needLandingPages } from '../constants/needLandingPages'
import { localizeNeedLandingPages } from '../constants/needLandingPagesLocalization'
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

const solutionMenuGroups = [
  {
    title: { en: 'Bathroom safety', es: 'Seguridad en el baño' },
    slugs: ['bathroom-safety-for-seniors', 'safe-bathroom-access'],
  },
  {
    title: { en: 'Falls & assessment', es: 'Caídas y revisión del hogar' },
    slugs: [
      'fall-prevention-at-home',
      'aging-in-place-home-assessment',
      'home-adaptations-for-elderly',
      'home-safety-after-hospital-discharge',
    ],
  },
  {
    title: { en: 'Bedroom & connected living', es: 'Dormitorio y vida conectada' },
    slugs: ['senior-bedroom-safety', 'connected-home-for-seniors'],
  },
  {
    title: { en: 'Grants', es: 'Ayudas' },
    slugs: ['grants-for-home-adaptations-spain'],
  },
] as const

export function Nav() {
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const assessmentPath = getAssessmentPath()
  const isSpanish = i18n.language.startsWith('es')
  const localizedNeedLandingPages = localizeNeedLandingPages(needLandingPages, i18n.language)
  const navLabels = {
    home: t('nav.home'),
    howItWorks: t('nav.howItWorks'),
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
      match: ['/services', '/plans', ...allNeedLandingPages.map((page) => page.path)],
    },
    { label: navLabels.howItWorks, to: '/how-it-works', match: ['/how-it-works'] },
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
          label: isSpanish ? 'Lista completa para imprimir' : 'Printable home checklist',
          to: '/blog',
        },
        {
          label: isSpanish ? 'Revisión online de seguridad' : 'Online safety review',
          to: '/home-safety-assessment#self-inspection-tool',
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
      ],
    },
    {
      title: isSpanish ? 'Decidir con calma' : 'Decision support',
      links: [
        {
          label: isSpanish ? 'Ayudas y documentación' : 'Grants and paperwork',
          to: '/blog/home-adaptation-grants-spain-family-guide',
        },
        {
          label: isSpanish ? 'Elegir proveedor' : 'Choosing a provider',
          to: '/blog/choose-home-safety-provider-spain',
        },
        {
          label: isSpanish ? 'Antes de la visita' : 'Before the visit',
          to: '/blog/family-conversation-before-home-safety-visit',
        },
        {
          label: isSpanish ? 'Casa o residencia' : 'Home or residence',
          to: '/blog/when-home-adaptations-are-not-enough',
        },
        {
          label: isSpanish ? 'Tecnología sin complicar' : 'Simple connected safety',
          to: '/blog/smart-home-safety-without-overcomplicating',
        },
      ],
    },
    {
      title: isSpanish ? 'Páginas por necesidad' : 'Room safety pages',
      links: [
        {
          label: isSpanish ? 'Acceso seguro al baño' : 'Safer bathroom access',
          to: '/safe-bathroom-access',
        },
        {
          label: isSpanish ? 'Dormitorio más seguro' : 'Safer bedroom routines',
          to: '/senior-bedroom-safety',
        },
        {
          label: isSpanish ? 'Prevención de caídas en casa' : 'Fall prevention at home',
          to: '/fall-prevention-at-home',
        },
        {
          label: isSpanish ? 'Ayudas para adaptar la vivienda' : 'Home adaptation grants',
          to: '/grants-for-home-adaptations-spain',
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
                  <div className="site-header-mega-menu" aria-label="CasaMia solutions by need">
                    <div className="site-header-mega-panel">
                      <div className="site-header-mega-intro">
                        <span>{isSpanish ? 'Soluciones por necesidad' : 'Solutions by need'}</span>
                        <strong>{isSpanish ? 'Empieza por la preocupación, no por el producto.' : 'Start from the concern, not the product.'}</strong>
                        <Link to="/services">
                          {isSpanish ? 'Ver el catálogo completo' : 'View full service catalogue'}
                        </Link>
                      </div>
                      <div className="site-header-mega-grid">
                        {solutionMenuGroups.map((group) => {
                          const groupTitle = group.title[isSpanish ? 'es' : 'en']

                          return (
                            <div className="site-header-mega-column" key={groupTitle}>
                              <p>{groupTitle}</p>
                              {group.slugs.map((slug) => {
                                const page = localizedNeedLandingPages.find((item) => item.slug === slug)
                                return page ? (
                                  <Link key={page.slug} to={page.path}>
                                    {page.title}
                                  </Link>
                                ) : null
                              })}
                            </div>
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
            <div className="site-mobile-needs">
              <p>{isSpanish ? 'Necesidades frecuentes' : 'Popular needs'}</p>
              {solutionMenuGroups.map((group) => {
                const groupTitle = group.title[isSpanish ? 'es' : 'en']

                return (
                <div key={groupTitle}>
                  <span>{groupTitle}</span>
                  {group.slugs.map((slug) => {
                    const page = localizedNeedLandingPages.find((item) => item.slug === slug)
                    return page ? (
                      <Link key={page.slug} to={page.path}>
                        {page.title}
                      </Link>
                    ) : null
                  })}
                </div>
              )})}
            </div>
            <div className="site-mobile-needs">
              <p>{isSpanish ? 'Recursos útiles' : 'Useful resources'}</p>
              {resourceMenuGroups.map((group) => (
                <div key={group.title}>
                  <span>{group.title}</span>
                  {group.links.map((item) => (
                    <Link key={`${group.title}-${item.to}-${item.label}`} to={item.to}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
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
