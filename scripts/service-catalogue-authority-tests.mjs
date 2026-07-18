import assert from 'node:assert/strict'

import {
  getDefaultServiceCatalogue,
  getServiceCatalogue,
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

const defaults = getDefaultServiceCatalogue().services
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

console.log('Service catalogue authority checks passed.')
