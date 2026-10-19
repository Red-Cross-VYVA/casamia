import { CheckCircle2 } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BrandLogo } from '../BrandLogo'
import { spanishProposalPreviewCopy } from '../../constants/proposalPreviewCopy'
import {
  calculateLineTotal,
  calculateProposalTotals,
  formatCurrency,
  hiddenFeeReassurance,
  type ProposalData,
} from '../../services/proposalCalculations'

export const ProposalPreview = forwardRef<HTMLDivElement, { proposal: ProposalData }>(function ProposalPreview(
  { proposal },
  ref,
) {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.startsWith('es')
  const label = (value: string) => isSpanish ? spanishProposalPreviewCopy[value] ?? value : value
  const money = (value: number) => formatCurrency(value, isSpanish ? 'es-ES' : 'en-GB')
  const totals = calculateProposalTotals(proposal)

  return (
    <article className="proposal-print-surface min-w-0 w-full overflow-hidden rounded-lg border border-border bg-white shadow-soft" ref={ref}>
      <div className="border-b border-border bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <BrandLogo />
            <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-green">
              {label("Customer proposal")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight text-text-dark sm:text-4xl">
              {label("Home Safety Proposal")}
            </h2>
          </div>
          <div className="min-w-0 rounded-lg bg-light-blue p-4 text-sm sm:w-[280px]">
            <PreviewRow label={label("Proposal ID")} value={proposal.id} />
            <PreviewRow label={label("Date")} value={proposal.proposalDate || label("Not set")} />
            <PreviewRow label={label("Valid until")} value={proposal.validUntil || label("Not set")} />
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-8 p-6 sm:p-8">
        <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase text-navy">{label("Prepared for")}</h3>
            <p className="mt-2 break-words font-display text-3xl font-bold text-text-dark">
              {proposal.customerName || label("Customer name")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-mid">
              {[proposal.address, proposal.area].filter(Boolean).join(', ') || label("Customer address")}
            </p>
            <p className="mt-1 break-words text-sm leading-relaxed text-text-mid">
              {[proposal.phone, proposal.email].filter(Boolean).join(' · ') || label("Contact details")}
            </p>
          </div>
          <div className="rounded-lg bg-navy p-5 text-white">
            <p className="text-xs font-black uppercase text-white/65">{label("CasaMia plan")}</p>
            <p className="mt-2 break-words font-display text-2xl font-black">{label(proposal.selectedPlan)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-black text-white/65">{label("Risk")}</p>
                <p className="font-black">{label(proposal.overallRiskLevel)}</p>
              </div>
              <div>
                <p className="font-black text-white/65">{label("Score")}</p>
                <p className="font-black">{proposal.safetyScore || label("N/A")}/10</p>
              </div>
            </div>
          </div>
        </section>

        <section className="min-w-0">
          <h3 className="text-sm font-black uppercase text-navy">{label("Customer summary")}</h3>
          <p className="mt-3 max-w-4xl break-words text-base leading-relaxed text-text-mid">
            {proposal.executiveSummary || label("Executive summary will appear here.")}
          </p>
        </section>

        <section className="min-w-0">
          <h3 className="text-sm font-black uppercase text-navy">{label("Selected improvements")}</h3>
          <div className="mt-4 grid gap-3 md:hidden">
            {proposal.lineItems.length === 0 ? (
              <p className="rounded-lg border border-border p-4 text-sm font-bold text-text-muted">
                {label("No line items added yet.")}
              </p>
            ) : null}
            {proposal.lineItems.map((item) => (
              <article className="min-w-0 rounded-lg border border-border p-4" key={`mobile-${item.id}`}>
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase text-navy">{item.category}</p>
                    <p className="mt-1 break-words text-sm font-black text-text-dark">{item.name || label("Service item")}</p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-text-dark">
                    {money(calculateLineTotal(item))}
                  </p>
                </div>
                {item.description ? (
                  <p className="mt-2 break-words text-xs leading-relaxed text-text-muted">{item.description}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-mid">
                  <span><strong>{label("Priority:")}</strong> {label(item.priority)}</span>
                  <span><strong>{label("Qty:")}</strong> {item.quantity}</span>
                  <span><strong>{label("Unit:")}</strong> {money(item.unitPrice)}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-4 hidden min-w-0 max-w-full overflow-x-auto rounded-lg border border-border md:block">
            <table className="min-w-[780px] w-full text-left">
              <thead className="bg-light-blue text-xs font-black uppercase text-navy">
                <tr>
                  <th className="px-4 py-3">{label("Category")}</th>
                  <th className="px-4 py-3">{label("Service")}</th>
                  <th className="px-4 py-3">{label("Priority")}</th>
                  <th className="px-4 py-3 text-right">{label("Qty")}</th>
                  <th className="px-4 py-3 text-right">{label("Unit")}</th>
                  <th className="px-4 py-3 text-right">{label("Total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {proposal.lineItems.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm font-bold text-text-muted" colSpan={6}>
                      {label("No line items added yet.")}
                    </td>
                  </tr>
                ) : null}
                {proposal.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-sm font-bold text-text-mid">{item.category}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-text-dark">{item.name || label("Service item")}</p>
                      {item.description ? (
                        <p className="mt-1 text-xs leading-relaxed text-text-muted">{item.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-navy">{label(item.priority)}</td>
                    <td className="px-4 py-4 text-right text-sm text-text-mid">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-sm text-text-mid">{money(item.unitPrice)}</td>
                    <td className="px-4 py-4 text-right text-sm font-black text-text-dark">
                      {money(calculateLineTotal(item))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid min-w-0 gap-5 lg:grid-cols-2">
          <div className="rounded-lg bg-light-blue p-5">
            <h3 className="text-sm font-black uppercase text-navy">{label("Timeline")}</h3>
            <ul className="mt-4 space-y-3 text-sm text-text-mid">
              <li>
                <strong>{label("Estimated start:")}</strong> {proposal.timelineStartDate || label("To be confirmed")}
              </li>
              <li>
                <strong>{label("Estimated duration:")}</strong> {proposal.timelineDuration || label("To be confirmed")}
              </li>
              {proposal.timelineNotes ? <li>{proposal.timelineNotes}</li> : null}
            </ul>
          </div>
          <div className="rounded-lg bg-light-blue p-5">
            <h3 className="text-sm font-black uppercase text-navy">{label("Grant support")}</h3>
            <p className="mt-4 text-sm leading-relaxed text-text-mid">{proposal.grantEligibilityNote}</p>
          </div>
        </section>

        <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-border p-5">
            <h3 className="text-sm font-black uppercase text-navy">{label("Payment terms")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-text-mid">{proposal.paymentTerms}</p>
            <p className="mt-3 flex gap-2 text-sm font-bold text-green">
              <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
              {label(hiddenFeeReassurance)}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
              <Link className="text-navy underline-offset-4 hover:underline" to="/terms-and-conditions">
                {label("Terms & Conditions")}
              </Link>
              <Link className="text-navy underline-offset-4 hover:underline" to="/terms-and-conditions#grant-management">
                {label("Grant terms")}
              </Link>
            </div>
          </div>
          <div className="rounded-lg bg-navy p-5 text-white">
            <PreviewRow label={label("Subtotal")} value={money(totals.subtotal)} inverse />
            <PreviewRow label={label("Potentially grant-relevant amount")} value={money(totals.grantEligibleAmount)} inverse />
            <PreviewRow label={label("Deposit due")} value={money(totals.depositDue)} inverse />
            <PreviewRow label={label("Balance due")} value={money(totals.balanceDue)} inverse />
            <div className="mt-4 border-t border-white/15 pt-4">
              <p className="text-xs font-black uppercase text-white/65">{label("Total estimate")}</p>
              <p className="font-display text-4xl font-black">{money(totals.totalEstimate)}</p>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-border p-5">
          <h3 className="text-sm font-black uppercase text-navy">{label("Customer acceptance")}</h3>
          <p className="mt-3 text-sm leading-relaxed text-text-mid">
            {label("By accepting this proposal, the customer confirms approval of the listed works, payment terms, and applicable service terms.")}
          </p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <PreviewRow label={label("Status")} value={label(proposal.acceptanceStatus)} />
            <PreviewRow label={label("Accepted by")} value={proposal.acceptedBy || label("Pending")} />
            <PreviewRow label={label("Acceptance date")} value={proposal.acceptanceDate || label("Pending")} />
          </div>
        </section>
      </div>
    </article>
  )
})

function PreviewRow({
  inverse = false,
  label,
  value,
}: {
  inverse?: boolean
  label: string
  value: string
}) {
  return (
    <div className="mb-2 flex min-w-0 items-start justify-between gap-4 text-sm">
      <span className={`font-extrabold uppercase ${inverse ? 'text-white/65' : 'text-text-muted'}`}>
        {label}
      </span>
      <span className={`min-w-0 break-words text-right font-black ${inverse ? 'text-white' : 'text-text-dark'}`}>{value}</span>
    </div>
  )
}
