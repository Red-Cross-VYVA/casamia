import { sendLeadReminderEmail } from '../_lib/lead-email.js'
import { listLeadRecords, recordLeadDelivery } from '../_lib/leads.js'
import { sendJson } from '../_lib/supabase.js'

const reminderRepeatMs = 20 * 60 * 60 * 1000

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }
  if (!isAuthorizedCron(request)) {
    sendJson(response, process.env.CRON_SECRET ? 401 : 500, {
      message: process.env.CRON_SECRET ? 'Unauthorized.' : 'CRON_SECRET is not configured.',
    })
    return
  }

  const result = await listLeadRecords()
  if (!result.ok) {
    sendJson(response, result.status, result.body)
    return
  }

  const now = Date.now()
  const dueLeads = result.body.filter((lead) => {
    if (!lead.followUpAt || ['Won', 'Lost'].includes(lead.status)) return false
    const followUpAt = Date.parse(lead.followUpAt)
    const lastReminderAt = Date.parse(lead.notificationDelivery?.reminder?.attemptedAt || '')
    return Number.isFinite(followUpAt)
      && followUpAt <= now
      && (!Number.isFinite(lastReminderAt) || lastReminderAt <= now - reminderRepeatMs)
  })

  if (!dueLeads.length) {
    sendJson(response, 200, { due: 0, status: 'nothing_due' })
    return
  }

  const delivery = await sendLeadReminderEmail({ leads: dueLeads })
  const tracking = await Promise.all(dueLeads.map((lead) => recordLeadDelivery(
    lead.source,
    lead.id,
    'reminder',
    delivery,
  )))
  const trackingFailures = tracking.filter((item) => !item.ok).length

  sendJson(response, 200, {
    delivery,
    due: dueLeads.length,
    trackingFailures,
  })
}

function isAuthorizedCron(request) {
  const authorization = request.headers?.authorization
    || request.headers?.get?.('authorization')
    || ''
  return Boolean(process.env.CRON_SECRET && authorization === `Bearer ${process.env.CRON_SECRET}`)
}
