import { Mail, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { BrandLogo } from './BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
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

export function Nav() {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const assessmentPath = getAssessmentPath()
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
    { label: navLabels.howItWorks, to: '/how-it-works', match: ['/how-it-works'] },
    { label: navLabels.solutions, to: '/services', match: ['/services', '/plans'] },
    { label: navLabels.organisations, to: '/assisted-living-solutions', match: ['/assisted-living-solutions'] },
    { label: navLabels.resources, to: '/blog', match: ['/blog', '/resources'] },
    { label: navLabels.about, to: '/why-us', match: ['/why-us', '/why-casamia', '/about', '/contact'] },
  ]
  const desktopLinks = links

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
