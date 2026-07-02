import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BrandLogo } from './BrandLogo'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Footer() {
  const { t } = useTranslation()
  const companyLinks = t('footer.company.links', { returnObjects: true }) as string[]
  const legalLinks = t('footer.legal.links', { returnObjects: true }) as string[]
  const supportLinks = t('footer.support.links', { returnObjects: true }) as string[]
  const companyTargets = ['/#how-it-works', '/#plans', '/#grants', '/#contact']
  const supportTargets = ['/contact', '/grants', '/free-home-safety-assessment', '/about']

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
          {companyLinks.map((link, index) => (
            <Link className="transition hover:text-green" key={link} to={companyTargets[index]}>
              {link}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title={t('footer.legal.title')}>
          {legalLinks.map((link) => (
            <Link className="transition hover:text-green" key={link} to="/contact">
              {link}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title={t('footer.support.title')}>
          {supportLinks.map((link, index) => (
            <Link className="transition hover:text-green" key={link} to={supportTargets[index] ?? '/contact'}>
              {link}
            </Link>
          ))}
        </FooterColumn>
      </div>

      <div className="border-t border-white/10">
        <div className="site-shell flex flex-col items-start justify-between gap-5 py-6 md:flex-row md:items-center">
          <p className="text-sm text-white/60">{t('footer.copyright')}</p>
          <LanguageSwitcher compact inverted />
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
