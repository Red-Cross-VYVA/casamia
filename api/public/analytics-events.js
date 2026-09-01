import { insertSupabaseRow, readJsonBody, sendJson } from '../_lib/supabase.js'

const allowedEvents = new Set([
  'appointment_rescheduled',
  'appointment_scheduled',
  'assessment_booking_completed',
  'assessment_booking_started',
  'form_complete',
  'form_start',
  'payment_checkout_started',
  'payment_completed',
  'proposal_accepted',
  'whatsapp_clicked',
  'wizard_plan_generated',
  'wizard_started',
  'wizard_submitted',
])

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  let body
  try {
    body = await readJsonBody(request)
  } catch {
    sendJson(response, 400, { message: 'Invalid JSON.' })
    return
  }

  const eventName = cleanText(body.event, 80)
  if (!allowedEvents.has(eventName)) {
    sendJson(response, 400, { message: 'Unsupported analytics event.' })
    return
  }

  const pathname = cleanPath(body.pathname)
  const result = await insertSupabaseRow('analytics_events', {
    event_name: eventName,
    flow: normalizeFlow(eventName, body.flow, pathname),
    language: normalizeLanguage(body.language),
    pathname,
    properties_json: cleanProperties(body.properties),
    session_id: cleanText(body.sessionId, 100),
  })

  if (!result.ok) {
    sendJson(response, 503, { message: 'Analytics storage is not available.' })
    return
  }

  sendJson(response, 202, { stored: true })
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalizeLanguage(value) {
  const language = cleanText(value, 10).toLowerCase()
  return language.startsWith('es') ? 'es' : language.startsWith('en') ? 'en' : ''
}

function cleanPath(value) {
  const path = cleanText(value, 240)
  return path.startsWith('/') && !path.includes('://') ? path : ''
}

function normalizeFlow(eventName, value, pathname) {
  const supplied = cleanText(value, 80).toLowerCase().replace(/[^a-z0-9_-]+/g, '_')
  const aliases = {
    'free-report-booking': 'assessment_visit',
    'home-safety-assessment': 'assessment_visit',
    assessment: 'assessment_visit',
    proposal: 'proposal_deposit',
  }
  if (aliases[supplied]) return aliases[supplied]
  if (supplied) return supplied
  if (eventName.startsWith('wizard_')) return 'home_safety_wizard'
  if (eventName.startsWith('assessment_') || eventName.startsWith('appointment_')) return 'assessment_visit'
  if (eventName.startsWith('proposal_')) return 'proposal_deposit'
  if (pathname.includes('safety-report')) return 'safety_report'
  return ''
}

function cleanProperties(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).slice(0, 20).flatMap(([key, entry]) => {
    const safeKey = cleanText(key, 60)
    if (!safeKey || !['string', 'number', 'boolean'].includes(typeof entry)) return []
    return [[safeKey, typeof entry === 'string' ? entry.slice(0, 160) : entry]]
  }))
}
