import { casamiaCompanyConfig, legalVersionConfig } from '../config/company.ts'

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

const customerServicePointsEn = [
  ...(casamiaCompanyConfig.customerServicePhone ? [`Telephone: ${casamiaCompanyConfig.customerServicePhone}`] : []),
  `Email: ${casamiaCompanyConfig.customerServiceEmail}`,
  `Hours: ${casamiaCompanyConfig.customerServiceHours}`,
  `Postal complaints address: ${casamiaCompanyConfig.complaintsAddress}`,
]

const customerServicePointsEs = [
  ...(casamiaCompanyConfig.customerServicePhone ? [`Teléfono: ${casamiaCompanyConfig.customerServicePhone}`] : []),
  `Email: ${casamiaCompanyConfig.customerServiceEmail}`,
  `Horario: ${casamiaCompanyConfig.customerServiceHours}`,
  `Dirección postal para reclamaciones: ${casamiaCompanyConfig.complaintsAddress}`,
]

export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  'legal-notice': {
    id: 'legal-notice',
    intro:
      'This notice identifies the operator of the CasaMia website and the company responsible for the service.',
    reviewStatus: 'approved',
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
        title: 'Customer contact',
        body:
          `For customer service, aftercare, withdrawal requests or complaints, contact ${casamiaCompanyConfig.customerServiceEmail}. Postal notices may be sent to the registered address above.`,
      },
    ],
  },
  'general-customer-terms': {
    id: 'general-customer-terms',
    intro:
      'These terms explain how CasaMia proposals, package orders, installation coordination, payments, cancellations, guarantees and aftercare work for customers in Spain.',
    reviewStatus: 'approved',
    title: 'General Customer Terms',
    sections: [
      {
        title: 'Who you contract with',
        points: [
          `The service is operated by ${casamiaCompanyConfig.legalName}, trading as ${casamiaCompanyConfig.commercialName}, with NIF ${casamiaCompanyConfig.nif}.`,
          `The registered address is ${casamiaCompanyConfig.registeredAddress}.`,
          `Customer service contact: ${casamiaCompanyConfig.customerServiceEmail}.`,
        ],
      },
      {
        title: 'What CasaMia provides',
        points: [
          'CasaMia helps families choose practical home-safety packages for bathrooms, bedrooms, kitchens, living rooms, entrances and connected support.',
          'CasaMia selects suitable products, coordinates professional installation or setup, checks the completed work and remains available for aftercare.',
          'Where a home visit, measurement or technical check is needed, CasaMia will explain this before confirming the final scope or price.',
        ],
      },
      {
        title: 'Proposals and order confirmation',
        points: [
          'A CasaMia proposal sets out the selected room packages, quantities, included works, estimated price, VAT status, payment terms and any extras that require review.',
          'Each proposal has a reference number and validity date. Customers should quote the reference when contacting CasaMia about that proposal.',
          'Using the online Order now button or otherwise confirming the proposal means the customer asks CasaMia to proceed with scheduling, final scope confirmation and the next payment steps.',
          'No work starts until CasaMia has confirmed the order details, access arrangements and payment instructions with the customer.',
        ],
      },
      {
        title: 'Package scope',
        points: [
          'Priced room packages include the works listed in the accepted proposal and are delivered as a coordinated turnkey service.',
          'Photos, illustrations and catalogue visuals are explanatory. The exact product model, finish, fixing position and installation method may vary according to the home, stock, safety requirements and technical suitability.',
          'CasaMia may recommend an equivalent or better product where the original displayed item is unavailable or not suitable for the property.',
        ],
      },
      {
        title: 'Quote-only extras',
        points: [
          'Some specialist adaptations, connected systems or structural changes require extra information before CasaMia can quote them responsibly.',
          'Selecting a quote-only extra adds it to the proposal for CasaMia review. It does not add a price and does not block ordering the core package.',
          'CasaMia will contact the customer to understand the extra, confirm measurements, suitability and price, and will not add it without the customer approval.',
        ],
      },
      {
        title: 'Prices, VAT and payment terms',
        points: [
          'Published package prices and proposal totals include VAT unless the proposal says otherwise.',
          'The proposal shows the estimated total, estimated deposit and estimated balance for the selected priced works.',
          'The usual payment structure is 50% when confirming the order and 50% after successful installation or completion of the agreed work.',
          'The first 50% is a payment on account and is applied to the order. It is not automatically non-refundable in every circumstance.',
          'Additional work, changes or quote-only extras require customer approval before they are charged or carried out.',
        ],
      },
      {
        title: 'Scheduling, access and customer responsibilities',
        points: [
          'The customer must provide accurate contact details, installation address, relevant home information and any access limitations that may affect the visit or installation.',
          'The customer is responsible for ensuring CasaMia can safely access the property at the agreed time.',
          'Where landlord, property-owner, community-of-owners or building-management permission is needed, the customer must obtain it unless CasaMia has expressly agreed to help.',
          'The customer should tell CasaMia about hidden services, fragile surfaces, recent works, damp, electrical issues or any condition that may affect safe installation.',
        ],
      },
      {
        title: 'Local professionals and subcontractors',
        body:
          'CasaMia may appoint vetted local professionals to carry out installation or technical work. They work under CasaMia coordination for the contracted service and are not authorised to request direct payment from the customer for CasaMia works.',
      },
      {
        title: 'Successful installation',
        body:
          'Installation is considered successfully completed when the essential agreed work has been completed, the applicable functional and safety checks have been passed, the work area has been left safe and reasonably clean, the customer has received the relevant instructions, and no material defect prevents the safe intended use of the installation.',
      },
      {
        title: 'Handover and aftercare',
        points: [
          'CasaMia or its appointed professional will explain how the installed items should be used and any important care or maintenance points.',
          'If an adjustment is needed after installation, the customer should contact CasaMia with the proposal or order reference and photos where useful.',
          'If an installation appears loose, unstable, electrically unsafe or otherwise dangerous, the customer should stop using it and contact CasaMia immediately. In an emergency, call 112.',
        ],
      },
      {
        title: 'Cancellation and withdrawal',
        points: [
          'Eligible distance and off-premises contracts generally include a statutory withdrawal period. Details are set out in the Withdrawal and Cancellation Policy.',
          'If the customer asks CasaMia to start services during a withdrawal period, the customer may have to pay a proportionate amount for validly requested work already performed.',
          'Custom-made, personalised, urgent or already-performed services may be treated differently where consumer law permits.',
        ],
      },
      {
        title: 'Guarantees and statutory rights',
        points: [
          'The customer keeps all mandatory statutory consumer rights.',
          'CasaMia remains the customer contact point for issues relating to the contracted package, installation coordination and aftercare.',
          'Product guarantees, installation workmanship and manufacturer warranties may have different scopes and durations, but they do not remove mandatory legal rights.',
          'Signing an installation record does not remove statutory guarantee rights or prevent the customer from reporting hidden defects.',
        ],
      },
      {
        title: 'Safety limits',
        points: [
          'CasaMia home-safety recommendations are practical housing adaptations. They are not medical diagnosis, personal care, emergency monitoring or a substitute for clinical advice.',
          'Connected alerts and sensors can support awareness, but they do not guarantee prevention of every incident.',
          'The customer should continue to follow medical, occupational-therapy or public-authority advice where applicable.',
        ],
      },
      {
        title: 'Complaints, contact and law',
        points: [
          `For help, complaints or aftercare, contact ${casamiaCompanyConfig.customerServiceEmail}.`,
          'Please include the proposal reference, customer name, installation address, description of the issue and any useful photos.',
          'These terms are governed by Spanish law, without limiting mandatory consumer protections that apply to the customer.',
        ],
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
        points: customerServicePointsEn,
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
      'Este aviso identifica al operador del sitio web CasaMia y la empresa responsable del servicio.',
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
        title: 'Contacto con clientes',
        body:
          `Para atención al cliente, soporte posterior, desistimiento o reclamaciones, contacta con ${casamiaCompanyConfig.customerServiceEmail}. Las comunicaciones postales pueden enviarse al domicilio social indicado arriba.`,
      },
    ],
  },
  'general-customer-terms': {
    title: 'Condiciones generales para clientes',
    intro:
      'Estas condiciones explican cómo funcionan las propuestas, pedidos de paquetes, coordinación de instalación, pagos, cancelaciones, garantías y soporte posterior de CasaMia para clientes en España.',
    sections: [
      {
        title: 'Con quién contratas',
        points: [
          `El servicio lo presta ${casamiaCompanyConfig.legalName}, que opera comercialmente como ${casamiaCompanyConfig.commercialName}, con NIF ${casamiaCompanyConfig.nif}.`,
          `El domicilio social es ${casamiaCompanyConfig.registeredAddress}.`,
          `Contacto de atención al cliente: ${casamiaCompanyConfig.customerServiceEmail}.`,
        ],
      },
      {
        title: 'Qué ofrece CasaMia',
        points: [
          'CasaMia ayuda a las familias a elegir paquetes prácticos de seguridad para baño, dormitorio, cocina, salón, entrada y apoyo conectado.',
          'CasaMia selecciona productos adecuados, coordina la instalación o configuración profesional, comprueba el trabajo realizado y queda disponible para soporte posterior.',
          'Cuando sea necesaria una visita, medición o comprobación técnica, CasaMia lo explicará antes de confirmar el alcance o precio final.',
        ],
      },
      {
        title: 'Propuestas y confirmación del pedido',
        points: [
          'La propuesta de CasaMia recoge los paquetes seleccionados, cantidades, trabajos incluidos, precio estimado, IVA, condiciones de pago y extras que requieren revisión.',
          'Cada propuesta tiene una referencia y una fecha de validez. Conviene indicar esa referencia al contactar con CasaMia sobre la propuesta.',
          'Usar el botón Pedir ahora o confirmar la propuesta por otro medio significa que el cliente pide a CasaMia continuar con la coordinación de fecha, alcance final y próximos pasos de pago.',
          'Ningún trabajo empieza hasta que CasaMia haya confirmado con el cliente los detalles del pedido, el acceso a la vivienda y las instrucciones de pago.',
        ],
      },
      {
        title: 'Alcance del paquete',
        points: [
          'Los paquetes con precio incluyen los trabajos indicados en la propuesta aceptada y se entregan como un servicio coordinado llave en mano.',
          'Las fotos, ilustraciones y visuales del catálogo son explicativos. El modelo exacto, acabado, posición de fijación y método de instalación pueden variar según la vivienda, disponibilidad, seguridad e idoneidad técnica.',
          'CasaMia puede recomendar un producto equivalente o superior cuando el artículo mostrado no esté disponible o no sea adecuado para la vivienda.',
        ],
      },
      {
        title: 'Extras que requieren presupuesto',
        points: [
          'Algunas adaptaciones especialistas, sistemas conectados o cambios estructurales requieren información adicional antes de que CasaMia pueda presupuestarlos correctamente.',
          'Seleccionar un extra de revisión lo añade a la propuesta para que CasaMia lo valore. No añade precio y no bloquea el pedido del paquete base.',
          'CasaMia contactará con el cliente para entender el extra, confirmar medidas, idoneidad y precio, y no lo añadirá sin aprobación del cliente.',
        ],
      },
      {
        title: 'Precios, IVA y pagos',
        points: [
          'Los precios publicados de paquetes y los totales de propuesta incluyen IVA salvo que la propuesta indique otra cosa.',
          'La propuesta muestra el total estimado, el pago inicial estimado y el saldo estimado para los trabajos con precio seleccionado.',
          'La estructura habitual es 50% al confirmar el pedido y 50% tras una instalación satisfactoria o finalización de los trabajos acordados.',
          'El primer 50% es un pago a cuenta aplicado al pedido. No es automáticamente no reembolsable en todas las circunstancias.',
          'Cualquier trabajo adicional, cambio o extra pendiente de presupuesto requiere aprobación del cliente antes de cobrarse o ejecutarse.',
        ],
      },
      {
        title: 'Fechas, acceso y responsabilidades del cliente',
        points: [
          'El cliente debe facilitar datos de contacto correctos, dirección de instalación, información relevante de la vivienda y cualquier limitación de acceso que pueda afectar a la visita o instalación.',
          'El cliente es responsable de que CasaMia pueda acceder de forma segura a la vivienda en la fecha acordada.',
          'Cuando sea necesario permiso de propietario, arrendador, comunidad de propietarios o administración del edificio, el cliente debe obtenerlo salvo que CasaMia haya aceptado expresamente ayudar.',
          'El cliente debe informar a CasaMia sobre instalaciones ocultas, superficies delicadas, obras recientes, humedades, problemas eléctricos o cualquier condición que pueda afectar a la instalación segura.',
        ],
      },
      {
        title: 'Profesionales locales y subcontratistas',
        body:
          'CasaMia puede designar profesionales locales validados para realizar trabajos de instalación o técnicos. Trabajan bajo coordinación de CasaMia para el servicio contratado y no están autorizados a solicitar pagos directos al cliente por trabajos CasaMia.',
      },
      {
        title: 'Instalación satisfactoria',
        body:
          'La instalación se considera completada satisfactoriamente cuando se han realizado los trabajos esenciales acordados, se han superado las comprobaciones funcionales y de seguridad aplicables, la zona de trabajo queda segura y razonablemente limpia, el cliente ha recibido las instrucciones pertinentes y no existe ningún defecto material que impida el uso seguro previsto.',
      },
      {
        title: 'Entrega y soporte posterior',
        points: [
          'CasaMia o el profesional designado explicará cómo usar los elementos instalados y cualquier indicación importante de cuidado o mantenimiento.',
          'Si se necesita un ajuste después de la instalación, el cliente debe contactar con CasaMia indicando la referencia de propuesta o pedido y fotos cuando sean útiles.',
          'Si una instalación parece suelta, inestable, eléctricamente insegura o peligrosa de cualquier otro modo, deja de usarla y contacta con CasaMia inmediatamente. En caso de emergencia, llama al 112.',
        ],
      },
      {
        title: 'Cancelación y desistimiento',
        points: [
          'Los contratos a distancia y fuera de establecimiento elegibles suelen incluir un plazo legal de desistimiento. Los detalles están en la política de desistimiento y cancelación.',
          'Si el cliente pide a CasaMia iniciar servicios durante un plazo de desistimiento, puede tener que pagar una cantidad proporcional por trabajos válidamente solicitados y ya realizados.',
          'Los servicios personalizados, a medida, urgentes o ya realizados pueden tener un tratamiento distinto cuando la normativa de consumo lo permita.',
        ],
      },
      {
        title: 'Garantías y derechos legales',
        points: [
          'El cliente conserva todos sus derechos obligatorios como consumidor.',
          'CasaMia sigue siendo el punto de contacto del cliente para incidencias relacionadas con el paquete contratado, la coordinación de instalación y el soporte posterior.',
          'Las garantías de producto, mano de obra de instalación y garantías de fabricante pueden tener alcances y duraciones diferentes, pero no eliminan los derechos legales obligatorios.',
          'Firmar el registro de instalación no elimina los derechos legales de garantía ni impide comunicar defectos ocultos.',
        ],
      },
      {
        title: 'Límites de seguridad',
        points: [
          'Las recomendaciones de seguridad de CasaMia son adaptaciones prácticas de vivienda. No son diagnóstico médico, cuidado personal, monitorización de emergencia ni sustituyen asesoramiento clínico.',
          'Los avisos y sensores conectados pueden ayudar a detectar situaciones, pero no garantizan la prevención de todos los incidentes.',
          'El cliente debe seguir cualquier consejo médico, de terapia ocupacional o de autoridades públicas que resulte aplicable.',
        ],
      },
      {
        title: 'Reclamaciones, contacto y ley aplicable',
        points: [
          `Para ayuda, reclamaciones o soporte posterior, contacta con ${casamiaCompanyConfig.customerServiceEmail}.`,
          'Incluye la referencia de la propuesta, nombre del cliente, dirección de instalación, descripción de la incidencia y fotos útiles si las tienes.',
          'Estas condiciones se rigen por la ley española, sin limitar las protecciones obligatorias de consumo que correspondan al cliente.',
        ],
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
        points: customerServicePointsEs,
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
