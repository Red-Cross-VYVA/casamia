import { BarChart3, CalendarCheck2, CheckCircle2, ClipboardCheck, CreditCard, MessageCircle, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { StatCard } from '../../components/internal/StatCard'
import { loadConversionAnalytics, type ConversionAnalyticsData } from '../../services/internalConversionAnalytics'

const emptyData: ConversionAnalyticsData = {
  breakdowns: { flows: [], languages: [] },
  coverage: { days: 30, eventCount: 0, since: '' },
  daily: [],
  filters: { flow: '', language: '' },
  funnel: [],
  issues: [],
  outcomes: { acceptedProposals: 0, appointments: 0, assessmentRequests: 0, paidOrders: 0, whatsappClicks: 0 },
}

export function InternalConversionAnalyticsPage() {
  const [data, setData] = useState(emptyData)
  const [days, setDays] = useState(30)
  const [language, setLanguage] = useState('')
  const [flow, setFlow] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('Loading conversion data...')

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const next = await loadConversionAnalytics({ days, flow, language })
      setData(next)
      setMessage(next.issues.length ? next.issues.join(' · ') : 'Conversion data is connected.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Conversion data could not be loaded.')
    } finally {
      setIsLoading(false)
    }
  }, [days, flow, language])

  useEffect(() => {
    document.title = 'Conversion Analytics | CasaMia Operations'
    void refresh()
  }, [refresh])

  const maximumFunnelCount = Math.max(1, ...data.funnel.map((stage) => stage.count))
  const recentDays = data.daily.slice(-14)
  const maximumDailyCount = Math.max(1, ...recentDays.flatMap((day) => [day.started, day.completed, day.payments]))
  const outcomes = useMemo(() => [
    { accent: 'blue' as const, icon: ClipboardCheck, label: 'Assessment requests', value: data.outcomes.assessmentRequests },
    { accent: 'green' as const, icon: CheckCircle2, label: 'Accepted proposals', value: data.outcomes.acceptedProposals },
    { accent: 'gold' as const, icon: CalendarCheck2, label: 'Appointments', value: data.outcomes.appointments },
    { accent: 'navy' as const, icon: CreditCard, label: 'Paid orders', value: data.outcomes.paidOrders },
    { accent: 'green' as const, icon: MessageCircle, label: 'WhatsApp clicks', value: data.outcomes.whatsappClicks },
  ], [data.outcomes])

  return (
    <InternalLayout
      title="Conversion analytics"
      subtitle="Follow customer journeys from first action to assessment, proposal, appointment and payment."
      actions={<button className="btn btn-white" disabled={isLoading} type="button" onClick={() => void refresh()}><RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} />Refresh</button>}
    >
      <section className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-soft md:grid-cols-3">
        <Filter label="Period" value={String(days)} onChange={(value) => setDays(Number(value))} options={[['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days']]} />
        <Filter label="Language" value={language} onChange={setLanguage} options={[['', 'All languages'], ['es', 'Spanish'], ['en', 'English']]} />
        <Filter label="Journey" value={flow} onChange={setFlow} options={[['', 'All journeys'], ['home_safety_wizard', 'Safety wizard'], ['assessment_visit', 'Assessment visit'], ['safety_report', 'Safety report'], ['proposal_deposit', 'Proposal deposit'], ['configurator_visit', 'Configurator visit']]} />
      </section>

      <p className={`mt-4 rounded-lg border px-4 py-3 text-sm font-bold ${data.issues.length ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-border bg-light-blue text-text-mid'}`}>{message}</p>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {outcomes.map((item) => <StatCard accent={item.accent} icon={item.icon} key={item.label} label={item.label} value={isLoading ? '...' : String(item.value)} />)}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <article className="rounded-lg border border-border bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase text-blue">Tracked journeys</p><h2 className="mt-1 font-display text-3xl font-bold text-text-dark">Conversion funnel</h2></div><BarChart3 className="text-blue" size={28} /></div>
          <div className="mt-6 grid gap-5">
            {data.funnel.length ? data.funnel.map((stage, index) => (
              <div key={stage.key}>
                <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-black text-text-dark">{stage.label}</p><p className="text-sm font-bold text-text-muted"><strong className="text-lg text-text-dark">{stage.count}</strong>{index ? ` · ${stage.rateFromPrevious}% from prior stage` : ''}</p></div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-pale-blue"><div className="h-full rounded-full bg-blue transition-all" style={{ width: `${Math.max(stage.count ? 5 : 0, (stage.count / maximumFunnelCount) * 100)}%` }} /></div>
                {index && stage.dropOff ? <p className="mt-1 text-xs font-bold text-red-700">{stage.dropOff} fewer tracked journeys than the prior stage</p> : null}
              </div>
            )) : <p className="py-8 text-center font-bold text-text-muted">No tracked journeys match these filters yet.</p>}
          </div>
        </article>

        <article className="rounded-lg border border-border bg-navy p-6 text-white shadow-soft">
          <p className="text-xs font-black uppercase text-sky">Data coverage</p>
          <h2 className="mt-2 font-display text-3xl font-bold">{data.coverage.eventCount} consented events</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75">Detailed journey tracking starts with this release and only records visitors who accept analytics cookies. The outcome cards use CasaMia's operational records and therefore include earlier activity within the selected period.</p>
          <div className="mt-6 border-t border-white/15 pt-5"><p className="text-sm font-black">Coverage begins</p><p className="mt-1 text-sm text-white/70">{formatDate(data.coverage.since)}</p></div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <article className="rounded-lg border border-border bg-white p-6 shadow-soft">
          <p className="text-xs font-black uppercase text-blue">Recent activity</p><h2 className="mt-1 font-display text-3xl font-bold text-text-dark">Last 14 days</h2>
          <div className="mt-6 flex h-56 items-end gap-2 border-b border-border pb-1" aria-label="Daily journey activity chart">
            {recentDays.map((day) => <div className="flex min-w-0 flex-1 items-end justify-center gap-0.5" key={day.date} title={`${day.date}: ${day.started} started, ${day.completed} completed, ${day.payments} paid`}><Bar value={day.started} max={maximumDailyCount} color="bg-blue" /><Bar value={day.completed} max={maximumDailyCount} color="bg-green" /><Bar value={day.payments} max={maximumDailyCount} color="bg-gold" /></div>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-5 text-xs font-black text-text-muted"><Legend color="bg-blue" label="Started" /><Legend color="bg-green" label="Completed" /><Legend color="bg-gold" label="Paid" /></div>
        </article>

        <article className="rounded-lg border border-border bg-white p-6 shadow-soft">
          <p className="text-xs font-black uppercase text-blue">Event mix</p><h2 className="mt-1 font-display text-3xl font-bold text-text-dark">Languages and flows</h2>
          <Breakdown title="Languages" items={data.breakdowns.languages} />
          <Breakdown title="Journeys" items={data.breakdowns.flows} />
        </article>
      </section>
    </InternalLayout>
  )
}

function Filter({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: string[][]; value: string }) { return <label className="grid gap-2 text-sm font-black text-text-dark">{label}<select className="min-h-12 rounded-lg border border-border bg-white px-3 font-bold" value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label> }
function Bar({ color, max, value }: { color: string; max: number; value: number }) { return <div className={`w-1/3 min-w-1 rounded-t ${color}`} style={{ height: `${Math.max(value ? 4 : 0, (value / max) * 100)}%` }} /> }
function Legend({ color, label }: { color: string; label: string }) { return <span className="inline-flex items-center gap-2"><span className={`h-3 w-3 rounded-sm ${color}`} />{label}</span> }
function Breakdown({ items, title }: { items: Array<{ key: string; count: number }>; title: string }) { return <div className="mt-6"><h3 className="font-black text-text-dark">{title}</h3><div className="mt-2 divide-y divide-border border-y border-border">{items.length ? items.map((item) => <div className="flex justify-between gap-4 py-3 text-sm" key={item.key}><span className="font-bold text-text-mid">{item.key === 'unknown' ? 'Not specified' : item.key}</span><strong className="text-text-dark">{item.count}</strong></div>) : <p className="py-3 text-sm font-bold text-text-muted">No data yet</p>}</div></div> }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Not available' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date) }
