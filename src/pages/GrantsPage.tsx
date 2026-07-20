import { AlertTriangle, Check, ExternalLink, FileText, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import {
  getPublishedGrantProgrammes,
  isGrantProgrammeExpired,
  type GrantProgramme,
} from '../constants/grantProgrammes'

const grantsCopy = {
  en: {
    seoTitle: 'Grants and financial assistance for home adaptations',
    seoDescription:
      'Understand possible public grant support for home safety and accessibility works, including eligibility, documents, timing and CasaMia support.',
    heroEyebrow: 'Public funding guidance',
    heroTitle: 'Grants and financial assistance',
    heroBody:
      'Public grants may be available for certain accessibility improvements, home adaptations or energy-related works. Availability, eligibility, funding levels and deadlines depend on the relevant public programme and the customer’s individual circumstances. CasaMia does not award grants and cannot guarantee that an application will be approved.',
    heroPrimary: 'Check possible assistance',
    heroSecondary: 'Explore available programmes',
    importantTitle: 'Important before relying on a grant',
    importantBody: [
      'Applying for a grant is separate from purchasing CasaMia’s services. A grant enquiry does not create an installation contract, reserve public funds or guarantee eligibility.',
      'Your CasaMia contract price is not conditional on receiving a grant unless your Project Order expressly states otherwise. You remain responsible for the agreed payments even if a grant application is delayed, reduced or rejected.',
    ],
    priceTitle: 'How prices should be read',
    priceRows: [
      ['Contract price', 'Shown separately, including VAT.'],
      ['Payment schedule', 'Confirmed in your Project Order.'],
      ['Possible grant', 'Indicative only until the authority approves it.'],
      ['Customer finance', 'You may need to fund works before reimbursement.'],
    ],
    roleEyebrow: 'CasaMia’s role',
    roleTitle: 'Guidance, not public approval.',
    roleBody:
      'CasaMia can help identify programmes that may be relevant to your project. Any initial eligibility assessment is indicative only. The responsible public authority makes the final decision.',
    roleListTitle: 'Grant-support services',
    roleItems: [
      'General information about possible public assistance routes.',
      'Initial eligibility screening based on information provided by the customer.',
      'Help preparing a document checklist for a specific programme.',
      'Application-preparation support where the programme and customer circumstances are suitable.',
      'Submission as an authorised representative only with a separate written mandate.',
      'Referral to an independent adviser or gestor where specialist advice is needed.',
    ],
    feeTitle: 'Grant-support fees',
    feeRows: [
      ['General information', 'Free.'],
      ['Initial eligibility screening', 'Free unless a Project Order or grant-support agreement says otherwise.'],
      ['Application-support fee', 'Must be disclosed separately, including VAT and whether payable if the grant is rejected.'],
      ['Independent adviser or gestor', 'Any referral fee or commercial relationship must be disclosed before referral.'],
    ],
    beforeApprovalTitle: 'If work starts before approval',
    beforeApprovalBody:
      'If a customer chooses to proceed with a CasaMia project before a grant decision, the checkout or Project Order must show a specific acknowledgement only when relevant:',
    beforeApprovalQuote:
      'I understand that my grant application has not yet been approved and that I remain responsible for the CasaMia contract price and payment schedule.',
    beforeApprovalFooter:
      'That acknowledgement must be recorded with its wording, version, locale and timestamp. It is separate from general terms acceptance.',
    programmesEyebrow: 'Verified programme cards',
    programmesTitle: 'Available programme information',
    programmesBody:
      'Last verified dates and official sources are required before a programme appears here. Always check the official programme page before making a financial decision.',
    emptyTitle: 'No grant programme is currently published by CasaMia.',
    emptyBody:
      'CasaMia will only list a programme after its official source, status, dates, eligibility rules, translation approval and review date have been checked. Use the grant check for an initial readiness review, then confirm details against the public authority source.',
    emptyCta: 'Request an initial eligibility review',
    documentsTitle: 'Documents often requested',
    documentItems: [
      'Identity documentation.',
      'Proof of residence.',
      'Ownership or tenancy documentation.',
      'Property-community approval where required.',
      'Income information where the programme requests it.',
      'Disability or dependency documentation where relevant.',
      'Project quotation.',
      'Invoices and payment evidence.',
      'Technical reports.',
      'Bank-account certificate.',
    ],
    privacyTitle: 'Privacy and sensitive documents',
    privacyBody: [
      'Grant applications may involve financial, disability, dependency or health-related information. CasaMia should collect those documents only through a secure process for a specific programme, not through ordinary marketing or contact forms.',
      'A separate grant-assistance privacy notice and written representative mandate are required before CasaMia submits an application or receives notifications on your behalf.',
    ],
    programmeLabels: {
      closed: 'Closed',
      authority: 'Responsible authority',
      dates: 'Opening / closing date',
      applicants: 'Eligible applicants',
      properties: 'Eligible properties',
      work: 'Eligible work',
      exclusions: 'Main exclusions',
      funding: 'Funding',
      timing: 'Payment timing',
      compatibility: 'Compatibility',
      verified: 'Last verified',
      verifiedNote: 'Always check the official programme page before making a financial decision.',
      official: 'View the official programme',
    },
  },
  es: {
    seoTitle: 'Ayudas y subvenciones para adaptar viviendas',
    seoDescription:
      'Entiende posibles ayudas públicas para seguridad y accesibilidad en el hogar, con elegibilidad, documentos, plazos y soporte CasaMia.',
    heroEyebrow: 'Orientación sobre ayudas públicas',
    heroTitle: 'Ayudas y asistencia financiera',
    heroBody:
      'Puede haber ayudas públicas para determinadas mejoras de accesibilidad, adaptación de vivienda o eficiencia energética. La disponibilidad, los requisitos, las cuantías y los plazos dependen del programa público aplicable y de las circunstancias de cada cliente. CasaMia no concede ayudas y no puede garantizar la aprobación de una solicitud.',
    heroPrimary: 'Comprobar posibles ayudas',
    heroSecondary: 'Ver programas disponibles',
    importantTitle: 'Importante antes de contar con una ayuda',
    importantBody: [
      'Solicitar una ayuda es independiente de contratar los servicios de CasaMia. Una consulta sobre ayudas no crea un contrato de instalación, no reserva fondos públicos y no garantiza elegibilidad.',
      'El precio del contrato con CasaMia no depende de recibir una ayuda, salvo que tu orden de proyecto lo indique expresamente. Sigues siendo responsable de los pagos acordados aunque la ayuda se retrase, se reduzca o sea rechazada.',
    ],
    priceTitle: 'Cómo leer los precios',
    priceRows: [
      ['Precio del contrato', 'Se muestra por separado, con IVA incluido.'],
      ['Calendario de pagos', 'Se confirma en tu orden de proyecto.'],
      ['Posible ayuda', 'Es orientativa hasta que la administración la apruebe.'],
      ['Financiación del cliente', 'Puede que tengas que pagar trabajos antes del reembolso.'],
    ],
    roleEyebrow: 'Papel de CasaMia',
    roleTitle: 'Orientación, no aprobación pública.',
    roleBody:
      'CasaMia puede ayudarte a identificar programas que podrían encajar con tu proyecto. Cualquier revisión inicial de elegibilidad es orientativa. La decisión final corresponde a la administración responsable.',
    roleListTitle: 'Servicios de apoyo para ayudas',
    roleItems: [
      'Información general sobre posibles vías de ayuda pública.',
      'Revisión inicial de elegibilidad según la información facilitada por el cliente.',
      'Ayuda para preparar una lista de documentos para un programa concreto.',
      'Apoyo en la preparación de solicitudes cuando el programa y el caso lo permiten.',
      'Presentación como representante autorizado solo con mandato escrito separado.',
      'Derivación a un asesor independiente o gestor cuando haga falta apoyo especializado.',
    ],
    feeTitle: 'Costes del apoyo para ayudas',
    feeRows: [
      ['Información general', 'Gratuita.'],
      ['Revisión inicial de elegibilidad', 'Gratuita salvo que una orden de proyecto o acuerdo de apoyo indique lo contrario.'],
      ['Apoyo en la solicitud', 'Debe comunicarse por separado, con IVA y aclarando si se paga aunque la ayuda sea rechazada.'],
      ['Asesor independiente o gestor', 'Cualquier comisión o relación comercial debe comunicarse antes de la derivación.'],
    ],
    beforeApprovalTitle: 'Si los trabajos empiezan antes de la aprobación',
    beforeApprovalBody:
      'Si un cliente decide seguir adelante con un proyecto CasaMia antes de recibir la decisión sobre la ayuda, el checkout o la orden de proyecto debe mostrar una aceptación específica solo cuando corresponda:',
    beforeApprovalQuote:
      'Entiendo que mi solicitud de ayuda aún no ha sido aprobada y que sigo siendo responsable del precio del contrato CasaMia y del calendario de pagos.',
    beforeApprovalFooter:
      'Esa aceptación debe guardarse con su texto, versión, idioma y hora. Es independiente de la aceptación general de condiciones.',
    programmesEyebrow: 'Programas verificados',
    programmesTitle: 'Información de programas disponibles',
    programmesBody:
      'Antes de publicar un programa aquí se requieren fechas de verificación y fuentes oficiales. Comprueba siempre la página oficial antes de tomar una decisión financiera.',
    emptyTitle: 'CasaMia no tiene ningún programa de ayudas publicado ahora mismo.',
    emptyBody:
      'CasaMia solo mostrará un programa después de revisar su fuente oficial, estado, fechas, requisitos, traducción y próxima fecha de revisión. Usa la comprobación de ayudas para una revisión inicial y confirma después los detalles con la administración pública.',
    emptyCta: 'Solicitar revisión inicial',
    documentsTitle: 'Documentos que suelen solicitarse',
    documentItems: [
      'Documento de identidad.',
      'Prueba de residencia.',
      'Documentación de propiedad o alquiler.',
      'Aprobación de la comunidad cuando corresponda.',
      'Información de ingresos si el programa la solicita.',
      'Documentación de discapacidad o dependencia cuando sea relevante.',
      'Presupuesto del proyecto.',
      'Facturas y justificantes de pago.',
      'Informes técnicos.',
      'Certificado de cuenta bancaria.',
    ],
    privacyTitle: 'Privacidad y documentos sensibles',
    privacyBody: [
      'Las solicitudes de ayuda pueden incluir información financiera, discapacidad, dependencia o datos de salud. CasaMia solo debe recoger esos documentos mediante un proceso seguro para un programa concreto, no a través de formularios generales de marketing o contacto.',
      'Antes de que CasaMia presente una solicitud o reciba notificaciones en tu nombre se requiere un aviso de privacidad específico para ayudas y un mandato de representación por escrito.',
    ],
    programmeLabels: {
      closed: 'Cerrado',
      authority: 'Administración responsable',
      dates: 'Fecha de apertura / cierre',
      applicants: 'Solicitantes elegibles',
      properties: 'Viviendas elegibles',
      work: 'Trabajos elegibles',
      exclusions: 'Exclusiones principales',
      funding: 'Financiación',
      timing: 'Momento del pago',
      compatibility: 'Compatibilidad',
      verified: 'Última verificación',
      verifiedNote: 'Comprueba siempre la página oficial antes de tomar una decisión financiera.',
      official: 'Ver programa oficial',
    },
  },
} as const

export function GrantsPage() {
  const { i18n } = useTranslation()
  const language = i18n.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  const copy = grantsCopy[language]
  const programmes = getPublishedGrantProgrammes(language)

  return (
    <>
      <SEO title={copy.seoTitle} description={copy.seoDescription} path="/grants" />
      <section className="grants-legal-hero">
        <div className="site-shell">
          <p className="eyebrow">{copy.heroEyebrow}</p>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
          <div className="grants-hero-actions">
            <Link className="btn btn-green" to="/grant-check">
              {copy.heroPrimary}
            </Link>
            <a className="btn btn-white" href="#programmes">
              {copy.heroSecondary}
            </a>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell grants-disclaimer-grid">
          <article className="grants-notice-card">
            <AlertTriangle size={26} aria-hidden="true" />
            <div>
              <h2>{copy.importantTitle}</h2>
              {copy.importantBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
          <article className="grants-price-card">
            <h2>{copy.priceTitle}</h2>
            <dl>
              {copy.priceRows.map(([term, definition]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{definition}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </section>

      <section className="section-pad bg-light-blue">
        <div className="site-shell grants-role-grid">
          <div>
            <p className="eyebrow">{copy.roleEyebrow}</p>
            <h2 className="display-title">{copy.roleTitle}</h2>
            <p>{copy.roleBody}</p>
          </div>
          <GrantList title={copy.roleListTitle} items={copy.roleItems} icon="shield" />
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell grants-disclaimer-grid">
          <article className="grants-price-card">
            <h2>{copy.feeTitle}</h2>
            <dl>
              {copy.feeRows.map(([term, definition]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{definition}</dd>
                </div>
              ))}
            </dl>
          </article>
          <article className="grants-notice-card">
            <AlertTriangle size={26} aria-hidden="true" />
            <div>
              <h2>{copy.beforeApprovalTitle}</h2>
              <p>{copy.beforeApprovalBody}</p>
              <blockquote>{copy.beforeApprovalQuote}</blockquote>
              <p>{copy.beforeApprovalFooter}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section-pad bg-white" id="programmes">
        <div className="site-shell">
          <div className="grants-section-heading">
            <p className="eyebrow">{copy.programmesEyebrow}</p>
            <h2 className="display-title">{copy.programmesTitle}</h2>
            <p>{copy.programmesBody}</p>
          </div>
          {programmes.length > 0 ? (
            <div className="grant-programme-grid">
              {programmes.map((programme) => (
                <GrantProgrammeCard key={programme.id} programme={programme} labels={copy.programmeLabels} />
              ))}
            </div>
          ) : (
            <article className="grant-empty-state">
              <FileText size={34} aria-hidden="true" />
              <h3>{copy.emptyTitle}</h3>
              <p>{copy.emptyBody}</p>
              <Link className="btn btn-navy" to="/grant-check">
                {copy.emptyCta}
              </Link>
            </article>
          )}
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell grid gap-8 lg:grid-cols-2">
          <GrantList title={copy.documentsTitle} items={copy.documentItems} />
          <article className="soft-card">
            <h2 className="font-display text-3xl font-bold text-text-dark">{copy.privacyTitle}</h2>
            {copy.privacyBody.map((paragraph) => (
              <p className="mt-4 text-text-mid" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </article>
        </div>
      </section>
    </>
  )
}

function GrantList({ icon, title, items }: { icon?: 'shield'; title: string; items: readonly string[] }) {
  const Icon = icon === 'shield' ? ShieldCheck : Check

  return (
    <article className="soft-card">
      <h2 className="font-display text-3xl font-bold text-text-dark">{title}</h2>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li className="flex gap-3 text-text-mid" key={item}>
            <Icon className="mt-1 shrink-0 text-green" size={18} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function GrantProgrammeCard({
  programme,
  labels,
}: {
  programme: GrantProgramme
  labels: Record<keyof (typeof grantsCopy.en)['programmeLabels'], string>
}) {
  const expired = isGrantProgrammeExpired(programme)

  return (
    <article className={`grant-programme-card ${expired ? 'is-expired' : ''}`}>
      <div className="grant-programme-card-top">
        <span>{expired ? labels.closed : programme.status}</span>
        <strong>{programme.territory}</strong>
      </div>
      <h3>{programme.officialName}</h3>
      <p>{programme.casamiaCommentary}</p>
      <dl>
        <div>
          <dt>{labels.authority}</dt>
          <dd>{programme.authority}</dd>
        </div>
        <div>
          <dt>{labels.dates}</dt>
          <dd>
            {programme.openingDate} / {programme.closingDate}
          </dd>
        </div>
        <div>
          <dt>{labels.applicants}</dt>
          <dd>{programme.eligibleApplicants}</dd>
        </div>
        <div>
          <dt>{labels.properties}</dt>
          <dd>{programme.eligibleProperties}</dd>
        </div>
        <div>
          <dt>{labels.work}</dt>
          <dd>{programme.eligibleWork}</dd>
        </div>
        <div>
          <dt>{labels.exclusions}</dt>
          <dd>{programme.exclusions}</dd>
        </div>
        <div>
          <dt>{labels.funding}</dt>
          <dd>{programme.maximumAmountOrPercentage}</dd>
        </div>
        <div>
          <dt>{labels.timing}</dt>
          <dd>{programme.applicationPaymentTiming}</dd>
        </div>
        <div>
          <dt>{labels.compatibility}</dt>
          <dd>{programme.compatibility}</dd>
        </div>
      </dl>
      <p className="grant-verified-note">
        {labels.verified}: {programme.lastVerifiedDate}. {labels.verifiedNote}
      </p>
      <a href={programme.officialSource} target="_blank" rel="noreferrer">
        {labels.official}
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    </article>
  )
}
