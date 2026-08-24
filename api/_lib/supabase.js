import crypto from 'node:crypto'

const jsonHeaders = {
  'Content-Type': 'application/json',
}

const internalSessionDurationMs = 1000 * 60 * 60 * 8
export const supabaseRequestTimeoutMs = 15_000

export function sendJson(response, statusCode, body) {
  response.status(statusCode).setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

export function requirePost(request, response) {
  if (request.method === 'OPTIONS') {
    response.status(204).setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.end()
    return false
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { message: 'Method not allowed.' })
    return false
  }

  return true
}

export function requireInternalApiKey(request, response) {
  const expectedApiKey = process.env.CASAMIA_INTERNAL_API_KEY

  if (!expectedApiKey) {
    sendJson(response, 500, {
      message: 'Internal API key is not configured. Add CASAMIA_INTERNAL_API_KEY in Vercel.',
    })
    return false
  }

  const suppliedApiKey = getRequestHeader(request, 'x-api-key')
  const authorization = getRequestHeader(request, 'authorization')
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : ''

  if (suppliedApiKey !== expectedApiKey && !verifySessionTokenForRole(bearerToken, 'internal')) {
    sendJson(response, 401, { message: 'Unauthorized.' })
    return false
  }

  return true
}

export function createInternalSessionToken() {
  return createSessionToken({ role: 'internal' })
}

export function createPartnerSessionToken(partnerEmail) {
  return createSessionToken({
    partnerEmail: normalizeEmail(partnerEmail),
    role: 'partner',
  })
}

export function requirePartnerApiKey(request, response) {
  if (!getInternalSessionSecret()) {
    sendJson(response, 500, {
      message: 'Partner sessions are not configured. Add CASAMIA_INTERNAL_SESSION_SECRET in Vercel.',
    })
    return null
  }

  const session = getVerifiedSessionFromRequest(request)

  if (!session || session.role !== 'partner' || !session.partnerEmail) {
    sendJson(response, 401, { message: 'Unauthorized.' })
    return null
  }

  return session
}

export function verifyPartnerPassword(password) {
  const expectedPassword = process.env.CASAMIA_PARTNER_PASSWORD || process.env.CASAMIA_PROVIDER_PASSWORD

  if (!expectedPassword || typeof password !== 'string') {
    return false
  }

  return safeEqual(password, expectedPassword)
}

function createSessionToken(sessionPayload) {
  const secret = getInternalSessionSecret()
  const expiresAt = Date.now() + internalSessionDurationMs
  const payload = Buffer.from(
    JSON.stringify({
      ...sessionPayload,
      exp: expiresAt,
      nonce: crypto.randomBytes(12).toString('hex'),
    }),
  ).toString('base64url')
  const signature = signInternalSessionPayload(payload, secret)

  return {
    expiresAt: new Date(expiresAt).toISOString(),
    partnerEmail: sessionPayload.partnerEmail,
    role: sessionPayload.role,
    token: `${payload}.${signature}`,
  }
}

export function verifyInternalPassword(password) {
  const expectedPassword = process.env.CASAMIA_INTERNAL_PASSWORD || process.env.CASAMIA_INTERNAL_API_KEY

  if (!expectedPassword || typeof password !== 'string') {
    return false
  }

  return safeEqual(password, expectedPassword)
}

function getVerifiedSessionFromRequest(request) {
  const authorization = getRequestHeader(request, 'authorization')
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : ''

  return verifySessionToken(bearerToken)
}

function verifySessionTokenForRole(token, role) {
  const session = verifySessionToken(token)

  return Boolean(session && session.role === role)
}

function verifySessionToken(token) {
  if (!token) {
    return null
  }

  const [payload, signature] = token.split('.')

  if (!payload || !signature) {
    return null
  }

  const expectedSignature = signInternalSessionPayload(payload, getInternalSessionSecret())

  if (!safeEqual(signature, expectedSignature)) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    const role = parsed.role === 'partner' ? 'partner' : parsed.role === 'internal' ? 'internal' : ''
    const partnerEmail = normalizeEmail(parsed.partnerEmail)

    if (!role || typeof parsed.exp !== 'number' || parsed.exp <= Date.now()) {
      return null
    }

    return {
      expiresAt: new Date(parsed.exp).toISOString(),
      partnerEmail,
      role,
    }
  } catch {
    return null
  }
}

function getInternalSessionSecret() {
  return process.env.CASAMIA_INTERNAL_SESSION_SECRET || process.env.CASAMIA_INTERNAL_API_KEY || ''
}

function signInternalSessionPayload(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left))
  const rightBuffer = Buffer.from(String(right))

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function getRequestHeader(request, name) {
  const direct = request.headers?.[name] ?? request.headers?.[name.toLowerCase()]

  if (direct) {
    return Array.isArray(direct) ? direct[0] : direct
  }

  return request.headers?.get?.(name)
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })

    request.on('error', reject)
  })
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      error: {
        ok: false,
        status: 500,
        body: {
          message: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.',
        },
      },
    }
  }

  return {
    supabaseUrl: normalizeSupabaseUrl(supabaseUrl),
    serviceRoleKey,
  }
}

function normalizeSupabaseUrl(value) {
  const trimmedValue = value.trim()

  try {
    const url = new URL(trimmedValue)
    url.pathname = url.pathname
      .replace(/\/+$/, '')
      .replace(/\/rest\/v1$/i, '')
      .replace(/\/+$/, '')
    url.search = ''
    url.hash = ''

    return url.toString().replace(/\/+$/, '')
  } catch {
    return trimmedValue
      .replace(/[?#].*$/, '')
      .replace(/\/+$/, '')
      .replace(/\/rest\/v1$/i, '')
      .replace(/\/+$/, '')
  }
}

async function requestSupabase(path, init = {}, options = {}) {
  const config = getSupabaseConfig()

  if (config.error) {
    return config.error
  }

  const controller = new AbortController()
  const callerSignal = options.signal ?? init.signal
  const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
    ? options.timeoutMs
    : supabaseRequestTimeoutMs
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const abortFromCaller = () => controller.abort(callerSignal?.reason)

  if (callerSignal?.aborted) abortFromCaller()
  else callerSignal?.addEventListener?.('abort', abortFromCaller, { once: true })

  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        ...jsonHeaders,
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    })
    const text = await response.text()
    const body = text ? JSON.parse(text) : {}

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        body: {
          message: body.message ?? body.error ?? 'Supabase request failed.',
          details: body.details,
        },
      }
    }

    return {
      ok: true,
      status: response.status,
      body,
    }
  } catch (error) {
    if (controller.signal.aborted && !callerSignal?.aborted) {
      return {
        ok: false,
        status: 503,
        body: {
          message: 'CasaMia database connection timed out. Please try again shortly.',
        },
      }
    }

    console.error('Supabase request failed', {
      cause: error?.cause?.message,
      code: error?.cause?.code,
      message: error instanceof Error ? error.message : String(error),
    })

    return {
      ok: false,
      status: 503,
      body: {
        message: 'CasaMia database connection is unavailable. Check SUPABASE_URL in Vercel and try again.',
      },
    }
  } finally {
    clearTimeout(timeout)
    callerSignal?.removeEventListener?.('abort', abortFromCaller)
  }
}

async function requestSupabaseStorage(path, init = {}) {
  const config = getSupabaseConfig()

  if (config.error) {
    return config.error
  }

  const response = await fetch(`${config.supabaseUrl}/storage/v1/${path}`, {
    ...init,
    headers: {
      ...jsonHeaders,
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      ...(init.headers ?? {}),
    },
  })
  const text = await response.text()
  let body = {}

  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = { message: text }
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      body: {
        message: body.message ?? body.error ?? 'Supabase Storage request failed.',
        details: body.details,
      },
    }
  }

  return {
    ok: true,
    status: response.status,
    body,
    supabaseUrl: config.supabaseUrl,
  }
}

export async function ensurePrivateStorageBucket({ bucket, fileSizeLimit, allowedMimeTypes }) {
  const existing = await requestSupabaseStorage(`bucket/${encodeURIComponent(bucket)}`, { method: 'GET' })
  const settings = {
    public: false,
    file_size_limit: fileSizeLimit,
    allowed_mime_types: allowedMimeTypes,
  }

  if (!existing.ok && existing.status !== 404) return existing

  if (existing.status === 404) {
    return requestSupabaseStorage('bucket', {
      body: JSON.stringify({ id: bucket, name: bucket, ...settings }),
      method: 'POST',
    })
  }

  const needsUpdate = existing.body.public !== false
    || existing.body.file_size_limit !== fileSizeLimit
    || JSON.stringify(existing.body.allowed_mime_types ?? []) !== JSON.stringify(allowedMimeTypes)

  if (!needsUpdate) return existing

  return requestSupabaseStorage(`bucket/${encodeURIComponent(bucket)}`, {
    body: JSON.stringify({ id: bucket, name: bucket, ...settings }),
    method: 'PUT',
  })
}

export async function createSignedStorageUploadUrl(bucket, objectPath) {
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/')
  const result = await requestSupabaseStorage(
    `object/upload/sign/${encodeURIComponent(bucket)}/${encodedPath}`,
    { body: '{}', method: 'POST' },
  )

  if (!result.ok) return result

  const relativeUrl = typeof result.body.url === 'string' ? result.body.url : ''
  if (!relativeUrl) {
    return {
      ok: false,
      status: 502,
      body: { message: 'Supabase Storage did not return a signed upload URL.' },
    }
  }

  const signedUrl = /^https?:\/\//i.test(relativeUrl)
    ? relativeUrl
    : relativeUrl.startsWith('/storage/v1/')
      ? `${result.supabaseUrl}${relativeUrl}`
      : `${result.supabaseUrl}/storage/v1${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`

  return {
    ok: true,
    status: result.status,
    body: { signedUrl },
  }
}

export async function getStorageObjectInfo(bucket, objectPath) {
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/')
  return requestSupabaseStorage(
    `object/info/${encodeURIComponent(bucket)}/${encodedPath}`,
    { method: 'GET' },
  )
}

export async function removeStorageObjects(bucket, objectPaths) {
  if (!objectPaths.length) return { ok: true, status: 200, body: [] }

  return requestSupabaseStorage(`object/${encodeURIComponent(bucket)}`, {
    body: JSON.stringify({ prefixes: objectPaths }),
    method: 'DELETE',
  })
}

export async function selectSupabaseRows(tableName, query = 'select=*') {
  return requestSupabase(`${tableName}?${query}`, {
    method: 'GET',
  })
}

export async function callSupabaseRpc(functionName, payload = {}, options = {}) {
  return requestSupabase(`rpc/${encodeURIComponent(functionName)}`, {
    body: JSON.stringify(payload),
    method: 'POST',
  }, options)
}

export async function upsertSupabaseRow(tableName, payload, onConflict = 'id', options = {}) {
  return requestSupabase(`${tableName}?on_conflict=${encodeURIComponent(onConflict)}`, {
    body: JSON.stringify(payload),
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    method: 'POST',
  }, options)
}

export async function createSupabaseRowIfAbsent(tableName, payload, onConflict = 'id', options = {}) {
  return requestSupabase(`${tableName}?on_conflict=${encodeURIComponent(onConflict)}`, {
    body: JSON.stringify(payload),
    headers: {
      Prefer: 'resolution=ignore-duplicates,return=representation',
    },
    method: 'POST',
  }, options)
}

export async function updateSupabaseRows(tableName, payload, query) {
  return requestSupabase(`${tableName}?${query}`, {
    body: JSON.stringify(payload),
    headers: {
      Prefer: 'return=representation',
    },
    method: 'PATCH',
  })
}

export async function deleteSupabaseRows(tableName, query) {
  return requestSupabase(`${tableName}?${query}`, {
    headers: {
      Prefer: 'return=representation',
    },
    method: 'DELETE',
  })
}

export async function insertSupabaseRow(tableName, payload, options = {}) {
  const result = await requestSupabase(tableName, {
    body: JSON.stringify(payload),
    headers: {
      Prefer: 'return=representation',
    },
    method: 'POST',
  }, options)

  if (!result.ok) {
    return result
  }

  const body = result.body
  const record = Array.isArray(body) ? body[0] : body

  return {
    ok: true,
    status: 200,
    body: {
      id: record?.id,
      record,
      status: record?.status ?? payload.status ?? 'New',
    },
  }
}

export async function handleSupabaseInsert(request, response, tableName, mapPayload) {
  if (!requirePost(request, response)) {
    return
  }

  try {
    const body = await readJsonBody(request)
    const payload = mapPayload(body)
    const result = await insertSupabaseRow(tableName, payload)
    sendJson(response, result.status, result.body)
  } catch (error) {
    sendJson(response, 400, {
      message: error instanceof Error ? error.message : 'Invalid request.',
    })
  }
}
