import {
  AudioLines,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { InternalLayout } from '../../components/internal/InternalLayout'
import {
  getVoiceAssistantStatus,
  requestVoicePreview,
  voiceAssistantFeatureEnabled,
  type VoiceAssistantStatus,
} from '../../services/voiceAssistant'

const previewScripts = {
  es: 'Hola. Soy el asistente de CasaMia. Puedo guiarte paso a paso para revisar tu hogar y elegir mejoras de seguridad con calma.',
  en: 'Hello. I am the CasaMia assistant. I can guide you step by step as you review your home and choose practical safety improvements.',
  de: 'Hallo. Ich bin der CasaMia-Assistent. Ich begleite Sie Schritt für Schritt bei der Sicherheitsprüfung Ihres Zuhauses.',
  fr: 'Bonjour. Je suis l’assistant CasaMia. Je peux vous guider pas à pas pour évaluer votre logement et choisir des améliorations adaptées.',
  nl: 'Hallo. Ik ben de CasaMia-assistent. Ik help u stap voor stap om uw woning te beoordelen en passende veiligheidsverbeteringen te kiezen.',
} as const

type PreviewLanguage = keyof typeof previewScripts

export function InternalVoiceStudioPage() {
  const [language, setLanguage] = useState<PreviewLanguage>('es')
  const [text, setText] = useState<string>(previewScripts.es)
  const [status, setStatus] = useState<VoiceAssistantStatus | null>(null)
  const [statusError, setStatusError] = useState('')
  const [generationError, setGenerationError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')

  const charactersRemaining = useMemo(
    () => (status?.maxCharacters ?? 500) - text.length,
    [status?.maxCharacters, text.length],
  )

  useEffect(() => {
    document.title = 'Voice Studio | CasaMia Internal'

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  useEffect(() => {
    if (!voiceAssistantFeatureEnabled) {
      return
    }

    void getVoiceAssistantStatus()
      .then((nextStatus) => setStatus(nextStatus))
      .catch((error) => setStatusError(error instanceof Error ? error.message : 'Unable to check voice setup.'))
  }, [])

  function selectLanguage(nextLanguage: PreviewLanguage) {
    setLanguage(nextLanguage)
    setText(previewScripts[nextLanguage])
    setGenerationError('')
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setGenerationError('')

    if (text.trim().length < 10) {
      setGenerationError('Add a little more text before creating the preview.')
      return
    }

    if (charactersRemaining < 0) {
      setGenerationError(`Shorten the script by ${Math.abs(charactersRemaining)} characters.`)
      return
    }

    setIsGenerating(true)

    try {
      const audio = await requestVoicePreview(text)

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }

      setAudioUrl(URL.createObjectURL(audio))
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Unable to generate this preview.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!voiceAssistantFeatureEnabled) {
    return (
      <InternalLayout
        title="Voice Studio"
        subtitle="The ElevenLabs foundation is installed and stays hidden until the voice feature is enabled."
      >
        <section className="max-w-3xl rounded-lg border border-border bg-white p-6 shadow-soft md:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-light-blue text-blue">
            <AudioLines size={25} aria-hidden="true" />
          </div>
          <h2 className="mt-5 font-display text-3xl font-bold text-text-dark">Voice is safely switched off.</h2>
          <p className="mt-3 max-w-2xl text-base font-bold leading-relaxed text-text-mid">
            Add <code className="rounded bg-pale-blue px-2 py-1 text-sm text-navy">VITE_ENABLE_VOICE_ASSISTANT=true</code>{' '}
            when you are ready to review voices inside this protected panel.
          </p>
        </section>
      </InternalLayout>
    )
  }

  return (
    <InternalLayout
      title="Voice Studio"
      subtitle="Test CasaMia guidance in every supported language before voice is introduced to customers."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form className="rounded-lg border border-border bg-white p-6 shadow-soft md:p-8" onSubmit={handleGenerate}>
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue">Internal preview</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-text-dark">Hear the CasaMia voice.</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-pale-blue px-4 py-2 text-xs font-black uppercase text-navy">
              <ShieldCheck size={16} aria-hidden="true" />
              Admin only
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-black text-text-dark">Preview language</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ['es', 'Español'],
                  ['en', 'English'],
                  ['de', 'Deutsch'],
                  ['fr', 'Français'],
                  ['nl', 'Nederlands'],
                ] as const
              ).map(([value, label]) => (
                <button
                  className={`min-h-11 rounded-full border px-4 text-sm font-extrabold transition ${
                    language === value
                      ? 'border-blue bg-blue text-white'
                      : 'border-border bg-white text-text-mid hover:border-blue hover:text-blue'
                  }`}
                  key={value}
                  type="button"
                  onClick={() => selectLanguage(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-6 grid gap-2">
            <span className="flex items-center justify-between gap-4 text-sm font-black text-text-dark">
              Preview script
              <span className={charactersRemaining < 0 ? 'text-red-700' : 'text-text-muted'}>
                {charactersRemaining} left
              </span>
            </span>
            <textarea
              className="min-h-44 resize-y rounded-lg border border-border bg-light-blue/35 p-4 text-base font-bold leading-relaxed text-text-dark outline-none transition focus:border-blue focus:bg-white"
              maxLength={(status?.maxCharacters ?? 500) + 80}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </label>

          {generationError ? (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
              <CircleAlert className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
              {generationError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="btn btn-navy"
              disabled={isGenerating || !status?.configured || charactersRemaining < 0}
              type="submit"
            >
              {isGenerating ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
              {isGenerating ? 'Creating preview...' : 'Create preview'}
            </button>
            <span className="text-sm font-bold text-text-muted">Each click creates a paid ElevenLabs generation.</span>
          </div>

          {audioUrl ? (
            <div className="mt-6 rounded-lg border border-blue/25 bg-pale-blue p-5">
              <p className="flex items-center gap-2 text-sm font-black text-navy">
                <Play size={17} aria-hidden="true" />
                Latest preview
              </p>
              <audio className="mt-3 w-full" controls src={audioUrl}>
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : null}
        </form>

        <aside className="space-y-5">
          <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">Connection</p>
            {statusError ? (
              <p className="mt-4 flex gap-2 text-sm font-bold leading-relaxed text-red-700">
                <CircleAlert className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                {statusError}
              </p>
            ) : status?.configured ? (
              <div className="mt-4">
                <p className="flex items-center gap-2 font-black text-text-dark">
                  <CircleCheck className="text-green" size={20} aria-hidden="true" />
                  ElevenLabs connected
                </p>
                <p className="mt-2 text-sm font-bold text-text-muted">Model: {status.modelId}</p>
              </div>
            ) : status ? (
              <div className="mt-4">
                <p className="flex items-center gap-2 font-black text-text-dark">
                  <CircleAlert className="text-gold" size={20} aria-hidden="true" />
                  Setup needed
                </p>
                <p className="mt-2 text-sm font-bold leading-relaxed text-text-muted">
                  Add {status.missing.join(' and ')} in Vercel.
                </p>
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-2 text-sm font-bold text-text-muted">
                <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
                Checking connection...
              </p>
            )}
          </section>

          <section className="rounded-lg border border-border bg-navy p-6 text-white shadow-soft">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue">Planned uses</p>
            <h2 className="mt-3 font-display text-3xl font-bold">One voice layer, several journeys.</h2>
            <ul className="mt-5 grid gap-3 text-sm font-bold text-white/78">
              <li>Self-inspection guidance</li>
              <li>Service explanation</li>
              <li>Family updates</li>
              <li>Installation handover</li>
            </ul>
          </section>
        </aside>
      </div>
    </InternalLayout>
  )
}
