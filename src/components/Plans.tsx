import { ArrowRight, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type PlansProps = {
  standalone?: boolean
}

const coreFeatures = [
  'Guided room-by-room safety review',
  'Recommended improvements matched to the resident',
  'Clear estimate before work is confirmed',
  'Managed installation, setup and handover where needed',
]

export function Plans({ standalone = false }: PlansProps) {
  const { t } = useTranslation()

  return (
    <section className={`plans-section section-pad bg-white ${standalone ? 'pt-12' : ''}`} id="plans">
      <div className="site-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-title">
            Build a safer home, <span className="italic-accent">one useful improvement at a time.</span>
          </h2>
          <p className="mt-4 text-xl text-text-mid">
            Choose the rooms that matter, answer simple questions and let CasaMia recommend the right services.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <article className="plan-card plan-card-highlight rounded-lg bg-navy p-8 text-white shadow-soft">
            <span className="mb-5 inline-flex w-fit rounded-full bg-green px-4 py-2 text-sm font-extrabold text-white">
              Your CasaMia plan
            </span>

            <p className="text-sm font-extrabold uppercase text-white/70">Recommended improvements</p>
            <p className="mt-3 font-display text-5xl font-black leading-none">Clear first</p>
            <p className="mt-4 text-white/80">
              A practical route from home risks to selected services, estimate, quote and coordinated installation.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {coreFeatures.map((feature) => (
                <li className="flex gap-3" key={feature}>
                  <Check className="mt-1 shrink-0 text-green" size={18} aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn btn-green" to="/home-safety-wizard">
                {t('wizard.cta')}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-green" to="/configure">
                Build My Safer Home
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/services">
                View Services
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
