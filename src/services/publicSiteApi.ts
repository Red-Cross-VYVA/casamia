const publicApiBaseUrl = (
  import.meta.env.VITE_PUBLIC_SITE_API_URL ||
  import.meta.env.VITE_WEBSITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''
).replace(/\/$/, '')

export function hasPublicSiteApi() {
  return Boolean(publicApiBaseUrl) || import.meta.env.PROD
}

export function getPublicSiteApiBaseUrl() {
  return publicApiBaseUrl
}

export async function postPublicSiteJson<T>(
  path: string,
  payload: unknown,
  init: RequestInit = {},
) {
  if (!hasPublicSiteApi()) {
    throw new Error('Public website API URL is not configured.')
  }

  const response = await fetch(`${publicApiBaseUrl}${path}`, {
    ...init,
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
    method: init.method ?? 'POST',
  })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  return readOptionalJson<T>(response)
}

export async function getPublicSiteJson<T>(path: string, init: RequestInit = {}) {
  if (!hasPublicSiteApi()) {
    throw new Error('Public website API URL is not configured.')
  }

  const response = await fetch(`${publicApiBaseUrl}${path}`, init)

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  return readOptionalJson<T>(response)
}

async function readOptionalJson<T>(response: Response) {
  const text = await response.text()

  if (!text) {
    return {} as T
  }

  return JSON.parse(text) as T
}

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string; error?: string }
    return body.message ?? body.error ?? `Request failed with ${response.status}.`
  } catch {
    return `Request failed with ${response.status}.`
  }
}
