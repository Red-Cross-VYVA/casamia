import assert from 'node:assert/strict'

import { inspectFacebookPublishingAccess } from '../api/_lib/facebook.js'

const env = {
  META_GRAPH_API_VERSION: 'v26.0',
  META_PAGE_ACCESS_TOKEN: 'test-token',
  META_PAGE_ID: '61574255177723',
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

console.log('Facebook publishing tests passed.')
