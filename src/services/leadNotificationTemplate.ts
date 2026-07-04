export type AssessmentLeadNotificationPayload = {
  selectedPlan?: string
  name?: string
  phone?: string
  email?: string
  city?: string
  preferredContactMethod?: string
  preferredDate?: string
  message?: string
  consentAt?: string
  submittedAt?: string
}

export type LeadNotification = {
  subject: string
  plainText: string
  html: string
}

type LeadDetail = {
  label: string
  value: string
}

const PLAN_NOT_SELECTED = 'Plan Not Selected'
const NOT_SURE_PLAN = 'Not sure yet'
const ASSESSMENT_VISIT_FEE = '€89'

export function buildAssessmentLeadNotification(
  payload: AssessmentLeadNotificationPayload,
): LeadNotification {
  const selectedPlan = getNotificationPlanLabel(payload.selectedPlan)
  const customerName = cleanText(payload.name) || 'Unknown Customer'
  const subject = `New Casamia Assessment Lead \u2014 ${selectedPlan} \u2014 ${customerName}`
  const recommendedNextAction = getRecommendedNextAction(payload.selectedPlan)
  const details = buildLeadDetails(payload, selectedPlan)

  return {
    subject,
    plainText: buildPlainText(details, recommendedNextAction),
    html: buildHtml(payload, details, recommendedNextAction),
  }
}

function buildLeadDetails(
  payload: AssessmentLeadNotificationPayload,
  selectedPlan: string,
): LeadDetail[] {
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
    { label: 'Consent status', value: getConsentStatus(payload.consentAt) },
    { label: 'Submitted at timestamp', value: cleanText(payload.submittedAt) || 'Not recorded' },
  ]
}

function buildPlainText(details: LeadDetail[], recommendedNextAction: string) {
  return [
    'New In-Home Safety Assessment Visit Request',
    '',
    'Lead details:',
    ...details.map((detail) => `${detail.label}: ${detail.value}`),
    '',
    'Recommended Next Action',
    recommendedNextAction,
  ].join('\n')
}

function buildHtml(
  payload: AssessmentLeadNotificationPayload,
  details: LeadDetail[],
  recommendedNextAction: string,
) {
  const quickLinks = buildQuickLinks(payload)
  const detailRows = details
    .map(
      (detail) => `
        <tr>
          <th style="padding: 10px 12px; text-align: left; vertical-align: top; color: #102235; background: #f4f8fb; border-bottom: 1px solid #d8e5ef; width: 34%;">${escapeHtml(
            detail.label,
          )}</th>
          <td style="padding: 10px 12px; color: #26384a; border-bottom: 1px solid #d8e5ef;">${escapeHtml(
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
        <header style="padding: 28px 30px; background: #0f6286; color: #ffffff;">
          <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Casamia Lead Notification</p>
          <h1 style="margin: 0; font-size: 26px; line-height: 1.2;">New In-Home Safety Assessment Visit Request</h1>
        </header>

        <div style="padding: 28px 30px;">
          <h2 style="margin: 0 0 14px; font-size: 18px;">Lead details</h2>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #d8e5ef;">
            <tbody>
              ${detailRows}
            </tbody>
          </table>

          ${quickLinks}

          <section style="margin-top: 26px; padding: 20px; background: #eff8e8; border: 1px solid #b9de9d; border-radius: 10px;">
            <h2 style="margin: 0 0 8px; color: #102235; font-size: 18px;">Recommended Next Action</h2>
            <p style="margin: 0; color: #26384a; font-size: 15px; line-height: 1.55;">${escapeHtml(
              recommendedNextAction,
            )}</p>
          </section>
        </div>
      </section>
    </main>
  </body>
</html>`
}

function buildQuickLinks(payload: AssessmentLeadNotificationPayload) {
  const phoneForTel = normalizePhoneForTel(payload.phone)
  const phoneForWhatsapp = normalizePhoneForWhatsapp(payload.phone)
  const email = cleanText(payload.email)
  const links: string[] = []

  if (phoneForTel) {
    links.push(
      `<a href="tel:${escapeHtml(phoneForTel)}" style="${quickLinkStyle()}">Call customer</a>`,
    )
  }

  if (phoneForWhatsapp) {
    links.push(
      `<a href="https://wa.me/${escapeHtml(phoneForWhatsapp)}" style="${quickLinkStyle()}">Open WhatsApp</a>`,
    )
  }

  if (email) {
    links.push(
      `<a href="mailto:${encodeURIComponent(email)}" style="${quickLinkStyle()}">Email customer</a>`,
    )
  }

  if (!links.length) {
    return ''
  }

  return `
    <section style="margin-top: 24px;">
      <h2 style="margin: 0 0 12px; font-size: 18px;">Quick contact links</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        ${links.join('')}
      </div>
    </section>`
}

function getNotificationPlanLabel(value?: string) {
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

  if (planKey === 'not-sure') {
    return NOT_SURE_PLAN
  }

  return PLAN_NOT_SELECTED
}

function getRecommendedNextAction(value?: string) {
  const planKey = getPlanKey(value)

  if (planKey === 'home-assessment') {
    return `Call or message the customer to confirm local availability, the ${ASSESSMENT_VISIT_FEE} assessment visit, and what the in-home assessment includes.`
  }

  if (planKey === 'home-safety') {
    return `Confirm the ${ASSESSMENT_VISIT_FEE} assessment visit, explain that the fee is credited if they proceed, and prepare to discuss likely installation needs after the visit.`
  }

  if (planKey === 'smart-safety') {
    return `Confirm the ${ASSESSMENT_VISIT_FEE} assessment visit and prepare to discuss smart safety devices, monitoring needs, and connectivity requirements.`
  }

  return `Contact the customer to understand their needs, explain the ${ASSESSMENT_VISIT_FEE} in-home assessment fee, and guide them toward the right Casamia plan.`
}

function getPlanKey(value?: string) {
  const normalized = normalizeText(value)

  if (!normalized) {
    return ''
  }

  if (
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

  return ''
}

function getConsentStatus(consentAt?: string) {
  const cleanConsentAt = cleanText(consentAt)
  return cleanConsentAt ? `Consent given at ${cleanConsentAt}` : 'Consent not recorded'
}

function normalizePhoneForTel(phone?: string) {
  const cleanPhone = cleanText(phone)

  if (!cleanPhone) {
    return ''
  }

  const startsWithPlus = cleanPhone.startsWith('+')
  const digits = cleanPhone.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  return `${startsWithPlus ? '+' : ''}${digits}`
}

function normalizePhoneForWhatsapp(phone?: string) {
  return cleanText(phone).replace(/\D/g, '')
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

function quickLinkStyle() {
  return 'display: inline-block; padding: 11px 14px; background: #7fbe3b; color: #ffffff; border-radius: 8px; font-weight: 700; text-decoration: none;'
}
