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

for (const [language, source] of Object.entries({ en, es })) {
  const { afterReview, faq } = JSON.parse(source).assessment
  assert.equal(afterReview.cards.length, 4, `${language}: explain all four steps after the review.`)
  for (const section of [afterReview, ...afterReview.cards, faq]) {
    assert.ok(section.title?.trim(), `${language}: journey cards and FAQs need a title.`)
    assert.ok(section.body?.trim(), `${language}: journey cards and FAQs need explanatory copy.`)
  }
  assert.match(`${afterReview.title} ${afterReview.body}`, /priorit|prioridad/i,
    `${language}: explain how the review establishes priorities.`)
  assert.match(afterReview.cards.at(-1).title, /CasaMia/,
    `${language}: explain CasaMia's role in the next steps.`)
  assert.match(afterReview.note, language === 'en'
    ? /no installation.*approved/i
    : /no.*instalaci[oó]n.*aceptad/i,
  `${language}: installation must remain conditional on customer approval.`)

  const coordinationFaq = faq.items.find((item) => language === 'en'
    ? /what does CasaMia manage/i.test(item.question)
    : /qu[eé] gestiona CasaMia/i.test(item.question))
  assert.ok(coordinationFaq, `${language}: include a FAQ about CasaMia's coordination role.`)
  assert.match(coordinationFaq.answer, /coordina/i,
    `${language}: the FAQ must explain coordination, not only ask about it.`)
}

assert.match(
  styles,
  /\.assessment-after-review[\s\S]*\.assessment-after-review-layout[\s\S]*\.assessment-after-review-card[\s\S]*\.assessment-faq[\s\S]*\.assessment-faq-item/,
  'The assessment after-review and FAQ sections must have dedicated visual styling.',
)

console.log('Assessment page checks passed.')
