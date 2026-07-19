import {
  finalizeAssessmentMedia,
  submitAssessmentRequest,
  type AssessmentMediaManifestItem,
  type AssessmentMediaUpload,
} from './assessmentRequests.ts'
import type { SafetyWizardState, WizardAudioBrief, WizardSubmissionPayload } from '../types/wizard.ts'

function isVideo(type: string, kind?: 'image' | 'video') {
  return kind === 'video' || type.startsWith('video/')
}

export function createWizardSubmissionPayload(state: SafetyWizardState): WizardSubmissionPayload {
  if (!state.userType) {
    throw new Error('Wizard user type is required before submission.')
  }

  return {
    wizardReference: state.wizardReference,
    source: 'home-safety-wizard',
    userType: state.userType,
    clientType: state.clientType,
    clientSiteCount: state.clientSiteCount,
    clientNeed: state.clientNeed,
    clientLocation: state.clientLocation || undefined,
    homeDetails: {
      homeType: state.homeType,
      floorCount: state.floorCount,
      stairsType: state.stairsType,
      bedroomCount: state.bedroomCount,
    },
    mobility: state.mobilityLevel,
    challenges: state.challenges,
    risks: state.currentRisks,
    areasOfConcern: state.areasOfConcern,
    urgency: state.urgency,
    notes: state.notes || undefined,
    photoMetadata: state.photos
      .filter((media) => !isVideo(media.type, media.kind))
      .map(({ file: _file, previewUrl: _previewUrl, ...media }) => ({ ...media, kind: 'image' as const })),
    videoMetadata: state.photos
      .filter((media) => isVideo(media.type, media.kind))
      .map(({ file: _file, previewUrl: _previewUrl, ...media }) => ({ ...media, kind: 'video' as const })),
    audioMetadata: (state.audioBriefs ?? [])
      .map(({ file: _file, previewUrl: _previewUrl, ...media }) => ({ ...media, kind: 'audio' as const })),
    voiceMetadata: state.voiceSession
      ? {
          ...state.voiceSession,
          transcript: state.voiceSession.transcript.map((message) => ({ ...message })),
        }
      : undefined,
    selectedPlan: state.result?.selectedPlan,
    estimatedPriceRange: state.userType === 'client' ? undefined : state.result?.priceRange,
    inspectionChoice: {
      booked: state.inspectionBooked,
      fee: state.inspectionFee,
      creditThreshold: state.inspectionCreditThreshold,
    },
    contactDetails: state.contact,
    submittedAt: new Date().toISOString(),
  }
}

export function createWizardMediaManifest(state: SafetyWizardState): AssessmentMediaManifestItem[] {
  const photoAndVideoMedia = state.photos.flatMap((media) => {
    if (!media.file) return []
    const kind = isVideo(media.type, media.kind) ? 'video' as const : 'image' as const

    return [{
      id: media.id,
      kind,
      name: media.name,
      room: media.room,
      size: media.size,
      type: media.type,
    }]
  })

  const audioMedia = (state.audioBriefs ?? []).flatMap((audio) => {
    if (!audio.file) return []

    return [{
      id: audio.id,
      kind: 'audio' as const,
      name: audio.name,
      room: 'other',
      size: audio.size,
      type: audio.type,
    }]
  })

  return [...photoAndVideoMedia, ...audioMedia]
}

async function uploadMediaFile(upload: AssessmentMediaUpload, file: File) {
  const formData = new FormData()
  formData.append('cacheControl', '3600')
  formData.append('', file)

  const response = await fetch(upload.signedUrl, {
    body: formData,
    method: 'PUT',
  })

  if (!response.ok) {
    let message = 'A selected media file could not be uploaded.'
    try {
      const body = await response.json() as { message?: string; error?: string }
      message = body.message ?? body.error ?? message
    } catch {
      // Keep the user-safe fallback message when Storage returns a non-JSON error.
    }
    throw new Error(message)
  }
}

async function uploadWizardMedia(state: SafetyWizardState, uploads: AssessmentMediaUpload[] | undefined) {
  const filesById = new Map(
    [
      ...state.photos.flatMap((media) => media.file ? [[media.id, media.file] as const] : []),
      ...(state.audioBriefs ?? []).flatMap((media) => media.file ? [[media.id, media.file] as const] : []),
    ],
  )

  if (!filesById.size) return
  if (!uploads || uploads.length !== filesById.size) {
    throw new Error('The assessment was saved, but media upload could not be prepared. Please try again.')
  }

  const uploadTasks = uploads.map((upload) => {
    const file = filesById.get(upload.mediaId)
    if (!file) throw new Error('The media upload response did not match the selected files.')
    return () => uploadMediaFile(upload, file)
  })

  for (let index = 0; index < uploadTasks.length; index += 2) {
    const results = await Promise.allSettled(uploadTasks.slice(index, index + 2).map((task) => task()))
    const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected')
    if (failure) throw failure.reason
  }
}

function attachStoredMedia(
  state: SafetyWizardState,
  storedMedia: Array<Pick<AssessmentMediaUpload, 'kind' | 'bucket' | 'objectPath'> & { mediaId: string }> | undefined,
) {
  const byId = new Map<string, { kind: 'image' | 'video'; bucket: string; objectPath: string }>()

  ;(storedMedia ?? []).forEach((media) => {
    if (media.kind === 'image' || media.kind === 'video') {
      byId.set(media.mediaId, {
        bucket: media.bucket,
        kind: media.kind,
        objectPath: media.objectPath,
      })
    }
  })

  return state.photos.map((media) => {
    const stored = byId.get(media.id)
    return stored ? {
      ...media,
      kind: stored.kind,
      storageBucket: stored.bucket,
      storagePath: stored.objectPath,
    } : media
  })
}

function attachStoredAudio(
  state: SafetyWizardState,
  storedMedia: Array<Pick<AssessmentMediaUpload, 'kind' | 'bucket' | 'objectPath'> & { mediaId: string }> | undefined,
): WizardAudioBrief[] {
  const byId = new Map<string, { kind: 'audio'; bucket: string; objectPath: string }>()

  ;(storedMedia ?? []).forEach((media) => {
    if (media.kind === 'audio') {
      byId.set(media.mediaId, {
        bucket: media.bucket,
        kind: media.kind,
        objectPath: media.objectPath,
      })
    }
  })

  return (state.audioBriefs ?? []).map((audio) => {
    const stored = byId.get(audio.id)
    return stored ? {
      ...audio,
      kind: 'audio',
      storageBucket: stored.bucket,
      storagePath: stored.objectPath,
    } : audio
  })
}

export async function submitSafetyWizard(state: SafetyWizardState) {
  const payload = createWizardSubmissionPayload(state)
  const summary = JSON.stringify(payload, null, 2)
  const mediaManifest = createWizardMediaManifest(state)

  const submission = await submitAssessmentRequest({
    name: state.contact.fullName,
    phone: state.contact.phone,
    email: state.contact.email,
    city: state.contact.city,
    preferredContactMethod: state.contact.preferredMethod,
    preferredDate: '',
    message: summary,
    selectedPlan: state.result?.selectedPlan ?? 'home-safety-wizard',
    consentAt: new Date().toISOString(),
    consentConfirmed: state.contact.consent,
    source: 'home-safety-wizard',
    wizardReference: state.wizardReference,
    mediaManifest,
  })

  if (!mediaManifest.length) {
    return { payload, photos: state.photos, audioBriefs: state.audioBriefs ?? [] }
  }

  if (!submission.id || !submission.uploadToken) {
    throw new Error('The assessment was saved, but the secure media upload session was not created.')
  }

  try {
    await uploadWizardMedia(state, submission.uploads)
  } catch (error) {
    try {
      await finalizeAssessmentMedia(submission.id, submission.uploadToken, 'failed')
    } catch {
      // Preserve the original upload error; the pending server record remains non-actionable.
    }
    throw error
  }

  let finalized: Awaited<ReturnType<typeof finalizeAssessmentMedia>>
  try {
    finalized = await finalizeAssessmentMedia(submission.id, submission.uploadToken, 'complete')
  } catch (firstError) {
    try {
      finalized = await finalizeAssessmentMedia(submission.id, submission.uploadToken, 'complete')
    } catch {
      // Leave the upload pending on infrastructure errors so valid media is never deleted.
      throw firstError
    }
  }

  return {
    payload,
    photos: attachStoredMedia(state, finalized.mediaManifest),
    audioBriefs: attachStoredAudio(state, finalized.mediaManifest),
  }
}
