import type { ConfiguratorState, ConfiguratorQuantities, LegacyPackageId } from '../types/configurator'
import { roomIdsFromLegacyPackages, syncRoomSelections } from './configuratorRooms'

export const configuratorStorageKey = 'casamia-configurator-state'
export const submittedConfigurationKey = 'casamia-configurator-submission'

export const defaultConfiguratorState: ConfiguratorState = {
  currentStep: 0,
  property: {
    propertyType: '',
    floors: 1,
    hasInternalStairs: 'unsure',
    postcode: '',
    relationship: '',
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
  answers: {
    'connected-alerts': ['family'],
  },
  customer: {
    fullName: '',
    email: '',
    telephone: '',
    address: '',
    preferredContact: 'phone',
    preferredLanguage: 'Spanish',
    notes: '',
    consentToContact: false,
  },
}

export function loadConfiguratorState() {
  if (typeof window === 'undefined') {
    return withTimestamp(defaultConfiguratorState)
  }

  try {
    const saved = window.localStorage.getItem(configuratorStorageKey)

    if (!saved) {
      return withTimestamp(defaultConfiguratorState)
    }

    const parsed = JSON.parse(saved) as Partial<ConfiguratorState> & { selectedPackageIds?: LegacyPackageId[] }
    const { selectedPackageIds: legacySelectedPackageIds, ...parsedState } = parsed
    const selectedRoomIds = parsed.selectedRoomIds?.length
      ? parsed.selectedRoomIds
      : roomIdsFromLegacyPackages(legacySelectedPackageIds)

    return withTimestamp(
      syncRoomSelections({
        ...defaultConfiguratorState,
        ...parsedState,
        currentStep: defaultConfiguratorState.currentStep,
        property: { ...defaultConfiguratorState.property, ...parsedState.property },
        selectedRoomIds,
        selectedServiceIds: parsedState.selectedServiceIds ?? defaultConfiguratorState.selectedServiceIds,
        quantities: { ...defaultConfiguratorState.quantities, ...parsedState.quantities },
        answers: { ...defaultConfiguratorState.answers, ...parsedState.answers },
        customer: { ...defaultConfiguratorState.customer, ...parsedState.customer },
      }),
    )
  } catch {
    return withTimestamp(defaultConfiguratorState)
  }
}

export function saveConfiguratorState(state: ConfiguratorState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(configuratorStorageKey, JSON.stringify(withTimestamp(syncRoomSelections(state))))
}

export function getSubmittedConfigurationStorageKey() {
  return submittedConfigurationKey
}

export function normaliseQuantities(quantities: Partial<ConfiguratorQuantities>) {
  return Object.fromEntries(
    Object.entries(quantities).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]),
  ) as Partial<ConfiguratorQuantities>
}

export function withTimestamp(state: ConfiguratorState): ConfiguratorState {
  return {
    ...state,
    updatedAt: new Date().toISOString(),
  }
}
