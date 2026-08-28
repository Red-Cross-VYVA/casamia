import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import { inspectFacebookPublishingAccess } from '../api/_lib/facebook.js'

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

const facebookPostsPageSource = await readFile(
  new URL('../src/pages/internal/InternalFacebookPostsPage.tsx', import.meta.url),
  'utf8',
)
const facebookStarterPostsSource = await readFile(
  new URL('../src/services/internalFacebookPosts.ts', import.meta.url),
  'utf8',
)

assert.doesNotMatch(facebookPostsPageSource, /window\.confirm/)
assert.match(facebookPostsPageSource, /Confirm publish/)
assert.match(facebookPostsPageSource, /setConfirmingPostId/)
assert.match(facebookStarterPostsSource, /home-safety-wizard\?utm_source=facebook&utm_medium=organic_social&utm_campaign=home_safety_review/)
assert.match(facebookStarterPostsSource, /services\/bathroom-safety\?utm_source=facebook&utm_medium=organic_social&utm_campaign=bathroom_safety/)
assert.match(facebookStarterPostsSource, /grants\?utm_source=facebook&utm_medium=organic_social&utm_campaign=grant_guidance/)
assert.match(facebookStarterPostsSource, /plans\?utm_source=facebook&utm_medium=organic_social&utm_campaign=starter_packs/)
assert.match(facebookStarterPostsSource, /language: 'English'/)
assert.match(facebookStarterPostsSource, /language: 'Spanish'/)
assert.match(facebookStarterPostsSource, /utm_content=en/)
assert.match(facebookStarterPostsSource, /utm_content=es/)
assert.match(facebookPostsPageSource, /both English and Spanish/)

console.log('Facebook publishing tests passed.')
