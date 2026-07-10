import { FileText, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { ProposalTable } from '../../components/internal/ProposalTable'
import { StatCard } from '../../components/internal/StatCard'
import type { ProposalData } from '../../services/proposalCalculations'
import { getProposalApiStatus, loadProposalsWithFallback } from '../../services/proposalsApi'
import { loadAllProposals } from '../../services/proposalsStorage'

export function InternalProposalsPage() {
  const [proposals, setProposals] = useState<ProposalData[]>(() => loadAllProposals())
  const [sourceMessage, setSourceMessage] = useState(getProposalApiStatus())

  useEffect(() => {
    document.title = 'Proposals | CasaMia Operations'

    loadProposalsWithFallback().then((result) => {
      setProposals(result.proposals)
      setSourceMessage(result.source === 'backend' ? 'Connected to proposal backend.' : getProposalApiStatus())
    })
  }, [])

  return (
    <InternalLayout
      title="Proposals"
      subtitle="Create, review, print, and track professional customer-facing proposals."
      actions={
        <Link className="btn btn-green" to="/internal/proposal-generator">
          <Plus size={18} aria-hidden="true" />
          Create Proposal
        </Link>
      }
    >
      <p className="mb-5 rounded-lg bg-light-blue px-4 py-3 text-sm font-bold text-text-mid">
        {sourceMessage}
      </p>

      <section className="mb-6 grid gap-5 md:grid-cols-3">
        <StatCard
          accent="navy"
          icon={FileText}
          label="Total proposals"
          value={String(proposals.length)}
        />
        <StatCard
          accent="green"
          icon={FileText}
          label="Accepted"
          value={String(proposals.filter((proposal) => proposal.status === 'Accepted').length)}
        />
        <StatCard
          accent="gold"
          icon={FileText}
          label="Awaiting deposit"
          value={String(proposals.filter((proposal) => proposal.status === 'Sent').length)}
        />
      </section>

      <ProposalTable proposals={proposals} />
    </InternalLayout>
  )
}
