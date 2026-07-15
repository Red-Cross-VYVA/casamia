import { ArrowRight, CreditCard, FileText } from 'lucide-react'
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
          You can ask for a final quote from your configuration, or reserve a home visit so CasaMia can confirm measurements.
        </p>

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-lg border border-border bg-white p-6 shadow-soft">
              <FileText className="mb-5 text-blue" size={42} aria-hidden="true" />
              <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">Request final quote</h2>
              <p className="mt-3 text-lg leading-relaxed text-text-mid">
                CasaMia reviews the configuration and sends the next step without taking a deposit now.
              </p>
              <button className="btn btn-navy mt-6 w-full" type="button" disabled={busyAction !== ''} onClick={requestQuote}>
                {busyAction === 'quote' ? 'Saving...' : 'Request final quote'}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </article>

            <article className="rounded-lg border border-blue bg-white p-6 shadow-soft">
              <CreditCard className="mb-5 text-blue" size={42} aria-hidden="true" />
              <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">Reserve CasaMia visit</h2>
              <p className="mt-3 text-lg leading-relaxed text-text-mid">
                Reserve a visit with a {formatConfiguratorCurrency(quote.deposit)} deposit. Payment is mocked until the payment partner is configured.
              </p>
              <button className="btn btn-green mt-6 w-full" type="button" disabled={busyAction !== ''} onClick={reserveVisit}>
                {busyAction === 'deposit' ? 'Preparing...' : `Reserve visit`}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </article>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-text-dark">Your estimate</h2>
            <dl className="mt-5 grid gap-3">
              <Row label="One-time estimate" value={formatConfiguratorCurrency(quote.totalEstimate)} />
              <Row label="Monthly support" value={formatConfiguratorCurrency(quote.recurringMonthlySubtotal)} />
              <Row label="Visit deposit" value={formatConfiguratorCurrency(quote.deposit)} />
            </dl>
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
