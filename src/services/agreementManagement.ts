import { casamiaCompanyConfig } from '../config/company.ts'
import {
  getLegalDocumentMeta,
  getLocalizedLegalDocument,
  legalRouteLabels,
  type LegalDocumentId,
  type LegalReviewStatus,
} from '../constants/legalDocuments.ts'
import {
  getInternalAuthHeaders,
  getPartnerAuthHeaders,
  getPartnerEmail,
  hasInternalBackendSession,
  hasPartnerBackendSession,
} from './internalAuth.ts'
import { getPublicSiteApiBaseUrl, hasPublicSiteApi } from './publicSiteApi.ts'

export type AgreementLocale = 'es' | 'en'

export type AgreementReviewStatus = LegalReviewStatus

export type AgreementAssignmentStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'under-review'
  | 'ready-for-signature'
  | 'signed'
  | 'revoked'
  | 'expired'

export type AgreementSignatureStatus =
  | 'not-started'
  | 'provider-review'
  | 'signature-ready'
  | 'sent-to-signature'
  | 'signed'

export type AgreementAuditEventType =
  | 'created'
  | 'assigned'
  | 'shared'
  | 'viewed-public'
  | 'acknowledged-public'
  | 'status-changed'
  | 'share-revoked'
  | 'exported-pdf'
  | 'exported-docx'
  | 'signature-reserved'

export type AgreementSection = {
  body?: string
  id: string
  points?: string[]
  title: string
}

export type AgreementSourceReference = {
  label: string
  url: string
}

export type AgreementVersion = {
  changeSummary: string[]
  documentId: string
  effectiveDate: string
  exportFileName: string
  jurisdiction: string
  languageLabel: string
  locale: AgreementLocale
  reviewStatus: AgreementReviewStatus
  sections: AgreementSection[]
  signatureBlocks: string[]
  sourceReferences: AgreementSourceReference[]
  title: string
  version: string
}

export type AgreementTemplate = {
  activeVersion: string
  category: 'partner' | 'customer' | 'privacy' | 'operations'
  defaultLocale: AgreementLocale
  description: string
  documentId: string
  ownerTeam: string
  supportedLocales: AgreementLocale[]
  title: string
  versions: AgreementVersion[]
}

export type AgreementAuditEvent = {
  actor: string
  actorType: 'internal' | 'partner' | 'system'
  at: string
  details?: string
  eventType: AgreementAuditEventType
  id: string
}

export type AgreementAssignment = {
  acknowledgedAt?: string
  auditEvents: AgreementAuditEvent[]
  assignedAt: string
  assignedBy: string
  assignmentId: string
  documentId: string
  expiresAt: string
  locale: AgreementLocale
  partnerBusinessName: string
  partnerContactName: string
  partnerEmail: string
  partnerId?: string
  publicToken?: string
  publicUrl?: string
  shareEnabled: boolean
  signatureStatus: AgreementSignatureStatus
  signedAt?: string
  status: AgreementAssignmentStatus
  updatedAt: string
  version: string
}

export type CreateAgreementAssignmentInput = {
  assignedBy: string
  documentId: string
  expiresAt?: string
  locale: AgreementLocale
  partnerBusinessName: string
  partnerContactName: string
  partnerEmail: string
  partnerId?: string
  shareEnabled: boolean
  version: string
}

export type ManagedLegalDocumentRecord = {
  category: 'agreement-template' | 'public-legal-page'
  locale: string
  path?: string
  reviewStatus: AgreementReviewStatus
  source: string
  title: string
  version: string
}

const agreementStorageKey = 'casamia_internal_agreements_v1'
const internalAgreementsPath = '/api/internal/agreements'
const partnerAgreementsPath = '/api/partner/agreements'
const publicAgreementsPath = '/api/public/agreements'
const publicAgreementRoute = '/agreement'

const installationPartnerAgreementEsV1: AgreementVersion = {
  changeSummary: [
    'Initial Spanish source agreement for approved installation collaborators.',
    'Includes project assignment, no direct customer payment, quality, insurance, data handling, brand-use, and future digital-signature clauses.',
    'Prepared as an operational legal draft pending Spanish counsel review.',
  ],
  documentId: 'installation-partner-agreement',
  effectiveDate: '2026-07-31',
  exportFileName: 'casamia-acuerdo-colaborador-instalador-es-v1-0-0',
  jurisdiction: 'Spain',
  languageLabel: 'Español',
  locale: 'es',
  reviewStatus: 'pending-legal-review',
  signatureBlocks: [
    'Por CasaMia',
    'Por el colaborador profesional',
  ],
  sourceReferences: [
    {
      label: 'BOE - Ley Orgánica 3/2018 de protección de datos',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673',
    },
    {
      label: 'BOE - Reglamento (UE) 2016/679, RGPD',
      url: 'https://www.boe.es/doue/2016/119/L00001-00088.pdf',
    },
    {
      label: 'BOE - Ley 31/1995 de prevención de riesgos laborales',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1995-24292',
    },
    {
      label: 'BOE - Ley 32/2006 de subcontratación en el sector de la construcción',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-18205',
    },
  ],
  title: 'Acuerdo de colaboración para empresas instaladoras',
  version: '1.0.0',
  sections: [
    {
      id: 'notice',
      title: 'Estado del documento',
      body:
        'Plantilla operativa de CasaMia pendiente de revisión legal española. No debe enviarse como contrato definitivo hasta completar los datos de empresa, condiciones económicas, jurisdicción y revisión profesional.',
    },
    {
      id: 'parties',
      title: '1. Partes',
      body:
        `De una parte, ${casamiaCompanyConfig.legalName}, que opera comercialmente como ${casamiaCompanyConfig.commercialName}, con NIF ${casamiaCompanyConfig.nif} y domicilio social en ${casamiaCompanyConfig.registeredAddress} ("CasaMia"). De otra parte, la empresa instaladora o profesional indicado en la orden de alta o ficha de colaborador ("Colaborador").`,
    },
    {
      id: 'purpose',
      title: '2. Objeto y modelo de colaboración',
      points: [
        'CasaMia evalúa necesidades de seguridad, accesibilidad o adaptación de viviendas y coordina proyectos para clientes finales.',
        'El Colaborador puede recibir encargos concretos para ejecutar trabajos de instalación, ajuste, mantenimiento o entrega técnica dentro de su zona y especialidad.',
        'Cada proyecto requiere una asignación o encargo aceptado por ambas partes, con alcance, dirección, fechas estimadas, precio de proveedor y condiciones específicas.',
      ],
    },
    {
      id: 'independence',
      title: '3. Independencia profesional',
      points: [
        'El Colaborador actúa como empresa o profesional independiente. Este acuerdo no crea relación laboral, agencia, franquicia, sociedad ni representación general.',
        'El Colaborador no puede comprometer a CasaMia, modificar condiciones comerciales frente al cliente ni aceptar trabajos fuera del alcance asignado sin autorización escrita.',
        'La condición de colaborador aprobado significa que CasaMia ha revisado el encaje operativo del proveedor; no equivale a certificación técnica oficial ni a aval público.',
      ],
    },
    {
      id: 'onboarding',
      title: '4. Alta, revisión y mantenimiento de aprobación',
      points: [
        'Antes de recibir proyectos, el Colaborador facilitará datos de empresa, servicios, zonas, contacto operativo, seguro aplicable, referencias o documentación razonablemente solicitada.',
        'CasaMia puede aprobar, pausar o retirar la colaboración si cambian la cobertura, la calidad, la documentación, la disponibilidad o el cumplimiento de los estándares.',
        'El Colaborador notificará cambios relevantes en seguros, licencias, personal clave, situación fiscal, capacidad operativa o incidencias que afecten a proyectos asignados.',
      ],
    },
    {
      id: 'assignment',
      title: '5. Asignación de proyectos',
      points: [
        'CasaMia no garantiza un volumen mínimo de demanda, exclusividad territorial ni continuidad de trabajos.',
        'El Colaborador confirmará disponibilidad, compatibilidad técnica, plazos y cualquier limitación antes de aceptar un encargo.',
        'Si el Colaborador detecta riesgos, mediciones incompletas, incompatibilidades o necesidades fuera del alcance, deberá informar a CasaMia antes de ejecutar cambios.',
      ],
    },
    {
      id: 'scope',
      title: '6. Alcance, cambios y precios',
      points: [
        'El Colaborador ejecutará únicamente el alcance aprobado por CasaMia y documentado en el encargo.',
        'Los trabajos adicionales requieren validación previa de CasaMia y aceptación del cliente cuando proceda.',
        'El Colaborador no solicitará pagos directos al cliente ni negociará condiciones paralelas, salvo autorización expresa por escrito de CasaMia.',
        'Los precios de proveedor, impuestos, gastos, desplazamientos y condiciones de facturación se fijarán en el anexo económico o en cada encargo.',
      ],
    },
    {
      id: 'home-standards',
      title: '7. Trabajo en viviendas habitadas',
      points: [
        'Los trabajos se realizarán con puntualidad, respeto, limpieza razonable y especial cuidado en hogares ocupados por personas mayores o con movilidad reducida.',
        'El Colaborador evitará presión comercial, lenguaje alarmista, venta no autorizada o recomendaciones no relacionadas con el encargo.',
        'El equipo asignado deberá mantener trato digno, comunicar incidencias de forma calmada y dejar la zona segura al finalizar cada visita.',
      ],
    },
    {
      id: 'compliance',
      title: '8. Cumplimiento profesional, prevención y seguros',
      points: [
        'El Colaborador declara que dispone de habilitación, formación, medios, seguros y permisos necesarios para los servicios que acepta.',
        'Cuando un trabajo entre en el ámbito de normativa de construcción, prevención de riesgos, instalaciones eléctricas u otra regulación sectorial, el Colaborador será responsable de cumplir los requisitos aplicables a su actividad.',
        'El Colaborador mantendrá seguros adecuados de responsabilidad civil profesional, daños, personal y cualquier cobertura exigible para los trabajos aceptados.',
      ],
    },
    {
      id: 'handover',
      title: '9. Documentación y entrega',
      points: [
        'El Colaborador facilitará notas de finalización, fotografías cuando proceda, instrucciones de uso, garantías de fabricante disponibles y observaciones sobre defectos o limitaciones.',
        'Ningún defecto material, riesgo de seguridad o trabajo incompleto debe ocultarse para cerrar un proyecto.',
        'CasaMia podrá requerir documentación adicional para resolver incidencias, justificar cambios o atender reclamaciones del cliente.',
      ],
    },
    {
      id: 'customer-relationship',
      title: '10. Relación con el cliente final',
      points: [
        'CasaMia conserva la coordinación principal con el cliente final, salvo indicación distinta en el encargo.',
        'El Colaborador usará la información del cliente solo para ejecutar el proyecto asignado y no para marketing propio, captación directa o contacto no autorizado.',
        'Durante la colaboración y durante 12 meses tras el último proyecto, el Colaborador no intentará desplazar a CasaMia en proyectos originados por CasaMia, salvo autorización escrita.',
      ],
    },
    {
      id: 'data',
      title: '11. Confidencialidad y protección de datos',
      points: [
        'La información de clientes, viviendas, salud, movilidad, fotografías, precios, procesos y materiales de CasaMia será confidencial.',
        'Cuando el Colaborador trate datos personales por cuenta de CasaMia, actuará siguiendo instrucciones documentadas de CasaMia y aplicará medidas razonables de seguridad.',
        'El Colaborador notificará sin demora cualquier pérdida, acceso no autorizado, uso indebido o incidente que afecte a datos de clientes o materiales de CasaMia.',
        'El detalle de roles, encargos de tratamiento, subencargados, conservación y transferencias deberá completarse en un anexo de protección de datos cuando proceda.',
      ],
    },
    {
      id: 'brand',
      title: '12. Marca y materiales de CasaMia',
      points: [
        'El Colaborador solo podrá usar logotipos, textos, sellos o materiales de CasaMia con autorización escrita y siguiendo las guías facilitadas.',
        'El Colaborador podrá describirse como "colaborador aprobado de CasaMia" solo mientras la colaboración esté activa y no suspendida.',
        'El Colaborador no podrá presentarse como empresa certificada por CasaMia, entidad pública, servicio sanitario, franquicia o representante exclusivo salvo autorización expresa.',
      ],
    },
    {
      id: 'quality',
      title: '13. Calidad, incidencias y subsanación',
      points: [
        'Si CasaMia o el cliente comunican una incidencia razonable, el Colaborador cooperará para revisarla, documentarla y subsanarla en un plazo adecuado.',
        'Cuando la incidencia derive de ejecución defectuosa, material incorrecto aportado por el Colaborador o incumplimiento del encargo, el Colaborador asumirá los costes razonables de corrección conforme al acuerdo económico aplicable.',
        'Las responsabilidades frente al cliente final se gestionarán de forma coordinada por CasaMia, sin perjuicio de los derechos de repetición o reclamación entre CasaMia y el Colaborador.',
      ],
    },
    {
      id: 'invoicing',
      title: '14. Facturación y pagos entre las partes',
      points: [
        'El Colaborador facturará a CasaMia según el precio, hitos y documentación acordados para cada encargo.',
        'CasaMia no estará obligada a pagar trabajos no autorizados, duplicados, incompletos o no documentados según el encargo.',
        'Los plazos de pago, retenciones, gastos admisibles e impuestos indirectos se completarán en el anexo económico o en cada orden de trabajo.',
      ],
    },
    {
      id: 'term',
      title: '15. Duración, suspensión y terminación',
      points: [
        'El acuerdo empieza en la fecha de aceptación y continúa hasta que cualquiera de las partes lo termine por escrito.',
        'CasaMia puede suspender nuevas asignaciones de forma inmediata por riesgo de seguridad, reclamaciones relevantes, falta de seguro, uso indebido de marca, pagos directos no autorizados o incumplimiento de datos.',
        'La terminación no afecta a obligaciones pendientes de confidencialidad, protección de datos, documentación, pagos devengados, garantías, incidencias o no captación de clientes originados por CasaMia.',
      ],
    },
    {
      id: 'signature',
      title: '16. Firma digital futura y evidencia',
      points: [
        'CasaMia podrá sustituir la aceptación manual por firma electrónica o proveedor de firma digital.',
        'El sistema de acuerdos conservará versión, idioma, destinatario, token de acceso, eventos de visualización, aceptación, firma y cambios de estado como evidencia operativa.',
        'Hasta activar una integración de firma, cualquier aceptación online será una confirmación de revisión, no una firma electrónica avanzada o cualificada.',
      ],
    },
    {
      id: 'law',
      title: '17. Ley aplicable y jurisdicción',
      body:
        'Este acuerdo se regirá por la legislación española. La jurisdicción competente, reglas de mediación o fuero aplicable deberán completarse tras revisión legal y según el domicilio final de CasaMia y el tipo de colaborador.',
    },
    {
      id: 'signatures',
      title: '18. Firmas',
      points: [
        'Por CasaMia: nombre, cargo, fecha y firma.',
        'Por el Colaborador: razón social, NIF/CIF, representante, cargo, fecha y firma.',
        'Anexos previstos: ficha de colaborador, anexo económico, anexo de tratamiento de datos, estándares de entrega y órdenes de trabajo aceptadas.',
      ],
    },
  ],
}

const installationPartnerAgreementEnV1: AgreementVersion = {
  changeSummary: [
    'Initial English version of the Spanish source agreement for approved installation collaborators.',
    'Covers project assignment, no direct customer payment, quality, insurance, data handling, brand use, and future digital-signature clauses.',
    'Prepared as an operational legal draft pending Spanish counsel review.',
  ],
  documentId: 'installation-partner-agreement',
  effectiveDate: '2026-07-31',
  exportFileName: 'casamia-installation-partner-agreement-en-v1-0-0',
  jurisdiction: 'Spain',
  languageLabel: 'English',
  locale: 'en',
  reviewStatus: 'pending-legal-review',
  signatureBlocks: [
    'For CasaMia',
    'For the professional collaborator',
  ],
  sourceReferences: [
    {
      label: 'BOE - Organic Law 3/2018 on personal data protection',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673',
    },
    {
      label: 'BOE - Regulation (EU) 2016/679, GDPR',
      url: 'https://www.boe.es/doue/2016/119/L00001-00088.pdf',
    },
    {
      label: 'BOE - Law 31/1995 on occupational risk prevention',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1995-24292',
    },
    {
      label: 'BOE - Law 32/2006 on subcontracting in the construction sector',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-18205',
    },
  ],
  title: 'Installation Partner Agreement',
  version: '1.0.0',
  sections: [
    {
      id: 'notice',
      title: 'Document status',
      body:
        'CasaMia operational template pending Spanish legal review. It must not be sent as a final contract until company details, commercial terms, jurisdiction and professional legal review are complete.',
    },
    {
      id: 'parties',
      title: '1. Parties',
      body:
        `On one side, ${casamiaCompanyConfig.legalName}, operating commercially as ${casamiaCompanyConfig.commercialName}, with tax number ${casamiaCompanyConfig.nif} and registered address at ${casamiaCompanyConfig.registeredAddress} ("CasaMia"). On the other side, the installation company or professional identified in the onboarding order or collaborator record ("Collaborator").`,
    },
    {
      id: 'purpose',
      title: '2. Purpose and collaboration model',
      points: [
        'CasaMia assesses safety, accessibility and home-adaptation needs and coordinates projects for end customers.',
        'The Collaborator may receive specific assignments to perform installation, adjustment, maintenance or technical handover work within its territory and specialty.',
        'Each project requires an assignment or work order accepted by both parties, including scope, address, estimated dates, provider price and specific conditions.',
      ],
    },
    {
      id: 'independence',
      title: '3. Professional independence',
      points: [
        'The Collaborator acts as an independent company or professional. This agreement does not create an employment relationship, agency, franchise, partnership or general representation.',
        'The Collaborator may not bind CasaMia, change commercial terms with the customer, or accept work outside the assigned scope without written authorisation.',
        'Approved collaborator status means CasaMia has reviewed the provider for operational fit; it is not an official technical certification or public endorsement.',
      ],
    },
    {
      id: 'onboarding',
      title: '4. Onboarding, review and approval maintenance',
      points: [
        'Before receiving projects, the Collaborator will provide company details, services, coverage areas, operational contacts, applicable insurance, references and any reasonably requested documentation.',
        'CasaMia may approve, pause or remove the collaboration if coverage, quality, documentation, availability or compliance with standards changes.',
        'The Collaborator will notify CasaMia of relevant changes to insurance, licences, key personnel, tax status, operational capacity or incidents affecting assigned projects.',
      ],
    },
    {
      id: 'assignment',
      title: '5. Project assignment',
      points: [
        'CasaMia does not guarantee minimum demand volume, territorial exclusivity or continuity of work.',
        'The Collaborator will confirm availability, technical compatibility, timing and any limitations before accepting an assignment.',
        'If the Collaborator identifies risks, incomplete measurements, incompatibilities or needs outside the scope, it must inform CasaMia before making changes.',
      ],
    },
    {
      id: 'scope',
      title: '6. Scope, changes and pricing',
      points: [
        'The Collaborator will perform only the scope approved by CasaMia and documented in the assignment.',
        'Additional work requires prior validation by CasaMia and customer acceptance where required.',
        'The Collaborator will not request direct customer payments or negotiate parallel terms unless expressly authorised in writing by CasaMia.',
        'Provider prices, taxes, expenses, travel and invoicing terms will be set in the commercial annex or in each assignment.',
      ],
    },
    {
      id: 'home-standards',
      title: '7. Work in occupied homes',
      points: [
        'Work will be performed punctually, respectfully, with reasonable cleanliness and with particular care in homes occupied by older residents or people with reduced mobility.',
        'The Collaborator will avoid sales pressure, alarming language, unauthorised selling or recommendations unrelated to the assignment.',
        'Assigned personnel must maintain dignified communication, report issues calmly and leave the area safe at the end of each visit.',
      ],
    },
    {
      id: 'compliance',
      title: '8. Professional compliance, prevention and insurance',
      points: [
        'The Collaborator declares that it has the authorisations, training, means, insurance and permits necessary for the services it accepts.',
        'Where work falls within construction, occupational risk prevention, electrical installation or other sector regulation, the Collaborator is responsible for meeting the requirements applicable to its activity.',
        'The Collaborator will maintain appropriate professional liability, damage, personnel and any other required insurance coverage for accepted work.',
      ],
    },
    {
      id: 'handover',
      title: '9. Documentation and handover',
      points: [
        'The Collaborator will provide completion notes, photographs where appropriate, user instructions, available manufacturer warranties and observations on defects or limitations.',
        'No material defect, safety risk or incomplete work should be hidden in order to close a project.',
        'CasaMia may request additional documentation to resolve incidents, justify changes or respond to customer claims.',
      ],
    },
    {
      id: 'customer-relationship',
      title: '10. Relationship with the end customer',
      points: [
        'CasaMia retains primary coordination with the end customer unless the assignment states otherwise.',
        'The Collaborator will use customer information only to perform the assigned project and not for its own marketing, direct solicitation or unauthorised contact.',
        'During the collaboration and for 12 months after the last project, the Collaborator will not attempt to displace CasaMia in projects originated by CasaMia unless authorised in writing.',
      ],
    },
    {
      id: 'data',
      title: '11. Confidentiality and data protection',
      points: [
        'Customer, home, health, mobility, photograph, pricing, process and CasaMia material information is confidential.',
        'Where the Collaborator processes personal data on behalf of CasaMia, it will act under CasaMia documented instructions and apply reasonable security measures.',
        'The Collaborator will promptly notify CasaMia of any loss, unauthorised access, misuse or incident affecting customer data or CasaMia materials.',
        'The details of roles, processor arrangements, subprocessors, retention and transfers must be completed in a data-protection annex where applicable.',
      ],
    },
    {
      id: 'brand',
      title: '12. CasaMia brand and materials',
      points: [
        'The Collaborator may use CasaMia logos, text, badges or materials only with written authorisation and in line with the guidelines provided.',
        'The Collaborator may describe itself as an "approved CasaMia collaborator" only while the collaboration is active and not suspended.',
        'The Collaborator may not present itself as certified by CasaMia, a public authority, a healthcare service, a franchise or an exclusive representative unless expressly authorised.',
      ],
    },
    {
      id: 'quality',
      title: '13. Quality, incidents and remediation',
      points: [
        'If CasaMia or the customer reports a reasonable incident, the Collaborator will cooperate to review, document and remedy it within an appropriate timeframe.',
        'Where the incident results from defective execution, incorrect material supplied by the Collaborator or breach of the assignment, the Collaborator will bear reasonable correction costs under the applicable commercial agreement.',
        'Responsibilities toward the end customer will be managed in coordination by CasaMia, without prejudice to recourse or claims between CasaMia and the Collaborator.',
      ],
    },
    {
      id: 'invoicing',
      title: '14. Invoicing and payments between the parties',
      points: [
        'The Collaborator will invoice CasaMia according to the price, milestones and documentation agreed for each assignment.',
        'CasaMia will not be obliged to pay unauthorised, duplicated, incomplete or undocumented work under the assignment.',
        'Payment terms, retentions, eligible expenses and indirect taxes will be completed in the commercial annex or in each work order.',
      ],
    },
    {
      id: 'term',
      title: '15. Term, suspension and termination',
      points: [
        'The agreement begins on the acceptance date and continues until either party terminates it in writing.',
        'CasaMia may suspend new assignments immediately for safety risk, relevant claims, lack of insurance, brand misuse, unauthorised direct payments or data non-compliance.',
        'Termination does not affect pending confidentiality, data protection, documentation, accrued payment, warranty, incident or non-solicitation obligations relating to customers originated by CasaMia.',
      ],
    },
    {
      id: 'signature',
      title: '16. Future digital signature and evidence',
      points: [
        'CasaMia may replace manual acceptance with electronic signature or a digital-signature provider.',
        'The agreement system will retain version, language, recipient, access token, viewing, acceptance, signature and status-change events as operational evidence.',
        'Until a signature integration is activated, any online acceptance is a review confirmation, not an advanced or qualified electronic signature.',
      ],
    },
    {
      id: 'law',
      title: '17. Governing law and jurisdiction',
      body:
        'This agreement will be governed by Spanish law. The competent jurisdiction, mediation rules or applicable venue must be completed after legal review and according to CasaMia final domicile and the type of collaborator.',
    },
    {
      id: 'signatures',
      title: '18. Signatures',
      points: [
        'For CasaMia: name, role, date and signature.',
        'For the Collaborator: legal name, tax number, representative, role, date and signature.',
        'Expected annexes: collaborator record, commercial annex, data-processing annex, handover standards and accepted work orders.',
      ],
    },
  ],
}

export const agreementTemplates: AgreementTemplate[] = [
  {
    activeVersion: installationPartnerAgreementEsV1.version,
    category: 'partner',
    defaultLocale: 'es',
    description:
      'Source agreement for approved installation companies delivering CasaMia projects in Spain.',
    documentId: 'installation-partner-agreement',
    ownerTeam: 'Operations + Legal',
    supportedLocales: ['es', 'en'],
    title: 'Installation Partner Agreement',
    versions: [installationPartnerAgreementEsV1, installationPartnerAgreementEnV1],
  },
]

export const agreementLocaleOptions: Array<{ label: string; locale: AgreementLocale; status: string }> = [
  { label: 'Español', locale: 'es', status: 'Complete source legal draft' },
  { label: 'English', locale: 'en', status: 'Complete legal draft' },
]

export function listAgreementTemplates() {
  return agreementTemplates
}

export function getAgreementTemplate(documentId: string) {
  return agreementTemplates.find((template) => template.documentId === documentId)
}

export function getAgreementVersion(
  documentId: string,
  version: string,
  locale: AgreementLocale,
) {
  const template = getAgreementTemplate(documentId)
  if (!template) return undefined

  return template.versions.find((entry) => entry.version === version && entry.locale === locale)
    ?? template.versions.find((entry) => entry.version === version && entry.locale === template.defaultLocale)
    ?? template.versions.find((entry) => entry.version === template.activeVersion)
}

export function getActiveAgreementVersion(documentId: string, locale: AgreementLocale) {
  const template = getAgreementTemplate(documentId)
  if (!template) return undefined

  return getAgreementVersion(documentId, template.activeVersion, locale)
}

export function listManagedLegalDocuments(locale: AgreementLocale = 'es'): ManagedLegalDocumentRecord[] {
  const agreementRecords = agreementTemplates.flatMap((template) =>
    template.versions.map((version) => ({
      category: 'agreement-template' as const,
      locale: version.locale,
      reviewStatus: version.reviewStatus,
      source: 'agreement-management',
      title: version.title,
      version: version.version,
    })),
  )

  const publicLegalRecords = legalRouteLabels
    .map((route) => {
      const document = getLocalizedLegalDocument(route.id as LegalDocumentId, locale)
      if (!document) return undefined
      const meta = getLegalDocumentMeta(document, locale)

      return {
        category: 'public-legal-page' as const,
        locale: meta.locale,
        path: route.path,
        reviewStatus: document.reviewStatus,
        source: 'public-legal-documents',
        title: document.title,
        version: meta.version,
      }
    })
    .filter(Boolean) as ManagedLegalDocumentRecord[]

  return [...agreementRecords, ...publicLegalRecords]
}

export function createAgreementAssignment(input: CreateAgreementAssignmentInput): AgreementAssignment {
  const now = new Date().toISOString()
  const expiresAt = input.expiresAt || addDaysIso(30)
  const publicToken = input.shareEnabled ? createPublicShareToken() : undefined
  const assignmentId = createAgreementAssignmentId()
  const assignment: AgreementAssignment = {
    assignedAt: now,
    assignedBy: input.assignedBy || 'CasaMia Operations',
    assignmentId,
    auditEvents: [
      createAuditEvent('created', 'system', 'Agreement system', 'Assignment record created.'),
      createAuditEvent('assigned', 'internal', input.assignedBy || 'CasaMia Operations', `Assigned to ${input.partnerBusinessName}.`),
      ...(input.shareEnabled
        ? [createAuditEvent('shared', 'internal', input.assignedBy || 'CasaMia Operations', 'Secure public review link generated.')]
        : []),
    ],
    documentId: input.documentId,
    expiresAt,
    locale: input.locale,
    partnerBusinessName: input.partnerBusinessName,
    partnerContactName: input.partnerContactName,
    partnerEmail: input.partnerEmail,
    partnerId: input.partnerId,
    publicToken,
    publicUrl: publicToken ? buildPublicAgreementUrl(publicToken) : undefined,
    shareEnabled: input.shareEnabled,
    signatureStatus: 'not-started',
    status: input.shareEnabled ? 'sent' : 'draft',
    updatedAt: now,
    version: input.version,
  }

  return assignment
}

export function appendAgreementAuditEvent(
  assignment: AgreementAssignment,
  eventType: AgreementAuditEventType,
  actorType: AgreementAuditEvent['actorType'],
  actor: string,
  details?: string,
): AgreementAssignment {
  return {
    ...assignment,
    auditEvents: [
      createAuditEvent(eventType, actorType, actor, details),
      ...assignment.auditEvents,
    ],
    updatedAt: new Date().toISOString(),
  }
}

export function updateAgreementAssignmentStatus(
  assignment: AgreementAssignment,
  status: AgreementAssignmentStatus,
  actor = 'CasaMia Operations',
) {
  return appendAgreementAuditEvent(
    { ...assignment, status, signatureStatus: status === 'signed' ? 'signed' : assignment.signatureStatus },
    'status-changed',
    'internal',
    actor,
    `Status changed to ${status}.`,
  )
}

export function revokeAgreementShare(assignment: AgreementAssignment, actor = 'CasaMia Operations') {
  return appendAgreementAuditEvent(
    {
      ...assignment,
      publicToken: undefined,
      publicUrl: undefined,
      shareEnabled: false,
      status: assignment.status === 'signed' ? assignment.status : 'revoked',
    },
    'share-revoked',
    'internal',
    actor,
    'Public review link revoked.',
  )
}

export function loadAgreementAssignments() {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(agreementStorageKey)
    return saved ? (JSON.parse(saved) as AgreementAssignment[]) : seedAgreementAssignments()
  } catch {
    return seedAgreementAssignments()
  }
}

export function saveAgreementAssignments(assignments: AgreementAssignment[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(agreementStorageKey, JSON.stringify(assignments))
}

export async function loadAgreementAssignmentsWithFallback() {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    return {
      assignments: loadAgreementAssignments(),
      source: 'local' as const,
    }
  }

  try {
    const response = await requestInternal<{ assignments: AgreementAssignment[] }>(internalAgreementsPath)
    saveAgreementAssignments(response.assignments)
    return { assignments: response.assignments, source: 'backend' as const }
  } catch (error) {
    return {
      assignments: loadAgreementAssignments(),
      error: error instanceof Error ? error.message : 'Agreement assignments could not be loaded.',
      source: 'local' as const,
    }
  }
}

export async function loadPartnerAgreementAssignmentsWithFallback() {
  const partnerEmail = normalizeEmail(getPartnerEmail())

  if (!hasPublicSiteApi() || !hasPartnerBackendSession()) {
    return {
      assignments: loadAgreementAssignments().filter((assignment) =>
        normalizeEmail(assignment.partnerEmail) === partnerEmail,
      ),
      partnerEmail,
      source: 'local' as const,
    }
  }

  try {
    const response = await requestPartner<{ assignments: AgreementAssignment[]; partnerEmail: string }>(partnerAgreementsPath)
    return {
      assignments: response.assignments,
      partnerEmail: response.partnerEmail,
      source: 'backend' as const,
    }
  } catch (error) {
    return {
      assignments: loadAgreementAssignments().filter((assignment) =>
        normalizeEmail(assignment.partnerEmail) === partnerEmail,
      ),
      error: error instanceof Error ? error.message : 'Partner agreements could not be loaded.',
      partnerEmail,
      source: 'local' as const,
    }
  }
}

export async function createAgreementAssignmentWithFallback(input: CreateAgreementAssignmentInput) {
  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    const assignment = createAgreementAssignment(input)
    const assignments = [assignment, ...loadAgreementAssignments()]
    saveAgreementAssignments(assignments)
    return { assignment, assignments, source: 'local' as const }
  }

  try {
    const response = await requestInternal<{ assignment: AgreementAssignment }>(internalAgreementsPath, {
      body: JSON.stringify(input),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const assignments = [response.assignment, ...loadAgreementAssignments()]
    saveAgreementAssignments(dedupeAssignments(assignments))
    return { assignment: response.assignment, assignments: dedupeAssignments(assignments), source: 'backend' as const }
  } catch (error) {
    const assignment = createAgreementAssignment(input)
    const assignments = [assignment, ...loadAgreementAssignments()]
    saveAgreementAssignments(assignments)
    return {
      assignment,
      assignments,
      error: error instanceof Error ? error.message : 'Agreement assignment could not be saved to the backend.',
      source: 'local' as const,
    }
  }
}

export async function updateAgreementAssignmentWithFallback(
  assignmentId: string,
  patch: { status?: AgreementAssignmentStatus; revokeShare?: boolean },
) {
  const local = loadAgreementAssignments()
  const current = local.find((assignment) => assignment.assignmentId === assignmentId)
  if (!current) {
    throw new Error('Agreement assignment not found.')
  }

  if (!hasPublicSiteApi() || !hasInternalBackendSession()) {
    const updated = patch.revokeShare
      ? revokeAgreementShare(current)
      : patch.status
        ? updateAgreementAssignmentStatus(current, patch.status)
        : current
    const assignments = local.map((assignment) =>
      assignment.assignmentId === assignmentId ? updated : assignment,
    )
    saveAgreementAssignments(assignments)
    return { assignment: updated, assignments, source: 'local' as const }
  }

  try {
    const response = await requestInternal<{ assignment: AgreementAssignment }>(internalAgreementsPath, {
      body: JSON.stringify({ assignmentId, ...patch }),
      headers: { 'content-type': 'application/json' },
      method: 'PATCH',
    })
    const assignments = local.map((assignment) =>
      assignment.assignmentId === response.assignment.assignmentId ? response.assignment : assignment,
    )
    saveAgreementAssignments(assignments)
    return { assignment: response.assignment, assignments, source: 'backend' as const }
  } catch (error) {
    const updated = patch.revokeShare
      ? revokeAgreementShare(current)
      : patch.status
        ? updateAgreementAssignmentStatus(current, patch.status)
        : current
    const assignments = local.map((assignment) =>
      assignment.assignmentId === assignmentId ? updated : assignment,
    )
    saveAgreementAssignments(assignments)
    return {
      assignment: updated,
      assignments,
      error: error instanceof Error ? error.message : 'Agreement assignment could not be updated in the backend.',
      source: 'local' as const,
    }
  }
}

export async function loadPublicAgreementAssignment(token: string) {
  try {
    const response = await fetch(`${getPublicSiteApiBaseUrl()}${publicAgreementsPath}/${encodeURIComponent(token)}`, {
      method: 'GET',
    })

    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      return (await response.json()) as AgreementAssignment
    }
  } catch {
    // Local Vite preview does not serve Vercel API routes; fall back to local demo storage below.
  }

  const local = loadAgreementAssignments().find((assignment) => assignment.publicToken === token)
  if (local && local.shareEnabled && !isAgreementExpired(local)) {
    return local
  }

  throw new Error('Agreement link is unavailable.')
}

export async function acknowledgePublicAgreement(token: string, acceptedBy: string) {
  try {
    const response = await fetch(`${getPublicSiteApiBaseUrl()}${publicAgreementsPath}/${encodeURIComponent(token)}/acknowledge`, {
      body: JSON.stringify({ acceptedBy }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })

    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      return (await response.json()) as AgreementAssignment
    }
  } catch {
    // Local Vite preview does not serve Vercel API routes; fall back to local demo storage below.
  }

  const localAssignments = loadAgreementAssignments()
  const current = localAssignments.find((assignment) => assignment.publicToken === token)
  if (!current) {
    throw new Error('Agreement link is unavailable.')
  }
  const updated = appendAgreementAuditEvent(
    {
      ...current,
      acknowledgedAt: new Date().toISOString(),
      signatureStatus: 'provider-review',
      status: 'under-review',
    },
    'acknowledged-public',
    'partner',
    acceptedBy,
    'Partner confirmed document review. This is not a digital signature.',
  )
  const next = localAssignments.map((assignment) =>
    assignment.assignmentId === updated.assignmentId ? updated : assignment,
  )
  saveAgreementAssignments(next)

  return updated
}

export function isAgreementExpired(assignment: AgreementAssignment) {
  return Date.parse(assignment.expiresAt) < Date.now()
}

export function buildAgreementFileBaseName(assignment: AgreementAssignment, version: AgreementVersion) {
  return `${version.exportFileName}-${assignment.assignmentId}`.toLowerCase()
}

export function renderAgreementPlainText(
  assignment: AgreementAssignment,
  version: AgreementVersion,
) {
  const labels = getAgreementExportLabels(version.locale)
  const metadata = [
    version.title,
    `${labels.version}: ${version.version}`,
    `${labels.language}: ${version.languageLabel}`,
    `${labels.reviewStatus}: ${version.reviewStatus}`,
    `${labels.assignment}: ${assignment.assignmentId}`,
    `${labels.partner}: ${assignment.partnerBusinessName}`,
    `${labels.contact}: ${assignment.partnerContactName} <${assignment.partnerEmail}>`,
    `${labels.assigned}: ${formatDate(assignment.assignedAt, version.locale)}`,
    `${labels.expires}: ${formatDate(assignment.expiresAt, version.locale)}`,
    '',
  ]
  const body = version.sections.flatMap((section) => [
    section.title,
    section.body ?? '',
    ...(section.points ?? []).map((point) => `- ${point}`),
    '',
  ])
  const signatures = [
    labels.signatures,
    ...version.signatureBlocks.map((block) => `- ${block}: ________________________________`),
    '',
  ]

  return [...metadata, ...body, ...signatures].join('\n')
}

export function renderAgreementPrintHtml(
  assignment: AgreementAssignment,
  version: AgreementVersion,
) {
  const labels = getAgreementExportLabels(version.locale)

  return `<!doctype html>
<html lang="${version.locale}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(version.title)} - ${escapeHtml(assignment.assignmentId)}</title>
  <style>
    @page { margin: 22mm 18mm; }
    body { color: #172d42; font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.45; }
    h1 { color: #1b5e87; font-family: Georgia, serif; font-size: 24pt; margin: 0 0 8pt; }
    h2 { color: #172d42; font-size: 13pt; margin: 18pt 0 6pt; page-break-after: avoid; }
    p { margin: 0 0 8pt; }
    ul { margin: 0 0 8pt 18pt; padding: 0; }
    li { margin: 0 0 4pt; }
    .meta { border: 1px solid #c8dce8; margin: 14pt 0 18pt; padding: 10pt; }
    .label { color: #65758a; font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .signature { display: grid; gap: 18pt; grid-template-columns: 1fr 1fr; margin-top: 22pt; }
    .line { border-top: 1px solid #172d42; padding-top: 6pt; }
  </style>
</head>
<body>
  <h1>${escapeHtml(version.title)}</h1>
  <div class="meta">
    <p><span class="label">${escapeHtml(labels.version)}</span><br />${escapeHtml(version.version)} · ${escapeHtml(version.languageLabel)} · ${escapeHtml(version.reviewStatus)}</p>
    <p><span class="label">${escapeHtml(labels.assignment)}</span><br />${escapeHtml(assignment.assignmentId)} · ${escapeHtml(assignment.partnerBusinessName)}</p>
    <p><span class="label">${escapeHtml(labels.contact)}</span><br />${escapeHtml(assignment.partnerContactName)} · ${escapeHtml(assignment.partnerEmail)}</p>
  </div>
  ${version.sections.map((section) => renderPrintSection(section)).join('\n')}
  <section>
    <h2>${escapeHtml(labels.signatures)}</h2>
    <div class="signature">
      ${version.signatureBlocks.map((block) => `<p class="line">${escapeHtml(block)}<br />${escapeHtml(labels.date)}:</p>`).join('\n')}
    </div>
  </section>
</body>
</html>`
}

export function printAgreementPdf(assignment: AgreementAssignment, version: AgreementVersion) {
  if (typeof window === 'undefined') return

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720')
  if (!printWindow) {
    throw new Error('The browser blocked the PDF print window.')
  }

  printWindow.document.write(renderAgreementPrintHtml(assignment, version))
  printWindow.document.close()
  printWindow.focus()
  window.setTimeout(() => printWindow.print(), 250)
}

export function downloadAgreementDocx(assignment: AgreementAssignment, version: AgreementVersion) {
  const blob = buildAgreementDocxBlob(assignment, version)
  downloadBlob(blob, `${buildAgreementFileBaseName(assignment, version)}.docx`)
}

export function downloadAgreementText(assignment: AgreementAssignment, version: AgreementVersion) {
  const blob = new Blob([renderAgreementPlainText(assignment, version)], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, `${buildAgreementFileBaseName(assignment, version)}.txt`)
}

export function buildAgreementDocxBlob(assignment: AgreementAssignment, version: AgreementVersion) {
  const files = [
    {
      path: '[Content_Types].xml',
      data: encodeText(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`),
    },
    {
      path: '_rels/.rels',
      data: encodeText(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`),
    },
    {
      path: 'docProps/core.xml',
      data: encodeText(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(version.title)}</dc:title>
  <dc:creator>CasaMia Agreement Management</dc:creator>
  <cp:revision>${escapeXml(version.version)}</cp:revision>
  <dcterms:created xsi:type="dcterms:W3CDTF">${escapeXml(new Date().toISOString())}</dcterms:created>
</cp:coreProperties>`),
    },
    {
      path: 'docProps/app.xml',
      data: encodeText(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>CasaMia</Application>
</Properties>`),
    },
    {
      path: 'word/styles.xml',
      data: encodeText(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="34"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style>
</w:styles>`),
    },
    {
      path: 'word/document.xml',
      data: encodeText(buildDocumentXml(assignment, version)),
    },
  ]

  return new Blob([createStoredZip(files)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

function buildDocumentXml(assignment: AgreementAssignment, version: AgreementVersion) {
  const labels = getAgreementExportLabels(version.locale)
  const paragraphs = [
    paragraph(version.title, 'Heading1'),
    paragraph(`${labels.version} ${version.version} · ${labels.language} ${version.languageLabel} · ${labels.reviewStatus} ${version.reviewStatus}`),
    paragraph(`${labels.assignment} ${assignment.assignmentId} · ${labels.partner} ${assignment.partnerBusinessName}`),
    paragraph(`${labels.contact} ${assignment.partnerContactName} · ${assignment.partnerEmail}`),
    '',
    ...version.sections.flatMap((section) => [
      paragraph(section.title, 'Heading2'),
      section.body ? paragraph(section.body) : '',
      ...(section.points ?? []).map((point) => paragraph(`• ${point}`)),
      '',
    ]),
    paragraph(labels.signatures, 'Heading2'),
    ...version.signatureBlocks.map((block) => paragraph(`${block}: ________________________________    ${labels.date}: ____________`)),
  ].filter(Boolean)

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.join('\n')}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>
  </w:body>
</w:document>`
}

function paragraph(text: string, style?: string) {
  return `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''}<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
}

function renderPrintSection(section: AgreementSection) {
  return `<section>
    <h2>${escapeHtml(section.title)}</h2>
    ${section.body ? `<p>${escapeHtml(section.body)}</p>` : ''}
    ${section.points?.length ? `<ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}
  </section>`
}

function seedAgreementAssignments(): AgreementAssignment[] {
  return []
}

function createAgreementAssignmentId() {
  const compactDate = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const suffix = createRandomIdPart(5)
  return `AGR-${compactDate}-${suffix}`
}

function createAuditEvent(
  eventType: AgreementAuditEventType,
  actorType: AgreementAuditEvent['actorType'],
  actor: string,
  details?: string,
): AgreementAuditEvent {
  return {
    actor,
    actorType,
    at: new Date().toISOString(),
    details,
    eventType,
    id: `evt-${Date.now().toString(36)}-${createRandomIdPart(5).toLowerCase()}`,
  }
}

function createPublicShareToken() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return base64Url(bytes)
  }

  return `${createRandomIdPart(16)}${Date.now().toString(36)}${createRandomIdPart(16)}`
}

function createRandomIdPart(length: number) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, length).toUpperCase()
  }

  return Math.random().toString(36).slice(2, 2 + length).toUpperCase().padEnd(length, '0')
}

function buildPublicAgreementUrl(token: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${publicAgreementRoute}/${token}`
}

function addDaysIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function dedupeAssignments(assignments: AgreementAssignment[]) {
  const seen = new Set<string>()
  return assignments.filter((assignment) => {
    if (seen.has(assignment.assignmentId)) return false
    seen.add(assignment.assignmentId)
    return true
  })
}

async function requestInternal<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...getInternalAuthHeaders(),
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    try {
      const body = (await response.json()) as { message?: string }
      throw new Error(body.message ?? `Agreement API returned ${response.status}.`)
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error(`Agreement API returned ${response.status}.`)
    }
  }

  return response.json() as Promise<T>
}

async function requestPartner<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getPublicSiteApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...getPartnerAuthHeaders(),
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    try {
      const body = (await response.json()) as { message?: string }
      throw new Error(body.message ?? `Partner agreement API returned ${response.status}.`)
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error(`Partner agreement API returned ${response.status}.`)
    }
  }

  return response.json() as Promise<T>
}

function downloadBlob(blob: Blob, fileName: string) {
  if (typeof window === 'undefined') return

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function formatDate(value: string, locale: AgreementLocale = 'es') {
  if (!value) return ''
  const dateLocale = locale === 'en' ? 'en-GB' : 'es-ES'
  return new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function normalizeEmail(value: string | undefined) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function getAgreementExportLabels(locale: AgreementLocale) {
  return locale === 'es'
    ? {
        assigned: 'Asignado',
        assignment: 'Asignación',
        contact: 'Contacto',
        date: 'Fecha',
        expires: 'Caduca',
        language: 'Idioma',
        partner: 'Colaborador',
        reviewStatus: 'Estado de revisión',
        signatures: 'Firmas',
        version: 'Versión',
      }
    : {
        assigned: 'Assigned',
        assignment: 'Assignment',
        contact: 'Contact',
        date: 'Date',
        expires: 'Expires',
        language: 'Language',
        partner: 'Partner',
        reviewStatus: 'Review status',
        signatures: 'Signatures',
        version: 'Version',
      }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeXml(value: string) {
  return escapeHtml(value)
}

function encodeText(value: string) {
  return new TextEncoder().encode(value)
}

function base64Url(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function createStoredZip(files: Array<{ path: string; data: Uint8Array }>) {
  const chunks: Uint8Array[] = []
  const centralDirectory: Uint8Array[] = []
  let offset = 0

  files.forEach((file) => {
    const nameBytes = encodeText(file.path)
    const crc = crc32(file.data)
    const localHeader = new Uint8Array(30 + nameBytes.length)
    const localView = new DataView(localHeader.buffer)
    writeUint32(localView, 0, 0x04034b50)
    writeUint16(localView, 4, 20)
    writeUint16(localView, 6, 0)
    writeUint16(localView, 8, 0)
    writeUint16(localView, 10, 0)
    writeUint16(localView, 12, 0)
    writeUint32(localView, 14, crc)
    writeUint32(localView, 18, file.data.length)
    writeUint32(localView, 22, file.data.length)
    writeUint16(localView, 26, nameBytes.length)
    writeUint16(localView, 28, 0)
    localHeader.set(nameBytes, 30)

    chunks.push(localHeader, file.data)

    const centralHeader = new Uint8Array(46 + nameBytes.length)
    const centralView = new DataView(centralHeader.buffer)
    writeUint32(centralView, 0, 0x02014b50)
    writeUint16(centralView, 4, 20)
    writeUint16(centralView, 6, 20)
    writeUint16(centralView, 8, 0)
    writeUint16(centralView, 10, 0)
    writeUint16(centralView, 12, 0)
    writeUint16(centralView, 14, 0)
    writeUint32(centralView, 16, crc)
    writeUint32(centralView, 20, file.data.length)
    writeUint32(centralView, 24, file.data.length)
    writeUint16(centralView, 28, nameBytes.length)
    writeUint16(centralView, 30, 0)
    writeUint16(centralView, 32, 0)
    writeUint16(centralView, 34, 0)
    writeUint16(centralView, 36, 0)
    writeUint32(centralView, 38, 0)
    writeUint32(centralView, 42, offset)
    centralHeader.set(nameBytes, 46)
    centralDirectory.push(centralHeader)

    offset += localHeader.length + file.data.length
  })

  const centralDirectorySize = centralDirectory.reduce((sum, item) => sum + item.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  writeUint32(endView, 0, 0x06054b50)
  writeUint16(endView, 4, 0)
  writeUint16(endView, 6, 0)
  writeUint16(endView, 8, files.length)
  writeUint16(endView, 10, files.length)
  writeUint32(endView, 12, centralDirectorySize)
  writeUint32(endView, 16, offset)
  writeUint16(endView, 20, 0)

  return concatBytes([...chunks, ...centralDirectory, end])
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true)
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true)
}

const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let index = 0; index < 256; index += 1) {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[index] = value >>> 0
  }
  return table
})()

function crc32(data: Uint8Array) {
  let crc = 0xffffffff
  data.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  })
  return (crc ^ 0xffffffff) >>> 0
}

function concatBytes(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  chunks.forEach((chunk) => {
    output.set(chunk, offset)
    offset += chunk.length
  })
  return output
}
