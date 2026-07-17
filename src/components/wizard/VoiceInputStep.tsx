import { Mic, Pause, Play, Square, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { WizardCopy } from '../../config/wizardCopy'
import type { WizardVoiceRecording } from '../../types/wizard'
import { WizardStep } from './WizardStep'

type VoiceInputStepProps = {
  copy: WizardCopy
  recording?: WizardVoiceRecording
  fallbackNote: string
  onChange: (recording?: WizardVoiceRecording) => void
  onFallbackNoteChange: (note: string) => void
}

export function VoiceInputStep({ copy, recording, fallbackNote, onChange, onFallbackNoteChange }: VoiceInputStepProps) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused'>('idle')
  const supported = typeof window !== 'undefined' && 'MediaRecorder' in window && Boolean(navigator.mediaDevices?.getUserMedia)

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const start = async () => {
    if (!supported) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      streamRef.current = stream
      recorderRef.current = recorder
      startedAtRef.current = Date.now()

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size) chunksRef.current.push(event.data)
      })
      recorder.addEventListener('stop', () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        onChange({
          id: crypto.randomUUID(),
          durationSeconds: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
          mimeType: blob.type,
          size: blob.size,
          recordedAt: new Date().toISOString(),
          blob,
          previewUrl: URL.createObjectURL(blob),
        })
        stream.getTracks().forEach((track) => track.stop())
        setStatus('idle')
      })

      recorder.start()
      setStatus('recording')
    } catch {
      setStatus('idle')
    }
  }

  const togglePause = () => {
    const recorder = recorderRef.current
    if (!recorder) return
    if (recorder.state === 'recording') {
      recorder.pause()
      setStatus('paused')
    } else if (recorder.state === 'paused') {
      recorder.resume()
      setStatus('recording')
    }
  }

  const stop = () => recorderRef.current?.state !== 'inactive' && recorderRef.current?.stop()

  const remove = () => {
    if (recording?.previewUrl) URL.revokeObjectURL(recording.previewUrl)
    onChange(undefined)
  }

  return (
    <WizardStep title={copy.voice.title} body={copy.voice.body} hint={copy.micro.optional} icon={<Mic size={28} />}>
      {!supported ? (
        <div className="safety-wizard-voice-fallback">
          <div className="safety-wizard-notice" role="status">{copy.voice.unsupported}</div>
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
      ) : (
        <div className="safety-wizard-recorder">
          <div className={`safety-wizard-mic${status !== 'idle' ? ' is-live' : ''}`} aria-hidden="true">
            <Mic size={38} />
          </div>
          {recording ? (
            <div className="safety-wizard-recording-ready">
              <strong>{copy.voice.recorded}</strong>
              <span>{recording.durationSeconds}s</span>
              {recording.previewUrl ? <audio controls src={recording.previewUrl} /> : null}
              <button type="button" onClick={remove}><Trash2 size={18} /> {copy.voice.delete}</button>
            </div>
          ) : (
            <div className="safety-wizard-recorder-actions">
              {status === 'idle' ? (
                <button className="btn btn-navy" onClick={start} type="button"><Mic size={20} /> {copy.voice.start}</button>
              ) : (
                <>
                  <button className="btn btn-white" onClick={togglePause} type="button">
                    {status === 'paused' ? <Play size={20} /> : <Pause size={20} />}
                    {status === 'paused' ? copy.voice.resume : copy.voice.pause}
                  </button>
                  <button className="btn btn-navy" onClick={stop} type="button"><Square size={18} /> {copy.voice.stop}</button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </WizardStep>
  )
}
