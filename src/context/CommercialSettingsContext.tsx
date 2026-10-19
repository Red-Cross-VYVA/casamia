import { useEffect, useMemo, type ReactNode } from 'react'

import i18n, { updateCommercialTranslationSettings } from '../i18n/index.ts'
import { getCommercialSettings } from '../services/commercialSettings.ts'
import { useServiceCatalogue } from '../services/serviceCatalogue.ts'
import { CommercialSettingsContext } from './commercialSettings'

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
