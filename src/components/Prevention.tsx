import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type StatCard = {
  value: string
  label: string
}

export function Prevention() {
  const { t } = useTranslation()
  const stats = t('prevention.stats', { returnObjects: true }) as StatCard[]

  return (
    <section className="prevention-section section-pad bg-light-blue" id="how-it-works">
      <div className="prevention-grid site-shell items-center gap-16">
        <div className="prevention-lede">
          <span className="eyebrow">{t('prevention.badge')}</span>
          <p className="mt-8 font-display text-7xl font-black leading-none text-navy md:text-8xl">
            {t('prevention.stat')}
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-text-dark md:text-5xl">
            {t('prevention.sub')}
          </h2>
        </div>
        <div>
          <p className="max-w-2xl text-xl leading-relaxed text-text-mid">
            {t('prevention.body')}
          </p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {stats.map((stat) => (
              <article className="prevention-stat-card soft-card" key={stat.value}>
                <p className="font-display text-4xl font-black text-navy">{stat.value}</p>
                <p className="mt-3 whitespace-pre-line text-base font-semibold leading-snug text-text-mid">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>
          <div className="prevention-source-note">
            <p>
              <strong>{t('prevention.sourceLabel')}</strong>{' '}
              <a href="https://www.who.int/news-room/fact-sheets/detail/falls" target="_blank" rel="noreferrer">
                WHO
              </a>
              ,{' '}
              <a href="https://www.cdc.gov/falls/about/index.html" target="_blank" rel="noreferrer">
                CDC
              </a>
              ,{' '}
              <a href="https://www.ine.es/dyngs/Prensa/en/PROP20242074.htm" target="_blank" rel="noreferrer">
                INE
              </a>
              ,{' '}
              <a href="https://sede.comunidad.madrid/node/288645" target="_blank" rel="noreferrer">
                Comunidad de Madrid
              </a>
              .
            </p>
            <Link to="/blog/fall-prevention-home-checklist-spain">
              {t('prevention.deepDive')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
