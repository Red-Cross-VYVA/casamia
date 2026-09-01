import { hasCookieConsent } from './cookieConsent'

type MetaValue = string | number | boolean | null | undefined
export type MetaEventData = Record<string, MetaValue>

type FacebookPixel = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  loaded?: boolean
  queue?: unknown[][]
  push?: (...args: unknown[]) => void
  version?: string
}

declare global {
  interface Window {
    _fbq?: FacebookPixel
    fbq?: FacebookPixel
  }
}

const pixelId = String(import.meta.env.VITE_META_PIXEL_ID ?? '').trim()
let initializedPixelId = ''

export function isMetaTrackingConfigured() {
  return Boolean(pixelId)
}

export function trackMetaPageView() {
  return trackMetaEvent('PageView', {
    content_name: document.title,
    language: document.documentElement.lang || window.location.pathname.split('/')[1] || 'es',
  })
}

export function trackMetaConversion(eventName: string, data: MetaEventData = {}) {
  const mapped = mapCasaMiaEvent(eventName, data)
  if (!mapped) return
  void trackMetaEvent(mapped.name, mapped.data)
}

function trackMetaEvent(eventName: string, data: MetaEventData) {
  if (!pixelId || !hasCookieConsent('marketing')) return false

  initializeMetaPixel()
  const eventId = createEventId()
  const customData = cleanEventData(data)
  window.fbq?.('track', eventName, customData, { eventID: eventId })

  void fetch('/api/public/meta-events', {
    body: JSON.stringify({
      customData,
      eventId,
      eventName,
      eventSourceUrl: window.location.href,
      fbc: readCookie('_fbc') || buildFbcFromUrl(),
      fbp: readCookie('_fbp'),
      marketingConsent: true,
    }),
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    method: 'POST',
  }).catch(() => undefined)

  return true
}

function initializeMetaPixel() {
  if (initializedPixelId === pixelId) return

  if (!window.fbq) {
    const fbq: FacebookPixel = (...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args)
      else fbq.queue?.push(args)
    }
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    window.fbq = fbq
    window._fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  window.fbq('init', pixelId)
  initializedPixelId = pixelId
}

function mapCasaMiaEvent(eventName: string, data: MetaEventData) {
  const baseData = {
    ...data,
    content_name: stringValue(data.flow) || stringValue(data.form) || stringValue(data.source) || eventName,
  }

  if (eventName === 'form_complete' && data.delivery !== 'success') return null
  if (['assessment_booking_completed', 'facility_enquiry_submitted', 'form_complete', 'wizard_submitted', 'proposal_accepted'].includes(eventName)) {
    return { data: baseData, name: 'Lead' }
  }
  if (eventName === 'appointment_scheduled') return { data: baseData, name: 'Schedule' }
  if (eventName === 'payment_checkout_started') return { data: { ...baseData, currency: 'EUR' }, name: 'InitiateCheckout' }
  if (eventName === 'payment_completed') return { data: { ...baseData, currency: 'EUR' }, name: 'Purchase' }
  if (eventName === 'wizard_started') return { data: baseData, name: 'ViewContent' }
  return null
}

function cleanEventData(data: MetaEventData) {
  return Object.fromEntries(Object.entries(data).flatMap(([key, value]) => {
    if (!/^[a-z][a-z0-9_]{0,59}$/i.test(key) || value === undefined || value === null) return []
    if (!['string', 'number', 'boolean'].includes(typeof value)) return []
    return [[key, typeof value === 'string' ? value.slice(0, 160) : value]]
  }))
}

function createEventId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readCookie(name: string) {
  const encodedName = `${encodeURIComponent(name)}=`
  return document.cookie.split(';').map((value) => value.trim()).find((value) => value.startsWith(encodedName))?.slice(encodedName.length) ?? ''
}

function buildFbcFromUrl() {
  const fbclid = new URLSearchParams(window.location.search).get('fbclid')
  return fbclid ? `fb.1.${Date.now()}.${fbclid.slice(0, 200)}` : ''
}

function stringValue(value: MetaValue) {
  return typeof value === 'string' ? value : ''
}
