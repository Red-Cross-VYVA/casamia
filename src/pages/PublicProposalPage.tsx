import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ProposalPreview } from '../components/internal/ProposalPreview'
import type { ProposalData } from '../services/proposalCalculations'
import { acceptPublicProposal, loadPublicProposal } from '../services/proposalsApi'

export function PublicProposalPage() {
  const { token = '' } = useParams()
  const [acceptedBy, setAcceptedBy] = useState('')
  const [error, setError] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [proposal, setProposal] = useState<ProposalData | null>(null)

  useEffect(() => {
    document.title = 'Your CasaMia Proposal'
    setIsLoading(true)
    setError('')

    loadPublicProposal(token)
      .then((loadedProposal) => {
        setProposal(loadedProposal)
        setAcceptedBy(loadedProposal.customerName)
      })
      .catch(() => {
        setError('We could not load this proposal link. Please contact CasaMia for assistance.')
      })
      .finally(() => setIsLoading(false))
  }, [token])

  async function handleAccept() {
    if (!proposal) {
      return
    }

    setIsAccepting(true)
    setError('')

    try {
      const acceptedProposal = await acceptPublicProposal(token, acceptedBy || proposal.customerName)

      if (acceptedProposal) {
        setProposal(acceptedProposal)
      }

      setIsAccepted(true)
    } catch {
      setError('We could not accept this proposal online. Please contact CasaMia and we will help you.')
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="site-shell min-h-[70vh] py-20">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-8 text-center shadow-soft">
          <Loader2 className="mx-auto animate-spin text-navy" size={34} aria-hidden="true" />
          <h1 className="mt-5 font-display text-4xl font-bold text-text-dark">Loading your proposal</h1>
        </div>
      </main>
    )
  }

  if (error && !proposal) {
    return (
      <main className="site-shell min-h-[70vh] py-20">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-8 text-center shadow-soft">
          <ShieldCheck className="mx-auto text-navy" size={40} aria-hidden="true" />
          <h1 className="mt-5 font-display text-4xl font-bold text-text-dark">Proposal link unavailable</h1>
          <p className="mt-4 text-text-mid">{error}</p>
          <Link className="btn btn-green mt-6" to="/why-us#contact-form">
            Contact CasaMia
          </Link>
        </div>
      </main>
    )
  }

  if (!proposal) {
    return null
  }

  return (
    <main className="site-shell bg-pale-blue py-12 md:py-16">
      <section className="mx-auto mb-8 max-w-5xl rounded-lg border border-border bg-white p-6 shadow-soft md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div>
            <h1 className="font-display text-5xl font-bold leading-tight text-text-dark">
              Your CasaMia proposal is ready
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-mid">
              Review the recommended works, payment terms, and next steps. When everything looks right,
              you can accept the proposal securely below.
            </p>
          </div>

          <div className="rounded-lg bg-navy p-5 text-white">
            <p className="text-sm font-black uppercase text-white/65">Proposal</p>
            <p className="mt-2 font-display text-3xl font-black">{proposal.id}</p>
            <p className="mt-3 text-sm text-white/75">{proposal.selectedPlan}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8">
        <ProposalPreview proposal={proposal} />

        <div className="rounded-lg border border-border bg-white p-6 shadow-soft md:p-8">
          {isAccepted || proposal.status === 'Accepted' ? (
            <div className="rounded-lg bg-green/10 p-6">
              <CheckCircle2 className="text-green" size={34} aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl font-bold text-text-dark">Proposal accepted</h2>
              <p className="mt-2 text-text-mid">
                Thank you. CasaMia will contact you shortly to confirm next steps.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl font-bold text-text-dark">Accept proposal</h2>
              <p className="mt-2 text-text-mid">
                By accepting, you confirm approval of the listed works, payment terms, and applicable
                service terms.
              </p>
              <label className="mt-5 grid gap-2">
                <span className="text-sm font-extrabold text-text-dark">Accepted by</span>
                <input
                  className="min-h-12 rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15"
                  value={acceptedBy}
                  onChange={(event) => setAcceptedBy(event.target.value)}
                />
              </label>
              {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
              <button className="btn btn-green mt-5" type="button" disabled={isAccepting} onClick={handleAccept}>
                {isAccepting ? 'Accepting...' : 'Accept Proposal'}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
