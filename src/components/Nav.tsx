import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { BrandLogo } from './BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { trackEvent } from '../utils/analytics'

const planAssessmentMap: Record<string, string> = {
  advanced: 'home-safety',
  essential: 'home-assessment',
  premium: 'smart-safety',
  'home-assessment': 'home-assessment',
  'home-safety': 'home-safety',
  'smart-safety': 'smart-safety',
}

type HeaderLink = {
  label: string
  to: string
  match: string[]
}

function getAssessmentPath(pathname: string) {
  const planId = pathname.match(/^\/plans\/([^/]+)/)?.[1]
  const selectedPlan = planId ? planAssessmentMap[planId] : undefined

  return selectedPlan
    ? `/home-safety-assessment?plan=${selectedPlan}`
    : '/home-safety-assessment'
}

function isActiveLink(pathname: string, link: HeaderLink) {
  return link.match.some((matchPath) => pathname === matchPath || pathname.startsWith(`${matchPath}/`))
}

export function Nav() {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const assessmentPath = getAssessmentPath(location.pathname)

  const links: HeaderLink[] = [
    { label: t('nav.howItWorks'), to: '/how-it-works', match: ['/how-it-works'] },
    { label: t('nav.services', { defaultValue: 'Services' }), to: '/services', match: ['/services'] },
    { label: t('nav.plans'), to: '/plans', match: ['/plans'] },
    { label: t('nav.grants'), to: '/grants', match: ['/grants', '/grant-check', '/plan-adapta'] },
    { label: t('nav.resources', { defaultValue: 'Resources' }), to: '/resources', match: ['/resources'] },
    { label: t('nav.whyCasamia', { defaultValue: 'Why CasaMia' }), to: '/why-casamia', match: ['/why-casamia'] },
    { label: t('nav.contact'), to: '/contact', match: ['/contact'] },
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
            href={`tel:${t('nav.phone').replaceAll(' ', '')}`}
            onClick={() => trackEvent('cta_click', { location: 'nav', target: 'phone' })}
          >
            <Phone size={17} aria-hidden="true" />
            {t('nav.phone')}
          </a>
          <Link
            className="site-header-cta btn btn-green"
            to={assessmentPath}
            onClick={() => trackEvent('cta_click', { location: 'nav', target: 'book_visit' })}
          >
            {t('nav.cta')}
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
            <a className="nav-link min-h-12 py-2 text-lg" href={`tel:${t('nav.phone').replaceAll(' ', '')}`}>
              {t('nav.phone')}
            </a>
            <Link
              className="btn btn-green w-full"
              to={assessmentPath}
              onClick={() => trackEvent('cta_click', { location: 'mobile_nav', target: 'book_visit' })}
            >
              {t('nav.cta')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      ) : null}
    </header>
  )
}
