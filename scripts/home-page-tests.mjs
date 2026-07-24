import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const home = await readFile(new URL('../src/pages/Home2Page.tsx', import.meta.url), 'utf8')
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')

assert.match(
  home,
  /<Prevention \/>[\s\S]*<SolutionGallery \/>/,
  'The homepage should move from prevention into solution browsing without the removed home-vs-residence section.',
)

assert.doesNotMatch(
  home,
  /HomeDecisionSupport|home-vs-residence-cost-calculator/,
  'The homepage must not expose the removed home-vs-residence decision section.',
)

assert.match(
  home,
  /<BeforeAfterPreview \/>[\s\S]*<WhatWeOffer \/>[\s\S]*<ManufacturerMarquee \/>[\s\S]*<Grants \/>/,
  'The manufacturer carousel should sit below the What We Offer section and above Grants.',
)

assert.doesNotMatch(
  sitemap,
  /home-vs-residence-cost-calculator|home-adaptations-vs-assisted-living/,
  'Removed home-vs-residence pages must not be listed in the public sitemap.',
)

console.log('Homepage checks passed.')
