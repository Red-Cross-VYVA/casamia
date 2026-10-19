import crypto from 'node:crypto'
import templates from '../../shared/social-post-templates.json' with { type: 'json' }
import {
  FacebookPublishError, getFacebookPublishingConfiguration,
  listPublishedSocialPosts, publishFacebookPost, publishInstagramPost,
} from './facebook.js'
import { createSupabaseRowIfAbsent, selectSupabaseRows, updateSupabaseRows } from './supabase.js'

const table = 'social_post_archive'
const text = (value) => typeof value === 'string' ? value.trim() : ''
const rowQuery = (id) => `id=eq.${encodeURIComponent(id)}`
const accountId = () => getFacebookPublishingConfiguration().pageId

function requireDatabase(result) {
  if (!result.ok) throw new FacebookPublishError(503, 'The post archive is unavailable. Publishing is paused to avoid losing history.')
  return result.body
}

export function archivePost(row) {
  return {
    id: row.id, platform: row.platform, sourcePostId: row.source_post_id,
    title: row.title, language: row.language, imagePath: row.image_path,
    imageUrl: row.image_url, caption: row.caption, publishedAt: row.published_at,
    postId: row.external_post_id, url: row.post_url,
  }
}

export async function getSocialPostArchive() {
  const rows = []
  for (let offset = 0; ; offset += 500) {
    const batch = requireDatabase(await selectSupabaseRows(table,
      `select=*&account_id=eq.${encodeURIComponent(accountId())}&status=eq.published&order=published_at.desc,id.asc&limit=500&offset=${offset}`))
    rows.push(...batch.map(archivePost))
    if (batch.length < 500) return rows
  }
}

function templateForRemotePost(post) {
  // Campaign identifiers survive caption edits and distinguish both languages.
  for (const raw of text(post.message).match(/https?:\/\/[^\s]+/g) ?? []) {
    try {
      const url = new URL(raw)
      if (!['www.casamia.com.es', 'casamia.com.es'].includes(url.hostname)) continue
      const match = templates.find((template) => template.campaign === url.searchParams.get('utm_campaign')
        && template.content === url.searchParams.get('utm_content'))
      if (match) return match
    } catch { /* Ignore malformed links in historical captions. */ }
  }
  return null
}

function publicationId(platform, imagePath, caption) {
  return crypto.createHash('sha256').update(`${accountId()}:${platform}:${imagePath || caption}`).digest('hex')
}

function resultForRow(row) {
  return {
    ok: true, provider: row.platform === 'instagram' ? 'instagram_graph_api' : 'facebook_graph_api',
    kind: row.platform === 'instagram' ? 'instagram_photo' : row.image_path ? 'photo' : 'feed',
    facebookId: row.platform === 'facebook' ? row.external_post_id : '',
    facebookPostId: row.platform === 'facebook' ? row.external_post_id : '',
    facebookUrl: row.platform === 'facebook' ? row.post_url : '',
    instagramId: row.platform === 'instagram' ? row.external_post_id : '',
    instagramUrl: row.platform === 'instagram' ? row.post_url : '',
    archived: true, publication: archivePost(row), alreadyPublished: true,
  }
}

export async function publishAndArchiveSocialPost({ imagePath, message, platform, request }) {
  if (!['facebook', 'instagram'].includes(platform)) throw new FacebookPublishError(400, 'Unsupported publishing platform.')
  if (!getFacebookPublishingConfiguration().configured) throw new FacebookPublishError(503, 'Meta publishing is not configured.')
  const caption = text(message)
  if (!caption) throw new FacebookPublishError(400, 'Post caption is required.')
  const cleanImagePath = text(imagePath)
  const template = templates.find((item) => item.imagePath === cleanImagePath)
  if (cleanImagePath && !template) throw new FacebookPublishError(400, 'That image is not in an approved Facebook post asset folder.')
  const id = publicationId(platform, cleanImagePath, caption)
  // Include imported history so already-live templates cannot be republished accidentally.
  if (template) {
    const previous = requireDatabase(await selectSupabaseRows(table,
      `select=*&account_id=eq.${encodeURIComponent(accountId())}&platform=eq.${platform}&source_post_id=eq.${template.id}&status=eq.published&limit=1`))
    if (previous[0]) return resultForRow(previous[0])
  }
  const pending = {
    id, account_id: accountId(), platform, source_post_id: template?.id ?? '',
    title: template?.title ?? caption.split('\n')[0].slice(0, 120), language: template?.language ?? '',
    image_path: cleanImagePath, caption, status: 'publishing',
  }
  const inserted = requireDatabase(await createSupabaseRowIfAbsent(table, pending))
  if (!inserted.length) {
    const existing = requireDatabase(await selectSupabaseRows(table, `select=*&${rowQuery(id)}`))[0]
    if (existing?.status === 'published') return resultForRow(existing)
    if (existing?.status !== 'failed') {
      throw new FacebookPublishError(409, 'This post is already being published. Refresh the archive before trying again.')
    }
    const claimed = requireDatabase(await updateSupabaseRows(table, { status: 'publishing' }, `${rowQuery(id)}&status=eq.failed`))
    if (!claimed.length) throw new FacebookPublishError(409, 'This post is already being published.')
  }
  let result
  try {
    result = await (platform === 'instagram' ? publishInstagramPost : publishFacebookPost)({ imagePath: cleanImagePath, message: caption, request })
  } catch (error) {
    // Only a definite provider rejection is safe to retry. Timeouts may have published.
    if (error instanceof FacebookPublishError && error.statusCode < 500) {
      await updateSupabaseRows(table, { status: 'failed' }, rowQuery(id))
    }
    throw error
  }
  const completed = {
    ...pending, status: 'published', published_at: new Date().toISOString(), result_json: result,
    external_post_id: platform === 'instagram' ? result.instagramId : result.facebookPostId || result.facebookId,
    post_url: platform === 'instagram' ? result.instagramUrl : result.facebookUrl,
  }
  const saved = await updateSupabaseRows(table, completed, rowQuery(id))
  // Never report a publish failure after Meta has created the post: that invites duplicates.
  return { ...result, archived: saved.ok && Boolean(saved.body?.length), publication: archivePost(completed),
    archiveWarning: saved.ok && saved.body?.length ? '' : 'Published successfully, but archive saving is pending. Sync published posts to recover it. Do not republish.' }
}

export async function syncSocialPostArchive() {
  // Check storage before making remote requests.
  requireDatabase(await selectSupabaseRows(table, 'select=id&limit=1'))
  const warnings = []
  let imported = 0
  for (const platform of ['facebook', 'instagram']) {
    let posts
    try { posts = await listPublishedSocialPosts({ platform }) }
    catch (error) { warnings.push(`${platform}: ${error.message}`); continue }
    for (const post of posts) {
      const template = templateForRemotePost(post)
      // Reconcile a publish whose Meta response or archive update was interrupted.
      const key = template ? publicationId(platform, template.imagePath, post.message) : ''
      const pending = key ? requireDatabase(await selectSupabaseRows(table, `select=*&${rowQuery(key)}`))[0] : null
      const samePublication = pending && (pending.external_post_id === post.id
        || pending.status === 'publishing' && pending.caption === text(post.message))
      const row = {
        id: samePublication ? key : `${platform}:${post.id}`,
        account_id: accountId(), platform, source_post_id: template?.id ?? '',
        title: template?.title ?? (text(post.message).split('\n')[0].slice(0, 120) || 'Published post'),
        language: template?.language ?? '', image_path: template?.imagePath ?? '',
        image_url: text(post.full_picture), caption: text(post.message), status: 'published',
        external_post_id: post.id, post_url: text(post.permalink_url), published_at: post.created_time,
      }
      // Do not create a second archive entry for posts already recorded by publishing.
      const existing = requireDatabase(await selectSupabaseRows(table,
        `select=id&account_id=eq.${encodeURIComponent(accountId())}&platform=eq.${platform}&external_post_id=eq.${encodeURIComponent(post.id)}&limit=1`))
      if (existing.length && !samePublication) continue
      if (samePublication) requireDatabase(await updateSupabaseRows(table, row, rowQuery(key)))
      else requireDatabase(await createSupabaseRowIfAbsent(table, row))
      imported += 1
    }
  }
  return { imported, warnings, posts: await getSocialPostArchive() }
}
