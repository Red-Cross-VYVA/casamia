import { buildAbsolutePublicUrl, sendTransactionalEmail } from './email.js'

export async function sendCustomerFollowUpEmails({ actions, staleLeads, env = process.env } = {}) {
  const customerUrl = buildAbsolutePublicUrl(undefined, '/internal/customers', env)
  const leadUrl = buildAbsolutePublicUrl(undefined, '/internal/leads', env)
  const operationsEmail = text(env.CASAMIA_LEADS_EMAIL || env.CASAMIA_NOTIFY_EMAIL)
  const grouped = groupByOwnerEmail(actions)
  const ownerDeliveries = []

  for (const [email, ownerActions] of grouped) {
    if (!email || email === operationsEmail.toLowerCase()) continue
    const ownerName = ownerActions.find((action) => action.owner)?.owner || 'CasaMia team member'
    const delivery = await sendTransactionalEmail({
      env,
      to: email,
      subject: `${ownerActions.length} CasaMia customer action${ownerActions.length === 1 ? '' : 's'} due`,
      html: renderOwnerHtml(ownerName, ownerActions, customerUrl),
      text: renderOwnerText(ownerName, ownerActions, customerUrl),
    })
    ownerDeliveries.push({ delivery, email, count: ownerActions.length })
  }

  const digest = actions.length || staleLeads.length
    ? await sendTransactionalEmail({
        env,
        to: operationsEmail,
        subject: `CasaMia daily follow-up digest: ${actions.length} due, ${staleLeads.length} uncontacted`,
        html: renderDigestHtml(actions, staleLeads, customerUrl, leadUrl),
        text: renderDigestText(actions, staleLeads, customerUrl, leadUrl),
      })
    : { ok: true, status: 'skipped', reason: 'nothing_due' }

  return { digest, ownerDeliveries }
}

function groupByOwnerEmail(actions = []) {
  const groups = new Map()
  for (const action of actions) {
    const email = text(action.ownerEmail).toLowerCase()
    if (!email) continue
    groups.set(email, [...(groups.get(email) || []), action])
  }
  return groups
}

function renderOwnerHtml(ownerName, actions, customerUrl) {
  return frame('Customer actions due', `<p style="margin:0 0 18px;color:#4d6072;">Hello ${escapeHtml(ownerName)}, these customer actions need your attention.</p>${actionTable(actions)}${button(customerUrl, 'Open customer operations')}`)
}

function renderOwnerText(ownerName, actions, customerUrl) {
  return [`Hello ${ownerName},`, '', 'These customer actions need your attention:', ...actions.map(actionLine), '', `Open customer operations: ${customerUrl}`].join('\n')
}

function renderDigestHtml(actions, staleLeads, customerUrl, leadUrl) {
  const due = actions.length ? `<h2 style="margin:24px 0 10px;color:#142235;">Overdue customer actions</h2>${actionTable(actions)}${button(customerUrl, 'Open customer operations')}` : ''
  const stale = staleLeads.length ? `<h2 style="margin:24px 0 10px;color:#142235;">New leads uncontacted for 48+ hours</h2>${leadTable(staleLeads)}${button(leadUrl, 'Open lead pipeline')}` : ''
  return frame('Daily follow-up digest', `<p style="margin:0 0 18px;color:#4d6072;">${actions.length} overdue customer action${actions.length === 1 ? '' : 's'} and ${staleLeads.length} new lead${staleLeads.length === 1 ? '' : 's'} awaiting first contact.</p>${due}${stale}`)
}

function renderDigestText(actions, staleLeads, customerUrl, leadUrl) {
  return [
    'CasaMia daily follow-up digest', '',
    `Overdue customer actions (${actions.length})`, ...actions.map(actionLine),
    '', `Customer operations: ${customerUrl}`, '',
    `New leads uncontacted for 48+ hours (${staleLeads.length})`, ...staleLeads.map(leadLine),
    '', `Lead pipeline: ${leadUrl}`,
  ].join('\n')
}

function actionTable(actions) {
  const rows = actions.map((action) => `<tr><td style="padding:10px;border-bottom:1px solid #dcecf5;"><strong>${escapeHtml(customerLabel(action.customerKey))}</strong><br><span style="color:#5c7080;">${escapeHtml(action.owner || 'Unassigned')}</span></td><td style="padding:10px;border-bottom:1px solid #dcecf5;">${escapeHtml(action.nextAction)}</td><td style="padding:10px;border-bottom:1px solid #dcecf5;">${escapeHtml(formatDate(action.nextActionDueAt))}</td></tr>`).join('')
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #dcecf5;">${rows}</table>`
}

function leadTable(leads) {
  const rows = leads.map((lead) => `<tr><td style="padding:10px;border-bottom:1px solid #dcecf5;"><strong>${escapeHtml(lead.name || 'Customer')}</strong><br><span style="color:#5c7080;">${escapeHtml(lead.phone || lead.email || 'No contact')}</span></td><td style="padding:10px;border-bottom:1px solid #dcecf5;">${escapeHtml(lead.sourceLabel)}</td><td style="padding:10px;border-bottom:1px solid #dcecf5;">${escapeHtml(formatDate(lead.submittedAt))}</td></tr>`).join('')
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #dcecf5;">${rows}</table>`
}

function actionLine(action) { return `- ${customerLabel(action.customerKey)} | ${action.nextAction} | ${formatDate(action.nextActionDueAt)} | ${action.owner || 'Unassigned'}` }
function leadLine(lead) { return `- ${lead.name || 'Customer'} | ${lead.phone || lead.email || 'No contact'} | ${lead.sourceLabel} | received ${formatDate(lead.submittedAt)}` }
function customerLabel(value) { return text(value).replace(/^(email|phone|customer):/, '') || 'Customer' }
function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(date) }
function frame(title, content) { return `<div style="margin:0;background:#eef7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#142235;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #c9e1ef;"><tr><td style="padding:28px 32px 16px;font-size:32px;font-weight:800;">Casa<span style="color:#37a4dc;">Mia</span></td></tr><tr><td style="padding:0 32px 32px;"><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:34px;line-height:1.1;">${escapeHtml(title)}</h1>${content}</td></tr></table></div>` }
function button(url, label) { return `<p style="margin:22px 0 0;"><a href="${escapeHtml(url)}" style="display:inline-block;background:#7bbf3b;color:#fff;text-decoration:none;font-weight:800;border-radius:999px;padding:14px 22px;">${escapeHtml(label)}</a></p>` }
function text(value) { return typeof value === 'string' ? value.trim() : '' }
function escapeHtml(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') }
