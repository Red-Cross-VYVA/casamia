import assert from 'node:assert/strict'

import {
  calculateConfiguratorQuote,
} from '../src/services/configuratorPricing.ts'
import { configuratorPricing } from '../src/config/casamiaPackages.ts'

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
    selectedPackageIds: [],
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
  const quote = calculateConfiguratorQuote(
    makeState({
      selectedPackageIds: ['bathroom-safe', 'bedroom-night-safe'],
      quantities: { entrances: 1, kitchens: 1, bedrooms: 2, bathrooms: 2, staircases: 0 },
    }),
  )

  assert.equal(
    quote.oneTimeSubtotal,
    configuratorPricing.packagePrices['bathroom-safe'] * 2 +
      configuratorPricing.packagePrices['bedroom-night-safe'] * 2,
    'Bathroom and bedroom quantities should multiply package totals.',
  )
}

{
  const quote = calculateConfiguratorQuote(
    makeState({
      selectedPackageIds: ['home-movement-safe'],
      property: {
        propertyType: 'townhouse',
        floors: 2,
        hasInternalStairs: 'no',
        postcode: '28001',
        relationship: 'family',
      },
      quantities: { entrances: 1, kitchens: 1, bedrooms: 1, bathrooms: 1, staircases: 3 },
    }),
  )

  assert.equal(
    quote.lines.some((line) => line.id === 'staircase-module'),
    false,
    'Stair costs should be excluded when there are no internal stairs.',
  )
}

{
  const quote = calculateConfiguratorQuote(
    makeState({
      selectedPackageIds: ['home-movement-safe'],
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
    quote.lines.find((line) => line.id === 'staircase-module')?.total,
    configuratorPricing.staircaseModulePrice * 2,
    'Staircase module should apply once per staircase.',
  )
}

{
  const quote = calculateConfiguratorQuote(
    makeState({
      selectedPackageIds: ['entrance-safe'],
      quantities: { entrances: 2, kitchens: 1, bedrooms: 1, bathrooms: 1, staircases: 0 },
      answers: {
        'entrance-1-ramp': 'small-threshold-ramp',
        'entrance-2-ramp': 'modular-access-ramp',
      },
    }),
  )

  assert.equal(
    quote.lines.some((line) => line.label.includes('entrance 1')),
    true,
    'Entrance quantities should be configurable individually.',
  )
  assert.equal(
    quote.quotationOnlyItems.some((item) => item.id === 'modular-access-ramp'),
    true,
    'Modular ramps should be quotation-only, not fixed-price products.',
  )
}

{
  const noGasQuote = calculateConfiguratorQuote(
    makeState({
      selectedPackageIds: ['kitchen-independence'],
      answers: { 'kitchen-1-gas': 'no' },
    }),
  )
  const gasQuote = calculateConfiguratorQuote(
    makeState({
      selectedPackageIds: ['kitchen-independence'],
      answers: { 'kitchen-1-gas': 'yes' },
    }),
  )

  assert.equal(
    noGasQuote.standardComponents.some((component) => component.id === 'gas-co-sensor'),
    false,
    'Gas sensor should not appear when gas is not present.',
  )
  assert.equal(
    gasQuote.standardComponents.some((component) => component.id === 'gas-co-sensor'),
    true,
    'Gas sensor should appear when gas is present.',
  )
}

{
  const quote = calculateConfiguratorQuote(
    makeState({
      selectedPackageIds: ['connected-safety-vyva'],
      answers: {
        'connected-alerts': ['family', 'monitoring'],
        'connected-outsideProtection': 'yes',
      },
    }),
  )

  assert.equal(
    quote.standardComponents.some((component) => component.id === 'vyva-app'),
    true,
    'Connected Safety should include VYVA.',
  )
  assert.equal(
    quote.standardComponents.some((component) => component.id === 'emergency-button'),
    true,
    'Connected Safety should include an emergency button.',
  )
  assert.equal(
    quote.standardComponents.some((component) => component.id === 'fall-detection'),
    true,
    'Connected Safety should include fall detection.',
  )
  assert.equal(
    quote.recurringMonthlySubtotal,
    configuratorPricing.recurringPrices['monitoring-plan'] +
      configuratorPricing.recurringPrices['gps-protection'],
    'Monthly monitoring and GPS costs should be displayed separately from one-time totals.',
  )
}

console.log('Configurator pricing tests passed.')
