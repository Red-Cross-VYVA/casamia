export type ConsentType =
  | 'contract-acceptance'
  | 'early-start'
  | 'full-execution'
  | 'personalised-goods'
  | 'marketing'
  | 'photo-testimonial'

export type ConsentEvidencePayload = {
  channel: 'checkout' | 'withdrawal' | 'proposal' | 'support'
  consentType: ConsentType
  contractLanguage: string
  customerReference: string
  documentVersions: {
    generalTermsVersion: string
    projectOrderVersion: string
    withdrawalVersion?: string
  }
  earlyStartRequested: boolean
  fullExecutionAcknowledged?: boolean
  locale: string
  marketingConsent?: boolean
  orderId: string
  personalisedGoodsAcknowledgement?: {
    item: string
    acknowledged: boolean
  }
  photoTestimonialConsent?: boolean
  timestamp: string
  wording: string
  wordingVersion: string
}

export type ConsentEvidenceResponse = {
  evidenceId: string
  receivedAt: string
  stored: true
}

export const consentEvidenceApiContract = {
  endpoint: 'POST /api/consent-evidence',
  requestExample: {
    channel: 'checkout',
    consentType: 'contract-acceptance',
    contractLanguage: 'es',
    customerReference: 'customer-email@example.com',
    documentVersions: {
      generalTermsVersion: '1.0',
      projectOrderVersion: '1.0',
    },
    earlyStartRequested: false,
    locale: 'en',
    orderId: 'CM-ORDER-123',
    timestamp: '2026-07-10T12:00:00.000Z',
    wording: 'I have reviewed and accept...',
    wordingVersion: 'checkout-consents-1.0',
  },
  responseExample: {
    evidenceId: 'consent_123',
    receivedAt: '2026-07-10T12:00:01.000Z',
    stored: true,
  },
  schemaProposal:
    'consent_evidence(id, order_id, customer_reference, consent_type, wording, wording_version, terms_version, project_order_version, locale, contract_language, channel, timestamp, metadata_json)',
} as const

const consentApiUrl =
  import.meta.env.VITE_CONSENT_EVIDENCE_API_URL || (import.meta.env.PROD ? '/api/consent-evidence' : '')

export function consentEvidenceBackendConfigured() {
  return Boolean(consentApiUrl)
}

export async function submitConsentEvidence(payload: ConsentEvidencePayload) {
  if (!consentEvidenceBackendConfigured()) {
    return {
      ok: false as const,
      reason:
        'Consent evidence backend is not configured. Local browser storage is not authoritative contractual evidence.',
    }
  }

  const response = await fetch(consentApiUrl, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    return {
      ok: false as const,
      reason: `Consent evidence API failed with ${response.status}.`,
    }
  }

  return {
    ok: true as const,
    response: (await response.json()) as ConsentEvidenceResponse,
  }
}
