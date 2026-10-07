import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { buildCasaMiaWhatsappUrl } from '../constants/contact'
import { trackEvent } from '../utils/analytics'

const hiddenRoutes = [
  '/internal',
  '/partner',
  '/agreement/',
  '/legal-notice',
  '/general-customer-terms',
  '/privacy-policy',
  '/cookie-policy',
  '/withdrawal-cancellation',
  '/withdrawal-form',
  '/guarantees-aftercare',
  '/complaints-contact',
  '/accessibility-statement',
  '/terms-and-conditions',
]

export function FloatingWhatsAppCTA() {
  const { i18n } = useTranslation()
  const location = useLocation()
  const isSpanish = i18n.language.toLowerCase().startsWith('es')
  const whatsappHref = buildCasaMiaWhatsappUrl(
    isSpanish
      ? 'Hola CasaMia, me gustaría consultar sobre seguridad en casa.'
      : 'Hello CasaMia, I would like to ask about home safety.',
  )

  if (!whatsappHref || hiddenRoutes.some((route) => location.pathname.startsWith(route))) {
    return null
  }

  return (
    <a
      className="floating-whatsapp-cta"
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('whatsapp_clicked', { location: 'floating_public_cta' })}
      aria-label={isSpanish ? 'Abrir WhatsApp de CasaMia' : 'Open CasaMia WhatsApp'}
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span>WhatsApp</span>
    </a>
  )
}
