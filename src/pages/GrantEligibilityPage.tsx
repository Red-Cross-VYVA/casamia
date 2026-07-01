import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  FileText,
  Home,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type FormState = {
  region: string
  postcode: string
  homeType: string
  ownership: string
  residentAge: string
  mobility: string
  recognisedStatus: string
  needs: string[]
  timeline: string
  name: string
  phone: string
  email: string
  contactPreference: string
  consent: boolean
}

type Result = {
  title: string
  summary: string
  score: number
  tone: 'strong' | 'review' | 'watch'
  reasons: string[]
  documents: string[]
  nextSteps: string[]
}

const initialForm: FormState = {
  region: '',
  postcode: '',
  homeType: '',
  ownership: '',
  residentAge: '',
  mobility: '',
  recognisedStatus: '',
  needs: [],
  timeline: '',
  name: '',
  phone: '',
  email: '',
  contactPreference: 'Phone',
  consent: false,
}

const regions = [
  'Andalucia',
  'Aragon',
  'Asturias',
  'Balearic Islands',
  'Canary Islands',
  'Cantabria',
  'Castilla-La Mancha',
  'Castilla y Leon',
  'Catalonia',
  'Community of Madrid',
  'Comunidad Valenciana',
  'Extremadura',
  'Galicia',
  'La Rioja',
  'Murcia',
  'Navarra',
  'Basque Country',
  'Ceuta',
  'Melilla',
]

const homeTypes = ['Apartment', 'Townhouse', 'Villa or detached home', 'Residential building community']
const ownershipOptions = ['Owner occupied', 'Owned by family', 'Rented home', 'Community building works']
const ageOptions = ['Under 65', '65 to 74', '75+', 'Family member answering']
const mobilityOptions = ['No major mobility issue', 'Occasional balance or mobility concern', 'Uses cane or walker', 'Wheelchair or major mobility need']
const statusOptions = ['Recognised disability or dependency', 'Application in progress', 'No recognised status yet', 'Prefer not to say']
const needOptions = [
  'Bathroom safety',
  'Entrance access',
  'Stairs or handrails',
  'Non-slip flooring',
  'Motion lighting',
  'Door widening',
  'Emergency alerts',
  'Smart access',
  'Fall detection',
]
const timelineOptions = ['As soon as possible', 'Within 1 month', 'Within 3 months', 'Planning ahead']
const contactOptions = ['Phone', 'WhatsApp', 'Email']

export function GrantEligibilityPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const result = useMemo(() => calculateResult(form), [form])
  const canContinue = getStepCompletion(step, form)

  function updateField<Field extends keyof FormState>(field: Field, value: FormState[Field]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleNeed(need: string) {
    setForm((current) => ({
      ...current,
      needs: current.needs.includes(need)
        ? current.needs.filter((item) => item !== need)
        : [...current.needs, need],
    }))
  }

  function submitLead() {
    setSubmitted(true)
    window.localStorage.setItem(
      'casamia-grant-readiness-lead',
      JSON.stringify({
        capturedAt: new Date().toISOString(),
        form,
        result,
      }),
    )
  }

  const reportSummary = buildReportSummary(form, result)

  return (
    <>
      <section className="grant-check-hero page-hero">
        <div className="page-hero-inner">
          <Link className="inline-flex items-center gap-2 text-sm font-bold uppercase text-navy" to="/#grants">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to grants
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <div>
              <h1 className="display-title">Check your grant options in Spain.</h1>
              <p className="mt-5 max-w-3xl text-xl text-text-mid">
                Answer a few questions and get a practical grant-readiness report, including likely signals,
                document needs, and the next step CasaMia should verify for your region.
              </p>
            </div>
            <aside className="grant-check-note">
              <ShieldCheck className="text-green" size={26} aria-hidden="true" />
              <p>
                This is not a grant approval. Spanish accessibility support depends on your autonomous
                community, open calls, home details, and documentation.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="grant-check-section section-pad bg-white">
        <div className="site-shell grant-check-shell">
          <div className="grant-check-panel">
            <div className="grant-progress" aria-label="Grant check progress">
              {['Home', 'Resident', 'Needs', 'Contact'].map((label, index) => (
                <button
                  className={`grant-progress-step ${step === index ? 'is-active' : ''} ${step > index ? 'is-complete' : ''}`}
                  key={label}
                  onClick={() => setStep(index)}
                  type="button"
                >
                  <span>{index + 1}</span>
                  {label}
                </button>
              ))}
            </div>

            <div className="grant-step-card">
              {step === 0 ? (
                <StepCard
                  icon={<MapPin size={24} aria-hidden="true" />}
                  kicker="Step 1"
                  title="Where is the home?"
                  intro="Eligibility starts with location and property type because most applications are handled regionally."
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField
                      label="Autonomous community"
                      value={form.region}
                      options={regions}
                      placeholder="Choose region"
                      onChange={(value) => updateField('region', value)}
                    />
                    <TextField
                      label="Postcode"
                      value={form.postcode}
                      placeholder="Example: 28013"
                      onChange={(value) => updateField('postcode', value)}
                    />
                    <SelectField
                      label="Home type"
                      value={form.homeType}
                      options={homeTypes}
                      placeholder="Choose home type"
                      onChange={(value) => updateField('homeType', value)}
                    />
                    <SelectField
                      label="Ownership situation"
                      value={form.ownership}
                      options={ownershipOptions}
                      placeholder="Choose situation"
                      onChange={(value) => updateField('ownership', value)}
                    />
                  </div>
                </StepCard>
              ) : null}

              {step === 1 ? (
                <StepCard
                  icon={<UserRound size={24} aria-hidden="true" />}
                  kicker="Step 2"
                  title="Who needs the adaptation?"
                  intro="Keep this broad. CasaMia can review sensitive documents later only if they are needed."
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField
                      label="Resident age"
                      value={form.residentAge}
                      options={ageOptions}
                      placeholder="Choose age band"
                      onChange={(value) => updateField('residentAge', value)}
                    />
                    <SelectField
                      label="Mobility situation"
                      value={form.mobility}
                      options={mobilityOptions}
                      placeholder="Choose closest match"
                      onChange={(value) => updateField('mobility', value)}
                    />
                    <SelectField
                      label="Disability or dependency status"
                      value={form.recognisedStatus}
                      options={statusOptions}
                      placeholder="Choose status"
                      onChange={(value) => updateField('recognisedStatus', value)}
                    />
                    <SelectField
                      label="Timing"
                      value={form.timeline}
                      options={timelineOptions}
                      placeholder="Choose timing"
                      onChange={(value) => updateField('timeline', value)}
                    />
                  </div>
                </StepCard>
              ) : null}

              {step === 2 ? (
                <StepCard
                  icon={<Home size={24} aria-hidden="true" />}
                  kicker="Step 3"
                  title="What needs to change?"
                  intro="Select the adaptations or risks you already know about. Photos can be reviewed during the free assessment."
                >
                  <div className="grant-choice-grid">
                    {needOptions.map((need) => (
                      <button
                        className={`grant-choice ${form.needs.includes(need) ? 'is-selected' : ''}`}
                        key={need}
                        onClick={() => toggleNeed(need)}
                        type="button"
                      >
                        <Check size={18} aria-hidden="true" />
                        {need}
                      </button>
                    ))}
                  </div>
                </StepCard>
              ) : null}

              {step === 3 ? (
                <StepCard
                  icon={<Phone size={24} aria-hidden="true" />}
                  kicker="Step 4"
                  title="Where should CasaMia send the review?"
                  intro="The result appears instantly. These details help CasaMia follow up with the right regional checklist."
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <TextField
                      label="Name"
                      value={form.name}
                      placeholder="Your name"
                      onChange={(value) => updateField('name', value)}
                    />
                    <TextField
                      label="Phone"
                      value={form.phone}
                      placeholder="+34 ..."
                      onChange={(value) => updateField('phone', value)}
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={form.email}
                      placeholder="you@example.com"
                      onChange={(value) => updateField('email', value)}
                    />
                    <SelectField
                      label="Preferred follow-up"
                      value={form.contactPreference}
                      options={contactOptions}
                      placeholder="Choose contact method"
                      onChange={(value) => updateField('contactPreference', value)}
                    />
                  </div>
                  <label className="grant-consent">
                    <input
                      checked={form.consent}
                      onChange={(event) => updateField('consent', event.target.checked)}
                      type="checkbox"
                    />
                    <span>
                      I agree CasaMia can use this information to prepare my grant-readiness review and
                      contact me about home safety adaptations.
                    </span>
                  </label>
                </StepCard>
              ) : null}

              <div className="grant-step-actions">
                <button
                  className="btn btn-white"
                  disabled={step === 0}
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  type="button"
                >
                  Back
                </button>
                {step < 3 ? (
                  <button
                    className="btn btn-navy"
                    disabled={!canContinue}
                    onClick={() => setStep((current) => Math.min(3, current + 1))}
                    type="button"
                  >
                    Continue
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    className="btn btn-green"
                    disabled={!canContinue}
                    onClick={submitLead}
                    type="button"
                  >
                    Create my report
                    <ClipboardCheck size={20} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className={`grant-result-card result-${result.tone}`}>
            <div className="grant-result-score">
              <span>{result.score}%</span>
              <small>readiness</small>
            </div>
            <p className="text-sm font-black uppercase tracking-wide text-green">Instant report</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-text-dark">{result.title}</h2>
            <p className="mt-4 text-text-mid">{result.summary}</p>

            <ResultList title="Why this result appears" icon={<Sparkles size={18} aria-hidden="true" />} items={result.reasons} />
            <ResultList title="Useful documents to prepare" icon={<FileText size={18} aria-hidden="true" />} items={result.documents} />

            {submitted ? (
              <div className="grant-submitted">
                <p className="font-bold text-navy">Your report is ready.</p>
                <p className="mt-1 text-sm text-text-mid">
                  CasaMia can now check open calls for {form.region || 'your region'} and send the right document checklist by {form.contactPreference.toLowerCase()}.
                </p>
              </div>
            ) : (
              <p className="mt-6 rounded-lg border border-border bg-light-blue p-4 text-sm font-semibold text-text-mid">
                Complete the contact step and CasaMia can verify the regional route for this home.
              </p>
            )}

            <details className="grant-report-details">
              <summary>View report summary</summary>
              <pre>{reportSummary}</pre>
            </details>
          </aside>
        </div>
      </section>
    </>
  )
}

function StepCard({
  children,
  icon,
  kicker,
  title,
  intro,
}: {
  children: ReactNode
  icon: ReactNode
  kicker: string
  title: string
  intro: string
}) {
  return (
    <div>
      <div className="grant-step-heading">
        <span>{icon}</span>
        <div>
          <p>{kicker}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-text-mid">{intro}</p>
      <div className="mt-8">{children}</div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <label className="grant-field">
      {label}
      <input
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grant-field">
      {label}
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ResultList({
  title,
  icon,
  items,
}: {
  title: string
  icon: ReactNode
  items: string[]
}) {
  return (
    <div className="grant-result-list">
      <h3>
        {icon}
        {title}
      </h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <Check size={16} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function getStepCompletion(step: number, form: FormState) {
  if (step === 0) {
    return Boolean(form.region && form.postcode && form.homeType && form.ownership)
  }

  if (step === 1) {
    return Boolean(form.residentAge && form.mobility && form.recognisedStatus && form.timeline)
  }

  if (step === 2) {
    return form.needs.length > 0
  }

  return Boolean(form.name && (form.phone || form.email) && form.consent)
}

function calculateResult(form: FormState): Result {
  let score = 18
  const reasons: string[] = []
  const documents = [
    'Photos of the rooms or access points that need adapting.',
    'A simple quote or work description for the proposed adaptations.',
    'Proof that the home is in Spain and used as the main residence where required.',
  ]

  if (form.region) {
    score += 8
    reasons.push(`${form.region} can be checked against regional and municipal accessibility calls.`)
  } else {
    reasons.push('Region is still needed because most grant routes are managed locally.')
  }

  if (form.residentAge === '75+') {
    score += 18
    reasons.push('A resident aged 75+ is often a strong signal for accessibility support.')
  } else if (form.residentAge === '65 to 74') {
    score += 13
    reasons.push('A resident over 65 can match many senior accessibility criteria.')
  } else if (form.residentAge === 'Family member answering') {
    score += 8
    reasons.push('Family-led applications are common, but CasaMia should confirm the resident details.')
  }

  if (form.recognisedStatus === 'Recognised disability or dependency') {
    score += 18
    reasons.push('Recognised disability or dependency can strengthen the application and funding level.')
    documents.push('Disability certificate or dependency resolution, if available.')
  } else if (form.recognisedStatus === 'Application in progress') {
    score += 11
    reasons.push('A pending disability or dependency application may still be useful for regional review.')
    documents.push('Any proof that a disability or dependency application is in progress.')
  } else if (form.recognisedStatus === 'Prefer not to say') {
    score += 4
    reasons.push('Sensitive status can be reviewed privately later if it becomes relevant.')
  }

  if (form.mobility.includes('cane') || form.mobility.includes('Wheelchair')) {
    score += 15
    reasons.push('Current mobility needs make accessibility works easier to justify.')
  } else if (form.mobility.includes('balance')) {
    score += 10
    reasons.push('Balance or mobility concerns support a prevention-led safety case.')
  }

  if (form.needs.some((need) => ['Bathroom safety', 'Entrance access', 'Stairs or handrails', 'Door widening'].includes(need))) {
    score += 13
    reasons.push('The selected work types are common accessibility grant categories.')
  } else if (form.needs.length > 0) {
    score += 8
    reasons.push('The selected safety needs can still support a home adaptation review.')
  }

  if (form.ownership === 'Owner occupied' || form.ownership === 'Owned by family') {
    score += 8
    reasons.push('Owner or family ownership usually makes permissions and documentation simpler.')
  } else if (form.ownership === 'Rented home') {
    score += 3
    reasons.push('A rented home may still be possible, but landlord permission will likely be needed.')
    documents.push('Landlord authorisation, if the home is rented.')
  } else if (form.ownership === 'Community building works') {
    score += 6
    reasons.push('Community building works may need building community approval before filing.')
    documents.push('Community approval or meeting minutes if shared building works are involved.')
  }

  if (form.timeline === 'As soon as possible' || form.timeline === 'Within 1 month') {
    score += 5
    reasons.push('A near-term timeline helps CasaMia prioritise call deadlines and document prep.')
  }

  const readiness = Math.min(96, score)
  const baseNextSteps = [
    'Confirm whether a relevant call is open for the postcode and autonomous community.',
    'Review photos and define which works are accessibility, safety, or smart-home support.',
    'Prepare a clean document checklist before any application is filed.',
  ]

  if (readiness >= 72) {
    return {
      title: 'Strong grant match',
      summary:
        'The answers show several common eligibility signals. CasaMia should now verify the active regional route and prepare the documentation package.',
      score: readiness,
      tone: 'strong',
      reasons,
      documents,
      nextSteps: baseNextSteps,
    }
  }

  if (readiness >= 46) {
    return {
      title: 'Needs regional review',
      summary:
        'There are useful signals, but the grant route depends on region, permissions, and whether the adaptation is classified correctly.',
      score: readiness,
      tone: 'review',
      reasons,
      documents,
      nextSteps: baseNextSteps,
    }
  }

  return {
    title: 'Safety plan first, grant watch next',
    summary:
      'There may not be enough information yet for a strong grant match. CasaMia can still build a safety plan and monitor suitable calls.',
    score: readiness,
    tone: 'watch',
    reasons,
    documents,
    nextSteps: [
      'Start with a free home safety assessment so the work scope is clear.',
      'Collect missing resident or property details only if a funding route requires them.',
      'Keep the lead on a regional grant watch list for future calls.',
    ],
  }
}

function buildReportSummary(form: FormState, result: Result) {
  return [
    `CasaMia grant-readiness report`,
    `Result: ${result.title} (${result.score}% readiness)`,
    `Region: ${form.region || 'Not provided'} | Postcode: ${form.postcode || 'Not provided'}`,
    `Home: ${form.homeType || 'Not provided'} | Ownership: ${form.ownership || 'Not provided'}`,
    `Resident: ${form.residentAge || 'Not provided'} | Mobility: ${form.mobility || 'Not provided'}`,
    `Status: ${form.recognisedStatus || 'Not provided'}`,
    `Needs: ${form.needs.length > 0 ? form.needs.join(', ') : 'Not provided'}`,
    `Timeline: ${form.timeline || 'Not provided'}`,
    `Contact: ${form.name || 'Not provided'} | ${form.phone || 'No phone'} | ${form.email || 'No email'} | ${form.contactPreference}`,
    ``,
    result.summary,
  ].join('\n')
}
