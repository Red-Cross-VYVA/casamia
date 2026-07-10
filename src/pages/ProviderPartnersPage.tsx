import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bath,
  Building2,
  CheckCircle2,
  Copy,
  Download,
  HeartHandshake,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  Wrench,
  Zap,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'

import {
  providerOnboardingSteps,
  providerCityOpportunities,
  providerEnablementResources,
  providerExpertisePillars,
  providerMarketingAssets,
  providerMarketingRules,
  providerMarketSignals,
  providerPartnerPaths,
  providerPriorityCities,
  providerProgrammeBenefits,
  providerQualityStandards,
  providerTrades,
} from '../constants/providerPartnership'
import { submitProviderApplication, type ProviderApplicationInput } from '../services/providerApplications'

type ProviderFormValues = ProviderApplicationInput

const initialValues: ProviderFormValues = {
  availability: '',
  businessName: '',
  cities: [],
  contactName: '',
  email: '',
  experience: '',
  insuranceConfirmed: false,
  phone: '',
  trades: [],
  website: '',
}

const partnerPathIcons = [Wrench, Bath, Lightbulb, Zap, UsersRound, HeartHandshake]
const marketingAssetIcons = [Award, BadgeCheck, Mail, Megaphone, Download, Copy]

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function createPartnerBadgeSvg(title: string, subtitle: string, accent: 'blue' | 'green' = 'green') {
  const accentColor = accent === 'green' ? '#7DB841' : '#1F6A98'

  return `<svg width="900" height="420" viewBox="0 0 900 420" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="900" height="420" rx="42" fill="${accentColor}"/>
  <rect x="26" y="26" width="848" height="368" rx="32" fill="#FFFFFF"/>
  <rect x="52" y="52" width="796" height="316" rx="26" fill="#EAF5FC"/>
  <rect x="52" y="52" width="796" height="88" rx="26" fill="#071F3A"/>
  <text x="84" y="109" fill="#FFFFFF" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="700">Casa</text>
  <text x="197" y="109" fill="#3A9FD4" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="700">Mia</text>
  <text x="705" y="103" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="2">PARTNER NETWORK</text>
  <circle cx="158" cy="236" r="72" fill="#FFFFFF"/>
  <path d="M158 151L212 174V218C212 263 187 292 158 306C129 292 104 263 104 218V174L158 151Z" fill="${accentColor}"/>
  <path d="M130 226L151 247L190 201" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="270" y="218" fill="#071F3A" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="700">${title}</text>
  <text x="272" y="263" fill="#1F6A98" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800">${subtitle}</text>
  <text x="272" y="305" fill="#344154" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="600">Senior home-safety projects coordinated through CasaMia.</text>
  <text x="272" y="332" fill="#344154" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="600">Provider remains an independent business.</text>
</svg>`
}

function createMarketingAssetContent(title: string) {
  if (title.includes('Email')) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-family: Arial, Helvetica, sans-serif; color:#071F3A;">
  <tr>
    <td style="border-left:4px solid #7DB841; padding-left:14px;">
      <div style="font-size:18px; font-weight:800;">[Provider Name]</div>
      <div style="font-size:13px; color:#344154; margin-top:2px;">CasaMia approved collaborator</div>
      <div style="font-size:12px; color:#1F6A98; font-weight:700; margin-top:8px;">Senior home-safety projects coordinated through CasaMia</div>
      <div style="font-size:11px; color:#667085; margin-top:6px;">Independent provider. No direct customer payment requests.</div>
    </td>
  </tr>
</table>`
  }

  if (title.includes('Social')) {
    return `We are pleased to collaborate with CasaMia on senior home-safety projects.

CasaMia coordinates resident-centred assessments, practical adaptation plans and family handover. Our role is to help deliver careful local work for older people who want to live more safely at home.

#SeniorSafety #AgeingAtHome #HomeAdaptations #CasaMia`
  }

  if (title.includes('Website')) {
    return `We collaborate with CasaMia on selected senior home-safety projects. CasaMia coordinates the customer journey, project brief and family communication, while our team supports local delivery within agreed scope and safety standards.`
  }

  if (title.includes('Window')) {
    return createPartnerBadgeSvg('CasaMia collaborator', 'Senior home-safety provider', 'green')
  }

  if (title.includes('Senior')) {
    return createPartnerBadgeSvg('Senior home-safety partner', 'In collaboration with CasaMia', 'green')
  }

  return createPartnerBadgeSvg('CasaMia approved collaborator', 'Senior home-safety network', 'green')
}

function downloadMarketingAsset(title: string, format: string) {
  const content = createMarketingAssetContent(title)
  const isSvg = format.includes('SVG')
  const isHtml = format.includes('HTML')
  const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const blob = new Blob([content], {
    type: isSvg ? 'image/svg+xml;charset=utf-8' : isHtml ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `casamia-${safeName}.${isSvg ? 'svg' : isHtml ? 'html' : 'txt'}`
  link.click()
  URL.revokeObjectURL(url)
}

function getMarketingAssetVariant(title: string) {
  if (title.includes('Senior')) return 'senior'
  if (title.includes('Email')) return 'email'
  if (title.includes('Social')) return 'social'
  if (title.includes('Window')) return 'sticker'
  if (title.includes('Website')) return 'website'
  return 'seal'
}

export function ProviderPartnersPage() {
  const [values, setValues] = useState<ProviderFormValues>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submissionMessage, setSubmissionMessage] = useState('')

  useEffect(() => {
    document.title = 'Provider Partnership Programme | CasaMia'
  }, [])

  function updateValue<Field extends keyof ProviderFormValues>(field: Field, value: ProviderFormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setSubmissionMessage('')
  }

  function toggleListValue(field: 'cities' | 'trades', value: string) {
    setValues((current) => {
      const selected = current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value]

      return { ...current, [field]: selected }
    })
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (!values.businessName.trim()) nextErrors.businessName = 'Enter your business name.'
    if (!values.contactName.trim()) nextErrors.contactName = 'Enter the main contact name.'
    if (!values.email.trim()) nextErrors.email = 'Enter an email address.'
    if (values.email.trim() && !isValidEmail(values.email)) nextErrors.email = 'Enter a valid email address.'
    if (!values.phone.trim()) nextErrors.phone = 'Enter a phone number.'
    if (values.cities.length === 0) nextErrors.cities = 'Select at least one city or coverage area.'
    if (values.trades.length === 0) nextErrors.trades = 'Select at least one service type.'
    if (!values.experience.trim()) nextErrors.experience = 'Tell us briefly about your relevant experience.'
    if (!values.insuranceConfirmed) nextErrors.insuranceConfirmed = 'Confirm that insurance can be evidenced.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    const result = await submitProviderApplication(values)
    if (!result.ok) {
      setSubmissionMessage(result.reason)
      return
    }

    setValues(initialValues)
    setSubmissionMessage(
      result.storedInBackend
        ? `Application ${result.application.id} submitted. CasaMia will review your fit and city coverage.`
        : `Application ${result.application.id} saved locally for review. Connect VITE_PROVIDER_APPLICATION_API_URL before using this as a live application inbox.`,
    )
  }

  return (
    <>
      <section className="provider-hero">
        <div className="site-shell provider-hero-grid">
          <div>
            <p className="eyebrow">Provider partnership programme</p>
            <h1>Join the senior home-safety market before it becomes crowded.</h1>
            <p>
              CasaMia combines senior-focused assessment, practical home adaptations, smart safety and family handover
              into one coordinated service. We are building the trusted provider network behind that experience across
              Spain&apos;s main cities.
            </p>
            <div className="provider-hero-proof">
              <span>
                <TrendingUp size={18} aria-hidden="true" />
                Growing ageing-at-home demand
              </span>
              <span>
                <ShieldCheck size={18} aria-hidden="true" />
                Senior-specific safety standards
              </span>
              <span>
                <MapPin size={18} aria-hidden="true" />
                City-by-city rollout
              </span>
            </div>
            <div className="provider-hero-actions">
              <a className="btn btn-green" href="#provider-registration">
                Apply to collaborate
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              <a className="btn btn-white" href="#provider-standards">
                View standards
              </a>
            </div>
          </div>
          <aside className="provider-hero-panel">
            <Building2 size={34} aria-hidden="true" />
            <h2>A category built for specialist providers</h2>
            <p>
              Families do not only need a product installed. They need someone who understands older residents,
              mobility, dignity, risk, trust and the anxiety that comes with changing a parent&apos;s home.
            </p>
            <div className="provider-city-strip">
              {providerPriorityCities.slice(0, 6).map((city) => (
                <span key={city}>{city}</span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="provider-market-section section-pad">
        <div className="site-shell">
          <div className="provider-section-heading">
            <p className="eyebrow">Market opportunity</p>
            <h2 className="display-title">Senior home safety is becoming a mainstream service category.</h2>
            <p>
              Spain has an ageing population, families are trying to keep parents independent at home for longer, and
              homes often need practical adaptations before a crisis happens. CasaMia turns that need into a repeatable,
              professional workflow for local providers.
            </p>
          </div>
          <div className="provider-market-grid">
            {providerMarketSignals.map((signal) => (
              <article key={signal.value}>
                <strong>{signal.value}</strong>
                <p>{signal.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell provider-two-column">
          <div>
            <p className="eyebrow">CasaMia expertise</p>
            <h2 className="display-title">We understand the senior space, not just installation work.</h2>
            <p>
              Good providers already know their trade. CasaMia adds the senior-specific layer: resident context,
              family communication, safety priorities, installation acceptance and follow-up.
            </p>
          </div>
          <div className="provider-expertise-grid">
            {providerExpertisePillars.map((pillar) => (
              <article key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell provider-benefit-grid">
          {providerProgrammeBenefits.map((benefit) => (
            <article className="provider-benefit-card" key={benefit.title}>
              <BadgeCheck size={25} aria-hidden="true" />
              <h2>{benefit.title}</h2>
              <p>{benefit.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad bg-light-blue">
        <div className="site-shell">
          <div className="provider-section-heading">
            <p className="eyebrow">Partner profiles</p>
            <h2 className="display-title">Multiple ways to collaborate.</h2>
            <p>
              CasaMia needs dependable specialists across the practical services that make older homes easier and safer
              to use every day.
            </p>
          </div>
          <div className="provider-path-grid">
            {providerPartnerPaths.map((path, index) => {
              const Icon = partnerPathIcons[index] ?? Wrench

              return (
                <article key={path.title}>
                  <Icon size={24} aria-hidden="true" />
                  <h3>{path.title}</h3>
                  <p>{path.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell provider-two-column">
          <div>
            <p className="eyebrow">Tools and resources</p>
            <h2 className="display-title">We help collaborators deliver excellent work.</h2>
            <p>
              CasaMia is not just a source of leads. We support partners with the structure, context and resources they
              need to do careful work in older people&apos;s homes, communicate clearly with families and leave every
              project properly documented.
            </p>
          </div>
          <div className="provider-enable-grid">
            {providerEnablementResources.map((resource) => (
              <article key={resource.title}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <div>
                  <h3>{resource.title}</h3>
                  <p>{resource.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="provider-marketing-section section-pad">
        <div className="site-shell">
          <div className="provider-section-heading">
            <p className="eyebrow">Marketing kit</p>
            <h2 className="display-title">Help providers turn collaboration into local trust.</h2>
            <p>
              Approved collaborators can use CasaMia partner materials to show they work in a specialist senior-safety
              network. The goal is simple: help good providers look more credible, win the right kind of work and
              explain the relationship clearly.
            </p>
          </div>

          <div className="provider-marketing-grid">
            {providerMarketingAssets.map((asset, index) => {
              const Icon = marketingAssetIcons[index] ?? BadgeCheck
              const variant = getMarketingAssetVariant(asset.title)

              return (
                <article key={asset.title}>
                  <div className={`provider-marketing-preview is-${variant}`}>
                    {variant === 'seal' || variant === 'senior' || variant === 'sticker' ? (
                      <div className="provider-brand-sample">
                        <div className="provider-brand-topline">
                          <span>Casa</span>
                          <span>Mia</span>
                        </div>
                        <div className="provider-brand-mark">
                          <ShieldCheck size={30} aria-hidden="true" />
                        </div>
                        <strong>
                          {variant === 'senior'
                            ? 'Senior home-safety partner'
                            : variant === 'sticker'
                              ? 'CasaMia collaborator'
                              : 'Approved collaborator'}
                        </strong>
                        <small>{variant === 'sticker' ? 'Vehicle / window decal' : 'Trusted local delivery'}</small>
                      </div>
                    ) : variant === 'email' ? (
                      <div className="provider-signature-preview">
                        <strong>Provider Name</strong>
                        <span>CasaMia approved collaborator</span>
                        <small>Senior home-safety projects coordinated through CasaMia</small>
                      </div>
                    ) : variant === 'social' ? (
                      <div className="provider-social-preview">
                        <span>New collaboration</span>
                        <strong>Working with CasaMia on senior home-safety projects</strong>
                        <small>#AgeingAtHome #HomeAdaptations</small>
                      </div>
                    ) : variant === 'website' ? (
                      <div className="provider-website-preview">
                        <span>In collaboration with</span>
                        <strong>
                          Casa<span>Mia</span>
                        </strong>
                        <small>Resident-centred assessment, practical adaptation and family handover.</small>
                      </div>
                    ) : (
                      <Icon size={30} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p className="provider-marketing-format">{asset.format}</p>
                    <h3>{asset.title}</h3>
                    <p>{asset.body}</p>
                    <span>{asset.usage}</span>
                  </div>
                  <button className="btn btn-white" type="button" onClick={() => downloadMarketingAsset(asset.title, asset.format)}>
                    Download sample
                    <Download size={18} aria-hidden="true" />
                  </button>
                </article>
              )
            })}
          </div>

          <aside className="provider-marketing-rules">
            <h3>Usage rules</h3>
            <div>
              {providerMarketingRules.map((rule) => (
                <p key={rule}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {rule}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section-pad bg-light-blue" id="provider-standards">
        <div className="site-shell provider-two-column">
          <div>
            <p className="eyebrow">How collaboration works</p>
            <h2 className="display-title">Clear standards, respectful work, better handovers.</h2>
            <p>
              Providers remain independent businesses, but customer work is coordinated through CasaMia. Installers and
              subcontractors must not request direct customer payments or approve paid scope changes independently.
            </p>
          </div>
          <div className="provider-list-card">
            {providerQualityStandards.map((standard) => (
              <p key={standard}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {standard}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell provider-two-column">
          <div className="provider-step-list">
            {providerOnboardingSteps.map((step, index) => (
              <article key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
          <div>
            <p className="eyebrow">Coverage focus</p>
            <h2 className="display-title">Main city coverage first.</h2>
            <p>
              CasaMia is prioritising strong provider coverage in major cities and surrounding areas, then expanding
              once service quality and response times are reliable.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad provider-city-section">
        <div className="site-shell">
          <div className="provider-section-heading">
            <p className="eyebrow">City opportunity</p>
            <h2 className="display-title">Early partners can help define local coverage.</h2>
            <p>
              The first strong partners in each city help CasaMia understand response times, typical property layouts,
              trade depth and where families need the most support.
            </p>
          </div>
          <div className="provider-city-grid">
            {providerCityOpportunities.map((opportunity) => (
              <article key={opportunity.city}>
                <div>
                  <strong>{opportunity.city}</strong>
                  <span>{opportunity.status}</span>
                </div>
                <p>{opportunity.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad provider-registration-section" id="provider-registration">
        <div className="site-shell provider-registration-layout">
          <div>
            <p className="eyebrow">Self-registration</p>
            <h2 className="display-title">Apply to join the provider network.</h2>
            <p>
              Share basic company details, coverage and service types. CasaMia will review fit before assigning any
              customer work.
            </p>
          </div>

          <form className="provider-registration-form" onSubmit={handleSubmit}>
            <ProviderField error={errors.businessName} label="Business name">
              <input value={values.businessName} onChange={(event) => updateValue('businessName', event.target.value)} />
            </ProviderField>
            <ProviderField error={errors.contactName} label="Main contact">
              <input value={values.contactName} onChange={(event) => updateValue('contactName', event.target.value)} />
            </ProviderField>
            <ProviderField error={errors.email} label="Email address">
              <input type="email" value={values.email} onChange={(event) => updateValue('email', event.target.value)} />
            </ProviderField>
            <ProviderField error={errors.phone} label="Phone number">
              <input value={values.phone} onChange={(event) => updateValue('phone', event.target.value)} />
            </ProviderField>
            <ProviderField label="Website or profile">
              <input value={values.website} onChange={(event) => updateValue('website', event.target.value)} />
            </ProviderField>
            <ProviderField label="Typical availability">
              <input
                placeholder="Example: weekdays, emergency callouts, 2-week lead time"
                value={values.availability}
                onChange={(event) => updateValue('availability', event.target.value)}
              />
            </ProviderField>

            <fieldset className="provider-choice-group">
              <legend>Coverage cities *</legend>
              <div>
                {providerPriorityCities.map((city) => (
                  <label key={city}>
                    <input
                      checked={values.cities.includes(city)}
                      type="checkbox"
                      onChange={() => toggleListValue('cities', city)}
                    />
                    <MapPin size={15} aria-hidden="true" />
                    {city}
                  </label>
                ))}
              </div>
              {errors.cities ? <small>{errors.cities}</small> : null}
            </fieldset>

            <fieldset className="provider-choice-group">
              <legend>Services offered *</legend>
              <div>
                {providerTrades.map((trade) => (
                  <label key={trade}>
                    <input
                      checked={values.trades.includes(trade)}
                      type="checkbox"
                      onChange={() => toggleListValue('trades', trade)}
                    />
                    <ShieldCheck size={15} aria-hidden="true" />
                    {trade}
                  </label>
                ))}
              </div>
              {errors.trades ? <small>{errors.trades}</small> : null}
            </fieldset>

            <ProviderField error={errors.experience} label="Relevant experience">
              <textarea
                rows={4}
                value={values.experience}
                onChange={(event) => updateValue('experience', event.target.value)}
              />
            </ProviderField>

            <label className="provider-confirmation">
              <input
                checked={values.insuranceConfirmed}
                type="checkbox"
                onChange={(event) => updateValue('insuranceConfirmed', event.target.checked)}
              />
              <span>I can provide insurance, trading details and references if CasaMia requests them.</span>
            </label>
            {errors.insuranceConfirmed ? <small className="provider-error">{errors.insuranceConfirmed}</small> : null}

            {submissionMessage ? <p className="provider-submission-message">{submissionMessage}</p> : null}

            <button className="btn btn-green" type="submit">
              Submit provider application
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

function ProviderField({
  children,
  error,
  label,
}: {
  children: ReactNode
  error?: string
  label: string
}) {
  return (
    <label className="provider-field">
      <span>{label}</span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  )
}
