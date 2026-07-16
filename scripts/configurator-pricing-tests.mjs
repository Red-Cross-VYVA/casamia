import assert from 'node:assert/strict'

import {
  calculateConfiguratorQuote,
} from '../src/services/configuratorPricing.ts'

function makeState(overrides = {}) {
  return {
    currentStep: 0,
    property: {
      propertyType: 'apartment',
      floors: 1,
      hasInternalStairs: 'no',
      postcode: '28001',
      relationship: 'family',
    },
    selectedRoomIds: [],
    selectedServiceIds: [],
    quantities: {
      entrances: 1,
      kitchens: 1,
      bedrooms: 1,
      bathrooms: 1,
      staircases: 0,
    },
    answers: {},
    customer: {
      fullName: 'Test Customer',
      email: 'test@example.com',
      telephone: '+34 600 000 000',
      address: 'Test address',
      preferredContact: 'phone',
      preferredLanguage: 'Spanish',
      notes: '',
      consentToContact: true,
    },
    ...overrides,
  }
}

{
  const quote = calculateConfiguratorQuote(makeState())

  assert.equal(quote.oneTimeSubtotal, 0, 'Empty configurator should not create a one-time estimate.')
  assert.equal(quote.selectedServices.length, 0, 'Empty configurator should not create service selections.')
  assert.equal(quote.deposit, 0, 'Empty configurator should not show a visit deposit.')
}

{
  const quote = calculateConfiguratorQuote(
    makeState({
      selectedRoomIds: ['kitchen'],
      selectedServiceIds: ['kitchen-worktop-lighting', 'kitchen-water-leak-sensor'],
    }),
  )

  assert.equal(
    quote.selectedServices.length,
    2,
    'Service selections should be carried into the quote summary.',
  )
  assert.equal(
    quote.lines.some((line) => line.serviceId === 'kitchen-worktop-lighting'),
    true,
    'Selected services should create itemised quote lines.',
  )
  assert.equal(quote.oneTimeSubtotal, 405, 'Kitchen lighting and leak sensor should use itemised prices.')
  assert.equal(quote.vat, 85, 'Service VAT should be calculated from selected service rates.')
  assert.equal(quote.deposit, 99, 'Service selections should keep the visit deposit visible for quote/visit follow-up.')
}

{
  const quote = calculateConfiguratorQuote(
    makeState({
      selectedRoomIds: ['movement'],
      selectedServiceIds: ['movement-stair-handrails', 'movement-stair-treads'],
      property: {
        propertyType: 'townhouse',
        floors: 2,
        hasInternalStairs: 'no',
        postcode: '28001',
        relationship: 'family',
      },
      quantities: { entrances: 1, kitchens: 1, bedrooms: 1, bathrooms: 1, staircases: 2 },
    }),
  )

  assert.equal(
    quote.lines.length,
    0,
    'Stair services should be excluded when the property has no internal stairs.',
  )
}

{
  const quote = calculateConfiguratorQuote(
    makeState({
      selectedRoomIds: ['movement'],
      selectedServiceIds: ['movement-stair-handrails', 'movement-stair-treads'],
      property: {
        propertyType: 'townhouse',
        floors: 2,
        hasInternalStairs: 'yes',
        postcode: '28001',
        relationship: 'family',
      },
      quantities: { entrances: 1, kitchens: 1, bedrooms: 1, bathrooms: 1, staircases: 2 },
    }),
  )

  assert.equal(
    quote.selectedServices.find((selection) => selection.serviceId === 'movement-stair-handrails')?.quantity,
    2,
    'Stair services should multiply by staircase quantity.',
  )
  assert.equal(
    quote.lines.some((line) => line.requiresSiteConfirmation),
    true,
    'Measured stair services should remain marked for site confirmation.',
  )
}

{
  const quote = calculateConfiguratorQuote(
    makeState({
      selectedRoomIds: ['entrance'],
      selectedServiceIds: ['entrance-modular-ramp'],
      quantities: { entrances: 2, kitchens: 1, bedrooms: 1, bathrooms: 1, staircases: 0 },
    }),
  )

  assert.equal(
    quote.quotationOnlyItems.some((item) => item.id === 'entrance-modular-ramp'),
    true,
    'Modular ramps should be quote-only, not fixed-price products.',
  )
  assert.equal(
    quote.siteConfirmationItems.some((item) => item.label === 'Modular access ramp'),
    true,
    'Modular ramps should require measurement confirmation.',
  )
}

{
  const quote = calculateConfiguratorQuote(
    makeState({
      selectedRoomIds: ['connected'],
      selectedServiceIds: ['connected-monitoring'],
    }),
  )

  assert.equal(
    quote.recurringMonthlySubtotal,
    29,
    'Professional monitoring should display monthly support separately from one-time totals.',
  )
  assert.equal(
    quote.includedItems.some((component) => component.label === 'Monitoring eligibility check'),
    true,
    'Selected services should expose their included item list.',
  )
}

console.log('Configurator pricing tests passed.')
