export const SPAIN_DIAL_CODE = '+34'
export const SPAIN_LOCAL_NUMBER_LENGTH = 9

export function getSpanishLocalNumber(value: string) {
  const trimmed = value.trim()
  const digits = value.replace(/\D/g, '')

  if (trimmed.startsWith('+34')) {
    return digits.slice(2, 2 + SPAIN_LOCAL_NUMBER_LENGTH)
  }

  if (digits.startsWith('0034')) {
    return digits.slice(4, 4 + SPAIN_LOCAL_NUMBER_LENGTH)
  }

  if (digits.startsWith('34') && digits.length > SPAIN_LOCAL_NUMBER_LENGTH) {
    return digits.slice(2, 2 + SPAIN_LOCAL_NUMBER_LENGTH)
  }

  return digits.slice(0, SPAIN_LOCAL_NUMBER_LENGTH)
}

export function formatSpanishLocalNumber(value: string) {
  return value.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}

export function isValidSpanishPhoneNumber(value: string) {
  return /^[6789]\d{8}$/.test(getSpanishLocalNumber(value))
}
