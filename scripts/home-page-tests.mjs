import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const home = await readFile(new URL('../src/pages/Home2Page.tsx', import.meta.url), 'utf8')
const component = await readFile(new URL('../src/components/HomeDecisionSupport.tsx', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

assert.match(
  home,
  /<Prevention \/>[\s\S]*<HomeDecisionSupport \/>[\s\S]*<SolutionGallery \/>/,
  'The homepage must show decision support after prevention and before solution browsing.',
)

assert.match(
  component,
  /Before a big move, see what home can still become[\s\S]*Antes de una gran decisión/,
  'The home decision section must support English and Spanish decision framing.',
)

assert.match(
  component,
  /\/tools\/home-vs-residence-cost-calculator[\s\S]*\/home-safety-assessment#self-inspection-tool/,
  'The home decision section must link to the cost planner and guided review.',
)

assert.match(
  component,
  /Compare real routes[\s\S]*Keep the family aligned/,
  'The home decision section must explain the practical decision path, not package components.',
)

assert.match(
  styles,
  /\.home-decision-section[\s\S]*\.home-decision-panel[\s\S]*\.home-decision-card/,
  'The home decision section must have dedicated visual styling.',
)

console.log('Homepage decision-support checks passed.')

