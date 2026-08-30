import { sendLeadReminderEmail } from '../_lib/lead-email.js'
import { sendCustomerFollowUpEmails } from '../_lib/customer-followup-email.js'
import { listLeadRecords, recordLeadDelivery } from '../_lib/leads.js'
import { selectSupabaseRows, sendJson } from '../_lib/supabase.js'

const reminderRepeatMs = 20 * 60 * 60 * 1000
const untouchedLeadMs = 48 * 60 * 60 * 1000

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

  const [result, crmResult] = await Promise.all([
    listLeadRecords(),
    selectSupabaseRows('customer_crm_records', 'select=*&order=next_action_due_at.asc&limit=2000'),
  ])
  if (!result.ok || !crmResult.ok) {
    const failed = !result.ok ? result : crmResult
    sendJson(response, failed.status, failed.body)
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
  const staleLeads = result.body.filter((lead) => {
    const submittedAt = Date.parse(lead.submittedAt)
    return lead.status === 'New' && Number.isFinite(submittedAt) && submittedAt <= now - untouchedLeadMs
  })
  const dueCustomerActions = crmResult.body
    .map(mapCustomerAction)
    .filter((action) => {
      const dueAt = Date.parse(action.nextActionDueAt)
      return action.nextAction
        && !['Won', 'Lost'].includes(action.lifecycleStatus)
        && Number.isFinite(dueAt)
        && dueAt <= now
    })

  if (!dueLeads.length && !staleLeads.length && !dueCustomerActions.length) {
    sendJson(response, 200, { customerActionsDue: 0, due: 0, staleLeads: 0, status: 'nothing_due' })
    return
  }

  const [delivery, customerFollowUps] = await Promise.all([
    dueLeads.length ? sendLeadReminderEmail({ leads: dueLeads }) : Promise.resolve(null),
    sendCustomerFollowUpEmails({ actions: dueCustomerActions, staleLeads }),
  ])
  const tracking = await Promise.all(dueLeads.map((lead) => recordLeadDelivery(
    lead.source,
    lead.id,
    'reminder',
    delivery,
  )))
  const trackingFailures = tracking.filter((item) => !item.ok).length

  sendJson(response, 200, {
    delivery,
    customerActionsDue: dueCustomerActions.length,
    customerFollowUps,
    due: dueLeads.length,
    staleLeads: staleLeads.length,
    trackingFailures,
  })
}

function mapCustomerAction(row) {
  return {
    customerKey: row.customer_key || '',
    lifecycleStatus: row.lifecycle_status || 'New',
    nextAction: row.next_action || '',
    nextActionDueAt: row.next_action_due_at || '',
    owner: row.owner || '',
    ownerEmail: row.owner_email || '',
  }
}

function isAuthorizedCron(request) {
  const authorization = request.headers?.authorization
    || request.headers?.get?.('authorization')
    || ''
  return Boolean(process.env.CRON_SECRET && authorization === `Bearer ${process.env.CRON_SECRET}`)
}
