import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../src/pages/ServicesPage.tsx', import.meta.url), 'utf8')

assert.match(
  page,
  /use(?:Localized)?ServiceCatalogue\(/,
  'The Services page must read the public catalogue managed from the admin panel.',
)
assert.match(
  page,
  /catalogue\.services\.filter\([\s\S]*service\.active/,
  'Only active admin-catalogue services should be offered to customers.',
)
assert.match(
  page,
  /(?:groupedServices|serviceGroups)\.map\(/,
  'Active catalogue entries must be presented in useful service groups.',
)
assert.match(
  page,
  /group\.services\.map\(/,
  'Every service group must render its live catalogue entries.',
)

assert.match(page, /service\.name/, 'Cards must use each admin-managed service name.')
assert.match(
  page,
  /service\.(?:shortDescription|customerBenefit)/,
  'Cards must explain the live catalogue service rather than use marketing-card copy.',
)
assert.match(
  page,
  /service\.includedItems\?\.map\(/,
  'Customers must be able to see the inclusions maintained in the admin catalogue.',
)
assert.match(
  page,
  /formatPackageComposition\(group\.services,\s*copy\)/,
  'Room cards must describe package composition instead of calling everything options.',
)
assert.match(
  page,
  /includedItemPlural/,
  'Package composition copy must include customer-facing included-item language.',
)
assert.match(
  page,
  /addOnPlural/,
  'Package composition copy must include customer-facing optional add-on language.',
)
assert.doesNotMatch(
  page,
  /optionSingular|optionPlural|packageOptions/,
  'The services page must not label package contents as generic options.',
)
assert.doesNotMatch(
  page,
  /format(?:ServicePrice|Currency)|service\.pricingType|service\.(?:fromPrice|productPrice|installationPrice|recurringMonthlyPrice)/,
  'The public catalogue must not reveal pricing before the customer requests a proposal.',
)

assert.doesNotMatch(
  page,
  /solutionGalleryCards/,
  'The previous hardcoded marketing-card catalogue must not return.',
)
assert.doesNotMatch(
  page,
  /primaryServices/,
  'The Services page must not substitute the static primary-services list for the admin catalogue.',
)
assert.doesNotMatch(
  page,
  /Health and vitals monitoring|health-and-vitals-monitoring|Wellbeing signals|\['Vitals',\s*'Family updates'\]/,
  'The stale hardcoded health-and-vitals card must not return.',
)
assert.doesNotMatch(
  page,
  /Professional monitoring(?: option)?/,
  'Professional monitoring must not be advertised as a hardcoded CasaMia service.',
)

console.log('Services page catalogue checks passed.')
