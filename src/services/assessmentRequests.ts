import { buildAssessmentCustomerConfirmation } from './customerConfirmationTemplate'
import { buildAssessmentLeadNotification } from './leadNotificationTemplate'

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
  source: string
}

const assessmentSubmitUrl = (import.meta.env.VITE_ASSESSMENT_SUBMIT_URL ?? '').trim()
const estimateApiBase = (import.meta.env.VITE_ESTIMATE_API_URL ?? '').replace(/\/$/, '')
const assessmentEndpoint = assessmentSubmitUrl || (estimateApiBase ? `${estimateApiBase}/api/assessment-request` : '')

export async function submitAssessmentRequest(input: AssessmentRequestInput) {
  if (!assessmentEndpoint) {
    throw new Error('Assessment submission endpoint is not configured.')
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
      type: 'free_home_safety_assessment',
      ...input,
      notification,
      customerConfirmation,
    }),
  })

  if (!response.ok) {
    throw new Error(await readSubmissionError(response))
  }
}

async function readSubmissionError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string; error?: string }
    return body.message ?? body.error ?? 'Assessment request could not be submitted.'
  } catch {
    return 'Assessment request could not be submitted.'
  }
}
