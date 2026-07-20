import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function TermsAndConditionsPage() {
  const { t } = useTranslation()
  const services = t('pages.terms.grantManagement.services', {
    returnObjects: true,
  }) as string[]
  const important = t('pages.terms.grantManagement.important', {
    returnObjects: true,
  }) as string[]

  useEffect(() => {
    document.title = `${t('pages.terms.title')} | CasaMia`
  }, [t])

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="display-title">{t('pages.terms.title')}</h1>
          <p className="mt-5 max-w-3xl text-xl text-text-mid">{t('pages.terms.intro')}</p>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell max-w-5xl">
          <article
            className="soft-card scroll-mt-32"
            id="grant-management"
          >
            <p className="eyebrow">{t('pages.terms.grantManagement.kicker')}</p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-text-dark md:text-5xl">
              {t('pages.terms.grantManagement.title')}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-text-mid">
              {t('pages.terms.grantManagement.body')}
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-border bg-light-blue p-6">
                <h3 className="text-lg font-extrabold text-navy">
                  {t('pages.terms.grantManagement.serviceTitle')}
                </h3>
                <ul className="mt-5 space-y-3">
                  {services.map((service) => (
                    <li className="flex gap-3 text-text-mid" key={service}>
                      <CheckCircle2 className="mt-1 shrink-0 text-green" size={18} aria-hidden="true" />
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-white p-6 shadow-soft">
                <h3 className="flex items-center gap-2 text-lg font-extrabold text-navy">
                  <AlertCircle className="text-gold" size={20} aria-hidden="true" />
                  {t('pages.terms.grantManagement.importantTitle')}
                </h3>
                <ul className="mt-5 space-y-3">
                  {important.map((item) => (
                    <li className="flex gap-3 text-text-mid" key={item}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}
