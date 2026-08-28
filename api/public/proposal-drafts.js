import { buildPublicPlansDraft } from '../_lib/plans-pricing.js'
import { applyPublicCors, isAllowedPublicOrigin } from '../_lib/public-origin.js'
import { reservePublicRequest } from '../_lib/public-rate-limit.js'
import { isValidEmail, isWithinLength } from '../_lib/public-form-validation.js'
import { buildAbsoluteProposalUrl, sendProposalEmail } from '../_lib/email.js'
import { mapProposalRecord, mapPublicProposalRecord, saveProposalRecord, updateProposalRecord } from '../_lib/proposals.js'
import { readJsonBody, selectSupabaseRows, sendJson } from '../_lib/supabase.js'
import { getWhatsappTemplate, sendWhatsappTemplate } from '../_lib/whatsapp.js'

const catalogueRowId = 'default'

export default async function handler(request, response, dependencies = {}) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    if (!applyPublicCors(request, response)) {
      sendJson(response, 403, { message: 'Origin not allowed.' })
      return
    }
    response.status(204).end()
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }
  if (!isAllowedPublicOrigin(request)) {
    sendJson(response, 403, { message: 'Origin not allowed.' })
    return
  }
  applyPublicCors(request, response)

  try {
    const body = await readJsonBody(request)
    const basicError = validateDraftBodyBasics(body)

    if (basicError) {
      sendJson(response, basicError.status, basicError.body)
      return
    }

    const reservation = await reservePublicRequest(request, {
      callRpc: dependencies.callRpc,
      env: dependencies.env ?? process.env,
      limit: 5,
      scope: 'proposal-draft',
      windowSeconds: 30 * 60,
    })
    if (!reservation.ok) {
      sendJson(response, reservation.status, {
        message: reservation.status === 429
          ? 'Too many proposal requests. Please try again later.'
          : 'Proposal creation is temporarily unavailable.',
      })
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
      proposal: mapPublicProposalRecord({
        ...saveResult.record,
        payload_json: proposal,
      }),
      publicUrl,
    })
    const whatsappRequested = body?.delivery_whatsapp === true
    const whatsappTemplate = getWhatsappTemplate(
      dependencies.env ?? process.env,
      'proposal',
      draft.proposalPayload?.plans_builder?.language,
    )
    const whatsappDelivery = whatsappRequested
      ? await (dependencies.sendWhatsapp ?? sendWhatsappTemplate)({
          bodyParameters: [
            proposal.customer_name,
            proposal.id,
            publicUrl,
          ],
          env: dependencies.env ?? process.env,
          languageCode: whatsappTemplate.languageCode,
          templateName: whatsappTemplate.templateName,
          to: proposal.customer_phone,
        })
      : { ok: false, provider: 'meta-whatsapp', status: 'not_requested' }
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
    const whatsappEventType = !whatsappRequested
      ? 'proposal-whatsapp-not-requested'
      : whatsappDelivery.ok
        ? 'proposal-whatsapp-sent'
        : 'proposal-whatsapp-failed'
    const events = Array.isArray(proposal.events) ? proposal.events : []
    const delivery = {
      ...(proposal.delivery && typeof proposal.delivery === 'object' ? proposal.delivery : {}),
      proposalEmail: {
        at: new Date().toISOString(),
        provider: emailDelivery.provider ?? 'resend',
        reason: emailDelivery.reason ?? '',
        status: deliveryStatus,
      },
      proposalWhatsapp: {
        at: new Date().toISOString(),
        messageId: whatsappDelivery.messageId ?? '',
        provider: whatsappDelivery.provider ?? 'meta-whatsapp',
        reason: whatsappDelivery.reason ?? '',
        recipient: whatsappDelivery.recipient ?? '',
        status: whatsappDelivery.status,
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
        ...(whatsappRequested ? [{
          at: delivery.proposalWhatsapp.at,
          detail: whatsappDelivery.reason ?? '',
          messageId: whatsappDelivery.messageId ?? '',
          type: whatsappEventType,
        }] : []),
      ],
    })

    if (updateResult.ok) {
      proposal = mapProposalRecord(updateResult.record)
    }

    sendJson(response, 200, {
      emailDelivery: delivery.proposalEmail,
      whatsappDelivery: delivery.proposalWhatsapp,
      proposal: mapPublicProposalRecord({
        ...saveResult.record,
        payload_json: proposal,
      }),
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

  if (
    !isWithinLength(customer?.name, 120, { required: true })
    || !isValidEmail(customer?.email)
    || !isWithinLength(customer?.phone, 40)
    || !isWithinLength(customer?.city, 120)
    || (body?.delivery_whatsapp === true && !isWithinLength(customer?.phone, 40, { required: true }))
  ) {
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
