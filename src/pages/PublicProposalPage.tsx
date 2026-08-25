import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { ProposalPreview } from '../components/internal/ProposalPreview'
import { SEO } from '../components/SEO'
import type { ProposalData } from '../services/proposalCalculations'
import {
  acceptPublicProposal,
  createProposalDepositCheckout,
  getProposalDepositCheckoutStatus,
  loadPublicProposal,
} from '../services/proposalsApi'

export function PublicProposalPage() {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.startsWith('es')
  const copy = isSpanish
    ? {
        title: 'Tu propuesta CasaMia',
        loadError: 'No hemos podido cargar este enlace de propuesta. Contacta con CasaMia para recibir ayuda.',
        acceptError: 'No hemos podido aceptar esta propuesta online. Contacta con CasaMia y te ayudaremos.',
        loading: 'Cargando tu propuesta',
        unavailableTitle: 'Enlace de propuesta no disponible',
        contact: 'Contactar con CasaMia',
        readyTitle: 'Tu propuesta CasaMia está lista',
        readyBody:
          'Revisa los trabajos recomendados, las condiciones de pago y los próximos pasos. Cuando todo esté correcto, puedes aceptar la propuesta de forma segura abajo.',
        pendingTitle: 'Este enlace todavía no está listo para aceptar',
        pendingBody:
          'Si has recibido este enlace, CasaMia puede ayudarte a activar la propuesta o generar una nueva desde Planes.',
        pendingNotice: 'Propuesta no activada',
        proposalLabel: 'Propuesta',
        acceptedTitle: 'Propuesta aceptada',
        acceptedBody: 'Tu propuesta está aceptada. Continúa con el pago seguro para reservar los trabajos.',
        paidTitle: 'Pago recibido',
        paidBody: 'Hemos recibido tu pago. CasaMia contactará contigo para coordinar la fecha de los trabajos.',
        payButton: (percent: number) => (percent >= 100 ? 'Pagar ahora' : `Pagar ${percent}% ahora`),
        paying: 'Abriendo pago seguro...',
        paymentError: 'La propuesta está aceptada, pero no hemos podido abrir el pago seguro. Inténtalo de nuevo.',
        paymentCancelled: 'El pago no se ha completado. Tu propuesta sigue aceptada y puedes reanudar el pago cuando quieras.',
        paymentChecking: 'Confirmando tu pago...',
        paymentPending: 'Stripe está procesando el pago. No vuelvas a pagar; actualiza esta página dentro de unos minutos.',
        acceptTitle: 'Aceptar propuesta',
        acceptBody:
          'Al aceptar, confirmas la aprobación de los trabajos indicados, las condiciones de pago y los términos de servicio aplicables.',
        acceptedBy: 'Aceptada por',
        accepting: 'Aceptando...',
        acceptButton: 'Aceptar propuesta',
      }
    : {
        title: 'Your CasaMia Proposal',
        loadError: 'We could not load this proposal link. Please contact CasaMia for assistance.',
        acceptError: 'We could not accept this proposal online. Please contact CasaMia and we will help you.',
        loading: 'Loading your proposal',
        unavailableTitle: 'Proposal link unavailable',
        contact: 'Contact CasaMia',
        readyTitle: 'Your CasaMia proposal is ready',
        readyBody:
          'Review the recommended works, payment terms, and next steps. When everything looks right, you can accept the proposal securely below.',
        pendingTitle: 'This link is not ready for acceptance yet',
        pendingBody:
          'If you received this link, CasaMia can help activate the proposal or generate a fresh one from Plans.',
        pendingNotice: 'Proposal not activated',
        proposalLabel: 'Proposal',
        acceptedTitle: 'Proposal accepted',
        acceptedBody: 'Your proposal is accepted. Continue to secure payment to reserve the works.',
        paidTitle: 'Payment received',
        paidBody: 'We have received your payment. CasaMia will contact you to coordinate the works date.',
        payButton: (percent: number) => (percent >= 100 ? 'Pay now' : `Pay ${percent}% now`),
        paying: 'Opening secure payment...',
        paymentError: 'Your proposal is accepted, but secure payment could not be opened. Please try again.',
        paymentCancelled: 'Payment was not completed. Your proposal remains accepted and you can resume payment at any time.',
        paymentChecking: 'Confirming your payment...',
        paymentPending: 'Stripe is processing the payment. Do not pay again; refresh this page in a few minutes.',
        acceptTitle: 'Accept proposal',
        acceptBody:
          'By accepting, you confirm approval of the listed works, payment terms, and applicable service terms.',
        acceptedBy: 'Accepted by',
        accepting: 'Accepting...',
        acceptButton: 'Accept Proposal',
      }
  const { token = '' } = useParams()
  const [searchParams] = useSearchParams()
  const paymentResult = searchParams.get('payment')
  const checkoutSessionId = searchParams.get('session_id') ?? ''
  const [acceptedBy, setAcceptedBy] = useState('')
  const [error, setError] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isStartingPayment, setIsStartingPayment] = useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
  const [isPaymentPending, setIsPaymentPending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const paymentPercent = Math.round((proposal?.depositRate ?? 1) * 100)

  useEffect(() => {
    document.title = copy.title
    setIsLoading(true)
    setError('')

    async function loadProposalAndPayment() {
      try {
        let loadedProposal = await loadPublicProposal(token)
        if (paymentResult === 'success' && checkoutSessionId) {
          try {
            setIsVerifyingPayment(true)
            const paymentStatus = await getProposalDepositCheckoutStatus(token, checkoutSessionId)
            if (paymentStatus.paymentStatus === 'paid') {
              loadedProposal = await loadPublicProposal(token)
            } else {
              setIsPaymentPending(true)
            }
          } catch {
            setError(copy.paymentError)
          }
        }
        setProposal(loadedProposal)
        setAcceptedBy(loadedProposal.customerName)
      } catch {
        setError(copy.loadError)
      } finally {
        setIsLoading(false)
        setIsVerifyingPayment(false)
      }
    }

    void loadProposalAndPayment()
  }, [checkoutSessionId, copy.loadError, copy.paymentError, copy.title, paymentResult, token])

  async function beginPayment(currentProposal: ProposalData) {
    setIsStartingPayment(true)
    setError('')

    try {
      const checkout = await createProposalDepositCheckout(token, i18n.language)
      window.location.assign(checkout.checkoutUrl)
    } catch {
      setProposal(currentProposal)
      setError(copy.paymentError)
      setIsStartingPayment(false)
    }
  }

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
        await beginPayment(acceptedProposal)
      } else {
        const refreshedProposal = await loadPublicProposal(token)
        setProposal(refreshedProposal)
        await beginPayment(refreshedProposal)
      }
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
  const isDepositPaid = proposal.status === 'Deposit Paid' || proposal.status === 'Scheduled' || proposal.status === 'Completed'
  const isProposalAccepted = proposal.status === 'Accepted' || isDepositPaid

  return (
    <>
      <SEO title={copy.title} description={copy.readyBody} path={`/proposal/${token}`} noindex />
      <main className="site-shell bg-pale-blue py-12 md:py-16">
        <section className="mx-auto mb-8 max-w-5xl rounded-lg border border-border bg-white p-6 shadow-soft md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight text-text-dark sm:text-5xl">
              {isPendingReview ? copy.pendingTitle : copy.readyTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-mid">
              {isPendingReview ? copy.pendingBody : copy.readyBody}
            </p>
          </div>

          <div className="rounded-lg bg-navy p-5 text-white">
            <p className="text-sm font-black uppercase text-white/65">{copy.proposalLabel}</p>
            <p className="mt-2 break-words font-display text-2xl font-black sm:text-3xl">{proposal.id}</p>
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
          ) : isDepositPaid ? (
            <div className="rounded-lg bg-green/10 p-6">
              <CheckCircle2 className="text-green" size={34} aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl font-bold text-text-dark">{copy.paidTitle}</h2>
              <p className="mt-2 text-text-mid">{copy.paidBody}</p>
            </div>
          ) : isProposalAccepted ? (
            <div className="rounded-lg bg-green/10 p-6">
              <CheckCircle2 className="text-green" size={34} aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl font-bold text-text-dark">{copy.acceptedTitle}</h2>
              <p className="mt-2 text-text-mid">{copy.acceptedBody}</p>
              {paymentResult === 'cancelled' ? (
                <p className="mt-4 rounded-lg bg-white p-4 text-sm font-bold text-text-mid">{copy.paymentCancelled}</p>
              ) : null}
              {isPaymentPending ? (
                <p className="mt-4 rounded-lg bg-white p-4 text-sm font-bold text-text-mid">{copy.paymentPending}</p>
              ) : null}
              {isVerifyingPayment ? <p className="mt-4 text-sm font-bold text-text-mid">{copy.paymentChecking}</p> : null}
              {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
              <button
                className="btn btn-green mt-5"
                type="button"
                disabled={isStartingPayment || isVerifyingPayment || isPaymentPending}
                onClick={() => void beginPayment(proposal)}
              >
                {isStartingPayment ? <Loader2 className="animate-spin" size={19} aria-hidden="true" /> : <CreditCard size={19} aria-hidden="true" />}
                {isStartingPayment ? copy.paying : copy.payButton(paymentPercent)}
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl font-bold text-text-dark">{copy.acceptTitle}</h2>
              <p className="mt-2 text-text-mid">{copy.acceptBody}</p>
              <label className="mt-5 grid gap-2">
                <span className="text-sm font-extrabold text-text-dark">{copy.acceptedBy}</span>
                <input
                  className="min-h-12 min-w-0 rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15"
                  value={acceptedBy}
                  onChange={(event) => setAcceptedBy(event.target.value)}
                />
              </label>
              {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
              <button className="btn btn-green mt-5" type="button" disabled={isAccepting} onClick={handleAccept}>
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
