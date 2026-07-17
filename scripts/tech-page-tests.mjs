import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../src/pages/TechPage.tsx', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/styles/tech-page.css', import.meta.url), 'utf8')

assert.match(page, /useServicesByRoom\('connected'\)/, 'Tech page must use the live connected-services catalogue.')
assert.match(page, /id="connected-inclusions"/, 'The existing connected-inclusions deep link must remain available.')
assert.match(page, /\/configure\?room=connected/, 'The live catalogue must retain its configurator route.')
assert.match(page, /intent=integration#contact-form/, 'Integration CTAs must preserve intent and lead to the CasaMia contact form.')
assert.match(page, /intent=platform#contact-form/, 'Platform enquiries must preserve intent and lead to the CasaMia contact form.')
assert.match(page, /<div className="cm-tech-page" lang=\{copy\.lang\}>/, 'The page must declare the language used by its localized copy.')
assert.doesNotMatch(page, /<main className="cm-tech-page"/, 'The routed page must not nest a second main landmark.')

assert.match(page, /The CasaMia Home Clinic/)
assert.match(page, /La Clínica en Casa de CasaMia/)
assert.match(page, /Telehealth option/)
assert.match(page, /Opción de telesalud/)
assert.match(page, /Your app or care system/)
assert.match(page, /Tu app o sistema asistencial/)
assert.match(page, /CasaMia connected-care platform/)
assert.match(page, /Plataforma de atención conectada CasaMia/)
assert.match(page, /localiseCatalogueLabel\(service\.name, copy\.lang\)/, 'Admin catalogue values need a localized display layer.')
assert.match(page, /formatTechServicePrice\(service, copy\.lang\)/, 'Admin catalogue price labels need localization.')

assert.match(page, /<SEO[^>]+schema=\{schema\}/, 'The page must publish localized metadata and structured data.')
assert.match(page, /'@type': 'FAQPage'/, 'The page must publish FAQ structured data.')
assert.match(styles, /@media \(max-width: 760px\)/, 'The Tech page needs a mobile breakpoint.')
assert.match(styles, /prefers-reduced-motion: reduce/, 'The Tech page must respect reduced-motion preferences.')

console.log('Tech page checks passed.')
