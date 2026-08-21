import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../src/pages/WhyCasamiaPage.tsx', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

assert.match(
  page,
  /proofEyebrow[\s\S]*What we verify[\s\S]*Qué comprobamos/,
  'The Why Us page must include bilingual proof/check copy.',
)

assert.match(
  page,
  /Provider fit[\s\S]*Scope and price clarity[\s\S]*Everyday acceptance[\s\S]*Aftercare route/,
  'The Why Us proof layer must explain provider fit, price clarity, everyday acceptance and aftercare.',
)

assert.match(
  page,
  /Encaje del profesional[\s\S]*Alcance y precio claros[\s\S]*Aceptación de la persona[\s\S]*Ruta de seguimiento/,
  'The Why Us proof layer must include Spanish equivalents for the trust checks.',
)

assert.match(
  page,
  /why-verification-section[\s\S]*copy\.proofItems\.map/,
  'The Why Us page must render the proof checks as a dedicated visual section.',
)

assert.match(
  page,
  /why-human-section[\s\S]*copy\.humanMoments\.map[\s\S]*casamia-inspector-tablet\.jpg[\s\S]*casamia-worker-process\.webp/,
  'The Why Us page must include a human team-in-action story section with real service imagery.',
)

assert.match(
  page,
  /We meet the home before the fix[\s\S]*Vemos la vivienda antes de proponer/,
  'The Why Us page must include concise bilingual human service copy.',
)

assert.match(
  styles,
  /\.why-verification-section[\s\S]*\.why-verification-grid[\s\S]*\.why-verification-card/,
  'The proof checks must have dedicated visual styling.',
)

assert.match(
  styles,
  /\.why-human-section[\s\S]*\.why-human-story-grid[\s\S]*\.why-human-mosaic/,
  'The human team-in-action layer must have dedicated visual styling.',
)

console.log('Why Us page checks passed.')
