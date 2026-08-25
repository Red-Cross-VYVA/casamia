import { normaliseCommercialSettings } from '../../shared/commercialSettings.js'

export const visitPaymentConfig = Object.freeze({
  currency: 'eur',
  feeCents: 9_900,
  vatIncluded: true,
  vatRate: 21,
})

export function getVisitPaymentConfig(commercialSettings) {
  const settings = normaliseCommercialSettings(commercialSettings)
  return {
    currency: 'eur',
    feeCents: Math.round(settings.assessmentVisitFeeGross * 100),
    vatIncluded: true,
    vatRate: Math.round(settings.assessmentVisitVatRate * 100),
  }
}

export function getVisitTaxRateId(env = process.env) {
  return text(env.STRIPE_VISIT_TAX_RATE_ID)
}

export function validateInclusiveVisitTaxRate(taxRate, config = visitPaymentConfig) {
  if (!taxRate || taxRate.deleted) {
    throw new Error('The configured Stripe visit VAT rate was not found.')
  }

  if (taxRate.active !== true || taxRate.inclusive !== true || Number(taxRate.percentage) !== config.vatRate) {
    throw new Error(`STRIPE_VISIT_TAX_RATE_ID must reference an active, inclusive ${config.vatRate}% VAT rate.`)
  }

  return taxRate
}

export function buildVisitCheckoutSession({ commercialSettings, locale = 'en', order, origin, recordType = 'order', taxRateId }) {
  const orderId = text(order?.order_id)
  const customerEmail = text(order?.customer_email)
  const customerName = text(order?.customer_name)

  if (!orderId || !customerEmail || !origin || !taxRateId) {
    throw new Error('The visit checkout is missing required booking or Stripe information.')
  }

  const localeCode = String(locale).toLowerCase().split(/[-_]/)[0]
  const checkoutLocale = ['de', 'es', 'fr', 'nl'].includes(localeCode) ? localeCode : 'en'
  const paymentConfig = getVisitPaymentConfig(commercialSettings)
  const productCopy = {
    de: {
      description: 'Professioneller Hausbesuch. Der Gesamtpreis enthält die Mehrwertsteuer.',
      name: 'CasaMia Sicherheitsbesuch zu Hause',
    },
    en: {
      description: 'Professional in-home visit. Total price includes VAT.',
      name: 'CasaMia home safety visit',
    },
    es: {
      description: 'Visita profesional a domicilio. Precio total con IVA incluido.',
      name: 'Visita de seguridad CasaMia',
    },
    fr: {
      description: 'Visite professionnelle à domicile. Le prix total comprend la TVA.',
      name: 'Visite de sécurité CasaMia à domicile',
    },
    nl: {
      description: 'Professioneel huisbezoek. De totaalprijs is inclusief btw.',
      name: 'CasaMia veiligheidsbezoek aan huis',
    },
  }[checkoutLocale]
  const returnPath = recordType === 'assessment' ? '/home-safety-wizard' : '/configure/confirmation'
  const cancelPath = recordType === 'assessment' ? '/home-safety-wizard' : '/configure/checkout'

  return {
    cancel_url: `${origin}${cancelPath}?payment=cancelled`,
    client_reference_id: orderId,
    customer_email: customerEmail,
    line_items: [{
      price_data: {
        currency: paymentConfig.currency,
        product_data: {
          description: productCopy.description,
          name: productCopy.name,
        },
        tax_behavior: 'inclusive',
        unit_amount: paymentConfig.feeCents,
      },
      quantity: 1,
      tax_rates: [taxRateId],
    }],
    locale: checkoutLocale,
    metadata: {
      casa_mia_payment_type: 'home_visit',
      customer_name: customerName.slice(0, 200),
      order_id: orderId,
      record_type: recordType,
      vat_included: 'true',
      vat_rate: String(paymentConfig.vatRate),
    },
    mode: 'payment',
    payment_intent_data: {
      description: `CasaMia home visit ${orderId}`,
      metadata: {
        casa_mia_payment_type: 'home_visit',
        order_id: orderId,
        record_type: recordType,
      },
      receipt_email: customerEmail,
    },
    success_url: `${origin}${returnPath}?reference=${encodeURIComponent(orderId)}&payment=success&session_id={CHECKOUT_SESSION_ID}`,
  }
}

export function mapVisitPaymentEvent(event) {
  const session = event?.data?.object
  const orderId = text(session?.metadata?.order_id || session?.client_reference_id)

  if (!orderId || session?.metadata?.casa_mia_payment_type !== 'home_visit') return null

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    return {
      orderId,
      recordType: session.metadata?.record_type === 'assessment' ? 'assessment' : 'order',
      status: session.payment_status === 'paid' ? 'Visit paid' : 'Visit payment pending',
    }
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    return { orderId, recordType: session.metadata?.record_type === 'assessment' ? 'assessment' : 'order', status: 'Visit payment failed' }
  }

  if (event.type === 'checkout.session.expired') {
    return { orderId, recordType: session.metadata?.record_type === 'assessment' ? 'assessment' : 'order', status: 'Visit payment expired' }
  }

  return null
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}
