import {
  flattenMasterCatalogueForCompatibility,
  getCapabilitiesByOutcome,
  getInspectorSpecificationForOutcome,
  getMasterServiceCatalogue,
  getPackagesByRoom,
} from '../src/services/masterServiceCatalogue.ts'

const catalogue = getMasterServiceCatalogue()
const failures = []
const warnings = []
const requiredRooms = ['bathroom', 'bedroom', 'kitchen']
const requiredSections = ['home-safety-package', 'connected-room', 'optional-adaptations']

function assert(condition, message) {
  if (!condition) failures.push(message)
}

function warn(condition, message) {
  if (!condition) warnings.push(message)
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function uniqueValues(items) {
  return new Set(items).size === items.length
}

function byId(items) {
  return new Map(items.map((item) => [item.id, item]))
}

const roomsById = byId(catalogue.rooms)
const sectionsById = byId(catalogue.sections)
const packagesById = byId(catalogue.packages)
const outcomesById = byId(catalogue.outcomes)
const capabilitiesById = byId(catalogue.capabilities)
const productsById = byId(catalogue.products)
const tasksById = byId(catalogue.installationTasks)

assert(uniqueValues(catalogue.rooms.map((item) => item.id)), 'duplicate room IDs')
assert(uniqueValues(catalogue.sections.map((item) => item.id)), 'duplicate section IDs')
assert(uniqueValues(catalogue.packages.map((item) => item.id)), 'duplicate package IDs')
assert(uniqueValues(catalogue.outcomes.map((item) => item.id)), 'duplicate outcome IDs')
assert(uniqueValues(catalogue.capabilities.map((item) => item.id)), 'duplicate capability IDs')
assert(uniqueValues(catalogue.products.map((item) => item.id)), 'duplicate product IDs')
assert(uniqueValues(catalogue.installationTasks.map((item) => item.id)), 'duplicate installation-task IDs')
assert(uniqueValues([
  ...catalogue.rooms.map((item) => `room/${item.slug}`),
  ...catalogue.sections.map((item) => `section/${item.slug}`),
  ...catalogue.packages.map((item) => `package/${item.slug}`),
  ...catalogue.outcomes.map((item) => `outcome/${item.slug}`),
  ...catalogue.capabilities.map((item) => `capability/${item.slug}`),
  ...catalogue.products.map((item) => `product/${item.slug}`),
  ...catalogue.installationTasks.map((item) => `task/${item.slug}`),
]), 'duplicate slugs within entity namespaces')

for (const roomId of requiredRooms) {
  assert(roomsById.has(roomId), `${roomId}: room is missing`)
  const roomPackages = getPackagesByRoom(roomId, catalogue)

  for (const section of requiredSections) {
    assert(
      roomPackages.some((item) => item.section === section),
      `${roomId}: missing package for ${section}`,
    )
  }
}

for (const section of requiredSections) {
  assert(sectionsById.has(section), `section missing: ${section}`)
}

for (const packageRecord of catalogue.packages) {
  const label = `package/${packageRecord.id}`
  assert(roomsById.has(packageRecord.roomId), `${label}: invalid roomId`)
  assert(sectionsById.has(packageRecord.section), `${label}: invalid section`)
  assert(hasText(packageRecord.customerName.en), `${label}: missing English customerName`)
  assert(hasText(packageRecord.customerName.es), `${label}: missing Spanish customerName`)
  assert(hasText(packageRecord.internalName), `${label}: missing internalName`)
  assert(packageRecord.requiresQuote === (packageRecord.pricingType === 'quote' || packageRecord.requiresQuote), `${label}: quote flag should be explicit`)
}

for (const outcome of catalogue.outcomes) {
  const label = `outcome/${outcome.id}`
  assert(roomsById.has(outcome.roomId), `${label}: invalid roomId`)
  assert(sectionsById.has(outcome.section), `${label}: invalid section`)
  assert(packagesById.has(outcome.packageId), `${label}: invalid packageId`)
  assert(packagesById.get(outcome.packageId)?.roomId === outcome.roomId, `${label}: package room mismatch`)
  assert(packagesById.get(outcome.packageId)?.section === outcome.section, `${label}: package section mismatch`)
  assert(hasText(outcome.customerName.en), `${label}: missing English customerName`)
  assert(hasText(outcome.customerName.es), `${label}: missing Spanish customerName`)
  assert(hasText(outcome.shortDescription.en), `${label}: missing English customer description`)
  assert(hasText(outcome.customerBenefit.en), `${label}: missing English customer benefit`)
  assert(outcome.wizardAreas.length > 0, `${label}: missing wizardAreas`)
  assert(typeof outcome.grantEligible === 'boolean', `${label}: grantEligible must be boolean`)
  assert(outcome.pricingType !== 'quote' || outcome.requiresQuote, `${label}: quote outcome must require quote`)
  assert(!outcome.requiresSmartSpeaker || outcome.technologyEnabled, `${label}: smart-speaker outcome must be technologyEnabled`)

  const capabilities = getCapabilitiesByOutcome(outcome.id, catalogue)
  assert(capabilities.length > 0, `${label}: outcome has no capabilities`)
}

for (const capability of catalogue.capabilities) {
  const label = `capability/${capability.id}`
  assert(hasText(capability.name), `${label}: missing name`)
  assert(!capability.requiresCompatibilityCheck || capability.technologyEnabled, `${label}: compatibility check requires technologyEnabled`)
}

for (const product of catalogue.products) {
  const label = `product/${product.id}`
  assert(hasText(product.name), `${label}: missing name`)
  assert(product.currency === 'EUR', `${label}: missing pricing currency`)
  assert(typeof product.vatRate === 'number', `${label}: vatRate must be numeric`)
}

for (const task of catalogue.installationTasks) {
  const label = `task/${task.id}`
  assert(hasText(task.name), `${label}: missing name`)
  assert(task.estimatedMinutes > 0, `${label}: estimatedMinutes must be positive`)
  assert(task.safetyChecklist.length > 0, `${label}: missing safetyChecklist`)
  assert(task.completionChecklist.length > 0, `${label}: missing completionChecklist`)
}

for (const relation of catalogue.relations) {
  const label = `relation/${relation.id}`
  assert(relation.fromId !== relation.toId, `${label}: self-referencing relation`)

  if (relation.type === 'packageOutcome') {
    assert(packagesById.has(relation.fromId), `${label}: invalid package fromId`)
    assert(outcomesById.has(relation.toId), `${label}: invalid outcome toId`)
  }

  if (relation.type === 'outcomeCapability') {
    assert(outcomesById.has(relation.fromId), `${label}: invalid outcome fromId`)
    assert(capabilitiesById.has(relation.toId), `${label}: invalid capability toId`)
  }

  if (relation.type === 'capabilityProduct') {
    assert(capabilitiesById.has(relation.fromId), `${label}: invalid capability fromId`)
    assert(productsById.has(relation.toId), `${label}: invalid product toId`)
  }

  if (relation.type === 'capabilityInstallationTask') {
    assert(capabilitiesById.has(relation.fromId), `${label}: invalid capability fromId`)
    assert(tasksById.has(relation.toId), `${label}: invalid task toId`)
  }

  if (relation.required && relation.minimumQuantity !== undefined) {
    assert(relation.minimumQuantity >= 1, `${label}: required relation should have minimum quantity >= 1`)
  }
}

for (const outcome of catalogue.outcomes) {
  const specification = getInspectorSpecificationForOutcome(outcome.id, catalogue)
  warn(specification.products.length > 0 || outcome.requiresQuote, `outcome/${outcome.id}: no product/device mapped`)
  warn(specification.installationTasks.length > 0 || outcome.requiresQuote, `outcome/${outcome.id}: no installation task mapped`)
}

const flattened = flattenMasterCatalogueForCompatibility(catalogue)
assert(flattened.length === catalogue.outcomes.length, 'compatibility adapter must expose one flat record per outcome')
assert(flattened.every((service) => service.customerName && service.internalName), 'flattened records must preserve customer/internal separation')

const packageCount = catalogue.packages.length
const outcomeCount = catalogue.outcomes.length
const capabilityCount = catalogue.capabilities.length
const productCount = catalogue.products.length
const installationTaskCount = catalogue.installationTasks.length

const report = {
  packageCount,
  outcomeCount,
  capabilityCount,
  productCount,
  installationTaskCount,
  packagesByRoom: Object.fromEntries(requiredRooms.map((room) => [room, getPackagesByRoom(room, catalogue).length])),
  outcomesByRoom: Object.fromEntries(requiredRooms.map((room) => [
    room,
    catalogue.outcomes.filter((outcome) => outcome.roomId === room).length,
  ])),
  outcomesBySection: Object.fromEntries(requiredSections.map((section) => [
    section,
    catalogue.outcomes.filter((outcome) => outcome.section === section).length,
  ])),
  warnings,
}

if (warnings.length) {
  console.warn('Master catalogue validation warnings:')
  warnings.forEach((message) => console.warn(`- ${message}`))
}

if (failures.length) {
  console.error('Master catalogue validation failed:')
  failures.forEach((message) => console.error(`- ${message}`))
  process.exit(1)
}

console.log('Master catalogue validation passed.')
console.log(JSON.stringify(report, null, 2))
