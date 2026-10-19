import { createContext, useContext } from 'react'
import { getCommercialSettings } from '../services/commercialSettings.ts'
import type { CommercialSettings } from '../types/serviceCatalogue.ts'

export const CommercialSettingsContext = createContext<CommercialSettings>(getCommercialSettings())

export function useCommercialSettings() {
  return useContext(CommercialSettingsContext)
}
