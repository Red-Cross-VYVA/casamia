import { createContext, useContext } from 'react'
import type {
  ConfiguratorState, CustomerAnswer, ConfiguratorRoomId, ConfiguratorQuantities,
  CustomerContact, PropertyInformation,
} from '../types/configurator'

export type ConfiguratorContextValue = {
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

export const ConfiguratorContext = createContext<ConfiguratorContextValue | null>(null)

export function useConfigurator() {
  const value = useContext(ConfiguratorContext)

  if (!value) {
    throw new Error('useConfigurator must be used within ConfiguratorProvider.')
  }

  return value
}
