import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { IMAGE_URLS } from '../constants/shopify'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Nav() {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)

  const links = [
    { label: t('nav.howItWorks'), to: '/#how-it-works' },
    { label: t('nav.plans'), to: '/#plans' },
    { label: t('nav.grants'), to: '/#grants' },
    { label: t('nav.contact'), to: '/#contact' },
  ]

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.hash])

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <nav className="site-shell flex min-h-16 items-center justify-between gap-6">
        <Link className="flex shrink-0 items-center gap-3" to="/#top" aria-label="CasaMia">
          {logoFailed ? (
            <span className="font-display text-2xl font-black text-navy">CasaMia</span>
          ) : (
            <img
              src={IMAGE_URLS.logo}
              alt={t('alts.logo')}
              className="h-9 w-auto"
              onError={() => setLogoFailed(true)}
            />
          )}
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          {links.map((link) => (
            <Link key={link.to} className="nav-link" to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            className="inline-flex items-center gap-2 text-sm font-bold text-navy"
            href={`tel:${t('nav.phone').replaceAll(' ', '')}`}
          >
            <Phone size={17} aria-hidden="true" />
            {t('nav.phone')}
          </a>
          <Link className="btn btn-green min-h-0 px-5 py-2 text-sm" to="/#plans">
            {t('nav.cta')}
          </Link>
          <LanguageSwitcher compact />
        </div>

        <button
          type="button"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full bg-light-blue text-navy lg:hidden"
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.menu')}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-border bg-white px-5 py-5 shadow-soft lg:hidden">
          <div className="mx-auto flex max-w-site flex-col gap-4">
            {links.map((link) => (
              <Link key={link.to} className="nav-link min-h-12 py-2 text-lg" to={link.to}>
                {link.label}
              </Link>
            ))}
            <a className="nav-link min-h-12 py-2 text-lg" href={`tel:${t('nav.phone').replaceAll(' ', '')}`}>
              {t('nav.phone')}
            </a>
            <Link className="btn btn-green w-full" to="/#plans">
              {t('nav.cta')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      ) : null}
    </header>
  )
}
