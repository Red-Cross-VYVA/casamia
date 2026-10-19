import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../src/pages/WhyCasamiaPage.tsx', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

assert.match(
  page,
  /proofEyebrow[\s\S]*What we verify[\s\S]*Qué comprobamos/,
  'The Why Us page must include bilingual proof/check copy.',
)

const proofBlocks = [...page.matchAll(/proofItems: \[([\s\S]*?)\],\s*sections:/g)]
assert.equal(proofBlocks.length, 2, 'Both languages must define the public trust checks.')
for (const [index, topics] of [
  [/person.*work/i, /price/i, /daily.*use|use.*day/i, /aftercare|follow.up/i],
  [/persona.*trabajo/i, /precio/i, /uso.*diario|usar.*rutina/i, /seguimiento/i],
].entries()) {
  const checks = [...proofBlocks[index][1].matchAll(/title: '([^']+)',\s*body: '([^']+)',\s*outcome: '([^']+)'/g)]
  assert.equal(checks.length, 4, 'Each language must explain all four checks and their customer outcomes.')
  topics.forEach((topic, checkIndex) => assert.match(`${checks[checkIndex][1]} ${checks[checkIndex][2]}`, topic))
}

assert.match(
  page,
  /why-verification-section[\s\S]*copy\.proofItems\.map/,
  'The Why Us page must render the proof checks as a dedicated visual section.',
)

assert.match(
  styles,
  /\.why-verification-section[\s\S]*\.why-verification-grid[\s\S]*\.why-verification-card/,
  'The proof checks must have dedicated visual styling.',
)

assert.match(
  page,
  /searchParams\.get\('service'\) === 'connected-health'[\s\S]*setSelectedPlan\(connectedPlan\)[\s\S]*setMessage\(intentMessage\)/,
  'Technology CTAs must preserve their connected-health intent in the contact form.',
)

console.log('Why Us page checks passed.')
