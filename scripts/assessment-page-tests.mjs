import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../src/pages/FreeHomeSafetyAssessmentPage.tsx', import.meta.url), 'utf8')
const en = await readFile(new URL('../src/i18n/locales/en.json', import.meta.url), 'utf8')
const es = await readFile(new URL('../src/i18n/locales/es.json', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

assert.match(
  page,
  /<SelfInspectionTool \/>[\s\S]*assessment-after-review[\s\S]*<section className="assessment-how/,
  'The assessment page must explain what happens after the online review before the general how-it-works section.',
)

assert.match(
  page,
  /afterReview\.cards\.map[\s\S]*assessment-after-review-card/,
  'The after-review journey must render from reusable translation data.',
)

assert.match(
  page,
  /const assessmentSchema = useMemo[\s\S]*description: t\('assessment\.metaDescription'\)[\s\S]*<SEO[\s\S]*schema=\{assessmentSchema\}/,
  'The assessment page must publish SEO metadata and structured schema.',
)

assert.match(
  page,
  /'@type': 'FAQPage'[\s\S]*faq\.items\.map/,
  'The assessment page must publish FAQ structured data from its visible FAQ copy.',
)

assert.match(
  page,
  /assessment-faq[\s\S]*faq\.items\.map[\s\S]*<details className="assessment-faq-item"/,
  'The assessment page must render a visible FAQ section for family decision questions.',
)

assert.match(
  en,
  /"afterReview"[\s\S]*Clear next steps, without the coordination headache[\s\S]*CasaMia coordinates the work[\s\S]*"faq"[\s\S]*What does CasaMia manage if we continue/,
  'The assessment page copy must support English process reassurance and family FAQs.',
)

assert.match(
  es,
  /"afterReview"[\s\S]*ximos pasos claros[\s\S]*CasaMia coordina el trabajo[\s\S]*"faq"[\s\S]*gestiona CasaMia si seguimos adelante/,
  'The assessment page copy must support Spanish process reassurance and family FAQs.',
)

assert.match(
  styles,
  /\.assessment-after-review[\s\S]*\.assessment-after-review-layout[\s\S]*\.assessment-after-review-card[\s\S]*\.assessment-faq[\s\S]*\.assessment-faq-item/,
  'The assessment after-review and FAQ sections must have dedicated visual styling.',
)

console.log('Assessment page checks passed.')
