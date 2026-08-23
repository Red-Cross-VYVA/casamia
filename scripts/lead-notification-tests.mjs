import assert from 'node:assert/strict'

import {
  sendLeadReminderEmail,
  sendNewLeadEmails,
  sendPartnerAssignmentEmail,
} from '../api/_lib/lead-email.js'

const originalFetch = globalThis.fetch
const calls = []
globalThis.fetch = async (_url, init) => {
  calls.push(JSON.parse(String(init.body)))
  return new Response(JSON.stringify({ id: `email-${calls.length}` }), { status: 200 })
}

const env = {
  CASAMIA_EMAIL_FROM: 'CasaMia <hola@casamia.com.es>',
  CASAMIA_LEADS_EMAIL: 'operations@casamia.com.es',
  CASAMIA_PUBLIC_SITE_URL: 'https://www.casamia.com.es',
  RESEND_API_KEY: 'test-resend-key',
}
const lead = {
  assignedPartnerEmail: 'partner@example.com',
  city: 'Madrid',
  email: 'ana@example.com',
  followUpAt: '2026-08-25T10:00:00.000Z',
  locale: 'es',
  message: '<Bathroom support>',
  name: 'Ana Lopez',
  partnerNotes: 'Measure the bathroom wall.',
  phone: '+34600111222',
  preferredAt: '2026-08-26',
  selectedPlan: 'Bathroom',
  sourceLabel: 'Assessment',
  status: 'New',
}

try {
  const intake = await sendNewLeadEmails({ lead, env, request: { headers: {} } })
  assert.equal(intake.admin.status, 'sent')
  assert.equal(intake.customer.status, 'sent')
  assert.equal(calls.length, 2)
  assert.deepEqual(calls[0].to, ['operations@casamia.com.es'])
  assert.match(calls[0].html, /https:\/\/www\.casamia\.com\.es\/internal\/leads/)
  assert.match(calls[0].html, /&lt;Bathroom support&gt;/)
  assert.deepEqual(calls[1].to, ['ana@example.com'])
  assert.match(calls[1].subject, /Hemos recibido/)

  const assignment = await sendPartnerAssignmentEmail({ lead, env })
  assert.equal(assignment.partner.status, 'sent')
  assert.deepEqual(calls[2].to, ['partner@example.com'])
  assert.match(calls[2].text, /Measure the bathroom wall/)

  const reminder = await sendLeadReminderEmail({ leads: [lead], env })
  assert.equal(reminder.reminder.status, 'sent')
  assert.deepEqual(calls[3].to, ['operations@casamia.com.es'])
  assert.match(calls[3].subject, /1 CasaMia lead follow-up due/)

  const skipped = await sendNewLeadEmails({ lead, env: {}, request: { headers: {} } })
  assert.equal(skipped.admin.skipped, true)
  assert.equal(skipped.customer.status, 'not_configured')

  console.log('Lead email delivery checks passed.')
} finally {
  globalThis.fetch = originalFetch
}
