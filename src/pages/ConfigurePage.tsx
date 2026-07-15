import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  CookingPot,
  DoorOpen,
  Footprints,
  House,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { editablePricingNotice } from '../config/casamiaPackages'
import { useConfigurator } from '../context/ConfiguratorContext'
import {
  calculateConfiguratorQuote,
  formatConfiguratorCurrency,
} from '../services/configuratorPricing'
import { usePackageConfig } from '../services/packageConfig'
import type { CasaMiaPackage, ConfiguratorState, CustomerAnswer, PackageId } from '../types/configurator'

const packageIcons: Record<PackageId, LucideIcon> = {
  'entrance-safe': DoorOpen,
  'home-movement-safe': Footprints,
  'kitchen-independence': CookingPot,
  'bedroom-night-safe': BedDouble,
  'bathroom-safe': Bath,
  'connected-safety-vyva': Smartphone,
}

type HomeZoneId = 'entrance' | 'movement' | 'kitchen' | 'bedroom' | 'bathroom' | 'connected'

type HomeZone = {
  id: HomeZoneId
  title: string
  eyebrow: string
  packageId: PackageId
  icon: LucideIcon
  stat: string
  summary: string
  mapClassName: string
}

const homeZones: HomeZone[] = [
  {
    id: 'bedroom',
    title: 'Bedroom',
    eyebrow: 'Night route',
    packageId: 'bedroom-night-safe',
    icon: BedDouble,
    stat: 'In a U.S. emergency-department study, 79.2% of older-adult fall visits were from falls at home, and bedrooms were one of the most common home locations.',
    summary: 'Bed transfers, low light, slippers, rugs and the first steps after waking.',
    mapClassName: 'md:col-start-1 md:row-start-1',
  },
  {
    id: 'bathroom',
    title: 'Bathroom',
    eyebrow: 'Wet transfers',
    packageId: 'bathroom-safe',
    icon: Bath,
    stat: 'Stanford Medicine calls the bathroom the most common place for falls because wet surfaces, shower entry and toilet transfers stack risk together.',
    summary: 'Wet floors, shower entry, toilet transfers and hard surfaces.',
    mapClassName: 'md:col-start-2 md:row-start-1',
  },
  {
    id: 'movement',
    title: 'Stairs & halls',
    eyebrow: 'Daily route',
    packageId: 'home-movement-safe',
    icon: Footprints,
    stat: 'A U.S. ED study found the most common home fall locations were bedroom, bathroom and stairs; Stanford also flags halls and pathways as trouble areas.',
    summary: 'Handrails, contrast, lighting, rugs, cables and support along the route.',
    mapClassName: 'md:col-start-3 md:row-start-1 md:row-span-2',
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    eyebrow: 'Reach & prep',
    packageId: 'kitchen-independence',
    icon: CookingPot,
    stat: 'NIA room-by-room guidance calls out kitchen fixes such as keeping items within easy reach and cleaning spills quickly.',
    summary: 'Safer preparation, better lighting, easier reach and leak or gas alerts.',
    mapClassName: 'md:col-start-1 md:row-start-2',
  },
  {
    id: 'connected',
    title: 'Whole home',
    eyebrow: 'Alerts',
    packageId: 'connected-safety-vyva',
    icon: Smartphone,
    stat: 'CDC reports nearly 3 million emergency-department visits for older-adult falls in 2021, while also stressing that falls can be prevented.',
    summary: 'Simple alerts, emergency button, family updates and connected routines.',
    mapClassName: 'md:col-start-2 md:row-start-2',
  },
  {
    id: 'entrance',
    title: 'Entrance',
    eyebrow: 'Threshold',
    packageId: 'entrance-safe',
    icon: DoorOpen,
    stat: 'CDC fall-prevention guidance lists broken or uneven steps as a modifiable home hazard; entrances concentrate steps, thresholds and lighting changes.',
    summary: 'Arrival lighting, step support, threshold treatment and secure access.',
    mapClassName: 'md:col-span-3 md:row-start-3',
  },
]

const wizardSteps = ['Welcome', 'Property', 'Zones', 'Packages', 'Quantities', 'Details', 'Summary']
const managedServiceInclusions = [
  'CasaMia scope check and package confirmation',
  'Product sourcing and installer coordination',
  'Installation handover, support and follow-up',
]
const stepHeadings = [
  'Make your home safer, room by room.',
  'Tell us about the home.',
  'Tap the zones that worry you most.',
  'Choose where your home needs support.',
  'Confirm the quantities.',
  'Fine-tune the recommendation.',
  'Review your safer home plan.',
]
const stepDescriptions = [
  'Answer a few simple questions and CasaMia will build a personalised home-safety package for you.',
  'These basics help us avoid recommending work that does not match the property.',
  'Select one or more spaces. Hover or focus a zone to see why that part of the home matters.',
  'Review what each package includes, then add the rooms and routines you want CasaMia to make safer.',
  'Set how many rooms, entrances or staircases should be included in the estimate.',
  'A few practical choices help CasaMia shape the right scope before the final quote.',
  'Check the package, inclusions and items that may need site confirmation.',
]

export function ConfigurePage() {
  const configurator = useConfigurator()
  const { state, setCurrentStep } = configurator
  const quote = calculateConfiguratorQuote(state)
  const currentStep = Math.min(Math.max(state.currentStep, 0), wizardSteps.length - 1)
  const canContinue = currentStep !== 2 || state.selectedPackageIds.length > 0

  function goNext() {
    if (!canContinue) {
      return
    }

    setCurrentStep(Math.min(currentStep + 1, wizardSteps.length - 1))
  }

  function goBack() {
    setCurrentStep(Math.max(currentStep - 1, 0))
  }

  return (
    <section className="bg-light-blue pt-28">
      <div className="site-shell py-14 md:py-20">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-border bg-white p-6 shadow-soft md:p-9">
            <div className="mb-8">
              <span className="eyebrow">
                <span className="dot" aria-hidden="true" />
                Build My Safer Home
              </span>
              <h1 className="display-title mt-5 max-w-3xl">
                {stepHeadings[currentStep]}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-mid">
                {stepDescriptions[currentStep]}
              </p>
            </div>

            <Progress currentStep={currentStep} />

            <div className="mt-9">
              {currentStep === 0 ? <WelcomeStep /> : null}
              {currentStep === 1 ? <PropertyStep /> : null}
              {currentStep === 2 ? <ZoneStep /> : null}
              {currentStep === 3 ? <AreaStep /> : null}
              {currentStep === 4 ? <QuantityStep /> : null}
              {currentStep === 5 ? <AreaConfigurationStep /> : null}
              {currentStep === 6 ? <RecommendationStep /> : null}
            </div>

            <div className="mt-9 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button className="btn btn-white border border-border" type="button" onClick={goBack} disabled={currentStep === 0}>
                <ArrowLeft size={18} aria-hidden="true" />
                Back
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="btn btn-white border border-border" type="button" onClick={configurator.resetConfigurator}>
                  Start over
                </button>
                {currentStep < wizardSteps.length - 1 ? (
                  <button
                    className={`btn btn-navy ${canContinue ? '' : 'cursor-not-allowed opacity-50'}`}
                    type="button"
                    onClick={goNext}
                    disabled={!canContinue}
                  >
                    Continue
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                ) : (
                  <Link className="btn btn-navy" to="/configure/contact">
                    Continue to contact
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">Estimate so far</h2>
            <dl className="mt-6 grid gap-4 text-lg">
              <div>
                <dt className="text-sm font-black uppercase text-text-muted">One-time estimate</dt>
                <dd className="font-display text-4xl font-bold text-navy">
                  {formatConfiguratorCurrency(quote.totalEstimate)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-black uppercase text-text-muted">Monthly support</dt>
                <dd className="font-display text-3xl font-bold text-navy">
                  {formatConfiguratorCurrency(quote.recurringMonthlySubtotal)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-black uppercase text-text-muted">Visit deposit</dt>
                <dd className="font-bold text-text-dark">{formatConfiguratorCurrency(quote.deposit)}</dd>
              </div>
            </dl>
            <p className="mt-5 rounded-lg bg-pale-blue p-4 text-sm font-bold leading-relaxed text-text-mid">
              {editablePricingNotice}
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Progress({ currentStep }: { currentStep: number }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-4 xl:grid-cols-7" aria-label="Configuration progress">
      {wizardSteps.map((step, index) => {
        const isCurrent = index === currentStep
        const isComplete = index < currentStep

        return (
          <li
            className={`rounded-full border px-3 py-1.5 text-center text-xs font-black ${
              isCurrent
                ? 'border-navy bg-navy text-white shadow-soft'
                : isComplete
                  ? 'border-border bg-pale-blue text-blue'
                  : 'border-transparent bg-light-blue text-text-muted'
            }`}
            key={step}
          >
            {isComplete ? 'Done ' : `${index + 1}. `}
            {step}
          </li>
        )
      })}
    </ol>
  )
}

function WelcomeStep() {
  const { resetConfigurator, setCurrentStep, state } = useConfigurator()
  const hasSavedProgress = hasConfiguratorProgress(state)

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <button
        className="soft-card text-left"
        type="button"
        onClick={() => {
          resetConfigurator()
          setCurrentStep(1)
        }}
      >
        <Sparkles className="mb-5 text-blue" size={42} aria-hidden="true" />
        <strong className="block font-display text-3xl font-bold leading-tight text-text-dark">Start new plan</strong>
        <span className="mt-3 block text-lg leading-relaxed text-text-mid">
          Build a package from scratch in a few guided steps.
        </span>
      </button>
      <button className="soft-card text-left" type="button" onClick={() => setCurrentStep(getSavedProgressStep(state))}>
        <ShieldCheck className="mb-5 text-blue" size={42} aria-hidden="true" />
        <strong className="block font-display text-3xl font-bold leading-tight text-text-dark">
          Continue saved plan
        </strong>
        <span className="mt-3 block text-lg leading-relaxed text-text-mid">
          {hasSavedProgress ? 'Review your saved home details and packages.' : 'No saved plan yet. Start with property details.'}
        </span>
      </button>
    </div>
  )
}

function hasConfiguratorProgress(state: ConfiguratorState) {
  return Boolean(
    state.selectedPackageIds.length > 0 ||
      state.property.propertyType ||
      state.property.postcode ||
      state.property.relationship ||
      state.property.hasInternalStairs !== 'unsure' ||
      state.property.floors !== 1,
  )
}

function getSavedProgressStep(state: ConfiguratorState) {
  if (state.selectedPackageIds.length > 0) {
    return 3
  }

  if (
    state.property.propertyType ||
    state.property.postcode ||
    state.property.relationship ||
    state.property.hasInternalStairs !== 'unsure' ||
    state.property.floors !== 1
  ) {
    return 2
  }

  return 1
}

function PropertyStep() {
  const { state, updateProperty, updateQuantities } = useConfigurator()

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-border bg-pale-blue p-5 md:flex md:items-center md:justify-between md:gap-6">
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">Start with the home basics.</h2>
          <p className="mt-2 max-w-2xl text-base font-bold leading-relaxed text-text-mid">
            These answers keep the plan practical: the right rooms, the right access points, and no unnecessary products.
          </p>
        </div>
        <span className="mt-4 inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-black uppercase text-blue md:mt-0">
          Takes 1 minute
        </span>
      </div>

      <ChoiceTileGroup
        label="What type of home is it?"
        value={state.property.propertyType}
        gridClassName="sm:grid-cols-2 xl:grid-cols-4"
        options={[
          {
            value: 'apartment',
            title: 'Apartment',
            description: 'Flat or lift-access home.',
            icon: Building2,
          },
          {
            value: 'townhouse',
            title: 'Townhouse',
            description: 'Home with front access or levels.',
            icon: DoorOpen,
          },
          {
            value: 'villa',
            title: 'Villa',
            description: 'Detached or semi-detached home.',
            icon: House,
          },
          {
            value: 'other',
            title: 'Other',
            description: 'We will adapt the plan around it.',
            icon: Sparkles,
          },
        ]}
        onChange={(value) => updateProperty({ propertyType: value })}
      />

      <div className="grid gap-5 md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
        <NumberField
          label="Number of floors"
          min={1}
          value={state.property.floors}
          onChange={(value) => updateProperty({ floors: value })}
        />
        <TextField label="Postcode" value={state.property.postcode} onChange={(value) => updateProperty({ postcode: value })} />
      </div>

      <ChoiceTileGroup
        label="Are there internal stairs?"
        helper="This affects handrails, tread contrast, lighting and movement-route support."
        value={state.property.hasInternalStairs}
        gridClassName="md:grid-cols-3"
        options={[
          {
            value: 'yes',
            title: 'Yes',
            description: 'Include staircase safety options.',
            icon: Footprints,
          },
          {
            value: 'no',
            title: 'No',
            description: 'Hide stair-specific products.',
            icon: CheckCircle2,
          },
          {
            value: 'unsure',
            title: "I'm not sure",
            description: 'CasaMia can confirm later.',
            icon: Sparkles,
          },
        ]}
        onChange={(value) => {
          updateProperty({ hasInternalStairs: value as 'yes' | 'no' | 'unsure' })
          if (value !== 'yes') {
            updateQuantities({ staircases: 0 })
          }
        }}
      />

      <ChoiceTileGroup
        label="Who is this plan for?"
        value={state.property.relationship}
        gridClassName="md:grid-cols-3"
        options={[
          {
            value: 'myself',
            title: 'My own home',
            description: 'I want more confidence at home.',
            icon: UserRound,
          },
          {
            value: 'family',
            title: 'A family member',
            description: 'I am helping someone I care about.',
            icon: UsersRound,
          },
          {
            value: 'professional',
            title: 'A resident or client',
            description: 'I manage support for someone else.',
            icon: ShieldCheck,
          },
        ]}
        onChange={(value) => updateProperty({ relationship: value })}
      />
    </div>
  )
}

function ZoneStep() {
  const { state, togglePackage } = useConfigurator()
  const firstSelectedZone = homeZones.find((zone) => state.selectedPackageIds.includes(zone.packageId))
  const [activeZoneId, setActiveZoneId] = useState<HomeZoneId>(firstSelectedZone?.id ?? 'bathroom')
  const activeZone = homeZones.find((zone) => zone.id === activeZoneId) ?? homeZones[0]
  const selectedZones = homeZones.filter((zone) => state.selectedPackageIds.includes(zone.packageId))
  const ActiveIcon = activeZone.icon

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-soft md:p-5">
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wide text-blue">Choose the starting points</span>
          <h2 className="mt-1 font-display text-3xl font-bold leading-tight text-text-dark">Select the spaces that matter most.</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-text-mid">
            Tap a room, route or entrance. We will add the matching CasaMia package and refine it in the next steps.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-pale-blue px-4 py-2 text-sm font-black text-blue whitespace-nowrap">
          {selectedZones.length > 0 ? `${selectedZones.length} selected` : 'Choose at least one'}
        </span>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-lg border border-border bg-pale-blue p-3 md:p-4">
          <div className="relative mx-auto max-w-5xl">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-16 w-[74%] -translate-x-1/2 rounded-t-[1.75rem] bg-navy/10"
            style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}
            aria-hidden="true"
          />
          <div className="relative pt-10">
            <div className="grid gap-2.5 rounded-[1.5rem] border border-border bg-white/95 p-2.5 shadow-sm md:grid-cols-3 md:grid-rows-[minmax(110px,1fr)_minmax(110px,1fr)_minmax(92px,0.75fr)] md:p-3">
              {homeZones.map((zone) => {
                const Icon = zone.icon
                const selected = state.selectedPackageIds.includes(zone.packageId)
                const active = activeZone.id === zone.id

                return (
                  <button
                    aria-pressed={selected}
                    className={`group relative flex min-h-28 flex-col justify-between overflow-hidden rounded-lg border p-3 text-left transition ${zone.mapClassName} ${
                      selected
                        ? 'border-blue bg-blue text-white shadow-soft'
                        : active
                          ? 'border-blue bg-light-blue text-text-dark shadow-sm'
                          : 'border-border bg-white text-text-dark hover:border-blue hover:bg-light-blue'
                    }`}
                    key={zone.id}
                    type="button"
                    onClick={() => {
                      setActiveZoneId(zone.id)
                      togglePackage(zone.packageId)
                    }}
                    onFocus={() => setActiveZoneId(zone.id)}
                    onMouseEnter={() => setActiveZoneId(zone.id)}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
                          selected ? 'bg-white/18 text-white' : 'bg-pale-blue text-blue'
                        }`}
                      >
                        <Icon size={21} aria-hidden="true" />
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.64rem] font-black uppercase tracking-wide ${
                          selected ? 'bg-white text-navy' : 'bg-pale-blue text-blue'
                        }`}
                      >
                        {selected ? 'Selected' : zone.eyebrow}
                      </span>
                    </span>
                    <span className="mt-3 block">
                      <strong className={`block font-display text-xl font-bold leading-tight ${selected ? 'text-white' : 'text-text-dark'}`}>
                        {zone.title}
                      </strong>
                      <span className={`mt-1.5 block text-sm font-bold leading-snug ${selected ? 'text-white/82' : 'text-text-mid'}`}>
                        {zone.summary}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        </div>

        <aside className="rounded-lg border border-border bg-pale-blue p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-blue">
              <ActiveIcon size={24} aria-hidden="true" />
            </span>
            <div>
              <span className="text-xs font-black uppercase tracking-wide text-blue">Why it matters</span>
              <h3 className="mt-1 font-display text-2xl font-bold leading-tight text-text-dark">
                {activeZone.title}
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm font-bold leading-relaxed text-text-mid">{activeZone.summary}</p>
          <p className="mt-3 rounded-lg bg-white p-3 text-sm font-bold leading-relaxed text-text-mid">{activeZone.stat}</p>

          <div className="mt-4 border-t border-border pt-4">
            <h4 className="text-xs font-black uppercase tracking-wide text-navy">Added to your plan</h4>
            {selectedZones.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedZones.map((zone) => (
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase text-blue" key={zone.id}>
                    {zone.title}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-bold leading-relaxed text-text-mid">Select at least one space to continue.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}

function AreaStep() {
  const { state, togglePackage } = useConfigurator()
  const packageConfig = usePackageConfig()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {packageConfig.packages.map((item) => {
        const Icon = packageIcons[item.id]
        const selected = state.selectedPackageIds.includes(item.id)
        const price = packageConfig.packagePrices[item.id]

        return (
          <article
            className={`flex min-h-full flex-col rounded-lg border p-5 transition ${
              selected ? 'border-blue bg-pale-blue shadow-soft' : 'border-border bg-white hover:border-blue'
            }`}
            key={item.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="inline-grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-light-blue text-navy">
                  <Icon size={28} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-black uppercase tracking-wide text-blue">{item.salesUnit}</span>
                  <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-text-dark">{item.name}</h2>
                  <p className="mt-2 text-base leading-relaxed text-text-mid">{item.outcome}</p>
                </div>
              </div>
              <PackagePriceBadge item={item} price={price} />
            </div>

            <PackageInclusions item={item} />

            <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-black uppercase text-text-muted">Products + managed installation</span>
              <button
                aria-pressed={selected}
                className={`btn min-h-12 px-5 py-3 text-sm ${selected ? 'btn-navy' : 'btn-white border border-border'}`}
                type="button"
                onClick={() => togglePackage(item.id)}
              >
                {selected ? 'Selected' : 'Add package'}
                {selected ? <CheckCircle2 size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function PackagePriceBadge({ item, price }: { item: CasaMiaPackage; price: number }) {
  return (
    <div className="w-fit shrink-0 rounded-lg border border-border bg-white px-4 py-3 shadow-sm sm:text-right">
      <span className="block text-xs font-black uppercase tracking-wide text-text-muted">From</span>
      <strong className="block font-display text-3xl font-bold leading-none text-navy">
        {formatConfiguratorCurrency(price)}
      </strong>
      <span className="mt-1 block text-xs font-black uppercase tracking-wide text-blue">{item.salesUnit}</span>
    </div>
  )
}

function PackageInclusions({ item }: { item: CasaMiaPackage }) {
  const featuredComponents = item.standardComponents.slice(0, 4)
  const hiddenComponents = item.standardComponents.slice(4)
  const optionalComponents = [...item.conditionalComponents, ...item.quotationOnlyComponents]

  return (
    <div className="mt-5 rounded-lg border border-border bg-white/80 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-black uppercase tracking-wide text-navy">What is included</h3>
        <span className="w-fit rounded-full bg-light-blue px-3 py-1 text-xs font-black uppercase text-blue">
          {item.shortName}
        </span>
      </div>
      <ul className="mt-3 grid gap-2">
        {featuredComponents.map((component) => (
          <li className="flex gap-2 text-sm font-bold leading-snug text-text-mid" key={component.id}>
            <CheckCircle2 className="mt-0.5 shrink-0 text-blue" size={16} aria-hidden="true" />
            <span>{component.label}</span>
          </li>
        ))}
      </ul>
      {hiddenComponents.length > 0 || optionalComponents.length > 0 ? (
        <details className="mt-3 rounded-lg bg-pale-blue px-3 py-2">
          <summary className="cursor-pointer text-sm font-black text-blue">
            View all inclusions
          </summary>
          {hiddenComponents.length > 0 ? (
            <ul className="mt-3 grid gap-2 border-t border-border pt-3">
              {hiddenComponents.map((component) => (
                <li className="flex gap-2 text-sm font-bold leading-snug text-text-mid" key={component.id}>
                  <CheckCircle2 className="mt-0.5 shrink-0 text-blue" size={16} aria-hidden="true" />
                  <span>{component.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {optionalComponents.length > 0 ? (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs font-black uppercase tracking-wide text-text-muted">
                Added only if the home needs it
              </p>
              <ul className="mt-2 grid gap-2">
                {optionalComponents.map((component) => (
                  <li className="flex gap-2 text-sm font-bold leading-snug text-text-mid" key={component.id}>
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                    <span>
                      {component.label}
                      {component.type === 'quotation-only' ? ' - quoted after review' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </details>
      ) : null}
      <div className="mt-3 rounded-lg border border-border bg-pale-blue p-3">
        <h4 className="text-xs font-black uppercase tracking-wide text-navy">CasaMia management included</h4>
        <ul className="mt-2 grid gap-2">
          {managedServiceInclusions.map((inclusion) => (
            <li className="flex gap-2 text-sm font-bold leading-snug text-text-mid" key={inclusion}>
              <CheckCircle2 className="mt-0.5 shrink-0 text-blue" size={16} aria-hidden="true" />
              <span>{inclusion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function QuantityStep() {
  const { state, updateQuantities } = useConfigurator()

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {state.selectedPackageIds.includes('entrance-safe') ? (
        <NumberField label="Entrances to upgrade" min={1} value={state.quantities.entrances} onChange={(value) => updateQuantities({ entrances: value })} />
      ) : null}
      {state.selectedPackageIds.includes('kitchen-independence') ? (
        <NumberField label="Kitchens to upgrade" min={1} value={state.quantities.kitchens} onChange={(value) => updateQuantities({ kitchens: value })} />
      ) : null}
      {state.selectedPackageIds.includes('bedroom-night-safe') ? (
        <NumberField label="Bedrooms to upgrade" min={1} value={state.quantities.bedrooms} onChange={(value) => updateQuantities({ bedrooms: value })} />
      ) : null}
      {state.selectedPackageIds.includes('bathroom-safe') ? (
        <NumberField label="Bathrooms to upgrade" min={1} value={state.quantities.bathrooms} onChange={(value) => updateQuantities({ bathrooms: value })} />
      ) : null}
      {state.selectedPackageIds.includes('home-movement-safe') && state.property.hasInternalStairs === 'yes' ? (
        <NumberField label="Internal staircases" min={1} value={state.quantities.staircases || 1} onChange={(value) => updateQuantities({ staircases: value })} />
      ) : null}
      {state.selectedPackageIds.length === 0 ? (
        <p className="rounded-lg border border-border bg-pale-blue p-5 text-lg font-bold text-text-mid">
          Select at least one area first.
        </p>
      ) : null}
    </div>
  )
}

function AreaConfigurationStep() {
  const { state } = useConfigurator()

  return (
    <div className="grid gap-6">
      {state.selectedPackageIds.includes('entrance-safe') ? <EntranceQuestions /> : null}
      {state.selectedPackageIds.includes('home-movement-safe') ? <MovementQuestions /> : null}
      {state.selectedPackageIds.includes('kitchen-independence') ? <KitchenQuestions /> : null}
      {state.selectedPackageIds.includes('bedroom-night-safe') ? <BedroomQuestions /> : null}
      {state.selectedPackageIds.includes('bathroom-safe') ? <BathroomQuestions /> : null}
      {state.selectedPackageIds.includes('connected-safety-vyva') ? <ConnectedQuestions /> : null}
      {state.selectedPackageIds.length === 0 ? (
        <p className="rounded-lg border border-border bg-pale-blue p-5 text-lg font-bold text-text-mid">
          Choose the rooms and support areas you want CasaMia to configure.
        </p>
      ) : null}
    </div>
  )
}

function RecommendationStep() {
  const { state } = useConfigurator()
  const quote = calculateConfiguratorQuote(state)

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="One-time estimate" value={formatConfiguratorCurrency(quote.totalEstimate)} />
        <Metric label="Monthly support" value={formatConfiguratorCurrency(quote.recurringMonthlySubtotal)} />
        <Metric label="Visit deposit" value={formatConfiguratorCurrency(quote.deposit)} />
      </div>
      <div className="rounded-lg border border-border bg-white p-5">
        <h2 className="font-display text-3xl font-bold text-text-dark">Included packages</h2>
        <ul className="mt-4 grid gap-3">
          {quote.lines.map((line) => (
            <li className="flex flex-col gap-1 rounded-lg bg-pale-blue p-4 sm:flex-row sm:items-center sm:justify-between" key={line.id}>
              <span className="font-bold text-text-dark">{line.label}</span>
              <span className="font-black text-navy">
                {line.recurringMonthly
                  ? `${formatConfiguratorCurrency(line.recurringMonthly)} / month`
                  : formatConfiguratorCurrency(line.total)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {quote.quotationOnlyItems.length > 0 ? (
        <Notice title="Quotation-only items" items={quote.quotationOnlyItems.map((item) => item.label)} />
      ) : null}
      {quote.siteConfirmationItems.length > 0 ? (
        <Notice title="Requires site confirmation" items={quote.siteConfirmationItems.map((item) => `${item.label}: ${item.reason}`)} />
      ) : null}
      <Link className="btn btn-green w-fit" to="/configure/summary">
        View full summary
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  )
}

function EntranceQuestions() {
  const { state, setAnswer } = useConfigurator()

  return (
    <QuestionGroup title="Entrance Safe">
      {range(state.quantities.entrances).map((index) => (
        <div className="grid gap-4 rounded-lg bg-pale-blue p-5 md:grid-cols-2" key={index}>
          <SelectAnswer label={`Entrance ${index}: are there steps?`} answerKey={`entrance-${index}-hasSteps`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
          <NumberAnswer label="Number of steps" answerKey={`entrance-${index}-steps`} min={0} setAnswer={setAnswer} state={state} />
          <SelectAnswer label="Is there already a handrail?" answerKey={`entrance-${index}-handrail`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
          <SelectAnswer
            label="Ramp or threshold support"
            answerKey={`entrance-${index}-ramp`}
            options={[
              ['none', 'No ramp'],
              ['small-threshold-ramp', 'Small threshold ramp'],
              ['modular-access-ramp', 'Modular access ramp'],
              ['unsure', "I'm not sure"],
            ]}
            setAnswer={setAnswer}
            state={state}
          />
        </div>
      ))}
    </QuestionGroup>
  )
}

function MovementQuestions() {
  const { state, setAnswer } = useConfigurator()

  return (
    <QuestionGroup title="Home Movement Safe">
      <SelectAnswer
        label="What should voice control help with?"
        answerKey="voice-control-scope"
        options={[
          ['lighting', 'Lighting only'],
          ['lighting-tv-devices', 'Lighting, TV and selected devices'],
        ]}
        setAnswer={setAnswer}
        state={state}
      />
      {state.property.hasInternalStairs === 'no' ? (
        <p className="rounded-lg bg-pale-blue p-4 text-lg font-bold text-text-mid">
          Stair products are hidden because you selected no internal stairs.
        </p>
      ) : null}
    </QuestionGroup>
  )
}

function KitchenQuestions() {
  const { state, setAnswer } = useConfigurator()

  return (
    <QuestionGroup title="Kitchen Independence">
      {range(state.quantities.kitchens).map((index) => (
        <div className="grid gap-4 rounded-lg bg-pale-blue p-5 md:grid-cols-2" key={index}>
          <SelectAnswer label={`Kitchen ${index}: does it use gas?`} answerKey={`kitchen-${index}-gas`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
          <SelectAnswer label="Hard to reach upper cabinets?" answerKey={`kitchen-${index}-upperCabinets`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
          <SelectAnswer label="Consider automatic stove shut-off?" answerKey={`kitchen-${index}-stoveShutoff`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
          <SelectAnswer label="Consider touchless faucet?" answerKey={`kitchen-${index}-touchlessFaucet`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
        </div>
      ))}
    </QuestionGroup>
  )
}

function BedroomQuestions() {
  const { state, setAnswer } = useConfigurator()

  return (
    <QuestionGroup title="Bedroom & Night Safe">
      {range(state.quantities.bedrooms).map((index) => (
        <div className="grid gap-4 rounded-lg bg-pale-blue p-5 md:grid-cols-2" key={index}>
          <SelectAnswer label={`Bedroom ${index}: difficult getting in or out of bed?`} answerKey={`bedroom-${index}-bedDifficulty`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
          <SelectAnswer label="Need caregiver alert if resident leaves bed?" answerKey={`bedroom-${index}-caregiverAlerts`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
          <SelectAnswer label="Consider adjustable bed?" answerKey={`bedroom-${index}-adjustableBed`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
          <SelectAnswer label="Consider pressure-relief mattress?" answerKey={`bedroom-${index}-pressureMattress`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
        </div>
      ))}
      <p className="rounded-lg bg-pale-blue p-4 text-base font-bold text-text-mid">
        Bed support handles require compatibility confirmation with the existing bed.
      </p>
    </QuestionGroup>
  )
}

function BathroomQuestions() {
  const { state, setAnswer } = useConfigurator()

  return (
    <QuestionGroup title="Bathroom Safe">
      {range(state.quantities.bathrooms).map((index) => (
        <div className="grid gap-4 rounded-lg bg-pale-blue p-5 md:grid-cols-2" key={index}>
          <SelectAnswer
            label={`Bathroom ${index}: what does it contain?`}
            answerKey={`bathroom-${index}-contains`}
            options={[
              ['shower', 'Shower'],
              ['bathtub', 'Bathtub'],
              ['both', 'Both'],
            ]}
            setAnswer={setAnswer}
            state={state}
          />
          <SelectAnswer label="Is the toilet difficult to sit on or stand from?" answerKey={`bathroom-${index}-toiletDifficulty`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
          <SelectAnswer
            label="Wall type for grab bars"
            answerKey={`bathroom-${index}-wallType`}
            options={[
              ['solid', 'Solid wall'],
              ['lightweight', 'Lightweight wall'],
              ['unsure', "I'm not sure"],
            ]}
            setAnswer={setAnswer}
            state={state}
          />
          <SelectAnswer label="Suitable handheld shower already installed?" answerKey={`bathroom-${index}-handheldShower`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
        </div>
      ))}
    </QuestionGroup>
  )
}

function ConnectedQuestions() {
  const { state, setAnswer } = useConfigurator()
  const selectedAlerts = asStringArray(state.answers['connected-alerts'])

  function toggleAlert(value: string) {
    setAnswer(
      'connected-alerts',
      selectedAlerts.includes(value)
        ? selectedAlerts.filter((item) => item !== value)
        : [...selectedAlerts, value],
    )
  }

  return (
    <QuestionGroup title="Connected Safety + VYVA">
      <fieldset className="rounded-lg bg-pale-blue p-5">
        <legend className="mb-4 text-lg font-black text-text-dark">Who should receive alerts?</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['family', 'Family'],
            ['caregiver', 'Caregiver'],
            ['monitoring', 'Professional response centre'],
          ].map(([value, label]) => (
            <label className="flex items-center gap-3 rounded-lg bg-white p-4 text-base font-bold text-text-dark" key={value}>
              <input checked={selectedAlerts.includes(value)} type="checkbox" onChange={() => toggleAlert(value)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <SelectAnswer label="Need protection outside the home?" answerKey="connected-outsideProtection" options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
      <TextField label="Emergency contacts" value={String(state.answers['connected-emergencyContacts'] ?? '')} onChange={(value) => setAnswer('connected-emergencyContacts', value)} />
      <p className="rounded-lg bg-pale-blue p-4 text-base font-bold text-text-mid">
        Connected Safety requires consent from the resident and clear agreement on who receives alerts.
      </p>
    </QuestionGroup>
  )
}

function QuestionGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <h2 className="mb-5 font-display text-3xl font-bold text-text-dark">{title}</h2>
      <div className="grid gap-5">{children}</div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-pale-blue p-5">
      <span className="text-sm font-black uppercase text-text-muted">{label}</span>
      <strong className="mt-2 block font-display text-3xl font-bold text-navy">{value}</strong>
    </div>
  )
}

function Notice({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-lg border border-border bg-pale-blue p-5">
      <h2 className="font-display text-2xl font-bold text-text-dark">{title}</h2>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li className="flex gap-2 text-base font-bold text-text-mid" key={item}>
            <CheckCircle2 className="mt-1 shrink-0 text-blue" size={17} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SelectAnswer({
  answerKey,
  label,
  options,
  setAnswer,
  state,
}: {
  answerKey: string
  label: string
  options: string[][]
  setAnswer: (key: string, value: CustomerAnswer) => void
  state: ReturnType<typeof useConfigurator>['state']
}) {
  return (
    <SelectField
      label={label}
      value={String(state.answers[answerKey] ?? '')}
      options={options}
      onChange={(value) => setAnswer(answerKey, value)}
    />
  )
}

function NumberAnswer({
  answerKey,
  label,
  min,
  setAnswer,
  state,
}: {
  answerKey: string
  label: string
  min: number
  setAnswer: (key: string, value: CustomerAnswer) => void
  state: ReturnType<typeof useConfigurator>['state']
}) {
  return (
    <NumberField
      label={label}
      min={min}
      value={Number(state.answers[answerKey] ?? min)}
      onChange={(value) => setAnswer(answerKey, value)}
    />
  )
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: string[][]
  value: string
}) {
  return (
    <label className="grid gap-2 text-lg font-black text-text-dark">
      {label}
      <select className="min-h-14 rounded-lg border border-border bg-white px-4 text-lg text-text-dark" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Choose...</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function ChoiceTileGroup({
  gridClassName,
  helper,
  label,
  onChange,
  options,
  value,
}: {
  gridClassName: string
  helper?: string
  label: string
  onChange: (value: string) => void
  options: Array<{
    description: string
    icon: LucideIcon
    title: string
    value: string
  }>
  value: string
}) {
  return (
    <fieldset className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <legend className="px-1 text-xl font-black leading-tight text-text-dark">{label}</legend>
      {helper ? <p className="mt-2 text-base font-bold leading-relaxed text-text-mid">{helper}</p> : null}
      <div className={`mt-4 grid gap-3 ${gridClassName}`}>
        {options.map((option) => {
          const Icon = option.icon
          const selected = value === option.value

          return (
            <button
              aria-pressed={selected}
              className={`flex min-h-32 items-start gap-4 rounded-lg border p-4 text-left transition ${
                selected
                  ? 'border-blue bg-pale-blue shadow-soft'
                  : 'border-border bg-white hover:border-blue hover:bg-light-blue'
              }`}
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
            >
              <span
                className={`inline-grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                  selected ? 'bg-blue text-white' : 'bg-light-blue text-blue'
                }`}
              >
                <Icon size={24} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <strong className="block text-lg font-black leading-tight text-text-dark">{option.title}</strong>
                <span className="mt-2 block text-sm font-bold leading-snug text-text-mid">{option.description}</span>
              </span>
              {selected ? <CheckCircle2 className="ml-auto shrink-0 text-blue" size={20} aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function NumberField({
  label,
  min,
  onChange,
  value,
}: {
  label: string
  min: number
  onChange: (value: number) => void
  value: number
}) {
  return (
    <label className="grid gap-2 rounded-lg border border-border bg-white p-5 shadow-sm">
      <span className="text-sm font-black uppercase tracking-wide text-navy">{label}</span>
      <input
        className="min-h-14 rounded-lg border border-border bg-light-blue/40 px-4 text-lg font-bold text-text-dark outline-none transition focus:border-blue focus:bg-white"
        min={min}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function TextField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="grid gap-2 rounded-lg border border-border bg-white p-5 shadow-sm">
      <span className="text-sm font-black uppercase tracking-wide text-navy">{label}</span>
      <input
        className="min-h-14 rounded-lg border border-border bg-light-blue/40 px-4 text-lg font-bold text-text-dark outline-none transition focus:border-blue focus:bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function yesNoUnsure() {
  return [
    ['yes', 'Yes'],
    ['no', 'No'],
    ['unsure', "I'm not sure"],
  ]
}

function asStringArray(value: CustomerAnswer | undefined) {
  return Array.isArray(value) ? value : []
}

function range(count: number) {
  return Array.from({ length: Math.max(0, Number(count) || 0) }, (_, index) => index + 1)
}
