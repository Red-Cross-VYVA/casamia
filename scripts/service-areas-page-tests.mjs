import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const page = await readFile(new URL('../src/pages/ServiceAreasPage.tsx', import.meta.url), 'utf8')
const constants = await readFile(new URL('../src/constants/serviceAreas.ts', import.meta.url), 'utf8')
const nav = await readFile(new URL('../src/components/Nav.tsx', import.meta.url), 'utf8')
const footer = await readFile(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8')
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

assert.match(
  app,
  /ServiceAreasPage[\s\S]*<Route path="\/service-areas" element=\{<ServiceAreasPage \/>}/,
  'The service areas page must be registered as a public route.',
)

assert.match(
  app,
  /<Route path="\/service-areas\/:citySlug" element=\{<ServiceAreasPage \/>}/,
  'City-level service area pages must be registered as public routes.',
)

assert.match(
  constants,
  /function getServiceAreaCitySlug[\s\S]*normalize\('NFD'\)/,
  'City-level service area slugs must be generated from the shared city source of truth.',
)

assert.match(
  constants,
  /Madrid[\s\S]*Barcelona[\s\S]*Valencia[\s\S]*Malaga[\s\S]*Alicante[\s\S]*Seville/,
  'The service-area source of truth must include the first priority Spanish cities.',
)

assert.match(
  page,
  /@type': 'Service'[\s\S]*areaServed: serviceAreaCities\.map/,
  'The page must expose Service schema with city-level areaServed data.',
)

assert.match(
  page,
  /useParams[\s\S]*selectedCity[\s\S]*copy\.cityPageTitle\(selectedCity\.city\)[\s\S]*areaServed: \{[\s\S]*selectedCity\.city/,
  'The service areas page must render city-level SEO content from the same city data.',
)

const cityFaqTitles = [...page.matchAll(/cityFaqTitle: \(city: string\) => `([^`]+)`/g)]
assert.equal(cityFaqTitles.length, 2, 'City FAQ headings must exist in both languages.')
assert.match(cityFaqTitles[0][1], /Questions.*\$\{city\}/)
assert.match(cityFaqTitles[1][1], /Preguntas.*\$\{city\}/)
const cityFaqBlocks = [...page.matchAll(/cityFaqItems: \(city: string\) => \[([\s\S]*?)\],/g)]
assert.equal(cityFaqBlocks.length, 2, 'Both languages must supply local-intent FAQs.')
for (const block of cityFaqBlocks) {
  const questions = [...block[1].matchAll(/question: `([^`]+)`/g)]
  assert.equal(questions.length, 3, 'Cover the review, local installation and grants in each city.')
  questions.forEach((question) => assert.ok(question[1].includes('${city}')))
}
assert.match(page, /const cityFaqItems = copy\.cityFaqItems\(selectedCity\.city\)[\s\S]*service-area-city-faq-list/)

assert.match(
  page,
  /'@type': 'FAQPage'[\s\S]*mainEntity: cityFaqItems\.map/,
  'City-level service area FAQ schema must use the visible city FAQ content.',
)

assert.match(
  page,
  /@type': 'FAQPage'[\s\S]*copy\.howItems\.map/,
  'The page must include FAQ structured data for how coverage works.',
)

assert.match(
  page,
  /en: \{[\s\S]*seoTitle: '[^']*Spain'[\s\S]*es: \{[\s\S]*seoTitle: '[^']*España'/,
  'The service areas page must have English and Spanish public copy.',
)

assert.match(
  nav,
  /match: \['\/blog', '\/resources', '\/tools', '\/service-areas'\][\s\S]*Service areas/,
  'The Resources menu must expose Service areas and mark it active.',
)

assert.match(
  footer,
  /serviceAreas: 'Service Areas in Spain'[\s\S]*to: '\/service-areas'/,
  'The footer must link to the Service Areas page.',
)

assert.match(
  sitemap,
  /https:\/\/www\.casamia\.com\.es\/service-areas/,
  'The public sitemap must include the Service Areas page.',
)

assert.match(
  sitemap,
  /https:\/\/www\.casamia\.com\.es\/service-areas\/madrid[\s\S]*https:\/\/www\.casamia\.com\.es\/service-areas\/barcelona[\s\S]*https:\/\/www\.casamia\.com\.es\/service-areas\/valencia/,
  'The public sitemap must include priority city service-area pages.',
)

assert.match(
  styles,
  /\.service-areas-hero[\s\S]*\.service-areas-map-card[\s\S]*\.service-areas-city-card[\s\S]*\.service-area-city-panel[\s\S]*\.service-area-city-faq-list/,
  'The Service Areas page must have dedicated visual styling.',
)

console.log('Service areas page checks passed.')
