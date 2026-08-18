import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import { getDefaultServiceCatalogue } from '../src/services/serviceCatalogue.ts'
import {
  buildPlansBuilderGroups,
  calculatePlansBuilderEstimate,
  formatPlansEstimateLabel,
} from '../src/services/plansBuilderPricing.ts'

const defaultCatalogue = getDefaultServiceCatalogue()
const plansPage = await readFile(new URL('../src/pages/PlansPage.tsx', import.meta.url), 'utf8')

assert.match(
  plansPage,
  /plan-detail-modal--\$\{activeDetailDisplayMode\} plan-detail-modal--compact/,
  'Every Plans package detail modal should use the compact layout.',
)
assert.doesNotMatch(
  plansPage,
  /<span>\{activeDetail\.body\}<\/span>|plan-detail-thumb-row|plan-detail-footnote|activeDetailIsBathroomCompact/,
  'The Plans compact package modal should not render intro copy, thumbnails, footer notes, or bathroom-only branching.',
)
assert.match(
  plansPage,
  /id="plans-room-planner"/,
  'The Plans page should render the inline interactive room planner.',
)
assert.match(
  plansPage,
  /aria-pressed=\{selected\}/,
  'Room planner buttons should expose selected state with aria-pressed.',
)
assert.match(
  plansPage,
  /roomPlannerVisuals[\s\S]*plans-room-planner-room-media/,
  'Room planner should use refined in-situ visual room cards.',
)
assert.match(
  plansPage,
  /includedLabel[\s\S]*extrasLabel[\s\S]*plans-room-planner-room-counts/,
  'Room planner tiles should show the number of included package items instead of abstract core wording.',
)
assert.match(
  plansPage,
  /const visibleGroups = showingSelectedPackages[\s\S]*activeSupportFilter[\s\S]*: groups/,
  'The Plans catalogue should derive visible groups from selected rooms or support filters.',
)
assert.match(
  plansPage,
  /\{visibleGroups\.map\(\(group\) =>/,
  'The Plans package cards should render from visibleGroups.',
)
assert.doesNotMatch(
  plansPage,
  /PlansCatalogueIntroSection|plans-catalogue-guide|services-catalogue-guide|catalogueGuide|services-catalogue\.css|1 core|plans-room-planner-room-tooltip|plans-room-planner-scene/,
  'The old Plans guide modal, services-catalogue dependency, hover popover, and shared scene should be removed from PlansPage.',
)
assert.doesNotMatch(
  plansPage,
  /copy\.roomDescriptions\[group\.room\.id\]|plans-room-turnkey-note|turnkeyCardLabel|turnkeyCardBody/,
  'Long room descriptions and turnkey explanatory text should not render directly on Plans room cards.',
)

assert.ok(defaultCatalogue.masterCatalogue, 'Default service catalogue must include the master catalogue snapshot.')
assert.ok(
  defaultCatalogue.masterCatalogue.packages.length > 0,
  'Default service catalogue snapshot must include master packages for proposal fallback.',
)
const defaultGroups = buildPlansBuilderGroups(defaultCatalogue, 'en', { publicOnly: true })
const bathroomGroup = defaultGroups.find((group) => group.room.id === 'bathroom')
const bedroomGroup = defaultGroups.find((group) => group.room.id === 'bedroom')

assert.ok(bathroomGroup, 'The public Plans builder must include the bathroom package.')
assert.ok(bedroomGroup, 'The public Plans builder must include the bedroom package.')

{
  const estimate = calculatePlansBuilderEstimate(defaultGroups, {
    [bathroomGroup.homePackage.id]: { addOnOutcomeIds: [], quantity: 2, selected: true },
    [bedroomGroup.homePackage.id]: { addOnOutcomeIds: [], quantity: 2, selected: true },
  }, 'en')

  assert.equal(estimate.selectedRoomQuantity, 4, 'Room package quantities must multiply for 2 bathrooms + 2 bedrooms.')
  assert.equal(estimate.selectedPackageCount, 2, 'Two selected room package types should be counted.')
  assert.equal(
    estimate.oneTimeEstimate,
    bathroomGroup.packageUnitPrice * 2 + bedroomGroup.packageUnitPrice * 2,
    'One-time estimates must recalculate from catalogue package IDs and quantities.',
  )
  assert.equal(estimate.proposalLineItems.length, 2, 'Numeric room packages should produce proposal line items.')
  assert.match(formatPlansEstimateLabel(estimate, 'en'), /^From /)
  assert.match(formatPlansEstimateLabel(estimate, 'es'), /^Desde /)
}

{
  const syntheticGroups = buildPlansBuilderGroups(makeSyntheticCatalogue(), 'en', { publicOnly: true })
  assert.equal(syntheticGroups.length, 1, 'Hidden or unsupported package groups must stay out of the public builder.')

  const group = syntheticGroups[0]
  const connectedOutcome = group.addOnPackages
    .flatMap((packageGroup) => packageGroup.outcomes)
    .find((outcome) => outcome.id === 'bath-connected-sensor')
  const quoteOutcome = group.addOnPackages
    .flatMap((packageGroup) => packageGroup.outcomes)
    .find((outcome) => outcome.id === 'bath-quote-entry')

  assert.ok(connectedOutcome, 'Visible add-on outcomes should be selectable.')
  assert.ok(quoteOutcome, 'Visible quote-only outcomes should be selectable.')

  const estimate = calculatePlansBuilderEstimate(syntheticGroups, {
    [group.homePackage.id]: {
      addOnOutcomeIds: ['bath-connected-sensor', 'bath-quote-entry', 'bath-hidden-outcome'],
      quantity: 2.8,
      selected: true,
    },
  }, 'en')

  assert.equal(estimate.selectedRoomQuantity, 2, 'Quantities must be normalised to whole rooms.')
  assert.equal(estimate.oneTimeEstimate, 364, 'Fixed, range/from and quote-only pricing must be combined correctly.')
  assert.equal(estimate.recurringMonthlyEstimate, 24, 'Recurring monthly costs must be tracked separately.')
  assert.equal(estimate.requiresReview, true, 'Quote-only items must be flagged for CasaMia review.')
  assert.deepEqual(estimate.reviewItems, ['Shower entry review'])
  assert.equal(
    estimate.lineItems.some((line) => line.sourceOutcomeId === 'bath-hidden-outcome'),
    false,
    'Inactive or hidden catalogue outcomes must be ignored even when submitted by the client.',
  )
  assert.equal(
    estimate.lineItems.find((line) => line.sourceOutcomeId === 'bath-quote-entry')?.lineTotal,
    0,
    'Quote-only outcomes must be excluded from numeric totals.',
  )
}

{
  const hiddenCatalogue = makeSyntheticCatalogue()
  hiddenCatalogue.masterCatalogue.packages = hiddenCatalogue.masterCatalogue.packages.map((packageRecord) =>
    packageRecord.id === 'bath-core-package'
      ? { ...packageRecord, websiteVisible: false }
      : packageRecord,
  )

  assert.equal(
    buildPlansBuilderGroups(hiddenCatalogue, 'en', { publicOnly: true }).length,
    0,
    'Hidden core packages must remove the room from the public Plans builder.',
  )
}

function makeSyntheticCatalogue() {
  return {
    masterCatalogue: {
      version: 'test',
      updatedAt: '2026-08-02T00:00:00.000Z',
      rooms: [
        { active: true, id: 'bathroom', name: { en: 'Bathroom', es: 'Bano' }, slug: 'bathroom', sortOrder: 10 },
      ],
      sections: [],
      packages: [
        makePackage({
          fixedPrice: 100,
          id: 'bath-core-package',
          pricingType: 'fixed',
          section: 'home-safety-package',
          sortOrder: 10,
        }),
        makePackage({
          fromPrice: 50,
          id: 'bath-connected-package',
          pricingType: 'range',
          recurringMonthlyPrice: 10,
          section: 'connected-room',
          sortOrder: 20,
        }),
        makePackage({
          id: 'bath-specialist-package',
          pricingType: 'quote',
          requiresQuote: true,
          section: 'optional-adaptations',
          sortOrder: 30,
        }),
        makePackage({
          active: false,
          fromPrice: 90,
          id: 'bath-hidden-package',
          pricingType: 'from',
          section: 'connected-room',
          sortOrder: 40,
        }),
      ],
      outcomes: [
        makeOutcome({
          id: 'bath-core-grip',
          pricingType: 'included-in-package',
          sortOrder: 10,
        }),
        makeOutcome({
          id: 'bath-connected-sensor',
          pricingType: 'included-in-package',
          sortOrder: 20,
        }),
        makeOutcome({
          customerName: { en: 'Shower entry review', es: 'Revision de entrada de ducha' },
          id: 'bath-quote-entry',
          pricingType: 'quote',
          requiresQuote: true,
          sortOrder: 30,
        }),
        makeOutcome({
          id: 'bath-hidden-outcome',
          pricingType: 'fixed',
          fixedPrice: 999,
          sortOrder: 40,
          websiteVisible: false,
        }),
      ],
      relations: [
        relation('bath-core-package', 'bath-core-grip', 10),
        relation('bath-connected-package', 'bath-connected-sensor', 20),
        relation('bath-specialist-package', 'bath-quote-entry', 30),
        relation('bath-specialist-package', 'bath-hidden-outcome', 40),
      ],
      capabilities: [],
      products: [],
      tasks: [],
    },
    packageConfigs: [],
    services: [],
  }
}

function makePackage(patch) {
  return {
    active: true,
    customerBenefit: { en: 'Benefit', es: 'Beneficio' },
    customerName: { en: 'Bathroom package', es: 'Paquete de bano' },
    fixedPrice: undefined,
    fromPrice: undefined,
    id: 'package',
    internalName: 'Package',
    pricingType: 'from',
    proposalVisible: true,
    recurringMonthlyPrice: undefined,
    requiresQuote: false,
    roomId: 'bathroom',
    section: 'home-safety-package',
    shortDescription: { en: 'Package description.', es: 'Descripcion del paquete.' },
    slug: 'package',
    sortOrder: 10,
    vatRate: 0.21,
    websiteVisible: true,
    ...patch,
  }
}

function makeOutcome(patch) {
  return {
    active: true,
    customerBenefit: { en: 'Benefit', es: 'Beneficio' },
    customerName: { en: 'Outcome', es: 'Resultado' },
    fixedPrice: undefined,
    fromPrice: undefined,
    grantEligible: false,
    id: 'outcome',
    internalName: 'Outcome',
    pricingType: 'included-in-package',
    proposalVisible: true,
    requiresCompatibilityCheck: false,
    requiresMeasurement: false,
    requiresQuote: false,
    requiresSiteVisit: false,
    roomId: 'bathroom',
    shortDescription: { en: 'Outcome description.', es: 'Descripcion del resultado.' },
    slug: 'outcome',
    sortOrder: 10,
    vatRate: 0.21,
    websiteVisible: true,
    ...patch,
  }
}

function relation(fromId, toId, sortOrder) {
  return {
    active: true,
    fromId,
    id: `${fromId}-${toId}`,
    sortOrder,
    toId,
    type: 'packageOutcome',
  }
}

console.log('Plans builder pricing tests passed.')
