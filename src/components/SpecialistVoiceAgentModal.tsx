import { ConversationProvider, useConversation } from '@elevenlabs/react'
import {
  CheckCircle2,
  LoaderCircle,
  MessageSquareText,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  buildSpecialistAgentDynamicVariables,
  getSpecialistAgentFirstMessage,
  getSpecialistAgentPrompt,
  type SpecialistAgentLanguage,
} from '../config/elevenLabsSpecialistAgent'
import { requestElevenLabsConversationAccess } from '../services/elevenLabsAgent'
import { trackEvent } from '../utils/analytics'

type SpecialistVoiceAgentModalProps = {
  entryPoint?: string
  isOpen: boolean
  language: string
  onClose: () => void
}

type SpecialistTranscriptEntry = {
  message: string
  role: 'agent' | 'user'
}

const specialistCopy = {
  en: {
    agentLabel: 'Specialist',
    assistant: 'CasaMia specialist',
    body: 'Ask about packages, inspections, grants or the safest next step for a room.',
    close: 'Close specialist voice chat',
    connecting: 'Connecting...',
    ending: 'Ending...',
    error: 'The specialist could not connect right now. Please try again shortly.',
    fallback: 'You can also use the catalogue or request a visit if voice is unavailable.',
    items: ['Choose packages', 'Plan inspection', 'Grant guidance'],
    listening: 'Listening',
    mute: 'Mute',
    permission: 'Microphone permission is required to start the specialist voice chat.',
    privacy: 'Voice starts only after you press start. Do not share medical or payment details.',
    saved: 'Conversation ended',
    speaking: 'Speaking',
    start: 'Start voice chat',
    stop: 'End call',
    title: 'Talk to a CasaMia specialist',
    transcript: 'Conversation notes',
    unavailable: 'Live voice is not supported in this browser.',
    unmute: 'Unmute',
    userLabel: 'You',
  },
  es: {
    agentLabel: 'Especialista',
    assistant: 'Especialista CasaMia',
    body: 'Pregunta por paquetes, inspecciones, ayudas o el siguiente paso mas seguro para una estancia.',
    close: 'Cerrar chat de voz con especialista',
    connecting: 'Conectando...',
    ending: 'Terminando...',
    error: 'No se pudo conectar con el especialista ahora. Intentalo de nuevo en unos minutos.',
    fallback: 'Tambien puedes usar el catalogo o solicitar una visita si la voz no esta disponible.',
    items: ['Elegir paquetes', 'Planificar inspeccion', 'Orientacion sobre ayudas'],
    listening: 'Escuchando',
    mute: 'Silenciar',
    permission: 'Debes permitir el microfono para iniciar el chat de voz con especialista.',
    privacy: 'La voz empieza solo cuando pulsas iniciar. No compartas datos medicos ni de pago.',
    saved: 'Conversacion terminada',
    speaking: 'Hablando',
    start: 'Iniciar voz',
    stop: 'Terminar llamada',
    title: 'Habla con un especialista CasaMia',
    transcript: 'Notas de conversacion',
    unavailable: 'Este navegador no permite voz en directo.',
    unmute: 'Activar sonido',
    userLabel: 'Tu',
  },
} satisfies Record<SpecialistAgentLanguage, Record<string, string | string[]>>

export function SpecialistVoiceAgentModal({
  entryPoint = 'home_hero',
  isOpen,
  language,
  onClose,
}: SpecialistVoiceAgentModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const bodyOverflow = document.body.style.overflow
    const documentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = bodyOverflow
      document.documentElement.style.overflow = documentOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <ConversationProvider>
      <SpecialistVoiceAgentDialog entryPoint={entryPoint} language={language} onClose={onClose} />
    </ConversationProvider>,
    document.body,
  )
}

function SpecialistVoiceAgentDialog({
  entryPoint,
  language,
  onClose,
}: {
  entryPoint: string
  language: string
  onClose: () => void
}) {
  const locale: SpecialistAgentLanguage = language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = specialistCopy[locale]
  const referenceRef = useRef(createSpecialistReference())
  const mountedRef = useRef(true)
  const requestAbortRef = useRef<AbortController | null>(null)
  const endSessionRef = useRef<() => void>(() => undefined)
  const [error, setError] = useState('')
  const [isEnding, setIsEnding] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [transcript, setTranscript] = useState<SpecialistTranscriptEntry[]>([])
  const [startedOnce, setStartedOnce] = useState(false)

  const supported = typeof window !== 'undefined'
    && typeof window.RTCPeerConnection !== 'undefined'
    && Boolean(navigator.mediaDevices?.getUserMedia)

  const conversation = useConversation({
    onConnect: ({ conversationId }) => {
      if (!mountedRef.current) {
        endSessionRef.current()
        return
      }

      setError('')
      setIsEnding(false)
      setIsStarting(false)
      setStartedOnce(true)
      trackEvent('elevenlabs_specialist_connected', { conversationId, entryPoint })
    },
    onDisconnect: (details) => {
      if (!mountedRef.current) return

      if (details.reason === 'error') setError(copy.error)
      setIsEnding(false)
      setIsStarting(false)
    },
    onError: () => {
      if (!mountedRef.current) return

      setError(copy.error)
      setIsEnding(false)
      setIsStarting(false)
      endSessionRef.current()
    },
    onMessage: ({ message, role }) => {
      if (!mountedRef.current) return

      const cleanMessage = message.trim().slice(0, 2000)
      if (!cleanMessage) return

      setTranscript((current) => {
        const previous = current.at(-1)
        if (previous?.role === role && previous.message === cleanMessage) return current
        return [...current, { message: cleanMessage, role }].slice(-24)
      })
    },
  })

  useEffect(() => {
    endSessionRef.current = conversation.endSession
  }, [conversation.endSession])

  useEffect(() => {
    mountedRef.current = true
    return () => {
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

      const specialistReference = referenceRef.current
      const access = await requestElevenLabsConversationAccess({
        entryPoint,
        locale,
        signal: requestController.signal,
        wizardReference: specialistReference,
      })

      if (!mountedRef.current || requestController.signal.aborted) return

      conversation.startSession({
        connectionType: 'webrtc',
        conversationToken: access.token,
        dynamicVariables: buildSpecialistAgentDynamicVariables({
          entryPoint,
          language: locale,
          reference: specialistReference,
        }),
        overrides: {
          agent: {
            firstMessage: getSpecialistAgentFirstMessage(locale),
            language: locale,
            prompt: { prompt: getSpecialistAgentPrompt(locale) },
          },
          asr: {
            keywords: ['CasaMia', 'Plan Adapta', 'baño', 'dormitorio', 'cocina', 'ayudas'],
          },
        },
        serverLocation: access.serverLocation,
        userId: specialistReference,
      })
      trackEvent('elevenlabs_specialist_started', { entryPoint, reference: specialistReference })
    } catch (startError) {
      if (!mountedRef.current || requestController.signal.aborted) return
      const permissionDenied = startError instanceof DOMException
        && (startError.name === 'NotAllowedError' || startError.name === 'PermissionDeniedError')
      setError(permissionDenied ? copy.permission : copy.error)
      setIsStarting(false)
    } finally {
      if (requestAbortRef.current === requestController) requestAbortRef.current = null
    }
  }

  const connected = conversation.status === 'connected'
  const busy = isStarting || isEnding || conversation.status === 'connecting'
  const statusLabel = busy
    ? (isEnding ? copy.ending : copy.connecting)
    : connected
      ? conversation.isMuted
        ? copy.mute
        : conversation.isSpeaking
          ? copy.speaking
          : copy.listening
      : startedOnce
        ? copy.saved
        : copy.assistant

  return (
    <div
      className="specialist-voice-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="specialist-voice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-voice-title"
      >
        <button type="button" className="specialist-voice-close" aria-label={copy.close} onClick={onClose}>
          <X size={22} aria-hidden="true" />
        </button>

        <div className="specialist-voice-grid">
          <div className="specialist-voice-visual" aria-hidden="true">
            <div className={`specialist-voice-mic-status is-${conversation.status}`}>
              {busy ? <LoaderCircle size={54} /> : connected && conversation.isMuted ? <MicOff size={54} /> : <Mic size={54} />}
            </div>
            <div className="specialist-voice-wave">
              <span />
              <span />
              <span />
              <span />
            </div>
            <p>{statusLabel}</p>
          </div>

          <div className="specialist-voice-content">
            <p className="specialist-voice-kicker">
              <Sparkles size={16} aria-hidden="true" />
              {copy.assistant}
            </p>
            <h2 id="specialist-voice-title">{copy.title}</h2>
            <p className="specialist-voice-body">{copy.body}</p>

            <ul className="specialist-voice-points" aria-label={copy.body}>
              {(copy.items as string[]).map((item) => (
                <li key={item}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="specialist-voice-privacy">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>{copy.privacy}</span>
            </p>

            {!supported ? <div className="specialist-voice-error" role="status">{copy.unavailable}</div> : null}
            {error ? <div className="specialist-voice-error" role="alert">{error}</div> : null}

            <div className="specialist-voice-actions">
              {connected ? (
                <>
                  <button type="button" className="btn btn-white" onClick={() => conversation.setMuted(!conversation.isMuted)}>
                    {conversation.isMuted ? <Mic size={19} /> : <MicOff size={19} />}
                    {conversation.isMuted ? copy.unmute : copy.mute}
                  </button>
                  <button
                    type="button"
                    className="btn btn-navy"
                    onClick={() => {
                      setIsEnding(true)
                      conversation.endSession()
                    }}
                  >
                    <PhoneOff size={19} />
                    {copy.stop}
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-navy" disabled={!supported || busy} onClick={start}>
                  {busy ? <LoaderCircle className="specialist-voice-spin" size={20} /> : <Mic size={20} />}
                  {copy.start}
                </button>
              )}
            </div>

            <p className="specialist-voice-fallback">{copy.fallback}</p>

            {transcript.length ? (
              <section className="specialist-voice-transcript" aria-label={copy.transcript}>
                <h3>
                  <MessageSquareText size={18} aria-hidden="true" />
                  {copy.transcript}
                </h3>
                <ol>
                  {transcript.map((entry, index) => (
                    <li className={`is-${entry.role}`} key={`${entry.role}-${index}-${entry.message.slice(0, 18)}`}>
                      <span>{entry.role === 'agent' ? copy.agentLabel : copy.userLabel}</span>
                      <p>{entry.message}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}

function createSpecialistReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const values = new Uint8Array(6)

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(values)
    return `CM-${Array.from(values, (value) => alphabet[value % alphabet.length]).join('')}`
  }

  return `CM-${Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0')}`
}
