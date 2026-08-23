export const CASAMIA_CONTACT_EMAIL = 'hola@casamia.com.es'
export const CASAMIA_CONTACT_PHONE = (import.meta.env.VITE_CASAMIA_CONTACT_PHONE ?? '').trim()
export const CASAMIA_WHATSAPP_URL = (import.meta.env.VITE_CASAMIA_WHATSAPP_URL ?? '').trim()
export const CASAMIA_FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61574255177723'

export function buildCasaMiaWhatsappUrl(message: string) {
  if (!CASAMIA_WHATSAPP_URL) return ''

  const separator = CASAMIA_WHATSAPP_URL.includes('?') ? '&' : '?'
  return `${CASAMIA_WHATSAPP_URL}${separator}text=${encodeURIComponent(message.trim())}`
}
