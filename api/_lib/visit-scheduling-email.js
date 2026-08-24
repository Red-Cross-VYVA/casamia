import { buildAbsolutePublicUrl, sendTransactionalEmail } from './email.js'

export async function sendVisitScheduledEmail({ assessment, appointment, env = process.env, request }) {
  const locale = String(assessment?.payload_json?.locale || assessment?.payload_json?.language || 'en').toLowerCase()
  const isSpanish = locale.startsWith('es')
  const customerName = text(assessment?.customer_name).split(/\s+/)[0]
  const date = new Intl.DateTimeFormat(isSpanish ? 'es-ES' : 'en-GB', {
    dateStyle: 'full', timeZone: 'Europe/Madrid',
  }).format(new Date(appointment.startAt))
  const time = new Intl.DateTimeFormat(isSpanish ? 'es-ES' : 'en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
  }).format(new Date(appointment.startAt))
  const links = {
    contact: buildAbsolutePublicUrl(request, '/contact', env),
    legal: buildAbsolutePublicUrl(request, '/legal-notice', env),
    privacy: buildAbsolutePublicUrl(request, '/privacy-policy', env),
    terms: buildAbsolutePublicUrl(request, '/general-customer-terms', env),
  }
  const copy = isSpanish ? {
    subject: 'Tu visita CasaMia está programada', title: 'Visita confirmada',
    greeting: `Hola${customerName ? ` ${customerName}` : ''},`,
    intro: 'Gracias por confiar en CasaMia. Hemos reservado personalmente este horario para revisar tu hogar con calma y entender qué mejoras pueden ayudarte de verdad.',
    when: 'Fecha y hora', place: 'Zona de la visita', reference: 'Referencia',
    next: 'Un miembro del equipo confirmará los últimos detalles de acceso antes de la visita. Si necesitas cambiar la cita, escríbenos cuanto antes a hola@casamia.com.es.',
    privacy: 'CasaMia usa tus datos para gestionar la visita y los servicios solicitados. Puedes consultar o ejercer tus derechos en cualquier momento.',
    links: ['Contacto', 'Privacidad', 'Aviso legal', 'Condiciones generales'],
  } : {
    subject: 'Your CasaMia visit is scheduled', title: 'Visit confirmed',
    greeting: `Hello${customerName ? ` ${customerName}` : ''},`,
    intro: 'Thank you for trusting CasaMia. We have personally reserved this time to review your home calmly and understand which improvements will genuinely help.',
    when: 'Date and time', place: 'Visit area', reference: 'Reference',
    next: 'A team member will confirm the final access details before the visit. If you need to change the appointment, contact us as soon as possible at hola@casamia.com.es.',
    privacy: 'CasaMia uses your data to manage the visit and requested services. You may review or exercise your rights at any time.',
    links: ['Contact', 'Privacy', 'Legal notice', 'Customer terms'],
  }
  const details = `${date}, ${time} (${isSpanish ? 'hora de Madrid' : 'Madrid time'})`
  const reference = text(assessment?.payload_json?.wizardReference) || text(assessment?.id)
  const area = text(assessment?.city_area) || (isSpanish ? 'Dirección por confirmar' : 'Address to be confirmed')
  const linkLine = `<a href="${links.contact}">${copy.links[0]}</a> &nbsp;|&nbsp; <a href="${links.privacy}">${copy.links[1]}</a> &nbsp;|&nbsp; <a href="${links.legal}">${copy.links[2]}</a> &nbsp;|&nbsp; <a href="${links.terms}">${copy.links[3]}</a>`
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#142235"><h1>${copy.title}</h1><p>${copy.greeting}</p><p>${copy.intro}</p><div style="padding:18px;border:1px solid #b9de9d;background:#eff8e8;border-radius:8px"><strong>${copy.when}</strong><br>${details}<br><br><strong>${copy.place}</strong><br>${area}<br><br><strong>${copy.reference}</strong><br>${reference}</div><p>${copy.next}</p><p style="font-size:13px;color:#687b8b">${copy.privacy}<br><br>${linkLine}</p></div>`
  const textBody = `${copy.title}\n\n${copy.greeting}\n\n${copy.intro}\n\n${copy.when}: ${details}\n${copy.place}: ${area}\n${copy.reference}: ${reference}\n\n${copy.next}\n\n${copy.privacy}\n${Object.values(links).join('\n')}`

  return sendTransactionalEmail({
    bcc: text(env.CASAMIA_LEADS_EMAIL || env.CASAMIA_NOTIFY_EMAIL), env, html,
    subject: copy.subject, text: textBody, to: assessment?.customer_email,
  })
}

function text(value) { return typeof value === 'string' ? value.trim() : '' }
