import { Building2, CalendarCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { trackEvent } from '../utils/analytics'

const hiddenRoutes = ['/internal']

export function StickyMobileCTA() {
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const isFacilityPage = location.pathname === '/assisted-living-solutions'
  const label = isFacilityPage
    ? i18n.language.startsWith('es')
      ? 'Hablar de un proyecto'
      : 'Discuss a facility project'
    : i18n.language.startsWith('es')
      ? 'Reservar evaluaci\u00f3n'
      : 'Book Assessment'
  const destination = isFacilityPage
    ? '/assisted-living-solutions#facility-enquiry'
    : '/home-safety-assessment'
  const Icon = isFacilityPage ? Building2 : CalendarCheck

  if (hiddenRoutes.some((route) => location.pathname.startsWith(route))) {
    return null
  }

  return (
    <div className="sticky-mobile-cta" aria-label={isFacilityPage ? label : t('stickyCta.aria')}>
      <Link
        className={`sticky-mobile-cta-link is-primary is-single${isFacilityPage ? ' is-facility' : ''}`}
        to={destination}
        onClick={() =>
          trackEvent(isFacilityPage ? 'facility_discovery_started' : 'assessment_booking_started', {
            location: 'sticky_mobile',
          })
        }
      >
        <Icon size={18} aria-hidden="true" />
        {label}
      </Link>
    </div>
  )
}
