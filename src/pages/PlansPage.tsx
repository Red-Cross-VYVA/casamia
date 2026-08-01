import {
  ArrowRight,
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
  ShieldCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { TrustBar } from '../components/TrustBar'
import {
  buildPlansBuilderGroups,
  calculatePlansBuilderEstimate,
  formatPlansCurrency,
  formatPlansEstimateLabel,
  localizePlansString,
  normalisePlansQuantity,
  type PlansBuilderAddOnPackage,
  type PlansBuilderGroup,
  type PlansBuilderSelectionState,
} from '../services/plansBuilderPricing'
import { createPublicProposalDraft } from '../services/proposalsApi'
import { useServiceCatalogue } from '../services/serviceCatalogue'

type PlansCopy = {
  addModule: string
  builderEyebrow: string
  builderTitle: string
  consent: string
  contactTitle: string
  createDraft: string
  creatingDraft: string
  draftCreated: string
  email: string
  estimateNote: string
  estimateTitle: string
  finalReview: string
  flow: Array<{ title: string; body: string }>
  fromCatalogue: string
  helpText: string
  metaTitle: string
  modulesTitle: string
  monthly: string
  name: string
  noSelection: string
  optionalTitle: string
  phone: string
  quantity: string
  reviewRequired: string
  roomCount: string
  rooms: Array<{ title: string; body: string }>
  seeDraft: string
  selectedPackages: string
  specialistTitle: string
  subtitle: string
  title: string
  town: string
  address: string
  vatIncluded: string
}

const plansCopy: Record<'en' | 'es', PlansCopy> = {
  en: {
    addModule: 'Add module',
    builderEyebrow: 'Plans builder',
    builderTitle: 'Build a draft package',
    consent: 'I agree that CasaMia may contact me to review this draft package.',
    contactTitle: 'Create a review draft',
    createDraft: 'Create proposal draft',
    creatingDraft: 'Creating draft...',
    draftCreated: 'Draft created. CasaMia can now review the package before it is sent as final.',
    email: 'Email',
    estimateNote: 'Estimate only. CasaMia confirms scope, compatibility and final price before any work starts.',
    estimateTitle: 'Live estimate',
    finalReview: 'Final price after CasaMia review',
    flow: [
      { title: 'Choose rooms', body: 'Select bathrooms, bedrooms and shared areas.' },
      { title: 'Add modules', body: 'Layer connected support or specialist adaptations.' },
      { title: 'Review draft', body: 'CasaMia checks scope before sending a final proposal.' },
    ],
    fromCatalogue: 'From CasaMia catalogue',
    helpText: 'Set quantities by room, then add only the modules that fit the home.',
    metaTitle: 'Plans Builder | CasaMia',
    modulesTitle: 'Selected room modules',
    monthly: 'Monthly support',
    name: 'Name',
    noSelection: 'Start by choosing at least one room package.',
    optionalTitle: 'Connected support',
    phone: 'Phone',
    quantity: 'Quantity',
    reviewRequired: 'Needs review',
    roomCount: 'Room packages',
    rooms: [
      { title: 'Bathroom', body: 'Bathing, toilet transfers, wet floors and safe access.' },
      { title: 'Bedroom', body: 'Bed transfers, night lighting and clear routes.' },
      { title: 'Kitchen', body: 'Cooking, reach, visibility and safer movement.' },
      { title: 'Living Room', body: 'Sitting, standing, rugs, cables and daily routes.' },
      { title: 'Entrance', body: 'Steps, thresholds, door use and visitor awareness.' },
    ],
    seeDraft: 'Open draft',
    selectedPackages: 'Selected packages',
    specialistTitle: 'Specialist adaptations',
    subtitle:
      'Choose the rooms and quantity you need. CasaMia turns the selection into a review-ready proposal draft.',
    title: 'Plans that flex by room, risk and budget.',
    town: 'Town / area',
    address: 'Address',
    vatIncluded: 'VAT included',
  },
  es: {
    addModule: 'Añadir módulo',
    builderEyebrow: 'Constructor de planes',
    builderTitle: 'Crea un paquete borrador',
    consent: 'Acepto que CasaMia me contacte para revisar este paquete borrador.',
    contactTitle: 'Crear borrador para revisión',
    createDraft: 'Crear borrador de propuesta',
    creatingDraft: 'Creando borrador...',
    draftCreated: 'Borrador creado. CasaMia puede revisar el paquete antes de enviarlo como propuesta final.',
    email: 'Email',
    estimateNote: 'Estimación orientativa. CasaMia confirma alcance, compatibilidad y precio final antes de empezar.',
    estimateTitle: 'Estimación en vivo',
    finalReview: 'Precio final tras revisión de CasaMia',
    flow: [
      { title: 'Elige estancias', body: 'Selecciona baños, dormitorios y zonas compartidas.' },
      { title: 'Añade módulos', body: 'Suma apoyo conectado o adaptaciones especializadas.' },
      { title: 'Revisa borrador', body: 'CasaMia comprueba alcance antes de enviar la propuesta final.' },
    ],
    fromCatalogue: 'Desde el catálogo CasaMia',
    helpText: 'Define cantidades por estancia y añade solo los módulos que encajen con la vivienda.',
    metaTitle: 'Constructor de planes | CasaMia',
    modulesTitle: 'Módulos por estancia seleccionada',
    monthly: 'Apoyo mensual',
    name: 'Nombre',
    noSelection: 'Empieza eligiendo al menos un paquete de estancia.',
    optionalTitle: 'Apoyo conectado',
    phone: 'Teléfono',
    quantity: 'Cantidad',
    reviewRequired: 'Requiere revisión',
    roomCount: 'Paquetes de estancia',
    rooms: [
      { title: 'Baño', body: 'Ducha, transferencias al WC, suelo mojado y acceso seguro.' },
      { title: 'Dormitorio', body: 'Transferencias de cama, luz nocturna y rutas despejadas.' },
      { title: 'Cocina', body: 'Cocinar, alcanzar objetos, visibilidad y movimiento seguro.' },
      { title: 'Salón', body: 'Sentarse, levantarse, alfombras, cables y rutas diarias.' },
      { title: 'Entrada', body: 'Escalones, umbrales, uso de puerta y control de visitas.' },
    ],
    seeDraft: 'Abrir borrador',
    selectedPackages: 'Paquetes seleccionados',
    specialistTitle: 'Adaptaciones especializadas',
    subtitle:
      'Elige las estancias y cantidades que necesitas. CasaMia convierte la selección en un borrador de propuesta para revisión.',
    title: 'Planes flexibles por estancia, riesgo y presupuesto.',
    town: 'Ciudad / zona',
    address: 'Dirección',
    vatIncluded: 'IVA incluido',
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

  return (
    <>
      <SEO title={copy.metaTitle} description={seoDescription} path="/plans" schema={schema} />
      <section className="plans-builder-shell">
        <div className="site-shell plans-builder-hero">
          <div className="plans-builder-intro">
            <p className="section-kicker">{copy.builderEyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
            <div className="plans-builder-flow" aria-label={copy.builderTitle}>
              {copy.flow.map((step, index) => (
                <article key={step.title}>
                  <span>{index + 1}</span>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="plans-builder-summary" aria-label={copy.estimateTitle}>
            <div className="plans-builder-summary-top">
              <span>
                <ShieldCheck size={24} aria-hidden="true" />
              </span>
              <div>
                <p>{copy.estimateTitle}</p>
                <strong>{formatPlansEstimateLabel(estimate, language)}</strong>
                <small>{copy.vatIncluded}</small>
              </div>
            </div>
            <dl>
              <div>
                <dt>{copy.roomCount}</dt>
                <dd>{estimate.selectedRoomQuantity}</dd>
              </div>
              <div>
                <dt>{copy.selectedPackages}</dt>
                <dd>{estimate.selectedPackageCount}</dd>
              </div>
              {estimate.recurringMonthlyEstimate > 0 ? (
                <div>
                  <dt>{copy.monthly}</dt>
                  <dd>{formatPlansCurrency(estimate.recurringMonthlyEstimate, language)}</dd>
                </div>
              ) : null}
            </dl>
            <p>{copy.estimateNote}</p>
            {estimate.reviewItems.length ? (
              <div className="plans-builder-review-list">
                <strong>{copy.reviewRequired}</strong>
                {estimate.reviewItems.slice(0, 4).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <TrustBar />

      <main className="plans-builder-main section-pad">
        <div className="site-shell plans-builder-layout">
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
                        <p>{group.packageDescription}</p>
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
                        {group.homeOutcomes.slice(0, 7).map((outcome) => (
                          <span key={outcome.id}>
                            <CheckCircle2 size={15} aria-hidden="true" />
                            {localizePlansString(outcome.customerName, language, outcome.internalName)}
                          </span>
                        ))}
                      </div>

                      <div className="plans-addon-grid">
                        {group.addOnPackages.map((addOnPackage) => {
                          const selected = isAddOnPackageSelected(group, addOnPackage)
                          const isSpecialist = addOnPackage.packageRecord.section === 'optional-adaptations'

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
          </section>

          <aside className="plans-builder-side">
            <form className="plans-draft-form" onSubmit={handleSubmit}>
              <div>
                <p className="section-kicker">{copy.finalReview}</p>
                <h2>{copy.contactTitle}</h2>
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
          </aside>
        </div>
      </main>
    </>
  )
}
