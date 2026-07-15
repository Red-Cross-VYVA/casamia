import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

type PlansProps = {
  standalone?: boolean
}

const coreFeatures = [
  'Professional home safety assessment',
  'Digital safety report and Home Safety Score',
  'Essential room-by-room adaptations where required',
  'Optional smart, health and family add-ons after the report',
]

export function Plans({ standalone = false }: PlansProps) {
  return (
    <section className={`plans-section section-pad bg-white ${standalone ? 'pt-12' : ''}`} id="plans">
      <div className="site-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-title">
            One plan, <span className="italic-accent">personalised to the home.</span>
          </h2>
          <p className="mt-4 text-xl text-text-mid">
            Start with the CasaMia Home Safety Plan. After the assessment, choose only the add-ons that make sense.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <article className="plan-card plan-card-highlight rounded-lg bg-navy p-8 text-white shadow-soft">
            <span className="mb-5 inline-flex w-fit rounded-full bg-green px-4 py-2 text-sm font-extrabold text-white">
              Core plan
            </span>

            <p className="text-sm font-extrabold uppercase text-white/70">CasaMia Home Safety Plan</p>
            <p className="mt-3 font-display text-5xl font-black leading-none">Simple first</p>
            <p className="mt-4 text-white/80">
              Assessment, safety report, essential improvements, fixed quotation and coordinated installation.
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
              <Link className="btn btn-green" to="/plans">
                See Home Safety Plan
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/services">
                View Add-ons
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
