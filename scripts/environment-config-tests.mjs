import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const environmentExample = readFileSync('.env.example', 'utf8')
const gitignore = readFileSync('.gitignore', 'utf8')
const requiredServerVariables = [
  'CASAMIA_INTERNAL_API_KEY',
  'CASAMIA_INTERNAL_PASSWORD',
  'CASAMIA_INTERNAL_SESSION_SECRET',
  'CASAMIA_PARTNER_CREDENTIALS',
  'CRON_SECRET',
  'ELEVENLABS_AGENT_ID',
  'ELEVENLABS_API_KEY',
  'META_GRAPH_API_VERSION',
  'META_PAGE_ACCESS_TOKEN',
  'META_PAGE_ID',
  'OPENAI_API_KEY',
  'CASAMIA_PUBLIC_WRITE_RATE_LIMIT_SALT',
  'RESEND_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_VISIT_TAX_RATE_ID',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_URL',
]

for (const name of requiredServerVariables) {
  assert.match(environmentExample, new RegExp(`^#?\\s*${name}=`, 'm'), `${name} must be documented in .env.example.`)
  assert.doesNotMatch(environmentExample, new RegExp(`^VITE_${name}=`, 'm'), `${name} must remain server-only.`)
}

assert.match(gitignore, /^\.env$/m, '.gitignore must exclude the default .env file.')
assert.match(gitignore, /^\.env\.\*$/m, '.gitignore must exclude environment variants.')
assert.match(gitignore, /^!\.env\.example$/m, '.env.example must remain tracked.')

const trackedFiles = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
const forbiddenSecretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/,
  /\bwhsec_[A-Za-z0-9]{20,}\b/,
  /\bEA[A-Za-z0-9]{80,}\b/,
]

for (const file of trackedFiles) {
  if (!/\.(?:c?js|mjs|json|md|ts|tsx|txt|yml|yaml)$/.test(file) && !file.endsWith('.example')) continue
  const source = readFileSync(file, 'utf8')
  if (/^(?:api|shared|src)\//.test(file) || /^(?:middleware|vite\.config)\.(?:js|ts)$/.test(file)) {
    assert.doesNotMatch(source, /VITE_[A-Z0-9_]*(?:SECRET|PASSWORD|PRIVATE_KEY|ACCESS_TOKEN|API_KEY)/, `${file} exposes a secret-shaped VITE variable.`)
  }
  for (const pattern of forbiddenSecretPatterns) {
    assert.doesNotMatch(source, pattern, `${file} contains a real-looking credential or private key.`)
  }
}

console.log(`Environment configuration checks passed (${requiredServerVariables.length} server variables, ${trackedFiles.length} tracked files).`)
