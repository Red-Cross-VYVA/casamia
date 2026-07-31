import {
  Copy,
  Download,
  ExternalLink,
  FileSignature,
  FileText,
  Languages,
  Link2Off,
  ScrollText,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { AgreementDocument } from '../../components/agreements/AgreementDocument'
import { InternalLayout } from '../../components/internal/InternalLayout'
import { StatCard } from '../../components/internal/StatCard'
import {
  agreementLocaleOptions,
  createAgreementAssignmentWithFallback,
  downloadAgreementDocx,
  downloadAgreementText,
  getActiveAgreementVersion,
  getAgreementVersion,
  listAgreementTemplates,
  listManagedLegalDocuments,
  loadAgreementAssignments,
  loadAgreementAssignmentsWithFallback,
  printAgreementPdf,
  updateAgreementAssignmentWithFallback,
  type AgreementAssignment,
  type AgreementAssignmentStatus,
  type AgreementLocale,
  type CreateAgreementAssignmentInput,
} from '../../services/agreementManagement'

const statusLabels: Record<AgreementAssignmentStatus, string> = {
  draft: 'Draft',
  expired: 'Expired',
  revoked: 'Revoked',
  sent: 'Sent',
  signed: 'Signed',
  'ready-for-signature': 'Ready for signature',
  'under-review': 'Under review',
  viewed: 'Viewed',
}

const statusClasses: Record<AgreementAssignmentStatus, string> = {
  draft: 'bg-light-blue text-navy',
  expired: 'bg-red-50 text-red-700',
  revoked: 'bg-red-50 text-red-700',
  sent: 'bg-blue/10 text-blue',
  signed: 'bg-green/10 text-green',
  'ready-for-signature': 'bg-gold/15 text-[#94640d]',
  'under-review': 'bg-gold/15 text-[#94640d]',
  viewed: 'bg-blue/10 text-blue',
}

export function InternalAgreementsPage() {
  const templates = listAgreementTemplates()
  const [assignments, setAssignments] = useState<AgreementAssignment[]>(() => loadAgreementAssignments())
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('')
  const [message, setMessage] = useState('Loading agreement workspace...')
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<CreateAgreementAssignmentInput>(() => ({
    assignedBy: 'CasaMia Operations',
    documentId: templates[0]?.documentId ?? 'installation-partner-agreement',
    locale: 'es',
    partnerBusinessName: '',
    partnerContactName: '',
    partnerEmail: '',
    partnerId: '',
    shareEnabled: true,
    version: templates[0]?.activeVersion ?? '1.0.0',
  }))

  useEffect(() => {
    document.title = 'Agreements | CasaMia Operations'

    loadAgreementAssignmentsWithFallback().then((result) => {
      setAssignments(result.assignments)
      setSelectedAssignmentId((current) => current || result.assignments[0]?.assignmentId || '')
      setMessage(result.source === 'backend'
        ? 'Connected to Supabase agreement assignments.'
        : result.error ?? 'Local demo mode: agreement assignments are stored in this browser.')
    })
  }, [])

  const selectedTemplate = templates.find((template) => template.documentId === form.documentId) ?? templates[0]
  const selectedVersion = getActiveAgreementVersion(form.documentId, form.locale)
    ?? selectedTemplate?.versions[0]
  const selectedAssignment = assignments.find((assignment) => assignment.assignmentId === selectedAssignmentId)
    ?? assignments[0]
  const selectedAssignmentVersion = selectedAssignment
    ? getAgreementVersion(selectedAssignment.documentId, selectedAssignment.version, selectedAssignment.locale)
    : selectedVersion
  const legalLibrary = useMemo(() => listManagedLegalDocuments('es'), [])
  const stats = useMemo(() => ({
    active: assignments.filter((assignment) => assignment.shareEnabled && !['revoked', 'expired'].includes(assignment.status)).length,
    review: assignments.filter((assignment) => ['sent', 'viewed', 'under-review'].includes(assignment.status)).length,
    signed: assignments.filter((assignment) => assignment.status === 'signed').length,
    templates: legalLibrary.length,
  }), [assignments, legalLibrary.length])

  function updateForm(patch: Partial<CreateAgreementAssignmentInput>) {
    setForm((current) => ({ ...current, ...patch }))
  }

  async function handleCreateAssignment() {
    if (!form.partnerBusinessName.trim() || !form.partnerContactName.trim() || !form.partnerEmail.trim()) {
      setMessage('Add partner business, contact name and email before assigning an agreement.')
      return
    }

    setIsSaving(true)
    try {
      const result = await createAgreementAssignmentWithFallback({
        ...form,
        partnerBusinessName: form.partnerBusinessName.trim(),
        partnerContactName: form.partnerContactName.trim(),
        partnerEmail: form.partnerEmail.trim(),
        partnerId: form.partnerId?.trim(),
      })
      setAssignments(result.assignments)
      setSelectedAssignmentId(result.assignment.assignmentId)
      setMessage(result.source === 'backend'
        ? 'Agreement assignment saved and secure share token generated.'
        : result.error ?? 'Agreement assignment created in local demo mode.')
      setForm((current) => ({
        ...current,
        partnerBusinessName: '',
        partnerContactName: '',
        partnerEmail: '',
        partnerId: '',
      }))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Agreement assignment could not be created.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatus(assignment: AgreementAssignment, status: AgreementAssignmentStatus) {
    const result = await updateAgreementAssignmentWithFallback(assignment.assignmentId, { status })
    setAssignments(result.assignments)
    setSelectedAssignmentId(result.assignment.assignmentId)
    setMessage(result.source === 'backend' ? 'Agreement status saved.' : result.error ?? 'Agreement status saved locally.')
  }

  async function handleRevoke(assignment: AgreementAssignment) {
    const result = await updateAgreementAssignmentWithFallback(assignment.assignmentId, { revokeShare: true })
    setAssignments(result.assignments)
    setSelectedAssignmentId(result.assignment.assignmentId)
    setMessage(result.source === 'backend' ? 'Public agreement link revoked.' : result.error ?? 'Public agreement link revoked locally.')
  }

  async function handleCopyLink(assignment: AgreementAssignment) {
    if (!assignment.publicUrl) {
      setMessage('This backend-secure assignment has a share token, but the raw URL is only returned when the link is created.')
      return
    }

    await navigator.clipboard.writeText(assignment.publicUrl)
    setMessage('Public agreement review link copied.')
  }

  function exportPdf(assignment: AgreementAssignment) {
    const version = getAgreementVersion(assignment.documentId, assignment.version, assignment.locale)
    if (!version) return
    printAgreementPdf(assignment, version)
  }

  function exportDocx(assignment: AgreementAssignment) {
    const version = getAgreementVersion(assignment.documentId, assignment.version, assignment.locale)
    if (!version) return
    downloadAgreementDocx(assignment, version)
  }

  function exportText(assignment: AgreementAssignment) {
    const version = getAgreementVersion(assignment.documentId, assignment.version, assignment.locale)
    if (!version) return
    downloadAgreementText(assignment, version)
  }

  return (
    <InternalLayout
      title="Agreement management"
      subtitle="Single source of truth for legal templates, partner assignments, public review links, exports, audit events and future signature workflows."
      actions={
        <Link className="btn btn-white" to="/internal/provider-partners">
          Provider partners
          <ExternalLink size={18} aria-hidden="true" />
        </Link>
      }
    >
      <p className="mb-5 rounded-lg bg-light-blue px-4 py-3 text-sm font-bold text-text-mid">
        {message}
      </p>

      <section className="mb-6 grid gap-5 md:grid-cols-4">
        <StatCard accent="navy" icon={ScrollText} label="Managed documents" value={String(stats.templates)} />
        <StatCard accent="blue" icon={Send} label="Active shares" value={String(stats.active)} />
        <StatCard accent="gold" icon={FileSignature} label="In partner review" value={String(stats.review)} />
        <StatCard accent="green" icon={ShieldCheck} label="Signed records" value={String(stats.signed)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="grid gap-6">
          <article className="rounded-lg border border-border bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-navy/10 text-navy">
                <FileSignature size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-text-dark">Assign agreement</h2>
                <p className="text-sm font-bold text-text-muted">Create a secure partner review record.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid min-w-0 gap-2">
                <span className="text-xs font-black uppercase tracking-wide text-text-muted">Document</span>
                <select
                  className="min-h-12 w-full min-w-0 rounded-lg border border-border bg-white px-3 text-sm font-bold text-text-dark"
                  value={form.documentId}
                  onChange={(event) => {
                    const nextTemplate = templates.find((template) => template.documentId === event.target.value)
                    updateForm({
                      documentId: event.target.value,
                      version: nextTemplate?.activeVersion ?? form.version,
                    })
                  }}
                >
                  {templates.map((template) => (
                    <option key={template.documentId} value={template.documentId}>{template.title}</option>
                  ))}
                </select>
              </label>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <label className="grid min-w-0 gap-2">
                  <span className="text-xs font-black uppercase tracking-wide text-text-muted">Language</span>
                  <select
                    className="min-h-12 w-full min-w-0 rounded-lg border border-border bg-white px-3 text-sm font-bold text-text-dark"
                    value={form.locale}
                    onChange={(event) => updateForm({ locale: event.target.value as AgreementLocale })}
                  >
                    {agreementLocaleOptions.map((locale) => (
                      <option key={locale.locale} value={locale.locale}>{locale.label}</option>
                    ))}
                  </select>
                </label>

                <label className="grid min-w-0 gap-2">
                  <span className="text-xs font-black uppercase tracking-wide text-text-muted">Version</span>
                  <input
                    className="min-h-12 w-full min-w-0 rounded-lg border border-border bg-light-blue/40 px-3 text-sm font-bold text-text-dark"
                    readOnly
                    value={selectedVersion?.version ?? form.version}
                  />
                </label>
              </div>

              <label className="grid min-w-0 gap-2">
                <span className="text-xs font-black uppercase tracking-wide text-text-muted">Partner company</span>
                <input
                  className="min-h-12 w-full min-w-0 rounded-lg border border-border bg-white px-3 text-sm font-bold text-text-dark"
                  value={form.partnerBusinessName}
                  onChange={(event) => updateForm({ partnerBusinessName: event.target.value })}
                />
              </label>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <label className="grid min-w-0 gap-2">
                  <span className="text-xs font-black uppercase tracking-wide text-text-muted">Contact name</span>
                  <input
                    className="min-h-12 w-full min-w-0 rounded-lg border border-border bg-white px-3 text-sm font-bold text-text-dark"
                    value={form.partnerContactName}
                    onChange={(event) => updateForm({ partnerContactName: event.target.value })}
                  />
                </label>
                <label className="grid min-w-0 gap-2">
                  <span className="text-xs font-black uppercase tracking-wide text-text-muted">Email</span>
                  <input
                    className="min-h-12 w-full min-w-0 rounded-lg border border-border bg-white px-3 text-sm font-bold text-text-dark"
                    type="email"
                    value={form.partnerEmail}
                    onChange={(event) => updateForm({ partnerEmail: event.target.value })}
                  />
                </label>
              </div>

              <label className="grid min-w-0 gap-2">
                <span className="text-xs font-black uppercase tracking-wide text-text-muted">Partner/application id</span>
                <input
                  className="min-h-12 w-full min-w-0 rounded-lg border border-border bg-white px-3 text-sm font-bold text-text-dark"
                  placeholder="Optional"
                  value={form.partnerId}
                  onChange={(event) => updateForm({ partnerId: event.target.value })}
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg bg-pale-blue p-4">
                <span>
                  <span className="block text-sm font-black text-text-dark">Generate secure public link</span>
                  <span className="block text-xs font-bold text-text-muted">Uses a high-entropy token; backend stores only the hash.</span>
                </span>
                <input
                  className="h-5 w-5"
                  checked={form.shareEnabled}
                  type="checkbox"
                  onChange={(event) => updateForm({ shareEnabled: event.target.checked })}
                />
              </label>

              <button className="btn btn-green w-full" disabled={isSaving} type="button" onClick={() => void handleCreateAssignment()}>
                <Send size={18} aria-hidden="true" />
                {isSaving ? 'Creating...' : 'Create assignment'}
              </button>
            </div>
          </article>

          <article className="rounded-lg border border-border bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue/10 text-blue">
                <Languages size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-text-dark">Legal library</h2>
                <p className="text-sm font-bold text-text-muted">Templates and public legal pages tracked together.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {legalLibrary.map((document) => (
                <div className="rounded-lg bg-pale-blue p-4" key={`${document.category}-${document.title}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-blue">{document.category.replace('-', ' ')}</p>
                      <p className="mt-1 text-sm font-black text-text-dark">{document.title}</p>
                      <p className="mt-1 text-xs font-bold text-text-muted">
                        {document.locale} · v{document.version} · {document.reviewStatus}
                      </p>
                    </div>
                    {document.path ? (
                      <Link className="text-navy" to={document.path} aria-label={`Open ${document.title}`}>
                        <ExternalLink size={17} aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="grid gap-6">
          <article className="rounded-lg border border-border bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold text-text-dark">Partner assignments</h2>
                <p className="mt-1 text-sm font-bold text-text-muted">Secure share links, export controls, audit trail and signature readiness.</p>
              </div>
              {selectedAssignment ? (
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-white" type="button" onClick={() => exportPdf(selectedAssignment)}>
                    <Download size={17} aria-hidden="true" />
                    PDF
                  </button>
                  <button className="btn btn-white" type="button" onClick={() => exportDocx(selectedAssignment)}>
                    <FileText size={17} aria-hidden="true" />
                    DOCX
                  </button>
                </div>
              ) : null}
            </div>

            {assignments.length ? (
              <div className="mt-5 grid gap-3">
                {assignments.map((assignment) => (
                  <button
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      assignment.assignmentId === selectedAssignment?.assignmentId
                        ? 'border-blue bg-blue/10'
                        : 'border-border bg-white hover:border-blue/40'
                    }`}
                    key={assignment.assignmentId}
                    type="button"
                    onClick={() => setSelectedAssignmentId(assignment.assignmentId)}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-text-muted">{assignment.assignmentId}</p>
                        <h3 className="mt-1 font-display text-2xl font-bold text-text-dark">{assignment.partnerBusinessName}</h3>
                        <p className="mt-1 text-sm font-bold text-text-mid">{assignment.partnerContactName} · {assignment.partnerEmail}</p>
                      </div>
                      <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${statusClasses[assignment.status]}`}>
                        {statusLabels[assignment.status]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg bg-pale-blue p-8 text-center">
                <FileSignature className="mx-auto text-blue" size={36} aria-hidden="true" />
                <h3 className="mt-4 font-display text-2xl font-bold text-text-dark">No agreement assignments yet</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm font-bold text-text-muted">
                  Create the first partner assignment to generate a public review link and audit history.
                </p>
              </div>
            )}
          </article>

          {selectedAssignment && selectedAssignmentVersion ? (
            <>
              <article className="rounded-lg border border-border bg-white p-5 shadow-soft">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">Selected assignment</p>
                    <h2 className="mt-2 font-display text-3xl font-bold text-text-dark">{selectedAssignment.partnerBusinessName}</h2>
                    <p className="mt-1 text-sm font-bold text-text-mid">
                      {selectedAssignmentVersion.title} · {selectedAssignment.locale} · v{selectedAssignment.version}
                    </p>
                  </div>
                  <span className={`w-fit rounded-full px-4 py-2 text-sm font-black ${statusClasses[selectedAssignment.status]}`}>
                    {statusLabels[selectedAssignment.status]}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="btn btn-white" type="button" onClick={() => void handleCopyLink(selectedAssignment)}>
                    <Copy size={17} aria-hidden="true" />
                    Copy link
                  </button>
                  {selectedAssignment.publicUrl ? (
                    <a className="btn btn-white" href={selectedAssignment.publicUrl} rel="noreferrer" target="_blank">
                      <ExternalLink size={17} aria-hidden="true" />
                      Open public
                    </a>
                  ) : null}
                  <button className="btn btn-white" type="button" onClick={() => void handleStatus(selectedAssignment, 'ready-for-signature')}>
                    <FileSignature size={17} aria-hidden="true" />
                    Ready to sign
                  </button>
                  <button className="btn btn-white" type="button" onClick={() => void handleRevoke(selectedAssignment)}>
                    <Link2Off size={17} aria-hidden="true" />
                    Revoke
                  </button>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                  <div className="rounded-lg bg-pale-blue p-4">
                    <h3 className="text-sm font-black uppercase tracking-wide text-navy">Sharing</h3>
                    <p className="mt-2 break-all text-sm font-bold text-text-mid">
                      {selectedAssignment.publicUrl
                        ? selectedAssignment.publicUrl
                        : selectedAssignment.shareEnabled
                          ? 'Secure backend link is active; raw token is intentionally not exposed after creation.'
                          : 'Public sharing is disabled.'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-pale-blue p-4">
                    <h3 className="text-sm font-black uppercase tracking-wide text-navy">Signature readiness</h3>
                    <p className="mt-2 text-sm font-bold text-text-mid">
                      {selectedAssignment.signatureStatus}. Signature provider fields are reserved for a future integration.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="btn btn-white" type="button" onClick={() => exportText(selectedAssignment)}>
                    <Download size={17} aria-hidden="true" />
                    TXT backup
                  </button>
                  <button className="btn btn-white" type="button" onClick={() => void handleStatus(selectedAssignment, 'signed')}>
                    <ShieldCheck size={17} aria-hidden="true" />
                    Mark signed
                  </button>
                </div>
              </article>

              <AgreementDocument assignment={selectedAssignment} compact version={selectedAssignmentVersion} />

              <article className="rounded-lg border border-border bg-white p-5 shadow-soft">
                <h2 className="font-display text-3xl font-bold text-text-dark">Audit history</h2>
                <div className="mt-5 grid gap-3">
                  {selectedAssignment.auditEvents.map((event) => (
                    <div className="rounded-lg bg-pale-blue p-4" key={event.id}>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm font-black text-text-dark">{event.eventType}</p>
                        <p className="text-xs font-bold text-text-muted">{formatDateTime(event.at)}</p>
                      </div>
                      <p className="mt-1 text-sm font-bold text-text-mid">
                        {event.actorType}: {event.actor}
                      </p>
                      {event.details ? <p className="mt-1 text-sm text-text-muted">{event.details}</p> : null}
                    </div>
                  ))}
                </div>
              </article>
            </>
          ) : selectedVersion ? (
            <AgreementDocument
              assignment={{
                assignedAt: new Date().toISOString(),
                assignedBy: 'CasaMia Operations',
                assignmentId: 'PREVIEW',
                auditEvents: [],
                documentId: form.documentId,
                expiresAt: new Date().toISOString(),
                locale: form.locale,
                partnerBusinessName: 'Empresa colaboradora',
                partnerContactName: 'Contacto',
                partnerEmail: 'contacto@example.com',
                shareEnabled: false,
                signatureStatus: 'not-started',
                status: 'draft',
                updatedAt: new Date().toISOString(),
                version: selectedVersion.version,
              }}
              compact
              version={selectedVersion}
            />
          ) : null}
        </div>
      </section>
    </InternalLayout>
  )
}

function formatDateTime(value: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
