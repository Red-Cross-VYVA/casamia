import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BrandLogo } from './BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { legalRouteLabels } from '../constants/legalDocuments'

export function Footer() {
  const { t } = useTranslation()
  const companyLinks = [
    { label: t('nav.home', { defaultValue: 'Home' }), to: '/' },
    { label: t('nav.howItWorks'), to: '/how-it-works' },
    { label: t('nav.services', { defaultValue: 'Solutions' }), to: '/services' },
    { label: t('nav.plans'), to: '/plans' },
    { label: t('nav.grants'), to: '/grants' },
    { label: 'Provider Partners', to: '/provider-partners' },
    { label: t('nav.whyCasamia', { defaultValue: 'Why us' }), to: '/why-us' },
    { label: 'Blog', to: '/blog' },
    { label: t('nav.about', { defaultValue: 'About Us' }), to: '/about' },
  ]
  const legalLinks = legalRouteLabels
  const supportLinks = [
    { label: t('nav.beforeAfter', { defaultValue: 'Before & After' }), to: '/before-after' },
    { label: 'Plan Adapta', to: '/plan-adapta' },
    { label: t('nav.freeAssessment', { defaultValue: 'Book Visit' }), to: '/home-safety-assessment' },
  ]

  return (
    <footer className="bg-ink text-white">
      <div className="footer-grid site-shell gap-12 py-16">
        <div>
          <Link className="inline-flex items-center" to="/#top" aria-label="CasaMia">
            <BrandLogo variant="footer" />
          </Link>
          <p className="mt-5 max-w-sm text-white/70">{t('footer.tagline')}</p>
          <a className="mt-5 inline-block font-display text-2xl font-black text-green" href={`tel:${t('footer.phone').replaceAll(' ', '')}`}>
            {t('footer.phone')}
          </a>
        </div>

        <FooterColumn title={t('footer.company.title')}>
          {companyLinks.map((link) => (
            <Link className="transition hover:text-green" key={`${link.to}-${link.label}`} to={link.to}>
              {link.label}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title={t('footer.legal.title')}>
          {legalLinks.map((link) => (
            <Link className="transition hover:text-green" key={`${link.path}-${link.label}`} to={link.path}>
              {link.label}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title={t('footer.support.title')}>
          {supportLinks.map((link) => (
            <Link className="transition hover:text-green" key={`${link.to}-${link.label}`} to={link.to}>
              {link.label}
            </Link>
          ))}
        </FooterColumn>
      </div>

      <div className="border-t border-white/10">
        <div className="site-shell flex flex-col items-start justify-between gap-5 py-6 md:flex-row md:items-center">
          <p className="text-sm text-white/60">{t('footer.copyright')}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="footer-cookie-button"
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('casamia:open-cookie-preferences'))}
            >
              Cookie preferences
            </button>
            <LanguageSwitcher compact inverted />
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-extrabold uppercase text-white">{title}</h2>
      <div className="flex flex-col gap-3 text-white/70">{children}</div>
    </div>
  )
}
