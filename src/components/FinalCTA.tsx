import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { IMAGE_URLS } from '../constants/shopify'
import { SafeImage } from './SafeImage'

type FinalCTAProps = {
  title?: string
  body?: string
  cta?: string
  to?: string
}

export function FinalCTA({
  title,
  body,
  cta,
  to = '/free-home-safety-assessment',
}: FinalCTAProps) {
  const { t } = useTranslation()

  return (
    <section className="final-cta-section section-pad bg-blue text-white" id="contact">
      <div className="final-grid site-shell items-center gap-16">
        <div>
          <h2 className="whitespace-pre-line font-display text-5xl font-bold leading-tight md:text-6xl">
            {title ?? t('finalCta.title')}
          </h2>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/90">
            {body ?? t('finalCta.body')}
          </p>
          <Link className="btn btn-white mt-8" to={to}>
            {cta ?? t('finalCta.cta')}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>

        <div className="final-image-shell">
          <SafeImage
            src={IMAGE_URLS.finalCta}
            alt={t('alts.finalCta')}
            className="final-image-frame overflow-hidden shadow-soft"
            imgClassName="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
