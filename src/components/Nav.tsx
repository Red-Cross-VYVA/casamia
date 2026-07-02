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
    ? `/free-home-safety-assessment?plan=${selectedPlan}`
    : '/free-home-safety-assessment'
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
    { label: t('nav.freeAssessment', { defaultValue: 'Free Assessment' }), to: assessmentPath },
    { label: t('nav.contact'), to: '/#contact' },
  ]

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.hash])

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <nav className="site-shell flex min-h-16 items-center justify-between gap-4">
        <Link className="flex shrink-0 items-center gap-3" to="/#top" aria-label="CasaMia">
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-7 xl:flex 2xl:gap-9">
          {links.map((link) => (
            <Link key={link.to} className="nav-link" to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 xl:flex 2xl:gap-5">
          <a
            className="inline-flex min-w-max items-center gap-2 whitespace-nowrap text-sm font-extrabold text-navy"
            href={`tel:${t('nav.phone').replaceAll(' ', '')}`}
          >
            <Phone size={17} aria-hidden="true" />
            {t('nav.phone')}
          </a>
          <Link className="btn btn-green min-h-0 min-w-max whitespace-nowrap px-6 py-2 text-sm" to={assessmentPath}>
            {t('nav.cta')}
          </Link>
          <LanguageSwitcher compact />
        </div>

        <button
          type="button"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full bg-light-blue text-navy xl:hidden"
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.menu')}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-border bg-white px-5 py-5 shadow-soft xl:hidden">
          <div className="mx-auto flex max-w-site flex-col gap-4">
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
