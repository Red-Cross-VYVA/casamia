import assert from 'node:assert/strict'
import { webcrypto } from 'node:crypto'

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto })
}

if (!globalThis.btoa) {
  Object.defineProperty(globalThis, 'btoa', {
    value: (input) => Buffer.from(input, 'binary').toString('base64'),
  })
}

const {
  buildAgreementDocxBlob,
  createAgreementAssignment,
  getActiveAgreementVersion,
  listAgreementTemplates,
  listManagedLegalDocuments,
  renderAgreementPlainText,
} = await import('../src/services/agreementManagement.ts')

const templates = listAgreementTemplates()
assert.equal(templates.length, 1)
assert.equal(templates[0].documentId, 'installation-partner-agreement')
assert.equal(templates[0].activeVersion, '1.0.0')
assert.equal(templates[0].versions.length, 2)

const version = getActiveAgreementVersion('installation-partner-agreement', 'es')
assert.ok(version)
assert.equal(version.locale, 'es')
assert.equal(version.reviewStatus, 'pending-legal-review')
assert.ok(version.sections.length >= 18)
assert.ok(version.sections.some((section) => section.title.includes('Firma digital futura')))

const assignment = createAgreementAssignment({
  assignedBy: 'CasaMia Operations',
  documentId: 'installation-partner-agreement',
  locale: 'es',
  partnerBusinessName: 'Instalaciones Demo SL',
  partnerContactName: 'Ana Lopez',
  partnerEmail: 'ana@example.com',
  partnerId: 'PPA-DEMO',
  shareEnabled: true,
  version: '1.0.0',
})

assert.match(assignment.assignmentId, /^AGR-\d{6}-[A-Z0-9]{5}$/)
assert.match(assignment.publicToken, /^[A-Za-z0-9_-]{32,}$/)
assert.ok(assignment.publicUrl?.includes('/agreement/'))
assert.equal(assignment.status, 'sent')
assert.equal(assignment.auditEvents.filter((event) => event.eventType === 'shared').length, 1)

const text = renderAgreementPlainText(assignment, version)
assert.match(text, /Acuerdo de colaboración para empresas instaladoras/)
assert.match(text, /colaborador aprobado de CasaMia/i)
assert.doesNotMatch(text, /colaborador certificado de CasaMia/i)
assert.match(text, /no solicitará pagos directos al cliente/i)
assert.match(text, /pendiente de revisión legal/i)

const docxBlob = buildAgreementDocxBlob(assignment, version)
const docxBytes = new Uint8Array(await docxBlob.arrayBuffer())
assert.equal(String.fromCharCode(...docxBytes.slice(0, 2)), 'PK')
assert.ok(docxBytes.length > 4000)

const englishVersion = getActiveAgreementVersion('installation-partner-agreement', 'en')
assert.ok(englishVersion)
assert.equal(englishVersion.locale, 'en')
assert.equal(englishVersion.title, 'Installation Partner Agreement')
assert.equal(englishVersion.reviewStatus, 'pending-legal-review')
assert.equal(englishVersion.sections.length, version.sections.length)
assert.ok(englishVersion.sections.some((section) => section.title.includes('Future digital signature')))

const englishAssignment = createAgreementAssignment({
  assignedBy: 'CasaMia Operations',
  documentId: 'installation-partner-agreement',
  locale: 'en',
  partnerBusinessName: 'Demo Installations Ltd',
  partnerContactName: 'Ana Lopez',
  partnerEmail: 'ana@example.com',
  partnerId: 'PPA-DEMO-EN',
  shareEnabled: true,
  version: '1.0.0',
})
const englishText = renderAgreementPlainText(englishAssignment, englishVersion)
assert.match(englishText, /Installation Partner Agreement/)
assert.match(englishText, /approved CasaMia collaborator/i)
assert.match(englishText, /will not request direct customer payments/i)
assert.match(englishText, /pending Spanish legal review/i)
assert.doesNotMatch(englishText, /CasaMia-certified provider/i)

const englishDocxBlob = buildAgreementDocxBlob(englishAssignment, englishVersion)
const englishDocxBytes = new Uint8Array(await englishDocxBlob.arrayBuffer())
assert.equal(String.fromCharCode(...englishDocxBytes.slice(0, 2)), 'PK')
assert.ok(englishDocxBytes.length > 4000)

const library = listManagedLegalDocuments('es')
assert.equal(library.filter((document) => document.category === 'agreement-template').length, 2)
assert.ok(library.some((document) => document.category === 'public-legal-page'))

console.log('Agreement management tests passed.')
