import { getRequestHeader, normalizeOrigin } from './public-origin.js'

const defaultFrom = 'CasaMia <hola@casamia.com.es>'
const defaultReplyTo = 'hola@casamia.com.es'

export function buildAbsoluteProposalUrl(request, publicToken, env = process.env) {
  if (!publicToken) return ''

  return buildAbsolutePublicUrl(request, `/proposal/${publicToken}`, env)
}

export function buildAbsolutePublicUrl(request, publicPath, env = process.env) {
  const path = text(publicPath)
  if (!path) return ''

  try {
    return new URL(path).toString()
  } catch {
    // Relative report paths are resolved below.
  }

  const configuredOrigin = normalizeOrigin(
    env.CASAMIA_PUBLIC_SITE_URL
      || env.VITE_SITE_URL
      || env.VITE_PUBLIC_SITE_API_URL
      || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
      || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : ''),
  )

  const relativePath = path.startsWith('/') ? path : `/${path}`

  if (configuredOrigin) return `${configuredOrigin}${relativePath}`

  const requestOrigin = normalizeOrigin(getRequestHeader(request, 'origin'))
  if (requestOrigin) return `${requestOrigin}${relativePath}`

  const forwardedProtocol = getRequestHeader(request, 'x-forwarded-proto').split(',')[0].trim()
  const protocol = forwardedProtocol || (env.VERCEL ? 'https' : 'http')
  const host = getRequestHeader(request, 'host')
  const hostOrigin = normalizeOrigin(host ? `${protocol}://${host}` : '')

  return `${hostOrigin || 'https://www.casamia.com.es'}${relativePath}`
}

export function isProposalEmailConfigured(env = process.env) {
  return Boolean(env.RESEND_API_KEY)
}

export async function sendTransactionalEmail({
  bcc,
  env = process.env,
  html,
  replyTo,
  subject,
  text: textBody,
  to,
} = {}) {
  const recipients = normalizeRecipients(to)
  const apiKey = env.RESEND_API_KEY

  if (!recipients.length) return skippedDelivery('recipient_missing', 'Email recipient is missing.')
  if (!apiKey) return skippedDelivery('not_configured', 'RESEND_API_KEY is not configured.')

  const body = {
    from: text(env.CASAMIA_EMAIL_FROM || env.RESEND_FROM_EMAIL) || defaultFrom,
    html: String(html || ''),
    subject: text(subject) || 'CasaMia notification',
    text: String(textBody || ''),
    to: recipients,
    ...(text(replyTo || env.CASAMIA_REPLY_TO_EMAIL) || defaultReplyTo
      ? { reply_to: text(replyTo || env.CASAMIA_REPLY_TO_EMAIL) || defaultReplyTo }
      : {}),
    ...(normalizeRecipients(bcc).length ? { bcc: normalizeRecipients(bcc) } : {}),
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const responseText = await resendResponse.text()
    const responseBody = parseJson(responseText)

    if (!resendResponse.ok) {
      return {
        ok: false,
        provider: 'resend',
        reason: responseBody?.message || responseText.slice(0, 500) || 'Resend email request failed.',
        status: 'failed',
        statusCode: resendResponse.status,
      }
    }

    return {
      id: responseBody?.id ?? '',
      ok: true,
      provider: 'resend',
      status: 'sent',
      statusCode: resendResponse.status,
    }
  } catch (error) {
    return {
      ok: false,
      provider: 'resend',
      reason: error instanceof Error ? error.message : 'Resend email request failed.',
      status: 'failed',
    }
  }
}

export async function sendProposalEmail({
  env = process.env,
  language = 'en',
  proposal,
  publicUrl,
} = {}) {
  const apiKey = env.RESEND_API_KEY
  const to = text(proposal?.customer_email ?? proposal?.email)

  if (!to) {
    return skippedDelivery('recipient_missing', 'Customer email is missing.')
  }

  if (!apiKey) {
    return skippedDelivery('not_configured', 'RESEND_API_KEY is not configured.')
  }

  if (!publicUrl) {
    return skippedDelivery('proposal_url_missing', 'Proposal URL is missing.')
  }

  const isSpanish = String(language).toLowerCase().startsWith('es')
  const from = text(env.CASAMIA_EMAIL_FROM || env.RESEND_FROM_EMAIL) || defaultFrom
  const replyTo = text(env.CASAMIA_REPLY_TO_EMAIL) || defaultReplyTo
  const bcc = text(env.CASAMIA_PROPOSAL_BCC_EMAIL || env.CASAMIA_NOTIFY_EMAIL)
  const subject = isSpanish
    ? 'Tu propuesta CasaMia está lista'
    : 'Your CasaMia proposal is ready'
  const html = renderProposalEmailHtml({ isSpanish, proposal, publicUrl })
  const textBody = renderProposalEmailText({ isSpanish, proposal, publicUrl })
  const body = {
    from,
    html,
    subject,
    text: textBody,
    to: [to],
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(bcc ? { bcc: [bcc] } : {}),
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const responseText = await resendResponse.text()
    const responseBody = parseJson(responseText)

    if (!resendResponse.ok) {
      return {
        ok: false,
        provider: 'resend',
        reason: responseBody?.message || responseText.slice(0, 500) || 'Resend email request failed.',
        status: 'failed',
        statusCode: resendResponse.status,
      }
    }

    return {
      id: responseBody?.id ?? '',
      ok: true,
      provider: 'resend',
      status: 'sent',
      statusCode: resendResponse.status,
    }
  } catch (error) {
    return {
      ok: false,
      provider: 'resend',
      reason: error instanceof Error ? error.message : 'Resend email request failed.',
      status: 'failed',
    }
  }
}

export async function sendPublicReportEmail({
  env = process.env,
  language = 'en',
  publicUrl,
  report,
  reportType = 'safety_report',
  customer,
} = {}) {
  const apiKey = env.RESEND_API_KEY
  const to = text(customer?.customer_email ?? customer?.email)

  if (!to) {
    return skippedDelivery('recipient_missing', 'Customer email is missing.')
  }

  if (!apiKey) {
    return skippedDelivery('not_configured', 'RESEND_API_KEY is not configured.')
  }

  if (!publicUrl) {
    return skippedDelivery('report_url_missing', 'Report URL is missing.')
  }

  const isSpanish = String(language).toLowerCase().startsWith('es')
  const copy = getPublicReportEmailCopy(reportType, isSpanish)
  const from = text(env.CASAMIA_EMAIL_FROM || env.RESEND_FROM_EMAIL) || defaultFrom
  const replyTo = text(env.CASAMIA_REPLY_TO_EMAIL) || defaultReplyTo
  const bcc = text(env.CASAMIA_REPORT_BCC_EMAIL || env.CASAMIA_NOTIFY_EMAIL)
  const publicUrls = {
    contact: buildAbsolutePublicUrl(undefined, '/why-us#contact-form', env),
    home: buildAbsolutePublicUrl(undefined, '/', env),
    legal: buildAbsolutePublicUrl(undefined, '/legal-notice', env),
    privacy: buildAbsolutePublicUrl(undefined, '/privacy-policy', env),
    terms: buildAbsolutePublicUrl(undefined, '/general-customer-terms', env),
  }
  const html = renderPublicReportEmailHtml({ copy, customer, publicUrl, publicUrls, report })
  const textBody = renderPublicReportEmailText({ copy, customer, publicUrl, publicUrls, report })
  const body = {
    from,
    html,
    subject: copy.subject,
    text: textBody,
    to: [to],
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(bcc ? { bcc: [bcc] } : {}),
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const responseText = await resendResponse.text()
    const responseBody = parseJson(responseText)

    if (!resendResponse.ok) {
      return {
        ok: false,
        provider: 'resend',
        reason: responseBody?.message || responseText.slice(0, 500) || 'Resend email request failed.',
        status: 'failed',
        statusCode: resendResponse.status,
      }
    }

    return {
      id: responseBody?.id ?? '',
      ok: true,
      provider: 'resend',
      status: 'sent',
      statusCode: resendResponse.status,
    }
  } catch (error) {
    return {
      ok: false,
      provider: 'resend',
      reason: error instanceof Error ? error.message : 'Resend email request failed.',
      status: 'failed',
    }
  }
}

function getPublicReportEmailCopy(reportType, isSpanish) {
  if (reportType === 'grant_report') {
    return isSpanish
      ? {
          subject: 'Tu informe de ayudas CasaMia está listo',
          title: 'Tu informe de ayudas CasaMia está listo',
          greeting: 'Hola',
          intro: 'Hemos guardado tu informe de elegibilidad. Usa este enlace seguro para volver a ver las recomendaciones, documentos y próximos pasos.',
          cta: 'Abrir informe seguro',
          privacy: 'Por privacidad, el email solo incluye el enlace seguro. Los detalles completos permanecen dentro del informe.',
          support: 'Si necesitas ayuda, responde a este email o escríbenos a hola@casamia.com.es.',
          contactLink: 'Contacto', privacyLink: 'Política de privacidad', legalLink: 'Aviso legal', termsLink: 'Condiciones de contratación',
        }
      : {
          subject: 'Your CasaMia grant eligibility report is ready',
          title: 'Your CasaMia grant eligibility report is ready',
          greeting: 'Hello',
          intro: 'We saved your eligibility report. Use this secure link to reopen the recommendations, documents and next steps.',
          cta: 'Open secure report',
          privacy: 'For privacy, this email only includes the secure link. The full details stay inside the report.',
          support: 'If you need help, reply to this email or write to hola@casamia.com.es.',
          contactLink: 'Contact', privacyLink: 'Privacy Policy', legalLink: 'Legal Notice', termsLink: 'Customer Terms',
        }
  }

  return isSpanish
    ? {
        subject: 'Tu informe de seguridad CasaMia está listo',
        title: 'Tu informe de seguridad CasaMia está listo',
        greeting: 'Hola',
        intro: 'Hemos guardado tu informe de seguridad del hogar. Usa este enlace seguro para volver a ver los riesgos detectados y las recomendaciones.',
        cta: 'Abrir informe seguro',
        privacy: 'Por privacidad, el email solo incluye el enlace seguro. Los detalles completos permanecen dentro del informe.',
        support: 'Si necesitas ayuda, responde a este email o escríbenos a hola@casamia.com.es.',
        contactLink: 'Contacto', privacyLink: 'Política de privacidad', legalLink: 'Aviso legal', termsLink: 'Condiciones de contratación',
      }
    : {
        subject: 'Your CasaMia home safety report is ready',
        title: 'Your CasaMia home safety report is ready',
        greeting: 'Hello',
        intro: 'We saved your home safety report. Use this secure link to reopen the risks we found and the recommendations.',
        cta: 'Open secure report',
        privacy: 'For privacy, this email only includes the secure link. The full details stay inside the report.',
        support: 'If you need help, reply to this email or write to hola@casamia.com.es.',
        contactLink: 'Contact', privacyLink: 'Privacy Policy', legalLink: 'Legal Notice', termsLink: 'Customer Terms',
      }
}

function renderPublicReportEmailHtml({ copy, customer, publicUrl, publicUrls, report }) {
  const customerName = text(customer?.customer_name ?? customer?.name)
  const firstName = customerName.split(/\s+/)[0]
  const greeting = firstName ? `${escapeHtml(copy.greeting)} ${escapeHtml(firstName)},` : `${escapeHtml(copy.greeting)},`
  const reportTitle = text(report?.report_title)

  return `
    <div style="margin:0;background:#eef7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#142235;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #c9e1ef;">
        <tr>
          <td style="padding:28px 32px 18px;">
            <div style="font-size:34px;line-height:1;font-weight:800;letter-spacing:-1px;color:#102033;">Casa<span style="color:#37a4dc;">Mia</span></div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px;">
            <p style="margin:0 0 12px;font-size:17px;line-height:1.55;color:#4d6072;">${greeting}</p>
            <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.08;color:#142235;">${escapeHtml(copy.title)}</h1>
            ${reportTitle ? `<p style="margin:0 0 14px;font-size:16px;line-height:1.45;color:#4d6072;"><strong>${escapeHtml(reportTitle)}</strong></p>` : ''}
            <p style="margin:0 0 24px;font-size:17px;line-height:1.55;color:#4d6072;">${escapeHtml(copy.intro)}</p>
            <a href="${escapeAttribute(publicUrl)}" style="display:inline-block;background:#7bbf3b;color:#ffffff;text-decoration:none;font-weight:800;border-radius:999px;padding:12px 14px 12px 24px;font-size:16px;line-height:24px;">${escapeHtml(copy.cta)}<span style="display:inline-block;margin-left:10px;width:24px;height:24px;line-height:24px;text-align:center;background:#ffffff;color:#245c16;border-radius:50%;font-size:18px;font-weight:900;vertical-align:middle;">&rarr;</span></a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px;">
            <div style="border-radius:18px;background:#f2f9fd;border:1px solid #c9e1ef;padding:18px 20px;">
              <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#4d6072;">${escapeHtml(copy.privacy)}</p>
              <p style="margin:0;font-size:14px;line-height:1.55;color:#4d6072;">${escapeHtml(copy.support)}</p>
            </div>
            <div style="padding-top:18px;margin-top:22px;border-top:1px solid #dcecf5;font-size:12px;line-height:1.6;color:#687b8b;">
              <p style="margin:0 0 8px;">CasaMia · MOKA DIGITECK, S.L. · <a href="mailto:hola@casamia.com.es" style="color:#0f6286;">hola@casamia.com.es</a></p>
              <p style="margin:0;"><a href="${escapeAttribute(publicUrls.home)}" style="color:#0f6286;">CasaMia</a> &nbsp;|&nbsp; <a href="${escapeAttribute(publicUrls.contact)}" style="color:#0f6286;">${escapeHtml(copy.contactLink)}</a> &nbsp;|&nbsp; <a href="${escapeAttribute(publicUrls.privacy)}" style="color:#0f6286;">${escapeHtml(copy.privacyLink)}</a> &nbsp;|&nbsp; <a href="${escapeAttribute(publicUrls.legal)}" style="color:#0f6286;">${escapeHtml(copy.legalLink)}</a> &nbsp;|&nbsp; <a href="${escapeAttribute(publicUrls.terms)}" style="color:#0f6286;">${escapeHtml(copy.termsLink)}</a></p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `
}

function renderPublicReportEmailText({ copy, customer, publicUrl, publicUrls, report }) {
  const customerName = text(customer?.customer_name ?? customer?.name)
  const firstName = customerName.split(/\s+/)[0]
  const reportTitle = text(report?.report_title)

  return [
    `${copy.greeting}${firstName ? ` ${firstName}` : ''},`,
    '',
    copy.title,
    reportTitle,
    '',
    copy.intro,
    '',
    `${copy.cta}: ${publicUrl}`,
    '',
    copy.privacy,
    copy.support,
    '',
    'CasaMia · MOKA DIGITECK, S.L. · hola@casamia.com.es',
    `${copy.contactLink}: ${publicUrls.contact}`,
    `${copy.privacyLink}: ${publicUrls.privacy}`,
    `${copy.legalLink}: ${publicUrls.legal}`,
    `${copy.termsLink}: ${publicUrls.terms}`,
  ].filter(Boolean).join('\n')
}

function renderProposalEmailHtml({ isSpanish, proposal, publicUrl }) {
  const customerName = text(proposal?.customer_name ?? proposal?.customerName)
  const firstName = customerName.split(/\s+/)[0]
  const lineItems = getLineItems(proposal)
  const total = formatEuro(proposal?.total_estimate ?? proposal?.total)
  const greeting = isSpanish
    ? `Hola${firstName ? ` ${escapeHtml(firstName)}` : ''},`
    : `Hello${firstName ? ` ${escapeHtml(firstName)}` : ''},`
  const title = isSpanish ? 'Tu propuesta CasaMia está lista' : 'Your CasaMia proposal is ready'
  const intro = isSpanish
    ? 'Hemos generado tu propuesta con los paquetes, cantidades y extras que seleccionaste.'
    : 'We generated your proposal using the packages, quantities and add-ons you selected.'
  const cta = isSpanish ? 'Abrir propuesta' : 'Open proposal'
  const summaryTitle = isSpanish ? 'Incluye' : 'Included'
  const totalLabel = isSpanish ? 'Importe estimado' : 'Estimated total'
  const footer = isSpanish
    ? 'Los importes se muestran con IVA incluido. Los extras que requieren presupuesto se confirman antes de iniciar el trabajo.'
    : 'Prices are VAT-included. Add-ons that require a quote are confirmed before work starts.'
  const support = isSpanish
    ? 'Si necesitas ayuda, responde a este email o escríbenos a hola@casamia.com.es.'
    : 'If you need help, reply to this email or write to hola@casamia.com.es.'

  return `
    <div style="margin:0;background:#eef7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#142235;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #c9e1ef;">
        <tr>
          <td style="padding:28px 32px 18px;">
            <div style="font-size:34px;line-height:1;font-weight:800;letter-spacing:-1px;color:#102033;">Casa<span style="color:#37a4dc;">Mia</span></div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px;">
            <p style="margin:0 0 12px;font-size:17px;line-height:1.55;color:#4d6072;">${greeting}</p>
            <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.03;color:#142235;">${escapeHtml(title)}</h1>
            <p style="margin:0 0 24px;font-size:17px;line-height:1.55;color:#4d6072;">${escapeHtml(intro)}</p>
            <a href="${escapeAttribute(publicUrl)}" style="display:inline-block;background:#7bbf3b;color:#ffffff;text-decoration:none;font-weight:800;border-radius:999px;padding:15px 24px;font-size:16px;">${escapeHtml(cta)} →</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 30px;">
            <div style="border-radius:20px;background:#f2f9fd;border:1px solid #c9e1ef;padding:20px;">
              <p style="margin:0 0 10px;color:#238bc6;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;">${escapeHtml(summaryTitle)}</p>
              ${total ? `<p style="margin:0 0 14px;font-size:22px;font-weight:800;color:#142235;">${escapeHtml(totalLabel)}: ${escapeHtml(total)}</p>` : ''}
              ${renderLineItems(lineItems, isSpanish)}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px;">
            <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#5c7080;">${escapeHtml(footer)}</p>
            <p style="margin:0;font-size:14px;line-height:1.55;color:#5c7080;">${escapeHtml(support)}</p>
          </td>
        </tr>
      </table>
    </div>
  `
}

function renderProposalEmailText({ isSpanish, proposal, publicUrl }) {
  const customerName = text(proposal?.customer_name ?? proposal?.customerName)
  const firstName = customerName.split(/\s+/)[0]
  const total = formatEuro(proposal?.total_estimate ?? proposal?.total)
  const lines = getLineItems(proposal)
    .slice(0, 8)
    .map((item) => `- ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}`)
    .join('\n')

  if (isSpanish) {
    return [
      `Hola${firstName ? ` ${firstName}` : ''},`,
      '',
      'Tu propuesta CasaMia está lista.',
      total ? `Importe estimado: ${total}` : '',
      lines ? `Incluye:\n${lines}` : '',
      '',
      `Abrir propuesta: ${publicUrl}`,
      '',
      'Los importes se muestran con IVA incluido. Los extras que requieren presupuesto se confirman antes de iniciar el trabajo.',
      'Si necesitas ayuda, responde a este email o escríbenos a hola@casamia.com.es.',
    ].filter(Boolean).join('\n')
  }

  return [
    `Hello${firstName ? ` ${firstName}` : ''},`,
    '',
    'Your CasaMia proposal is ready.',
    total ? `Estimated total: ${total}` : '',
    lines ? `Included:\n${lines}` : '',
    '',
    `Open proposal: ${publicUrl}`,
    '',
    'Prices are VAT-included. Add-ons that require a quote are confirmed before work starts.',
    'If you need help, reply to this email or write to hola@casamia.com.es.',
  ].filter(Boolean).join('\n')
}

function renderLineItems(items, isSpanish) {
  if (!items.length) {
    return `<p style="margin:0;color:#4d6072;">${escapeHtml(isSpanish ? 'Paquetes seleccionados en tu propuesta.' : 'Selected packages are included in your proposal.')}</p>`
  }

  return `
    <ul style="margin:0;padding:0;list-style:none;">
      ${items.slice(0, 8).map((item) => `
        <li style="margin:0 0 10px;padding:0 0 10px;border-bottom:1px solid #dcecf5;color:#142235;font-size:15px;line-height:1.45;">
          <strong>${escapeHtml(item.quantity > 1 ? `${item.quantity}x ${item.name}` : item.name)}</strong>
          ${item.price ? `<span style="float:right;color:#4d6072;">${escapeHtml(item.price)}</span>` : ''}
        </li>
      `).join('')}
    </ul>
  `
}

function getLineItems(proposal) {
  const lineItems = Array.isArray(proposal?.line_items)
    ? proposal.line_items
    : Array.isArray(proposal?.lineItems)
      ? proposal.lineItems
      : []

  return lineItems.map((item) => ({
    name: text(item?.name) || 'CasaMia package',
    price: formatEuro(Number(item?.unit_price ?? item?.unitPrice ?? 0) * Number(item?.quantity ?? 1)),
    quantity: Math.max(1, Math.floor(Number(item?.quantity ?? 1) || 1)),
  }))
}

function formatEuro(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return ''
  return new Intl.NumberFormat('es-ES', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(parsed)
}

function skippedDelivery(reason, message) {
  return {
    ok: false,
    reason: message,
    skipped: true,
    status: reason,
  }
}

function parseJson(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function normalizeRecipients(value) {
  const values = Array.isArray(value) ? value : String(value || '').split(',')
  return values.map((item) => text(item)).filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item))
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;')
}
