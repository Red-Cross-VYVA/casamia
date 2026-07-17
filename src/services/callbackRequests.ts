import { postPublicSiteJson } from './publicSiteApi.ts'
import {
  WIZARD_CALLBACK_TIME_WINDOWS,
  type WizardCallbackTimeWindow,
} from '../types/wizard.ts'

export const callbackTimeWindows = WIZARD_CALLBACK_TIME_WINDOWS

export type CallbackRequestInput = {
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

export function createCallbackRequestPayload(input: CallbackRequestInput) {
  return {
    city: input.city.trim(),
    consentConfirmed: input.consentConfirmed,
    email: input.email?.trim() ?? '',
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

export async function submitCallbackRequest(input: CallbackRequestInput) {
  const response = await postPublicSiteJson<CallbackRequestResponse>(
    '/api/public/callback-requests',
    createCallbackRequestPayload(input),
  )

  return {
    id: response.id ? String(response.id) : undefined,
    status: response.status ?? 'New',
  }
}
