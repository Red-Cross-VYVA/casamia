import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = path.join(projectRoot, 'dist')
const sitemap = await readFile(path.join(projectRoot, 'public', 'sitemap.xml'), 'utf8')
const template = await readFile(path.join(distRoot, 'index.html'), 'utf8')
const { render } = await import(pathToFileURL(path.join(projectRoot, 'dist-ssr', 'entry-server.js')).href)
const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname)
const protectedAppShellRoutes = [
  '/_app-shell/private',
  '/admin/config-preview',
  '/partner',
  '/partner/login',
  '/internal',
  '/internal/customers',
  '/internal/leads',
  '/internal/callbacks',
  '/internal/visits',
  '/internal/orders',
  '/internal/inspection-report',
  '/internal/package-config',
  '/internal/service-catalog',
  '/internal/facebook-posts',
  '/internal/whatsapp-setup',
  '/internal/voice-studio',
  '/internal/proposals',
  '/internal/provider-partners',
  '/internal/data-quality',
  '/internal/agreements',
  '/internal/proposal-generator',
]

if (!template.includes('<div id="root"></div>')) {
  throw new Error('The client HTML template is already prerendered. Run the complete build to regenerate it first.')
}

if (routes.length === 0) {
  throw new Error('The sitemap contains no public routes to prerender.')
}

for (const route of routes) {
  const { html: appHtml, seo } = await render(route)
  const documentHtml = buildDocument(template, appHtml, seo)
  const outputPath = getRouteHtmlOutputPath(route)

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, documentHtml)

  const visibleText = appHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const hasExpectedNavigation = route === '/home-safety-wizard' || /<nav\b/i.test(appHtml)
  const minimumVisibleText = route === '/home-safety-wizard' ? 120 : 400
  if (!/<main\b/i.test(appHtml) || !/<h1\b/i.test(appHtml) || !hasExpectedNavigation || visibleText.length < minimumVisibleText) {
    throw new Error(`Prerendered route ${route} is missing substantive navigation, heading, or body content.`)
  }
}

console.log(`Prerendered ${routes.length} sitemap routes with crawlable HTML.`)

for (const route of protectedAppShellRoutes) {
  const outputPath = getRouteHtmlOutputPath(route)

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, buildProtectedAppShellDocument(template))
}

console.log(`Wrote ${protectedAppShellRoutes.length} protected app shell routes.`)

function getRouteHtmlOutputPath(route) {
  return route === '/'
    ? path.join(distRoot, 'index.html')
    : path.join(distRoot, `${route.slice(1)}.html`)
}

function buildDocument(source, appHtml, seo) {
  const withoutPageHead = stripPageHead(source)
  const head = buildHead(seo)

  return withoutPageHead
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${seo.language}"`)
    .replace('</head>', `${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

function buildProtectedAppShellDocument(source) {
  const head = [
    '<title>CasaMia protected access</title>',
    '<meta name="robots" content="noindex,nofollow" />',
  ]

  return stripPageHead(source).replace('</head>', `\n    ${head.join('\n    ')}\n  </head>`)
}

function stripPageHead(source) {
  return source
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[^>]*>/gi, '')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '')
}

function buildHead(seo) {
  const robots = seo.noindex ? 'noindex,nofollow' : 'index,follow'
  const locale = seo.language === 'es' ? 'es_ES' : 'en_IE'
  const alternateLocale = seo.language === 'es' ? 'en_IE' : 'es_ES'
  const imageType = new URL(seo.socialImageUrl).pathname.toLowerCase().endsWith('.png')
    ? 'image/png'
    : 'image/jpeg'
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta('name', 'description', seo.description),
    meta('name', 'robots', robots),
    meta('property', 'og:title', seo.title),
    meta('property', 'og:description', seo.description),
    meta('property', 'og:url', seo.canonicalUrl),
    meta('property', 'og:site_name', 'CasaMia'),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:locale', locale),
    meta('property', 'og:locale:alternate', alternateLocale),
    meta('property', 'og:image', seo.socialImageUrl),
    meta('property', 'og:image:secure_url', seo.socialImageUrl),
    meta('property', 'og:image:type', imageType),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', seo.title),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', seo.title),
    meta('name', 'twitter:description', seo.description),
    meta('name', 'twitter:image', seo.socialImageUrl),
    meta('name', 'twitter:image:alt', seo.title),
    `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`,
  ]

  if (seo.schema.length > 0) {
    const json = JSON.stringify(seo.schema).replace(/</g, '\\u003c')
    tags.push(`<script type="application/ld+json" data-casamia-schema="true">${json}</script>`)
  }

  return `\n    ${tags.join('\n    ')}`
}

function meta(attribute, name, content) {
  return `<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(content)}" />`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
