import { casamiaCompanyConfig, legalVersionConfig } from '../config/company.ts'
import { applyCommercialCopy } from '../services/commercialCopy.ts'
import type { CommercialSettings } from '../types/serviceCatalogue.ts'

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
    links?: Array<{
      label: string
      path: string
    }>
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
  casamiaCompanyConfig.registryDetails ? `Registry details: ${casamiaCompanyConfig.registryDetails}` : '',
  `Telephone: ${casamiaCompanyConfig.customerServicePhone}`,
  `Email: ${casamiaCompanyConfig.customerServiceEmail}`,
].filter(Boolean)

const configPointsEs = [
  `Razón social: ${casamiaCompanyConfig.legalName}`,
  `Nombre comercial: ${casamiaCompanyConfig.commercialName}`,
  `NIF: ${casamiaCompanyConfig.nif}`,
  `Domicilio social: ${casamiaCompanyConfig.registeredAddress}`,
  casamiaCompanyConfig.registryDetails ? `Datos registrales: ${casamiaCompanyConfig.registryDetails}` : '',
  `Teléfono: ${casamiaCompanyConfig.customerServicePhone}`,
  `Correo electrónico: ${casamiaCompanyConfig.customerServiceEmail}`,
].filter(Boolean)

export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  'legal-notice': {
    id: 'legal-notice',
    intro:
      'Who runs CasaMia, what this website is for, and where to find the service terms that apply before you book or buy.',
    reviewStatus: 'pending-legal-review',
    title: 'Legal Notice',
    sections: [
      {
        title: 'Company identification',
        points: configPoints,
      },
      {
        title: 'Website purpose',
        body:
          'CasaMia helps people review home-safety needs, plan practical adaptations, arrange installation support, consider connected safety options and understand possible public-grant routes. Website information is general. Your confirmed scope, price and timing are set out in your proposal or contract.',
      },
      {
        title: 'Contracting model',
        points: [
          `Customers contract directly with ${casamiaCompanyConfig.legalName}, trading as CasaMia.`,
          'CasaMia assesses the customer’s requirements, prepares and issues the proposal, invoices and collects payments, coordinates the work and remains the customer’s contractual point of contact for the agreed service.',
          'CasaMia may appoint vetted independent local professionals to perform installation work as subcontractors. Their involvement does not replace CasaMia as the customer’s contracting party.',
          'Subcontractors are not authorised to enter into a separate contract with the customer, request direct payment or agree chargeable changes to the scope on CasaMia’s behalf.',
          'Any additional work or price change must be recorded in a written change order and accepted by the customer before that work is carried out.',
          'The specific scope, price, payment schedule, estimated timing and any commercial guarantees are set out in the customer’s proposal and contract documents. Mandatory consumer rights remain unaffected.',
        ],
      },
      {
        title: 'Customer information and service terms',
        body:
          'Use these pages when you want the detail behind booking, payment, cancellation, guarantees, privacy or complaints:',
        links: [
          { label: 'General Customer Terms', path: '/general-customer-terms' },
          { label: 'Withdrawal and Cancellation Policy', path: '/withdrawal-cancellation' },
          { label: 'Guarantees and Aftercare', path: '/guarantees-aftercare' },
          { label: 'Privacy Policy', path: '/privacy-policy' },
          { label: 'Complaints and Contact', path: '/complaints-contact' },
        ],
      },
      {
        title: 'Use of the website',
        body:
          'Users must access and use the website lawfully and must not interfere with its security, availability or operation. CasaMia may update, suspend or withdraw website content where reasonably necessary.',
      },
      {
        title: 'Intellectual property',
        body:
          'The CasaMia brand, website design, text, images and other original content are protected by applicable intellectual-property laws. They may not be reproduced, distributed or used commercially without prior written permission, except where permitted by law.',
      },
      {
        title: 'Responsibility and external links',
        body:
          'CasaMia works to keep website information accurate and available, but external grants, laws, services and third-party websites can change. Links are provided to help you check the source; those websites have their own terms and privacy policies.',
      },
      {
        title: 'Applicable law',
        body:
          'This website is governed by Spanish law. Any dispute will be handled by the competent courts determined under applicable law, without limiting the mandatory rights of consumers and users.',
      },
    ],
  },
  'general-customer-terms': {
    id: 'general-customer-terms',
    intro:
      'A plain-English summary of how CasaMia bookings, payments, local professionals, changes and completion work.',
    reviewStatus: 'pending-legal-review',
    title: 'General Customer Terms',
    sections: [
      {
        title: 'Who you contract with',
        body:
          'You contract directly with CasaMia. We review the requirement, prepare the proposal, collect payments, coordinate the work and remain responsible for the contracted service.',
      },
      {
        title: 'Local professionals',
        body:
          'CasaMia may appoint a vetted local professional to carry out installation work. The professional acts as CasaMia subcontractor and is not authorised to contract with you or request payment from you.',
      },
      {
        title: 'Payments',
        points: [
          'The home visit costs {{visitFee}} including {{visitVatPercent}} VAT and is paid in advance before the visit is confirmed.',
          'The {{visitFee}} visit fee is credited toward the CasaMia project if the customer proceeds with approved work.',
          '{{proposalUpfrontPercent}} of the total price is payable when confirming the order.',
          'The remaining {{proposalBalancePercent}} is payable following successful installation.',
          'The first {{proposalUpfrontPercent}} is a payment on account, not an automatically non-refundable deposit.',
          'Additional work requires a written change order accepted by the customer before the work is performed.',
        ],
      },
      {
        title: 'Before work changes',
        body:
          'If the home needs something different from the agreed scope, we explain the change, price and timing before chargeable work continues. A local installer cannot add paid work on the spot without CasaMia and customer approval.',
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
      'What information CasaMia uses to review the home, prepare a proposal, coordinate work and provide aftercare.',
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
        title: 'Why we use it',
        points: [
          'To understand the rooms, routines and safety priorities you ask us to review.',
          'To prepare recommendations, proposals, visit notes, installation plans and aftercare records.',
          'To contact you about bookings, reports, quotes, payments, changes, complaints or safety follow-up.',
        ],
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
      'How CasaMia uses essential site storage and how you control optional cookies such as analytics or marketing cookies.',
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
          'If analytics or advertising cookies are enabled, the banner and preference centre must let you accept, reject or change those choices clearly.',
      },
    ],
  },
  'withdrawal-cancellation': {
    id: 'withdrawal-cancellation',
    intro:
      'When you may be able to cancel, how to withdraw, and what can happen if you ask CasaMia to start during the withdrawal period.',
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
        body: `Use the public withdrawal form at /withdrawal-form, email ${casamiaCompanyConfig.customerServiceEmail}, or write by post to ${casamiaCompanyConfig.registeredAddress}. Keep a copy of what you send and the date sent.`,
      },
    ],
  },
  'guarantees-aftercare': {
    id: 'guarantees-aftercare',
    intro:
      'What to do if something feels wrong after installation, and how CasaMia handles product, installation and workmanship issues.',
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
          ...(casamiaCompanyConfig.workmanshipGuaranteePeriod
            ? [`Additional workmanship guarantee period: ${casamiaCompanyConfig.workmanshipGuaranteePeriod}.`]
            : ['Any additional commercial workmanship guarantee will be stated in the customer proposal.']),
        ],
      },
      {
        title: 'Dangerous defects',
        body:
          'If an installation appears loose, unstable, electrically unsafe or otherwise dangerous, stop using it and contact CasaMia immediately. If there is an immediate danger, call 112.',
      },
    ],
  },
  'complaints-contact': {
    id: 'complaints-contact',
    intro:
      'How to contact CasaMia about a service issue, safety concern, complaint or aftercare question.',
    reviewStatus: 'pending-legal-review',
    title: 'Complaints and Contact',
    sections: [
      {
        title: 'Customer service',
        points: [
          ...(casamiaCompanyConfig.customerServicePhone ? [`Telephone: ${casamiaCompanyConfig.customerServicePhone}`] : []),
          `Email: ${casamiaCompanyConfig.customerServiceEmail}`,
          ...(casamiaCompanyConfig.customerServiceHours ? [`Hours: ${casamiaCompanyConfig.customerServiceHours}`] : []),
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
        title: 'What happens next',
        body:
          'CasaMia reviews the issue, checks whether there is an immediate safety concern, and confirms the next practical step. That may be a support reply, a document check, a photo review, a provider follow-up or an inspection where needed.',
      },
      {
        title: 'Safety escalation',
        body:
          'If an installation appears loose, unstable, electrically unsafe or otherwise dangerous, stop using it and contact CasaMia immediately. In an emergency, call 112.',
      },
      {
        title: 'Dispute resolution',
        body: casamiaCompanyConfig.adrEntityOrStatus
          ? `Alternative dispute-resolution status: ${casamiaCompanyConfig.adrEntityOrStatus}. Administrative and court rights remain available.`
          : 'You may use the consumer complaint and dispute-resolution channels available under Spanish law. Administrative and court rights remain available.',
      },
    ],
  },
  'accessibility-statement': {
    id: 'accessibility-statement',
    intro:
      'CasaMia is designed for people who may need clearer text, assisted booking, keyboard access or a more comfortable way to complete a home-safety review.',
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
      'Quién gestiona CasaMia, para qué sirve este sitio web y dónde encontrar las condiciones aplicables antes de reservar o contratar.',
    sections: [
      {
        title: 'Identificación de la empresa',
        points: configPointsEs,
      },
      {
        title: 'Finalidad del sitio web',
        body:
          'CasaMia ayuda a revisar necesidades de seguridad en casa, planificar adaptaciones prácticas, organizar apoyo de instalación, valorar opciones de seguridad conectada y entender posibles vías de ayudas públicas. La información del sitio es general. El alcance, precio y plazo confirmados aparecen en tu propuesta o contrato.',
      },
      {
        title: 'Modelo de contratación',
        points: [
          `Los clientes contratan directamente con ${casamiaCompanyConfig.legalName}, que opera bajo el nombre comercial CasaMia.`,
          'CasaMia evalúa las necesidades del cliente, prepara y emite la propuesta, factura y cobra los pagos, coordina los trabajos y sigue siendo el interlocutor contractual del cliente para el servicio acordado.',
          'CasaMia puede designar a profesionales locales independientes y previamente validados para realizar los trabajos de instalación como subcontratistas. Su intervención no sustituye a CasaMia como parte contratante del cliente.',
          'Los subcontratistas no están autorizados a celebrar un contrato separado con el cliente, solicitar pagos directos ni acordar en nombre de CasaMia cambios de alcance que generen un coste.',
          'Cualquier trabajo adicional o cambio de precio debe constar en una orden de cambio escrita y ser aceptado por el cliente antes de su ejecución.',
          'El alcance concreto, el precio, el calendario de pagos, los plazos estimados y cualquier garantía comercial se detallan en la propuesta y la documentación contractual del cliente. Los derechos imperativos de consumidores y usuarios no se ven afectados.',
        ],
      },
      {
        title: 'Información y condiciones del servicio',
        body:
          'Usa estas páginas cuando quieras ver el detalle sobre reserva, pago, cancelación, garantías, privacidad o reclamaciones:',
        links: [
          { label: 'Condiciones generales para clientes', path: '/general-customer-terms' },
          { label: 'Desistimiento y cancelación', path: '/withdrawal-cancellation' },
          { label: 'Garantías y servicio posventa', path: '/guarantees-aftercare' },
          { label: 'Política de privacidad', path: '/privacy-policy' },
          { label: 'Reclamaciones y contacto', path: '/complaints-contact' },
        ],
      },
      {
        title: 'Uso del sitio web',
        body:
          'Las personas usuarias deben acceder y utilizar el sitio de forma lícita y no deben interferir con su seguridad, disponibilidad o funcionamiento. CasaMia puede actualizar, suspender o retirar contenidos cuando sea razonablemente necesario.',
      },
      {
        title: 'Propiedad intelectual',
        body:
          'La marca CasaMia, el diseño del sitio web, los textos, las imágenes y demás contenidos originales están protegidos por la normativa aplicable de propiedad intelectual. No pueden reproducirse, distribuirse ni utilizarse comercialmente sin autorización previa por escrito, salvo cuando la ley lo permita.',
      },
      {
        title: 'Responsabilidad y enlaces externos',
        body:
          'CasaMia procura mantener la información del sitio correcta y disponible, pero las ayudas, normas, servicios y páginas de terceros pueden cambiar. Los enlaces ayudan a consultar la fuente; esas páginas tienen sus propias condiciones y políticas de privacidad.',
      },
      {
        title: 'Legislación aplicable',
        body:
          'Este sitio web se rige por la legislación española. Cualquier controversia será conocida por los juzgados y tribunales competentes conforme a la normativa aplicable, sin limitar los derechos imperativos de consumidores y usuarios.',
      },
    ],
  },
  'general-customer-terms': {
    title: 'Condiciones generales para clientes',
    intro:
      'Un resumen claro de cómo funcionan las reservas, pagos, profesionales locales, cambios y finalización del servicio CasaMia.',
    sections: [
      {
        title: 'Con quién contratas',
        body:
          'Contratas directamente con CasaMia. Revisamos la necesidad, preparamos la propuesta, cobramos los pagos, coordinamos los trabajos y seguimos siendo responsables del servicio contratado.',
      },
      {
        title: 'Profesionales locales',
        body:
          'CasaMia puede designar a un profesional local validado para realizar trabajos de instalación. El profesional actúa como subcontratista de CasaMia y no está autorizado a contratar contigo ni a solicitarte pagos.',
      },
      {
        title: 'Pagos',
        points: [
          'La visita a domicilio cuesta {{visitFee}} con el {{visitVatPercent}} de IVA incluido y se paga por adelantado antes de confirmar la visita.',
          'Los {{visitFee}} de la visita se descuentan del proyecto CasaMia si el cliente continúa con los trabajos aprobados.',
          'El {{proposalUpfrontPercent}} del precio total se paga al confirmar el pedido.',
          'El {{proposalBalancePercent}} restante se paga tras una instalación satisfactoria.',
          'El primer {{proposalUpfrontPercent}} es un pago a cuenta, no un depósito automáticamente no reembolsable.',
          'Cualquier trabajo adicional requiere una orden de cambio por escrito aceptada por el cliente antes de ejecutarse.',
        ],
      },
      {
        title: 'Antes de cambiar los trabajos',
        body:
          'Si la vivienda necesita algo distinto del alcance acordado, explicamos el cambio, el precio y el plazo antes de continuar con trabajos con coste. Un instalador local no puede añadir trabajos de pago en el momento sin aprobación de CasaMia y del cliente.',
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
      'Qué información usa CasaMia para revisar la vivienda, preparar una propuesta, coordinar trabajos y prestar atención posterior.',
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
        title: 'Para qué la usamos',
        points: [
          'Para entender las estancias, rutinas y prioridades de seguridad que nos pides revisar.',
          'Para preparar recomendaciones, propuestas, notas de visita, planes de instalación y registros de atención posterior.',
          'Para contactarte sobre reservas, informes, presupuestos, pagos, cambios, reclamaciones o seguimiento de seguridad.',
        ],
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
      'Cómo usa CasaMia el almacenamiento esencial del sitio y cómo controlas las cookies opcionales, como analítica o marketing.',
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
          'Si se activan cookies analíticas o publicitarias, el banner y el centro de preferencias deben permitir aceptar, rechazar o cambiar esas opciones de forma clara.',
      },
    ],
  },
  'withdrawal-cancellation': {
    title: 'Desistimiento y cancelación',
    intro:
      'Cuándo puedes cancelar, cómo desistir y qué puede ocurrir si pides a CasaMia empezar durante el plazo de desistimiento.',
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
        body: `Usa el formulario público en /withdrawal-form, escribe a ${casamiaCompanyConfig.customerServiceEmail}, o envía una carta a ${casamiaCompanyConfig.registeredAddress}. Guarda una copia de lo enviado y la fecha de envío.`,
      },
    ],
  },
  'guarantees-aftercare': {
    title: 'Garantías y servicio posventa',
    intro:
      'Qué hacer si algo no parece correcto después de la instalación y cómo CasaMia gestiona incidencias de producto, instalación y mano de obra.',
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
          ...(casamiaCompanyConfig.workmanshipGuaranteePeriod
            ? [`Periodo adicional de garantía de mano de obra: ${casamiaCompanyConfig.workmanshipGuaranteePeriod}.`]
            : ['Cualquier garantía comercial adicional de mano de obra se indicará en la propuesta del cliente.']),
        ],
      },
      {
        title: 'Defectos peligrosos',
        body:
          'Si una instalación parece suelta, inestable, eléctricamente insegura o peligrosa de cualquier otro modo, deja de usarla y contacta con CasaMia inmediatamente. Si hay peligro inmediato, llama al 112.',
      },
    ],
  },
  'complaints-contact': {
    title: 'Reclamaciones y contacto',
    intro:
      'Cómo contactar con CasaMia por una incidencia de servicio, preocupación de seguridad, reclamación o pregunta de atención posterior.',
    sections: [
      {
        title: 'Atención al cliente',
        points: [
          ...(casamiaCompanyConfig.customerServicePhone ? [`Teléfono: ${casamiaCompanyConfig.customerServicePhone}`] : []),
          `Email: ${casamiaCompanyConfig.customerServiceEmail}`,
          ...(casamiaCompanyConfig.customerServiceHours ? [`Horario: ${casamiaCompanyConfig.customerServiceHours}`] : []),
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
        title: 'Qué ocurre después',
        body:
          'CasaMia revisa la incidencia, comprueba si hay una preocupación de seguridad inmediata y confirma el siguiente paso práctico. Puede ser una respuesta de soporte, revisión documental, revisión de fotos, seguimiento con proveedor o inspección cuando haga falta.',
      },
      {
        title: 'Escalada de seguridad',
        body:
          'Si una instalación parece suelta, inestable, eléctricamente insegura o peligrosa de cualquier otro modo, deja de usarla y contacta con CasaMia inmediatamente. En caso de emergencia, llama al 112.',
      },
      {
        title: 'Resolución de disputas',
        body: casamiaCompanyConfig.adrEntityOrStatus
          ? `Estado de resolución alternativa de conflictos: ${casamiaCompanyConfig.adrEntityOrStatus}. Los derechos administrativos y judiciales siguen disponibles.`
          : 'Puedes utilizar los canales de reclamación y resolución de conflictos de consumo disponibles conforme a la legislación española. Los derechos administrativos y judiciales siguen disponibles.',
      },
    ],
  },
  'accessibility-statement': {
    title: 'Declaración de accesibilidad',
    intro:
      'CasaMia está pensada para personas que pueden necesitar textos más claros, reserva asistida, navegación con teclado o una forma más cómoda de completar una revisión de seguridad en casa.',
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

export function getLocalizedLegalDocument(
  documentId: LegalDocumentId,
  language: string,
  commercialSettings?: CommercialSettings,
): LegalDocument | undefined {
  const document = legalDocuments[documentId]

  if (!document) return undefined

  if (!language.toLowerCase().startsWith('es')) {
    return applyCommercialCopy(document, commercialSettings)
  }

  return applyCommercialCopy({
    ...document,
    ...legalDocumentsEs[documentId],
  }, commercialSettings)
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
