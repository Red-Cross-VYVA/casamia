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
