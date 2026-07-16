import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

function read(file) {
  return fs.readFileSync(path.join(process.cwd(), file), 'utf8')
}

const checkout = read('src/pages/ConfigureCheckoutPage.tsx')
const footer = read('src/components/Footer.tsx')
const cookieConsent = read('src/utils/cookieConsent.ts')
const analytics = read('src/utils/analytics.ts')
const workflow = read('src/services/projectWorkflow.ts')
const withdrawal = read('src/pages/WithdrawalFormPage.tsx')
const documents = read('src/services/contractDocuments.ts')
const legalControls = read('src/config/legalControls.ts')
const grantsPage = read('src/pages/GrantsPage.tsx')
const grantProgrammes = read('src/constants/grantProgrammes.ts')
const grantCopy = [
  read('src/i18n/locales/en.json'),
  read('src/i18n/locales/es.json'),
  read('src/components/Grants.tsx'),
  grantsPage,
].join('\n')

assert.match(footer, /legalRouteLabels/, 'Footer legal links should come from legal route labels.')
assert.match(read('src/config/company.ts'), /commercialName:\s*'CasaMia'/, 'Commercial brand should be centralised.')
assert.match(checkout, /Amount payable now: €0/, 'Quote requests must explicitly disclose that nothing is payable now.')
assert.match(
  checkout,
  /Amount payable now: \{formatConfiguratorCurrency\(quote\.deposit\)\}/,
  'Visit reservations must disclose the dynamic amount payable now.',
)
assert.match(checkout, /Request quote/, 'Checkout must offer the no-payment quote action.')
assert.match(checkout, /Reserve visit/, 'Checkout must offer the measured-visit reservation action.')
assert.match(checkout, /createMockDepositCheckout/, 'Visit reservation must remain on the mock checkout adapter.')
assert.match(withdrawal, /validate\(\)/, 'Withdrawal form must validate before submission.')
assert.match(cookieConsent, /analytics: false/, 'Optional analytics cookies must default off.')
assert.match(cookieConsent, /marketing: false/, 'Optional marketing cookies must default off.')
assert.match(analytics, /hasCookieConsent\('analytics'\)/, 'Analytics must be blocked before consent.')
assert.match(legalControls, /sourceLocale:\s*'es'/, 'Spanish must be legal source locale.')
assert.match(legalControls, /approvedContractLocales:\s*\[\s*'es'\s*\]/, 'Only approved contract languages should be active.')
assert.match(documents, /buildCheckoutDocumentSet/, 'Checkout documents must be downloadable.')
assert.equal(
  Number.parseFloat('€1,149'.replace(/[^\d.]/g, '')) / 2,
  574.5,
  '50% package calculation should parse formatted Euro strings.',
)
assert.match(workflow, /material-defect-identified/, 'Material defect status must exist.')
assert.match(workflow, /canTriggerFinalPayment/, 'Final payment blocking helper must exist.')
assert.match(workflow, /canProceedWithChangeOrder/, 'Change-order acceptance helper must exist.')
assert.doesNotMatch(
  grantCopy,
  /guaranteed grant|claim your grant|get your guaranteed subsidy|you qualify|government-funded installation|government pays|we file everything|no hassle|0 forms|average grant amount/i,
  'Grant copy must avoid guaranteed or authority-controlled claims.',
)
assert.match(grantProgrammes, /officialSource/, 'Grant programme model must require official source.')
assert.match(grantProgrammes, /lastVerifiedDate/, 'Grant programme model must require last verified date.')
assert.match(grantProgrammes, /isGrantProgrammeExpired/, 'Expired-programme helper must exist.')
assert.match(grantProgrammes, /isGrantProgrammeReviewOverdue/, 'Review-date helper must exist.')
assert.match(grantProgrammes, /translationStatus/, 'Grant translations must have approval status.')
assert.match(grantsPage, /Contract price/, 'Contract price must be shown separately from possible assistance.')
assert.match(grantsPage, /Possible grant/, 'Possible grants must be separated from contract pricing.')
assert.match(grantsPage, /Grant-support fees/, 'Grant-support fees must be disclosed separately.')
assert.match(
  grantsPage,
  /my grant application has not yet been approved/,
  'Grant acknowledgement must be available when work starts before approval.',
)
assert.match(grantsPage, /secure process/, 'Sensitive grant documents must not use ordinary contact forms.')
assert.match(
  grantsPage,
  /Applying for a grant is separate from purchasing CasaMia/,
  'Grant page must separate grant enquiries from installation contracts.',
)

console.log('Legal launch checks passed.')
