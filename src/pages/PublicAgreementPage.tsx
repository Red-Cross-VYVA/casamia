import { CheckCircle2, Download, FileText, Loader2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AgreementDocument } from '../components/agreements/AgreementDocument'
import { SEO } from '../components/SEO'
import {
  acknowledgePublicAgreement,
  downloadAgreementDocx,
  getAgreementVersion,
  loadPublicAgreementAssignment,
  printAgreementPdf,
  type AgreementAssignment,
} from '../services/agreementManagement'

const spanishCopy = {
  acknowledgeBody:
    'Esta acción crea un evento de auditoría y prepara el expediente para una futura firma digital o firma manual.',
  acknowledgeButton: 'Confirmar recepción',
  acknowledgeTitle: 'Confirmar recepción para revisión',
  acknowledgedBody:
    'CasaMia ha registrado que el documento fue recibido para revisión. El siguiente paso será completar la firma por el canal acordado.',
  acknowledgedTitle: 'Revisión registrada',
  assignment: 'Asignación',
  confirming: 'Registrando...',
  contact: 'Contactar con CasaMia',
  docx: 'Descargar DOCX',
  eyebrow: 'Revisión segura de colaborador',
  loadError: 'No hemos podido cargar este enlace de acuerdo. Contacta con CasaMia para recibir ayuda.',
  loading: 'Cargando acuerdo',
  nameLabel: 'Nombre de la persona que revisa',
  pdf: 'Exportar PDF',
  readyBody:
    'Revisa el documento, descarga una copia y confirma que queda recibido para revisión. Esta confirmación no sustituye una firma electrónica.',
  readyTitle: 'Tu acuerdo CasaMia está listo.',
  title: 'Acuerdo de colaborador CasaMia',
  unavailable: 'Enlace no disponible',
  updateError: 'No hemos podido registrar la confirmación de revisión. Contacta con CasaMia para continuar.',
}

const englishCopy = {
  acknowledgeBody:
    'This action creates an audit event and prepares the file for a future digital or manual signature.',
  acknowledgeButton: 'Confirm receipt',
  acknowledgeTitle: 'Confirm receipt for review',
  acknowledgedBody:
    'CasaMia has recorded that the document was received for review. The next step is to complete signature through the agreed channel.',
  acknowledgedTitle: 'Review recorded',
  assignment: 'Assignment',
  confirming: 'Recording...',
  contact: 'Contact CasaMia',
  docx: 'Download DOCX',
  eyebrow: 'Secure collaborator review',
  loadError: 'We could not load this agreement link. Contact CasaMia for help.',
  loading: 'Loading agreement',
  nameLabel: 'Name of the person reviewing',
  pdf: 'Export PDF',
  readyBody:
    'Review the document, download a copy and confirm it has been received for review. This confirmation does not replace an electronic signature.',
  readyTitle: 'Your CasaMia agreement is ready.',
  title: 'CasaMia partner agreement',
  unavailable: 'Link unavailable',
  updateError: 'We could not record the review confirmation. Contact CasaMia to continue.',
}

export function PublicAgreementPage() {
  const { token = '' } = useParams()
  const [acceptedBy, setAcceptedBy] = useState('')
  const [assignment, setAssignment] = useState<AgreementAssignment | null>(null)
  const [error, setError] = useState('')
  const [isAcknowledging, setIsAcknowledging] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const version = assignment
    ? getAgreementVersion(assignment.documentId, assignment.version, assignment.locale)
    : undefined
  const copy = version?.locale === 'en' ? englishCopy : spanishCopy

  useEffect(() => {
    document.title = 'CasaMia partner agreement'
    setIsLoading(true)
    setError('')

    loadPublicAgreementAssignment(token)
      .then((loadedAssignment) => {
        setAssignment(loadedAssignment)
        setAcceptedBy(loadedAssignment.partnerContactName)
      })
      .catch(() => setError(spanishCopy.loadError))
      .finally(() => setIsLoading(false))
  }, [token])

  async function handleAcknowledge() {
    if (!assignment || !acceptedBy.trim()) return

    setIsAcknowledging(true)
    setError('')
    try {
      const updated = await acknowledgePublicAgreement(token, acceptedBy.trim())
      setAssignment(updated)
    } catch {
      setError(copy.updateError)
    } finally {
      setIsAcknowledging(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <SEO title={copy.title} description="Secure CasaMia partner agreement review link." path={`/agreement/${token}`} noindex />
        <main className="site-shell min-h-[70vh] py-20">
          <div className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-8 text-center shadow-soft">
            <Loader2 className="mx-auto animate-spin text-navy" size={34} aria-hidden="true" />
            <h1 className="mt-5 font-display text-4xl font-bold text-text-dark">{copy.loading}</h1>
          </div>
        </main>
      </>
    )
  }

  if (error && !assignment) {
    return (
      <>
        <SEO title={copy.title} description="Secure CasaMia partner agreement review link." path={`/agreement/${token}`} noindex />
        <main className="site-shell min-h-[70vh] py-20">
          <div className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-8 text-center shadow-soft">
            <ShieldCheck className="mx-auto text-navy" size={40} aria-hidden="true" />
            <h1 className="mt-5 font-display text-4xl font-bold text-text-dark">{copy.unavailable}</h1>
            <p className="mt-4 text-text-mid">{error}</p>
            <Link className="btn btn-green mt-6" to="/provider-partners">
              {copy.contact}
            </Link>
          </div>
        </main>
      </>
    )
  }

  if (!assignment || !version) return null

  const isAcknowledged = Boolean(assignment.acknowledgedAt) || assignment.status === 'under-review'

  return (
    <>
      <SEO title={version.title} description="Secure CasaMia partner agreement review link." path={`/agreement/${token}`} noindex />
      <main className="site-shell bg-pale-blue py-10 md:py-14">
        <section className="mx-auto mb-7 max-w-5xl rounded-lg border border-border bg-white p-6 shadow-soft md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue">
                {copy.eyebrow}
              </p>
              <h1 className="mt-2 font-display text-5xl font-bold leading-tight text-text-dark">
                {copy.readyTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-bold leading-relaxed text-text-mid">
                {copy.readyBody}
              </p>
            </div>
            <div className="rounded-lg bg-navy p-5 text-white">
              <p className="text-sm font-black uppercase text-white/65">{copy.assignment}</p>
              <p className="mt-2 font-display text-3xl font-black">{assignment.assignmentId}</p>
              <p className="mt-3 text-sm text-white/75">{assignment.partnerBusinessName}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn btn-white" type="button" onClick={() => printAgreementPdf(assignment, version)}>
              <Download size={17} aria-hidden="true" />
              {copy.pdf}
            </button>
            <button className="btn btn-white" type="button" onClick={() => downloadAgreementDocx(assignment, version)}>
              <FileText size={17} aria-hidden="true" />
              {copy.docx}
            </button>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-7">
          <AgreementDocument assignment={assignment} version={version} />

          <article className="rounded-lg border border-border bg-white p-6 shadow-soft md:p-8">
            {isAcknowledged ? (
              <div className="rounded-lg bg-green/10 p-6">
                <CheckCircle2 className="text-green" size={34} aria-hidden="true" />
                <h2 className="mt-4 font-display text-3xl font-bold text-text-dark">{copy.acknowledgedTitle}</h2>
                <p className="mt-2 text-text-mid">{copy.acknowledgedBody}</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-3xl font-bold text-text-dark">{copy.acknowledgeTitle}</h2>
                <p className="mt-2 text-text-mid">{copy.acknowledgeBody}</p>
                <label className="mt-5 grid gap-2">
                  <span className="text-sm font-extrabold text-text-dark">{copy.nameLabel}</span>
                  <input
                    className="min-h-12 rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15"
                    value={acceptedBy}
                    onChange={(event) => setAcceptedBy(event.target.value)}
                  />
                </label>
                {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
                <button
                  className="btn btn-green mt-5"
                  disabled={isAcknowledging || !acceptedBy.trim()}
                  type="button"
                  onClick={() => void handleAcknowledge()}
                >
                  {isAcknowledging ? copy.confirming : copy.acknowledgeButton}
                </button>
              </>
            )}
          </article>
        </section>
      </main>
    </>
  )
}
