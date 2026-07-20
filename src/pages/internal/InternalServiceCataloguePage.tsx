import {
  ArrowRight,
  CheckCircle2,
  Euro,
  Eye,
  ListChecks,
  PackageCheck,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import {
  formatServicePrice,
  getDefaultServiceCatalogue,
  getDefaultServicePackageAreas,
  getServiceCatalogue,
  loadServiceCatalogue,
  resetServiceCatalogue,
  saveServiceCatalogueToBackend,
} from '../../services/serviceCatalogue'
import type {
  CasaMiaService,
  CasaMiaServiceTranslation,
  EditableServiceCatalogue,
  PricingType,
  QuantityType,
  ServicePackageArea,
  ServiceRoom,
} from '../../types/serviceCatalogue'
import {
  safetyFindingCategories,
  type SafetyFindingCategory,
  type SafetyFindingSeverity,
} from '../../types/safetyAnalysis'

const roomOptions: Array<{ label: string; value: ServiceRoom; previewPath: string }> = [
  { label: 'Entrance', value: 'entrance', previewPath: '/services/entrance-accessibility' },
  { label: 'Movement', value: 'movement', previewPath: '/services/stair-safety' },
  { label: 'Kitchen', value: 'kitchen', previewPath: '/services/kitchen-safety' },
  { label: 'Bedroom', value: 'bedroom', previewPath: '/services/bedroom-safety' },
  { label: 'Bathroom', value: 'bathroom', previewPath: '/services/bathroom-safety' },
  { label: 'Connected', value: 'connected', previewPath: '/services/smart-home-safety' },
]

const pricingOptions: Array<{ label: string; value: PricingType }> = [
  { label: 'Fixed price', value: 'fixed' },
  { label: 'From price', value: 'from' },
  { label: 'Quote only', value: 'quote_only' },
]

const quantityOptions: Array<{ label: string; value: QuantityType }> = [
  { label: 'Per home', value: 'per_home' },
  { label: 'Per room', value: 'per_room' },
  { label: 'Per unit', value: 'per_unit' },
  { label: 'Per metre', value: 'per_metre' },
  { label: 'Per square metre', value: 'per_square_metre' },
]

const packageAreaOptions: Array<{ label: string; value: ServicePackageArea }> = [
  { label: 'Bathroom', value: 'bathroom' },
  { label: 'Bedroom', value: 'bedroom' },
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Living room', value: 'living-room' },
  { label: 'Stairs', value: 'stairs' },
  { label: 'Entrance', value: 'entrance' },
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Lighting', value: 'lighting' },
  { label: 'Smart safety', value: 'smart-safety' },
]

const evidenceCategoryLabels: Record<SafetyFindingCategory, string> = {
  access: 'Access or thresholds',
  emergency: 'Emergency response',
  fire: 'Fire, smoke or gas',
  lighting: 'Lighting',
  reach: 'Reach or storage',
  slip: 'Slip risk',
  support: 'Support points',
  transfer: 'Transfers',
  trip: 'Trip hazards',
  other: 'Other evidence',
}

const evidenceSeverityOptions: Array<{ label: string; value: SafetyFindingSeverity }> = [
  { label: 'Any supported finding', value: 'low' },
  { label: 'Medium or high only', value: 'medium' },
  { label: 'High only', value: 'high' },
]

const defaultRoom: ServiceRoom = 'kitchen'

export function InternalServiceCataloguePage() {
  const [draft, setDraft] = useState<EditableServiceCatalogue>(() => getServiceCatalogue())
  const [selectedRoom, setSelectedRoom] = useState<ServiceRoom>(defaultRoom)
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState('')

  const roomCounts = useMemo(() => getRoomCounts(draft.services), [draft.services])
  const activeCount = draft.services.filter((service) => service.active).length
  const roomServices = useMemo(
    () => draft.services.filter((service) => service.room === selectedRoom),
    [draft.services, selectedRoom],
  )
  const visibleServices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return roomServices
    }

    return roomServices.filter((service) =>
      [
        service.name,
        service.shortDescription,
        service.customerBenefit,
        service.category,
        service.translations?.es?.name,
        service.translations?.es?.shortDescription,
        service.translations?.es?.customerBenefit,
        service.translations?.es?.category,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [roomServices, searchTerm])
  const selectedService = useMemo(
    () =>
      draft.services.find((service) => service.id === selectedServiceId) ??
      visibleServices[0] ??
      roomServices[0],
    [draft.services, roomServices, selectedServiceId, visibleServices],
  )
  const currentRoom = roomOptions.find((room) => room.value === selectedRoom) ?? roomOptions[0]

  useEffect(() => {
    document.title = 'Service Catalogue | CasaMia Operations'

    let active = true

    loadServiceCatalogue({ internal: true }).then((result) => {
      if (!active) {
        return
      }

      const firstKitchenService = result.catalogue.services.find((service) => service.room === defaultRoom)
      setDraft(result.catalogue)
      setSelectedServiceId(firstKitchenService?.id ?? result.catalogue.services[0]?.id ?? '')
      setStatus(result.remote ? 'Loaded from Supabase.' : 'Using local fallback until the backend is configured.')
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedService || selectedService.room !== selectedRoom) {
      setSelectedServiceId(roomServices[0]?.id ?? '')
    }
  }, [roomServices, selectedRoom, selectedService])

  function updateService(serviceId: string, patch: Partial<CasaMiaService>) {
    setDraft((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.id === serviceId ? { ...service, ...patch, id: service.id } : service,
      ),
    }))
  }

  function addService() {
    const label = selectedRoom === 'connected' ? 'connected safety' : selectedRoom
    const service: CasaMiaService = {
      id: createServiceId(selectedRoom),
      slug: `new-${selectedRoom}-service`,
      name: `New ${label} service`,
      shortDescription: 'One-line customer explanation.',
      customerBenefit: 'What this improvement helps the resident or family achieve.',
      room: selectedRoom,
      category: `${currentRoom.label} safety`,
      pricingType: 'quote_only',
      vatRate: 0.21,
      quantityType: 'per_unit',
      requiresInstallation: true,
      requiresMeasurement: false,
      requiresSiteVisit: true,
      requiresCompatibilityCheck: true,
      includedItems: ['Included item'],
      wizardAreas: getDefaultServicePackageAreas({
        id: `new-${selectedRoom}-service`,
        name: `New ${label} service`,
        category: `${currentRoom.label} safety`,
        room: selectedRoom,
      }),
      active: false,
    }

    setDraft((current) => ({
      ...current,
      services: [service, ...current.services],
    }))
    setSelectedServiceId(service.id)
    setSearchTerm('')
  }

  function removeService(serviceId: string) {
    const isDefaultService = getDefaultServiceCatalogue().services.some((service) => service.id === serviceId)

    setDraft((current) => ({
      ...current,
      services: isDefaultService
        ? current.services.map((service) =>
            service.id === serviceId ? { ...service, active: false } : service,
          )
        : current.services.filter((service) => service.id !== serviceId),
    }))
  }

  function updateIncludedItem(serviceId: string, index: number, value: string) {
    setDraft((current) => ({
      ...current,
      services: current.services.map((service) => {
        if (service.id !== serviceId) {
          return service
        }

        const items = [...(service.includedItems ?? [])]
        items[index] = value

        return { ...service, includedItems: items }
      }),
    }))
  }

  function addIncludedItem(serviceId: string) {
    setDraft((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.id === serviceId
          ? { ...service, includedItems: [...(service.includedItems ?? []), 'New included item'] }
          : service,
      ),
    }))
  }

  function removeIncludedItem(serviceId: string, index: number) {
    setDraft((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              includedItems: (service.includedItems ?? []).filter((_, itemIndex) => itemIndex !== index),
            }
          : service,
      ),
    }))
  }

  async function handleSave() {
    setIsSaving(true)

    try {
      const result = await saveServiceCatalogueToBackend(draft)
      setDraft(result.catalogue)
      setStatus(
        result.remote
          ? 'Saved to Supabase. Public pages now use this catalogue.'
          : 'Saved locally. Add Supabase and internal access in Vercel to make this shared.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleReset() {
    const reset = resetServiceCatalogue()
    setIsSaving(true)

    try {
      const result = await saveServiceCatalogueToBackend(reset)
      const firstKitchenService = result.catalogue.services.find((service) => service.room === defaultRoom)
      setDraft(result.catalogue)
      setSelectedRoom(defaultRoom)
      setSelectedServiceId(firstKitchenService?.id ?? result.catalogue.services[0]?.id ?? '')
      setSearchTerm('')
      setStatus(
        result.remote
          ? 'Restored the default service catalogue in Supabase.'
          : 'Restored defaults locally. Supabase persistence is not configured.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <InternalLayout
      title="Safety Service Catalogue"
      subtitle="Manage every room-by-room improvement, item list, price and installation rule from one source of truth."
      actions={
        <>
          <Link className="btn btn-white" to={currentRoom.previewPath}>
            Preview {currentRoom.label}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <button className="btn btn-white" type="button" onClick={handleReset} disabled={isSaving}>
            <RotateCcw size={18} aria-hidden="true" />
            Restore defaults
          </button>
          <button className="btn btn-navy" type="button" onClick={handleSave} disabled={isSaving}>
            <Save size={18} aria-hidden="true" />
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <StatusCard icon={PackageCheck} label="Service items" value={String(draft.services.length)} />
        <StatusCard icon={CheckCircle2} label="Live on site" value={String(activeCount)} />
        <StatusCard icon={ListChecks} label={`${currentRoom.label} items`} value={String(roomCounts[selectedRoom] ?? 0)} />
        <StatusCard icon={Euro} label="Edited here" value="Prices" />
      </section>

      <section className="mt-6 rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue">Catalogue workspace</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-text-dark">Choose a room, then manage each service.</h2>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-relaxed text-text-mid">
              These cards feed the customer service pages, configurator recommendations, estimates and internal quote workflow.
            </p>
          </div>
          {status ? (
            <p className="rounded-full bg-pale-blue px-4 py-2 text-sm font-black text-navy" role="status">
              {status}
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6" role="tablist" aria-label="Service rooms">
          {roomOptions.map((room) => {
            const isSelected = selectedRoom === room.value

            return (
              <button
                key={room.value}
                className={`rounded-lg border px-4 py-3 text-left transition ${
                  isSelected
                    ? 'border-blue bg-blue text-white shadow-soft'
                    : 'border-border bg-light-blue/40 text-text-dark hover:border-blue hover:bg-white'
                }`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedRoom(room.value)
                  setSearchTerm('')
                }}
              >
                <span className="block text-sm font-black">{room.label}</span>
                <span className={`mt-1 block text-xs font-extrabold ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                  {roomCounts[room.value] ?? 0} services
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-text-dark">{currentRoom.label}</h3>
              <p className="text-xs font-bold text-text-muted">Select an item to edit.</p>
            </div>
            <button
              className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue text-white transition hover:bg-navy"
              type="button"
              aria-label={`Add ${currentRoom.label} service`}
              onClick={addService}
            >
              <Plus size={20} aria-hidden="true" />
            </button>
          </div>

          <label className="mt-4 flex min-h-12 items-center gap-2 rounded-lg border border-border bg-light-blue/40 px-3 text-text-muted focus-within:border-blue focus-within:bg-white">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search services</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-text-dark outline-none"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <div className="mt-4 grid max-h-[72vh] gap-3 overflow-auto pr-1">
            {visibleServices.map((service) => (
              <ServiceListItem
                key={service.id}
                service={service}
                selected={service.id === selectedService?.id}
                onSelect={() => setSelectedServiceId(service.id)}
              />
            ))}
            {visibleServices.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-light-blue/40 p-5 text-sm font-bold text-text-muted">
                No services match this search.
              </div>
            ) : null}
          </div>
        </aside>

        {selectedService ? (
          <ServiceEditor
            key={selectedService.id}
            service={selectedService}
            onAddIncludedItem={addIncludedItem}
            onRemoveIncludedItem={removeIncludedItem}
            onRemoveService={removeService}
            onUpdateIncludedItem={updateIncludedItem}
            onUpdateService={updateService}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center shadow-soft">
            <PackageCheck className="mx-auto text-blue" size={42} aria-hidden="true" />
            <h3 className="mt-4 font-display text-3xl font-bold text-text-dark">No service selected</h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-relaxed text-text-muted">
              Add a service item or choose another room to start editing the catalogue.
            </p>
          </div>
        )}
      </section>
    </InternalLayout>
  )
}

function StatusCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <article className="rounded-lg border border-border bg-white p-5 shadow-soft">
      <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-pale-blue text-blue">
        <Icon size={24} aria-hidden="true" />
      </span>
      <p className="mt-4 text-xs font-black uppercase tracking-wide text-text-muted">{label}</p>
      <strong className="mt-1 block font-display text-3xl font-bold text-navy">{value}</strong>
    </article>
  )
}

function ServiceListItem({
  onSelect,
  selected,
  service,
}: {
  onSelect: () => void
  selected: boolean
  service: CasaMiaService
}) {
  return (
    <button
      className={`rounded-lg border p-4 text-left transition ${
        selected
          ? 'border-blue bg-pale-blue shadow-soft'
          : 'border-border bg-white hover:border-blue hover:bg-light-blue/40'
      }`}
      type="button"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wide text-blue">{service.category}</span>
          <h4 className="mt-1 text-base font-black leading-tight text-text-dark">{service.name}</h4>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${
            service.active ? 'bg-green/15 text-green' : 'bg-light-blue text-text-muted'
          }`}
        >
          {service.active ? 'Live' : 'Draft'}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs font-bold leading-relaxed text-text-muted">
        {service.shortDescription}
      </p>
      <strong className="mt-3 block text-sm font-black text-navy">{formatServicePrice(service)}</strong>
    </button>
  )
}

function ServiceEditor({
  onAddIncludedItem,
  onRemoveIncludedItem,
  onRemoveService,
  onUpdateIncludedItem,
  onUpdateService,
  service,
}: {
  onAddIncludedItem: (serviceId: string) => void
  onRemoveIncludedItem: (serviceId: string, index: number) => void
  onRemoveService: (serviceId: string) => void
  onUpdateIncludedItem: (serviceId: string, index: number, value: string) => void
  onUpdateService: (serviceId: string, patch: Partial<CasaMiaService>) => void
  service: CasaMiaService
}) {
  const isDefaultService = getDefaultServiceCatalogue().services.some((defaultService) => defaultService.id === service.id)
  const spanishCopy = service.translations?.es ?? {}

  function updateSpanishCopy(patch: CasaMiaServiceTranslation) {
    onUpdateService(service.id, {
      translations: {
        ...(service.translations ?? {}),
        es: cleanTranslation({
          ...spanishCopy,
          ...patch,
        }),
      },
    })
  }

  return (
    <article className="rounded-lg border border-border bg-white p-5 shadow-soft">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-pale-blue px-3 py-1 text-xs font-black uppercase tracking-wide text-blue">
              {formatRoomLabel(service.room)}
            </span>
            <span className="rounded-full bg-light-blue px-3 py-1 text-xs font-black uppercase tracking-wide text-text-muted">
              {service.category}
            </span>
            <label className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-black uppercase tracking-wide text-text-muted">
              <input
                checked={service.active}
                className="h-4 w-4 accent-blue"
                type="checkbox"
                onChange={(event) => onUpdateService(service.id, { active: event.target.checked })}
              />
              Live on site
            </label>
          </div>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-text-dark">{service.name}</h2>
          <p className="mt-2 max-w-4xl text-base font-bold leading-relaxed text-text-mid">
            {service.customerBenefit}
          </p>
        </div>

        <ServicePreviewCard service={service} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TextInput
          label="Service name"
          value={service.name}
          onChange={(value) => onUpdateService(service.id, { name: value })}
        />
        <TextInput
          label="Slug"
          value={service.slug}
          onChange={(value) => onUpdateService(service.id, { slug: value })}
        />
        <TextInput
          label="Category"
          value={service.category}
          onChange={(value) => onUpdateService(service.id, { category: value })}
        />
        <SelectInput
          label="Room"
          value={service.room}
          options={roomOptions}
          onChange={(value) => onUpdateService(service.id, { room: value as ServiceRoom })}
        />
        <TextArea
          label="Short description"
          value={service.shortDescription}
          onChange={(value) => onUpdateService(service.id, { shortDescription: value })}
        />
        <TextArea
          label="Customer benefit"
          value={service.customerBenefit}
          onChange={(value) => onUpdateService(service.id, { customerBenefit: value })}
        />
      </div>

      <section className="mt-6 rounded-lg border border-blue/20 bg-pale-blue p-4">
        <div className="mb-4 flex items-start gap-3">
          <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-blue">
            ES
          </span>
          <div>
            <h3 className="text-base font-black text-text-dark">Spanish public copy</h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-text-muted">
              These fields are what Spanish visitors see on the public services page. Leave a field blank to fall back to the main service copy.
            </p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextInput
            label="Spanish service name"
            value={spanishCopy.name ?? ''}
            onChange={(value) => updateSpanishCopy({ name: value })}
          />
          <TextInput
            label="Spanish category"
            value={spanishCopy.category ?? ''}
            onChange={(value) => updateSpanishCopy({ category: value })}
          />
          <TextArea
            label="Spanish short description"
            value={spanishCopy.shortDescription ?? ''}
            onChange={(value) => updateSpanishCopy({ shortDescription: value })}
          />
          <TextArea
            label="Spanish customer benefit"
            value={spanishCopy.customerBenefit ?? ''}
            onChange={(value) => updateSpanishCopy({ customerBenefit: value })}
          />
          <TextArea
            label="Spanish included items, one per line"
            value={(spanishCopy.includedItems ?? []).join('\n')}
            onChange={(value) => updateSpanishCopy({
              includedItems: value.split('\n').map((item) => item.trim()).filter(Boolean),
            })}
          />
          <TextArea
            label="Spanish safety notice"
            value={spanishCopy.safetyNotice ?? ''}
            onChange={(value) => updateSpanishCopy({ safetyNotice: value })}
          />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-light-blue/40 p-4">
        <div className="mb-4 flex items-start gap-3">
          <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-blue">
            <PackageCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-black text-text-dark">Wizard package visibility</h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-text-muted">
              Choose which customer area cards include this service. Changes appear in the public package review after saving.
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {packageAreaOptions.map((option) => {
            const assignedAreas = service.wizardAreas ?? getDefaultServicePackageAreas(service)
            const checked = assignedAreas.includes(option.value)

            return (
              <label
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm font-black transition ${
                  checked
                    ? 'border-blue bg-white text-navy shadow-sm'
                    : 'border-border bg-white/55 text-text-muted hover:border-blue'
                }`}
                key={option.value}
              >
                <input
                  checked={checked}
                  className="h-4 w-4 accent-blue"
                  type="checkbox"
                  onChange={() => onUpdateService(service.id, {
                    wizardAreas: checked
                      ? assignedAreas.filter((area) => area !== option.value)
                      : [...assignedAreas, option.value],
                  })}
                />
                {option.label}
              </label>
            )
          })}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-pale-blue p-4">
        <div className="mb-4 flex items-start gap-3">
          <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-blue">
            <Euro size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-black text-text-dark">Pricing</h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-text-muted">
              This is the estimate shown to customers before CasaMia confirms measurements and compatibility.
            </p>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-4">
          <SelectInput
            label="Pricing type"
            value={service.pricingType}
            options={pricingOptions}
            onChange={(value) => onUpdateService(service.id, { pricingType: value as PricingType })}
          />
          <NumberInput
            label="Product price"
            value={service.productPrice}
            onChange={(value) => onUpdateService(service.id, { productPrice: value })}
          />
          <NumberInput
            label="Installation price"
            value={service.installationPrice}
            onChange={(value) => onUpdateService(service.id, { installationPrice: value })}
          />
          <NumberInput
            label="From price"
            value={service.fromPrice}
            onChange={(value) => onUpdateService(service.id, { fromPrice: value })}
          />
          <SelectInput
            label="Quantity"
            value={service.quantityType}
            options={quantityOptions}
            onChange={(value) => onUpdateService(service.id, { quantityType: value as QuantityType })}
          />
          <NumberInput
            label="Monthly price"
            value={service.recurringMonthlyPrice}
            onChange={(value) => onUpdateService(service.id, { recurringMonthlyPrice: value })}
          />
          <NumberInput
            label="VAT rate"
            step="0.01"
            value={service.vatRate}
            onChange={(value) => onUpdateService(service.id, { vatRate: value ?? 0 })}
          />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-light-blue/40 p-4">
        <div className="mb-4 flex items-start gap-3">
          <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-blue">
            <Eye size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-black text-text-dark">Visual recommendation rules</h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-text-muted">
              Match this service to evidence found in customer photos. Leave all categories empty to use CasaMia's automatic text-based matching.
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {safetyFindingCategories.map((category) => {
            const assigned = service.evidenceCategories ?? []
            const checked = assigned.includes(category)

            return (
              <label
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-xs font-black transition ${
                  checked
                    ? 'border-blue bg-white text-navy shadow-sm'
                    : 'border-border bg-white/55 text-text-muted hover:border-blue'
                }`}
                key={category}
              >
                <input
                  checked={checked}
                  className="h-4 w-4 accent-blue"
                  type="checkbox"
                  onChange={() => onUpdateService(service.id, {
                    evidenceCategories: checked
                      ? assigned.filter((item) => item !== category)
                      : [...assigned, category],
                  })}
                />
                {evidenceCategoryLabels[category]}
              </label>
            )
          })}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SelectInput
            label="Minimum evidence severity"
            value={service.minimumEvidenceSeverity ?? 'low'}
            options={evidenceSeverityOptions}
            onChange={(value) => onUpdateService(service.id, {
              minimumEvidenceSeverity: value as SafetyFindingSeverity,
            })}
          />
          <TextArea
            label="Why CasaMia recommends it"
            value={service.evidenceReason ?? ''}
            onChange={(value) => onUpdateService(service.id, { evidenceReason: value || undefined })}
          />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-light-blue/40 p-4">
        <div className="mb-4 flex items-start gap-3">
          <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-blue">
            <Settings2 size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-black text-text-dark">Installation and management</h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-text-muted">
              These flags control quote review, visit needs and the service explanation shown internally.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ToggleField
            checked={service.requiresInstallation}
            label="Installed by CasaMia"
            onChange={(checked) => onUpdateService(service.id, { requiresInstallation: checked })}
          />
          <ToggleField
            checked={service.requiresMeasurement}
            label="Needs measurements"
            onChange={(checked) => onUpdateService(service.id, { requiresMeasurement: checked })}
          />
          <ToggleField
            checked={service.requiresSiteVisit}
            label="Visit before quote"
            onChange={(checked) => onUpdateService(service.id, { requiresSiteVisit: checked })}
          />
          <ToggleField
            checked={service.requiresCompatibilityCheck}
            label="Compatibility check"
            onChange={(checked) => onUpdateService(service.id, { requiresCompatibilityCheck: checked })}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <section className="rounded-lg border border-border bg-pale-blue p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-text-dark">Included items</h3>
              <p className="mt-1 text-xs font-bold leading-relaxed text-text-muted">
                Keep these short. The first three are highlighted on customer cards.
              </p>
            </div>
            <button
              className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-blue transition hover:bg-blue hover:text-white"
              type="button"
              aria-label={`Add included item to ${service.name}`}
              onClick={() => onAddIncludedItem(service.id)}
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {(service.includedItems ?? []).map((item, index) => (
              <div className="flex gap-2" key={`${service.id}-${index}`}>
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-sm font-bold text-text-dark outline-none transition focus:border-blue"
                  value={item}
                  onChange={(event) => onUpdateIncludedItem(service.id, index, event.target.value)}
                />
                <button
                  className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border text-text-muted transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => onRemoveIncludedItem(service.id, index)}
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <TextArea
            label="Safety notice"
            value={service.safetyNotice ?? ''}
            onChange={(value) => onUpdateService(service.id, { safetyNotice: value || undefined })}
          />
          <button
            className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-black text-red-600 transition hover:bg-red-50"
            type="button"
            onClick={() => onRemoveService(service.id)}
          >
            <Trash2 size={17} aria-hidden="true" />
            {isDefaultService ? 'Hide service' : 'Remove service'}
          </button>
        </section>
      </div>
    </article>
  )
}

function cleanTranslation(translation: CasaMiaServiceTranslation) {
  return Object.fromEntries(
    Object.entries(translation).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return typeof value !== 'string' || value.trim().length > 0
    }),
  ) as CasaMiaServiceTranslation
}

function ServicePreviewCard({ service }: { service: CasaMiaService }) {
  return (
    <aside className="rounded-lg border border-border bg-gradient-to-br from-pale-blue to-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-blue">
          <Eye size={14} aria-hidden="true" />
          Customer preview
        </span>
        <span className="rounded-full bg-blue px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
          {service.pricingType === 'quote_only' ? 'Quote' : 'Estimate'}
        </span>
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-text-dark">{service.name}</h3>
      <p className="mt-2 text-sm font-bold leading-relaxed text-text-mid">{service.shortDescription}</p>
      <div className="mt-4 rounded-lg bg-white p-3">
        <p className="text-xs font-black uppercase tracking-wide text-text-muted">Benefit</p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-text-dark">{service.customerBenefit}</p>
      </div>
      <ul className="mt-4 grid gap-2">
        {(service.includedItems ?? []).slice(0, 3).map((item) => (
          <li className="flex items-start gap-2 text-xs font-bold leading-relaxed text-text-mid" key={item}>
            <CheckCircle2 className="mt-0.5 shrink-0 text-blue" size={15} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <strong className="mt-4 block font-display text-3xl font-bold text-navy">{formatServicePrice(service)}</strong>
    </aside>
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

function SelectInput({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-wide text-text-muted">{label}</span>
      <select
        className="min-h-12 rounded-lg border border-border bg-light-blue/40 px-3 text-base font-bold text-text-dark outline-none transition focus:border-blue focus:bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function NumberInput({
  label,
  onChange,
  step = '1',
  value,
}: {
  label: string
  onChange: (value: number | undefined) => void
  step?: string
  value: number | undefined
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-wide text-text-muted">{label}</span>
      <input
        className="min-h-12 rounded-lg border border-border bg-light-blue/40 px-3 text-base font-bold text-text-dark outline-none transition focus:border-blue focus:bg-white"
        min={0}
        step={step}
        type="number"
        value={value ?? ''}
        onChange={(event) =>
          onChange(event.target.value === '' ? undefined : Math.max(0, Number(event.target.value) || 0))
        }
      />
    </label>
  )
}

function ToggleField({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-white px-4 text-sm font-black text-text-dark">
      <input
        checked={checked}
        className="h-4 w-4 accent-blue"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}

function getRoomCounts(services: CasaMiaService[]) {
  return services.reduce<Record<ServiceRoom, number>>(
    (counts, service) => ({
      ...counts,
      [service.room]: (counts[service.room] ?? 0) + 1,
    }),
    {
      bathroom: 0,
      bedroom: 0,
      connected: 0,
      entrance: 0,
      kitchen: 0,
      movement: 0,
    },
  )
}

function formatRoomLabel(room: ServiceRoom) {
  return roomOptions.find((option) => option.value === room)?.label ?? room
}

function createServiceId(room: ServiceRoom) {
  return `service-${room}-${Date.now().toString(36)}`
}
