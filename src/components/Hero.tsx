import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { IMAGE_URLS } from '../constants/shopify'
import '../styles/home-hero-ctas.css'
import '../styles/home-hero-grant.css'
import { GrantStamp } from './GrantStamp'
import { SafeImage } from './SafeImage'
import { UploadEstimator } from './UploadEstimator'

export function Hero() {
  const { t } = useTranslation()

  return (
    <section className="hero-section" id="top">
      <div className="hero-grid site-shell grid items-center">
        <div className="hero-content">
          <p className="hero-badge inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold">
            <span className="dot" aria-hidden="true" />
            {t('hero.badge')}
          </p>
          <h1 className="hero-title mt-8" aria-label={`${t('hero.line1')} ${t('hero.line2')}`}>
            <span className="block">{t('hero.line1')}</span>
            {' '}
            <span className="home-accent block">{t('hero.line2')}</span>
          </h1>
          <div className="hero-underline" aria-hidden="true" />
          <p className="hero-copy mt-8 max-w-xl text-xl leading-relaxed">
            {t('hero.sub')}
          </p>
          <Link className="hero-safety-wizard-link" to="/home-safety-wizard">
            <span><ShieldCheck size={22} aria-hidden="true" /></span>
            <strong>{t('wizard.cta')}</strong>
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
          <UploadEstimator />
        </div>

        <div className="hero-media-wrap relative mx-auto w-full max-w-lg lg:ml-auto">
          <div className="hero-photo-shell">
            <SafeImage
              src={IMAGE_URLS.hero}
              alt={t('alts.hero')}
              className="hero-photo-frame overflow-hidden"
              imgClassName="hero-photo-img h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <GrantStamp />
        </div>
      </div>
    </section>
  )
}
