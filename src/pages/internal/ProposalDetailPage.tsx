import { CheckCircle2, Link2, PenLine, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { ProposalPreview } from '../../components/internal/ProposalPreview'
import type { ProposalData } from '../../services/proposalCalculations'
import { acceptProposalWithFallback, getProposalApiStatus, loadProposalWithFallback } from '../../services/proposalsApi'
import { loadProposalById } from '../../services/proposalsStorage'

export function ProposalDetailPage() {
  const { proposalId = '' } = useParams()
  const [proposal, setProposal] = useState<ProposalData | undefined>(() => loadProposalById(proposalId))
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.title = proposal
      ? `${proposal.id} | CasaMia Proposal`
      : 'Proposal Not Found | CasaMia Operations'
  }, [proposal])

  useEffect(() => {
    setIsLoading(true)
    loadProposalWithFallback(proposalId).then((result) => {
      setProposal(result.proposal)
      setMessage(result.source === 'backend' ? 'Loaded from Supabase proposals.' : result.error ?? getProposalApiStatus())
      setIsLoading(false)
    })
  }, [proposalId])

  if (!proposal && !isLoading) {
    return <Navigate to="/internal/proposals" replace />
  }

  if (!proposal) {
    return (
      <InternalLayout title="Loading proposal" subtitle="Fetching proposal details.">
        <div className="rounded-lg border border-border bg-white p-6 shadow-soft">
          <p className="font-bold text-text-mid">Loading...</p>
        </div>
      </InternalLayout>
    )
  }

  async function markAccepted() {
    if (!proposal) {
      return
    }

    const result = await acceptProposalWithFallback(proposal)
    setProposal(result.proposal)
    setMessage(
      result.source === 'backend'
        ? 'Proposal marked as accepted in Supabase.'
        : `Proposal marked as accepted locally only. ${result.error ?? getProposalApiStatus()}`,
    )
  }

  async function copyCustomerLink() {
    if (!proposal?.publicToken) {
      setMessage('This proposal needs to be saved to Supabase before it has a customer link.')
      return
    }

    await navigator.clipboard.writeText(`${window.location.origin}/proposal/${proposal.publicToken}`)
    setMessage('Customer proposal link copied.')
  }

  return (
    <InternalLayout
      title={`Proposal ${proposal.id}`}
      subtitle="Customer-facing preview with internal controls for acceptance and printing."
      actions={
        <>
          <Link className="btn border border-border bg-white text-navy hover:border-green hover:text-green" to="/internal/proposals">
            All Proposals
          </Link>
          <Link className="btn btn-green" to={`/internal/proposal-generator?proposalId=${proposal.id}`}>
            <PenLine size={18} aria-hidden="true" />
            Edit Proposal
          </Link>
        </>
      }
    >
      <div className="proposal-screen-controls mb-6 grid gap-3 rounded-lg border border-border bg-white p-5 shadow-soft sm:grid-cols-2 xl:grid-cols-4">
        <button className="btn btn-green" type="button" onClick={markAccepted}>
          <CheckCircle2 size={18} aria-hidden="true" />
          Mark Accepted
        </button>
        <button className="btn btn-navy" type="button" onClick={() => window.print()}>
          <Printer size={18} aria-hidden="true" />
          Print Proposal
        </button>
        <button className="btn border border-border bg-white text-navy" type="button" onClick={() => void copyCustomerLink()}>
          <Link2 size={18} aria-hidden="true" />
          Copy Customer Link
        </button>
        {message ? (
          <p className="flex items-center rounded-lg bg-green/10 px-4 py-3 text-sm font-bold text-green">
            {message}
          </p>
        ) : null}
      </div>

      <ProposalPreview proposal={proposal} />
    </InternalLayout>
  )
}
