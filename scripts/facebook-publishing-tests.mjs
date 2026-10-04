import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
  deleteFacebookPosts,
  inspectFacebookPublishingAccess,
  inspectInstagramPublishingAccess,
  publishInstagramPost,
} from '../api/_lib/facebook.js'

const env = {
  META_GRAPH_API_VERSION: 'v26.0',
  META_PAGE_ACCESS_TOKEN: 'test-token',
  META_PAGE_ID: '605133552680332',
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  })
}

const ready = await inspectFacebookPublishingAccess({
  env,
  fetchImpl: async (url) => {
    const path = new URL(url).pathname
    if (path.endsWith('/me')) return jsonResponse({ id: env.META_PAGE_ID, name: 'CasaMia' })
    if (path.endsWith('/me/permissions')) {
      return jsonResponse({
        data: [
          { permission: 'pages_read_engagement', status: 'granted' },
          { permission: 'pages_manage_posts', status: 'granted' },
        ],
      })
    }
    return jsonResponse({ id: env.META_PAGE_ID, name: 'CasaMia' })
  },
})

assert.equal(ready.ready, true)
assert.equal(ready.pageAccessible, true)
assert.equal(ready.pageMatchesIdentity, true)
assert.equal(ready.permissionsChecked, true)
assert.deepEqual(ready.missingPermissions, [])
assert.equal(ready.identityName, 'CasaMia')

const missingPermission = await inspectFacebookPublishingAccess({
  env,
  fetchImpl: async (url) => {
    const path = new URL(url).pathname
    if (path.endsWith('/me/permissions')) {
      return jsonResponse({ data: [{ permission: 'pages_read_engagement', status: 'granted' }] })
    }
    return jsonResponse({ id: env.META_PAGE_ID, name: 'CasaMia' })
  },
})

assert.equal(missingPermission.ready, false)
assert.deepEqual(missingPermission.missingPermissions, ['pages_manage_posts'])

const pageToken = await inspectFacebookPublishingAccess({
  env,
  fetchImpl: async (url) => {
    const path = new URL(url).pathname
    if (path.endsWith('/me')) return jsonResponse({ id: env.META_PAGE_ID, name: 'CasaMia' })
    if (path.endsWith('/me/permissions')) {
      return jsonResponse({ error: { message: 'Tried accessing nonexisting field (permissions)' } }, 400)
    }
    return jsonResponse({ error: { message: 'Unsupported get request.' } }, 400)
  },
})

assert.equal(pageToken.identityId, env.META_PAGE_ID)
assert.equal(pageToken.pageMatchesIdentity, true)
assert.equal(pageToken.pageAccessible, true)
assert.equal(pageToken.permissionsChecked, false)
assert.deepEqual(pageToken.missingPermissions, [])

const instagramReady = await inspectInstagramPublishingAccess({
  env,
  fetchImpl: async (url) => {
    const parsedUrl = new URL(url)
    const path = parsedUrl.pathname
    if (path.endsWith('/me/permissions')) {
      return jsonResponse({
        data: [
          { permission: 'instagram_basic', status: 'granted' },
          { permission: 'instagram_content_publish', status: 'granted' },
          { permission: 'pages_read_engagement', status: 'granted' },
        ],
      })
    }
    if (path.endsWith(`/${env.META_PAGE_ID}`)) {
      return jsonResponse({
        instagram_business_account: { id: '17841400000000000', username: 'casamia' },
      })
    }
    if (path.endsWith('/17841400000000000')) {
      return jsonResponse({ account_type: 'BUSINESS', id: '17841400000000000', username: 'casamia' })
    }
    return jsonResponse({})
  },
})

assert.equal(instagramReady.ready, true)
assert.equal(instagramReady.accountAccessible, true)
assert.equal(instagramReady.accountId, '17841400000000000')
assert.equal(instagramReady.username, 'casamia')
assert.deepEqual(instagramReady.missingPermissions, [])

const instagramPublished = await publishInstagramPost({
  env: { ...env, CASAMIA_PUBLIC_SITE_URL: 'https://www.casamia.com.es' },
  fetchImpl: async (url, init) => {
    const parsedUrl = new URL(url)
    const path = parsedUrl.pathname
    if (path.endsWith(`/${env.META_PAGE_ID}`)) {
      return jsonResponse({
        instagram_business_account: { id: '17841400000000000', username: 'casamia' },
      })
    }
    if (path.endsWith('/17841400000000000/media')) {
      assert.equal(init.method, 'POST')
      assert.match(String(init.body), /image_url=https%3A%2F%2Fwww\.casamia\.com\.es%2Fbrand-assets%2Fsocial%2Ffacebook-risk-stat-posts%2F01-treinta-por-ciento-es\.jpg/)
      assert.match(String(init.body), /caption=Instagram\+caption/)
      return jsonResponse({ id: 'container-1' })
    }
    if (path.endsWith('/17841400000000000/media_publish')) {
      assert.equal(init.method, 'POST')
      assert.match(String(init.body), /creation_id=container-1/)
      return jsonResponse({ id: 'ig-media-1' })
    }
    if (path.endsWith('/ig-media-1')) {
      return jsonResponse({ permalink: 'https://www.instagram.com/p/example/' })
    }
    return jsonResponse({})
  },
  imagePath: '/brand-assets/social/facebook-risk-stat-posts/01-treinta-por-ciento-es.jpg',
  message: 'Instagram caption',
  request: { headers: { host: 'www.casamia.com.es', 'x-forwarded-proto': 'https' } },
})

assert.equal(instagramPublished.kind, 'instagram_photo')
assert.equal(instagramPublished.instagramId, 'ig-media-1')
assert.equal(instagramPublished.instagramUrl, 'https://www.instagram.com/p/example/')

const deleted = await deleteFacebookPosts({
  env,
  fetchImpl: async (url, init) => {
    assert.equal(init.method, 'DELETE')
    assert.match(String(url), /\/605133552680332_123$/)
    assert.equal(init.headers.Authorization, 'Bearer test-token')
    return jsonResponse({ success: true })
  },
  postIds: ['605133552680332_123'],
})

assert.equal(deleted.ok, true)
assert.equal(deleted.deleted, 1)
assert.equal(deleted.failed, 0)

await assert.rejects(
  deleteFacebookPosts({ env, postIds: ['999_123'] }),
  /configured CasaMia Facebook Page/,
)

const facebookPostsPageSource = await readFile(
  new URL('../src/pages/internal/InternalFacebookPostsPage.tsx', import.meta.url),
  'utf8',
)
const facebookStarterPostsSource = await readFile(
  new URL('../src/services/internalFacebookPosts.ts', import.meta.url),
  'utf8',
)
const facebookApiSource = await readFile(
  new URL('../api/_lib/facebook.js', import.meta.url),
  'utf8',
)

assert.doesNotMatch(facebookPostsPageSource, /window\.confirm/)
assert.match(facebookPostsPageSource, /Confirm publish/)
assert.match(facebookPostsPageSource, /setConfirmingPostId/)
assert.match(facebookStarterPostsSource, /home-safety-wizard\?utm_source=facebook&utm_medium=organic_social&utm_campaign=home_safety_review/)
assert.match(facebookStarterPostsSource, /services\/bathroom-safety\?utm_source=facebook&utm_medium=organic_social&utm_campaign=bathroom_safety/)
assert.match(facebookStarterPostsSource, /grants\?utm_source=facebook&utm_medium=organic_social&utm_campaign=grant_guidance/)
assert.match(facebookStarterPostsSource, /plans\?utm_source=facebook&utm_medium=organic_social&utm_campaign=starter_packs/)
assert.match(facebookStarterPostsSource, /facebook-risk-stat-posts/)
assert.match(facebookStarterPostsSource, /risk_stats_spain/)
assert.match(facebookStarterPostsSource, /Ministerio de Sanidad/)
assert.match(facebookApiSource, /facebook-risk-stat-posts/)
assert.match(facebookPostsPageSource, /Risk-stat posts below are not included/)
assert.match(facebookStarterPostsSource, /language: 'English'/)
assert.match(facebookStarterPostsSource, /language: 'Spanish'/)
assert.match(facebookStarterPostsSource, /utm_content=en/)
assert.match(facebookStarterPostsSource, /utm_content=es/)
assert.match(facebookPostsPageSource, /approved CasaMia organic Facebook posts/)

console.log('Facebook publishing tests passed.')
