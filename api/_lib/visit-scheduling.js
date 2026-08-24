import crypto from 'node:crypto'

export const visitScheduleConfig = {
  horizonDays: 45,
  minLeadHours: 24,
  slotTimes: ['09:30', '12:30', '16:00'],
  timeZone: 'Europe/Madrid',
}

export const visitSlotRecordTypes = ['visit_slot_reservation', 'visit_slot_block']

export function createVisitSlots(now = new Date()) {
  const slots = []
  const today = getDateKey(now)

  for (let dayOffset = 0; dayOffset <= visitScheduleConfig.horizonDays; dayOffset += 1) {
    const date = addDays(today, dayOffset)
    const weekday = getWeekday(date)
    if (weekday === 'Sat' || weekday === 'Sun') continue

    for (const time of visitScheduleConfig.slotTimes) {
      const startAt = zonedLocalToUtc(date, time)
      if (startAt.getTime() < now.getTime() + visitScheduleConfig.minLeadHours * 60 * 60 * 1000) continue
      slots.push({ date, id: createVisitSlotId(`${date}T${time}`), startAt: startAt.toISOString(), time })
    }
  }

  return slots
}

export function findVisitSlot(startAt, now = new Date()) {
  const requested = new Date(startAt)
  if (Number.isNaN(requested.getTime())) return null
  return createVisitSlots(now).find((slot) => slot.startAt === requested.toISOString()) || null
}

export function createVisitSlotId(slotKey) {
  const hash = crypto.createHash('sha256').update(`casamia-visit-slot:${slotKey}`).digest('hex').slice(0, 32).split('')
  hash[12] = '5'
  hash[16] = ['8', '9', 'a', 'b'][Number.parseInt(hash[16], 16) % 4]
  const hex = hash.join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function groupAvailableVisitSlots(slots, occupiedIds = new Set()) {
  const dates = new Map()
  slots.filter((slot) => !occupiedIds.has(slot.id)).forEach((slot) => {
    const current = dates.get(slot.date) || []
    current.push({ startAt: slot.startAt, time: slot.time })
    dates.set(slot.date, current)
  })
  return [...dates.entries()].map(([date, availableSlots]) => ({ date, slots: availableSlots }))
}

export function isVisitSlotRecord(record) {
  return visitSlotRecordTypes.includes(String(record?.type || ''))
}

function getDateKey(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit', month: '2-digit', timeZone: visitScheduleConfig.timeZone, year: 'numeric',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function getWeekday(dateKey) {
  return new Intl.DateTimeFormat('en-US', { timeZone: visitScheduleConfig.timeZone, weekday: 'short' })
    .format(new Date(`${dateKey}T12:00:00Z`))
}

function zonedLocalToUtc(dateKey, time) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const target = Date.UTC(year, month - 1, day, hour, minute)
  let guess = target

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', hour: '2-digit', hourCycle: 'h23', minute: '2-digit', month: '2-digit',
      timeZone: visitScheduleConfig.timeZone, year: 'numeric',
    }).formatToParts(new Date(guess))
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
    const represented = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute))
    guess += target - represented
  }

  return new Date(guess)
}
