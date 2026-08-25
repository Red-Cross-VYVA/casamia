import { sendFormSubmissionEmails } from '../_lib/form-email.js'
import { cleanString, isValidEmail } from '../_lib/public-form-validation.js'
import { insertSupabaseRow, readJsonBody, requirePost, sendJson } from '../_lib/supabase.js'

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  try {
    const body = await readJsonBody(request)
    const businessName = cleanString(body.businessName)
    const contactName = cleanString(body.contactName)
    const email = cleanString(body.email)
    const phone = cleanString(body.phone)
    const cities = Array.isArray(body.cities) ? body.cities.map(cleanString).filter(Boolean) : []
    const trades = Array.isArray(body.trades) ? body.trades.map(cleanString).filter(Boolean) : []
    const experience = cleanString(body.experience)

    if (
      !businessName
      || !contactName
      || !isValidEmail(email)
      || !phone
      || cities.length === 0
      || trades.length === 0
      || !experience
      || body.insuranceConfirmed !== true
    ) {
      sendJson(response, 400, { message: 'Complete all required provider application fields and confirm insurance.' })
      return
    }

    const payload = {
      application_id: body.id ?? `PPA-${Date.now().toString(36).toUpperCase()}`,
      created_at: body.createdAt ?? new Date().toISOString(),
      status: body.status ?? 'new',
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

    const isSpanish = String(body.locale || '').toLowerCase().startsWith('es')
    const labels = isSpanish ? labelsEs : labelsEn
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
      locale: isSpanish ? 'es' : 'en',
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

const labelsEn = {
  availability: 'Availability', business: 'Business', cities: 'Coverage areas', email: 'Email', phone: 'Phone', trades: 'Services',
}

const labelsEs = {
  availability: 'Disponibilidad', business: 'Empresa', cities: 'Zonas de cobertura', email: 'Correo electrónico', phone: 'Teléfono', trades: 'Servicios',
}
