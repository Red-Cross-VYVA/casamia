import { CheckCircle2, LoaderCircle, MessageCircle, RefreshCw, Send, ShieldCheck } from 'lucide-react'
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

type WhatsappDiagnostics = {
  apiVersion?: string
  configured?: boolean
  metaError?: string
  phoneNumberId?: string
  sender?: {
    codeVerificationStatus?: string
    displayPhoneNumber?: string
    id?: string
    qualityRating?: string
    verifiedName?: string
  }
  signatureConfigured?: boolean
  templates?: Record<'proposal' | 'report', Record<'en' | 'es', {
    languageCode: string
    templateName: string
  }>>
  webhookConfigured?: boolean
  webhookUrl?: string
  usingTestCredentials?: boolean
}

type WhatsappTestResult = {
  messageId?: string
  reason?: string
  status?: string
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
  const [diagnostics, setDiagnostics] = useState<WhatsappDiagnostics | null>(null)
  const [diagnosticsError, setDiagnosticsError] = useState('')
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testLanguage, setTestLanguage] = useState<'en' | 'es'>('en')
  const [testMode, setTestMode] = useState<'connectivity' | 'proposal' | 'report'>('connectivity')
  const [testRecipient, setTestRecipient] = useState('')
  const [testResult, setTestResult] = useState<WhatsappTestResult | null>(null)
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
    void loadDiagnostics()

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

  async function loadDiagnostics() {
    setIsLoadingDiagnostics(true)
    setDiagnosticsError('')
    try {
      const response = await fetch(`${getPublicSiteApiBaseUrl()}/api/internal/whatsapp-testing`, {
        headers: getInternalAuthHeaders(),
      })
      const payload = await response.json() as WhatsappDiagnostics & { message?: string }
      if (!response.ok) throw new Error(payload.message || 'WhatsApp diagnostics could not be loaded.')
      setDiagnostics(payload)
    } catch (error) {
      setDiagnosticsError(error instanceof Error ? error.message : 'WhatsApp diagnostics could not be loaded.')
    } finally {
      setIsLoadingDiagnostics(false)
    }
  }

  async function sendTestMessage() {
    setIsSendingTest(true)
    setTestResult(null)
    try {
      const response = await fetch(`${getPublicSiteApiBaseUrl()}/api/internal/whatsapp-testing`, {
        body: JSON.stringify({ language: testLanguage, mode: testMode, to: testRecipient }),
        headers: {
          'Content-Type': 'application/json',
          ...getInternalAuthHeaders(),
        },
        method: 'POST',
      })
      const payload = await response.json() as { message?: string; result?: WhatsappTestResult }
      const nextResult = payload.result ?? { reason: payload.message || 'The test message could not be sent.', status: 'failed' }
      setTestResult(nextResult)
    } catch (error) {
      setTestResult({
        reason: error instanceof Error ? error.message : 'The test message could not be sent.',
        status: 'failed',
      })
    } finally {
      setIsSendingTest(false)
    }
  }

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

        <article className="rounded-lg border border-border bg-white p-6 shadow-soft md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-green">Cloud API test</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-text-dark">Test WhatsApp without the live number</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-text-mid">
                Use Meta's test sender while the production-number permissions are under review. Connectivity uses Meta's standard English template; CasaMia templates can be checked in English or Spanish.
              </p>
            </div>
            <button
              aria-label="Refresh WhatsApp status"
              className="btn btn-outline"
              disabled={isLoadingDiagnostics}
              type="button"
              onClick={() => void loadDiagnostics()}
            >
              <RefreshCw className={isLoadingDiagnostics ? 'animate-spin' : ''} size={18} aria-hidden="true" />
              Refresh
            </button>
          </div>

          {diagnosticsError ? <p className="mt-5 font-bold text-red-700">{diagnosticsError}</p> : null}
          {diagnostics ? (
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
              <StatusField label="Cloud API" ready={diagnostics.configured} />
              <StatusField
                label="Sender mode"
                ready={diagnostics.usingTestCredentials}
                value={diagnostics.usingTestCredentials ? 'Meta test number' : 'Live fallback'}
              />
              <StatusField label="Webhook token" ready={diagnostics.webhookConfigured} />
              <StatusField label="Signed webhook" ready={diagnostics.signatureConfigured} />
              <StatusField
                label="Meta sender"
                ready={Boolean(diagnostics.sender?.id)}
                value={diagnostics.sender?.displayPhoneNumber || diagnostics.metaError}
              />
            </dl>
          ) : null}

          <div className="mt-7 grid gap-5 border-t border-border pt-6 md:grid-cols-3">
            <label className="text-sm font-extrabold text-text-dark">
              Recipient number
              <input
                className="mt-2 w-full rounded-lg border border-border px-4 py-3 font-semibold"
                inputMode="tel"
                placeholder="+34 600 000 000"
                type="tel"
                value={testRecipient}
                onChange={(event) => setTestRecipient(event.target.value)}
              />
            </label>
            <label className="text-sm font-extrabold text-text-dark">
              Test type
              <select
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 font-semibold"
                value={testMode}
                onChange={(event) => setTestMode(event.target.value as typeof testMode)}
              >
                <option value="connectivity">Meta connectivity</option>
                <option value="proposal">CasaMia proposal</option>
                <option value="report">CasaMia safety report</option>
              </select>
            </label>
            <label className="text-sm font-extrabold text-text-dark">
              Language
              <select
                className="mt-2 w-full rounded-lg border border-border bg-white px-4 py-3 font-semibold"
                disabled={testMode === 'connectivity'}
                value={testMode === 'connectivity' ? 'en' : testLanguage}
                onChange={(event) => setTestLanguage(event.target.value as typeof testLanguage)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </label>
          </div>

          <button
            className="btn btn-green mt-5"
            disabled={isSendingTest || !testRecipient.trim() || !diagnostics?.configured}
            type="button"
            onClick={() => void sendTestMessage()}
          >
            {isSendingTest ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
            {isSendingTest ? 'Sending test...' : 'Send WhatsApp test'}
          </button>

          {testResult ? (
            <div className={`mt-5 rounded-lg border px-4 py-4 text-sm font-bold ${testResult.messageId ? 'border-green/30 bg-green/10 text-text-dark' : 'border-red-200 bg-red-50 text-red-800'}`} role="status">
              {testResult.messageId
                ? `Accepted by Meta. Message ID: ${testResult.messageId}`
                : testResult.reason || `Meta returned status: ${testResult.status || 'failed'}`}
            </div>
          ) : null}

          {diagnostics?.webhookUrl ? (
            <p className="mt-5 break-all text-xs font-semibold text-text-muted">Webhook: {diagnostics.webhookUrl}</p>
          ) : null}
        </article>
      </section>
    </InternalLayout>
  )
}

function StatusField({ label, ready, value }: { label: string; ready?: boolean; value?: string }) {
  return (
    <div className="rounded-lg bg-pale-blue p-4">
      <dt className="text-xs font-black uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="mt-2 font-extrabold text-text-dark">
        {ready ? 'Ready' : 'Needs setup'}{value ? ` · ${value}` : ''}
      </dd>
    </div>
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
