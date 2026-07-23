import {
  ArrowRight,
  CheckCircle2,
  Download,
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
  Upload,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { InternalLayout } from '../../components/internal/InternalLayout'
import {
  buildBathroomMasterCatalogueImportPreview,
  exportBathroomMasterCatalogueCsvTemplates,
  masterCatalogueCsvBundleFiles,
  type MasterCatalogueBundleImportPreview,
} from '../../services/masterCatalogueCsv'
import {
  exportMasterCatalogueCsvFiles,
  exportMasterCatalogueJson,
  flattenMasterCatalogueForCompatibility,
  getCustomerCatalogueByRoom,
  getInspectorSpecificationForOutcome,
  getMasterServiceCatalogue,
} from '../../services/masterServiceCatalogue'
import {
  formatPackagePrice,
  getDefaultServiceCatalogue,
  getDefaultServicePackageAreas,
  getPackageConfigForArea,
  getServiceCatalogue,
  loadServiceCatalogue,
  resetServiceCatalogue,
  saveServiceCatalogueToBackend,
} from '../../services/serviceCatalogue'
import type {
  CasaMiaService,
  CasaMiaServiceTranslation,
  EditableServiceCatalogue,
  MasterCatalogueOutcome,
  MasterCataloguePackage,
  MasterCatalogueBackup,
  MasterPricingType,
  MasterServiceCatalogue,
  PricingType,
  QuantityType,
  ServiceCatalogueSection,
  ServiceComponentRole,
  ServicePackageConfig,
  ServicePackageArea,
  ServicePriority,
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

const componentRoleOptions: Array<{ label: string; value: ServiceComponentRole }> = [
  { label: 'Core package component', value: 'core' },
  { label: 'Optional add-on', value: 'option' },
]

const sectionOptions: Array<{ label: string; value: ServiceCatalogueSection }> = [
  { label: 'Home Safety Package', value: 'home_safety_package' },
  { label: 'Connected Room', value: 'connected_room' },
  { label: 'Optional Adaptations', value: 'optional_adaptations' },
]

const priorityOptions: Array<{ label: string; value: ServicePriority }> = [
  { label: 'Essential', value: 'essential' },
  { label: 'Recommended', value: 'recommended' },
  { label: 'Optional', value: 'optional' },
]

const defaultRoom: ServiceRoom = 'kitchen'
const catalogueCsvColumns = [
  'id',
  'slug',
  'room',
  'section',
  'active',
  'status',
  'version',
  'componentRole',
  'priority',
  'name',
  'customerName',
  'internalName',
  'category',
  'shortDescription',
  'customerDescription',
  'customerBenefit',
  'outcome',
  'plainLanguageSummary',
  'websiteVisible',
  'wizardVisible',
  'proposalVisible',
  'inspectorVisible',
  'adminVisible',
  'crmVisible',
  'mobileVisible',
  'pricingType',
  'productPrice',
  'installationPrice',
  'fromPrice',
  'recurringMonthlyPrice',
  'vatRate',
  'quantityType',
  'requiresAssessment',
  'requiresInstallation',
  'requiresMeasurement',
  'requiresSiteVisit',
  'requiresCompatibilityCheck',
  'requiresQuote',
  'typicalInstallationTime',
  'grantEligible',
  'grantCategories',
  'grantEvidenceNeeded',
  'vatReason',
  'smartDependencies',
  'includedItems',
  'wizardAreas',
  'safetyNotice',
  'esName',
  'esCategory',
  'esShortDescription',
  'esCustomerBenefit',
  'esIncludedItems',
  'esSafetyNotice',
] as const

type CatalogueImportMode = 'upsert' | 'replace-room'

type CatalogueImportPreview = {
  added: number
  mode: CatalogueImportMode
  room: ServiceRoom
  services: CasaMiaService[]
  skipped: number
  updated: number
  warnings: string[]
}

export function InternalServiceCataloguePage() {
  const [masterCatalogue, setMasterCatalogue] = useState<MasterServiceCatalogue>(() => getMasterServiceCatalogue())
  const [savedMasterCatalogue, setSavedMasterCatalogue] = useState<MasterServiceCatalogue>(() => getMasterServiceCatalogue())
  const [masterCatalogueBackups, setMasterCatalogueBackups] = useState<MasterCatalogueBackup[]>([])
  const [draft, setDraft] = useState<EditableServiceCatalogue>(() => getServiceCatalogue())
  const [selectedRoom, setSelectedRoom] = useState<ServiceRoom>(defaultRoom)
  const [selectedMasterRoomId, setSelectedMasterRoomId] = useState('bathroom')
  const [selectedMasterOutcomeId, setSelectedMasterOutcomeId] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [importMode, setImportMode] = useState<CatalogueImportMode>('upsert')
  const [importPreview, setImportPreview] = useState<CatalogueImportPreview | null>(null)
  const [masterImportPreview, setMasterImportPreview] = useState<MasterCatalogueBundleImportPreview | null>(null)
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
        service.customerName,
        service.internalName,
        service.shortDescription,
        service.customerDescription,
        service.customerBenefit,
        service.outcome,
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
  const currentPackageAreas = useMemo(() => getPackageAreasForRoom(selectedRoom), [selectedRoom])
  const groupedVisibleServices = useMemo(
    () => groupServicesBySection(visibleServices),
    [visibleServices],
  )
  const masterRoomPackages = useMemo(
    () => getCustomerCatalogueByRoom(selectedMasterRoomId, masterCatalogue),
    [masterCatalogue, selectedMasterRoomId],
  )
  const masterOutcomes = useMemo(
    () => masterRoomPackages.flatMap((item) => item.outcomes),
    [masterRoomPackages],
  )
  const selectedMasterOutcome = useMemo(
    () =>
      masterOutcomes.find((outcome) => outcome.id === selectedMasterOutcomeId) ??
      masterOutcomes[0],
    [masterOutcomes, selectedMasterOutcomeId],
  )
  const selectedMasterSpecification = useMemo(
    () => selectedMasterOutcome ? getInspectorSpecificationForOutcome(selectedMasterOutcome.id, masterCatalogue) : undefined,
    [masterCatalogue, selectedMasterOutcome],
  )
  const masterIntegrity = useMemo(() => getMasterIntegritySummary(masterCatalogue), [masterCatalogue])
  const hasUnsavedMasterChanges = useMemo(
    () => JSON.stringify(masterCatalogue) !== JSON.stringify(savedMasterCatalogue),
    [masterCatalogue, savedMasterCatalogue],
  )

  useEffect(() => {
    if (masterOutcomes.length && !masterOutcomes.some((outcome) => outcome.id === selectedMasterOutcomeId)) {
      setSelectedMasterOutcomeId(masterOutcomes[0].id)
    }
  }, [masterOutcomes, selectedMasterOutcomeId])

  useEffect(() => {
    document.title = 'Service Catalogue | CasaMia Operations'

    let active = true

    loadServiceCatalogue({ internal: true }).then((result) => {
      if (!active) {
        return
      }

      const firstKitchenService = result.catalogue.services.find((service) => service.room === defaultRoom)
      const loadedMasterCatalogue = result.catalogue.masterCatalogue ?? getMasterServiceCatalogue()
      setDraft(result.catalogue)
      setMasterCatalogue(loadedMasterCatalogue)
      setSavedMasterCatalogue(loadedMasterCatalogue)
      setMasterCatalogueBackups(result.catalogue.masterCatalogueBackups ?? [])
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

  function updatePackageConfig(area: ServicePackageArea, patch: Partial<ServicePackageConfig>) {
    setDraft((current) => {
      const defaults = getDefaultServiceCatalogue().packageConfigs ?? []
      const existingConfigs = current.packageConfigs ?? defaults

      return {
        ...current,
        packageConfigs: packageAreaOptions.map((option) => {
          const existing =
            existingConfigs.find((config) => config.area === option.value) ??
            defaults.find((config) => config.area === option.value) ?? {
              active: true,
              area: option.value,
              pricingType: 'quote_only',
              vatRate: 0.21,
            }

          return option.value === area ? { ...existing, ...patch, area } : existing
        }),
      }
    })
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
      componentRole: 'core',
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

  function handleDownloadCsv() {
    const rows = draft.services.filter((service) => service.room === selectedRoom)
    downloadTextFile(
      `casamia-service-catalogue-${selectedRoom}.csv`,
      servicesToCsv(rows.length > 0 ? rows : [createTemplateService(selectedRoom)]),
    )
    setStatus(`Downloaded ${currentRoom.label} CSV template.`)
  }

  function handleDownloadMasterJson() {
    downloadTextFile('casamia-master-service-catalogue.json', exportMasterCatalogueJson(masterCatalogue), 'application/json')
    setStatus('Downloaded the full Master Service Catalogue JSON backup.')
  }

  function handleDownloadMasterCsvFiles() {
    const files = exportMasterCatalogueCsvFiles(masterCatalogue)

    Object.entries(files).forEach(([fileName, content]) => {
      downloadTextFile(`casamia-master-${fileName}`, content)
    })
    setStatus('Downloaded Master Catalogue entity CSV files.')
  }

  function handleDownloadBathroomMasterTemplates() {
    const files = exportBathroomMasterCatalogueCsvTemplates(masterCatalogue)

    Object.entries(files).forEach(([fileName, content]) => {
      downloadTextFile(`casamia-bathroom-master-${fileName}`, content)
    })
    setStatus('Downloaded Bathroom Master Catalogue CSV templates.')
  }

  async function handleBathroomMasterBundleImport(fileList: FileList | null) {
    if (!fileList?.length) return

    const uploadedFiles = Array.from(fileList)
    const files: Partial<Record<(typeof masterCatalogueCsvBundleFiles)[number], string>> = {}

    try {
      await Promise.all(
        uploadedFiles.map(async (file) => {
          const normalizedName = file.name
            .replace(/^casamia-bathroom-master-/i, '')
            .replace(/^casamia-master-/i, '')
            .toLowerCase()

          if (masterCatalogueCsvBundleFiles.includes(normalizedName as (typeof masterCatalogueCsvBundleFiles)[number])) {
            files[normalizedName as (typeof masterCatalogueCsvBundleFiles)[number]] = await file.text()
          }
        }),
      )

      const preview = buildBathroomMasterCatalogueImportPreview(files, masterCatalogue)
      setMasterImportPreview(preview)
      setStatus(
        preview.errors.length
          ? `Bathroom bundle needs review: ${preview.errors.length} error${preview.errors.length === 1 ? '' : 's'}.`
          : `Bathroom bundle preview ready: ${preview.counts.packages} packages, ${preview.counts.outcomes} outcomes.`,
      )
    } catch (error) {
      setMasterImportPreview(null)
      setStatus(error instanceof Error ? error.message : 'Could not read the Bathroom master bundle.')
    }
  }

  function applyBathroomMasterBundleImport() {
    if (!masterImportPreview || masterImportPreview.errors.length) return

    setMasterCatalogue(masterImportPreview.catalogue)
    syncDraftFromMasterCatalogue(masterImportPreview.catalogue)
    setSelectedMasterRoomId('bathroom')
    setSelectedMasterOutcomeId('')
    setStatus('Applied Bathroom bundle to the Master Catalogue preview. Save changes to publish it.')
    setMasterImportPreview(null)
  }

  function syncDraftFromMasterCatalogue(nextCatalogue: MasterServiceCatalogue) {
    setDraft((current) => {
      const masterRooms = new Set(['bathroom', 'bedroom'])
      const masterServices = flattenMasterCatalogueForCompatibility(nextCatalogue)

      return {
        ...current,
        masterCatalogue: nextCatalogue,
        services: [
          ...masterServices,
          ...current.services.filter((service) => !masterRooms.has(service.room)),
        ],
      }
    })
  }

  function updateMasterPackage(packageId: string, patch: Partial<MasterCataloguePackage>) {
    setMasterCatalogue((current) => {
      const nextCatalogue: MasterServiceCatalogue = {
        ...current,
        packages: current.packages.map((packageRecord) =>
          packageRecord.id === packageId
            ? { ...packageRecord, ...patch, id: packageRecord.id, updatedAt: new Date().toISOString() }
            : packageRecord,
        ),
        updatedAt: new Date().toISOString(),
      }

      syncDraftFromMasterCatalogue(nextCatalogue)

      return nextCatalogue
    })
    setStatus('Package pricing updated in the Master Catalogue preview. Save changes to publish.')
  }

  function restoreLatestMasterBackup() {
    const latestBackup = masterCatalogueBackups[0]
    if (!latestBackup) {
      setStatus('No Master Catalogue backup is available yet.')
      return
    }

    setMasterCatalogue(latestBackup.catalogue)
    syncDraftFromMasterCatalogue(latestBackup.catalogue)
    setSelectedMasterRoomId('bathroom')
    setSelectedMasterOutcomeId('')
    setStatus(`Restored previous Master Catalogue from ${new Date(latestBackup.createdAt).toLocaleString()}. Save changes to publish.`)
  }

  async function handleImportCsv(file: File | null) {
    if (!file) return

    try {
      const text = await file.text()
      const preview = buildCatalogueImportPreview(text, draft, selectedRoom, importMode)
      setImportPreview(preview)
      setStatus(
        `Preview ready: ${preview.added} new, ${preview.updated} updated, ${preview.skipped} skipped.`,
      )
    } catch (error) {
      setImportPreview(null)
      setStatus(error instanceof Error ? error.message : 'Could not read the uploaded CSV.')
    }
  }

  function applyImportPreview() {
    if (!importPreview) return

    setDraft((current) => {
      const importedById = new Map(importPreview.services.map((service) => [service.id, service]))
      const existingWithoutImportedRoom =
        importPreview.mode === 'replace-room'
          ? current.services.filter((service) => service.room !== importPreview.room)
          : current.services.filter((service) => !importedById.has(service.id))

      return {
        ...current,
        services: [...importPreview.services, ...existingWithoutImportedRoom],
      }
    })
    setSelectedRoom(importPreview.room)
    setSelectedServiceId(importPreview.services[0]?.id ?? '')
    setSearchTerm('')
    setStatus(
      `Applied import to draft: ${importPreview.added} new and ${importPreview.updated} updated. Save changes to publish.`,
    )
    setImportPreview(null)
  }

  async function handleSave() {
    setIsSaving(true)

    try {
      const nextBackups = hasUnsavedMasterChanges
        ? [
            {
              catalogue: savedMasterCatalogue,
              createdAt: new Date().toISOString(),
              reason: 'Automatic backup before publishing Master Catalogue changes',
              version: savedMasterCatalogue.version,
            },
            ...masterCatalogueBackups,
          ].slice(0, 5)
        : masterCatalogueBackups
      const result = await saveServiceCatalogueToBackend({
        ...draft,
        masterCatalogue,
        masterCatalogueBackups: nextBackups,
      })
      setDraft(result.catalogue)
      setMasterCatalogue(result.catalogue.masterCatalogue ?? masterCatalogue)
      setSavedMasterCatalogue(result.catalogue.masterCatalogue ?? masterCatalogue)
      setMasterCatalogueBackups(result.catalogue.masterCatalogueBackups ?? nextBackups)
      setStatus(
        result.remote
          ? 'Saved to Supabase. Public pages now use this Master Catalogue.'
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
      const resetMasterCatalogue = result.catalogue.masterCatalogue ?? getMasterServiceCatalogue()
      setDraft(result.catalogue)
      setMasterCatalogue(resetMasterCatalogue)
      setSavedMasterCatalogue(resetMasterCatalogue)
      setMasterCatalogueBackups(result.catalogue.masterCatalogueBackups ?? [])
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

      <MasterCatalogueHierarchyPanel
        catalogue={masterCatalogue}
        integrity={masterIntegrity}
        packages={masterRoomPackages}
        selectedOutcome={selectedMasterOutcome}
        selectedRoomId={selectedMasterRoomId}
        selectedSpecification={selectedMasterSpecification}
        backupCount={masterCatalogueBackups.length}
        hasUnsavedChanges={hasUnsavedMasterChanges}
        importPreview={masterImportPreview}
        onApplyBathroomBundleImport={applyBathroomMasterBundleImport}
        onDownloadBathroomTemplates={handleDownloadBathroomMasterTemplates}
        onDownloadCsvFiles={handleDownloadMasterCsvFiles}
        onDownloadJson={handleDownloadMasterJson}
        onImportBathroomBundle={handleBathroomMasterBundleImport}
        onSelectOutcome={setSelectedMasterOutcomeId}
        onSelectRoom={setSelectedMasterRoomId}
        onRestoreLatestBackup={restoreLatestMasterBackup}
        onUpdatePackage={updateMasterPackage}
      />

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

        <div className="mt-5 rounded-lg border border-blue/20 bg-pale-blue p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-base font-black text-text-dark">Bulk update {currentRoom.label}</h3>
              <p className="mt-1 max-w-3xl text-xs font-bold leading-relaxed text-text-muted">
                Download the current room catalogue, edit it in Excel or Sheets, then upload it here. Nothing changes until you review and apply the import.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-white" type="button" onClick={handleDownloadCsv}>
                <Download size={18} aria-hidden="true" />
                Download CSV
              </button>
              <label className="btn btn-navy cursor-pointer">
                <Upload size={18} aria-hidden="true" />
                Upload CSV
                <input
                  className="sr-only"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => {
                    void handleImportCsv(event.target.files?.[0] ?? null)
                    event.currentTarget.value = ''
                  }}
                />
              </label>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="rounded-lg border border-border bg-white p-3 text-sm font-black text-text-dark">
              <span className="mb-2 block text-xs uppercase tracking-wide text-text-muted">Import mode</span>
              <select
                className="min-h-11 w-full rounded-lg border border-border bg-light-blue/40 px-3 font-bold outline-none focus:border-blue focus:bg-white"
                value={importMode}
                onChange={(event) => {
                  setImportMode(event.target.value as CatalogueImportMode)
                  setImportPreview(null)
                }}
              >
                <option value="upsert">Update existing and add new items</option>
                <option value="replace-room">Replace this room only</option>
              </select>
            </label>
            <div className="rounded-lg border border-border bg-white p-3 text-sm font-bold leading-relaxed text-text-muted">
              <strong className="block text-xs uppercase tracking-wide text-text-dark">Safe import rules</strong>
              Rows for other rooms are skipped. Matching is by service ID. Use <span className="font-black text-navy">|</span> between multiple included items or package areas.
            </div>
          </div>

          {importPreview ? (
            <div className="mt-4 rounded-lg border border-green/30 bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-base font-black text-text-dark">Import preview ready</h3>
                  <p className="mt-1 text-sm font-bold text-text-muted">
                    {importPreview.added} new · {importPreview.updated} updated · {importPreview.skipped} skipped
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-white" type="button" onClick={() => setImportPreview(null)}>
                    Cancel import
                  </button>
                  <button className="btn btn-green" type="button" onClick={applyImportPreview}>
                    Apply to draft
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {importPreview.warnings.length > 0 ? (
                <ul className="mt-3 grid gap-1 text-xs font-bold leading-relaxed text-text-muted">
                  {importPreview.warnings.slice(0, 6).map((warning) => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-5 rounded-lg border border-border bg-white p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-base font-black text-text-dark">Package pricing for {currentRoom.label}</h3>
              <p className="mt-1 max-w-3xl text-xs font-bold leading-relaxed text-text-muted">
                Customer pricing lives at package level. Service rows below are components marked as core or optional.
              </p>
            </div>
            <span className="rounded-full bg-pale-blue px-3 py-1 text-xs font-black uppercase tracking-wide text-blue">
              {currentPackageAreas.length} package area{currentPackageAreas.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {currentPackageAreas.map((area) => {
              const config = getPackageConfigForArea(draft, area)
              const areaLabel = formatPackageAreaLabel(area)

              return (
                <div className="rounded-lg border border-border bg-light-blue/30 p-4" key={area}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-blue">{areaLabel}</p>
                      <strong className="mt-1 block text-lg font-black text-text-dark">
                        {formatPackagePrice(config)}
                      </strong>
                    </div>
                    <label className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-text-muted">
                      <input
                        checked={config?.active ?? true}
                        className="h-4 w-4 accent-blue"
                        type="checkbox"
                        onChange={(event) => updatePackageConfig(area, { active: event.target.checked })}
                      />
                      Live
                    </label>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <TextInput
                      label="Package name"
                      value={config?.name ?? areaLabel}
                      onChange={(value) => updatePackageConfig(area, { name: value })}
                    />
                    <SelectInput
                      label="Package pricing"
                      value={config?.pricingType ?? 'quote_only'}
                      options={pricingOptions}
                      onChange={(value) => updatePackageConfig(area, { pricingType: value as PricingType })}
                    />
                    <NumberInput
                      label="Fixed package price"
                      value={config?.packagePrice}
                      onChange={(value) => updatePackageConfig(area, { packagePrice: value })}
                    />
                    <NumberInput
                      label="From package price"
                      value={config?.fromPrice}
                      onChange={(value) => updatePackageConfig(area, { fromPrice: value })}
                    />
                    <NumberInput
                      label="Monthly package price"
                      value={config?.recurringMonthlyPrice}
                      onChange={(value) => updatePackageConfig(area, { recurringMonthlyPrice: value })}
                    />
                    <NumberInput
                      label="VAT rate"
                      step="0.01"
                      value={config?.vatRate ?? 0.21}
                      onChange={(value) => updatePackageConfig(area, { vatRate: value ?? 0 })}
                    />
                  </div>
                </div>
              )
            })}
          </div>
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

          <div className="mt-4 grid max-h-[72vh] gap-4 overflow-auto pr-1">
            {groupedVisibleServices.map((group) => (
              <section key={group.section}>
                <div className="mb-2 flex items-center justify-between gap-2 px-1">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">
                    {formatSectionLabel(group.section)}
                  </h4>
                  <span className="rounded-full bg-light-blue px-2 py-0.5 text-[10px] font-black text-text-muted">
                    {group.services.length}
                  </span>
                </div>
                <div className="grid gap-3">
                  {group.services.map((service) => (
                    <ServiceListItem
                      key={service.id}
                      service={service}
                      selected={service.id === selectedService?.id}
                      onSelect={() => setSelectedServiceId(service.id)}
                    />
                  ))}
                </div>
              </section>
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

function MasterCatalogueHierarchyPanel({
  backupCount,
  catalogue,
  hasUnsavedChanges,
  importPreview,
  integrity,
  onApplyBathroomBundleImport,
  onDownloadBathroomTemplates,
  onDownloadCsvFiles,
  onDownloadJson,
  onImportBathroomBundle,
  onRestoreLatestBackup,
  onSelectOutcome,
  onSelectRoom,
  onUpdatePackage,
  packages,
  selectedOutcome,
  selectedRoomId,
  selectedSpecification,
}: {
  backupCount: number
  catalogue: MasterServiceCatalogue
  hasUnsavedChanges: boolean
  importPreview: MasterCatalogueBundleImportPreview | null
  integrity: ReturnType<typeof getMasterIntegritySummary>
  onApplyBathroomBundleImport: () => void
  onDownloadBathroomTemplates: () => void
  onDownloadCsvFiles: () => void
  onDownloadJson: () => void
  onImportBathroomBundle: (files: FileList | null) => void
  onRestoreLatestBackup: () => void
  onSelectOutcome: (outcomeId: string) => void
  onSelectRoom: (roomId: string) => void
  onUpdatePackage: (packageId: string, patch: Partial<MasterCataloguePackage>) => void
  packages: Array<{ package: MasterCataloguePackage; outcomes: MasterCatalogueOutcome[] }>
  selectedOutcome?: MasterCatalogueOutcome
  selectedRoomId: string
  selectedSpecification?: ReturnType<typeof getInspectorSpecificationForOutcome>
}) {
  return (
    <section className="mt-6 rounded-lg border border-blue/20 bg-gradient-to-br from-navy via-[#114967] to-blue p-5 text-white shadow-soft">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-green">Master Service Catalogue</p>
          <h2 className="mt-2 font-display text-4xl font-bold leading-tight">
            Outcome-first hierarchy, products kept internal.
          </h2>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-white/75">
            This is the frozen source of truth for Bathroom and Bedroom. Customer pages consume packages and
            outcomes; inspectors and proposals resolve each outcome into capabilities, products and tasks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ${
            hasUnsavedChanges ? 'bg-amber-100 text-amber-800' : 'bg-green text-navy'
          }`}>
            {hasUnsavedChanges ? 'Unsaved preview' : 'Saved live'}
          </span>
          <button
            className="btn btn-white"
            type="button"
            onClick={onRestoreLatestBackup}
            disabled={backupCount === 0}
            title={backupCount === 0 ? 'No backup available yet' : 'Restore the last saved Master Catalogue backup'}
          >
            <RotateCcw size={18} aria-hidden="true" />
            Restore last
          </button>
          <button className="btn btn-white" type="button" onClick={onDownloadJson}>
            <Download size={18} aria-hidden="true" />
            JSON backup
          </button>
          <button className="btn btn-green" type="button" onClick={onDownloadCsvFiles}>
            <Download size={18} aria-hidden="true" />
            Entity CSVs
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MasterMetric label="Packages" value={catalogue.packages.length} />
        <MasterMetric label="Outcomes" value={catalogue.outcomes.length} />
        <MasterMetric label="Capabilities" value={catalogue.capabilities.length} />
        <MasterMetric label="Products/devices" value={catalogue.products.length} />
        <MasterMetric label="Tasks" value={catalogue.installationTasks.length} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-black">Catalogue integrity</h3>
            <p className="mt-1 text-xs font-bold text-white/65">
              {integrity.issueCount === 0
                ? 'No duplicate IDs, missing relations or orphaned active entities detected.'
                : `${integrity.issueCount} issue${integrity.issueCount === 1 ? '' : 's'} need attention.`}
            </p>
            <p className="mt-1 text-xs font-bold text-white/55">
              {backupCount
                ? `${backupCount} previous Master Catalogue backup${backupCount === 1 ? '' : 's'} available.`
                : 'A previous version will be backed up automatically before the first Master Catalogue save.'}
            </p>
          </div>
          <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ${
            integrity.issueCount === 0 ? 'bg-green text-navy' : 'bg-red-100 text-red-700'
          }`}>
            {integrity.issueCount === 0 ? 'Validated' : 'Needs review'}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/15 bg-white p-4 text-text-dark">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue">Bathroom import flow</p>
            <h3 className="mt-1 font-display text-2xl font-bold">Feed packages from one CSV bundle</h3>
            <p className="mt-2 max-w-3xl text-sm font-bold leading-relaxed text-text-mid">
              Download the Bathroom templates, edit the package outcomes, capabilities, products and tasks, then upload
              all nine CSV files together. The import is validated first and only updates the master preview when applied.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-white" type="button" onClick={onDownloadBathroomTemplates}>
              <Download size={18} aria-hidden="true" />
              Bathroom templates
            </button>
            <label className="btn btn-navy cursor-pointer">
              <Upload size={18} aria-hidden="true" />
              Upload bundle
              <input
                className="sr-only"
                type="file"
                accept=".csv,text/csv"
                multiple
                onChange={(event) => {
                  onImportBathroomBundle(event.currentTarget.files)
                  event.currentTarget.value = ''
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <ImportStepPill label="1" text="Download templates" />
          <ImportStepPill label="2" text="Edit Bathroom bundle" />
          <ImportStepPill label="3" text="Upload and validate" />
        </div>

        <div className="mt-4 rounded-xl border border-border bg-light-blue/40 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-text-muted">Required files</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {masterCatalogueCsvBundleFiles.map((fileName) => (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue" key={fileName}>
                {fileName}
              </span>
            ))}
          </div>
        </div>

        {importPreview ? (
          <div className="mt-4 rounded-2xl border border-border bg-white p-4 shadow-soft">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue">Import preview</p>
                <h4 className="mt-1 text-xl font-black text-text-dark">
                  {importPreview.errors.length ? 'Review before applying' : 'Ready to apply to Bathroom'}
                </h4>
              </div>
              <button
                className="btn btn-green"
                type="button"
                onClick={onApplyBathroomBundleImport}
                disabled={importPreview.errors.length > 0}
              >
                <CheckCircle2 size={18} aria-hidden="true" />
                Apply to preview
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
              <MasterImportMetric label="Packages" value={importPreview.counts.packages} />
              <MasterImportMetric label="Outcomes" value={importPreview.counts.outcomes} />
              <MasterImportMetric label="Capabilities" value={importPreview.counts.capabilities} />
              <MasterImportMetric label="Products" value={importPreview.counts.products} />
              <MasterImportMetric label="Tasks" value={importPreview.counts.installationTasks} />
              <MasterImportMetric label="Relations" value={importPreview.counts.relations} />
            </div>

            {importPreview.errors.length ? (
              <MessageList tone="error" title="Errors to fix" items={importPreview.errors} />
            ) : null}
            {importPreview.warnings.length ? (
              <MessageList tone="warning" title="Warnings" items={importPreview.warnings} />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <aside className="rounded-2xl border border-white/15 bg-white/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Rooms</p>
          <div className="mt-3 grid gap-2">
            {catalogue.rooms.map((room) => {
              const selected = room.id === selectedRoomId

              return (
                <button
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    selected
                      ? 'border-green bg-white text-navy'
                      : 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                  }`}
                  key={room.id}
                  type="button"
                  onClick={() => onSelectRoom(room.id)}
                >
                  <strong className="block text-sm font-black">{room.name.en}</strong>
                  <span className={`mt-1 block text-xs font-bold ${selected ? 'text-navy/60' : 'text-white/60'}`}>
                    {catalogue.packages.filter((item) => item.roomId === room.id).length} packages ·{' '}
                    {catalogue.outcomes.filter((item) => item.roomId === room.id).length} outcomes
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="rounded-2xl border border-white/15 bg-white p-4 text-text-dark">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue">Hierarchy</p>
              <h3 className="mt-1 font-display text-2xl font-bold">Packages and customer outcomes</h3>
            </div>
            <span className="rounded-full bg-pale-blue px-3 py-1 text-xs font-black uppercase tracking-wide text-blue">
              Room → Section → Package → Outcome
            </span>
          </div>
          <div className="mt-4 grid gap-4">
            {packages.map(({ package: packageRecord, outcomes }) => (
              <article className="rounded-2xl border border-border bg-light-blue/30 p-4" key={packageRecord.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue">
                      {formatMasterSectionLabel(packageRecord.section)}
                    </p>
                    <h4 className="mt-1 text-xl font-black text-text-dark">{packageRecord.customerName.en}</h4>
                    <p className="mt-1 text-xs font-bold text-text-muted">Internal: {packageRecord.internalName}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-text-muted">
                    {outcomes.length} outcomes
                  </span>
                </div>
                <MasterPackagePriceEditor packageRecord={packageRecord} onUpdatePackage={onUpdatePackage} />
                <div className="mt-4 grid gap-2">
                  {outcomes.map((outcome) => {
                    const selected = outcome.id === selectedOutcome?.id

                    return (
                      <button
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          selected
                            ? 'border-blue bg-white shadow-soft'
                            : 'border-border bg-white/70 hover:border-blue hover:bg-white'
                        }`}
                        key={outcome.id}
                        type="button"
                        onClick={() => onSelectOutcome(outcome.id)}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-base font-black text-text-dark">{outcome.customerName.en}</strong>
                          <span className="rounded-full bg-pale-blue px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue">
                            {outcome.priority}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-bold leading-relaxed text-text-muted">
                          {outcome.shortDescription.en}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-white/15 bg-white p-4 text-text-dark">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue">Selected outcome</p>
          {selectedOutcome && selectedSpecification ? (
            <>
              <h3 className="mt-2 font-display text-3xl font-bold leading-tight">{selectedOutcome.customerName.en}</h3>
              <p className="mt-2 text-sm font-bold leading-relaxed text-text-mid">{selectedOutcome.customerBenefit.en}</p>
              <div className="mt-4 grid gap-3">
                <SpecList title="Capabilities" items={selectedSpecification.capabilities.map((item) => item.name)} />
                <SpecList title="Internal products/devices" items={selectedSpecification.products.map((item) => item.name)} />
                <SpecList title="Installation tasks" items={selectedSpecification.installationTasks.map((item) => item.name)} />
              </div>
              <div className="mt-4 rounded-xl bg-pale-blue p-3">
                <p className="text-xs font-black uppercase tracking-wide text-blue">Rules</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedOutcome.requiresQuote ? <RulePill>Quote required</RulePill> : <RulePill>Package-led</RulePill>}
                  {selectedOutcome.requiresSmartSpeaker ? <RulePill>Smart speaker</RulePill> : null}
                  {selectedOutcome.requiresCompatibilityCheck ? <RulePill>Compatibility</RulePill> : null}
                  {selectedOutcome.grantEligible ? <RulePill>Grant-relevant</RulePill> : null}
                </div>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm font-bold text-text-muted">Select an outcome to inspect its operational layer.</p>
          )}
        </aside>
      </div>
    </section>
  )
}

function MasterMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <strong className="font-display text-3xl font-bold text-white">{value}</strong>
      <p className="mt-1 text-xs font-black uppercase tracking-wide text-white/60">{label}</p>
    </article>
  )
}

const masterPricingOptions: Array<{ label: string; value: MasterPricingType }> = [
  { label: 'From price', value: 'from' },
  { label: 'Fixed price', value: 'fixed' },
  { label: 'Quote after review', value: 'quote' },
  { label: 'Included in package', value: 'included-in-package' },
  { label: 'Range', value: 'range' },
  { label: 'Recurring', value: 'recurring' },
]

function MasterPackagePriceEditor({
  onUpdatePackage,
  packageRecord,
}: {
  onUpdatePackage: (packageId: string, patch: Partial<MasterCataloguePackage>) => void
  packageRecord: MasterCataloguePackage
}) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue">Package pricing</p>
          <p className="mt-1 text-xs font-bold text-text-muted">
            Customer price is package-led; products remain internal.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full bg-light-blue px-3 py-2 text-xs font-black text-navy">
          <input
            className="h-4 w-4 accent-blue"
            type="checkbox"
            checked={packageRecord.requiresQuote}
            onChange={(event) =>
              onUpdatePackage(packageRecord.id, {
                pricingType: event.currentTarget.checked ? 'quote' : packageRecord.pricingType === 'quote' ? 'from' : packageRecord.pricingType,
                requiresQuote: event.currentTarget.checked,
              })
            }
          />
          Requires quote
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="grid gap-1">
          <span className="text-[11px] font-black uppercase tracking-wide text-text-muted">Type</span>
          <select
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold text-text-dark outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20"
            value={packageRecord.pricingType}
            onChange={(event) => {
              const pricingType = event.currentTarget.value as MasterPricingType
              onUpdatePackage(packageRecord.id, {
                pricingType,
                requiresQuote: pricingType === 'quote' ? true : packageRecord.requiresQuote,
              })
            }}
          >
            {masterPricingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <MasterPriceInput
          label="From"
          value={packageRecord.fromPrice}
          onChange={(fromPrice) => onUpdatePackage(packageRecord.id, { fromPrice })}
        />
        <MasterPriceInput
          label="Fixed"
          value={packageRecord.fixedPrice}
          onChange={(fixedPrice) => onUpdatePackage(packageRecord.id, { fixedPrice })}
        />
        <MasterPriceInput
          label="Monthly"
          value={packageRecord.recurringMonthlyPrice}
          onChange={(recurringMonthlyPrice) => onUpdatePackage(packageRecord.id, { recurringMonthlyPrice })}
        />
        <label className="grid gap-1">
          <span className="text-[11px] font-black uppercase tracking-wide text-text-muted">VAT</span>
          <select
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold text-text-dark outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20"
            value={String(packageRecord.vatRate)}
            onChange={(event) => onUpdatePackage(packageRecord.id, { vatRate: Number(event.currentTarget.value) })}
          >
            <option value="0.1">10%</option>
            <option value="0.21">21%</option>
            <option value="0">0%</option>
          </select>
        </label>
      </div>
    </div>
  )
}

function MasterPriceInput({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: number | undefined) => void
  value: number | undefined
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-black uppercase tracking-wide text-text-muted">{label}</span>
      <input
        className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold text-text-dark outline-none transition placeholder:text-text-muted/60 focus:border-blue focus:ring-2 focus:ring-blue/20"
        inputMode="decimal"
        min="0"
        placeholder="EUR"
        type="number"
        value={value ?? ''}
        onChange={(event) => {
          const nextValue = event.currentTarget.value.trim()
          onChange(nextValue ? Number(nextValue) : undefined)
        }}
      />
    </label>
  )
}

function MasterImportMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border border-border bg-light-blue/30 p-3">
      <strong className="font-display text-2xl font-bold text-navy">{value}</strong>
      <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-text-muted">{label}</p>
    </article>
  )
}

function ImportStepPill({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-light-blue/30 px-4 py-3">
      <span className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue text-sm font-black text-white">
        {label}
      </span>
      <span className="text-sm font-black text-text-dark">{text}</span>
    </div>
  )
}

function MessageList({
  items,
  title,
  tone,
}: {
  items: string[]
  title: string
  tone: 'error' | 'warning'
}) {
  return (
    <div
      className={`mt-4 rounded-xl border p-4 ${
        tone === 'error'
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      }`}
    >
      <h5 className="text-sm font-black">{title}</h5>
      <ul className="mt-2 grid gap-1">
        {items.map((item) => (
          <li className="text-sm font-bold leading-relaxed" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SpecList({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="rounded-xl border border-border bg-light-blue/30 p-3">
      <h4 className="text-xs font-black uppercase tracking-wide text-text-muted">{title}</h4>
      {items.length ? (
        <ul className="mt-2 grid gap-1">
          {items.map((item) => (
            <li className="flex items-start gap-2 text-xs font-bold leading-relaxed text-text-dark" key={item}>
              <CheckCircle2 className="mt-0.5 shrink-0 text-green" size={14} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs font-bold text-text-muted">None mapped.</p>
      )}
    </section>
  )
}

function RulePill({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-navy">
      {children}
    </span>
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
          <span className="text-[11px] font-black uppercase tracking-wide text-blue">
            {formatSectionLabel(service.section)}
          </span>
          <h4 className="mt-1 text-base font-black leading-tight text-text-dark">
            {service.customerName ?? service.name}
          </h4>
          <p className="mt-1 text-[11px] font-bold text-text-muted">{service.internalName ?? service.name}</p>
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
        {service.customerDescription ?? service.shortDescription}
      </p>
      <strong className="mt-3 block text-sm font-black text-navy">
        {(service.componentRole ?? 'core') === 'core' ? 'Core component' : 'Optional component'}
      </strong>
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
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-text-dark">
            {service.customerName ?? service.name}
          </h2>
          <p className="mt-1 text-sm font-black uppercase tracking-wide text-text-muted">
            Internal: {service.internalName ?? service.name}
          </p>
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
          label="Customer outcome name"
          value={service.customerName ?? service.name}
          onChange={(value) => onUpdateService(service.id, { customerName: value })}
        />
        <TextInput
          label="Internal technical name"
          value={service.internalName ?? service.name}
          onChange={(value) => onUpdateService(service.id, { internalName: value })}
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
        <SelectInput
          label="Package role"
          value={service.componentRole ?? 'core'}
          options={componentRoleOptions}
          onChange={(value) => onUpdateService(service.id, { componentRole: value as ServiceComponentRole })}
        />
        <SelectInput
          label="Master section"
          value={service.section ?? 'home_safety_package'}
          options={sectionOptions}
          onChange={(value) => onUpdateService(service.id, { section: value as ServiceCatalogueSection })}
        />
        <SelectInput
          label="Priority"
          value={service.priority ?? ((service.componentRole ?? 'core') === 'core' ? 'essential' : 'optional')}
          options={priorityOptions}
          onChange={(value) => onUpdateService(service.id, { priority: value as ServicePriority })}
        />
        <TextArea
          label="Short description"
          value={service.shortDescription}
          onChange={(value) => onUpdateService(service.id, { shortDescription: value })}
        />
        <TextArea
          label="Customer description"
          value={service.customerDescription ?? service.shortDescription}
          onChange={(value) => onUpdateService(service.id, { customerDescription: value })}
        />
        <TextArea
          label="Customer benefit"
          value={service.customerBenefit}
          onChange={(value) => onUpdateService(service.id, { customerBenefit: value })}
        />
        <TextArea
          label="Outcome"
          value={service.outcome ?? service.customerBenefit}
          onChange={(value) => onUpdateService(service.id, { outcome: value })}
        />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-white p-4">
        <div className="mb-4 flex items-start gap-3">
          <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-pale-blue text-blue">
            <Eye size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-black text-text-dark">Visibility and workflow</h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-text-muted">
              Control where this single catalogue record appears across CasaMia.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ToggleField
            checked={service.websiteVisible ?? service.visibility?.website ?? true}
            label="Website"
            onChange={(checked) => onUpdateService(service.id, { websiteVisible: checked })}
          />
          <ToggleField
            checked={service.wizardVisible ?? service.visibility?.wizard ?? true}
            label="Wizard"
            onChange={(checked) => onUpdateService(service.id, { wizardVisible: checked })}
          />
          <ToggleField
            checked={service.proposalVisible ?? service.visibility?.proposal ?? true}
            label="Proposal"
            onChange={(checked) => onUpdateService(service.id, { proposalVisible: checked })}
          />
          <ToggleField
            checked={service.inspectorVisible ?? service.visibility?.inspector ?? true}
            label="Inspector"
            onChange={(checked) => onUpdateService(service.id, { inspectorVisible: checked })}
          />
          <ToggleField
            checked={service.adminVisible ?? service.visibility?.admin ?? true}
            label="Admin"
            onChange={(checked) => onUpdateService(service.id, { adminVisible: checked })}
          />
          <ToggleField
            checked={service.crmVisible ?? service.visibility?.crm ?? true}
            label="CRM"
            onChange={(checked) => onUpdateService(service.id, { crmVisible: checked })}
          />
          <ToggleField
            checked={service.mobileVisible ?? service.visibility?.mobile ?? true}
            label="Mobile"
            onChange={(checked) => onUpdateService(service.id, { mobileVisible: checked })}
          />
          <ToggleField
            checked={service.requiresQuote ?? service.pricingType === 'quote_only'}
            label="Requires quote"
            onChange={(checked) => onUpdateService(service.id, { requiresQuote: checked })}
          />
        </div>
      </section>

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
            <h3 className="text-base font-black text-text-dark">Component cost inputs</h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-text-muted">
              Internal cost guidance only. The customer-facing amount is set above at package level.
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
          {(service.componentRole ?? 'core') === 'core' ? 'Core package' : 'Optional add-on'}
        </span>
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-text-dark">
        {service.customerName ?? service.name}
      </h3>
      <p className="mt-2 text-sm font-bold leading-relaxed text-text-mid">
        {service.customerDescription ?? service.shortDescription}
      </p>
      <div className="mt-4 rounded-lg bg-white p-3">
        <p className="text-xs font-black uppercase tracking-wide text-text-muted">Benefit</p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-text-dark">
          {service.outcome ?? service.customerBenefit}
        </p>
      </div>
      <ul className="mt-4 grid gap-2">
        {(service.includedItems ?? []).slice(0, 3).map((item) => (
          <li className="flex items-start gap-2 text-xs font-bold leading-relaxed text-text-mid" key={item}>
            <CheckCircle2 className="mt-0.5 shrink-0 text-blue" size={15} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <strong className="mt-4 block rounded-lg bg-pale-blue px-3 py-2 text-sm font-black text-navy">
        Package-priced component
      </strong>
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

function formatSectionLabel(section: ServiceCatalogueSection | undefined) {
  return sectionOptions.find((option) => option.value === section)?.label ?? 'Home Safety Package'
}

function formatMasterSectionLabel(section: MasterCataloguePackage['section']) {
  if (section === 'home-safety-package') return 'Home Safety Package'
  if (section === 'connected-room') return 'Connected Room'
  return 'Optional Adaptations'
}

function getMasterIntegritySummary(catalogue: MasterServiceCatalogue) {
  const issues: string[] = []
  const packagesById = new Map(catalogue.packages.map((item) => [item.id, item]))
  const outcomesById = new Map(catalogue.outcomes.map((item) => [item.id, item]))
  const capabilitiesById = new Map(catalogue.capabilities.map((item) => [item.id, item]))
  const productsById = new Map(catalogue.products.map((item) => [item.id, item]))
  const tasksById = new Map(catalogue.installationTasks.map((item) => [item.id, item]))

  collectDuplicateIds(catalogue.rooms, 'room', issues)
  collectDuplicateIds(catalogue.sections, 'section', issues)
  collectDuplicateIds(catalogue.packages, 'package', issues)
  collectDuplicateIds(catalogue.outcomes, 'outcome', issues)
  collectDuplicateIds(catalogue.capabilities, 'capability', issues)
  collectDuplicateIds(catalogue.products, 'product/device', issues)
  collectDuplicateIds(catalogue.installationTasks, 'installation task', issues)

  catalogue.outcomes.forEach((outcome) => {
    if (!packagesById.has(outcome.packageId)) {
      issues.push(`${outcome.id} is not assigned to a valid package.`)
    }
    if (!outcome.customerName.en || !outcome.shortDescription.en) {
      issues.push(`${outcome.id} is missing customer-facing English copy.`)
    }
    if (outcome.pricingType === 'quote' && !outcome.requiresQuote) {
      issues.push(`${outcome.id} is quote-priced but not marked quote-required.`)
    }
  })

  catalogue.relations.forEach((relation) => {
    if (relation.type === 'packageOutcome' && (!packagesById.has(relation.fromId) || !outcomesById.has(relation.toId))) {
      issues.push(`${relation.id} points to a missing package or outcome.`)
    }
    if (relation.type === 'outcomeCapability' && (!outcomesById.has(relation.fromId) || !capabilitiesById.has(relation.toId))) {
      issues.push(`${relation.id} points to a missing outcome or capability.`)
    }
    if (relation.type === 'capabilityProduct' && (!capabilitiesById.has(relation.fromId) || !productsById.has(relation.toId))) {
      issues.push(`${relation.id} points to a missing capability or product.`)
    }
    if (relation.type === 'capabilityInstallationTask' && (!capabilitiesById.has(relation.fromId) || !tasksById.has(relation.toId))) {
      issues.push(`${relation.id} points to a missing capability or task.`)
    }
  })

  return {
    issueCount: issues.length,
    issues,
  }
}

function collectDuplicateIds(items: Array<{ id: string }>, label: string, issues: string[]) {
  const seen = new Set<string>()

  items.forEach((item) => {
    if (seen.has(item.id)) {
      issues.push(`Duplicate ${label} ID: ${item.id}.`)
    }
    seen.add(item.id)
  })
}

function groupServicesBySection(services: CasaMiaService[]) {
  return sectionOptions
    .map((option) => ({
      section: option.value,
      services: services.filter((service) => (service.section ?? 'home_safety_package') === option.value),
    }))
    .filter((group) => group.services.length > 0)
}

function createServiceId(room: ServiceRoom) {
  return `service-${room}-${Date.now().toString(36)}`
}

function createTemplateService(room: ServiceRoom): CasaMiaService {
  const roomLabel = formatRoomLabel(room)

  return {
    active: true,
    adminVisible: true,
    category: `${roomLabel} safety`,
    componentRole: 'core',
    customerBenefit: 'How this component improves safety, comfort, or confidence.',
    customerDescription: 'Brief customer-facing explanation.',
    customerName: `New ${roomLabel} outcome`,
    crmVisible: true,
    id: createServiceId(room),
    includedItems: ['Core package component'],
    inspectorVisible: true,
    internalName: `New ${roomLabel} component`,
    mobileVisible: true,
    name: `New ${roomLabel} component`,
    outcome: 'Safety, comfort, and confidence at home.',
    plainLanguageSummary: 'Brief customer-facing explanation.',
    priority: 'essential',
    proposalVisible: true,
    pricingType: 'quote_only',
    quantityType: 'per_unit',
    requiresAssessment: true,
    requiresCompatibilityCheck: true,
    requiresInstallation: true,
    requiresMeasurement: false,
    requiresQuote: true,
    requiresSiteVisit: true,
    room,
    section: room === 'connected' ? 'connected_room' : 'home_safety_package',
    shortDescription: 'Brief customer-facing explanation.',
    slug: `new-${room}-component`,
    status: 'draft',
    vatRate: 0.21,
    version: '1.0.0',
    websiteVisible: true,
    wizardAreas: getPackageAreasForRoom(room),
    wizardVisible: true,
  }
}

function getPackageAreasForRoom(room: ServiceRoom): ServicePackageArea[] {
  if (room === 'bathroom') return ['bathroom']
  if (room === 'bedroom') return ['bedroom']
  if (room === 'kitchen') return ['kitchen']
  if (room === 'movement') return ['living-room', 'stairs']
  if (room === 'entrance') return ['entrance', 'outdoor']
  return ['lighting', 'smart-safety']
}

function formatPackageAreaLabel(area: ServicePackageArea) {
  return packageAreaOptions.find((option) => option.value === area)?.label ?? area
}

function servicesToCsv(services: CasaMiaService[]) {
  return [
    catalogueCsvColumns.join(','),
    ...services.map((service) =>
      catalogueCsvColumns.map((column) => csvEscape(getServiceCsvValue(service, column))).join(','),
    ),
  ].join('\r\n')
}

function getServiceCsvValue(
  service: CasaMiaService,
  column: (typeof catalogueCsvColumns)[number],
) {
  const spanishCopy = service.translations?.es

  switch (column) {
    case 'active':
      return String(service.active)
    case 'adminVisible':
      return String(service.adminVisible ?? service.visibility?.admin ?? true)
    case 'componentRole':
      return service.componentRole ?? 'core'
    case 'crmVisible':
      return String(service.crmVisible ?? service.visibility?.crm ?? true)
    case 'customerBenefit':
      return service.customerBenefit
    case 'customerDescription':
      return service.customerDescription ?? service.shortDescription
    case 'customerName':
      return service.customerName ?? service.name
    case 'esCategory':
      return spanishCopy?.category ?? ''
    case 'esCustomerBenefit':
      return spanishCopy?.customerBenefit ?? ''
    case 'esIncludedItems':
      return (spanishCopy?.includedItems ?? []).join('|')
    case 'esName':
      return spanishCopy?.name ?? ''
    case 'esSafetyNotice':
      return spanishCopy?.safetyNotice ?? ''
    case 'esShortDescription':
      return spanishCopy?.shortDescription ?? ''
    case 'fromPrice':
      return formatOptionalNumber(service.fromPrice)
    case 'grantCategories':
      return (service.grant?.categories ?? []).join('|')
    case 'grantEligible':
      return service.grant?.eligible === undefined ? '' : String(service.grant.eligible)
    case 'grantEvidenceNeeded':
      return (service.grant?.evidenceNeeded ?? []).join('|')
    case 'includedItems':
      return (service.includedItems ?? []).join('|')
    case 'inspectorVisible':
      return String(service.inspectorVisible ?? service.visibility?.inspector ?? true)
    case 'internalName':
      return service.internalName ?? service.name
    case 'installationPrice':
      return formatOptionalNumber(service.installationPrice)
    case 'mobileVisible':
      return String(service.mobileVisible ?? service.visibility?.mobile ?? true)
    case 'outcome':
      return service.outcome ?? service.customerBenefit
    case 'plainLanguageSummary':
      return service.plainLanguageSummary ?? service.shortDescription
    case 'priority':
      return service.priority ?? ((service.componentRole ?? 'core') === 'core' ? 'essential' : 'optional')
    case 'productPrice':
      return formatOptionalNumber(service.productPrice)
    case 'proposalVisible':
      return String(service.proposalVisible ?? service.visibility?.proposal ?? true)
    case 'recurringMonthlyPrice':
      return formatOptionalNumber(service.recurringMonthlyPrice)
    case 'requiresAssessment':
      return String(service.requiresAssessment ?? service.requiresSiteVisit ?? service.requiresMeasurement)
    case 'requiresCompatibilityCheck':
      return String(service.requiresCompatibilityCheck)
    case 'requiresInstallation':
      return String(service.requiresInstallation)
    case 'requiresMeasurement':
      return String(service.requiresMeasurement)
    case 'requiresQuote':
      return String(service.requiresQuote ?? service.pricingType === 'quote_only')
    case 'requiresSiteVisit':
      return String(service.requiresSiteVisit)
    case 'safetyNotice':
      return service.safetyNotice ?? ''
    case 'section':
      return service.section ?? ''
    case 'smartDependencies':
      return (service.smartDependencies ?? [])
        .map((dependency) => `${dependency.dependencyType}:${dependency.internalName}:${dependency.required ? 'required' : 'optional'}`)
        .join('|')
    case 'status':
      return service.status ?? (service.active ? 'active' : 'draft')
    case 'typicalInstallationTime':
      return service.typicalInstallationTime ?? ''
    case 'vatRate':
      return formatOptionalNumber(service.vatRate)
    case 'vatReason':
      return service.pricing?.vatReason ?? ''
    case 'version':
      return service.version ?? '1.0.0'
    case 'websiteVisible':
      return String(service.websiteVisible ?? service.visibility?.website ?? true)
    case 'wizardAreas':
      return (service.wizardAreas ?? getDefaultServicePackageAreas(service)).join('|')
    case 'wizardVisible':
      return String(service.wizardVisible ?? service.visibility?.wizard ?? true)
    default:
      return String(service[column] ?? '')
  }
}

function buildCatalogueImportPreview(
  text: string,
  draft: EditableServiceCatalogue,
  selectedRoom: ServiceRoom,
  mode: CatalogueImportMode,
): CatalogueImportPreview {
  const rows = parseCsv(text)

  if (rows.length < 2) {
    throw new Error('The CSV needs a header row and at least one service row.')
  }

  const headers = rows[0].map((header) => header.trim())
  const existingById = new Map(draft.services.map((service) => [service.id, service]))
  const services: CasaMiaService[] = []
  const warnings: string[] = []
  let added = 0
  let skipped = 0
  let updated = 0

  rows.slice(1).forEach((cells, rowIndex) => {
    if (cells.every((cell) => !cell.trim())) return

    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
    const rowNumber = rowIndex + 2
    const rowRoom = parseRoom(row.room, selectedRoom)

    if (rowRoom !== selectedRoom) {
      skipped += 1
      warnings.push(`Row ${rowNumber} skipped because it belongs to ${formatRoomLabel(rowRoom)}.`)
      return
    }

    const id = normaliseText(row.id) || createServiceId(selectedRoom)
    const existing = existingById.get(id)
    const template = existing ?? createTemplateService(selectedRoom)
    const service: CasaMiaService = {
      ...template,
      active: parseBoolean(row.active, template.active),
      adminVisible: parseBoolean(row.adminVisible, template.adminVisible ?? template.visibility?.admin ?? true),
      category: normaliseText(row.category) || template.category,
      componentRole: parseComponentRole(row.componentRole, row.priority, template.componentRole ?? 'core'),
      crmVisible: parseBoolean(row.crmVisible, template.crmVisible ?? template.visibility?.crm ?? true),
      customerBenefit: normaliseText(row.customerBenefit) || template.customerBenefit,
      customerDescription: normaliseText(row.customerDescription) || template.customerDescription || template.shortDescription,
      customerName: normaliseText(row.customerName) || template.customerName || template.name,
      fromPrice: parseOptionalNumber(row.fromPrice, template.fromPrice),
      grant: {
        ...(template.grant ?? {}),
        categories: parseList(row.grantCategories, template.grant?.categories),
        eligible: parseBoolean(row.grantEligible, template.grant?.eligible ?? false),
        evidenceNeeded: parseList(row.grantEvidenceNeeded, template.grant?.evidenceNeeded),
      },
      id,
      includedItems: parseList(row.includedItems, template.includedItems),
      inspectorVisible: parseBoolean(row.inspectorVisible, template.inspectorVisible ?? template.visibility?.inspector ?? true),
      internalName: normaliseText(row.internalName) || template.internalName || template.name,
      installationPrice: parseOptionalNumber(row.installationPrice, template.installationPrice),
      mobileVisible: parseBoolean(row.mobileVisible, template.mobileVisible ?? template.visibility?.mobile ?? true),
      name: normaliseText(row.name) || template.name,
      outcome: normaliseText(row.outcome) || template.outcome || template.customerBenefit,
      plainLanguageSummary: normaliseText(row.plainLanguageSummary) || template.plainLanguageSummary || template.shortDescription,
      priority: parsePriority(row.priority, template.priority),
      pricingType: parsePricingType(row.pricingType, template.pricingType),
      pricing: {
        ...(template.pricing ?? {}),
        vatReason: normaliseText(row.vatReason) || template.pricing?.vatReason,
      },
      productPrice: parseOptionalNumber(row.productPrice, template.productPrice),
      proposalVisible: parseBoolean(row.proposalVisible, template.proposalVisible ?? template.visibility?.proposal ?? true),
      quantityType: parseQuantityType(row.quantityType, template.quantityType),
      recurringMonthlyPrice: parseOptionalNumber(row.recurringMonthlyPrice, template.recurringMonthlyPrice),
      requiresAssessment: parseBoolean(row.requiresAssessment, template.requiresAssessment ?? template.requiresSiteVisit),
      requiresCompatibilityCheck: parseBoolean(
        row.requiresCompatibilityCheck,
        template.requiresCompatibilityCheck,
      ),
      requiresInstallation: parseBoolean(row.requiresInstallation, template.requiresInstallation),
      requiresMeasurement: parseBoolean(row.requiresMeasurement, template.requiresMeasurement),
      requiresQuote: parseBoolean(row.requiresQuote, template.requiresQuote ?? template.pricingType === 'quote_only'),
      requiresSiteVisit: parseBoolean(row.requiresSiteVisit, template.requiresSiteVisit),
      room: selectedRoom,
      safetyNotice: normaliseText(row.safetyNotice) || template.safetyNotice,
      section: parseSection(row.section, template.section),
      shortDescription: normaliseText(row.shortDescription) || template.shortDescription,
      smartDependencies: parseSmartDependencies(row.smartDependencies, template.smartDependencies),
      slug: normaliseText(row.slug) || template.slug,
      status: parseStatus(row.status, template.status),
      typicalInstallationTime: normaliseText(row.typicalInstallationTime) || template.typicalInstallationTime,
      translations: buildSpanishTranslation(row, template.translations),
      vatRate: parseVatRate(row.vatRate, template.vatRate) ?? 0.21,
      version: normaliseText(row.version) || template.version || '1.0.0',
      websiteVisible: parseBoolean(row.websiteVisible, template.websiteVisible ?? template.visibility?.website ?? true),
      wizardAreas: parsePackageAreas(row.wizardAreas, template.wizardAreas ?? getPackageAreasForRoom(selectedRoom)),
      wizardVisible: parseBoolean(row.wizardVisible, template.wizardVisible ?? template.visibility?.wizard ?? true),
    }

    services.push(service)

    if (existing) {
      updated += 1
    } else {
      added += 1
    }
  })

  if (!services.length) {
    throw new Error('No valid rows found for the selected room.')
  }

  return {
    added,
    mode,
    room: selectedRoom,
    services,
    skipped,
    updated,
    warnings,
  }
}

function buildSpanishTranslation(
  row: Record<string, string>,
  current: CasaMiaService['translations'],
): CasaMiaService['translations'] {
  const existing = current?.es ?? {}
  const next = cleanTranslation({
    category: normaliseText(row.esCategory) || existing.category,
    customerBenefit: normaliseText(row.esCustomerBenefit) || existing.customerBenefit,
    includedItems: parseList(row.esIncludedItems, existing.includedItems),
    name: normaliseText(row.esName) || existing.name,
    safetyNotice: normaliseText(row.esSafetyNotice) || existing.safetyNotice,
    shortDescription: normaliseText(row.esShortDescription) || existing.shortDescription,
  })

  return Object.keys(next).length ? { ...(current ?? {}), es: next } : current
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let cell = ''
  let row: string[] = []
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"' && quoted && nextChar === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && nextChar === '\n') index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

function csvEscape(value: string) {
  if (!/[",\n\r]/.test(value)) return value

  return `"${value.replace(/"/g, '""')}"`
}

function downloadTextFile(fileName: string, content: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function formatOptionalNumber(value: number | undefined) {
  return value === undefined ? '' : String(value)
}

function normaliseText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  const cleaned = normaliseText(value).toLowerCase()
  if (!cleaned) return fallback
  return ['1', 'true', 'yes', 'y', 'si', 'sí', 'live', 'active'].includes(cleaned)
}

function parseOptionalNumber(value: string | undefined, fallback: number | undefined) {
  const cleaned = normaliseText(value).replace(',', '.')
  if (!cleaned) return fallback
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseList(value: string | undefined, fallback: string[] | undefined) {
  const cleaned = normaliseText(value)
  if (!cleaned) return fallback
  return cleaned
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseComponentRole(
  value: string | undefined,
  priority: string | undefined,
  fallback: ServiceComponentRole,
) {
  const cleanedPriority = normaliseText(priority).toLowerCase()
  if (cleanedPriority === 'optional') return 'option'
  if (cleanedPriority === 'essential' || cleanedPriority === 'recommended') return 'core'

  const cleaned = normaliseText(value).toLowerCase()
  if (cleaned === 'option' || cleaned === 'optional' || cleaned === 'add-on') return 'option'
  if (cleaned === 'core' || cleaned === 'included' || cleaned === 'essential' || cleaned === 'recommended') return 'core'
  return fallback
}

function parsePriority(value: string | undefined, fallback: ServicePriority | undefined): ServicePriority {
  const cleaned = normaliseText(value).toLowerCase()
  if (cleaned === 'optional') return 'optional'
  if (cleaned === 'recommended') return 'recommended'
  if (cleaned === 'essential') return 'essential'
  return fallback ?? 'essential'
}

function parseSection(
  value: string | undefined,
  fallback: ServiceCatalogueSection | undefined,
): ServiceCatalogueSection {
  const cleaned = normaliseText(value).toLowerCase()
  if (sectionOptions.some((option) => option.value === cleaned)) return cleaned as ServiceCatalogueSection
  return fallback ?? 'home_safety_package'
}

function parseStatus(value: string | undefined, fallback: CasaMiaService['status']) {
  const cleaned = normaliseText(value).toLowerCase()
  if (cleaned === 'draft' || cleaned === 'active' || cleaned === 'deprecated') return cleaned
  return fallback ?? 'active'
}

function parsePricingType(value: string | undefined, fallback: PricingType) {
  const cleaned = normaliseText(value)
  if (cleaned === 'quote') return 'quote_only'
  return pricingOptions.some((option) => option.value === cleaned) ? (cleaned as PricingType) : fallback
}

function parseQuantityType(value: string | undefined, fallback: QuantityType) {
  const cleaned = normaliseText(value)
  const quantityAliases: Record<string, QuantityType> = {
    each: 'per_unit',
    project: 'per_unit',
    room: 'per_room',
    set: 'per_unit',
  }
  if (quantityAliases[cleaned]) return quantityAliases[cleaned]
  return quantityOptions.some((option) => option.value === cleaned) ? (cleaned as QuantityType) : fallback
}

function parseVatRate(value: string | undefined, fallback: number | undefined) {
  const parsed = parseOptionalNumber(value, fallback)
  if (parsed === undefined) return fallback
  return parsed > 1 ? parsed / 100 : parsed
}

function parseSmartDependencies(
  value: string | undefined,
  fallback: CasaMiaService['smartDependencies'],
): CasaMiaService['smartDependencies'] {
  const entries = parseList(value, undefined)
  if (!entries) return fallback

  return entries
    .map((entry) => {
      const [dependencyType, internalName, required] = entry.split(':').map((part) => part.trim())

      if (!dependencyType || !internalName) return undefined

      return {
        dependencyType: dependencyType as NonNullable<CasaMiaService['smartDependencies']>[number]['dependencyType'],
        internalName,
        required: required !== 'optional',
      }
    })
    .filter(Boolean) as CasaMiaService['smartDependencies']
}

function parsePackageAreas(value: string | undefined, fallback: ServicePackageArea[]) {
  const areas = parseList(value, fallback) ?? fallback
  const allowed = new Set(packageAreaOptions.map((option) => option.value))
  const validAreas = areas.filter((area): area is ServicePackageArea => allowed.has(area as ServicePackageArea))
  return validAreas.length ? validAreas : fallback
}

function parseRoom(value: string | undefined, fallback: ServiceRoom) {
  const cleaned = normaliseText(value)
  return roomOptions.some((option) => option.value === cleaned) ? (cleaned as ServiceRoom) : fallback
}
