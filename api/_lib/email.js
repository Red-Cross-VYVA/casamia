import { getRequestHeader, normalizeOrigin } from './public-origin.js'

const defaultFrom = 'CasaMia <hola@casamia.com.es>'
const defaultReplyTo = 'hola@casamia.com.es'

export function buildAbsoluteProposalUrl(request, publicToken, env = process.env) {
  if (!publicToken) return ''

  const configuredOrigin = normalizeOrigin(
    env.CASAMIA_PUBLIC_SITE_URL
      || env.VITE_SITE_URL
      || env.VITE_PUBLIC_SITE_API_URL
      || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
      || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : ''),
  )

  if (configuredOrigin) return `${configuredOrigin}/proposal/${publicToken}`

  const requestOrigin = normalizeOrigin(getRequestHeader(request, 'origin'))
  if (requestOrigin) return `${requestOrigin}/proposal/${publicToken}`

  const forwardedProtocol = getRequestHeader(request, 'x-forwarded-proto').split(',')[0].trim()
  const protocol = forwardedProtocol || (env.VERCEL ? 'https' : 'http')
  const host = getRequestHeader(request, 'host')
  const hostOrigin = normalizeOrigin(host ? `${protocol}://${host}` : '')

  return `${hostOrigin || 'https://www.casamia.com.es'}/proposal/${publicToken}`
}

export function isProposalEmailConfigured(env = process.env) {
  return Boolean(env.RESEND_API_KEY)
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
