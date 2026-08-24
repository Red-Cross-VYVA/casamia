import { buildAbsolutePublicUrl, sendTransactionalEmail } from './email.js'
import { buildVisitCalendarLinks } from './visit-calendar.js'

export function sendVisitScheduledEmail(options) {
  return sendVisitAppointmentEmail({ ...options, kind: 'scheduled' })
}

export async function sendVisitAppointmentEmail({ assessment, appointment, env = process.env, kind = 'scheduled', request, sessionId = '' }) {
  const locale = String(assessment?.payload_json?.locale || assessment?.payload_json?.language || 'en').toLowerCase()
  const isSpanish = locale.startsWith('es')
  const customerName = text(assessment?.customer_name).split(/\s+/)[0]
  const date = new Intl.DateTimeFormat(isSpanish ? 'es-ES' : 'en-GB', {
    dateStyle: 'full', timeZone: 'Europe/Madrid',
  }).format(new Date(appointment.startAt))
  const time = new Intl.DateTimeFormat(isSpanish ? 'es-ES' : 'en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
  }).format(new Date(appointment.startAt))
  const legalLinks = {
    contact: buildAbsolutePublicUrl(request, '/contact', env),
    legal: buildAbsolutePublicUrl(request, '/legal-notice', env),
    privacy: buildAbsolutePublicUrl(request, '/privacy-policy', env),
    terms: buildAbsolutePublicUrl(request, '/general-customer-terms', env),
  }
  const variants = isSpanish ? {
    scheduled: { subject: 'Tu visita CasaMia está programada', title: 'Visita confirmada', intro: 'Gracias por confiar en CasaMia. Hemos reservado personalmente este horario para revisar tu hogar con calma y entender qué mejoras pueden ayudarte de verdad.', next: 'Un miembro del equipo confirmará los últimos detalles de acceso antes de la visita.' },
    rescheduled: { subject: 'Tu visita CasaMia ha cambiado', title: 'Nueva fecha confirmada', intro: 'Hemos actualizado tu visita CasaMia y reservado el nuevo horario que elegiste.', next: 'La fecha anterior ya no está reservada. Un miembro del equipo confirmará los últimos detalles de acceso antes de la visita.' },
    reminder: { subject: 'Recordatorio: tu visita CasaMia es mañana', title: 'Tu visita es mañana', intro: 'Te recordamos que tu visita CasaMia está prevista para mañana. Esperamos verte y revisar contigo cómo hacer que el hogar sea más seguro y cómodo.', next: 'Asegúrate de que podamos acceder a las zonas que quieres revisar. Si necesitas cambiar la cita, utiliza el enlace de gestión cuanto antes.' },
    cancelled: { subject: 'Tu visita CasaMia ha sido cancelada', title: 'Visita cancelada', intro: 'Tu visita CasaMia ha sido cancelada y el horario ha quedado libre.', next: 'El pago no se reembolsa automáticamente. Escríbenos a hola@casamia.com.es para cualquier consulta o utiliza tu enlace de gestión para elegir otra fecha.' },
  } : {
    scheduled: { subject: 'Your CasaMia visit is scheduled', title: 'Visit confirmed', intro: 'Thank you for trusting CasaMia. We have personally reserved this time to review your home calmly and understand which improvements will genuinely help.', next: 'A team member will confirm the final access details before the visit.' },
    rescheduled: { subject: 'Your CasaMia visit has changed', title: 'New date confirmed', intro: 'We have updated your CasaMia visit and reserved the new appointment you selected.', next: 'The previous time is no longer reserved. A team member will confirm the final access details before the visit.' },
    reminder: { subject: 'Reminder: your CasaMia visit is tomorrow', title: 'Your visit is tomorrow', intro: 'This is a reminder that your CasaMia visit is scheduled for tomorrow. We look forward to reviewing how to make the home safer and more comfortable with you.', next: 'Please make sure we can access the areas you would like reviewed. If you need to change the appointment, use the management link as soon as possible.' },
    cancelled: { subject: 'Your CasaMia visit has been cancelled', title: 'Visit cancelled', intro: 'Your CasaMia visit has been cancelled and the appointment time has been released.', next: 'Payment is not refunded automatically. Email hola@casamia.com.es with any questions or use your management link to choose another date.' },
  }
  const variant = variants[kind] || variants.scheduled
  const copy = isSpanish ? {
    ...variant,
    greeting: `Hola${customerName ? ` ${customerName}` : ''},`,
    when: 'Fecha y hora', place: 'Zona de la visita', reference: 'Referencia',
    privacy: 'CasaMia usa tus datos para gestionar la visita y los servicios solicitados. Puedes consultar o ejercer tus derechos en cualquier momento.',
    calendar: 'Añadir al calendario', manage: 'Gestionar la visita', links: ['Contacto', 'Privacidad', 'Aviso legal', 'Condiciones generales'],
  } : {
    ...variant,
    greeting: `Hello${customerName ? ` ${customerName}` : ''},`,
    when: 'Date and time', place: 'Visit area', reference: 'Reference',
    privacy: 'CasaMia uses your data to manage the visit and requested services. You may review or exercise your rights at any time.',
    calendar: 'Add to calendar', manage: 'Manage visit', links: ['Contact', 'Privacy', 'Legal notice', 'Customer terms'],
  }
  const details = `${date}, ${time} (${isSpanish ? 'hora de Madrid' : 'Madrid time'})`
  const reference = text(assessment?.payload_json?.wizardReference) || text(assessment?.id)
  const area = text(assessment?.city_area) || (isSpanish ? 'Dirección por confirmar' : 'Address to be confirmed')
  const calendarLinks = buildVisitCalendarLinks({ appointment, assessment, request, sessionId })
  const linkLine = `<a href="${legalLinks.contact}">${copy.links[0]}</a> &nbsp;|&nbsp; <a href="${legalLinks.privacy}">${copy.links[1]}</a> &nbsp;|&nbsp; <a href="${legalLinks.legal}">${copy.links[2]}</a> &nbsp;|&nbsp; <a href="${legalLinks.terms}">${copy.links[3]}</a>`
  const calendarFileAction = calendarLinks.ics ? ` &nbsp;|&nbsp; <a href="${calendarLinks.ics}">.ics</a>` : ''
  const calendarActions = kind === 'cancelled' ? '' : `<p><strong>${copy.calendar}:</strong> <a href="${calendarLinks.google}">Google Calendar</a> &nbsp;|&nbsp; <a href="${calendarLinks.outlook}">Outlook</a>${calendarFileAction}</p>`
  const manageAction = calendarLinks.manage ? `<p><a href="${calendarLinks.manage}" style="display:inline-block;padding:12px 18px;border-radius:6px;background:#78be3f;color:#142235;font-weight:700;text-decoration:none">${copy.manage}</a></p>` : ''
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#142235"><h1>${copy.title}</h1><p>${copy.greeting}</p><p>${copy.intro}</p><div style="padding:18px;border:1px solid #b9de9d;background:#eff8e8;border-radius:8px"><strong>${copy.when}</strong><br>${details}<br><br><strong>${copy.place}</strong><br>${area}<br><br><strong>${copy.reference}</strong><br>${reference}</div><p>${copy.next}</p>${calendarActions}${manageAction}<p style="font-size:13px;color:#687b8b">${copy.privacy}<br><br>${linkLine}</p></div>`
  const calendarFileText = calendarLinks.ics ? `Calendar file: ${calendarLinks.ics}\n` : ''
  const textBody = `${copy.title}\n\n${copy.greeting}\n\n${copy.intro}\n\n${copy.when}: ${details}\n${copy.place}: ${area}\n${copy.reference}: ${reference}\n\n${copy.next}\n\n${calendarLinks.manage ? `${copy.manage}: ${calendarLinks.manage}\n` : ''}${kind === 'cancelled' ? '' : `Google Calendar: ${calendarLinks.google}\nOutlook: ${calendarLinks.outlook}\n${calendarFileText}`}\n${copy.privacy}\n${Object.values(legalLinks).join('\n')}`

  return sendTransactionalEmail({
    bcc: text(env.CASAMIA_LEADS_EMAIL || env.CASAMIA_NOTIFY_EMAIL), env, html,
    subject: copy.subject, text: textBody, to: assessment?.customer_email,
  })
}

function text(value) { return typeof value === 'string' ? value.trim() : '' }
