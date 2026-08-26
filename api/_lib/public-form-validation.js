export function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function isValidEmail(value) {
  const email = cleanString(value)

  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function hasAcceptedConsent(records) {
  return Array.isArray(records) && records.some((record) => record?.accepted === true)
}

export function isWithinLength(value, maximumLength, { required = false } = {}) {
  const cleaned = cleanString(value)
  return (!required || cleaned.length > 0) && cleaned.length <= maximumLength
}

export function isJsonWithinBytes(value, maximumBytes) {
  try {
    return Buffer.byteLength(JSON.stringify(value), 'utf8') <= maximumBytes
  } catch {
    return false
  }
}

export function isIsoDate(value) {
  const cleaned = cleanString(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return false
  const [year, month, day] = cleaned.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}
