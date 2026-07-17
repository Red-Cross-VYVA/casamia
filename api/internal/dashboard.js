import { requireInternalApiKey, selectSupabaseRows, sendJson } from '../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (!requireInternalApiKey(request, response)) return
  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const results = await Promise.all([
    selectSupabaseRows('assessment_requests', 'select=id,status&limit=1000'),
    selectSupabaseRows('contact_requests', 'type=eq.callback_request&select=id,status&limit=1000'),
    selectSupabaseRows('proposals', 'select=id,status&limit=1000'),
    selectSupabaseRows('provider_applications', 'select=id,status&limit=1000'),
    selectSupabaseRows('orders', 'select=id,status&limit=1000'),
    selectSupabaseRows('service_catalogue', 'id=eq.default&select=payload_json&limit=1'),
  ])
  const names = ['assessments', 'callbacks', 'proposals', 'providers', 'orders', 'catalogue']
  const issues = results.flatMap((result, index) => result.ok ? [] : [`${names[index]}: ${result.body?.message ?? 'unavailable'}`])
  const [assessments, callbacks, proposals, providers, orders, catalogue] = results.map(rows)
  const services = Array.isArray(catalogue[0]?.payload_json?.services) ? catalogue[0].payload_json.services : []

  sendJson(response, 200, {
    issues,
    stats: {
      activeServices: services.filter((service) => service?.active !== false).length,
      newAssessments: assessments.filter((row) => row.status === 'New').length,
      newCustomerPlans: orders.filter((row) => ['New', 'Quote requested', 'Visit requested'].includes(row.status)).length,
      openCallbacks: callbacks.filter((row) => ['New', 'Contacting'].includes(row.status)).length,
      pendingProposals: proposals.filter((row) => ['Draft', 'Sent'].includes(row.status)).length,
      providerLeads: providers.filter((row) => ['new', 'reviewing'].includes(row.status)).length,
    },
  })
}

function rows(result) {
  return result.ok && Array.isArray(result.body) ? result.body : []
}
