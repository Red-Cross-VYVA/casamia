import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { ConfiguratorContext, type ConfiguratorContextValue } from './configurator'
import type { ConfiguratorState } from '../types/configurator'
import { getSelectedRoomIds, syncRoomSelections } from '../services/configuratorRooms'
import {
  configuratorStorageKey, submittedConfigurationKey, defaultConfiguratorState,
  loadConfiguratorState, saveConfiguratorState, normaliseQuantities, withTimestamp,
} from '../services/configuratorState'

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
