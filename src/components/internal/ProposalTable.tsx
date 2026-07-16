import { ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  calculateProposalTotals,
  formatCurrency,
  type ProposalData,
} from '../../services/proposalCalculations'
import { ProposalStatusBadge } from './ProposalStatusBadge'

export function ProposalTable({ proposals }: { proposals: ProposalData[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-text-dark">Proposal pipeline</h2>
          <p className="mt-1 text-sm text-text-mid">Saved local drafts plus mock customer proposals.</p>
        </div>
        <Link className="btn btn-green w-full sm:w-auto" to="/internal/proposal-generator">
          <Plus size={18} aria-hidden="true" />
          Create Proposal
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left">
          <thead className="bg-light-blue text-xs font-black uppercase text-navy">
            <tr>
              <th className="px-5 py-4">Proposal ID</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Selected option</th>
              <th className="px-5 py-4">Total estimate</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {proposals.map((proposal) => {
              const totals = calculateProposalTotals(proposal)

              return (
                <tr className="align-middle" key={proposal.id}>
                  <td className="px-5 py-4 font-black text-navy">{proposal.id}</td>
                  <td className="px-5 py-4 font-extrabold text-text-dark">
                    {proposal.customerName || 'Unnamed customer'}
                  </td>
                  <td className="px-5 py-4 text-text-mid">{proposal.selectedPlan}</td>
                  <td className="px-5 py-4 font-black text-text-dark">
                    {formatCurrency(totals.totalEstimate)}
                  </td>
                  <td className="px-5 py-4">
                    <ProposalStatusBadge status={proposal.status} />
                  </td>
                  <td className="px-5 py-4 text-text-mid">{proposal.createdAt.slice(0, 10)}</td>
                  <td className="px-5 py-4">
                    <Link
                      className="inline-flex items-center gap-2 text-sm font-extrabold text-navy transition hover:text-green"
                      to={`/internal/proposals/${proposal.id}`}
                    >
                      View Proposal
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
