import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Home,
  Lightbulb,
  LoaderCircle,
  LocateFixed,
  Mail,
  PhoneCall,
  ShieldCheck,
  SmilePlus,
  Stethoscope,
  UserRound,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { AssessmentForm } from '../components/AssessmentForm'
import { PhoneNumberField } from '../components/PhoneNumberField'
import { SelfInspectionTool } from '../components/SelfInspectionTool'
import { TrustBar } from '../components/TrustBar'
import { casamiaCompanyConfig } from '../config/company'
import { getContractLanguageForLocale } from '../config/legalControls'
import type { PlanId } from '../constants/shopify'
import { buildCheckoutDocumentSet, downloadTextDocument, type CheckoutDownloadDocument } from '../services/contractDocuments'
import { submitConsentEvidence, type ConsentEvidencePayload } from '../services/consentEvidence'
import { trackEvent } from '../utils/analytics'
import { isValidSpanishPhoneNumber } from '../utils/phone'

type BenefitItem = {
  title: string
  body: string
}

type IncludedItem = {
  title: string
  body: string
}

type StepItem = {
  title: string
  body: string
}

type PricingCopy = {
  title: string
  feeLabel: string
  fee: string
  body: string
  points: string[]
}

type CheckoutValues = {
  address: string
  city: string
  postcode: string
  province: string
  name: string
  phone: string
  email: string
  preferredTiming: string
  notes: string
  paymentMethod: 'card' | 'bank-transfer' | 'paypal'
  contractAccepted: boolean
  earlyStartRequested: boolean
  marketingConsent: boolean
  photoConsent: boolean
  fullExecutionAcknowledged: boolean
  personalisedGoodsAcknowledged: boolean
}

const benefitIcons = [ShieldCheck, SmilePlus, Home, Stethoscope, ClipboardCheck, UsersRound]
const checkoutPlanValues = new Set(['essential', 'advanced', 'premium'])
const paymentMethodLabels: Record<CheckoutValues['paymentMethod'], string> = {
  card: 'Credit card',
  'bank-transfer': 'Bank transfer',
  paypal: 'PayPal',
}
const checkoutPlanSummaries: Record<PlanId, { price: string; body: string; points: string[] }> = {
  essential: {
    price: '€269',
    body: 'Focused practical upgrades for entrance, living areas, and stairs.',
    points: ['Assessment visit credited toward package', 'Main movement areas covered', 'Grant guidance included'],
  },
  advanced: {
    price: '€1,149',
    body: 'Room-by-room safety adaptations with smart access and emergency support.',
    points: ['Bathroom, kitchen, entrance, and stairs', 'Emergency call and smart access support', 'Installation coordination included'],
  },
  premium: {
    price: '€1,449',
    body: 'Full smart safety, monitoring, and family reassurance across the home.',
    points: ['Everything in Advanced', 'Health, fall, and alert setup', 'Smart handover and user training'],
  },
}

function parseEuroPrice(value: string) {
  return Number.parseFloat(value.replace(/[^\d.]/g, '')) || 0
}

function formatEuroAmount(value: number) {
  return new Intl.NumberFormat('en-IE', {
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    style: 'currency',
  }).format(value)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function FreeHomeSafetyAssessmentPage() {
  const { i18n, t } = useTranslation()
  const [searchParams] = useSearchParams()
  const benefits = t('assessment.benefits.items', { returnObjects: true }) as BenefitItem[]
  const included = t('assessment.included.items', { returnObjects: true }) as IncludedItem[]
  const steps = t('assessment.how.items', { returnObjects: true }) as StepItem[]
  const pricing = t('assessment.pricing', { returnObjects: true }) as PricingCopy
  const planOptions = t('assessment.form.planOptions', { returnObjects: true }) as Array<{
    value: string
    label: string
  }>
  const selectedPlanValue = searchParams.get('plan') ?? ''
  const isReportBookingFlow = searchParams.get('source') === 'free-report'
  const isSpanish = i18n.language.startsWith('es')
  const selectedPlanId = checkoutPlanValues.has(selectedPlanValue) ? (selectedPlanValue as PlanId) : null
  const isCheckoutFlow = Boolean(selectedPlanId)
  const selectedPlanLabel = useMemo(
    () => planOptions.find((option) => option.value === selectedPlanValue)?.label ?? 'CasaMia package',
    [planOptions, selectedPlanValue],
  )
  const selectedPlanSummary = selectedPlanId ? checkoutPlanSummaries[selectedPlanId] : undefined

  useEffect(() => {
    document.title = `${t('assessment.metaTitle')} | CasaMia`
  }, [t])

  useEffect(() => {
    if (!isReportBookingFlow) {
      return
    }

    window.requestAnimationFrame(() => {
      document.getElementById('assessment-form')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }, [isReportBookingFlow])

  return (
    <>
      <section className="assessment-hero">
        <div className="assessment-hero-grid site-shell">
          <div>
            <h1>
              {isCheckoutFlow
                ? `Finalize your ${selectedPlanLabel} order`
                : isReportBookingFlow
                  ? isSpanish
                    ? 'Coordina tu evaluación a domicilio'
                    : 'Coordinate your in-home assessment'
                  : t('assessment.hero.title')}
            </h1>
            <p>
              {isCheckoutFlow
                ? 'Review your package, add the home address and contact details, then continue to online payment or ask CasaMia to help you finish.'
                : isReportBookingFlow
                  ? isSpanish
                    ? 'Ya has completado el informe gratuito. Elige el mejor canal y horario para que CasaMia coordine la visita.'
                    : 'You have completed the free report. Choose the best way and time for CasaMia to coordinate the visit.'
                : t('assessment.hero.subtitle')}
            </p>
            <div className="assessment-hero-actions">
              <a className="btn btn-green" href="#assessment-form">
                {isCheckoutFlow ? 'Start order' : t('assessment.hero.cta')}
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              {isCheckoutFlow ? null : (
                <a className="btn btn-white" href="/#top">
                  {t('assessment.hero.secondaryCta')}
                </a>
              )}
              <span>{t('assessment.hero.reassurance')}</span>
            </div>
          </div>

          <aside className={`assessment-hero-panel ${isCheckoutFlow ? 'is-order-summary' : ''}`}>
            <span>
              <Lightbulb size={26} aria-hidden="true" />
            </span>
            <h2>{isCheckoutFlow ? selectedPlanLabel : t('assessment.hero.panelTitle')}</h2>
            <p>{isCheckoutFlow ? selectedPlanSummary?.body : t('assessment.hero.panelBody')}</p>
            <div className="assessment-fee-card">
              <WalletCards size={24} aria-hidden="true" />
              <div>
                <small>{isCheckoutFlow ? 'Package estimate' : pricing.feeLabel}</small>
                <strong>{isCheckoutFlow ? selectedPlanSummary?.price : pricing.fee}</strong>
              </div>
            </div>
            <ul>
              {(isCheckoutFlow ? selectedPlanSummary?.points ?? [] : included.slice(0, 3).map((item) => item.title)).map((item) => (
                <li key={item}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <TrustBar />

      {isCheckoutFlow ? (
        <section className="assessment-checkout section-pad">
          <div className="assessment-checkout-layout site-shell">
            <aside className="assessment-checkout-summary" aria-label="Selected order summary">
              <p className="eyebrow">Selected package</p>
              <h2>{selectedPlanLabel}</h2>
              <strong>{selectedPlanSummary?.price}</strong>
              <p>{selectedPlanSummary?.body}</p>
              <div className="assessment-checkout-next">
                <span>Next step</span>
                <p>Check the package, enter address and contact details, then continue to secure online payment.</p>
              </div>
              <ul>
                <li>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Online payment step included
                </li>
                <li>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Address and contact details captured first
                </li>
                <li>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Help option available before payment
                </li>
              </ul>
            </aside>
            {selectedPlanId && selectedPlanSummary ? (
              <OrderCheckoutWizard
                planId={selectedPlanId}
                planLabel={selectedPlanLabel}
                planSummary={selectedPlanSummary}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="assessment-pricing-strip">
        <div className="assessment-pricing-panel site-shell">
          <div>
            <p className="eyebrow">{pricing.feeLabel}</p>
            <h2>{pricing.title}</h2>
            <p>{pricing.body}</p>
          </div>
          <ul>
            {pricing.points.map((point) => (
              <li key={point}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="assessment-benefits section-pad">
        <div className="site-shell">
          <div className="assessment-section-heading">
            <h2 className="display-title">{t('assessment.benefits.title')}</h2>
          </div>
          <div className="assessment-benefit-grid mt-12">
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[index] ?? ShieldCheck

              return (
                <article className="assessment-benefit-card" key={benefit.title}>
                  <span>
                    <Icon size={25} aria-hidden="true" />
                  </span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <SelfInspectionTool />

      <section className="assessment-how section-pad">
        <div className="site-shell">
          <div className="assessment-section-heading">
            <h2 className="display-title">{t('assessment.how.title')}</h2>
          </div>
          <div className="assessment-step-grid mt-12">
            {steps.map((step, index) => (
              <article className="assessment-step-card" key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="assessment-form-section section-pad">
        <div className="assessment-form-layout site-shell">
          <div className="assessment-form-copy">
            <h2 className="display-title">
              {isReportBookingFlow
                ? isSpanish
                  ? 'Elige cómo debe coordinar CasaMia la visita'
                  : 'Choose how CasaMia should coordinate the visit'
                : t('assessment.formSection.title')}
            </h2>
            <p>
              {isReportBookingFlow
                ? isSpanish
                  ? 'No hace falta repetir todo el formulario. Indica el canal y horario más cómodo para que el equipo confirme tu evaluación a domicilio.'
                  : 'No need to repeat the full contact form. Tell us the best contact channel and timing so the team can confirm your in-home assessment.'
                : t('assessment.formSection.body')}
            </p>
          </div>
          {isCheckoutFlow ? (
            <div className="assessment-form-return-card">
              <h3>Need to change package?</h3>
              <p>You can review the full comparison or use the selected package form above.</p>
              <a className="btn btn-navy" href="/plans">
                Review plans
                <ArrowRight size={20} aria-hidden="true" />
              </a>
            </div>
          ) : (
            <AssessmentForm mode={isReportBookingFlow ? 'booking' : 'default'} />
          )}
        </div>
      </section>

      <section className="assessment-final-cta">
        <div className="site-shell">
          <div className="assessment-final-panel">
            <h2>{t('assessment.final.title')}</h2>
            <a className="btn btn-green" href="#assessment-form">
              {t('assessment.hero.cta')}
              <ArrowRight size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

function OrderCheckoutWizard({
  planId,
  planLabel,
  planSummary,
}: {
  planId: PlanId
  planLabel: string
  planSummary: { price: string; body: string; points: string[] }
}) {
  const steps = ['Review', 'Address', 'Contact', 'Payment']
  const { i18n } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [consentEvidenceMessage, setConsentEvidenceMessage] = useState('')
  const [isDetectingAddress, setIsDetectingAddress] = useState(false)
  const [addressDetectionMessage, setAddressDetectionMessage] = useState('')
  const [downloadDocuments, setDownloadDocuments] = useState<CheckoutDownloadDocument[]>([])
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [values, setValues] = useState<CheckoutValues>({
    address: '',
    city: '',
    postcode: '',
    province: '',
    name: '',
    phone: '',
    email: '',
    preferredTiming: '',
    notes: '',
    paymentMethod: 'card',
    contractAccepted: false,
    earlyStartRequested: false,
    marketingConsent: false,
    photoConsent: false,
    fullExecutionAcknowledged: false,
    personalisedGoodsAcknowledged: false,
  })
  const totalAmount = parseEuroPrice(planSummary.price)
  const initialPayment = totalAmount / 2
  const remainingPayment = totalAmount / 2
  const contractLanguage = getContractLanguageForLocale(i18n.language)
  const contractLanguageMoved = contractLanguage !== i18n.language
  const fullExecutionConsentRelevant = false
  const personalisedGoodsItem = ''
  const personalisedGoodsConsentRelevant = Boolean(personalisedGoodsItem)

  function updateValue<Field extends keyof CheckoutValues>(field: Field, value: CheckoutValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({
      ...current,
      [field]: '',
      ...(field === 'phone' || field === 'email' ? { contact: '' } : {}),
    }))
    setConsentEvidenceMessage('')
    setAddressDetectionMessage('')
  }

  function validateEmailField(value = values.email) {
    const email = value.trim()

    if (!email) {
      setErrors((current) => ({ ...current, email: '' }))
      return true
    }

    if (!isValidEmail(email)) {
      setErrors((current) => ({ ...current, email: 'Enter a valid email address, for example name@email.com.' }))
      return false
    }

    setErrors((current) => ({ ...current, email: '' }))
    return true
  }

  function detectAddress() {
    if (!navigator.geolocation) {
      setAddressDetectionMessage('Location detection is not available in this browser. Please enter the address manually.')
      return
    }

    setIsDetectingAddress(true)
    setAddressDetectionMessage('Detecting your location...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${latitude}&lon=${longitude}`,
          )

          if (!response.ok) {
            throw new Error('Address lookup failed')
          }

          const result = (await response.json()) as {
            display_name?: string
            address?: Record<string, string | undefined>
          }
          const address = result.address ?? {}
          const street = [address.house_number, address.road ?? address.pedestrian ?? address.footway]
            .filter(Boolean)
            .join(' ')
          const city =
            address.city ??
            address.town ??
            address.village ??
            address.municipality ??
            address.county ??
            ''

          setValues((current) => ({
            ...current,
            address: street || result.display_name || `Detected location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            city,
            postcode: address.postcode ?? current.postcode,
            province: address.state ?? address.province ?? address.region ?? current.province,
          }))
          setErrors((current) => ({
            ...current,
            address: '',
            city: '',
            postcode: address.postcode ? '' : current.postcode ?? '',
          }))
          setAddressDetectionMessage(
            address.postcode
              ? 'Address detected. Please check it is the exact home address before continuing.'
              : 'Location detected. Please check the address and add the postcode before continuing.',
          )
        } catch {
          setValues((current) => ({
            ...current,
            address: current.address || `Detected location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          }))
          setAddressDetectionMessage(
            'Location detected, but we could not complete the address automatically. Please add the street, city, and postcode.',
          )
        } finally {
          setIsDetectingAddress(false)
        }
      },
      () => {
        setIsDetectingAddress(false)
        setAddressDetectionMessage('We could not access your location. Please enter the address manually.')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300000,
        timeout: 10000,
      },
    )
  }

  function validateStep(step = activeStep) {
    const nextErrors: Record<string, string> = {}

    if (step === 1) {
      if (!values.address.trim()) nextErrors.address = 'Enter the home address.'
      if (!values.city.trim()) nextErrors.city = 'Enter the city or area.'
      if (!values.postcode.trim()) nextErrors.postcode = 'Enter the postcode.'
    }

    if (step === 2) {
      if (!values.name.trim()) nextErrors.name = 'Enter your full name.'
      if (!values.phone.trim() && !values.email.trim()) nextErrors.contact = 'Enter a phone number or email.'
      if (values.phone.trim() && !isValidSpanishPhoneNumber(values.phone)) {
        nextErrors.phone = 'Enter a Spanish phone number with 9 digits.'
      }
      if (values.email.trim() && !isValidEmail(values.email)) nextErrors.email = 'Enter a valid email address.'
    }

    if (step === 3 && !values.contractAccepted) {
      nextErrors.contractAccepted = 'Review and accept the Project Order and General Customer Terms.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function goNext() {
    if (!validateStep()) {
      return
    }

    setActiveStep((current) => Math.min(current + 1, steps.length - 1))
  }

  function goBack() {
    setActiveStep((current) => Math.max(current - 1, 0))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateStep(1)) {
      setActiveStep(1)
      return
    }

    if (!validateStep(2)) {
      setActiveStep(2)
      return
    }

    if (!validateStep(3)) {
      setActiveStep(3)
      return
    }

    const orderId = `CM-${Date.now().toString(36).toUpperCase()}`
    const timestamp = new Date().toISOString()
    const consentPayloads: ConsentEvidencePayload[] = [
      {
        channel: 'checkout',
        consentType: 'contract-acceptance',
        contractLanguage,
        customerReference: values.email.trim() || values.phone.trim(),
        documentVersions: {
          generalTermsVersion: '1.0',
          projectOrderVersion: '1.0',
          withdrawalVersion: '1.0',
        },
        earlyStartRequested: values.earlyStartRequested,
        fullExecutionAcknowledged: fullExecutionConsentRelevant ? values.fullExecutionAcknowledged : undefined,
        locale: i18n.language,
        marketingConsent: values.marketingConsent,
        orderId,
        personalisedGoodsAcknowledgement: personalisedGoodsConsentRelevant
          ? { item: personalisedGoodsItem, acknowledged: values.personalisedGoodsAcknowledged }
          : undefined,
        photoTestimonialConsent: values.photoConsent,
        timestamp,
        wording:
          'I have reviewed and accept the Project Order and General Customer Terms, including the total price and the 50%/50% payment schedule.',
        wordingVersion: 'checkout-contract-acceptance-1.0',
      },
      ...(values.earlyStartRequested
        ? [
            {
              channel: 'checkout' as const,
              consentType: 'early-start' as const,
              contractLanguage,
              customerReference: values.email.trim() || values.phone.trim(),
              documentVersions: {
                generalTermsVersion: '1.0',
                projectOrderVersion: '1.0',
                withdrawalVersion: '1.0',
              },
              earlyStartRequested: true,
              locale: i18n.language,
              orderId,
              timestamp,
              wording:
                'I expressly request CasaMia to begin providing the service before my statutory withdrawal period has expired. I understand that if I withdraw after work has started, I may be required to pay the proportion of the service already provided.',
              wordingVersion: 'checkout-early-start-1.0',
            },
          ]
        : []),
    ]

    for (const payload of consentPayloads) {
      const result = await submitConsentEvidence(payload)
      if (!result.ok) {
        setConsentEvidenceMessage(
          `${result.reason} The order has not been confirmed because contractual consent evidence must be stored by a configured backend.`,
        )
        setActiveStep(3)
        return
      }
    }

    const orderDraft = {
      orderId,
      createdAt: new Date().toISOString(),
      status: 'New',
      planId,
      planLabel,
      planPrice: planSummary.price,
      address: values.address.trim(),
      city: values.city.trim(),
      postcode: values.postcode.trim(),
      province: values.province.trim(),
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      preferredTiming: values.preferredTiming,
      notes: values.notes.trim(),
      paymentMethod: values.paymentMethod,
    }
    const orderApiUrl = import.meta.env.VITE_ORDER_API_URL || (import.meta.env.PROD ? '/api/public/orders' : '')

    if (orderApiUrl) {
      const response = await fetch(orderApiUrl, {
        body: JSON.stringify(orderDraft),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok) {
        setConsentEvidenceMessage(`Order storage failed with ${response.status}. The order has not been confirmed.`)
        setActiveStep(3)
        return
      }
    }

    const existing = JSON.parse(localStorage.getItem('casamia_order_drafts') ?? '[]') as unknown[]
    localStorage.setItem('casamia_order_drafts', JSON.stringify([orderDraft, ...existing].slice(0, 20)))
    trackEvent('assessment_booking_completed', {
      mode: 'checkout',
      orderId,
      paymentMethod: values.paymentMethod,
      planId,
    })

    setDownloadDocuments(
      buildCheckoutDocumentSet(
        {
          address: values.address.trim(),
          city: values.city.trim(),
          contractLanguage,
          createdAt: orderDraft.createdAt,
          customerReference: values.email.trim() || values.phone.trim(),
          email: values.email.trim(),
          initialPayment: formatEuroAmount(initialPayment),
          name: values.name.trim(),
          orderId,
          paymentMethod: paymentMethodLabels[values.paymentMethod],
          phone: values.phone.trim(),
          planLabel,
          planPrice: planSummary.price,
          postcode: values.postcode.trim(),
          remainingPayment: formatEuroAmount(remainingPayment),
        },
        consentPayloads,
      ),
    )
    setOrderSubmitted(true)
  }

  if (orderSubmitted) {
    return (
      <section className="order-wizard-card order-wizard-confirmation" id="assessment-form">
        <CheckCircle2 size={44} aria-hidden="true" />
        <p className="eyebrow">Order received</p>
        <h2>{planLabel} order saved</h2>
        <p>
          We have saved the order details for {planSummary.price} with {paymentMethodLabels[values.paymentMethod]} as
          the preferred payment method. CasaMia will confirm the exact payment details before anything is processed.
        </p>
        <div className="order-payment-summary">
          <span>Package total</span>
          <strong>{planSummary.price}</strong>
          <p>Preferred payment method: {paymentMethodLabels[values.paymentMethod]}.</p>
        </div>
        <div className="order-document-downloads">
          <strong>Download your order documents</strong>
          <p>Keep a durable copy of the order, accepted quotation, withdrawal information, consent confirmations and payment confirmation.</p>
          <div>
            {downloadDocuments.map((document) => (
              <button className="btn btn-white" key={document.filename} type="button" onClick={() => downloadTextDocument(document)}>
                {document.title}
              </button>
            ))}
          </div>
        </div>
        <a
          className="btn btn-green"
          href={`mailto:hello@casamia.es?subject=${encodeURIComponent('Order follow-up')}&body=${encodeURIComponent(
            `Hello CasaMia, I have submitted my ${planLabel} order and selected ${paymentMethodLabels[values.paymentMethod]} for payment.`,
          )}`}
        >
          Contact CasaMia
          <ArrowRight size={20} aria-hidden="true" />
        </a>
      </section>
    )
  }

  return (
    <form className="order-wizard-card" id="assessment-form" onSubmit={handleSubmit}>
      <div className="order-wizard-progress" aria-label="Order progress">
        {steps.map((step, index) => (
          <button
            className={index === activeStep ? 'is-active' : index < activeStep ? 'is-complete' : ''}
            key={step}
            type="button"
            onClick={() => {
              if (index <= activeStep || validateStep()) {
                setActiveStep(index)
              }
            }}
          >
            <span>{index + 1}</span>
            {step}
          </button>
        ))}
      </div>

      {activeStep === 0 ? (
        <section className="order-wizard-step">
          <p className="eyebrow">Order details</p>
          <h2>Check your package</h2>
          <div className="order-wizard-review">
            <div>
              <span>Selected package</span>
              <strong>{planLabel}</strong>
              <p>{planSummary.body}</p>
            </div>
            <strong>{planSummary.price}</strong>
          </div>
          <ul className="order-wizard-checks">
            {planSummary.points.map((point) => (
              <li key={point}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {activeStep === 1 ? (
        <section className="order-wizard-step">
          <p className="eyebrow">Installation address</p>
          <h2>Where is the home?</h2>
          <div className="order-address-detector">
            <button type="button" onClick={detectAddress} disabled={isDetectingAddress}>
              {isDetectingAddress ? (
                <LoaderCircle className="order-address-detecting-icon" size={18} aria-hidden="true" />
              ) : (
                <LocateFixed size={18} aria-hidden="true" />
              )}
              {isDetectingAddress ? 'Detecting address...' : 'Use my current location'}
            </button>
            <p>
              We can fill the address from your browser location. You can edit every field before continuing.
            </p>
          </div>
          {addressDetectionMessage ? (
            <p className="order-address-detection-message">{addressDetectionMessage}</p>
          ) : null}
          <div className="order-wizard-fields">
            <WizardField error={errors.address} label="Street address" required>
              <input
                autoComplete="street-address"
                onChange={(event) => updateValue('address', event.target.value)}
                type="text"
                value={values.address}
              />
            </WizardField>
            <WizardField error={errors.city} label="City / area" required>
              <input
                autoComplete="address-level2"
                onChange={(event) => updateValue('city', event.target.value)}
                type="text"
                value={values.city}
              />
            </WizardField>
            <WizardField error={errors.postcode} label="Postcode" required>
              <input
                autoComplete="postal-code"
                onChange={(event) => updateValue('postcode', event.target.value)}
                type="text"
                value={values.postcode}
              />
            </WizardField>
            <WizardField label="Province / region">
              <input
                autoComplete="address-level1"
                onChange={(event) => updateValue('province', event.target.value)}
                type="text"
                value={values.province}
              />
            </WizardField>
          </div>
        </section>
      ) : null}

      {activeStep === 2 ? (
        <section className="order-wizard-step">
          <p className="eyebrow">Contact information</p>
          <h2>Who should we contact?</h2>
          <div className="order-contact-intro">
            <span>
              <UserRound size={22} aria-hidden="true" />
            </span>
            <div>
              <strong>Main order contact</strong>
              <p>Phone or email is required. Adding both helps us confirm the visit and payment details faster.</p>
            </div>
          </div>
          <div className="order-contact-grid">
            <WizardField error={errors.name} label="Full name" required wide>
              <input
                aria-invalid={Boolean(errors.name)}
                autoComplete="name"
                onChange={(event) => updateValue('name', event.target.value)}
                type="text"
                value={values.name}
              />
            </WizardField>
            <div className="order-contact-method-card">
              <span className="order-contact-method-icon">
                <PhoneCall size={19} aria-hidden="true" />
              </span>
              <PhoneNumberField
                className="order-wizard-field"
                error={errors.phone ?? errors.contact}
                helperText="Spanish number, 9 digits. Example: +34 600 000 000"
                label="Phone number"
                value={values.phone}
                onChange={(nextValue) => updateValue('phone', nextValue)}
              />
            </div>
            <div className="order-contact-method-card">
              <span className="order-contact-method-icon">
                <Mail size={19} aria-hidden="true" />
              </span>
              <WizardField error={errors.email ?? errors.contact} label="Email address">
                <input
                  aria-invalid={Boolean(errors.email ?? errors.contact)}
                  autoComplete="email"
                  inputMode="email"
                  onBlur={(event) => validateEmailField(event.target.value)}
                  onChange={(event) => updateValue('email', event.target.value)}
                  placeholder="name@email.com"
                  type="email"
                  value={values.email}
                />
              </WizardField>
            </div>
          </div>
          <div className="order-visit-preferences">
            <div>
              <span className="order-visit-preferences-label">Preferred timing</span>
              <div className="order-timing-options" role="group" aria-label="Preferred timing">
                {['Weekday morning', 'Weekday afternoon', 'Evening', 'Flexible'].map((option) => (
                  <button
                    className={values.preferredTiming === option ? 'is-active' : ''}
                    key={option}
                    type="button"
                    onClick={() => updateValue('preferredTiming', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <WizardField label="Access notes">
              <textarea
                onChange={(event) => updateValue('notes', event.target.value)}
                placeholder="Gate code, parking, lift access, best person to ask for..."
                rows={3}
                value={values.notes}
              />
            </WizardField>
          </div>
        </section>
      ) : null}

      {activeStep === 3 ? (
        <section className="order-wizard-step">
          <p className="eyebrow">Payment method</p>
          <h2>Confirm order and 50% payment</h2>
          <div className="order-legal-summary">
            <div>
              <span>Contracting party</span>
              <strong>{casamiaCompanyConfig.legalName}</strong>
              <p>
                CasaMia is your contracting party, collects customer payments, coordinates the project and remains
                responsible for the subcontracted installation.
              </p>
            </div>
            <div>
              <span>Payment schedule</span>
              <strong>
                {formatEuroAmount(initialPayment)} now / {formatEuroAmount(remainingPayment)} after installation
              </strong>
              <p>The first 50% is a payment on account, not an automatically non-refundable deposit.</p>
            </div>
            <div>
              <span>Contract language</span>
              <strong>{contractLanguage === 'es' ? 'Spanish' : contractLanguage.toUpperCase()}</strong>
              <p>
                {contractLanguageMoved
                  ? 'Your interface language is not yet an approved contract language, so the contractual documents are presented in Spanish.'
                  : 'This contract and its associated project documents will be concluded in Spanish.'}
              </p>
            </div>
          </div>
          <div className="order-provider-warning">
            <strong>Never pay an installer directly.</strong>
            <p>
              CasaMia technicians and subcontractors are not authorised to request cash, deposits, tips or payments for
              additional work. Any change requires written approval from CasaMia and the customer before work is done.
            </p>
          </div>
          <div className="order-installation-definition">
            <strong>Successful installation means:</strong>
            <p>
              Installation is considered successfully completed when the essential agreed work has been completed, the
              applicable functional and safety checks have been passed, the work area has been left safe and reasonably
              clean, the customer has received the relevant instructions, and no material defect prevents the safe
              intended use of the installation.
            </p>
            <p>
              Signing the installation record does not remove your statutory guarantee rights or prevent you from
              reporting hidden defects.
            </p>
          </div>
          <div className="order-payment-options">
            <label className={values.paymentMethod === 'card' ? 'is-active' : ''}>
              <input
                checked={values.paymentMethod === 'card'}
                name="paymentMethod"
                onChange={() => updateValue('paymentMethod', 'card')}
                type="radio"
              />
              <span>
                <strong>Credit card</strong>
                Save the order and send a secure card payment link for {formatEuroAmount(initialPayment)}.
              </span>
            </label>
            <label className={values.paymentMethod === 'bank-transfer' ? 'is-active' : ''}>
              <input
                checked={values.paymentMethod === 'bank-transfer'}
                name="paymentMethod"
                onChange={() => updateValue('paymentMethod', 'bank-transfer')}
                type="radio"
              />
              <span>
                <strong>Bank transfer</strong>
                Save the order and send bank transfer instructions for {formatEuroAmount(initialPayment)}.
              </span>
            </label>
            <label className={values.paymentMethod === 'paypal' ? 'is-active' : ''}>
              <input
                checked={values.paymentMethod === 'paypal'}
                name="paymentMethod"
                onChange={() => updateValue('paymentMethod', 'paypal')}
                type="radio"
              />
              <span>
                <strong>PayPal</strong>
                Save the order and send a PayPal payment request for {formatEuroAmount(initialPayment)}.
              </span>
            </label>
          </div>
          <div className="order-consent-list">
            <ConsentCheckbox
              checked={values.contractAccepted}
              error={errors.contractAccepted}
              label="I have reviewed and accept the Project Order and General Customer Terms, including the total price and the 50%/50% payment schedule."
              required
              onChange={(checked) => updateValue('contractAccepted', checked)}
            />
            <ConsentCheckbox
              checked={values.earlyStartRequested}
              label="I expressly request CasaMia to begin providing the service before my statutory withdrawal period has expired. I understand that if I withdraw after work has started, I may be required to pay the proportion of the service already provided."
              onChange={(checked) => updateValue('earlyStartRequested', checked)}
            />
            {fullExecutionConsentRelevant ? (
              <ConsentCheckbox
                checked={values.fullExecutionAcknowledged}
                label="I expressly consent to the service being fully completed during the withdrawal period and acknowledge that I will lose my withdrawal right once the service has been fully performed."
                onChange={(checked) => updateValue('fullExecutionAcknowledged', checked)}
              />
            ) : null}
            {personalisedGoodsConsentRelevant ? (
              <ConsentCheckbox
                checked={values.personalisedGoodsAcknowledged}
                label={`I understand that the following item is being manufactured or adapted specifically for my property: ${personalisedGoodsItem}. The statutory exception for clearly personalised goods may therefore apply.`}
                onChange={(checked) => updateValue('personalisedGoodsAcknowledged', checked)}
              />
            ) : null}
            <ConsentCheckbox
              checked={values.marketingConsent}
              label="I agree to receive optional CasaMia marketing communications. I can withdraw this consent at any time."
              onChange={(checked) => updateValue('marketingConsent', checked)}
            />
            <ConsentCheckbox
              checked={values.photoConsent}
              label="I give separate permission for CasaMia to request use of project photos or a testimonial for marketing. No marketing use is allowed without separate approval of the specific material."
              onChange={(checked) => updateValue('photoConsent', checked)}
            />
          </div>
          <div className="order-payment-summary">
            <span>Total package</span>
            <strong>{planSummary.price}</strong>
            <p>
              Amount payable now: {formatEuroAmount(initialPayment)}. Remaining amount after successful installation:{' '}
              {formatEuroAmount(remainingPayment)}. Selected method: {paymentMethodLabels[values.paymentMethod]}.
            </p>
          </div>
          {consentEvidenceMessage ? <p className="order-consent-error">{consentEvidenceMessage}</p> : null}
        </section>
      ) : null}

      <div className="order-wizard-actions">
        {activeStep > 0 ? (
          <button className="btn btn-white" type="button" onClick={goBack}>
            Back
          </button>
        ) : null}
        {activeStep < steps.length - 1 ? (
          <button className="btn btn-green" type="button" onClick={goNext}>
            Continue
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        ) : (
          <div className="order-final-action">
            <span>Amount payable now: {formatEuroAmount(initialPayment)}</span>
            <button className="btn btn-green" type="submit">
              Confirm order and request 50% payment instructions
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </form>
  )
}

function WizardField({
  children,
  error,
  label,
  required,
  wide,
}: {
  children: ReactNode
  error?: string
  label: string
  required?: boolean
  wide?: boolean
}) {
  return (
    <label className={`order-wizard-field${wide ? ' is-wide' : ''}${error ? ' has-error' : ''}`}>
      <span>
        {label}
        {required ? <strong> *</strong> : null}
      </span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  )
}

function ConsentCheckbox({
  checked,
  error,
  label,
  onChange,
  required,
}: {
  checked: boolean
  error?: string
  label: string
  onChange: (checked: boolean) => void
  required?: boolean
}) {
  return (
    <label className="order-consent-checkbox">
      <input checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span>
        {label}
        {required ? <strong> *</strong> : null}
        {error ? <small>{error}</small> : null}
      </span>
    </label>
  )
}
