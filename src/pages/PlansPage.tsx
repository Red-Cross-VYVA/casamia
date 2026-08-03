import {
  ArrowRight,
  ArrowLeft,
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
  grantTitle: string
  heroSignals: string[]
  heroPhotoAlt: string
  heroReviewBody: string
  heroReviewEyebrow: string
  heroReviewPoints: string[]
  heroReviewTitle: string
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
    builderEyebrow: 'Plan builder',
    builderTitle: 'Choose rooms',
    consent: 'CasaMia may contact me about this proposal.',
    contactIntro: 'Add contact details so CasaMia can generate your proposal and send you a clear link instantly.',
    contactStepEyebrow: 'Instant proposal',
    contactTitle: 'Receive proposal',
    coreIncluded: 'Core package',
    closeDetails: 'Close',
    createDraft: 'Generate proposal',
    creatingDraft: 'Generating proposal...',
    draftCreated: 'Proposal created. Open the link to see your selected packages, add-ons and next steps.',
    email: 'Email',
    estimateLead: 'VAT included · pending review',
    estimateTitle: 'Plan snapshot',
    finalReview: 'Requires quote',
    flow: [
      { title: 'Rooms', body: 'Pick quantities' },
      { title: 'Options', body: 'Add support' },
      { title: 'Review', body: 'We confirm' },
    ],
    fromCatalogue: 'Catalogue-based estimate',
    grantBody: 'Check possible aid before final scope.',
    grantCta: 'Start grant check',
    grantEyebrow: 'Aid route',
    grantTitle: 'Grants may apply.',
    heroSignals: ['Package prices first', 'Core items included', 'Optional add-ons separate'],
    heroPhotoAlt: 'CasaMia specialist helping plan home improvements in a kitchen',
    heroReviewBody:
      'Choose the rooms and add-ons, add your details, and receive a clear proposal link instantly.',
    heroReviewEyebrow: 'Instant proposal',
    heroReviewPoints: ['Package-led plan', 'Clear next steps'],
    heroReviewTitle: 'Your proposal is generated instantly.',
    helpText: 'Use the steppers. Add connected or specialist modules only where useful.',
    metaTitle: 'Plans Builder | CasaMia',
    modulesTitle: 'Add-ons',
    monthly: 'Monthly',
    name: 'Name',
    noSelection: 'Choose at least one room.',
    optionalTitle: 'Connected',
    packageDetails: 'Package details',
    phone: 'Phone',
    popularTitle: 'Quick starts',
    presets: [
      { id: 'focused', title: 'Bathroom first', body: '1 bathroom package' },
      { id: 'daily', title: 'Daily routine', body: 'Bathroom + bedroom' },
      { id: 'wholeHome', title: 'Whole-home plan', body: '2 bathrooms + 2 bedrooms' },
    ],
    quantity: 'Quantity',
    reviewRequired: 'Needs quote',
    reviewCtaBody: 'Next, share contact details. Your proposal is generated instantly from the packages, quantities and add-ons you selected.',
    reviewCtaTitle: 'Ready to generate your proposal?',
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
    seeDraft: 'Open proposal',
    selectedPackages: 'Selected packages',
    specialistTitle: 'Specialist',
    summaryEmptyRooms: 'Choose rooms to start',
    summaryModulesTitle: 'Plan details',
    summaryMoreItems: 'more',
    summaryNextBody: 'Your proposal is generated from the selected packages, quantities and add-ons.',
    summaryNextTitle: 'Next step',
    summaryRoomsTitle: 'Selected rooms',
    subtitle:
      'Pick the rooms that need support, choose optional add-ons only where useful, and receive a clear proposal once your details are captured.',
    title: 'Create a safer-home plan, room by room.',
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
    builderEyebrow: 'Constructor de planes',
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
    grantBody: 'Revisa posibles ayudas antes del alcance final.',
    grantCta: 'Iniciar revisión',
    grantEyebrow: 'Ayudas disponibles',
    grantTitle: 'Puede haber ayudas.',
    heroSignals: ['Precio por paquete', 'Elementos base incluidos', 'Extras opcionales separados'],
    heroPhotoAlt: 'Especialista de CasaMia revisando una cocina con una residente',
    heroReviewBody:
      'CasaMia confirma idoneidad, medidas y extras útiles antes de cerrar nada.',
    heroReviewEyebrow: 'Revisión CasaMia',
    heroReviewPoints: ['Revisión por estancia', 'Siguiente propuesta clara'],
    heroReviewTitle: 'Revisado antes de proponer.',
    helpText: 'Usa los controles. Añade módulos conectados o especiales solo donde aporten valor.',
    metaTitle: 'Constructor de planes | CasaMia',
    modulesTitle: 'Extras',
    monthly: 'Mensual',
    name: 'Nombre',
    noSelection: 'Elige al menos una estancia.',
    optionalTitle: 'Conectado',
    packageDetails: 'Detalles del paquete',
    phone: 'Teléfono',
    popularTitle: 'Empieza rápido',
    presets: [
      { id: 'focused', title: 'Baño primero', body: '1 paquete de baño' },
      { id: 'daily', title: 'Rutina diaria', body: 'Baño + dormitorio' },
      { id: 'wholeHome', title: 'Revisión completa', body: '2 baños + 2 dormitorios' },
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
      'Elige las estancias que necesitan apoyo, añade extras opcionales solo donde aporten valor y envía un borrador claro para que CasaMia lo revise antes de la propuesta final.',
    title: 'Crea un plan de hogar más seguro, estancia por estancia.',
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
  const baseCopy = plansCopy[language]
  const copy = useMemo<PlansCopy>(() => ({
    ...baseCopy,
    ...(language === 'es'
      ? {
          consent: 'CasaMia puede contactarme sobre esta propuesta.',
          contactIntro: 'Añade tus datos para que CasaMia genere tu propuesta y te entregue un enlace claro al instante.',
          contactStepEyebrow: 'Propuesta al instante',
          contactTitle: 'Recibir propuesta',
          createDraft: 'Generar propuesta',
          creatingDraft: 'Generando propuesta...',
          draftCreated: 'Propuesta creada. Abre el enlace para ver los paquetes elegidos, extras y siguientes pasos.',
          estimateLead: 'IVA incluido · propuesta generada al instante',
          estimateTitle: 'Resumen de la propuesta',
          finalReview: 'Requiere presupuesto',
          flow: [
            { title: 'Estancias', body: 'Define cantidades' },
            { title: 'Extras', body: 'Añade apoyo' },
            { title: 'Propuesta', body: 'La recibes al instante' },
          ],
          fromCatalogue: 'Catálogo de servicios',
          heroPhotoAlt: 'Especialista de CasaMia ayudando a planificar mejoras del hogar en una cocina',
          heroReviewBody: 'Elige estancias y extras, añade tus datos y recibe un enlace claro de propuesta al instante.',
          heroReviewEyebrow: 'Propuesta al instante',
          heroReviewPoints: ['Plan por paquetes', 'Siguientes pasos claros'],
          heroReviewTitle: 'Tu propuesta se genera al instante.',
          heroSignals: ['Elige estancias', 'Elementos base incluidos', 'Extras opcionales separados'],
          presets: [
            { id: 'focused', title: 'Baño primero', body: '1 paquete de baño' },
            { id: 'daily', title: 'Rutina diaria', body: 'Baño + dormitorio' },
            { id: 'wholeHome', title: 'Plan completo', body: '2 baños + 2 dormitorios' },
          ],
          reviewRequired: 'Requiere presupuesto',
          reviewCtaBody: 'En el siguiente paso compartes tus datos. Tu propuesta se genera al instante con los paquetes, cantidades y extras elegidos.',
          reviewCtaTitle: '¿Listo para generar tu propuesta?',
          summaryModulesTitle: 'Detalle del plan',
          summaryNextBody: 'Tu propuesta se genera a partir de los paquetes, cantidades y extras elegidos.',
          subtitle: 'Elige las estancias que necesitan apoyo, añade extras opcionales solo donde aporten valor y recibe una propuesta clara cuando tus datos estén capturados.',
          seeDraft: 'Abrir propuesta',
        }
      : {
          consent: 'CasaMia may contact me about this proposal.',
          contactIntro: 'Add contact details so CasaMia can generate your proposal and send you a clear link instantly.',
          contactStepEyebrow: 'Instant proposal',
          contactTitle: 'Receive proposal',
          createDraft: 'Generate proposal',
          creatingDraft: 'Generating proposal...',
          draftCreated: 'Proposal created. Open the link to see your selected packages, add-ons and next steps.',
          estimateLead: 'VAT included · generated instantly',
          estimateTitle: 'Proposal summary',
          finalReview: 'Requires quote',
          flow: [
            { title: 'Rooms', body: 'Pick quantities' },
            { title: 'Add-ons', body: 'Add support' },
            { title: 'Proposal', body: 'Receive instantly' },
          ],
          fromCatalogue: 'Service catalogue',
          heroPhotoAlt: 'CasaMia specialist helping plan home improvements in a kitchen',
          heroReviewBody: 'Choose the rooms and add-ons, add your details, and receive a clear proposal link instantly.',
          heroReviewEyebrow: 'Instant proposal',
          heroReviewPoints: ['Package-led plan', 'Clear next steps'],
          heroReviewTitle: 'Your proposal is generated instantly.',
          heroSignals: ['Choose rooms', 'Core items included', 'Optional add-ons separate'],
          presets: [
            { id: 'focused', title: 'Bathroom first', body: '1 bathroom package' },
            { id: 'daily', title: 'Daily routine', body: 'Bathroom + bedroom' },
            { id: 'wholeHome', title: 'Whole-home plan', body: '2 bathrooms + 2 bedrooms' },
          ],
          reviewRequired: 'Needs quote',
          reviewCtaBody: 'Next, share contact details. Your proposal is generated instantly from the packages, quantities and add-ons you selected.',
          reviewCtaTitle: 'Ready to generate your proposal?',
          summaryModulesTitle: 'Plan details',
          summaryNextBody: 'Your proposal is generated from the selected packages, quantities and add-ons.',
          subtitle: 'Pick the rooms that need support, choose optional add-ons only where useful, and receive a clear proposal once your details are captured.',
          seeDraft: 'Open proposal',
        }),
  }), [baseCopy, language])
  const catalogue = useServiceCatalogue()
  const groups = useMemo(() => buildPlansBuilderGroups(catalogue, language), [catalogue, language])
  const [selection, setSelection] = useState<PlansBuilderSelectionState>({})
  const [customer, setCustomer] = useState<CustomerForm>(emptyCustomerForm)
  const [step, setStep] = useState<PlansStep>('builder')
  const [activeDetail, setActiveDetail] = useState<PlansDetail | null>(null)
  const [draftUrl, setDraftUrl] = useState('')
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState('')
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
  const proposalReady = Boolean(draftUrl)
  const selectedCountLabel = language === 'es'
    ? `${estimate.selectedRoomQuantity} ${estimate.selectedRoomQuantity === 1 ? 'estancia seleccionada' : 'estancias seleccionadas'}`
    : `${estimate.selectedRoomQuantity} ${estimate.selectedRoomQuantity === 1 ? 'room selected' : 'rooms selected'}`
  const selectedPlanDetails = selectedGroups.map((group) => {
    const packageSelection = selection[group.homePackage.id]
    const selectedAddOnIds = new Set(packageSelection?.addOnOutcomeIds ?? [])
    const packageLine = oneTimeLineItems.find((line) => line.packageId === group.homePackage.id)
    const addOns = group.addOnPackages.flatMap((addOnPackage) => {
      const selectedOutcomes = addOnPackage.outcomes.filter((outcome) => selectedAddOnIds.has(outcome.id))

      if (!selectedOutcomes.length) {
        return []
      }

      if (addOnPackage.packageRecord.section === 'optional-adaptations') {
        return selectedOutcomes.map((outcome) => ({
          id: outcome.id,
          items: [],
          label: localizePlansString(outcome.customerName, language, outcome.internalName),
        }))
      }

      return [{
        id: addOnPackage.packageRecord.id,
        items: selectedOutcomes
          .slice(0, 3)
          .map((outcome) => localizePlansString(outcome.customerName, language, outcome.internalName)),
        label: addOnPackage.packageLabel,
      }]
    })

    return {
      addOns,
      description: group.packageDescription,
      id: group.homePackage.id,
      included: group.homeOutcomes
        .slice(0, 4)
        .map((outcome) => localizePlansString(outcome.customerName, language, outcome.internalName)),
      includedMore: Math.max(0, group.homeOutcomes.length - 4),
      lineTotal: packageLine?.lineTotal ?? 0,
      packageLabel: group.packageLabel,
      quantity: packageSelection?.quantity ?? 1,
      roomLabel: group.roomLabel,
    }
  })

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
      price: copy.coreIncluded,
      title: group.packageLabel,
      typeLabel: copy.coreIncluded,
    })
  }

  function openAddOnPackageDetails(addOnPackage: PlansBuilderAddOnPackage) {
    setActiveDetail({
      body: addOnPackage.packageDescription,
      items: addOnPackage.outcomes,
      price: addOnPackage.requiresReview ? copy.reviewRequired : copy.optionalTitle,
      title: addOnPackage.packageLabel,
      typeLabel: copy.optionalTitle,
    })
  }

  function openSpecialistDetails(outcome: MasterCatalogueOutcome) {
    const price = getPlansOutcomeUnitPrice(outcome)

    setActiveDetail({
      body: localizePlansString(outcome.shortDescription, language, outcome.internalName),
      items: [outcome],
      price: price > 0 ? copy.specialistTitle : copy.reviewRequired,
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
    setEmailDeliveryStatus('')

    if (!estimate.proposalLineItems.length) {
      setError(copy.noSelection)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createPublicProposalDraft({
        catalogueSnapshot: catalogue,
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
      setEmailDeliveryStatus(result.emailDelivery?.status ?? '')
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
          <p>
            {emailDeliveryStatus === 'sent'
              ? language === 'es'
                ? 'Propuesta creada y enviada por email. También puedes abrirla aquí.'
                : 'Proposal created and sent by email. You can also open it here.'
              : copy.draftCreated}
          </p>
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
            <div className="plans-hero-signals" aria-label={language === 'es' ? 'Ventajas del plan' : 'Plan benefits'}>
              {copy.heroSignals.map((signal) => (
                <span key={signal}>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  {signal}
                </span>
              ))}
            </div>
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

          <aside className="plans-hero-photo-card" aria-label={copy.heroReviewEyebrow}>
            <img src="/images/solutions/casamia-staff-kitchen-consultation.webp" alt={copy.heroPhotoAlt} />
            <div className="plans-hero-photo-copy">
              <p className="section-kicker">{copy.heroReviewEyebrow}</p>
              <h2>{copy.heroReviewTitle}</h2>
              <p>{copy.heroReviewBody}</p>
              <div className="plans-hero-photo-points" aria-label={copy.heroReviewEyebrow}>
                {copy.heroReviewPoints.map((point) => (
                  <span key={point}>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    {point}
                  </span>
                ))}
              </div>
            </div>
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
                        <strong>{copy.coreIncluded}</strong>
                        <small>{quantity > 0 ? copy.selectedPackages : copy.packageDetails}</small>
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
                        <span>{copy.coreIncluded}</span>
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
                                      <small>{copy.reviewRequired}</small>
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
                                  <small>{addOnPackage.requiresReview ? copy.reviewRequired : copy.packageDetails}</small>
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
              <p className="section-kicker">{proposalReady ? copy.estimateTitle : copy.selectedPackages}</p>
              <h2>{proposalReady ? formatPlansEstimateLabel(estimate, language) : selectedCountLabel}</h2>
              <small>{proposalReady ? copy.estimateLead : copy.contactIntro}</small>

              <div className="plans-summary-block">
                <span>{copy.summaryRoomsTitle}</span>
                <div className="plans-summary-selection" aria-label={copy.summaryRoomsTitle}>
                  {(selectedSummary.length ? selectedSummary : [copy.summaryEmptyRooms]).slice(0, 5).map((item, index) => (
                    <b key={`${item}-${index}`}>{item}</b>
                  ))}
                </div>
              </div>

              {selectedPlanDetails.length ? (
                <div className="plans-summary-block">
                  <span>{copy.summaryModulesTitle}</span>
                  <div className="plans-detail-summary-list">
                    {selectedPlanDetails.map((detail) => (
                      <article className="plans-detail-summary-card" key={detail.id}>
                        <div className="plans-detail-summary-head">
                          <span>{detail.quantity}x</span>
                          <div>
                            <small>{detail.roomLabel}</small>
                            <h3>{detail.packageLabel}</h3>
                          </div>
                          {proposalReady && detail.lineTotal > 0 ? (
                            <b>{formatPlansCurrency(detail.lineTotal, language)}</b>
                          ) : null}
                        </div>
                        <p>{detail.description}</p>
                        <div className="plans-detail-summary-chips">
                          {detail.included.map((item) => (
                            <span key={`${detail.id}-${item}`}>
                              <CheckCircle2 size={14} aria-hidden="true" />
                              {item}
                            </span>
                          ))}
                          {detail.includedMore > 0 ? (
                            <span className="is-muted">+{detail.includedMore} {copy.summaryMoreItems}</span>
                          ) : null}
                        </div>
                        {detail.addOns.length ? (
                          <div className="plans-detail-summary-addons">
                            <strong>{copy.modulesTitle}</strong>
                            {detail.addOns.map((addOn) => (
                              <div key={addOn.id}>
                                <span>{addOn.label}</span>
                                {addOn.items.length ? <small>{addOn.items.join(' · ')}</small> : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {proposalReady && estimate.recurringMonthlyEstimate > 0 ? (
                <div className="plans-summary-monthly">
                  <span>{copy.monthly}</span>
                  <strong>{formatPlansCurrency(estimate.recurringMonthlyEstimate, language)}</strong>
                </div>
              ) : null}

              {proposalReady && estimate.reviewItems.length ? (
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
