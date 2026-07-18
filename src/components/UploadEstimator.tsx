import {
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  Home,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from 'lucide-react'
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ReportDeliveryForm } from './ReportDeliveryForm'
import { PhotoAnalysisCards, ScoreExplanation } from './SafetyReportInsights'
import {
  generateSafetyReport,
  getEstimateRiskAssessment,
  sendReportDelivery,
  type DeliveryChannelStatus,
  type EstimatePhotoInput,
  type EstimatePreventionStat,
  type EstimateReport,
  type EstimateRiskLevel,
} from '../services/estimateWorkflow'
import { isReportDeliveryReady, type ReportDeliveryFormValue } from '../utils/reportDelivery'
import { trackEvent } from '../utils/analytics'
import { consumeSafetyReportModalRequest, safetyReportModalEvent } from '../utils/safetyReportModal'
import { classifyRoomPhoto } from '../services/roomPhotoClassification'

type WizardStep = 0 | 1 | 2 | 3
type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error'
type DeliveryStatus = 'idle' | 'loading' | 'success' | 'error'

type EstimatePhoto = EstimatePhotoInput & {
  previewUrl: string
}

type Option = {
  value: string
  label: string
}

type EstimateForm = ReportDeliveryFormValue & {
  description: string
  region: string
  postcode: string
  homeType: string
  mainConcern: string
  urgency: string
  mobilityProfile: string
  name: string
  email: string
  phone: string
  deliveryEmail: boolean
  deliveryWhatsapp: boolean
  consent: boolean
}

const maxPhotos = 8
const maxFileSize = 8 * 1024 * 1024
const acceptedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

const initialForm: EstimateForm = {
  description: '',
  region: '',
  postcode: '',
  homeType: '',
  mainConcern: '',
  urgency: '',
  mobilityProfile: '',
  name: '',
  email: '',
  phone: '',
  deliveryEmail: true,
  deliveryWhatsapp: false,
  consent: false,
}

const fallbackRooms: Option[] = [
  { value: 'Bathroom', label: 'Bathroom' },
  { value: 'Kitchen', label: 'Kitchen' },
  { value: 'Stairs', label: 'Stairs' },
  { value: 'Living room', label: 'Living room' },
  { value: 'Bedroom', label: 'Bedroom' },
  { value: 'Entrance', label: 'Entrance' },
  { value: 'Other', label: 'Other' },
]

const fallbackHomeTypes: Option[] = [
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'Villa or detached home', label: 'Villa or detached home' },
  { value: 'Residential building community', label: 'Residential building community' },
]

const fallbackConcerns: Option[] = [
  { value: 'Falls or slipping', label: 'Falls or slipping' },
  { value: 'Bathroom safety', label: 'Bathroom safety' },
  { value: 'Stairs or access', label: 'Stairs or access' },
  { value: 'Emergency alerts', label: 'Emergency alerts' },
  { value: 'Smart home support', label: 'Smart home support' },
  { value: 'Not sure yet', label: 'Not sure yet' },
]

const fallbackUrgencies: Option[] = [
  { value: 'Urgent', label: 'Urgent' },
  { value: 'Within 1 month', label: 'Within 1 month' },
  { value: 'Within 3 months', label: 'Within 3 months' },
  { value: 'Planning ahead', label: 'Planning ahead' },
]

const fallbackMobilityProfiles: Option[] = [
  { value: 'No major mobility concern', label: 'No major mobility concern' },
  { value: 'Occasional balance concern', label: 'Occasional balance concern' },
  { value: 'Uses cane or walker', label: 'Uses cane or walker' },
  { value: 'Wheelchair or reduced mobility', label: 'Wheelchair or reduced mobility' },
  { value: 'Recent fall', label: 'Recent fall' },
  { value: 'Not sure yet', label: 'Not sure yet' },
]

const fallbackStepLabels = ['Photos', 'Home', 'Contact', 'Report']
const estimatorDraftStorageKey = 'casamia-estimator-draft'
const HomeSafetyWizardModalContent = lazy(() =>
  import('../pages/HomeSafetyWizardPage').then((module) => ({
    default: module.HomeSafetyWizardPage,
  })),
)

export function UploadEstimator() {
  const { i18n, t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const photosRef = useRef<EstimatePhoto[]>([])
  const [photos, setPhotos] = useState<EstimatePhoto[]>([])
  const [form, setForm] = useState<EstimateForm>(() => getSavedEstimatorForm())
  const [wizardOpen, setWizardOpen] = useState(false)
  const [proposalWizardOpen, setProposalWizardOpen] = useState(false)
  const [step, setStep] = useState<WizardStep>(() => getSavedEstimatorStep())
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('idle')
  const [delivery, setDelivery] = useState<{
    email: DeliveryChannelStatus
    whatsapp: DeliveryChannelStatus
  } | null>(null)
  const [report, setReport] = useState<EstimateReport | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [fileMessage, setFileMessage] = useState('')

  const rooms = getOptions(t('estimator.workflow.rooms', { returnObjects: true }), fallbackRooms)
  const homeTypes = getOptions(t('estimator.workflow.homeTypes', { returnObjects: true }), fallbackHomeTypes)
  const concerns = getOptions(t('estimator.workflow.concerns', { returnObjects: true }), fallbackConcerns)
  const urgencies = getOptions(t('estimator.workflow.urgencies', { returnObjects: true }), fallbackUrgencies)
  const mobilityProfiles = getOptions(
    t('estimator.workflow.mobilityProfiles', { returnObjects: true }),
    fallbackMobilityProfiles,
  )
  const stepLabels = getStringArray(t('estimator.workflow.steps', { returnObjects: true }), fallbackStepLabels)
  const canContinue = getStepCompletion(step, photos, form, status, deliveryStatus, report)
  const blockedReason = canContinue
    ? ''
    : getWorkflowBlockedReason(step, photos, form, status, deliveryStatus, t)
  const currentStepLabel = stepLabels[step] ?? ''
  const stepCounter = i18n.language.startsWith('es')
    ? `Paso ${step + 1} de ${stepLabels.length}`
    : `Step ${step + 1} of ${stepLabels.length}`

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    window.localStorage.setItem(
      estimatorDraftStorageKey,
      JSON.stringify({
        form,
        step: Math.min(step, 2),
        updatedAt: new Date().toISOString(),
      }),
    )
  }, [form, step])

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
    }
  }, [])

  useEffect(() => {
    function handleOpenSafetyReport() {
      consumeSafetyReportModalRequest()
      openWizard()
    }

    window.addEventListener(safetyReportModalEvent, handleOpenSafetyReport)

    if (consumeSafetyReportModalRequest()) {
      handleOpenSafetyReport()
    }

    return () => {
      window.removeEventListener(safetyReportModalEvent, handleOpenSafetyReport)
    }
  }, [])

  useEffect(() => {
    if (!proposalWizardOpen) return

    const bodyOverflow = document.body.style.overflow
    const documentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape'
        && !event.defaultPrevented
        && !document.querySelector('dialog[open]')
      ) {
        setProposalWizardOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = bodyOverflow
      document.documentElement.style.overflow = documentOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [proposalWizardOpen])

  function updateForm(field: keyof EstimateForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }) as EstimateForm)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  function addFiles(files: File[]) {
    setFileMessage('')

    if (files.length === 0) {
      return
    }

    const remainingSlots = maxPhotos - photos.length
    const selected = files.slice(0, remainingSlots)
    const rejected = files.length - selected.length
    const accepted: EstimatePhoto[] = []
    const messages: string[] = []

    selected.forEach((file) => {
      if (isHeic(file)) {
        messages.push(t('estimator.workflow.errors.heic'))
        return
      }

      if (!isAcceptedImage(file)) {
        messages.push(t('estimator.workflow.errors.unsupported', { file: file.name }))
        return
      }

      if (file.size > maxFileSize) {
        messages.push(t('estimator.workflow.errors.tooLarge', { file: file.name }))
        return
      }

      accepted.push({
        id: createPhotoId(),
        file,
        previewUrl: URL.createObjectURL(file),
        room: guessRoom(file.name),
      })
    })

    if (rejected > 0) {
      messages.push(t('estimator.workflow.errors.maxPhotos', { count: maxPhotos }))
    }

    if (messages.length > 0) {
      setFileMessage(Array.from(new Set(messages)).join(' '))
    }

    setPhotos((current) => [...current, ...accepted])
    accepted.forEach((photo) => {
      void classifyRoomPhoto(photo.file).then((classification) => {
        if (classification.room !== 'other') {
          updatePhotoRoom(photo.id, roomValueFromClassification(classification.room))
        }
      })
    })
  }

  function removePhoto(photoId: string) {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === photoId)
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl)
      }

      return current.filter((item) => item.id !== photoId)
    })
  }

  function updatePhotoRoom(photoId: string, room: string) {
    setPhotos((current) =>
      current.map((photo) => (photo.id === photoId ? { ...photo, room } : photo)),
    )
  }

  function openWizard() {
    setWizardOpen(true)
    setStep((current) => (current < 3 ? current : 0))
    trackEvent('form_start', { form: 'safety_report' })
  }

  function closeWizard() {
    setWizardOpen(false)
  }

  function goNext() {
    if (step === 0) {
      trackEvent('form_step_complete', { form: 'safety_report', step: 'photos' })
      setStep(1)
      return
    }

    if (step === 1) {
      trackEvent('form_step_complete', { form: 'safety_report', step: 'home_context' })
      setStep(2)
      return
    }

    if (step === 2) {
      trackEvent('form_submit', { form: 'safety_report' })
      void createAndSendReport()
    }
  }

  async function createAndSendReport() {
    try {
      setStatus('loading')
      setDeliveryStatus('loading')
      setStep(3)
      setErrorMessage('')
      setDelivery(null)
      setReport(null)
      const workflowInput = {
        locale: i18n.language,
        context: {
          region: form.region,
          postcode: form.postcode,
          homeType: form.homeType,
          mainConcern: form.mainConcern,
          urgency: form.urgency,
          mobilityProfile: form.mobilityProfile,
          description: form.description,
        },
        photos,
      }
      let result = await generateSafetyReport(workflowInput)

      if (hasNoCompletedPhotoAnalysis(result, photos.length)) {
        await new Promise((resolve) => window.setTimeout(resolve, 800))
        result = await generateSafetyReport(workflowInput)
      }

      if (hasNoCompletedPhotoAnalysis(result, photos.length)) {
        throw new Error('PHOTO_ANALYSIS_UNAVAILABLE')
      }

      const pendingDelivery = getRequestedDeliveryStatus(form, 'queued')
      setReport(withReportDelivery(result, form, pendingDelivery))
      setStatus('success')

      try {
        const deliveryResult = await sendReportDelivery({
          reportType: 'safety',
          token: result.token,
          reportTitle: t('estimator.workflow.result.reportTitle'),
          reportUrl: result.reportUrl,
          report: result,
          contact: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            deliveryEmail: form.deliveryEmail,
            deliveryWhatsapp: form.deliveryWhatsapp,
            consentAt: new Date().toISOString(),
          },
        })

        setReport(withReportDelivery(result, form, deliveryResult))
        setDelivery(deliveryResult)
        setDeliveryStatus('success')
        window.localStorage.removeItem(estimatorDraftStorageKey)
        trackEvent('form_complete', { form: 'safety_report', delivery: 'success' })
      } catch {
        const failedDelivery = getRequestedDeliveryStatus(form, 'failed')
        setReport(withReportDelivery(result, form, failedDelivery))
        setDelivery(failedDelivery)
        setDeliveryStatus('error')
        setErrorMessage(t('estimator.workflow.errors.delivery'))
        trackEvent('form_complete', { form: 'safety_report', delivery: 'error' })
      }
    } catch (error) {
      setDeliveryStatus('idle')
      setStatus('error')
      setErrorMessage(
        error instanceof Error && error.message === 'PHOTO_ANALYSIS_UNAVAILABLE'
          ? t('estimator.workflow.errors.analysisUnavailable', {
              defaultValue:
                'We could not analyse the photos yet. Your upload is safe. Please try the analysis again.',
            })
          : t('estimator.workflow.errors.submit'),
      )
    }
  }

  async function retryReportDelivery() {
    if (!report) return

    try {
      setDeliveryStatus('loading')
      setErrorMessage('')
      const deliveryResult = await sendReportDelivery({
        reportType: 'safety',
        token: report.token,
        reportTitle: t('estimator.workflow.result.reportTitle'),
        reportUrl: report.reportUrl,
        report,
        contact: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          deliveryEmail: form.deliveryEmail,
          deliveryWhatsapp: form.deliveryWhatsapp,
          consentAt: new Date().toISOString(),
        },
      })

      setReport(withReportDelivery(report, form, deliveryResult))
      setDelivery(deliveryResult)
      setDeliveryStatus('success')
      window.localStorage.removeItem(estimatorDraftStorageKey)
      trackEvent('form_complete', { form: 'safety_report', delivery: 'success' })
    } catch {
      const failedDelivery = getRequestedDeliveryStatus(form, 'failed')
      setReport(withReportDelivery(report, form, failedDelivery))
      setDelivery(failedDelivery)
      setDeliveryStatus('error')
      setErrorMessage(t('estimator.workflow.errors.delivery'))
    }
  }

  return (
    <div className="hero-estimator mt-10 max-w-xl" id="estimate-upload">
      <div className="free-check-grid">
        <button type="button" className="free-check-card is-primary" onClick={openWizard}>
          <span className="free-check-icon is-report">
            <ShieldCheck size={23} aria-hidden="true" />
          </span>
          <span className="free-check-copy">
            <strong>{t('hero.safetyCheck.title')}</strong>
          </span>
          <span className="free-check-arrow" aria-hidden="true">
            <ArrowRight size={20} />
          </span>
        </button>
        <button
          type="button"
          className="free-check-card is-proposal"
          onClick={() => {
            setProposalWizardOpen(true)
            trackEvent('home_safety_proposal_opened', { location: 'hero' })
          }}
        >
          <span className="free-check-icon is-grant">
            <FileText size={23} aria-hidden="true" />
          </span>
          <span className="free-check-copy">
            <strong>{t('hero.buildPlan.title')}</strong>
          </span>
          <span className="free-check-arrow" aria-hidden="true">
            <ArrowRight size={20} />
          </span>
        </button>
      </div>
      <input
        ref={inputRef}
        id="home-photos"
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
      />

      {fileMessage ? (
        <p className="mt-3 rounded-md bg-white/15 p-3 text-sm font-semibold text-white">{fileMessage}</p>
      ) : null}

      {wizardOpen ? createPortal(
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
          <div
            className="estimate-wizard-modal w-full overflow-hidden bg-white text-left shadow-soft"
            role="dialog"
            aria-modal="true"
            aria-labelledby="estimate-wizard-title"
          >
            <div className="estimate-wizard-header">
              <div>
                <p className="estimate-wizard-kicker">{t('estimator.workflow.kicker')}</p>
                <h2 id="estimate-wizard-title">{t('estimator.workflow.title')}</h2>
                <p className="estimate-wizard-step-caption">
                  {stepCounter}
                  {currentStepLabel ? ` - ${currentStepLabel}` : ''}
                </p>
              </div>
              <button
                type="button"
                className="estimate-icon-button"
                aria-label={t('common.close')}
                onClick={closeWizard}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="estimate-wizard-progress" aria-label={t('estimator.workflow.progress')}>
              {stepLabels.map((label, index) => (
                <button
                  className={`estimate-progress-step ${step === index ? 'is-active' : ''} ${step > index ? 'is-complete' : ''}`}
                  key={label}
                  type="button"
                  onClick={() => {
                    if (index <= step || status === 'success') {
                      setStep(index as WizardStep)
                    }
                  }}
                >
                  <span>{index + 1}</span>
                  {label}
                </button>
              ))}
            </div>

            <div className="estimate-wizard-body">
              {step === 0 ? (
                <PhotosStep
                  fileMessage={fileMessage}
                  inputRef={inputRef}
                  photos={photos}
                  rooms={rooms}
                  description={form.description}
                  onDescriptionChange={(value) => updateForm('description', value)}
                  onRemovePhoto={removePhoto}
                  onRoomChange={updatePhotoRoom}
                />
              ) : null}

              {step === 1 ? (
                <HomeContextStep
                  form={form}
                  homeTypes={homeTypes}
                  concerns={concerns}
                  urgencies={urgencies}
                  mobilityProfiles={mobilityProfiles}
                  onChange={updateForm}
                />
              ) : null}

              {step === 2 ? (
                <DeliveryStep
                  delivery={delivery}
                  deliveryStatus={deliveryStatus}
                  errorMessage={errorMessage}
                  form={form}
                  onChange={updateForm}
                />
              ) : null}

              {step === 3 ? (
                <ResultStep
                  deliveryStatus={deliveryStatus}
                  errorMessage={errorMessage}
                  photos={photos}
                  report={report}
                  status={status}
                  onRetryAnalysis={() => void createAndSendReport()}
                  onRetryDelivery={() => void retryReportDelivery()}
                />
              ) : null}
            </div>

            {step < 3 ? (
              <div className={`estimate-wizard-footer ${step === 0 ? 'is-single-action' : ''}`}>
                {step > 0 ? (
                  <button
                    type="button"
                    className="btn btn-white"
                    disabled={status === 'loading' || deliveryStatus === 'loading'}
                    onClick={() => setStep((current) => (Math.max(0, current - 1) as WizardStep))}
                  >
                    <ChevronLeft size={19} aria-hidden="true" />
                    {t('estimator.workflow.back')}
                  </button>
                ) : null}
                {blockedReason ? (
                  <p className="wizard-action-hint" role="status">
                    {blockedReason}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="btn btn-navy"
                  disabled={!canContinue || deliveryStatus === 'success'}
                  title={blockedReason || undefined}
                  onClick={goNext}
                >
                  {step === 2
                    ? t('estimator.workflow.createEstimate')
                    : t('estimator.workflow.continue')}
                  {step === 2 ? (
                    <ClipboardCheck size={20} aria-hidden="true" />
                  ) : (
                    <ArrowRight size={20} aria-hidden="true" />
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>,
        document.body,
      ) : null}

      {proposalWizardOpen ? createPortal(
        <div
          className="home-proposal-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setProposalWizardOpen(false)
            }
          }}
        >
          <section
            className="home-proposal-modal"
            role="dialog"
            aria-modal="true"
            aria-label={t('hero.buildPlan.title')}
          >
            <button
              autoFocus
              type="button"
              className="home-proposal-modal-close"
              aria-label={t('common.close')}
              onClick={() => setProposalWizardOpen(false)}
            >
              <X size={22} aria-hidden="true" />
            </button>
            <div className="home-proposal-modal-scroll">
              <Suspense
                fallback={(
                  <div className="home-proposal-modal-loading" role="status">
                    <LoaderCircle size={28} aria-hidden="true" />
                    <span>{t('common.loading', { defaultValue: 'Loading...' })}</span>
                  </div>
                )}
              >
                <HomeSafetyWizardModalContent embedded />
              </Suspense>
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </div>
  )
}

function PhotosStep({
  photos,
  rooms,
  description,
  fileMessage,
  inputRef,
  onDescriptionChange,
  onRemovePhoto,
  onRoomChange,
}: {
  photos: EstimatePhoto[]
  rooms: Option[]
  description: string
  fileMessage: string
  inputRef: RefObject<HTMLInputElement>
  onDescriptionChange: (value: string) => void
  onRemovePhoto: (photoId: string) => void
  onRoomChange: (photoId: string, room: string) => void
}) {
  const { t } = useTranslation()

  return (
    <section className="estimate-step-grid">
      <StepIntro
        icon={<Camera size={24} aria-hidden="true" />}
        title={t('estimator.workflow.photos.title')}
        body={t('estimator.workflow.photos.body')}
      />
      <div className="estimate-step-content">
        <button
          type="button"
          className="estimate-upload-dropzone"
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={26} aria-hidden="true" />
          <span>{t('estimator.workflow.photos.add')}</span>
          <small>{t('estimator.workflow.photos.rules')}</small>
        </button>
        {fileMessage ? <p className="estimate-field-error">{fileMessage}</p> : null}
        {photos.length > 0 ? (
          <div className="estimate-photo-grid">
            {photos.map((photo) => (
              <article className="estimate-photo-card" key={photo.id}>
                <img src={photo.previewUrl} alt="" />
                <div className="estimate-photo-card-body">
                  <p title={photo.file.name}>{photo.file.name}</p>
                  <SelectField
                    label={t('estimator.workflow.photos.roomLabel')}
                    value={photo.room}
                    options={rooms}
                    onChange={(value) => onRoomChange(photo.id, value)}
                  />
                  <button type="button" onClick={() => onRemovePhoto(photo.id)}>
                    <X size={16} aria-hidden="true" />
                    {t('estimator.workflow.photos.remove')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="estimate-empty-note">{t('estimator.workflow.photos.empty')}</p>
        )}
        <label className="estimate-field">
          {t('estimator.workflow.photos.description')}
          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder={t('estimator.workflow.photos.descriptionPlaceholder')}
          />
        </label>
      </div>
    </section>
  )
}

function HomeContextStep({
  form,
  homeTypes,
  concerns,
  urgencies,
  mobilityProfiles,
  onChange,
}: {
  form: EstimateForm
  homeTypes: Option[]
  concerns: Option[]
  urgencies: Option[]
  mobilityProfiles: Option[]
  onChange: (field: keyof EstimateForm, value: string | boolean) => void
}) {
  const { t } = useTranslation()

  return (
    <section className="estimate-step-grid">
      <StepIntro
        icon={<Home size={24} aria-hidden="true" />}
        title={t('estimator.workflow.home.title')}
        body={t('estimator.workflow.home.body')}
      />
      <div className="estimate-form-grid">
        <SelectField
          label={t('estimator.workflow.home.homeType')}
          value={form.homeType}
          options={homeTypes}
          placeholder={t('estimator.workflow.choose')}
          onChange={(value) => onChange('homeType', value)}
        />
        <MultiSelectField
          label={t('estimator.workflow.home.concern')}
          values={splitMultiValue(form.mainConcern)}
          options={concerns}
          onChange={(values) => onChange('mainConcern', serialiseConcernValues(values))}
        />
        <SelectField
          label={t('estimator.workflow.home.urgency')}
          value={form.urgency}
          options={urgencies}
          placeholder={t('estimator.workflow.choose')}
          onChange={(value) => onChange('urgency', value)}
        />
        <SelectField
          label={t('estimator.workflow.home.mobilityProfile')}
          value={form.mobilityProfile}
          options={mobilityProfiles}
          placeholder={t('estimator.workflow.choose')}
          onChange={(value) => onChange('mobilityProfile', value)}
        />
        <div className="estimate-context-note">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>{t('estimator.workflow.home.regionalNote')}</p>
        </div>
      </div>
    </section>
  )
}

function DeliveryStep({
  form,
  delivery,
  deliveryStatus,
  errorMessage,
  onChange,
}: {
  form: EstimateForm
  delivery: {
    email: DeliveryChannelStatus
    whatsapp: DeliveryChannelStatus
  } | null
  deliveryStatus: DeliveryStatus
  errorMessage: string
  onChange: (field: keyof EstimateForm, value: string | boolean) => void
}) {
  const { t } = useTranslation()

  return (
    <section className="estimate-step-grid">
      <StepIntro
        icon={<UserRound size={24} aria-hidden="true" />}
        title={t('estimator.workflow.contact.title')}
        body={t('estimator.workflow.contact.body')}
      />
      <ReportDeliveryForm
        value={form}
        consentText={t('estimator.workflow.contact.consent')}
        intro={t('estimator.workflow.contact.deliveryIntro')}
        showPostcode
        onChange={onChange}
      />
      {deliveryStatus === 'success' && delivery ? (
        <p className="delivery-status-message is-success">
          {buildDeliveryMessage(
            { delivery },
            t('estimator.workflow.result.emailQueued'),
            t('estimator.workflow.result.whatsappQueued'),
          )}
        </p>
      ) : null}
      {deliveryStatus === 'error' ? (
        <p className="delivery-status-message is-error">{errorMessage}</p>
      ) : null}
    </section>
  )
}

function ResultStep({
  status,
  deliveryStatus,
  errorMessage,
  photos,
  report,
  onRetryAnalysis,
  onRetryDelivery,
}: {
  status: SubmissionStatus
  deliveryStatus: DeliveryStatus
  errorMessage: string
  photos: EstimatePhoto[]
  report: EstimateReport | null
  onRetryAnalysis: () => void
  onRetryDelivery: () => void
}) {
  const { i18n, t } = useTranslation()

  if (status === 'loading') {
    return (
      <div className="estimate-result-loading">
        <LoaderCircle className="animate-spin" size={48} aria-hidden="true" />
        <h3>{t('estimator.workflow.result.loadingTitle')}</h3>
        <p>{t('estimator.workflow.result.loadingBody')}</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="estimate-result-loading">
        <ShieldCheck size={48} aria-hidden="true" />
        <h3>{t('estimator.errorTitle')}</h3>
        <p>{errorMessage}</p>
        <button type="button" className="btn btn-navy" onClick={onRetryAnalysis}>
          <RefreshCw size={18} aria-hidden="true" />
          {t('estimator.workflow.result.analysisRetryButton', {
            defaultValue: 'Retry photo analysis',
          })}
        </button>
      </div>
    )
  }

  if (!report) {
    return null
  }

  const hasHighPriorityRisk = report.hazards.some((hazard) => hazard.severity === 'high')
  const risk = getEstimateRiskAssessment(report, i18n.language)
  const preventionStats = getPreventionStats(
    report,
    t('estimator.workflow.result.preventionStats.items', { returnObjects: true }),
  )
  const previewByPhotoId = Object.fromEntries(
    photos.map((photo) => [photo.id, photo.previewUrl]),
  )
  const unavailablePhotoCount = (report.photoAnalyses ?? []).filter(
    (analysis) => analysis.analysisStatus === 'unavailable',
  ).length

  return (
    <section className="estimate-result-layout">
      <div className="estimate-result-main">
        <p className="estimate-wizard-kicker">{t('estimator.workflow.result.kicker')}</p>
        <h3>{t('estimator.workflow.result.title')}</h3>
        <p>{report.summary}</p>
        <div className="estimate-result-metrics">
          <Metric label={t('estimator.workflow.result.photosReviewed')} value={`${report.context.photoCount}`} />
          <Metric label={t('estimator.workflow.result.risksFound')} value={`${report.hazards.length}`} />
          <Metric
            label={t('estimator.workflow.result.preventionPriority')}
            value={t(
              hasHighPriorityRisk
                ? 'estimator.workflow.result.priorityHigh'
                : 'estimator.workflow.result.priorityMedium',
            )}
            accent
            riskLevel={risk.riskLevel}
          />
        </div>
        {unavailablePhotoCount > 0 ? (
          <div className="estimate-analysis-retry" role="status">
            <div>
              <strong>
                {t('estimator.workflow.result.analysisRetryTitle', {
                  count: unavailablePhotoCount,
                  defaultValue: 'Some photos still need visual analysis',
                })}
              </strong>
              <span>
                {t('estimator.workflow.result.analysisRetryBody', {
                  defaultValue: 'Keep your uploaded photos and refresh the report now.',
                })}
              </span>
            </div>
            <button type="button" className="btn btn-navy" onClick={onRetryAnalysis}>
              <RefreshCw size={18} aria-hidden="true" />
              {t('estimator.workflow.result.analysisRetryButton', {
                defaultValue: 'Retry photo analysis',
              })}
            </button>
          </div>
        ) : null}
        <PhotoAnalysisCards
          analyses={report.photoAnalyses ?? []}
          previewByPhotoId={previewByPhotoId}
        />
        <div className="estimate-result-section">
          <h4>{t('estimator.workflow.result.preventionStats.title')}</h4>
          <div className="estimate-evidence-grid">
            {preventionStats.map((stat) => (
              <article key={`${stat.value}-${stat.source}`}>
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
                <small>{stat.source}</small>
              </article>
            ))}
          </div>
        </div>
      </div>
      <aside className="estimate-result-side">
        <ScoreExplanation report={report} risk={risk} />
        <p className="font-bold text-navy">{t('estimator.workflow.result.deliveryTitle')}</p>
        {deliveryStatus === 'error' ? (
          <div className="delivery-status-message is-error mt-2" role="alert">
            <p>{errorMessage}</p>
            <button type="button" className="btn btn-navy mt-3" onClick={onRetryDelivery}>
              {t('estimator.workflow.result.retry')}
            </button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-mid">
            {deliveryStatus === 'loading'
              ? t('estimator.workflow.result.loadingBody')
              : buildDeliveryMessage(
                  report,
                  t('estimator.workflow.result.emailQueued'),
                  t('estimator.workflow.result.whatsappQueued'),
                ) || t('estimator.workflow.result.readyToSend')}
          </p>
        )}
        {report.backendMode === 'local-demo' ? (
          <p className="mt-4 rounded-lg bg-light-blue p-3 text-xs font-semibold text-text-mid">
            {t('estimator.workflow.result.demoMode')}
          </p>
        ) : null}
        <div className="mt-5 grid gap-3">
          <Link className="btn btn-navy" to={`/estimate/${report.token}`}>
            <FileText size={19} aria-hidden="true" />
            {t('estimator.workflow.result.viewReport')}
          </Link>
          <Link
            className="btn btn-green"
            to={`/home-safety-assessment?source=free-report&report=${encodeURIComponent(report.token)}#assessment-form`}
          >
            {t('estimator.workflow.result.bookAssessment')}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </section>
  )
}

function StepIntro({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="estimate-step-intro">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
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
  options: Option[]
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="estimate-field">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function MultiSelectField({
  label,
  values,
  options,
  onChange,
}: {
  label: string
  values: string[]
  options: Option[]
  onChange: (values: string[]) => void
}) {
  function toggleValue(value: string) {
    if (value === 'Not sure yet') {
      onChange(values.includes(value) ? [] : [value])
      return
    }

    const nextValues = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values.filter((item) => item !== 'Not sure yet'), value]

    onChange(nextValues)
  }

  return (
    <fieldset className="estimate-multiselect">
      <legend>{label}</legend>
      <div className="estimate-multiselect-options">
        {options.map((option) => {
          const isSelected = values.includes(option.value)

          return (
            <button
              key={option.value}
              type="button"
              className={`estimate-multiselect-option ${isSelected ? 'is-selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => toggleValue(option.value)}
            >
              <span aria-hidden="true">
                {isSelected ? <Check size={15} /> : null}
              </span>
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function getPreventionStats(report: EstimateReport, translatedStats: unknown) {
  if (report.preventionStats?.length) {
    return report.preventionStats
  }

  if (Array.isArray(translatedStats)) {
    return translatedStats.filter(isPreventionStat)
  }

  return []
}

function isPreventionStat(value: unknown): value is EstimatePreventionStat {
  if (!value || typeof value !== 'object') {
    return false
  }

  const stat = value as Record<string, unknown>

  return (
    typeof stat.value === 'string' &&
    typeof stat.label === 'string' &&
    typeof stat.source === 'string'
  )
}

function Metric({
  label,
  value,
  accent = false,
  riskLevel,
}: {
  label: string
  value: string
  accent?: boolean
  riskLevel?: EstimateRiskLevel
}) {
  const className = [
    accent ? 'is-accent' : '',
    riskLevel ? getRiskToneClass(riskLevel) : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}

function getRiskToneClass(riskLevel: EstimateRiskLevel) {
  return `risk-${riskLevel}`
}

function splitMultiValue(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function serialiseConcernValues(values: string[]) {
  return values.join(', ')
}

function getStepCompletion(
  step: WizardStep,
  photos: EstimatePhoto[],
  form: EstimateForm,
  status: SubmissionStatus,
  deliveryStatus: DeliveryStatus,
  report: EstimateReport | null,
) {
  if (status === 'loading' || deliveryStatus === 'loading') {
    return false
  }

  if (step === 0) {
    return photos.length > 0
  }

  if (step === 1) {
    return Boolean(form.homeType && form.mainConcern && form.urgency && form.mobilityProfile)
  }

  if (step === 2) {
    return Boolean(form.postcode && isReportDeliveryReady(form))
  }

  if (step === 3) {
    return Boolean(report && status === 'success')
  }

  return true
}

function getWorkflowBlockedReason(
  step: WizardStep,
  photos: EstimatePhoto[],
  form: EstimateForm,
  status: SubmissionStatus,
  deliveryStatus: DeliveryStatus,
  t: ReturnType<typeof useTranslation>['t'],
) {
  if (status === 'loading' || deliveryStatus === 'loading') {
    return t('estimator.workflow.validation.loading')
  }

  if (step === 0 && photos.length === 0) {
    return t('estimator.workflow.validation.photos')
  }

  if (step === 1) {
    const missing = [
      form.homeType ? '' : t('estimator.workflow.home.homeType'),
      form.mainConcern ? '' : t('estimator.workflow.home.concern'),
      form.urgency ? '' : t('estimator.workflow.home.urgency'),
      form.mobilityProfile ? '' : t('estimator.workflow.home.mobilityProfile'),
    ].filter(Boolean)

    if (missing.length > 0) {
      return t('estimator.workflow.validation.home', { fields: missing.join(', ') })
    }
  }

  if (step === 2) {
    if (!form.postcode) {
      return t('estimator.workflow.validation.postcode')
    }

    return t('estimator.workflow.validation.contact')
  }

  return ''
}

function isAcceptedImage(file: File) {
  return acceptedMimeTypes.has(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name)
}

function isHeic(file: File) {
  return file.type.includes('heic') || file.type.includes('heif') || /\.(heic|heif)$/i.test(file.name)
}

function guessRoom(fileName: string) {
  const lower = fileName.toLowerCase()

  if (lower.includes('bath') || lower.includes('baño') || lower.includes('bano')) return 'Bathroom'
  if (lower.includes('kitchen') || lower.includes('cocina')) return 'Kitchen'
  if (lower.includes('stair') || lower.includes('escalera')) return 'Stairs'
  if (lower.includes('bed') || lower.includes('dormitorio')) return 'Bedroom'
  if (lower.includes('entry') || lower.includes('entrada')) return 'Entrance'

  return 'Living room'
}

function hasNoCompletedPhotoAnalysis(report: EstimateReport, photoCount: number) {
  if (photoCount === 0) {
    return false
  }

  const analyses = report.photoAnalyses ?? []
  return analyses.length === 0 || analyses.every((analysis) => analysis.analysisStatus === 'unavailable')
}

function roomValueFromClassification(room: string) {
  const values: Record<string, string> = {
    bathroom: 'Bathroom',
    bedroom: 'Bedroom',
    kitchen: 'Kitchen',
    'living-room': 'Living room',
    stairs: 'Stairs',
    entrance: 'Entrance',
    outdoor: 'Other',
  }

  return values[room] ?? 'Other'
}

function getOptions(value: unknown, fallback: Option[]) {
  if (!Array.isArray(value)) {
    return fallback
  }

  const options = value
    .filter((option): option is Option => {
      return Boolean(
        option &&
          typeof option === 'object' &&
          'value' in option &&
          'label' in option &&
          typeof option.value === 'string' &&
          typeof option.label === 'string',
      )
    })
    .concat([])

  return options.length > 0 ? options : fallback
}

function getStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback
  }

  const values = value.filter((item): item is string => typeof item === 'string')
  return values.length > 0 ? values : fallback
}

function createPhotoId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function buildDeliveryMessage(
  report: {
    delivery: {
      email: DeliveryChannelStatus
      whatsapp: DeliveryChannelStatus
    }
  },
  emailText: string,
  whatsappText: string,
) {
  const parts = []

  if (report.delivery.email === 'queued' || report.delivery.email === 'sent') {
    parts.push(emailText)
  }

  if (report.delivery.whatsapp === 'queued' || report.delivery.whatsapp === 'sent') {
    parts.push(whatsappText)
  }

  return parts.join(' ')
}

function getRequestedDeliveryStatus(
  form: EstimateForm,
  requestedStatus: Extract<DeliveryChannelStatus, 'queued' | 'failed'>,
) {
  return {
    email: form.deliveryEmail ? requestedStatus : 'not_requested',
    whatsapp: form.deliveryWhatsapp ? requestedStatus : 'not_requested',
  } satisfies EstimateReport['delivery']
}

function withReportDelivery(
  report: EstimateReport,
  form: EstimateForm,
  delivery: EstimateReport['delivery'],
) {
  return {
    ...report,
    delivery,
    lead: {
      name: form.name,
      email: form.email,
      phone: form.phone,
      preferredChannels: [
        form.deliveryEmail ? 'email' : '',
        form.deliveryWhatsapp ? 'whatsapp' : '',
      ].filter(Boolean),
    },
  }
}

function getSavedEstimatorForm() {
  try {
    const draft = JSON.parse(window.localStorage.getItem(estimatorDraftStorageKey) ?? '{}') as {
      form?: Partial<EstimateForm>
    }

    return {
      ...initialForm,
      ...draft.form,
    }
  } catch {
    return initialForm
  }
}

function getSavedEstimatorStep(): WizardStep {
  try {
    const draft = JSON.parse(window.localStorage.getItem(estimatorDraftStorageKey) ?? '{}') as {
      step?: number
    }

    return draft.step === 1 || draft.step === 2 ? draft.step : 0
  } catch {
    return 0
  }
}
