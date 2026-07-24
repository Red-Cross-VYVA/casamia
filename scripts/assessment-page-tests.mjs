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
  en,
  /"afterReview"[\s\S]*Clear next steps, without the coordination headache[\s\S]*CasaMia coordinates the work/,
  'The assessment after-review copy must support English process reassurance.',
)

assert.match(
  es,
  /"afterReview"[\s\S]*Próximos pasos claros[\s\S]*CasaMia coordina el trabajo/,
  'The assessment after-review copy must support Spanish process reassurance.',
)

assert.match(
  styles,
  /\.assessment-after-review[\s\S]*\.assessment-after-review-layout[\s\S]*\.assessment-after-review-card/,
  'The assessment after-review section must have dedicated visual styling.',
)

console.log('Assessment page checks passed.')
