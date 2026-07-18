import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BrandLogo } from './BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { legalRouteLabels } from '../constants/legalDocuments'
import { trackEvent } from '../utils/analytics'
import { CASAMIA_CONTACT_EMAIL } from '../constants/contact'

const footerLinkCopy = {
  en: {
    plan: 'Your CasaMia Plan', services: 'Safety Services', organisations: 'Assisted Living Solutions',
    providers: 'Provider Partners', resources: 'Resources', preferences: 'Cookie preferences',
  },
  es: {
    plan: 'Tu plan CasaMia', services: 'Servicios de seguridad', organisations: 'Soluciones para organizaciones',
    providers: 'Colaboradores profesionales', resources: 'Recursos', preferences: 'Preferencias de cookies',
  },
  de: {
    plan: 'Ihr CasaMia-Plan', services: 'Sicherheitsleistungen', organisations: 'Lösungen für Einrichtungen',
    providers: 'Partnerbetriebe', resources: 'Ratgeber', preferences: 'Cookie-Einstellungen',
  },
  fr: {
    plan: 'Votre plan CasaMia', services: 'Services de sécurité', organisations: 'Solutions pour les établissements',
    providers: 'Partenaires professionnels', resources: 'Ressources', preferences: 'Préférences de cookies',
  },
  nl: {
    plan: 'Uw CasaMia-plan', services: 'Veiligheidsdiensten', organisations: 'Oplossingen voor organisaties',
    providers: 'Professionele partners', resources: 'Informatie', preferences: 'Cookievoorkeuren',
  },
} as const

const spanishLegalLabels: Record<string, string> = {
  'legal-notice': 'Aviso legal',
  'general-customer-terms': 'Condiciones generales para clientes',
  'privacy-policy': 'Política de privacidad',
  'cookie-policy': 'Política de cookies',
  'withdrawal-cancellation': 'Desistimiento y cancelación',
  'guarantees-aftercare': 'Garantías y servicio posventa',
  'complaints-contact': 'Reclamaciones y contacto',
  'accessibility-statement': 'Declaración de accesibilidad',
}

export function Footer() {
  const { i18n, t } = useTranslation()
  const language = i18n.language.toLowerCase().split('-')[0] as keyof typeof footerLinkCopy
  const links = footerLinkCopy[language] ?? footerLinkCopy.en
  const companyLinks = [
    { label: t('nav.home', { defaultValue: 'Home' }), to: '/' },
    { label: t('nav.howItWorks'), to: '/how-it-works' },
    { label: links.plan, to: '/plans' },
    { label: links.services, to: '/services' },
    { label: links.organisations, to: '/assisted-living-solutions' },
    { label: links.providers, to: '/provider-partners' },
    { label: t('nav.whyCasamia', { defaultValue: 'Why us' }), to: '/why-us' },
    { label: links.resources, to: '/blog' },
    { label: t('nav.about', { defaultValue: 'About Us' }), to: '/about' },
  ]
  const legalLinks = legalRouteLabels.map((link) => ({
    ...link,
    label: language === 'es' ? spanishLegalLabels[link.id] ?? link.label : link.label,
  }))
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
