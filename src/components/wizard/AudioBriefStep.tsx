import { AlertCircle, AudioLines, Mic, Square, Trash2, Upload } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'

import type { WizardCopy } from '../../config/wizardCopy'
import type { WizardAudioBrief } from '../../types/wizard'
import { WizardStep } from './WizardStep'

type AudioBriefStepProps = {
  audioBriefs: WizardAudioBrief[]
  copy: WizardCopy
  fallbackNote: string
  onChange: (audioBriefs: WizardAudioBrief[]) => void
  onFallbackNoteChange: (note: string) => void
}

const acceptedAudioTypes = [
  'audio/mpeg',
  'audio/mp4',
  'audio/webm',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/x-m4a',
] as const
const acceptedAudioTypeSet = new Set<string>(acceptedAudioTypes)
const maxAudioFiles = 2
const maxAudioSize = 25 * 1024 * 1024
const maxTotalAudioSize = 50 * 1024 * 1024

export function AudioBriefStep({
  audioBriefs,
  copy,
  fallbackNote,
  onChange,
  onFallbackNoteChange,
}: AudioBriefStepProps) {
  const inputId = useId()
  const rulesId = `${inputId}-rules`
  const countId = `${inputId}-count`
  const errorId = `${inputId}-error`
  const previewUrlsRef = useRef(new Map<string, string>())
  const audioRef = useRef(audioBriefs)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const recordingStartedAtRef = useRef(0)
  const [, refreshPreviews] = useState(0)
  const [fileError, setFileError] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const canRecord = typeof window !== 'undefined'
    && typeof MediaRecorder !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia)

  useEffect(() => {
    audioRef.current = audioBriefs
  }, [audioBriefs])

  useEffect(() => {
    const currentIds = new Set(audioBriefs.map((audio) => audio.id))
    let changed = false

    previewUrlsRef.current.forEach((url, audioId) => {
      if (!currentIds.has(audioId)) {
        URL.revokeObjectURL(url)
        previewUrlsRef.current.delete(audioId)
        changed = true
      }
    })

    audioBriefs.forEach((audio) => {
      if (audio.file && !previewUrlsRef.current.has(audio.id)) {
        previewUrlsRef.current.set(audio.id, URL.createObjectURL(audio.file))
        changed = true
      }
    })

    if (changed) refreshPreviews((version) => version + 1)
  }, [audioBriefs])

  useEffect(() => {
    const previewUrls = previewUrlsRef.current

    return () => {
      recorderRef.current?.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
      previewUrls.clear()
    }
  }, [])

  const emitChange = (nextAudioBriefs: WizardAudioBrief[]) => {
    audioRef.current = nextAudioBriefs
    onChange(nextAudioBriefs)
  }

  const validateFile = (file: File, nextCount: number, nextTotalSize: number) => {
    const type = normaliseMimeType(file.type)

    if (!acceptedAudioTypeSet.has(type)) {
      return copy.audio.errors.unsupported(file.name)
    }
    if (nextCount >= maxAudioFiles) {
      return copy.audio.errors.tooMany
    }
    if (file.size > maxAudioSize) {
      return copy.audio.errors.tooLarge(file.name)
    }
    if (nextTotalSize + file.size > maxTotalAudioSize) {
      return copy.audio.errors.totalTooLarge
    }
    return ''
  }

  const addAudioFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const next: WizardAudioBrief[] = []
    const messages = new Set<string>()
    let nextCount = audioBriefs.length
    let nextTotalSize = audioBriefs.reduce((total, audio) => total + audio.size, 0)

    files.forEach((file) => {
      const validationError = validateFile(file, nextCount, nextTotalSize)
      if (validationError) {
        messages.add(validationError)
        return
      }

      next.push(createAudioBrief(file))
      nextCount += 1
      nextTotalSize += file.size
    })

    setFileError(Array.from(messages).join(' '))
    if (next.length) emitChange([...audioRef.current, ...next])
    event.target.value = ''
  }

  const startRecording = async () => {
    if (!canRecord || isRecording) return

    setFileError('')
    const nextCount = audioRef.current.length
    const nextTotalSize = audioRef.current.reduce((total, audio) => total + audio.size, 0)

    if (nextCount >= maxAudioFiles) {
      setFileError(copy.audio.errors.tooMany)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getRecorderMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      recordingStartedAtRef.current = Date.now()

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const type = normaliseMimeType(recorder.mimeType || mimeType || 'audio/webm')
        const blob = new Blob(chunksRef.current, { type })
        const extension = getAudioExtension(type)
        const file = new File([blob], `casamia-audio-${new Date().toISOString().replaceAll(':', '-')}.${extension}`, { type })
        const validationError = validateFile(file, audioRef.current.length, nextTotalSize)

        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        recorderRef.current = null
        setIsRecording(false)

        if (validationError) {
          setFileError(validationError)
          return
        }

        emitChange([
          ...audioRef.current,
          createAudioBrief(file, Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000))),
        ])
      }

      recorder.start()
      setIsRecording(true)
    } catch (error) {
      setIsRecording(false)
      setFileError(error instanceof DOMException && error.name === 'NotAllowedError'
        ? copy.audio.permission
        : copy.audio.errors.recordingFailed)
    }
  }

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
  }

  const removeAudio = (audioId: string) => {
    const previewUrl = previewUrlsRef.current.get(audioId)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      previewUrlsRef.current.delete(audioId)
    }
    setFileError('')
    emitChange(audioRef.current.filter((audio) => audio.id !== audioId))
  }

  return (
    <WizardStep title={copy.audio.title} body={copy.audio.body} hint={copy.micro.optional} icon={<AudioLines size={28} />}>
      <div className="safety-wizard-upload safety-wizard-audio-brief">
        <div className="safety-wizard-upload-toolbar">
          <input
            id={inputId}
            type="file"
            accept={acceptedAudioTypes.join(',')}
            aria-describedby={`${rulesId} ${countId}${fileError ? ` ${errorId}` : ''}`}
            multiple
            onChange={addAudioFiles}
          />
          <label htmlFor={inputId} className="safety-wizard-upload-button">
            <Upload size={22} aria-hidden="true" />
            {copy.audio.add}
          </label>
          {canRecord ? (
            <button className="safety-wizard-upload-button is-secondary" type="button" onClick={isRecording ? stopRecording : startRecording}>
              {isRecording ? <Square size={19} aria-hidden="true" /> : <Mic size={21} aria-hidden="true" />}
              {isRecording ? copy.audio.stop : copy.audio.record}
            </button>
          ) : null}
          <p id={countId} className="safety-wizard-upload-count" aria-live="polite">
            {copy.audio.count(audioBriefs.length)}
          </p>
        </div>

        <p id={rulesId} className="safety-wizard-upload-rules">
          {copy.audio.rules}
        </p>
        {!canRecord ? <p className="safety-wizard-upload-rules">{copy.audio.unsupportedRecorder}</p> : null}
        {isRecording ? (
          <div className="safety-wizard-audio-recording" role="status">
            <span aria-hidden="true" />
            {copy.audio.recording}
          </div>
        ) : null}
        {fileError ? <p id={errorId} className="safety-wizard-upload-error" role="alert"><AlertCircle size={16} /> {fileError}</p> : null}

        {audioBriefs.length ? (
          <div className="safety-wizard-audio-list" role="list">
            {audioBriefs.map((audio) => {
              const previewUrl = previewUrlsRef.current.get(audio.id) ?? audio.previewUrl
              return (
                <article key={audio.id} role="listitem">
                  <AudioLines size={22} aria-hidden="true" />
                  <div>
                    <strong title={audio.name}>{audio.name}</strong>
                    <span>{formatFileSize(audio.size)}{audio.durationSeconds ? ` · ${formatDuration(audio.durationSeconds)}` : ''}</span>
                    {previewUrl ? <audio controls src={previewUrl} preload="metadata" /> : null}
                  </div>
                  <button type="button" onClick={() => removeAudio(audio.id)} aria-label={`${copy.audio.remove}: ${audio.name}`}>
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </article>
              )
            })}
          </div>
        ) : <p className="safety-wizard-empty">{copy.audio.empty}</p>}

        <label className="safety-wizard-field">
          <span>{copy.notes.title}</span>
          <textarea
            placeholder={copy.notes.placeholder}
            rows={4}
            value={fallbackNote}
            onChange={(event) => onFallbackNoteChange(event.target.value)}
          />
        </label>
      </div>
    </WizardStep>
  )
}

function createAudioBrief(file: File, durationSeconds?: number): WizardAudioBrief {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: normaliseMimeType(file.type),
    kind: 'audio',
    durationSeconds,
    file,
  }
}

function normaliseMimeType(type: string) {
  return type.toLowerCase().split(';')[0].trim()
}

function getRecorderMimeType() {
  const candidates = ['audio/webm', 'audio/mp4', 'audio/ogg']
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? ''
}

function getAudioExtension(type: string) {
  if (type === 'audio/mpeg') return 'mp3'
  if (type === 'audio/mp4' || type === 'audio/x-m4a') return 'm4a'
  if (type === 'audio/wav') return 'wav'
  if (type === 'audio/ogg') return 'ogg'
  if (type === 'audio/aac') return 'aac'
  return 'webm'
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    const megabytes = bytes / (1024 * 1024)
    return `${megabytes >= 10 ? megabytes.toFixed(0) : megabytes.toFixed(1)} MB`
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function formatDuration(durationSeconds: number) {
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
