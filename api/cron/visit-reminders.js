import { claimVisitReminder, listDueVisitReminders, sendAndTrackVisitReminder } from '../_lib/visit-reminders.js'
import { sendJson } from '../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'GET') return sendJson(response, 405, { message: 'Method not allowed.' })
  if (!isAuthorizedCron(request)) {
    return sendJson(response, process.env.CRON_SECRET ? 401 : 500, {
      message: process.env.CRON_SECRET ? 'Unauthorized.' : 'CRON_SECRET is not configured.',
    })
  }

  const due = await listDueVisitReminders()
  if (!due.ok) return sendJson(response, due.status, due.body)
  if (!due.body.length) return sendJson(response, 200, { due: 0, failed: 0, sent: 0, status: 'nothing_due' })

  const results = []
  for (const assessment of due.body) {
    const claim = await claimVisitReminder(assessment)
    if (!claim.result.ok) {
      results.push({ assessmentId: assessment.id, status: 'claim_failed' })
      continue
    }
    if (!claim.claimed) continue
    const reminder = await sendAndTrackVisitReminder({ assessment, request })
    results.push({
      assessmentId: assessment.id,
      status: reminder.delivery.ok && !reminder.trackingOk ? 'sent_untracked' : reminder.reminder.status,
    })
  }

  sendJson(response, 200, {
    due: due.body.length,
    failed: results.filter((item) => !['sent', 'sent_untracked'].includes(item.status)).length,
    sent: results.filter((item) => item.status === 'sent').length,
    sentUntracked: results.filter((item) => item.status === 'sent_untracked').length,
    skipped: due.body.length - results.length,
  })
}

function isAuthorizedCron(request) {
  const authorization = request.headers?.authorization || request.headers?.get?.('authorization') || ''
  return Boolean(process.env.CRON_SECRET && authorization === `Bearer ${process.env.CRON_SECRET}`)
}
