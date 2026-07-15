export type AssessmentCustomerConfirmationPayload = {
  selectedPlan?: string
  name?: string
  phone?: string
  email?: string
  city?: string
  preferredContactMethod?: string
  preferredDate?: string
  message?: string
}

export type CustomerConfirmation = {
  subject: string
  plainText: string
  html: string
}

type CustomerDetail = {
  label: string
  value: string
}

const NOT_SURE_PLAN = 'Not sure yet'
const ASSESSMENT_VISIT_FEE = '€89'
const SCHEDULE_INSPECTION_URL =
  'mailto:hello@casamia.es?subject=Assessment%20visit%20request'
const CasaMia_WEBSITE_URL = 'https://CasaMia-seniors.myshopify.com/'
const CasaMia_CONTACT = 'hello@casamia.es'

export function buildAssessmentCustomerConfirmation(
  payload: AssessmentCustomerConfirmationPayload,
): CustomerConfirmation {
  const selectedPlan = getCustomerPlanLabel(payload.selectedPlan)
  const subject = buildSubject(selectedPlan)
  const reassurance = getPlanReassurance(payload.selectedPlan)
  const details = buildCustomerDetails(payload, selectedPlan)

  return {
    subject,
    plainText: buildPlainText(details, reassurance),
    html: buildHtml(details, reassurance),
  }
}

function buildSubject(selectedPlan: string) {
  if (selectedPlan && selectedPlan !== NOT_SURE_PLAN) {
    return `Your CasaMia ${selectedPlan} Assessment Visit Request Has Been Received`
  }

  return 'Your CasaMia In-Home Safety Assessment Request Has Been Received'
}

function buildCustomerDetails(
  payload: AssessmentCustomerConfirmationPayload,
  selectedPlan: string,
): CustomerDetail[] {
  return [
    { label: 'Selected plan', value: selectedPlan },
    { label: 'Assessment visit fee', value: ASSESSMENT_VISIT_FEE },
    { label: 'Full name', value: cleanText(payload.name) || 'Not provided' },
    { label: 'Phone', value: cleanText(payload.phone) || 'Not provided' },
    { label: 'Email', value: cleanText(payload.email) || 'Not provided' },
    { label: 'City / Area', value: cleanText(payload.city) || 'Not provided' },
    {
      label: 'Preferred contact method',
      value: cleanText(payload.preferredContactMethod) || 'Not provided',
    },
    {
      label: 'Preferred assessment date',
      value: cleanText(payload.preferredDate) || 'Not provided',
    },
    { label: 'Message / concerns', value: cleanText(payload.message) || 'Not provided' },
  ]
}

function buildPlainText(details: CustomerDetail[], reassurance: string) {
  return [
    'Thank you for contacting CasaMia',
    '',
    "We've received your request and our team will review your details shortly.",
    '',
    'Your Request Summary',
    ...details.map((detail) => `${detail.label}: ${detail.value}`),
    '',
    'What Happens Next',
    '1. A CasaMia representative will contact you shortly.',
    `2. We will confirm your needs, local availability, and the ${ASSESSMENT_VISIT_FEE} assessment visit before booking.`,
    '3. If you choose to proceed, our safety team will visit your home and assess it room by room.',
    '4. You will receive expert recommendations and clear next steps.',
    '',
    reassurance,
    '',
    'If you prefer, you can request the assessment visit directly using the link below.',
    `Request Assessment Visit: ${SCHEDULE_INSPECTION_URL}`,
    '',
    'The CasaMia team',
    CasaMia_WEBSITE_URL,
    CasaMia_CONTACT,
    '',
    'Your information will only be used to process your request and contact you about your CasaMia in-home safety assessment visit.',
  ].join('\n')
}

function buildHtml(details: CustomerDetail[], reassurance: string) {
  const detailRows = details
    .map(
      (detail) => `
        <tr>
          <th style="padding: 11px 12px; text-align: left; vertical-align: top; color: #102235; background: #f4f8fb; border-bottom: 1px solid #d8e5ef; width: 34%;">${escapeHtml(
            detail.label,
          )}</th>
          <td style="padding: 11px 12px; color: #26384a; border-bottom: 1px solid #d8e5ef;">${escapeHtml(
            detail.value,
          )}</td>
        </tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en">
  <body style="margin: 0; padding: 0; background: #eef5f8; color: #102235; font-family: Arial, Helvetica, sans-serif;">
    <main style="max-width: 720px; margin: 0 auto; padding: 28px 16px;">
      <section style="background: #ffffff; border: 1px solid #d8e5ef; border-radius: 12px; overflow: hidden;">
        <header style="padding: 30px; background: #0f6286; color: #ffffff;">
          <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">CasaMia</p>
          <h1 style="margin: 0; font-size: 28px; line-height: 1.2;">Thank you for contacting CasaMia</h1>
          <p style="margin: 12px 0 0; color: rgba(255,255,255,0.88); font-size: 16px; line-height: 1.55;">We've received your request and our team will review your details shortly.</p>
        </header>

        <div style="padding: 28px 30px;">
          <h2 style="margin: 0 0 14px; font-size: 19px;">Your Request Summary</h2>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #d8e5ef;">
            <tbody>
              ${detailRows}
            </tbody>
          </table>

          <section style="margin-top: 26px;">
            <h2 style="margin: 0 0 12px; color: #102235; font-size: 19px;">What Happens Next</h2>
            <ol style="margin: 0; padding-left: 22px; color: #26384a; font-size: 15px; line-height: 1.65;">
              <li>A CasaMia representative will contact you shortly.</li>
              <li>We will confirm your needs, local availability, and the ${ASSESSMENT_VISIT_FEE} assessment visit before booking.</li>
              <li>If you choose to proceed, our safety team will visit your home and assess it room by room.</li>
              <li>You will receive expert recommendations and clear next steps.</li>
            </ol>
          </section>

          <section style="margin-top: 26px; padding: 20px; background: #eff8e8; border: 1px solid #b9de9d; border-radius: 10px;">
            <p style="margin: 0; color: #26384a; font-size: 15px; line-height: 1.55;">${escapeHtml(
              reassurance,
            )}</p>
          </section>

          <section style="margin-top: 26px; padding: 22px; background: #f4f8fb; border-radius: 10px; text-align: center;">
            <p style="margin: 0 0 16px; color: #26384a; font-size: 15px; line-height: 1.55;">If you prefer, you can request the assessment visit directly using the link below.</p>
            <a href="${SCHEDULE_INSPECTION_URL}" style="display: inline-block; padding: 13px 20px; background: #7fbe3b; color: #ffffff; border-radius: 999px; font-weight: 700; text-decoration: none;">Request Assessment Visit</a>
          </section>

          <footer style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #d8e5ef; color: #5b6d7d; font-size: 13px; line-height: 1.55;">
            <p style="margin: 0 0 8px; color: #102235; font-weight: 700;">The CasaMia team</p>
            <p style="margin: 0;"><a href="${CasaMia_WEBSITE_URL}" style="color: #0f6286;">${CasaMia_WEBSITE_URL}</a></p>
            <p style="margin: 4px 0 0;"><a href="mailto:${CasaMia_CONTACT}" style="color: #0f6286;">${CasaMia_CONTACT}</a></p>
            <p style="margin: 16px 0 0;">Your information will only be used to process your request and contact you about your CasaMia in-home safety assessment visit.</p>
          </footer>
        </div>
      </section>
    </main>
  </body>
</html>`
}

function getCustomerPlanLabel(value?: string) {
  const planKey = getPlanKey(value)

  if (planKey === 'home-assessment') {
    return 'Home Assessment Plan'
  }

  if (planKey === 'home-safety') {
    return 'Home Safety Plan'
  }

  if (planKey === 'smart-safety') {
    return 'Smart Safety Plan'
  }

  return NOT_SURE_PLAN
}

function getPlanReassurance(value?: string) {
  const planKey = getPlanKey(value)

  if (planKey === 'home-assessment') {
    return `Your request is focused on an in-home inspection and report. The assessment visit costs ${ASSESSMENT_VISIT_FEE}, credited toward your CasaMia plan if you proceed.`
  }

  if (planKey === 'home-safety') {
    return `Your request includes practical home safety improvements. After the ${ASSESSMENT_VISIT_FEE} assessment visit, we'll prepare a clear proposal before any installation or modification begins.`
  }

  if (planKey === 'smart-safety') {
    return `Your request includes smart safety technology. During the ${ASSESSMENT_VISIT_FEE} assessment visit, we'll review your home, connectivity needs, monitoring preferences, and suitable devices before recommending a solution.`
  }

  return `No problem if you are not sure which plan is right. Our team will explain the ${ASSESSMENT_VISIT_FEE} assessment visit and guide you toward the best option for your home and needs.`
}

function getPlanKey(value?: string) {
  const normalized = normalizeText(value)

  if (
    !normalized ||
    normalized.includes('not sure') ||
    normalized.includes('not-sure') ||
    normalized.includes('aun no lo se') ||
    normalized.includes('noch unsicher') ||
    normalized.includes('nog niet zeker')
  ) {
    return 'not-sure'
  }

  if (
    normalized.includes('smart-safety') ||
    normalized.includes('smart safety') ||
    normalized.includes('seguridad smart') ||
    normalized.includes('smart')
  ) {
    return 'smart-safety'
  }

  if (
    normalized.includes('home-safety') ||
    normalized.includes('home safety') ||
    normalized.includes('seguridad del hogar')
  ) {
    return 'home-safety'
  }

  if (
    normalized.includes('home-assessment') ||
    normalized.includes('home assessment') ||
    (normalized.includes('evaluacion') && normalized.includes('hogar'))
  ) {
    return 'home-assessment'
  }

  return 'not-sure'
}

function normalizeText(value?: string) {
  return cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function cleanText(value?: string) {
  return value?.trim() ?? ''
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
