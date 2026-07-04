import { ArrowRight, CheckCircle2, Printer, Save } from 'lucide-react'
import { forwardRef } from 'react'

export type ReportPreviewData = {
  customerName: string
  inspectionDate: string
  improvements: string[]
  nextSteps: string[]
  recommendedPlan: string
  riskLevel: string
  safetyScore: string
  topRisks: string[]
}

export const ReportPreview = forwardRef<
  HTMLDivElement,
  {
    data: ReportPreviewData
    draftMessage?: string
    onGeneratePreview: () => void
    onPrint: () => void
    onSaveDraft: () => void
  }
>(function ReportPreview(
  {
    data,
    draftMessage,
    onGeneratePreview,
    onPrint,
    onSaveDraft,
  },
  ref,
) {
  return (
    <aside className="rounded-lg border border-border bg-white p-6 shadow-soft" ref={ref}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-green">Proposal Summary Preview</p>
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-text-dark">
        {data.customerName || 'Customer name'}
      </h2>
      <div className="mt-5 grid gap-3 rounded-lg bg-light-blue p-4 text-sm">
        <PreviewRow label="Inspection date" value={data.inspectionDate || 'Not set'} />
        <PreviewRow label="Overall risk" value={data.riskLevel} />
        <PreviewRow label="Safety score" value={data.safetyScore ? `${data.safetyScore}/10` : 'Not scored'} />
        <PreviewRow label="Recommended plan" value={data.recommendedPlan} />
      </div>

      <PreviewList empty="No hazards selected yet." items={data.topRisks} title="Top risks identified" />
      <PreviewList
        empty="No improvements selected yet."
        items={data.improvements}
        title="Recommended improvements"
      />
      <PreviewList empty="Next steps will appear here." items={data.nextSteps} title="Next steps" />

      <div className="mt-6 grid gap-3">
        <button className="btn btn-green w-full" type="button" onClick={onSaveDraft}>
          <Save size={18} aria-hidden="true" />
          Save Draft
        </button>
        <button className="btn btn-navy w-full" type="button" onClick={onGeneratePreview}>
          Generate Proposal Preview
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button
          className="btn w-full border border-border bg-white text-navy hover:border-green hover:text-green"
          type="button"
          onClick={onPrint}
        >
          <Printer size={18} aria-hidden="true" />
          Print Report
        </button>
      </div>

      {draftMessage ? (
        <p className="mt-4 rounded-lg bg-green/10 p-3 text-sm font-bold text-green">{draftMessage}</p>
      ) : null}
    </aside>
  )
})

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-extrabold uppercase text-text-muted">{label}</span>
      <span className="text-right font-black text-text-dark">{value}</span>
    </div>
  )
}

function PreviewList({
  empty,
  items,
  title,
}: {
  empty: string
  items: string[]
  title: string
}) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-black uppercase text-navy">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 8).map((item) => (
            <li className="flex gap-2 text-sm text-text-mid" key={item}>
              <CheckCircle2 className="mt-0.5 shrink-0 text-green" size={16} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-text-muted">{empty}</p>
      )}
    </div>
  )
}
