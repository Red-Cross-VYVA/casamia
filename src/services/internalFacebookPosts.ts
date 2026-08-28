import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth.ts'
import { getPublicSiteApiBaseUrl, getPublicSiteJson, hasPublicSiteApi } from './publicSiteApi.ts'

export type FacebookStarterPost = {
  caption: string
  id: string
  imagePath: string
  title: string
}

export type FacebookPublishingStatus = {
  apiVersion: string
  configured: boolean
  missing: string[]
  pageId: string
  pageUrl: string
  tokenDiagnostics?: {
    checked: boolean
    errors?: string[]
    grantedPermissions?: string[]
    identityId?: string
    identityName?: string
    missingPermissions: string[]
    pageAccessible: boolean
    pageMatchesIdentity?: boolean
    pageName?: string
    permissionsChecked?: boolean
    permissionsMessage?: string
    ready: boolean
  }
  unsupportedApiVersion?: string
}

export type FacebookPublishResult = {
  facebookId: string
  facebookPostId: string
  facebookUrl: string
  kind: 'feed' | 'photo'
  ok: boolean
  provider: string
}

export const facebookStarterPosts: FacebookStarterPost[] = [
  {
    id: 'welcome-safer-homes',
    imagePath: '/brand-assets/social/facebook-starter-posts/01-welcome-safer-homes.jpg',
    title: 'Welcome to CasaMia',
    caption: [
      'Welcome to CasaMia.',
      '',
      'We help older adults live more safely and confidently at home with practical home safety assessments, room-by-room adaptation packages, grant guidance and trusted installation support across Spain.',
      '',
      'Start with the rooms that matter most. We will help you turn concerns into a clear plan.',
      '',
      'Learn more: https://www.casamia.com.es/?utm_source=facebook&utm_medium=organic_social&utm_campaign=welcome',
      '',
      '#CasaMia #HomeSafety #AgingInPlace #Spain',
    ].join('\n'),
  },
  {
    id: 'home-safety-review',
    imagePath: '/brand-assets/social/facebook-starter-posts/02-home-safety-review.jpg',
    title: 'Home Safety Review',
    caption: [
      'Not sure what the home really needs?',
      '',
      'CasaMia starts with a practical safety review: the daily routes, bathroom, kitchen, bedroom, entrance and the moments where support would make life calmer.',
      '',
      'The result is a clear next-step plan, not a confusing product list.',
      '',
      'Book your home safety review: https://www.casamia.com.es/home-safety-wizard?utm_source=facebook&utm_medium=organic_social&utm_campaign=home_safety_review',
      '',
      '#HomeSafetyAssessment #SeniorSafety #CasaMia',
    ].join('\n'),
  },
  {
    id: 'bathroom-safety',
    imagePath: '/brand-assets/social/facebook-starter-posts/03-bathroom-safety.jpg',
    title: 'Bathroom Safety',
    caption: [
      'Bathrooms are one of the most common places families worry about.',
      '',
      'Support rails, safer surfaces, better visibility and easier transfers can make daily routines feel more secure without making the room feel institutional.',
      '',
      'CasaMia helps choose the right level of support for the person and the bathroom.',
      '',
      'Explore bathroom safety support: https://www.casamia.com.es/services/bathroom-safety?utm_source=facebook&utm_medium=organic_social&utm_campaign=bathroom_safety',
      '',
      '#BathroomSafety #FallPrevention #AgingAtHome',
    ].join('\n'),
  },
  {
    id: 'grant-guidance',
    imagePath: '/brand-assets/social/facebook-starter-posts/04-grant-guidance.jpg',
    title: 'Grant Guidance',
    caption: [
      'Some home adaptations may qualify for public support or local grant routes.',
      '',
      'CasaMia helps families understand the likely route, prepare practical evidence and connect the grant file to a realistic adaptation plan.',
      '',
      'Availability and approval always depend on the relevant authority.',
      '',
      'Check grant guidance: https://www.casamia.com.es/grants?utm_source=facebook&utm_medium=organic_social&utm_campaign=grant_guidance',
      '',
      '#HomeAdaptationGrants #Accessibility #Spain',
    ].join('\n'),
  },
  {
    id: 'starter-packs',
    imagePath: '/brand-assets/social/facebook-starter-posts/05-core-safety-packs.jpg',
    title: 'Starter Packs',
    caption: [
      'You do not need to redesign the whole home to make a safer start.',
      '',
      'CasaMia starter packs focus on practical first steps: safer bathroom support, clearer bedroom movement, kitchen visibility, entrance access and the everyday routes that matter.',
      '',
      'Choose a starter pack or build room by room.',
      '',
      'Explore starter packs: https://www.casamia.com.es/plans?utm_source=facebook&utm_medium=organic_social&utm_campaign=starter_packs',
      '',
      '#HomeAdaptations #SeniorLiving #CasaMia',
    ].join('\n'),
  },
]

export async function getFacebookPublishingStatus(): Promise<FacebookPublishingStatus> {
  ensureInternalPublishingAvailable()

  return getPublicSiteJson<FacebookPublishingStatus>('/api/internal/facebook-posts', {
    headers: getInternalAuthHeaders(),
  })
}

export async function publishFacebookStarterPost({
  imagePath,
  message,
}: {
  imagePath: string
  message: string
}) {
  ensureInternalPublishingAvailable()

  return postFacebookPublishJson<FacebookPublishResult>('/api/internal/facebook-posts', {
    imagePath,
    message,
  }, {
    headers: getInternalAuthHeaders(),
  })
}

async function postFacebookPublishJson<T>(
  path: string,
  payload: unknown,
  init: RequestInit = {},
) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${path}`, {
    ...init,
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
    method: init.method ?? 'POST',
  })

  const text = await response.text()
  const body = parseJson(text)

  if (!response.ok) {
    throw new Error(formatFacebookPublishError(response.status, body))
  }

  return (body ?? {}) as T
}

function formatFacebookPublishError(status: number, body: unknown) {
  const errorBody = isRecord(body) ? body : {}
  const details = isRecord(errorBody.details) ? errorBody.details : {}
  const message = typeof errorBody.message === 'string'
    ? errorBody.message
    : `Facebook publishing failed with ${status}.`
  const extra = [
    details.graphType ? String(details.graphType) : '',
    details.graphCode ? `code ${String(details.graphCode)}` : '',
    details.graphSubcode ? `subcode ${String(details.graphSubcode)}` : '',
    details.graphErrorUserTitle ? String(details.graphErrorUserTitle) : '',
    details.graphErrorUserMessage ? String(details.graphErrorUserMessage) : '',
    details.graphFbtraceId ? `fbtrace ${String(details.graphFbtraceId)}` : '',
  ].filter(Boolean)

  return extra.length ? `${message} (${extra.join(' · ')})` : message
}

function parseJson(value: string) {
  try {
    return value ? JSON.parse(value) as unknown : null
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function ensureInternalPublishingAvailable() {
  if (!hasPublicSiteApi() || !getPublicSiteApiBaseUrl() && !import.meta.env.PROD) {
    throw new Error('Facebook publishing is available from the deployed internal admin panel.')
  }

  if (!hasInternalBackendSession()) {
    throw new Error('Sign in to the deployed internal admin panel to publish Facebook posts.')
  }
}
