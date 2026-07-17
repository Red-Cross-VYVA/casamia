import { ConversationProvider, useConversation } from '@elevenlabs/react'
import { LoaderCircle, MessageSquareText, Mic, MicOff, PhoneOff, ShieldCheck, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { WizardCopy } from '../../config/wizardCopy'
import { requestElevenLabsConversationAccess } from '../../services/elevenLabsAgent'
import type { WizardUserType, WizardVoiceSession } from '../../types/wizard'
import { WizardStep } from './WizardStep'

type VoiceInputStepProps = {
  copy: WizardCopy
  fallbackNote: string
  language: string
  session?: WizardVoiceSession
  userType?: WizardUserType
  wizardReference: string
  onChange: (session?: WizardVoiceSession) => void
  onFallbackNoteChange: (note: string) => void
}

export function VoiceInputStep(props: VoiceInputStepProps) {
  return (
    <ConversationProvider>
      <VoiceInputStepContent {...props} />
    </ConversationProvider>
  )
}

function VoiceInputStepContent({
  copy,
  fallbackNote,
  language,
  session,
  userType,
  wizardReference,
  onChange,
  onFallbackNoteChange,
}: VoiceInputStepProps) {
  const locale: 'en' | 'es' = language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const supported = typeof window !== 'undefined'
    && typeof window.RTCPeerConnection !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia)
  const mountedRef = useRef(true)
  const sessionRef = useRef(session)
  const onChangeRef = useRef(onChange)
  const startedAtRef = useRef(session?.startedAt ?? '')
  const requestAbortRef = useRef<AbortController | null>(null)
  const endSessionRef = useRef<() => void>(() => undefined)
  const [error, setError] = useState('')
  const [isEnding, setIsEnding] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const saveSession = (next?: WizardVoiceSession) => {
    sessionRef.current = next
    onChangeRef.current(next)
  }

  const finalizeSession = () => {
    const current = sessionRef.current
    if (!current || current.endedAt) return

    const endedAt = new Date().toISOString()
    const startedAt = Date.parse(current.startedAt)
    saveSession({
      ...current,
      durationSeconds: Number.isFinite(startedAt)
        ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
        : current.durationSeconds,
      endedAt,
    })
  }

  const conversation = useConversation({
    onConnect: ({ conversationId }) => {
      if (!mountedRef.current) {
        endSessionRef.current()
        return
      }

      const startedAt = startedAtRef.current || new Date().toISOString()
      saveSession({
        conversationId,
        durationSeconds: 0,
        language: locale,
        provider: 'elevenlabs',
        startedAt,
        transcript: [],
      })
      setError('')
      setIsEnding(false)
      setIsStarting(false)
    },
    onDisconnect: (details) => {
      if (!mountedRef.current) return

      finalizeSession()

      if (details.reason === 'error') setError(copy.voice.error)
      setIsEnding(false)
      setIsStarting(false)
    },
    onError: () => {
      if (!mountedRef.current) return

      setError(copy.voice.error)
      setIsEnding(false)
      setIsStarting(false)
      endSessionRef.current()
    },
    onMessage: ({ message, role }) => {
      if (!mountedRef.current) return

      const current = sessionRef.current
      const cleanMessage = message.trim().slice(0, 2000)
      if (!current || !cleanMessage) return

      const previous = current.transcript.at(-1)
      if (previous?.role === role && previous.message === cleanMessage) return

      saveSession({
        ...current,
        transcript: [...current.transcript, { message: cleanMessage, role }].slice(-40),
      })
    },
  })

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    endSessionRef.current = conversation.endSession
  }, [conversation.endSession])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      finalizeSession()
      mountedRef.current = false
      requestAbortRef.current?.abort()
      endSessionRef.current()
    }
  }, [])

  const start = async () => {
    if (!supported || isStarting || (conversation.status !== 'disconnected' && conversation.status !== 'error')) return

    setError('')
    setIsStarting(true)
    requestAbortRef.current?.abort()
    const requestController = new AbortController()
    requestAbortRef.current = requestController

    try {
      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      permissionStream.getTracks().forEach((track) => track.stop())

      const access = await requestElevenLabsConversationAccess({
        locale,
        signal: requestController.signal,
        wizardReference,
      })

      if (!mountedRef.current || requestController.signal.aborted) return

      startedAtRef.current = new Date().toISOString()
      saveSession(undefined)
      conversation.startSession({
        connectionType: 'webrtc',
        conversationToken: access.token,
        dynamicVariables: {
          site_language: locale,
          user_type: userType ?? 'unknown',
          wizard_flow: 'home_safety',
          wizard_reference: wizardReference,
        },
        overrides: { agent: { language: locale } },
        serverLocation: access.serverLocation,
        userId: wizardReference,
      })
    } catch (startError) {
      if (!mountedRef.current || requestController.signal.aborted) return
      const permissionDenied = startError instanceof DOMException
        && (startError.name === 'NotAllowedError' || startError.name === 'PermissionDeniedError')
      setError(permissionDenied ? copy.voice.permission : copy.voice.error)
      setIsStarting(false)
    } finally {
      if (requestAbortRef.current === requestController) requestAbortRef.current = null
    }
  }

  const connected = conversation.status === 'connected'
  const busy = isStarting || isEnding || conversation.status === 'connecting'
  const statusLabel = busy
    ? (isEnding ? copy.voice.ending : copy.voice.connecting)
    : connected
      ? conversation.isMuted
        ? copy.voice.muted
        : conversation.isSpeaking
          ? copy.voice.speaking
          : copy.voice.listening
      : session
        ? copy.voice.saved
        : copy.voice.assistant

  const fallbackField = (
    <label className="safety-wizard-field">
      <span>{copy.notes.title}</span>
      <textarea
        placeholder={copy.notes.placeholder}
        rows={4}
        value={fallbackNote}
        onChange={(event) => onFallbackNoteChange(event.target.value)}
      />
    </label>
  )

  if (!supported) {
    return (
      <WizardStep title={copy.voice.title} body={copy.voice.body} hint={copy.micro.optional} icon={<Mic size={28} />}>
        <div className="safety-wizard-voice-fallback">
          <div className="safety-wizard-notice" role="status">{copy.voice.unsupported}</div>
          {fallbackField}
        </div>
      </WizardStep>
    )
  }

  return (
    <WizardStep title={copy.voice.title} body={copy.voice.body} hint={copy.micro.optional} icon={<Mic size={28} />}>
      <div
        className={`safety-wizard-recorder is-${isEnding ? 'disconnecting' : conversation.status}${conversation.isSpeaking ? ' is-speaking' : ''}`}
        aria-busy={busy}
      >
        <div className="safety-wizard-agent-label">
          <Sparkles size={16} aria-hidden="true" />
          <span>{copy.voice.assistant}</span>
        </div>

        <div className={`safety-wizard-mic${connected ? ' is-live' : ''}`} aria-hidden="true">
          {busy ? <LoaderCircle className="safety-wizard-agent-spinner" size={38} /> : conversation.isMuted ? <MicOff size={38} /> : <Mic size={38} />}
        </div>

        <div className="safety-wizard-agent-status" role="status" aria-live="polite">
          <span className="safety-wizard-agent-status-dot" aria-hidden="true" />
          <strong>{statusLabel}</strong>
          {!connected && session?.endedAt && session.durationSeconds > 0 ? <small>{formatDuration(session.durationSeconds)}</small> : null}
        </div>

        {error ? <div className="safety-wizard-agent-error" role="alert">{error}</div> : null}

        <p className="safety-wizard-agent-privacy">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>{copy.voice.privacy}</span>
        </p>

        <div className="safety-wizard-recorder-actions">
          {connected ? (
            <>
              <button className="btn btn-white" onClick={() => conversation.setMuted(!conversation.isMuted)} type="button">
                {conversation.isMuted ? <Mic size={19} /> : <MicOff size={19} />}
                {conversation.isMuted ? copy.voice.unmute : copy.voice.mute}
              </button>
              <button className="btn btn-navy" onClick={() => { setIsEnding(true); conversation.endSession() }} type="button">
                <PhoneOff size={19} /> {copy.voice.stop}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-navy" disabled={busy} onClick={start} type="button">
                {busy ? <LoaderCircle className="safety-wizard-agent-spinner" size={20} /> : <Mic size={20} />}
                {session ? copy.voice.restart : copy.voice.start}
              </button>
              {session ? (
                <button className="safety-wizard-agent-clear" disabled={busy} onClick={() => saveSession(undefined)} type="button">
                  <Trash2 size={18} /> {copy.voice.clear}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {session?.transcript.length ? (
        <section className="safety-wizard-agent-transcript" aria-label={copy.voice.transcript}>
          <h2><MessageSquareText size={20} aria-hidden="true" /> {copy.voice.transcript}</h2>
          <ol aria-live="polite">
            {session.transcript.map((entry, index) => (
              <li className={`is-${entry.role}`} key={`${entry.role}-${index}-${entry.message.slice(0, 16)}`}>
                <span>{entry.role === 'agent' ? copy.voice.agentLabel : copy.voice.userLabel}</span>
                <p>{entry.message}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {error ? (
        <div className="safety-wizard-voice-fallback is-visible">
          <strong>{copy.voice.fallback}</strong>
          {fallbackField}
        </div>
      ) : (
        <details className="safety-wizard-voice-fallback">
          <summary>{copy.voice.fallback}</summary>
          {fallbackField}
        </details>
      )}
    </WizardStep>
  )
}

function formatDuration(durationSeconds: number) {
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
