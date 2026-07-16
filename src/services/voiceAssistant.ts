import {
  getInternalAuthHeaders,
  hasInternalBackendSession,
} from './internalAuth'
import { getPublicSiteApiBaseUrl } from './publicSiteApi'

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> }).env ?? {}
const voicePreviewPath = '/api/internal/voice-preview'

export const voiceAssistantFeatureEnabled = ['1', 'true', 'yes'].includes(
  String(viteEnv.VITE_ENABLE_VOICE_ASSISTANT ?? '').toLowerCase(),
)

export type VoiceAssistantStatus = {
  configured: boolean
  maxCharacters: number
  missing: string[]
  modelId: string
}

export async function getVoiceAssistantStatus() {
  requireBackendSession()

  const response = await fetch(`${getPublicSiteApiBaseUrl()}${voicePreviewPath}`, {
    headers: getInternalAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(await readVoiceError(response))
  }

  return (await response.json()) as VoiceAssistantStatus
}

export async function requestVoicePreview(text: string) {
  requireBackendSession()

  const response = await fetch(`${getPublicSiteApiBaseUrl()}${voicePreviewPath}`, {
    body: JSON.stringify({ text }),
    headers: {
      'Content-Type': 'application/json',
      ...getInternalAuthHeaders(),
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(await readVoiceError(response))
  }

  return response.blob()
}

function requireBackendSession() {
  if (!hasInternalBackendSession()) {
    throw new Error('Voice previews need the deployed internal API. Local demo mode cannot use server secrets.')
  }
}

async function readVoiceError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message ?? 'Unable to generate a voice preview.'
  } catch {
    return 'Unable to generate a voice preview.'
  }
}
