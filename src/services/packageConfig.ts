import { useEffect, useState } from 'react'

import {
  casaMiaPackages,
  configuratorPricing,
} from '../config/casamiaPackages.ts'
import type {
  CasaMiaPackage,
  ConfiguratorPricing,
  PackageId,
} from '../types/configurator.ts'

const packageConfigStorageKey = 'casamia-package-config'
const packageConfigUpdatedEvent = 'casamia-package-config-updated'

export type EditablePackageConfig = {
  packages: CasaMiaPackage[]
  packagePrices: ConfiguratorPricing['packagePrices']
  updatedAt?: string
}

export function getDefaultPackageConfig(): EditablePackageConfig {
  return {
    packages: clone(casaMiaPackages),
    packagePrices: clone(configuratorPricing.packagePrices),
  }
}

export function getPackageConfig(): EditablePackageConfig {
  if (typeof window === 'undefined') {
    return getDefaultPackageConfig()
  }

  try {
    const saved = window.localStorage.getItem(packageConfigStorageKey)

    if (!saved) {
      return getDefaultPackageConfig()
    }

    const parsed = JSON.parse(saved) as Partial<EditablePackageConfig>
    const defaults = getDefaultPackageConfig()

    return {
      packages: mergePackages(defaults.packages, parsed.packages),
      packagePrices: {
        ...defaults.packagePrices,
        ...parsed.packagePrices,
      },
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return getDefaultPackageConfig()
  }
}

export function savePackageConfig(config: EditablePackageConfig) {
  if (typeof window === 'undefined') {
    return getDefaultPackageConfig()
  }

  const nextConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(packageConfigStorageKey, JSON.stringify(nextConfig))
  window.dispatchEvent(new CustomEvent(packageConfigUpdatedEvent))

  return nextConfig
}

export function resetPackageConfig() {
  if (typeof window === 'undefined') {
    return getDefaultPackageConfig()
  }

  window.localStorage.removeItem(packageConfigStorageKey)
  window.dispatchEvent(new CustomEvent(packageConfigUpdatedEvent))

  return getDefaultPackageConfig()
}

export function getConfiguredPackages() {
  return getPackageConfig().packages
}

export function getConfiguredPackageById(packageId: PackageId) {
  return getConfiguredPackages().find((item) => item.id === packageId)
}

export function getConfiguredPricing(): ConfiguratorPricing {
  const config = getPackageConfig()

  return {
    ...configuratorPricing,
    packagePrices: {
      ...configuratorPricing.packagePrices,
      ...config.packagePrices,
    },
  }
}

export function usePackageConfig() {
  const [config, setConfig] = useState<EditablePackageConfig>(() => getPackageConfig())

  useEffect(() => {
    function refreshConfig() {
      setConfig(getPackageConfig())
    }

    window.addEventListener(packageConfigUpdatedEvent, refreshConfig)
    window.addEventListener('storage', refreshConfig)

    return () => {
      window.removeEventListener(packageConfigUpdatedEvent, refreshConfig)
      window.removeEventListener('storage', refreshConfig)
    }
  }, [])

  return config
}

function mergePackages(defaultPackages: CasaMiaPackage[], savedPackages: CasaMiaPackage[] | undefined) {
  if (!savedPackages) {
    return defaultPackages
  }

  const savedById = new Map(savedPackages.map((item) => [item.id, item]))

  return defaultPackages.map((item) => {
    const saved = savedById.get(item.id)

    if (!saved) {
      return item
    }

    return {
      ...item,
      ...saved,
      id: item.id,
      quantityKey: item.quantityKey,
      standardComponents: saved.standardComponents ?? item.standardComponents,
      conditionalComponents: saved.conditionalComponents ?? item.conditionalComponents,
      quotationOnlyComponents: saved.quotationOnlyComponents ?? item.quotationOnlyComponents,
    }
  })
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
