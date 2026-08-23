import { Download, FileSignature, FileText, House, LogOut, RefreshCw, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { AgreementDocument } from '../../components/agreements/AgreementDocument'
import { BrandLogo } from '../../components/BrandLogo'
import {
  downloadAgreementDocx,
  downloadAgreementText,
  getAgreementVersion,
  loadPartnerAgreementAssignmentsWithFallback,
  printAgreementPdf,
  type AgreementAssignment,
  type AgreementAssignmentStatus,
} from '../../services/agreementManagement'
import { clearPartnerAuthSession, getPartnerEmail } from '../../services/internalAuth'

const statusLabels: Record<AgreementAssignmentStatus, string> = {
  draft: 'Draft', expired: 'Expired', revoked: 'Revoked', sent: 'Sent', signed: 'Signed',
  'ready-for-signature': 'Ready for signature', 'under-review': 'Under review', viewed: 'Viewed',
}

const statusClasses: Record<AgreementAssignmentStatus, string> = {
  draft: 'bg-light-blue text-navy', expired: 'bg-red-50 text-red-700', revoked: 'bg-red-50 text-red-700',
  sent: 'bg-blue/10 text-blue', signed: 'bg-green/10 text-green',
  'ready-for-signature': 'bg-gold/15 text-[#94640d]', 'under-review': 'bg-gold/15 text-[#94640d]', viewed: 'bg-blue/10 text-blue',
}

export function PartnerPortalPage() {
  const [assignments, setAssignments] = useState<AgreementAssignment[]>([])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('')
  const [message, setMessage] = useState('Loading your partner workspace...')
  const [isLoading, setIsLoading] = useState(false)
  const partnerEmail = getPartnerEmail()

  const refreshAssignments = useCallback(async () => {
    setIsLoading(true)
    const result = await loadPartnerAgreementAssignmentsWithFallback()
    setAssignments(result.assignments)
    setSelectedAssignmentId((current) => current || result.assignments[0]?.assignmentId || '')
    setMessage(result.source === 'backend' ? `Showing assignments for ${result.partnerEmail}.` : result.error ?? `Local partner workspace for ${result.partnerEmail || partnerEmail}.`)
    setIsLoading(false)
  }, [partnerEmail])

  useEffect(() => {
    document.title = 'Partner portal | CasaMia'
    void refreshAssignments()
  }, [refreshAssignments])

  function handleSignOut() {
    clearPartnerAuthSession()
    window.location.assign('/partner')
  }

  const selectedAssignment = assignments.find((assignment) => assignment.assignmentId === selectedAssignmentId) ?? assignments[0]
  const selectedVersion = selectedAssignment ? getAgreementVersion(selectedAssignment.documentId, selectedAssignment.version, selectedAssignment.locale) : undefined
  const stats = useMemo(() => ({
    active: assignments.filter((assignment) => !['expired', 'revoked', 'signed'].includes(assignment.status)).length,
    review: assignments.filter((assignment) => ['sent', 'viewed', 'under-review'].includes(assignment.status)).length,
    signed: assignments.filter((assignment) => assignment.status === 'signed').length,
  }), [assignments])

  return (
    <div className="min-h-screen bg-pale-blue text-text-mid">
      <header className="border-b border-border bg-white px-5 py-5 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link className="inline-flex rounded-md bg-white px-3 py-2" to="/" aria-label="CasaMia home"><BrandLogo /></Link>
            <div><p className="text-xs font-black uppercase text-text-muted">Partner portal</p><h1 className="mt-1 font-display text-4xl font-bold text-text-dark">Your CasaMia workspace</h1></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-white" to="/"><House size={17} aria-hidden="true" />Home</Link>
            <button className="btn btn-white" type="button" onClick={refreshAssignments} disabled={isLoading}><RefreshCw size={17} aria-hidden="true" />{isLoading ? 'Refreshing...' : 'Refresh'}</button>
            <button className="btn btn-white" type="button" onClick={handleSignOut}><LogOut size={17} aria-hidden="true" />Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:py-8">
        <aside className="grid content-start gap-5">
          <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3"><span className="inline-grid h-11 w-11 place-items-center rounded-lg bg-green/10 text-green"><ShieldCheck size={22} aria-hidden="true" /></span><div><p className="text-xs font-black uppercase text-text-muted">Signed in as</p><p className="mt-1 break-all text-sm font-extrabold text-text-dark">{partnerEmail || 'Partner'}</p></div></div>
            <p className="mt-4 rounded-lg bg-light-blue px-4 py-3 text-sm font-bold leading-relaxed">{message}</p>
          </section>
          <section className="grid grid-cols-3 gap-3 lg:grid-cols-1"><PartnerStat label="Active" value={stats.active} /><PartnerStat label="In review" value={stats.review} /><PartnerStat label="Signed" value={stats.signed} /></section>
          <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
            <h2 className="font-display text-2xl font-bold text-text-dark">Assignments</h2>
            <div className="mt-4 grid gap-3">
              {assignments.length ? assignments.map((assignment) => (
                <button className={`rounded-lg border p-4 text-left transition ${assignment.assignmentId === selectedAssignment?.assignmentId ? 'border-blue bg-blue/5' : 'border-border bg-white hover:border-blue/40'}`} key={assignment.assignmentId} type="button" onClick={() => setSelectedAssignmentId(assignment.assignmentId)}>
                  <p className="text-xs font-black uppercase text-text-muted">{assignment.assignmentId}</p><h3 className="mt-1 font-display text-xl font-bold text-text-dark">{assignment.partnerBusinessName}</h3><span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${statusClasses[assignment.status]}`}>{statusLabels[assignment.status]}</span>
                </button>
              )) : <div className="rounded-lg border border-dashed border-border bg-light-blue p-5 text-sm font-bold text-text-muted">No assignments are available for this email yet.</div>}
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          {selectedAssignment && selectedVersion ? <div className="grid gap-5">
            <div className="rounded-lg border border-border bg-white p-5 shadow-soft"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="text-xs font-black uppercase text-text-muted">Selected assignment</p><h2 className="mt-2 font-display text-3xl font-bold text-text-dark">{selectedAssignment.partnerBusinessName}</h2><p className="mt-1 text-sm font-bold">{selectedAssignment.partnerContactName} · {selectedAssignment.partnerEmail}</p></div><div className="flex flex-wrap gap-3"><button className="btn btn-white" type="button" onClick={() => printAgreementPdf(selectedAssignment, selectedVersion)}><FileText size={17} />Print/PDF</button><button className="btn btn-white" type="button" onClick={() => downloadAgreementDocx(selectedAssignment, selectedVersion)}><Download size={17} />DOCX</button><button className="btn btn-white" type="button" onClick={() => downloadAgreementText(selectedAssignment, selectedVersion)}><Download size={17} />TXT</button></div></div></div>
            <AgreementDocument assignment={selectedAssignment} version={selectedVersion} />
          </div> : <div className="grid min-h-[480px] place-items-center rounded-lg border border-dashed border-border bg-white p-8 text-center shadow-soft"><div><FileSignature className="mx-auto text-blue" size={42} /><h2 className="mt-4 font-display text-3xl font-bold text-text-dark">No partner document selected</h2><p className="mt-2 text-sm font-bold text-text-muted">Assignments shared with this partner email will appear here.</p></div></div>}
        </section>
      </main>
    </div>
  )
}

function PartnerStat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-border bg-white p-4 shadow-soft"><p className="text-xs font-black uppercase text-text-muted">{label}</p><p className="mt-1 font-display text-3xl font-bold text-text-dark">{value}</p></div>
}
