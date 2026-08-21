import { getRequestHeader, normalizeOrigin } from './public-origin.js'
import { renderProposalPdf } from './proposal-pdf.js'

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

export async function sendProposalEmail({
  env = process.env,
  includePdf = true,
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
    ? 'Tu plan CasaMia para un hogar mas seguro esta listo'
    : 'Your CasaMia safer home plan is ready'
  const html = renderProposalEmailHtml({ isSpanish, proposal, publicUrl })
  const textBody = renderProposalEmailText({ isSpanish, proposal, publicUrl })
  const attachments = includePdf
    ? [{
        content: (await renderProposalPdf({ language, proposal, publicUrl })).toString('base64'),
        filename: `CasaMia-Proposal-${safeFilename(text(proposal?.id) || 'proposal')}.pdf`,
      }]
    : []
  const body = {
    from,
    html,
    subject,
    text: textBody,
    to: [to],
    ...(attachments.length ? { attachments } : {}),
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(bcc ? { bcc: [bcc] } : {}),
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `proposal-email-${safeFilename(text(proposal?.id) || to)}-${includePdf ? 'pdf' : 'html'}`,
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
  const html = renderPublicReportEmailHtml({ copy, customer, publicUrl, report })
  const textBody = renderPublicReportEmailText({ copy, customer, publicUrl, report })
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
        }
      : {
          subject: 'Your CasaMia grant eligibility report is ready',
          title: 'Your CasaMia grant eligibility report is ready',
          greeting: 'Hello',
          intro: 'We saved your eligibility report. Use this secure link to reopen the recommendations, documents and next steps.',
          cta: 'Open secure report',
          privacy: 'For privacy, this email only includes the secure link. The full details stay inside the report.',
          support: 'If you need help, reply to this email or write to hola@casamia.com.es.',
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
      }
    : {
        subject: 'Your CasaMia home safety report is ready',
        title: 'Your CasaMia home safety report is ready',
        greeting: 'Hello',
        intro: 'We saved your home safety report. Use this secure link to reopen the risks we found and the recommendations.',
        cta: 'Open secure report',
        privacy: 'For privacy, this email only includes the secure link. The full details stay inside the report.',
        support: 'If you need help, reply to this email or write to hola@casamia.com.es.',
      }
}

function renderPublicReportEmailHtml({ copy, customer, publicUrl, report }) {
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
            <a href="${escapeAttribute(publicUrl)}" style="display:inline-block;background:#7bbf3b;color:#ffffff;text-decoration:none;font-weight:800;border-radius:999px;padding:15px 24px;font-size:16px;">${escapeHtml(copy.cta)} →</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px;">
            <div style="border-radius:18px;background:#f2f9fd;border:1px solid #c9e1ef;padding:18px 20px;">
              <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#4d6072;">${escapeHtml(copy.privacy)}</p>
              <p style="margin:0;font-size:14px;line-height:1.55;color:#4d6072;">${escapeHtml(copy.support)}</p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `
}

function renderPublicReportEmailText({ copy, customer, publicUrl, report }) {
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
  ].filter(Boolean).join('\n')
}

function renderProposalEmailHtml({ isSpanish, proposal, publicUrl }) {
  const customerName = text(proposal?.customer_name ?? proposal?.customerName)
  const firstName = customerName.split(/\s+/)[0]
  const lineItems = getLineItems(proposal)
  const reviewItems = getReviewItems(proposal, lineItems)
  const pricedItems = lineItems.filter((item) => !item.needsReview)
  const totals = getProposalTotals(proposal, pricedItems)
  const proposalReference = text(proposal?.id)
  const termsUrl = buildUrlFromPublicUrl(publicUrl, '/general-customer-terms')
  const customerNotes = getCustomerNotes(proposal)
  const greeting = isSpanish
    ? `Hola${firstName ? ` ${escapeHtml(firstName)}` : ''},`
    : `Hello${firstName ? ` ${escapeHtml(firstName)}` : ''},`
  const copy = isSpanish
    ? {
        title: 'Tu plan CasaMia para un hogar mas seguro esta listo',
        intro: 'Adjuntamos una propuesta completa con los paquetes seleccionados, trabajos incluidos, condiciones de pago y proximos pasos.',
        attached: 'PDF adjunto',
        attachedBody: 'Puedes revisar la propuesta sin volver a la web. El enlace online queda disponible para verla o pedir el paquete.',
        cta: 'Ver y pedir online',
        customerNotesBody: 'CasaMia revisa estas notas antes de confirmar alcance final o cualquier abono.',
        customerNotesTitle: 'Notas para revision CasaMia',
        summaryTitle: 'Resumen de la propuesta',
        totalLabel: 'Total estimado',
        depositLabel: 'Deposito estimado',
        balanceLabel: 'Resto estimado',
        includedTitle: 'Trabajos incluidos con precio',
        includedBody:
          'Cada paquete con precio incluye seleccion de productos, instalacion profesional, entrega, soporte y mantenimiento coordinados por CasaMia. Letra pequena: los precios de paquete cubren un resultado coordinado, no una cesta itemizada. Tras revisar la vivienda, CasaMia puede ajustar o sustituir elementos incluidos; los abonos solo se aplican cuando el alcance reducido baja materialmente el coste de producto, instalacion o proveedor de CasaMia.',
        reviewTitle: 'Extras que requieren mas informacion',
        reviewBody: 'CasaMia confirmara medidas, idoneidad y precio antes de anadir cualquier extra, y no lo anadira sin tu aprobacion.',
        nextTitle: 'Que ocurre ahora',
        nextBody: 'Si pides el paquete, CasaMia contactara contigo para confirmar fecha, alcance final y proximos pasos de pago.',
        footer: 'Importes con IVA incluido. Sin costes ocultos. No se inicia ningun trabajo sin aprobacion del cliente.',
        referenceNote: proposalReference
          ? `Cuando contactes con CasaMia, menciona la referencia ${proposalReference} para que podamos localizar tu propuesta rapidamente.`
          : 'Cuando contactes con CasaMia, menciona la referencia de tu propuesta para que podamos localizarla rapidamente.',
        support: 'Si necesitas ayuda, responde a este email o escribenos a hola@casamia.com.es.',
        termsBody: 'Puedes consultar los terminos y condiciones antes de pedir el paquete.',
        termsLabel: 'Terminos y condiciones',
      }
    : {
        title: 'Your CasaMia safer home plan is ready',
        intro: 'Your full proposal is attached, including selected packages, included works, payment terms and next steps.',
        attached: 'PDF attached',
        attachedBody: 'You can review the proposal without returning to the website. The online link remains available for viewing or ordering.',
        cta: 'View and order online',
        customerNotesBody: 'CasaMia reviews these notes before confirming final scope or any credit.',
        customerNotesTitle: 'Notes for CasaMia review',
        summaryTitle: 'Proposal summary',
        totalLabel: 'Total estimate',
        depositLabel: 'Estimated deposit',
        balanceLabel: 'Estimated balance',
        includedTitle: 'Priced works included',
        includedBody:
          'Every priced package line includes product selection, professional installation, handover, support and maintenance coordinated by CasaMia. Fine print: package prices cover a coordinated outcome, not an item-by-item basket. After the home review, CasaMia may adjust or substitute included items; credits apply only when reduced scope materially lowers CasaMia product, installation, or partner cost.',
        reviewTitle: 'Extras needing more information',
        reviewBody: 'CasaMia will confirm measurements, suitability and price before adding any extra, and will not add it without your approval.',
        nextTitle: 'What happens next',
        nextBody: 'If you order the package, CasaMia will contact you to confirm scheduling, final scope and next payment steps.',
        footer: 'Prices include VAT. No hidden fees. No work begins without customer approval.',
        referenceNote: proposalReference
          ? `When contacting CasaMia, please mention proposal reference ${proposalReference} so we can find your plan quickly.`
          : 'When contacting CasaMia, please mention your proposal reference so we can find your plan quickly.',
        support: 'If you need help, reply to this email or write to hola@casamia.com.es.',
        termsBody: 'You can review the Terms & Conditions before ordering.',
        termsLabel: 'Terms & Conditions',
      }

  return `
    <div style="margin:0;background:#eef7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#142235;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #c9e1ef;">
        <tr>
          <td style="padding:30px 34px 16px;">
            <div style="font-size:34px;line-height:1;font-weight:800;letter-spacing:-1px;color:#102033;">Casa<span style="color:#37a4dc;">Mia</span></div>
            <p style="margin:18px 0 0;color:#65b934;font-size:13px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;">${escapeHtml(copy.attached)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 34px 24px;">
            <p style="margin:0 0 12px;font-size:17px;line-height:1.55;color:#4d6072;">${greeting}</p>
            <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.03;color:#142235;">${escapeHtml(copy.title)}</h1>
            <p style="margin:0 0 18px;font-size:17px;line-height:1.55;color:#4d6072;">${escapeHtml(copy.intro)}</p>
            <div style="border-radius:18px;background:#eef7fb;border:1px solid #c9e1ef;padding:16px;margin:0 0 22px;">
              <strong style="display:block;margin:0 0 6px;color:#142235;font-size:16px;">${escapeHtml(copy.attached)}</strong>
              <span style="display:block;color:#4d6072;font-size:15px;line-height:1.5;">${escapeHtml(copy.attachedBody)}</span>
            </div>
            <a href="${escapeAttribute(publicUrl)}" style="display:inline-block;background:#7bbf3b;color:#ffffff;text-decoration:none;font-weight:800;border-radius:999px;padding:15px 24px;font-size:16px;">${escapeHtml(copy.cta)} -&gt;</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 34px 24px;">
            <div style="border-radius:20px;background:#ffffff;border:1px solid #c9e1ef;padding:20px;">
              <p style="margin:0 0 10px;color:#238bc6;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;">${escapeHtml(copy.includedTitle)}</p>
              <p style="margin:0 0 16px;color:#4d6072;font-size:15px;line-height:1.5;">${escapeHtml(copy.includedBody)}</p>
              ${renderLineItems(pricedItems.length ? pricedItems : lineItems, isSpanish)}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 34px 24px;">
            <div style="border-radius:20px;background:#f8fcff;border:1px solid #c9e1ef;padding:20px;">
              <p style="margin:0 0 12px;color:#238bc6;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;">${escapeHtml(copy.summaryTitle)}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px;color:#142235;">
                ${renderMetricRow(copy.totalLabel, formatEuro(totals.totalEstimate))}
                ${renderMetricRow(copy.depositLabel, formatEuro(totals.depositDue))}
                ${renderMetricRow(copy.balanceLabel, formatEuro(totals.balanceDue))}
              </table>
            </div>
          </td>
        </tr>
        ${customerNotes ? `
          <tr>
            <td style="padding:0 34px 24px;">
              <div style="border-radius:20px;background:#fbfdff;border:1px solid #c9e1ef;padding:20px;">
                <p style="margin:0 0 10px;color:#238bc6;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;">${escapeHtml(copy.customerNotesTitle)}</p>
                <p style="margin:0 0 10px;color:#142235;font-size:15px;line-height:1.55;font-weight:700;">${escapeHtml(customerNotes)}</p>
                <p style="margin:0;color:#5c7080;font-size:14px;line-height:1.55;">${escapeHtml(copy.customerNotesBody)}</p>
              </div>
            </td>
          </tr>
        ` : ''}
        ${reviewItems.length ? `
          <tr>
            <td style="padding:0 34px 24px;">
              <div style="border-radius:20px;background:#fff8ee;border:1px solid #f3c47c;padding:20px;">
                <p style="margin:0 0 10px;color:#9a5a00;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;">${escapeHtml(copy.reviewTitle)}</p>
                ${renderLineItems(reviewItems, isSpanish)}
                <p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:#5c7080;">${escapeHtml(copy.reviewBody)}</p>
              </div>
            </td>
          </tr>
        ` : ''}
        <tr>
          <td style="padding:0 34px 32px;">
            <h2 style="margin:0 0 8px;font-size:18px;line-height:1.35;color:#142235;">${escapeHtml(copy.nextTitle)}</h2>
            <p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#4d6072;">${escapeHtml(copy.nextBody)}</p>
            <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#5c7080;">${escapeHtml(copy.footer)}</p>
            <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#5c7080;">${escapeHtml(copy.referenceNote)}</p>
            <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#5c7080;">${escapeHtml(copy.termsBody)} <a href="${escapeAttribute(termsUrl)}" style="color:#005b8f;font-weight:800;">${escapeHtml(copy.termsLabel)}</a></p>
            <p style="margin:0;font-size:14px;line-height:1.55;color:#5c7080;">${escapeHtml(copy.support)}</p>
          </td>
        </tr>
      </table>
    </div>
  `
}

function renderProposalEmailText({ isSpanish, proposal, publicUrl }) {
  const customerName = text(proposal?.customer_name ?? proposal?.customerName)
  const firstName = customerName.split(/\s+/)[0]
  const lineItems = getLineItems(proposal)
  const reviewItems = getReviewItems(proposal, lineItems)
  const pricedItems = lineItems.filter((item) => !item.needsReview)
  const totals = getProposalTotals(proposal, pricedItems)
  const proposalReference = text(proposal?.id)
  const termsUrl = buildUrlFromPublicUrl(publicUrl, '/general-customer-terms')
  const customerNotes = getCustomerNotes(proposal)
  const lines = (pricedItems.length ? pricedItems : lineItems)
    .slice(0, 12)
    .map((item) => `- ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}${item.price ? ` (${item.price})` : ''}`)
    .join('\n')
  const reviewLines = reviewItems
    .slice(0, 8)
    .map((item) => `- ${item.name}`)
    .join('\n')

  if (isSpanish) {
    return [
      `Hola${firstName ? ` ${firstName}` : ''},`,
      '',
      'Tu propuesta CasaMia esta lista y el PDF completo va adjunto.',
      `Total estimado: ${formatEuro(totals.totalEstimate)}`,
      `Deposito estimado: ${formatEuro(totals.depositDue)}`,
      `Resto estimado: ${formatEuro(totals.balanceDue)}`,
      customerNotes ? `Notas para revision CasaMia:\n${customerNotes}\nCasaMia revisa estas notas antes de confirmar alcance final o cualquier abono.` : '',
      lines ? `Trabajos incluidos con precio:\n${lines}` : '',
      reviewLines ? `Extras que requieren mas informacion:\n${reviewLines}` : '',
      reviewLines ? 'CasaMia confirmara medidas, idoneidad y precio antes de anadir cualquier extra, y no lo anadira sin tu aprobacion.' : '',
      '',
      `Ver y pedir online: ${publicUrl}`,
      '',
      'Importes con IVA incluido. Sin costes ocultos. No se inicia ningun trabajo sin aprobacion del cliente.',
      proposalReference
        ? `Cuando contactes con CasaMia, menciona la referencia ${proposalReference}.`
        : 'Cuando contactes con CasaMia, menciona la referencia de tu propuesta.',
      `Terminos y condiciones: ${termsUrl}`,
      'Si necesitas ayuda, responde a este email o escribenos a hola@casamia.com.es.',
    ].filter(Boolean).join('\n')
  }

  return [
    `Hello${firstName ? ` ${firstName}` : ''},`,
    '',
    'Your CasaMia proposal is ready and the full PDF is attached.',
    `Total estimate: ${formatEuro(totals.totalEstimate)}`,
    `Estimated deposit: ${formatEuro(totals.depositDue)}`,
    `Estimated balance: ${formatEuro(totals.balanceDue)}`,
    customerNotes ? `Notes for CasaMia review:\n${customerNotes}\nCasaMia reviews these notes before confirming final scope or any credit.` : '',
    lines ? `Priced works included:\n${lines}` : '',
    reviewLines ? `Extras needing more information:\n${reviewLines}` : '',
    reviewLines ? 'CasaMia will confirm measurements, suitability and price before adding any extra, and will not add it without your approval.' : '',
    '',
    `View and order online: ${publicUrl}`,
    '',
    'Prices include VAT. No hidden fees. No work begins without customer approval.',
    proposalReference
      ? `When contacting CasaMia, please mention proposal reference ${proposalReference}.`
      : 'When contacting CasaMia, please mention your proposal reference.',
    `Terms & Conditions: ${termsUrl}`,
    'If you need help, reply to this email or write to hola@casamia.com.es.',
  ].filter(Boolean).join('\n')
}

function buildUrlFromPublicUrl(publicUrl, path) {
  try {
    return new URL(path, publicUrl).toString()
  } catch {
    return `https://www.casamia.com.es${path}`
  }
}
function renderLineItems(items, isSpanish) {
  if (!items.length) {
    return `<p style="margin:0;color:#4d6072;">${escapeHtml(isSpanish ? 'Paquetes seleccionados en tu propuesta.' : 'Selected packages are included in your proposal.')}</p>`
  }

  return `
    <div style="margin:0;">
      ${items.slice(0, 10).map((item) => `
        <div style="margin:0 0 14px;padding:14px;border:1px solid #dcecf5;border-radius:16px;background:#fbfdff;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="vertical-align:top;padding-right:12px;">
                <strong style="display:block;color:#142235;font-size:17px;line-height:1.25;">${escapeHtml(item.quantity > 1 ? `${item.quantity}x ${item.name}` : item.name)}</strong>
              </td>
              <td style="vertical-align:top;text-align:right;white-space:nowrap;">
                ${item.needsReview
                  ? `<span style="display:inline-block;border-radius:999px;background:#fff3df;color:#9a5a00;padding:6px 10px;font-size:12px;font-weight:800;">${escapeHtml(isSpanish ? 'Revisar' : 'Review')}</span>`
                  : item.price ? `<strong style="color:#142235;font-size:17px;">${escapeHtml(item.price)}</strong>` : ''}
              </td>
            </tr>
          </table>
          ${renderLineItemDescription(item, isSpanish)}
        </div>
      `).join('')}
    </div>
  `
}

function renderLineItemDescription(item, isSpanish) {
  const detail = splitPackageDescription(item.description, isSpanish)
  const summary = detail.summary || item.description
  const included = detail.included.slice(0, 6)
  const hiddenCount = Math.max(detail.included.length - included.length, 0)

  return `
    ${summary ? `<p style="margin:8px 0 0;color:#4d6072;font-size:14px;line-height:1.45;">${escapeHtml(summary)}</p>` : ''}
    ${included.length ? `
      <p style="margin:12px 0 6px;color:#238bc6;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;">${escapeHtml(isSpanish ? 'Alcance habitual' : 'Typical scope')}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${chunk(included, 2).map((row) => `
          <tr>
            ${row.map((label) => `
              <td style="padding:3px 8px 3px 0;width:50%;vertical-align:top;">
                <span style="display:block;border-radius:999px;background:#eef7fb;color:#142235;padding:7px 10px;font-size:13px;font-weight:700;line-height:1.2;">&#10003; ${escapeHtml(label)}</span>
              </td>
            `).join('')}
            ${row.length === 1 ? '<td style="width:50%;"></td>' : ''}
          </tr>
        `).join('')}
      </table>
      ${hiddenCount ? `<p style="margin:6px 0 0;color:#5c7080;font-size:13px;font-weight:700;">+${hiddenCount} ${escapeHtml(isSpanish ? 'mas en la propuesta adjunta' : 'more in the attached proposal')}</p>` : ''}
    ` : ''}
  `
}

function splitPackageDescription(description, isSpanish) {
  const value = text(description)
  if (!value) return { included: [], summary: '' }

  const marker = isSpanish ? /(?:Alcance habitual|Incluye):?\s*/i : /(?:Typical scope|Includes):?\s*/i
  const match = value.match(marker)

  if (!match || typeof match.index !== 'number') {
    return { included: [], summary: value }
  }

  const summary = value.slice(0, match.index).trim().replace(/[.:;,]+$/, '.')
  const includedText = value.slice(match.index + match[0].length).trim()
  const included = includedText
    .split(/\s*,\s*/)
    .map((label) => label.trim().replace(/[.;]+$/, ''))
    .filter(Boolean)

  return { included, summary }
}

function chunk(items, size) {
  const rows = []
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size))
  }
  return rows
}

function renderMetricRow(label, value) {
  return `
    <tr>
      <td style="padding:6px 0;color:#5c7080;font-weight:700;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;text-align:right;color:#142235;font-weight:800;">${escapeHtml(value || '-')}</td>
    </tr>
  `
}

function getLineItems(proposal) {
  const lineItems = Array.isArray(proposal?.line_items)
    ? proposal.line_items
    : Array.isArray(proposal?.lineItems)
      ? proposal.lineItems
      : []

  return lineItems.map((item) => {
    const quantity = Math.max(1, Math.floor(Number(item?.quantity ?? 1) || 1))
    const unitPrice = Number(item?.unit_price ?? item?.unitPrice ?? 0)
    const total = Number(item?.total ?? '') || unitPrice * quantity
    const needsReview = !Number.isFinite(unitPrice) || unitPrice <= 0

    return {
      description: text(item?.description),
      name: text(item?.name) || 'CasaMia package',
      needsReview,
      price: needsReview ? '' : formatEuro(total),
      quantity,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
    }
  })
}

function getReviewItems(proposal, lineItems = getLineItems(proposal)) {
  const reviewNames = Array.isArray(proposal?.plans_builder?.review_items)
    ? proposal.plans_builder.review_items.map(text).filter(Boolean)
    : Array.isArray(proposal?.plansBuilder?.reviewItems)
      ? proposal.plansBuilder.reviewItems.map(text).filter(Boolean)
      : []
  const byName = new Map()

  lineItems
    .filter((item) => item.needsReview)
    .forEach((item) => byName.set(item.name.toLowerCase(), item))

  reviewNames.forEach((name) => {
    const key = name.toLowerCase()
    if (!byName.has(key)) {
      byName.set(key, {
        description: '',
        name,
        needsReview: true,
        price: '',
        quantity: 1,
        unitPrice: 0,
      })
    }
  })

  return Array.from(byName.values())
}

function getCustomerNotes(proposal) {
  const notes = text(proposal?.notes ?? proposal?.plans_builder?.customer_notes ?? proposal?.plansBuilder?.customerNotes)
  const summary = text(proposal?.executive_summary ?? proposal?.executiveSummary)

  return notes && notes !== summary ? notes : ''
}

function getProposalTotals(proposal, pricedItems = []) {
  const computedSubtotal = pricedItems.reduce((sum, item) => {
    const unitPrice = Number(item.unitPrice)
    return sum + (Number.isFinite(unitPrice) ? unitPrice * item.quantity : 0)
  }, 0)
  const totalEstimate = number(
    proposal?.total_estimate ?? proposal?.totalEstimate ?? proposal?.total,
    computedSubtotal,
  )
  const depositDue = number(proposal?.deposit_due ?? proposal?.depositDue, totalEstimate * 0.5)
  const balanceDue = number(proposal?.balance_due ?? proposal?.balanceDue, Math.max(totalEstimate - depositDue, 0))

  return {
    balanceDue,
    depositDue,
    totalEstimate,
  }
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

function safeFilename(value) {
  return text(value)
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'proposal'
}

function number(value, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))

  return Number.isFinite(parsed) ? parsed : fallback
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
