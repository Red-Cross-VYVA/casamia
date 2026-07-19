import crypto from 'node:crypto'

import {
  getStorageObjectInfo,
  readJsonBody,
  removeStorageObjects,
  requirePost,
  selectSupabaseRows,
  sendJson,
  updateSupabaseRows,
} from '../_lib/supabase.js'
import {
  getWizardMediaConfiguration,
  hashWizardMediaToken,
  WIZARD_MEDIA_LIMITS,
} from '../_lib/wizard-media.js'

const mediaClaimLeaseMs = 5 * 60 * 1000
const mediaFinalizeRetryAfterMs = 750
const mediaClaimStatuses = new Set(['verifying', 'failing', 'expiring'])

class MediaVerificationError extends Error {
  constructor(message, { deleteMedia = false, status = 400 } = {}) {
    super(message)
    this.deleteMedia = deleteMedia
    this.status = status
  }
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left))
  const rightBuffer = Buffer.from(String(right))
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

async function removeManifestObjects(manifest) {
  const byBucket = new Map()

  manifest.forEach((item) => {
    const paths = byBucket.get(item.bucket) ?? []
    paths.push(item.objectPath)
    byBucket.set(item.bucket, paths)
  })

  const results = []
  for (const [bucket, paths] of byBucket.entries()) {
    results.push(await removeStorageObjects(bucket, paths))
  }

  return results.every((result) => result.ok)
}

async function updateClaimedMediaRecord(record, updates) {
  const payloadJson = record.payload_json && typeof record.payload_json === 'object'
    ? record.payload_json
    : {}
  const currentMediaUpload = payloadJson.mediaUpload && typeof payloadJson.mediaUpload === 'object'
    ? payloadJson.mediaUpload
    : {}
  const query = [
    `id=eq.${encodeURIComponent(record.id)}`,
    `status=eq.${encodeURIComponent(record.status)}`,
    `payload_json->mediaUpload->>status=eq.${encodeURIComponent(currentMediaUpload.status)}`,
    `payload_json->mediaUpload->>claimedAt=eq.${encodeURIComponent(currentMediaUpload.claimedAt)}`,
    `payload_json->mediaUpload->>claimExpiresAt=eq.${encodeURIComponent(currentMediaUpload.claimExpiresAt)}`,
  ].join('&')
  const result = await updateSupabaseRows('assessment_requests', updates, query)

  if (!result.ok) return result

  const updatedRecord = Array.isArray(result.body) ? result.body[0] : undefined
  if (!updatedRecord) {
    return {
      ok: false,
      status: 409,
      body: { message: 'This media upload session changed while it was being finalized.' },
    }
  }

  return { ...result, record: updatedRecord }
}

async function updateMediaStatus(record, status, mediaStatus, extra = {}) {
  const payloadJson = record.payload_json && typeof record.payload_json === 'object'
    ? record.payload_json
    : {}
  const currentMediaUpload = payloadJson.mediaUpload && typeof payloadJson.mediaUpload === 'object'
    ? payloadJson.mediaUpload
    : {}

  return updateClaimedMediaRecord(record, {
    status,
    payload_json: {
      ...payloadJson,
      mediaUpload: {
        ...currentMediaUpload,
        ...extra,
        claimedAt: undefined,
        claimExpiresAt: undefined,
        status: mediaStatus,
      },
    },
  })
}

async function claimMediaSession(record, action) {
  const payloadJson = record.payload_json
  const mediaUpload = payloadJson.mediaUpload
  const now = Date.now()
  const expiresAt = Date.parse(String(mediaUpload.expiresAt ?? ''))
  const claimStatus = !Number.isFinite(expiresAt) || expiresAt <= now
    ? 'expiring'
    : action === 'failed' ? 'failing' : 'verifying'
  const currentClaimStatus = String(mediaUpload.status ?? '')
  const currentClaimExpiresAt = Date.parse(String(mediaUpload.claimExpiresAt ?? ''))
  const hasActiveClaim = mediaClaimStatuses.has(currentClaimStatus)
    && Number.isFinite(currentClaimExpiresAt)
    && currentClaimExpiresAt > now
  const actionMatchesCurrentClaim = currentClaimStatus === 'expiring'
    || (currentClaimStatus === 'verifying' && action === 'complete')
    || (currentClaimStatus === 'failing' && action === 'failed')

  if (hasActiveClaim) {
    return actionMatchesCurrentClaim
      ? {
          ok: false,
          status: 202,
          body: {
            message: 'Media finalization is still in progress.',
            retryAfterMs: mediaFinalizeRetryAfterMs,
            status: record.status,
          },
        }
      : {
          ok: false,
          status: 409,
          body: { message: 'This media upload session is being finalized with a different action.' },
        }
  }

  if (currentClaimStatus !== 'pending') {
    if (!mediaClaimStatuses.has(currentClaimStatus)) {
      return {
        ok: false,
        status: 409,
        body: { message: 'This media upload session is already closed.' },
      }
    }
    if (claimStatus !== 'expiring' && !actionMatchesCurrentClaim) {
      return {
        ok: false,
        status: 409,
        body: { message: 'This media upload session cannot be finalized with that action.' },
      }
    }
  }

  const claimedAt = new Date(now).toISOString()
  const claimExpiresAt = new Date(now + mediaClaimLeaseMs).toISOString()
  const query = [
    `id=eq.${encodeURIComponent(record.id)}`,
    `status=eq.${encodeURIComponent(record.status)}`,
    `payload_json->mediaUpload->>status=eq.${encodeURIComponent(currentClaimStatus)}`,
    `payload_json->mediaUpload->>tokenHash=eq.${encodeURIComponent(mediaUpload.tokenHash)}`,
    ...(currentClaimStatus === 'pending'
      ? []
      : [
          ...(mediaUpload.claimedAt
            ? [`payload_json->mediaUpload->>claimedAt=eq.${encodeURIComponent(mediaUpload.claimedAt)}`]
            : []),
          ...(mediaUpload.claimExpiresAt
            ? [`payload_json->mediaUpload->>claimExpiresAt=eq.${encodeURIComponent(mediaUpload.claimExpiresAt)}`]
            : []),
        ]),
  ].join('&')
  const result = await updateSupabaseRows('assessment_requests', {
    status: claimStatus === 'expiring'
      ? 'Media expiring'
      : claimStatus === 'failing' ? 'Media failing' : 'Media verifying',
    payload_json: {
      ...payloadJson,
      mediaUpload: {
        ...mediaUpload,
        claimedAt,
        claimExpiresAt,
        status: claimStatus,
      },
    },
  }, query)

  if (!result.ok) return result

  const claimedRecord = Array.isArray(result.body) ? result.body[0] : undefined
  if (!claimedRecord) {
    return {
      ok: false,
      status: 409,
      body: { message: 'This media upload session is already being finalized.' },
    }
  }

  return { ok: true, claimStatus, record: claimedRecord }
}

async function releaseMediaClaim(record) {
  const payloadJson = record.payload_json
  const mediaUpload = payloadJson.mediaUpload

  return updateClaimedMediaRecord(record, {
    status: 'Media pending',
    payload_json: {
      ...payloadJson,
      mediaUpload: {
        ...mediaUpload,
        claimedAt: undefined,
        claimExpiresAt: undefined,
        status: 'pending',
      },
    },
  })
}

function readActualMetadata(storageObject) {
  const metadata = storageObject?.metadata && typeof storageObject.metadata === 'object'
    ? storageObject.metadata
    : {}
  const type = String(
    metadata.mimetype
      ?? metadata.contentType
      ?? storageObject?.mimetype
      ?? storageObject?.content_type
      ?? '',
  ).toLowerCase().trim()
  const size = Number(
    metadata.size
      ?? metadata.contentLength
      ?? storageObject?.size,
  )

  return { size, type }
}

async function verifyUploadedManifest(manifest) {
  let totalBytes = 0
  const verified = []

  for (const item of manifest) {
    if (!item || typeof item !== 'object' || typeof item.bucket !== 'string' || typeof item.objectPath !== 'string') {
      throw new MediaVerificationError('Stored media manifest is invalid.', { deleteMedia: true })
    }

    const expected = getWizardMediaConfiguration(item.type)
    if (!expected || expected.kind !== item.kind) {
      throw new MediaVerificationError('Stored media type is invalid.', { deleteMedia: true })
    }

    const info = await getStorageObjectInfo(item.bucket, item.objectPath)
    if (!info.ok) {
      throw new MediaVerificationError(
        info.status === 404 ? 'One or more media uploads are missing.' : 'Media verification is temporarily unavailable.',
        { deleteMedia: info.status === 404, status: info.status === 404 ? 400 : 502 },
      )
    }

    const actual = readActualMetadata(info.body)
    const maximumBytes = item.kind === 'video'
      ? WIZARD_MEDIA_LIMITS.maxVideoBytes
      : item.kind === 'audio'
        ? WIZARD_MEDIA_LIMITS.maxAudioBytes
        : WIZARD_MEDIA_LIMITS.maxImageBytes

    if (!Number.isSafeInteger(actual.size) || actual.size <= 0 || actual.size > maximumBytes) {
      throw new MediaVerificationError('An uploaded media file exceeds the allowed size.', { deleteMedia: true })
    }
    if (actual.type !== item.type) {
      throw new MediaVerificationError('An uploaded media file has an unexpected type.', { deleteMedia: true })
    }

    totalBytes += actual.size
    if (totalBytes > WIZARD_MEDIA_LIMITS.maxTotalBytes) {
      throw new MediaVerificationError('The uploaded media exceeds the combined size limit.', { deleteMedia: true })
    }

    verified.push({
      ...item,
      actualSize: actual.size,
      actualType: actual.type,
    })
  }

  return verified
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  let activeClaim

  try {
    const body = await readJsonBody(request)
    const assessmentId = typeof body.assessmentId === 'string' ? body.assessmentId.trim() : ''
    const uploadToken = typeof body.uploadToken === 'string' ? body.uploadToken : ''
    const action = body.action

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(assessmentId)
      || !uploadToken
      || (action !== 'complete' && action !== 'failed')
    ) {
      sendJson(response, 400, { message: 'Invalid media finalization request.' })
      return
    }

    const result = await selectSupabaseRows(
      'assessment_requests',
      `id=eq.${encodeURIComponent(assessmentId)}&select=id,status,payload_json`,
    )
    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    let record = Array.isArray(result.body) ? result.body[0] : undefined
    let mediaUpload = record?.payload_json?.mediaUpload
    let manifest = Array.isArray(record?.payload_json?.mediaManifest)
      ? record.payload_json.mediaManifest
      : []

    if (!record || !mediaUpload?.tokenHash || !safeEqual(mediaUpload.tokenHash, hashWizardMediaToken(uploadToken))) {
      sendJson(response, 401, { message: 'Media upload session is not valid.' })
      return
    }

    if (mediaUpload.status === 'complete' && action === 'complete') {
      sendJson(response, 200, {
        ok: true,
        mediaManifest: manifest.map(({ id, kind, bucket, objectPath }) => ({
          mediaId: id,
          kind,
          bucket,
          objectPath,
        })),
        status: 'New',
      })
      return
    }

    const claim = await claimMediaSession(record, action)
    if (!claim.ok) {
      sendJson(response, claim.status, claim.body)
      return
    }

    record = claim.record
    activeClaim = record
    mediaUpload = record.payload_json.mediaUpload
    manifest = Array.isArray(record.payload_json.mediaManifest)
      ? record.payload_json.mediaManifest
      : []

    if (claim.claimStatus === 'expiring') {
      const removed = await removeManifestObjects(manifest)
      if (!removed) {
        await releaseMediaClaim(record)
        sendJson(response, 500, { message: 'Expired media cleanup could not be completed.' })
        return
      }

      const update = await updateMediaStatus(record, 'Media expired', 'expired', {
        expiredAt: new Date().toISOString(),
      })
      if (!update.ok) {
        await releaseMediaClaim(record)
        sendJson(response, 500, { message: 'Expired media cleanup could not be completed.' })
        return
      }
      activeClaim = undefined
      sendJson(response, 410, { message: 'This media upload session has expired. Please submit again.' })
      return
    }

    if (action === 'failed') {
      const removed = await removeManifestObjects(manifest)
      if (!removed) {
        await releaseMediaClaim(record)
        sendJson(response, 500, { message: 'Media cleanup could not be completed.' })
        return
      }

      const update = await updateMediaStatus(record, 'Media failed', 'failed', {
        failedAt: new Date().toISOString(),
      })
      if (!update.ok) {
        await releaseMediaClaim(record)
        sendJson(response, 500, { message: 'Media cleanup could not be completed.' })
        return
      }
      activeClaim = undefined
      sendJson(response, 200, { ok: true, status: 'Media failed' })
      return
    }

    try {
      const verifiedManifest = await verifyUploadedManifest(manifest)
      const update = await updateClaimedMediaRecord(record, {
        status: 'New',
        payload_json: {
          ...record.payload_json,
          mediaManifest: verifiedManifest,
          mediaUpload: {
            ...mediaUpload,
            claimedAt: undefined,
            claimExpiresAt: undefined,
            completedAt: new Date().toISOString(),
            status: 'complete',
          },
        },
      })

      if (!update.ok) {
        await releaseMediaClaim(record)
        sendJson(response, update.status, update.body)
        return
      }

      activeClaim = undefined
      sendJson(response, 200, {
        ok: true,
        mediaManifest: verifiedManifest.map(({ id, kind, bucket, objectPath }) => ({
          mediaId: id,
          kind,
          bucket,
          objectPath,
        })),
        status: 'New',
      })
    } catch (error) {
      if (!(error instanceof MediaVerificationError) || !error.deleteMedia) {
        const release = await releaseMediaClaim(record)
        if (!release.ok) {
          sendJson(response, 500, { message: 'Media verification could not be safely resumed.' })
          return
        }

        sendJson(response, error instanceof MediaVerificationError ? error.status : 502, {
          message: error instanceof Error ? error.message : 'Media verification is temporarily unavailable.',
        })
        return
      }

      const removed = await removeManifestObjects(manifest)
      if (!removed) {
        await releaseMediaClaim(record)
        sendJson(response, 500, { message: 'Rejected media cleanup could not be completed.' })
        return
      }

      const update = await updateMediaStatus(record, 'Media rejected', 'rejected', {
        rejectedAt: new Date().toISOString(),
      })
      if (!update.ok) {
        await releaseMediaClaim(record)
        sendJson(response, 500, { message: 'Rejected media cleanup could not be completed.' })
        return
      }

      activeClaim = undefined
      sendJson(response, error.status, {
        message: error instanceof Error ? error.message : 'Media verification failed.',
      })
    }
  } catch (error) {
    if (activeClaim) {
      try {
        await releaseMediaClaim(activeClaim)
      } catch {
        // The finite claim lease allows a later request to recover after a hard infrastructure failure.
      }
    }
    sendJson(response, 500, {
      message: error instanceof Error ? error.message : 'Media finalization failed.',
    })
  }
}
