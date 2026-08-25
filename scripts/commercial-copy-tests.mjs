import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { getLocalizedLegalDocument } from '../src/constants/legalDocuments.ts'
import { applyCommercialCopy, applyCommercialText, getCommercialCopyVariables } from '../src/services/commercialCopy.ts'

const customSettings = {
  assessmentVisitFeeGross: 125,
  assessmentVisitVatRate: 0.1,
  proposalDepositRate: 0.4,
  corePackageStandaloneInstallationPrice: 110,
  corePackageInstallationSchedule: [
    { packageCount: 1, totalInstallationPrice: 110 },
    { packageCount: 2, totalInstallationPrice: 180 },
  ],
  installationQuoteFromPackageCount: 3,
}

assert.deepEqual(getCommercialCopyVariables(customSettings), {
  proposalBalancePercent: '60%',
  proposalUpfrontPercent: '40%',
  visitFee: '125 EUR',
  visitVatPercent: '10%',
})

assert.deepEqual(
  applyCommercialCopy(
    {
      payment: '{{proposalUpfrontPercent}} now and {{proposalBalancePercent}} later',
      visit: ['{{visitFee}} including {{visitVatPercent}} VAT'],
    },
    customSettings,
  ),
  {
    payment: '40% now and 60% later',
    visit: ['125 EUR including 10% VAT'],
  },
)

for (const language of ['en', 'es']) {
  const terms = getLocalizedLegalDocument('general-customer-terms', language, customSettings)
  const termsText = JSON.stringify(terms)
  assert.match(termsText, /125 EUR/)
  assert.match(termsText, /10%/)
  assert.match(termsText, /40%/)
  assert.match(termsText, /60%/)
  assert.doesNotMatch(termsText, /\{\{(?:visit|proposal)/)
}

for (const language of ['en', 'es']) {
  const locale = JSON.parse(readFileSync(new URL(`../src/i18n/locales/${language}.json`, import.meta.url), 'utf8'))
  const assessmentSubtitle = applyCommercialText(locale.assessment.hero.subtitle, customSettings)
  assert.match(assessmentSubtitle, /125 EUR/)
  assert.match(assessmentSubtitle, /10%/)
  assert.doesNotMatch(assessmentSubtitle, /\{\{/)
}

console.log('Commercial copy tests passed.')
