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
  assert.match(calls[1].html, /Resumen de tu solicitud/)
  assert.match(calls[1].html, /Política de privacidad/)
  assert.match(calls[1].html, /https:\/\/www\.casamia\.com\.es\/privacy-policy/)
  assert.match(calls[1].html, /https:\/\/www\.casamia\.com\.es\/legal-notice/)
  assert.match(calls[1].html, /https:\/\/www\.casamia\.com\.es\/general-customer-terms/)
  assert.match(calls[1].html, /hola@casamia\.com\.es/)

  const localizedSubjects = {
    de: /Ihre CasaMia-Anfrage/,
    en: /We received your CasaMia request/,
    fr: /votre demande CasaMia/,
    nl: /uw CasaMia-aanvraag/,
  }
  for (const [locale, subject] of Object.entries(localizedSubjects)) {
    const before = calls.length
    const localized = await sendNewLeadEmails({ lead: { ...lead, locale }, env, request: { headers: {} } })
    assert.equal(localized.customer.status, 'sent')
    assert.match(calls[before + 1].subject, subject)
    assert.match(calls[before + 1].html, /&lt;Bathroom support&gt;/)
  }

  const assignment = await sendPartnerAssignmentEmail({ lead, env })
  assert.equal(assignment.partner.status, 'sent')
  assert.deepEqual(calls.at(-1).to, ['partner@example.com'])
  assert.match(calls.at(-1).text, /Measure the bathroom wall/)

  const reminder = await sendLeadReminderEmail({ leads: [lead], env })
  assert.equal(reminder.reminder.status, 'sent')
  assert.deepEqual(calls.at(-1).to, ['operations@casamia.com.es'])
  assert.match(calls.at(-1).subject, /1 CasaMia lead follow-up due/)

  const skipped = await sendNewLeadEmails({ lead, env: {}, request: { headers: {} } })
  assert.equal(skipped.admin.skipped, true)
  assert.equal(skipped.customer.status, 'not_configured')

  console.log('Lead email delivery checks passed.')
} finally {
  globalThis.fetch = originalFetch
}
