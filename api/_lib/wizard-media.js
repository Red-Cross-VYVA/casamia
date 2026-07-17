import crypto from 'node:crypto'

export const WIZARD_MEDIA_BUCKETS = Object.freeze({
  image: 'wizard-images',
  video: 'wizard-videos',
})
export const WIZARD_MEDIA_LIMITS = Object.freeze({
  maxFiles: 8,
  maxVideos: 3,
  maxImageBytes: 8 * 1024 * 1024,
  maxVideoBytes: 50 * 1024 * 1024,
  maxTotalBytes: 100 * 1024 * 1024,
})

export const WIZARD_MEDIA_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

export const WIZARD_MEDIA_MIME_TYPES_BY_KIND = Object.freeze({
  image: Object.freeze(['image/jpeg', 'image/png', 'image/webp']),
  video: Object.freeze(['video/mp4', 'video/webm', 'video/quicktime']),
})

const mimeConfiguration = Object.freeze({
  'image/jpeg': { extension: 'jpg', kind: 'image' },
  'image/png': { extension: 'png', kind: 'image' },
  'image/webp': { extension: 'webp', kind: 'image' },
  'video/mp4': { extension: 'mp4', kind: 'video' },
  'video/webm': { extension: 'webm', kind: 'video' },
  'video/quicktime': { extension: 'mov', kind: 'video' },
})

const roomValues = new Set([
  'bathroom',
  'bedroom',
  'kitchen',
  'living-room',
  'stairs',
  'entrance',
  'outdoor',
  'other',
])

export class WizardMediaValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'WizardMediaValidationError'
  }
}

export function validateWizardMediaManifest(value) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw new WizardMediaValidationError('Media manifest must be an array.')
  if (value.length > WIZARD_MEDIA_LIMITS.maxFiles) {
    throw new WizardMediaValidationError(`A maximum of ${WIZARD_MEDIA_LIMITS.maxFiles} media files is allowed.`)
  }

  let videoCount = 0
  let totalBytes = 0
  const seenIds = new Set()

  const manifest = value.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new WizardMediaValidationError('Each media item must be an object.')
    }

    const id = typeof item.id === 'string' ? item.id.trim() : ''
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(id) || seenIds.has(id)) {
      throw new WizardMediaValidationError('Each media item needs a unique valid id.')
    }
    seenIds.add(id)

    const type = typeof item.type === 'string' ? item.type.toLowerCase().trim() : ''
    const configuration = mimeConfiguration[type]
    if (!configuration) throw new WizardMediaValidationError(`Unsupported media type: ${type || 'unknown'}.`)

    const size = Number(item.size)
    if (!Number.isSafeInteger(size) || size <= 0) {
      throw new WizardMediaValidationError('Each media item must have a valid file size.')
    }

    const maximumBytes = configuration.kind === 'video'
      ? WIZARD_MEDIA_LIMITS.maxVideoBytes
      : WIZARD_MEDIA_LIMITS.maxImageBytes
    if (size > maximumBytes) {
      throw new WizardMediaValidationError(
        configuration.kind === 'video' ? 'Videos must be 50 MB or smaller.' : 'Images must be 8 MB or smaller.',
      )
    }

    if (configuration.kind === 'video') videoCount += 1
    totalBytes += size

    const rawName = typeof item.name === 'string' ? item.name : 'media'
    const safeName = Array.from(rawName)
      .filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127)
      .join('')
    const name = safeName.trim().slice(0, 180) || 'media'
    const room = typeof item.room === 'string' && roomValues.has(item.room) ? item.room : 'other'

    return {
      id,
      kind: configuration.kind,
      name,
      room,
      size,
      type,
      extension: configuration.extension,
    }
  })

  if (videoCount > WIZARD_MEDIA_LIMITS.maxVideos) {
    throw new WizardMediaValidationError(`A maximum of ${WIZARD_MEDIA_LIMITS.maxVideos} videos is allowed.`)
  }
  if (totalBytes > WIZARD_MEDIA_LIMITS.maxTotalBytes) {
    throw new WizardMediaValidationError('The combined media size must be 100 MB or smaller.')
  }

  return manifest
}

export function getWizardMediaConfiguration(type) {
  return mimeConfiguration[type]
}

export function hashWizardMediaToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex')
}

export function createWizardMediaUploadPlan(manifest, assessmentId, buckets = WIZARD_MEDIA_BUCKETS) {
  return manifest.map(({ extension, ...item }) => ({
    ...item,
    bucket: buckets[item.kind],
    objectPath: `${assessmentId}/${crypto.randomUUID()}.${extension}`,
  }))
}
