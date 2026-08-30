import assert from 'node:assert/strict'

import { buildCustomerRecords, normalizeCustomerPhone } from '../src/services/customerTimeline.ts'

const now = new Date('2026-08-30T12:00:00+02:00')

assert.equal(normalizeCustomerPhone('+34 664 33 89 91'), '664338991')
assert.equal(normalizeCustomerPhone('664 33 89 91'), '664338991')

const records = buildCustomerRecords({
  assessments: [{
    appointment: null,
    city: 'Madrid',
    email: 'maria@example.com',
    id: 'assessment-1',
    message: 'Bathroom support needed',
    name: 'Maria Garcia',
    phone: '664 33 89 91',
    preferredContactMethod: 'Phone',
    preferredDate: '',
    selectedPlan: 'Bathroom package',
    source: 'assessment',
    status: 'Visit paid',
    submittedAt: '2026-08-29T09:00:00+02:00',
    type: 'assessment',
    wizardReference: 'CM-1',
  }],
  callbacks: [{
    city: 'Madrid',
    email: '',
    id: 'callback-1',
    locale: 'es',
    name: 'Maria Garcia',
    note: 'Please call after lunch',
    phone: '+34 664 33 89 91',
    preferredCallbackDate: '2026-08-30',
    preferredTimeWindow: 'Afternoon',
    reference: 'CB-1',
    status: 'New',
    submittedAt: '2026-08-29T10:00:00+02:00',
  }],
  leads: [{
    assignedPartnerEmail: '',
    city: 'Madrid',
    email: 'MARIA@example.com',
    followUpAt: '',
    id: 'assessment-1',
    locale: 'es',
    message: 'Bathroom support needed',
    name: 'Maria Garcia',
    notes: '',
    notificationDelivery: {},
    partnerNotes: '',
    phone: '+34 664338991',
    preferredAt: '',
    selectedPlan: 'Bathroom package',
    source: 'assessment',
    sourceLabel: 'Assessment',
    status: 'Contacted',
    submittedAt: '2026-08-29T09:00:00+02:00',
  }],
  orders: [],
  proposals: [],
}, now)

assert.equal(records.length, 1, 'email and Spanish phone variants should merge into one customer')
assert.equal(records[0].events.length, 3)
assert.equal(records[0].stage, 'Visit')
assert.equal(records[0].actions[0].label, 'Schedule paid visit')
assert.equal(records[0].actions[0].priority, 'urgent')
assert.ok(records[0].actions.some((action) => action.label === 'Return callback'))

const proposalRecords = buildCustomerRecords({
  assessments: [], callbacks: [], leads: [], orders: [],
  proposals: [{
    acceptanceDate: '2026-08-30T08:00:00+02:00',
    acceptanceStatus: 'Accepted',
    acceptedBy: 'Maria Garcia',
    address: '',
    area: 'Madrid',
    createdAt: '2026-08-28T08:00:00+02:00',
    customerName: 'Maria Garcia',
    depositRate: 0.5,
    email: 'maria@example.com',
    executiveSummary: '',
    grantEligibilityNote: '',
    grantSupportRequired: false,
    id: 'proposal-1',
    inspectionReference: '',
    lineItems: [],
    overallRiskLevel: 'Moderate',
    paymentTerms: '',
    phone: '+34664338991',
    preparedBy: 'CasaMia',
    proposalDate: '2026-08-28',
    safetyScore: '',
    selectedPlan: 'Home adaptations',
    status: 'Accepted',
    timelineDuration: '',
    timelineNotes: '',
    timelineStartDate: '',
    updatedAt: '2026-08-30T08:00:00+02:00',
    validUntil: '2026-09-30',
  }],
}, now)

assert.equal(proposalRecords[0].actions[0].label, 'Confirm deposit payment')
assert.equal(proposalRecords[0].stage, 'Proposal')

console.log('Customer timeline tests passed.')
