import { buildAbsolutePublicUrl, sendTransactionalEmail } from './email.js'

export async function sendNewLeadEmails({ lead, request, env = process.env }) {
  const internalUrl = buildAbsolutePublicUrl(request, '/internal/leads', env)
  const publicUrls = {
    contact: buildAbsolutePublicUrl(request, '/contact', env),
    home: buildAbsolutePublicUrl(request, '/', env),
    legal: buildAbsolutePublicUrl(request, '/legal-notice', env),
    privacy: buildAbsolutePublicUrl(request, '/privacy-policy', env),
    terms: buildAbsolutePublicUrl(request, '/general-customer-terms', env),
  }
  const adminEmail = text(env.CASAMIA_LEADS_EMAIL || env.CASAMIA_NOTIFY_EMAIL)
  const language = getLanguage(lead)
  const copy = customerEmailCopy[language]
  const [admin, customer] = await Promise.all([
    sendTransactionalEmail({
      env,
      to: adminEmail,
      subject: `New CasaMia ${lead.sourceLabel.toLowerCase()} lead - ${text(lead.name) || 'Customer'}`,
      html: renderAdminLeadHtml(lead, internalUrl),
      text: renderAdminLeadText(lead, internalUrl),
    }),
    sendTransactionalEmail({
      env,
      to: lead.email,
      subject: copy.subject,
      html: renderCustomerConfirmationHtml(lead, copy, publicUrls),
      text: renderCustomerConfirmationText(lead, copy, publicUrls),
    }),
  ])

  return deliverySummary({ admin, customer })
}

export async function sendPartnerAssignmentEmail({ lead, env = process.env }) {
  const partnerUrl = buildAbsolutePublicUrl(undefined, '/partner', env)
  const partner = await sendTransactionalEmail({
    env,
    to: lead.assignedPartnerEmail,
    subject: `New CasaMia lead assignment - ${text(lead.name) || 'Customer'}`,
    html: renderPartnerAssignmentHtml(lead, partnerUrl),
    text: renderPartnerAssignmentText(lead, partnerUrl),
  })
  return deliverySummary({ partner })
}

export async function sendLeadReminderEmail({ leads, env = process.env }) {
  const internalUrl = buildAbsolutePublicUrl(undefined, '/internal/leads', env)
  const adminEmail = text(env.CASAMIA_LEADS_EMAIL || env.CASAMIA_NOTIFY_EMAIL)
  const reminder = await sendTransactionalEmail({
    env,
    to: adminEmail,
    subject: `${leads.length} CasaMia lead follow-up${leads.length === 1 ? '' : 's'} due`,
    html: renderReminderHtml(leads, internalUrl),
    text: renderReminderText(leads, internalUrl),
  })
  return deliverySummary({ reminder })
}

function renderAdminLeadHtml(lead, internalUrl) {
  return emailFrame(
    'New customer enquiry',
    `<p style="margin:0 0 18px;font-size:17px;line-height:1.55;color:#4d6072;">A new ${escapeHtml(lead.sourceLabel.toLowerCase())} lead has entered the CasaMia pipeline.</p>
     ${detailTable(lead)}
     ${button(internalUrl, 'Open lead pipeline')}`,
  )
}

function renderAdminLeadText(lead, internalUrl) {
  return [
    'New CasaMia customer enquiry',
    `Source: ${lead.sourceLabel}`,
    `Name: ${lead.name || 'Not provided'}`,
    `Phone: ${lead.phone || 'Not provided'}`,
    `Email: ${lead.email || 'Not provided'}`,
    `Area: ${lead.city || 'Not provided'}`,
    `Preferred time: ${lead.preferredAt || 'Not provided'}`,
    `Selected plan: ${lead.selectedPlan || 'Not provided'}`,
    `Message: ${lead.message || 'Not provided'}`,
    '',
    `Open lead pipeline: ${internalUrl}`,
  ].join('\n')
}

function renderCustomerConfirmationHtml(lead, copy, urls) {
  const firstName = text(lead.name).split(/\s+/)[0]
  const details = customerDetails(lead, copy)
  const rows = details.map(([label, value]) => `<tr><th style="padding:10px;text-align:left;vertical-align:top;background:#f2f9fd;border-bottom:1px solid #dcecf5;width:36%;">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #dcecf5;white-space:pre-line;">${escapeHtml(value)}</td></tr>`).join('')
  return emailFrame(
    copy.title,
    `<p style="margin:0 0 14px;font-size:17px;line-height:1.55;color:#4d6072;">${escapeHtml(copy.greeting)}${firstName ? ` ${escapeHtml(firstName)}` : ''},</p>
     <p style="margin:0 0 20px;font-size:17px;line-height:1.55;color:#4d6072;">${escapeHtml(copy.intro)}</p>
     <div style="margin:0;padding:18px 20px;background:#eff8e8;border:1px solid #b9de9d;border-radius:8px;">
       <h2 style="margin:0 0 8px;font-size:19px;color:#142235;">${escapeHtml(copy.nextTitle)}</h2>
       <p style="margin:0;font-size:15px;line-height:1.6;color:#4d6072;">${escapeHtml(copy.next)}</p>
     </div>
     <h2 style="margin:24px 0 8px;font-size:19px;color:#142235;">${escapeHtml(copy.aboutTitle)}</h2>
     <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4d6072;">${escapeHtml(copy.about)}</p>
     <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4d6072;">${escapeHtml(copy.contact)} <a href="mailto:hola@casamia.com.es" style="color:#0f6286;font-weight:700;">hola@casamia.com.es</a>.</p>
     <h2 style="margin:24px 0 10px;font-size:20px;color:#142235;">${escapeHtml(copy.summary)}</h2>
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;border-collapse:collapse;border:1px solid #dcecf5;">${rows}</table>
     <div style="padding-top:18px;border-top:1px solid #dcecf5;font-size:12px;line-height:1.6;color:#687b8b;">
       <p style="margin:0 0 8px;">${escapeHtml(copy.privacy)}</p>
       <p style="margin:0;"><a href="${escapeHtml(urls.home)}" style="color:#0f6286;">CasaMia</a> &nbsp;|&nbsp; <a href="${escapeHtml(urls.contact)}" style="color:#0f6286;">${escapeHtml(copy.contactLink)}</a> &nbsp;|&nbsp; <a href="${escapeHtml(urls.privacy)}" style="color:#0f6286;">${escapeHtml(copy.privacyLink)}</a> &nbsp;|&nbsp; <a href="${escapeHtml(urls.legal)}" style="color:#0f6286;">${escapeHtml(copy.legalLink)}</a> &nbsp;|&nbsp; <a href="${escapeHtml(urls.terms)}" style="color:#0f6286;">${escapeHtml(copy.termsLink)}</a></p>
     </div>`,
  )
}

function renderCustomerConfirmationText(lead, copy, urls) {
  const firstName = text(lead.name).split(/\s+/)[0]
  return [
    `${copy.greeting}${firstName ? ` ${firstName}` : ''},`, '', copy.intro,
    '', copy.nextTitle, copy.next, '', copy.aboutTitle, copy.about, '',
    `${copy.contact} hola@casamia.com.es.`, '', copy.summary,
    ...customerDetails(lead, copy).map(([label, value]) => `${label}: ${value}`),
    '', copy.privacy,
    `${copy.contactLink}: ${urls.contact}`,
    `${copy.privacyLink}: ${urls.privacy}`,
    `${copy.legalLink}: ${urls.legal}`,
    `${copy.termsLink}: ${urls.terms}`,
  ].join('\n')
}

function customerDetails(lead, copy) {
  return [
    [copy.type, lead.sourceLabel === 'Callback' ? copy.callback : copy.assessment],
    [copy.area, text(lead.city) || copy.notProvided],
    [copy.preferred, text(lead.preferredAt) || copy.notProvided],
    ...(text(lead.selectedPlan) ? [[copy.plan, text(lead.selectedPlan)]] : []),
    ...(text(lead.message) ? [[copy.message, text(lead.message)]] : []),
  ]
}

function renderPartnerAssignmentHtml(lead, partnerUrl) {
  return emailFrame(
    'New lead assigned to you',
    `<p style="margin:0 0 18px;font-size:17px;line-height:1.55;color:#4d6072;">CasaMia assigned a customer lead to your partner workspace.</p>
     ${detailTable({ ...lead, message: lead.partnerNotes || lead.message })}
     ${button(partnerUrl, 'Open partner workspace')}`,
  )
}

function renderPartnerAssignmentText(lead, partnerUrl) {
  return [
    'CasaMia assigned a customer lead to you.',
    `Name: ${lead.name || 'Not provided'}`,
    `Phone: ${lead.phone || 'Not provided'}`,
    `Email: ${lead.email || 'Not provided'}`,
    `Area: ${lead.city || 'Not provided'}`,
    `Instructions: ${lead.partnerNotes || 'None'}`,
    '',
    `Open partner workspace: ${partnerUrl}`,
  ].join('\n')
}

function renderReminderHtml(leads, internalUrl) {
  const rows = leads.map((lead) => `<tr><td style="padding:10px;border-bottom:1px solid #dcecf5;"><strong>${escapeHtml(lead.name || 'Customer')}</strong><br><span style="color:#5c7080;">${escapeHtml(lead.phone || lead.email || 'No contact')}</span></td><td style="padding:10px;border-bottom:1px solid #dcecf5;">${escapeHtml(formatDate(lead.followUpAt))}</td><td style="padding:10px;border-bottom:1px solid #dcecf5;">${escapeHtml(lead.status)}</td></tr>`).join('')
  return emailFrame(
    'Lead follow-ups due',
    `<p style="margin:0 0 18px;font-size:17px;color:#4d6072;">${leads.length} open lead${leads.length === 1 ? ' needs' : 's need'} attention.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #dcecf5;">${rows}</table>${button(internalUrl, 'Review follow-ups')}`,
  )
}

function renderReminderText(leads, internalUrl) {
  return ['CasaMia lead follow-ups due', '', ...leads.map((lead) => `- ${lead.name || 'Customer'} | ${lead.phone || lead.email || 'No contact'} | ${formatDate(lead.followUpAt)} | ${lead.status}`), '', `Review follow-ups: ${internalUrl}`].join('\n')
}

function detailTable(lead) {
  const details = [
    ['Name', lead.name], ['Phone', lead.phone], ['Email', lead.email], ['Area', lead.city],
    ['Preferred time', lead.preferredAt], ['Selected plan', lead.selectedPlan], ['Message', lead.message],
  ]
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #dcecf5;">${details.map(([label, value]) => `<tr><th style="padding:10px;text-align:left;background:#f2f9fd;border-bottom:1px solid #dcecf5;width:34%;">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #dcecf5;">${escapeHtml(value || 'Not provided')}</td></tr>`).join('')}</table>`
}

function emailFrame(title, content) {
  return `<div style="margin:0;background:#eef7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#142235;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #c9e1ef;"><tr><td style="padding:28px 32px 16px;font-size:32px;font-weight:800;color:#102033;">Casa<span style="color:#37a4dc;">Mia</span></td></tr><tr><td style="padding:0 32px 32px;"><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:36px;line-height:1.08;">${escapeHtml(title)}</h1>${content}</td></tr></table></div>`
}

function button(url, label) {
  return `<p style="margin:22px 0 0;"><a href="${escapeHtml(url)}" style="display:inline-block;background:#7bbf3b;color:#fff;text-decoration:none;font-weight:800;border-radius:999px;padding:14px 22px;">${escapeHtml(label)}</a></p>`
}

function deliverySummary(deliveries) {
  return { attemptedAt: new Date().toISOString(), ...deliveries }
}

function getLanguage(lead) {
  const language = text(lead.locale).toLowerCase().split(/[-_]/)[0]
  return Object.hasOwn(customerEmailCopy, language) ? language : 'en'
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(date)
}

function text(value) { return typeof value === 'string' ? value.trim() : '' }
function escapeHtml(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') }

const customerEmailCopy = Object.freeze({
  en: {
    subject: 'We received your CasaMia request', title: 'We received your request', greeting: 'Hello',
    intro: 'Thank you for taking the time to tell us what you need. We know that making changes at home can feel like a big decision, and we are here to make the next steps clear, practical and comfortable for you.',
    summary: 'Your request summary', type: 'Request type', callback: 'Callback request', assessment: 'Home safety assessment', area: 'City / area', preferred: 'Preferred date or time', plan: 'Selected option', message: 'Your message', notProvided: 'Not provided',
    nextTitle: 'What happens next', next: 'A CasaMia team member will contact you using the details you provided to understand your needs, confirm availability and explain any costs before you commit to a visit or installation.',
    aboutTitle: 'About CasaMia', about: 'CasaMia helps older adults and families make homes safer and easier to live in through practical assessments, accessibility adaptations, installation support and guidance on relevant public grants.',
    contact: 'To add information or ask a question, reply to this email or contact us at', privacy: 'We use your information only to handle your enquiry, contact you about the requested service and meet our legal obligations. Please see our Privacy Policy for full details.',
    contactLink: 'Contact', privacyLink: 'Privacy Policy', legalLink: 'Legal Notice', termsLink: 'Customer Terms',
  },
  es: {
    subject: 'Hemos recibido tu solicitud CasaMia', title: 'Hemos recibido tu solicitud', greeting: 'Hola',
    intro: 'Gracias por dedicar unos minutos a contarnos lo que necesitas. Sabemos que hacer cambios en casa puede ser una decisión importante y estamos aquí para que los próximos pasos sean claros, prácticos y cómodos para ti.',
    summary: 'Resumen de tu solicitud', type: 'Tipo de solicitud', callback: 'Solicitud de llamada', assessment: 'Evaluación de seguridad del hogar', area: 'Ciudad / zona', preferred: 'Fecha u hora preferida', plan: 'Opción seleccionada', message: 'Tu mensaje', notProvided: 'No indicado',
    nextTitle: 'Qué ocurre ahora', next: 'Una persona del equipo de CasaMia se pondrá en contacto contigo usando los datos facilitados para entender tus necesidades, confirmar la disponibilidad y explicar cualquier coste antes de que aceptes una visita o instalación.',
    aboutTitle: 'Sobre CasaMia', about: 'CasaMia ayuda a personas mayores y familias a adaptar sus hogares para que sean más seguros y cómodos mediante evaluaciones prácticas, mejoras de accesibilidad, apoyo con la instalación y orientación sobre ayudas públicas aplicables.',
    contact: 'Para añadir información o hacer una consulta, responde a este correo o escríbenos a', privacy: 'Usamos tus datos únicamente para gestionar tu consulta, contactarte sobre el servicio solicitado y cumplir nuestras obligaciones legales. Consulta nuestra Política de privacidad para obtener toda la información.',
    contactLink: 'Contacto', privacyLink: 'Política de privacidad', legalLink: 'Aviso legal', termsLink: 'Condiciones para clientes',
  },
  de: {
    subject: 'Wir haben Ihre CasaMia-Anfrage erhalten', title: 'Wir haben Ihre Anfrage erhalten', greeting: 'Hallo',
    intro: 'Vielen Dank, dass Sie sich die Zeit genommen haben, uns Ihren Bedarf mitzuteilen. Veränderungen zu Hause können eine wichtige Entscheidung sein. Wir helfen Ihnen dabei, die nächsten Schritte klar, praktisch und angenehm zu gestalten.',
    summary: 'Zusammenfassung Ihrer Anfrage', type: 'Art der Anfrage', callback: 'Rückrufanfrage', assessment: 'Sicherheitsbewertung für Ihr Zuhause', area: 'Stadt / Region', preferred: 'Bevorzugtes Datum oder Uhrzeit', plan: 'Gewählte Option', message: 'Ihre Nachricht', notProvided: 'Nicht angegeben',
    nextTitle: 'Wie es weitergeht', next: 'Ein Mitglied des CasaMia-Teams wird Sie über die angegebenen Kontaktdaten erreichen, um Ihren Bedarf zu verstehen, die Verfügbarkeit zu bestätigen und alle Kosten zu erklären, bevor Sie einem Besuch oder einer Installation zustimmen.',
    aboutTitle: 'Über CasaMia', about: 'CasaMia unterstützt ältere Menschen und Familien dabei, ihr Zuhause sicherer und komfortabler zu gestalten: mit praktischen Bewertungen, barrierearmen Anpassungen, Installationshilfe und Orientierung zu passenden öffentlichen Förderungen.',
    contact: 'Um Informationen zu ergänzen oder eine Frage zu stellen, antworten Sie auf diese E-Mail oder schreiben Sie an', privacy: 'Wir verwenden Ihre Daten nur zur Bearbeitung Ihrer Anfrage, zur Kontaktaufnahme bezüglich der gewünschten Leistung und zur Erfüllung gesetzlicher Pflichten. Weitere Informationen finden Sie in unserer Datenschutzerklärung.',
    contactLink: 'Kontakt', privacyLink: 'Datenschutzerklärung', legalLink: 'Impressum', termsLink: 'Kundenbedingungen',
  },
  fr: {
    subject: 'Nous avons reçu votre demande CasaMia', title: 'Nous avons reçu votre demande', greeting: 'Bonjour',
    intro: 'Merci d’avoir pris le temps de nous expliquer vos besoins. Nous savons que modifier son logement peut être une décision importante. Notre rôle est de rendre les prochaines étapes claires, pratiques et rassurantes pour vous.',
    summary: 'Récapitulatif de votre demande', type: 'Type de demande', callback: 'Demande de rappel', assessment: 'Évaluation de la sécurité du domicile', area: 'Ville / zone', preferred: 'Date ou heure souhaitée', plan: 'Option sélectionnée', message: 'Votre message', notProvided: 'Non renseigné',
    nextTitle: 'Prochaine étape', next: 'Un membre de l’équipe CasaMia vous contactera avec les coordonnées fournies afin de comprendre vos besoins, confirmer les disponibilités et expliquer les coûts éventuels avant tout engagement pour une visite ou une installation.',
    aboutTitle: 'À propos de CasaMia', about: 'CasaMia aide les personnes âgées et leurs familles à rendre leur logement plus sûr et plus confortable grâce à des évaluations pratiques, des adaptations d’accessibilité, une assistance à l’installation et des conseils sur les aides publiques disponibles.',
    contact: 'Pour ajouter des informations ou poser une question, répondez à cet e-mail ou écrivez-nous à', privacy: 'Nous utilisons vos données uniquement pour traiter votre demande, vous contacter au sujet du service demandé et respecter nos obligations légales. Consultez notre Politique de confidentialité pour en savoir plus.',
    contactLink: 'Contact', privacyLink: 'Politique de confidentialité', legalLink: 'Mentions légales', termsLink: 'Conditions clients',
  },
  nl: {
    subject: 'We hebben uw CasaMia-aanvraag ontvangen', title: 'We hebben uw aanvraag ontvangen', greeting: 'Hallo',
    intro: 'Bedankt dat u de tijd hebt genomen om ons te vertellen wat u nodig hebt. Aanpassingen in huis kunnen een belangrijke beslissing zijn. Wij helpen u om de volgende stappen duidelijk, praktisch en prettig te maken.',
    summary: 'Samenvatting van uw aanvraag', type: 'Type aanvraag', callback: 'Terugbelverzoek', assessment: 'Veiligheidsbeoordeling van de woning', area: 'Plaats / regio', preferred: 'Voorkeursdatum of -tijd', plan: 'Geselecteerde optie', message: 'Uw bericht', notProvided: 'Niet opgegeven',
    nextTitle: 'Wat gebeurt er nu', next: 'Een medewerker van CasaMia neemt contact met u op via de opgegeven gegevens om uw behoeften te bespreken, de beschikbaarheid te bevestigen en eventuele kosten uit te leggen voordat u instemt met een bezoek of installatie.',
    aboutTitle: 'Over CasaMia', about: 'CasaMia helpt ouderen en families om woningen veiliger en comfortabeler te maken met praktische beoordelingen, toegankelijkheidsaanpassingen, installatieondersteuning en advies over relevante overheidssubsidies.',
    contact: 'Wilt u informatie toevoegen of een vraag stellen, beantwoord dan deze e-mail of neem contact met ons op via', privacy: 'Wij gebruiken uw gegevens alleen om uw aanvraag te behandelen, contact met u op te nemen over de gevraagde dienst en aan onze wettelijke verplichtingen te voldoen. Lees ons Privacybeleid voor meer informatie.',
    contactLink: 'Contact', privacyLink: 'Privacybeleid', legalLink: 'Juridische kennisgeving', termsLink: 'Klantvoorwaarden',
  },
})
