import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'

import i18n, { updateCommercialTranslationSettings } from '../i18n/index.ts'
import { getCommercialSettings } from '../services/commercialSettings.ts'
import { useServiceCatalogue } from '../services/serviceCatalogue.ts'
import type { CommercialSettings } from '../types/serviceCatalogue.ts'

const CommercialSettingsContext = createContext<CommercialSettings>(getCommercialSettings())

export function CommercialSettingsProvider({ children }: { children: ReactNode }) {
  const catalogue = useServiceCatalogue()
  const settings = useMemo(
    () => getCommercialSettings(catalogue),
    [catalogue],
  )

  useEffect(() => {
    updateCommercialTranslationSettings(settings)
    void i18n.changeLanguage(i18n.language)
  }, [settings])

  return (
    <CommercialSettingsContext.Provider value={settings}>
      {children}
    </CommercialSettingsContext.Provider>
  )
}

export function useCommercialSettings() {
  return useContext(CommercialSettingsContext)
}
