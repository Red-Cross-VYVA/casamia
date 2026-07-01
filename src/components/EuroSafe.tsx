import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function EuroSafe() {
  const { t } = useTranslation()

  return (
    <section className="eurosafe-section border-t border-border bg-white py-12">
      <div className="site-shell flex flex-col items-center justify-center gap-5 text-center md:flex-row">
        <span className="text-sm font-extrabold uppercase text-text-muted">
          {t('eurosafe.prefix')}
        </span>
        <span className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-light-blue px-5 font-display text-xl font-black text-navy">
          <ShieldCheck size={22} aria-hidden="true" />
          {t('eurosafe.logo')}
        </span>
        <p className="max-w-xl text-text-mid">{t('eurosafe.desc')}</p>
      </div>
    </section>
  )
}
