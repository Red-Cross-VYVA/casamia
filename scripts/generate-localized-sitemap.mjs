import { readFile, writeFile } from 'node:fs/promises'

const sitemapUrl = new URL('../public/sitemap.xml', import.meta.url)
const source = await readFile(sitemapUrl, 'utf8')
const entries = [...source.matchAll(/<url><loc>(.*?)<\/loc><priority>(.*?)<\/priority><\/url>/g)]
  .map((match) => ({ url: new URL(match[1]), priority: match[2] }))
  .filter(({ url }) => url.pathname !== '/es' && !url.pathname.startsWith('/es/'))

if (entries.length === 0) {
  throw new Error('No English sitemap entries were found.')
}

const output = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
]

for (const entry of entries) {
  output.push(buildEntry(entry.url, entry.priority))
}

for (const entry of entries) {
  const spanishUrl = new URL(entry.url)
  spanishUrl.pathname = entry.url.pathname === '/' ? '/es' : `/es${entry.url.pathname}`
  output.push(buildEntry(spanishUrl, entry.priority))
}

output.push('</urlset>', '')
await writeFile(sitemapUrl, output.join('\n'))

console.log(`Generated ${entries.length * 2} localized sitemap URLs.`)

function buildEntry(url, priority) {
  const englishUrl = new URL(url)
  const logicalPath = url.pathname === '/es'
    ? '/'
    : url.pathname.startsWith('/es/')
      ? url.pathname.slice(3)
      : url.pathname
  englishUrl.pathname = logicalPath

  const spanishUrl = new URL(englishUrl)
  spanishUrl.pathname = logicalPath === '/' ? '/es' : `/es${logicalPath}`

  return [
    '  <url>',
    `    <loc>${escapeXml(url.toString())}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(englishUrl.toString())}" />`,
    `    <xhtml:link rel="alternate" hreflang="es" href="${escapeXml(spanishUrl.toString())}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(englishUrl.toString())}" />`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}
