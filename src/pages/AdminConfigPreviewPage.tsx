import { Link } from 'react-router-dom'

import { conditionalRules, editablePricingNotice } from '../config/casamiaPackages'
import { formatConfiguratorCurrency } from '../services/configuratorPricing'
import { getConfiguredPricing, usePackageConfig } from '../services/packageConfig'

export function AdminConfigPreviewPage() {
  const packageConfig = usePackageConfig()
  const pricing = getConfiguredPricing()

  return (
    <section className="bg-light-blue pt-28">
      <div className="site-shell py-14 md:py-20">
        <span className="eyebrow">
          <span className="dot" aria-hidden="true" />
          Admin preview
        </span>
        <h1 className="display-title mt-5">Package configuration and pricing rules</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-mid">
          This preview mirrors the managed package content used by the configurator.
        </p>
        <Link className="btn btn-navy mt-5 w-fit" to="/internal/package-config">
          Edit package cards
        </Link>
        <p className="mt-5 rounded-lg border border-border bg-white p-5 text-base font-bold text-text-mid">
          {editablePricingNotice}
        </p>

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            {packageConfig.packages.map((item) => (
              <article className="rounded-lg border border-border bg-white p-6 shadow-soft" key={item.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-display text-3xl font-bold leading-tight text-text-dark">{item.name}</h2>
                    <p className="mt-2 text-lg text-text-mid">{item.outcome}</p>
                  </div>
                  <span className="rounded-full bg-pale-blue px-4 py-2 text-sm font-black uppercase text-navy">
                    {formatConfiguratorCurrency(packageConfig.packagePrices[item.id])}
                  </span>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <ConfigList title="Standard" items={item.standardComponents.map((component) => component.label)} />
                  <ConfigList title="Conditional" items={item.conditionalComponents.map((component) => component.label)} />
                  <ConfigList title="Quote-only" items={item.quotationOnlyComponents.map((component) => component.label)} />
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-text-dark">Pricing rules</h2>
            <dl className="mt-5 grid gap-3 text-base">
              <Row label="VAT rate" value={`${Math.round(pricing.vatRate * 100)}%`} />
              <Row label="Visit deposit" value={formatConfiguratorCurrency(pricing.depositAmount)} />
              <Row label="Staircase module" value={formatConfiguratorCurrency(pricing.staircaseModulePrice)} />
              {Object.entries(pricing.componentPrices).map(([key, value]) => (
                <Row key={key} label={key} value={formatConfiguratorCurrency(value)} />
              ))}
              {Object.entries(pricing.recurringPrices).map(([key, value]) => (
                <Row key={key} label={`${key} monthly`} value={formatConfiguratorCurrency(value)} />
              ))}
            </dl>
            <h3 className="mt-8 font-display text-2xl font-bold text-text-dark">Conditional rules</h3>
            <ul className="mt-4 grid gap-3">
              {conditionalRules.map((rule) => (
                <li className="rounded-lg bg-pale-blue p-4 text-sm font-bold text-text-mid" key={rule.id}>
                  <strong className="block text-text-dark">{rule.id}</strong>
                  {rule.answerKey} → {Array.isArray(rule.matches) ? rule.matches.join(', ') : String(rule.matches)}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}

function ConfigList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-lg bg-pale-blue p-4">
      <h3 className="font-black uppercase text-navy">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm font-bold text-text-mid">
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>None</li>}
      </ul>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
      <dt className="font-bold text-text-mid">{label}</dt>
      <dd className="text-right font-black text-text-dark">{value}</dd>
    </div>
  )
}
