import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const clientEntry = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8')
const languageSync = await readFile(new URL('../src/components/PreferredLanguageSync.tsx', import.meta.url), 'utf8')
const appEntry = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert.match(clientEntry, /if \(hasPrerenderedMarkup\)[\s\S]*hydrateRoot\(root, application\)[\s\S]*return/, 'Prerendered markup should always hydrate in place.')
assert.doesNotMatch(clientEntry, /<PreferredLanguageSync \/>/, 'The root must not synchronize language before lazy routes finish hydrating.')
assert.match(appEntry, /<Suspense[\s\S]*<Routes>[\s\S]*<\/Routes>[\s\S]*<PreferredLanguageSync \/>[\s\S]*<\/Suspense>/, 'Language synchronization should commit inside the hydrated route boundary.')
assert.match(languageSync, /useEffect[\s\S]*changeLanguage\(preferredLanguage\)/, 'Browser language should synchronize only after hydration commits.')
assert.match(languageSync, /startTransition[\s\S]*changeLanguage/, 'Language synchronization should run as a non-blocking transition.')
assert.doesNotMatch(clientEntry, /replaceChildren\(\)/, 'Language selection must not erase prerendered markup and cause layout shift.')
assert.match(appEntry, /function RouteLoadingFallback[\s\S]*min-h-screen/, 'Route loading must preserve at least one viewport of height so the footer cannot shift into view during hydration.')

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

const homeHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
assert.match(homeHtml, /href="\/images\/optimized\/portrait-senior-couple-dancing-together\.webp"[^>]*fetchpriority="high"/i)
assert.match(homeHtml, /<img[^>]*portrait-senior-couple-dancing-together\.webp[^>]*fetchpriority="high"/i)
assert.match(homeHtml, /href="\/fonts\/inter-latin\.woff2"/i)
assert.doesNotMatch(homeHtml, /fonts\.googleapis\.com/i, 'Production HTML should use same-origin fonts.')

const deploymentReadiness = JSON.parse(await readFile(new URL('../dist/deployment-readiness.json', import.meta.url), 'utf8'))
assert.deepEqual(deploymentReadiness, {
  contractVersion: 1,
  partnerIdentityBinding: 1,
  persistentPublicRateLimits: 1,
  privateWizardMedia: 1,
  publicWriteValidation: 1,
}, 'The production bundle must expose the audited deployment contract.')

const protectedShellRoutes = [
  ['dist/_app-shell/private.html', '/_app-shell/private'],
  ['dist/internal.html', '/internal'],
  ['dist/internal/service-catalog.html', '/internal/service-catalog'],
  ['dist/internal/facebook-posts.html', '/internal/facebook-posts'],
  ['dist/internal/whatsapp-setup.html', '/internal/whatsapp-setup'],
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
