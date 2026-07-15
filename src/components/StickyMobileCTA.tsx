import { CalendarCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { trackEvent } from '../utils/analytics'

const hiddenRoutes = ['/internal']

export function StickyMobileCTA() {
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const label = i18n.language.startsWith('es') ? 'Reservar evaluaci\u00f3n' : 'Book Assessment'

  if (hiddenRoutes.some((route) => location.pathname.startsWith(route))) {
    return null
  }

  return (
    <div className="sticky-mobile-cta" aria-label={t('stickyCta.aria')}>
      <Link
        className="sticky-mobile-cta-link is-primary is-single"
        to="/home-safety-assessment"
        onClick={() => trackEvent('assessment_booking_started', { location: 'sticky_mobile' })}
      >
        <CalendarCheck size={18} aria-hidden="true" />
        {label}
      </Link>
    </div>
  )
}
