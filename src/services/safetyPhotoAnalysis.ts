import { getPublicSiteApiBaseUrl } from './publicSiteApi.ts'
import { prepareImageForVision } from './roomPhotoClassification.ts'
import type { SafetyPhotoAnalysisResult } from '../types/safetyAnalysis.ts'

export type {
  SafetyFindingCategory as PhotoFindingCategory,
  SafetyPhotoAnalysisResult,
  SafetyPhotoFinding,
} from '../types/safetyAnalysis.ts'

export type SafetyPhotoContext = {
  homeType: string
  mainConcern: string
  urgency: string
  mobilityProfile: string
  description: string
}

export type SafetyPhotoAnalysisErrorCode =
  | 'IMAGE_INVALID'
  | 'VISION_NOT_CONFIGURED'
  | 'VISION_PROVIDER_ERROR'
  | 'VISION_RATE_LIMITED'
  | 'VISION_TIMEOUT'
  | 'VISION_UNAVAILABLE'

export class SafetyPhotoAnalysisError extends Error {
  code: SafetyPhotoAnalysisErrorCode
  status?: number

  constructor(message: string, code: SafetyPhotoAnalysisErrorCode, status?: number) {
    super(message)
    this.name = 'SafetyPhotoAnalysisError'
    this.code = code
    this.status = status
  }
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

    if (!response.ok) {
      const body = await readAnalysisError(response)
      throw new SafetyPhotoAnalysisError(
        body.message ?? `Safety photo analysis failed with ${response.status}.`,
        normaliseErrorCode(body.code),
        response.status,
      )
    }

    return await response.json() as SafetyPhotoAnalysisResult
  } catch (error) {
    if (error instanceof SafetyPhotoAnalysisError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new SafetyPhotoAnalysisError('Safety photo analysis timed out.', 'VISION_TIMEOUT')
    }

    throw new SafetyPhotoAnalysisError(
      error instanceof Error ? error.message : 'Safety photo analysis is unavailable.',
      'VISION_UNAVAILABLE',
    )
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function readAnalysisError(response: Response) {
  try {
    return await response.json() as { code?: string; message?: string }
  } catch {
    return {} as { code?: string; message?: string }
  }
}

function normaliseErrorCode(value?: string): SafetyPhotoAnalysisErrorCode {
  if (
    value === 'IMAGE_INVALID'
    || value === 'VISION_NOT_CONFIGURED'
    || value === 'VISION_PROVIDER_ERROR'
    || value === 'VISION_RATE_LIMITED'
    || value === 'VISION_TIMEOUT'
  ) return value

  return 'VISION_UNAVAILABLE'
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
