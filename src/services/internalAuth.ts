import { getPublicSiteApiBaseUrl } from './publicSiteApi.ts'

const internalSessionStorageKey = 'casamia-internal-admin-session-v1'
const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> }).env ?? {}

type InternalAuthSession = {
  expiresAt: string
  localDemo?: boolean
  token: string
}

export function getInternalAuthSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const saved = window.sessionStorage.getItem(internalSessionStorageKey)

    if (!saved) {
      return null
    }

    const session = JSON.parse(saved) as InternalAuthSession

    if (!session.token || Date.parse(session.expiresAt) <= Date.now()) {
      clearInternalAuthSession()
      return null
    }

    return session
  } catch {
    clearInternalAuthSession()
    return null
  }
}

export function hasInternalAuthSession() {
  return Boolean(getInternalAuthSession())
}

export function hasInternalBackendSession() {
  const session = getInternalAuthSession()

  return Boolean(session && !session.localDemo)
}

export function getInternalAuthHeaders(): Record<string, string> {
  const session = getInternalAuthSession()

  if (!session || session.localDemo) {
    return {}
  }

  return {
    Authorization: `Bearer ${session.token}`,
  }
}

export async function loginInternalAdmin(password: string) {
  const apiBaseUrl = getPublicSiteApiBaseUrl()
  const response = await fetch(`${apiBaseUrl}/api/internal/login`, {
    body: JSON.stringify({ password }),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    const message = await readAuthError(response)
    throw new Error(message)
  }

  const session = (await response.json()) as InternalAuthSession
  saveInternalAuthSession(session)

  return session
}

export function startLocalInternalDemoSession() {
  const session: InternalAuthSession = {
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    localDemo: true,
    token: 'local-demo',
  }

  saveInternalAuthSession(session)

  return session
}

export function clearInternalAuthSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(internalSessionStorageKey)
  }
}

export function isLocalInternalDemoAvailable() {
  return Boolean(viteEnv.DEV) && !getPublicSiteApiBaseUrl()
}

function saveInternalAuthSession(session: InternalAuthSession) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(internalSessionStorageKey, JSON.stringify(session))
  }
}

async function readAuthError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message ?? 'Unable to verify admin access.'
  } catch {
    return 'Unable to verify admin access.'
  }
}
