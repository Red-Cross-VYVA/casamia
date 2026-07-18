import { getPublicSiteApiBaseUrl } from './publicSiteApi.ts'
import type { WizardPhoto } from '../types/wizard.ts'

type PhotoRoom = WizardPhoto['room']

export type RoomPhotoClassification = {
  room: PhotoRoom
  confidence?: number
  source: 'image' | 'filename' | 'unavailable'
}

const validRooms = new Set<PhotoRoom>([
  'bathroom',
  'bedroom',
  'kitchen',
  'living-room',
  'stairs',
  'entrance',
  'outdoor',
  'other',
])

const filenameRoomPatterns: Array<[PhotoRoom, RegExp]> = [
  ['bathroom', /\b(bath(room)?|bano|wc|toilet|shower|ducha|aseo)\b/],
  ['bedroom', /\b(bed(room)?|dormitorio|habitacion|sleeping)\b/],
  ['kitchen', /\b(kitchen|cocina)\b/],
  ['living-room', /\b(living([ -]?room)?|lounge|salon|sitting([ -]?room)?)\b/],
  ['stairs', /\b(stair(case)?|stairs|steps|escalera(s)?|escalones)\b/],
  ['entrance', /\b(entrance|entry|doorway|foyer|entrada|recibidor|hall)\b/],
  ['outdoor', /\b(outdoor|exterior|garden|patio|terrace|balcony|jardin|terraza|balcon)\b/],
]

export function inferRoomFromFileName(fileName: string): PhotoRoom {
  const normalizedName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()

  return filenameRoomPatterns.find(([, pattern]) => pattern.test(normalizedName))?.[0] ?? 'other'
}

export async function classifyRoomPhoto(file: File): Promise<RoomPhotoClassification> {
  const filenameRoom = inferRoomFromFileName(file.name)

  try {
    const image = await prepareImageForVision(file)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 20_000)

    try {
      const response = await fetch(`${getPublicSiteApiBaseUrl()}/api/public/classify-room-photo`, {
        body: JSON.stringify(image),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        signal: controller.signal,
      })

      if (!response.ok) throw new Error(`Room classification failed with ${response.status}.`)

      const result = await response.json() as { room?: string; confidence?: number }
      if (!result.room || !validRooms.has(result.room as PhotoRoom)) {
        throw new Error('Room classification returned an invalid room.')
      }

      const room = result.room as PhotoRoom
      const confidence = normalizeConfidence(result.confidence)

      if (room !== 'other' && (confidence === undefined || confidence >= 0.45)) {
        return { room, confidence, source: 'image' }
      }
    } finally {
      window.clearTimeout(timeoutId)
    }
  } catch {
    // A filename match remains a useful fallback when vision is unavailable.
  }

  if (filenameRoom !== 'other') return { room: filenameRoom, source: 'filename' }
  return { room: 'other', source: 'unavailable' }
}

export async function prepareImageForVision(file: File) {
  const image = await loadImage(file)
  const maximumDimension = 1_280
  const scale = Math.min(1, maximumDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Image preparation is unavailable.')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Image preparation failed.')), 'image/jpeg', 0.78)
  })

  return {
    data: await blobToBase64(blob),
    mediaType: 'image/jpeg',
  }
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('The image could not be read.'))
    }
    image.src = url
  })
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : ''
      const separator = value.indexOf(',')
      if (separator < 0) reject(new Error('The image could not be encoded.'))
      else resolve(value.slice(separator + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('The image could not be encoded.'))
    reader.readAsDataURL(blob)
  })
}

function normalizeConfidence(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.max(0, Math.min(1, value))
}
