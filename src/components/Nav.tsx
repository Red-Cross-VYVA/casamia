import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { BrandLogo } from './BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'

const planAssessmentMap: Record<string, string> = {
  advanced: 'home-safety',
  essential: 'home-assessment',
  premium: 'smart-safety',
  'home-assessment': 'home-assessment',
  'home-safety': 'home-safety',
  'smart-safety': 'smart-safety',
}

function getAssessmentPath(pathname: string) {
  const planId = pathname.match(/^\/plans\/([^/]+)/)?.[1]
  const selectedPlan = planId ? planAssessmentMap[planId] : undefined

  return selectedPlan
    ? `/home-safety-assessment?plan=${selectedPlan}`
    : '/home-safety-assessment'
}

export function Nav() {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const assessmentPath = getAssessmentPath(location.pathname)

  const links = [
    { label: t('nav.howItWorks'), to: '/#how-it-works' },
    { label: t('nav.plans'), to: '/#plans' },
    { label: t('nav.grants'), to: '/#grants' },
    { label: t('nav.about', { defaultValue: 'About' }), to: '/about' },
    { label: t('nav.whyCasamia', { defaultValue: 'Why CasaMia' }), to: '/why-casamia' },
    { label: t('nav.freeAssessment', { defaultValue: 'In-Home Visit' }), to: assessmentPath },
    { label: t('nav.contact'), to: '/#contact' },
  ]
  const desktopLinks = links.filter((link) => link.to !== assessmentPath)

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
          {desktopLinks.map((link) => (
            <Link key={link.to} className="nav-link" to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="site-header-actions">
          <a
            className="site-header-phone"
            href={`tel:${t('nav.phone').replaceAll(' ', '')}`}
          >
            <Phone size={17} aria-hidden="true" />
            {t('nav.phone')}
          </a>
          <Link className="site-header-cta btn btn-green" to={assessmentPath}>
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
            {links.map((link) => (
              <Link key={link.to} className="nav-link min-h-12 py-2 text-lg" to={link.to}>
                {link.label}
              </Link>
            ))}
            <a className="nav-link min-h-12 py-2 text-lg" href={`tel:${t('nav.phone').replaceAll(' ', '')}`}>
              {t('nav.phone')}
            </a>
            <Link className="btn btn-green w-full" to={assessmentPath}>
              {t('nav.cta')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      ) : null}
    </header>
  )
}
