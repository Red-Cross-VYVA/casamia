import { postPublicSiteJson } from './publicSiteApi.ts'
import {
  WIZARD_CALLBACK_TIME_WINDOWS,
  type WizardCallbackRequest,
  type WizardCallbackTimeWindow,
  type WizardContact,
} from '../types/wizard.ts'

export const callbackTimeWindows = WIZARD_CALLBACK_TIME_WINDOWS
export const callbackRequestTimeoutMs = 15_000

export type CallbackRequestInput = {
  idempotencyKey: string
  name: string
  phone: string
  email?: string
  city: string
  preferredCallbackDate: string
  preferredTimeWindow: WizardCallbackTimeWindow
  note?: string
  wizardReference: string
  locale: 'en' | 'es'
  consentConfirmed: boolean
  website?: string
}

export type CallbackRequestResponse = {
  id?: string
  status: string
}

type CallbackRequestTransport = (
  path: string,
  payload: unknown,
  init?: RequestInit,
) => Promise<CallbackRequestResponse>

type CallbackRequestOptions = {
  requestJson?: CallbackRequestTransport
  timeoutMs?: number
}

export function createCallbackRequestPayload(input: CallbackRequestInput) {
  return {
    city: input.city.trim(),
    consentConfirmed: input.consentConfirmed,
    email: input.email?.trim() ?? '',
    idempotencyKey: input.idempotencyKey.trim().toLowerCase(),
    locale: input.locale,
    name: input.name.trim(),
    note: input.note?.trim() ?? '',
    phone: input.phone.trim(),
    preferredCallbackDate: input.preferredCallbackDate,
    preferredTimeWindow: input.preferredTimeWindow,
    timeZone: 'Europe/Madrid' as const,
    website: input.website ?? '',
    wizardReference: input.wizardReference.trim().toUpperCase(),
  }
}

export function createCallbackRequestIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Secure callback requests are not supported in this browser.')
  }
  globalThis.crypto.getRandomValues(bytes)

  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function createEmptyCallbackRequest(): WizardCallbackRequest {
  return {
    consent: false,
    note: '',
    preferredDate: '',
    preferredTimeWindow: '',
  }
}

export function clearCallbackContact(contact: WizardContact): WizardContact {
  return {
    ...contact,
    city: '',
    consent: false,
    email: '',
    fullName: '',
    phone: '',
  }
}

export async function submitCallbackRequest(
  input: CallbackRequestInput,
  options: CallbackRequestOptions = {},
) {
  const controller = new AbortController()
  const timeoutMs = Number.isFinite(options.timeoutMs) && Number(options.timeoutMs) > 0
    ? Number(options.timeoutMs)
    : callbackRequestTimeoutMs
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs)
  const requestJson: CallbackRequestTransport = options.requestJson
    ?? ((path, payload, init) => postPublicSiteJson<CallbackRequestResponse>(path, payload, init))

  let response: CallbackRequestResponse
  try {
    response = await requestJson(
      '/api/public/callback-requests',
      createCallbackRequestPayload(input),
      { signal: controller.signal },
    )
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('The callback request timed out. Please try again.')
    }
    throw error
  } finally {
    globalThis.clearTimeout(timeout)
  }

  return {
    id: response.id ? String(response.id) : undefined,
    status: response.status ?? 'New',
  }
}
