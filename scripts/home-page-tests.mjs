import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { DEFAULT_COMMERCIAL_SETTINGS } from '../shared/commercialSettings.js'
import {
  CORE_PACKAGE_CUSTOMER_PRICES,
  STARTER_PACKAGE_CUSTOMER_PRICES,
} from '../shared/packagePricing.js'

const home = await readFile(new URL('../src/pages/Home2Page.tsx', import.meta.url), 'utf8')
const offer = await readFile(new URL('../src/components/WhatWeOffer.tsx', import.meta.url), 'utf8')
const uploadEstimator = await readFile(new URL('../src/components/UploadEstimator.tsx', import.meta.url), 'utf8')
const specialistAgent = await readFile(new URL('../src/config/elevenLabsSpecialistAgent.ts', import.meta.url), 'utf8')
const specialistKnowledgeBase = await readFile(new URL('../docs/elevenlabs-casamia-knowledge-base.md', import.meta.url), 'utf8')
const solutionGallery = await readFile(new URL('../src/components/SolutionGallery.tsx', import.meta.url), 'utf8')
const imageUrls = await readFile(new URL('../src/constants/shopify.ts', import.meta.url), 'utf8')
const enCopy = JSON.parse(await readFile(new URL('../src/i18n/locales/en.json', import.meta.url), 'utf8'))
const esCopy = JSON.parse(await readFile(new URL('../src/i18n/locales/es.json', import.meta.url), 'utf8'))
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
assert.equal(enCopy.hero.buildPlan.title, 'Talk to a specialist now')
assert.equal(esCopy.hero.buildPlan.title, 'Habla con un especialista')
assert.equal(esCopy.offer.proposalSnapshot.heading, 'Propuesta de seguridad')
assert.deepEqual(esCopy.offer.proposalSnapshot.items, ['Acceso al baño', 'Alcance en cocina', 'Ruta nocturna'])

assert.match(
  uploadEstimator,
  /SpecialistVoiceAgentModal/,
  'The second homepage hero action should open the ElevenLabs specialist modal.',
)

assert.match(
  uploadEstimator,
  /elevenlabs_specialist_opened/,
  'The specialist CTA should be tracked separately from the proposal wizard.',
)

assert.match(
  specialistAgent,
  /specialistAgentKnowledgeBase[\s\S]*casamia-package-catalogue/,
  'The ElevenLabs specialist agent should include package-catalogue knowledge.',
)

assert.match(
  solutionGallery,
  /\{t\('common\.learnMore'\)\}: \{item\.title\}/,
  'Homepage solution links should expose descriptive visible text for search and assistive technology.',
)

assert.match(
  specialistKnowledgeBase,
  new RegExp(`visit costs EUR ${DEFAULT_COMMERCIAL_SETTINGS.assessmentVisitFeeGross} including ${Math.round(DEFAULT_COMMERCIAL_SETTINGS.assessmentVisitVatRate * 100)}% VAT`, 'i'),
  'The specialist knowledge base should match the configured assessment visit price and VAT.',
)

for (const price of Object.values(CORE_PACKAGE_CUSTOMER_PRICES)) {
  assert.match(specialistKnowledgeBase, new RegExp(`EUR ${price}\\b`), `The specialist knowledge base should contain configured core package price EUR ${price}.`)
}

for (const price of new Set(Object.values(STARTER_PACKAGE_CUSTOMER_PRICES))) {
  assert.match(specialistKnowledgeBase, new RegExp(`EUR ${price}\\b`), `The specialist knowledge base should contain configured starter package price EUR ${price}.`)
}

assert.match(
  imageUrls,
  /hero: '\/images\/optimized\/portrait-senior-couple-dancing-together\.webp'/,
  'The homepage LCP image should use the optimized same-origin asset.',
)

assert.doesNotMatch(
  imageUrls,
  /beautiful-senior-man-woman-hugging\.jpg/,
  'The homepage and gallery should not depend on the former 1.6 MB third-party image.',
)

assert.doesNotMatch(
  sitemap,
  /home-vs-residence-cost-calculator|home-adaptations-vs-assisted-living/,
  'Removed home-vs-residence pages must not be listed in the public sitemap.',
)

console.log('Homepage checks passed.')
