import { buildAbsolutePublicUrl, sendTransactionalEmail } from './email.js'
import { buildVisitCalendarLinks } from './visit-calendar.js'

export function sendVisitScheduledEmail(options) {
  return sendVisitAppointmentEmail({ ...options, kind: 'scheduled' })
}

export async function sendVisitAppointmentEmail({ assessment, appointment, env = process.env, kind = 'scheduled', request, sessionId = '' }) {
  const locale = normalizeLocale(assessment?.payload_json?.locale || assessment?.payload_json?.language)
  const copy = visitEmailCopy[locale]
  const variant = copy.variants[kind] || copy.variants.scheduled
  const customerName = text(assessment?.customer_name).split(/\s+/)[0]
  const date = new Intl.DateTimeFormat(copy.dateLocale, { dateStyle: 'full', timeZone: 'Europe/Madrid' }).format(new Date(appointment.startAt))
  const time = new Intl.DateTimeFormat(copy.dateLocale, { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date(appointment.startAt))
  const legalLinks = {
    contact: buildAbsolutePublicUrl(request, '/contact', env),
    privacy: buildAbsolutePublicUrl(request, '/privacy-policy', env),
    legal: buildAbsolutePublicUrl(request, '/legal-notice', env),
    terms: buildAbsolutePublicUrl(request, '/general-customer-terms', env),
  }
  const details = `${date}, ${time} (${copy.madridTime})`
  const reference = text(assessment?.payload_json?.wizardReference) || text(assessment?.id)
  const area = text(assessment?.city_area) || copy.addressPending
  const calendarLinks = buildVisitCalendarLinks({ appointment, assessment, request, sessionId })
  const linkLine = `<a href="${legalLinks.contact}">${copy.links.contact}</a> &nbsp;|&nbsp; <a href="${legalLinks.privacy}">${copy.links.privacy}</a> &nbsp;|&nbsp; <a href="${legalLinks.legal}">${copy.links.legal}</a> &nbsp;|&nbsp; <a href="${legalLinks.terms}">${copy.links.terms}</a>`
  const calendarFileAction = calendarLinks.ics ? ` &nbsp;|&nbsp; <a href="${calendarLinks.ics}">${copy.calendarFile}</a>` : ''
  const calendarActions = kind === 'cancelled' ? '' : `<p><strong>${copy.calendar}:</strong> <a href="${calendarLinks.google}">Google Calendar</a> &nbsp;|&nbsp; <a href="${calendarLinks.outlook}">Outlook</a>${calendarFileAction}</p>`
  const manageAction = calendarLinks.manage ? `<p><a href="${calendarLinks.manage}" style="display:inline-block;padding:12px 18px;border-radius:6px;background:#78be3f;color:#142235;font-weight:700;text-decoration:none">${copy.manage}</a></p>` : ''
  const greeting = `${copy.greeting}${customerName ? ` ${customerName}` : ''},`
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#142235"><h1>${variant.title}</h1><p>${greeting}</p><p>${variant.intro}</p><div style="padding:18px;border:1px solid #b9de9d;background:#eff8e8;border-radius:8px"><strong>${copy.when}</strong><br>${details}<br><br><strong>${copy.place}</strong><br>${area}<br><br><strong>${copy.reference}</strong><br>${reference}</div><p>${variant.next}</p>${calendarActions}${manageAction}<p style="font-size:13px;color:#687b8b">${copy.privacy}<br><br>${linkLine}</p></div>`
  const calendarFileText = calendarLinks.ics ? `${copy.calendarFile}: ${calendarLinks.ics}\n` : ''
  const textBody = `${variant.title}\n\n${greeting}\n\n${variant.intro}\n\n${copy.when}: ${details}\n${copy.place}: ${area}\n${copy.reference}: ${reference}\n\n${variant.next}\n\n${calendarLinks.manage ? `${copy.manage}: ${calendarLinks.manage}\n` : ''}${kind === 'cancelled' ? '' : `Google Calendar: ${calendarLinks.google}\nOutlook: ${calendarLinks.outlook}\n${calendarFileText}`}\n${copy.privacy}\n${Object.values(legalLinks).join('\n')}`

  return sendTransactionalEmail({
    bcc: text(env.CASAMIA_LEADS_EMAIL || env.CASAMIA_NOTIFY_EMAIL), env, html,
    subject: variant.subject, text: textBody, to: assessment?.customer_email,
  })
}

const common = {
  en: { dateLocale: 'en-GB', greeting: 'Hello', when: 'Date and time', place: 'Visit area', reference: 'Reference', madridTime: 'Madrid time', addressPending: 'Address to be confirmed', calendar: 'Add to calendar', calendarFile: 'Calendar file', manage: 'Manage visit', privacy: 'CasaMia uses your data to manage the visit and requested services. You may review or exercise your rights at any time.', links: { contact: 'Contact', privacy: 'Privacy', legal: 'Legal notice', terms: 'Customer terms' } },
  es: { dateLocale: 'es-ES', greeting: 'Hola', when: 'Fecha y hora', place: 'Zona de la visita', reference: 'Referencia', madridTime: 'hora de Madrid', addressPending: 'Dirección por confirmar', calendar: 'Añadir al calendario', calendarFile: 'Archivo de calendario', manage: 'Gestionar la visita', privacy: 'CasaMia usa tus datos para gestionar la visita y los servicios solicitados. Puedes consultar o ejercer tus derechos en cualquier momento.', links: { contact: 'Contacto', privacy: 'Privacidad', legal: 'Aviso legal', terms: 'Condiciones generales' } },
  de: { dateLocale: 'de-DE', greeting: 'Hallo', when: 'Datum und Uhrzeit', place: 'Besuchsbereich', reference: 'Referenz', madridTime: 'Madrider Zeit', addressPending: 'Adresse wird noch bestätigt', calendar: 'Zum Kalender hinzufügen', calendarFile: 'Kalenderdatei', manage: 'Besuch verwalten', privacy: 'CasaMia verwendet Ihre Daten zur Verwaltung des Besuchs und der angeforderten Leistungen. Sie können Ihre Rechte jederzeit einsehen oder ausüben.', links: { contact: 'Kontakt', privacy: 'Datenschutz', legal: 'Impressum', terms: 'Kundenbedingungen' } },
  fr: { dateLocale: 'fr-FR', greeting: 'Bonjour', when: 'Date et heure', place: 'Zone de la visite', reference: 'Référence', madridTime: 'heure de Madrid', addressPending: 'Adresse à confirmer', calendar: 'Ajouter au calendrier', calendarFile: 'Fichier calendrier', manage: 'Gérer la visite', privacy: 'CasaMia utilise vos données pour gérer la visite et les services demandés. Vous pouvez consulter ou exercer vos droits à tout moment.', links: { contact: 'Contact', privacy: 'Confidentialité', legal: 'Mentions légales', terms: 'Conditions clients' } },
  nl: { dateLocale: 'nl-NL', greeting: 'Hallo', when: 'Datum en tijd', place: 'Bezoekgebied', reference: 'Referentie', madridTime: 'tijd in Madrid', addressPending: 'Adres wordt nog bevestigd', calendar: 'Aan agenda toevoegen', calendarFile: 'Agendabestand', manage: 'Bezoek beheren', privacy: 'CasaMia gebruikt uw gegevens om het bezoek en de aangevraagde diensten te beheren. U kunt uw rechten op elk moment bekijken of uitoefenen.', links: { contact: 'Contact', privacy: 'Privacy', legal: 'Juridische kennisgeving', terms: 'Klantvoorwaarden' } },
}

const variants = {
  en: {
    scheduled: ['Your CasaMia visit is scheduled', 'Visit confirmed', 'Thank you for trusting CasaMia. We have personally reserved this time to review your home calmly and understand which improvements will genuinely help.', 'A team member will confirm the final access details before the visit.'],
    rescheduled: ['Your CasaMia visit has changed', 'New date confirmed', 'We have updated your CasaMia visit and reserved the new appointment you selected.', 'The previous time is no longer reserved. A team member will confirm the final access details before the visit.'],
    reminder: ['Reminder: your CasaMia visit is tomorrow', 'Your visit is tomorrow', 'This is a reminder that your CasaMia visit is scheduled for tomorrow. We look forward to reviewing how to make the home safer and more comfortable with you.', 'Please make sure we can access the areas you would like reviewed. If you need to change the appointment, use the management link as soon as possible.'],
    cancelled: ['Your CasaMia visit has been cancelled', 'Visit cancelled', 'Your CasaMia visit has been cancelled and the appointment time has been released.', 'Payment is not refunded automatically. Email hola@casamia.com.es with any questions or use your management link to choose another date.'],
  },
  es: {
    scheduled: ['Tu visita CasaMia está programada', 'Visita confirmada', 'Gracias por confiar en CasaMia. Hemos reservado personalmente este horario para revisar tu hogar con calma y entender qué mejoras pueden ayudarte de verdad.', 'Un miembro del equipo confirmará los últimos detalles de acceso antes de la visita.'],
    rescheduled: ['Tu visita CasaMia ha cambiado', 'Nueva fecha confirmada', 'Hemos actualizado tu visita CasaMia y reservado el nuevo horario que elegiste.', 'La fecha anterior ya no está reservada. Un miembro del equipo confirmará los últimos detalles de acceso antes de la visita.'],
    reminder: ['Recordatorio: tu visita CasaMia es mañana', 'Tu visita es mañana', 'Te recordamos que tu visita CasaMia está prevista para mañana. Esperamos verte y revisar contigo cómo hacer que el hogar sea más seguro y cómodo.', 'Asegúrate de que podamos acceder a las zonas que quieres revisar. Si necesitas cambiar la cita, utiliza el enlace de gestión cuanto antes.'],
    cancelled: ['Tu visita CasaMia ha sido cancelada', 'Visita cancelada', 'Tu visita CasaMia ha sido cancelada y el horario ha quedado libre.', 'El pago no se reembolsa automáticamente. Escríbenos a hola@casamia.com.es para cualquier consulta o utiliza tu enlace de gestión para elegir otra fecha.'],
  },
  de: {
    scheduled: ['Ihr CasaMia-Besuch ist geplant', 'Besuch bestätigt', 'Vielen Dank für Ihr Vertrauen in CasaMia. Wir haben diesen Termin reserviert, um Ihr Zuhause in Ruhe zu prüfen und sinnvolle Verbesserungen zu ermitteln.', 'Ein Teammitglied bestätigt vor dem Besuch die letzten Zugangsdaten.'],
    rescheduled: ['Ihr CasaMia-Besuch wurde geändert', 'Neuer Termin bestätigt', 'Wir haben Ihren CasaMia-Besuch aktualisiert und den neu gewählten Termin reserviert.', 'Der vorherige Termin ist nicht mehr reserviert. Ein Teammitglied bestätigt vor dem Besuch die letzten Zugangsdaten.'],
    reminder: ['Erinnerung: Ihr CasaMia-Besuch ist morgen', 'Ihr Besuch ist morgen', 'Wir erinnern Sie daran, dass Ihr CasaMia-Besuch morgen stattfindet. Wir freuen uns darauf, mit Ihnen zu prüfen, wie Ihr Zuhause sicherer und komfortabler werden kann.', 'Bitte stellen Sie sicher, dass die zu prüfenden Bereiche zugänglich sind. Nutzen Sie den Verwaltungslink so bald wie möglich, falls Sie den Termin ändern müssen.'],
    cancelled: ['Ihr CasaMia-Besuch wurde storniert', 'Besuch storniert', 'Ihr CasaMia-Besuch wurde storniert und der Termin wieder freigegeben.', 'Die Zahlung wird nicht automatisch erstattet. Schreiben Sie bei Fragen an hola@casamia.com.es oder wählen Sie über den Verwaltungslink einen neuen Termin.'],
  },
  fr: {
    scheduled: ['Votre visite CasaMia est programmée', 'Visite confirmée', 'Merci de faire confiance à CasaMia. Nous avons réservé ce créneau pour examiner votre logement sereinement et comprendre les améliorations qui vous aideront réellement.', 'Un membre de l’équipe confirmera les derniers détails d’accès avant la visite.'],
    rescheduled: ['Votre visite CasaMia a été modifiée', 'Nouvelle date confirmée', 'Nous avons mis à jour votre visite CasaMia et réservé le nouveau créneau choisi.', 'L’ancien créneau n’est plus réservé. Un membre de l’équipe confirmera les derniers détails d’accès avant la visite.'],
    reminder: ['Rappel : votre visite CasaMia a lieu demain', 'Votre visite a lieu demain', 'Nous vous rappelons que votre visite CasaMia est prévue demain. Nous avons hâte d’examiner avec vous comment rendre le logement plus sûr et confortable.', 'Veuillez vous assurer que les zones à examiner sont accessibles. Si vous devez modifier le rendez-vous, utilisez le lien de gestion dès que possible.'],
    cancelled: ['Votre visite CasaMia a été annulée', 'Visite annulée', 'Votre visite CasaMia a été annulée et le créneau a été libéré.', 'Le paiement n’est pas remboursé automatiquement. Écrivez à hola@casamia.com.es pour toute question ou utilisez le lien de gestion pour choisir une autre date.'],
  },
  nl: {
    scheduled: ['Uw CasaMia-bezoek is gepland', 'Bezoek bevestigd', 'Bedankt voor uw vertrouwen in CasaMia. We hebben dit tijdstip gereserveerd om uw woning rustig te beoordelen en te bepalen welke verbeteringen echt helpen.', 'Een teamlid bevestigt vóór het bezoek de laatste toegangsgegevens.'],
    rescheduled: ['Uw CasaMia-bezoek is gewijzigd', 'Nieuwe datum bevestigd', 'We hebben uw CasaMia-bezoek bijgewerkt en het nieuw gekozen tijdstip gereserveerd.', 'Het vorige tijdstip is niet meer gereserveerd. Een teamlid bevestigt vóór het bezoek de laatste toegangsgegevens.'],
    reminder: ['Herinnering: uw CasaMia-bezoek is morgen', 'Uw bezoek is morgen', 'Dit is een herinnering dat uw CasaMia-bezoek morgen plaatsvindt. We bekijken graag samen hoe de woning veiliger en comfortabeler kan worden.', 'Zorg dat de te beoordelen ruimtes toegankelijk zijn. Gebruik de beheerlink zo snel mogelijk als u de afspraak moet wijzigen.'],
    cancelled: ['Uw CasaMia-bezoek is geannuleerd', 'Bezoek geannuleerd', 'Uw CasaMia-bezoek is geannuleerd en het tijdstip is vrijgegeven.', 'De betaling wordt niet automatisch terugbetaald. Mail vragen naar hola@casamia.com.es of kies via de beheerlink een andere datum.'],
  },
}

const visitEmailCopy = Object.fromEntries(Object.entries(common).map(([locale, value]) => [
  locale,
  {
    ...value,
    variants: Object.fromEntries(Object.entries(variants[locale]).map(([kind, [subject, title, intro, next]]) => [kind, { subject, title, intro, next }])),
  },
]))

function normalizeLocale(value) {
  const locale = String(value || '').toLowerCase().split(/[-_]/)[0]
  return visitEmailCopy[locale] ? locale : 'en'
}

function text(value) { return typeof value === 'string' ? value.trim() : '' }
