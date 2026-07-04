import {
  calculateProposalTotals,
  formatCurrency,
  type ProposalData,
} from '../../services/proposalCalculations'

export function ProposalTotals({ proposal }: { proposal: ProposalData }) {
  const totals = calculateProposalTotals(proposal)

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
      <h2 className="font-display text-3xl font-bold text-text-dark">Proposal Totals</h2>
      <div className="mt-5 grid gap-3">
        <TotalRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
        <TotalRow label="Estimated grant eligible amount" value={formatCurrency(totals.grantEligibleAmount)} />
        <TotalRow label="Deposit due" value={formatCurrency(totals.depositDue)} />
        <TotalRow label="Balance due upon completion" value={formatCurrency(totals.balanceDue)} />
        <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-navy p-4 text-white">
          <span className="text-sm font-black uppercase">Total estimate</span>
          <span className="font-display text-3xl font-black">{formatCurrency(totals.totalEstimate)}</span>
        </div>
      </div>
    </section>
  )
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-light-blue px-4 py-3">
      <span className="text-sm font-extrabold text-text-mid">{label}</span>
      <span className="text-lg font-black text-text-dark">{value}</span>
    </div>
  )
}
