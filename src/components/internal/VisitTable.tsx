import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export type Visit = {
  id: string
  area: string
  customerName: string
  email?: string
  phone?: string
  preferredTime: string
  selectedPlan: string
  status: string
}

const statusClasses: Record<string, string> = {
  'In Progress': 'bg-blue/10 text-blue',
  'Proposal Sent': 'bg-green/10 text-green',
  'Report Pending': 'bg-gold/15 text-[#9b6812]',
  'Visit Scheduled': 'bg-light-blue text-navy',
  Completed: 'bg-green/10 text-green',
  Cancelled: 'bg-red-50 text-red-700',
  Contacting: 'bg-gold/15 text-[#9b6812]',
  New: 'bg-light-blue text-navy',
}

export function VisitTable({
  visits,
  onStatusChange,
  statusOptions = [],
}: {
  visits: Visit[]
  onStatusChange?: (visit: Visit, status: string) => void
  statusOptions?: readonly string[]
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full text-left">
          <thead className="bg-light-blue text-xs font-black uppercase text-navy">
            <tr>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Area</th>
              <th className="px-5 py-4">Selected option</th>
              <th className="px-5 py-4">Preferred time</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visits.map((visit) => (
              <tr className="align-middle" key={visit.id}>
                <td className="px-5 py-4">
                  <span className="block font-extrabold text-text-dark">{visit.customerName || 'Name not provided'}</span>
                  <span className="block text-xs font-bold text-text-muted">{visit.phone || visit.email}</span>
                </td>
                <td className="px-5 py-4 text-text-mid">{visit.area}</td>
                <td className="px-5 py-4 text-text-mid">{visit.selectedPlan}</td>
                <td className="px-5 py-4 font-bold text-navy">{visit.preferredTime}</td>
                <td className="px-5 py-4">
                  {onStatusChange && statusOptions.includes(visit.status) ? (
                    <select
                      className="min-h-9 rounded-lg border border-border bg-white px-3 text-xs font-black text-navy"
                      value={visit.status}
                      onChange={(event) => onStatusChange(visit, event.target.value)}
                    >
                      {statusOptions.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  ) : (
                    <span
                      className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black uppercase ${statusClasses[visit.status] ?? 'bg-gray-100 text-text-mid'}`}
                    >
                      {visit.status}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <Link
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-navy transition hover:text-green"
                    to="/internal/inspection-report"
                  >
                    Start Report
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
