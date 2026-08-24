import assert from 'node:assert/strict'

import {
  sendLeadReminderEmail,
  sendNewLeadEmails,
  sendPartnerAssignmentEmail,
} from '../api/_lib/lead-email.js'
import { mapLeadRecord } from '../api/_lib/leads.js'

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

const wizardRecord = {
  city_area: 'Madrid', customer_email: 'ana@example.com', customer_name: 'Ana Lopez',
  customer_phone: '+34600111222', id: 'wizard-record', preferred_contact_method: 'email',
  selected_plan: 'Bathroom', source: 'home-safety-wizard', status: 'New', submitted_at: '2026-08-24T10:00:00Z',
  message: JSON.stringify({ homeDetails: { homeType: 'Apartment', floorCount: 2 }, mobility: 'Uses cane or walker', areasOfConcern: ['bathroom', 'entrance'], notes: 'Please call my daughter.', inspectionChoice: { booked: true } }),
  payload_json: { locale: 'es' },
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
  assert.ok(
    calls[1].html.indexOf('Gracias por dedicar unos minutos')
      < calls[1].html.indexOf('Resumen de tu solicitud'),
  )
  assert.ok(
    calls[1].html.indexOf('Qué ocurre ahora')
      < calls[1].html.indexOf('Resumen de tu solicitud'),
  )
  assert.ok(
    calls[1].html.indexOf('Sobre CasaMia')
      < calls[1].html.indexOf('Resumen de tu solicitud'),
  )
  assert.match(calls[1].html, /https:\/\/www\.casamia\.com\.es\/why-us#contact-form/)

  const wizardLead = mapLeadRecord(wizardRecord, 'assessment')
  assert.equal(wizardLead.message, '')
  assert.deepEqual(wizardLead.submissionDetails, [
    { key: 'homeType', value: 'Apartment' },
    { key: 'floorCount', value: '2' },
    { key: 'mobility', value: 'Uses cane or walker' },
    { key: 'areas', value: 'bathroom, entrance' },
    { key: 'notes', value: 'Please call my daughter.' },
    { key: 'inspection', value: 'Yes' },
  ])
  const beforeWizard = calls.length
  await sendNewLeadEmails({ lead: wizardLead, env, request: { headers: {} } })
  const wizardCustomer = calls[beforeWizard + 1]
  for (const readableText of [
    'Tipo de vivienda', 'Apartment', 'Movilidad', 'Uses cane or walker',
    'Zonas de preocupación', 'bathroom, entrance', 'Notas adicionales',
    'Please call my daughter.', 'Visita a domicilio solicitada', 'Yes',
  ]) {
    assert.match(wizardCustomer.html, new RegExp(readableText))
  }
  assert.doesNotMatch(wizardCustomer.html, /Tu mensaje/)
  assert.doesNotMatch(wizardCustomer.html, /homeDetails|areasOfConcern|inspectionChoice/)

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
