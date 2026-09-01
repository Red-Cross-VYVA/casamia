import { MessageCircle, Phone } from 'lucide-react'

import type { WizardCopy } from '../../config/wizardCopy'
import { CASAMIA_CONTACT_EMAIL, CASAMIA_CONTACT_PHONE, buildCasaMiaWhatsappUrl } from '../../constants/contact'
import { trackEvent } from '../../utils/analytics'
import { WizardStep } from './WizardStep'

type PhoneStepProps = { copy: WizardCopy; reference: string }

export function PhoneStep({ copy, reference }: PhoneStepProps) {
  const whatsappHref = buildCasaMiaWhatsappUrl(`CasaMia reference: ${reference}`)

  return (
    <WizardStep title={copy.phone.title} body={copy.phone.body} hint={copy.micro.optional} icon={<Phone size={28} />}>
      <div className="safety-wizard-call-card">
        <span>{copy.phone.reference}</span>
        <strong>{reference}</strong>
        <p>{CASAMIA_CONTACT_PHONE || copy.phone.unavailable}</p>
        <div>
          {CASAMIA_CONTACT_PHONE ? (
            <a className="btn btn-navy" href={`tel:${CASAMIA_CONTACT_PHONE.replaceAll(' ', '')}`}>
              <Phone size={20} aria-hidden="true" /> {copy.phone.call}
            </a>
          ) : null}
          {whatsappHref ? (
            <a className="btn btn-white" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent('whatsapp_clicked', { location: 'wizard_phone_step' })}>
              <MessageCircle size={20} aria-hidden="true" /> {copy.phone.whatsapp}
            </a>
          ) : null}
          {!CASAMIA_CONTACT_PHONE && !whatsappHref ? (
            <a className="btn btn-navy" href={`mailto:${CASAMIA_CONTACT_EMAIL}`}>
              <MessageCircle size={20} aria-hidden="true" /> {copy.phone.email}
            </a>
          ) : null}
        </div>
      </div>
    </WizardStep>
  )
}
