import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { sendProposalEmail } from '../api/_lib/email.js'
import { sendFormSubmissionEmails } from '../api/_lib/form-email.js'

const originalFetch = globalThis.fetch
const calls = []

globalThis.fetch = async (_url, init) => {
  calls.push(JSON.parse(String(init.body)))
  return new Response(JSON.stringify({ id: `form-email-${calls.length}` }), { status: 200 })
}

const env = {
  CASAMIA_EMAIL_FROM: 'CasaMia <hola@casamia.com.es>',
  CASAMIA_LEADS_EMAIL: 'operations@casamia.com.es',
  CASAMIA_PUBLIC_SITE_URL: 'https://www.casamia.com.es',
  RESEND_API_KEY: 'test-resend-key',
}

for (const file of [
  'api/public/assessment-requests.js',
  'api/public/callback-requests.js',
]) {
  assert.match(fs.readFileSync(path.join(process.cwd(), file), 'utf8'), /sendNewLeadEmails/, `${file} must send the shared localized lead confirmation.`)
}

for (const file of [
  'api/public/contact-requests.js',
  'api/public/orders.js',
  'api/public/provider-applications.js',
]) {
  assert.match(fs.readFileSync(path.join(process.cwd(), file), 'utf8'), /sendFormSubmissionEmails/, `${file} must send localized stored-submission emails.`)
}

assert.match(fs.readFileSync(path.join(process.cwd(), 'api/public/proposal-drafts.js'), 'utf8'), /sendProposalEmail/, 'Quote proposals must send their localized proposal email.')

try {
  const complaint = await sendFormSubmissionEmails({
    details: [
      { label: 'Correo electrónico', value: 'ana@example.com' },
      { label: 'Mensaje', value: '<Barra suelta>' },
    ],
    env,
    kind: 'complaint',
    locale: 'es',
    name: 'Ana López',
    recipient: 'ana@example.com',
    reference: 'CM-COMP-42',
    request: { headers: {} },
  })

  assert.equal(complaint.admin.status, 'sent')
  assert.equal(complaint.customer.status, 'sent')
  assert.deepEqual(calls[0].to, ['operations@casamia.com.es'])
  assert.deepEqual(calls[1].to, ['ana@example.com'])
  assert.match(calls[1].subject, /reclamación CasaMia/)
  assert.match(calls[1].html, /Hola Ana/)
  assert.match(calls[1].html, /CM-COMP-42/)
  assert.match(calls[1].html, /&lt;Barra suelta&gt;/)
  assert.match(calls[1].html, /Política de privacidad/)
  assert.match(calls[1].html, /https:\/\/www\.casamia\.com\.es\/why-us#contact-form/)
  assert.ok(calls[1].html.indexOf('Qué ocurre ahora') < calls[1].html.indexOf('Información que nos has enviado'))

  const beforeBooking = calls.length
  await sendFormSubmissionEmails({
    details: [{ label: 'Selected work', value: 'Bathroom essentials' }],
    env,
    kind: 'booking',
    locale: 'en',
    name: 'John Smith',
    recipient: 'john@example.com',
    reference: 'CM-2026-BOOK',
    request: { headers: {} },
  })
  assert.match(calls[beforeBooking + 1].subject, /booking request/)
  assert.match(calls[beforeBooking + 1].html, /Information you submitted/)

  const beforeProvider = calls.length
  await sendFormSubmissionEmails({
    details: [{ label: 'Empresa', value: 'Accesibilidad SL' }],
    env,
    kind: 'provider',
    locale: 'es',
    name: 'Luis',
    recipient: 'luis@example.com',
    reference: 'PPA-TEST',
    request: { headers: {} },
  })
  assert.match(calls[beforeProvider + 1].subject, /solicitud de proveedor/)

  const localizedCases = [
    { kind: 'contact', locale: 'de', subject: /Nachricht/, body: /Ihre übermittelten Angaben/ },
    { kind: 'quote', locale: 'fr', subject: /devis/, body: /Informations que vous avez fournies/ },
    { kind: 'provider', locale: 'nl', subject: /partneraanvraag/, body: /Door u ingediende informatie/ },
  ]

  for (const testCase of localizedCases) {
    const before = calls.length
    await sendFormSubmissionEmails({
      details: [{ label: 'Test', value: 'Localized value' }],
      env,
      kind: testCase.kind,
      locale: testCase.locale,
      name: 'Test Customer',
      recipient: `${testCase.locale}@example.com`,
      reference: `CM-${testCase.locale.toUpperCase()}-TEST`,
      request: { headers: {} },
    })
    assert.match(calls[before + 1].subject, testCase.subject)
    assert.match(calls[before + 1].html, testCase.body)
  }

  const proposalCases = [
    { locale: 'de', subject: 'Ihr CasaMia-Angebot ist fertig', body: /Angebot öffnen/ },
    { locale: 'fr', subject: 'Votre proposition CasaMia est prête', body: /Ouvrir la proposition/ },
    { locale: 'nl', subject: 'Uw CasaMia-voorstel is klaar', body: /Voorstel openen/ },
  ]

  for (const testCase of proposalCases) {
    const before = calls.length
    const proposalEmail = await sendProposalEmail({
      env,
      language: testCase.locale,
      proposal: {
        customer_email: `${testCase.locale}-proposal@example.com`,
        customer_name: 'Test Customer',
        line_items: [{ name: 'Safety package', quantity: 1 }],
        total_estimate: 699,
      },
      publicUrl: 'https://www.casamia.com.es/proposal/test-token',
    })
    assert.equal(proposalEmail.status, 'sent')
    assert.equal(calls[before].subject, testCase.subject)
    assert.match(calls[before].html, testCase.body)
  }

  const skipped = await sendFormSubmissionEmails({ kind: 'contact', recipient: 'a@example.com' })
  assert.equal(skipped.customer.status, 'not_configured')

  console.log('Form email delivery checks passed.')
} finally {
  globalThis.fetch = originalFetch
}
