import { Plus, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  calculateLineTotal,
  formatCurrency,
  proposalCategories,
  proposalPriorities,
  serviceSuggestions,
  type ProposalLineItem,
} from '../../services/proposalCalculations'
import { createLineItem } from '../../services/proposalsStorage'

const inputClass =
  'min-h-11 w-full rounded-lg border border-border bg-white px-3 text-sm font-bold text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15'

export function ProposalLineItems({
  items,
  onChange,
}: {
  items: ProposalLineItem[]
  onChange: (items: ProposalLineItem[]) => void
}) {
  function updateItem(itemId: string, patch: Partial<ProposalLineItem>) {
    onChange(items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)))
  }

  function removeItem(itemId: string) {
    onChange(items.filter((item) => item.id !== itemId))
  }

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-text-dark">Recommended Works</h2>
          <p className="mt-1 text-sm text-text-mid">Add the services and products included in the proposal.</p>
        </div>
        <button
          className="btn btn-green w-full sm:w-auto"
          type="button"
          onClick={() => onChange([...items, createLineItem()])}
        >
          <Plus size={18} aria-hidden="true" />
          Add Line Item
        </button>
      </div>

      <datalist id="proposal-service-suggestions">
        {serviceSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>

      <div className="mt-6 grid gap-4">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-light-blue p-6 text-center">
            <p className="font-bold text-text-mid">No line items yet. Add the first recommended work.</p>
          </div>
        ) : null}

        {items.map((item, index) => (
          <article className="rounded-lg border border-border bg-light-blue/60 p-4" key={item.id}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-black uppercase text-navy">Line item {index + 1}</p>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-muted transition hover:text-red-600"
                type="button"
                aria-label={`Remove ${item.name || `line item ${index + 1}`}`}
                onClick={() => removeItem(item.id)}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[160px_minmax(180px,1fr)_minmax(240px,1.2fr)_90px_110px_120px_130px]">
              <Field label="Category">
                <select
                  className={inputClass}
                  value={item.category}
                  onChange={(event) =>
                    updateItem(item.id, { category: event.target.value as ProposalLineItem['category'] })
                  }
                >
                  {proposalCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </Field>
              <Field label="Item/service">
                <input
                  className={inputClass}
                  list="proposal-service-suggestions"
                  value={item.name}
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                />
              </Field>
              <Field label="Description">
                <input
                  className={inputClass}
                  value={item.description}
                  onChange={(event) => updateItem(item.id, { description: event.target.value })}
                />
              </Field>
              <Field label="Qty">
                <input
                  className={inputClass}
                  min="0"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) })}
                />
              </Field>
              <Field label="Unit price">
                <input
                  className={inputClass}
                  min="0"
                  type="number"
                  value={item.unitPrice}
                  onChange={(event) => updateItem(item.id, { unitPrice: Number(event.target.value) })}
                />
              </Field>
              <Field label="Priority">
                <select
                  className={inputClass}
                  value={item.priority}
                  onChange={(event) =>
                    updateItem(item.id, { priority: event.target.value as ProposalLineItem['priority'] })
                  }
                >
                  {proposalPriorities.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-2">
                <span className="text-sm font-extrabold text-text-dark">Total</span>
                <div className="flex min-h-11 items-center rounded-lg bg-white px-3 text-sm font-black text-navy">
                  {formatCurrency(calculateLineTotal(item))}
                </div>
              </div>
            </div>

            <label className="mt-4 inline-flex cursor-pointer items-center gap-3 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-text-dark">
              <input
                className="h-4 w-4 accent-green"
                checked={item.grantEligible}
                type="checkbox"
                onChange={(event) => updateItem(item.id, { grantEligible: event.target.checked })}
              />
              Grant eligible
            </label>
          </article>
        ))}
      </div>
    </section>
  )
}

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-text-dark">{label}</span>
      {children}
    </label>
  )
}
