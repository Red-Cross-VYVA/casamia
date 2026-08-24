import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

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

  const skipped = await sendFormSubmissionEmails({ kind: 'contact', recipient: 'a@example.com' })
  assert.equal(skipped.customer.status, 'not_configured')

  console.log('Form email delivery checks passed.')
} finally {
  globalThis.fetch = originalFetch
}
