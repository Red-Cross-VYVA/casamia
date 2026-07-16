import { ArrowRight, CheckCircle2, CreditCard, FileText } from 'lucide-react'
import { useState } from 'react'
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

export function ConfigureCheckoutPage() {
  const { state } = useConfigurator()
  const navigate = useNavigate()
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
      setError('The request could not be saved locally. Please try again.')
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
      setError('The deposit checkout could not be prepared. Please try again.')
      setBusyAction('')
    }
  }

  return (
    <section className="bg-light-blue pt-28">
      <div className="site-shell max-w-6xl py-14 md:py-20">
        <span className="eyebrow">
          <span className="dot" aria-hidden="true" />
          Final step
        </span>
        <h1 className="display-title mt-5">Choose how you want CasaMia to continue.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-mid">
          Review your selected improvements, then request a quote or reserve a measured visit if the home needs checking first.
        </p>

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-5">
            <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">
                    Selected improvements
                  </h2>
                  <p className="mt-2 text-base font-bold leading-relaxed text-text-mid">
                    These are the safety services CasaMia will review for your quote.
                  </p>
                </div>
                <span className="w-fit rounded-full bg-pale-blue px-4 py-2 text-sm font-black uppercase text-blue">
                  {quote.selectedServices.length} selected
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
                        {line.quotationOnly ? 'Quote after review' : formatConfiguratorCurrency(line.total)}
                      </span>
                    </div>
                  ))}
                  {oneTimeLines.length > 6 ? (
                    <p className="text-sm font-bold text-text-muted">
                      + {oneTimeLines.length - 6} more improvements in your plan.
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-5 rounded-lg bg-pale-blue p-4 text-base font-bold text-text-mid">
                  No improvements selected yet. Return to the configurator to choose safety services first.
                </p>
              )}
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="rounded-lg border border-border bg-white p-6 shadow-soft">
                <FileText className="mb-5 text-blue" size={42} aria-hidden="true" />
                <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">Request quote</h2>
                <p className="mt-3 text-lg leading-relaxed text-text-mid">
                  Best if your answers are enough for CasaMia to confirm the next step remotely.
                </p>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.08em] text-text-dark">
                  Amount payable now: €0
                </p>
                <button className="btn btn-navy mt-3 w-full" type="button" disabled={busyAction !== ''} onClick={requestQuote}>
                  {busyAction === 'quote' ? 'Saving...' : 'Request quote'}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </article>

              <article className="rounded-lg border border-blue bg-white p-6 shadow-soft">
                <CreditCard className="mb-5 text-blue" size={42} aria-hidden="true" />
                <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">Reserve home visit</h2>
                <p className="mt-3 text-lg leading-relaxed text-text-mid">
                  CasaMia checks measurements, access and product fit at home. The visit fee is deducted if you continue.
                </p>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.08em] text-text-dark">
                  Amount payable now: {formatConfiguratorCurrency(quote.deposit)}
                </p>
                <button className="btn btn-green mt-3 w-full" type="button" disabled={busyAction !== ''} onClick={reserveVisit}>
                  {busyAction === 'deposit' ? 'Preparing...' : 'Reserve visit'}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </article>
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-text-dark">Your estimate</h2>
            <dl className="mt-5 grid gap-3">
              <Row label="One-time estimate" value={formatConfiguratorCurrency(quote.totalEstimate)} />
              <Row label="Monthly support" value={formatConfiguratorCurrency(quote.recurringMonthlySubtotal)} />
              <Row label="Visit deposit if booked" value={formatConfiguratorCurrency(quote.deposit)} />
            </dl>
            {quote.siteConfirmationItems.length > 0 ? (
              <div className="mt-5 rounded-lg bg-pale-blue p-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-blue">CasaMia check needed</h3>
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
