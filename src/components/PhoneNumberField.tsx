const SPAIN_DIAL_CODE = '+34'
const SPAIN_LOCAL_NUMBER_LENGTH = 9

type PhoneNumberFieldProps = {
  label?: string
  name?: string
  value: string
  className?: string
  onChange: (value: string) => void
}

export function PhoneNumberField({
  label,
  name = 'phone',
  value,
  className = 'estimate-field',
  onChange,
}: PhoneNumberFieldProps) {
  const localNumber = getSpanishLocalNumber(value)

  return (
    <label className={className}>
      {label ? <span>{label}</span> : null}
      <span className="phone-number-field">
        <span className="phone-number-prefix">{SPAIN_DIAL_CODE}</span>
        <input
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
    </label>
  )
}

function getSpanishLocalNumber(value: string) {
  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('0034')) {
    return digits.slice(4, 4 + SPAIN_LOCAL_NUMBER_LENGTH)
  }

  if (digits.startsWith('34') && digits.length > SPAIN_LOCAL_NUMBER_LENGTH) {
    return digits.slice(2, 2 + SPAIN_LOCAL_NUMBER_LENGTH)
  }

  return digits.slice(0, SPAIN_LOCAL_NUMBER_LENGTH)
}

function formatSpanishLocalNumber(value: string) {
  return value.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}
