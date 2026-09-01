import { requireInternalApiKey, selectSupabaseRows, sendJson } from '../_lib/supabase.js'

const funnelStages = [
  { key: 'started', label: 'Journey started', events: ['wizard_started', 'assessment_booking_started', 'form_start'] },
  { key: 'assessment', label: 'Assessment completed', events: ['wizard_submitted', 'assessment_booking_completed', 'form_complete'] },
  { key: 'proposal', label: 'Proposal accepted', events: ['proposal_accepted'] },
  { key: 'appointment', label: 'Appointment scheduled', events: ['appointment_scheduled'] },
  { key: 'checkout', label: 'Payment started', events: ['payment_checkout_started'] },
  { key: 'payment', label: 'Payment completed', events: ['payment_completed'] },
]

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (!requireInternalApiKey(request, response)) return
  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const days = [7, 30, 90].includes(Number(request.query?.days)) ? Number(request.query.days) : 30
  const language = ['en', 'es'].includes(request.query?.language) ? request.query.language : ''
  const flow = cleanFilter(request.query?.flow)
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const eventFilters = [
    `created_at=gte.${encodeURIComponent(since)}`,
    language ? `language=eq.${encodeURIComponent(language)}` : '',
    flow ? `flow=eq.${encodeURIComponent(flow)}` : '',
    'select=created_at,event_name,language,flow,session_id',
    'order=created_at.asc',
    'limit=10000',
  ].filter(Boolean).join('&')

  const results = await Promise.all([
    selectSupabaseRows('analytics_events', eventFilters),
    selectSupabaseRows('assessment_requests', `submitted_at=gte.${encodeURIComponent(since)}&select=id,type,status,submitted_at&limit=5000`),
    selectSupabaseRows('proposals', `created_at=gte.${encodeURIComponent(since)}&select=id,status,created_at&limit=5000`),
    selectSupabaseRows('orders', `created_at=gte.${encodeURIComponent(since)}&select=id,status,created_at&limit=5000`),
  ])
  const [eventResult, assessmentResult, proposalResult, orderResult] = results
  const events = rows(eventResult)
  const assessments = rows(assessmentResult)
  const proposals = rows(proposalResult)
  const orders = rows(orderResult)
  const issues = results.flatMap((result, index) => result.ok ? [] : [`${['analytics events', 'assessments', 'proposals', 'orders'][index]} unavailable`])

  const funnel = funnelStages.map((stage, index) => {
    const count = uniqueEventCount(events, stage.events)
    const previous = index ? uniqueEventCount(events, funnelStages[index - 1].events) : count
    return {
      count,
      dropOff: index && previous ? Math.max(0, previous - count) : 0,
      key: stage.key,
      label: stage.label,
      rateFromPrevious: index && previous ? Math.round((count / previous) * 100) : 100,
    }
  })

  sendJson(response, 200, {
    breakdowns: {
      flows: breakdown(events, 'flow'),
      languages: breakdown(events, 'language'),
    },
    coverage: { days, eventCount: events.length, since },
    daily: dailySeries(events, days),
    filters: { flow, language },
    funnel,
    issues,
    outcomes: {
      acceptedProposals: proposals.filter((row) => ['Accepted', 'Deposit Paid'].includes(row.status)).length,
      appointments: assessments.filter((row) => row.type === 'visit_slot_reservation').length,
      assessmentRequests: assessments.filter((row) => !['visit_slot_reservation', 'visit_slot_block', 'visit_reminder_delivery'].includes(row.type)).length,
      paidOrders: orders.filter((row) => /paid|completed/i.test(row.status || '')).length,
      whatsappClicks: events.filter((event) => event.event_name === 'whatsapp_clicked').length,
    },
  })
}

function rows(result) { return result.ok && Array.isArray(result.body) ? result.body : [] }
function cleanFilter(value) { return typeof value === 'string' && /^[a-z0-9_-]{1,80}$/i.test(value) ? value : '' }
function uniqueEventCount(events, names) {
  const matching = events.filter((event) => names.includes(event.event_name))
  return new Set(matching.map((event) => event.session_id || `${event.event_name}:${event.created_at}`)).size
}
function breakdown(events, field) {
  const counts = new Map()
  events.forEach((event) => { const key = event[field] || 'unknown'; counts.set(key, (counts.get(key) || 0) + 1) })
  return [...counts.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count).slice(0, 8)
}
function dailySeries(events, days) {
  const result = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10)
    const dayEvents = events.filter((event) => String(event.created_at).slice(0, 10) === date)
    result.push({
      completed: dayEvents.filter((event) => ['wizard_submitted', 'assessment_booking_completed', 'form_complete'].includes(event.event_name)).length,
      date,
      payments: dayEvents.filter((event) => event.event_name === 'payment_completed').length,
      started: dayEvents.filter((event) => ['wizard_started', 'assessment_booking_started', 'form_start'].includes(event.event_name)).length,
    })
  }
  return result
}
