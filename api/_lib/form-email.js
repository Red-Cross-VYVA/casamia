import { buildAbsolutePublicUrl, sendTransactionalEmail } from './email.js'

const supportedLocales = new Set(['en', 'es', 'de', 'fr', 'nl'])

export async function sendFormSubmissionEmails({
  details = [],
  env = process.env,
  kind = 'contact',
  locale = 'en',
  name = '',
  recipient = '',
  reference = '',
  request,
} = {}) {
  const language = normalizeLocale(locale)
  const copy = getCopy(language, kind)
  const urls = {
    contact: buildAbsolutePublicUrl(request, '/why-us#contact-form', env),
    legal: buildAbsolutePublicUrl(request, '/legal-notice', env),
    privacy: buildAbsolutePublicUrl(request, '/privacy-policy', env),
    terms: buildAbsolutePublicUrl(request, '/general-customer-terms', env),
  }
  const normalizedDetails = details
    .map((detail) => ({ label: text(detail?.label), value: text(detail?.value) }))
    .filter((detail) => detail.label && detail.value)
  const adminEmail = text(env.CASAMIA_LEADS_EMAIL || env.CASAMIA_NOTIFY_EMAIL)

  const [admin, customer] = await Promise.all([
    sendTransactionalEmail({
      env,
      html: renderAdminHtml({ copy, details: normalizedDetails, kind, name, reference }),
      subject: `New CasaMia ${kindLabel(kind)} - ${text(name) || 'Customer'}`,
      text: renderAdminText({ copy, details: normalizedDetails, kind, name, reference }),
      to: adminEmail,
    }),
    sendTransactionalEmail({
      env,
      html: renderCustomerHtml({ copy, details: normalizedDetails, name, reference, urls }),
      subject: copy.subject,
      text: renderCustomerText({ copy, details: normalizedDetails, name, reference, urls }),
      to: recipient,
    }),
  ])

  return {
    admin,
    attemptedAt: new Date().toISOString(),
    customer,
  }
}

function renderCustomerHtml({ copy, details, name, reference, urls }) {
  const firstName = text(name).split(/\s+/)[0]
  const rows = [
    ...(reference ? [{ label: copy.reference, value: reference }] : []),
    ...details,
  ].map(({ label, value }) => `<tr><th style="padding:10px;text-align:left;vertical-align:top;background:#f2f9fd;border-bottom:1px solid #dcecf5;width:36%;">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #dcecf5;white-space:pre-line;">${escapeHtml(value)}</td></tr>`).join('')

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
       <p style="margin:0;"><a href="${escapeHtml(urls.contact)}" style="color:#0f6286;">${escapeHtml(copy.contactLink)}</a> &nbsp;|&nbsp; <a href="${escapeHtml(urls.privacy)}" style="color:#0f6286;">${escapeHtml(copy.privacyLink)}</a> &nbsp;|&nbsp; <a href="${escapeHtml(urls.legal)}" style="color:#0f6286;">${escapeHtml(copy.legalLink)}</a> &nbsp;|&nbsp; <a href="${escapeHtml(urls.terms)}" style="color:#0f6286;">${escapeHtml(copy.termsLink)}</a></p>
     </div>`,
  )
}

function renderCustomerText({ copy, details, name, reference, urls }) {
  const firstName = text(name).split(/\s+/)[0]
  return [
    `${copy.greeting}${firstName ? ` ${firstName}` : ''},`, '', copy.intro,
    '', copy.nextTitle, copy.next, '', copy.aboutTitle, copy.about,
    '', `${copy.contact} hola@casamia.com.es.`, '', copy.summary,
    ...(reference ? [`${copy.reference}: ${reference}`] : []),
    ...details.map(({ label, value }) => `${label}: ${value}`),
    '', copy.privacy,
    `${copy.contactLink}: ${urls.contact}`,
    `${copy.privacyLink}: ${urls.privacy}`,
    `${copy.legalLink}: ${urls.legal}`,
    `${copy.termsLink}: ${urls.terms}`,
  ].join('\n')
}

function renderAdminHtml({ copy, details, kind, name, reference }) {
  const rows = [
    { label: 'Type', value: kindLabel(kind) },
    { label: 'Name', value: text(name) || 'Not provided' },
    ...(reference ? [{ label: 'Reference', value: reference }] : []),
    ...details,
  ].map(({ label, value }) => `<tr><th style="padding:10px;text-align:left;vertical-align:top;background:#f2f9fd;border-bottom:1px solid #dcecf5;width:34%;">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #dcecf5;white-space:pre-line;">${escapeHtml(value)}</td></tr>`).join('')

  return emailFrame(
    'New customer submission',
    `<p style="margin:0 0 18px;font-size:17px;line-height:1.55;color:#4d6072;">A new ${escapeHtml(kindLabel(kind))} was stored by CasaMia.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #dcecf5;">${rows}</table><p style="margin:18px 0 0;color:#687b8b;font-size:13px;">Customer confirmation language: ${escapeHtml(copy.languageName)}</p>`,
  )
}

function renderAdminText({ copy, details, kind, name, reference }) {
  return [
    'New CasaMia customer submission',
    `Type: ${kindLabel(kind)}`,
    `Name: ${text(name) || 'Not provided'}`,
    ...(reference ? [`Reference: ${reference}`] : []),
    ...details.map(({ label, value }) => `${label}: ${value}`),
    `Customer confirmation language: ${copy.languageName}`,
  ].join('\n')
}

function emailFrame(title, content) {
  return `<div style="margin:0;background:#eef7fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#142235;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #c9e1ef;"><tr><td style="padding:28px 32px 16px;font-size:32px;font-weight:800;color:#102033;">Casa<span style="color:#37a4dc;">Mia</span></td></tr><tr><td style="padding:0 32px 32px;"><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:36px;line-height:1.08;">${escapeHtml(title)}</h1>${content}</td></tr></table></div>`
}

function getCopy(locale, kind) {
  const base = baseCopy[locale] ?? baseCopy.en
  const kindCopy = base.kinds[kind] ?? base.kinds.contact
  return { ...base, ...kindCopy }
}

export function normalizeEmailLocale(value) {
  const locale = text(value).toLowerCase().split(/[-_]/)[0]
  return supportedLocales.has(locale) ? locale : 'en'
}

const normalizeLocale = normalizeEmailLocale

function kindLabel(kind) {
  return ({ booking: 'booking request', complaint: 'complaint', contact: 'contact request', provider: 'provider application', quote: 'quote request' })[kind] ?? 'contact request'
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

const sharedEnglish = {
  aboutTitle: 'About CasaMia',
  about: 'CasaMia helps older adults and families make homes safer and easier to live in through practical assessments, accessibility adaptations and coordinated installation support.',
  contact: 'To add information or ask a question, reply to this email or contact us at',
  contactLink: 'Contact',
  greeting: 'Hello',
  languageName: 'English',
  legalLink: 'Legal Notice',
  privacy: 'We use your information only to handle your request, contact you about the requested service and meet our legal obligations. Please see our Privacy Policy for full details.',
  privacyLink: 'Privacy Policy',
  reference: 'Reference',
  summary: 'Information you submitted',
  termsLink: 'Customer Terms',
}

const sharedSpanish = {
  aboutTitle: 'Sobre CasaMia',
  about: 'CasaMia ayuda a personas mayores y familias a adaptar sus hogares para que sean más seguros y cómodos mediante evaluaciones prácticas, mejoras de accesibilidad y apoyo coordinado con la instalación.',
  contact: 'Para añadir información o hacer una consulta, responde a este correo o escríbenos a',
  contactLink: 'Contacto',
  greeting: 'Hola',
  languageName: 'Spanish',
  legalLink: 'Aviso legal',
  privacy: 'Usamos tus datos únicamente para gestionar tu solicitud, contactarte sobre el servicio solicitado y cumplir nuestras obligaciones legales. Consulta nuestra Política de privacidad para obtener toda la información.',
  privacyLink: 'Política de privacidad',
  reference: 'Referencia',
  summary: 'Información que nos has enviado',
  termsLink: 'Condiciones para clientes',
}

const sharedGerman = {
  aboutTitle: 'Über CasaMia',
  about: 'CasaMia hilft älteren Menschen und Familien, ihr Zuhause durch praktische Bewertungen, barrierearme Anpassungen und koordinierte Installationsunterstützung sicherer und komfortabler zu machen.',
  contact: 'Wenn Sie Informationen ergänzen oder eine Frage stellen möchten, antworten Sie auf diese E-Mail oder schreiben Sie an',
  contactLink: 'Kontakt',
  greeting: 'Hallo',
  languageName: 'German',
  legalLink: 'Impressum',
  privacy: 'Wir verwenden Ihre Daten nur zur Bearbeitung Ihrer Anfrage, zur Kontaktaufnahme bezüglich der gewünschten Leistung und zur Erfüllung unserer gesetzlichen Pflichten. Weitere Informationen finden Sie in unserer Datenschutzerklärung.',
  privacyLink: 'Datenschutzerklärung',
  reference: 'Referenz',
  summary: 'Ihre übermittelten Angaben',
  termsLink: 'Kundenbedingungen',
}

const sharedFrench = {
  aboutTitle: 'À propos de CasaMia',
  about: 'CasaMia aide les personnes âgées et leurs familles à rendre leur logement plus sûr et plus confortable grâce à des évaluations pratiques, des adaptations d’accessibilité et une assistance coordonnée à l’installation.',
  contact: 'Pour ajouter des informations ou poser une question, répondez à cet e-mail ou écrivez-nous à',
  contactLink: 'Contact',
  greeting: 'Bonjour',
  languageName: 'French',
  legalLink: 'Mentions légales',
  privacy: 'Nous utilisons vos données uniquement pour traiter votre demande, vous contacter au sujet du service demandé et respecter nos obligations légales. Consultez notre Politique de confidentialité pour en savoir plus.',
  privacyLink: 'Politique de confidentialité',
  reference: 'Référence',
  summary: 'Informations que vous avez fournies',
  termsLink: 'Conditions clients',
}

const sharedDutch = {
  aboutTitle: 'Over CasaMia',
  about: 'CasaMia helpt ouderen en families om woningen veiliger en comfortabeler te maken met praktische beoordelingen, toegankelijkheidsaanpassingen en gecoördineerde installatieondersteuning.',
  contact: 'Wilt u informatie toevoegen of een vraag stellen, beantwoord dan deze e-mail of schrijf naar',
  contactLink: 'Contact',
  greeting: 'Hallo',
  languageName: 'Dutch',
  legalLink: 'Juridische kennisgeving',
  privacy: 'Wij gebruiken uw gegevens alleen om uw aanvraag te behandelen, contact met u op te nemen over de gevraagde dienst en aan onze wettelijke verplichtingen te voldoen. Lees ons Privacybeleid voor meer informatie.',
  privacyLink: 'Privacybeleid',
  reference: 'Referentie',
  summary: 'Door u ingediende informatie',
  termsLink: 'Klantvoorwaarden',
}

const baseCopy = {
  en: {
    ...sharedEnglish,
    kinds: {
      booking: { subject: 'We received your CasaMia booking request', title: 'Your visit request is recorded', intro: 'Thank you for asking CasaMia to help with your home. We have securely recorded your visit request.', nextTitle: 'What happens next', next: 'A CasaMia coordinator will review the selected work, contact details and property information, then contact you to confirm availability and any payment required before a visit is booked.' },
      complaint: { subject: 'We received your CasaMia complaint', title: 'Your complaint is recorded', intro: 'Thank you for telling us what happened. We take service and safety concerns seriously and have securely recorded your complaint.', nextTitle: 'What happens next', next: 'CasaMia will review the information and contact you about the next step. If the issue presents an immediate danger, stop using the affected installation and call 112 in an emergency.' },
      contact: { subject: 'We received your CasaMia message', title: 'We received your message', intro: 'Thank you for contacting CasaMia. We have securely recorded your message and the information you provided.', nextTitle: 'What happens next', next: 'A CasaMia team member will review your request and contact you using the details provided.' },
      provider: { subject: 'We received your CasaMia provider application', title: 'Your provider application is recorded', intro: 'Thank you for your interest in working with CasaMia. We have securely recorded your business and coverage information.', nextTitle: 'What happens next', next: 'The CasaMia team will review your services, locations, availability and supporting information, then contact you if the application is suitable for the next stage.' },
      quote: { subject: 'We received your CasaMia quote request', title: 'Your quote request is recorded', intro: 'Thank you for sharing the improvements you are considering. We have securely recorded your CasaMia configuration.', nextTitle: 'What happens next', next: 'A CasaMia coordinator will review the selected work and any items that require measurements or confirmation, then contact you before any commitment or payment is required.' },
    },
  },
  es: {
    ...sharedSpanish,
    kinds: {
      booking: { subject: 'Hemos recibido tu solicitud de visita CasaMia', title: 'Tu solicitud de visita está registrada', intro: 'Gracias por pedir ayuda a CasaMia para tu vivienda. Hemos registrado de forma segura tu solicitud de visita.', nextTitle: 'Qué ocurre ahora', next: 'Una persona coordinadora de CasaMia revisará los trabajos seleccionados, los datos de contacto y la información de la vivienda. Después te contactará para confirmar disponibilidad y cualquier pago necesario antes de reservar la visita.' },
      complaint: { subject: 'Hemos recibido tu reclamación CasaMia', title: 'Tu reclamación está registrada', intro: 'Gracias por contarnos lo sucedido. Nos tomamos en serio las incidencias de servicio y seguridad y hemos registrado tu reclamación de forma segura.', nextTitle: 'Qué ocurre ahora', next: 'CasaMia revisará la información y se pondrá en contacto contigo para explicarte el siguiente paso. Si existe un peligro inmediato, deja de usar la instalación afectada y llama al 112 en caso de emergencia.' },
      contact: { subject: 'Hemos recibido tu mensaje CasaMia', title: 'Hemos recibido tu mensaje', intro: 'Gracias por contactar con CasaMia. Hemos registrado de forma segura tu mensaje y la información facilitada.', nextTitle: 'Qué ocurre ahora', next: 'Una persona del equipo CasaMia revisará tu solicitud y se pondrá en contacto contigo usando los datos facilitados.' },
      provider: { subject: 'Hemos recibido tu solicitud de proveedor CasaMia', title: 'Tu solicitud de proveedor está registrada', intro: 'Gracias por tu interés en colaborar con CasaMia. Hemos registrado de forma segura la información de tu empresa y cobertura.', nextTitle: 'Qué ocurre ahora', next: 'El equipo CasaMia revisará tus servicios, zonas, disponibilidad y documentación. Después se pondrá en contacto contigo si la solicitud encaja con la siguiente fase.' },
      quote: { subject: 'Hemos recibido tu solicitud de presupuesto CasaMia', title: 'Tu solicitud de presupuesto está registrada', intro: 'Gracias por compartir las mejoras que estás valorando. Hemos registrado de forma segura tu configuración CasaMia.', nextTitle: 'Qué ocurre ahora', next: 'Una persona coordinadora de CasaMia revisará los trabajos seleccionados y cualquier partida que requiera medidas o confirmación. Después te contactará antes de que exista cualquier compromiso o pago.' },
    },
  },
  de: {
    ...sharedGerman,
    kinds: {
      booking: { subject: 'Wir haben Ihre CasaMia-Besuchsanfrage erhalten', title: 'Ihre Besuchsanfrage wurde erfasst', intro: 'Vielen Dank, dass Sie CasaMia um Unterstützung für Ihr Zuhause gebeten haben. Wir haben Ihre Besuchsanfrage sicher erfasst.', nextTitle: 'Wie es weitergeht', next: 'Eine CasaMia-Koordinatorin oder ein CasaMia-Koordinator prüft die ausgewählten Arbeiten, Kontaktdaten und Angaben zur Immobilie. Anschließend kontaktieren wir Sie, um die Verfügbarkeit und eine gegebenenfalls erforderliche Zahlung zu bestätigen, bevor der Besuch gebucht wird.' },
      complaint: { subject: 'Wir haben Ihre CasaMia-Beschwerde erhalten', title: 'Ihre Beschwerde wurde erfasst', intro: 'Vielen Dank, dass Sie uns über den Vorfall informiert haben. Wir nehmen Service- und Sicherheitsbedenken ernst und haben Ihre Beschwerde sicher erfasst.', nextTitle: 'Wie es weitergeht', next: 'CasaMia prüft die Angaben und kontaktiert Sie zum weiteren Vorgehen. Bei unmittelbarer Gefahr verwenden Sie die betroffene Installation nicht weiter und rufen Sie im Notfall die 112 an.' },
      contact: { subject: 'Wir haben Ihre CasaMia-Nachricht erhalten', title: 'Wir haben Ihre Nachricht erhalten', intro: 'Vielen Dank für Ihre Kontaktaufnahme mit CasaMia. Wir haben Ihre Nachricht und die übermittelten Angaben sicher erfasst.', nextTitle: 'Wie es weitergeht', next: 'Ein Mitglied des CasaMia-Teams prüft Ihre Anfrage und kontaktiert Sie über die angegebenen Kontaktdaten.' },
      provider: { subject: 'Wir haben Ihre CasaMia-Partnerbewerbung erhalten', title: 'Ihre Partnerbewerbung wurde erfasst', intro: 'Vielen Dank für Ihr Interesse an einer Zusammenarbeit mit CasaMia. Wir haben Ihre Unternehmens- und Einsatzgebietsdaten sicher erfasst.', nextTitle: 'Wie es weitergeht', next: 'Das CasaMia-Team prüft Ihre Leistungen, Einsatzorte, Verfügbarkeit und Unterlagen und kontaktiert Sie, wenn Ihre Bewerbung für die nächste Phase geeignet ist.' },
      quote: { subject: 'Wir haben Ihre CasaMia-Angebotsanfrage erhalten', title: 'Ihre Angebotsanfrage wurde erfasst', intro: 'Vielen Dank für die Angaben zu den geplanten Verbesserungen. Wir haben Ihre CasaMia-Konfiguration sicher erfasst.', nextTitle: 'Wie es weitergeht', next: 'Eine CasaMia-Koordinatorin oder ein CasaMia-Koordinator prüft die ausgewählten Arbeiten und alle Positionen, die Maße oder eine Bestätigung erfordern. Wir kontaktieren Sie, bevor eine Verpflichtung oder Zahlung erforderlich wird.' },
    },
  },
  fr: {
    ...sharedFrench,
    kinds: {
      booking: { subject: 'Nous avons reçu votre demande de visite CasaMia', title: 'Votre demande de visite est enregistrée', intro: 'Merci d’avoir demandé l’aide de CasaMia pour votre logement. Nous avons enregistré votre demande de visite de manière sécurisée.', nextTitle: 'Prochaine étape', next: 'Un coordinateur CasaMia examinera les travaux sélectionnés, vos coordonnées et les informations sur le logement, puis vous contactera pour confirmer les disponibilités et tout paiement requis avant la réservation de la visite.' },
      complaint: { subject: 'Nous avons reçu votre réclamation CasaMia', title: 'Votre réclamation est enregistrée', intro: 'Merci de nous avoir expliqué ce qui s’est passé. Nous prenons les problèmes de service et de sécurité au sérieux et avons enregistré votre réclamation de manière sécurisée.', nextTitle: 'Prochaine étape', next: 'CasaMia examinera les informations et vous contactera au sujet de la suite. En cas de danger immédiat, cessez d’utiliser l’installation concernée et appelez le 112 en cas d’urgence.' },
      contact: { subject: 'Nous avons reçu votre message CasaMia', title: 'Nous avons reçu votre message', intro: 'Merci d’avoir contacté CasaMia. Nous avons enregistré votre message et les informations fournies de manière sécurisée.', nextTitle: 'Prochaine étape', next: 'Un membre de l’équipe CasaMia examinera votre demande et vous contactera avec les coordonnées fournies.' },
      provider: { subject: 'Nous avons reçu votre candidature de partenaire CasaMia', title: 'Votre candidature est enregistrée', intro: 'Merci de votre intérêt pour une collaboration avec CasaMia. Nous avons enregistré les informations sur votre entreprise et votre zone d’intervention de manière sécurisée.', nextTitle: 'Prochaine étape', next: 'L’équipe CasaMia examinera vos services, zones, disponibilités et justificatifs, puis vous contactera si votre candidature convient à l’étape suivante.' },
      quote: { subject: 'Nous avons reçu votre demande de devis CasaMia', title: 'Votre demande de devis est enregistrée', intro: 'Merci de nous avoir indiqué les améliorations que vous envisagez. Nous avons enregistré votre configuration CasaMia de manière sécurisée.', nextTitle: 'Prochaine étape', next: 'Un coordinateur CasaMia examinera les travaux sélectionnés et les éléments nécessitant des mesures ou une confirmation, puis vous contactera avant tout engagement ou paiement.' },
    },
  },
  nl: {
    ...sharedDutch,
    kinds: {
      booking: { subject: 'We hebben uw CasaMia-bezoekaanvraag ontvangen', title: 'Uw bezoekaanvraag is geregistreerd', intro: 'Bedankt dat u CasaMia om hulp voor uw woning hebt gevraagd. We hebben uw bezoekaanvraag veilig geregistreerd.', nextTitle: 'Wat gebeurt er nu', next: 'Een CasaMia-coördinator beoordeelt de geselecteerde werkzaamheden, contactgegevens en woninginformatie en neemt daarna contact met u op om de beschikbaarheid en een eventuele betaling te bevestigen voordat het bezoek wordt geboekt.' },
      complaint: { subject: 'We hebben uw CasaMia-klacht ontvangen', title: 'Uw klacht is geregistreerd', intro: 'Bedankt dat u ons hebt verteld wat er is gebeurd. Wij nemen problemen met service en veiligheid serieus en hebben uw klacht veilig geregistreerd.', nextTitle: 'Wat gebeurt er nu', next: 'CasaMia beoordeelt de informatie en neemt contact met u op over de volgende stap. Stop bij onmiddellijk gevaar met het gebruik van de betreffende installatie en bel in een noodgeval 112.' },
      contact: { subject: 'We hebben uw CasaMia-bericht ontvangen', title: 'We hebben uw bericht ontvangen', intro: 'Bedankt dat u contact hebt opgenomen met CasaMia. We hebben uw bericht en de verstrekte informatie veilig geregistreerd.', nextTitle: 'Wat gebeurt er nu', next: 'Een medewerker van CasaMia beoordeelt uw aanvraag en neemt contact met u op via de opgegeven gegevens.' },
      provider: { subject: 'We hebben uw CasaMia-partneraanvraag ontvangen', title: 'Uw partneraanvraag is geregistreerd', intro: 'Bedankt voor uw interesse in een samenwerking met CasaMia. We hebben uw bedrijfs- en dekkingsgegevens veilig geregistreerd.', nextTitle: 'Wat gebeurt er nu', next: 'Het CasaMia-team beoordeelt uw diensten, werkgebieden, beschikbaarheid en ondersteunende informatie en neemt contact met u op als de aanvraag geschikt is voor de volgende fase.' },
      quote: { subject: 'We hebben uw CasaMia-offerteaanvraag ontvangen', title: 'Uw offerteaanvraag is geregistreerd', intro: 'Bedankt voor de informatie over de verbeteringen die u overweegt. We hebben uw CasaMia-configuratie veilig geregistreerd.', nextTitle: 'Wat gebeurt er nu', next: 'Een CasaMia-coördinator beoordeelt de geselecteerde werkzaamheden en onderdelen waarvoor maten of bevestiging nodig zijn en neemt contact met u op voordat een verplichting of betaling nodig is.' },
    },
  },
}
