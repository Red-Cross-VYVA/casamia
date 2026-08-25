import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const clientEntry = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8')
assert.match(clientEntry, /preferredLanguage === i18n\.language[\s\S]*hydrateRoot/, 'Matching prerendered languages should hydrate normally.')
assert.match(clientEntry, /changeLanguage\(preferredLanguage\)[\s\S]*replaceChildren\(\)[\s\S]*createRoot/, 'A different browser language must mount cleanly instead of racing hydration.')

const representativeRoutes = [
  ['dist/index.html', '/'],
  ['dist/plans.html', '/plans'],
  ['dist/blog/hospital-discharge-home-safety-checklist.html', '/blog/hospital-discharge-home-safety-checklist'],
  ['dist/service-areas/madrid.html', '/service-areas/madrid'],
]

for (const [file, route] of representativeRoutes) {
  const html = await readFile(new URL(`../${file}`, import.meta.url), 'utf8')
  assert.match(html, /<nav\b/i, `${route} must contain server-rendered navigation`)
  assert.match(html, /<main\b/i, `${route} must contain a server-rendered main landmark`)
  assert.match(html, /<h1\b/i, `${route} must contain a server-rendered h1`)
  assert.match(html, /<footer\b/i, `${route} must contain a server-rendered footer`)
  assert.match(html, /<link rel="canonical"/i, `${route} must contain a canonical URL`)
  assert.match(html, /<meta name="description"/i, `${route} must contain route metadata`)
  assert.ok(html.length > 20_000, `${route} must contain substantive HTML`)
}

const protectedShellRoutes = [
  ['dist/_app-shell/private.html', '/_app-shell/private'],
  ['dist/internal.html', '/internal'],
  ['dist/internal/service-catalog.html', '/internal/service-catalog'],
  ['dist/internal/facebook-posts.html', '/internal/facebook-posts'],
  ['dist/admin/config-preview.html', '/admin/config-preview'],
  ['dist/partner.html', '/partner'],
  ['dist/partner/login.html', '/partner/login'],
]

for (const [file, route] of protectedShellRoutes) {
  const html = await readFile(new URL(`../${file}`, import.meta.url), 'utf8')
  assert.match(html, /<div id="root"><\/div>/i, `${route} must keep the client app shell mount point`)
  assert.match(html, /<meta name="robots" content="noindex,nofollow" \/>/i, `${route} must be noindexed`)
}

const vercel = await readFile(new URL('../vercel.json', import.meta.url), 'utf8')
assert.match(vercel, /"source"\s*:\s*"\/home-safety-inspection"/)
assert.match(vercel, /"destination"\s*:\s*"\/home-safety-assessment"/)
assert.match(vercel, /"source"\s*:\s*"\/internal"/)
assert.match(vercel, /"source"\s*:\s*"\/internal\/\(\.\*\)"/)
assert.match(vercel, /"source"\s*:\s*"\/partner"/)
assert.match(vercel, /"source"\s*:\s*"\/partner\/\(\.\*\)"/)
assert.doesNotMatch(vercel, /\(\?!api\/\.\*\)/, 'public pages must not be rewritten to the SPA shell')

console.log('Representative prerender and redirect checks passed.')
