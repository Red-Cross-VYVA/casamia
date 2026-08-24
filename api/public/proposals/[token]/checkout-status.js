import { getProposalRecordByToken, isPublicProposalToken, mapProposalRecord, updateProposalRecord } from '../../../_lib/proposals.js'
import { getStripeClient, StripeConfigurationError } from '../../../_lib/stripe.js'
import { sendJson } from '../../../_lib/supabase.js'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'GET') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return
  }

  const token = getParam(request, 'token')
  const sessionId = getParam(request, 'session_id')
  if (!isPublicProposalToken(token) || !/^cs_(?:test_|live_)?[A-Za-z0-9_]+$/.test(sessionId)) {
    sendJson(response, 400, { message: 'A valid proposal payment session is required.' })
    return
  }

  try {
    const current = await getProposalRecordByToken(token)
    if (!current.ok) {
      sendJson(response, current.status, current.body)
      return
    }
    const proposal = mapProposalRecord(current.record)
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId)
    const matchesProposal = session.metadata?.casa_mia_payment_type === 'proposal_deposit'
      && session.metadata?.proposal_id === proposal.id
      && session.metadata?.public_token === token
    if (!matchesProposal) {
      sendJson(response, 404, { message: 'The proposal payment was not found.' })
      return
    }

    if (session.payment_status === 'paid' && proposal.status !== 'Deposit Paid') {
      await recordPaidProposal(current.record, proposal, session)
    }

    sendJson(response, 200, {
      paymentStatus: session.payment_status,
      proposalId: proposal.id,
      status: session.status,
    })
  } catch (error) {
    const configurationError = error instanceof StripeConfigurationError
    sendJson(response, configurationError ? 503 : 400, {
      message: configurationError ? 'Payment verification is temporarily unavailable.' : 'The proposal payment could not be verified.',
    })
  }
}

async function recordPaidProposal(record, proposal, session) {
  const now = new Date().toISOString()
  const events = Array.isArray(proposal.events) ? proposal.events : []
  const currentPayment = proposal.proposalPayment && typeof proposal.proposalPayment === 'object'
    ? proposal.proposalPayment
    : {}
  const result = await updateProposalRecord(record, {
    events: [...events, { at: now, sessionId: session.id, type: 'deposit-paid-verified' }],
    proposalPayment: {
      ...currentPayment,
      amount: session.amount_total,
      currency: session.currency,
      paidAt: now,
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
      paymentStatus: session.payment_status,
      sessionId: session.id,
      status: 'paid',
    },
    status: 'Deposit Paid',
  })
  if (!result.ok) throw new Error('The paid proposal could not be updated.')
}

function getParam(request, name) {
  const value = request.query?.[name]
  return Array.isArray(value) ? String(value[0] || '') : String(value || '')
}
