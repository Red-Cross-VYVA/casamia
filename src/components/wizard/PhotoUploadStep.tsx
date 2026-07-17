import { Camera, ImagePlus, Trash2, Upload, Video } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'

import type { WizardCopy } from '../../config/wizardCopy'
import type { WizardPhoto, WizardRoom } from '../../types/wizard'
import { WizardStep } from './WizardStep'

type PhotoUploadStepProps = {
  copy: WizardCopy
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

export function PhotoUploadStep({ copy, photos, roomLabels, onChange }: PhotoUploadStepProps) {
  const inputId = useId()
  const rulesId = `${inputId}-rules`
  const countId = `${inputId}-count`
  const errorId = `${inputId}-error`
  const previewUrlsRef = useRef(new Map<string, string>())
  const externalPreviewUrlsRef = useRef(new Map<string, string>())
  const [, refreshPreviews] = useState(0)
  const [fileError, setFileError] = useState('')

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

  useEffect(() => () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    previewUrlsRef.current.clear()
    externalPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    externalPreviewUrlsRef.current.clear()
  }, [])

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

      const media = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        kind,
        room: 'other' as const,
        file,
      } satisfies WizardPhoto & { kind: MediaKind }

      next.push(media)
      nextFileCount += 1
      nextTotalSize += file.size
      if (kind === 'video') nextVideoCount += 1
    })

    setFileError(Array.from(messages).join(' '))
    if (next.length) onChange([...photos, ...next])
    event.target.value = ''
  }

  const removePhoto = (photoId: string) => {
    const target = photos.find((photo) => photo.id === photoId)
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
    onChange(photos.filter((photo) => photo.id !== photoId))
  }

  const updateRoom = (photoId: string, room: WizardPhoto['room']) => {
    onChange(photos.map((photo) => photo.id === photoId ? { ...photo, room } : photo))
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

        {photos.length ? (
          <div className="safety-wizard-photo-grid" role="list">
            {photos.map((photo) => {
              const kind = getPhotoKind(photo)
              const previewUrl = previewUrlsRef.current.get(photo.id) ?? photo.previewUrl
              const nameId = `${inputId}-${photo.id}-name`
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
                        <span>{copy.photos.room}</span>
                        <select value={photo.room} onChange={(event) => updateRoom(photo.id, event.target.value as WizardPhoto['room'])}>
                          {Object.entries(roomLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                        </select>
                      </label>
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
