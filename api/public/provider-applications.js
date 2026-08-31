import { normalizeEmailLocale, sendFormSubmissionEmails } from '../_lib/form-email.js'
import { applyPublicCors, isAllowedPublicOrigin } from '../_lib/public-origin.js'
import { reservePublicRequest } from '../_lib/public-rate-limit.js'
import { cleanString, isJsonWithinBytes, isValidEmail, isWithinLength } from '../_lib/public-form-validation.js'
import { insertSupabaseRow, readJsonBody, requirePost, sendJson } from '../_lib/supabase.js'

export default async function handler(request, response, dependencies = {}) {
  if (request.method === 'OPTIONS') {
    if (!applyPublicCors(request, response)) {
      sendJson(response, 403, { message: 'Origin not allowed.' })
      return
    }
    response.status(204).end()
    return
  }
  if (!requirePost(request, response)) return
  if (!isAllowedPublicOrigin(request)) {
    sendJson(response, 403, { message: 'Origin not allowed.' })
    return
  }
  applyPublicCors(request, response)

  try {
    const body = await readJsonBody(request)
    const businessName = cleanString(body.businessName)
    const contactName = cleanString(body.contactName)
    const email = cleanString(body.email)
    const phone = cleanString(body.phone)
    const cities = Array.isArray(body.cities) ? body.cities.map(cleanString).filter(Boolean) : []
    const trades = Array.isArray(body.trades) ? body.trades.map(cleanString).filter(Boolean) : []
    const experience = cleanString(body.experience)
    const applicationId = cleanString(body.id)

    if (
      !isJsonWithinBytes(body, 32_768)
      || !isWithinLength(businessName, 160, { required: true })
      || !isWithinLength(contactName, 120, { required: true })
      || !isValidEmail(email)
      || !isWithinLength(phone, 40, { required: true })
      || cities.length === 0
      || cities.length > 30
      || cities.some((city) => !isWithinLength(city, 120, { required: true }))
      || trades.length === 0
      || trades.length > 30
      || trades.some((trade) => !isWithinLength(trade, 120, { required: true }))
      || !isWithinLength(experience, 5_000, { required: true })
      || !isWithinLength(body.website, 300)
      || !isWithinLength(body.availability, 500)
      || (applicationId && !/^PPA-[A-Z0-9-]{4,40}$/i.test(applicationId))
      || body.insuranceConfirmed !== true
    ) {
      sendJson(response, 400, { message: 'Complete all required provider application fields and confirm insurance.' })
      return
    }

    const reservation = await reservePublicRequest(request, {
      callRpc: dependencies.callRpc,
      env: dependencies.env ?? process.env,
      limit: 3,
      scope: 'provider-application',
      windowSeconds: 60 * 60,
    })
    if (!reservation.ok) {
      sendJson(response, reservation.status, {
        message: reservation.status === 429
          ? 'Too many provider applications. Please try again later.'
          : 'Provider applications are temporarily unavailable.',
      })
      return
    }

    const payload = {
      application_id: applicationId || `PPA-${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString(),
      status: 'new',
      business_name: businessName,
      contact_name: contactName,
      email,
      phone,
      website: cleanString(body.website),
      cities,
      trades,
      experience,
      availability: cleanString(body.availability),
      insurance_confirmed: Boolean(body.insuranceConfirmed),
      payload_json: body,
    }
    const result = await insertSupabaseRow('provider_applications', payload)

    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    const locale = normalizeEmailLocale(body.locale)
    const labels = labelsByLocale[locale]
    const emailDelivery = await sendFormSubmissionEmails({
      details: [
        { label: labels.business, value: payload.business_name },
        { label: labels.email, value: payload.email },
        { label: labels.phone, value: payload.phone },
        { label: labels.cities, value: payload.cities.join(', ') },
        { label: labels.trades, value: payload.trades.join(', ') },
        { label: labels.availability, value: payload.availability },
      ],
      kind: 'provider',
      locale,
      name: payload.contact_name,
      recipient: payload.email,
      reference: payload.application_id,
      request,
    })

    sendJson(response, 200, { ...result.body, emailDelivery })
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid provider application.',
    })
  }
}

const labelsByLocale = {
  en: { availability: 'Availability', business: 'Business', cities: 'Coverage areas', email: 'Email', phone: 'Phone', trades: 'Services' },
  es: { availability: 'Disponibilidad', business: 'Empresa', cities: 'Zonas de cobertura', email: 'Correo electrónico', phone: 'Teléfono', trades: 'Servicios' },
  de: { availability: 'Verfügbarkeit', business: 'Unternehmen', cities: 'Einsatzgebiete', email: 'E-Mail', phone: 'Telefon', trades: 'Leistungen' },
  fr: { availability: 'Disponibilité', business: 'Entreprise', cities: 'Zones d’intervention', email: 'E-mail', phone: 'Téléphone', trades: 'Services' },
  nl: { availability: 'Beschikbaarheid', business: 'Bedrijf', cities: 'Werkgebieden', email: 'E-mail', phone: 'Telefoon', trades: 'Diensten' },
}
