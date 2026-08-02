import {
  ArrowRight,
  ArrowLeft,
  BadgeEuro,
  Bath,
  BedDouble,
  CheckCircle2,
  CookingPot,
  DoorOpen,
  FileText,
  Home,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import {
  buildPlansBuilderGroups,
  calculatePlansBuilderEstimate,
  formatPlansCurrency,
  formatPlansEstimateLabel,
  getPlansOutcomeUnitPrice,
  localizePlansString,
  normalisePlansQuantity,
  type PlansBuilderAddOnPackage,
  type PlansBuilderGroup,
  type PlansBuilderSelectionState,
} from '../services/plansBuilderPricing'
import { createPublicProposalDraft } from '../services/proposalsApi'
import { useServiceCatalogue } from '../services/serviceCatalogue'
import type { MasterCatalogueOutcome } from '../types/serviceCatalogue'

type PlansCopy = {
  addModule: string
  backToBuilder: string
  builderEyebrow: string
  builderTitle: string
  consent: string
  contactIntro: string
  contactStepEyebrow: string
  contactTitle: string
  coreIncluded: string
  closeDetails: string
  createDraft: string
  creatingDraft: string
  draftCreated: string
  email: string
  estimateLead: string
  estimateTitle: string
  finalReview: string
  flow: Array<{ title: string; body: string }>
  fromCatalogue: string
  grantBody: string
  grantCta: string
  grantEyebrow: string
  grantFeatureItems: string[]
  grantTitle: string
  helpText: string
  metaTitle: string
  modulesTitle: string
  monthly: string
  name: string
  noSelection: string
  optionalTitle: string
  packageDetails: string
  phone: string
  presets: Array<{ id: PlansPresetId; title: string; body: string }>
  popularTitle: string
  quantity: string
  reviewRequired: string
  reviewCtaBody: string
  reviewCtaTitle: string
  roomDescriptions: Record<string, string>
  rooms: Array<{ title: string; body: string }>
  seeDraft: string
  selectedPackages: string
  specialistTitle: string
  summaryEmptyRooms: string
  summaryModulesTitle: string
  summaryMoreItems: string
  summaryNextBody: string
  summaryNextTitle: string
  summaryRoomsTitle: string
  subtitle: string
  title: string
  town: string
  address: string
  vatIncluded: string
  viewDetails: string
}

type PlansPresetId = 'focused' | 'daily' | 'wholeHome'

type PlansStep = 'builder' | 'contact'

type PlansDetail = {
  body: string
  items: MasterCatalogueOutcome[]
  price: string
  title: string
  typeLabel: string
}

const plansCopy: Record<'en' | 'es', PlansCopy> = {
  en: {
    addModule: 'Add module',
    backToBuilder: 'Edit package',
    builderEyebrow: 'Plans',
    builderTitle: 'Choose rooms',
    consent: 'CasaMia may contact me to review this draft.',
    contactIntro: 'Add contact details so CasaMia can review the selected rooms, confirm the scope and prepare the proposal.',
    contactStepEyebrow: 'CasaMia review',
    contactTitle: 'Send for review',
    coreIncluded: 'Core package',
    closeDetails: 'Close',
    createDraft: 'Create draft',
    creatingDraft: 'Creating draft...',
    draftCreated: 'Draft created. CasaMia will review it before sending a final proposal.',
    email: 'Email',
    estimateLead: 'VAT included · pending review',
    estimateTitle: 'Plan snapshot',
    finalReview: 'CasaMia review',
    flow: [
      { title: 'Rooms', body: 'Pick quantities' },
      { title: 'Options', body: 'Add support' },
      { title: 'Review', body: 'We confirm' },
    ],
    fromCatalogue: 'Catalogue-based estimate',
    grantBody: 'CasaMia can check grant readiness and documents where regional programmes apply.',
    grantCta: 'Check grants',
    grantEyebrow: 'Grant support available',
    grantFeatureItems: ['Eligibility route', 'Document checklist', 'Package-ready scope'],
    grantTitle: 'Funding may help with eligible adaptations.',
    helpText: 'Use the steppers. Add connected or specialist modules only where useful.',
    metaTitle: 'Plans Builder | CasaMia',
    modulesTitle: 'Add-ons',
    monthly: 'Monthly',
    name: 'Name',
    noSelection: 'Choose at least one room.',
    optionalTitle: 'Connected',
    packageDetails: 'Package details',
    phone: 'Phone',
    popularTitle: 'Popular setups',
    presets: [
      { id: 'focused', title: 'Focused fix', body: '1 bathroom' },
      { id: 'daily', title: 'Daily safety', body: 'Bathroom + bedroom' },
      { id: 'wholeHome', title: 'Whole home', body: '2 baths + 2 beds' },
    ],
    quantity: 'Quantity',
    reviewRequired: 'Needs review',
    reviewCtaBody: 'Next, share contact details. CasaMia will check photos, measurements and suitability before sending a final proposal.',
    reviewCtaTitle: 'Ready for CasaMia to review it?',
    roomDescriptions: {
      bathroom: 'Shower, WC, wet floors.',
      bedroom: 'Bed, night route, lighting.',
      entrance: 'Steps, thresholds, door.',
      kitchen: 'Reach, cooking, visibility.',
      'living-room': 'Seating, cables, movement.',
    },
    rooms: [
      { title: 'Bathroom', body: 'Bathing, toilet transfers, wet floors and safe access.' },
      { title: 'Bedroom', body: 'Bed transfers, night lighting and clear routes.' },
      { title: 'Kitchen', body: 'Cooking, reach, visibility and safer movement.' },
      { title: 'Living Room', body: 'Sitting, standing, rugs, cables and daily routes.' },
      { title: 'Entrance', body: 'Steps, thresholds, door use and visitor awareness.' },
    ],
    seeDraft: 'Open draft',
    selectedPackages: 'Selected packages',
    specialistTitle: 'Specialist',
    summaryEmptyRooms: 'Choose rooms to start',
    summaryModulesTitle: 'Included in this draft',
    summaryMoreItems: 'more',
    summaryNextBody: 'CasaMia checks measurements, photos and suitability before the final proposal.',
    summaryNextTitle: 'Next step',
    summaryRoomsTitle: 'Selected rooms',
    subtitle:
      'Select rooms, see a live estimate, then send a draft for CasaMia review.',
    title: 'Build your CasaMia plan.',
    town: 'Town / area',
    address: 'Address',
    vatIncluded: 'VAT included',
    viewDetails: 'View details',
  },
  es: {
    backToBuilder: 'Editar paquete',
    contactIntro: 'Añade tus datos para que CasaMia revise las estancias elegidas, confirme el alcance y prepare la propuesta.',
    contactStepEyebrow: 'Revisión CasaMia',
    reviewCtaBody: 'En el siguiente paso compartes tus datos. CasaMia revisará fotos, medidas e idoneidad antes de enviar la propuesta final.',
    reviewCtaTitle: '¿Listo para que CasaMia lo revise?',
    addModule: 'Añadir módulo',
    builderEyebrow: 'Planes',
    builderTitle: 'Elige estancias',
    consent: 'CasaMia puede contactarme para revisar este borrador.',
    contactTitle: 'Enviar a revisión',
    coreIncluded: 'Paquete base',
    closeDetails: 'Cerrar',
    createDraft: 'Crear borrador',
    creatingDraft: 'Creando borrador...',
    draftCreated: 'Borrador creado. CasaMia lo revisará antes de enviar la propuesta final.',
    email: 'Email',
    estimateLead: 'IVA incluido · pendiente de revisión',
    estimateTitle: 'Resumen del plan',
    finalReview: 'Revisión CasaMia',
    flow: [
      { title: 'Estancias', body: 'Define cantidades' },
      { title: 'Opciones', body: 'Añade apoyo' },
      { title: 'Revisión', body: 'Confirmamos' },
    ],
    fromCatalogue: 'Estimación del catálogo',
    grantBody: 'CasaMia puede revisar preparación y documentos cuando existan programas aplicables.',
    grantCta: 'Comprobar ayudas',
    grantEyebrow: 'Ayudas disponibles',
    grantFeatureItems: ['Ruta de elegibilidad', 'Lista de documentos', 'Alcance listo para propuesta'],
    grantTitle: 'La financiación puede ayudar en adaptaciones elegibles.',
    helpText: 'Usa los controles. Añade módulos conectados o especiales solo donde aporten valor.',
    metaTitle: 'Constructor de planes | CasaMia',
    modulesTitle: 'Extras',
    monthly: 'Mensual',
    name: 'Nombre',
    noSelection: 'Elige al menos una estancia.',
    optionalTitle: 'Conectado',
    packageDetails: 'Detalles del paquete',
    phone: 'Teléfono',
    popularTitle: 'Combinaciones rápidas',
    presets: [
      { id: 'focused', title: 'Prioridad concreta', body: '1 baño' },
      { id: 'daily', title: 'Seguridad diaria', body: 'Baño + dormitorio' },
      { id: 'wholeHome', title: 'Toda la casa', body: '2 baños + 2 dormitorios' },
    ],
    quantity: 'Cantidad',
    reviewRequired: 'Requiere revisión',
    roomDescriptions: {
      bathroom: 'Ducha, WC, suelo mojado.',
      bedroom: 'Cama, ruta nocturna, luz.',
      entrance: 'Escalones, umbrales, puerta.',
      kitchen: 'Alcance, cocina, visibilidad.',
      'living-room': 'Asientos, cables, paso.',
    },
    rooms: [
      { title: 'Baño', body: 'Ducha, transferencias al WC, suelo mojado y acceso seguro.' },
      { title: 'Dormitorio', body: 'Transferencias de cama, luz nocturna y rutas despejadas.' },
      { title: 'Cocina', body: 'Cocinar, alcanzar objetos, visibilidad y movimiento seguro.' },
      { title: 'Salón', body: 'Sentarse, levantarse, alfombras, cables y rutas diarias.' },
      { title: 'Entrada', body: 'Escalones, umbrales, uso de puerta y control de visitas.' },
    ],
    seeDraft: 'Abrir borrador',
    selectedPackages: 'Paquetes seleccionados',
    specialistTitle: 'Especial',
    summaryEmptyRooms: 'Elige estancias para empezar',
    summaryModulesTitle: 'Incluido en este borrador',
    summaryMoreItems: 'más',
    summaryNextBody: 'CasaMia confirma medidas, fotos e idoneidad antes de enviar la propuesta final.',
    summaryNextTitle: 'Siguiente paso',
    summaryRoomsTitle: 'Estancias elegidas',
    subtitle:
      'Selecciona estancias, ve una estimación y envía el borrador para revisión.',
    title: 'Crea tu plan CasaMia.',
    town: 'Ciudad / zona',
    address: 'Dirección',
    vatIncluded: 'IVA incluido',
    viewDetails: 'Ver detalles',
  },
}

const roomIcons: Record<string, LucideIcon> = {
  bathroom: Bath,
  bedroom: BedDouble,
  entrance: DoorOpen,
  kitchen: CookingPot,
  'living-room': Home,
}

type CustomerForm = {
  address: string
  area: string
  consent: boolean
  email: string
  name: string
  phone: string
  website: string
}

const emptyCustomerForm: CustomerForm = {
  address: '',
  area: '',
  consent: false,
  email: '',
  name: '',
  phone: '',
  website: '',
}

export function PlansPage() {
  const { i18n } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = plansCopy[language]
  const catalogue = useServiceCatalogue()
  const groups = useMemo(() => buildPlansBuilderGroups(catalogue, language), [catalogue, language])
  const [selection, setSelection] = useState<PlansBuilderSelectionState>({})
  const [customer, setCustomer] = useState<CustomerForm>(emptyCustomerForm)
  const [step, setStep] = useState<PlansStep>('builder')
  const [activeDetail, setActiveDetail] = useState<PlansDetail | null>(null)
  const [draftUrl, setDraftUrl] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const siteUrl = 'https://www.casamia.com.es'
  const seoDescription = copy.subtitle
  const estimate = useMemo(
    () => calculatePlansBuilderEstimate(groups, selection, language),
    [groups, language, selection],
  )
  const selectedGroups = groups.filter((group) => selection[group.homePackage.id]?.selected)
  const selectedSummary = selectedGroups.map((group) => {
    const quantity = selection[group.homePackage.id]?.quantity ?? 1
    return `${quantity}x ${group.roomLabel}`
  })
  const oneTimeLineItems = estimate.lineItems.filter((line) => !line.isRecurring)
  const summaryLineItems = oneTimeLineItems.slice(0, 3)
  const extraSummaryLineItemCount = Math.max(0, oneTimeLineItems.length - summaryLineItems.length)

  useEffect(() => {
    if (Object.keys(selection).length || !groups.length) {
      return
    }

    const defaultGroup = groups.find((group) => group.room.id === 'bathroom') ?? groups[0]
    setSelection({
      [defaultGroup.homePackage.id]: {
        addOnOutcomeIds: [],
        quantity: 1,
        selected: true,
      },
    })
  }, [groups, selection])

  useEffect(() => {
    if (!activeDetail) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveDetail(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeDetail])

  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${siteUrl}/plans#page`,
          url: `${siteUrl}/plans`,
          name: copy.metaTitle,
          description: seoDescription,
          inLanguage: language,
        },
        {
          '@type': 'Service',
          '@id': `${siteUrl}/plans#managed-home-safety-plan`,
          name: copy.title,
          description: copy.subtitle,
          serviceType: language === 'es' ? 'Plan modular de seguridad en el hogar' : 'Modular home safety plan',
          provider: {
            '@type': 'Organization',
            '@id': `${siteUrl}/#organization`,
            name: 'CasaMia',
            url: siteUrl,
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: copy.builderTitle,
            itemListElement: copy.rooms.map((room, index) => ({
              '@type': 'Offer',
              position: index + 1,
              itemOffered: {
                '@type': 'Service',
                name: room.title,
                description: room.body,
              },
            })),
          },
        },
        {
          '@type': 'HowTo',
          '@id': `${siteUrl}/plans#plan-process`,
          name: copy.builderTitle,
          step: copy.flow.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.title,
            text: step.body,
          })),
        },
        {
          '@type': 'ItemList',
          '@id': `${siteUrl}/plans#plan-outcomes`,
          name: copy.modulesTitle,
          itemListElement: copy.rooms.map((room, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: room.title,
            description: room.body,
          })),
        },
      ],
    }),
    [copy, language, seoDescription],
  )

  function updateRoomQuantity(group: PlansBuilderGroup, quantity: number) {
    const nextQuantity = Math.max(0, Math.min(12, Math.floor(Number.isFinite(quantity) ? quantity : 0)))

    setSelection((current) => {
      const previous = current[group.homePackage.id] ?? { addOnOutcomeIds: [], quantity: 1, selected: false }

      return {
        ...current,
        [group.homePackage.id]: {
          ...previous,
          addOnOutcomeIds: nextQuantity > 0 ? previous.addOnOutcomeIds : [],
          quantity: nextQuantity > 0 ? normalisePlansQuantity(nextQuantity) : 1,
          selected: nextQuantity > 0,
        },
      }
    })
  }

  function applyPreset(presetId: PlansPresetId) {
    const presetQuantities: Record<PlansPresetId, Record<string, number>> = {
      focused: { bathroom: 1 },
      daily: { bathroom: 1, bedroom: 1 },
      wholeHome: { bathroom: 2, bedroom: 2, entrance: 1, kitchen: 1 },
    }
    const quantities = presetQuantities[presetId]

    setSelection(() => groups.reduce<PlansBuilderSelectionState>((nextSelection, group) => {
      const quantity = quantities[group.room.id] ?? 0

      if (quantity > 0) {
        nextSelection[group.homePackage.id] = {
          addOnOutcomeIds: [],
          quantity,
          selected: true,
        }
      }

      return nextSelection
    }, {}))
  }

  function toggleAddOnPackage(group: PlansBuilderGroup, addOnPackage: PlansBuilderAddOnPackage, checked: boolean) {
    setSelection((current) => {
      const previous = current[group.homePackage.id] ?? { addOnOutcomeIds: [], quantity: 1, selected: false }
      const packageOutcomeIds = addOnPackage.outcomes.map((outcome) => outcome.id)
      const addOnOutcomeIds = checked
        ? [...new Set([...previous.addOnOutcomeIds, ...packageOutcomeIds])]
        : previous.addOnOutcomeIds.filter((outcomeId) => !packageOutcomeIds.includes(outcomeId))

      return {
        ...current,
        [group.homePackage.id]: {
          ...previous,
          addOnOutcomeIds,
          quantity: normalisePlansQuantity(previous.quantity),
          selected: true,
        },
      }
    })
  }

  function toggleAddOnOutcome(group: PlansBuilderGroup, outcomeId: string, checked: boolean) {
    setSelection((current) => {
      const previous = current[group.homePackage.id] ?? { addOnOutcomeIds: [], quantity: 1, selected: false }
      const addOnOutcomeIds = checked
        ? [...new Set([...previous.addOnOutcomeIds, outcomeId])]
        : previous.addOnOutcomeIds.filter((id) => id !== outcomeId)

      return {
        ...current,
        [group.homePackage.id]: {
          ...previous,
          addOnOutcomeIds,
          quantity: normalisePlansQuantity(previous.quantity),
          selected: true,
        },
      }
    })
  }

  function isAddOnPackageSelected(group: PlansBuilderGroup, addOnPackage: PlansBuilderAddOnPackage) {
    const selectedIds = new Set(selection[group.homePackage.id]?.addOnOutcomeIds ?? [])
    return addOnPackage.outcomes.some((outcome) => selectedIds.has(outcome.id))
  }

  function openRoomPackageDetails(group: PlansBuilderGroup) {
    setActiveDetail({
      body: group.packageDescription,
      items: group.homeOutcomes,
      price: group.packageUnitPrice > 0 ? formatPlansCurrency(group.packageUnitPrice, language) : copy.finalReview,
      title: group.packageLabel,
      typeLabel: copy.coreIncluded,
    })
  }

  function openAddOnPackageDetails(addOnPackage: PlansBuilderAddOnPackage) {
    setActiveDetail({
      body: addOnPackage.packageDescription,
      items: addOnPackage.outcomes,
      price: addOnPackage.unitPrice > 0 ? formatPlansCurrency(addOnPackage.unitPrice, language) : copy.finalReview,
      title: addOnPackage.packageLabel,
      typeLabel: copy.optionalTitle,
    })
  }

  function openSpecialistDetails(outcome: MasterCatalogueOutcome) {
    const price = getPlansOutcomeUnitPrice(outcome)

    setActiveDetail({
      body: localizePlansString(outcome.shortDescription, language, outcome.internalName),
      items: [outcome],
      price: price > 0 ? formatPlansCurrency(price, language) : copy.finalReview,
      title: localizePlansString(outcome.customerName, language, outcome.internalName),
      typeLabel: copy.specialistTitle,
    })
  }

  function scrollToPlansSection(elementId: string) {
    window.requestAnimationFrame(() => {
      document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function goToContactStep() {
    if (!estimate.proposalLineItems.length) {
      setError(copy.noSelection)
      scrollToPlansSection('plans-builder-title')
      return
    }

    setDraftUrl('')
    setError('')
    setStep('contact')
    scrollToPlansSection('plans-contact-step')
  }

  function goBackToBuilder() {
    setError('')
    setStep('builder')
    scrollToPlansSection('plans-builder-title')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setDraftUrl('')

    if (!estimate.proposalLineItems.length) {
      setError(copy.noSelection)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createPublicProposalDraft({
        companyWebsite: customer.website,
        consent: customer.consent,
        customer: {
          address: customer.address,
          area: customer.area,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
        },
        language,
        selection,
      }, catalogue)
      const publicUrl = new URL(result.publicUrl || `/proposal/${result.publicToken}`, window.location.origin)
      setDraftUrl(publicUrl.toString())
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.finalReview)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactForm = (
    <form className="plans-draft-form plans-contact-form" onSubmit={handleSubmit}>
      <div>
        <p className="section-kicker">{copy.finalReview}</p>
        <h2>{copy.contactTitle}</h2>
        <p>{copy.contactIntro}</p>
      </div>

      <label>
        <span>{copy.name}</span>
        <input
          required
          value={customer.name}
          onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))}
        />
      </label>
      <label>
        <span>{copy.email}</span>
        <input
          required
          type="email"
          value={customer.email}
          onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))}
        />
      </label>
      <label>
        <span>{copy.phone}</span>
        <input
          value={customer.phone}
          onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))}
        />
      </label>
      <label>
        <span>{copy.town}</span>
        <input
          value={customer.area}
          onChange={(event) => setCustomer((current) => ({ ...current, area: event.target.value }))}
        />
      </label>
      <label>
        <span>{copy.address}</span>
        <input
          value={customer.address}
          onChange={(event) => setCustomer((current) => ({ ...current, address: event.target.value }))}
        />
      </label>
      <label className="plans-hidden-field" aria-hidden="true">
        <span>Website</span>
        <input
          tabIndex={-1}
          value={customer.website}
          onChange={(event) => setCustomer((current) => ({ ...current, website: event.target.value }))}
        />
      </label>
      <label className="plans-consent">
        <input
          required
          checked={customer.consent}
          type="checkbox"
          onChange={(event) => setCustomer((current) => ({ ...current, consent: event.target.checked }))}
        />
        <span>{copy.consent}</span>
      </label>

      {error ? <p className="plans-form-error">{error}</p> : null}
      {draftUrl ? (
        <div className="plans-form-success">
          <Sparkles size={20} aria-hidden="true" />
          <p>{copy.draftCreated}</p>
          <Link to={new URL(draftUrl).pathname}>
            {copy.seeDraft}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      ) : null}

      <button className="btn btn-green w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Wrench size={18} aria-hidden="true" />}
        {isSubmitting ? copy.creatingDraft : copy.createDraft}
      </button>
    </form>
  )

  return (
    <>
      <SEO title={copy.metaTitle} description={seoDescription} path="/plans" schema={schema} />
      {step === 'builder' ? (
      <section className="plans-builder-shell">
        <div className="site-shell plans-builder-hero">
          <div className="plans-builder-intro">
            <p className="section-kicker">{copy.builderEyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
            <div className="plans-preset-panel" aria-label={copy.popularTitle}>
              <span>{copy.popularTitle}</span>
              <div>
                {copy.presets.map((preset) => (
                  <button key={preset.id} type="button" onClick={() => applyPreset(preset.id)}>
                    <strong>{preset.title}</strong>
                    <small>{preset.body}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="plans-hero-grant-card" aria-label={copy.grantEyebrow}>
            <span className="plans-hero-grant-icon" aria-hidden="true">
              <BadgeEuro size={28} />
            </span>
            <div>
              <p className="section-kicker">{copy.grantEyebrow}</p>
              <h2>{copy.grantTitle}</h2>
              <p>{copy.grantBody}</p>
            </div>
            <ul>
              {copy.grantFeatureItems.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/grant-check">
              {copy.grantCta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>
      ) : (
        <section className="plans-contact-hero" id="plans-contact-step">
          <div className="site-shell">
            <button className="plans-contact-back" type="button" onClick={goBackToBuilder}>
              <ArrowLeft size={16} aria-hidden="true" />
              {copy.backToBuilder}
            </button>
            <p className="section-kicker">{copy.contactStepEyebrow}</p>
            <h1>{copy.contactTitle}</h1>
            <p>{copy.contactIntro}</p>
          </div>
        </section>
      )}

      <main className={`plans-builder-main section-pad${step === 'contact' ? ' plans-contact-main' : ''}`}>
        {step === 'builder' ? (
        <div className="site-shell plans-builder-layout is-builder-step">
          <section className="plans-builder-workspace" aria-labelledby="plans-builder-title">
            <div className="plans-builder-heading">
              <div>
                <p className="section-kicker">{copy.fromCatalogue}</p>
                <h2 id="plans-builder-title">{copy.builderTitle}</h2>
                <p>{copy.helpText}</p>
              </div>
            </div>

            <div className="plans-room-grid">
              {groups.map((group) => {
                const Icon = roomIcons[group.room.id] ?? Home
                const packageSelection = selection[group.homePackage.id]
                const quantity = packageSelection?.selected ? packageSelection.quantity : 0

                return (
                  <article className={`plans-room-card${quantity > 0 ? ' is-selected' : ''}`} key={group.homePackage.id}>
                    <header>
                      <span>
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <h3>{group.roomLabel}</h3>
                        <p>{copy.roomDescriptions[group.room.id] ?? group.packageDescription}</p>
                        <button
                          className="plans-detail-link"
                          type="button"
                          onClick={() => openRoomPackageDetails(group)}
                        >
                          {copy.viewDetails}
                        </button>
                      </div>
                    </header>
                    <div className="plans-room-card-footer">
                      <div>
                        <strong>
                          {group.packageUnitPrice > 0 ? formatPlansCurrency(group.packageUnitPrice, language) : copy.finalReview}
                        </strong>
                        <small>{group.requiresReview ? copy.finalReview : copy.vatIncluded}</small>
                      </div>
                      <div className="plans-quantity-control" aria-label={`${copy.quantity}: ${group.roomLabel}`}>
                        <button type="button" onClick={() => updateRoomQuantity(group, quantity - 1)}>
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <input
                          aria-label={`${copy.quantity}: ${group.roomLabel}`}
                          min="0"
                          max="12"
                          type="number"
                          value={quantity}
                          onChange={(event) => updateRoomQuantity(group, Number(event.target.value))}
                        />
                        <button type="button" onClick={() => updateRoomQuantity(group, quantity + 1)}>
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <section className="plans-modules-section" aria-labelledby="plans-modules-title">
              <div className="plans-builder-heading">
                <div>
                  <p className="section-kicker">{copy.selectedPackages}</p>
                  <h2 id="plans-modules-title">{copy.modulesTitle}</h2>
                </div>
              </div>

              {selectedGroups.length ? (
                <div className="plans-module-list">
                  {selectedGroups.map((group) => (
                    <article className="plans-module-card" key={`module-${group.homePackage.id}`}>
                      <div className="plans-module-room">
                        <div>
                          <h3>{group.roomLabel}</h3>
                          <p>
                            {copy.quantity}: {selection[group.homePackage.id]?.quantity ?? 1}
                          </p>
                        </div>
                        <span>
                          {group.packageUnitPrice > 0 ? formatPlansCurrency(group.packageUnitPrice, language) : copy.finalReview}
                        </span>
                      </div>

                      <div className="plans-core-includes">
                        <strong>{copy.coreIncluded}</strong>
                        {group.homeOutcomes.slice(0, 3).map((outcome) => (
                          <span key={outcome.id}>
                            <CheckCircle2 size={15} aria-hidden="true" />
                            {localizePlansString(outcome.customerName, language, outcome.internalName)}
                          </span>
                        ))}
                        {group.homeOutcomes.length > 3 ? (
                          <span>+{group.homeOutcomes.length - 3}</span>
                        ) : null}
                      </div>

                      <div className="plans-addon-grid">
                        {group.addOnPackages.map((addOnPackage) => {
                          const selected = isAddOnPackageSelected(group, addOnPackage)
                          const isSpecialist = addOnPackage.packageRecord.section === 'optional-adaptations'

                          if (isSpecialist) {
                            return addOnPackage.outcomes.map((outcome) => {
                              const checked = selection[group.homePackage.id]?.addOnOutcomeIds.includes(outcome.id) ?? false
                              const outcomePrice = getPlansOutcomeUnitPrice(outcome)

                              return (
                                <div
                                  className={`plans-addon-card plans-specialist-option${checked ? ' is-selected' : ''}`}
                                  key={outcome.id}
                                >
                                  <label>
                                    <input
                                      checked={checked}
                                      type="checkbox"
                                      onChange={(event) => toggleAddOnOutcome(group, outcome.id, event.target.checked)}
                                    />
                                    <span>
                                      <strong>{copy.specialistTitle}</strong>
                                      <b>{localizePlansString(outcome.customerName, language, outcome.internalName)}</b>
                                      <small>
                                        {outcomePrice > 0 ? formatPlansCurrency(outcomePrice, language) : copy.finalReview}
                                      </small>
                                    </span>
                                  </label>
                                  <button
                                    className="plans-detail-link"
                                    type="button"
                                    onClick={() => openSpecialistDetails(outcome)}
                                  >
                                    {copy.viewDetails}
                                  </button>
                                </div>
                              )
                            })
                          }

                          return (
                            <div className={`plans-addon-card${selected ? ' is-selected' : ''}`} key={addOnPackage.packageRecord.id}>
                              <label>
                                <input
                                  checked={selected}
                                  type="checkbox"
                                  onChange={(event) => toggleAddOnPackage(group, addOnPackage, event.target.checked)}
                                />
                                <span>
                                  <strong>{isSpecialist ? copy.specialistTitle : copy.optionalTitle}</strong>
                                  <b>{addOnPackage.packageLabel}</b>
                                  <small>
                                    {addOnPackage.unitPrice > 0
                                      ? formatPlansCurrency(addOnPackage.unitPrice, language)
                                      : copy.finalReview}
                                  </small>
                                </span>
                              </label>
                              <button
                                className="plans-detail-link"
                                type="button"
                                onClick={() => openAddOnPackageDetails(addOnPackage)}
                              >
                                {copy.viewDetails}
                              </button>

                              {selected ? (
                                <div className="plans-addon-options">
                                {addOnPackage.outcomes.slice(0, 6).map((outcome) => {
                                  const checked = selection[group.homePackage.id]?.addOnOutcomeIds.includes(outcome.id) ?? false

                                  return (
                                    <label key={outcome.id}>
                                      <input
                                        checked={checked}
                                        type="checkbox"
                                        onChange={(event) => toggleAddOnOutcome(group, outcome.id, event.target.checked)}
                                      />
                                      <span>{localizePlansString(outcome.customerName, language, outcome.internalName)}</span>
                                    </label>
                                  )
                                })}
                                </div>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="plans-empty-state">
                  <FileText size={28} aria-hidden="true" />
                  <p>{copy.noSelection}</p>
                </div>
              )}
            </section>

            <div className="plans-review-cta">
              <span aria-hidden="true">
                <Wrench size={24} />
              </span>
              <div>
                <p className="section-kicker">{copy.contactStepEyebrow}</p>
                <h2>{copy.reviewCtaTitle}</h2>
                <p>{copy.reviewCtaBody}</p>
                {error ? <p className="plans-form-error">{error}</p> : null}
              </div>
              <button className="btn btn-green" type="button" onClick={goToContactStep}>
                {copy.contactTitle}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
        ) : (
          <div className="site-shell plans-contact-layout">
            <aside className="plans-contact-summary" aria-label={copy.estimateTitle}>
              <p className="section-kicker">{copy.estimateTitle}</p>
              <h2>{formatPlansEstimateLabel(estimate, language)}</h2>
              <small>{copy.estimateLead}</small>

              <div className="plans-summary-block">
                <span>{copy.summaryRoomsTitle}</span>
                <div className="plans-summary-selection" aria-label={copy.summaryRoomsTitle}>
                  {(selectedSummary.length ? selectedSummary : [copy.summaryEmptyRooms]).slice(0, 5).map((item, index) => (
                    <b key={`${item}-${index}`}>{item}</b>
                  ))}
                </div>
              </div>

              {summaryLineItems.length ? (
                <div className="plans-summary-block">
                  <span>{copy.summaryModulesTitle}</span>
                  <ul className="plans-summary-lines">
                    {summaryLineItems.map((line) => (
                      <li key={line.id}>
                        <CheckCircle2 size={16} aria-hidden="true" />
                        <span>{line.label}</span>
                        {line.quantity > 1 ? <b>x{line.quantity}</b> : null}
                      </li>
                    ))}
                    {extraSummaryLineItemCount > 0 ? (
                      <li className="is-muted">
                        <span>+{extraSummaryLineItemCount} {copy.summaryMoreItems}</span>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {estimate.recurringMonthlyEstimate > 0 ? (
                <div className="plans-summary-monthly">
                  <span>{copy.monthly}</span>
                  <strong>{formatPlansCurrency(estimate.recurringMonthlyEstimate, language)}</strong>
                </div>
              ) : null}

              {estimate.reviewItems.length ? (
                <div className="plans-builder-review-list">
                  <strong>{copy.reviewRequired}</strong>
                  {estimate.reviewItems.slice(0, 4).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              ) : null}

              <button className="plans-contact-back" type="button" onClick={goBackToBuilder}>
                <ArrowLeft size={16} aria-hidden="true" />
                {copy.backToBuilder}
              </button>
            </aside>

            {contactForm}
          </div>
        )}
      </main>

      {activeDetail ? (
        <div
          className="plan-detail-modal-backdrop"
          role="presentation"
          onClick={() => setActiveDetail(null)}
        >
          <section
            aria-labelledby="plans-detail-title"
            aria-modal="true"
            className="plan-detail-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="plan-detail-modal-head">
              <div>
                <p>{activeDetail.typeLabel}</p>
                <h2 id="plans-detail-title">{activeDetail.title}</h2>
                <span>{activeDetail.body}</span>
                <strong className="plans-detail-price">{activeDetail.price}</strong>
              </div>
              <button type="button" aria-label={copy.closeDetails} onClick={() => setActiveDetail(null)}>
                <X size={18} aria-hidden="true" />
                {copy.closeDetails}
              </button>
            </div>

            <div className="plan-detail-modal-grid">
              {activeDetail.items.map((outcome) => (
                <article key={outcome.id}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <div>
                    <h3>{localizePlansString(outcome.customerName, language, outcome.internalName)}</h3>
                    <p>
                      {localizePlansString(
                        outcome.customerBenefit,
                        language,
                        localizePlansString(outcome.shortDescription, language, outcome.internalName),
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="plan-detail-modal-actions">
              <button className="btn btn-green" type="button" onClick={() => setActiveDetail(null)}>
                {copy.closeDetails}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
