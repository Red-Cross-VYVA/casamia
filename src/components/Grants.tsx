import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type GrantStat = {
  value: string
  label: string
  sub: string
}

export function Grants() {
  const { t } = useTranslation()
  const stats = t('grants.stats', { returnObjects: true }) as GrantStat[]

  return (
    <section className="grants-section section-pad bg-navy text-white" id="grants">
      <div className="grants-grid site-shell items-center gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold">
            <span className="dot" aria-hidden="true" />
            {t('grants.badge')}
          </p>
          <h2 className="mt-6 font-display text-5xl font-bold leading-tight md:text-6xl">
            {t('grants.title')}
          </h2>
          <p className="mt-4 font-display text-3xl font-bold italic leading-tight text-green">
            {t('grants.sub')}
          </p>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/80">
            {t('grants.body')}
          </p>
          <Link className="btn btn-green mt-8" to="/grant-check">
            {t('grants.cta')}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
          <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-white/65">
            {t('grants.disclaimer')}
          </p>
        </div>

        <div className="space-y-4">
          {stats.map((stat) => (
            <article className="grant-stat-card rounded-lg bg-navy-dark p-6" key={stat.value}>
              <p className="font-display text-4xl font-black text-green">{stat.value}</p>
              <p className="mt-2 text-xl font-bold">{stat.label}</p>
              <p className="mt-1 text-white/75">{stat.sub}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
