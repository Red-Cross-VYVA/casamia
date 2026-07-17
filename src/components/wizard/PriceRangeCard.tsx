import { Database, Info } from 'lucide-react'

import type { WizardCopy } from '../../config/wizardCopy'
import type { WizardPriceRange } from '../../types/wizard'

export function PriceRangeCard({
  copy,
  language,
  range,
}: {
  copy: WizardCopy
  language: string
  range: WizardPriceRange
}) {
  const isSpanish = language.toLowerCase().startsWith('es')
  const serviceCount = range.serviceIds?.length ?? 0
  const areaCount = range.areaCount ?? 0
  const basis = isSpanish
    ? `${serviceCount} ${serviceCount === 1 ? 'opción inicial' : 'opciones iniciales'} · ${areaCount} ${areaCount === 1 ? 'zona' : 'zonas'}${range.vatIncluded ? ' · IVA incluido' : ''}`
    : `${serviceCount} starter ${serviceCount === 1 ? 'option' : 'options'} · ${areaCount} ${areaCount === 1 ? 'area' : 'areas'}${range.vatIncluded ? ' · VAT included' : ''}`

  return (
    <section className="safety-wizard-price-card" aria-label={copy.result.estimated}>
      <div className="safety-wizard-price-card-heading">
        <span aria-hidden="true"><Database size={18} /></span>
        <p>{copy.result.estimated}</p>
      </div>
      <strong>{range.label}</strong>
      {serviceCount || areaCount ? <small>{basis}</small> : null}
      {range.recurringMonthlyMinimum ? (
        <small>
          {isSpanish ? 'Soporte opcional desde' : 'Optional support from'}{' '}
          {new Intl.NumberFormat(isSpanish ? 'es-ES' : 'en-IE', {
            currency: 'EUR',
            maximumFractionDigits: 0,
            style: 'currency',
          }).format(range.recurringMonthlyMinimum)}
          {isSpanish ? '/mes' : '/month'}
        </small>
      ) : null}
      {range.requiresQuote ? (
        <small>{isSpanish ? 'Algunas adaptaciones requieren presupuesto a medida.' : 'Some adaptations require a tailored quote.'}</small>
      ) : null}
      <p><Info size={17} aria-hidden="true" /> {copy.result.priceDisclaimer}</p>
      {range.source === 'service-catalogue' ? (
        <div className="safety-wizard-price-source">
          <span aria-hidden="true" />
          {isSpanish ? 'Precios actualizados desde el catálogo de servicios CasaMia.' : 'Prices updated from the CasaMia service catalogue.'}
        </div>
      ) : null}
    </section>
  )
}
