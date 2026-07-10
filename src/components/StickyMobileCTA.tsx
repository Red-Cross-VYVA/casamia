import { ClipboardCheck, Home } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { trackEvent } from '../utils/analytics'
import { requestSafetyReportModal } from '../utils/safetyReportModal'

const hiddenRoutes = ['/internal']

export function StickyMobileCTA() {
  const { t } = useTranslation()
  const location = useLocation()

  if (hiddenRoutes.some((route) => location.pathname.startsWith(route))) {
    return null
  }

  function handleFreeReportClick(event: MouseEvent<HTMLAnchorElement>) {
    trackEvent('cta_click', { location: 'sticky_mobile', target: 'free_report' })
    requestSafetyReportModal()

    if (location.pathname === '/') {
      event.preventDefault()
    }
  }

  return (
    <div className="sticky-mobile-cta" aria-label={t('stickyCta.aria')}>
      <Link
        className="sticky-mobile-cta-link is-primary"
        to="/#top"
        onClick={handleFreeReportClick}
      >
        <ClipboardCheck size={18} aria-hidden="true" />
        {t('stickyCta.freeReport')}
      </Link>
      <Link
        className="sticky-mobile-cta-link"
        to="/home-safety-assessment"
        onClick={() => trackEvent('cta_click', { location: 'sticky_mobile', target: 'book_visit' })}
      >
        <Home size={18} aria-hidden="true" />
        {t('stickyCta.bookVisit')}
      </Link>
    </div>
  )
}
