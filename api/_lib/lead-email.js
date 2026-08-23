import { buildAbsolutePublicUrl, sendTransactionalEmail } from './email.js'

export async function sendNewLeadEmails({ lead, request, env = process.env }) {
  const internalUrl = buildAbsolutePublicUrl(request, '/internal/leads', env)
  const adminEmail = text(env.CASAMIA_LEADS_EMAIL || env.CASAMIA_NOTIFY_EMAIL)
  const language = getLanguage(lead)
  const [admin, customer] = await Promise.all([
    sendTransactionalEmail({
      env,
      to: adminEmail,
      subject: `New CasaMia ${lead.sourceLabel.toLowerCase()} lead - ${text(lead.name) || 'Customer'}`,
      html: renderAdminLeadHtml(lead, internalUrl),
      text: renderAdminLeadText(lead, internalUrl),
    }),
    sendTransactionalEmail({
      env,
      to: lead.email,
      subject: language === 'es' ? 'Hemos recibido tu solicitud CasaMia' : 'We received your CasaMia request',
      html: renderCustomerConfirmationHtml(lead, language),
      text: renderCustomerConfirmationText(lead, language),
    }),
  ])

  return deliverySummary({ admin, customer })
}

export async function sendPartnerAssignmentEmail({ lead, env = process.env }) {
  const partnerUrl = buildAbsolutePublicUrl(undefined, '/partner', env)
  const partner = await sendTransactionalEmail({
    env,
    to: lead.assignedPartnerEmail,
    subject: `New CasaMia lead assignment - ${text(lead.name) || 'Customer'}`,
    html: renderPartnerAssignmentHtml(lead, partnerUrl),
    text: renderPartnerAssignmentText(lead, partnerUrl),
  })
  return deliverySummary({ partner })
}

export async function sendLeadReminderEmail({ leads, env = process.env }) {
  const internalUrl = buildAbsolutePublicUrl(undefined, '/internal/leads', env)
  const adminEmail = text(env.CASAMIA_LEADS_EMAIL || env.CASAMIA_NOTIFY_EMAIL)
  const reminder = await sendTransactionalEmail({
    env,
    to: adminEmail,
    subject: `${leads.length} CasaMia lead follow-up${leads.length === 1 ? '' : 's'} due`,
    html: renderReminderHtml(leads, internalUrl),
    text: renderReminderText(leads, internalUrl),
  })
  return deliverySummary({ reminder })
}

function renderAdminLeadHtml(lead, internalUrl) {
  return emailFrame(
    'New customer enquiry',
    `<p style="margin:0 0 18px;font-size:17px;line-height:1.55;color:#4d6072;">A new ${escapeHtml(lead.sourceLabel.toLowerCase())} lead has entered the CasaMia pipeline.</p>
     ${detailTable(lead)}
     ${button(internalUrl, 'Open lead pipeline')}`,
  )
}

function renderAdminLeadText(lead, internalUrl) {
  return [
    'New CasaMia customer enquiry',
    `Source: ${lead.sourceLabel}`,
    `Name: ${lead.name || 'Not provided'}`,
    `Phone: ${lead.phone || 'Not provided'}`,
    `Email: ${lead.email || 'Not provided'}`,
    `Area: ${lead.city || 'Not provided'}`,
    `Preferred time: ${lead.preferredAt || 'Not provided'}`,
    `Selected plan: ${lead.selectedPlan || 'Not provided'}`,
    `Message: ${lead.message || 'Not provided'}`,
    '',
    `Open lead pipeline: ${internalUrl}`,
  ].join('\n')
}

function renderCustomerConfirmationHtml(lead, language) {
  const isSpanish = language === 'es'
  const firstName = text(lead.name).split(/\s+/)[0]
  return emailFrame(
    isSpanish ? 'Hemos recibido tu solicitud' : 'We received your request',
    `<p style="margin:0 0 14px;font-size:17px;line-height:1.55;color:#4d6072;">${isSpanish ? `Hola${firstName ? ` ${escapeHtml(firstName)}` : ''},` : `Hello${firstName ? ` ${escapeHtml(firstName)}` : ''},`}</p>
     <p style="margin:0 0 14px;font-size:17px;line-height:1.55;color:#4d6072;">${isSpanish ? 'Gracias por contactar con CasaMia. Hemos guardado tu solicitud y nuestro equipo se pondrá en contacto contigo para confirmar los próximos pasos.' : 'Thank you for contacting CasaMia. We saved your request and our team will contact you to confirm the next steps.'}</p>
     <p style="margin:0;font-size:14px;line-height:1.55;color:#5c7080;">${isSpanish ? 'Si necesitas añadir información, responde directamente a este correo.' : 'Reply directly to this email if you need to add any information.'}</p>`,
  )
}

function renderCustomerConfirmationText(lead, language) {
  const firstName = text(lead.name).split(/\s+/)[0]
  return language === 'es'
    ? `Hola${firstName ? ` ${firstName}` : ''},\n\nGracias por contactar con CasaMia. Hemos guardado tu solicitud y nuestro equipo se pondrá en contacto contigo para confirmar los próximos pasos.\n\nSi necesitas añadir información, responde directamente a este correo.`
    : `Hello${firstName ? ` ${firstName}` : ''},\n\nThank you for contacting CasaMia. We saved your request and our team will contact you to confirm the next steps.\n\nReply directly to this email if you need to add any information.`
}

function renderPartnerAssignmentHtml(lead, partnerUrl) {
  return emailFrame(
    'New lead assigned to you',
    `<p style="margin:0 0 18px;font-size:17px;line-height:1.55;color:#4d6072;">CasaMia assigned a customer lead to your partner workspace.</p>
     ${detailTable({ ...lead, message: lead.partnerNotes || lead.message })}
     ${button(partnerUrl, 'Open partner workspace')}`,
  )
}

function renderPartnerAssignmentText(lead, partnerUrl) {
  return [
    'CasaMia assigned a customer lead to you.',
    `Name: ${lead.name || 'Not provided'}`,
    `Phone: ${lead.phone || 'Not provided'}`,
    `Email: ${lead.email || 'Not provided'}`,
    `Area: ${lead.city || 'Not provided'}`,
    `Instructions: ${lead.partnerNotes || 'None'}`,
    '',
    `Open partner workspace: ${partnerUrl}`,
  ].join('\n')
}

function renderReminderHtml(leads, internalUrl) {
  const rows = leads.map((lead) => `<tr><td style="padding:10px;border-bottom:1px solid #dcecf5;"><strong>${escapeHtml(lead.name || 'Customer')}</strong><br><span style="color:#5c7080;">${escapeHtml(lead.phone || lead.email || 'No contact')}</span></td><td style="padding:10px;border-bottom:1px solid #dcecf5;">${escapeHtml(formatDate(lead.followUpAt))}</td><td style="padding:10px;border-bottom:1px solid #dcecf5;">${escapeHtml(lead.status)}</td></tr>`).join('')
  return emailFrame(
    'Lead follow-ups due',
    `<p style="margin:0 0 18px;font-size:17px;color:#4d6072;">${leads.length} open lead${leads.length === 1 ? ' needs' : 's need'} attention.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #dcecf5;">${rows}</table>${button(internalUrl, 'Review follow-ups')}`,
  )
}

function renderReminderText(leads, internalUrl) {
  return ['CasaMia lead follow-ups due', '', ...leads.map((lead) => `- ${lead.name || 'Customer'} | ${lead.phone || lead.email || 'No contact'} | ${formatDate(lead.followUpAt)} | ${lead.status}`), '', `Review follow-ups: ${internalUrl}`].join('\n')
}

function detailTable(lead) {
  const details = [
    ['Name', lead.name], ['Phone', lead.phone], ['Email', lead.email], ['Area', lead.city],
    ['Preferred time', lead.preferredAt], ['Selected plan', lead.selectedPlan], ['Message', lead.message],
  ]
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #dcecf5;">${details.map(([label, value]) => `<tr><th style="padding:10px;text-align:left;background:#f2f9fd;border-bottom:1px solid #dcecf5;width:34%;">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #dcecf5;">${escapeHtml(value || 'Not provided')}</td></tr>`).join('')}</table>`
}

function emailFrame(title, content) {
  return `<div style="margin:0;background:#eef7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#142235;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #c9e1ef;"><tr><td style="padding:28px 32px 16px;font-size:32px;font-weight:800;color:#102033;">Casa<span style="color:#37a4dc;">Mia</span></td></tr><tr><td style="padding:0 32px 32px;"><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:36px;line-height:1.08;">${escapeHtml(title)}</h1>${content}</td></tr></table></div>`
}

function button(url, label) {
  return `<p style="margin:22px 0 0;"><a href="${escapeHtml(url)}" style="display:inline-block;background:#7bbf3b;color:#fff;text-decoration:none;font-weight:800;border-radius:999px;padding:14px 22px;">${escapeHtml(label)}</a></p>`
}

function deliverySummary(deliveries) {
  return { attemptedAt: new Date().toISOString(), ...deliveries }
}

function getLanguage(lead) {
  return lead.locale === 'es' ? 'es' : 'en'
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(date)
}

function text(value) { return typeof value === 'string' ? value.trim() : '' }
function escapeHtml(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') }
