import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../src/pages/AssistedLivingSolutionsPage.tsx', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/styles/assisted-living-solutions.css', import.meta.url), 'utf8')

assert.match(page, /className="als2-section als2-ecosystem"/, 'The ecosystem visual must remain on the page.')
assert.match(page, /id="onboarding"/, 'The onboarding deep link must remain available.')
assert.match(page, /className="als2-interface-grid"/, 'Operator and caregiver product views must remain visible.')
assert.match(page, /id="delivery-model"/, 'The existing delivery-model deep link must remain available.')
assert.match(page, /id="facility-enquiry"/, 'The facility enquiry form must remain available.')
assert.match(page, /<HeroProductVisual copy=\{copy\.interfaces\} \/>/, 'The hero must lead with the product experience.')
assert.match(page, /<EcosystemVisual copy=\{copy\.ecosystem\} \/>/, 'The page must explain the connected ecosystem visually.')
assert.match(page, /<OperatorDashboard copy=\{copy\.interfaces\.operator\} \/>/, 'The operator experience must be illustrated.')
assert.match(page, /<CaregiverPhone copy=\{copy\.interfaces\.caregiver\} \/>/, 'The caregiver mobile experience must be illustrated.')
assert.match(page, /copy\.faq\.items\.slice\(0, 4\)/, 'The visible FAQ and schema must stay concise.')
assert.match(page, /<details className="als2-form-optional">/, 'Secondary form fields must remain optional and collapsed.')
assert.match(page, /submitContactRequest\(/, 'The existing enquiry submission must remain connected.')

assert.doesNotMatch(page, /className="als-outcomes"/, 'The old text-heavy outcomes section should not return.')
assert.doesNotMatch(page, /className="als-solutions"/, 'The old six-card solutions section should not return.')
assert.doesNotMatch(page, /className="als-example"/, 'The old example roadmap should not return.')
assert.doesNotMatch(page, /className="als-governance"/, 'Governance should remain integrated into the visual trust strip.')

assert.match(styles, /\.als2-ecosystem-map/, 'The ecosystem visual needs dedicated styling.')
assert.match(styles, /\.als2-onboarding-layout/, 'The onboarding flow needs dedicated styling.')
assert.match(styles, /\.als2-caregiver-phone/, 'The caregiver mobile view needs dedicated styling.')
assert.match(styles, /@media \(max-width: 719px\)/, 'The page needs a small-screen breakpoint.')
assert.match(styles, /@media \(prefers-reduced-motion: no-preference\)/, 'Decorative motion must be opt-in for motion-safe users.')

console.log('Assisted-living page checks passed.')
