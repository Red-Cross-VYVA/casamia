import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { readFile } from 'node:fs/promises'

import whatsappWebhookHandler from '../api/webhooks/whatsapp.js'
import { queuePublicReport } from '../api/_lib/public-reports.js'
import {
  completeWhatsappEmbeddedSignup,
  extractWhatsappStatuses,
  getWhatsappConfiguration,
  getWhatsappTemplate,
  normaliseWhatsappRecipient,
  sendWhatsappTemplate,
  verifyWhatsappWebhookSignature,
} from '../api/_lib/whatsapp.js'

const env = {
  CASAMIA_WHATSAPP_PROPOSAL_TEMPLATE_EN: 'casamia_proposal_ready_en',
  CASAMIA_WHATSAPP_REPORT_TEMPLATE_ES: 'casamia_report_ready_es',
  WHATSAPP_ACCESS_TOKEN: 'test-token',
  WHATSAPP_APP_SECRET: 'test-app-secret',
  WHATSAPP_BUSINESS_ID: 'business-1',
  WHATSAPP_GRAPH_API_VERSION: 'v26.0',
  WHATSAPP_PHONE_NUMBER_ID: '123456789',
  WHATSAPP_PUBLIC_PHONE_NUMBER: '34664338991',
  WHATSAPP_TEMPLATE_LANGUAGE_EN: 'en',
  WHATSAPP_TEMPLATE_LANGUAGE_ES: 'es',
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'verify-me',
}

const signupRequests = []
const signupResult = await completeWhatsappEmbeddedSignup({
  code: 'one-time-code',
  env,
  fetchImpl: async (url, init = {}) => {
    const parsedUrl = new URL(url)
    signupRequests.push({ authorization: init.headers?.Authorization, path: parsedUrl.pathname })

    if (parsedUrl.pathname.endsWith('/oauth/access_token')) {
      assert.equal(parsedUrl.searchParams.get('client_secret'), 'test-app-secret')
      assert.equal(parsedUrl.searchParams.has('redirect_uri'), false)
      return Response.json({ access_token: 'embedded-token' })
    }
    if (parsedUrl.pathname.endsWith('/me/businesses')) return Response.json({ data: [{ id: 'business-1' }] })
    if (parsedUrl.pathname.endsWith('/business-1/owned_whatsapp_business_accounts')) {
      return Response.json({ data: [{ id: 'waba-1', name: 'CasaMia' }] })
    }
    if (parsedUrl.pathname.endsWith('/business-1/client_whatsapp_business_accounts')) return Response.json({ data: [] })
    if (parsedUrl.pathname.endsWith('/waba-1/phone_numbers')) {
      return Response.json({ data: [{ display_phone_number: '+34 664 33 89 91', id: 'phone-1' }] })
    }
    return Response.json({ error: { message: 'Unexpected test URL.' } }, { status: 404 })
  },
})
assert.deepEqual(signupResult, {
  businessId: 'business-1',
  phoneNumberId: 'phone-1',
  wabaId: 'waba-1',
})
assert.equal(signupRequests.some((request) => request.authorization === 'Bearer embedded-token'), true)

assert.equal(getWhatsappConfiguration(env).configured, true)
assert.equal(getWhatsappConfiguration({}).configured, false)
assert.equal(normaliseWhatsappRecipient('600 123 456'), '34600123456')
assert.equal(normaliseWhatsappRecipient('+34 600 123 456'), '34600123456')
assert.equal(normaliseWhatsappRecipient('0034 600 123 456'), '34600123456')
assert.equal(normaliseWhatsappRecipient('123'), '')
assert.deepEqual(getWhatsappTemplate(env, 'proposal', 'en'), {
  languageCode: 'en',
  templateName: 'casamia_proposal_ready_en',
})
assert.deepEqual(getWhatsappTemplate(env, 'report', 'es'), {
  languageCode: 'es',
  templateName: 'casamia_report_ready_es',
})

let graphRequest
const sent = await sendWhatsappTemplate({
  bodyParameters: ['Ana', 'CM-123', 'https://www.casamia.com.es/proposal/token'],
  env,
  fetchImpl: async (url, init) => {
    graphRequest = { body: JSON.parse(init.body), headers: init.headers, url }
    return new Response(JSON.stringify({ messages: [{ id: 'wamid.test-message' }] }), { status: 200 })
  },
  languageCode: 'es',
  templateName: 'casamia_proposal_ready_es',
  to: '600 123 456',
})

assert.equal(sent.ok, true)
assert.equal(sent.messageId, 'wamid.test-message')
assert.equal(graphRequest.url, 'https://graph.facebook.com/v26.0/123456789/messages')
assert.equal(graphRequest.headers.Authorization, 'Bearer test-token')
assert.equal(graphRequest.body.messaging_product, 'whatsapp')
assert.equal(graphRequest.body.to, '34600123456')
assert.equal(graphRequest.body.template.language.code, 'es')
assert.deepEqual(
  graphRequest.body.template.components[0].parameters.map((parameter) => parameter.text),
  ['Ana', 'CM-123', 'https://www.casamia.com.es/proposal/token'],
)

assert.equal((await sendWhatsappTemplate({ env: {}, to: '600123456' })).status, 'not_configured')
assert.equal((await sendWhatsappTemplate({ env, templateName: '', to: '600123456' })).status, 'template_not_configured')

const webhookPayload = {
  entry: [{
    changes: [{
      value: {
        statuses: [{
          id: 'wamid.test-message',
          recipient_id: '34600123456',
          status: 'delivered',
          timestamp: '1787927000',
        }],
      },
    }],
  }],
}
const rawWebhook = Buffer.from(JSON.stringify(webhookPayload))
const signature = `sha256=${crypto.createHmac('sha256', env.WHATSAPP_APP_SECRET).update(rawWebhook).digest('hex')}`
assert.equal(verifyWhatsappWebhookSignature(rawWebhook, signature, env), true)
assert.equal(verifyWhatsappWebhookSignature(rawWebhook, 'sha256=bad', env), false)
assert.deepEqual(extractWhatsappStatuses(webhookPayload)[0], {
  at: new Date(1787927000 * 1_000).toISOString(),
  errors: [],
  messageId: 'wamid.test-message',
  recipient: '34600123456',
  status: 'delivered',
})

const verificationResponse = responseRecorder()
await whatsappWebhookHandler({
  method: 'GET',
  query: { 'hub.challenge': 'challenge-value', 'hub.mode': 'subscribe', 'hub.verify_token': 'verify-me' },
}, verificationResponse, { env })
assert.equal(verificationResponse.statusCode, 200)
assert.equal(verificationResponse.body, 'challenge-value')

let appliedStatus
const eventResponse = responseRecorder()
await whatsappWebhookHandler({
  body: rawWebhook,
  headers: { 'x-hub-signature-256': signature },
  method: 'POST',
}, eventResponse, {
  applyStatus: async (status) => { appliedStatus = status },
  env,
})
assert.equal(eventResponse.statusCode, 200)
assert.equal(JSON.parse(eventResponse.body).received, true)
assert.equal(appliedStatus.messageId, 'wamid.test-message')

let storedReportPayload
let reportSend
const reportResult = await queuePublicReport({
  consent_at: '2026-08-28T10:00:00.000Z',
  context: { locale: 'es', region: 'Madrid' },
  customer_email: '',
  customer_name: 'Ana',
  customer_phone: '600 123 456',
  delivery_email: false,
  delivery_whatsapp: true,
  public_token: '33333333-3333-4333-8333-333333333333',
  recommendations: { summary: 'Safer bathroom access.' },
  report_title: 'Informe de seguridad CasaMia',
  summary: 'Safer bathroom access.',
  type: 'safety_report',
}, 'safety_report', {
  create: async (_table, row) => ({ body: [row], ok: true, status: 201 }),
  env,
  request: { headers: { host: 'www.casamia.com.es', 'x-forwarded-proto': 'https' } },
  sendWhatsapp: async (request) => {
    reportSend = request
    return {
      messageId: 'wamid.report-message',
      ok: true,
      provider: 'meta-whatsapp',
      recipient: '34600123456',
      status: 'sent',
    }
  },
  update: async (_table, payload) => {
    storedReportPayload = payload.payload_json
    return { body: [payload], ok: true, status: 200 }
  },
})
assert.equal(reportResult.ok, true)
assert.equal(reportResult.body.whatsapp, 'sent')
assert.equal(reportSend.templateName, 'casamia_report_ready_es')
assert.equal(reportSend.languageCode, 'es')
assert.equal(reportSend.to, '600 123 456')
assert.equal(reportSend.bodyParameters[0], 'Ana')
assert.match(reportSend.bodyParameters[2], /https:\/\/www\.casamia\.com\.es\/estimate\//)
assert.equal(storedReportPayload.whatsapp_delivery.message_id, 'wamid.report-message')
assert.equal(storedReportPayload.delivery_events.at(-1).channel, 'whatsapp')
assert.equal(storedReportPayload.delivery.whatsapp, 'sent')

const proposalSource = await readFile(new URL('../api/public/proposal-drafts.js', import.meta.url), 'utf8')
const reportSource = await readFile(new URL('../api/_lib/public-reports.js', import.meta.url), 'utf8')
const deliveryFormSource = await readFile(new URL('../src/components/ReportDeliveryForm.tsx', import.meta.url), 'utf8')
assert.match(proposalSource, /delivery_whatsapp/)
assert.match(proposalSource, /proposalWhatsapp/)
assert.match(reportSource, /sendWhatsappTemplate/)
assert.match(reportSource, /whatsapp_delivery/)
assert.match(deliveryFormSource, /CASAMIA_WHATSAPP_DELIVERY_ENABLED/)

console.log('WhatsApp delivery tests passed.')

function responseRecorder() {
  return {
    body: '',
    statusCode: 200,
    end(value = '') {
      this.body = String(value)
      return this
    },
    setHeader() {
      return this
    },
    status(value) {
      this.statusCode = value
      return this
    },
  }
}
