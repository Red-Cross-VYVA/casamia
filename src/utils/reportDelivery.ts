export type ReportDeliveryFormValue = {
  name: string
  email: string
  phone: string
  postcode?: string
  deliveryEmail: boolean
  deliveryWhatsapp: boolean
  consent: boolean
}

export function isReportDeliveryReady(value: ReportDeliveryFormValue) {
  const hasDelivery = value.deliveryEmail || value.deliveryWhatsapp
  const emailReady = !value.deliveryEmail || Boolean(value.email)
  const whatsappReady = !value.deliveryWhatsapp || Boolean(value.phone)

  return Boolean(value.name && hasDelivery && emailReady && whatsappReady && value.consent)
}
