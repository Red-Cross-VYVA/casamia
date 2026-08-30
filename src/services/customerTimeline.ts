import type { InternalAssessmentRequest } from './internalAssessments.ts'
import type { InternalCallbackRequest } from './internalCallbacks.ts'
import type { Lead } from './internalLeads.ts'
import type { InternalOrder } from './internalOrders.ts'
import type { ProposalData } from './proposalCalculations.ts'

export type CustomerActionPriority = 'urgent' | 'due' | 'normal'
export type CustomerStage = 'New enquiry' | 'Contacting' | 'Visit' | 'Report' | 'Proposal' | 'Scheduled' | 'Completed' | 'Cancelled'
export type CustomerEventKind = 'assessment' | 'callback' | 'lead' | 'order' | 'proposal' | 'visit'

export type CustomerAction = {
  detail: string
  dueAt: string
  href: string
  id: string
  label: string
  priority: CustomerActionPriority
}

export type CustomerTimelineEvent = {
  detail: string
  href: string
  id: string
  kind: CustomerEventKind
  occurredAt: string
  status: string
  title: string
}

export type CustomerRecord = {
  actions: CustomerAction[]
  city: string
  email: string
  events: CustomerTimelineEvent[]
  id: string
  latestAt: string
  name: string
  phone: string
  plan: string
  stage: CustomerStage
}

export type CustomerTimelineInput = {
  assessments: InternalAssessmentRequest[]
  callbacks: InternalCallbackRequest[]
  leads: Lead[]
  orders: InternalOrder[]
  proposals: ProposalData[]
}

type MutableCustomer = Omit<CustomerRecord, 'stage'> & { stageSignals: CustomerStage[] }

const stageOrder: CustomerStage[] = ['Cancelled', 'New enquiry', 'Contacting', 'Visit', 'Report', 'Proposal', 'Scheduled', 'Completed']

export function buildCustomerRecords(input: CustomerTimelineInput, now = new Date()): CustomerRecord[] {
  const records = new Map<string, MutableCustomer>()
  const identities = new Map<string, string>()

  function customerFor(details: { city?: string; email?: string; name?: string; phone?: string; plan?: string }) {
    const identityKeys = getIdentityKeys(details.email ?? '', details.phone ?? '')
    const existingId = identityKeys.map((key) => identities.get(key)).find(Boolean)
    const fallbackId = `customer:${slug(details.name || details.email || details.phone || String(records.size + 1))}`
    const id = existingId ?? identityKeys[0] ?? fallbackId
    let record = records.get(id)

    if (!record) {
      record = {
        actions: [], city: '', email: '', events: [], id, latestAt: '', name: '', phone: '', plan: '', stageSignals: [],
      }
      records.set(id, record)
    }

    identityKeys.forEach((key) => identities.set(key, id))
    record.name ||= clean(details.name)
    record.email ||= clean(details.email).toLowerCase()
    record.phone ||= clean(details.phone)
    record.city ||= clean(details.city)
    record.plan ||= clean(details.plan)
    return record
  }

  function addEvent(record: MutableCustomer, event: CustomerTimelineEvent, stage: CustomerStage) {
    record.events.push(event)
    record.stageSignals.push(stage)
    if (isLater(event.occurredAt, record.latestAt)) record.latestAt = event.occurredAt
  }

  function addAction(record: MutableCustomer, action: CustomerAction) {
    if (!record.actions.some((current) => current.id === action.id)) record.actions.push(action)
  }

  for (const lead of input.leads) {
    const record = customerFor({ city: lead.city, email: lead.email, name: lead.name, phone: lead.phone, plan: lead.selectedPlan })
    const stage = leadStage(lead.status)
    addEvent(record, {
      detail: lead.message || lead.selectedPlan || lead.city || 'Customer enquiry received.',
      href: '/internal/leads', id: `lead:${lead.source}:${lead.id}`, kind: 'lead', occurredAt: lead.submittedAt,
      status: lead.status, title: lead.sourceLabel || 'Customer enquiry',
    }, stage)

    if (lead.status === 'New') addAction(record, action(`lead:${lead.source}:${lead.id}`, 'Contact new lead', 'Make the first contact and record the outcome.', lead.submittedAt, '/internal/leads', agePriority(lead.submittedAt, now)))
    if (lead.followUpAt && !['Won', 'Lost'].includes(lead.status)) addAction(record, action(`follow-up:${lead.source}:${lead.id}`, 'Follow up with customer', lead.notes || 'A follow-up is scheduled for this customer.', lead.followUpAt, '/internal/leads', duePriority(lead.followUpAt, now)))
  }

  for (const request of input.callbacks) {
    const record = customerFor({ city: request.city, email: request.email, name: request.name, phone: request.phone })
    addEvent(record, {
      detail: request.note || [request.preferredCallbackDate, request.preferredTimeWindow].filter(Boolean).join(' · ') || 'Callback requested.',
      href: '/internal/callbacks', id: `callback:${request.id}`, kind: 'callback', occurredAt: request.submittedAt,
      status: request.status, title: 'Callback request',
    }, request.status === 'Cancelled' ? 'Cancelled' : request.status === 'Completed' ? 'Completed' : request.status === 'Contacting' ? 'Contacting' : 'New enquiry')

    if (['New', 'Contacting'].includes(request.status)) {
      const dueAt = callbackDueAt(request) || request.submittedAt
      addAction(record, action(`callback:${request.id}`, 'Return callback', request.preferredTimeWindow || 'Call the customer and record the outcome.', dueAt, '/internal/callbacks', duePriority(dueAt, now)))
    }
  }

  for (const request of input.assessments) {
    const record = customerFor({ city: request.city, email: request.email, name: request.name, phone: request.phone, plan: request.selectedPlan })
    const stage = assessmentStage(request.status)
    addEvent(record, {
      detail: request.message || request.selectedPlan || request.preferredContactMethod || 'Home safety assessment request.',
      href: '/internal/visits', id: `assessment:${request.id}`, kind: 'assessment', occurredAt: request.submittedAt,
      status: request.status, title: 'Assessment request',
    }, stage)

    if (request.appointment) addEvent(record, {
      detail: `Home visit booked for ${formatMoment(request.appointment.startAt)}.`, href: '/internal/visits',
      id: `visit:${request.id}:${request.appointment.startAt}`, kind: 'visit', occurredAt: request.appointment.bookedAt || request.appointment.startAt,
      status: request.appointment.cancelledAt ? 'Cancelled' : 'Scheduled', title: 'Home visit',
    }, request.appointment.cancelledAt ? 'Cancelled' : 'Visit')

    if (['New', 'Contacting'].includes(request.status)) addAction(record, action(`assessment:${request.id}`, 'Review assessment request', 'Confirm the customer needs and the appropriate next step.', request.submittedAt, '/internal/visits', agePriority(request.submittedAt, now)))
    if (request.status === 'Visit payment pending') addAction(record, action(`visit-payment:${request.id}`, 'Collect visit payment', 'The assessment visit must be paid before it can be scheduled.', request.submittedAt, '/internal/visits', 'urgent'))
    if (request.status === 'Visit paid' && !request.appointment) addAction(record, action(`visit-schedule:${request.id}`, 'Schedule paid visit', 'Payment is complete. Agree a date and time with the customer.', request.submittedAt, '/internal/visits', 'urgent'))
    if (request.status === 'Report Pending') addAction(record, action(`report:${request.id}`, 'Complete safety report', 'Prepare and send the customer safety report.', request.appointment?.startAt || request.submittedAt, '/internal/inspection-report', 'urgent'))
    if (request.status === 'Proposal Sent') addAction(record, action(`assessment-proposal:${request.id}`, 'Follow up sent proposal', 'Check whether the customer has questions or is ready to proceed.', request.submittedAt, '/internal/proposals', 'due'))
    if (request.appointment && !request.appointment.cancelledAt && Date.parse(request.appointment.startAt) < now.getTime() && !['Completed', 'Cancelled', 'Report Pending', 'Proposal Sent'].includes(request.status)) {
      addAction(record, action(`visit-outcome:${request.id}`, 'Update visit outcome', 'The visit time has passed. Record the outcome and next step.', request.appointment.startAt, '/internal/visits', 'urgent'))
    }
  }

  for (const order of input.orders) {
    const record = customerFor({ city: order.city, email: order.customerEmail, name: order.customerName, phone: order.customerPhone, plan: order.planLabel })
    addEvent(record, {
      detail: [order.planLabel, order.planPrice, order.preferredTiming].filter(Boolean).join(' · ') || 'Customer plan created.',
      href: '/internal/orders', id: `order:${order.id}`, kind: 'order', occurredAt: order.createdAt,
      status: order.status, title: 'Customer plan',
    }, orderStage(order.status))

    if (['New', 'Quote requested', 'Visit requested'].includes(order.status)) addAction(record, action(`order:${order.id}`, order.status === 'Quote requested' ? 'Prepare requested quote' : 'Review customer plan', 'Review the selected services and move the plan forward.', order.createdAt, '/internal/orders', agePriority(order.createdAt, now)))
  }

  for (const proposal of input.proposals) {
    const record = customerFor({ city: proposal.area, email: proposal.email, name: proposal.customerName, phone: proposal.phone, plan: proposal.selectedPlan })
    addEvent(record, {
      detail: `${proposal.selectedPlan} · ${proposal.lineItems.length} line item${proposal.lineItems.length === 1 ? '' : 's'}`,
      href: `/internal/proposals/${proposal.id}`, id: `proposal:${proposal.id}`, kind: 'proposal', occurredAt: proposal.updatedAt || proposal.createdAt,
      status: proposal.status, title: 'Proposal',
    }, proposalStage(proposal.status))

    if (proposal.status === 'Draft') addAction(record, action(`proposal-draft:${proposal.id}`, 'Finish draft proposal', 'Review pricing and send the proposal to the customer.', proposal.updatedAt || proposal.createdAt, `/internal/proposals/${proposal.id}`, 'due'))
    if (proposal.status === 'Sent') addAction(record, action(`proposal-sent:${proposal.id}`, 'Follow up proposal', 'Confirm receipt and answer any customer questions.', proposal.updatedAt || proposal.createdAt, `/internal/proposals/${proposal.id}`, agePriority(proposal.updatedAt || proposal.createdAt, now)))
    if (proposal.status === 'Accepted') addAction(record, action(`proposal-deposit:${proposal.id}`, 'Confirm deposit payment', 'The proposal is accepted. Confirm the payment step before scheduling.', proposal.acceptanceDate || proposal.updatedAt, `/internal/proposals/${proposal.id}`, 'urgent'))
  }

  return [...records.values()].map(({ stageSignals, ...record }) => ({
    ...record,
    actions: record.actions.sort(compareActions),
    events: record.events.sort((a, b) => timestamp(b.occurredAt) - timestamp(a.occurredAt)),
    stage: stageSignals.sort((a, b) => stageOrder.indexOf(b) - stageOrder.indexOf(a))[0] ?? 'New enquiry',
  })).sort((a, b) => {
    const actionDifference = actionScore(b.actions[0]) - actionScore(a.actions[0])
    return actionDifference || timestamp(b.latestAt) - timestamp(a.latestAt)
  })
}

export function normalizeCustomerPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 9 ? digits.slice(-9) : digits
}

function getIdentityKeys(email: string, phone: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPhone = normalizeCustomerPhone(phone)
  return [normalizedEmail ? `email:${normalizedEmail}` : '', normalizedPhone ? `phone:${normalizedPhone}` : ''].filter(Boolean)
}

function action(id: string, label: string, detail: string, dueAt: string, href: string, priority: CustomerActionPriority): CustomerAction {
  return { detail, dueAt, href, id, label, priority }
}

function agePriority(value: string, now: Date): CustomerActionPriority { return now.getTime() - timestamp(value) >= 86_400_000 ? 'urgent' : 'due' }
function duePriority(value: string, now: Date): CustomerActionPriority { const due = timestamp(value); return due <= now.getTime() ? 'urgent' : due - now.getTime() <= 86_400_000 ? 'due' : 'normal' }
function actionScore(value?: CustomerAction) { return value?.priority === 'urgent' ? 3 : value?.priority === 'due' ? 2 : value ? 1 : 0 }
function compareActions(a: CustomerAction, b: CustomerAction) { return actionScore(b) - actionScore(a) || timestamp(a.dueAt) - timestamp(b.dueAt) }
function callbackDueAt(request: InternalCallbackRequest) { return request.preferredCallbackDate ? `${request.preferredCallbackDate}T09:00:00+02:00` : '' }
function clean(value?: string) { return value?.trim() ?? '' }
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown' }
function timestamp(value: string) { const parsed = Date.parse(value); return Number.isNaN(parsed) ? 0 : parsed }
function isLater(next: string, current: string) { return timestamp(next) > timestamp(current) }
function formatMoment(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'the agreed time' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(date) }
function leadStage(status: Lead['status']): CustomerStage { return status === 'Won' ? 'Completed' : status === 'Lost' ? 'Cancelled' : status === 'Proposal sent' ? 'Proposal' : status === 'Visit booked' ? 'Visit' : status === 'Contacted' ? 'Contacting' : 'New enquiry' }
function assessmentStage(status: string): CustomerStage { if (status === 'Cancelled') return 'Cancelled'; if (status === 'Completed') return 'Completed'; if (status === 'Proposal Sent') return 'Proposal'; if (status === 'Report Pending') return 'Report'; if (['Visit payment pending', 'Visit paid', 'Visit Scheduled', 'In Progress'].includes(status)) return 'Visit'; return status === 'Contacting' ? 'Contacting' : 'New enquiry' }
function orderStage(status: string): CustomerStage { if (status === 'Cancelled') return 'Cancelled'; if (status === 'Completed') return 'Completed'; if (status === 'Scheduled') return 'Scheduled'; if (status === 'Proposal created') return 'Proposal'; return status === 'Contacting' ? 'Contacting' : 'New enquiry' }
function proposalStage(status: ProposalData['status']): CustomerStage { if (status === 'Completed') return 'Completed'; if (status === 'Scheduled') return 'Scheduled'; return 'Proposal' }
