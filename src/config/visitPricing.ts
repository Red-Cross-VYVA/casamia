export const visitPricing = {
  currency: 'EUR',
  feeCents: 9_900,
  feeGross: 99,
  vatIncluded: true,
  vatRate: 0.21,
} as const

export const visitFeeNetCents = Math.round(visitPricing.feeCents / (1 + visitPricing.vatRate))
export const visitFeeVatCents = visitPricing.feeCents - visitFeeNetCents
