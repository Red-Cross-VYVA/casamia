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
  CustomerContact,
  PackageId,
  PackageQuantities,
  PropertyInformation,
} from '../types/configurator'

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
  selectedPackageIds: [],
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
  updateQuantities: (quantities: Partial<PackageQuantities>) => void
  updateCustomer: (customer: Partial<CustomerContact>) => void
  setAnswer: (key: string, value: CustomerAnswer) => void
  togglePackage: (packageId: PackageId) => void
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
      togglePackage(packageId) {
        setState((current) => {
          const selectedPackageIds = current.selectedPackageIds.includes(packageId)
            ? current.selectedPackageIds.filter((item) => item !== packageId)
            : [...current.selectedPackageIds, packageId]

          return withTimestamp({ ...current, selectedPackageIds })
        })
      },
      resetConfigurator() {
        window.localStorage.removeItem(configuratorStorageKey)
        window.localStorage.removeItem(submittedConfigurationKey)
        setState(withTimestamp(defaultConfiguratorState))
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

    const parsed = JSON.parse(saved) as ConfiguratorState

    return withTimestamp({
      ...defaultConfiguratorState,
      ...parsed,
      currentStep: defaultConfiguratorState.currentStep,
      property: { ...defaultConfiguratorState.property, ...parsed.property },
      quantities: { ...defaultConfiguratorState.quantities, ...parsed.quantities },
      answers: { ...defaultConfiguratorState.answers, ...parsed.answers },
      customer: { ...defaultConfiguratorState.customer, ...parsed.customer },
    })
  } catch {
    return withTimestamp(defaultConfiguratorState)
  }
}

export function saveConfiguratorState(state: ConfiguratorState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(configuratorStorageKey, JSON.stringify(withTimestamp(state)))
}

export function getSubmittedConfigurationStorageKey() {
  return submittedConfigurationKey
}

function normaliseQuantities(quantities: Partial<PackageQuantities>) {
  return Object.fromEntries(
    Object.entries(quantities).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]),
  ) as Partial<PackageQuantities>
}

function withTimestamp(state: ConfiguratorState): ConfiguratorState {
  return {
    ...state,
    updatedAt: new Date().toISOString(),
  }
}
