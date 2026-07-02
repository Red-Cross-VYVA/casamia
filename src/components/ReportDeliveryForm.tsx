import { Mail, MessageCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import type { ReportDeliveryFormValue } from '../utils/reportDelivery'

type ReportDeliveryFormProps = {
  value: ReportDeliveryFormValue
  consentText: string
  intro?: string
  onChange: (field: keyof ReportDeliveryFormValue, value: string | boolean) => void
}

export function ReportDeliveryForm({
  value,
  consentText,
  intro,
  onChange,
}: ReportDeliveryFormProps) {
  const { t } = useTranslation()

  return (
    <div className="estimate-step-content">
      {intro ? <p className="report-delivery-intro">{intro}</p> : null}
      <div className="estimate-form-grid">
        <TextField
          label={t('reportDelivery.name')}
          value={value.name}
          placeholder={t('reportDelivery.namePlaceholder')}
          onChange={(nextValue) => onChange('name', nextValue)}
        />
        <TextField
          label={t('reportDelivery.email')}
          type="email"
          value={value.email}
          placeholder="you@example.com"
          onChange={(nextValue) => onChange('email', nextValue)}
        />
        <TextField
          label={t('reportDelivery.phone')}
          type="tel"
          value={value.phone}
          placeholder="+34 ..."
          onChange={(nextValue) => onChange('phone', nextValue)}
        />
      </div>
      <div className="estimate-delivery-grid">
        <ToggleCard
          checked={value.deliveryEmail}
          icon={<Mail size={20} aria-hidden="true" />}
          title={t('reportDelivery.emailDelivery')}
          body={t('reportDelivery.emailDeliveryBody')}
          onChange={(checked) => onChange('deliveryEmail', checked)}
        />
        <ToggleCard
          checked={value.deliveryWhatsapp}
          icon={<MessageCircle size={20} aria-hidden="true" />}
          title={t('reportDelivery.whatsappDelivery')}
          body={t('reportDelivery.whatsappDeliveryBody')}
          onChange={(checked) => onChange('deliveryWhatsapp', checked)}
        />
      </div>
      <label className="estimate-consent">
        <input
          type="checkbox"
          checked={value.consent}
          onChange={(event) => onChange('consent', event.target.checked)}
        />
        <span>{consentText}</span>
      </label>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="estimate-field">
      {label}
      <input
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function ToggleCard({
  checked,
  icon,
  title,
  body,
  onChange,
}: {
  checked: boolean
  icon: ReactNode
  title: string
  body: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className={`estimate-toggle-card ${checked ? 'is-selected' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{icon}</span>
      <strong>{title}</strong>
      <small>{body}</small>
    </label>
  )
}
