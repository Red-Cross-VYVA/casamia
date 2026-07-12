import { ArrowRight } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { IMAGE_URLS } from '../constants/shopify'
import { SafeImage } from './SafeImage'
import { trackEvent } from '../utils/analytics'
import { requestSafetyReportModal } from '../utils/safetyReportModal'

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
  to = '/#top',
}: FinalCTAProps) {
  const { t } = useTranslation()
  const location = useLocation()

  function handleCtaClick(event: MouseEvent<HTMLAnchorElement>) {
    trackEvent('cta_click', { location: 'final_cta', target: to })

    if (to !== '/#top' && to !== '/#estimate-upload') {
      return
    }

    requestSafetyReportModal()

    if (location.pathname === '/') {
      event.preventDefault()
    }
  }

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
          <Link
            className="btn btn-white mt-8"
            to={to}
            onClick={handleCtaClick}
          >
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
