import { getInternalAuthHeaders, hasInternalBackendSession } from './internalAuth.ts'
import { getPublicSiteApiBaseUrl, getPublicSiteJson, hasPublicSiteApi } from './publicSiteApi.ts'

export type FacebookStarterPost = {
  caption: string
  id: string
  imagePath: string
  language: 'English' | 'Spanish'
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

function bilingualPost(campaign: Omit<FacebookStarterPost, 'caption' | 'id' | 'language'> & {
  captions: { en: string; es: string }
  id: string
  imagePaths?: { en: string; es: string }
}): FacebookStarterPost[] {
  return [
    {
      caption: campaign.captions.en,
      id: `${campaign.id}-en`,
      imagePath: campaign.imagePaths?.en ?? campaign.imagePath,
      language: 'English',
      title: campaign.title,
    },
    {
      caption: campaign.captions.es,
      id: `${campaign.id}-es`,
      imagePath: campaign.imagePaths?.es ?? campaign.imagePath,
      language: 'Spanish',
      title: campaign.title,
    },
  ]
}

export type FacebookCampaignReplacementResult = {
  deleted: number
  published: Array<FacebookPublishResult & { id: string }>
}

const previousCampaignPostIds = [
  '605133552680332_122185150880808505',
  '605133552680332_122185150778808505',
  '605133552680332_122185150598808505',
  '605133552680332_122185150436808505',
  '605133552680332_122185150310808505',
  '605133552680332_122185150190808505',
  '605133552680332_122185149950808505',
  '605133552680332_122185149788808505',
  '605133552680332_122185148726808505',
  '605133552680332_122185145600808505',
] as const

export const facebookStarterPosts: FacebookStarterPost[] = [
  ...bilingualPost({
    id: 'welcome-safer-homes',
    imagePath: '/brand-assets/social/facebook-starter-posts/01-welcome-safer-homes.jpg',
    imagePaths: {
      en: '/brand-assets/social/facebook-starter-posts/01-welcome-safer-homes-en.jpg',
      es: '/brand-assets/social/facebook-starter-posts/01-welcome-safer-homes-es.jpg',
    },
    title: 'Welcome to CasaMia',
    captions: {
      en: 'A safer home starts with the room or routine that worries you most.\n\nCasaMia helps turn that concern into a clear next step: what to check first, what can wait, what needs measuring and what may need a visit before anything is fitted.\n\nStart with the real home. Leave with practical priorities.\n\nStart here: https://www.casamia.com.es/?utm_source=facebook&utm_medium=organic_social&utm_campaign=welcome&utm_content=en\n\n#CasaMia #HomeSafety #SaferHome #Spain',
      es: 'Una vivienda más segura empieza por la estancia o rutina que más preocupa.\n\nCasaMia convierte esa preocupación en un siguiente paso claro: qué revisar primero, qué puede esperar, qué necesita medidas y cuándo conviene una visita antes de instalar nada.\n\nEmpieza por la vivienda real. Sal con prioridades prácticas.\n\nEmpieza aquí: https://www.casamia.com.es/?utm_source=facebook&utm_medium=organic_social&utm_campaign=welcome&utm_content=es\n\n#CasaMia #SeguridadEnCasa #HogarSeguro #España',
    },
  }),
  ...bilingualPost({
    id: 'home-safety-review',
    imagePath: '/brand-assets/social/facebook-starter-posts/02-home-safety-review.jpg',
    imagePaths: {
      en: '/brand-assets/social/facebook-starter-posts/02-home-safety-review-en.jpg',
      es: '/brand-assets/social/facebook-starter-posts/02-home-safety-review-es.jpg',
    },
    title: 'Home Safety Review',
    captions: {
      en: 'Not sure whether to use photos, book a visit or choose a starter package?\n\nUse the guided home review first. CasaMia asks about the rooms, routes and daily moments that feel less safe, then turns the answers into practical priorities.\n\nNo guesswork. No product list before the problem is clear.\n\nStart the guided review: https://www.casamia.com.es/home-safety-wizard?utm_source=facebook&utm_medium=organic_social&utm_campaign=home_safety_review&utm_content=en\n\n#HomeSafetyAssessment #HomeReview #CasaMia',
      es: '¿No sabes si empezar con fotos, una visita o un pack inicial?\n\nEmpieza con la revisión guiada. CasaMia pregunta por estancias, recorridos y momentos diarios que se sienten menos seguros, y convierte las respuestas en prioridades prácticas.\n\nSin adivinar. Sin lista de productos antes de entender el problema.\n\nEmpezar revisión guiada: https://www.casamia.com.es/home-safety-wizard?utm_source=facebook&utm_medium=organic_social&utm_campaign=home_safety_review&utm_content=es\n\n#SeguridadEnCasa #RevisionDelHogar #CasaMia',
    },
  }),
  ...bilingualPost({
    id: 'bathroom-safety',
    imagePath: '/brand-assets/social/facebook-starter-posts/03-bathroom-safety.jpg',
    imagePaths: {
      en: '/brand-assets/social/facebook-starter-posts/03-bathroom-safety-en.jpg',
      es: '/brand-assets/social/facebook-starter-posts/03-bathroom-safety-es.jpg',
    },
    title: 'Bathroom Safety',
    captions: {
      en: 'Bathroom safety is not just one grab bar.\n\nIt is the whole movement: entering, washing, turning, drying, using the toilet and leaving without reaching for the wrong support.\n\nCasaMia reviews the routine first, then confirms what should be fitted and what still needs measuring.\n\nReview bathroom safety: https://www.casamia.com.es/services/bathroom-safety?utm_source=facebook&utm_medium=organic_social&utm_campaign=bathroom_safety&utm_content=en\n\n#BathroomSafety #FallPrevention #HomeAdaptations',
      es: 'La seguridad en el baño no es solo una barra de apoyo.\n\nEs todo el movimiento: entrar, lavarse, girar, secarse, usar el WC y salir sin agarrarse a un punto inseguro.\n\nCasaMia revisa primero la rutina, después confirma qué conviene instalar y qué necesita medidas.\n\nRevisar seguridad en el baño: https://www.casamia.com.es/services/bathroom-safety?utm_source=facebook&utm_medium=organic_social&utm_campaign=bathroom_safety&utm_content=es\n\n#SeguridadEnElBaño #PrevencionDeCaidas #AdaptacionesDelHogar',
    },
  }),
  ...bilingualPost({
    id: 'grant-guidance',
    imagePath: '/brand-assets/social/facebook-starter-posts/04-grant-guidance.jpg',
    imagePaths: {
      en: '/brand-assets/social/facebook-starter-posts/04-grant-guidance-en.jpg',
      es: '/brand-assets/social/facebook-starter-posts/04-grant-guidance-es.jpg',
    },
    title: 'Grant Guidance',
    captions: {
      en: 'Public support may help with some home adaptations, but approval is never automatic.\n\nCasaMia helps organise the first questions: which route may apply, what documents are usually needed, and what evidence should be prepared before spending time on paperwork.\n\nThe public authority decides. We help you prepare clearly.\n\nCheck grant guidance: https://www.casamia.com.es/grants?utm_source=facebook&utm_medium=organic_social&utm_campaign=grant_guidance&utm_content=en\n\n#HomeAdaptationGrants #Accessibility #Spain',
      es: 'Algunas adaptaciones pueden encajar con ayudas públicas, pero la aprobación nunca es automática.\n\nCasaMia ayuda a ordenar las primeras preguntas: qué vía puede aplicar, qué documentos suelen hacer falta y qué evidencia conviene preparar antes de dedicar tiempo al papeleo.\n\nLa administración decide. Nosotros te ayudamos a prepararlo con claridad.\n\nVer orientación sobre ayudas: https://www.casamia.com.es/grants?utm_source=facebook&utm_medium=organic_social&utm_campaign=grant_guidance&utm_content=es\n\n#AyudasParaAdaptarElHogar #Accesibilidad #España',
    },
  }),
  ...bilingualPost({
    id: 'starter-packs',
    imagePath: '/brand-assets/social/facebook-starter-posts/05-core-safety-packs.jpg',
    imagePaths: {
      en: '/brand-assets/social/facebook-starter-posts/05-core-safety-packs-en.jpg',
      es: '/brand-assets/social/facebook-starter-posts/05-core-safety-packs-es.jpg',
    },
    title: 'Starter Packs',
    captions: {
      en: 'The best home adaptation is not always the biggest one.\n\nSometimes the right first step is a focused bathroom change, clearer night movement, safer entrance access or better support where the person already reaches.\n\nCasaMia starter packs keep the first decision practical, then final scope and price are confirmed after review.\n\nView starter packs: https://www.casamia.com.es/plans?utm_source=facebook&utm_medium=organic_social&utm_campaign=starter_packs&utm_content=en\n\n#HomeAdaptations #SaferHome #CasaMia',
      es: 'La mejor adaptación no siempre es la más grande.\n\nA veces el primer paso correcto es una mejora concreta en el baño, moverse mejor de noche, una entrada más segura o apoyo justo donde la persona ya intenta agarrarse.\n\nLos packs iniciales de CasaMia ayudan a tomar una primera decisión práctica; el alcance y precio final se confirman después de revisar.\n\nVer packs iniciales: https://www.casamia.com.es/plans?utm_source=facebook&utm_medium=organic_social&utm_campaign=starter_packs&utm_content=es\n\n#AdaptacionesDelHogar #HogarSeguro #CasaMia',
    },
  }),
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

export async function replacePreviousFacebookCampaign(): Promise<FacebookCampaignReplacementResult> {
  ensureInternalPublishingAvailable()

  const deletion = await postFacebookPublishJson<{
    deleted: number
    failed: number
    ok: boolean
  }>('/api/internal/facebook-posts', {
    postIds: previousCampaignPostIds,
  }, {
    headers: getInternalAuthHeaders(),
    method: 'DELETE',
  })

  if (!deletion.ok || deletion.deleted !== previousCampaignPostIds.length || deletion.failed) {
    throw new Error(`Facebook removed ${deletion.deleted} of ${previousCampaignPostIds.length} old campaign posts. No replacements were published.`)
  }

  const published: FacebookCampaignReplacementResult['published'] = []
  for (const post of facebookStarterPosts) {
    const result = await publishFacebookStarterPost({
      imagePath: post.imagePath,
      message: post.caption,
    })
    published.push({ ...result, id: post.id })
  }

  return { deleted: deletion.deleted, published }
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
