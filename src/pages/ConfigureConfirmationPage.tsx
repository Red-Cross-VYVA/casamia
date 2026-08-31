import { AlertCircle, CheckCircle2, LoaderCircle, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { VisitScheduler } from '../components/wizard/VisitScheduler'
import { formatConfiguratorCurrency } from '../services/configuratorPricing'
import { loadSavedConfiguratorSubmission } from '../services/configuratorSubmission'
import { getConfiguredServiceById } from '../services/serviceCatalogue'
import { getVisitCheckoutStatus } from '../services/visitCheckout'

type PaymentVerification = 'none' | 'checking' | 'paid' | 'pending' | 'failed'

const confirmationCopy = {
  en: {
    fallbackReference: 'Prepared locally',
    eyebrow: 'Confirmation',
    title: 'Your configuration has been saved.',
    reference: 'Reference:',
    summary: 'Summary',
    customer: 'Customer',
    notProvided: 'Not provided',
    oneTime: 'One-time estimate',
    monthly: 'Monthly support',
    visitFee: 'Visit fee · VAT included',
    selected: 'Selected improvements',
    print: 'Print',
    qty: 'Qty',
    empty:
      'CasaMia has saved your request. We will confirm the exact improvements before any work starts.',
    confirmBefore: 'To confirm before installation',
    noPayload: 'No saved payload was found. Return to the configurator to prepare a new configuration.',
    back: 'Back to configurator',
    home: 'Return home',
    paymentChecking: 'Confirming your secure payment with Stripe...',
    paymentPaid: 'Payment received. Your home visit request is ready for scheduling.',
    paymentPending: 'Stripe is still confirming the payment. We will only schedule the visit once payment is received.',
    paymentFailed: 'We could not verify payment for this visit. No paid visit has been confirmed.',
  },
  es: {
    fallbackReference: 'Preparado localmente',
    eyebrow: 'Confirmación',
    title: 'Tu configuración se ha guardado.',
    reference: 'Referencia:',
    summary: 'Resumen',
    customer: 'Cliente',
    notProvided: 'No indicado',
    oneTime: 'Estimación inicial',
    monthly: 'Soporte mensual',
    visitFee: 'Precio de la visita · IVA incluido',
    selected: 'Mejoras seleccionadas',
    print: 'Imprimir',
    qty: 'Cant.',
    empty:
      'CasaMia ha guardado tu solicitud. Confirmaremos las mejoras exactas antes de iniciar cualquier trabajo.',
    confirmBefore: 'A confirmar antes de la instalación',
    noPayload: 'No se encontró una solicitud guardada. Vuelve al configurador para preparar una nueva configuración.',
    back: 'Volver al configurador',
    home: 'Volver al inicio',
    paymentChecking: 'Confirmando tu pago seguro con Stripe...',
    paymentPaid: 'Pago recibido. Tu solicitud de visita a domicilio está lista para programarse.',
    paymentPending: 'Stripe todavía está confirmando el pago. Solo programaremos la visita cuando se haya recibido.',
    paymentFailed: 'No hemos podido verificar el pago de esta visita. No hay ninguna visita de pago confirmada.',
  },
} as const

export function ConfigureConfirmationPage() {
  const { i18n } = useTranslation()
  const copy = i18n.language.toLowerCase().startsWith('es') ? confirmationCopy.es : confirmationCopy.en
  const [searchParams] = useSearchParams()
  const submission = loadSavedConfiguratorSubmission()
  const configurationId = searchParams.get('configuration') ?? submission?.configurationId ?? copy.fallbackReference
  const sessionId = searchParams.get('session_id')
  const expectsPayment = searchParams.get('payment') === 'success' && Boolean(sessionId)
  const [paymentVerification, setPaymentVerification] = useState<PaymentVerification>(
    expectsPayment ? 'checking' : 'none',
  )
  const selectedServices =
    submission?.selectedServices
      ?.map((selection) => ({
        ...selection,
        service: getConfiguredServiceById(selection.serviceId),
      }))
      .filter((selection) => selection.service) ?? []

  useEffect(() => {
    if (!expectsPayment || !sessionId) return

    let active = true
    setPaymentVerification('checking')

    getVisitCheckoutStatus(sessionId)
      .then((status) => {
        if (!active) return
        const referenceMatches = !status.orderId || status.orderId === configurationId
        if (!referenceMatches) {
          setPaymentVerification('failed')
        } else {
          setPaymentVerification(status.paymentStatus === 'paid' ? 'paid' : 'pending')
        }
      })
      .catch(() => {
        if (active) setPaymentVerification('failed')
      })

    return () => {
      active = false
    }
  }, [configurationId, expectsPayment, sessionId])

  return (
    <section className="bg-light-blue pt-28">
      <div className="site-shell max-w-5xl py-14 md:py-20">
        <div className="rounded-lg border border-border bg-white p-7 shadow-soft md:p-10">
          <CheckCircle2 className="text-blue" size={56} aria-hidden="true" />
          <span className="eyebrow mt-6">
            <span className="dot" aria-hidden="true" />
            {copy.eyebrow}
          </span>
          <h1 className="display-title mt-5">{copy.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-mid">
            {copy.reference} <strong className="text-text-dark">{configurationId}</strong>
          </p>

          {paymentVerification !== 'none' ? (
            <PaymentNotice status={paymentVerification} copy={copy} />
          ) : null}

          {submission ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="rounded-lg bg-pale-blue p-5">
                <h2 className="font-display text-2xl font-bold text-text-dark">{copy.summary}</h2>
                <dl className="mt-4 grid gap-3 text-base">
                  <Row label={copy.customer} value={submission.customer.fullName || copy.notProvided} />
                  <Row label={copy.oneTime} value={formatConfiguratorCurrency(submission.totalEstimate)} />
                  <Row label={copy.monthly} value={formatConfiguratorCurrency(submission.recurringMonthlySubtotal)} />
                  <Row
                    label={copy.visitFee}
                    value={formatConfiguratorCurrency(submission.visitFee ?? submission.deposit ?? 0)}
                  />
                </dl>
              </aside>
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-display text-2xl font-bold text-text-dark">{copy.selected}</h2>
                  <button className="btn btn-white border border-border" type="button" onClick={() => window.print()}>
                    <Printer size={18} aria-hidden="true" />
                    {copy.print}
                  </button>
                </div>
                {selectedServices.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {selectedServices.map(({ quantity, service, serviceId }) => (
                      <article className="rounded-lg border border-border bg-white p-4" key={serviceId}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-lg font-black text-text-dark">{service?.name}</h3>
                            <p className="mt-1 text-base leading-relaxed text-text-mid">
                              {service?.customerBenefit ?? service?.shortDescription}
                            </p>
                          </div>
                          <span className="rounded-full bg-pale-blue px-3 py-1 text-sm font-black text-blue">
                            {copy.qty} {quantity}
                          </span>
                        </div>
                        {service?.includedItems?.length ? (
                          <ul className="mt-3 grid gap-1 text-sm font-bold text-text-mid sm:grid-cols-2">
                            {service.includedItems.slice(0, 4).map((item) => (
                              <li className="flex gap-2" key={item}>
                                <CheckCircle2 className="mt-0.5 shrink-0 text-blue" size={16} aria-hidden="true" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border border-border bg-pale-blue p-5 text-base font-bold text-text-mid">
                    {copy.empty}
                  </div>
                )}

                {submission.siteConfirmationItems.length > 0 ? (
                  <div className="mt-5 rounded-lg bg-light-blue p-5">
                    <h3 className="font-display text-xl font-bold text-text-dark">{copy.confirmBefore}</h3>
                    <ul className="mt-3 grid gap-2 text-sm font-bold text-text-mid">
                      {submission.siteConfirmationItems.map((item) => (
                        <li key={`${item.label}-${item.reason}`}>
                          <strong className="text-text-dark">{item.label}:</strong> {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-8 rounded-lg bg-pale-blue p-5 text-lg font-bold text-text-mid">
              {copy.noPayload}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn-navy" to="/home-safety-wizard">
              {copy.back}
            </Link>
            <Link className="btn btn-white border border-border" to="/">
              {copy.home}
            </Link>
          </div>
        </div>
        {paymentVerification === 'paid' && sessionId ? (
          <VisitScheduler language={i18n.language} sessionId={sessionId} />
        ) : null}
      </div>
    </section>
  )
}

function PaymentNotice({
  status,
  copy,
}: {
  status: Exclude<PaymentVerification, 'none'>
  copy: typeof confirmationCopy.en | typeof confirmationCopy.es
}) {
  const content = {
    checking: {
      icon: <LoaderCircle className="shrink-0 animate-spin text-blue" size={24} aria-hidden="true" />,
      message: copy.paymentChecking,
      style: 'border-blue/30 bg-pale-blue text-text-dark',
    },
    paid: {
      icon: <CheckCircle2 className="shrink-0 text-green" size={24} aria-hidden="true" />,
      message: copy.paymentPaid,
      style: 'border-green/30 bg-green/10 text-text-dark',
    },
    pending: {
      icon: <LoaderCircle className="shrink-0 text-blue" size={24} aria-hidden="true" />,
      message: copy.paymentPending,
      style: 'border-blue/30 bg-pale-blue text-text-dark',
    },
    failed: {
      icon: <AlertCircle className="shrink-0 text-red-700" size={24} aria-hidden="true" />,
      message: copy.paymentFailed,
      style: 'border-red-200 bg-red-50 text-red-800',
    },
  }[status]

  return (
    <div className={`mt-6 flex items-start gap-3 rounded-lg border p-4 text-base font-bold ${content.style}`} role="status">
      {content.icon}
      <p>{content.message}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-black uppercase text-text-muted">{label}</dt>
      <dd className="font-bold text-text-dark">{value}</dd>
    </div>
  )
}
