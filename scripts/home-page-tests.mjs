import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const home = await readFile(new URL('../src/pages/Home2Page.tsx', import.meta.url), 'utf8')
const offer = await readFile(new URL('../src/components/WhatWeOffer.tsx', import.meta.url), 'utf8')
const enCopy = JSON.parse(await readFile(new URL('../src/i18n/locales/en.json', import.meta.url), 'utf8'))
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

assert.match(
  offer,
  /SafeImage/,
  'The active What We Offer section should render visual-led journey cards.',
)

assert.match(
  offer,
  /\/images\/solutions\/casamia-staff-kitchen-consultation\.webp/,
  'Step 1 in the active What We Offer section should use the consultation image.',
)

assert.match(
  offer,
  /offer-proposal-snapshot/,
  'Step 2 in the active What We Offer section should render a proposal snapshot visual.',
)

assert.match(
  offer,
  /\/images\/solutions\/euro-grant-support-retouched\.jpg/,
  'Step 3 in the active What We Offer section should use the retouched Euro grant support image.',
)

assert.match(
  offer,
  /\/images\/solutions\/front-view-adorable-couple-kitchen\.jpg/,
  'Step 4 in the active What We Offer section should use the kitchen couple image.',
)

assert.equal(enCopy.offer.line1, 'A safer home,')
assert.equal(enCopy.offer.cards[1].title, 'Review your proposal')

assert.doesNotMatch(
  sitemap,
  /home-vs-residence-cost-calculator|home-adaptations-vs-assisted-living/,
  'Removed home-vs-residence pages must not be listed in the public sitemap.',
)

console.log('Homepage checks passed.')
