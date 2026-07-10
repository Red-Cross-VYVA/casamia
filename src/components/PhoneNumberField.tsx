import { formatSpanishLocalNumber, getSpanishLocalNumber, SPAIN_DIAL_CODE } from '../utils/phone'

type PhoneNumberFieldProps = {
  error?: string
  helperText?: string
  label?: string
  name?: string
  required?: boolean
  value: string
  className?: string
  onChange: (value: string) => void
}

export function PhoneNumberField({
  error,
  helperText = 'Spanish number, 9 digits. Example: +34 600 000 000',
  label,
  name = 'phone',
  required,
  value,
  className = 'estimate-field',
  onChange,
}: PhoneNumberFieldProps) {
  const localNumber = getSpanishLocalNumber(value)

  return (
    <label className={className}>
      {label ? (
        <span>
          {label}
          {required ? <strong> *</strong> : null}
        </span>
      ) : null}
      <span className="phone-number-field">
        <span className="phone-number-prefix">{SPAIN_DIAL_CODE}</span>
        <input
          aria-invalid={Boolean(error)}
          aria-required={required}
          autoComplete="tel-national"
          inputMode="tel"
          name={name}
          placeholder="600 000 000"
          type="tel"
          value={formatSpanishLocalNumber(localNumber)}
          onChange={(event) => {
            const nextLocalNumber = getSpanishLocalNumber(event.target.value)
            onChange(nextLocalNumber ? `${SPAIN_DIAL_CODE}${nextLocalNumber}` : '')
          }}
        />
      </span>
      {error ? <small>{error}</small> : <small className="phone-number-help">{helperText}</small>}
    </label>
  )
}
