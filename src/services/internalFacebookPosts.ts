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
      en: 'Welcome to CasaMia.\n\nWe help older adults live more safely and confidently at home with practical home safety assessments, room-by-room adaptation packages, grant guidance and trusted installation support across Spain.\n\nStart with the rooms that matter most. We will help you turn concerns into a clear plan.\n\nLearn more: https://www.casamia.com.es/?utm_source=facebook&utm_medium=organic_social&utm_campaign=welcome&utm_content=en\n\n#CasaMia #HomeSafety #AgingInPlace #Spain',
      es: 'Bienvenidos a CasaMia.\n\nAyudamos a las personas mayores a vivir con más seguridad y confianza en casa mediante evaluaciones prácticas, packs de adaptación por estancias, orientación sobre ayudas y apoyo de instalación de confianza en toda España.\n\nEmpieza por las estancias que más importan. Te ayudaremos a convertir tus preocupaciones en un plan claro.\n\nMás información: https://www.casamia.com.es/?utm_source=facebook&utm_medium=organic_social&utm_campaign=welcome&utm_content=es\n\n#CasaMia #SeguridadEnElHogar #EnvejecerEnCasa #España',
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
      en: 'Not sure what the home really needs?\n\nCasaMia starts with a practical safety review: the daily routes, bathroom, kitchen, bedroom, entrance and the moments where support would make life calmer.\n\nThe result is a clear next-step plan, not a confusing product list.\n\nBook your home safety review: https://www.casamia.com.es/home-safety-wizard?utm_source=facebook&utm_medium=organic_social&utm_campaign=home_safety_review&utm_content=en\n\n#HomeSafetyAssessment #SeniorSafety #CasaMia',
      es: '¿No tienes claro qué necesita realmente el hogar?\n\nCasaMia comienza con una evaluación práctica de seguridad: los recorridos diarios, el baño, la cocina, el dormitorio, la entrada y aquellos momentos en los que un poco de apoyo puede aportar más tranquilidad.\n\nEl resultado es un plan claro con los próximos pasos, no una lista confusa de productos.\n\nReserva tu evaluación de seguridad: https://www.casamia.com.es/home-safety-wizard?utm_source=facebook&utm_medium=organic_social&utm_campaign=home_safety_review&utm_content=es\n\n#SeguridadEnElHogar #PersonasMayores #CasaMia',
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
      en: 'Bathrooms are one of the most common places families worry about.\n\nSupport rails, safer surfaces, better visibility and easier transfers can make daily routines feel more secure without making the room feel institutional.\n\nCasaMia helps choose the right level of support for the person and the bathroom.\n\nExplore bathroom safety support: https://www.casamia.com.es/services/bathroom-safety?utm_source=facebook&utm_medium=organic_social&utm_campaign=bathroom_safety&utm_content=en\n\n#BathroomSafety #FallPrevention #AgingAtHome',
      es: 'El baño es uno de los lugares que más preocupa a muchas familias.\n\nLas barras de apoyo, las superficies más seguras, una mejor visibilidad y las transferencias más fáciles pueden dar más tranquilidad a las rutinas diarias sin que la estancia parezca institucional.\n\nCasaMia ayuda a elegir el nivel de apoyo adecuado para la persona y su baño.\n\nDescubre nuestras soluciones de seguridad para el baño: https://www.casamia.com.es/services/bathroom-safety?utm_source=facebook&utm_medium=organic_social&utm_campaign=bathroom_safety&utm_content=es\n\n#SeguridadEnElBaño #PrevenciónDeCaídas #EnvejecerEnCasa',
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
      en: 'Some home adaptations may qualify for public support or local grant routes.\n\nCasaMia helps families understand the likely route, prepare practical evidence and connect the grant file to a realistic adaptation plan.\n\nAvailability and approval always depend on the relevant authority.\n\nCheck grant guidance: https://www.casamia.com.es/grants?utm_source=facebook&utm_medium=organic_social&utm_campaign=grant_guidance&utm_content=en\n\n#HomeAdaptationGrants #Accessibility #Spain',
      es: 'Algunas adaptaciones del hogar pueden optar a ayudas públicas o programas locales.\n\nCasaMia ayuda a las familias a entender la vía más probable, preparar pruebas prácticas y vincular la solicitud de ayuda con un plan de adaptación realista.\n\nLa disponibilidad y la aprobación dependen siempre de la administración correspondiente.\n\nConsulta nuestra orientación sobre ayudas: https://www.casamia.com.es/grants?utm_source=facebook&utm_medium=organic_social&utm_campaign=grant_guidance&utm_content=es\n\n#AyudasParaAdaptarElHogar #Accesibilidad #España',
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
      en: 'You do not need to redesign the whole home to make a safer start.\n\nCasaMia starter packs focus on practical first steps: safer bathroom support, clearer bedroom movement, kitchen visibility, entrance access and the everyday routes that matter.\n\nChoose a starter pack or build room by room.\n\nExplore starter packs: https://www.casamia.com.es/plans?utm_source=facebook&utm_medium=organic_social&utm_campaign=starter_packs&utm_content=en\n\n#HomeAdaptations #SeniorLiving #CasaMia',
      es: 'No es necesario rediseñar toda la vivienda para empezar a hacerla más segura.\n\nLos packs iniciales de CasaMia se centran en primeros pasos prácticos: apoyo más seguro en el baño, movimientos más claros en el dormitorio, mejor visibilidad en la cocina, acceso a la entrada y las rutas cotidianas que más importan.\n\nElige un pack inicial o crea tu solución estancia por estancia.\n\nDescubre los packs iniciales: https://www.casamia.com.es/plans?utm_source=facebook&utm_medium=organic_social&utm_campaign=starter_packs&utm_content=es\n\n#AdaptacionesDelHogar #PersonasMayores #CasaMia',
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
