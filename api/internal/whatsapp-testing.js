import { getWhatsappDiagnostics, getWhatsappTemplate, sendWhatsappTemplate } from '../_lib/whatsapp.js'
import { requireInternalApiKey, sendJson } from '../_lib/supabase.js'

function getTestingEnvironment(env) {
  const testAccessToken = String(env.WHATSAPP_TEST_ACCESS_TOKEN ?? '').trim()
  const testPhoneNumberId = String(env.WHATSAPP_TEST_PHONE_NUMBER_ID ?? '').trim()

  return {
    env: {
      ...env,
      WHATSAPP_ACCESS_TOKEN: testAccessToken || env.WHATSAPP_ACCESS_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID: testPhoneNumberId || env.WHATSAPP_PHONE_NUMBER_ID,
    },
    usingTestCredentials: Boolean(testAccessToken && testPhoneNumberId),
  }
}

export default async function handler(request, response, dependencies = {}) {
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }
  if (!requireInternalApiKey(request, response)) return

  const env = dependencies.env ?? process.env
  const testing = getTestingEnvironment(env)
  if (request.method === 'GET') {
    const diagnostics = await (dependencies.getDiagnostics ?? getWhatsappDiagnostics)({
      env: testing.env,
      fetchImpl: dependencies.fetchImpl,
    })
    sendJson(response, 200, {
      ...diagnostics,
      usingTestCredentials: testing.usingTestCredentials,
      webhookUrl: 'https://www.casamia.com.es/api/webhooks/whatsapp',
    })
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const body = request.body && typeof request.body === 'object' ? request.body : {}
  const language = String(body.language ?? 'en').toLowerCase().startsWith('es') ? 'es' : 'en'
  const mode = ['connectivity', 'proposal', 'report'].includes(body.mode) ? body.mode : 'connectivity'
  const template = mode === 'connectivity'
    ? { languageCode: 'en_US', templateName: 'hello_world' }
    : getWhatsappTemplate(testing.env, mode, language)
  const sampleUrl = mode === 'proposal'
    ? 'https://www.casamia.com.es/plans'
    : 'https://www.casamia.com.es/home-safety-report'
  const bodyParameters = mode === 'connectivity'
    ? []
    : ['CasaMia test customer', mode === 'proposal' ? 'CM-TEST' : 'CasaMia test report', sampleUrl]

  const result = await (dependencies.sendWhatsapp ?? sendWhatsappTemplate)({
    bodyParameters,
    env: testing.env,
    languageCode: template.languageCode,
    templateName: template.templateName,
    to: body.to,
  })

  console.info('[whatsapp-testing] send result', {
    language,
    messageId: result.messageId,
    mode,
    ok: result.ok,
    status: result.status,
  })

  sendJson(response, result.ok ? 200 : 422, {
    language,
    mode,
    result,
    template: template.templateName || null,
  })
}
