import { CheckCircle2, Printer } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { formatConfiguratorCurrency } from '../services/configuratorPricing'
import { loadSavedConfiguratorSubmission } from '../services/configuratorSubmission'
import { getConfiguredServiceById } from '../services/serviceCatalogue'

export function ConfigureConfirmationPage() {
  const [searchParams] = useSearchParams()
  const submission = loadSavedConfiguratorSubmission()
  const configurationId = searchParams.get('configuration') ?? submission?.configurationId ?? 'Prepared locally'
  const mockCheckout = searchParams.get('mockCheckout') === '1'
  const selectedServices =
    submission?.selectedServices
      ?.map((selection) => ({
        ...selection,
        service: getConfiguredServiceById(selection.serviceId),
      }))
      .filter((selection) => selection.service) ?? []

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
                  <h2 className="font-display text-2xl font-bold text-text-dark">Selected improvements</h2>
                  <button className="btn btn-white border border-border" type="button" onClick={() => window.print()}>
                    <Printer size={18} aria-hidden="true" />
                    Print
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
                            Qty {quantity}
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
                    CasaMia has saved your request. We will confirm the exact improvements before any work starts.
                  </div>
                )}

                {submission.siteConfirmationItems.length > 0 ? (
                  <div className="mt-5 rounded-lg bg-light-blue p-5">
                    <h3 className="font-display text-xl font-bold text-text-dark">To confirm before installation</h3>
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
