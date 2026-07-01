import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type Step = {
  title: string
  desc: string
}

export function HowItWorksPage() {
  const { t } = useTranslation()
  const steps = t('pages.howItWorks.steps', { returnObjects: true }) as Step[]

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="display-title">{t('pages.howItWorks.title')}</h1>
          <p className="mt-5 max-w-3xl text-xl text-text-mid">
            {t('pages.howItWorks.intro')}
          </p>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <article className="soft-card" key={step.title}>
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-green text-xl font-black text-white">
                {index + 1}
              </span>
              <h2 className="mt-6 font-display text-3xl font-bold leading-tight text-text-dark">
                {step.title}
              </h2>
              <p className="mt-3 text-text-mid">{step.desc}</p>
            </article>
          ))}
        </div>
        <div className="site-shell mt-10">
          <Link className="btn btn-green" to="/#estimate-upload">
            {t('pages.howItWorks.cta')}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
