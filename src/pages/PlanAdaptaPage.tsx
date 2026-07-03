import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Home,
  ShieldCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type PlanAdaptaCard = {
  title: string
  body: string
}

type PlanAdaptaStep = {
  title: string
  body: string
}

const helpIcons = [ShieldCheck, FileText, ClipboardCheck, Home, CheckCircle2, ArrowRight]

export function PlanAdaptaPage() {
  const { t } = useTranslation()
  const helpCards = t('pages.planAdapta.help.items', { returnObjects: true }) as PlanAdaptaCard[]
  const improvements = t('pages.planAdapta.improvements.items', {
    returnObjects: true,
  }) as string[]
  const steps = t('pages.planAdapta.process.steps', { returnObjects: true }) as PlanAdaptaStep[]

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="display-title">{t('pages.planAdapta.hero.title')}</h1>
              <p className="mt-5 max-w-3xl text-xl leading-relaxed text-text-mid">
                {t('pages.planAdapta.hero.subtitle')}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link className="btn btn-green" to="/free-home-safety-assessment">
                  {t('pages.planAdapta.hero.cta')}
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
                <Link
                  className="btn border border-border bg-white text-navy hover:border-green hover:text-green"
                  to="/terms-and-conditions#grant-management"
                >
                  {t('pages.planAdapta.terms.cta')}
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white p-7 shadow-soft">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green text-white">
                <ShieldCheck size={28} aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-text-dark">
                {t('pages.planAdapta.hero.panelTitle')}
              </h2>
              <p className="mt-3 leading-relaxed text-text-mid">
                {t('pages.planAdapta.hero.panelBody')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">{t('pages.planAdapta.what.kicker')}</p>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight text-text-dark md:text-5xl">
              {t('pages.planAdapta.what.title')}
            </h2>
          </div>
          <p className="text-xl leading-relaxed text-text-mid">{t('pages.planAdapta.what.body')}</p>
        </div>
      </section>

      <section className="section-pad bg-light-blue">
        <div className="site-shell">
          <div className="max-w-3xl">
            <p className="eyebrow">{t('pages.planAdapta.help.kicker')}</p>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight text-text-dark md:text-5xl">
              {t('pages.planAdapta.help.title')}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {helpCards.map((card, index) => {
              const Icon = helpIcons[index] ?? CheckCircle2

              return (
                <article className="soft-card" key={card.title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-white">
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold text-navy">{card.title}</h3>
                  <p className="mt-3 leading-relaxed text-text-mid">{card.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="site-shell">
          <div className="rounded-lg border border-gold/40 bg-gold/10 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row">
              <AlertCircle className="shrink-0 text-gold" size={28} aria-hidden="true" />
              <div>
                <h2 className="text-xl font-extrabold text-navy">
                  {t('pages.planAdapta.disclaimer.title')}
                </h2>
                <p className="mt-2 leading-relaxed text-text-mid">
                  {t('pages.planAdapta.disclaimer.body')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell">
          <div className="max-w-3xl">
            <p className="eyebrow">{t('pages.planAdapta.improvements.kicker')}</p>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight text-text-dark md:text-5xl">
              {t('pages.planAdapta.improvements.title')}
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {improvements.map((item) => (
              <div
                className="flex items-start gap-3 rounded-lg border border-border bg-light-blue p-5 text-text-mid"
                key={item}
              >
                <CheckCircle2 className="mt-0.5 shrink-0 text-green" size={20} aria-hidden="true" />
                <span className="font-bold text-navy">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-navy text-white">
        <div className="site-shell">
          <div className="max-w-3xl">
            <p className="eyebrow border-white/20 bg-white/10 text-white">
              {t('pages.planAdapta.process.kicker')}
            </p>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
              {t('pages.planAdapta.process.title')}
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-5">
            {steps.map((step, index) => (
              <article
                className="rounded-lg border border-white/15 bg-white/10 p-5"
                key={step.title}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green text-lg font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell">
          <div className="rounded-lg border border-border bg-light-blue p-8 shadow-soft md:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-display text-4xl font-bold leading-tight text-text-dark">
                  {t('pages.planAdapta.terms.title')}
                </h2>
                <p className="mt-3 max-w-3xl text-lg leading-relaxed text-text-mid">
                  {t('pages.planAdapta.terms.body')}
                </p>
              </div>
              <Link className="btn btn-navy" to="/terms-and-conditions#grant-management">
                {t('pages.planAdapta.terms.cta')}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
