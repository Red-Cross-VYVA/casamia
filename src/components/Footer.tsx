import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BrandLogo } from './BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { getLegalRouteLabels } from '../constants/legalDocuments'
import { needLandingPages } from '../constants/needLandingPages'
import { localizeNeedLandingPages } from '../constants/needLandingPagesLocalization'
import { trackEvent } from '../utils/analytics'
import { CASAMIA_CONTACT_EMAIL } from '../constants/contact'

const footerLinkCopy = {
  en: {
    plan: 'Home Safety Plan',
    services: 'Senior Home Safety Services',
    organisations: 'Solutions for Senior Living',
    providers: 'Provider Partners',
    serviceAreas: 'Service Areas in Spain',
    resources: 'Senior Home Safety Resources',
    howItWorks: 'How CasaMia Works',
    whyUs: 'Why Choose CasaMia',
    visit: 'Book a Home Safety Visit',
    beforeAfter: 'Before & After Projects',
    needs: 'Popular needs',
    resourcesTitle: 'Useful resources',
    freeTools: 'Free safety tools',
    checklist: 'Printable home checklist',
    onlineCheck: 'Online safety review',
    costComparison: 'Home vs residence cost',
    grantsGuide: 'Grants and paperwork',
    visitPrep: 'Before the visit',
    fallPrevention: 'Fall prevention guide',
    bathroomSafety: 'Bathroom safety guide',
    preferences: 'Cookie preferences',
  },
  es: {
    plan: 'Plan de seguridad del hogar',
    services: 'Servicios de adaptación de vivienda',
    organisations: 'Soluciones para residencias senior',
    providers: 'Colaboradores profesionales',
    serviceAreas: 'Zonas de servicio en España',
    resources: 'Recursos de seguridad en casa',
    howItWorks: 'Cómo funciona CasaMia',
    whyUs: 'Por qué elegir CasaMia',
    visit: 'Reservar visita de seguridad',
    beforeAfter: 'Antes y después de adaptaciones',
    needs: 'Necesidades frecuentes',
    resourcesTitle: 'Recursos útiles',
    freeTools: 'Herramientas gratuitas',
    checklist: 'Lista para imprimir',
    onlineCheck: 'Revisión online de seguridad',
    grantsGuide: 'Ayudas y documentación',
    visitPrep: 'Antes de la visita',
    fallPrevention: 'Guía de prevención de caídas',
    bathroomSafety: 'Guía de seguridad en el baño',
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
    { label: links.serviceAreas, to: '/service-areas' },
    { label: links.whyUs, to: '/why-us' },
    { label: links.resources, to: '/blog' },
    { label: t('nav.about', { defaultValue: 'About Us' }), to: '/about' },
  ]
  const legalRouteLabels = getLegalRouteLabels(i18n.language)
  const supportLinks = [
    { label: links.beforeAfter, to: '/before-after' },
    { label: language === 'es' ? 'Ayudas Plan Adapta' : 'Plan Adapta Grants', to: '/plan-adapta' },
    { label: links.visit, to: '/home-safety-assessment' },
  ]
  const resourceLinks = [
    { label: links.freeTools, to: '/tools' },
    { label: links.checklist, to: '/blog' },
    { label: links.onlineCheck, to: '/home-safety-assessment#self-inspection-tool' },
    {
      label: language === 'es' ? 'Casa o residencia: coste' : 'Home vs residence cost',
      to: '/tools/home-vs-residence-cost-calculator',
    },
    { label: links.grantsGuide, to: '/blog/home-adaptation-grants-spain-family-guide' },
    { label: links.visitPrep, to: '/blog/family-conversation-before-home-safety-visit' },
    { label: links.fallPrevention, to: '/blog/fall-prevention-home-checklist-spain' },
    { label: links.bathroomSafety, to: '/blog/bathroom-safety-seniors-costly-mistakes' },
  ]
  const needLinks = localizeNeedLandingPages(needLandingPages, i18n.language)
    .filter((page) => page.footerVisible !== false)
    .map((page) => ({ label: page.title, to: page.path }))

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
          {legalRouteLabels.map((link) => (
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
          <FooterSubColumn title={links.resourcesTitle}>
            {resourceLinks.map((link) => (
              <Link className="transition hover:text-green" key={`${link.to}-${link.label}`} to={link.to}>
                {link.label}
              </Link>
            ))}
          </FooterSubColumn>
        </FooterColumn>

        <FooterColumn title={links.needs}>
          {needLinks.map((link) => (
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

function FooterSubColumn({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5">
      <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/50">{title}</h3>
      {children}
    </div>
  )
}
