import { buildAssessmentCustomerConfirmation } from './customerConfirmationTemplate.ts'
import { buildAssessmentLeadNotification } from './leadNotificationTemplate.ts'
import { getPublicSiteApiBaseUrl, hasPublicSiteApi } from './publicSiteApi.ts'

export type AssessmentRequestInput = {
  name: string
  phone: string
  email: string
  city: string
  preferredContactMethod: string
  preferredDate: string
  message: string
  selectedPlan: string
  consentAt: string
  consentConfirmed?: boolean
  source: string
  reportToken?: string
  wizardReference?: string
  mediaManifest?: AssessmentMediaManifestItem[]
}

export type AssessmentMediaManifestItem = {
  id: string
  kind: 'image' | 'video' | 'audio'
  name: string
  room: string
  size: number
  type: string
}

export type AssessmentMediaUpload = {
  mediaId: string
  kind: 'image' | 'video' | 'audio'
  bucket: string
  objectPath: string
  signedUrl: string
}

export type AssessmentSubmissionResponse = {
  id?: string
  uploadToken?: string
  uploads?: AssessmentMediaUpload[]
}

export type AssessmentDraftInput = {
  city?: string
  draft: true
  email?: string
  message: string
  name?: string
  phone?: string
  preferredContactMethod?: string
  selectedPlan?: string
  source: 'home-safety-wizard'
  status: 'Draft'
  submittedAt: string
  wizardReference: string
}

export type AssessmentMediaFinalizeResponse = {
  mediaManifest?: Array<Pick<AssessmentMediaUpload, 'kind' | 'bucket' | 'objectPath'> & { mediaId: string }>
  ok?: boolean
  retryAfterMs?: number
  status?: string
}

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {}
const assessmentSubmitUrl = (viteEnv.VITE_ASSESSMENT_SUBMIT_URL ?? '').trim()
const publicApiBase = getPublicSiteApiBaseUrl()
const assessmentEndpoint =
  assessmentSubmitUrl || (hasPublicSiteApi() ? `${publicApiBase}/api/public/assessment-requests` : '')
const configuredFinalizeUrl = (viteEnv.VITE_ASSESSMENT_MEDIA_FINALIZE_URL ?? '').trim()
const assessmentFinalizeEndpoint = configuredFinalizeUrl
  || (assessmentEndpoint.endsWith('/api/public/assessment-requests')
    ? assessmentEndpoint.replace(/\/assessment-requests$/, '/assessment-media-finalize')
    : '')
const ASSESSMENT_VISIT_FEE = '99 EUR'

export async function submitAssessmentRequest(input: AssessmentRequestInput) {
  if (!assessmentEndpoint) {
    throw new Error('Assessment submission endpoint is not configured.')
  }
  if (input.mediaManifest?.length && !assessmentFinalizeEndpoint) {
    throw new Error('Media upload is not configured for the current assessment endpoint.')
  }

  const submittedAt = new Date().toISOString()
  const notification = buildAssessmentLeadNotification({
    ...input,
    submittedAt,
  })
  const customerConfirmation = buildAssessmentCustomerConfirmation(input)

  const response = await fetch(assessmentEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      submittedAt,
      type: 'home_safety_assessment_visit',
      assessmentVisitFee: ASSESSMENT_VISIT_FEE,
      customer_name: input.name,
      customer_email: input.email,
      customer_phone: input.phone,
      city_area: input.city,
      preferred_contact_method: input.preferredContactMethod,
      preferred_assessment_date: input.preferredDate,
      selected_plan: input.selectedPlan,
      consent_at: input.consentAt,
      status: 'New',
      report_token: input.reportToken,
      ...input,
      notification,
      customerConfirmation,
    }),
  })

  if (!response.ok) {
    throw new Error(await readSubmissionError(response))
  }

  const responseText = await response.text()
  if (!responseText) return {}

  try {
    return JSON.parse(responseText) as AssessmentSubmissionResponse
  } catch {
    if (input.mediaManifest?.length) {
      throw new Error('The assessment endpoint did not return a compatible media upload response.')
    }
    return {}
  }
}

export async function saveAssessmentDraft(input: AssessmentDraftInput) {
  if (!assessmentEndpoint) {
    throw new Error('Assessment submission endpoint is not configured.')
  }

  const response = await fetch(assessmentEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      type: 'home_safety_wizard_draft',
      customer_name: input.name ?? '',
      customer_email: input.email ?? '',
      customer_phone: input.phone ?? '',
      city_area: input.city ?? '',
      preferred_contact_method: input.preferredContactMethod ?? '',
      selected_plan: input.selectedPlan ?? 'home-safety-wizard',
      ...input,
      mediaManifest: [],
    }),
  })

  if (!response.ok) {
    throw new Error(await readSubmissionError(response))
  }

  const responseText = await response.text()
  return responseText ? JSON.parse(responseText) as AssessmentSubmissionResponse : {}
}

export async function finalizeAssessmentMedia(
  assessmentId: string,
  uploadToken: string,
  action: 'complete' | 'failed',
) {
  if (!assessmentFinalizeEndpoint) {
    throw new Error('Media finalization endpoint is not configured.')
  }

  const maximumAttempts = 10

  for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
    const response = await fetch(assessmentFinalizeEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, assessmentId, uploadToken }),
    })
    const responseText = await response.text()
    let body: AssessmentMediaFinalizeResponse & { message?: string; error?: string } = {}

    if (responseText) {
      try {
        body = JSON.parse(responseText) as typeof body
      } catch {
        if (!response.ok) throw new Error('Assessment request could not be submitted.')
      }
    }

    if (response.status === 202) {
      if (attempt === maximumAttempts - 1) {
        throw new Error('Your media files are still being secured. Please try again in a moment.')
      }
      const retryAfterMs = Math.min(Math.max(Number(body.retryAfterMs) || 750, 250), 1500)
      await new Promise((resolve) => setTimeout(resolve, retryAfterMs))
      continue
    }

    if (!response.ok) {
      throw new Error(body.message ?? body.error ?? 'Assessment request could not be submitted.')
    }

    return body
  }

  throw new Error('Your media files could not be finalized. Please try again.')
}

async function readSubmissionError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string; error?: string }
    return body.message ?? body.error ?? 'Assessment request could not be submitted.'
  } catch {
    return 'Assessment request could not be submitted.'
  }
}
