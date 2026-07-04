import type { ProposalStatus } from '../../services/proposalCalculations'

const statusClasses: Record<ProposalStatus, string> = {
  Accepted: 'bg-green/10 text-green',
  Completed: 'bg-navy/10 text-navy',
  'Deposit Paid': 'bg-blue/10 text-blue',
  Draft: 'bg-light-blue text-navy',
  Scheduled: 'bg-gold/15 text-[#9b6812]',
  Sent: 'bg-white text-navy ring-1 ring-border',
}

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black uppercase ${statusClasses[status]}`}
    >
      {status}
    </span>
  )
}
