import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BrandLogo } from './BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { getLegalRouteLabels } from '../constants/legalDocuments'
import { trackEvent } from '../utils/analytics'
import { CASAMIA_CONTACT_EMAIL } from '../constants/contact'

const footerLinkCopy = {
  en: {
    plan: 'Home Safety Plan',
    services: 'Senior Home Safety Services',
    organisations: 'Solutions for Senior Living',
    providers: 'Provider Partners',
    resources: 'Senior Home Safety Resources',
    howItWorks: 'How CasaMia Works',
    whyUs: 'Why Choose CasaMia',
    visit: 'Book a Home Safety Visit',
    beforeAfter: 'Before & After Projects',
    preferences: 'Cookie preferences',
  },
  es: {
    plan: 'Plan de seguridad del hogar',
    services: 'Servicios de adaptación de vivienda',
    organisations: 'Soluciones para residencias senior',
    providers: 'Colaboradores profesionales',
    resources: 'Recursos de seguridad en casa',
    howItWorks: 'Cómo funciona CasaMia',
    whyUs: 'Por qué elegir CasaMia',
    visit: 'Reservar visita de seguridad',
    beforeAfter: 'Antes y después de adaptaciones',
    preferences: 'Preferencias de cookies',
  },
} as const

export function Footer() {
  const { i18n, t } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const links = footerLinkCopy[language]
  const companyLinks = [
    { label: t('nav.home', { defaultValue: 'Home' }), to: '/' },
    { label: links.howItWorks, to: '/how-it-works' },
    { label: links.plan, to: '/plans' },
    { label: links.services, to: '/services' },
    { label: links.organisations, to: '/assisted-living-solutions' },
    { label: links.providers, to: '/provider-partners' },
    { label: links.whyUs, to: '/why-us' },
    { label: links.resources, to: '/blog' },
    { label: t('nav.about', { defaultValue: 'About Us' }), to: '/about' },
  ]
  const legalLinks = getLegalRouteLabels(i18n.language)
  const supportLinks = [
    { label: links.beforeAfter, to: '/before-after' },
    { label: language === 'es' ? 'Ayudas Plan Adapta' : 'Plan Adapta Grants', to: '/plan-adapta' },
    { label: links.visit, to: '/home-safety-assessment' },
  ]

  return (
    <footer className="bg-ink text-white">
      <div className="footer-grid site-shell gap-12 py-16">
        <div>
          <Link className="inline-flex items-center" to="/#top" aria-label="CasaMia">
            <BrandLogo variant="footer" />
          </Link>
          <p className="mt-5 max-w-sm text-white/70">{t('footer.tagline')}</p>
          <a
            className="mt-5 inline-block font-display text-2xl font-black text-green"
            href={`mailto:${CASAMIA_CONTACT_EMAIL}`}
            onClick={() => trackEvent('email_contact_clicked', { location: 'footer' })}
          >
            {CASAMIA_CONTACT_EMAIL}
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
              {links.preferences}
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
