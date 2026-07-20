import { casamiaCompanyConfig, legalVersionConfig } from '../config/company'

export type LegalDocumentId =
  | 'legal-notice'
  | 'general-customer-terms'
  | 'privacy-policy'
  | 'cookie-policy'
  | 'withdrawal-cancellation'
  | 'guarantees-aftercare'
  | 'complaints-contact'
  | 'accessibility-statement'

export type LegalReviewStatus = 'draft' | 'pending-legal-review' | 'approved' | 'superseded'

export type LegalDocument = {
  id: LegalDocumentId
  title: string
  intro: string
  reviewStatus: LegalReviewStatus
  sections: Array<{
    title: string
    body?: string
    points?: string[]
  }>
}

export const legalRouteLabels: Array<{ id: LegalDocumentId; label: string; path: string }> = [
  { id: 'legal-notice', label: 'Legal Notice', path: '/legal-notice' },
  { id: 'general-customer-terms', label: 'General Customer Terms', path: '/general-customer-terms' },
  { id: 'privacy-policy', label: 'Privacy Policy', path: '/privacy-policy' },
  { id: 'cookie-policy', label: 'Cookie Policy', path: '/cookie-policy' },
  { id: 'withdrawal-cancellation', label: 'Withdrawal and Cancellation Policy', path: '/withdrawal-cancellation' },
  { id: 'guarantees-aftercare', label: 'Guarantees and Aftercare', path: '/guarantees-aftercare' },
  { id: 'complaints-contact', label: 'Complaints and Contact', path: '/complaints-contact' },
  { id: 'accessibility-statement', label: 'Accessibility Statement', path: '/accessibility-statement' },
]

const configPoints = [
  `Legal name: ${casamiaCompanyConfig.legalName}`,
  `Commercial name: ${casamiaCompanyConfig.commercialName}`,
  `NIF: ${casamiaCompanyConfig.nif}`,
  `Registered address: ${casamiaCompanyConfig.registeredAddress}`,
  `Registry details: ${casamiaCompanyConfig.registryDetails}`,
]

const configPointsEs = [
  `Razón social: ${casamiaCompanyConfig.legalName}`,
  `Nombre comercial: ${casamiaCompanyConfig.commercialName}`,
  `NIF: ${casamiaCompanyConfig.nif}`,
  `Domicilio social: ${casamiaCompanyConfig.registeredAddress}`,
  `Datos registrales: ${casamiaCompanyConfig.registryDetails}`,
]

export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  'legal-notice': {
    id: 'legal-notice',
    intro:
      'This notice identifies the operator of the website and records company details that must be completed before production publication.',
    reviewStatus: 'pending-legal-review',
    title: 'Legal Notice',
    sections: [
      {
        title: 'Company identification',
        points: configPoints,
      },
      {
        title: 'Contracting model',
        body:
          'CasaMia is intended to contract directly with customers, collect customer payments, coordinate the project, and appoint vetted local providers as subcontractors where needed.',
      },
      {
        title: 'Legal review required',
        body:
          'This page contains placeholders and must be completed with verified company, registry, tax and contact details before production use.',
      },
    ],
  },
  'general-customer-terms': {
    id: 'general-customer-terms',
    intro:
      'These customer terms summarise the operating model. They are not a substitute for final Spanish legal review of the complete contract set.',
    reviewStatus: 'pending-legal-review',
    title: 'General Customer Terms',
    sections: [
      {
        title: 'Who you contract with',
        body:
          'You contract directly with CasaMia. CasaMia assesses requirements, prepares the proposal, collects payments, coordinates the work and remains responsible for the contracted service.',
      },
      {
        title: 'Local professionals',
        body:
          'CasaMia may appoint a vetted local professional to carry out installation work. The professional acts as CasaMia subcontractor and is not authorised to contract with you or request payment from you.',
      },
      {
        title: 'Payments',
        points: [
          '50% of the total price is payable when confirming the order.',
          'The remaining 50% is payable following successful installation.',
          'The first 50% is a payment on account, not an automatically non-refundable deposit.',
          'Additional work requires a written change order accepted by the customer before the work is performed.',
        ],
      },
      {
        title: 'Successful installation',
        body:
          'Installation is considered successfully completed when the essential agreed work has been completed, the applicable functional and safety checks have been passed, the work area has been left safe and reasonably clean, the customer has received the relevant instructions, and no material defect prevents the safe intended use of the installation.',
      },
      {
        title: 'Statutory rights',
        body:
          'Signing the installation record does not remove your statutory guarantee rights or prevent you from reporting hidden defects.',
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    intro:
      'This privacy policy explains the intended data roles and processing activities. Final controller details, retention periods and processors must be confirmed.',
    reviewStatus: 'pending-legal-review',
    title: 'Privacy Policy',
    sections: [
      {
        title: 'Controller',
        body:
          'CasaMia is normally the data controller for assessment, contracting, installation coordination and aftercare information.',
      },
      {
        title: 'Data used',
        points: [
          'Contact details, installation address and communication preferences.',
          'Assessment notes, room risks, access requirements and selected service details.',
          'Property photographs where the customer provides them.',
          'If the optional voice assistant is used, microphone audio is processed by ElevenLabs to run the conversation. CasaMia may retain the conversation reference and transcript with the assessment, but does not store a separate audio recording in the website.',
          'Accessibility or mobility information needed to assess and deliver the service.',
          'Payment status information from the selected payment provider. CasaMia must not store complete card numbers or CVV.',
        ],
      },
      {
        title: 'Sharing with providers',
        body:
          'Assigned providers should receive only the information necessary for the assigned project and must not use it for their own commercial purposes.',
      },
      {
        title: 'Optional AI voice assistant',
        body:
          'The Home Safety Wizard can connect you to a clearly identified AI voice assistant supplied by ElevenLabs. Starting a conversation is optional and requires microphone permission. Audio is sent securely to ElevenLabs for live speech processing, and you can end the conversation at any time. You can use the written note instead.',
      },
      {
        title: 'Privacy contact',
        body: `Privacy contact: ${casamiaCompanyConfig.privacyEmail}.`,
      },
    ],
  },
  'cookie-policy': {
    id: 'cookie-policy',
    intro:
      'This cookie policy records the expected consent approach. Non-essential cookies must stay disabled until consent.',
    reviewStatus: 'pending-legal-review',
    title: 'Cookie Policy',
    sections: [
      {
        title: 'Choice',
        points: [
          'Cookie controls should provide equally prominent Accept all, Reject all and Configure options.',
          'Rejecting non-essential cookies must not be harder than accepting them.',
          'Language preference storage must not require marketing-cookie consent.',
        ],
      },
      {
        title: 'Current implementation note',
        body:
          'A complete cookie banner and preference centre must be validated before production if analytics or advertising cookies are enabled.',
      },
    ],
  },
  'withdrawal-cancellation': {
    id: 'withdrawal-cancellation',
    intro:
      'This page explains withdrawal and cancellation principles for eligible distance and off-premises contracts.',
    reviewStatus: 'pending-legal-review',
    title: 'Withdrawal and Cancellation Policy',
    sections: [
      {
        title: 'Withdrawal period',
        points: [
          'Eligible distance and off-premises contracts generally have a 14-day withdrawal right.',
          'A 30-day period may apply to contracts resulting from unsolicited home visits or promotional excursions.',
          'CasaMia policy should prohibit unsolicited pressure selling at the home.',
        ],
      },
      {
        title: 'Early start',
        body:
          'If the customer expressly asks CasaMia to start services during the withdrawal period, the customer may have to pay a proportionate amount for validly requested work already performed if they later withdraw.',
      },
      {
        title: 'Personalised goods',
        body:
          'Exceptions for clearly personalised goods may apply only to genuinely customised items explained before contracting.',
      },
      {
        title: 'How to withdraw',
        body: `Use the public withdrawal form at /withdrawal-form, contact customer service at ${casamiaCompanyConfig.customerServiceEmail}, or write by post to ${casamiaCompanyConfig.registeredAddress}. Backend receipt must be configured before online submission is treated as durable legal receipt.`,
      },
    ],
  },
  'guarantees-aftercare': {
    id: 'guarantees-aftercare',
    intro:
      'This page explains how product, installation and workmanship issues should be handled after installation.',
    reviewStatus: 'pending-legal-review',
    title: 'Guarantees and Aftercare',
    sections: [
      {
        title: 'CasaMia remains your point of contact',
        body:
          'CasaMia remains your point of contact for product, installation and workmanship issues. We will not require you to pursue the subcontractor or manufacturer before CasaMia reviews your claim.',
      },
      {
        title: 'Rights and guarantees',
        points: [
          'Statutory product-conformity rights are mandatory rights and are not optional benefits.',
          'CasaMia remains responsible for installation included in its contract with the customer.',
          `Additional workmanship guarantee period: ${casamiaCompanyConfig.workmanshipGuaranteePeriod}.`,
        ],
      },
      {
        title: 'Dangerous defects',
        body:
          'If an installation appears loose, unstable, electrically unsafe or otherwise dangerous, stop using it and contact CasaMia immediately. In an emergency, call 112.',
      },
    ],
  },
  'complaints-contact': {
    id: 'complaints-contact',
    intro:
      'Use this page for service issues, safety concerns, complaints and aftercare questions.',
    reviewStatus: 'pending-legal-review',
    title: 'Complaints and Contact',
    sections: [
      {
        title: 'Customer service',
        points: [
          `Telephone: ${casamiaCompanyConfig.customerServicePhone}`,
          `Email: ${casamiaCompanyConfig.customerServiceEmail}`,
          `Hours: ${casamiaCompanyConfig.customerServiceHours}`,
          `Postal complaints address: ${casamiaCompanyConfig.complaintsAddress}`,
        ],
      },
      {
        title: 'What to include',
        points: [
          'Project reference or order number.',
          'Customer name and installation address.',
          'Description of the issue and when it appeared.',
          'Photos or documents where useful.',
          'Whether there is any immediate safety risk.',
        ],
      },
      {
        title: 'Safety escalation',
        body:
          'If an installation appears loose, unstable, electrically unsafe or otherwise dangerous, stop using it and contact CasaMia immediately. In an emergency, call 112.',
      },
      {
        title: 'Dispute resolution',
        body: `Alternative dispute-resolution status: ${casamiaCompanyConfig.adrEntityOrStatus}. Administrative and court rights remain available.`,
      },
    ],
  },
  'accessibility-statement': {
    id: 'accessibility-statement',
    intro:
      'CasaMia serves senior customers and families, so accessibility is treated as a core service requirement.',
    reviewStatus: 'pending-legal-review',
    title: 'Accessibility Statement',
    sections: [
      {
        title: 'Current commitment',
        points: [
          'Use plain language for important legal, payment and safety information.',
          'Support keyboard navigation and visible focus states.',
          'Use readable text sizes and sufficient contrast.',
          'Avoid countdown timers, pressure tactics and information conveyed only by colour.',
          'Provide telephone-assisted contracting where needed.',
        ],
      },
      {
        title: 'Feedback',
        body: `Accessibility feedback can be sent to ${casamiaCompanyConfig.customerServiceEmail}.`,
      },
    ],
  },
}

const legalDocumentsEs: Record<LegalDocumentId, Pick<LegalDocument, 'title' | 'intro' | 'sections'>> = {
  'legal-notice': {
    title: 'Aviso legal',
    intro:
      'Este aviso identifica al operador del sitio web y recoge los datos de la empresa que deben completarse antes de la publicación en producción.',
    sections: [
      {
        title: 'Identificación de la empresa',
        points: configPointsEs,
      },
      {
        title: 'Modelo de contratación',
        body:
          'CasaMia está pensada para contratar directamente con los clientes, recibir los pagos, coordinar el proyecto y designar proveedores locales validados como subcontratistas cuando sea necesario.',
      },
      {
        title: 'Revisión legal pendiente',
        body:
          'Esta página contiene información de configuración y debe completarse con datos societarios, registrales, fiscales y de contacto verificados antes de su uso en producción.',
      },
    ],
  },
  'general-customer-terms': {
    title: 'Condiciones generales para clientes',
    intro:
      'Estas condiciones resumen el modelo operativo para clientes. No sustituyen la revisión legal española final del conjunto contractual completo.',
    sections: [
      {
        title: 'Con quién contratas',
        body:
          'Contratas directamente con CasaMia. CasaMia evalúa las necesidades, prepara la propuesta, cobra los pagos, coordina los trabajos y sigue siendo responsable del servicio contratado.',
      },
      {
        title: 'Profesionales locales',
        body:
          'CasaMia puede designar a un profesional local validado para realizar trabajos de instalación. El profesional actúa como subcontratista de CasaMia y no está autorizado a contratar contigo ni a solicitarte pagos.',
      },
      {
        title: 'Pagos',
        points: [
          'El 50% del precio total se paga al confirmar el pedido.',
          'El 50% restante se paga tras una instalación satisfactoria.',
          'El primer 50% es un pago a cuenta, no un depósito automáticamente no reembolsable.',
          'Cualquier trabajo adicional requiere una orden de cambio por escrito aceptada por el cliente antes de ejecutarse.',
        ],
      },
      {
        title: 'Instalación satisfactoria',
        body:
          'La instalación se considera completada satisfactoriamente cuando se han realizado los trabajos esenciales acordados, se han superado las comprobaciones funcionales y de seguridad aplicables, la zona de trabajo queda segura y razonablemente limpia, el cliente ha recibido las instrucciones pertinentes y no existe ningún defecto material que impida el uso seguro previsto.',
      },
      {
        title: 'Derechos legales',
        body:
          'Firmar el registro de instalación no elimina tus derechos legales de garantía ni te impide comunicar defectos ocultos.',
      },
    ],
  },
  'privacy-policy': {
    title: 'Política de privacidad',
    intro:
      'Esta política de privacidad explica los roles de datos y las actividades de tratamiento previstas. Deben confirmarse los datos finales del responsable, los plazos de conservación y los encargados.',
    sections: [
      {
        title: 'Responsable',
        body:
          'CasaMia actúa normalmente como responsable del tratamiento para la evaluación, contratación, coordinación de instalaciones y atención posterior.',
      },
      {
        title: 'Datos utilizados',
        points: [
          'Datos de contacto, dirección de instalación y preferencias de comunicación.',
          'Notas de evaluación, riesgos por estancia, necesidades de acceso y detalles del servicio seleccionado.',
          'Fotografías de la vivienda cuando el cliente las facilita.',
          'Si se utiliza el asistente de voz opcional, el audio del micrófono es tratado por ElevenLabs para ejecutar la conversación. CasaMia puede conservar la referencia y la transcripción de la conversación junto con la evaluación, pero no almacena una grabación de audio independiente en el sitio web.',
          'Información de accesibilidad o movilidad necesaria para evaluar y prestar el servicio.',
          'Información sobre el estado de pago del proveedor de pagos seleccionado. CasaMia no debe almacenar números completos de tarjeta ni CVV.',
        ],
      },
      {
        title: 'Compartición con proveedores',
        body:
          'Los proveedores asignados deben recibir solo la información necesaria para el proyecto asignado y no pueden usarla para sus propios fines comerciales.',
      },
      {
        title: 'Asistente de voz IA opcional',
        body:
          'El asistente de seguridad del hogar puede conectarte con un asistente de voz IA claramente identificado y suministrado por ElevenLabs. Iniciar una conversación es opcional y requiere permiso de micrófono. El audio se envía de forma segura a ElevenLabs para el procesamiento de voz en directo, y puedes finalizar la conversación en cualquier momento. También puedes usar la nota escrita.',
      },
      {
        title: 'Contacto de privacidad',
        body: `Contacto de privacidad: ${casamiaCompanyConfig.privacyEmail}.`,
      },
    ],
  },
  'cookie-policy': {
    title: 'Política de cookies',
    intro:
      'Esta política de cookies recoge el enfoque previsto de consentimiento. Las cookies no esenciales deben permanecer desactivadas hasta que exista consentimiento.',
    sections: [
      {
        title: 'Elección',
        points: [
          'Los controles de cookies deben ofrecer opciones igualmente visibles para aceptar todo, rechazar todo y configurar.',
          'Rechazar cookies no esenciales no debe ser más difícil que aceptarlas.',
          'Guardar la preferencia de idioma no debe requerir consentimiento de cookies de marketing.',
        ],
      },
      {
        title: 'Nota de implementación actual',
        body:
          'El banner de cookies y el centro de preferencias completos deben validarse antes de producción si se activan cookies analíticas o publicitarias.',
      },
    ],
  },
  'withdrawal-cancellation': {
    title: 'Desistimiento y cancelación',
    intro:
      'Esta página explica los principios de desistimiento y cancelación para contratos a distancia y fuera de establecimiento cuando sean aplicables.',
    sections: [
      {
        title: 'Plazo de desistimiento',
        points: [
          'Los contratos a distancia y fuera de establecimiento elegibles suelen tener un derecho de desistimiento de 14 días.',
          'Puede aplicarse un plazo de 30 días a contratos derivados de visitas no solicitadas al domicilio o excursiones promocionales.',
          'La política de CasaMia debe prohibir la venta domiciliaria no solicitada y bajo presión.',
        ],
      },
      {
        title: 'Inicio anticipado',
        body:
          'Si el cliente solicita expresamente a CasaMia que inicie servicios durante el plazo de desistimiento, puede tener que pagar una cantidad proporcional por el trabajo válidamente solicitado y ya realizado si después desiste.',
      },
      {
        title: 'Bienes personalizados',
        body:
          'Las excepciones para bienes claramente personalizados solo pueden aplicarse a artículos realmente hechos a medida y explicados antes de contratar.',
      },
      {
        title: 'Cómo desistir',
        body: `Usa el formulario público en /withdrawal-form, contacta con atención al cliente en ${casamiaCompanyConfig.customerServiceEmail}, o escribe por correo postal a ${casamiaCompanyConfig.registeredAddress}. La recepción backend debe estar configurada antes de tratar el envío online como recepción legal duradera.`,
      },
    ],
  },
  'guarantees-aftercare': {
    title: 'Garantías y servicio posventa',
    intro:
      'Esta página explica cómo deben gestionarse las incidencias de producto, instalación y mano de obra después de la instalación.',
    sections: [
      {
        title: 'CasaMia sigue siendo tu punto de contacto',
        body:
          'CasaMia sigue siendo tu punto de contacto para incidencias de producto, instalación y mano de obra. No te exigiremos reclamar al subcontratista o fabricante antes de que CasaMia revise tu caso.',
      },
      {
        title: 'Derechos y garantías',
        points: [
          'Los derechos legales de conformidad del producto son obligatorios y no son beneficios opcionales.',
          'CasaMia sigue siendo responsable de la instalación incluida en su contrato con el cliente.',
          `Periodo adicional de garantía de mano de obra: ${casamiaCompanyConfig.workmanshipGuaranteePeriod}.`,
        ],
      },
      {
        title: 'Defectos peligrosos',
        body:
          'Si una instalación parece suelta, inestable, eléctricamente insegura o peligrosa de cualquier otro modo, deja de usarla y contacta con CasaMia inmediatamente. En caso de emergencia, llama al 112.',
      },
    ],
  },
  'complaints-contact': {
    title: 'Reclamaciones y contacto',
    intro:
      'Usa esta página para incidencias de servicio, preocupaciones de seguridad, reclamaciones y preguntas de atención posterior.',
    sections: [
      {
        title: 'Atención al cliente',
        points: [
          `Teléfono: ${casamiaCompanyConfig.customerServicePhone}`,
          `Email: ${casamiaCompanyConfig.customerServiceEmail}`,
          `Horario: ${casamiaCompanyConfig.customerServiceHours}`,
          `Dirección postal para reclamaciones: ${casamiaCompanyConfig.complaintsAddress}`,
        ],
      },
      {
        title: 'Qué incluir',
        points: [
          'Referencia del proyecto o número de pedido.',
          'Nombre del cliente y dirección de instalación.',
          'Descripción de la incidencia y cuándo apareció.',
          'Fotos o documentos cuando sean útiles.',
          'Si existe algún riesgo de seguridad inmediato.',
        ],
      },
      {
        title: 'Escalada de seguridad',
        body:
          'Si una instalación parece suelta, inestable, eléctricamente insegura o peligrosa de cualquier otro modo, deja de usarla y contacta con CasaMia inmediatamente. En caso de emergencia, llama al 112.',
      },
      {
        title: 'Resolución de disputas',
        body: `Estado de resolución alternativa de conflictos: ${casamiaCompanyConfig.adrEntityOrStatus}. Los derechos administrativos y judiciales siguen disponibles.`,
      },
    ],
  },
  'accessibility-statement': {
    title: 'Declaración de accesibilidad',
    intro:
      'CasaMia atiende a personas mayores y familias, por lo que la accesibilidad se considera un requisito central del servicio.',
    sections: [
      {
        title: 'Compromiso actual',
        points: [
          'Usar lenguaje claro para información legal, de pago y de seguridad importante.',
          'Permitir navegación con teclado y estados de foco visibles.',
          'Usar tamaños de texto legibles y contraste suficiente.',
          'Evitar temporizadores de presión, tácticas de urgencia e información transmitida solo por color.',
          'Ofrecer contratación asistida por teléfono cuando sea necesario.',
        ],
      },
      {
        title: 'Comentarios',
        body: `Puedes enviar comentarios de accesibilidad a ${casamiaCompanyConfig.customerServiceEmail}.`,
      },
    ],
  },
}

export function getLocalizedLegalDocument(documentId: LegalDocumentId, language: string): LegalDocument | undefined {
  const document = legalDocuments[documentId]

  if (!document) return undefined

  if (!language.toLowerCase().startsWith('es')) {
    return document
  }

  return {
    ...document,
    ...legalDocumentsEs[documentId],
  }
}

export function getLegalRouteLabels(language: string) {
  return legalRouteLabels.map((link) => ({
    ...link,
    label: language.toLowerCase().startsWith('es') ? legalDocumentsEs[link.id].title : link.label,
  }))
}

export function getLegalDocumentMeta(document: LegalDocument, language = 'en') {
  const isSpanish = language.toLowerCase().startsWith('es')

  return {
    document: document.id,
    effectiveDate: legalVersionConfig.effectiveDate,
    locale: isSpanish ? 'es' : 'en',
    reviewStatus: document.reviewStatus,
    sourceLocale: legalVersionConfig.sourceLocale,
    sourceVersion: legalVersionConfig.sourceVersion,
    version: legalVersionConfig.version,
  }
}
