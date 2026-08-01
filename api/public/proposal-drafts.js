import { buildPublicPlansDraft } from '../_lib/plans-pricing.js'
import { mapProposalRecord, saveProposalRecord } from '../_lib/proposals.js'
import { readJsonBody, selectSupabaseRows, sendJson } from '../_lib/supabase.js'

const catalogueRowId = 'default'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    response.end()
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const catalogueResult = await selectSupabaseRows(
      'service_catalogue',
      `id=eq.${encodeURIComponent(catalogueRowId)}&select=id,updated_at,payload_json&limit=1`,
    )

    if (!catalogueResult.ok) {
      sendJson(response, catalogueResult.status, catalogueResult.body)
      return
    }

    const catalogueRecord = Array.isArray(catalogueResult.body) ? catalogueResult.body[0] : undefined
    const draft = buildPublicPlansDraft({
      body,
      cataloguePayload: catalogueRecord?.payload_json,
    })

    if (!draft.ok) {
      sendJson(response, draft.status, draft.body)
      return
    }

    const saveResult = await saveProposalRecord(draft.proposalPayload)

    if (!saveResult.ok) {
      sendJson(response, saveResult.status, saveResult.body)
      return
    }

    const proposal = mapProposalRecord(saveResult.record)

    sendJson(response, 200, {
      proposal,
      publicToken: proposal.public_token,
      publicUrl: proposal.public_token ? `/proposal/${proposal.public_token}` : '',
    })
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid proposal draft request.',
    })
  }
}
