import assert from 'node:assert/strict'

import {
  getDefaultServiceCatalogue,
  getServiceCatalogue,
  saveServiceCatalogue,
} from '../src/services/serviceCatalogue.ts'

const storageKey = 'casamia-service-catalogue'
const storedValues = new Map()

globalThis.window = {
  dispatchEvent() {},
  localStorage: {
    getItem(key) {
      return storedValues.get(key) ?? null
    },
    removeItem(key) {
      storedValues.delete(key)
    },
    setItem(key, value) {
      storedValues.set(key, String(value))
    },
  },
}

function setStoredCatalogue(catalogue) {
  storedValues.set(storageKey, JSON.stringify(catalogue))
}

const defaultCatalogue = getDefaultServiceCatalogue()
const defaults = defaultCatalogue.services
const defaultBathroomPackage = defaultCatalogue.packageConfigs.find((config) => config.area === 'bathroom')
const movedService = {
  ...defaults[0],
  active: false,
  name: 'Admin-edited entrance service',
  room: 'connected',
  wizardAreas: [],
}

setStoredCatalogue({
  services: [movedService],
  updatedAt: '2026-07-18T10:00:00.000Z',
})

const savedSubset = getServiceCatalogue()

assert.equal(
  savedSubset.services.length,
  1,
  'A saved admin subset must not have omitted compiled services silently added back.',
)
assert.equal(savedSubset.services[0].name, movedService.name, 'Admin edits must remain authoritative.')
assert.equal(savedSubset.services[0].active, false, 'Admin activation changes must remain authoritative.')
assert.equal(savedSubset.services[0].room, 'connected', 'An admin room reassignment must not be reset to the compiled room.')
assert.deepEqual(
  savedSubset.services[0].wizardAreas,
  [],
  'An explicitly cleared admin wizard-area assignment must not be replaced with inferred defaults.',
)

setStoredCatalogue({ services: [], updatedAt: '2026-07-18T11:00:00.000Z' })

assert.deepEqual(
  getServiceCatalogue().services,
  [],
  'An explicitly empty admin catalogue must stay empty instead of restoring compiled defaults.',
)

setStoredCatalogue({ updatedAt: '2026-07-18T12:00:00.000Z' })

assert.deepEqual(
  getServiceCatalogue().services,
  defaults,
  'Compiled defaults should remain the fallback when no saved services value is available.',
)

storedValues.delete(storageKey)

assert.deepEqual(
  getServiceCatalogue().services,
  defaults,
  'Compiled defaults should remain the fallback when no saved catalogue exists.',
)

const legacyBathroomPackageConfig = {
  active: true,
  area: 'bathroom',
  name: 'Safer Bathroom Access',
  pricingType: 'quote_only',
  section: 'home_safety_package',
  vatRate: 0.21,
}

setStoredCatalogue({
  packageConfigs: [legacyBathroomPackageConfig],
  updatedAt: '2026-07-18T13:00:00.000Z',
})

assert.equal(
  getServiceCatalogue().packageConfigs.find((config) => config.area === 'bathroom')?.name,
  defaultBathroomPackage?.name,
  'Legacy hardcoded package defaults must be ignored in favour of Master Catalogue package names.',
)

setStoredCatalogue({
  packageConfigs: [{ ...legacyBathroomPackageConfig, name: 'Admin bathroom package', packagePrice: 250, pricingType: 'fixed' }],
  updatedAt: '2026-07-18T14:00:00.000Z',
})

assert.equal(
  getServiceCatalogue().packageConfigs.find((config) => config.area === 'bathroom')?.name,
  'Admin bathroom package',
  'Intentional admin package overrides must still be preserved.',
)

const savedCatalogue = saveServiceCatalogue({
  packageConfigs: [legacyBathroomPackageConfig],
  services: defaults,
})

assert.equal(
  savedCatalogue.packageConfigs.find((config) => config.area === 'bathroom')?.name,
  defaultBathroomPackage?.name,
  'Local saves must normalise legacy package defaults before persisting.',
)

console.log('Service catalogue authority checks passed.')
