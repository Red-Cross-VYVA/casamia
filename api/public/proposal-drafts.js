import { buildPublicPlansDraft } from '../_lib/plans-pricing.js'
import { buildAbsoluteProposalUrl, sendProposalEmail } from '../_lib/email.js'
import { mapProposalRecord, saveProposalRecord, updateProposalRecord } from '../_lib/proposals.js'
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
    const basicError = validateDraftBodyBasics(body)

    if (basicError) {
      sendJson(response, basicError.status, basicError.body)
      return
    }

    const catalogueResult = await selectSupabaseRows(
      'service_catalogue',
      `id=eq.${encodeURIComponent(catalogueRowId)}&select=id,updated_at,payload_json&limit=1`,
    )

    const catalogueRecord = catalogueResult.ok && Array.isArray(catalogueResult.body)
      ? catalogueResult.body[0]
      : undefined
    let catalogueSource = 'supabase'
    let draft = buildPublicPlansDraft({
      body,
      cataloguePayload: catalogueRecord?.payload_json,
    })

    if ((!catalogueResult.ok || !draft.ok) && body?.catalogueSnapshot) {
      const snapshotDraft = buildPublicPlansDraft({
        body,
        cataloguePayload: body.catalogueSnapshot,
      })

      if (snapshotDraft.ok) {
        catalogueSource = 'client-snapshot-fallback'
        draft = snapshotDraft
      } else if (!catalogueResult.ok) {
        sendJson(response, catalogueResult.status, catalogueResult.body)
        return
      }
    }

    if (!draft.ok) {
      sendJson(response, draft.status, withCatalogueDiagnostics(draft, {
        clientSnapshot: body?.catalogueSnapshot,
        supabaseCatalogue: catalogueRecord?.payload_json,
      }))
      return
    }

    draft.proposalPayload.plans_builder = {
      ...(draft.proposalPayload.plans_builder ?? {}),
      catalogue_source: catalogueSource,
    }

    if (catalogueSource !== 'supabase') {
      draft.proposalPayload.events = [
        ...(Array.isArray(draft.proposalPayload.events) ? draft.proposalPayload.events : []),
        {
          at: new Date().toISOString(),
          detail: 'Supabase service catalogue was unavailable or invalid; used the submitted catalogue snapshot.',
          type: 'proposal-catalogue-snapshot-fallback',
        },
      ]
    }

    const saveResult = await saveProposalRecord(draft.proposalPayload)

    if (!saveResult.ok) {
      sendJson(response, saveResult.status, saveResult.body)
      return
    }

    let proposal = mapProposalRecord(saveResult.record)
    const relativePublicUrl = proposal.public_token ? `/proposal/${proposal.public_token}` : ''
    const publicUrl = buildAbsoluteProposalUrl(request, proposal.public_token)
    const emailDelivery = await sendProposalEmail({
      language: draft.proposalPayload?.plans_builder?.language,
      proposal,
      publicUrl,
    })
    const deliveryStatus = emailDelivery.ok
      ? 'sent'
      : emailDelivery.skipped
        ? emailDelivery.status
        : 'failed'
    const eventType = emailDelivery.ok
      ? 'proposal-email-sent'
      : emailDelivery.skipped
        ? 'proposal-email-skipped'
        : 'proposal-email-failed'
    const events = Array.isArray(proposal.events) ? proposal.events : []
    const delivery = {
      ...(proposal.delivery && typeof proposal.delivery === 'object' ? proposal.delivery : {}),
      proposalEmail: {
        at: new Date().toISOString(),
        provider: emailDelivery.provider ?? 'resend',
        reason: emailDelivery.reason ?? '',
        status: deliveryStatus,
      },
    }
    const updateResult = await updateProposalRecord(saveResult.record, {
      delivery,
      events: [
        ...events,
        {
          at: delivery.proposalEmail.at,
          detail: emailDelivery.reason ?? '',
          type: eventType,
        },
      ],
    })

    if (updateResult.ok) {
      proposal = mapProposalRecord(updateResult.record)
    }

    sendJson(response, 200, {
      emailDelivery: delivery.proposalEmail,
      proposal,
      publicToken: proposal.public_token,
      publicUrl: relativePublicUrl,
      publicUrlAbsolute: publicUrl,
    })
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid proposal draft request.',
    })
  }
}

function validateDraftBodyBasics(body) {
  if (hasHoneypotValue(body)) {
    return {
      body: { message: 'Invalid request.' },
      status: 400,
    }
  }

  const customer = body?.customer

  if (!text(customer?.name) || !text(customer?.email)) {
    return {
      body: { message: 'Name and email are required to create a proposal.' },
      status: 400,
    }
  }

  if (body?.consent !== true) {
    return {
      body: { message: 'Consent is required to create a proposal.' },
      status: 400,
    }
  }

  return null
}

function withCatalogueDiagnostics(draft, sources) {
  if (draft.status !== 503) {
    return draft.body
  }

  return {
    ...draft.body,
    code: 'SERVICE_CATALOGUE_NOT_READY',
    details: {
      clientSnapshot: catalogueShape(sources.clientSnapshot),
      required: 'masterCatalogue.rooms, masterCatalogue.packages, masterCatalogue.outcomes and masterCatalogue.relations',
      supabaseCatalogue: catalogueShape(sources.supabaseCatalogue),
    },
  }
}

function catalogueShape(payload) {
  const masterCatalogue = payload?.masterCatalogue ?? payload

  return {
    hasMasterCatalogue: Boolean(payload?.masterCatalogue),
    outcomes: Array.isArray(masterCatalogue?.outcomes) ? masterCatalogue.outcomes.length : 0,
    packages: Array.isArray(masterCatalogue?.packages) ? masterCatalogue.packages.length : 0,
    relations: Array.isArray(masterCatalogue?.relations) ? masterCatalogue.relations.length : 0,
    rooms: Array.isArray(masterCatalogue?.rooms) ? masterCatalogue.rooms.length : 0,
    services: Array.isArray(payload?.services) ? payload.services.length : 0,
  }
}

function hasHoneypotValue(body) {
  return Boolean(text(body?.companyWebsite) || text(body?.website))
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}
