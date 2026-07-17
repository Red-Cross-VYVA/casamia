import { ClipboardCheck, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { InternalLayout } from '../../components/internal/InternalLayout'
import {
  internalOrderStatuses,
  loadInternalOrders,
  updateInternalOrderStatus,
  type InternalOrder,
  type InternalOrderStatus,
} from '../../services/internalOrders'

export function InternalOrdersPage() {
  const [orders, setOrders] = useState<InternalOrder[]>([])
  const [message, setMessage] = useState('Loading customer plans...')
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const result = await loadInternalOrders()
    setOrders(result.orders)
    setMessage(result.available ? 'Connected to Supabase customer plans.' : result.message ?? 'Customer plans unavailable.')
    setIsLoading(false)
  }, [])

  useEffect(() => {
    document.title = 'Customer Plans | CasaMia Operations'
    void refresh()
  }, [refresh])

  async function changeStatus(order: InternalOrder, status: InternalOrderStatus) {
    try {
      const updated = await updateInternalOrderStatus(order.id, status)
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item))
      setMessage('Customer plan status saved to Supabase.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The customer plan status could not be saved.')
    }
  }

  return (
    <InternalLayout
      title="Customer plans"
      subtitle="Quote and visit requests submitted from the Build My Safer Home configurator."
      actions={
        <button className="btn btn-white" disabled={isLoading} type="button" onClick={() => void refresh()}>
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} aria-hidden="true" />
          Refresh
        </button>
      }
    >
      <p className="mb-5 rounded-lg bg-light-blue px-4 py-3 text-sm font-bold text-text-mid">{message}</p>
      {orders.length ? (
        <section className="grid gap-4">
          {orders.map((order) => (
            <article className="rounded-lg border border-border bg-white p-5 shadow-soft" key={order.id}>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-blue">{order.id}</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-text-dark">{order.customerName || 'Customer name pending'}</h2>
                  <p className="mt-2 text-sm font-bold text-text-mid">
                    {[order.customerPhone, order.customerEmail, order.postcode].filter(Boolean).join(' / ')}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-text-mid">
                    <span className="rounded-full bg-pale-blue px-3 py-1">{order.selectedServiceCount} improvements</span>
                    <span className="rounded-full bg-pale-blue px-3 py-1">{order.planPrice || 'Estimate pending'}</span>
                    <span className="rounded-full bg-pale-blue px-3 py-1">{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                <label className="grid gap-2 text-sm font-black text-text-dark">
                  Status
                  <select
                    className="min-h-12 rounded-lg border border-border bg-white px-4 text-sm font-bold text-navy"
                    value={order.status}
                    onChange={(event) => void changeStatus(order, event.target.value as InternalOrderStatus)}
                  >
                    {internalOrderStatuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-white p-8 text-center shadow-soft">
          <ClipboardCheck className="mx-auto text-blue" size={40} aria-hidden="true" />
          <h2 className="mt-4 font-display text-3xl font-bold text-text-dark">No customer plans yet</h2>
          <p className="mt-2 text-text-mid">New configurator requests will appear here.</p>
        </section>
      )}
    </InternalLayout>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-GB')
}
