import {
  ArrowRight,
  CheckCircle2,
  Euro,
  ListChecks,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { formatConfiguratorCurrency } from '../../services/configuratorPricing'
import {
  getPackageConfig,
  resetPackageConfig,
  savePackageConfig,
  type EditablePackageConfig,
} from '../../services/packageConfig'
import type {
  CasaMiaPackage,
  PackageComponent,
  PackageComponentType,
  PackageId,
} from '../../types/configurator'

type ComponentBucket = 'standardComponents' | 'conditionalComponents' | 'quotationOnlyComponents'

const componentSections: Array<{
  bucket: ComponentBucket
  description: string
  title: string
}> = [
  {
    bucket: 'standardComponents',
    title: 'Included in the package',
    description: 'Items the customer should understand are part of the headline package.',
  },
  {
    bucket: 'conditionalComponents',
    title: 'Added only if needed',
    description: 'Items shown as possible extras or home-dependent additions.',
  },
  {
    bucket: 'quotationOnlyComponents',
    title: 'Quoted after review',
    description: 'Items that need measurement, compatibility checks or a separate scope.',
  },
]

const componentTypeByBucket: Record<ComponentBucket, PackageComponentType> = {
  conditionalComponents: 'conditional',
  quotationOnlyComponents: 'quotation-only',
  standardComponents: 'standard',
}

export function InternalPackageConfigPage() {
  const [draft, setDraft] = useState<EditablePackageConfig>(() => getPackageConfig())
  const [status, setStatus] = useState('')

  const packageCount = draft.packages.length
  const itemCount = useMemo(
    () =>
      draft.packages.reduce(
        (total, item) =>
          total +
          item.standardComponents.length +
          item.conditionalComponents.length +
          item.quotationOnlyComponents.length,
        0,
      ),
    [draft.packages],
  )

  useEffect(() => {
    document.title = 'Package Config | CasaMia Operations'
  }, [])

  function updatePackage(packageId: PackageId, patch: Partial<CasaMiaPackage>) {
    setDraft((current) => ({
      ...current,
      packages: current.packages.map((item) =>
        item.id === packageId ? { ...item, ...patch, id: item.id, quantityKey: item.quantityKey } : item,
      ),
    }))
  }

  function updatePackagePrice(packageId: PackageId, value: string) {
    const nextPrice = Math.max(0, Number(value) || 0)

    setDraft((current) => ({
      ...current,
      packagePrices: {
        ...current.packagePrices,
        [packageId]: nextPrice,
      },
    }))
  }

  function updateComponent(
    packageId: PackageId,
    bucket: ComponentBucket,
    componentId: string,
    patch: Partial<PackageComponent>,
  ) {
    setDraft((current) => ({
      ...current,
      packages: current.packages.map((item) => {
        if (item.id !== packageId) {
          return item
        }

        return {
          ...item,
          [bucket]: item[bucket].map((component) =>
            component.id === componentId ? { ...component, ...patch } : component,
          ),
        }
      }),
    }))
  }

  function addComponent(packageId: PackageId, bucket: ComponentBucket) {
    const nextComponent: PackageComponent = {
      id: createComponentId(bucket),
      label: 'New inclusion',
      type: componentTypeByBucket[bucket],
    }

    setDraft((current) => ({
      ...current,
      packages: current.packages.map((item) =>
        item.id === packageId
          ? {
              ...item,
              [bucket]: [...item[bucket], nextComponent],
            }
          : item,
      ),
    }))
  }

  function removeComponent(packageId: PackageId, bucket: ComponentBucket, componentId: string) {
    setDraft((current) => ({
      ...current,
      packages: current.packages.map((item) =>
        item.id === packageId
          ? {
              ...item,
              [bucket]: item[bucket].filter((component) => component.id !== componentId),
            }
          : item,
      ),
    }))
  }

  function handleSave() {
    const saved = savePackageConfig(draft)
    setDraft(saved)
    setStatus('Saved. The configurator now uses these package cards and prices.')
  }

  function handleReset() {
    const reset = resetPackageConfig()
    setDraft(reset)
    setStatus('Restored default package content and prices.')
  }

  return (
    <InternalLayout
      title="Package Card Manager"
      subtitle="Edit the service package cards, included item lists and headline prices shown in Build My Safer Home."
      actions={
        <>
          <Link className="btn btn-white" to="/configure">
            Open Configurator
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <button className="btn btn-white" type="button" onClick={handleReset}>
            <RotateCcw size={18} aria-hidden="true" />
            Restore Defaults
          </button>
          <button className="btn btn-navy" type="button" onClick={handleSave}>
            <Save size={18} aria-hidden="true" />
            Save Changes
          </button>
        </>
      }
    >
      <section className="grid gap-5 md:grid-cols-3">
        <StatusCard icon={ListChecks} label="Managed packages" value={String(packageCount)} />
        <StatusCard icon={CheckCircle2} label="Customer-facing items" value={String(itemCount)} />
        <StatusCard
          icon={Euro}
          label="Last saved"
          value={draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString('es-ES') : 'Draft'}
        />
      </section>

      <section className="mt-6 rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-text-dark">Package content</h2>
            <p className="mt-1 max-w-3xl text-sm font-bold leading-relaxed text-text-mid">
              These edits control the package cards and estimate lines. Use short customer-friendly item names.
            </p>
          </div>
          {status ? (
            <p className="rounded-full bg-pale-blue px-4 py-2 text-sm font-black text-navy" role="status">
              {status}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mt-6 grid gap-6">
        {draft.packages.map((item) => (
          <PackageEditor
            item={item}
            key={item.id}
            price={draft.packagePrices[item.id]}
            onAddComponent={addComponent}
            onRemoveComponent={removeComponent}
            onUpdateComponent={updateComponent}
            onUpdatePackage={updatePackage}
            onUpdatePrice={updatePackagePrice}
          />
        ))}
      </div>
    </InternalLayout>
  )
}

function StatusCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ListChecks
  label: string
  value: string
}) {
  return (
    <article className="rounded-lg border border-border bg-white p-5 shadow-soft">
      <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-pale-blue text-blue">
        <Icon size={24} aria-hidden="true" />
      </span>
      <p className="mt-4 text-xs font-black uppercase tracking-wide text-text-muted">{label}</p>
      <strong className="mt-1 block font-display text-4xl font-bold text-navy">{value}</strong>
    </article>
  )
}

function PackageEditor({
  item,
  onAddComponent,
  onRemoveComponent,
  onUpdateComponent,
  onUpdatePackage,
  onUpdatePrice,
  price,
}: {
  item: CasaMiaPackage
  onAddComponent: (packageId: PackageId, bucket: ComponentBucket) => void
  onRemoveComponent: (packageId: PackageId, bucket: ComponentBucket, componentId: string) => void
  onUpdateComponent: (
    packageId: PackageId,
    bucket: ComponentBucket,
    componentId: string,
    patch: Partial<PackageComponent>,
  ) => void
  onUpdatePackage: (packageId: PackageId, patch: Partial<CasaMiaPackage>) => void
  onUpdatePrice: (packageId: PackageId, value: string) => void
  price: number
}) {
  return (
    <article className="rounded-lg border border-border bg-white p-5 shadow-soft">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <span className="text-xs font-black uppercase tracking-wide text-blue">{item.shortName}</span>
          <h2 className="mt-1 font-display text-4xl font-bold leading-tight text-text-dark">{item.name}</h2>
          <p className="mt-2 max-w-3xl text-base font-bold leading-relaxed text-text-mid">{item.outcome}</p>
        </div>

        <label className="rounded-lg border border-border bg-pale-blue p-4">
          <span className="text-xs font-black uppercase tracking-wide text-text-muted">Headline price</span>
          <span className="mt-1 block font-display text-3xl font-bold text-navy">
            {formatConfiguratorCurrency(price)}
          </span>
          <input
            className="mt-3 min-h-12 w-full rounded-lg border border-border bg-white px-3 text-base font-black text-text-dark outline-none transition focus:border-blue"
            min={0}
            type="number"
            value={price}
            onChange={(event) => onUpdatePrice(item.id, event.target.value)}
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TextInput
          label="Package name"
          value={item.name}
          onChange={(value) => onUpdatePackage(item.id, { name: value })}
        />
        <TextInput
          label="Short label"
          value={item.shortName}
          onChange={(value) => onUpdatePackage(item.id, { shortName: value })}
        />
        <TextInput
          label="Sales unit"
          value={item.salesUnit}
          onChange={(value) => onUpdatePackage(item.id, { salesUnit: value })}
        />
        <TextArea
          label="Customer outcome"
          value={item.outcome}
          onChange={(value) => onUpdatePackage(item.id, { outcome: value })}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {componentSections.map((section) => (
          <ComponentListEditor
            bucket={section.bucket}
            description={section.description}
            item={item}
            key={section.bucket}
            onAddComponent={onAddComponent}
            onRemoveComponent={onRemoveComponent}
            onUpdateComponent={onUpdateComponent}
            title={section.title}
          />
        ))}
      </div>
    </article>
  )
}

function ComponentListEditor({
  bucket,
  description,
  item,
  onAddComponent,
  onRemoveComponent,
  onUpdateComponent,
  title,
}: {
  bucket: ComponentBucket
  description: string
  item: CasaMiaPackage
  onAddComponent: (packageId: PackageId, bucket: ComponentBucket) => void
  onRemoveComponent: (packageId: PackageId, bucket: ComponentBucket, componentId: string) => void
  onUpdateComponent: (
    packageId: PackageId,
    bucket: ComponentBucket,
    componentId: string,
    patch: Partial<PackageComponent>,
  ) => void
  title: string
}) {
  return (
    <section className="rounded-lg border border-border bg-pale-blue p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-text-dark">{title}</h3>
          <p className="mt-1 text-xs font-bold leading-relaxed text-text-muted">{description}</p>
        </div>
        <button
          className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-blue transition hover:bg-blue hover:text-white"
          type="button"
          aria-label={`Add item to ${title}`}
          onClick={() => onAddComponent(item.id, bucket)}
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {item[bucket].map((component) => (
          <div className="rounded-lg border border-border bg-white p-3" key={component.id}>
            <div className="flex gap-2">
              <input
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-light-blue/40 px-3 text-sm font-bold text-text-dark outline-none transition focus:border-blue focus:bg-white"
                value={component.label}
                onChange={(event) =>
                  onUpdateComponent(item.id, bucket, component.id, { label: event.target.value })
                }
              />
              <button
                className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border text-text-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                type="button"
                aria-label={`Remove ${component.label}`}
                onClick={() => onRemoveComponent(item.id, bucket, component.id)}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
            {bucket === 'quotationOnlyComponents' ? (
              <input
                className="mt-2 min-h-10 w-full rounded-lg border border-border bg-light-blue/40 px-3 text-xs font-bold text-text-mid outline-none transition focus:border-blue focus:bg-white"
                placeholder="Customer note"
                value={component.customerNote ?? ''}
                onChange={(event) =>
                  onUpdateComponent(item.id, bucket, component.id, { customerNote: event.target.value })
                }
              />
            ) : null}
          </div>
        ))}

        {item[bucket].length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-white p-4 text-sm font-bold text-text-muted">
            No items yet.
          </p>
        ) : null}
      </div>
    </section>
  )
}

function TextInput({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-wide text-text-muted">{label}</span>
      <input
        className="min-h-12 rounded-lg border border-border bg-light-blue/40 px-3 text-base font-bold text-text-dark outline-none transition focus:border-blue focus:bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-wide text-text-muted">{label}</span>
      <textarea
        className="min-h-28 rounded-lg border border-border bg-light-blue/40 px-3 py-3 text-base font-bold leading-relaxed text-text-dark outline-none transition focus:border-blue focus:bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function createComponentId(bucket: ComponentBucket) {
  return `${bucket.replace('Components', '')}-${Date.now().toString(36)}`
}
