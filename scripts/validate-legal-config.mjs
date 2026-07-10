import fs from 'node:fs'
import path from 'node:path'

const companyConfigPath = path.join(process.cwd(), 'src', 'config', 'company.ts')
const legalControlsPath = path.join(process.cwd(), 'src', 'config', 'legalControls.ts')
const companySource = fs.readFileSync(companyConfigPath, 'utf8')
const legalControlsSource = fs.readFileSync(legalControlsPath, 'utf8')

const requiredFields = [
  'legalName',
  'nif',
  'registeredAddress',
  'registryDetails',
  'customerServiceEmail',
  'customerServicePhone',
  'complaintsEmail',
  'complaintsAddress',
  'privacyEmail',
]

const unresolved = []

for (const field of requiredFields) {
  const match = companySource.match(new RegExp(`${field}:\\s*'([^']+)'`))
  if (!match || /^\[.+\]$/.test(match[1])) {
    unresolved.push(field)
  }
}

if (!/approvedContractLocales:\s*\[\s*'es'\s*\]/.test(legalControlsSource)) {
  unresolved.push('approvedContractLocales')
}

if (!/version:\s*'[^']+'/.test(companySource)) {
  unresolved.push('termsVersion')
}

if (unresolved.length > 0) {
  console.error(`Legal configuration is not production-ready: ${unresolved.join(', ')}`)
  console.error('Set CASAMIA_ALLOW_PLACEHOLDERS=true only for local development checks.')
  if (process.env.CASAMIA_ALLOW_PLACEHOLDERS === 'true') {
    process.exit(0)
  }
  process.exit(1)
}

console.log('Legal configuration validation passed.')
