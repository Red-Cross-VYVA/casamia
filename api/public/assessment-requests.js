import crypto from 'node:crypto'

import {
  callSupabaseRpc,
  createSignedStorageUploadUrl,
  ensurePrivateStorageBucket,
  insertSupabaseRow,
  readJsonBody,
  removeStorageObjects,
  requirePost,
  selectSupabaseRows,
  sendJson,
  updateSupabaseRows,
} from '../_lib/supabase.js'
import {
  createWizardMediaUploadPlan,
  hashWizardMediaToken,
  validateWizardMediaManifest,
  WIZARD_MEDIA_BUCKETS,
  WIZARD_MEDIA_LIMITS,
  WIZARD_MEDIA_MIME_TYPES_BY_KIND,
  WizardMediaValidationError,
} from '../_lib/wizard-media.js'

const mediaReservationWindowMs = 30 * 60 * 1000
const mediaClaimLeaseMs = 5 * 60 * 1000
const maxMediaReservationsPerWindow = 3

function mapAssessmentRequest(body, id, mediaManifest, mediaUpload, mediaIpHash) {
  const submittedAt = mediaManifest.length ? new Date().toISOString() : (body.submittedAt ?? new Date().toISOString())
  const source = mediaManifest.length ? 'home-safety-wizard' : (body.source ?? 'home-safety-assessment')

  return {
    id,
    submitted_at: submittedAt,
    type: body.type ?? 'home_safety_assessment_visit',
    status: mediaManifest.length ? 'Media pending' : (body.status ?? 'New'),
    customer_name: body.customer_name ?? body.name ?? '',
    customer_email: body.customer_email ?? body.email ?? '',
    customer_phone: body.customer_phone ?? body.phone ?? '',
    city_area: body.city_area ?? body.city ?? '',
    preferred_contact_method: body.preferred_contact_method ?? body.preferredContactMethod ?? '',
    preferred_assessment_date: body.preferred_assessment_date ?? body.preferredDate ?? '',
    selected_plan: body.selected_plan ?? body.selectedPlan ?? '',
    consent_at: body.consent_at ?? body.consentAt ?? '',
    source,
    message: body.message ?? '',
    payload_json: {
      ...body,
      source,
      submittedAt,
      mediaIpHash,
      mediaManifest,
      mediaUpload,
    },
  }
}

function getClientIp(request) {
  const forwarded = request.headers?.['x-forwarded-for']
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded
  return String(value || request.headers?.['x-real-ip'] || request.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim()
}

function hashClientIp(request) {
  const secret = process.env.MEDIA_RATE_LIMIT_SALT
    || process.env.CASAMIA_INTERNAL_API_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || 'casamia-media'
  return crypto.createHmac('sha256', secret).update(getClientIp(request)).digest('hex')
}

async function enforceMediaRateLimit(mediaIpHash) {
  const result = await callSupabaseRpc('reserve_wizard_media_upload', {
    p_ip_hash: mediaIpHash,
    p_limit: maxMediaReservationsPerWindow,
    p_window_seconds: Math.round(mediaReservationWindowMs / 1000),
  })

  if (!result.ok) return result

  if (result.body !== true) {
    return {
      ok: false,
      status: 429,
      body: { message: 'Too many media submissions. Please wait 30 minutes and try again.' },
    }
  }

  return { ok: true }
}

function validateMediaContact(body) {
  const name = String(body.customer_name ?? body.name ?? '').trim()
  const email = String(body.customer_email ?? body.email ?? '').trim()
  const phone = String(body.customer_phone ?? body.phone ?? '').trim()
  const consentAt = String(body.consent_at ?? body.consentAt ?? '').trim()

  if (!name || (!email && !phone) || !consentAt || body.consentConfirmed !== true) {
    throw new WizardMediaValidationError('Contact details and consent are required before uploading media.')
  }
}

async function cleanupExpiredMediaReservations() {
  const now = new Date().toISOString()
  const pendingQuery = [
    'status=eq.Media%20pending',
    `payload_json->mediaUpload->>expiresAt=lt.${encodeURIComponent(now)}`,
    'select=id,status,payload_json',
    'limit=10',
  ].join('&')
  const staleClaimQueries = ['Media verifying', 'Media failing', 'Media expiring'].map((status) => [
    `status=eq.${encodeURIComponent(status)}`,
    `payload_json->mediaUpload->>expiresAt=lt.${encodeURIComponent(now)}`,
    `payload_json->mediaUpload->>claimExpiresAt=lt.${encodeURIComponent(now)}`,
    'select=id,status,payload_json',
    'limit=10',
  ].join('&'))
  let results

  try {
    results = await Promise.all([
      selectSupabaseRows('assessment_requests', pendingQuery),
      ...staleClaimQueries.map((query) => selectSupabaseRows('assessment_requests', query)),
    ])
  } catch {
    return
  }

  const records = new Map()
  results.forEach((result) => {
    if (!result.ok || !Array.isArray(result.body)) return
    result.body.forEach((record) => records.set(record.id, record))
  })

  for (const record of records.values()) {
    const mediaUpload = record.payload_json?.mediaUpload
    const mediaStatus = String(mediaUpload?.status ?? '')
    const isPending = record.status === 'Media pending' && mediaStatus === 'pending'
    const claimExpiresAt = Date.parse(String(mediaUpload?.claimExpiresAt ?? ''))
    const isStaleClaim = ['verifying', 'failing', 'expiring'].includes(mediaStatus)
      && Number.isFinite(claimExpiresAt)
      && claimExpiresAt <= Date.now()
    if (!mediaUpload || (!isPending && !isStaleClaim)) continue

    const claimedAt = new Date().toISOString()
    const nextClaimExpiresAt = new Date(Date.now() + mediaClaimLeaseMs).toISOString()
    const claimQuery = [
      `id=eq.${encodeURIComponent(record.id)}`,
      `status=eq.${encodeURIComponent(record.status)}`,
      `payload_json->mediaUpload->>status=eq.${encodeURIComponent(mediaStatus)}`,
      `payload_json->mediaUpload->>expiresAt=lt.${encodeURIComponent(now)}`,
      ...(isPending
        ? []
        : [
            `payload_json->mediaUpload->>claimedAt=eq.${encodeURIComponent(mediaUpload.claimedAt)}`,
            `payload_json->mediaUpload->>claimExpiresAt=eq.${encodeURIComponent(mediaUpload.claimExpiresAt)}`,
          ]),
    ].join('&')
    let claim

    try {
      claim = await updateSupabaseRows('assessment_requests', {
        status: 'Media expiring',
        payload_json: {
          ...record.payload_json,
          mediaUpload: {
            ...mediaUpload,
            claimedAt,
            claimExpiresAt: nextClaimExpiresAt,
            status: 'expiring',
          },
        },
      }, claimQuery)
    } catch {
      continue
    }

    const claimedRecord = claim.ok && Array.isArray(claim.body) ? claim.body[0] : undefined
    if (!claimedRecord) continue

    const claimedMediaUpload = claimedRecord.payload_json.mediaUpload
    const manifest = Array.isArray(claimedRecord.payload_json?.mediaManifest)
      ? claimedRecord.payload_json.mediaManifest
      : []
    const byBucket = new Map()

    manifest.forEach((item) => {
      if (!item?.bucket || !item?.objectPath) return
      const paths = byBucket.get(item.bucket) ?? []
      paths.push(item.objectPath)
      byBucket.set(item.bucket, paths)
    })

    let cleanupSucceeded = true
    try {
      for (const [bucket, paths] of byBucket.entries()) {
        const removal = await removeStorageObjects(bucket, paths)
        cleanupSucceeded = cleanupSucceeded && removal.ok
      }
    } catch {
      cleanupSucceeded = false
    }

    const claimedQuery = [
      `id=eq.${encodeURIComponent(claimedRecord.id)}`,
      'status=eq.Media%20expiring',
      'payload_json->mediaUpload->>status=eq.expiring',
      `payload_json->mediaUpload->>claimedAt=eq.${encodeURIComponent(claimedAt)}`,
      `payload_json->mediaUpload->>claimExpiresAt=eq.${encodeURIComponent(nextClaimExpiresAt)}`,
    ].join('&')

    if (!cleanupSucceeded) {
      try {
        await updateSupabaseRows('assessment_requests', {
          status: 'Media pending',
          payload_json: {
            ...claimedRecord.payload_json,
            mediaUpload: {
              ...claimedMediaUpload,
              claimedAt: undefined,
              claimExpiresAt: undefined,
              status: 'pending',
            },
          },
        }, claimedQuery)
      } catch {
        // The finite lease makes the cleanup reservation recoverable on a later request.
      }
      continue
    }

    try {
      await updateSupabaseRows('assessment_requests', {
        status: 'Media expired',
        payload_json: {
          ...claimedRecord.payload_json,
          mediaUpload: {
            ...claimedMediaUpload,
            claimedAt: undefined,
            claimExpiresAt: undefined,
            expiredAt: new Date().toISOString(),
            status: 'expired',
          },
        },
      }, claimedQuery)
    } catch {
      // The finite lease allows the next cleanup pass to retry this record safely.
    }
  }
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  try {
    const body = await readJsonBody(request)
    const manifest = validateWizardMediaManifest(body.mediaManifest)
    const assessmentId = crypto.randomUUID()
    const buckets = {
      audio: process.env.WIZARD_AUDIO_BUCKET || WIZARD_MEDIA_BUCKETS.audio,
      image: process.env.WIZARD_IMAGE_BUCKET || WIZARD_MEDIA_BUCKETS.image,
      video: process.env.WIZARD_VIDEO_BUCKET || WIZARD_MEDIA_BUCKETS.video,
    }
    const mediaIpHash = manifest.length ? hashClientIp(request) : undefined

    if (manifest.length) {
      validateMediaContact(body)
      await cleanupExpiredMediaReservations()
      const rateLimit = await enforceMediaRateLimit(mediaIpHash)
      if (!rateLimit.ok) {
        sendJson(response, rateLimit.status, rateLimit.body)
        return
      }
    }

    const uploadPlan = createWizardMediaUploadPlan(manifest, assessmentId, buckets)
    const kinds = new Set(uploadPlan.map((item) => item.kind))

    for (const kind of kinds) {
      const bucketResult = await ensurePrivateStorageBucket({
        allowedMimeTypes: WIZARD_MEDIA_MIME_TYPES_BY_KIND[kind],
        bucket: buckets[kind],
        fileSizeLimit: kind === 'video'
          ? WIZARD_MEDIA_LIMITS.maxVideoBytes
          : kind === 'audio'
            ? WIZARD_MEDIA_LIMITS.maxAudioBytes
            : WIZARD_MEDIA_LIMITS.maxImageBytes,
      })

      if (!bucketResult.ok) {
        sendJson(response, bucketResult.status, bucketResult.body)
        return
      }
    }

    const signedUploads = []
    for (const item of uploadPlan) {
      const signedResult = await createSignedStorageUploadUrl(item.bucket, item.objectPath)
      if (!signedResult.ok) {
        sendJson(response, signedResult.status, signedResult.body)
        return
      }

      signedUploads.push({
        mediaId: item.id,
        kind: item.kind,
        bucket: item.bucket,
        objectPath: item.objectPath,
        signedUrl: signedResult.body.signedUrl,
      })
    }

    const uploadToken = uploadPlan.length ? crypto.randomBytes(32).toString('base64url') : undefined
    const mediaUpload = uploadPlan.length ? {
      status: 'pending',
      reservedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      tokenHash: hashWizardMediaToken(uploadToken),
    } : undefined
    const payload = mapAssessmentRequest(body, assessmentId, uploadPlan, mediaUpload, mediaIpHash)
    const result = await insertSupabaseRow('assessment_requests', payload)

    if (!result.ok) {
      sendJson(response, result.status, result.body)
      return
    }

    sendJson(response, result.status, {
      id: result.body.id,
      status: result.body.status,
      uploadToken,
      uploads: signedUploads,
    })
  } catch (error) {
    sendJson(response, error instanceof WizardMediaValidationError ? 400 : 500, {
      message: error instanceof Error ? error.message : 'Invalid request.',
    })
  }
}
