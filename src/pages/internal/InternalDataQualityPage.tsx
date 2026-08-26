import { AlertTriangle, DatabaseZap, RefreshCw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { InternalLayout } from '../../components/internal/InternalLayout'
import {
  deleteBlankLegacyRecord,
  loadBlankLegacyRecords,
  type BlankLegacyRecord,
  type BlankLegacyRecordKind,
} from '../../services/internalDataQuality'

const kindLabels: Record<BlankLegacyRecordKind, string> = {
  contact: 'Contact request',
  order: 'Customer plan',
  provider: 'Provider application',
  withdrawal: 'Withdrawal request',
}

export function InternalDataQualityPage() {
  const [records, setRecords] = useState<BlankLegacyRecord[]>([])
  const [message, setMessage] = useState('Checking production records...')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingKey, setDeletingKey] = useState('')

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const next = await loadBlankLegacyRecords()
      setRecords(next)
      setMessage(next.length
        ? `${next.length} completely blank legacy ${next.length === 1 ? 'record needs' : 'records need'} review.`
        : 'No completely blank legacy records were found.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Data quality could not be checked.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Data Quality | CasaMia Operations'
    void refresh()
  }, [refresh])

  const counts = useMemo(() => Object.fromEntries(
    Object.keys(kindLabels).map((kind) => [kind, records.filter((record) => record.kind === kind).length]),
  ) as Record<BlankLegacyRecordKind, number>, [records])

  async function removeRecord(record: BlankLegacyRecord) {
    const confirmed = window.confirm(
      `Delete blank ${kindLabels[record.kind].toLowerCase()} ${record.reference}? This cannot be undone.`,
    )
    if (!confirmed) return

    setDeletingKey(`${record.kind}:${record.recordKey}`)
    try {
      await deleteBlankLegacyRecord(record)
      setRecords((current) => current.filter((item) =>
        item.kind !== record.kind || item.recordKey !== record.recordKey))
      setMessage(`Deleted blank ${kindLabels[record.kind].toLowerCase()} ${record.reference}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The blank record could not be deleted.')
    } finally {
      setDeletingKey('')
    }
  }

  return (
    <InternalLayout
      title="Data quality"
      subtitle="Review legacy records that contain no customer, service, contact or operational information."
      actions={
        <button className="btn btn-white" disabled={isLoading} type="button" onClick={() => void refresh()}>
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
          Refresh
        </button>
      }
    >
      <p className="mb-5 rounded-lg bg-light-blue px-4 py-3 text-sm font-bold text-text-mid" role="status">
        {message}
      </p>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Blank records by type">
        {(Object.keys(kindLabels) as BlankLegacyRecordKind[]).map((kind) => (
          <div className="rounded-lg border border-border bg-white p-4 shadow-soft" key={kind}>
            <p className="text-xs font-black uppercase text-text-muted">{kindLabels[kind]}</p>
            <p className="mt-2 font-display text-4xl font-bold text-text-dark">{counts[kind]}</p>
          </div>
        ))}
      </section>

      {records.length ? (
        <section className="grid gap-4" aria-label="Completely blank legacy records">
          {records.map((record) => {
            const key = `${record.kind}:${record.recordKey}`
            return (
              <article className="rounded-lg border border-border bg-white p-5 shadow-soft" key={key}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase text-blue">{kindLabels[record.kind]}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold text-text-dark">{record.reference}</h2>
                    <p className="mt-1 text-sm font-bold text-text-muted">
                      Created {formatDate(record.createdAt)} · No customer or operational fields
                    </p>
                  </div>
                  <button
                    className="btn btn-white border-red-200 text-red-700 hover:bg-red-50"
                    disabled={Boolean(deletingKey)}
                    type="button"
                    onClick={() => void removeRecord(record)}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                    {deletingKey === key ? 'Deleting...' : 'Delete blank record'}
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      ) : isLoading ? null : (
        <section className="rounded-lg border border-border bg-white p-8 text-center shadow-soft">
          <DatabaseZap className="mx-auto text-green" size={42} aria-hidden="true" />
          <h2 className="mt-4 font-display text-3xl font-bold text-text-dark">Production data is clean</h2>
          <p className="mx-auto mt-2 max-w-2xl text-text-mid">
            No records meet the strict blank-record rule. Records containing any customer or operational data are never listed here.
          </p>
        </section>
      )}

      <aside className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-950">
        <AlertTriangle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
        <p>Deletion is available only when every protected field is still blank. The server checks the record again immediately before deletion.</p>
      </aside>
    </InternalLayout>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value || 'Unknown date' : date.toLocaleString('en-GB')
}
