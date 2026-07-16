import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  ConfiguratorState,
  CustomerAnswer,
  ConfiguratorRoomId,
  ConfiguratorQuantities,
  CustomerContact,
  LegacyPackageId,
  PropertyInformation,
} from '../types/configurator'
import {
  getSelectedRoomIds,
  roomIdsFromLegacyPackages,
  syncRoomSelections,
} from '../services/configuratorRooms'

const configuratorStorageKey = 'casamia-configurator-state'
const submittedConfigurationKey = 'casamia-configurator-submission'

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

type ConfiguratorContextValue = {
  state: ConfiguratorState
  setCurrentStep: (step: number) => void
  updateProperty: (property: Partial<PropertyInformation>) => void
  updateQuantities: (quantities: Partial<ConfiguratorQuantities>) => void
  updateCustomer: (customer: Partial<CustomerContact>) => void
  setAnswer: (key: string, value: CustomerAnswer) => void
  setSelectedRooms: (roomIds: ConfiguratorRoomId[]) => void
  setSelectedServices: (serviceIds: string[]) => void
  toggleService: (serviceId: string) => void
  toggleRoom: (roomId: ConfiguratorRoomId) => void
  resetConfigurator: () => void
}

const ConfiguratorContext = createContext<ConfiguratorContextValue | null>(null)

export function ConfiguratorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfiguratorState>(() => loadConfiguratorState())

  useEffect(() => {
    saveConfiguratorState(state)
  }, [state])

  const value = useMemo<ConfiguratorContextValue>(
    () => ({
      state,
      setCurrentStep(step) {
        setState((current) => withTimestamp({ ...current, currentStep: step }))
      },
      updateProperty(property) {
        setState((current) =>
          withTimestamp({
            ...current,
            property: { ...current.property, ...property },
          }),
        )
      },
      updateQuantities(quantities) {
        setState((current) =>
          withTimestamp({
            ...current,
            quantities: {
              ...current.quantities,
              ...normaliseQuantities(quantities),
            },
          }),
        )
      },
      updateCustomer(customer) {
        setState((current) =>
          withTimestamp({
            ...current,
            customer: { ...current.customer, ...customer },
          }),
        )
      },
      setAnswer(key, value) {
        setState((current) =>
          withTimestamp({
            ...current,
            answers: { ...current.answers, [key]: value },
          }),
        )
      },
      setSelectedRooms(roomIds) {
        setState((current) =>
          withTimestamp(
            syncRoomSelections({
              ...current,
              selectedRoomIds: roomIds,
              selectedServiceIds: [],
            }),
          ),
        )
      },
      setSelectedServices(serviceIds) {
        setState((current) =>
          withTimestamp({
            ...current,
            selectedServiceIds: Array.from(new Set(serviceIds)),
          }),
        )
      },
      toggleService(serviceId) {
        setState((current) => {
          const selectedServiceIds = current.selectedServiceIds.includes(serviceId)
            ? current.selectedServiceIds.filter((item) => item !== serviceId)
            : [...current.selectedServiceIds, serviceId]

          return withTimestamp({ ...current, selectedServiceIds })
        })
      },
      toggleRoom(roomId) {
        setState((current) => {
          const selectedRoomIds = getSelectedRoomIds(current).includes(roomId)
            ? getSelectedRoomIds(current).filter((item) => item !== roomId)
            : [...getSelectedRoomIds(current), roomId]

          return withTimestamp(
            syncRoomSelections({
              ...current,
              selectedRoomIds,
            }),
          )
        })
      },
      resetConfigurator() {
        window.localStorage.removeItem(configuratorStorageKey)
        window.localStorage.removeItem(submittedConfigurationKey)
        setState(withTimestamp(syncRoomSelections(defaultConfiguratorState)))
      },
    }),
    [state],
  )

  return <ConfiguratorContext.Provider value={value}>{children}</ConfiguratorContext.Provider>
}

export function useConfigurator() {
  const value = useContext(ConfiguratorContext)

  if (!value) {
    throw new Error('useConfigurator must be used within ConfiguratorProvider.')
  }

  return value
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

function normaliseQuantities(quantities: Partial<ConfiguratorQuantities>) {
  return Object.fromEntries(
    Object.entries(quantities).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]),
  ) as Partial<ConfiguratorQuantities>
}

function withTimestamp(state: ConfiguratorState): ConfiguratorState {
  return {
    ...state,
    updatedAt: new Date().toISOString(),
  }
}
