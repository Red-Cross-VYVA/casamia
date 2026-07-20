import { ArrowRight, CheckCircle2, CreditCard, FileText } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useConfigurator } from '../context/ConfiguratorContext'
import {
  calculateConfiguratorQuote,
  formatConfiguratorCurrency,
} from '../services/configuratorPricing'
import {
  createMockDepositCheckout,
  submitConfiguratorRequest,
} from '../services/configuratorSubmission'

const checkoutCopy = {
  en: {
    eyebrow: 'Final step',
    title: 'Choose how you want CasaMia to continue.',
    body:
      'Review your selected improvements, then request a quote or reserve a measured visit if the home needs checking first.',
    selectedTitle: 'Selected improvements',
    selectedBody: 'These are the safety services CasaMia will review for your quote.',
    selected: 'selected',
    more: 'more improvements in your plan.',
    empty: 'No improvements selected yet. Return to the configurator to choose safety services first.',
    quoteAfterReview: 'Quote after review',
    quoteTitle: 'Request quote',
    quoteBody: 'Best if your answers are enough for CasaMia to confirm the next step remotely.',
    amountNow: 'Amount payable now:',
    saving: 'Saving...',
    requestQuote: 'Request quote',
    visitTitle: 'Reserve home visit',
    visitBody: 'CasaMia checks measurements, access and product fit at home. The visit fee is deducted if you continue.',
    preparing: 'Preparing...',
    reserveVisit: 'Reserve visit',
    estimateTitle: 'Your estimate',
    oneTime: 'One-time estimate',
    monthly: 'Monthly support',
    deposit: 'Visit deposit if booked',
    checkNeeded: 'CasaMia check needed',
    requestError: 'The request could not be submitted to CasaMia. Please try again.',
    depositError: 'The deposit checkout could not be prepared. Please try again.',
  },
  es: {
    eyebrow: 'Paso final',
    title: 'Elige cómo quieres que CasaMia continúe.',
    body:
      'Revisa las mejoras seleccionadas y solicita un presupuesto o reserva una visita de medición si la vivienda necesita revisión previa.',
    selectedTitle: 'Mejoras seleccionadas',
    selectedBody: 'Estos son los servicios de seguridad que CasaMia revisará para tu presupuesto.',
    selected: 'seleccionados',
    more: 'mejoras más en tu plan.',
    empty: 'Aún no hay mejoras seleccionadas. Vuelve al configurador para elegir servicios de seguridad.',
    quoteAfterReview: 'Presupuesto tras revisión',
    quoteTitle: 'Solicitar presupuesto',
    quoteBody: 'Ideal si tus respuestas son suficientes para que CasaMia confirme el siguiente paso a distancia.',
    amountNow: 'Importe a pagar ahora:',
    saving: 'Guardando...',
    requestQuote: 'Solicitar presupuesto',
    visitTitle: 'Reservar visita a domicilio',
    visitBody: 'CasaMia comprueba medidas, acceso y encaje de productos en la vivienda. La visita se descuenta si continúas.',
    preparing: 'Preparando...',
    reserveVisit: 'Reservar visita',
    estimateTitle: 'Tu estimación',
    oneTime: 'Estimación inicial',
    monthly: 'Soporte mensual',
    deposit: 'Depósito de visita si se reserva',
    checkNeeded: 'CasaMia debe comprobar',
    requestError: 'No se pudo enviar la solicitud a CasaMia. Inténtalo de nuevo.',
    depositError: 'No se pudo preparar la reserva de la visita. Inténtalo de nuevo.',
  },
} as const

export function ConfigureCheckoutPage() {
  const { i18n } = useTranslation()
  const { state } = useConfigurator()
  const navigate = useNavigate()
  const copy = i18n.language.toLowerCase().startsWith('es') ? checkoutCopy.es : checkoutCopy.en
  const quote = calculateConfiguratorQuote(state)
  const [busyAction, setBusyAction] = useState<'quote' | 'deposit' | ''>('')
  const [error, setError] = useState('')
  const oneTimeLines = quote.lines.filter((line) => !line.recurringMonthly)

  async function requestQuote() {
    setBusyAction('quote')
    setError('')

    try {
      const { submission } = await submitConfiguratorRequest(state)
      navigate(`/configure/confirmation?configuration=${submission.configurationId}`)
    } catch {
      setError(copy.requestError)
      setBusyAction('')
    }
  }

  async function reserveVisit() {
    setBusyAction('deposit')
    setError('')

    try {
      const checkout = await createMockDepositCheckout(state)
      navigate(checkout.checkoutUrl)
    } catch {
      setError(copy.depositError)
      setBusyAction('')
    }
  }

  return (
    <section className="bg-light-blue pt-28">
      <div className="site-shell max-w-6xl py-14 md:py-20">
        <span className="eyebrow">
          <span className="dot" aria-hidden="true" />
          {copy.eyebrow}
        </span>
        <h1 className="display-title mt-5">{copy.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-mid">{copy.body}</p>

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-5">
            <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">
                    {copy.selectedTitle}
                  </h2>
                  <p className="mt-2 text-base font-bold leading-relaxed text-text-mid">
                    {copy.selectedBody}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-pale-blue px-4 py-2 text-sm font-black uppercase text-blue">
                  {quote.selectedServices.length} {copy.selected}
                </span>
              </div>

              {oneTimeLines.length > 0 ? (
                <div className="mt-5 grid gap-3">
                  {oneTimeLines.slice(0, 6).map((line) => (
                    <div
                      className="flex flex-col gap-2 rounded-lg bg-pale-blue p-4 sm:flex-row sm:items-center sm:justify-between"
                      key={line.id}
                    >
                      <span>
                        <strong className="block text-base font-black text-text-dark">{line.label}</strong>
                        {line.note ? <span className="text-sm font-bold text-text-muted">{line.note}</span> : null}
                      </span>
                      <span className="font-black text-navy">
                        {line.quotationOnly ? copy.quoteAfterReview : formatConfiguratorCurrency(line.total)}
                      </span>
                    </div>
                  ))}
                  {oneTimeLines.length > 6 ? (
                    <p className="text-sm font-bold text-text-muted">
                      + {oneTimeLines.length - 6} {copy.more}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-5 rounded-lg bg-pale-blue p-4 text-base font-bold text-text-mid">
                  {copy.empty}
                </p>
              )}
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="rounded-lg border border-border bg-white p-6 shadow-soft">
                <FileText className="mb-5 text-blue" size={42} aria-hidden="true" />
                <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">{copy.quoteTitle}</h2>
                <p className="mt-3 text-lg leading-relaxed text-text-mid">{copy.quoteBody}</p>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.08em] text-text-dark">
                  Amount payable now: €0
                </p>
                <button className="btn btn-navy mt-3 w-full" type="button" disabled={busyAction !== ''} onClick={requestQuote}>
                  {busyAction === 'quote' ? copy.saving : copy.requestQuote}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </article>

              <article className="rounded-lg border border-blue bg-white p-6 shadow-soft">
                <CreditCard className="mb-5 text-blue" size={42} aria-hidden="true" />
                <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">{copy.visitTitle}</h2>
                <p className="mt-3 text-lg leading-relaxed text-text-mid">{copy.visitBody}</p>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.08em] text-text-dark">
                  Amount payable now: {formatConfiguratorCurrency(quote.deposit)}
                </p>
                <button className="btn btn-green mt-3 w-full" type="button" disabled={busyAction !== ''} onClick={reserveVisit}>
                  {busyAction === 'deposit' ? copy.preparing : copy.reserveVisit}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </article>
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-text-dark">{copy.estimateTitle}</h2>
            <dl className="mt-5 grid gap-3">
              <Row label={copy.oneTime} value={formatConfiguratorCurrency(quote.totalEstimate)} />
              <Row label={copy.monthly} value={formatConfiguratorCurrency(quote.recurringMonthlySubtotal)} />
              <Row label={copy.deposit} value={formatConfiguratorCurrency(quote.deposit)} />
            </dl>
            {quote.siteConfirmationItems.length > 0 ? (
              <div className="mt-5 rounded-lg bg-pale-blue p-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-blue">{copy.checkNeeded}</h3>
                <ul className="mt-3 grid gap-2">
                  {quote.siteConfirmationItems.slice(0, 4).map((item) => (
                    <li className="flex gap-2 text-sm font-bold leading-snug text-text-mid" key={`${item.label}-${item.reason}`}>
                      <CheckCircle2 className="mt-0.5 shrink-0 text-blue" size={16} aria-hidden="true" />
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {error ? <p className="mt-5 rounded-lg bg-red-50 p-4 text-base font-bold text-red-700">{error}</p> : null}
          </aside>
        </div>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 text-lg">
      <dt className="font-bold text-text-mid">{label}</dt>
      <dd className="font-black text-text-dark">{value}</dd>
    </div>
  )
}
