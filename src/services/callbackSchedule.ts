import {
  WIZARD_CALLBACK_TIME_WINDOWS,
  type WizardCallbackRequest,
  type WizardCallbackTimeWindow,
} from '../types/wizard.ts'

export type MadridScheduleContext = {
  currentMinutes: number
  maximumDate: string
  minimumDate: string
  today: string
}

const callbackDayEndMinutes = WIZARD_CALLBACK_TIME_WINDOWS.reduce((latest, timeWindow) => {
  if (timeWindow === 'flexible') return latest

  const end = timeWindow.split('-')[1]
  const [hour, minute] = end.split(':').map(Number)
  return Math.max(latest, (hour * 60) + minute)
}, 0)

export function getMadridScheduleContext(now = new Date()): MadridScheduleContext {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Madrid',
    year: 'numeric',
  }).formatToParts(now)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const year = Number(values.year)
  const month = Number(values.month)
  const day = Number(values.day)
  const currentMinutes = Number(values.hour) * 60 + Number(values.minute)
  const minimum = new Date(Date.UTC(
    year,
    month - 1,
    day + (currentMinutes >= callbackDayEndMinutes ? 1 : 0),
  ))
  const maximum = new Date(Date.UTC(year, month - 1, day + 90))

  return {
    currentMinutes,
    maximumDate: maximum.toISOString().slice(0, 10),
    minimumDate: minimum.toISOString().slice(0, 10),
    today: `${values.year}-${values.month}-${values.day}`,
  }
}

export function isElapsedMadridWindow(
  timeWindow: WizardCallbackTimeWindow,
  preferredDate: string,
  context: MadridScheduleContext,
) {
  if (!preferredDate || preferredDate !== context.today) return false
  if (timeWindow === 'flexible') return context.currentMinutes >= callbackDayEndMinutes

  const end = timeWindow.split('-')[1]
  const [hour, minute] = end.split(':').map(Number)
  return (hour * 60) + minute <= context.currentMinutes
}

export function updateCallbackRequestDate(
  callbackRequest: WizardCallbackRequest,
  preferredDate: string,
  context: MadridScheduleContext,
): WizardCallbackRequest {
  const preferredTimeWindow = callbackRequest.preferredTimeWindow

  return {
    ...callbackRequest,
    preferredDate,
    preferredTimeWindow: preferredTimeWindow
      && isElapsedMadridWindow(preferredTimeWindow, preferredDate, context)
      ? ''
      : preferredTimeWindow,
  }
}
