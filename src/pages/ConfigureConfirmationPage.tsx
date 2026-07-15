import { CheckCircle2, Printer } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { formatConfiguratorCurrency } from '../services/configuratorPricing'
import { loadSavedConfiguratorSubmission } from '../services/configuratorSubmission'

export function ConfigureConfirmationPage() {
  const [searchParams] = useSearchParams()
  const submission = loadSavedConfiguratorSubmission()
  const configurationId = searchParams.get('configuration') ?? submission?.configurationId ?? 'Prepared locally'
  const mockCheckout = searchParams.get('mockCheckout') === '1'

  return (
    <section className="bg-light-blue pt-28">
      <div className="site-shell max-w-5xl py-14 md:py-20">
        <div className="rounded-lg border border-border bg-white p-7 shadow-soft md:p-10">
          <CheckCircle2 className="text-blue" size={56} aria-hidden="true" />
          <span className="eyebrow mt-6">
            <span className="dot" aria-hidden="true" />
            Confirmation
          </span>
          <h1 className="display-title mt-5">Your configuration has been saved.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-mid">
            Reference: <strong className="text-text-dark">{configurationId}</strong>
            {mockCheckout ? ' · mock deposit checkout prepared' : ''}
          </p>

          {submission ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="rounded-lg bg-pale-blue p-5">
                <h2 className="font-display text-2xl font-bold text-text-dark">Summary</h2>
                <dl className="mt-4 grid gap-3 text-base">
                  <Row label="Customer" value={submission.customer.fullName || 'Not provided'} />
                  <Row label="One-time estimate" value={formatConfiguratorCurrency(submission.totalEstimate)} />
                  <Row label="Monthly support" value={formatConfiguratorCurrency(submission.recurringMonthlySubtotal)} />
                  <Row label="Deposit" value={formatConfiguratorCurrency(submission.deposit)} />
                </dl>
              </aside>
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="font-display text-2xl font-bold text-text-dark">Structured JSON payload</h2>
                  <button className="btn btn-white border border-border" type="button" onClick={() => window.print()}>
                    <Printer size={18} aria-hidden="true" />
                    Print
                  </button>
                </div>
                <pre className="mt-4 max-h-[480px] overflow-auto rounded-lg bg-ink p-5 text-sm leading-relaxed text-white">
                  {JSON.stringify(submission, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="mt-8 rounded-lg bg-pale-blue p-5 text-lg font-bold text-text-mid">
              No saved payload was found. Return to the configurator to prepare a new configuration.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn-navy" to="/configure">
              Back to configurator
            </Link>
            <Link className="btn btn-white border border-border" to="/">
              Return home
            </Link>
          </div>
        </div>
      </div>
    </section>
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
