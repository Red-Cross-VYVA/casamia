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
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useConfigurator } from '../context/ConfiguratorContext'
import {
  calculateConfiguratorQuote,
  formatConfiguratorCurrency,
} from '../services/configuratorPricing'
import { getSelectedRoomIds, isRoomSelected } from '../services/configuratorRooms'
import { formatServicePrice, useServiceCatalogue } from '../services/serviceCatalogue'
import type { ConfiguratorRoomId, ConfiguratorState, CustomerAnswer } from '../types/configurator'
import type { CasaMiaService } from '../types/serviceCatalogue'

type HomeZoneId = ConfiguratorRoomId

type HomeZone = {
  id: HomeZoneId
  title: string
  eyebrow: string
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
    icon: BedDouble,
    stat: 'In a U.S. emergency-department study, 79.2% of older-adult fall visits were from falls at home, and bedrooms were one of the most common home locations.',
    summary: 'Bed transfers, low light, slippers, rugs and the first steps after waking.',
    mapClassName: 'md:col-start-1 md:row-start-1',
  },
  {
    id: 'bathroom',
    title: 'Bathroom',
    eyebrow: 'Wet transfers',
    icon: Bath,
    stat: 'Stanford Medicine calls the bathroom the most common place for falls because wet surfaces, shower entry and toilet transfers stack risk together.',
    summary: 'Wet floors, shower entry, toilet transfers and hard surfaces.',
    mapClassName: 'md:col-start-2 md:row-start-1',
  },
  {
    id: 'movement',
    title: 'Stairs & halls',
    eyebrow: 'Daily route',
    icon: Footprints,
    stat: 'A U.S. ED study found the most common home fall locations were bedroom, bathroom and stairs; Stanford also flags halls and pathways as trouble areas.',
    summary: 'Handrails, contrast, lighting, rugs, cables and support along the route.',
    mapClassName: 'md:col-start-3 md:row-start-1 md:row-span-2',
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    eyebrow: 'Reach & prep',
    icon: CookingPot,
    stat: 'NIA room-by-room guidance calls out kitchen fixes such as keeping items within easy reach and cleaning spills quickly.',
    summary: 'Safer preparation, better lighting, easier reach and leak or gas alerts.',
    mapClassName: 'md:col-start-1 md:row-start-2',
  },
  {
    id: 'connected',
    title: 'Whole home',
    eyebrow: 'Alerts',
    icon: Smartphone,
    stat: 'CDC reports nearly 3 million emergency-department visits for older-adult falls in 2021, while also stressing that falls can be prevented.',
    summary: 'Simple alerts, emergency button, family updates and connected routines.',
    mapClassName: 'md:col-start-2 md:row-start-2',
  },
  {
    id: 'entrance',
    title: 'Entrance',
    eyebrow: 'Threshold',
    icon: DoorOpen,
    stat: 'CDC fall-prevention guidance lists broken or uneven steps as a modifiable home hazard; entrances concentrate steps, thresholds and lighting changes.',
    summary: 'Arrival lighting, step support, threshold treatment and secure access.',
    mapClassName: 'md:col-span-3 md:row-start-3',
  },
]

const wizardSteps = ['Welcome', 'Property', 'Rooms', 'Home details', 'Questions', 'Improvements', 'Summary']
const stepHeadings = [
  'Make your home safer, room by room.',
  'Tell us about the home.',
  'Choose the rooms that matter most.',
  'Confirm the home details.',
  'Answer the practical questions.',
  'Choose your recommended improvements.',
  'Review your safer home plan.',
]
const stepDescriptions = [
  'Answer a few simple questions and CasaMia will build a practical plan around the improvements that fit your home.',
  'These basics help us avoid recommending work that does not match the property.',
  'Select one or more spaces. Hover or focus a zone to see why that part of the home matters.',
  'Set how many rooms, entrances or staircases should be included in the estimate.',
  'A few practical choices help CasaMia recommend useful services and avoid unnecessary work.',
  'Add or remove the recommended safety services before seeing the estimate.',
  'Check your selected improvements and anything that needs final confirmation.',
]

const baseRecommendedServiceIds: Record<HomeZoneId, string[]> = {
  entrance: ['entrance-motion-lighting', 'entrance-threshold-treatment', 'entrance-step-handrail'],
  movement: ['movement-hallway-lighting', 'movement-rug-securing', 'movement-cable-management', 'movement-stand-assist'],
  kitchen: [
    'kitchen-lightweight-cookware',
    'kitchen-anti-fatigue-mat',
    'kitchen-worktop-lighting',
    'kitchen-water-leak-sensor',
  ],
  bedroom: ['bedroom-bed-support', 'bedroom-underbed-lighting', 'bedroom-night-route'],
  bathroom: [
    'bathroom-grab-bars',
    'bathroom-folding-shower-seat',
    'bathroom-anti-slip-floor-treatment',
    'bathroom-motion-lighting',
  ],
  connected: ['connected-emergency-button', 'connected-voice-hub', 'connected-family-alerts'],
}

function getRecommendedServiceIds(state: ConfiguratorState, services: CasaMiaService[]) {
  const selectedRooms = getSelectedRoomIds(state)
  const recommendations = new Set<string>()

  selectedRooms.forEach((room) => {
    baseRecommendedServiceIds[room].forEach((serviceId) => recommendations.add(serviceId))
  })

  services.forEach((service) => {
    if (!service.active || !selectedRooms.includes(service.room)) {
      return
    }

    if (service.recommendedWhen?.some((rule) => recommendationRuleMatches(rule, state))) {
      recommendations.add(service.id)
    }
  })

  if (state.property.hasInternalStairs === 'yes') {
    recommendations.add('movement-stair-handrails')
    recommendations.add('movement-stair-treads')
  }

  range(state.quantities.entrances).forEach((index) => {
    const ramp = state.answers[`entrance-${index}-ramp`]

    if (ramp === 'modular-access-ramp' || ramp === 'unsure') {
      recommendations.add('entrance-modular-ramp')
    }
  })

  range(state.quantities.kitchens).forEach((index) => {
    if (['yes', 'unsure'].includes(String(state.answers[`kitchen-${index}-gas`] ?? ''))) {
      recommendations.add('kitchen-gas-co-sensor')
    }

    if (['yes', 'unsure'].includes(String(state.answers[`kitchen-${index}-upperCabinets`] ?? ''))) {
      recommendations.add('kitchen-pull-down-shelf')
    }

    if (state.answers[`kitchen-${index}-stoveShutoff`] === 'yes') {
      recommendations.add('kitchen-stove-shutoff')
    }

    if (state.answers[`kitchen-${index}-touchlessFaucet`] === 'yes') {
      recommendations.add('kitchen-touchless-faucet')
    }
  })

  range(state.quantities.bedrooms).forEach((index) => {
    if (state.answers[`bedroom-${index}-caregiverAlerts`] === 'yes') {
      recommendations.add('bedroom-bed-exit-sensor')
    }

    if (state.answers[`bedroom-${index}-adjustableBed`] === 'yes') {
      recommendations.add('bedroom-adjustable-bed')
    }
  })

  range(state.quantities.bathrooms).forEach((index) => {
    if (['yes', 'unsure'].includes(String(state.answers[`bathroom-${index}-toiletDifficulty`] ?? ''))) {
      recommendations.add('bathroom-raised-toilet-seat')
    }
  })

  if (asStringArray(state.answers['connected-alerts']).includes('monitoring')) {
    recommendations.add('connected-monitoring')
  }

  if (state.answers['connected-outsideProtection'] === 'yes') {
    recommendations.add('connected-fall-detection')
  }

  const activeServiceIds = new Set(
    services.filter((service) => service.active && selectedRooms.includes(service.room)).map((service) => service.id),
  )

  return Array.from(recommendations).filter((serviceId) => activeServiceIds.has(serviceId))
}

function recommendationRuleMatches(
  rule: NonNullable<CasaMiaService['recommendedWhen']>[number],
  state: ConfiguratorState,
) {
  const values = getAnswerValuesForRule(rule.answerKey, state)
  const matches = Array.isArray(rule.matches) ? rule.matches : [rule.matches]

  return values.some((value) => {
    if (Array.isArray(value)) {
      return value.some((item) => matches.some((match) => String(match) === String(item)))
    }

    return matches.some((match) => String(match) === String(value))
  })
}

function getAnswerValuesForRule(answerKey: string, state: ConfiguratorState) {
  const values: CustomerAnswer[] = []
  const exact = state.answers[answerKey]

  if (exact !== undefined) {
    values.push(exact)
  }

  if (answerKey === 'kitchen.floorRisk') {
    Object.entries(state.answers).forEach(([key, value]) => {
      if (/^kitchen-\d+-floorRisk$/.test(key)) {
        values.push(value)
      }
    })
  }

  if (answerKey === 'resident.gripStrength') {
    const gripStrength = state.answers['resident-gripStrength']

    if (gripStrength !== undefined) {
      values.push(gripStrength)
    }
  }

  return values
}

function getRoomLabel(room: HomeZoneId) {
  return homeZones.find((zone) => zone.id === room)?.title ?? room
}

function getServiceIcon(room: HomeZoneId) {
  const zone = homeZones.find((item) => item.id === room)

  return zone?.icon ?? ShieldCheck
}

function parseRoomParam(room: string | null): HomeZoneId | undefined {
  return homeZones.some((zone) => zone.id === room) ? (room as HomeZoneId) : undefined
}

export function ConfigurePage() {
  const configurator = useConfigurator()
  const { setCurrentStep, setSelectedRooms, setSelectedServices, state } = configurator
  const [searchParams] = useSearchParams()
  const roomParam = parseRoomParam(searchParams.get('room'))
  const serviceParam = searchParams.get('service')
  const roomParamApplied = useRef(false)
  const serviceParamApplied = useRef(false)
  const serviceCatalogue = useServiceCatalogue()
  const quote = calculateConfiguratorQuote(state)
  const currentStep = Math.min(Math.max(state.currentStep, 0), wizardSteps.length - 1)
  const recommendedServiceIds = useMemo(
    () => getRecommendedServiceIds(state, serviceCatalogue.services),
    [serviceCatalogue.services, state],
  )
  const canContinue =
    (currentStep !== 2 || getSelectedRoomIds(state).length > 0) &&
    (currentStep !== 5 || state.selectedServiceIds.length > 0)

  useEffect(() => {
    if (!roomParam || serviceParam || roomParamApplied.current) {
      return
    }

    roomParamApplied.current = true

    const selectedRoomIds = getSelectedRoomIds(state)
    if (!selectedRoomIds.includes(roomParam)) {
      setSelectedRooms([...selectedRoomIds, roomParam])
    }

    if (state.currentStep === 0) {
      setCurrentStep(1)
    }
  }, [roomParam, serviceParam, setCurrentStep, setSelectedRooms, state])

  useEffect(() => {
    if (!serviceParam || serviceParamApplied.current) {
      return
    }

    const service = serviceCatalogue.services.find(
      (item) => item.id === serviceParam && item.active,
    )

    if (!service) {
      return
    }

    serviceParamApplied.current = true
    const selectedRoomIds = getSelectedRoomIds(state)
    if (!selectedRoomIds.includes(service.room)) {
      setSelectedRooms([...selectedRoomIds, service.room])
    }
    if (!state.selectedServiceIds.includes(service.id)) {
      setSelectedServices([...state.selectedServiceIds, service.id])
    }
    setCurrentStep(5)
  }, [
    serviceCatalogue.services,
    serviceParam,
    setCurrentStep,
    setSelectedRooms,
    setSelectedServices,
    state,
  ])

  function goNext() {
    if (!canContinue) {
      return
    }

    if (currentStep === 4 && state.selectedServiceIds.length === 0 && recommendedServiceIds.length > 0) {
      setSelectedServices(recommendedServiceIds)
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
              {currentStep === 3 ? <QuantityStep /> : null}
              {currentStep === 4 ? <AreaConfigurationStep /> : null}
              {currentStep === 5 ? <ServiceSelectionStep recommendedServiceIds={recommendedServiceIds} /> : null}
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
                  <Link className="btn btn-navy" to="/home-safety-wizard">
                    Continue in guided plan
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
                <dt className="text-sm font-black uppercase text-text-muted">Visit deposit if booked</dt>
                <dd className="font-bold text-text-dark">{formatConfiguratorCurrency(quote.deposit)}</dd>
              </div>
            </dl>
            <p className="mt-5 rounded-lg bg-pale-blue p-4 text-sm font-bold leading-relaxed text-text-mid">
              {state.selectedServiceIds.length > 0
                ? 'This estimate uses the selected improvements. CasaMia confirms measurements, compatibility and final availability before any work starts.'
                : 'Select rooms and answer the guided questions. Your estimate appears once you choose individual improvements.'}
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
          Choose rooms, answer practical questions and review recommended improvements.
        </span>
      </button>
      <button className="soft-card text-left" type="button" onClick={() => setCurrentStep(getSavedProgressStep(state))}>
        <ShieldCheck className="mb-5 text-blue" size={42} aria-hidden="true" />
        <strong className="block font-display text-3xl font-bold leading-tight text-text-dark">
          Continue saved plan
        </strong>
        <span className="mt-3 block text-lg leading-relaxed text-text-mid">
          {hasSavedProgress ? 'Review your saved home details and selected improvements.' : 'No saved plan yet. Start with property details.'}
        </span>
      </button>
    </div>
  )
}

function hasConfiguratorProgress(state: ConfiguratorState) {
  return Boolean(
    getSelectedRoomIds(state).length > 0 ||
      state.selectedServiceIds.length > 0 ||
      state.property.propertyType ||
      state.property.postcode ||
      state.property.relationship ||
      state.property.hasInternalStairs !== 'unsure' ||
      state.property.floors !== 1,
  )
}

function getSavedProgressStep(state: ConfiguratorState) {
  if (state.selectedServiceIds.length > 0) {
    return 5
  }

  if (getSelectedRoomIds(state).length > 0) {
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
  const { setSelectedServices, state, toggleRoom } = useConfigurator()
  const selectedRoomIds = getSelectedRoomIds(state)
  const firstSelectedZone = homeZones.find((zone) => selectedRoomIds.includes(zone.id))
  const [activeZoneId, setActiveZoneId] = useState<HomeZoneId>(firstSelectedZone?.id ?? 'bathroom')
  const activeZone = homeZones.find((zone) => zone.id === activeZoneId) ?? homeZones[0]
  const selectedZones = homeZones.filter((zone) => selectedRoomIds.includes(zone.id))
  const ActiveIcon = activeZone.icon

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-soft md:p-5">
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wide text-blue">Choose the starting points</span>
          <h2 className="mt-1 font-display text-3xl font-bold leading-tight text-text-dark">Select the spaces that matter most.</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-text-mid">
            Tap a room, route or entrance. We will ask only the questions needed to suggest useful improvements.
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
                const selected = selectedRoomIds.includes(zone.id)
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
                      toggleRoom(zone.id)
                      setSelectedServices([])
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

function QuantityStep() {
  const { state, updateQuantities } = useConfigurator()
  const selectedRoomIds = getSelectedRoomIds(state)

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {selectedRoomIds.includes('entrance') ? (
        <NumberField label="Entrances to upgrade" min={1} value={state.quantities.entrances} onChange={(value) => updateQuantities({ entrances: value })} />
      ) : null}
      {selectedRoomIds.includes('kitchen') ? (
        <NumberField label="Kitchens to upgrade" min={1} value={state.quantities.kitchens} onChange={(value) => updateQuantities({ kitchens: value })} />
      ) : null}
      {selectedRoomIds.includes('bedroom') ? (
        <NumberField label="Bedrooms to upgrade" min={1} value={state.quantities.bedrooms} onChange={(value) => updateQuantities({ bedrooms: value })} />
      ) : null}
      {selectedRoomIds.includes('bathroom') ? (
        <NumberField label="Bathrooms to upgrade" min={1} value={state.quantities.bathrooms} onChange={(value) => updateQuantities({ bathrooms: value })} />
      ) : null}
      {selectedRoomIds.includes('movement') && state.property.hasInternalStairs === 'yes' ? (
        <NumberField label="Internal staircases" min={1} value={state.quantities.staircases || 1} onChange={(value) => updateQuantities({ staircases: value })} />
      ) : null}
      {selectedRoomIds.length === 0 ? (
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
      {isRoomSelected(state, 'entrance') ? <EntranceQuestions /> : null}
      {isRoomSelected(state, 'movement') ? <MovementQuestions /> : null}
      {isRoomSelected(state, 'kitchen') ? <KitchenQuestions /> : null}
      {isRoomSelected(state, 'bedroom') ? <BedroomQuestions /> : null}
      {isRoomSelected(state, 'bathroom') ? <BathroomQuestions /> : null}
      {isRoomSelected(state, 'connected') ? <ConnectedQuestions /> : null}
      {getSelectedRoomIds(state).length === 0 ? (
        <p className="rounded-lg border border-border bg-pale-blue p-5 text-lg font-bold text-text-mid">
          Choose the rooms and support areas you want CasaMia to configure.
        </p>
      ) : null}
    </div>
  )
}

function ServiceSelectionStep({ recommendedServiceIds }: { recommendedServiceIds: string[] }) {
  const { setSelectedServices, state, toggleService } = useConfigurator()
  const serviceCatalogue = useServiceCatalogue()
  const selectedRooms = getSelectedRoomIds(state)
  const visibleServices = serviceCatalogue.services.filter(
    (service) => service.active && selectedRooms.includes(service.room),
  )
  const selectedCount = visibleServices.filter((service) => state.selectedServiceIds.includes(service.id)).length
  const servicesByRoom = selectedRooms
    .map((room) => ({
      room,
      services: visibleServices.filter((service) => service.room === room),
    }))
    .filter((group) => group.services.length > 0)

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-border bg-pale-blue p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">
              Recommended improvements
            </h2>
            <p className="mt-2 max-w-2xl text-base font-bold leading-relaxed text-text-mid">
              Start with the suggested safety services. You can add, remove or keep items before requesting a quote.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn btn-white border border-border"
              type="button"
              onClick={() => setSelectedServices(recommendedServiceIds)}
            >
              Use recommended
            </button>
            <span className="inline-flex min-h-12 items-center rounded-full bg-white px-4 text-sm font-black uppercase text-blue">
              {selectedCount} selected
            </span>
          </div>
        </div>
      </div>

      {servicesByRoom.map((group) => (
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm" key={group.room}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wide text-blue">
                {getRoomLabel(group.room)}
              </span>
              <h3 className="mt-1 font-display text-2xl font-bold text-text-dark">
                Safety services
              </h3>
            </div>
            <span className="rounded-full bg-light-blue px-3 py-1 text-xs font-black uppercase text-text-muted">
              {group.services.length} options
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {group.services.map((service) => (
              <ServiceSelectionCard
                key={service.id}
                recommended={recommendedServiceIds.includes(service.id)}
                selected={state.selectedServiceIds.includes(service.id)}
                service={service}
                onToggle={() => toggleService(service.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function ServiceSelectionCard({
  onToggle,
  recommended,
  selected,
  service,
}: {
  onToggle: () => void
  recommended: boolean
  selected: boolean
  service: CasaMiaService
}) {
  const Icon = getServiceIcon(service.room)

  return (
    <article
      className={`flex min-h-full flex-col rounded-lg border p-4 transition ${
        selected ? 'border-blue bg-pale-blue shadow-soft' : 'border-border bg-white hover:border-blue'
      }`}
    >
      <div className="flex items-start gap-4">
        <span className={`inline-grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${selected ? 'bg-blue text-white' : 'bg-light-blue text-blue'}`}>
          <Icon size={23} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {recommended ? (
              <span className="rounded-full bg-white px-3 py-1 text-[0.68rem] font-black uppercase tracking-wide text-blue">
                Recommended
              </span>
            ) : null}
            {service.requiresInstallation ? (
              <span className="rounded-full bg-white px-3 py-1 text-[0.68rem] font-black uppercase tracking-wide text-blue">
                Managed install
              </span>
            ) : null}
            {service.requiresSiteVisit || service.requiresMeasurement || service.requiresCompatibilityCheck ? (
              <span className="rounded-full bg-white px-3 py-1 text-[0.68rem] font-black uppercase tracking-wide text-text-muted">
                CasaMia check
              </span>
            ) : null}
          </div>
          <h4 className="mt-3 text-xl font-black leading-tight text-text-dark">{service.name}</h4>
          <p className="mt-2 text-sm font-bold leading-relaxed text-text-mid">{service.shortDescription}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg bg-white/80 p-3">
        <div>
          <span className="text-xs font-black uppercase tracking-wide text-text-muted">Benefit</span>
          <p className="mt-1 text-sm font-bold leading-snug text-text-mid">{service.customerBenefit}</p>
        </div>
        {service.includedItems && service.includedItems.length > 0 ? (
          <div className="border-t border-border pt-3">
            <span className="text-xs font-black uppercase tracking-wide text-text-muted">Includes</span>
            <p className="mt-1 text-sm font-bold leading-snug text-text-mid">
              {service.includedItems.slice(0, 3).join(' / ')}
            </p>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
          <strong className="text-base font-black text-navy">{formatServicePrice(service)}</strong>
          <button
            aria-pressed={selected}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition ${
              selected ? 'bg-navy text-white' : 'bg-light-blue text-blue hover:bg-blue hover:text-white'
            }`}
            type="button"
            onClick={onToggle}
          >
            {selected ? 'Selected' : 'Add'}
            {selected ? <CheckCircle2 size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </article>
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
        <Metric label="Visit deposit if booked" value={formatConfiguratorCurrency(quote.deposit)} />
      </div>
      <div className="rounded-lg border border-border bg-white p-5">
        <h2 className="font-display text-3xl font-bold text-text-dark">Selected improvements</h2>
        <ul className="mt-4 grid gap-3">
          {quote.lines.map((line) => (
            <li className="flex flex-col gap-1 rounded-lg bg-pale-blue p-4 sm:flex-row sm:items-center sm:justify-between" key={line.id}>
              <span>
                <span className="block font-bold text-text-dark">{line.label}</span>
                {line.note ? <span className="text-sm font-bold text-text-muted">{line.note}</span> : null}
              </span>
              <span className="font-black text-navy">
                {line.recurringMonthly
                  ? `${formatConfiguratorCurrency(line.recurringMonthly)} / month`
                  : formatConfiguratorCurrency(line.total)}
              </span>
            </li>
          ))}
        </ul>
        {quote.lines.length === 0 ? (
          <p className="mt-4 rounded-lg bg-pale-blue p-4 text-base font-bold text-text-mid">
            Add at least one improvement to prepare an estimate.
          </p>
        ) : null}
      </div>
      {quote.quotationOnlyItems.length > 0 ? (
        <Notice title="Quotation-only items" items={quote.quotationOnlyItems.map((item) => item.label)} />
      ) : null}
      {quote.siteConfirmationItems.length > 0 ? (
        <Notice title="Requires site confirmation" items={quote.siteConfirmationItems.map((item) => `${item.label}: ${item.reason}`)} />
      ) : null}
      <Link className="btn btn-green w-fit" to="/home-safety-wizard">
        Build guided plan
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  )
}

function EntranceQuestions() {
  const { state, setAnswer } = useConfigurator()

  return (
    <QuestionGroup title="Entrance and access">
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
    <QuestionGroup title="Movement routes">
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
          Stair services are hidden because you selected no internal stairs.
        </p>
      ) : null}
    </QuestionGroup>
  )
}

function KitchenQuestions() {
  const { state, setAnswer } = useConfigurator()

  return (
    <QuestionGroup title="Kitchen routine">
      <div className="rounded-lg border border-border bg-white p-5">
        <SelectAnswer
          label="Does hand strength or wrist pain make food preparation harder?"
          answerKey="resident-gripStrength"
          options={[
            ['reduced', 'Reduced strength'],
            ['painful', 'Painful or tiring'],
            ['no', 'No'],
            ['unsure', "I'm not sure"],
          ]}
          setAnswer={setAnswer}
          state={state}
        />
      </div>
      {range(state.quantities.kitchens).map((index) => (
        <div className="grid gap-4 rounded-lg bg-pale-blue p-5 md:grid-cols-2" key={index}>
          <SelectAnswer label={`Kitchen ${index}: does it use gas?`} answerKey={`kitchen-${index}-gas`} options={yesNoUnsure()} setAnswer={setAnswer} state={state} />
          <SelectAnswer
            label="Is the floor often wet or slippery?"
            answerKey={`kitchen-${index}-floorRisk`}
            options={[
              ['slippery', 'Yes, often'],
              ['no', 'No'],
              ['unsure', "I'm not sure"],
            ]}
            setAnswer={setAnswer}
            state={state}
          />
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
    <QuestionGroup title="Bedroom and night routine">
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
    <QuestionGroup title="Bathroom routine">
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
    <QuestionGroup title="Connected support">
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
