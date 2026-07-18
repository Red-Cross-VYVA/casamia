import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../src/pages/ServicesPage.tsx', import.meta.url), 'utf8')

assert.match(
  page,
  /useServiceCatalogue\(\)/,
  'The Services page must read the public catalogue managed from the admin panel.',
)
assert.match(
  page,
  /catalogue\.services\.filter\(\s*\(?\s*service\s*\)?\s*=>\s*service\.active\s*\)/,
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
  /formatServicePrice\(service\)/,
  'Customer-facing prices must be calculated from the admin catalogue pricing fields.',
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
