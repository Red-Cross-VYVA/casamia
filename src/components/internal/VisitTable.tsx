import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export type Visit = {
  area: string
  customerName: string
  preferredTime: string
  selectedPlan: string
  status: 'Scheduled' | 'In Progress' | 'Report Pending' | 'Proposal Sent'
}

const statusClasses: Record<Visit['status'], string> = {
  'In Progress': 'bg-blue/10 text-blue',
  'Proposal Sent': 'bg-green/10 text-green',
  'Report Pending': 'bg-gold/15 text-[#9b6812]',
  Scheduled: 'bg-light-blue text-navy',
}

export function VisitTable({ visits }: { visits: Visit[] }) {
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
              <tr className="align-middle" key={`${visit.customerName}-${visit.preferredTime}`}>
                <td className="px-5 py-4 font-extrabold text-text-dark">{visit.customerName}</td>
                <td className="px-5 py-4 text-text-mid">{visit.area}</td>
                <td className="px-5 py-4 text-text-mid">{visit.selectedPlan}</td>
                <td className="px-5 py-4 font-bold text-navy">{visit.preferredTime}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black uppercase ${statusClasses[visit.status]}`}
                  >
                    {visit.status}
                  </span>
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
