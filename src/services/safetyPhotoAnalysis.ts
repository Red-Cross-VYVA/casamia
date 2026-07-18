import { getPublicSiteApiBaseUrl } from './publicSiteApi.ts'
import { prepareImageForVision } from './roomPhotoClassification.ts'

export type PhotoFindingCategory =
  | 'access'
  | 'emergency'
  | 'fire'
  | 'lighting'
  | 'reach'
  | 'slip'
  | 'support'
  | 'transfer'
  | 'trip'
  | 'other'

export type SafetyPhotoFinding = {
  category: PhotoFindingCategory
  title: string
  evidence: string
  severity: 'low' | 'medium' | 'high'
  confidence: number
  whyItMatters: string
  action: string
  requiresConfirmation: boolean
}

export type SafetyPhotoAnalysisResult = {
  room: string
  roomConfidence: number
  headline: string
  overview: string
  strengths: string[]
  limitations: string[]
  findings: SafetyPhotoFinding[]
}

export type SafetyPhotoContext = {
  homeType: string
  mainConcern: string
  urgency: string
  mobilityProfile: string
  description: string
}

export async function analyseSafetyPhoto(
  file: File,
  options: {
    assignedRoom: string
    context: SafetyPhotoContext
    locale: string
  },
): Promise<SafetyPhotoAnalysisResult> {
  const image = await prepareImageForVision(file)
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 30_000)

  try {
    const response = await fetch(`${getPublicSiteApiBaseUrl()}/api/public/analyse-safety-photo`, {
      body: JSON.stringify({
        ...image,
        assignedRoom: normaliseRoom(options.assignedRoom),
        context: options.context,
        locale: options.locale,
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      signal: controller.signal,
    })

    if (!response.ok) throw new Error(`Safety photo analysis failed with ${response.status}.`)

    return await response.json() as SafetyPhotoAnalysisResult
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function normaliseRoom(room: string) {
  const value = room
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (value.includes('bath') || value.includes('bano')) return 'bathroom'
  if (value.includes('bed') || value.includes('dormitorio')) return 'bedroom'
  if (value.includes('kitchen') || value.includes('cocina')) return 'kitchen'
  if (value.includes('living') || value.includes('salon')) return 'living-room'
  if (value.includes('stair') || value.includes('escalera')) return 'stairs'
  if (value.includes('entrance') || value.includes('entrada')) return 'entrance'
  if (value.includes('outdoor') || value.includes('exterior')) return 'outdoor'
  return 'other'
}
