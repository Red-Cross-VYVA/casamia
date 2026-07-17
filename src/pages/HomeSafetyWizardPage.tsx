import {
  Accessibility,
  AlertTriangle,
  ArrowUpDown,
  Bath,
  BedDouble,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Camera,
  Check,
  CircleHelp,
  CookingPot,
  DoorOpen,
  Eye,
  Footprints,
  HeartHandshake,
  Home,
  House,
  LampDesk,
  Lightbulb,
  MapPin,
  MessageCircle,
  Mic,
  MoonStar,
  MoveUp,
  PersonStanding,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trees,
  UserRound,
  UsersRound,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ContactDetailsStep } from '../components/wizard/ContactDetailsStep'
import { PhoneStep } from '../components/wizard/PhoneStep'
import { PhotoUploadStep } from '../components/wizard/PhotoUploadStep'
import { PlanResult } from '../components/wizard/PlanResult'
import { VisitBookingStep } from '../components/wizard/VisitBookingStep'
import { VoiceInputStep } from '../components/wizard/VoiceInputStep'
import { WizardChoiceCard } from '../components/wizard/WizardChoiceCard'
import { WizardLayout } from '../components/wizard/WizardLayout'
import { WizardPackageDialog, wizardPackageDialogId } from '../components/wizard/WizardPackageDialog'
import { WizardStep } from '../components/wizard/WizardStep'
import { getWizardCopy } from '../config/wizardCopy'
import { useSafetyWizard } from '../hooks/useSafetyWizard'
import { getServicesForPackageArea, useServiceCatalogue } from '../services/serviceCatalogue'
import { generateWizardResult } from '../services/wizardRecommendationEngine'
import { submitSafetyWizard } from '../services/wizardSubmission'
import type { CasaMiaService } from '../types/serviceCatalogue'
import type {
  ClientNeed,
  ClientSiteCount,
  ClientType,
  FloorCount,
  HomeType,
  MobilityLevel,
  SafetyWizardState,
  StairsType,
  Urgency,
  WizardChallenge,
  WizardInputMethod,
  WizardRisk,
  WizardRoom,
  WizardUserType,
} from '../types/wizard'
import { trackEvent } from '../utils/analytics'
import '../styles/home-safety-wizard.css'

type ChoiceOption<T extends string> = { value: T; icon: LucideIcon }

const userOptions: ChoiceOption<WizardUserType>[] = [
  { value: 'me', icon: UserRound },
  { value: 'family', icon: UsersRound },
  { value: 'client', icon: BriefcaseBusiness },
]
const methodOptions: ChoiceOption<WizardInputMethod>[] = [
  { value: 'questions', icon: Check }, { value: 'photos', icon: Camera }, { value: 'voice', icon: Mic },
  { value: 'call', icon: Phone }, { value: 'visit', icon: Home },
]
const homeOptions: ChoiceOption<HomeType>[] = [
  { value: 'apartment', icon: Building2 }, { value: 'house', icon: House }, { value: 'villa', icon: Warehouse }, { value: 'other', icon: CircleHelp },
]
const floorOptions: ChoiceOption<FloorCount>[] = [
  { value: 'one', icon: Home }, { value: 'two', icon: Building2 }, { value: 'three-plus', icon: Building2 },
]
const stairOptions: ChoiceOption<StairsType>[] = [
  { value: 'none', icon: Check }, { value: 'inside', icon: ArrowUpDown }, { value: 'outside', icon: MoveUp }, { value: 'both', icon: ArrowUpDown },
]
const areaOptions: ChoiceOption<WizardRoom>[] = [
  { value: 'bathroom', icon: Bath }, { value: 'bedroom', icon: BedDouble }, { value: 'kitchen', icon: CookingPot },
  { value: 'living-room', icon: LampDesk }, { value: 'stairs', icon: ArrowUpDown }, { value: 'entrance', icon: DoorOpen },
  { value: 'outdoor', icon: Trees }, { value: 'lighting', icon: Lightbulb }, { value: 'smart-safety', icon: Sparkles }, { value: 'not-sure', icon: CircleHelp },
]
const mobilityOptions: ChoiceOption<MobilityLevel>[] = [
  { value: 'independent', icon: PersonStanding }, { value: 'cane', icon: Accessibility }, { value: 'walker', icon: Accessibility },
  { value: 'wheelchair', icon: Accessibility }, { value: 'assistance', icon: HeartHandshake }, { value: 'prefer-not', icon: CircleHelp },
]
const challengeOptions: ChoiceOption<WizardChallenge>[] = [
  { value: 'falls', icon: ShieldAlert }, { value: 'balance', icon: PersonStanding }, { value: 'vision', icon: Eye },
  { value: 'strength', icon: Accessibility }, { value: 'memory', icon: CircleHelp }, { value: 'arthritis', icon: Accessibility },
  { value: 'night-movement', icon: MoonStar }, { value: 'emergency-support', icon: ShieldCheck },
  { value: 'general-prevention', icon: Check }, { value: 'other', icon: CircleHelp },
]
const riskOptions: ChoiceOption<WizardRisk>[] = [
  { value: 'slippery-floors', icon: Footprints }, { value: 'poor-lighting', icon: Lightbulb }, { value: 'loose-rugs', icon: Footprints },
  { value: 'difficult-stairs', icon: ArrowUpDown }, { value: 'high-thresholds', icon: DoorOpen }, { value: 'hard-to-reach-storage', icon: MoveUp },
  { value: 'unsafe-bathroom', icon: Bath }, { value: 'no-emergency-alert', icon: ShieldAlert }, { value: 'not-sure', icon: CircleHelp },
]
const urgencyOptions: ChoiceOption<Urgency>[] = [
  { value: 'planning', icon: CalendarClock }, { value: 'soon', icon: CalendarClock }, { value: 'urgent', icon: AlertTriangle },
]
const clientTypeOptions: ChoiceOption<ClientType>[] = [
  { value: 'care-provider', icon: HeartHandshake }, { value: 'property-manager', icon: Building2 }, { value: 'clinic', icon: ShieldCheck },
  { value: 'hospital', icon: ShieldCheck }, { value: 'residence', icon: Home }, { value: 'business', icon: BriefcaseBusiness },
  { value: 'public-body', icon: Building2 }, { value: 'other', icon: CircleHelp },
]
const clientSiteOptions: ChoiceOption<ClientSiteCount>[] = [
  { value: 'one', icon: Building2 }, { value: '2-5', icon: Building2 }, { value: '6-20', icon: Building2 }, { value: '20-plus', icon: Building2 },
]
const clientNeedOptions: ChoiceOption<ClientNeed>[] = [
  { value: 'safety-audits', icon: ShieldCheck }, { value: 'home-adaptations', icon: Home }, { value: 'smart-safety', icon: Sparkles },
  { value: 'staff-support', icon: UsersRound }, { value: 'accessibility', icon: Accessibility }, { value: 'portfolio-review', icon: Building2 }, { value: 'other', icon: CircleHelp },
]

export function HomeSafetyWizardPage() {
  const { i18n } = useTranslation()
  const copy = useMemo(() => getWizardCopy(i18n.language), [i18n.language])
  const wizard = useSafetyWizard()
  const { state } = wizard
  const serviceCatalogue = useServiceCatalogue()
  const displayedMethodOptions = state.userType === 'client'
    ? ['call', 'visit', 'photos', 'voice', 'questions'].map((value) => methodOptions.find((option) => option.value === value)!)
    : methodOptions
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error'>()
  const [packageArea, setPackageArea] = useState<WizardRoom | null>(null)
  const packageTriggerRef = useRef<HTMLButtonElement | null>(null)
  const packageServicesByArea = useMemo(
    () => areaOptions.reduce<Record<WizardRoom, CasaMiaService[]>>((areas, option) => {
      areas[option.value] = getServicesForPackageArea(serviceCatalogue.services, option.value)
      return areas
    }, {} as Record<WizardRoom, CasaMiaService[]>),
    [serviceCatalogue.services],
  )
  const displayedResult = useMemo(
    () => state.result
      ? generateWizardResult(state, {
          language: i18n.language,
          services: serviceCatalogue.services,
        })
      : undefined,
    [i18n.language, serviceCatalogue.services, state],
  )

  useEffect(() => {
    document.title = `${copy.entry.title} | CasaMia`
  }, [copy.entry.title])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [state.currentStep])

  const saveForLater = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  const selectSingle = <K extends keyof SafetyWizardState>(key: K, value: SafetyWizardState[K]) => {
    if (key === 'userType') trackEvent('wizard_user_type_selected', { userType: String(value) })
    const patch = { [key]: value } as Pick<SafetyWizardState, K>
    wizard.completeStep(patch)
  }

  const toggleMultiple = <T extends string>(values: T[], value: T, exclusive?: T) => {
    if (value === exclusive) return values.includes(value) ? [] : [value]
    const withoutExclusive = exclusive ? values.filter((item) => item !== exclusive) : values
    return withoutExclusive.includes(value) ? withoutExclusive.filter((item) => item !== value) : [...withoutExclusive, value]
  }

  const submit = async (action: 'book-visit' | 'request-proposal' | 'business-consultation') => {
    const nextState = action === 'book-visit'
      ? { ...state, inspectionBooked: true }
      : state
    nextState.result = generateWizardResult(nextState, {
      language: i18n.language,
      services: serviceCatalogue.services,
    })
    wizard.patchState({ inspectionBooked: nextState.inspectionBooked, result: nextState.result })
    setSubmitting(true)
    setSubmitStatus(undefined)
    try {
      const submission = await submitSafetyWizard(nextState)
      wizard.patchState({ submitted: true, photos: submission.photos })
      trackEvent('wizard_submitted', { reference: state.wizardReference, action, userType: state.userType })
      setSubmitStatus('success')
    } catch {
      setSubmitStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  const renderChoiceStep = <T extends string>({
    title, body, hint, options, labels, selected, multiple = false, onSelect, allowSkip = false,
  }: {
    title: string; body?: string; hint?: string; options: ChoiceOption<T>[]; labels: Record<T, string>;
    selected: T[]; multiple?: boolean; onSelect: (value: T) => void; allowSkip?: boolean
  }) => (
    <WizardStep title={title} body={body} hint={hint}>
      <div className={`safety-wizard-choice-grid${options.length > 6 ? ' is-dense' : ''}`}>
        {options.map(({ value, icon: Icon }) => (
          <WizardChoiceCard key={value} label={labels[value]} icon={<Icon size={27} />} selected={selected.includes(value)} multiple={multiple} onSelect={() => onSelect(value)} />
        ))}
      </div>
      {multiple ? <WizardActions copy={copy} disabled={!selected.length && !allowSkip} allowSkip={allowSkip} onContinue={() => wizard.completeStep()} /> : null}
    </WizardStep>
  )

  const step = (() => {
    switch (state.currentStep) {
      case 'entry':
        return (
          <section className="safety-wizard-entry">
            <div className="safety-wizard-entry-mark"><ShieldCheck size={38} aria-hidden="true" /></div>
            <p>{copy.entry.eyebrow}</p>
            <h1>{copy.entry.title}</h1>
            <span>{copy.entry.body}</span>
            <button className="btn btn-navy" onClick={wizard.start} type="button">{copy.entry.start}</button>
            <small><Check size={17} aria-hidden="true" /> {copy.entry.time}</small>
          </section>
        )
      case 'user-type':
        return renderChoiceStep({
          title: copy.userType.title,
          body: copy.userType.body,
          hint: copy.micro.chooseOne,
          options: userOptions,
          labels: copy.userType.options,
          selected: state.userType ? [state.userType] : [],
          onSelect: (value) => {
            trackEvent('wizard_user_type_selected', { userType: value })
            wizard.completeStep({ userType: value, inputMethods: [] })
          },
        })
      case 'methods':
        return (
          <WizardStep title={copy.methods.title} body={copy.methods.body} hint={copy.micro.chooseOne}>
            <div className="safety-wizard-choice-grid">
              {displayedMethodOptions.map(({ value, icon: Icon }) => (
                <WizardChoiceCard
                  key={value}
                  label={copy.methods.options[value]}
                  description={copy.methods.descriptions[value]}
                  icon={<Icon size={27} />}
                  selected={state.inputMethods[0] === value}
                  onSelect={() => {
                    trackEvent('wizard_method_selected', { method: value, selected: true })
                    wizard.completeStep({ inputMethods: [value] })
                  }}
                />
              ))}
            </div>
          </WizardStep>
        )
      case 'client-type':
        return renderChoiceStep({ title: copy.client.typeTitle, hint: copy.micro.chooseOne, options: clientTypeOptions, labels: copy.client.types, selected: state.clientType ? [state.clientType] : [], onSelect: (value) => selectSingle('clientType', value) })
      case 'client-sites':
        return renderChoiceStep({ title: copy.client.siteTitle, hint: copy.micro.chooseOne, options: clientSiteOptions, labels: copy.client.sites, selected: state.clientSiteCount ? [state.clientSiteCount] : [], onSelect: (value) => selectSingle('clientSiteCount', value) })
      case 'client-need':
        return renderChoiceStep({ title: copy.client.needTitle, hint: copy.micro.chooseOne, options: clientNeedOptions, labels: copy.client.needs, selected: state.clientNeed ? [state.clientNeed] : [], onSelect: (value) => selectSingle('clientNeed', value) })
      case 'client-location':
        return <TextStep title={copy.client.locationTitle} placeholder={copy.client.locationPlaceholder} value={state.clientLocation} onChange={(value) => wizard.patchState({ clientLocation: value })} copy={copy} onContinue={() => wizard.completeStep()} required />
      case 'home-type':
        return renderChoiceStep({ title: state.userType === 'family' ? copy.homeType.familyTitle : copy.homeType.title, hint: copy.micro.chooseOne, options: homeOptions, labels: copy.homeType.options, selected: state.homeType ? [state.homeType] : [], onSelect: (value) => selectSingle('homeType', value) })
      case 'floors':
        return renderChoiceStep({ title: state.userType === 'family' ? copy.floors.familyTitle : copy.floors.title, hint: copy.micro.chooseOne, options: floorOptions, labels: copy.floors.options, selected: state.floorCount ? [state.floorCount] : [], onSelect: (value) => wizard.completeStep({ floorCount: value, stairsType: value === 'one' ? 'none' : state.stairsType }) })
      case 'stairs':
        return renderChoiceStep({ title: state.userType === 'family' ? copy.stairs.familyTitle : copy.stairs.title, hint: copy.micro.chooseOne, options: stairOptions, labels: copy.stairs.options, selected: state.stairsType ? [state.stairsType] : [], onSelect: (value) => selectSingle('stairsType', value) })
      case 'areas':
        return (
          <WizardStep title={state.userType === 'family' ? copy.areas.familyTitle : copy.areas.title} hint={copy.micro.chooseAll}>
            <div className="safety-wizard-choice-grid is-dense has-package-details">
              {areaOptions.map(({ value, icon: Icon }) => {
                const detailsLabel = value === 'not-sure' ? copy.areas.viewAll : copy.areas.viewPackage
                const areaLabel = copy.areas.options[value]

                return (
                  <WizardChoiceCard
                    detailsAriaLabel={`${detailsLabel}: ${areaLabel}`}
                    detailsCount={packageServicesByArea[value].length}
                    detailsDialogId={wizardPackageDialogId}
                    detailsLabel={detailsLabel}
                    icon={<Icon size={27} />}
                    key={value}
                    label={areaLabel}
                    multiple
                    onDetails={(trigger) => {
                      packageTriggerRef.current = trigger
                      setPackageArea(value)
                    }}
                    onSelect={() => wizard.patchState({ areasOfConcern: toggleMultiple(state.areasOfConcern, value, 'not-sure') })}
                    selected={state.areasOfConcern.includes(value)}
                  />
                )
              })}
            </div>
            <WizardActions copy={copy} disabled={!state.areasOfConcern.length} onContinue={() => wizard.completeStep()} />
          </WizardStep>
        )
      case 'mobility':
        return renderChoiceStep({ title: copy.mobility.title, hint: copy.micro.chooseOne, options: mobilityOptions, labels: copy.mobility.options, selected: state.mobilityLevel ? [state.mobilityLevel] : [], onSelect: (value) => selectSingle('mobilityLevel', value) })
      case 'challenges':
        return renderChoiceStep({ title: copy.challenges.title, hint: copy.micro.chooseAll, options: challengeOptions, labels: copy.challenges.options, selected: state.challenges, multiple: true, allowSkip: true, onSelect: (value) => wizard.patchState({ challenges: toggleMultiple(state.challenges, value) }) })
      case 'risks':
        return renderChoiceStep({ title: state.userType === 'family' ? copy.risks.familyTitle : copy.risks.title, hint: copy.micro.chooseAll, options: riskOptions, labels: copy.risks.options, selected: state.currentRisks, multiple: true, allowSkip: true, onSelect: (value) => wizard.patchState({ currentRisks: toggleMultiple(state.currentRisks, value, 'not-sure') }) })
      case 'urgency':
        return renderChoiceStep({ title: copy.urgency.title, hint: copy.micro.chooseOne, options: urgencyOptions, labels: copy.urgency.options, selected: state.urgency ? [state.urgency] : [], onSelect: (value) => selectSingle('urgency', value) })
      case 'notes':
        return <TextStep title={copy.notes.title} body={copy.notes.body} placeholder={copy.notes.placeholder} value={state.notes} onChange={(value) => wizard.patchState({ notes: value })} copy={copy} onContinue={() => wizard.completeStep()} multiline />
      case 'photos':
        return <><PhotoUploadStep copy={copy} photos={state.photos} roomLabels={{ bathroom: copy.areas.options.bathroom, bedroom: copy.areas.options.bedroom, kitchen: copy.areas.options.kitchen, 'living-room': copy.areas.options['living-room'], stairs: copy.areas.options.stairs, entrance: copy.areas.options.entrance, outdoor: copy.areas.options.outdoor, other: copy.photos.otherRoom }} onChange={(photos) => { if (photos.length > state.photos.length) trackEvent('wizard_photo_added', { reference: state.wizardReference }); wizard.patchState({ photos }) }} /><WizardActions copy={copy} allowSkip onContinue={() => wizard.completeStep()} /></>
      case 'voice':
        return <><VoiceInputStep copy={copy} recording={state.voiceRecording} fallbackNote={state.notes} onFallbackNoteChange={(notes) => wizard.patchState({ notes })} onChange={(voiceRecording) => { if (voiceRecording) trackEvent('wizard_voice_recorded', { reference: state.wizardReference }); wizard.patchState({ voiceRecording }) }} /><WizardActions copy={copy} allowSkip onContinue={() => wizard.completeStep()} /></>
      case 'phone':
        return <><PhoneStep copy={copy} reference={state.wizardReference} /><WizardActions copy={copy} allowSkip onContinue={() => wizard.completeStep()} /></>
      case 'visit':
        return <><VisitBookingStep copy={copy} selected={state.inspectionBooked} onSelect={(inspectionBooked) => { wizard.patchState({ inspectionBooked }); if (inspectionBooked) trackEvent('wizard_visit_selected', { reference: state.wizardReference }) }} /><WizardActions copy={copy} allowSkip onContinue={() => wizard.completeStep()} /></>
      case 'contact':
        return <ContactDetailsStep copy={copy} contact={state.contact} onChange={(contact) => wizard.patchState({ contact })} onContinue={() => wizard.completeStep()} />
      case 'result':
        return displayedResult ? (
          <PlanResult
            copy={copy}
            language={i18n.language}
            state={state}
            result={displayedResult}
            submitting={submitting}
            submitStatus={submitStatus}
            onPlanChange={(selectedPlan) => wizard.patchState({
              result: { ...displayedResult, selectedPlan },
            })}
            onAction={submit}
            onReset={wizard.reset}
          />
        ) : null
    }
  })()

  return (
    <>
      <WizardLayout copy={copy} currentIndex={wizard.currentIndex} totalSteps={wizard.progressTotalSteps} progress={wizard.progress} canGoBack={state.currentStep !== 'entry'} saved={saved} onBack={wizard.back} onSave={saveForLater}>
        {step}
      </WizardLayout>
      {packageArea ? (
        <WizardPackageDialog
          areaLabel={copy.areas.options[packageArea]}
          copy={copy.areas}
          isAllOptions={packageArea === 'not-sure'}
          onClose={() => setPackageArea(null)}
          returnFocusTo={packageTriggerRef.current}
          services={packageServicesByArea[packageArea]}
        />
      ) : null}
    </>
  )
}

function WizardActions({ copy, disabled = false, allowSkip = false, onContinue }: { copy: ReturnType<typeof getWizardCopy>; disabled?: boolean; allowSkip?: boolean; onContinue: () => void }) {
  return (
    <div className="safety-wizard-actions">
      {allowSkip ? <button className="safety-wizard-text-button" onClick={onContinue} type="button">{copy.nav.skip}</button> : null}
      <button className="btn btn-navy" disabled={disabled} onClick={onContinue} type="button">{copy.nav.continue}</button>
    </div>
  )
}

function TextStep({ title, body, placeholder, value, onChange, copy, onContinue, multiline = false, required = false }: { title: string; body?: string; placeholder: string; value: string; onChange: (value: string) => void; copy: ReturnType<typeof getWizardCopy>; onContinue: () => void; multiline?: boolean; required?: boolean }) {
  const control: ReactNode = multiline
    ? <textarea rows={5} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    : <input autoFocus placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />

  return (
    <WizardStep title={title} body={body} hint={required ? undefined : copy.micro.optional} icon={multiline ? <MessageCircle size={28} /> : <MapPin size={28} />}>
      <div className="safety-wizard-text-entry">{control}</div>
      <WizardActions copy={copy} allowSkip={!required} disabled={required && !value.trim()} onContinue={onContinue} />
    </WizardStep>
  )
}
