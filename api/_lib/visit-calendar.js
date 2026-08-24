import { buildAbsolutePublicUrl } from './email.js'

const visitDurationMs = 90 * 60 * 1000

export function getVisitEndAt(appointment) {
  const start = new Date(appointment?.startAt)
  return Number.isNaN(start.getTime()) ? '' : new Date(start.getTime() + visitDurationMs).toISOString()
}

export function buildVisitCalendarLinks({ appointment, assessment, request, sessionId }) {
  const startAt = text(appointment?.startAt)
  const endAt = text(appointment?.endAt) || getVisitEndAt(appointment)
  const title = 'CasaMia home safety visit'
  const location = text(assessment?.city_area) || 'Customer home - address to be confirmed'
  const description = `CasaMia home safety assessment. Reference: ${text(assessment?.payload_json?.wizardReference) || text(assessment?.id)}.`
  const dates = `${compactUtc(startAt)}/${compactUtc(endAt)}`
  const manageUrl = sessionId
    ? buildAbsolutePublicUrl(request, `/home-safety-wizard?payment=success&session_id=${encodeURIComponent(sessionId)}`)
    : ''
  const details = manageUrl ? `${description}\n\nManage appointment: ${manageUrl}` : description
  const query = new URLSearchParams({ action: 'TEMPLATE', dates, details, location, text: title })
  const outlook = new URLSearchParams({
    body: details, enddt: endAt, location, path: '/calendar/action/compose', rru: 'addevent', startdt: startAt, subject: title,
  })

  return {
    google: `https://calendar.google.com/calendar/render?${query.toString()}`,
    ics: sessionId ? buildAbsolutePublicUrl(request, `/api/public/visit-calendar?session_id=${encodeURIComponent(sessionId)}`) : '',
    manage: manageUrl,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${outlook.toString()}`,
  }
}

export function renderVisitIcs({ appointment, assessment }) {
  const startAt = text(appointment?.startAt)
  const endAt = text(appointment?.endAt) || getVisitEndAt(appointment)
  const reference = text(assessment?.payload_json?.wizardReference) || text(assessment?.id)
  const uid = `${text(appointment?.slotId) || reference}@casamia.com.es`
  const location = text(assessment?.city_area) || 'Customer home - address to be confirmed'
  const description = `CasaMia home safety assessment. Reference: ${reference}. Contact: hola@casamia.com.es.`

  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CasaMia//Home Safety Visits//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${escapeIcs(uid)}`, `DTSTAMP:${compactUtc(new Date().toISOString())}`,
    `DTSTART:${compactUtc(startAt)}`, `DTEND:${compactUtc(endAt)}`,
    'SUMMARY:CasaMia home safety visit', `DESCRIPTION:${escapeIcs(description)}`, `LOCATION:${escapeIcs(location)}`,
    'STATUS:CONFIRMED', 'BEGIN:VALARM', 'TRIGGER:-PT24H', 'ACTION:DISPLAY', 'DESCRIPTION:CasaMia visit tomorrow',
    'END:VALARM', 'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n')
}

function compactUtc(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escapeIcs(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function text(value) { return typeof value === 'string' ? value.trim() : '' }
