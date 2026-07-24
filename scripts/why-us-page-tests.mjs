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
  /Provider fit[\s\S]*Scope and price clarity[\s\S]*Resident acceptance[\s\S]*Aftercare route/,
  'The Why Us proof layer must explain provider fit, price clarity, resident acceptance and aftercare.',
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
  styles,
  /\.why-verification-section[\s\S]*\.why-verification-grid[\s\S]*\.why-verification-card/,
  'The proof checks must have dedicated visual styling.',
)

console.log('Why Us page checks passed.')
