import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Grants } from '../components/Grants'

export function GrantsPage() {
  const { t } = useTranslation()
  const eligibility = t('pages.grants.eligibility', { returnObjects: true }) as string[]
  const process = t('pages.grants.process', { returnObjects: true }) as string[]

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="display-title">{t('pages.grants.title')}</h1>
          <p className="mt-5 max-w-3xl text-xl text-text-mid">{t('pages.grants.intro')}</p>
        </div>
      </section>

      <Grants />

      <section className="section-pad bg-white">
        <div className="site-shell grid gap-8 lg:grid-cols-2">
          <GrantList title={t('pages.grants.eligibilityTitle')} items={eligibility} />
          <GrantList title={t('pages.grants.processTitle')} items={process} />
        </div>
      </section>
    </>
  )
}

function GrantList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="soft-card">
      <h2 className="font-display text-3xl font-bold text-text-dark">{title}</h2>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li className="flex gap-3 text-text-mid" key={item}>
            <Check className="mt-1 shrink-0 text-green" size={18} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
