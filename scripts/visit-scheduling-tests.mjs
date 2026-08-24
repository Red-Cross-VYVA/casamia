import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  createVisitSlotId,
  createVisitSlots,
  findVisitSlot,
  groupAvailableVisitSlots,
  visitScheduleConfig,
} from '../api/_lib/visit-scheduling.js'

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

const publicScheduler = readFileSync(new URL('../api/public/visit-schedule.js', import.meta.url), 'utf8')
const availabilityApi = readFileSync(new URL('../api/public/visit-availability.js', import.meta.url), 'utf8')
const schedulerUi = readFileSync(new URL('../src/components/wizard/VisitScheduler.tsx', import.meta.url), 'utf8')
const webhook = readFileSync(new URL('../api/webhooks/stripe.js', import.meta.url), 'utf8')

assert.match(publicScheduler, /verifyPaidAssessmentSession/)
assert.match(publicScheduler, /visit_slot_reservation/)
assert.match(publicScheduler, /status: 'Visit Scheduled'/)
assert.match(publicScheduler, /sendVisitScheduledEmail/)
assert.match(availabilityApi, /groupAvailableVisitSlots/)
assert.match(schedulerUi, /Choose your visit date and time/)
assert.match(schedulerUi, /Elige la fecha y hora de tu visita/)
assert.match(webhook, /preservesAppointment/)

console.log('Visit scheduling tests passed.')
