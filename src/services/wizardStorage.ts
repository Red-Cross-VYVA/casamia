import {
  WIZARD_CALLBACK_TIME_WINDOWS,
  type SafetyWizardState,
  type WizardCallbackTimeWindow,
  type WizardPhoto,
} from '../types/wizard.ts'

export const SAFETY_WIZARD_STORAGE_KEY = 'casamia-home-safety-wizard-v1'

type PersistedWizardState = Omit<SafetyWizardState, 'photos'> & {
  photos: Array<Omit<WizardPhoto, 'file' | 'previewUrl'>>
}

export function saveWizardState(state: SafetyWizardState) {
  if (typeof window === 'undefined') return

  const callbackFlow = state.inputMethods.includes('callback')
  const stateToPersist: SafetyWizardState = callbackFlow
    ? {
        ...state,
        currentStep: state.currentStep === 'callback-confirmation' ? 'methods' : state.currentStep,
        callbackRequest: {
          preferredDate: '',
          preferredTimeWindow: '',
          note: '',
          consent: false,
        },
        callbackSubmission: undefined,
        contact: {
          ...state.contact,
          fullName: '',
          phone: '',
          email: '',
          city: '',
        },
        submitted: false,
      }
    : state

  const persisted: PersistedWizardState = {
    ...stateToPersist,
    // Browser File objects cannot be represented in localStorage. Keeping only their
    // names would make a restored wizard look as though media would still be uploaded.
    photos: stateToPersist.photos.flatMap(({ file: _file, previewUrl: _previewUrl, ...media }) =>
      media.storagePath ? [media] : [],
    ),
  }

  window.localStorage.setItem(SAFETY_WIZARD_STORAGE_KEY, JSON.stringify(persisted))
}

export function loadWizardState(): SafetyWizardState | null {
  if (typeof window === 'undefined') return null

  try {
    const saved = window.localStorage.getItem(SAFETY_WIZARD_STORAGE_KEY)
    if (!saved) return null

    const parsed = JSON.parse(saved) as Omit<SafetyWizardState, 'currentStep' | 'callbackRequest'> & {
      currentStep: SafetyWizardState['currentStep'] | 'relationship'
      callbackRequest?: Partial<SafetyWizardState['callbackRequest']>
      relationship?: unknown
      voiceRecording?: unknown
    }
    const {
      relationship: _obsoleteRelationship,
      voiceRecording: _obsoleteVoiceRecording,
      ...migrated
    } = parsed
    return {
      ...migrated,
      currentStep: parsed.currentStep === 'relationship'
        ? (parsed.userType ? 'methods' : 'user-type')
        : parsed.currentStep,
      photos: (parsed.photos ?? []).filter((media) => Boolean(media.storagePath)),
      callbackRequest: {
        preferredDate: typeof parsed.callbackRequest?.preferredDate === 'string'
          ? parsed.callbackRequest.preferredDate
          : '',
        preferredTimeWindow: isCallbackTimeWindow(parsed.callbackRequest?.preferredTimeWindow)
          ? parsed.callbackRequest.preferredTimeWindow
          : '' as const,
        note: typeof parsed.callbackRequest?.note === 'string' ? parsed.callbackRequest.note : '',
        consent: parsed.callbackRequest?.consent === true,
      },
    }
  } catch {
    return null
  }
}

function isCallbackTimeWindow(value: unknown): value is WizardCallbackTimeWindow {
  return typeof value === 'string'
    && (WIZARD_CALLBACK_TIME_WINDOWS as readonly string[]).includes(value)
}

export function clearWizardState() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SAFETY_WIZARD_STORAGE_KEY)
  }
}

export function createWizardReference() {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replaceAll('-', '').slice(0, 6)
      : Math.random().toString(36).slice(2, 8)

  return `CM-${random.toUpperCase()}`
}
