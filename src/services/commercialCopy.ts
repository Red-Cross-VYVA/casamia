import type { CommercialSettings } from '../types/serviceCatalogue.ts'
import { getCommercialSettings } from './commercialSettings.ts'

export type CommercialCopyVariables = {
  proposalBalancePercent: string
  proposalUpfrontPercent: string
  visitFee: string
  visitVatPercent: string
}

export function getCommercialCopyVariables(source?: CommercialSettings): CommercialCopyVariables {
  const settings = getCommercialSettings(source)
  const upfrontPercent = Math.round(settings.proposalDepositRate * 100)

  return {
    proposalBalancePercent: `${100 - upfrontPercent}%`,
    proposalUpfrontPercent: `${upfrontPercent}%`,
    visitFee: `${formatAmount(settings.assessmentVisitFeeGross)} EUR`,
    visitVatPercent: `${Math.round(settings.assessmentVisitVatRate * 100)}%`,
  }
}

export function applyCommercialCopy<T>(value: T, source?: CommercialSettings): T {
  const variables = getCommercialCopyVariables(source)
  return mapCommercialCopy(value, variables) as T
}

export function applyCommercialText(value: string, source?: CommercialSettings) {
  const variables = getCommercialCopyVariables(source)
  return replaceCommercialVariables(value, variables)
}

function mapCommercialCopy(value: unknown, variables: CommercialCopyVariables): unknown {
  if (typeof value === 'string') return replaceCommercialVariables(value, variables)
  if (Array.isArray(value)) return value.map((item) => mapCommercialCopy(item, variables))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, mapCommercialCopy(item, variables)]),
    )
  }
  return value
}

function replaceCommercialVariables(value: string, variables: CommercialCopyVariables) {
  return value.replace(
    /\{\{(visitFee|visitVatPercent|proposalUpfrontPercent|proposalBalancePercent)\}\}/g,
    (_match, key: keyof CommercialCopyVariables) => variables[key],
  )
}

function formatAmount(value: number) {
  return new Intl.NumberFormat('en-IE', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    useGrouping: false,
  }).format(value)
}
