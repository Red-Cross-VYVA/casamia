import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { LocalizedLink as Link } from '../components/LocalizedLink'

import { ProposalPreview } from '../components/internal/ProposalPreview'
import { SEO } from '../components/SEO'
import type { ProposalData } from '../services/proposalCalculations'
import { acceptPublicProposal, loadPublicProposal } from '../services/proposalsApi'

export function PublicProposalPage() {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.startsWith('es')
  const copy = isSpanish
    ? {
        title: 'Tu propuesta CasaMia',
        loadError: 'No hemos podido cargar este enlace de propuesta. Contacta con CasaMia para recibir ayuda.',
        acceptError: 'No hemos podido confirmar este pedido online. Contacta con CasaMia y te ayudaremos.',
        loading: 'Cargando tu propuesta',
        unavailableTitle: 'Enlace de propuesta no disponible',
        contact: 'Contactar con CasaMia',
        readyTitle: 'Tu propuesta CasaMia est\u00e1 lista',
        readyBody:
          'Revisa los trabajos recomendados, las condiciones de pago y los pr\u00f3ximos pasos. Cuando todo est\u00e9 correcto, puedes pedir el paquete abajo.',
        pendingTitle: 'Este enlace todav\u00eda no est\u00e1 listo para aceptar',
        pendingBody:
          'Si has recibido este enlace, CasaMia puede ayudarte a activar la propuesta o generar una nueva desde Planes.',
        pendingNotice: 'Propuesta no activada',
        proposalLabel: 'Propuesta',
        acceptedTitle: 'Pedido recibido',
        acceptedBody:
          'CasaMia contactar\u00e1 contigo en breve para confirmar fecha, alcance y pr\u00f3ximos pasos de pago.',
        acceptTitle: 'Pide tu paquete CasaMia',
        acceptBody:
          'Al pedirlo, confirmas que quieres seguir adelante con los trabajos indicados. El pago se coordina despu\u00e9s de confirmar fecha y alcance con CasaMia.',
        acceptedBy: 'Tu nombre',
        accepting: 'Confirmando...',
        acceptButton: 'Pedir ahora',
      }
    : {
        title: 'Your CasaMia Proposal',
        loadError: 'We could not load this proposal link. Please contact CasaMia for assistance.',
        acceptError: 'We could not confirm this order online. Please contact CasaMia and we will help you.',
        loading: 'Loading your proposal',
        unavailableTitle: 'Proposal link unavailable',
        contact: 'Contact CasaMia',
        readyTitle: 'Your CasaMia proposal is ready',
        readyBody:
          'Review the recommended works, payment terms, and next steps. When everything looks right, you can order the package below.',
        pendingTitle: 'This link is not ready for acceptance yet',
        pendingBody:
          'If you received this link, CasaMia can help activate the proposal or generate a fresh one from Plans.',
        pendingNotice: 'Proposal not activated',
        proposalLabel: 'Proposal',
        acceptedTitle: 'Order received',
        acceptedBody:
          'CasaMia will contact you shortly to confirm scheduling, scope and next payment steps.',
        acceptTitle: 'Order your CasaMia package',
        acceptBody:
          'By ordering, you confirm that you want to continue with the listed works. Payment is coordinated after CasaMia confirms scheduling and scope with you.',
        acceptedBy: 'Your name',
        accepting: 'Confirming...',
        acceptButton: 'Order now',
      }
  const { token = '' } = useParams()
  const [acceptedBy, setAcceptedBy] = useState('')
  const [error, setError] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [proposal, setProposal] = useState<ProposalData | null>(null)

  useEffect(() => {
    document.title = copy.title
    setIsLoading(true)
    setError('')

    loadPublicProposal(token)
      .then((loadedProposal) => {
        setProposal(loadedProposal)
        setAcceptedBy(loadedProposal.customerName)
      })
      .catch(() => {
        setError(copy.loadError)
      })
      .finally(() => setIsLoading(false))
  }, [copy.loadError, copy.title, token])

  async function handleAccept() {
    if (!proposal) {
      return
    }

    setIsAccepting(true)
    setError('')

    try {
      const acceptedProposal = await acceptPublicProposal(token, acceptedBy.trim() || proposal.customerName)

      if (acceptedProposal) {
        setProposal(acceptedProposal)
      }

      setIsAccepted(true)
    } catch {
      setError(copy.acceptError)
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <SEO title={copy.title} description={copy.readyBody} path={`/proposal/${token}`} noindex />
        <main className="site-shell min-h-[70vh] py-20">
          <div className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-8 text-center shadow-soft">
            <Loader2 className="mx-auto animate-spin text-navy" size={34} aria-hidden="true" />
            <h1 className="mt-5 font-display text-4xl font-bold text-text-dark">{copy.loading}</h1>
          </div>
        </main>
      </>
    )
  }

  if (error && !proposal) {
    return (
      <>
        <SEO title={copy.title} description={copy.readyBody} path={`/proposal/${token}`} noindex />
        <main className="site-shell min-h-[70vh] py-20">
          <div className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-8 text-center shadow-soft">
            <ShieldCheck className="mx-auto text-navy" size={40} aria-hidden="true" />
            <h1 className="mt-5 font-display text-4xl font-bold text-text-dark">{copy.unavailableTitle}</h1>
            <p className="mt-4 text-text-mid">{error}</p>
            <Link className="btn btn-green mt-6" to="/why-us#contact-form">
              {copy.contact}
            </Link>
          </div>
        </main>
      </>
    )
  }

  if (!proposal) {
    return null
  }

  const isPendingReview = proposal.status === 'Draft' || proposal.acceptanceStatus === 'Not Sent'
  const requiresAcceptedBy = !proposal.customerName.trim()
  const canOrder = !requiresAcceptedBy || acceptedBy.trim().length > 0
  const isOrderReceived = isAccepted || proposal.status === 'Accepted' || proposal.acceptanceStatus === 'Accepted'

  return (
    <>
      <SEO title={copy.title} description={copy.readyBody} path={`/proposal/${token}`} noindex />
      <main className="site-shell bg-pale-blue py-12 md:py-16">
        <section className="mx-auto mb-8 max-w-5xl rounded-lg border border-border bg-white p-6 shadow-soft md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <h1 className="font-display text-5xl font-bold leading-tight text-text-dark">
                {isPendingReview ? copy.pendingTitle : copy.readyTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-mid">
                {isPendingReview ? copy.pendingBody : copy.readyBody}
              </p>
            </div>

            <div className="rounded-lg bg-navy p-5 text-white">
              <p className="text-sm font-black uppercase text-white/65">{copy.proposalLabel}</p>
              <p className="mt-2 font-display text-3xl font-black">{proposal.id}</p>
              <p className="mt-3 text-sm text-white/75">{proposal.selectedPlan}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-8">
          <ProposalPreview proposal={proposal} />

          <div className="rounded-lg border border-border bg-white p-6 shadow-soft md:p-8">
            {isPendingReview ? (
              <div className="rounded-lg bg-light-blue p-6">
                <ShieldCheck className="text-navy" size={34} aria-hidden="true" />
                <h2 className="mt-4 font-display text-3xl font-bold text-text-dark">{copy.pendingNotice}</h2>
                <p className="mt-2 text-text-mid">{copy.pendingBody}</p>
                <Link className="btn btn-green mt-5" to="/why-us#contact-form">
                  {copy.contact}
                </Link>
              </div>
            ) : isOrderReceived ? (
              <div className="rounded-lg bg-green/10 p-6">
                <CheckCircle2 className="text-green" size={34} aria-hidden="true" />
                <h2 className="mt-4 font-display text-3xl font-bold text-text-dark">{copy.acceptedTitle}</h2>
                <p className="mt-2 text-text-mid">{copy.acceptedBody}</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-3xl font-bold text-text-dark">{copy.acceptTitle}</h2>
                <p className="mt-2 text-text-mid">{copy.acceptBody}</p>
                {requiresAcceptedBy ? (
                  <label className="mt-5 grid gap-2">
                    <span className="text-sm font-extrabold text-text-dark">{copy.acceptedBy}</span>
                    <input
                      className="min-h-12 rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15"
                      value={acceptedBy}
                      onChange={(event) => setAcceptedBy(event.target.value)}
                    />
                  </label>
                ) : null}
                {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
                <button className="btn btn-green mt-5" type="button" disabled={isAccepting || !canOrder} onClick={handleAccept}>
                  {isAccepting ? copy.accepting : copy.acceptButton}
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
