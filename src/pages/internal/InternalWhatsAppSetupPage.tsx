import { CheckCircle2, LoaderCircle, MessageCircle, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { getInternalAuthHeaders } from '../../services/internalAuth'
import { getPublicSiteApiBaseUrl } from '../../services/publicSiteApi'

const metaAppId = '1061863269720823'
const embeddedSignupConfigurationId = '1853049535662758'
const transferTimeoutMs = 180_000

type EmbeddedSignupResult = {
  businessId?: string
  code?: string
  error?: string
  phoneNumberId?: string
  wabaId?: string
}

type EmbeddedSignupCompletion = {
  businessId: string
  phoneNumberId: string
  wabaId: string
}

type FacebookLoginResponse = {
  authResponse?: {
    code?: string
  }
  status?: string
}

type EmbeddedSignupSessionEvent = {
  data?: {
    business_id?: string
    phone_number_id?: string
    waba_id?: string
  }
  event?: 'CANCEL' | 'ERROR' | 'FINISH'
}

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: Record<string, unknown>,
      ) => void
    }
    fbAsyncInit?: () => void
  }
}

function parseSessionEvent(event: MessageEvent): EmbeddedSignupSessionEvent | null {
  if (!['https://www.facebook.com', 'https://web.facebook.com'].includes(event.origin)) return null

  try {
    const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    if (!payload || payload.type !== 'WA_EMBEDDED_SIGNUP') return null

    return payload as EmbeddedSignupSessionEvent
  } catch {
    return null
  }
}

export function InternalWhatsAppSetupPage() {
  const [isReady, setIsReady] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [message, setMessage] = useState('Loading Meta Embedded Signup...')
  const [result, setResult] = useState<EmbeddedSignupResult>({})
  const authorizationReceivedRef = useRef(false)
  const sessionFinishedRef = useRef(false)
  const transferTimeoutRef = useRef<number | null>(null)

  function finishWithIdentifiers(identifiers: EmbeddedSignupCompletion) {
    sessionFinishedRef.current = true
    clearTransferTimeout()
    setIsStarting(false)
    setResult((current) => ({ ...current, ...identifiers, error: undefined }))
    setMessage('Meta completed the transfer and CasaMia verified the WhatsApp account identifiers.')
  }

  async function resolveIdentifiers(code: string) {
    try {
      const response = await fetch(`${getPublicSiteApiBaseUrl()}/api/internal/whatsapp-embedded-signup`, {
        body: JSON.stringify({ code }),
        headers: {
          'Content-Type': 'application/json',
          ...getInternalAuthHeaders(),
        },
        method: 'POST',
      })
      const payload = await response.json() as Partial<EmbeddedSignupCompletion> & { message?: string }
      if (!response.ok || !payload.businessId || !payload.phoneNumberId || !payload.wabaId) {
        throw new Error(payload.message || 'Meta did not return the WhatsApp account identifiers.')
      }

      finishWithIdentifiers(payload as EmbeddedSignupCompletion)
    } catch (error) {
      if (sessionFinishedRef.current) return
      clearTransferTimeout()
      setIsStarting(false)
      const reason = error instanceof Error ? error.message : 'Unable to verify the WhatsApp account identifiers.'
      setResult((current) => ({ ...current, error: reason }))
      setMessage('Authorization was received, but CasaMia could not verify the transferred WhatsApp number.')
    }
  }

  function clearTransferTimeout() {
    if (transferTimeoutRef.current === null) return

    window.clearTimeout(transferTimeoutRef.current)
    transferTimeoutRef.current = null
  }

  useEffect(() => {
    document.title = 'WhatsApp Setup | CasaMia Operations'

    const onSessionMessage = (event: MessageEvent) => {
      const payload = parseSessionEvent(event)
      if (!payload) return

      if (payload.event === 'FINISH') {
        const phoneNumberId = payload.data?.phone_number_id
        const wabaId = payload.data?.waba_id

        if (!phoneNumberId || !wabaId) {
          clearTransferTimeout()
          setIsStarting(false)
          setResult((current) => ({
            ...current,
            error: 'Meta finished without returning the required WhatsApp account identifiers.',
          }))
          setMessage('Meta closed the signup flow without a WABA ID and phone-number ID. No migration was completed.')
          return
        }

        finishWithIdentifiers({
          businessId: payload.data?.business_id,
          phoneNumberId,
          wabaId,
        } as EmbeddedSignupCompletion)
      } else if (payload.event === 'CANCEL') {
        clearTransferTimeout()
        setIsStarting(false)
        setMessage('Embedded Signup was cancelled before completion.')
      } else if (payload.event === 'ERROR') {
        clearTransferTimeout()
        setIsStarting(false)
        setResult((current) => ({ ...current, error: 'Meta reported an Embedded Signup error.' }))
        setMessage('Meta could not complete Embedded Signup.')
      }
    }

    window.addEventListener('message', onSessionMessage)
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: metaAppId,
        autoLogAppEvents: true,
        cookie: true,
        version: 'v26.0',
        xfbml: false,
      })
      setIsReady(true)
      setMessage('Ready to transfer the WhatsApp number to CasaMia.')
    }

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script')
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      document.body.appendChild(script)
    } else if (window.FB) {
      window.fbAsyncInit()
    }

    return () => {
      clearTransferTimeout()
      window.removeEventListener('message', onSessionMessage)
    }
  }, [])

  function startEmbeddedSignup() {
    if (!window.FB || !isReady) return

    setIsStarting(true)
    setMessage('Complete every step in the Meta window and keep it open until Meta confirms completion.')
    setResult({})
    authorizationReceivedRef.current = false
    sessionFinishedRef.current = false
    clearTransferTimeout()
    transferTimeoutRef.current = window.setTimeout(() => {
      transferTimeoutRef.current = null
      setIsStarting(false)
      setResult((current) => ({
        ...current,
        error: authorizationReceivedRef.current
          ? 'Meta authorized CasaMia but did not return the WhatsApp account identifiers.'
          : 'Meta did not complete the authorization or asset transfer.',
      }))
      setMessage(authorizationReceivedRef.current
        ? 'Authorization was received, but Meta did not finish the WhatsApp asset transfer. No migration was completed.'
        : 'Meta did not finish within three minutes. Close any Meta popup, then retry the transfer.')
    }, transferTimeoutMs)

    window.FB.login((response) => {
      const code = response.authResponse?.code

      if (code) {
        authorizationReceivedRef.current = true
        setResult((current) => ({ ...current, code }))
        if (sessionFinishedRef.current) {
          clearTransferTimeout()
          setIsStarting(false)
          setMessage('Meta completed the transfer and returned the WhatsApp account identifiers.')
        } else {
          setMessage('Authorization received. CasaMia is verifying the WhatsApp account and phone number with Meta...')
          void resolveIdentifiers(code)
        }
      } else {
        clearTransferTimeout()
        setIsStarting(false)
        setMessage(response.status === 'unknown'
          ? 'Meta login was closed before authorization.'
          : 'Meta did not return an authorization code.')
      }
    }, {
      config_id: embeddedSignupConfigurationId,
      extras: {
        sessionInfoVersion: '3',
        setup: {},
      },
      override_default_response_type: true,
      response_type: 'code',
    })
  }

  const hasIdentifiers = Boolean(result.wabaId && result.phoneNumberId)

  return (
    <InternalLayout
      title="WhatsApp migration"
      subtitle="Transfer the approved CasaMia number through Meta Embedded Signup."
    >
      <section className="mx-auto grid max-w-4xl gap-6">
        <article className="rounded-lg border border-border bg-white p-6 shadow-soft md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-light-blue text-blue">
                <MessageCircle size={26} aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-green">Protected setup</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-text-dark">Move the number to CasaMia.</h2>
              <p className="mt-3 text-base font-bold leading-relaxed text-text-mid">
                Meta will ask you to select the source WhatsApp account, confirm the destination and verify the phone number.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-pale-blue px-4 py-3 text-sm font-extrabold text-navy">
              <ShieldCheck size={18} aria-hidden="true" />
              Admin session only
            </div>
          </div>

          <div className="mt-7 rounded-lg border border-border bg-light-blue/50 px-4 py-4 text-sm font-bold text-text-mid" role="status" aria-live="polite">
            {isStarting && !hasIdentifiers ? <LoaderCircle className="mr-2 inline animate-spin" size={18} aria-hidden="true" /> : null}
            {hasIdentifiers ? <CheckCircle2 className="mr-2 inline text-green" size={18} aria-hidden="true" /> : null}
            {message}
          </div>

          <button
            className="btn btn-green mt-6"
            disabled={!isReady || isStarting}
            type="button"
            onClick={startEmbeddedSignup}
          >
            <MessageCircle size={18} aria-hidden="true" />
            {isStarting ? 'Transfer in progress...' : 'Start Meta transfer'}
          </button>
        </article>

        {result.code || result.wabaId || result.phoneNumberId || result.error ? (
          <article className="rounded-lg border border-border bg-white p-6 shadow-soft" aria-live="polite">
            <h2 className="font-display text-2xl font-bold text-text-dark">Migration result</h2>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <ResultField label="WABA ID" value={result.wabaId} />
              <ResultField label="Phone number ID" value={result.phoneNumberId} />
              <ResultField label="Business ID" value={result.businessId} />
              <ResultField label="Authorization" value={result.code ? 'Received securely' : undefined} />
            </dl>
            {result.code ? (
              <input
                aria-label="Meta authorization code"
                autoComplete="off"
                className="sr-only"
                readOnly
                tabIndex={-1}
                type="password"
                value={result.code}
              />
            ) : null}
            {result.error ? <p className="mt-4 font-bold text-red-700">{result.error}</p> : null}
          </article>
        ) : null}
      </section>
    </InternalLayout>
  )
}

function ResultField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg bg-pale-blue p-4">
      <dt className="text-xs font-black uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-2 break-all font-extrabold text-text-dark">{value || 'Waiting'}</dd>
    </div>
  )
}
