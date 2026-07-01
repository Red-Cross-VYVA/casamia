import {
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  Home,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { PLAN_URLS } from '../constants/shopify'
import {
  submitEstimateWorkflow,
  type EstimatePhotoInput,
  type EstimateReport,
} from '../services/estimateWorkflow'

type WizardStep = 0 | 1 | 2 | 3
type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error'

type EstimatePhoto = EstimatePhotoInput & {
  previewUrl: string
}

type Option = {
  value: string
  label: string
}

type EstimateForm = {
  description: string
  region: string
  postcode: string
  homeType: string
  mainConcern: string
  urgency: string
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
  name: '',
  email: '',
  phone: '',
  deliveryEmail: true,
  deliveryWhatsapp: false,
  consent: false,
}

const fallbackRegions: Option[] = [
  { value: 'Andalucia', label: 'Andalucia' },
  { value: 'Balearic Islands', label: 'Balearic Islands' },
  { value: 'Canary Islands', label: 'Canary Islands' },
  { value: 'Catalonia', label: 'Catalonia' },
  { value: 'Community of Madrid', label: 'Community of Madrid' },
  { value: 'Comunidad Valenciana', label: 'Comunidad Valenciana' },
  { value: 'Galicia', label: 'Galicia' },
  { value: 'Other Spain', label: 'Other Spain' },
]

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

const fallbackStepLabels = ['Photos', 'Home', 'Contact', 'Result']

export function UploadEstimator() {
  const { i18n, t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const photosRef = useRef<EstimatePhoto[]>([])
  const [photos, setPhotos] = useState<EstimatePhoto[]>([])
  const [form, setForm] = useState<EstimateForm>(initialForm)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState<WizardStep>(0)
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [report, setReport] = useState<EstimateReport | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [fileMessage, setFileMessage] = useState('')

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [i18n.language],
  )

  const rooms = getOptions(t('estimator.workflow.rooms', { returnObjects: true }), fallbackRooms)
  const regions = getOptions(t('estimator.workflow.regions', { returnObjects: true }), fallbackRegions)
  const homeTypes = getOptions(t('estimator.workflow.homeTypes', { returnObjects: true }), fallbackHomeTypes)
  const concerns = getOptions(t('estimator.workflow.concerns', { returnObjects: true }), fallbackConcerns)
  const urgencies = getOptions(t('estimator.workflow.urgencies', { returnObjects: true }), fallbackUrgencies)
  const stepLabels = getStringArray(t('estimator.workflow.steps', { returnObjects: true }), fallbackStepLabels)
  const canContinue = getStepCompletion(step, photos, form, status)

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
    }
  }, [])

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

    setPhotos((current) => {
      const remainingSlots = maxPhotos - current.length
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

      return [...current, ...accepted]
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
    setStep(0)
  }

  function closeWizard() {
    setWizardOpen(false)
  }

  function goNext() {
    if (step < 2) {
      setStep((current) => (Math.min(2, current + 1) as WizardStep))
      return
    }

    if (step === 2) {
      void createEstimate()
    }
  }

  async function createEstimate() {
    try {
      setStatus('loading')
      setStep(3)
      setErrorMessage('')
      const result = await submitEstimateWorkflow({
        locale: i18n.language,
        contact: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          deliveryEmail: form.deliveryEmail,
          deliveryWhatsapp: form.deliveryWhatsapp,
          consentAt: new Date().toISOString(),
        },
        context: {
          region: form.region,
          postcode: form.postcode,
          homeType: form.homeType,
          mainConcern: form.mainConcern,
          urgency: form.urgency,
          description: form.description,
        },
        photos,
      })
      setReport(result)
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage(t('estimator.workflow.errors.submit'))
    }
  }

  return (
    <div className="mt-10 max-w-xl" id="estimate-upload">
      <label
        className="block cursor-pointer rounded-lg border-2 border-dashed border-blue bg-white/10 p-5 text-white transition hover:bg-white/20"
        htmlFor="home-photos"
      >
        <span className="flex items-center gap-3 text-lg font-bold">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue text-white">
            <Upload size={22} aria-hidden="true" />
          </span>
          {t('hero.uploadLabel')}
        </span>
        <span className="mt-2 block text-sm text-white/80">{t('hero.uploadRooms')}</span>
      </label>
      <input
        ref={inputRef}
        id="home-photos"
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
      />

      {photos.length > 0 ? (
        <div className="mt-4 rounded-lg bg-white p-4 text-left text-text-dark">
          <p className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-navy">
            <Camera size={16} aria-hidden="true" />
            {t('common.selectedPhotos')}
          </p>
          <ul className="space-y-2">
            {photos.map((photo) => (
              <li
                key={photo.id}
                className="flex items-center justify-between gap-3 rounded-md bg-light-blue px-3 py-2 text-sm font-semibold"
              >
                <span className="truncate">{photo.file.name}</span>
                <button
                  type="button"
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-navy transition hover:bg-white"
                  aria-label={t('estimator.removeFile', { file: photo.file.name })}
                  onClick={() => removePhoto(photo.id)}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {fileMessage ? (
        <p className="mt-3 rounded-md bg-white/15 p-3 text-sm font-semibold text-white">{fileMessage}</p>
      ) : null}

      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <button type="button" className="btn btn-green" onClick={openWizard}>
          <ArrowRight size={20} aria-hidden="true" />
          {t('hero.cta')}
        </button>
        <p className="text-sm font-semibold text-white/80">{t('hero.micro')}</p>
      </div>

      {wizardOpen ? (
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
                  regions={regions}
                  homeTypes={homeTypes}
                  concerns={concerns}
                  urgencies={urgencies}
                  onChange={updateForm}
                />
              ) : null}

              {step === 2 ? (
                <ContactStep form={form} onChange={updateForm} />
              ) : null}

              {step === 3 ? (
                <ResultStep
                  errorMessage={errorMessage}
                  formatter={formatter}
                  report={report}
                  status={status}
                  onRetry={() => {
                    setStep(2)
                    setStatus('idle')
                  }}
                />
              ) : null}
            </div>

            {step < 3 ? (
              <div className="estimate-wizard-footer">
                <button
                  type="button"
                  className="btn btn-white"
                  disabled={step === 0}
                  onClick={() => setStep((current) => (Math.max(0, current - 1) as WizardStep))}
                >
                  <ChevronLeft size={19} aria-hidden="true" />
                  {t('estimator.workflow.back')}
                </button>
                <button
                  type="button"
                  className="btn btn-navy"
                  disabled={!canContinue}
                  onClick={goNext}
                >
                  {step === 2 ? t('estimator.workflow.createEstimate') : t('estimator.workflow.continue')}
                  {step === 2 ? (
                    <ClipboardCheck size={20} aria-hidden="true" />
                  ) : (
                    <ArrowRight size={20} aria-hidden="true" />
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>
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
  regions,
  homeTypes,
  concerns,
  urgencies,
  onChange,
}: {
  form: EstimateForm
  regions: Option[]
  homeTypes: Option[]
  concerns: Option[]
  urgencies: Option[]
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
          label={t('estimator.workflow.home.region')}
          value={form.region}
          options={regions}
          placeholder={t('estimator.workflow.choose')}
          onChange={(value) => onChange('region', value)}
        />
        <TextField
          label={t('estimator.workflow.home.postcode')}
          value={form.postcode}
          placeholder="28013"
          onChange={(value) => onChange('postcode', value)}
        />
        <SelectField
          label={t('estimator.workflow.home.homeType')}
          value={form.homeType}
          options={homeTypes}
          placeholder={t('estimator.workflow.choose')}
          onChange={(value) => onChange('homeType', value)}
        />
        <SelectField
          label={t('estimator.workflow.home.concern')}
          value={form.mainConcern}
          options={concerns}
          placeholder={t('estimator.workflow.choose')}
          onChange={(value) => onChange('mainConcern', value)}
        />
        <SelectField
          label={t('estimator.workflow.home.urgency')}
          value={form.urgency}
          options={urgencies}
          placeholder={t('estimator.workflow.choose')}
          onChange={(value) => onChange('urgency', value)}
        />
        <div className="estimate-context-note">
          <MapPin size={20} aria-hidden="true" />
          <p>{t('estimator.workflow.home.regionalNote')}</p>
        </div>
      </div>
    </section>
  )
}

function ContactStep({
  form,
  onChange,
}: {
  form: EstimateForm
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
      <div className="estimate-step-content">
        <div className="estimate-form-grid">
          <TextField
            label={t('estimator.workflow.contact.name')}
            value={form.name}
            placeholder={t('estimator.workflow.contact.namePlaceholder')}
            onChange={(value) => onChange('name', value)}
          />
          <TextField
            label={t('estimator.workflow.contact.email')}
            type="email"
            value={form.email}
            placeholder="you@example.com"
            onChange={(value) => onChange('email', value)}
          />
          <TextField
            label={t('estimator.workflow.contact.phone')}
            type="tel"
            value={form.phone}
            placeholder="+34 ..."
            onChange={(value) => onChange('phone', value)}
          />
        </div>
        <div className="estimate-delivery-grid">
          <ToggleCard
            checked={form.deliveryEmail}
            icon={<Mail size={20} aria-hidden="true" />}
            title={t('estimator.workflow.contact.emailDelivery')}
            body={t('estimator.workflow.contact.emailDeliveryBody')}
            onChange={(checked) => onChange('deliveryEmail', checked)}
          />
          <ToggleCard
            checked={form.deliveryWhatsapp}
            icon={<MessageCircle size={20} aria-hidden="true" />}
            title={t('estimator.workflow.contact.whatsappDelivery')}
            body={t('estimator.workflow.contact.whatsappDeliveryBody')}
            onChange={(checked) => onChange('deliveryWhatsapp', checked)}
          />
        </div>
        <label className="estimate-consent">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(event) => onChange('consent', event.target.checked)}
          />
          <span>{t('estimator.workflow.contact.consent')}</span>
        </label>
      </div>
    </section>
  )
}

function ResultStep({
  status,
  errorMessage,
  report,
  formatter,
  onRetry,
}: {
  status: SubmissionStatus
  errorMessage: string
  report: EstimateReport | null
  formatter: Intl.NumberFormat
  onRetry: () => void
}) {
  const { t } = useTranslation()

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
        <button type="button" className="btn btn-navy" onClick={onRetry}>
          {t('estimator.workflow.result.retry')}
        </button>
      </div>
    )
  }

  if (!report) {
    return null
  }

  return (
    <section className="estimate-result-layout">
      <div className="estimate-result-main">
        <p className="estimate-wizard-kicker">{t('estimator.workflow.result.kicker')}</p>
        <h3>{t('estimator.workflow.result.title')}</h3>
        <p>{report.summary}</p>
        <div className="estimate-result-metrics">
          <Metric label={t('estimator.planLabel')} value={report.recommendedPlan} />
          <Metric
            label={t('estimator.workflow.result.costRange')}
            value={`${formatter.format(report.estimatedCostRange.min)} - ${formatter.format(report.estimatedCostRange.max)}`}
          />
          <Metric
            label={t('estimator.workflow.result.grantRange')}
            value={`${formatter.format(report.grantEstimateRange.min)} - ${formatter.format(report.grantEstimateRange.max)}`}
            accent
          />
        </div>
        <div className="estimate-result-section">
          <h4>{t('estimator.hazardsLabel')}</h4>
          <ul>
            {report.hazards.map((hazard) => (
              <li key={`${hazard.room}-${hazard.issue}`}>
                <Check size={17} aria-hidden="true" />
                <span>
                  <strong>{hazard.room}:</strong> {hazard.issue} {hazard.recommendation}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <aside className="estimate-result-side">
        <div className="estimate-confidence">
          <span>{report.confidence}%</span>
          <small>{t('estimator.workflow.result.confidence')}</small>
        </div>
        <p className="font-bold text-navy">{t('estimator.workflow.result.deliveryTitle')}</p>
        <p className="mt-2 text-sm text-text-mid">
          {buildDeliveryMessage(report, t('estimator.workflow.result.emailQueued'), t('estimator.workflow.result.whatsappQueued'))}
        </p>
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
          <a className="btn btn-green" href={PLAN_URLS[report.recommendedPlanId]} target="_blank" rel="noreferrer">
            {t('estimator.cta')}
            <ArrowRight size={20} aria-hidden="true" />
          </a>
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
  placeholder?: string
  type?: string
}) {
  return (
    <label className="estimate-field">
      {label}
      <input
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
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

function ToggleCard({
  checked,
  icon,
  title,
  body,
  onChange,
}: {
  checked: boolean
  icon: ReactNode
  title: string
  body: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className={`estimate-toggle-card ${checked ? 'is-selected' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{icon}</span>
      <strong>{title}</strong>
      <small>{body}</small>
    </label>
  )
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? 'is-accent' : ''}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}

function getStepCompletion(
  step: WizardStep,
  photos: EstimatePhoto[],
  form: EstimateForm,
  status: SubmissionStatus,
) {
  if (status === 'loading') {
    return false
  }

  if (step === 0) {
    return photos.length > 0
  }

  if (step === 1) {
    return Boolean(form.postcode && form.homeType && form.mainConcern && form.urgency)
  }

  if (step === 2) {
    const hasDelivery = form.deliveryEmail || form.deliveryWhatsapp
    const emailReady = !form.deliveryEmail || Boolean(form.email)
    const whatsappReady = !form.deliveryWhatsapp || Boolean(form.phone)
    return Boolean(form.name && hasDelivery && emailReady && whatsappReady && form.consent)
  }

  return true
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

function buildDeliveryMessage(report: EstimateReport, emailText: string, whatsappText: string) {
  const parts = []

  if (report.delivery.email !== 'not_requested') {
    parts.push(emailText)
  }

  if (report.delivery.whatsapp !== 'not_requested') {
    parts.push(whatsappText)
  }

  return parts.join(' ')
}
