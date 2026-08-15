import { CheckCircle2, ClipboardCheck, Handshake, ShieldCheck } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { BrandLogo } from '../BrandLogo'
import {
  calculateLineTotal,
  calculateProposalTotals,
  formatCurrency,
  hiddenFeeReassurance,
  type ProposalData,
  type ProposalLineItem,
} from '../../services/proposalCalculations'

export const ProposalPreview = forwardRef<HTMLDivElement, { proposal: ProposalData }>(function ProposalPreview(
  { proposal },
  ref,
) {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.startsWith('es')
  const copy = getProposalPreviewCopy(isSpanish)
  const totals = calculateProposalTotals(proposal)
  const pricedItems = proposal.lineItems.filter((item) => !isReviewLineItem(item))
  const reviewItems = getReviewItems(proposal)
  const selectedCategories = getSelectedCategories(proposal.lineItems)

  return (
    <article className="proposal-print-surface overflow-hidden rounded-lg border border-border bg-white shadow-soft" ref={ref}>
      <div className="border-b border-border bg-gradient-to-br from-white via-white to-green/10 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <BrandLogo />
            <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-green">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-4xl font-black leading-tight text-text-dark sm:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-4 text-base font-bold leading-relaxed text-text-mid sm:text-lg">
              {copy.intro}
            </p>
          </div>
          <div className="rounded-lg bg-light-blue p-4 text-sm lg:min-w-[300px]">
            <PreviewRow label={copy.proposalId} value={proposal.id} />
            <PreviewRow label={copy.date} value={proposal.proposalDate || copy.notSet} />
            <PreviewRow label={copy.validUntil} value={proposal.validUntil || copy.notSet} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-8">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-border p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-navy">{copy.preparedFor}</h3>
            <p className="mt-2 font-display text-3xl font-bold text-text-dark">
              {proposal.customerName || copy.customerName}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-text-mid">
              {[proposal.address, proposal.area].filter(Boolean).join(', ') || copy.customerAddress}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-text-mid">
              {[proposal.phone, proposal.email].filter(Boolean).join(' | ') || copy.contactDetails}
            </p>
          </div>
          <div className="rounded-lg bg-navy p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-white/65">{copy.totalEstimate}</p>
            <p className="mt-2 font-display text-5xl font-black">{formatCurrency(totals.totalEstimate)}</p>
            <p className="mt-2 text-sm font-bold text-white/70">{copy.vatIncluded}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 text-sm">
              <div>
                <p className="font-black text-white/65">{copy.rooms}</p>
                <p className="font-black">{selectedCategories.length || proposal.plansBuilder?.selectedRoomQuantity || 0}</p>
              </div>
              <div>
                <p className="font-black text-white/65">{copy.pricedWorks}</p>
                <p className="font-black">{pricedItems.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <ValueCard
            icon={ShieldCheck}
            title={copy.turnkeyTitle}
            body={copy.turnkeyBody}
          />
          <ValueCard
            icon={ClipboardCheck}
            title={copy.handoverTitle}
            body={copy.handoverBody}
          />
          <ValueCard
            icon={Handshake}
            title={copy.aftercareTitle}
            body={copy.aftercareBody}
          />
        </section>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-navy">{copy.selectedWorks}</h3>
              <p className="mt-2 text-sm font-bold text-text-mid">{copy.selectedWorksBody}</p>
            </div>
            <span className="rounded-full bg-light-blue px-4 py-2 text-sm font-black text-navy">
              {pricedItems.length} {copy.items}
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {pricedItems.length === 0 ? (
              <div className="rounded-lg border border-border p-5 text-sm font-bold text-text-muted">
                {copy.noLineItems}
              </div>
            ) : null}
            {pricedItems.map((item) => (
              <LineItemCard key={item.id} copy={copy} item={item} />
            ))}
          </div>
        </section>

        {reviewItems.length ? (
          <section className="rounded-lg border border-amber-300 bg-amber-50 p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-amber-800">
              {copy.reviewTitle}
            </h3>
            <p className="mt-2 max-w-4xl text-sm font-bold leading-relaxed text-amber-900">
              {copy.reviewBody}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {reviewItems.map((item) => (
                <span key={item} className="rounded-full border border-amber-300 bg-white px-3 py-2 text-sm font-black text-amber-900">
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-navy">{copy.grantSupport}</h3>
            <p className="mt-3 text-sm leading-relaxed text-text-mid">
              {proposal.grantEligibilityNote || copy.defaultGrant}
            </p>
          </div>
          <div className="rounded-lg border border-border p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-navy">{copy.nextSteps}</h3>
            <ol className="mt-4 grid gap-3 text-sm font-bold text-text-mid">
              {copy.nextStepItems.map((step, index) => (
                <li className="flex gap-3" key={step}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-light-blue text-xs font-black text-navy">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-border p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-navy">{copy.paymentTerms}</h3>
            <p className="mt-3 text-sm leading-relaxed text-text-mid">{proposal.paymentTerms}</p>
            <p className="mt-3 flex gap-2 text-sm font-bold text-green">
              <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
              {isSpanish ? 'Sin costes ocultos. Ningun trabajo empieza sin aprobacion del cliente.' : hiddenFeeReassurance}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
              <Link className="text-navy underline-offset-4 hover:underline" to="/terms-and-conditions">
                {copy.terms}
              </Link>
              <Link className="text-navy underline-offset-4 hover:underline" to="/terms-and-conditions#grant-management">
                {copy.grantTerms}
              </Link>
            </div>
          </div>
          <div className="rounded-lg bg-navy p-5 text-white">
            <PreviewRow label={copy.subtotal} value={formatCurrency(totals.subtotal)} inverse />
            <PreviewRow label={copy.vat} value={copy.included} inverse />
            <PreviewRow label={copy.grantRelevant} value={formatCurrency(totals.grantEligibleAmount)} inverse />
            <PreviewRow label={copy.depositDue} value={formatCurrency(totals.depositDue)} inverse />
            <PreviewRow label={copy.balanceDue} value={formatCurrency(totals.balanceDue)} inverse />
            <div className="mt-4 border-t border-white/15 pt-4">
              <p className="text-xs font-black uppercase text-white/65">{copy.totalEstimate}</p>
              <p className="font-display text-4xl font-black">{formatCurrency(totals.totalEstimate)}</p>
              <p className="mt-1 text-xs font-bold text-white/65">{copy.vatIncluded}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-light-blue/60 p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-navy">{copy.customerSummary}</h3>
          <p className="mt-3 max-w-5xl text-base leading-relaxed text-text-mid">
            {proposal.executiveSummary || copy.defaultSummary}
          </p>
        </section>

        <section className="rounded-lg border border-border p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-navy">{copy.customerAcceptance}</h3>
          <p className="mt-3 text-sm leading-relaxed text-text-mid">{copy.acceptanceBody}</p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <PreviewRow label={copy.status} value={proposal.acceptanceStatus} />
            <PreviewRow label={copy.acceptedBy} value={proposal.acceptedBy || copy.pending} />
            <PreviewRow label={copy.acceptanceDate} value={proposal.acceptanceDate || copy.pending} />
          </div>
        </section>
      </div>
    </article>
  )
})

type PreviewCopy = ReturnType<typeof getProposalPreviewCopy>

function LineItemCard({ copy, item }: { copy: PreviewCopy; item: ProposalLineItem }) {
  const description = splitLineItemDescription(item.description)

  return (
    <article className="flex min-h-[250px] flex-col rounded-lg border border-border bg-white p-5 shadow-[0_14px_34px_rgba(15,75,112,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-blue">{item.category}</p>
          <h4 className="mt-1 text-xl font-black leading-tight text-text-dark">{item.name}</h4>
        </div>
        <span className="shrink-0 rounded-full bg-light-blue px-3 py-1 text-sm font-black text-navy">
          {item.quantity}x
        </span>
      </div>

      {description.summary ? (
        <p className="mt-4 text-sm font-bold leading-relaxed text-text-mid">{description.summary}</p>
      ) : null}

      {description.included.length ? (
        <div className="mt-4 rounded-lg bg-light-blue/50 p-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-navy">{copy.included}</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {description.included.map((includedItem) => (
              <li className="flex items-start gap-2 text-sm font-bold leading-snug text-text-dark" key={includedItem}>
                <CheckCircle2 className="mt-0.5 shrink-0 text-green" size={16} aria-hidden="true" />
                <span>{includedItem}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm font-black uppercase text-text-muted">{copy.lineTotal}</span>
        <span className="text-lg font-black text-text-dark">{formatCurrency(calculateLineTotal(item))}</span>
      </div>
    </article>
  )
}

function splitLineItemDescription(description: string) {
  const cleanDescription = description.trim()
  if (!cleanDescription) {
    return { included: [] as string[], summary: '' }
  }

  const match = cleanDescription.match(/\b(?:includes|incluye):\s*/i)
  if (!match || match.index === undefined) {
    return { included: [] as string[], summary: cleanDescription }
  }

  const summary = cleanDescription.slice(0, match.index).trim().replace(/[.,;:\s]+$/, '.')
  const includedText = cleanDescription.slice(match.index + match[0].length)
  const included = includedText
    .split(/,\s+|\s+y\s+|\s+and\s+/i)
    .map((item) => item.trim().replace(/[.;]+$/, ''))
    .filter(Boolean)

  return { included, summary }
}

function ValueCard({
  body,
  icon: Icon,
  title,
}: {
  body: string
  icon: typeof ShieldCheck
  title: string
}) {
  return (
    <article className="rounded-lg border border-border bg-white p-5">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-light-blue text-navy">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-black text-text-dark">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-relaxed text-text-mid">{body}</p>
    </article>
  )
}

function PreviewRow({
  inverse = false,
  label,
  value,
}: {
  inverse?: boolean
  label: string
  value: string
}) {
  return (
    <div className="mb-2 flex items-start justify-between gap-4 text-sm">
      <span className={`font-extrabold uppercase ${inverse ? 'text-white/65' : 'text-text-muted'}`}>
        {label}
      </span>
      <span className={`text-right font-black ${inverse ? 'text-white' : 'text-text-dark'}`}>{value}</span>
    </div>
  )
}

function getReviewItems(proposal: ProposalData) {
  const metadataItems = proposal.plansBuilder?.reviewItems ?? []
  const lineItems = proposal.lineItems
    .filter(isReviewLineItem)
    .map((item) => item.name)

  return [...new Set([...lineItems, ...metadataItems].filter(Boolean))]
}

function getSelectedCategories(items: ProposalLineItem[]) {
  return [...new Set(items.map((item) => item.category).filter(Boolean))]
}

function isReviewLineItem(item: ProposalLineItem) {
  return item.unitPrice <= 0
}

function getProposalPreviewCopy(isSpanish: boolean) {
  return isSpanish
    ? {
        acceptedBy: 'Aceptado por',
        acceptanceBody:
          'Al pedir este paquete, el cliente confirma que quiere continuar con los trabajos indicados. CasaMia coordina fecha, alcance final y proximos pasos de pago.',
        acceptanceDate: 'Fecha de aceptacion',
        aftercareBody: 'CasaMia sigue siendo tu punto de contacto para ajustes, dudas y soporte posterior.',
        aftercareTitle: 'Soporte posterior',
        balanceDue: 'Resto',
        contactDetails: 'Datos de contacto',
        customerAcceptance: 'Pedido del cliente',
        customerAddress: 'Direccion del cliente',
        customerName: 'Nombre del cliente',
        customerSummary: 'Resumen para el cliente',
        date: 'Fecha',
        defaultGrant:
          'CasaMia puede orientar sobre documentacion para ayudas cuando corresponda. La aprobacion depende siempre de la autoridad correspondiente.',
        defaultSummary:
          'Propuesta CasaMia generada a partir de los paquetes seleccionados. Los trabajos con precio incluyen productos, instalacion, entrega y soporte posterior.',
        depositDue: 'Deposito',
        eyebrow: 'Propuesta para cliente',
        grantRelevant: 'Importe potencialmente subvencionable',
        grantSupport: 'Ayudas y financiacion',
        grantTerms: 'Condiciones de ayudas',
        handoverBody: 'Probamos los elementos instalados y explicamos el uso antes de dar el trabajo por terminado.',
        handoverTitle: 'Prueba y entrega',
        included: 'Incluido',
        intro:
          'Una propuesta clara con los paquetes seleccionados, trabajos incluidos, soporte CasaMia, condiciones y proximos pasos.',
        items: 'elementos',
        lineTotal: 'Importe',
        nextStepItems: [
          'Revisa los paquetes y trabajos incluidos.',
          'Pide el paquete online cuando quieras continuar.',
          'CasaMia confirma fecha, alcance final y proximos pasos de pago.',
        ],
        nextSteps: 'Proximos pasos',
        noLineItems: 'Todavia no hay elementos en esta propuesta.',
        notSet: 'Pendiente',
        paymentTerms: 'Condiciones de pago',
        pending: 'Pendiente',
        preparedFor: 'Preparado para',
        pricedWorks: 'Trabajos',
        proposalId: 'ID de propuesta',
        reviewBody:
          'Estos extras permanecen con la propuesta. CasaMia contactara contigo para pedir la informacion necesaria, confirmar medidas, idoneidad y precio, y no los anadira sin tu aprobacion.',
        reviewTitle: 'Extras que requieren informacion antes de presupuesto',
        rooms: 'Estancias',
        selectedWorks: 'Trabajos incluidos',
        selectedWorksBody: 'Cada partida con precio forma parte de un paquete llave en mano coordinado por CasaMia.',
        status: 'Estado',
        subtotal: 'Subtotal',
        terms: 'Terminos y condiciones',
        title: 'Propuesta de seguridad del hogar',
        totalEstimate: 'Total estimado',
        turnkeyBody: 'CasaMia selecciona productos adecuados y coordina instalacion profesional para reducir gestiones.',
        turnkeyTitle: 'Servicio llave en mano',
        validUntil: 'Valida hasta',
        vat: 'IVA',
        vatIncluded: 'IVA incluido',
      }
    : {
        acceptedBy: 'Accepted by',
        acceptanceBody:
          'By ordering this package, the customer confirms they want to continue with the listed works. CasaMia coordinates scheduling, final scope and next payment steps.',
        acceptanceDate: 'Acceptance date',
        aftercareBody: 'CasaMia remains your contact for adjustments, questions and aftercare support.',
        aftercareTitle: 'Aftercare support',
        balanceDue: 'Balance due',
        contactDetails: 'Contact details',
        customerAcceptance: 'Customer order',
        customerAddress: 'Customer address',
        customerName: 'Customer name',
        customerSummary: 'Customer summary',
        date: 'Date',
        defaultGrant:
          'CasaMia can guide grant documentation where relevant. Approval always depends on the responsible authority.',
        defaultSummary:
          'CasaMia proposal generated from the selected packages. Priced works include products, installation, handover and aftercare.',
        depositDue: 'Deposit due',
        eyebrow: 'Customer proposal',
        grantRelevant: 'Potentially grant-relevant amount',
        grantSupport: 'Grant and funding support',
        grantTerms: 'Grant terms',
        handoverBody: 'We test installed items and explain use before the work is considered complete.',
        handoverTitle: 'Testing and handover',
        included: 'Included',
        intro:
          'A clear proposal with selected packages, included works, CasaMia support, payment terms and next steps.',
        items: 'items',
        lineTotal: 'Amount',
        nextStepItems: [
          'Review the selected packages and included works.',
          'Order the package online when you are ready to proceed.',
          'CasaMia confirms scheduling, final scope and next payment steps.',
        ],
        nextSteps: 'Next steps',
        noLineItems: 'No proposal items have been added yet.',
        notSet: 'Not set',
        paymentTerms: 'Payment terms',
        pending: 'Pending',
        preparedFor: 'Prepared for',
        pricedWorks: 'Priced works',
        proposalId: 'Proposal ID',
        reviewBody:
          'These extras stay with the proposal. CasaMia will contact you to collect the information needed, confirm measurements, suitability and price, and will not add them without your approval.',
        reviewTitle: 'Extras needing information before quote',
        rooms: 'Rooms',
        selectedWorks: 'Included works',
        selectedWorksBody: 'Every priced item is part of a turnkey package coordinated by CasaMia.',
        status: 'Status',
        subtotal: 'Subtotal',
        terms: 'Terms & Conditions',
        title: 'Home Safety Proposal',
        totalEstimate: 'Total estimate',
        turnkeyBody: 'CasaMia selects suitable products and coordinates professional installation to reduce hassle.',
        turnkeyTitle: 'Turnkey service',
        validUntil: 'Valid until',
        vat: 'VAT',
        vatIncluded: 'VAT included',
      }
}
