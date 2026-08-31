import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  createVisitSlotId,
  createVisitSlots,
  findVisitSlot,
  groupAvailableVisitSlots,
  visitScheduleConfig,
} from '../api/_lib/visit-scheduling.js'
import { buildVisitCalendarLinks, getVisitEndAt, renderVisitIcs } from '../api/_lib/visit-calendar.js'
import { sendVisitAppointmentEmail } from '../api/_lib/visit-scheduling-email.js'

assert.deepEqual(visitScheduleConfig.slotTimes, ['09:30', '12:30', '16:00'])
assert.equal(visitScheduleConfig.timeZone, 'Europe/Madrid')

const winterSlots = createVisitSlots(new Date('2026-01-05T00:00:00Z'))
assert.equal(winterSlots[0].date, '2026-01-06')
assert.equal(winterSlots[0].time, '09:30')
assert.equal(winterSlots[0].startAt, '2026-01-06T08:30:00.000Z')
assert.ok(winterSlots.every((slot) => !['Sat', 'Sun'].includes(new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Europe/Madrid' }).format(new Date(slot.startAt)))))

const summerSlots = createVisitSlots(new Date('2026-07-06T00:00:00Z'))
assert.equal(summerSlots[0].startAt, '2026-07-07T07:30:00.000Z')
assert.deepEqual(findVisitSlot(summerSlots[0].startAt, new Date('2026-07-06T00:00:00Z')), summerSlots[0])
assert.equal(findVisitSlot('2026-07-07T08:15:00.000Z', new Date('2026-07-06T00:00:00Z')), null)

assert.equal(createVisitSlotId('2026-07-07T09:30'), createVisitSlotId('2026-07-07T09:30'))
assert.notEqual(createVisitSlotId('2026-07-07T09:30'), createVisitSlotId('2026-07-07T12:30'))
assert.match(createVisitSlotId('2026-07-07T09:30'), /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)

const occupied = new Set([summerSlots[0].id])
const grouped = groupAvailableVisitSlots(summerSlots.slice(0, 3), occupied)
assert.equal(grouped[0].slots.length, 2)
assert.ok(grouped[0].slots.every((slot) => slot.startAt !== summerSlots[0].startAt))

const appointment = { endAt: '2026-07-07T09:00:00.000Z', slotId: summerSlots[0].id, startAt: summerSlots[0].startAt }
const assessment = { city_area: 'Madrid, Centro', id: 'test-assessment', payload_json: { wizardReference: 'CM-TEST-1' } }
assert.equal(getVisitEndAt({ startAt: summerSlots[0].startAt }), '2026-07-07T09:00:00.000Z')
const calendarLinks = buildVisitCalendarLinks({ appointment, assessment, request: {}, sessionId: 'cs_test_calendar' })
assert.match(calendarLinks.google, /^https:\/\/calendar\.google\.com\/calendar\/render\?/)
assert.match(calendarLinks.outlook, /^https:\/\/outlook\.live\.com\/calendar\/0\/deeplink\/compose\?/)
assert.match(calendarLinks.ics, /visit-calendar\?session_id=cs_test_calendar/)
assert.match(calendarLinks.manage, /session_id=cs_test_calendar/)
const ics = renderVisitIcs({ appointment, assessment })
assert.match(ics, /BEGIN:VCALENDAR\r\n/)
assert.match(ics, /DTSTART:20260707T073000Z/)
assert.match(ics, /DTEND:20260707T090000Z/)
assert.match(ics, /LOCATION:Madrid\\, Centro/)
assert.match(ics, /TRIGGER:-PT24H/)

const publicScheduler = readFileSync(new URL('../api/public/visit-schedule.js', import.meta.url), 'utf8')
const availabilityApi = readFileSync(new URL('../api/public/visit-availability.js', import.meta.url), 'utf8')
const schedulerUi = readFileSync(new URL('../src/components/wizard/VisitScheduler.tsx', import.meta.url), 'utf8')
const configurationConfirmation = readFileSync(new URL('../src/pages/ConfigureConfirmationPage.tsx', import.meta.url), 'utf8')
const partnerLeads = readFileSync(new URL('../src/components/partner/PartnerLeadsPanel.tsx', import.meta.url), 'utf8')
const leadMapper = readFileSync(new URL('../api/_lib/leads.js', import.meta.url), 'utf8')
const webhook = readFileSync(new URL('../api/webhooks/stripe.js', import.meta.url), 'utf8')
const assessmentAdmin = readFileSync(new URL('../api/internal/assessment-requests.js', import.meta.url), 'utf8')
const publicManagement = readFileSync(new URL('../api/public/visit-manage.js', import.meta.url), 'utf8')
const internalManagement = readFileSync(new URL('../api/internal/visit-appointments.js', import.meta.url), 'utf8')

assert.match(publicScheduler, /verifyPaidAssessmentSession/)
assert.match(publicScheduler, /visit_slot_reservation/)
assert.match(publicScheduler, /status: 'Visit Scheduled'/)
assert.match(publicScheduler, /sendVisitScheduledEmail/)
assert.match(availabilityApi, /groupAvailableVisitSlots/)
assert.match(availabilityApi, /hasOrigin && !isAllowedPublicOrigin/)
assert.match(schedulerUi, /Choose your visit date and time/)
assert.match(schedulerUi, /Elige la fecha y hora de tu visita/)
assert.doesNotMatch(schedulerUi, /dateStyle: 'full', hour:/)
assert.match(webhook, /preservesAppointment/)
assert.match(assessmentAdmin, /body\.status === 'Cancelled'[\s\S]*cancelVisitAppointment/)
assert.match(publicManagement, /24 \* 60 \* 60 \* 1000/)
assert.match(publicManagement, /customerCanRebook: true/)
assert.match(internalManagement, /requireInternalApiKey/)
assert.match(internalManagement, /sendVisitAppointmentEmail/)
assert.match(internalManagement, /sendAndTrackVisitReminder/)
assert.match(schedulerUi, /Google Calendar/)
assert.match(schedulerUi, /Download \.ics/)
assert.match(configurationConfirmation, /paymentVerification === 'paid' && sessionId/)
assert.match(configurationConfirmation, /<VisitScheduler language=\{i18n\.language\} sessionId=\{sessionId\}/)
assert.match(leadMapper, /visitAppointment: mapVisitAppointment\(payload\.visitAppointment\)/)
assert.match(partnerLeads, /Reserved home visit/)

const originalFetch = globalThis.fetch
const emailCalls = []
globalThis.fetch = async (_url, init) => {
  emailCalls.push(JSON.parse(String(init.body)))
  return new Response(JSON.stringify({ id: `visit-email-${emailCalls.length}` }), { status: 200 })
}

try {
  const env = {
    CASAMIA_EMAIL_FROM: 'CasaMia <hola@casamia.com.es>',
    CASAMIA_PUBLIC_SITE_URL: 'https://www.casamia.com.es',
    RESEND_API_KEY: 'test-resend-key',
  }
  const languageCases = [
    ['en', /visit is scheduled/, /Date and time/],
    ['es', /visita CasaMia está programada/, /Fecha y hora/],
    ['de', /CasaMia-Besuch ist geplant/, /Datum und Uhrzeit/],
    ['fr', /visite CasaMia est programmée/, /Date et heure/],
    ['nl', /CasaMia-bezoek is gepland/, /Datum en tijd/],
  ]

  for (const [locale, subject, body] of languageCases) {
    await sendVisitAppointmentEmail({
      appointment,
      assessment: {
        ...assessment,
        customer_email: `${locale}@example.com`,
        customer_name: 'Test Customer',
        payload_json: { ...assessment.payload_json, locale },
      },
      env,
      request: { headers: {} },
      sessionId: 'cs_test_localized',
    })
    const message = emailCalls.at(-1)
    assert.match(message.subject, subject)
    assert.match(message.html, body)
    assert.match(message.html, /privacy-policy/)
    assert.match(message.html, /general-customer-terms/)
  }
} finally {
  globalThis.fetch = originalFetch
}

console.log('Visit scheduling tests passed.')
