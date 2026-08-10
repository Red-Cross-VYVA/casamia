import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../src/pages/ServicesPage.tsx', import.meta.url), 'utf8')
const serviceDetailPage = await readFile(new URL('../src/pages/ServiceDetailPage.tsx', import.meta.url), 'utf8')
const packageDetailModal = await readFile(new URL('../src/components/PackageDetailModal.tsx', import.meta.url), 'utf8')
const riskMaps = await readFile(new URL('../src/constants/zoneRiskMaps.ts', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/styles/services-catalogue.css', import.meta.url), 'utf8')

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
  /uniqueIncludedItems\(service\.includedItems\)/,
  'Customers must be able to see the inclusions maintained in the admin catalogue after duplicate cleanup.',
)
assert.match(
  page,
  /formatPackageComposition\(group\.services,\s*copy\)/,
  'Room cards must describe package composition instead of calling everything options.',
)
assert.match(
  page,
  /ArrowDown/,
  'The hero services CTA should use a downward arrow before the catalogue section.',
)
assert.match(
  page,
  /aria-haspopup="dialog"/,
  'The hero services CTA should open the catalogue guide modal before jumping to the catalogue.',
)
assert.match(
  page,
  /services-catalogue-guide-modal/,
  'The Services page should render a guide modal explaining package selection.',
)
assert.match(
  page,
  /catalogueGuideVisualImages/,
  'The catalogue guide modal should use visual package examples rather than text-only guidance.',
)
assert.match(
  page,
  /copy\.catalogueGuide\.visualAreas\.map/,
  'The catalogue guide modal should render room-package visual tiles.',
)
assert.match(
  page,
  /window\.scrollTo\(\{ top: Math\.max\(catalogueTop - 92, 0\), behavior: 'smooth' \}\)/,
  'The guide modal start action should take visitors to the catalogue section.',
)
assert.match(
  page,
  /services-zone-risk-hint/,
  'Risk map visuals should include a subtle hover/tap hint for interactive markers.',
)
assert.match(
  page,
  /riskItems = copy\.risks\.map[\s\S]*label: risk[\s\S]*<span>\{item\.label\}<\/span>/,
  'Interactive risk-map labels should render the same readable text used by the risk list.',
)
assert.match(
  styles,
  /\.services-zone-risk-label \{[\s\S]*background: rgb\(255 255 255 \/ 94%\)[\s\S]*color: #10283f/,
  'Interactive risk-map labels should remain visible against the light callout cards.',
)
assert.match(
  page,
  /activeRiskId[\s\S]*services-zone-risk-hotspot[\s\S]*services-zone-risk-list-button/,
  'Interactive risk-map labels and text list should be linked by one active risk id instead of visible numbers.',
)
assert.match(
  riskMaps,
  /function getZoneRiskHotspotStyle[\s\S]*pinTargetInset[\s\S]*position\.x - pinTargetInset/,
  'Risk-map hotspots must expand toward the baked number pin, not only cover the old text label box.',
)
assert.match(
  page,
  /getZoneRiskHotspotStyle\(item\.position\)/,
  'Catalogue risk-map number pins should share the same hover target as their detail callouts.',
)
assert.match(
  serviceDetailPage,
  /getZoneRiskHotspotStyle\(item\.position\)/,
  'Service-detail risk-map number pins should share the same hover target as right-side panel rows.',
)
assert.match(
  serviceDetailPage,
  /exploreBathroomPackage: 'Explore Bathroom package'/,
  'The bathroom service hero should invite visitors to explore the bathroom package first.',
)
assert.match(
  serviceDetailPage,
  /setActivePackageGroup\(bathroomPackageGroup\)/,
  'The bathroom service hero package CTA should open the package detail modal directly.',
)
assert.match(
  serviceDetailPage,
  /askSafetyExpert: 'Ask the Safety Expert'[\s\S]*setSpecialistOpen\(true\)[\s\S]*entryPoint="service_detail_bathroom"/,
  'The bathroom service hero expert CTA should open the ElevenLabs specialist from the hero.',
)
assert.match(
  packageDetailModal,
  /plan-detail-modal[\s\S]*plan-detail-tabs[\s\S]*plan-detail-story/,
  'The package detail modal should reuse the established package detail layout from Plans.',
)
assert.doesNotMatch(
  styles,
  /\.services-zone-risk-hotspot,\s*[\r\n]+\s*\.services-zone-risk-label\s*\{[\s\S]*?display:\s*none/,
  'Risk-map overlays must not be hidden at tablet widths, otherwise the baked callout cards look blank.',
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
assert.match(
  page,
  /service\.section === 'connected_room'/,
  'Connected-room services must be shown as add-ons, not base package inclusions.',
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
