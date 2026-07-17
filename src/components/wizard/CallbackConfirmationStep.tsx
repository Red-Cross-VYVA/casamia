import { CalendarDays, Check, Clock3, Home, PhoneCall, Plus, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { WizardCopy } from '../../config/wizardCopy'
import type { WizardCallbackTimeWindow } from '../../types/wizard'
import { formatSpanishLocalNumber, getSpanishLocalNumber, SPAIN_DIAL_CODE } from '../../utils/phone'
import { WizardStep } from './WizardStep'

type CallbackConfirmationStepProps = {
  copy: WizardCopy['callback']['confirmation']
  date: string
  homeHref?: string
  locale: string
  phone: string
  reference: string
  timeWindow: WizardCallbackTimeWindow
  timeWindows: WizardCopy['callback']['timeWindows']
  onRequestAnother: () => void
}

export function CallbackConfirmationStep({
  copy,
  date,
  homeHref = '/',
  locale,
  phone,
  reference,
  timeWindow,
  timeWindows,
  onRequestAnother,
}: CallbackConfirmationStepProps) {
  const formattedDate = formatCallbackDate(date, locale)
  const formattedPhone = `${SPAIN_DIAL_CODE} ${formatSpanishLocalNumber(getSpanishLocalNumber(phone))}`

  return (
    <WizardStep title={copy.title} body={copy.body} icon={<PhoneCall size={28} />} compact>
      <section className="safety-wizard-callback-confirmation">
        <div className="safety-wizard-callback-confirmation-mark" aria-hidden="true">
          <Check size={34} strokeWidth={3} />
        </div>
        <strong className="safety-wizard-callback-confirmed-label" role="status" aria-live="polite">{copy.confirmed}</strong>

        <dl className="safety-wizard-callback-summary">
          <div>
            <dt><CalendarDays size={18} aria-hidden="true" />{copy.date}</dt>
            <dd>{formattedDate}</dd>
          </div>
          <div>
            <dt><Clock3 size={18} aria-hidden="true" />{copy.time}</dt>
            <dd>{timeWindows[timeWindow]}</dd>
          </div>
          <div>
            <dt><PhoneCall size={18} aria-hidden="true" />{copy.phone}</dt>
            <dd>{formattedPhone}</dd>
          </div>
          <div>
            <dt><ShieldCheck size={18} aria-hidden="true" />{copy.reference}</dt>
            <dd>{reference}</dd>
          </div>
        </dl>

        <p className="safety-wizard-callback-reassurance"><ShieldCheck size={19} aria-hidden="true" />{copy.reassurance}</p>

        <div className="safety-wizard-callback-confirmation-actions">
          <button className="btn btn-navy" onClick={onRequestAnother} type="button">
            <Plus size={19} aria-hidden="true" />{copy.requestAnother}
          </button>
          <Link className="btn btn-white" to={homeHref}>
            <Home size={19} aria-hidden="true" />{copy.home}
          </Link>
        </div>
      </section>
    </WizardStep>
  )
}

function formatCallbackDate(value: string, locale: string) {
  const parsed = new Date(`${value}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }).format(parsed)
}
