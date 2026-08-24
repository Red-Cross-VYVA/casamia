import { getPublicSiteApiBaseUrl, postPublicSiteJson } from './publicSiteApi.ts'

export type VisitCheckoutResponse = {
  amount: number
  checkoutUrl: string
  currency: string
  orderId: string
  recordType: 'assessment' | 'order'
  vatIncluded: boolean
}

export type VisitCheckoutStatus = {
  orderId?: string
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required'
  recordType: 'assessment' | 'order'
  status: 'open' | 'complete' | 'expired'
}

export function createVisitCheckout(orderId: string, locale: string, recordType: 'assessment' | 'order' = 'order') {
  return postPublicSiteJson<VisitCheckoutResponse>('/api/public/visit-checkout', {
    locale,
    orderId,
    recordType,
  })
}

export async function getVisitCheckoutStatus(sessionId: string) {
  const response = await fetch(
    `${getPublicSiteApiBaseUrl()}/api/public/visit-checkout-status?session_id=${encodeURIComponent(sessionId)}`,
    { headers: { Accept: 'application/json' } },
  )

  if (!response.ok) throw new Error('The visit payment could not be verified.')
  return response.json() as Promise<VisitCheckoutStatus>
}
