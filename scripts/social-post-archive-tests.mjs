import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { publishAndArchiveSocialPost, getSocialPostArchive, syncSocialPostArchive } from '../api/_lib/social-post-archive.js'
import { listPublishedSocialPosts } from '../api/_lib/facebook.js'
import handler from '../api/internal/facebook-posts.js'
import templates from '../shared/social-post-templates.json' with { type: 'json' }

Object.assign(process.env, {
  CASAMIA_INTERNAL_API_KEY: 'archive-test-key', SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role', META_PAGE_ACCESS_TOKEN: 'test-meta-token',
  META_GRAPH_API_VERSION: 'v26.0', META_PAGE_ID: '605133552680332', CASAMIA_PUBLIC_SITE_URL: 'https://www.casamia.com.es',
})
const template = templates[0]
const rows = new Map()
let publishes = 0
let graphFails = false
let storageFails = false
let archiveSaveFails = false
let remotePosts = []
const originalFetch = globalThis.fetch
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {'content-type':'application/json'}})
globalThis.fetch = async (input, init = {}) => {
  const url = new URL(input)
  if (url.hostname === 'example.supabase.co') {
    if (storageFails) return json({message:'Unavailable'}, 503)
    assert.equal(init.headers.Authorization, 'Bearer test-service-role')
    const data = init.body ? JSON.parse(init.body) : null
    const matching = [...rows.values()].filter((row) => [...url.searchParams].every(([key, val]) => !val.startsWith('eq.') || row[key] === val.slice(3)))
    if (init.method === 'POST') {
      if (rows.has(data.id)) return json([])
      rows.set(data.id, structuredClone(data)); return json([data])
    }
    if (init.method === 'PATCH') {
      if (archiveSaveFails && data.status === 'published') return json({message:'Save failed'}, 503)
      const updated = matching.map(row => ({...row,...data}))
      updated.forEach(row => rows.set(row.id, row)); return json(updated)
    }
    const sorted = matching.sort((a,b) => String(b.published_at).localeCompare(String(a.published_at)) || a.id.localeCompare(b.id))
    const offset = Number(url.searchParams.get('offset') || 0)
    return json(sorted.slice(offset, offset + Number(url.searchParams.get('limit') || 1000)))
  }
  if (url.hostname === 'graph.facebook.com') {
    if (url.pathname.endsWith('/published_posts')) return json({data:remotePosts})
    if (url.pathname.endsWith('/photos')) {
      publishes++
      if (graphFails) return json({error:{message:'Caption rejected'}},400)
      return json({id:`photo-${publishes}`,post_id:`605133552680332_${publishes}`})
    }
    // No Instagram is linked in this fixture; Facebook imports must still succeed.
    return json({})
  }
  throw new Error(`Unexpected request ${url.origin}${url.pathname}`)
}
const publish = () => publishAndArchiveSocialPost({imagePath:template.imagePath,message:'Edited caption saved exactly',platform:'facebook',request:{headers:{host:'www.casamia.com.es'}}})

try {
  const response = makeResponse()
  await handler({method:'GET',url:'/api/internal/facebook-posts?view=archive',headers:{}},response)
  assert.equal(response.statusCode,401,'Archive must require administrator authentication')

  storageFails = true
  await assert.rejects(publish(), /archive is unavailable/)
  assert.equal(publishes,0,'Do not publish when archive storage is unavailable')
  storageFails = false

  const first = await publish()
  assert.equal(first.archived,true)
  assert.equal(first.publication.caption,'Edited caption saved exactly')
  assert.equal(first.publication.sourcePostId,template.id)
  assert.equal((await getSocialPostArchive()).length,1,'Archive survives a separate read')
  const again = await publish()
  assert.equal(again.alreadyPublished,true)
  assert.equal(publishes,1,'Retrying an archived post must not duplicate the live post')

  const apiResponse = makeResponse()
  await handler({method:'GET',url:'/api/internal/facebook-posts?view=archive',headers:{'x-api-key':'archive-test-key'}},apiResponse)
  assert.equal(apiResponse.statusCode,200)
  assert.equal(JSON.parse(apiResponse.body).posts[0].postId,first.publication.postId)

  rows.clear()
  graphFails = true
  await assert.rejects(publish(),/Caption rejected/)
  assert.equal((await getSocialPostArchive()).length,0,'Failed publishing must not archive a post')
  graphFails = false
  await publish()
  assert.equal((await getSocialPostArchive()).length,1,'A definite rejection can be retried')

  rows.clear()
  archiveSaveFails = true
  const unrecorded = await publish()
  assert.equal(unrecorded.ok,true,'Never report a publish failure when only archive saving failed')
  assert.equal(unrecorded.archived,false)
  assert.match(unrecorded.archiveWarning,/Do not republish/)
  const countBeforeRetry = publishes
  await assert.rejects(publish(), /already being published/)
  assert.equal(publishes,countBeforeRetry,'An uncertain save must not cause another publication')
  archiveSaveFails = false
  // Reconcile interrupted persistence from the actual remote post, using a stable campaign URL.
  const pending = [...rows.values()][0]
  const caption = `Edited caption saved exactly https://www.casamia.com.es/?utm_campaign=${template.campaign}&utm_content=${template.content}`
  rows.set(pending.id,{...pending,caption})
  remotePosts = [{id:unrecorded.publication.postId,message:caption,created_time:'2026-10-18T08:00:00Z',permalink_url:unrecorded.publication.url}]
  const synced = await syncSocialPostArchive()
  assert.equal(synced.posts.length,1)
  assert.equal(synced.posts[0].id,pending.id,'Sync recovers the reserved publication')
  assert.equal(synced.posts[0].caption,caption)
  assert.equal(synced.warnings.length,1,'An unlinked Instagram account does not block Facebook history')
  await syncSocialPostArchive()
  assert.equal((await getSocialPostArchive()).length,1,'Sync is idempotent')

  rows.clear()
  const imported = await syncSocialPostArchive()
  assert.equal(imported.posts[0].sourcePostId,template.id,'Historical campaign links match the publishing queue')
  await publish()
  assert.equal(publishes,countBeforeRetry,'Imported history prevents publishing a template again')

  rows.clear()
  for (let i=0;i<1005;i++) rows.set(`history-${i}`,{id:`history-${i}`,account_id:'605133552680332',platform:'facebook',status:'published',published_at:'2026-10-18T00:00:00Z'})
  assert.equal((await getSocialPostArchive()).length,1005,'Archive includes every page of database history')

  let pageReads=0
  const history = await listPublishedSocialPosts({platform:'facebook',fetchImpl:async () => {
    pageReads++
    return pageReads===1 ? json({data:[{id:'one'}],paging:{next:'unused',cursors:{after:'next-page'}}}) : json({data:[{id:'two'}]})
  }})
  assert.deepEqual(history.map(post=>post.id),['one','two'],'Import follows all Meta pages')

  const source = await readFile(new URL('../src/services/internalFacebookPosts.ts',import.meta.url),'utf8')
  const ts = await import('typescript')
  const catalogCode = ts.transpileModule(source.replace(/^import .*\r?\n/gm,'').split('export async function getFacebookPublishingStatus')[0],{compilerOptions:{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.ESNext}}).outputText
  const catalog = await import(`data:text/javascript;base64,${Buffer.from(catalogCode).toString('base64')}`)
  assert.deepEqual(templates.map(({id,imagePath,language,title})=>({id,imagePath,language,title})),catalog.facebookStarterPosts.map(({id,imagePath,language,title})=>({id,imagePath,language,title})),'Server template matching stays aligned with the admin catalogue')
  console.log('Social post archive tests passed.')
} finally { globalThis.fetch=originalFetch }

function makeResponse() { return {body:'',statusCode:200,end(body=''){this.body=body},setHeader(){return this},status(code){this.statusCode=code;return this}} }
