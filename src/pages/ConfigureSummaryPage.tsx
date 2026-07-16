import { ArrowRight, CheckCircle2, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useConfigurator } from '../context/ConfiguratorContext'
import {
  calculateConfiguratorQuote,
  formatConfiguratorCurrency,
} from '../services/configuratorPricing'
import { useServiceCatalogue } from '../services/serviceCatalogue'

export function ConfigureSummaryPage() {
  const { state } = useConfigurator()
  const serviceCatalogue = useServiceCatalogue()
  const quote = calculateConfiguratorQuote(state)
  const selectedServices = serviceCatalogue.services.filter((item) =>
    quote.selectedServices.some((selection) => selection.serviceId === item.id),
  )

  return (
    <section className="bg-light-blue pt-28">
      <div className="site-shell py-14 md:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">
              <span className="dot" aria-hidden="true" />
              Recommendation summary
            </span>
            <h1 className="display-title mt-5">Your safer home plan</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-mid">
              Review the selected improvements, estimate and anything CasaMia should confirm before the final quote.
            </p>
          </div>
          <button className="btn btn-white border border-border" type="button" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" />
            Print
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-6">
            {selectedServices.length === 0 ? (
              <div className="rounded-lg border border-border bg-white p-6 shadow-soft">
                <h2 className="font-display text-3xl font-bold text-text-dark">No improvements selected yet</h2>
                <p className="mt-2 text-lg leading-relaxed text-text-mid">
                  Go back to choose the rooms and safety services you want CasaMia to review.
                </p>
                <Link className="btn btn-white mt-5 w-fit border border-border" to="/configure">
                  Back to configurator
                </Link>
              </div>
            ) : null}

            {selectedServices.map((item) => (
              <article className="rounded-lg border border-border bg-white p-6 shadow-soft" key={item.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">{item.name}</h2>
                    <p className="mt-2 text-lg text-text-mid">{item.customerBenefit}</p>
                  </div>
                  <span className="rounded-full bg-pale-blue px-4 py-2 text-sm font-black uppercase text-navy">
                    Qty {quote.selectedServices.find((selection) => selection.serviceId === item.id)?.quantity ?? 1}
                  </span>
                </div>
                <ComponentList title="Included" items={item.includedItems ?? []} />
              </article>
            ))}

            {quote.quotationOnlyItems.length > 0 ? (
              <ComponentList
                boxed
                title="Quotation-only items"
                items={quote.quotationOnlyItems.map((component) => component.label)}
              />
            ) : null}

            {quote.siteConfirmationItems.length > 0 ? (
              <ComponentList
                boxed
                title="Requires site confirmation"
                items={quote.siteConfirmationItems.map((item) => `${item.label}: ${item.reason}`)}
              />
            ) : null}
          </div>

          <aside className="h-fit rounded-lg border border-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-text-dark">Estimate</h2>
            <div className="mt-5 grid gap-3">
              {quote.lines.map((line) => (
                <div className="flex justify-between gap-4 border-b border-border pb-3 text-base" key={line.id}>
                  <span className="font-bold text-text-mid">{line.label}</span>
                  <strong className="text-right text-text-dark">
                    {line.quotationOnly
                      ? 'Quote after review'
                      : line.recurringMonthly
                      ? `${formatConfiguratorCurrency(line.recurringMonthly)} / month`
                      : formatConfiguratorCurrency(line.total)}
                  </strong>
                </div>
              ))}
            </div>
            <dl className="mt-6 grid gap-3 text-lg">
              <SummaryRow label="Subtotal" value={formatConfiguratorCurrency(quote.oneTimeSubtotal)} />
              <SummaryRow label="VAT estimate" value={formatConfiguratorCurrency(quote.vat)} />
              <SummaryRow label="Total estimate" value={formatConfiguratorCurrency(quote.totalEstimate)} important />
              <SummaryRow label="Monthly support" value={formatConfiguratorCurrency(quote.recurringMonthlySubtotal)} />
              <SummaryRow label="Visit deposit if booked" value={formatConfiguratorCurrency(quote.deposit)} />
            </dl>
            <Link className="btn btn-navy mt-6 w-full" to="/configure/contact">
              Request quote or reserve visit
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  )
}

function ComponentList({
  boxed = false,
  items,
  title,
}: {
  boxed?: boolean
  items: string[]
  title: string
}) {
  if (items.length === 0) {
    return null
  }

  const content = (
    <>
      <h3 className="font-display text-2xl font-bold text-text-dark">{title}</h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li className="flex gap-2 text-base font-bold text-text-mid" key={item}>
            <CheckCircle2 className="mt-1 shrink-0 text-blue" size={17} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </>
  )

  return boxed ? <section className="rounded-lg border border-border bg-white p-6 shadow-soft">{content}</section> : <div className="mt-6">{content}</div>
}

function SummaryRow({ important = false, label, value }: { important?: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={important ? 'font-black text-text-dark' : 'font-bold text-text-mid'}>{label}</dt>
      <dd className={important ? 'font-display text-3xl font-bold text-navy' : 'font-black text-text-dark'}>{value}</dd>
    </div>
  )
}
