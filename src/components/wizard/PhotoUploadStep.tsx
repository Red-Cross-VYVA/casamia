import { AlertCircle, Camera, CheckCircle2, CircleHelp, ImagePlus, LoaderCircle, RotateCcw, Trash2, Upload, Video } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'

import type { WizardCopy } from '../../config/wizardCopy'
import {
  analyseSafetyPhoto,
  SafetyPhotoAnalysisError,
  type SafetyPhotoContext,
} from '../../services/safetyPhotoAnalysis'
import { inferRoomFromFileName } from '../../services/roomPhotoClassification'
import type { WizardPhoto, WizardRoom } from '../../types/wizard'
import { WizardStep } from './WizardStep'

type PhotoUploadStepProps = {
  analysisContext: SafetyPhotoContext
  copy: WizardCopy
  locale: string
  photos: WizardPhoto[]
  roomLabels: Partial<Record<WizardRoom | 'other', string>>
  onChange: (photos: WizardPhoto[]) => void
}

type MediaKind = 'image' | 'video'

const acceptedMediaTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const
const acceptedMediaTypeSet = new Set<string>(acceptedMediaTypes)
const maxFiles = 8
const maxVideos = 3
const maxImageSize = 8 * 1024 * 1024
const maxVideoSize = 50 * 1024 * 1024
const maxTotalSize = 100 * 1024 * 1024

export function PhotoUploadStep({ analysisContext, copy, locale, photos, roomLabels, onChange }: PhotoUploadStepProps) {
  const inputId = useId()
  const rulesId = `${inputId}-rules`
  const countId = `${inputId}-count`
  const errorId = `${inputId}-error`
  const previewUrlsRef = useRef(new Map<string, string>())
  const externalPreviewUrlsRef = useRef(new Map<string, string>())
  const photosRef = useRef(photos)
  const mountedRef = useRef(true)
  const [, refreshPreviews] = useState(0)
  const [fileError, setFileError] = useState('')
  const unavailablePhotos = photos.filter(
    (photo) => getPhotoKind(photo) === 'image' && photo.analysisStatus === 'unavailable',
  )

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    const currentIds = new Set(photos.map((photo) => photo.id))
    let changed = false

    previewUrlsRef.current.forEach((url, photoId) => {
      if (!currentIds.has(photoId)) {
        URL.revokeObjectURL(url)
        previewUrlsRef.current.delete(photoId)
        changed = true
      }
    })

    externalPreviewUrlsRef.current.forEach((url, photoId) => {
      const currentPhoto = photos.find((photo) => photo.id === photoId)
      if (!currentPhoto || currentPhoto.previewUrl !== url) {
        URL.revokeObjectURL(url)
        externalPreviewUrlsRef.current.delete(photoId)
      }
    })

    photos.forEach((photo) => {
      if (photo.file && !previewUrlsRef.current.has(photo.id)) {
        previewUrlsRef.current.set(photo.id, URL.createObjectURL(photo.file))
        changed = true
      }
      if (photo.previewUrl?.startsWith('blob:')) {
        externalPreviewUrlsRef.current.set(photo.id, photo.previewUrl)
      }
    })

    if (changed) refreshPreviews((version) => version + 1)
  }, [photos])

  useEffect(() => {
    const previewUrls = previewUrlsRef.current
    const externalPreviewUrls = externalPreviewUrlsRef.current
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
      previewUrls.clear()
      externalPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
      externalPreviewUrls.clear()
    }
  }, [])

  const emitChange = (nextPhotos: WizardPhoto[]) => {
    photosRef.current = nextPhotos
    onChange(nextPhotos)
  }

  const analysePhoto = async (photo: WizardPhoto) => {
    if (!photo.file || getPhotoKind(photo) !== 'image') return

    try {
      const result = await analyseSafetyPhoto(photo.file, {
        assignedRoom: photo.room,
        context: analysisContext,
        locale,
      })
      if (!mountedRef.current) return

      const currentPhoto = photosRef.current.find((candidate) => candidate.id === photo.id)
      if (!currentPhoto) return
      const manuallyAssigned = currentPhoto.roomDetectionStatus === 'manual'

      emitChange(photosRef.current.map((candidate) => candidate.id === photo.id ? {
        ...candidate,
        room: manuallyAssigned ? candidate.room : toWizardPhotoRoom(result.room),
        roomDetectionStatus: manuallyAssigned ? 'manual' : 'detected',
        roomDetectionSource: manuallyAssigned ? undefined : 'image',
        roomDetectionConfidence: result.roomConfidence,
        analysisStatus: 'analysed',
        analysis: result,
        analysisError: undefined,
      } : candidate))
    } catch (error) {
      if (!mountedRef.current) return
      emitChange(photosRef.current.map((candidate) => candidate.id === photo.id ? {
        ...candidate,
        roomDetectionStatus: candidate.room === 'other' ? 'unavailable' : candidate.roomDetectionStatus,
        analysisStatus: 'unavailable',
        analysisError: getAnalysisFailureMessage(error, copy),
      } : candidate))
    }
  }

  const retryPhoto = (photo: WizardPhoto) => {
    if (!photo.file || getPhotoKind(photo) !== 'image') return

    const retryingPhoto = {
      ...photo,
      analysisStatus: 'analysing' as const,
      analysisError: undefined,
    }
    emitChange(photosRef.current.map((candidate) => candidate.id === photo.id ? retryingPhoto : candidate))
    void analysePhoto(retryingPhoto)
  }

  const retryUnavailablePhotos = () => {
    unavailablePhotos.forEach((photo) => retryPhoto(photo))
  }

  const addPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const next: WizardPhoto[] = []
    const messages = new Set<string>()
    let nextFileCount = photos.length
    let nextVideoCount = photos.filter((photo) => getPhotoKind(photo) === 'video').length
    let nextTotalSize = photos.reduce((total, photo) => total + photo.size, 0)

    files.forEach((file) => {
      const kind = getFileKind(file)

      if (!kind) {
        messages.add(copy.photos.errors.unsupported(file.name))
        return
      }

      if (nextFileCount >= maxFiles) {
        messages.add(copy.photos.errors.tooManyFiles)
        return
      }

      if (kind === 'video' && nextVideoCount >= maxVideos) {
        messages.add(copy.photos.errors.tooManyVideos)
        return
      }

      if (kind === 'image' && file.size > maxImageSize) {
        messages.add(copy.photos.errors.imageTooLarge(file.name))
        return
      }

      if (kind === 'video' && file.size > maxVideoSize) {
        messages.add(copy.photos.errors.videoTooLarge(file.name))
        return
      }

      if (nextTotalSize + file.size > maxTotalSize) {
        messages.add(copy.photos.errors.totalTooLarge)
        return
      }

      const inferredRoom = inferRoomFromFileName(file.name)
      const media = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        kind,
        room: inferredRoom,
        roomDetectionStatus: kind === 'image'
          ? 'detecting' as const
          : inferredRoom === 'other' ? 'unavailable' as const : 'detected' as const,
        roomDetectionSource: inferredRoom === 'other' ? undefined : 'filename' as const,
        analysisStatus: kind === 'image' ? 'analysing' as const : 'unavailable' as const,
        file,
      } satisfies WizardPhoto & { kind: MediaKind }

      next.push(media)
      nextFileCount += 1
      nextTotalSize += file.size
      if (kind === 'video') nextVideoCount += 1
    })

    setFileError(Array.from(messages).join(' '))
    if (next.length) {
      emitChange([...photosRef.current, ...next])
      next.forEach((photo) => void analysePhoto(photo))
    }
    event.target.value = ''
  }

  const removePhoto = (photoId: string) => {
    const target = photosRef.current.find((photo) => photo.id === photoId)
    const ownedPreviewUrl = previewUrlsRef.current.get(photoId)

    if (ownedPreviewUrl) {
      URL.revokeObjectURL(ownedPreviewUrl)
      previewUrlsRef.current.delete(photoId)
    }
    if (target?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl)
      externalPreviewUrlsRef.current.delete(photoId)
    }

    setFileError('')
    emitChange(photosRef.current.filter((photo) => photo.id !== photoId))
  }

  const updateRoom = (photoId: string, room: WizardPhoto['room']) => {
    emitChange(photosRef.current.map((photo) => photo.id === photoId ? {
      ...photo,
      room,
      roomDetectionStatus: 'manual',
      roomDetectionSource: undefined,
      roomDetectionConfidence: undefined,
    } : photo))
  }

  return (
    <WizardStep title={copy.photos.title} body={copy.photos.body} hint={copy.micro.optional} icon={<Camera size={28} />}>
      <div className="safety-wizard-upload">
        <div className="safety-wizard-upload-toolbar">
          <input
            id={inputId}
            type="file"
            accept={acceptedMediaTypes.join(',')}
            aria-describedby={`${rulesId} ${countId}${fileError ? ` ${errorId}` : ''}`}
            multiple
            onChange={addPhotos}
          />
          <label htmlFor={inputId} className="safety-wizard-upload-button">
            <Upload size={22} aria-hidden="true" />
            {copy.photos.add}
          </label>
          <p id={countId} className="safety-wizard-upload-count" aria-live="polite">
            {copy.photos.count(photos.length)}
          </p>
        </div>
        <p id={rulesId} className="safety-wizard-upload-rules">{copy.photos.rules}</p>
        {fileError ? <p id={errorId} className="safety-wizard-upload-error" role="alert">{fileError}</p> : null}
        {unavailablePhotos.length ? (
          <div className="safety-wizard-analysis-alert" role="alert">
            <span aria-hidden="true"><AlertCircle size={22} /></span>
            <div>
              <strong>{copy.photos.analysisUnavailableTitle}</strong>
              <p>{copy.photos.analysisUnavailableBody}</p>
            </div>
            <button type="button" onClick={retryUnavailablePhotos}>
              <RotateCcw size={17} aria-hidden="true" />
              {copy.photos.retryAll}
            </button>
          </div>
        ) : null}

        {photos.length ? (
          <div className="safety-wizard-photo-grid" role="list">
            {photos.map((photo) => {
              const kind = getPhotoKind(photo)
              const previewUrl = previewUrlsRef.current.get(photo.id) ?? photo.previewUrl
              const nameId = `${inputId}-${photo.id}-name`
              const detectionId = `${inputId}-${photo.id}-detection`
              const kindLabel = kind === 'video' ? copy.photos.video : copy.photos.image

              return (
                <article key={photo.id} role="listitem" aria-labelledby={nameId}>
                  <div className="safety-wizard-media-preview">
                    {previewUrl && kind === 'video' ? (
                      <video src={previewUrl} controls playsInline preload="metadata" aria-label={`${kindLabel}: ${photo.name}`} />
                    ) : previewUrl ? (
                      <img src={previewUrl} alt={`${kindLabel}: ${photo.name}`} />
                    ) : (
                      <span className="safety-wizard-photo-placeholder" aria-hidden="true">
                        {kind === 'video' ? <Video size={30} /> : <ImagePlus size={30} />}
                      </span>
                    )}
                    <span className="safety-wizard-media-kind">
                      {kind === 'video' ? <Video size={14} aria-hidden="true" /> : <ImagePlus size={14} aria-hidden="true" />}
                      {kindLabel}
                    </span>
                  </div>
                  <div className="safety-wizard-media-card-body">
                    <div className="safety-wizard-media-meta">
                      <strong id={nameId} title={photo.name}>{photo.name}</strong>
                      <span>{kindLabel} · {formatFileSize(photo.size)}</span>
                    </div>
                    <div className="safety-wizard-media-controls">
                      <label>
                        <span className="safety-wizard-media-room-label">{copy.photos.room}</span>
                        <select
                          value={photo.room}
                          aria-describedby={photo.roomDetectionStatus && photo.roomDetectionStatus !== 'manual' ? detectionId : undefined}
                          onChange={(event) => updateRoom(photo.id, event.target.value as WizardPhoto['room'])}
                        >
                          {Object.entries(roomLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                        </select>
                        {photo.roomDetectionStatus && photo.roomDetectionStatus !== 'manual' ? (
                          <span
                            id={detectionId}
                            className={`safety-wizard-room-detection is-${photo.roomDetectionStatus}`}
                            aria-live="polite"
                          >
                            {photo.roomDetectionStatus === 'detecting' ? <LoaderCircle size={13} aria-hidden="true" /> : null}
                            {photo.roomDetectionStatus === 'detected' ? <CheckCircle2 size={13} aria-hidden="true" /> : null}
                            {photo.roomDetectionStatus === 'unavailable' ? <CircleHelp size={13} aria-hidden="true" /> : null}
                            {photo.roomDetectionStatus === 'detecting'
                              ? copy.photos.detectingRoom
                              : photo.roomDetectionStatus === 'detected'
                                ? photo.roomDetectionSource === 'filename'
                                  ? copy.photos.roomSuggested
                                  : copy.photos.roomDetected
                                : copy.photos.chooseRoom}
                          </span>
                        ) : null}
                        {kind === 'image' ? (
                          <span
                            className={`safety-wizard-photo-analysis-status is-${photo.analysisStatus ?? 'unavailable'}`}
                            aria-live="polite"
                          >
                            {photo.analysisStatus === 'analysing' ? <LoaderCircle size={13} aria-hidden="true" /> : null}
                            {photo.analysisStatus === 'analysed' ? <CheckCircle2 size={13} aria-hidden="true" /> : null}
                            {photo.analysisStatus === 'unavailable' ? <CircleHelp size={13} aria-hidden="true" /> : null}
                            {photo.analysisStatus === 'analysing'
                              ? copy.photos.analysingPhoto
                              : photo.analysisStatus === 'analysed'
                                ? `${copy.photos.analysedPhoto} - ${copy.photos.findingsFound(photo.analysis?.findings.length ?? 0)}`
                                : photo.analysisError ?? copy.photos.analysisUnavailable}
                          </span>
                        ) : null}
                      </label>
                      {kind === 'image' && photo.analysisStatus === 'unavailable' ? (
                        <button
                          className="safety-wizard-analysis-retry"
                          type="button"
                          onClick={() => retryPhoto(photo)}
                        >
                          <RotateCcw size={17} aria-hidden="true" />
                          {copy.photos.retryAnalysis}
                        </button>
                      ) : null}
                      <button type="button" onClick={() => removePhoto(photo.id)} aria-label={`${copy.photos.remove}: ${photo.name}`}>
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : <p className="safety-wizard-empty">{copy.photos.empty}</p>}
      </div>
    </WizardStep>
  )
}

function getFileKind(file: File): MediaKind | null {
  if (!acceptedMediaTypeSet.has(file.type)) return null
  return file.type.startsWith('video/') ? 'video' : 'image'
}

function getPhotoKind(photo: WizardPhoto): MediaKind {
  const explicitKind = (photo as WizardPhoto & { kind?: MediaKind }).kind
  if (explicitKind === 'video' || photo.type.startsWith('video/')) return 'video'
  return 'image'
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    const megabytes = bytes / (1024 * 1024)
    return `${megabytes >= 10 ? megabytes.toFixed(0) : megabytes.toFixed(1)} MB`
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function toWizardPhotoRoom(room: string): WizardPhoto['room'] {
  if (['bathroom', 'bedroom', 'kitchen', 'living-room', 'stairs', 'entrance', 'outdoor'].includes(room)) {
    return room as WizardPhoto['room']
  }

  return 'other'
}

function getAnalysisFailureMessage(error: unknown, copy: WizardCopy) {
  if (!(error instanceof SafetyPhotoAnalysisError)) return copy.photos.analysisErrors.unavailable

  switch (error.code) {
    case 'IMAGE_INVALID':
      return copy.photos.analysisErrors.invalid
    case 'VISION_NOT_CONFIGURED':
      return copy.photos.analysisErrors.notConfigured
    case 'VISION_RATE_LIMITED':
      return copy.photos.analysisErrors.rateLimited
    case 'VISION_TIMEOUT':
      return copy.photos.analysisErrors.timedOut
    default:
      return copy.photos.analysisErrors.unavailable
  }
}
