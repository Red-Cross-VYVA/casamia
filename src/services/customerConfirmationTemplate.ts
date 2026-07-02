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
const SCHEDULE_INSPECTION_URL =
  'https://wa.me/34900000000?text=I%20would%20like%20to%20schedule%20my%20CasaMia%20home%20safety%20inspection.'
const CASAMIA_WEBSITE_URL = 'https://casamia-seniors.myshopify.com/'
const CASAMIA_PHONE = '+34 900 000 000'

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
    return `Your Casamia ${selectedPlan} Request Has Been Received`
  }

  return 'Your Casamia Home Safety Assessment Request Has Been Received'
}

function buildCustomerDetails(
  payload: AssessmentCustomerConfirmationPayload,
  selectedPlan: string,
): CustomerDetail[] {
  return [
    { label: 'Selected plan', value: selectedPlan },
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
    'Thank you for contacting Casamia',
    '',
    "We've received your request and our team will review your details shortly.",
    '',
    'Your Request Summary',
    ...details.map((detail) => `${detail.label}: ${detail.value}`),
    '',
    'What Happens Next',
    '1. A Casamia representative will contact you shortly.',
    '2. We will confirm your needs and agree on a convenient inspection time.',
    '3. Our qualified safety team will visit your home and assess it room by room.',
    '4. You will receive expert recommendations and clear next steps.',
    '',
    reassurance,
    '',
    'If you prefer, you can schedule your inspection directly using the link below.',
    `Schedule Inspection: ${SCHEDULE_INSPECTION_URL}`,
    '',
    'The Casamia team',
    CASAMIA_WEBSITE_URL,
    CASAMIA_PHONE,
    '',
    'Your information will only be used to process your request and contact you about your Casamia home safety assessment.',
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
          <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Casamia</p>
          <h1 style="margin: 0; font-size: 28px; line-height: 1.2;">Thank you for contacting Casamia</h1>
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
              <li>A Casamia representative will contact you shortly.</li>
              <li>We will confirm your needs and agree on a convenient inspection time.</li>
              <li>Our qualified safety team will visit your home and assess it room by room.</li>
              <li>You will receive expert recommendations and clear next steps.</li>
            </ol>
          </section>

          <section style="margin-top: 26px; padding: 20px; background: #eff8e8; border: 1px solid #b9de9d; border-radius: 10px;">
            <p style="margin: 0; color: #26384a; font-size: 15px; line-height: 1.55;">${escapeHtml(
              reassurance,
            )}</p>
          </section>

          <section style="margin-top: 26px; padding: 22px; background: #f4f8fb; border-radius: 10px; text-align: center;">
            <p style="margin: 0 0 16px; color: #26384a; font-size: 15px; line-height: 1.55;">If you prefer, you can schedule your inspection directly using the link below.</p>
            <a href="${SCHEDULE_INSPECTION_URL}" style="display: inline-block; padding: 13px 20px; background: #7fbe3b; color: #ffffff; border-radius: 999px; font-weight: 700; text-decoration: none;">Schedule Inspection</a>
          </section>

          <footer style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #d8e5ef; color: #5b6d7d; font-size: 13px; line-height: 1.55;">
            <p style="margin: 0 0 8px; color: #102235; font-weight: 700;">The Casamia team</p>
            <p style="margin: 0;"><a href="${CASAMIA_WEBSITE_URL}" style="color: #0f6286;">${CASAMIA_WEBSITE_URL}</a></p>
            <p style="margin: 4px 0 0;">${CASAMIA_PHONE}</p>
            <p style="margin: 16px 0 0;">Your information will only be used to process your request and contact you about your Casamia home safety assessment.</p>
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
    return "Your request is focused on inspection and reporting. We'll help you understand the safety risks in your home before you decide on any improvements."
  }

  if (planKey === 'home-safety') {
    return "Your request includes practical home safety improvements. After the assessment, we'll prepare a clear proposal before any installation or modification begins."
  }

  if (planKey === 'smart-safety') {
    return "Your request includes smart safety technology. We'll review your home, connectivity needs, monitoring preferences, and suitable devices before recommending a solution."
  }

  return 'No problem if you are not sure which plan is right. Our team will guide you toward the best option for your home and needs.'
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
