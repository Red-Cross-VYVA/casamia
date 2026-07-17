import { ArrowRight, CalendarDays, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { VisitTable, type Visit } from '../../components/internal/VisitTable'
import {
  internalAssessmentStatuses,
  loadInternalAssessmentRequests,
  updateInternalAssessmentStatus,
  type InternalAssessmentRequest,
  type InternalAssessmentStatus,
} from '../../services/internalAssessments'

export function InternalVisitsPage() {
  const [requests, setRequests] = useState<InternalAssessmentRequest[]>([])
  const [message, setMessage] = useState('Loading assessment requests...')
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const result = await loadInternalAssessmentRequests()
    setRequests(result.requests)
    setMessage(result.available ? 'Connected to Supabase assessment requests.' : result.message ?? 'Inbox unavailable.')
    setIsLoading(false)
  }, [])

  useEffect(() => {
    document.title = 'Assessment Requests | CasaMia Operations'
    void refresh()
  }, [refresh])

  const visits = useMemo<Visit[]>(() => requests.map((request) => ({
    area: request.city,
    customerName: request.name,
    email: request.email,
    id: request.id,
    phone: request.phone,
    preferredTime: request.preferredDate || request.preferredContactMethod || formatDate(request.submittedAt),
    selectedPlan: request.selectedPlan || request.type || 'Safety review',
    status: request.status,
  })), [requests])

  async function changeStatus(visit: Visit, status: string) {
    try {
      const updated = await updateInternalAssessmentStatus(visit.id, status as InternalAssessmentStatus)
      setRequests((current) => current.map((request) => request.id === updated.id ? updated : request))
      setMessage('Assessment status saved to Supabase.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The assessment status could not be updated.')
    }
  }

  return (
    <InternalLayout
      title="Assessment requests"
      subtitle="Live requests submitted through the CasaMia assessment forms and home-safety wizard."
      actions={
        <>
          <button className="btn btn-white" disabled={isLoading} type="button" onClick={() => void refresh()}>
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
            Refresh
          </button>
          <Link className="btn btn-green" to="/internal/inspection-report">
            Create Inspection Report
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </>
      }
    >
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-blue">
              <CalendarDays size={18} aria-hidden="true" />
              Live intake
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-text-dark">Customer requests</h2>
            <p className="mt-2 text-sm font-bold text-text-muted">{message}</p>
          </div>
          <p className="rounded-full bg-light-blue px-4 py-2 text-sm font-extrabold text-navy">
            {visits.length} requests
          </p>
        </div>
        {visits.length ? (
          <VisitTable visits={visits} statusOptions={internalAssessmentStatuses} onStatusChange={changeStatus} />
        ) : (
          <div className="rounded-lg bg-pale-blue p-8 text-center text-base font-bold text-text-mid">
            {isLoading ? 'Loading requests...' : 'No assessment requests are available yet.'}
          </div>
        )}
      </section>
    </InternalLayout>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB')
}
