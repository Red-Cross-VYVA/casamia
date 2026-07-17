import { postPublicSiteJson } from './publicSiteApi'

export type ElevenLabsServerLocation = 'us' | 'global' | 'eu-residency' | 'in-residency'

export type ElevenLabsConversationAccess = {
  token: string
  serverLocation: ElevenLabsServerLocation
}

type ConversationAccessRequest = {
  locale: 'en' | 'es'
  signal?: AbortSignal
  wizardReference: string
}

const supportedServerLocations: ElevenLabsServerLocation[] = [
  'us',
  'global',
  'eu-residency',
  'in-residency',
]

export async function requestElevenLabsConversationAccess({
  locale,
  signal,
  wizardReference,
}: ConversationAccessRequest) {
  const access = await postPublicSiteJson<ElevenLabsConversationAccess>(
    '/api/public/elevenlabs-conversation-token',
    {
      consentConfirmed: true,
      locale,
      wizardReference,
    },
    { signal },
  )

  if (
    typeof access.token !== 'string'
    || !access.token
    || !supportedServerLocations.includes(access.serverLocation)
  ) {
    throw new Error('The voice assistant returned an invalid session.')
  }

  return access
}
