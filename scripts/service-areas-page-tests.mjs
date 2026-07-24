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

assert.match(
  page,
  /@type': 'FAQPage'[\s\S]*copy\.howItems\.map/,
  'The page must include FAQ structured data for how coverage works.',
)

assert.match(
  page,
  /CasaMia is building reliable local coverage across Spain[\s\S]*CasaMia construye cobertura local fiable/,
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
  /https:\/\/casamia\.com\.es\/service-areas/,
  'The public sitemap must include the Service Areas page.',
)

assert.match(
  sitemap,
  /https:\/\/casamia\.com\.es\/service-areas\/madrid[\s\S]*https:\/\/casamia\.com\.es\/service-areas\/barcelona[\s\S]*https:\/\/casamia\.com\.es\/service-areas\/valencia/,
  'The public sitemap must include priority city service-area pages.',
)

assert.match(
  styles,
  /\.service-areas-hero[\s\S]*\.service-areas-map-card[\s\S]*\.service-areas-city-card[\s\S]*\.service-area-city-panel/,
  'The Service Areas page must have dedicated visual styling.',
)

console.log('Service areas page checks passed.')
