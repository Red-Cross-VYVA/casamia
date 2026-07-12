import { CheckCircle2 } from 'lucide-react'
import { forwardRef } from 'react'
import { Link } from 'react-router-dom'

import { BrandLogo } from '../BrandLogo'
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
  const totals = calculateProposalTotals(proposal)

  return (
    <article className="proposal-print-surface overflow-hidden rounded-lg border border-border bg-white shadow-soft" ref={ref}>
      <div className="border-b border-border bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandLogo />
            <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-green">
              Customer proposal
            </p>
            <h2 className="mt-2 font-display text-4xl font-black leading-tight text-text-dark">
              Home Safety Proposal
            </h2>
          </div>
          <div className="rounded-lg bg-light-blue p-4 text-sm">
            <PreviewRow label="Proposal ID" value={proposal.id} />
            <PreviewRow label="Date" value={proposal.proposalDate || 'Not set'} />
            <PreviewRow label="Valid until" value={proposal.validUntil || 'Not set'} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-8">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h3 className="text-sm font-black uppercase text-navy">Prepared for</h3>
            <p className="mt-2 font-display text-3xl font-bold text-text-dark">
              {proposal.customerName || 'Customer name'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-mid">
              {[proposal.address, proposal.area].filter(Boolean).join(', ') || 'Customer address'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-text-mid">
              {[proposal.phone, proposal.email].filter(Boolean).join(' · ') || 'Contact details'}
            </p>
          </div>
          <div className="rounded-lg bg-navy p-5 text-white">
            <p className="text-xs font-black uppercase text-white/65">Recommended plan</p>
            <p className="mt-2 font-display text-2xl font-black">{proposal.selectedPlan}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-black text-white/65">Risk</p>
                <p className="font-black">{proposal.overallRiskLevel}</p>
              </div>
              <div>
                <p className="font-black text-white/65">Score</p>
                <p className="font-black">{proposal.safetyScore || 'N/A'}/10</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-black uppercase text-navy">Executive summary</h3>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-text-mid">
            {proposal.executiveSummary || 'Executive summary will appear here.'}
          </p>
        </section>

        <section>
          <h3 className="text-sm font-black uppercase text-navy">Recommended works</h3>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="min-w-[780px] w-full text-left">
              <thead className="bg-light-blue text-xs font-black uppercase text-navy">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {proposal.lineItems.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm font-bold text-text-muted" colSpan={6}>
                      No line items added yet.
                    </td>
                  </tr>
                ) : null}
                {proposal.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-sm font-bold text-text-mid">{item.category}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-text-dark">{item.name || 'Service item'}</p>
                      {item.description ? (
                        <p className="mt-1 text-xs leading-relaxed text-text-muted">{item.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-navy">{item.priority}</td>
                    <td className="px-4 py-4 text-right text-sm text-text-mid">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-sm text-text-mid">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-4 text-right text-sm font-black text-text-dark">
                      {formatCurrency(calculateLineTotal(item))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg bg-light-blue p-5">
            <h3 className="text-sm font-black uppercase text-navy">Timeline</h3>
            <ul className="mt-4 space-y-3 text-sm text-text-mid">
              <li>
                <strong>Estimated start:</strong> {proposal.timelineStartDate || 'To be confirmed'}
              </li>
              <li>
                <strong>Estimated duration:</strong> {proposal.timelineDuration || 'To be confirmed'}
              </li>
              {proposal.timelineNotes ? <li>{proposal.timelineNotes}</li> : null}
            </ul>
          </div>
          <div className="rounded-lg bg-light-blue p-5">
            <h3 className="text-sm font-black uppercase text-navy">Grant support</h3>
            <p className="mt-4 text-sm leading-relaxed text-text-mid">{proposal.grantEligibilityNote}</p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-border p-5">
            <h3 className="text-sm font-black uppercase text-navy">Payment terms</h3>
            <p className="mt-3 text-sm leading-relaxed text-text-mid">{proposal.paymentTerms}</p>
            <p className="mt-3 flex gap-2 text-sm font-bold text-green">
              <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
              {hiddenFeeReassurance}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
              <Link className="text-navy underline-offset-4 hover:underline" to="/terms-and-conditions">
                Terms & Conditions
              </Link>
              <Link className="text-navy underline-offset-4 hover:underline" to="/terms-and-conditions#grant-management">
                Grant terms
              </Link>
            </div>
          </div>
          <div className="rounded-lg bg-navy p-5 text-white">
            <PreviewRow label="Subtotal" value={formatCurrency(totals.subtotal)} inverse />
            <PreviewRow label="Potentially grant-relevant amount" value={formatCurrency(totals.grantEligibleAmount)} inverse />
            <PreviewRow label="Deposit due" value={formatCurrency(totals.depositDue)} inverse />
            <PreviewRow label="Balance due" value={formatCurrency(totals.balanceDue)} inverse />
            <div className="mt-4 border-t border-white/15 pt-4">
              <p className="text-xs font-black uppercase text-white/65">Total estimate</p>
              <p className="font-display text-4xl font-black">{formatCurrency(totals.totalEstimate)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border p-5">
          <h3 className="text-sm font-black uppercase text-navy">Customer acceptance</h3>
          <p className="mt-3 text-sm leading-relaxed text-text-mid">
            By accepting this proposal, the customer confirms approval of the listed works, payment terms,
            and applicable service terms.
          </p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <PreviewRow label="Status" value={proposal.acceptanceStatus} />
            <PreviewRow label="Accepted by" value={proposal.acceptedBy || 'Pending'} />
            <PreviewRow label="Acceptance date" value={proposal.acceptanceDate || 'Pending'} />
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
    <div className="mb-2 flex items-start justify-between gap-4 text-sm">
      <span className={`font-extrabold uppercase ${inverse ? 'text-white/65' : 'text-text-muted'}`}>
        {label}
      </span>
      <span className={`text-right font-black ${inverse ? 'text-white' : 'text-text-dark'}`}>{value}</span>
    </div>
  )
}
