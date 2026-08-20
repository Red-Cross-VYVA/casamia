import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const distDir = path.join(projectRoot, 'dist')
const templatePath = path.join(distDir, 'index.html')
const sitemapPath = path.join(distDir, 'sitemap.xml')
const siteUrl = 'https://casamia.com.es'
const defaultImage = '/images/solutions/portrait-lovely-couple-together.jpg'
const redirectRoutes = [
  ['/home-safety-inspection', '/home-safety-assessment'],
  ['/es/home-safety-inspection', '/es/home-safety-assessment'],
]

const template = await readFile(templatePath, 'utf8')
const sitemap = await readFile(sitemapPath, 'utf8')
const { render } = await import(pathToFileURL(path.join(distDir, 'server', 'entry-server.js')).href)
const routes = extractSitemapRoutes(sitemap)

for (const route of routes) {
  const { appHtml, seo } = await render(route)

  if (!appHtml.includes('<h1')) {
    throw new Error(`Prerendered route ${route} did not include a visible h1.`)
  }

  const html = injectRenderedApp(template, appHtml)
  const withHead = injectSeoHead(html, seo, route)
  await writeRouteHtml(route, withHead)
  console.log(`prerendered ${route}`)
}

for (const [source, destination] of redirectRoutes) {
  await writeRouteHtml(source, buildRedirectHtml(source, destination))
  console.log(`redirected ${source} -> ${destination}`)
}

await rm(path.join(distDir, 'server'), { recursive: true, force: true })
console.log('removed temporary SSR bundle')

function extractSitemapRoutes(xml) {
  const routes = [...xml.matchAll(/<loc>(https:\/\/(?:www\.)?casamia\.com\.es[^<]*)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter((pathname) => !pathname.startsWith('/internal') && !pathname.startsWith('/estimate/') && !pathname.startsWith('/proposal/'))

  return [...new Set(routes)]
}

function injectRenderedApp(html, appHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

function injectSeoHead(html, seo, route) {
  const title = getFullTitle(seo?.title)
  const description = seo?.description ?? 'CasaMia helps families in Spain make homes safer for seniors.'
  const language = seo?.language ?? (route.startsWith('/es') ? 'es' : 'en')
  const canonicalPath = seo?.path ?? route
  const canonicalUrl = new URL(canonicalPath, siteUrl).toString()
  const socialImageUrl = new URL(seo?.image ?? defaultImage, siteUrl).toString()
  const robots = seo?.noindex ? 'noindex,nofollow' : 'index,follow'
  const schemas = buildSchemas(seo, language)

  const headTags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeAttribute(description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(description)}" />`,
    `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />`,
    '<meta property="og:site_name" content="CasaMia" />',
    '<meta property="og:type" content="website" />',
    `<meta property="og:locale" content="${language === 'es' ? 'es_ES' : 'en_IE'}" />`,
    `<meta property="og:image" content="${escapeAttribute(socialImageUrl)}" />`,
    `<meta property="og:image:secure_url" content="${escapeAttribute(socialImageUrl)}" />`,
    `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}" />`,
    `<meta name="twitter:image" content="${escapeAttribute(socialImageUrl)}" />`,
    `<script type="application/ld+json" data-casamia-schema="true">${escapeJsonScript(JSON.stringify(schemas))}</script>`,
  ].map((tag) => `    ${tag}`).join('\n')

  return html
    .replace(/<html lang="[^"]*">/, `<html lang="${language}">`)
    .replace(/\s*<title>[\s\S]*?<\/title>\s*/i, '\n')
    .replace(/\s*<meta\s+(?:name|property)="(?:description|robots|og:title|og:description|og:url|og:site_name|og:type|og:locale|og:image|og:image:secure_url|twitter:title|twitter:description|twitter:image)"[^>]*>\s*/gi, '\n')
    .replace(/\s*<link rel="canonical"[^>]*>\s*/gi, '\n')
    .replace(/\s*<script type="application\/ld\+json" data-casamia-schema="true">[\s\S]*?<\/script>\s*/gi, '\n')
    .replace('  </head>', `${headTags}\n  </head>`)
}

function buildSchemas(seo, language) {
  const extraSchemas = Array.isArray(seo?.schema) ? seo.schema : seo?.schema ? [seo.schema] : []

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'CasaMia',
      url: siteUrl,
      areaServed: [{ '@type': 'Country', name: 'Spain' }],
      knowsAbout: [
        'senior home adaptation',
        'home safety assessment',
        'bathroom safety for seniors',
        'fall prevention at home',
        'Plan Adapta grants',
        'aging in place',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'CasaMia',
      url: siteUrl,
      inLanguage: language === 'es' ? 'es-ES' : 'en',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    ...extraSchemas,
  ]
}

function getFullTitle(title) {
  if (!title) {
    return 'CasaMia | Home Safety Adaptations for Seniors in Spain'
  }

  return title.includes('CasaMia') ? title : `${title} | CasaMia`
}

async function writeRouteHtml(route, html) {
  const routePath = route === '/' ? 'index.html' : path.join(route.slice(1), 'index.html')
  const outputPath = path.join(distDir, routePath)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html)

  if (route !== '/') {
    const cleanUrlPath = path.join(distDir, `${route.slice(1)}.html`)
    await mkdir(path.dirname(cleanUrlPath), { recursive: true })
    await writeFile(cleanUrlPath, html)
  }
}

function buildRedirectHtml(source, destination) {
  const canonicalUrl = new URL(destination, siteUrl).toString()

  return `<!doctype html>
<html lang="${source.startsWith('/es') ? 'es' : 'en'}">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex,follow" />
    <meta http-equiv="refresh" content="0; url=${escapeAttribute(destination)}" />
    <link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />
    <title>Redirecting to CasaMia</title>
  </head>
  <body>
    <main>
      <h1>Redirecting to CasaMia</h1>
      <p><a href="${escapeAttribute(destination)}">Continue to the current CasaMia home safety assessment page.</a></p>
    </main>
  </body>
</html>`
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeHtml(value) {
  return escapeAttribute(value).replaceAll("'", '&#39;')
}

function escapeJsonScript(value) {
  return value.replaceAll('<', '\\u003c')
}
