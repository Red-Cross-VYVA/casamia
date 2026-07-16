import { buildAssessmentCustomerConfirmation } from './customerConfirmationTemplate'
import { buildAssessmentLeadNotification } from './leadNotificationTemplate'
import { getPublicSiteApiBaseUrl, hasPublicSiteApi } from './publicSiteApi'

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
  reportToken?: string
}

const assessmentSubmitUrl = (import.meta.env.VITE_ASSESSMENT_SUBMIT_URL ?? '').trim()
const publicApiBase = getPublicSiteApiBaseUrl()
const assessmentEndpoint =
  assessmentSubmitUrl || (hasPublicSiteApi() ? `${publicApiBase}/api/public/assessment-requests` : '')
const ASSESSMENT_VISIT_FEE = '99 EUR'

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
}

async function readSubmissionError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string; error?: string }
    return body.message ?? body.error ?? 'Assessment request could not be submitted.'
  } catch {
    return 'Assessment request could not be submitted.'
  }
}
